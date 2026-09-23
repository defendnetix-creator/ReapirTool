export type SubscriptionTier = 'personal' | 'professional' | 'technician' | 'business';

export type LicenseStatus =
  | 'ACTIVE'
  | 'EXPIRING_SOON'
  | 'EXPIRED'
  | 'SUSPENDED'
  | 'REVOKED'
  | 'DEVICE_LIMIT_REACHED'
  | 'INVALID'
  | 'OFFLINE_GRACE'
  | 'SERVER_UNAVAILABLE';

export interface PlanDefinition {
  planId: SubscriptionTier;
  displayName: string;
  pricePlaceholder: string;
  billingPeriod: string;
  maxDevices: number;
  offlineGracePeriodDays: number;
  entitlements: string[];
  status: 'ACTIVE' | 'ARCHIVED';
  description: string;
}

export interface CustomerRecord {
  customerId: string;
  email: string;
  displayName: string;
  organization?: string;
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
}

export interface SubscriptionRecord {
  subscriptionId: string;
  customerId: string;
  planId: SubscriptionTier;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'SUSPENDED';
  startDate: string;
  expiryDate: string;
  autoRenew: boolean;
  renewalStatus: 'PENDING' | 'RENEWED' | 'FAILED' | 'NONE';
  createdAt: string;
  updatedAt: string;
}

export interface LicenseRecord {
  licenseId: string;
  subscriptionId: string;
  licenseKeyHash: string;
  licenseKeyPrefix: string; // e.g. "ASHT-PRO-****"
  status: 'ACTIVE' | 'REVOKED' | 'SUSPENDED';
  activationLimit: number;
  createdAt: string;
  revokedAt?: string;
  notes?: string;
}

export interface DeviceRecord {
  deviceId: string;
  licenseId: string;
  deviceFingerprint: string;
  deviceName: string;
  osVersion: string;
  appVersion: string;
  activatedAt: string;
  lastSeenAt: string;
  status: 'ACTIVE' | 'DEACTIVATED';
  ipAddress?: string;
}

export interface LicenseValidationLog {
  validationId: string;
  licenseId: string;
  deviceId: string;
  validationTime: string;
  result: 'SUCCESS' | 'EXPIRED' | 'REVOKED' | 'DEVICE_LIMIT' | 'INVALID_SIGNATURE' | 'INVALID_KEY';
  appVersion: string;
  ipAddress: string;
}

export interface SignedLicenseTokenPayload {
  tokenVersion: number;
  licenseId: string;
  subscriptionId: string;
  planId: SubscriptionTier;
  planName: string;
  deviceId: string;
  issuedAt: string;
  expiresAt: string;
  offlineGraceUntil: string;
  maxDevices: number;
  activeDeviceCount: number;
  entitlements: string[];
  customerEmail: string;
  customerName: string;
}

export interface SignedLicenseToken {
  payload: SignedLicenseTokenPayload;
  signature: string;
  algorithm: string;
}

export interface ActivationRequest {
  licenseKey: string;
  deviceFingerprint: string;
  deviceName: string;
  osVersion: string;
  appVersion: string;
}

export interface ActivationResponse {
  success: boolean;
  licenseState: LicenseStatus;
  token?: SignedLicenseToken;
  message: string;
  error?: string;
  activeDevices?: number;
  maxDevices?: number;
}

export interface ValidationRequest {
  licenseId: string;
  deviceId: string;
  tokenSignature?: string;
  deviceFingerprint: string;
  appVersion: string;
}

export interface ValidationResponse {
  success: boolean;
  licenseState: LicenseStatus;
  token?: SignedLicenseToken;
  message: string;
  serverTimestamp: string;
  error?: string;
}

export interface DeactivationRequest {
  licenseId: string;
  deviceId: string;
  reason?: string;
}

export interface DeactivationResponse {
  success: boolean;
  message: string;
  activeDevicesCount: number;
}

export interface LicenseStatusResponse {
  licenseId: string;
  licenseKeyPrefix: string;
  plan: PlanDefinition;
  subscription: {
    status: string;
    startDate: string;
    expiryDate: string;
    daysRemaining: number;
    autoRenew: boolean;
  };
  customer: {
    name: string;
    email: string;
    organization?: string;
  };
  devices: {
    deviceId: string;
    deviceName: string;
    osVersion: string;
    appVersion: string;
    activatedAt: string;
    lastSeenAt: string;
    isCurrentDevice?: boolean;
  }[];
  activeDeviceCount: number;
  maxDevices: number;
  entitlements: string[];
  licenseState: LicenseStatus;
}
