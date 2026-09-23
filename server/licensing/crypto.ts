import crypto from 'crypto';
import { SignedLicenseToken, SignedLicenseTokenPayload, SubscriptionTier } from './types.js';

// In-memory or file-backed keypair for the licensing authority.
// The private key NEVER leaves the server.
// The public key is bundled into clients for token validation.
let serverKeyPair: { publicKey: string; privateKey: string } | null = null;

export function getOrCreateAuthorityKeyPair(): { publicKey: string; privateKey: string } {
  if (!serverKeyPair) {
    // Generate RSA 2048-bit key pair (standard PKCS#8 / SPKI in PEM format)
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });

    serverKeyPair = { publicKey, privateKey };
  }
  return serverKeyPair;
}

/**
 * Hash a license key for safe server-side storage and lookup
 */
export function hashLicenseKey(licenseKey: string): string {
  const normalized = licenseKey.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
  return crypto.createHash('sha256').update(`akshigo_lic_salt_${normalized}`).digest('hex');
}

/**
 * Legacy hash computation for backward-compatible migration verification
 */
export function hashLegacyLicenseKey(licenseKey: string): string {
  const normalized = licenseKey.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
  return crypto.createHash('sha256').update(`ashtech_lic_salt_${normalized}`).digest('hex');
}

/**
 * Mask license key for display (e.g., AKSG-PRO-7K2D-****-****)
 */
export function maskLicenseKey(licenseKey: string): string {
  const parts = licenseKey.trim().toUpperCase().split('-');
  if (parts.length >= 4) {
    return `${parts[0]}-${parts[1]}-${parts[2]}-****`;
  }
  return 'AKSG-PRO-****';
}

/**
 * Sign a license token payload with the server's private key
 */
export function signLicensePayload(payload: SignedLicenseTokenPayload): SignedLicenseToken {
  const { privateKey } = getOrCreateAuthorityKeyPair();
  const serialized = JSON.stringify(payload);
  
  const sign = crypto.createSign('SHA256');
  sign.update(serialized);
  sign.end();
  
  const signature = sign.sign(privateKey, 'base64');
  
  return {
    payload,
    signature,
    algorithm: 'RSA-SHA256'
  };
}

/**
 * Verify a signed license token with the server's public key
 */
export function verifyLicenseToken(token: SignedLicenseToken, publicKeyPem?: string): boolean {
  try {
    const key = publicKeyPem || getOrCreateAuthorityKeyPair().publicKey;
    const serialized = JSON.stringify(token.payload);
    
    const verify = crypto.createVerify('SHA256');
    verify.update(serialized);
    verify.end();
    
    return verify.verify(key, token.signature, 'base64');
  } catch (err) {
    return false;
  }
}

/**
 * Generate a new authentic AKSG license key for a given subscription tier
 * Format: AKSG-<TIER>-<4CHARS>-<4CHARS>-<4CHARS>
 */
export function generateAksgLicenseKey(tier: SubscriptionTier): string {
  const tierPrefixMap: Record<SubscriptionTier, string> = {
    personal: 'PERS',
    professional: 'PRO',
    technician: 'TECH',
    business: 'BIZ'
  };

  const prefix = tierPrefixMap[tier] || 'PRO';
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Exclude 0/O and 1/I for readability

  const randomChunk = (len: number) => {
    let chunk = '';
    const bytes = crypto.randomBytes(len);
    for (let i = 0; i < len; i++) {
      chunk += chars[bytes[i] % chars.length];
    }
    return chunk;
  };

  return `AKSG-${prefix}-${randomChunk(4)}-${randomChunk(4)}-${randomChunk(4)}`;
}

/**
 * Get Public Key PEM for clients
 */
export function getAuthorityPublicKeyPem(): string {
  return getOrCreateAuthorityKeyPair().publicKey;
}
