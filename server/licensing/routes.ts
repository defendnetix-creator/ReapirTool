import { Router, Request, Response } from 'express';
import { licenseDb } from './database.js';
import { SUBSCRIPTION_PLANS } from './plans.js';
import { signLicensePayload, getAuthorityPublicKeyPem } from './crypto.js';
import {
  ActivationRequest,
  ActivationResponse,
  ValidationRequest,
  ValidationResponse,
  DeactivationRequest,
  DeactivationResponse,
  LicenseStatusResponse,
  SignedLicenseTokenPayload
} from './types.js';

export const licensingRouter = Router();

// In-memory rate limiting map: ip -> { count, resetTime }
const rateLimitMap: Map<string, { count: number; resetTime: number }> = new Map();

function checkRateLimit(req: Request, res: Response, maxRequests = 60, windowMs = 60000): boolean {
  const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) {
    res.status(429).json({
      success: false,
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many license requests. Please wait a minute and try again.'
    });
    return false;
  }

  entry.count++;
  return true;
}

/**
 * GET /api/v1/licenses/plans
 * Returns catalog of data-driven plans
 */
licensingRouter.get('/plans', (req: Request, res: Response) => {
  res.json({
    success: true,
    plans: Object.values(SUBSCRIPTION_PLANS)
  });
});

/**
 * GET /api/v1/licenses/public-key
 * Returns RSA public verification key in PEM format
 */
licensingRouter.get('/public-key', (req: Request, res: Response) => {
  const pem = getAuthorityPublicKeyPem();
  res.json({
    success: true,
    algorithm: 'RSA-SHA256',
    publicKeyPem: pem
  });
});

/**
 * POST /api/v1/licenses/activate
 * Registers a new device against a license key and issues a signed offline-capable token
 */
