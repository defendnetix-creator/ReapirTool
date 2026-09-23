import { LicenseClientState, SubscriptionTier } from './types.js';

export interface EntitlementMetadata {
  key: string;
  name: string;
  category: 'Diagnostics' | 'Repairs' | 'Performance' | 'Software' | 'Network' | 'Security' | 'AI' | 'Reports' | 'Technician' | 'Enterprise';
  minTier: SubscriptionTier;
  description: string;
}

export const ENTITLEMENT_CATALOG: EntitlementMetadata[] = [
  // Diagnostics
  { key: 'diagnostics.basic', name: 'Standard Diagnostics', category: 'Diagnostics', minTier: 'personal', description: 'System health scan, CPU, RAM and disk basic health metrics' },
  { key: 'diagnostics.hardware', name: 'Hardware Telemetry', category: 'Diagnostics', minTier: 'personal', description: 'Real-time CPU thermal sensors, GPU memory, RAM timing' },
  { key: 'diagnostics.deep_benchmarks', name: 'Deep Hardware Benchmarking', category: 'Diagnostics', minTier: 'professional', description: 'Synthetic stress testing, read/write I/O benchmarks' },
  { key: 'diagnostics.system_twin', name: 'Digital SystemTwin Snapshot', category: 'Diagnostics', minTier: 'professional', description: 'Hardware drift analysis and baseline configuration snapshots' },
  { key: 'diagnostics.event_log_analyzer', name: 'Advanced Event Log Analyzer', category: 'Diagnostics', minTier: 'technician', description: 'Deep WMI event parsing and blue screen crash dump triage' },
  { key: 'diagnostics.fleet_telemetry', name: 'Multi-Machine Fleet Telemetry', category: 'Diagnostics', minTier: 'business', description: 'Aggregated fleet telemetry and central compliance auditing' },

  // Repairs
  { key: 'repair.basic', name: 'Standard Maintenance', category: 'Repairs', minTier: 'personal', description: 'Temporary file purging, spooler reset, cache clearing' },
  { key: 'repair.registry', name: 'Registry Hygiene & Compact', category: 'Repairs', minTier: 'personal', description: 'Orphaned CLSID cleanup and registry structure optimization' },
  { key: 'repair.disk_cleanup', name: 'Intelligent Disk Purge', category: 'Repairs', minTier: 'personal', description: 'Delivery optimization, log rolling, Windows error reporting dump purge' },
  { key: 'repair.deep_wmi', name: 'Deep WMI Repository Repair', category: 'Repairs', minTier: 'professional', description: 'Rebuilding corrupted Win32 providers and namespace index' },
  { key: 'repair.dism_sfc', name: 'DISM & Component Store Scrub', category: 'Repairs', minTier: 'professional', description: 'Windows component store repair and SFC system file verification' },
  { key: 'repair.one_click_super', name: 'One-Click Super Repair Engine', category: 'Repairs', minTier: 'professional', description: 'Multi-threaded automated sequential repair pipeline' },
  { key: 'repair.driver_store_purge', name: 'DriverStore Staging Purge', category: 'Repairs', minTier: 'technician', description: 'Removes orphaned OEM drivers and ghosted hardware nodes' },
  { key: 'repair.printer_analyzer_pro', name: 'Printer Analyzer Pro', category: 'Repairs', minTier: 'technician', description: 'Deep print spooler subsystem rebuild and corrupted port driver flush' },
  { key: 'repair.mass_automation', name: 'Mass Script Orchestration', category: 'Repairs', minTier: 'business', description: 'Unattended repair script distribution across fleet' },

  // Performance
  { key: 'performance.basic', name: 'Process & Startup Triage', category: 'Performance', minTier: 'personal', description: 'Startup application management and background service analyzer' },
  { key: 'performance.pro_tweaks', name: 'Kernel & Power Tuning Pro', category: 'Performance', minTier: 'professional', description: 'Ultimate performance plan unlock and memory pool optimization' },
  { key: 'performance.ram_cache_purge', name: 'Standby List RAM Purge', category: 'Performance', minTier: 'technician', description: 'Instant kernel standby list flush and working set reclamation' },

  // Software & Debloat
  { key: 'software.winget_basic', name: 'WinGet Package Manager', category: 'Software', minTier: 'personal', description: 'One-click software installation and essential upgrades' },
  { key: 'software.bulk_installer', name: 'Batch Software Installer', category: 'Software', minTier: 'professional', description: 'Multi-package bundle automation and custom bundles' },
  { key: 'software.debloat_pro', name: 'Windows 11 Debloat Pro', category: 'Software', minTier: 'professional', description: 'Telemetry disablement, Cortana/Copilot/Edge background task debloat' },
  { key: 'software.custom_bundles', name: 'Custom Deployment Bundles', category: 'Software', minTier: 'technician', description: 'Custom corporate software profiles and post-install triggers' },
  { key: 'software.fleet_package_push', name: 'Fleet Package Push', category: 'Software', minTier: 'business', description: 'Silent background deployment across remote managed endpoints' },

  // Network
  { key: 'network.diagnostics', name: 'Network Diagnostics', category: 'Network', minTier: 'personal', description: 'Latency test, gateway reachability, IP configuration' },
  { key: 'network.adapter_reset', name: 'Network Stack Reset', category: 'Network', minTier: 'professional', description: 'Winsock catalog reset, TCP/IP stack rebind, adapter reinitialization' },
  { key: 'network.dns_flush', name: 'DNS & ARP Cache Flush', category: 'Network', minTier: 'professional', description: 'Local name resolution cache flush and routing table verification' },
  { key: 'network.port_scanner', name: 'Subnet & Port Auditor', category: 'Network', minTier: 'technician', description: 'Local network active listener scan and rogue port detection' },

  // Security
  { key: 'security.defender_status', name: 'Defender Security Status', category: 'Security', minTier: 'personal', description: 'Antivirus signature status, RTP monitor, firewall status' },
  { key: 'security.hardening_pro', name: 'OS Hardening Pro', category: 'Security', minTier: 'professional', description: 'ASLR enforcement, SMBv1 disablement, exploit protection baseline' },
  { key: 'security.tamper_guard', name: 'Tamper Protection Guard', category: 'Security', minTier: 'professional', description: 'Shielding against unauthorized script execution and script hijacking' },
  { key: 'security.bitlocker_audit', name: 'BitLocker Key Audit & TPM', category: 'Security', minTier: 'technician', description: 'Volume encryption status and hardware TPM 2.0 readiness inspection' },
  { key: 'security.fleet_compliance_check', name: 'Fleet Security Compliance', category: 'Security', minTier: 'business', description: 'CIS baseline benchmarking across managed nodes' },

  // AI & Reports
  { key: 'ai.copilot_diagnostics', name: 'AI Diagnostic Copilot', category: 'AI', minTier: 'professional', description: 'Intelligent log correlation and troubleshooting assistant' },
  { key: 'ai.powershell_generator', name: 'AI PowerShell Script Crafter', category: 'AI', minTier: 'professional', description: 'Generates hardened, Defender-compliant remediation scripts' },
  { key: 'ai.automated_troubleshooter', name: 'Automated Root Cause AI', category: 'AI', minTier: 'technician', description: 'End-to-end multi-step root cause diagnostic reasoning' },
  { key: 'ai.fleet_anomaly_detection', name: 'Fleet Anomaly Detection', category: 'AI', minTier: 'business', description: 'Predictive hardware failure and pattern recognition across fleet' },
  { key: 'reports.basic_html', name: 'HTML Diagnostic Report', category: 'Reports', minTier: 'personal', description: 'Exportable system health summary document' },
  { key: 'reports.json_export', name: 'Structured JSON / CSV Export', category: 'Reports', minTier: 'professional', description: 'Raw metrics for logging systems and ticket attachments' },
  { key: 'reports.system_twin_export', name: 'SystemTwin Config Export', category: 'Reports', minTier: 'professional', description: 'Complete state diff snapshot for migration and forensics' },
  { key: 'reports.client_branded_pdf', name: 'Client-Branded PDF Report', category: 'Reports', minTier: 'technician', description: 'White-label technician inspection report with MSP branding' },
  { key: 'reports.benchmarking_history', name: 'Historical Benchmark Compare', category: 'Reports', minTier: 'technician', description: 'Trend analysis comparing before-and-after repair performance' },

  // Technician & Enterprise
  { key: 'technician.portable_mode', name: 'Portable USB Deployment', category: 'Technician', minTier: 'technician', description: 'Run directly from technician recovery thumb drive' },
  { key: 'technician.multi_client_profiles', name: 'Multi-Client Profiles', category: 'Technician', minTier: 'technician', description: 'Separate customer logs and repair history per client' },
  { key: 'technician.offline_extended_grace', name: '14-Day Offline Grace', category: 'Technician', minTier: 'technician', description: 'Extended field operation without internet connectivity' },
  { key: 'business.central_policy_sync', name: 'Central Policy Sync', category: 'Enterprise', minTier: 'business', description: 'Cloud-synced custom tool catalog and repair policies' },
  { key: 'business.fleet_audit_logs', name: 'Immutable Audit Trail', category: 'Enterprise', minTier: 'business', description: 'Centralized tamper-evident audit logging for all workstation actions' },
  { key: 'business.unattended_cli_execution', name: 'Headless CLI Automation', category: 'Enterprise', minTier: 'business', description: 'Command-line execution via RMM/MDM remote orchestrators' }
];

