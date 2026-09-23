import {
  LicenseClientState,
  LicenseStatus,
  SignedLicenseToken,
  PlanDefinition,
  DeviceRecord
} from './types.js';
import { getClientDeviceFingerprint, getClientDeviceName } from './deviceFingerprint.js';
import { performLegacyBrandMigration } from './migration.js';
import { ENV } from '../config/environment.js';
import { BRAND } from '../config/brand.js';

const STORAGE_KEYS = {
  TOKEN: 'akshigo_signed_token',
  LAST_SERVER_TIME: 'akshigo_last_server_time',
  LAST_LOCAL_TIME: 'akshigo_last_local_time',
  ACTIVE_LICENSE_ID: 'akshigo_active_lic_id',
  ACTIVE_DEVICE_ID: 'akshigo_active_dev_id'
};

class LicenseClient {
  private state: LicenseClientState = {
    isInitialized: false,
    status: 'INVALID',
    activeDevices: [],
    maxDevices: 1,
    isCurrentDeviceActivated: false
  };

  private listeners: Array<(state: LicenseClientState) => void> = [];

  public subscribe(fn: (state: LicenseClientState) => void): () => void {
    this.listeners.push(fn);
    fn(this.state);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn({ ...this.state }));
  }

  public getState(): LicenseClientState {
    return { ...this.state };
  }

  /**
   * Initializes licensing state on application boot
   */
  public async initialize(): Promise<LicenseClientState> {
    // 0. Perform one-time legacy brand migration (ASHtech -> Akshigo Tech)
    performLegacyBrandMigration();

    // 1. Clock rollback check
    if (this.detectClockRollback()) {
      this.state = {
        isInitialized: true,
        status: 'INVALID',
        errorMessage: 'System clock tampering or significant time rollback detected. Online validation required.',
        activeDevices: [],
        maxDevices: 1,
        isCurrentDeviceActivated: false
      };
      this.notify();
      return this.state;
    }

    // 2. Try loading cached token
    const cachedTokenStr = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const cachedLicenseId = localStorage.getItem(STORAGE_KEYS.ACTIVE_LICENSE_ID);
    const cachedDeviceId = localStorage.getItem(STORAGE_KEYS.ACTIVE_DEVICE_ID);

    if (cachedTokenStr && cachedLicenseId && cachedDeviceId) {
      try {
        const token: SignedLicenseToken = JSON.parse(cachedTokenStr);
        this.populateFromToken(token, cachedDeviceId);
      } catch (err) {
        console.error('Failed to parse cached license token', err);
      }
    } else {
      if (ENV.isDevelopment) {
        // Default initial pre-activation test key for instant out-of-the-box readiness in local DEV
        await this.activateWithDefaultTestKey();
        return this.state;
      } else {
        // In Production Release, initialize cleanly in unactivated state
        this.state.isInitialized = true;
        this.state.status = 'INVALID';
        this.state.isCurrentDeviceActivated = false;
        this.notify();
        return this.state;
      }
    }

    // 3. Perform asynchronous online heartbeat validation
    if (this.state.licenseId && this.state.currentDeviceId) {
      try {
        await this.validateOnline(this.state.licenseId, this.state.currentDeviceId);
      } catch (err) {
        // If offline, check if token offline grace period is still valid
        this.handleOfflineGrace();
      }
    }

    this.state.isInitialized = true;
    this.notify();
    return this.state;
  }

  private async activateWithDefaultTestKey() {
    // Default initial seed key: AKSG-PRO-7K2D-93MX-8QPL
    try {
      await this.activateLicenseKey('AKSG-PRO-7K2D-93MX-8QPL');
    } catch {
      this.state.isInitialized = true;
      this.state.status = 'INVALID';
      this.notify();
    }
  }

  /**
   * Activates a license key with the server
   */
  public async activateLicenseKey(licenseKey: string): Promise<{ success: boolean; message: string; error?: string }> {
    const deviceFingerprint = await getClientDeviceFingerprint();
    const deviceName = getClientDeviceName();
    const osVersion = 'Windows 11 Pro 23H2';
    const appVersion = BRAND.VERSION;

    try {
      const res = await fetch('/api/v1/licenses/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          licenseKey: licenseKey.trim(),
          deviceFingerprint,
          deviceName,
          osVersion,
          appVersion
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        this.state.status = data.licenseState || 'INVALID';
        this.state.errorMessage = data.message || 'Activation failed.';
        this.notify();
        return {
          success: false,
          message: data.message || 'Activation failed.',
          error: data.error
        };
      }

      if (data.token) {
        const token: SignedLicenseToken = data.token;
        localStorage.setItem(STORAGE_KEYS.TOKEN, JSON.stringify(token));
        localStorage.setItem(STORAGE_KEYS.ACTIVE_LICENSE_ID, token.payload.licenseId);
        localStorage.setItem(STORAGE_KEYS.ACTIVE_DEVICE_ID, token.payload.deviceId);
        this.updateMonotonicTime(new Date().toISOString());

        this.populateFromToken(token, token.payload.deviceId);
        await this.refreshLicenseStatus();
      }

      this.state.errorMessage = undefined;
      this.state.isInitialized = true;
      this.notify();

      return {
        success: true,
        message: data.message || 'Activation successful!'
      };
    } catch (err: any) {
      const msg = 'Unable to reach the licensing authority. Please check your network connection.';
      this.state.status = 'SERVER_UNAVAILABLE';
      this.state.errorMessage = msg;
      this.notify();
      return { success: false, message: msg, error: 'SERVER_UNREACHABLE' };
    }
  }

  /**
   * Performs an online validation heartbeat
   */
  public async validateOnline(licenseId: string, deviceId: string): Promise<boolean> {
    const deviceFingerprint = await getClientDeviceFingerprint();

    const res = await fetch('/api/v1/licenses/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        licenseId,
        deviceId,
        deviceFingerprint,
        appVersion: '8.0.0-phase5'
      })
    });

    const data = await res.json();

    if (data.serverTimestamp) {
      this.updateMonotonicTime(data.serverTimestamp);
    }

    if (res.ok && data.success && data.token) {
      const token: SignedLicenseToken = data.token;
      localStorage.setItem(STORAGE_KEYS.TOKEN, JSON.stringify(token));
      this.populateFromToken(token, deviceId);
      this.state.lastValidatedAt = new Date().toISOString();
      await this.refreshLicenseStatus();
      return true;
    } else {
      this.state.status = data.licenseState || 'EXPIRED';
      this.state.errorMessage = data.message;
      this.notify();
      return false;
    }
  }

  /**
   * Deactivates a specific device seat
   */
  public async deactivateDevice(deviceId: string): Promise<{ success: boolean; message: string }> {
    if (!this.state.licenseId) return { success: false, message: 'No active license found.' };

    try {
      const res = await fetch('/api/v1/licenses/deactivate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          licenseId: this.state.licenseId,
          deviceId
        })
      });

      const data = await res.json();
      if (data.success) {
        if (deviceId === this.state.currentDeviceId) {
          // Current device deactivated: clear local cache
          localStorage.removeItem(STORAGE_KEYS.TOKEN);
          localStorage.removeItem(STORAGE_KEYS.ACTIVE_DEVICE_ID);
          this.state.status = 'INVALID';
          this.state.isCurrentDeviceActivated = false;
          this.state.currentDeviceId = undefined;
        }
        await this.refreshLicenseStatus();
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Deactivation failed.' };
    } catch {
      return { success: false, message: 'Server communication error during deactivation.' };
    }
  }

  /**
   * Refreshes complete status and device list from server
   */
  public async refreshLicenseStatus(): Promise<void> {
    if (!this.state.licenseId) return;

    try {
      const res = await fetch(
        `/api/v1/licenses/status?licenseId=${encodeURIComponent(this.state.licenseId)}&deviceId=${encodeURIComponent(
          this.state.currentDeviceId || ''
        )}`
      );
      if (!res.ok) return;

      const data = await res.json();
      if (data.success) {
        this.state.plan = data.plan;
        this.state.status = data.licenseState;
        this.state.maskedKey = data.licenseKeyPrefix;
        this.state.customerName = data.customer.name;
        this.state.customerEmail = data.customer.email;
        this.state.organization = data.customer.organization;
        this.state.expiryDate = data.subscription.expiryDate;
        this.state.daysRemaining = data.subscription.daysRemaining;
        this.state.activeDevices = data.devices || [];
        this.state.maxDevices = data.maxDevices || 1;
        this.state.isCurrentDeviceActivated = data.devices.some(
          (d: DeviceRecord) => d.deviceId === this.state.currentDeviceId
        );
        this.notify();
      }
    } catch (err) {
      console.warn('Could not refresh full license status from server (offline mode).');
    }
  }

  /**
   * Simulation / Dev testing: Simulates renewing the subscription (+365 days)
   */
  public async simulateRenewal(extensionDays = 365): Promise<boolean> {
    if (!this.state.licenseId) return false;
    try {
      const res = await fetch('/api/v1/licenses/renew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseId: this.state.licenseId, extensionDays })
      });
      if (res.ok) {
        if (this.state.currentDeviceId) {
          await this.validateOnline(this.state.licenseId, this.state.currentDeviceId);
        }
        await this.refreshLicenseStatus();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Simulation / Dev testing: Simulates revoking the subscription
   */
  public async simulateRevocation(revoked = true): Promise<boolean> {
    if (!this.state.licenseId) return false;
    try {
      const res = await fetch('/api/v1/licenses/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseId: this.state.licenseId, revoked })
      });
      if (res.ok) {
        if (this.state.currentDeviceId) {
          await this.validateOnline(this.state.licenseId, this.state.currentDeviceId);
        }
        await this.refreshLicenseStatus();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  private populateFromToken(token: SignedLicenseToken, currentDeviceId?: string) {
    const payload = token.payload;
    const now = Date.now();
    const expiry = new Date(payload.expiresAt).getTime();
    const daysRemaining = Math.max(0, Math.ceil((expiry - now) / 86400000));

    let status: LicenseStatus = 'ACTIVE';
    if (now > expiry) {
      status = 'EXPIRED';
    } else if (daysRemaining <= 30) {
      status = 'EXPIRING_SOON';
    }

    this.state = {
      ...this.state,
      licenseId: payload.licenseId,
      status,
      token,
      customerName: payload.customerName,
      customerEmail: payload.customerEmail,
      expiryDate: payload.expiresAt,
      daysRemaining,
      maxDevices: payload.maxDevices,
      currentDeviceId: currentDeviceId || payload.deviceId,
      isCurrentDeviceActivated: true
    };
  }

  private handleOfflineGrace() {
    if (!this.state.token) {
      this.state.status = 'SERVER_UNAVAILABLE';
      return;
    }

    const graceUntil = new Date(this.state.token.payload.offlineGraceUntil).getTime();
    const now = Date.now();
    const graceRemainingDays = Math.max(0, (graceUntil - now) / 86400000);

    if (now > graceUntil) {
      this.state.status = 'EXPIRED';
      this.state.errorMessage = 'Offline grace period has expired. Please connect to the internet to verify your license.';
    } else {
      this.state.status = 'OFFLINE_GRACE';
      this.state.offlineGraceRemainingDays = Math.ceil(graceRemainingDays);
    }
  }

  private detectClockRollback(): boolean {
    try {
      const lastServerTimeStr = localStorage.getItem(STORAGE_KEYS.LAST_SERVER_TIME);
      const lastLocalTimeStr = localStorage.getItem(STORAGE_KEYS.LAST_LOCAL_TIME);
      const now = Date.now();

      if (lastServerTimeStr) {
        const lastServer = new Date(lastServerTimeStr).getTime();
        // Allow up to 1 hour backward drift
        if (now < lastServer - 3600000) {
          return true;
        }
      }

      if (lastLocalTimeStr) {
        const lastLocal = parseInt(lastLocalTimeStr, 10);
        if (now < lastLocal - 3600000) {
          return true;
        }
      }

      localStorage.setItem(STORAGE_KEYS.LAST_LOCAL_TIME, now.toString());
      return false;
    } catch {
      return false;
    }
  }

  private updateMonotonicTime(serverTimestampIso: string) {
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_SERVER_TIME, serverTimestampIso);
      localStorage.setItem(STORAGE_KEYS.LAST_LOCAL_TIME, Date.now().toString());
    } catch {}
  }
}

export const licenseClient = new LicenseClient();
