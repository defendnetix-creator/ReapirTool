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

export interface DeviceRecord {
  deviceId: string;
  deviceName: string;
  osVersion: string;
  appVersion: string;
  activatedAt: string;
  lastSeenAt: string;
  isCurrentDevice?: boolean;
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

export interface LicenseClientState {
  isInitialized: boolean;
  status: LicenseStatus;
  licenseId?: string;
  maskedKey?: string;
  plan?: PlanDefinition;
  token?: SignedLicenseToken;
  customerName?: string;
  customerEmail?: string;
  organization?: string;
  expiryDate?: string;
  daysRemaining?: number;
  offlineGraceRemainingDays?: number;
  activeDevices: DeviceRecord[];
  maxDevices: number;
  isCurrentDeviceActivated: boolean;
  currentDeviceId?: string;
  lastValidatedAt?: string;
  errorMessage?: string;
}