licensingRouter.post('/activate', (req: Request, res: Response) => {
  if (!checkRateLimit(req, res, 20)) return;

  const { licenseKey, deviceFingerprint, deviceName, osVersion, appVersion }: ActivationRequest = req.body || {};

  if (!licenseKey || !deviceFingerprint) {
    return res.status(400).json({
      success: false,
      licenseState: 'INVALID',
      message: 'License key and device fingerprint are required.',
      error: 'MISSING_PARAMETERS'
    });
  }

  const lookup = licenseDb.findLicenseByKey(licenseKey);
  if (!lookup) {
    licenseDb.logValidation({
      licenseId: 'unknown',
      deviceId: 'unknown',
      validationTime: new Date().toISOString(),
      result: 'INVALID_KEY',
      appVersion: appVersion || 'unknown',
      ipAddress: req.ip || '127.0.0.1'
    });

    return res.status(404).json({
      success: false,
      licenseState: 'INVALID',
      message: 'The provided license key was not found or is invalid.',
      error: 'LICENSE_NOT_FOUND'
    });
  }

  const { license, subscription, customer } = lookup;
  const plan = SUBSCRIPTION_PLANS[subscription.planId];
  const licenseState = licenseDb.computeLicenseStatus(subscription, license);

  if (licenseState === 'REVOKED') {
    licenseDb.logValidation({
      licenseId: license.licenseId,
      deviceId: 'unknown',
      validationTime: new Date().toISOString(),
      result: 'REVOKED',
      appVersion: appVersion || 'unknown',
      ipAddress: req.ip || '127.0.0.1'
    });

    return res.status(403).json({
      success: false,
      licenseState: 'REVOKED',
      message: 'This license has been revoked. Please contact support.',
      error: 'LICENSE_REVOKED'
    });
  }

  if (licenseState === 'EXPIRED') {
    return res.status(403).json({
      success: false,
      licenseState: 'EXPIRED',
      message: `Your subscription to ${plan.displayName} expired on ${new Date(subscription.expiryDate).toLocaleDateString()}. Please renew to activate.`,
      error: 'SUBSCRIPTION_EXPIRED'
    });
  }

  if (licenseState === 'SUSPENDED') {
    return res.status(403).json({
      success: false,
      licenseState: 'SUSPENDED',
      message: 'This subscription is currently suspended. Please check your billing account.',
      error: 'SUBSCRIPTION_SUSPENDED'
    });
  }

  // Check active device count
  const activeDevices = licenseDb.getActiveDevicesForLicense(license.licenseId);
  const existingDevice = licenseDb.findDeviceByFingerprint(license.licenseId, deviceFingerprint);

  if (!existingDevice && activeDevices.length >= license.activationLimit) {
    licenseDb.logValidation({
      licenseId: license.licenseId,
      deviceId: 'unknown',
      validationTime: new Date().toISOString(),
      result: 'DEVICE_LIMIT',
      appVersion: appVersion || 'unknown',
      ipAddress: req.ip || '127.0.0.1'
    });

    return res.status(409).json({
      success: false,
      licenseState: 'DEVICE_LIMIT_REACHED',
      activeDevices: activeDevices.length,
      maxDevices: license.activationLimit,
      message: `Activation limit reached (${activeDevices.length}/${license.activationLimit} active devices). Please deactivate a registered workstation in the subscription portal or upgrade your plan.`,
      error: 'DEVICE_LIMIT_EXCEEDED'
    });
  }

  // Register / update device
  const device = licenseDb.registerOrUpdateDevice({
    licenseId: license.licenseId,
    deviceFingerprint,
    deviceName,
    osVersion,
    appVersion,
    ipAddress: req.ip
  });

  // Calculate offline grace expiration
  const graceDays = plan.offlineGracePeriodDays || 7;
  const graceUntil = new Date(Date.now() + graceDays * 86400000).toISOString();

  // Create signed token payload
  const tokenPayload: SignedLicenseTokenPayload = {
    tokenVersion: 1,
    licenseId: license.licenseId,
    subscriptionId: subscription.subscriptionId,
    planId: subscription.planId,
    planName: plan.displayName,
    deviceId: device.deviceId,
    issuedAt: new Date().toISOString(),
    expiresAt: subscription.expiryDate,
    offlineGraceUntil: graceUntil,
    maxDevices: license.activationLimit,
    activeDeviceCount: licenseDb.getActiveDevicesForLicense(license.licenseId).length,
    entitlements: plan.entitlements,
    customerEmail: customer.email,
    customerName: customer.displayName
  };

  const signedToken = signLicensePayload(tokenPayload);

  licenseDb.logValidation({
    licenseId: license.licenseId,
    deviceId: device.deviceId,
    validationTime: new Date().toISOString(),
    result: 'SUCCESS',
    appVersion: appVersion || 'unknown',
    ipAddress: req.ip || '127.0.0.1'
  });

  const response: ActivationResponse = {
    success: true,
    licenseState,
    token: signedToken,
    activeDevices: licenseDb.getActiveDevicesForLicense(license.licenseId).length,
    maxDevices: license.activationLimit,
    message: `Activated successfully on ${plan.displayName} tier (${device.deviceName}).`
  };

  return res.json(response);
});

/**
 * POST /api/v1/licenses/validate
 * Regular online heartbeat & token refresh
 */
