import { SubscriptionTier } from '../licensing/types.js';

export const EMAIL_CONFIG = {
  PROVIDER: (process.env.EMAIL_PROVIDER || 'mock').toLowerCase(),
  FROM: process.env.EMAIL_FROM || 'Akshigo Tech <noreply@akshigo.tech>',
  SUPPORT_EMAIL: process.env.EMAIL_SUPPORT || 'support@akshigo.tech',
  SUPPORT_URL: process.env.EMAIL_SUPPORT_URL || 'https://akshigo.tech/support',
  APP_URL: (process.env.APP_URL || 'https://akshigo.tech').replace(/\/+$/, ''),
  OVERRIDE_RECIPIENT: process.env.EMAIL_OVERRIDE_RECIPIENT || '',
  MAX_RETRIES: 3,
  
  // SMTP credentials (optional)
  SMTP: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || ''
  }
};

/**
 * Mask raw license key for safe display in emails.
 * e.g. "AKSG-PRO-HUMG-YJ54-DC52" -> "AKSG-PRO-••••-••••-DC52"
 * e.g. "AKSG-TECH-ABC1-DEF2-GHI3" -> "AKSG-TECH-••••-••••-GHI3"
 * Never reveals middle secret segments in transactional emails.
 */
export function maskLicenseKey(rawKey?: string): string {
  if (!rawKey) return '';
  const parts = rawKey.split('-');
  if (parts.length < 4) {
    // Fallback if format is non-standard
    return `${rawKey.substring(0, 8)}••••${rawKey.substring(rawKey.length - 4)}`;
  }
  
  // Keep AKSG and TIER (parts[0] and parts[1]), mask parts[2] and parts[3], keep last chunk
  const prefix = `${parts[0]}-${parts[1]}`;
  const suffix = parts[parts.length - 1];
  const maskedMiddle = parts.slice(2, parts.length - 1).map(() => '••••').join('-');
  
  return `${prefix}-${maskedMiddle}-${suffix}`;
}

/**
 * Plan display metadata for email templates
 */
export const EMAIL_PLAN_NAMES: Record<SubscriptionTier, string> = {
  personal: 'Personal Edition (1 PC)',
  professional: 'Professional Edition (2 Workstations)',
  technician: 'Technician Toolkit (5 Portable Seats)',
  business: 'Business & Fleet MSP (25 Endpoints)'
};
