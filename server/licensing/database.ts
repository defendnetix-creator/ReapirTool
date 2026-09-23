import {
  CustomerRecord,
  SubscriptionRecord,
  LicenseRecord,
  DeviceRecord,
  LicenseValidationLog,
  SubscriptionTier,
  LicenseStatus
} from './types.js';
import { SUBSCRIPTION_PLANS } from './plans.js';
import { hashLicenseKey, maskLicenseKey, generateAksgLicenseKey } from './crypto.js';

class LicenseDatabase {
  private customers: Map<string, CustomerRecord> = new Map();
  private subscriptions: Map<string, SubscriptionRecord> = new Map();
  private licenses: Map<string, LicenseRecord> = new Map(); // key = licenseId
  private licenseKeyHashMap: Map<string, string> = new Map(); // key = licenseKeyHash -> licenseId
  private devices: Map<string, DeviceRecord> = new Map(); // key = deviceId
  private validationLogs: LicenseValidationLog[] = [];

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // 1. Seed Customer: Standard Pro User
    const c1: CustomerRecord = {
      customerId: 'cust_0192a83f',
      email: 'john.miller@quantumreach.com',
      displayName: 'John Miller',
      organization: 'Quantum Reach Labs',
      status: 'ACTIVE',
      createdAt: new Date(Date.now() - 180 * 86400000).toISOString()
    };
    this.customers.set(c1.customerId, c1);

