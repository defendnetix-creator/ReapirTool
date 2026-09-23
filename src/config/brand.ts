/**
 * Akshigo PC Toolkit Pro — Centralized Brand & Publisher Configuration
 * 
 * Defines all customer-facing and internal branding constants.
 * Company / Publisher: "Akshigo Tech" (no unconfigured legal suffixes)
 * Product: "Akshigo PC Toolkit Pro"
 */

export const BRAND = {
  // Product Identity
  PRODUCT_NAME: 'Akshigo PC Toolkit Pro',
  PRODUCT_SHORT_NAME: 'Akshigo',
  PRODUCT_SLOGAN: 'Enterprise-Grade Windows Diagnostics, System Repair & Optimization Suite',
  VERSION: '8.0.0-rc.1',
  BUILD_CODE: '20260917.RC1',

  // Company / Publisher Identity (No legal suffix)
  COMPANY_NAME: 'Akshigo Tech',
  PUBLISHER_DISPLAY_NAME: 'Akshigo Tech',

  // Executable & Packaging Artifact Names
  EXECUTABLE_NAME: 'Akshigo-PC-Toolkit-Pro.exe',
  INSTALLER_NAME: 'Akshigo-PC-Toolkit-Pro-8.0.0-rc.1-Setup.exe',
  STANDALONE_EXE_NAME: 'AkshigoPCToolkitPro.exe',

  // License Key Specifications
  LICENSE_PREFIX: 'AKSG',
  LEGACY_LICENSE_PREFIX: 'ASHT',
  SAMPLE_KEY_MASK: 'AKSG-PRO-****-****',

  // AI Assistant Branding
  AI_ASSISTANT_NAME: 'Akshigo AI Assistant',
  AI_COPILOT_TITLE: 'Akshigo Diagnostic Copilot',

  // Canonical Filesystem Architecture
  PROGRAM_FILES_DIR: 'C:\\Program Files\\Akshigo Tech\\PC Toolkit Pro',
  PROGRAM_DATA_DIR: 'C:\\ProgramData\\Akshigo Tech\\PC Toolkit Pro',
  LOCAL_APP_DATA_DIR: '%LOCALAPPDATA%\\Akshigo Tech\\PC Toolkit Pro',
  WEBVIEW2_DATA_DIR: '%LOCALAPPDATA%\\Akshigo Tech\\PC Toolkit Pro\\WebView2Data',

  // Registry Roots
  REGISTRY_KEY_PATH: 'Software\\Akshigo Tech\\PC Toolkit Pro',
  LEGACY_REGISTRY_KEY_PATH: 'Software\\ASHtech\\PC Toolkit Pro',

  // Web & Support URLs (Configurable via Environment)
  DEFAULT_SUPPORT_URL: 'https://akshigo.tech/support',
  DEFAULT_ACCOUNT_URL: 'https://account.akshigo.tech',
  DEFAULT_DOCS_URL: 'https://akshigo.tech/docs'
} as const;
