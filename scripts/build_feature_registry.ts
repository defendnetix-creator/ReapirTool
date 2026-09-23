import fs from 'fs';
import path from 'path';

export interface FeatureRegistryEntry {
  id: string;
  category: string;
  name: string;
  legacySource: string;
  legacyLabel: string;
  risk: 'safe' | 'moderate' | 'high' | 'critical';
  requiresAdmin: boolean;
  status:
    | 'IMPLEMENTED_WORKING'
    | 'IMPLEMENTED_NOT_VERIFIED'
    | 'PARTIAL'
    | 'MISSING_UI'
    | 'MISSING_BACKEND'
    | 'REMOVED_SECURITY'
    | 'OBSOLETE';
  safeReplacement?: string;
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  currentUiPage: string;
  currentBackendOp: string;
  currentSourceModule: string;
  notes?: string;
}

const registry: FeatureRegistryEntry[] = [
  // =========================================================================
  // 1. System & Administration (menu_system_admin)
  // =========================================================================
  {
    id: 'sys.admin.taskmgr',
    category: 'System & Administration',
    name: 'Task Manager Quick Launch',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'task_process / taskmgr',
    risk: 'safe',
    requiresAdmin: false,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P1',
    currentUiPage: 'diagnostics',
    currentBackendOp: 'Get-HardwareTelemetry',
    currentSourceModule: 'src/components/DiagnosticsView.tsx'
  },
  {
    id: 'sys.admin.services_msc',
    category: 'System & Administration',
    name: 'Windows Services Management Console',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'services.msc / menu_services_features',
    risk: 'moderate',
    requiresAdmin: true,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P0',
    currentUiPage: 'repairs',
    currentBackendOp: 'Invoke-SpoolerRestart',
    currentSourceModule: 'src/components/RepairsView.tsx'
  },
  {
    id: 'sys.admin.regedit',
    category: 'System & Administration',
    name: 'Registry Editor Launcher',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'regedit.exe',
    risk: 'moderate',
    requiresAdmin: true,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P1',
    currentUiPage: 'command-palette',
    currentBackendOp: 'none',
    currentSourceModule: 'src/components/CommandPaletteModal.tsx'
  },
  {
    id: 'sys.admin.dxdiag',
    category: 'System & Administration',
    name: 'DirectX Diagnostics Tool',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'dxdiag.exe',
    risk: 'safe',
    requiresAdmin: false,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P2',
    currentUiPage: 'diagnostics',
    currentBackendOp: 'Get-HardwareTelemetry',
    currentSourceModule: 'src/components/DiagnosticsView.tsx'
  },
  {
    id: 'sys.admin.msinfo32',
    category: 'System & Administration',
    name: 'System Information Console',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'msinfo32.exe',
    risk: 'safe',
    requiresAdmin: false,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P1',
    currentUiPage: 'diagnostics',
    currentBackendOp: 'Get-HardwareTelemetry',
    currentSourceModule: 'src/components/DiagnosticsView.tsx'
  },
  {
    id: 'sys.admin.compmgmt',
    category: 'System & Administration',
    name: 'Computer Management MMC Console',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'compmgmt.msc',
    risk: 'safe',
    requiresAdmin: true,
    status: 'MISSING_UI',
    priority: 'P1',
    currentUiPage: 'none',
    currentBackendOp: 'none',
    currentSourceModule: 'none'
  },
  {
    id: 'sys.admin.godmode',
    category: 'System & Administration',
    name: 'Windows GodMode Administrative Folder',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'godmode_create',
    risk: 'safe',
    requiresAdmin: true,
    status: 'MISSING_UI',
    priority: 'P2',
    currentUiPage: 'none',
    currentBackendOp: 'none',
    currentSourceModule: 'none'
  },
  {
    id: 'sys.admin.env_vars',
    category: 'System & Administration',
    name: 'System Environment Variables Editor',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'env_vars / sysdm.cpl',
    risk: 'moderate',
    requiresAdmin: true,
    status: 'MISSING_UI',
    priority: 'P2',
    currentUiPage: 'none',
    currentBackendOp: 'none',
    currentSourceModule: 'none'
  },
  {
    id: 'sys.admin.sched_tasks',
    category: 'System & Administration',
    name: 'Task Scheduler Manager Console',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'sched_tasks / taskschd.msc',
    risk: 'moderate',
    requiresAdmin: true,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P1',
    currentUiPage: 'performance',
    currentBackendOp: 'Set-StartupState',
    currentSourceModule: 'src/components/PerformanceView.tsx'
  },

  // =========================================================================
  // 2. Network & Internet (menu_network_internet)
  // =========================================================================
  {
    id: 'net.dns.flush',
    category: 'Network & Internet',
    name: 'Flush DNS Resolver Cache',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'ipconfig /flushdns',
    risk: 'safe',
    requiresAdmin: true,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P0',
    currentUiPage: 'repairs',
    currentBackendOp: 'Invoke-NetReset',
    currentSourceModule: 'src/components/RepairsView.tsx'
  },
  {
    id: 'net.winsock.reset',
    category: 'Network & Internet',
    name: 'Reset Winsock Catalog & TCP/IP Stack',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'netsh winsock reset',
    risk: 'safe',
    requiresAdmin: true,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P0',
    currentUiPage: 'repairs',
    currentBackendOp: 'Invoke-NetReset',
    currentSourceModule: 'src/components/RepairsView.tsx'
  },
  {
    id: 'net.ip.renew',
    category: 'Network & Internet',
    name: 'Release & Renew DHCP IP Lease',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'ipconfig /release & ipconfig /renew',
    risk: 'safe',
    requiresAdmin: true,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P0',
    currentUiPage: 'network',
    currentBackendOp: 'Invoke-NetReset',
    currentSourceModule: 'src/components/NetworkView.tsx'
  },
  {
    id: 'net.adapter.restart',
    category: 'Network & Internet',
    name: 'Restart Network Interface Adapters',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'adapter_reset / Restart-NetAdapter',
    risk: 'safe',
    requiresAdmin: true,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P0',
    currentUiPage: 'network',
    currentBackendOp: 'Invoke-NetReset',
    currentSourceModule: 'src/components/NetworkView.tsx'
  },
  {
    id: 'net.arp.clear',
    category: 'Network & Internet',
    name: 'Flush ARP Routing Table',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'netsh interface ip delete arpcache',
    risk: 'safe',
    requiresAdmin: true,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P1',
    currentUiPage: 'network',
    currentBackendOp: 'Invoke-NetReset',
    currentSourceModule: 'src/components/NetworkView.tsx'
  },
  {
    id: 'net.wifi.dump_cleartext',
    category: 'Network & Internet',
    name: 'Extract Cleartext Wi-Fi Passwords',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'netsh wlan show profile key=clear',
    risk: 'critical',
    requiresAdmin: true,
    status: 'REMOVED_SECURITY',
    safeReplacement: 'Wi-Fi signal quality, SSIDs, and network adapter settings diagnostics without password extraction',
    priority: 'P2',
    currentUiPage: 'network',
    currentBackendOp: 'Get-NetAdapterTelemetry',
    currentSourceModule: 'src/components/NetworkView.tsx'
  },
  {
    id: 'net.speed.ping_latency',
    category: 'Network & Internet',
    name: 'Gateway & DNS Latency Ping Test',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'ping_test / Test-Connection',
    risk: 'safe',
    requiresAdmin: false,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P1',
    currentUiPage: 'network',
    currentBackendOp: 'Test-NetConnection',
    currentSourceModule: 'src/components/NetworkView.tsx'
  },
  {
    id: 'net.firewall.gui',
    category: 'Network & Internet',
    name: 'Windows Advanced Firewall Management Console',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'wf.msc',
    risk: 'safe',
    requiresAdmin: true,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P1',
    currentUiPage: 'security',
    currentBackendOp: 'Get-NetFirewallProfile',
    currentSourceModule: 'src/components/SecurityView.tsx'
  },

  // =========================================================================
  // 3. Windows Repair (menu_windows_repair)
  // =========================================================================
  {
    id: 'repair.windows.sfc_scannow',
    category: 'Windows Repair',
    name: 'System File Checker (SFC /scannow)',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'sfc_dism / sfc /scannow',
    risk: 'safe',
    requiresAdmin: true,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P0',
    currentUiPage: 'repairs',
    currentBackendOp: 'Invoke-SfcScan',
    currentSourceModule: 'src/components/RepairsView.tsx'
  },
  {
    id: 'repair.windows.sfc_verifyonly',
    category: 'Windows Repair',
    name: 'SFC VerifyOnly Integrity Check',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'sfc /verifyonly',
    risk: 'safe',
    requiresAdmin: true,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P0',
    currentUiPage: 'dashboard',
    currentBackendOp: 'Invoke-SfcScan',
    currentSourceModule: 'src/components/DashboardView.tsx'
  },
  {
    id: 'repair.windows.dism_checkhealth',
    category: 'Windows Repair',
    name: 'DISM Component Store CheckHealth',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'DISM /Online /Cleanup-Image /CheckHealth',
    risk: 'safe',
    requiresAdmin: true,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P0',
    currentUiPage: 'repairs',
    currentBackendOp: 'Invoke-DismRestore',
    currentSourceModule: 'src/components/RepairsView.tsx'
  },
  {
    id: 'repair.windows.dism_scanhealth',
    category: 'Windows Repair',
    name: 'DISM ScanHealth Corruption Detection',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'DISM /Online /Cleanup-Image /ScanHealth',
    risk: 'safe',
    requiresAdmin: true,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P0',
    currentUiPage: 'repairs',
    currentBackendOp: 'Invoke-DismRestore',
    currentSourceModule: 'src/components/RepairsView.tsx'
  },
  {
    id: 'repair.windows.dism_restorehealth',
    category: 'Windows Repair',
    name: 'DISM RestoreHealth Image Servicing',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'DISM /Online /Cleanup-Image /RestoreHealth',
    risk: 'safe',
    requiresAdmin: true,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P0',
    currentUiPage: 'repairs',
    currentBackendOp: 'Invoke-DismRestore',
    currentSourceModule: 'src/components/RepairsView.tsx'
  },
  {
    id: 'repair.windows.dism_clean_store',
    category: 'Windows Repair',
    name: 'Component Store Cleanup (StartComponentCleanup)',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'DISM /Online /Cleanup-Image /StartComponentCleanup',
    risk: 'safe',
    requiresAdmin: true,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P0',
    currentUiPage: 'repairs',
    currentBackendOp: 'Invoke-DismRestore',
    currentSourceModule: 'src/components/RepairsView.tsx'
  },
  {
    id: 'repair.windows.catroot2_reset',
    category: 'Windows Repair',
    name: 'Catroot2 Cryptographic Services CryptSvc Cache Purge',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'catroot2_reset',
    risk: 'moderate',
    requiresAdmin: true,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P0',
    currentUiPage: 'repairs',
    currentBackendOp: 'Invoke-WURepair',
    currentSourceModule: 'src/components/RepairsView.tsx'
  },
  {
    id: 'repair.windows.softwaredistribution_reset',
    category: 'Windows Repair',
    name: 'SoftwareDistribution Cache Reset',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'softwaredistribution_reset',
    risk: 'safe',
    requiresAdmin: true,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P0',
    currentUiPage: 'repairs',
    currentBackendOp: 'Invoke-WURepair',
    currentSourceModule: 'src/components/RepairsView.tsx'
  },
  {
    id: 'repair.windows.bootrec',
    category: 'Windows Repair',
    name: 'Boot Configuration Data (BCD) & MBR Repair',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'boot_repair / bootrec',
    risk: 'high',
    requiresAdmin: true,
    status: 'MISSING_UI',
    priority: 'P0',
    currentUiPage: 'none',
    currentBackendOp: 'none',
    currentSourceModule: 'none'
  },
  {
    id: 'repair.windows.chkdsk_scan',
    category: 'Windows Repair',
    name: 'NTFS Volume Corruption Scan (CHKDSK C: /scan)',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'chkdsk C: /scan',
    risk: 'safe',
    requiresAdmin: true,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P0',
    currentUiPage: 'repairs',
    currentBackendOp: 'Invoke-DismRestore',
    currentSourceModule: 'src/components/RepairsView.tsx'
  },

  // =========================================================================
  // 4. Security & Defender (menu_security_defender)
  // =========================================================================
  {
    id: 'sec.defender.quick_scan',
    category: 'Security & Defender',
    name: 'Windows Defender Quick Antivirus Scan',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'defender_quick_scan / Start-MpScan -ScanType QuickScan',
    risk: 'safe',
    requiresAdmin: true,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P0',
    currentUiPage: 'security',
    currentBackendOp: 'Start-MpQuickScan',
    currentSourceModule: 'src/components/SecurityView.tsx'
  },
  {
    id: 'sec.defender.update_signatures',
    category: 'Security & Defender',
    name: 'Update Defender Antivirus Signatures',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'defender_update / Update-MpSignature',
    risk: 'safe',
    requiresAdmin: true,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P0',
    currentUiPage: 'security',
    currentBackendOp: 'Invoke-DefenderUpdate',
    currentSourceModule: 'src/components/SecurityView.tsx'
  },
  {
    id: 'sec.defender.disable_realtime',
    category: 'Security & Defender',
    name: 'Disable Defender Real-Time Monitoring',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'Set-MpPreference -DisableRealtimeMonitoring $true',
    risk: 'critical',
    requiresAdmin: true,
    status: 'REMOVED_SECURITY',
    safeReplacement: 'Windows Defender health verification, definition update, and security hardening',
    priority: 'P0',
    currentUiPage: 'security',
    currentBackendOp: 'Get-MpPreference',
    currentSourceModule: 'src/components/SecurityView.tsx'
  },
  {
    id: 'sec.defender.add_exclusion',
    category: 'Security & Defender',
    name: 'Add Arbitrary Folder Exclusion to Defender',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'Add-MpPreference -ExclusionPath',
    risk: 'critical',
    requiresAdmin: true,
    status: 'REMOVED_SECURITY',
    safeReplacement: 'Security audit and threat scan without compromising system exclusions',
    priority: 'P1',
    currentUiPage: 'security',
    currentBackendOp: 'none',
    currentSourceModule: 'none'
  },
  {
    id: 'sec.firewall.disable_all',
    category: 'Security & Defender',
    name: 'Turn Off All Windows Firewall Profiles',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'netsh advfirewall set allprofiles state off',
    risk: 'critical',
    requiresAdmin: true,
    status: 'REMOVED_SECURITY',
    safeReplacement: 'Windows Firewall profile audit and safe default rule enforcement',
    priority: 'P0',
    currentUiPage: 'security',
    currentBackendOp: 'Get-NetFirewallProfile',
    currentSourceModule: 'src/components/SecurityView.tsx'
  },
  {
    id: 'sec.defender.pua_protection',
    category: 'Security & Defender',
    name: 'Enable Potentially Unwanted Application (PUA) Protection',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'Set-MpPreference -PUAProtection Enabled',
    risk: 'safe',
    requiresAdmin: true,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P1',
    currentUiPage: 'security',
    currentBackendOp: 'Invoke-DefenderUpdate',
    currentSourceModule: 'src/components/SecurityView.tsx'
  },
  {
    id: 'sec.uac.verify_level',
    category: 'Security & Defender',
    name: 'User Account Control (UAC) Elevation Verification',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'uac_verify / EnableLUA',
    risk: 'safe',
    requiresAdmin: true,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P1',
    currentUiPage: 'security',
    currentBackendOp: 'Get-HardwareTelemetry',
    currentSourceModule: 'src/components/SecurityView.tsx'
  },

  // =========================================================================
  // 5. Performance Optimization (menu_performance_optimization)
  // =========================================================================
  {
    id: 'perf.temp.cleanup',
    category: 'Performance Optimization',
    name: 'System & User Temp Files Cleanup',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'cleanmgr / prune_temp',
    risk: 'safe',
    requiresAdmin: false,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P1',
    currentUiPage: 'performance',
    currentBackendOp: 'Invoke-PruneTempFiles',
    currentSourceModule: 'src/components/PerformanceView.tsx'
  },
  {
    id: 'perf.ram.flush',
    category: 'Performance Optimization',
    name: 'Working Set & Standby RAM Cache Flush',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'rammap -empty / Clear-StandbyList',
    risk: 'safe',
    requiresAdmin: true,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P1',
    currentUiPage: 'performance',
    currentBackendOp: 'Invoke-PerfOptimize',
    currentSourceModule: 'src/components/PerformanceView.tsx'
  },
  {
    id: 'perf.power.ultimate',
    category: 'Performance Optimization',
    name: 'Activate Ultimate Performance Power Scheme',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'powercfg -duplicatescheme e9a42b02-d5df-448d-aa00-03f14749eb61',
    risk: 'safe',
    requiresAdmin: true,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P1',
    currentUiPage: 'performance',
    currentBackendOp: 'Invoke-PerfOptimize',
    currentSourceModule: 'src/components/PerformanceView.tsx'
  },
  {
    id: 'perf.startup.manage',
    category: 'Performance Optimization',
    name: 'Startup Items Enable/Disable Management',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'startup_mgr / Get-CimInstance Win32_StartupCommand',
    risk: 'moderate',
    requiresAdmin: true,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P1',
    currentUiPage: 'performance',
    currentBackendOp: 'Set-StartupState',
    currentSourceModule: 'src/components/PerformanceView.tsx'
  },
  {
    id: 'perf.visual_effects.tune',
    category: 'Performance Optimization',
    name: 'Adjust Visual Effects for Best Performance',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'visual_fx / VisualFXSetting',
    risk: 'safe',
    requiresAdmin: false,
    status: 'MISSING_UI',
    priority: 'P2',
    currentUiPage: 'none',
    currentBackendOp: 'none',
    currentSourceModule: 'none'
  },

  // =========================================================================
  // 6. Storage & Disk (menu_storage_disk)
  // =========================================================================
  {
    id: 'storage.smart.inspect',
    category: 'Storage & Disk',
    name: 'Physical Drive S.M.A.R.T. Health & Temperature Check',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'smart_disk / Get-PhysicalDisk',
    risk: 'safe',
    requiresAdmin: true,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P0',
    currentUiPage: 'diagnostics',
    currentBackendOp: 'Get-DriveHealth',
    currentSourceModule: 'src/components/DiagnosticsView.tsx'
  },
  {
    id: 'storage.trim.optimize',
    category: 'Storage & Disk',
    name: 'SSD TRIM Re-trim & Volume Defragmentation',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'defrag C: /O /U',
    risk: 'safe',
    requiresAdmin: true,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P1',
    currentUiPage: 'repairs',
    currentBackendOp: 'Invoke-PerfOptimize',
    currentSourceModule: 'src/components/RepairsView.tsx'
  },
  {
    id: 'storage.diskpart.gui',
    category: 'Storage & Disk',
    name: 'Disk Management GUI (diskmgmt.msc)',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'diskmgmt.msc',
    risk: 'safe',
    requiresAdmin: true,
    status: 'MISSING_UI',
    priority: 'P1',
    currentUiPage: 'none',
    currentBackendOp: 'none',
    currentSourceModule: 'none'
  },
  {
    id: 'storage.storagesense.toggle',
    category: 'Storage & Disk',
    name: 'Windows Storage Sense Automated Purge Configuration',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'storagesense_toggle',
    risk: 'safe',
    requiresAdmin: false,
    status: 'MISSING_UI',
    priority: 'P2',
    currentUiPage: 'none',
    currentBackendOp: 'none',
    currentSourceModule: 'none'
  },

  // =========================================================================
  // 7. User / Account Management (menu_user_account)
  // =========================================================================
  {
    id: 'user.accounts.list',
    category: 'User / Account Management',
    name: 'Enumerate Local User Accounts & Security Groups',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'net user / Get-LocalUser',
    risk: 'safe',
    requiresAdmin: true,
    status: 'MISSING_UI',
    priority: 'P1',
    currentUiPage: 'none',
    currentBackendOp: 'none',
    currentSourceModule: 'none'
  },
  {
    id: 'user.admin_account.enable',
    category: 'User / Account Management',
    name: 'Enable Built-In Administrator Account',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'net user Administrator /active:yes',
    risk: 'high',
    requiresAdmin: true,
    status: 'MISSING_UI',
    priority: 'P1',
    currentUiPage: 'none',
    currentBackendOp: 'none',
    currentSourceModule: 'none'
  },
  {
    id: 'user.lusrmgr.console',
    category: 'User / Account Management',
    name: 'Local Users and Groups MMC Console (lusrmgr.msc)',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'lusrmgr.msc',
    risk: 'moderate',
    requiresAdmin: true,
    status: 'MISSING_UI',
    priority: 'P2',
    currentUiPage: 'none',
    currentBackendOp: 'none',
    currentSourceModule: 'none'
  },

  // =========================================================================
  // 8. Backup & Restore (menu_backup_restore)
  // =========================================================================
  {
    id: 'backup.restore_point.create',
    category: 'Backup & Restore',
    name: 'Create System Restore Point',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'Checkpoint-Computer / sysrestore_create',
    risk: 'safe',
    requiresAdmin: true,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P0',
    currentUiPage: 'dashboard',
    currentBackendOp: 'Invoke-FullHealing',
    currentSourceModule: 'src/components/DashboardView.tsx'
  },
  {
    id: 'backup.registry.export',
    category: 'Backup & Restore',
    name: 'Export Full Windows Registry Backup',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'reg export HKLM reg_backup.reg',
    risk: 'safe',
    requiresAdmin: true,
    status: 'MISSING_UI',
    priority: 'P0',
    currentUiPage: 'none',
    currentBackendOp: 'none',
    currentSourceModule: 'none'
  },
  {
    id: 'backup.vss.manage',
    category: 'Backup & Restore',
    name: 'Volume Shadow Copy (VSS) Administration',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'vssadmin list shadows',
    risk: 'moderate',
    requiresAdmin: true,
    status: 'MISSING_UI',
    priority: 'P1',
    currentUiPage: 'none',
    currentBackendOp: 'none',
    currentSourceModule: 'none'
  },

  // =========================================================================
  // 9. Driver & Hardware (menu_driver_hardware)
  // =========================================================================
  {
    id: 'driver.inventory.pnp',
    category: 'Driver & Hardware',
    name: 'PnP Driver Inventory & Unsigned Driver Audit',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'driver_audit / Win32_PnPSignedDriver',
    risk: 'safe',
    requiresAdmin: true,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P0',
    currentUiPage: 'diagnostics',
    currentBackendOp: 'Get-HardwareTelemetry',
    currentSourceModule: 'src/components/DiagnosticsView.tsx'
  },
  {
    id: 'driver.export.dism',
    category: 'Driver & Hardware',
    name: 'Export Third-Party Drivers via DISM',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'dism /online /export-driver',
    risk: 'safe',
    requiresAdmin: true,
    status: 'MISSING_UI',
    priority: 'P0',
    currentUiPage: 'none',
    currentBackendOp: 'none',
    currentSourceModule: 'none'
  },
  {
    id: 'driver.devmgmt.launch',
    category: 'Driver & Hardware',
    name: 'Windows Device Manager Console (devmgmt.msc)',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'devmgmt.msc',
    risk: 'safe',
    requiresAdmin: true,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P1',
    currentUiPage: 'diagnostics',
    currentBackendOp: 'Get-HardwareTelemetry',
    currentSourceModule: 'src/components/DiagnosticsView.tsx'
  },

  // =========================================================================
  // 10. Update & Activation (menu_update_activation)
  // =========================================================================
  {
    id: 'update.wu.service_reset',
    category: 'Update & Activation',
    name: 'Reset Windows Update Services & BITS',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'wu_reset / wuauserv',
    risk: 'safe',
    requiresAdmin: true,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P0',
    currentUiPage: 'repairs',
    currentBackendOp: 'Invoke-WURepair',
    currentSourceModule: 'src/components/RepairsView.tsx'
  },
  {
    id: 'update.activation.slmgr_check',
    category: 'Update & Activation',
    name: 'Windows Genuine Licensing Status Query',
    legacySource: 'Modules/CheckActivation.cmd',
    legacyLabel: 'slmgr.vbs /xpr /dli',
    risk: 'safe',
    requiresAdmin: false,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P0',
    currentUiPage: 'diagnostics',
    currentBackendOp: 'Get-HardwareTelemetry',
    currentSourceModule: 'src/components/DiagnosticsView.tsx'
  },

  // =========================================================================
  // 11. Office / Outlook (menu_office_outlook)
  // =========================================================================
  {
    id: 'office.outlook.safe_mode',
    category: 'Office / Outlook',
    name: 'Launch Outlook in Safe Mode',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'outlook.exe /safe',
    risk: 'safe',
    requiresAdmin: false,
    status: 'MISSING_UI',
    priority: 'P1',
    currentUiPage: 'none',
    currentBackendOp: 'none',
    currentSourceModule: 'none'
  },
  {
    id: 'office.outlook.reset_navpane',
    category: 'Office / Outlook',
    name: 'Reset Outlook Navigation Pane',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'outlook.exe /resetnavpane',
    risk: 'safe',
    requiresAdmin: false,
    status: 'MISSING_UI',
    priority: 'P1',
    currentUiPage: 'none',
    currentBackendOp: 'none',
    currentSourceModule: 'none'
  },
  {
    id: 'office.c2r.quick_repair',
    category: 'Office / Outlook',
    name: 'Trigger Office Click-to-Run (C2R) Repair',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'OfficeClickToRun.exe scenario=Repair',
    risk: 'moderate',
    requiresAdmin: true,
    status: 'MISSING_UI',
    priority: 'P1',
    currentUiPage: 'none',
    currentBackendOp: 'none',
    currentSourceModule: 'none'
  },

  // =========================================================================
  // 12. Printer / Spooler (menu_printer_spooler & Printer Analyzer Pro)
  // =========================================================================
  {
    id: 'printer.spooler.restart',
    category: 'Printer / Spooler',
    name: 'Restart Windows Print Spooler Service',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'spooler_restart / net stop spooler',
    risk: 'safe',
    requiresAdmin: true,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P0',
    currentUiPage: 'repairs',
    currentBackendOp: 'Invoke-SpoolerRestart',
    currentSourceModule: 'src/components/RepairsView.tsx'
  },
  {
    id: 'printer.queue.purge',
    category: 'Printer / Spooler',
    name: 'Purge Stuck Print Jobs Queue (%SystemRoot%\\System32\\spool\\PRINTERS)',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'del /Q /F %systemroot%\\System32\\spool\\PRINTERS\\*',
    risk: 'safe',
    requiresAdmin: true,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P0',
    currentUiPage: 'repairs',
    currentBackendOp: 'Invoke-QueuePurge',
    currentSourceModule: 'src/components/RepairsView.tsx'
  },
  {
    id: 'printer.analyzer.full_diagnose',
    category: 'Printer / Spooler',
    name: 'Printer Analyzer Pro Port & Driver Diagnostic',
    legacySource: 'Printer_Analyzer_Pro.cs',
    legacyLabel: 'PrinterAnalyzer.DiagnoseAll()',
    risk: 'safe',
    requiresAdmin: true,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P0',
    currentUiPage: 'repairs',
    currentBackendOp: 'Invoke-SpoolerRestart',
    currentSourceModule: 'src/components/RepairsView.tsx'
  },

  // =========================================================================
  // 13. Remote Access / RDP (menu_remote_rdp)
  // =========================================================================
  {
    id: 'remote.rdp.enable_disable',
    category: 'Remote Access / RDP',
    name: 'Configure Remote Desktop Protocol (fDenyTSConnections)',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'rdp_toggle / Terminal Server',
    risk: 'moderate',
    requiresAdmin: true,
    status: 'MISSING_UI',
    priority: 'P1',
    currentUiPage: 'none',
    currentBackendOp: 'none',
    currentSourceModule: 'none'
  },
  {
    id: 'remote.rdp.firewall_rule',
    category: 'Remote Access / RDP',
    name: 'Enable RDP Port 3389 Firewall Exception',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'netsh advfirewall firewall set rule group="remote desktop" new enable=Yes',
    risk: 'moderate',
    requiresAdmin: true,
    status: 'MISSING_UI',
    priority: 'P1',
    currentUiPage: 'none',
    currentBackendOp: 'none',
    currentSourceModule: 'none'
  },

  // =========================================================================
  // 14. BIOS / UEFI / Boot (menu_bios_boot)
  // =========================================================================
  {
    id: 'boot.uefi.reboot_fw',
    category: 'BIOS / UEFI / Boot',
    name: 'Reboot Directly into UEFI Firmware Settings',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'shutdown /r /fw /t 0',
    risk: 'moderate',
    requiresAdmin: true,
    status: 'MISSING_UI',
    priority: 'P1',
    currentUiPage: 'none',
    currentBackendOp: 'none',
    currentSourceModule: 'none'
  },
  {
    id: 'boot.tpm.verify',
    category: 'BIOS / UEFI / Boot',
    name: 'Query TPM 2.0 State & Secure Boot Status',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'tpm.msc / Confirm-SecureBootUEFI',
    risk: 'safe',
    requiresAdmin: true,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P0',
    currentUiPage: 'diagnostics',
    currentBackendOp: 'Get-HardwareTelemetry',
    currentSourceModule: 'src/components/DiagnosticsView.tsx'
  },

  // =========================================================================
  // 15. Registry / Group Policy (menu_registry_policy)
  // =========================================================================
  {
    id: 'policy.gpupdate.force',
    category: 'Registry / Group Policy',
    name: 'Force Local Group Policy Update (gpupdate /force)',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'gpupdate /force',
    risk: 'safe',
    requiresAdmin: true,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P1',
    currentUiPage: 'command-palette',
    currentBackendOp: 'none',
    currentSourceModule: 'src/components/CommandPaletteModal.tsx'
  },
  {
    id: 'policy.gpedit.launch',
    category: 'Registry / Group Policy',
    name: 'Local Group Policy Editor Console (gpedit.msc)',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'gpedit.msc',
    risk: 'safe',
    requiresAdmin: true,
    status: 'MISSING_UI',
    priority: 'P2',
    currentUiPage: 'none',
    currentBackendOp: 'none',
    currentSourceModule: 'none'
  },

  // =========================================================================
  // 16. Windows Services & Features (menu_services_features)
  // =========================================================================
  {
    id: 'services.optional_features.dism',
    category: 'Windows Services & Features',
    name: 'List & Toggle Windows Optional Features (DISM)',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'dism /online /get-features',
    risk: 'moderate',
    requiresAdmin: true,
    status: 'MISSING_UI',
    priority: 'P1',
    currentUiPage: 'none',
    currentBackendOp: 'none',
    currentSourceModule: 'none'
  },

  // =========================================================================
  // 17. Live System Monitor (menu_live_monitor)
  // =========================================================================
  {
    id: 'monitor.telemetry.live',
    category: 'Live System Monitor',
    name: 'Real-Time CPU, RAM, Disk & Network Telemetry Stream',
    legacySource: 'Modules/WebBridgeServer.ps1',
    legacyLabel: '/api/metrics / Get-HardwareTelemetry',
    risk: 'safe',
    requiresAdmin: false,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P0',
    currentUiPage: 'dashboard',
    currentBackendOp: 'Get-HardwareTelemetry',
    currentSourceModule: 'src/components/DashboardView.tsx'
  },

  // =========================================================================
  // 18. Event Logs (menu_event_logs)
  // =========================================================================
  {
    id: 'logs.eventviewer.launch',
    category: 'Event Logs',
    name: 'Windows Event Viewer Console (eventvwr.msc)',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'eventvwr.msc',
    risk: 'safe',
    requiresAdmin: true,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P0',
    currentUiPage: 'reports',
    currentBackendOp: 'Export-AuditLogs',
    currentSourceModule: 'src/components/ReportsView.tsx'
  },
  {
    id: 'logs.audit.failed_logins',
    category: 'Event Logs',
    name: 'Failed Logon Security Audit (Event ID 4625)',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'Get-WinEvent -FilterHashtable @{LogName="Security";Id=4625}',
    risk: 'safe',
    requiresAdmin: true,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P0',
    currentUiPage: 'security',
    currentBackendOp: 'Export-AuditLogs',
    currentSourceModule: 'src/components/SecurityView.tsx'
  },

  // =========================================================================
  // 19. Quick Access (menu_quick_access)
  // =========================================================================
  {
    id: 'quick.control_panel.launch',
    category: 'Quick Access',
    name: 'Classic Windows Control Panel Shortcuts',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'control.exe / appwiz.cpl',
    risk: 'safe',
    requiresAdmin: false,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P2',
    currentUiPage: 'command-palette',
    currentBackendOp: 'none',
    currentSourceModule: 'src/components/CommandPaletteModal.tsx'
  },

  // =========================================================================
  // 20. Power User / Developer (menu_power_user_dev)
  // =========================================================================
  {
    id: 'power.wsl.install',
    category: 'Power User / Developer',
    name: 'Windows Subsystem for Linux (WSL) Setup',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'wsl --install',
    risk: 'moderate',
    requiresAdmin: true,
    status: 'MISSING_UI',
    priority: 'P2',
    currentUiPage: 'none',
    currentBackendOp: 'none',
    currentSourceModule: 'none'
  },
  {
    id: 'power.hyperv.toggle',
    category: 'Power User / Developer',
    name: 'Hyper-V Hypervisor Feature Management',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'Enable-WindowsOptionalFeature -FeatureName Microsoft-Hyper-V',
    risk: 'moderate',
    requiresAdmin: true,
    status: 'MISSING_UI',
    priority: 'P2',
    currentUiPage: 'none',
    currentBackendOp: 'none',
    currentSourceModule: 'none'
  },

  // =========================================================================
  // 21. AI Smart Auto Fix (menu_ai_auto_fix & AICopilotView)
  // =========================================================================
  {
    id: 'ai.copilot.troubleshooter',
    category: 'AI Smart Auto Fix',
    name: 'AI Smart Auto Fix & Interactive IT Helpdesk Copilot',
    legacySource: 'Modules/WebBridgeServer.ps1',
    legacyLabel: '/api/chat / ai_assistant_center',
    risk: 'safe',
    requiresAdmin: false,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P1',
    currentUiPage: 'ai-copilot',
    currentBackendOp: 'Invoke-AIInference',
    currentSourceModule: 'src/components/AICopilotView.tsx'
  },

  // =========================================================================
  // 22. Auto Performance (menu_auto_performance)
  // =========================================================================
  {
    id: 'auto.perf.boost',
    category: 'Auto Performance',
    name: 'One-Click Automated Performance Booster',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'auto_perf / Invoke-PerfOptimize',
    risk: 'safe',
    requiresAdmin: true,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P0',
    currentUiPage: 'dashboard',
    currentBackendOp: 'Invoke-PerfOptimize',
    currentSourceModule: 'src/components/DashboardView.tsx'
  },

  // =========================================================================
  // 23. Auto Network Repair (menu_auto_network)
  // =========================================================================
  {
    id: 'auto.net.repair',
    category: 'Auto Network Repair',
    name: 'Automated 5-Stage Network Repair Engine',
    legacySource: 'Modules/WiFiDiagnostics.cmd',
    legacyLabel: 'auto_network / Invoke-NetReset',
    risk: 'safe',
    requiresAdmin: true,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P0',
    currentUiPage: 'dashboard',
    currentBackendOp: 'Invoke-NetReset',
    currentSourceModule: 'src/components/DashboardView.tsx'
  },

  // =========================================================================
  // 24. Cloud & Remote Management (menu_cloud_remote)
  // =========================================================================
  {
    id: 'cloud.telemetry.bridge',
    category: 'Cloud & Remote Management',
    name: 'Loopback Telemetry & Update Authority Connector',
    legacySource: 'Modules/WebBridgeServer.ps1',
    legacyLabel: '/api/status / /api/v1/updates',
    risk: 'safe',
    requiresAdmin: false,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P0',
    currentUiPage: 'settings',
    currentBackendOp: 'Get-Status',
    currentSourceModule: 'src/components/SettingsView.tsx'
  },

  // =========================================================================
  // 25. Download & Deployment (menu_download_deploy)
  // =========================================================================
  {
    id: 'deploy.winget.install',
    category: 'Download & Deployment',
    name: 'WinGet Package Manager Silent Software Deployment',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'winget install --silent',
    risk: 'safe',
    requiresAdmin: true,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P1',
    currentUiPage: 'software',
    currentBackendOp: 'Invoke-WinGetInstall',
    currentSourceModule: 'src/components/SoftwareView.tsx'
  },

  // =========================================================================
  // 26. Cyber Security Toolkit (menu_cyber_security)
  // =========================================================================
  {
    id: 'cyber.portscan.local',
    category: 'Cyber Security Toolkit',
    name: 'Active TCP/IP Listening Ports & Owner Process Audit',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'netstat -ano / Get-NetTCPConnection',
    risk: 'safe',
    requiresAdmin: true,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P0',
    currentUiPage: 'network',
    currentBackendOp: 'Get-NetTCPConnection',
    currentSourceModule: 'src/components/NetworkView.tsx'
  },
  {
    id: 'cyber.usb.history_audit',
    category: 'Cyber Security Toolkit',
    name: 'USB Connection History & Device Class Audit',
    legacySource: 'Config/tools.catalog',
    legacyLabel: 'usbdrivelog.exe / Get-ItemProperty Enum\\USBSTOR',
    risk: 'safe',
    requiresAdmin: true,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P1',
    currentUiPage: 'security',
    currentBackendOp: 'Get-HardwareTelemetry',
    currentSourceModule: 'src/components/SecurityView.tsx'
  },

  // =========================================================================
  // 27. Mass Software Installer (menu_mass_installer)
  // =========================================================================
  {
    id: 'software.mass_installer.catalog',
    category: 'Mass Software Installer',
    name: 'Curated Multi-App Software Installer Grid',
    legacySource: 'Config/custom_winget_apps.bundle',
    legacyLabel: 'menu_mass_installer',
    risk: 'safe',
    requiresAdmin: true,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P1',
    currentUiPage: 'software',
    currentBackendOp: 'Invoke-WinGetInstall',
    currentSourceModule: 'src/components/SoftwareView.tsx'
  },

  // =========================================================================
  // 28. Dashboard (menu_hacker_dashboard)
  // =========================================================================
  {
    id: 'dash.main.view',
    category: 'Dashboard',
    name: 'Executive Telemetry & Health Dashboard',
    legacySource: 'dashboard.html',
    legacyLabel: 'pg-dash',
    risk: 'safe',
    requiresAdmin: false,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P0',
    currentUiPage: 'dashboard',
    currentBackendOp: 'Get-HardwareTelemetry',
    currentSourceModule: 'src/components/DashboardView.tsx'
  },

  // =========================================================================
  // 29. Settings (menu_settings_themes)
  // =========================================================================
  {
    id: 'settings.theme.preferences',
    category: 'Settings',
    name: 'Application Theme, Polling & Bridge Preferences',
    legacySource: 'Config/gui_settings.cfg',
    legacyLabel: 'menu_settings_themes',
    risk: 'safe',
    requiresAdmin: false,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P2',
    currentUiPage: 'settings',
    currentBackendOp: 'Save-Preferences',
    currentSourceModule: 'src/components/SettingsView.tsx'
  },

  // =========================================================================
  // 30. About (menu_about_toolkit)
  // =========================================================================
  {
    id: 'about.toolkit.metadata',
    category: 'About',
    name: 'Product Architecture, Licensing & Version Information',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'menu_about_toolkit',
    risk: 'safe',
    requiresAdmin: false,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P3',
    currentUiPage: 'settings',
    currentBackendOp: 'none',
    currentSourceModule: 'src/components/SettingsView.tsx'
  },

  // =========================================================================
  // 31. Smart Search Center (menu_search)
  // =========================================================================
  {
    id: 'search.smart.command_palette',
    category: 'Smart Search Center',
    name: 'Global Unified Command Search & Quick Action Palette',
    legacySource: 'Modules/SmartMenuSearch.ps1',
    legacyLabel: 'menu_search',
    risk: 'safe',
    requiresAdmin: false,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P1',
    currentUiPage: 'command-palette',
    currentBackendOp: 'none',
    currentSourceModule: 'src/components/CommandPaletteModal.tsx'
  },

  // =========================================================================
  // 32. Problem Master Hub (problem_master_hub)
  // =========================================================================
  {
    id: 'problem.master.guided_triage',
    category: 'Problem Master Hub',
    name: 'Guided Triage Wizards (Audio, Network, Boot, Windows Update)',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'problem_master_hub',
    risk: 'safe',
    requiresAdmin: true,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P0',
    currentUiPage: 'repairs',
    currentBackendOp: 'Invoke-FullHealing',
    currentSourceModule: 'src/components/RepairsView.tsx'
  },

  // =========================================================================
  // 33. Driver Auto Center (driver_auto_center)
  // =========================================================================
  {
    id: 'driver.auto.oem_center',
    category: 'Driver Auto Center',
    name: 'OEM Driver Detection & Windows Update Driver Sync',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'driver_auto_center',
    risk: 'moderate',
    requiresAdmin: true,
    status: 'PARTIAL',
    priority: 'P0',
    currentUiPage: 'diagnostics',
    currentBackendOp: 'Get-HardwareTelemetry',
    currentSourceModule: 'src/components/DiagnosticsView.tsx',
    notes: 'Driver telemetry and signed verification working; automated OEM download catalog pending UI expansion'
  },

  // =========================================================================
  // 34. CMD Vault (cmd_vault)
  // =========================================================================
  {
    id: 'vault.cmd.reference_10k',
    category: 'CMD Vault',
    name: '10,000+ System Admin CLI Reference Vault',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'cmd_vault',
    risk: 'safe',
    requiresAdmin: false,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P2',
    currentUiPage: 'command-palette',
    currentBackendOp: 'none',
    currentSourceModule: 'src/components/CommandPaletteModal.tsx'
  },

  // =========================================================================
  // 35. Command Mega Vault (missing_mega_vault_launcher)
  // =========================================================================
  {
    id: 'vault.mega.native_consoles',
    category: 'Command Mega Vault',
    name: 'Direct Launchpad for 20+ Native Diagnostic Consoles',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'missing_mega_vault_launcher',
    risk: 'safe',
    requiresAdmin: false,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P2',
    currentUiPage: 'command-palette',
    currentBackendOp: 'none',
    currentSourceModule: 'src/components/CommandPaletteModal.tsx'
  },

  // =========================================================================
  // 36. Portable Tools (portable_tools_menu & tools.catalog)
  // =========================================================================
  {
    id: 'portable.tools.bluescreenview',
    category: 'Portable Tools',
    name: 'BlueScreenView Crash Dump Analyzer',
    legacySource: 'Config/tools.catalog',
    legacyLabel: 'BlueScreenView.exe',
    risk: 'safe',
    requiresAdmin: true,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P0',
    currentUiPage: 'reports',
    currentBackendOp: 'Export-AuditLogs',
    currentSourceModule: 'src/components/ReportsView.tsx'
  },
  {
    id: 'portable.tools.hdsentinel',
    category: 'Portable Tools',
    name: 'Hard Disk Sentinel S.M.A.R.T. Health Monitor',
    legacySource: 'Config/tools.catalog',
    legacyLabel: 'Hard Disk Sentinel.exe',
    risk: 'safe',
    requiresAdmin: true,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P0',
    currentUiPage: 'diagnostics',
    currentBackendOp: 'Get-DriveHealth',
    currentSourceModule: 'src/components/DiagnosticsView.tsx'
  },
  {
    id: 'portable.tools.wscc',
    category: 'Portable Tools',
    name: 'Windows System Control Center (WSCC)',
    legacySource: 'Config/tools.catalog',
    legacyLabel: 'Windows System Control Center.exe',
    risk: 'safe',
    requiresAdmin: true,
    status: 'MISSING_UI',
    priority: 'P2',
    currentUiPage: 'none',
    currentBackendOp: 'none',
    currentSourceModule: 'none'
  },
  {
    id: 'portable.tools.ipscanner',
    category: 'Portable Tools',
    name: 'Advanced IP Scanner / LAN Topology Mapper',
    legacySource: 'Config/tools.catalog',
    legacyLabel: 'ipscan.exe',
    risk: 'safe',
    requiresAdmin: false,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P1',
    currentUiPage: 'network',
    currentBackendOp: 'Get-NetTCPConnection',
    currentSourceModule: 'src/components/NetworkView.tsx'
  },

  // =========================================================================
  // 37. 100 Apps 1-Click Install (menu_1click_100_apps)
  // =========================================================================
  {
    id: 'apps.100.bundle_install',
    category: '100 Apps 1-Click Install',
    name: '100 Curated Applications 1-Click Batch Installer',
    legacySource: 'Toolkit.bat',
    legacyLabel: 'menu_1click_100_apps',
    risk: 'safe',
    requiresAdmin: true,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P1',
    currentUiPage: 'software',
    currentBackendOp: 'Invoke-WinGetInstall',
    currentSourceModule: 'src/components/SoftwareView.tsx'
  },

  // =========================================================================
  // Standalone Modules & Advanced Extensions
  // =========================================================================
  {
    id: 'standalone.oneclick.super_repair',
    category: 'OneClickSuperRepair',
    name: '9-Stage Automated System Healing & Repair Pipeline',
    legacySource: 'Modules/OneClickSuperRepair.ps1',
    legacyLabel: 'Invoke-FullHealing',
    risk: 'safe',
    requiresAdmin: true,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P0',
    currentUiPage: 'dashboard',
    currentBackendOp: 'Invoke-FullHealing',
    currentSourceModule: 'src/components/DashboardView.tsx'
  },
  {
    id: 'standalone.inventory.system_report',
    category: 'System Inventory',
    name: 'Deep HTML Hardware, Software & Firmware Inventory Generator',
    legacySource: 'Modules/SystemInventoryReport.ps1',
    legacyLabel: 'Invoke-GenerateReport',
    risk: 'safe',
    requiresAdmin: false,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P0',
    currentUiPage: 'reports',
    currentBackendOp: 'Invoke-GenerateReport',
    currentSourceModule: 'src/components/ReportsView.tsx'
  },
  {
    id: 'standalone.battery.report',
    category: 'Battery Report',
    name: 'Windows Battery Capacity, Cycle Count & Health Report',
    legacySource: 'Modules/BatteryReport.cmd',
    legacyLabel: 'powercfg /batteryreport',
    risk: 'safe',
    requiresAdmin: false,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P0',
    currentUiPage: 'diagnostics',
    currentBackendOp: 'Invoke-BatteryReport',
    currentSourceModule: 'src/components/DiagnosticsView.tsx'
  },
  {
    id: 'standalone.report_center.audit_logs',
    category: 'Toolkit Report Center',
    name: 'Toolkit Operational Audit Logs & CSV Exporter',
    legacySource: 'Modules/ToolkitReportCenter.ps1',
    legacyLabel: 'Export-AuditLogs',
    risk: 'safe',
    requiresAdmin: false,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P0',
    currentUiPage: 'reports',
    currentBackendOp: 'Export-AuditLogs',
    currentSourceModule: 'src/components/ReportsView.tsx'
  },
  {
    id: 'standalone.watchdog.selfheal',
    category: 'SelfHeal Watchdog',
    name: 'Background Service Guardian & Heartbeat Restarter',
    legacySource: 'Modules/SelfHeal-Watchdog.ps1',
    legacyLabel: 'SelfHealWatchdog',
    risk: 'safe',
    requiresAdmin: true,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P1',
    currentUiPage: 'settings',
    currentBackendOp: 'Get-Status',
    currentSourceModule: 'src/components/SettingsView.tsx'
  },
  {
    id: 'standalone.gui_repair.selfrepair',
    category: 'GUI Self Repair',
    name: 'Runtime Error Diagnostic & Recovery Mechanism',
    legacySource: 'Modules/GUI-SelfRepair.ps1',
    legacyLabel: 'GUI-SelfRepair',
    risk: 'safe',
    requiresAdmin: false,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P2',
    currentUiPage: 'settings',
    currentBackendOp: 'none',
    currentSourceModule: 'src/components/SettingsView.tsx'
  },
  {
    id: 'standalone.debloat.win11',
    category: 'Win11 Debloat',
    name: 'Windows 11 Non-Essential AppX & Consumer Telemetry Pruning',
    legacySource: 'Modules/Win11Debloat.ps1',
    legacyLabel: 'Invoke-SafeDebloat',
    risk: 'moderate',
    requiresAdmin: true,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P1',
    currentUiPage: 'performance',
    currentBackendOp: 'Invoke-SafeDebloat',
    currentSourceModule: 'src/components/PerformanceView.tsx'
  },
  {
    id: 'standalone.favorites.bundle',
    category: 'Favorites',
    name: 'Custom Quick-Launch Toolkit Favorites Bundle',
    legacySource: 'Config/favorites.bundle',
    legacyLabel: 'favorites_bundle',
    risk: 'safe',
    requiresAdmin: false,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P2',
    currentUiPage: 'dashboard',
    currentBackendOp: 'none',
    currentSourceModule: 'src/components/DashboardView.tsx'
  },
  {
    id: 'standalone.install_history.tracking',
    category: 'Install History',
    name: 'Software Installation & Upgrade Audit History',
    legacySource: 'Config/custom_bundle.txt',
    legacyLabel: 'install_history',
    risk: 'safe',
    requiresAdmin: false,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P2',
    currentUiPage: 'software',
    currentBackendOp: 'Get-InstalledSoftware',
    currentSourceModule: 'src/components/SoftwareView.tsx'
  },
  {
    id: 'standalone.winget.custom_bundles',
    category: 'Custom WinGet Bundles',
    name: 'Custom Enterprise WinGet Application Bundles',
    legacySource: 'Config/custom_winget_apps.bundle',
    legacyLabel: 'custom_winget_bundle',
    risk: 'safe',
    requiresAdmin: true,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P1',
    currentUiPage: 'software',
    currentBackendOp: 'Invoke-WinGetInstall',
    currentSourceModule: 'src/components/SoftwareView.tsx'
  },
  {
    id: 'standalone.tools.catalog_registry',
    category: 'Portable Tools Catalog',
    name: 'Consolidated 34+ Portable Utility Catalog Registry',
    legacySource: 'Config/tools.catalog',
    legacyLabel: 'tools_catalog',
    risk: 'safe',
    requiresAdmin: true,
    status: 'IMPLEMENTED_WORKING',
    priority: 'P1',
    currentUiPage: 'software',
    currentBackendOp: 'none',
    currentSourceModule: 'src/components/SoftwareView.tsx'
  }
];

// Write out JSON
const outputPath = path.resolve(process.cwd(), 'src/config/feature-registry.json');
fs.writeFileSync(outputPath, JSON.stringify(registry, null, 2), 'utf8');
console.log(`Successfully wrote ${registry.length} feature entries to ${outputPath}`);

// Calculate Metrics
const counts: Record<string, number> = {
  TOTAL: registry.length,
  IMPLEMENTED_WORKING: 0,
  IMPLEMENTED_NOT_VERIFIED: 0,
  PARTIAL: 0,
  MISSING_UI: 0,
  MISSING_BACKEND: 0,
  REMOVED_SECURITY: 0,
  OBSOLETE: 0
};

registry.forEach((item) => {
  if (counts[item.status] !== undefined) {
    counts[item.status]++;
  }
});

console.log('--- Feature Registry Metrics ---');
console.log(counts);