/**
 * Checks if a specific feature entitlement is granted in the current license state.
 */
export function hasEntitlement(featureKey: string, licenseState: LicenseClientState): boolean {
  if (!licenseState || !licenseState.isInitialized) return false;

  // Basic diagnostic inspection and existing report viewing are ALWAYS accessible (free tier / read-only baseline)
  if (featureKey === 'diagnostics.basic' || featureKey === 'reports.basic_html') {
    return true;
  }

  // If revoked, expired, suspended, or invalid -> restrict all pro actions
  if (
    licenseState.status === 'EXPIRED' ||
    licenseState.status === 'REVOKED' ||
    licenseState.status === 'SUSPENDED' ||
    licenseState.status === 'INVALID' ||
    licenseState.status === 'DEVICE_LIMIT_REACHED'
  ) {
    return false;
  }

  // If active or within offline grace, check granted entitlements
  const tokenEntitlements = licenseState.token?.payload?.entitlements || licenseState.plan?.entitlements || [];
  return tokenEntitlements.includes(featureKey) || tokenEntitlements.includes('*');
}

/**
 * Gets the minimum plan required for an entitlement
 */
export function getRequiredPlanForEntitlement(featureKey: string): SubscriptionTier {
  const found = ENTITLEMENT_CATALOG.find((e) => e.key === featureKey);
  return found ? found.minTier : 'professional';
}
