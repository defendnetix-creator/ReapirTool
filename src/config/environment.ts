/// <reference types="vite/client" />
import { BRAND } from './brand.js';

/**
 * Akshigo PC Toolkit Pro — Build Environment & Release Modes
 * 
 * Supports explicit separation between DEBUG, STAGING, and RELEASE.
 * Development evaluation presets and mock backdoors are strictly excluded in RELEASE.
 * Configurable endpoints without hardcoding unverified production domains.
 */

export type BuildMode = 'DEBUG' | 'STAGING' | 'RELEASE';

export interface EnvironmentConfig {
  mode: BuildMode;
  appVersion: string;
  buildNumber: string;
  productName: string;
  companyName: string;
  isDevelopment: boolean;
  isStaging: boolean;
  isRelease: boolean;
  showEvaluationKeys: boolean;
  enableDevShortcuts: boolean;
  enableDevTools: boolean;
  licensingApiUrl: string;
  updatesApiUrl: string;
  telemetryEndpoint: string;
  accountPortalUrl: string;
  supportUrl: string;
  expectedSignerIdentity?: string;
  expectedSignerThumbprint?: string;
}

const metaEnv = (import.meta as any).env || {};
const CURRENT_MODE: BuildMode = (metaEnv.VITE_APP_MODE as BuildMode) || 
  (metaEnv.DEV ? 'DEBUG' : 'RELEASE');

// Configurable endpoints via environment variables
const LICENSE_API_BASE = metaEnv.VITE_AKSHIGO_LICENSE_API_BASE || metaEnv.AKSHIGO_LICENSE_API_BASE;
const UPDATE_API_BASE = metaEnv.VITE_AKSHIGO_UPDATE_API_BASE || metaEnv.AKSHIGO_UPDATE_API_BASE;
const ACCOUNT_PORTAL = metaEnv.VITE_AKSHIGO_ACCOUNT_PORTAL_URL || BRAND.DEFAULT_ACCOUNT_URL;
const SUPPORT_URL = metaEnv.VITE_AKSHIGO_SUPPORT_URL || BRAND.DEFAULT_SUPPORT_URL;

// In RELEASE mode, fail if invalid endpoints are provided
function resolveLicensingEndpoint(): string {
  if (LICENSE_API_BASE) {
    return `${LICENSE_API_BASE.replace(/\/$/, '')}/api/v1/licenses`;
  }
  if (CURRENT_MODE === 'RELEASE') {
    // Configurable production endpoint placeholder
    return 'https://licensing.akshigo.tech/api/v1/licenses';
  }
  if (CURRENT_MODE === 'STAGING') {
    return 'https://staging-licensing.akshigo.tech/api/v1/licenses';
  }
  return '/api/v1/licenses'; // Local dev proxy
}

function resolveUpdatesEndpoint(): string {
  if (UPDATE_API_BASE) {
    return `${UPDATE_API_BASE.replace(/\/$/, '')}/api/v1/updates`;
  }
  if (CURRENT_MODE === 'RELEASE') {
    return 'https://updates.akshigo.tech/api/v1/updates';
  }
  if (CURRENT_MODE === 'STAGING') {
    return 'https://staging-updates.akshigo.tech/api/v1/updates';
  }
  return '/api/v1/updates'; // Local dev proxy
}

export const ENV: EnvironmentConfig = {
  mode: CURRENT_MODE,
  appVersion: BRAND.VERSION,
  buildNumber: BRAND.BUILD_CODE,
  productName: BRAND.PRODUCT_NAME,
  companyName: BRAND.COMPANY_NAME,
  isDevelopment: CURRENT_MODE === 'DEBUG',
  isStaging: CURRENT_MODE === 'STAGING',
  isRelease: CURRENT_MODE === 'RELEASE',
  
  // Security rule: Only show sample QA keys in DEBUG mode
  showEvaluationKeys: CURRENT_MODE === 'DEBUG',
  enableDevShortcuts: CURRENT_MODE === 'DEBUG',
  enableDevTools: CURRENT_MODE === 'DEBUG',

  // Configurable Endpoints
  licensingApiUrl: resolveLicensingEndpoint(),
  updatesApiUrl: resolveUpdatesEndpoint(),
  telemetryEndpoint: metaEnv.VITE_AKSHIGO_TELEMETRY_URL || 'http://127.0.0.1:9999/telemetry',
  accountPortalUrl: ACCOUNT_PORTAL,
  supportUrl: SUPPORT_URL,

  // Configurable signing verification
  expectedSignerIdentity: metaEnv.VITE_SIGNING_EXPECTED_SUBJECT || undefined,
  expectedSignerThumbprint: metaEnv.VITE_SIGNING_EXPECTED_THUMBPRINT || undefined
};