licensingRouter.post('/validate', (req: Request, res: Response) => {
  if (!checkRateLimit(req, res, 120)) return;

  const { licenseId, deviceId, deviceFingerprint, appVersion }: ValidationRequest = req.body || {};

  if (!licenseId || !deviceId) {
    return res.status(400).json({
      success: false,
      licenseState: 'INVALID',
      message: 'licenseId and deviceId are required.',
      error: 'MISSING_PARAMETERS',
      serverTimestamp: new Date().toISOString()
    });
  }

  const lookup = licenseDb.getLicenseById(licenseId);
  if (!lookup) {
    return res.status(404).json({
      success: false,
      licenseState: 'INVALID',
      message: 'License record not found on server.',
      error: 'LICENSE_NOT_FOUND',
      serverTimestamp: new Date().toISOString()
    });
  }

  const { license, subscription, customer } = lookup;
  const plan = SUBSCRIPTION_PLANS[subscription.planId];
  const licenseState = licenseDb.computeLicenseStatus(subscription, license);

  // Check device status
  const activeDevices = licenseDb.getActiveDevicesForLicense(license.licenseId);
  const matchedDevice = activeDevices.find((d) => d.deviceId === deviceId);

  if (!matchedDevice) {
    licenseDb.logValidation({
      licenseId: license.licenseId,
      deviceId,
      validationTime: new Date().toISOString(),
      result: 'REVOKED',
      appVersion: appVersion || 'unknown',
      ipAddress: req.ip || '127.0.0.1'
    });

    return res.status(403).json({
      success: false,
      licenseState: 'REVOKED',
      message: 'This device seat has been deactivated from the subscription portal.',
      error: 'DEVICE_DEACTIVATED',
      serverTimestamp: new Date().toISOString()
    });
  }

  // Update device heartbeat
  matchedDevice.lastSeenAt = new Date().toISOString();
  if (appVersion) matchedDevice.appVersion = appVersion;

  // Compute refreshed grace period
  const graceDays = plan.offlineGracePeriodDays || 7;
  const graceUntil = new Date(Date.now() + graceDays * 86400000).toISOString();

  // Create refreshed signed token
  const tokenPayload: SignedLicenseTokenPayload = {
    tokenVersion: 1,
    licenseId: license.licenseId,
    subscriptionId: subscription.subscriptionId,
    planId: subscription.planId,
    planName: plan.displayName,
    deviceId: matchedDevice.deviceId,
    issuedAt: new Date().toISOString(),
    expiresAt: subscription.expiryDate,
    offlineGraceUntil: graceUntil,
    maxDevices: license.activationLimit,
    activeDeviceCount: activeDevices.length,
    entitlements: plan.entitlements,
    customerEmail: customer.email,
    customerName: customer.displayName
  };

  const signedToken = signLicensePayload(tokenPayload);

  licenseDb.logValidation({
    licenseId: license.licenseId,
    deviceId: matchedDevice.deviceId,
    validationTime: new Date().toISOString(),
    result: licenseState === 'EXPIRED' ? 'EXPIRED' : 'SUCCESS',
    appVersion: appVersion || 'unknown',
    ipAddress: req.ip || '127.0.0.1'
  });

  const response: ValidationResponse = {
    success: licenseState === 'ACTIVE' || licenseState === 'EXPIRING_SOON',
    licenseState,
    token: signedToken,
    serverTimestamp: new Date().toISOString(),
    message:
      licenseState === 'ACTIVE'
        ? 'License validated successfully.'
        : licenseState === 'EXPIRING_SOON'
        ? 'License active (expiring soon).'
        : 'License expired or inactive.'
  };

  return res.json(response);
});

/**
 * POST /api/v1/licenses/deactivate
 * Releases a device seat
 */
licensingRouter.post('/deactivate', (req: Request, res: Response) => {
  const { licenseId, deviceId }: DeactivationRequest = req.body || {};

  if (!licenseId || !deviceId) {
    return res.status(400).json({
      success: false,
      message: 'licenseId and deviceId are required.',
      activeDevicesCount: 0
    });
  }

  const success = licenseDb.deactivateDevice(licenseId, deviceId);
  const remaining = licenseDb.getActiveDevicesForLicense(licenseId).length;

  if (success) {
    return res.json({
      success: true,
      message: 'Device seat successfully released.',
      activeDevicesCount: remaining
    });
  } else {
    return res.status(404).json({
      success: false,
      message: 'Device not found or not registered to this license.',
      activeDevicesCount: remaining
    });
  }
});

/**
 * GET /api/v1/licenses/status
 * Fetches subscription details and device fleet for a license
 */