    // Subscription for John Miller: Professional Plan (Active, expires in 280 days)
    const sub1: SubscriptionRecord = {
      subscriptionId: 'sub_pro_9941',
      customerId: c1.customerId,
      planId: 'professional',
      status: 'ACTIVE',
      startDate: new Date(Date.now() - 85 * 86400000).toISOString(),
      expiryDate: new Date(Date.now() + 280 * 86400000).toISOString(),
      autoRenew: true,
      renewalStatus: 'PENDING',
      createdAt: new Date(Date.now() - 85 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.subscriptions.set(sub1.subscriptionId, sub1);

    // License key: AKSG-PRO-7K2D-93MX-8QPL (with legacy ASHT-PRO-7K2D-93MX-8QPL alias)
    const rawKey1 = 'AKSG-PRO-7K2D-93MX-8QPL';
    const legacyKey1 = 'ASHT-PRO-7K2D-93MX-8QPL';
    const hash1 = hashLicenseKey(rawKey1);
    const legacyHash1 = hashLicenseKey(legacyKey1);
    const lic1: LicenseRecord = {
      licenseId: 'lic_pro_8820',
      subscriptionId: sub1.subscriptionId,
      licenseKeyHash: hash1,
      licenseKeyPrefix: maskLicenseKey(rawKey1),
      status: 'ACTIVE',
      activationLimit: 2,
      createdAt: sub1.startDate,
      notes: 'Primary Pro License'
    };
    this.licenses.set(lic1.licenseId, lic1);
    this.licenseKeyHashMap.set(hash1, lic1.licenseId);
    this.licenseKeyHashMap.set(legacyHash1, lic1.licenseId);

    // Existing active device 1 for lic1
    const dev1: DeviceRecord = {
      deviceId: 'dev_w11_pc_771',
      licenseId: lic1.licenseId,
      deviceFingerprint: 'sha256_fp_win11_desktop_99182a',
      deviceName: 'DESKTOP-PRO-WK01',
      osVersion: 'Windows 11 Pro 23H2 (22631.3296)',
      appVersion: '8.0.0-rc.1',
      activatedAt: new Date(Date.now() - 40 * 86400000).toISOString(),
      lastSeenAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      status: 'ACTIVE',
      ipAddress: '192.168.1.145'
    };
    this.devices.set(dev1.deviceId, dev1);

    // 2. Seed Customer 2: Technician User
    const c2: CustomerRecord = {
      customerId: 'cust_0284b11e',
      email: 'alex.chen@cyberfix-msp.net',
      displayName: 'Alex Chen',
      organization: 'CyberFix MSP Solutions',
      status: 'ACTIVE',
      createdAt: new Date(Date.now() - 220 * 86400000).toISOString()
    };
    this.customers.set(c2.customerId, c2);

    const sub2: SubscriptionRecord = {
      subscriptionId: 'sub_tech_5510',
      customerId: c2.customerId,
      planId: 'technician',
      status: 'ACTIVE',
      startDate: new Date(Date.now() - 100 * 86400000).toISOString(),
      expiryDate: new Date(Date.now() + 265 * 86400000).toISOString(),
      autoRenew: true,
      renewalStatus: 'PENDING',
      createdAt: new Date(Date.now() - 100 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.subscriptions.set(sub2.subscriptionId, sub2);

    const rawKey2 = 'AKSG-TECH-9938-1120-4491';
    const legacyKey2 = 'ASHT-TECH-9938-1120-4491';
    const hash2 = hashLicenseKey(rawKey2);
    const legacyHash2 = hashLicenseKey(legacyKey2);
    const lic2: LicenseRecord = {
      licenseId: 'lic_tech_7741',
      subscriptionId: sub2.subscriptionId,
      licenseKeyHash: hash2,
      licenseKeyPrefix: maskLicenseKey(rawKey2),
      status: 'ACTIVE',
      activationLimit: 5,
      createdAt: sub2.startDate,
      notes: 'Technician 5-seat bundle'
    };
    this.licenses.set(lic2.licenseId, lic2);
    this.licenseKeyHashMap.set(hash2, lic2.licenseId);
    this.licenseKeyHashMap.set(legacyHash2, lic2.licenseId);

    // 3. Seed Customer 3: Personal User
    const c3: CustomerRecord = {
      customerId: 'cust_0377c99a',
      email: 'sarah.connor@personal.me',
      displayName: 'Sarah Connor',
      status: 'ACTIVE',
      createdAt: new Date(Date.now() - 60 * 86400000).toISOString()
    };
    this.customers.set(c3.customerId, c3);

    const sub3: SubscriptionRecord = {
      subscriptionId: 'sub_pers_1120',
      customerId: c3.customerId,
      planId: 'personal',
      status: 'ACTIVE',
      startDate: new Date(Date.now() - 30 * 86400000).toISOString(),
      expiryDate: new Date(Date.now() + 335 * 86400000).toISOString(),
      autoRenew: false,
      renewalStatus: 'PENDING',
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.subscriptions.set(sub3.subscriptionId, sub3);

    const rawKey3 = 'AKSG-PERS-8921-4820-1928';
    const legacyKey3 = 'ASHT-PERS-8921-4820-1928';
    const hash3 = hashLicenseKey(rawKey3);
    const legacyHash3 = hashLicenseKey(legacyKey3);
    const lic3: LicenseRecord = {
      licenseId: 'lic_pers_3310',
      subscriptionId: sub3.subscriptionId,
      licenseKeyHash: hash3,
      licenseKeyPrefix: maskLicenseKey(rawKey3),
      status: 'ACTIVE',
      activationLimit: 1,
      createdAt: sub3.startDate,
      notes: 'Personal License'
    };
    this.licenses.set(lic3.licenseId, lic3);
    this.licenseKeyHashMap.set(hash3, lic3.licenseId);
    this.licenseKeyHashMap.set(legacyHash3, lic3.licenseId);

    // 4. Seed Customer 4: Business Fleet
    const c4: CustomerRecord = {
      customerId: 'cust_0499d22f',
      email: 'it-admin@nexus-logistics.corp',
      displayName: 'Nexus IT Administration',
      organization: 'Nexus Logistics Global',
      status: 'ACTIVE',
      createdAt: new Date(Date.now() - 90 * 86400000).toISOString()
    };
    this.customers.set(c4.customerId, c4);

    const sub4: SubscriptionRecord = {
      subscriptionId: 'sub_biz_7720',
      customerId: c4.customerId,
      planId: 'business',
      status: 'ACTIVE',
      startDate: new Date(Date.now() - 45 * 86400000).toISOString(),
      expiryDate: new Date(Date.now() + 320 * 86400000).toISOString(),
      autoRenew: true,
      renewalStatus: 'PENDING',
      createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.subscriptions.set(sub4.subscriptionId, sub4);

    const rawKey4 = 'AKSG-BIZ-5501-8832-7714';
    const legacyKey4 = 'ASHT-BIZ-5501-8832-7714';
    const hash4 = hashLicenseKey(rawKey4);
    const legacyHash4 = hashLicenseKey(legacyKey4);
    const lic4: LicenseRecord = {
      licenseId: 'lic_biz_9920',
      subscriptionId: sub4.subscriptionId,
      licenseKeyHash: hash4,
      licenseKeyPrefix: maskLicenseKey(rawKey4),
      status: 'ACTIVE',
      activationLimit: 25,
      createdAt: sub4.startDate,
      notes: 'Corporate Fleet License'
    };
    this.licenses.set(lic4.licenseId, lic4);
    this.licenseKeyHashMap.set(hash4, lic4.licenseId);
    this.licenseKeyHashMap.set(legacyHash4, lic4.licenseId);

    // 5. Seed Expired Test Key (Expired 10 days ago)
    const rawKeyExp = 'AKSG-EXP-9999-0000-1111';
    const legacyKeyExp = 'ASHT-EXP-9999-0000-1111';
    const hashExp = hashLicenseKey(rawKeyExp);
    const legacyHashExp = hashLicenseKey(legacyKeyExp);
    const subExp: SubscriptionRecord = {
      subscriptionId: 'sub_exp_0001',
      customerId: c1.customerId,
      planId: 'professional',
      status: 'EXPIRED',
      startDate: new Date(Date.now() - 375 * 86400000).toISOString(),
      expiryDate: new Date(Date.now() - 10 * 86400000).toISOString(),
      autoRenew: false,
      renewalStatus: 'FAILED',
      createdAt: new Date(Date.now() - 375 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.subscriptions.set(subExp.subscriptionId, subExp);

    const licExp: LicenseRecord = {
      licenseId: 'lic_exp_9999',
      subscriptionId: subExp.subscriptionId,
      licenseKeyHash: hashExp,
      licenseKeyPrefix: maskLicenseKey(rawKeyExp),
      status: 'ACTIVE',
      activationLimit: 2,
      createdAt: subExp.startDate,
      notes: 'Expired Test Subscription'
    };
    this.licenses.set(licExp.licenseId, licExp);
    this.licenseKeyHashMap.set(hashExp, licExp.licenseId);
    this.licenseKeyHashMap.set(legacyHashExp, licExp.licenseId);

    // 6. Seed Revoked Test Key
    const rawKeyRev = 'AKSG-REV-4444-5555-6666';
    const legacyKeyRev = 'ASHT-REV-4444-5555-6666';
    const hashRev = hashLicenseKey(rawKeyRev);
    const legacyHashRev = hashLicenseKey(legacyKeyRev);
    const subRev: SubscriptionRecord = {
      subscriptionId: 'sub_rev_0002',
      customerId: c1.customerId,
      planId: 'professional',
      status: 'SUSPENDED',
      startDate: new Date(Date.now() - 60 * 86400000).toISOString(),
      expiryDate: new Date(Date.now() + 305 * 86400000).toISOString(),
      autoRenew: false,
      renewalStatus: 'NONE',
      createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.subscriptions.set(subRev.subscriptionId, subRev);

    const licRev: LicenseRecord = {
      licenseId: 'lic_rev_4444',
      subscriptionId: subRev.subscriptionId,
      licenseKeyHash: hashRev,
      licenseKeyPrefix: maskLicenseKey(rawKeyRev),
      status: 'REVOKED',
      activationLimit: 2,
      createdAt: subRev.startDate,
      revokedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      notes: 'Revoked test license (chargeback)'
    };
    this.licenses.set(licRev.licenseId, licRev);
    this.licenseKeyHashMap.set(hashRev, licRev.licenseId);
    this.licenseKeyHashMap.set(legacyHashRev, licRev.licenseId);
  }

  // --- Lookup methods ---

  public findLicenseByKey(licenseKey: string): {
    license: LicenseRecord;
    subscription: SubscriptionRecord;
    customer: CustomerRecord;
  } | null {
    const hash = hashLicenseKey(licenseKey);
    const licenseId = this.licenseKeyHashMap.get(hash);
    if (!licenseId) return null;

    const license = this.licenses.get(licenseId);
    if (!license) return null;

    const subscription = this.subscriptions.get(license.subscriptionId);
    if (!subscription) return null;

    const customer = this.customers.get(subscription.customerId);
    if (!customer) return null;

    return { license, subscription, customer };
  }

  public getLicenseById(licenseId: string): {
    license: LicenseRecord;
    subscription: SubscriptionRecord;
    customer: CustomerRecord;
  } | null {
    const license = this.licenses.get(licenseId);
    if (!license) return null;

    const subscription = this.subscriptions.get(license.subscriptionId);
    if (!subscription) return null;

    const customer = this.customers.get(subscription.customerId);
    if (!customer) return null;

    return { license, subscription, customer };
  }

  public findLicenseBySubscriptionId(subscriptionId: string): LicenseRecord | null {
    for (const license of this.licenses.values()) {
      if (license.subscriptionId === subscriptionId) {
        return license;
      }
    }
    return null;
  }

  public getActiveDevicesForLicense(licenseId: string): DeviceRecord[] {
    return Array.from(this.devices.values()).filter(
      (d) => d.licenseId === licenseId && d.status === 'ACTIVE'
    );
  }

  public findDeviceByFingerprint(licenseId: string, fingerprint: string): DeviceRecord | null {
    return (
      Array.from(this.devices.values()).find(
        (d) => d.licenseId === licenseId && d.deviceFingerprint === fingerprint
      ) || null
    );
  }

  public registerOrUpdateDevice(params: {
    licenseId: string;
    deviceFingerprint: string;
    deviceName: string;
    osVersion: string;
    appVersion: string;
    ipAddress?: string;
  }): DeviceRecord {
    let device = this.findDeviceByFingerprint(params.licenseId, params.deviceFingerprint);

    if (device) {
      device.deviceName = params.deviceName || device.deviceName;
      device.osVersion = params.osVersion || device.osVersion;
      device.appVersion = params.appVersion || device.appVersion;
      device.lastSeenAt = new Date().toISOString();
      device.status = 'ACTIVE';
      if (params.ipAddress) device.ipAddress = params.ipAddress;
    } else {
      device = {
        deviceId: `dev_${Math.random().toString(36).substring(2, 11)}_${Date.now().toString(36)}`,
        licenseId: params.licenseId,
        deviceFingerprint: params.deviceFingerprint,
        deviceName: params.deviceName || 'Windows PC Workstation',
        osVersion: params.osVersion || 'Windows 11',
        appVersion: params.appVersion || '8.0.0-phase5',
        activatedAt: new Date().toISOString(),
        lastSeenAt: new Date().toISOString(),
        status: 'ACTIVE',
        ipAddress: params.ipAddress
      };
      this.devices.set(device.deviceId, device);
    }

    return device;
  }

  public deactivateDevice(licenseId: string, deviceId: string): boolean {
    const device = this.devices.get(deviceId);
    if (device && device.licenseId === licenseId) {
      device.status = 'DEACTIVATED';
      device.lastSeenAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  public logValidation(log: Omit<LicenseValidationLog, 'validationId'>) {
    this.validationLogs.push({
      validationId: `val_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      ...log
    });
    if (this.validationLogs.length > 500) {
      this.validationLogs.shift();
    }
  }

  public computeLicenseStatus(
    subscription: SubscriptionRecord,
    license: LicenseRecord
  ): LicenseStatus {
    if (license.status === 'REVOKED') return 'REVOKED';
    if (license.status === 'SUSPENDED' || subscription.status === 'SUSPENDED') return 'SUSPENDED';

    const now = Date.now();
    const expiry = new Date(subscription.expiryDate).getTime();

    if (now > expiry || subscription.status === 'EXPIRED') {
      return 'EXPIRED';
    }

    const daysRemaining = (expiry - now) / 86400000;
    if (daysRemaining <= 30) {
      return 'EXPIRING_SOON';
    }

    return 'ACTIVE';
  }

  public findCustomerById(customerId: string): CustomerRecord | null {
    return this.customers.get(customerId) || null;
  }

  public findCustomerByEmail(email: string): CustomerRecord | null {
    const normalized = email.trim().toLowerCase();
    for (const customer of this.customers.values()) {
      if (customer.email.toLowerCase() === normalized) {
        return customer;
      }
    }
    return null;
  }

  public createCustomer(params: {
    email: string;
    displayName?: string;
    organization?: string;
  }): CustomerRecord {
    const existing = this.findCustomerByEmail(params.email);
    if (existing) {
      if (params.displayName) existing.displayName = params.displayName;
      if (params.organization) existing.organization = params.organization;
      return existing;
    }

    const customer: CustomerRecord = {
      customerId: `cust_${Math.random().toString(36).substring(2, 10)}`,
      email: params.email.trim().toLowerCase(),
      displayName: params.displayName || params.email.split('@')[0],
      organization: params.organization,
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };
    this.customers.set(customer.customerId, customer);
    return customer;
  }

  public findSubscriptionById(subscriptionId: string): SubscriptionRecord | null {
    return this.subscriptions.get(subscriptionId) || null;
  }

  public findSubscriptionsByCustomerId(customerId: string): SubscriptionRecord[] {
    return Array.from(this.subscriptions.values()).filter(
      (s) => s.customerId === customerId
    );
  }

  public createSubscription(params: {
    customerId: string;
    planId: SubscriptionTier;
    durationDays?: number;
  }): SubscriptionRecord {
    const duration = params.durationDays ?? 365;
    const now = new Date();
    const expiry = new Date(now.getTime() + duration * 86400000);

    const subscription: SubscriptionRecord = {
      subscriptionId: `sub_${params.planId.substring(0, 4)}_${Math.random().toString(36).substring(2, 8)}`,
      customerId: params.customerId,
      planId: params.planId,
      status: 'ACTIVE',
      startDate: now.toISOString(),
      expiryDate: expiry.toISOString(),
      autoRenew: true,
      renewalStatus: 'NONE',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };
    this.subscriptions.set(subscription.subscriptionId, subscription);
    return subscription;
  }

  public createLicense(params: {
    subscriptionId: string;
    planId: SubscriptionTier;
    customKey?: string;
    notes?: string;
  }): { license: LicenseRecord; rawKey: string } {
    const planConfig = SUBSCRIPTION_PLANS[params.planId] || SUBSCRIPTION_PLANS.professional;
    const rawKey = params.customKey || generateAksgLicenseKey(params.planId);
    const hash = hashLicenseKey(rawKey);

    const license: LicenseRecord = {
      licenseId: `lic_${params.planId.substring(0, 4)}_${Math.random().toString(36).substring(2, 8)}`,
      subscriptionId: params.subscriptionId,
      licenseKeyHash: hash,
      licenseKeyPrefix: maskLicenseKey(rawKey),
      status: 'ACTIVE',
      activationLimit: planConfig.maxDevices,
      createdAt: new Date().toISOString(),
      notes: params.notes || `Issued via Razorpay Payment Fulfillment`
    };

    this.licenses.set(license.licenseId, license);
    this.licenseKeyHashMap.set(hash, license.licenseId);

    return { license, rawKey };
  }

  public renewSubscriptionBySubscriptionId(
    subscriptionId: string,
    extensionDays = 365
  ): SubscriptionRecord | null {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) return null;

    const currentExpiry = new Date(subscription.expiryDate).getTime();
    const baseTime = currentExpiry > Date.now() ? currentExpiry : Date.now();
    const newExpiry = new Date(baseTime + extensionDays * 86400000).toISOString();

    subscription.expiryDate = newExpiry;
    subscription.status = 'ACTIVE';
    subscription.renewalStatus = 'RENEWED';
    subscription.updatedAt = new Date().toISOString();

    return subscription;
  }

  public renewSubscription(licenseId: string, extensionDays = 365): SubscriptionRecord | null {
    const context = this.getLicenseById(licenseId);
    if (!context) return null;

    return this.renewSubscriptionBySubscriptionId(context.subscription.subscriptionId, extensionDays);
  }

  public setLicenseRevoked(licenseId: string, revoked: boolean): boolean {
    const license = this.licenses.get(licenseId);
    if (!license) return false;
    license.status = revoked ? 'REVOKED' : 'ACTIVE';
    license.revokedAt = revoked ? new Date().toISOString() : undefined;
    return true;
  }
}

export const licenseDb = new LicenseDatabase();
