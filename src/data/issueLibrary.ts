/**
 * Issue Catalog & Symptom Problem Definitions
 * Akshigo PC Toolkit Pro v8.0.0-rc.1
 * Phase 8.7: Structured Issue Library & Guided Symptom Mapping
 */

export interface IssueDefinition {
  id: string;
  title: string;
  category:
    | 'Windows'
    | 'Network'
    | 'Printer'
    | 'Performance'
    | 'Hardware'
    | 'Storage'
    | 'Drivers'
    | 'Boot'
    | 'Office/Outlook'
    | 'RDP/Remote'
    | 'Security'
    | 'Updates'
    | 'User Accounts';
  symptoms: string[];
  diagnosticOperations: string[];
  recommendedOperations: string[];
  riskLevel: 'SAFE' | 'MODERATE' | 'HIGH';
  requiresAdmin: boolean;
  restartRequired: boolean;
  description: string;
  detailedSteps?: string[];
}

export const ISSUE_LIBRARY: IssueDefinition[] = [
  // 1. NETWORK
  {
    id: 'issue.network.no_internet',
    title: 'No Internet / Limited Connectivity',
    category: 'Network',
    symptoms: ['No internet access', 'Yellow exclamation on WiFi/Ethernet', 'Websites fail to resolve', 'DNS lookup failure'],
    diagnosticOperations: [
      'network.diagnostics.run',
      'network.ping.gateway',
      'network.ping.dns',
      'network.proxy.detect',
      'network.adapter.list'
    ],
    recommendedOperations: [
      'network.dns.flush',
      'network.winsock.reset',
      'network.ip.renew',
      'network.tcpip.reset'
    ],
    riskLevel: 'SAFE',
    requiresAdmin: true,
    restartRequired: false,
    description: 'Diagnoses complete network stack starting from loopback, default gateway, DNS server responsiveness, and active proxy interceptors before running safe socket flushes.'
  },
  {
    id: 'issue.network.dns_issues',
    title: 'DNS Resolution Failure / Server Not Found',
    category: 'Network',
    symptoms: ['ERR_NAME_NOT_RESOLVED', 'Cannot load websites by domain name', 'IP addresses respond but URLs fail', 'Stale DNS cache'],
    diagnosticOperations: [
      'network.ping.dns',
      'network.diagnostics.run'
    ],
    recommendedOperations: [
      'network.dns.flush',
      'network.dns.benchmark',
      'network.dns.set_cloudflare',
      'network.winsock.reset'
    ],
    riskLevel: 'SAFE',
    requiresAdmin: true,
    restartRequired: false,
    description: 'Clears corrupted client-side DNS resolver cache and tests primary/secondary upstream DNS latency, offering safe switch to Cloudflare (1.1.1.1) or Google DNS.'
  },
  {
    id: 'issue.network.slow_wifi',
    title: 'High Wi-Fi Latency / Packet Drops',
    category: 'Network',
    symptoms: ['High ping in online meetings or gaming', 'Spike latency over 200ms', 'Frequent Wi-Fi disconnects', 'Weak signal reported'],
    diagnosticOperations: [
      'network.wifi.scan',
      'network.ping.gateway',
      'network.adapter.list'
    ],
    recommendedOperations: [
      'network.dns.flush',
      'network.adapter.disable_enable',
      'network.wifi.profile_export'
    ],
    riskLevel: 'SAFE',
    requiresAdmin: true,
    restartRequired: false,
    description: 'Audits Wi-Fi channel crowding, RSSI signal attenuation, and resets network interface state without clearing stored passwords.'
  },

  // 2. PRINTER
  {
    id: 'issue.printer.stuck_spooler',
    title: 'Print Spooler Jammed / Documents Stuck in Queue',
    category: 'Printer',
    symptoms: ['Document deleting forever', 'Cannot print', 'Spooler service stopped unexpectedly', 'Printer error 0x00000002'],
    diagnosticOperations: [
      'printer.diagnostics.run',
      'printer.list'
    ],
    recommendedOperations: [
      'printer.spooler.restart',
      'printer.queue.purge',
      'printer.subsystem.cleanup'
    ],
    riskLevel: 'SAFE',
    requiresAdmin: true,
    restartRequired: false,
    description: 'Terminates hung spoolsv.exe instances, purges locked .SHD/.SPL print job manifests from System32\\spool\\PRINTERS, and cleanly restarts the Print Spooler daemon.'
  },
  {
    id: 'issue.printer.network_share_0x11b',
    title: 'Network Printer Error 0x0000011b or 0x00000709',
    category: 'Printer',
    symptoms: ['Operation could not be completed error 0x0000011b', 'Windows cannot connect to the printer 0x00000709', 'Point and Print restriction warning'],
    diagnosticOperations: [
      'printer.sharing.diagnose',
      'printer.diagnostics.run'
    ],
    recommendedOperations: [
      'printer.fix_0x0000011b',
      'printer.fix_0x00000709',
      'printer.spooler.restart'
    ],
    riskLevel: 'SAFE',
    requiresAdmin: true,
    restartRequired: false,
    description: 'Applies Microsoft authenticated RPC protocol compatibility flags (RpcAuthnLevelPrivacyEnabled) and repairs user profile default printer registry pointers.'
  },

  // 3. WINDOWS INTEGRITY & UPDATE
  {
    id: 'issue.windows.corrupted_files',
    title: 'Corrupted Windows System Files / Blue Screens',
    category: 'Windows',
    symptoms: ['Random crashes or BSODs', 'System UI freezing', 'explorer.exe crashes', 'Missing system DLLs'],
    diagnosticOperations: [
      'repair.sfc.verifyonly',
      'repair.dism.checkhealth',
      'repair.dism.scanhealth'
    ],
    recommendedOperations: [
      'repair.sfc.scannow',
      'repair.dism.restorehealth',
      'repair.sfc_dism.full'
    ],
    riskLevel: 'SAFE',
    requiresAdmin: true,
    restartRequired: false,
    description: 'Executes DISM Component Store repair against verified Microsoft payload sources, followed by SFC /scannow to reconstruct damaged protected system manifests.'
  },
  {
    id: 'issue.windows.update_failure',
    title: 'Windows Update Stuck / Error 0x80070002 or 0x800f081f',
    category: 'Updates',
    symptoms: ['Update download stuck at 0% or 99%', 'Install error code 0x80070002', 'Updates fail and roll back', 'Catroot2 signature failure'],
    diagnosticOperations: [
      'repair.wu.diagnostics',
      'repair.wu.status'
    ],
    recommendedOperations: [
      'repair.wu.reset_services',
      'repair.wu.softwaredist_reset',
      'repair.wu.catroot2_reset'
    ],
    riskLevel: 'MODERATE',
    requiresAdmin: true,
    restartRequired: false,
    description: 'Halts wuauserv and BITS services, purges corrupt cache in SoftwareDistribution\\Download, rebuilds Catroot2 signatures, and restarts update daemons.'
  },
  {
    id: 'issue.windows.start_menu_stuck',
    title: 'Start Menu, Search, or Taskbar Unresponsive',
    category: 'Windows',
    symptoms: ['Start button does not open menu', 'Taskbar frozen or icons missing', 'Windows Search window blank', 'ShellExperienceHost hung'],
    diagnosticOperations: [
      'repair.cbs_log.view'
    ],
    recommendedOperations: [
      'repair.explorer.restart',
      'repair.startmenu.troubleshoot',
      'repair.store.reregister'
    ],
    riskLevel: 'SAFE',
    requiresAdmin: true,
    restartRequired: false,
    description: 'Restarts the Windows desktop shell (explorer.exe), purges corrupt Start Menu layout database caches, and re-registers the modern inbox application framework.'
  },

  // 4. PERFORMANCE & STORAGE
  {
    id: 'issue.performance.high_disk_usage',
    title: '100% Disk Usage / Low Free Storage',
    category: 'Storage',
    symptoms: ['System sluggish', 'Task Manager shows 100% disk active time', 'C: drive running out of space', 'Large temp file accumulation'],
    diagnosticOperations: [
      'storage.disk.list',
      'storage.smart.read',
      'storage.volume.list'
    ],
    recommendedOperations: [
      'storage.temp.clean',
      'repair.dism.clean_store',
      'storage.recyclebin.empty'
    ],
    riskLevel: 'SAFE',
    requiresAdmin: true,
    restartRequired: false,
    description: 'Analyzes drive volumes, inspects SMART disk wear levels, purges %TEMP% dumps, empty recycle bins, and optimizes the WinSxS component store.'
  },
  {
    id: 'issue.performance.high_ram_cpu',
    title: 'High CPU or RAM Exhaustion / Unresponsive Apps',
    category: 'Performance',
    symptoms: ['Fans spinning loud continuously', 'RAM usage > 90%', 'Slow task switching', 'Unresponsive background apps'],
    diagnosticOperations: [
      'system.process.list',
      'system.startup.list',
      'hardware.telemetry.get'
    ],
    recommendedOperations: [
      'repair.explorer.restart',
      'repair.time.sync'
    ],
    riskLevel: 'SAFE',
    requiresAdmin: false,
    restartRequired: false,
    description: 'Inventories memory working sets, pinpoints runaway background tasks, audits excessive startup programs, and resynchronizes local timer clock drifts.'
  },

  // 5. HARDWARE & THERMALS
  {
    id: 'issue.hardware.battery_thermal',
    title: 'Battery Degradation or Thermal Throttling',
    category: 'Hardware',
    symptoms: ['Laptop battery draining fast', 'Unexpected thermal shutdowns', 'CPU clock dropping under load', 'High battery wear level'],
    diagnosticOperations: [
      'hardware.battery.report',
      'hardware.thermal.read',
      'hardware.telemetry.get'
    ],
    recommendedOperations: [
      'repair.time.sync'
    ],
    riskLevel: 'SAFE',
    requiresAdmin: false,
    restartRequired: false,
    description: 'Generates official Windows BatteryReport HTML, interrogates ACPI thermal zones, checks fan RPM telemetry, and calculates battery cycle capacity health.'
  },
  {
    id: 'issue.drivers.problem_devices',
    title: 'Driver Error / Yellow Exclamation in Device Manager',
    category: 'Drivers',
    symptoms: ['Code 10 / Code 43 device error', 'Audio not working', 'Bluetooth device missing', 'Graphics driver crash'],
    diagnosticOperations: [
      'hardware.problem_devices.list',
      'driver.list',
      'driver.oem_assistants.detect'
    ],
    recommendedOperations: [
      'repair.recovery.create_restore_point'
    ],
    riskLevel: 'MODERATE',
    requiresAdmin: true,
    restartRequired: true,
    description: 'Identifies devices with Windows error codes (Code 10/28/43), audits third-party driver store INF versions, and links directly to official OEM update tools.'
  },

  // 6. BOOT & RECOVERY
  {
    id: 'issue.boot.slow_boot_winre',
    title: 'Slow Startup / Windows Recovery Environment (WinRE) Disabled',
    category: 'Boot',
    symptoms: ['Boot time exceeding 2 minutes', 'Cannot enter Advanced Startup', 'WinRE status shows Disabled', 'Reagentc error'],
    diagnosticOperations: [
      'boot.status.get',
      'backup.winre.status',
      'backup.restore_points.list'
    ],
    recommendedOperations: [
      'backup.winre.enable',
      'repair.recovery.create_restore_point'
    ],
    riskLevel: 'SAFE',
    requiresAdmin: true,
    restartRequired: false,
    description: 'Audits UEFI/BIOS boot mode, Secure Boot status, fast startup configuration, and re-enables Windows Recovery Environment (reagentc /enable).'
  },

  // 7. OFFICE & OUTLOOK
  {
    id: 'issue.office.outlook_crashes',
    title: 'Outlook Crashing / Add-In Freeze / Corrupt Profile',
    category: 'Office/Outlook',
    symptoms: ['Outlook stuck at "Loading Profile"', 'Outlook crashes on send/receive', 'Corrupt OST/PST data file', 'Third-party add-in freeze'],
    diagnosticOperations: [
      'office.status.get',
      'office.installed_products.list'
    ],
    recommendedOperations: [
      'office.outlook.safe_mode',
      'office.outlook.reset_nav',
      'office.repair.quick'
    ],
    riskLevel: 'SAFE',
    requiresAdmin: true,
    restartRequired: false,
    description: 'Launches Outlook in isolated /safe mode, resets corrupt navigation pane XML settings, and triggers official Click-To-Run Quick Repair.'
  },

  // 8. RDP & REMOTE ACCESS
  {
    id: 'issue.remote.rdp_connection_refused',
    title: 'Remote Desktop (RDP) Connection Refused / Port 3389 Blocked',
    category: 'RDP/Remote',
    symptoms: ['Remote Desktop cannot connect', 'Error 0x204 or 0x104', 'NLA authentication failure', 'Port 3389 listening closed'],
    diagnosticOperations: [
      'remote.status.get',
      'remote.vpn_proxy.get'
    ],
    recommendedOperations: [
      'remote.rdp.enable',
      'remote.rdp.nla_toggle',
      'remote.rdp.firewall_allow'
    ],
    riskLevel: 'MODERATE',
    requiresAdmin: true,
    restartRequired: false,
    description: 'Verifies fDenyTSConnections registry value, verifies Windows Defender Firewall rule for Remote Desktop, and adjusts NLA security settings.'
  },

  // 9. SECURITY & DEFENDER
  {
    id: 'issue.security.defender_outdated',
    title: 'Microsoft Defender Signatures Outdated or Scan Needed',
    category: 'Security',
    symptoms: ['Defender reports signatures out of date', 'Security Center yellow warning', 'Scan has not run in 30 days', 'Real-time protection check required'],
    diagnosticOperations: [
      'security.telemetry.get'
    ],
    recommendedOperations: [
      'security.signatures.update',
      'security.quick_scan.run'
    ],
    riskLevel: 'SAFE',
    requiresAdmin: true,
    restartRequired: false,
    description: 'Updates Antivirus and Antispyware definition signatures directly from Microsoft Security Intelligence and executes an on-demand quick scan.'
  },

  // 10. USER ACCOUNTS
  {
    id: 'issue.accounts.profile_or_uac',
    title: 'User Profile Temporary Login / UAC Elevation Friction',
    category: 'User Accounts',
    symptoms: ['Logged in with a temporary profile', 'Cannot save files to Desktop', 'UAC prompt missing or failing', 'Corrupt NTUSER.DAT'],
    diagnosticOperations: [
      'accounts.list',
      'policy.gpresult.get'
    ],
    recommendedOperations: [
      'policy.gpupdate.force',
      'repair.recovery.create_restore_point'
    ],
    riskLevel: 'SAFE',
    requiresAdmin: true,
    restartRequired: true,
    description: 'Inspects local user account SIDs and ProfileImagePath keys, checks domain policy group membership, and triggers a clean GPUpdate refresh.'
  }
];

export const PROBLEM_CATEGORIES = [
  'All',
  'Windows',
  'Network',
  'Printer',
  'Performance',
  'Hardware',
  'Storage',
  'Drivers',
  'Boot',
  'Office/Outlook',
  'RDP/Remote',
  'Security',
  'Updates',
  'User Accounts'
] as const;