licensingRouter.get('/status', (req: Request, res: Response) => {
  const licenseId = (req.query.licenseId as string) || (req.headers['x-license-id'] as string);
  const currentDeviceId = (req.query.deviceId as string) || (req.headers['x-device-id'] as string);

  if (!licenseId) {
    return res.status(400).json({
      success: false,
      error: 'MISSING_LICENSE_ID',
      message: 'licenseId query parameter or header is required.'
    });
  }

  const lookup = licenseDb.getLicenseById(licenseId);
  if (!lookup) {
    return res.status(404).json({
      success: false,
      error: 'LICENSE_NOT_FOUND',
      message: 'License not found.'
    });
  }

  const { license, subscription, customer } = lookup;
  const plan = SUBSCRIPTION_PLANS[subscription.planId];
  const licenseState = licenseDb.computeLicenseStatus(subscription, license);
  const activeDevices = licenseDb.getActiveDevicesForLicense(license.licenseId);

  const now = Date.now();
  const expiry = new Date(subscription.expiryDate).getTime();
  const daysRemaining = Math.max(0, Math.ceil((expiry - now) / 86400000));

  const response: LicenseStatusResponse = {
    licenseId: license.licenseId,
    licenseKeyPrefix: license.licenseKeyPrefix,
    plan,
    subscription: {
      status: subscription.status,
      startDate: subscription.startDate,
      expiryDate: subscription.expiryDate,
      daysRemaining,
      autoRenew: subscription.autoRenew
    },
    customer: {
      name: customer.displayName,
      email: customer.email,
      organization: customer.organization
    },
    devices: activeDevices.map((d) => ({
      deviceId: d.deviceId,
      deviceName: d.deviceName,
      osVersion: d.osVersion,
      appVersion: d.appVersion,
      activatedAt: d.activatedAt,
      lastSeenAt: d.lastSeenAt,
      isCurrentDevice: currentDeviceId ? d.deviceId === currentDeviceId : false
    })),
    activeDeviceCount: activeDevices.length,
    maxDevices: license.activationLimit,
    entitlements: plan.entitlements,
    licenseState
  };

  return res.json({
    success: true,
    ...response
  });
});

/**
 * GET /api/v1/devices
 * Retrieves active device list for a license
 */
licensingRouter.get('/devices', (req: Request, res: Response) => {
  const licenseId = req.query.licenseId as string;
  if (!licenseId) {
    return res.status(400).json({ success: false, message: 'licenseId is required.' });
  }

  const activeDevices = licenseDb.getActiveDevicesForLicense(licenseId);
  res.json({
    success: true,
    devices: activeDevices
  });
});

/**
 * POST /api/v1/licenses/renew (Dev / Testing / Self-Service Simulation)
 * Simulates server-side subscription renewal (+365 days)
 */
licensingRouter.post('/renew', (req: Request, res: Response) => {
  const { licenseId, extensionDays = 365 } = req.body || {};
  if (!licenseId) {
    return res.status(400).json({ success: false, message: 'licenseId is required.' });
  }

  const renewed = licenseDb.renewSubscription(licenseId, extensionDays);
  if (!renewed) {
    return res.status(404).json({ success: false, message: 'License not found.' });
  }

  res.json({
    success: true,
    message: `Subscription extended by ${extensionDays} days. New expiry: ${renewed.expiryDate}`,
    subscription: renewed
  });
});

/**
 * POST /api/v1/licenses/revoke (Dev / Testing / Admin)
 * Sets license revoked state
 */
licensingRouter.post('/revoke', (req: Request, res: Response) => {
  const { licenseId, revoked = true } = req.body || {};
  if (!licenseId) {
    return res.status(400).json({ success: false, message: 'licenseId is required.' });
  }

  const ok = licenseDb.setLicenseRevoked(licenseId, revoked);
  if (!ok) {
    return res.status(404).json({ success: false, message: 'License not found.' });
  }

  res.json({
    success: true,
    message: `License status set to ${revoked ? 'REVOKED' : 'ACTIVE'}.`
  });
});
