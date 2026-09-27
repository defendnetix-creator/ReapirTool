/**
 * Predefined Safe Operations Registry
 * Akshigo PC Toolkit Pro v8.0.0-rc.1
 * Phase 8.2: Operation Allowlist & Dispatcher
 */

import { OperationDefinition } from './types.js';

export const OPERATION_DEFINITIONS: Record<string, OperationDefinition> = {
  // --- WINDOWS REPAIR ---
  'repair.sfc.scannow': {
    id: 'repair.sfc.scannow',
    category: 'Windows Repair',
    name: 'SFC /scannow Integrity Scan',
    description: 'Scans all protected Windows system files and repairs corrupted or modified manifests.',
    requiresAdmin: true,
    estimatedDuration: '3-8 mins',
    risk: 'safe',
    isLongRunning: true
  },
  'repair.sfc.verifyonly': {
    id: 'repair.sfc.verifyonly',
    category: 'Windows Repair',
    name: 'SFC /verifyonly Audit',
    description: 'Scans protected system files for corruption without making alterations.',
    requiresAdmin: true,
    estimatedDuration: '2-5 mins',
    risk: 'safe',
    isLongRunning: true
  },
  'repair.sfc.scanfile': {
    id: 'repair.sfc.scanfile',
    category: 'Windows Repair',
    name: 'SFC Target File Scan',
    description: 'Validates and repairs a single specified system file.',
    requiresAdmin: true,
    estimatedDuration: '10-30 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'repair.dism.checkhealth': {
    id: 'repair.dism.checkhealth',
    category: 'Windows Repair',
    name: 'DISM CheckHealth',
    description: 'Checks whether the component store corruption flag has been set.',
    requiresAdmin: true,
    estimatedDuration: '15 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'repair.dism.scanhealth': {
    id: 'repair.dism.scanhealth',
    category: 'Windows Repair',
    name: 'DISM ScanHealth',
    description: 'Scans the component store for corruption without attempting repairs.',
    requiresAdmin: true,
    estimatedDuration: '2-5 mins',
    risk: 'safe',
    isLongRunning: true
  },
  'repair.dism.restorehealth': {
    id: 'repair.dism.restorehealth',
    category: 'Windows Repair',
    name: 'DISM RestoreHealth',
    description: 'Repairs the Windows Component Store using Windows Update cloud payload sources.',
    requiresAdmin: true,
    estimatedDuration: '5-12 mins',
    risk: 'safe',
    isLongRunning: true
  },
  'repair.dism.source_wim': {
    id: 'repair.dism.source_wim',
    category: 'Windows Repair',
    name: 'DISM Repair from WIM/ISO Source',
    description: 'Repairs component store using an offline WIM/ESD source without cloud dependency.',
    requiresAdmin: true,
    estimatedDuration: '5-10 mins',
    risk: 'moderate',
    isLongRunning: true
  },
  'repair.dism.clean_store': {
    id: 'repair.dism.clean_store',
    category: 'Windows Repair',
    name: 'Component Store Cleanup',
    description: 'Cleans superseded component packages using StartComponentCleanup.',
    requiresAdmin: true,
    estimatedDuration: '3-6 mins',
    risk: 'safe',
    isLongRunning: true
  },
  'repair.sfc_dism.full': {
    id: 'repair.sfc_dism.full',
    category: 'Windows Repair',
    name: 'Full SFC + DISM Autonomous Pipeline',
    description: 'Runs SFC /scannow then DISM RestoreHealth, matching the original Full SFC + DISM action.',
    requiresAdmin: true,
    estimatedDuration: '8-18 mins',
    risk: 'safe',
    isLongRunning: true
  },
  'repair.cbs_log.view': {
    id: 'repair.cbs_log.view',
    category: 'Windows Repair',
    name: 'CBS Servicing Log Viewer',
    description: 'Reads the last 200 lines of %windir%\\Logs\\CBS\\CBS.log. The excerpt is not a complete servicing history.',
    requiresAdmin: false,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'repair.wu.reset_services': {
    id: 'repair.wu.reset_services',
    category: 'Windows Repair',
    name: 'Reset Windows Update Services',
    description: 'Stops wuauserv, cryptSvc, bits, and msiserver, then starts bits, cryptSvc, wuauserv, and msiserver. Preserves startup policies; attempts recovery on failure.',
    requiresAdmin: true,
    estimatedDuration: '1-4 mins',
    risk: 'moderate',
    isLongRunning: false
  },
  'repair.wu.softwaredist_reset': {
    id: 'repair.wu.softwaredist_reset',
    category: 'Windows Repair',
    name: 'Reset SoftwareDistribution Cache',
    description: 'Stops update/cache services, renames SoftwareDistribution to a unique retained backup, and restores prior service states. Windows recreates its cache when needed.',
    requiresAdmin: true,
    estimatedDuration: '1 min',
    risk: 'moderate',
    isLongRunning: false
  },
  'repair.wu.catroot2_reset': {
    id: 'repair.wu.catroot2_reset',
    category: 'Windows Repair',
    name: 'Rebuild Catroot2 Signature Store',
    description: 'Stops Cryptographic Services, renames Catroot2 to a unique retained backup, and restores its prior state. Does not delete signature backups.',
    requiresAdmin: true,
    estimatedDuration: '45 secs',
    risk: 'moderate',
    isLongRunning: false
  },
  'repair.wu.diagnostics': {
    id: 'repair.wu.diagnostics',
    category: 'Windows Repair',
    name: 'Windows Update Diagnostics',
    description: 'Audits update policies, WSUS endpoints, and BITS queues for download blocks.',
    requiresAdmin: true,
    estimatedDuration: '20 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'repair.wu.status': {
    id: 'repair.wu.status',
    category: 'Windows Repair',
    name: 'Windows Update Service Status',
    description: 'Reports current status of update daemons and pending installation packages.',
    requiresAdmin: false,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'repair.explorer.restart': {
    id: 'repair.explorer.restart',
    category: 'Windows Repair',
    name: 'Restart Windows Explorer',
    description: 'Gracefully restarts explorer.exe to resolve taskbar and desktop shell freezing.',
    requiresAdmin: false,
    estimatedDuration: '10 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'repair.startmenu.troubleshoot': {
    id: 'repair.startmenu.troubleshoot',
    category: 'Windows Repair',
    name: 'Start Menu & Shell Repair',
    description: 'Terminates hung ShellExperienceHost and resets corrupted tile layout database.',
    requiresAdmin: true,
    estimatedDuration: '20 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'repair.store.wsreset': {
    id: 'repair.store.wsreset',
    category: 'Windows Repair',
    name: 'Microsoft Store Cache Purge (wsreset)',
    description: 'Purges Microsoft Store app cache to resolve download and launch failures.',
    requiresAdmin: true,
    estimatedDuration: '30 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'repair.store.reregister': {
    id: 'repair.store.reregister',
    category: 'Windows Repair',
    name: 'Re-register Windows Store & AppX',
    description: 'Re-registers Store application packages via modern PowerShell AppX cmdlets.',
    requiresAdmin: true,
    estimatedDuration: '1 min',
    risk: 'safe',
    isLongRunning: true
  },
  'repair.msi.repair': {
    id: 'repair.msi.repair',
    category: 'Windows Repair',
    name: 'Windows Installer (msiexec) Repair',
    description: 'Unregisters and re-registers the msiexec.exe core engine.',
    requiresAdmin: true,
    estimatedDuration: '15 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'repair.service.spooler_wuauserv': {
    id: 'repair.service.spooler_wuauserv',
    category: 'Windows Repair',
    name: 'Essential Service Dependency Repair',
    description: 'Audits and repairs RPC, DcomLaunch, and core Windows service controller keys.',
    requiresAdmin: true,
    estimatedDuration: '20 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'repair.time.sync': {
    id: 'repair.time.sync',
    category: 'Windows Repair',
    name: 'Time Synchronization Force Resync',
    description: 'Resynchronizes system clock against official time.windows.com NTP servers.',
    requiresAdmin: true,
    estimatedDuration: '15 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'repair.recovery.create_restore_point': {
    id: 'repair.recovery.create_restore_point',
    category: 'Windows Repair',
    name: 'Create System Restore Point',
    description: 'Creates an immediate Volume Shadow Copy checkpoint prior to performing modifications.',
    requiresAdmin: true,
    estimatedDuration: '30 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'repair.recovery.list_restore_points': {
    id: 'repair.recovery.list_restore_points',
    category: 'Windows Repair',
    name: 'List System Restore Points',
    description: 'Enumerates existing Windows restore points from VSS.',
    requiresAdmin: false,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'repair.recovery.open_options': {
    id: 'repair.recovery.open_options',
    category: 'Windows Repair',
    name: 'Open Recovery & Reset Options',
    description: 'Launches native Windows System Protection and recovery navigation.',
    requiresAdmin: false,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },

  // --- NETWORK ---
  'network.dns.flush': {
    id: 'network.dns.flush',
    category: 'Network',
    name: 'Flush DNS Resolver Cache',
    description: 'Clears the local DNS resolver cache using ipconfig /flushdns.',
    requiresAdmin: true,
    estimatedDuration: '10 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'network.ip.renew': {
    id: 'network.ip.renew',
    category: 'Network',
    name: 'Renew IP Address Lease',
    description: 'Requests a new IPv4 DHCP lease from the local router/gateway.',
    requiresAdmin: true,
    estimatedDuration: '15 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'network.ip.release': {
    id: 'network.ip.release',
    category: 'Network',
    name: 'Release IP Address',
    description: 'Releases the active DHCP lease on all network interfaces.',
    requiresAdmin: true,
    estimatedDuration: '10 secs',
    risk: 'moderate',
    isLongRunning: false
  },
  'network.winsock.reset': {
    id: 'network.winsock.reset',
    category: 'Network',
    name: 'Reset Winsock Catalog',
    description: 'Resets the Windows socket catalog to clean factory default state.',
    requiresAdmin: true,
    estimatedDuration: '20 secs',
    risk: 'moderate',
    isLongRunning: false
  },
  'network.tcpip.reset': {
    id: 'network.tcpip.reset',
    category: 'Network',
    name: 'Reset TCP/IP Stack',
    description: 'Rewrites TCP/IP protocol stack registry configuration.',
    requiresAdmin: true,
    estimatedDuration: '20 secs',
    risk: 'moderate',
    isLongRunning: false
  },
  'network.adapters.restart': {
    id: 'network.adapters.restart',
    category: 'Network',
    name: 'Restart Network Adapter',
    description: 'Disables and re-enables the active network interface.',
    requiresAdmin: true,
    estimatedDuration: '15 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'network.proxy.status': {
    id: 'network.proxy.status',
    category: 'Network',
    name: 'Proxy Configuration Status',
    description: 'Queries WinHTTP system proxy configuration. WinINet proxy inspection is not implemented.',
    requiresAdmin: false,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'network.proxy.reset': {
    id: 'network.proxy.reset',
    category: 'Network',
    name: 'Reset Proxy to Direct Access',
    description: 'Removes proxy redirections and restores direct internet connectivity.',
    requiresAdmin: true,
    estimatedDuration: '10 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'network.connectivity.test': {
    id: 'network.connectivity.test',
    category: 'Network',
    name: 'Comprehensive Connectivity Test',
    description: 'Tests Gateway, DNS resolution, and Cloudflare/Google HTTPS endpoints.',
    requiresAdmin: false,
    estimatedDuration: '15 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'network.ping.test': {
    id: 'network.ping.test',
    category: 'Network',
    name: 'ICMP Ping Latency Test',
    description: 'Measures round-trip latency and packet loss against a target host.',
    requiresAdmin: false,
    estimatedDuration: '10 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'network.dns.lookup': {
    id: 'network.dns.lookup',
    category: 'Network',
    name: 'DNS Resolution Test',
    description: 'Performs DNS lookup and measures resolution latency.',
    requiresAdmin: false,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'network.traceroute': {
    id: 'network.traceroute',
    category: 'Network',
    name: 'Traceroute Network Route Analysis',
    description: 'Traces packet hops across local gateway, ISP, and destination.',
    requiresAdmin: false,
    estimatedDuration: '20 secs',
    risk: 'safe',
    isLongRunning: true
  },
  'network.apipa.detect': {
    id: 'network.apipa.detect',
    category: 'Network',
    name: 'APIPA Auto-Configuration Detection',
    description: 'Checks for self-assigned 169.254.x.x addresses indicating DHCP failure.',
    requiresAdmin: false,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'network.workflow.common_repair': {
    id: 'network.workflow.common_repair',
    category: 'Network',
    name: 'Automated 5-Step Network Recovery',
    description: 'Releases DHCP leases, flushes DNS, resets Winsock and TCP/IP, then renews DHCP leases. Interrupts connectivity; restart required. Stops on failure.',
    requiresAdmin: true,
    estimatedDuration: '1-2 mins',
    risk: 'moderate',
    isLongRunning: true
  },
  'network.netstat.sockets': {
    id: 'network.netstat.sockets',
    category: 'Network',
    name: 'Active Network Sockets & Netstat',
    description: 'Enumerates open TCP/UDP listening ports, connected IPs, and owning process PIDs.',
    requiresAdmin: false,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },

  // --- PRINTER / SPOOLER ---
  'printer.inventory.get': {
    id: 'printer.inventory.get',
    category: 'Printer',
    name: 'Printer Fleet Inventory',
    description: 'Enumerates local and networked printers, queue states, ports, and drivers.',
    requiresAdmin: false,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'printer.spooler.restart': {
    id: 'printer.spooler.restart',
    category: 'Printer',
    name: 'Restart Print Spooler Service',
    description: 'Stops and starts Spooler with verified service states. Queue deletion is a separate operation; running dependent services block restart.',
    requiresAdmin: true,
    estimatedDuration: '20 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'printer.spooler.stop': {
    id: 'printer.spooler.stop',
    category: 'Printer',
    name: 'Stop Print Spooler Service',
    description: 'Halts the Windows Print Spooler daemon.',
    requiresAdmin: true,
    estimatedDuration: '10 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'printer.spooler.start': {
    id: 'printer.spooler.start',
    category: 'Printer',
    name: 'Start Print Spooler Service',
    description: 'Starts the Windows Print Spooler daemon.',
    requiresAdmin: true,
    estimatedDuration: '10 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'printer.queue.purge': {
    id: 'printer.queue.purge',
    category: 'Printer',
    name: 'Purge Stuck Print Queue Jobs',
    description: 'Deletes hung print jobs from the system spool folder without restarting the service.',
    requiresAdmin: true,
    estimatedDuration: '15 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'printer.diagnostics.run': {
    id: 'printer.diagnostics.run',
    category: 'Printer',
    name: 'Printer Analyzer Pro Diagnostics',
    description: 'Audits RPC endpoints, port status (RAW 9100 / WSD), driver store, and service health.',
    requiresAdmin: false,
    estimatedDuration: '15 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'printer.offline.fix': {
    id: 'printer.offline.fix',
    category: 'Printer',
    name: 'Fix Offline Printer State',
    description: 'Queries SNMP and resets the WorkOffline status flag to force online communication.',
    requiresAdmin: true,
    estimatedDuration: '15 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'printer.sharing.diagnose': {
    id: 'printer.sharing.diagnose',
    category: 'Printer',
    name: 'Printer Sharing & SMB Audit',
    description: 'Inspects LanmanServer sharing, Point and Print restrictions, and network access.',
    requiresAdmin: true,
    estimatedDuration: '15 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'printer.rpc_smb.check': {
    id: 'printer.rpc_smb.check',
    category: 'Printer',
    name: 'Check RPC & Port 445 SMB',
    description: 'Validates RPC endpoint mapper and SMB port 445 responsiveness.',
    requiresAdmin: false,
    estimatedDuration: '10 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'printer.fix_0x0000011b': {
    id: 'printer.fix_0x0000011b',
    category: 'Printer',
    name: 'Fix 0x0000011b Network Print Error',
    description: 'Remediates RPC authentication level mismatch caused by security updates.',
    requiresAdmin: true,
    estimatedDuration: '20 secs',
    risk: 'moderate',
    isLongRunning: false
  },
  'printer.fix_0x00000709': {
    id: 'printer.fix_0x00000709',
    category: 'Printer',
    name: 'Fix 0x00000709 Default Printer Error',
    description: 'Corrects Point and Print registry pointers and default printer locks.',
    requiresAdmin: true,
    estimatedDuration: '20 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'printer.drivers.list': {
    id: 'printer.drivers.list',
    category: 'Printer',
    name: 'Enumerate Print Drivers',
    description: 'Lists all installed print drivers, versions, and signature statuses.',
    requiresAdmin: false,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'printer.subsystem.cleanup': {
    id: 'printer.subsystem.cleanup',
    category: 'Printer',
    name: 'Deep Print Subsystem Cleanup',
    description: 'Purges orphaned print job buffers and releases dead printer handles safely.',
    requiresAdmin: true,
    estimatedDuration: '30 secs',
    risk: 'moderate',
    isLongRunning: false
  },

  // --- HARDWARE DIAGNOSTICS ---
  'hardware.system.info': {
    id: 'hardware.system.info',
    category: 'Hardware',
    name: 'Hardware Interrogation & SMBIOS Topology',
    description: 'Interrogates SMBIOS, CPU cores, RAM slots, GPU adapters, and motherboard topology.',
    requiresAdmin: false,
    estimatedDuration: '10 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'hardware.devices.problematic': {
    id: 'hardware.devices.problematic',
    category: 'Hardware',
    name: 'Problem Device Detection & PnP Error Codes',
    description: 'Scans for malfunctioning devices reporting non-zero ConfigManagerErrorCode values.',
    requiresAdmin: false,
    estimatedDuration: '10 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'hardware.battery.health': {
    id: 'hardware.battery.health',
    category: 'Hardware',
    name: 'Battery Health & ACPI Telemetry',
    description: 'Interrogates design capacity, full charge capacity, degradation rate, and charge cycles.',
    requiresAdmin: false,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'hardware.battery.report': {
    id: 'hardware.battery.report',
    category: 'Hardware',
    name: 'Windows Battery Diagnostic Report (powercfg)',
    description: 'Executes native powercfg /batteryreport to generate deep HTML battery cycle telemetry.',
    requiresAdmin: false,
    estimatedDuration: '15 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'hardware.thermal.info': {
    id: 'hardware.thermal.info',
    category: 'Hardware',
    name: 'Thermal Zone & Sensor Interrogation',
    description: 'Polls ACPI and NVAPI thermal zones for processor, GPU, and motherboard temperatures.',
    requiresAdmin: false,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },

  // --- DRIVER MANAGEMENT & DRIVER AUTO CENTER ---
  'driver.list': {
    id: 'driver.list',
    category: 'Driver',
    name: 'Installed Driver Inventory & Signatures',
    description: 'Enumerates installed OEM drivers, version numbers, dates, and WHQL authenticode signatures.',
    requiresAdmin: false,
    estimatedDuration: '10 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'driver.problematic': {
    id: 'driver.problematic',
    category: 'Driver',
    name: 'Driver & PnP Hardware Problem Scan',
    description: 'Identifies devices with missing drivers, Code 10/43 states, and hardware ID conflicts.',
    requiresAdmin: false,
    estimatedDuration: '10 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'driver.backup': {
    id: 'driver.backup',
    category: 'Driver',
    name: 'Export Third-Party Driver Store',
    description: 'Exports all active third-party INF driver packages using native pnputil /export-driver.',
    requiresAdmin: true,
    estimatedDuration: '30-60 secs',
    risk: 'safe',
    isLongRunning: true
  },
  'driver.restore': {
    id: 'driver.restore',
    category: 'Driver',
    name: 'Restore Drivers from Backup Directory',
    description: 'Validates and imports driver INF packages from a trusted backup directory.',
    requiresAdmin: true,
    estimatedDuration: '30-90 secs',
    risk: 'moderate',
    isLongRunning: true
  },
  'driver.install.inf': {
    id: 'driver.install.inf',
    category: 'Driver',
    name: 'Install Driver from Validated INF File',
    description: 'Validates and installs a single INF package with digital signature verification.',
    requiresAdmin: true,
    estimatedDuration: '20 secs',
    risk: 'moderate',
    isLongRunning: false
  },
  'driver.pnputil.enum': {
    id: 'driver.pnputil.enum',
    category: 'Driver',
    name: 'PnPUtil Driver Store Enumeration',
    description: 'Runs pnputil /enum-drivers to audit published OEM INF packages.',
    requiresAdmin: false,
    estimatedDuration: '10 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'driver.wu.scan': {
    id: 'driver.wu.scan',
    category: 'Driver',
    name: 'Windows Update Driver Sync Scan',
    description: 'Triggers USOClient driver scan for certified optional OEM driver updates.',
    requiresAdmin: true,
    estimatedDuration: '20 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'driver.report': {
    id: 'driver.report',
    category: 'Driver',
    name: 'Generate Driver Manifest & Hardware IDs Report',
    description: 'Exports comprehensive device and driver inventory formatted with hardware IDs.',
    requiresAdmin: false,
    estimatedDuration: '15 secs',
    risk: 'safe',
    isLongRunning: false
  },

  // --- STORAGE & DISK MANAGEMENT ---
  'storage.disks': {
    id: 'storage.disks',
    category: 'Storage',
    name: 'Physical Disk Inventory & Bus Detection',
    description: 'Interrogates physical drives, NVMe/SATA bus types, capacities, and partition maps.',
    requiresAdmin: false,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'storage.smart': {
    id: 'storage.smart',
    category: 'Storage',
    name: 'S.M.A.R.T. Health Telemetry & Endurance',
    description: 'Reads NVMe and ATA SMART reliability registers, temperatures, and sector wear levels.',
    requiresAdmin: false,
    estimatedDuration: '10 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'storage.volumes': {
    id: 'storage.volumes',
    category: 'Storage',
    name: 'Logical Volumes & BitLocker State',
    description: 'Audits logical drives, file systems (NTFS/ReFS), free space, and BitLocker encryption.',
    requiresAdmin: false,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'storage.chkdsk.scan': {
    id: 'storage.chkdsk.scan',
    category: 'Storage',
    name: 'CHKDSK Read-Only Volume Scan',
    description: 'Executes read-only file system structure validation without dismounting or modifying the drive.',
    requiresAdmin: true,
    estimatedDuration: '30-90 secs',
    risk: 'safe',
    isLongRunning: true
  },
  'storage.chkdsk.repair': {
    id: 'storage.chkdsk.repair',
    category: 'Storage',
    name: 'Schedule CHKDSK /F /R on Next Boot',
    description: 'Prompts confirmation and schedules offline file system repair and bad sector recovery.',
    requiresAdmin: true,
    estimatedDuration: '10 secs',
    risk: 'moderate',
    isLongRunning: false
  },
  'storage.optimize.status': {
    id: 'storage.optimize.status',
    category: 'Storage',
    name: 'Drive Fragmentation & TRIM Status',
    description: 'Analyzes volume fragmentation and TRIM re-trim capability via defrag /A.',
    requiresAdmin: true,
    estimatedDuration: '15 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'storage.benchmark': {
    id: 'storage.benchmark',
    category: 'Storage',
    name: 'Safe Storage I/O Throughput Benchmark',
    description: 'Measures sequential and 4K random read/write throughput without exhausting write endurance.',
    requiresAdmin: false,
    estimatedDuration: '20 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'storage.cleanup.analyze': {
    id: 'storage.cleanup.analyze',
    category: 'Storage',
    name: 'Temporary Files & Disk Space Analysis',
    description: 'Calculates reclaimable disk space across user temp, Windows Update cache, and large files.',
    requiresAdmin: false,
    estimatedDuration: '15 secs',
    risk: 'safe',
    isLongRunning: false
  },

  // --- HARDWARE & COMPLIANCE REPORTS ---
  'reports.system_inventory.generate': {
    id: 'reports.system_inventory.generate',
    category: 'Reports',
    name: 'Generate Full System Inventory HTML Report',
    description: 'Compiles deep hardware, OS, BIOS, memory, disk, and network audit report.',
    requiresAdmin: false,
    estimatedDuration: '15 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'reports.battery.generate': {
    id: 'reports.battery.generate',
    category: 'Reports',
    name: 'Generate ACPI Battery Diagnostic Report',
    description: 'Generates detailed HTML battery report tracking capacity deterioration and cycles.',
    requiresAdmin: false,
    estimatedDuration: '15 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'reports.driver.generate': {
    id: 'reports.driver.generate',
    category: 'Reports',
    name: 'Generate Cryptographic Driver Manifest',
    description: 'Exports structured report listing all installed OEM drivers and matching hardware IDs.',
    requiresAdmin: false,
    estimatedDuration: '10 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'reports.storage.generate': {
    id: 'reports.storage.generate',
    category: 'Reports',
    name: 'Generate Storage & SMART Reliability Report',
    description: 'Generates comprehensive storage report with SMART attributes, volumes, and health scores.',
    requiresAdmin: false,
    estimatedDuration: '15 secs',
    risk: 'safe',
    isLongRunning: false
  },

  // --- PHASE 8.4: BACKUP & RESTORE ---
  'backup.restore_point.create': {
    id: 'backup.restore_point.create',
    category: 'Backup',
    name: 'Create System Restore Point',
    description: 'Creates a Volume Shadow Copy (VSS) system checkpoint with custom label.',
    requiresAdmin: true,
    estimatedDuration: '20-45 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'backup.restore_points.list': {
    id: 'backup.restore_points.list',
    category: 'Backup',
    name: 'Enumerate System Restore Points',
    description: 'Queries WMI SystemRestore class for existing snapshots and sequences.',
    requiresAdmin: false,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'backup.system_restore.launch': {
    id: 'backup.system_restore.launch',
    category: 'Backup',
    name: 'Launch Windows System Restore (rstrui.exe)',
    description: 'Opens native Windows System Restore graphical recovery wizard.',
    requiresAdmin: true,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'backup.files.create': {
    id: 'backup.files.create',
    category: 'Backup',
    name: 'Safe File & Folder Backup Archive',
    description: 'Copies and compresses user directories with validated paths and SHA-256 integrity hash.',
    requiresAdmin: false,
    estimatedDuration: '15-45 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'backup.files.restore': {
    id: 'backup.files.restore',
    category: 'Backup',
    name: 'Restore Files from Backup Archive',
    description: 'Extracts archived files with explicit user overwrite confirmation.',
    requiresAdmin: true,
    estimatedDuration: '20-60 secs',
    risk: 'moderate',
    isLongRunning: false
  },
  'backup.registry.export': {
    id: 'backup.registry.export',
    category: 'Backup',
    name: 'Export Windows Registry Hive Backup',
    description: 'Backs up HKLM or HKCU hive to validated .reg file via native reg export.',
    requiresAdmin: true,
    estimatedDuration: '10-20 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'backup.registry.restore': {
    id: 'backup.registry.restore',
    category: 'Backup',
    name: 'Restore Windows Registry Hive',
    description: 'Safely merges .reg file with explicit confirmation check.',
    requiresAdmin: true,
    estimatedDuration: '10-30 secs',
    risk: 'high',
    isLongRunning: false
  },
  'backup.recovery_options.launch': {
    id: 'backup.recovery_options.launch',
    category: 'Backup',
    name: 'Open Windows Recovery Settings',
    description: 'Launches Windows 11/10 Recovery Settings (Reset PC, Advanced Startup).',
    requiresAdmin: false,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'backup.winre.status': {
    id: 'backup.winre.status',
    category: 'Backup',
    name: 'Windows Recovery Environment (WinRE) Status',
    description: 'Queries reagentc /info for recovery partition state and BCD GUID.',
    requiresAdmin: true,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'backup.system_image.launch': {
    id: 'backup.system_image.launch',
    category: 'Backup',
    name: 'Launch Windows Backup & System Image (sdclt.exe)',
    description: 'Opens native Windows System Image backup wizard.',
    requiresAdmin: true,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'backup.vss.manage': {
    id: 'backup.vss.manage',
    category: 'Backup',
    name: 'Volume Shadow Copy (VSS) Administration',
    description: 'Audits Volume Shadow Copy service status, storage allocation, and snapshot catalog. Destructive quota resizes and purges require high elevation and explicit user confirmation.',
    requiresAdmin: true,
    estimatedDuration: '5-10 secs',
    risk: 'high',
    isLongRunning: false
  },
  'backup.history.list': {
    id: 'backup.history.list',
    category: 'Backup',
    name: 'List Backup & Snapshot History',
    description: 'Returns historical audit trail of restore points, file backups, and registry exports.',
    requiresAdmin: false,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },

  // --- PHASE 8.4: WINDOWS SERVICES & FEATURES ---
  'services.inventory.list': {
    id: 'services.inventory.list',
    category: 'Services',
    name: 'Windows Services Inventory',
    description: 'Queries Service Control Manager (SCM) for all installed services, states, and startup types.',
    requiresAdmin: false,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'services.critical.detect': {
    id: 'services.critical.detect',
    category: 'Services',
    name: 'Critical Stopped-Service Audit',
    description: 'Scans core Windows subsystem services (Update, BITS, CryptSvc, Spooler, DHCP, Audio).',
    requiresAdmin: false,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'services.start': {
    id: 'services.start',
    category: 'Services',
    name: 'Start Windows Service',
    description: 'Sends start command to stopped Windows service via SCM.',
    requiresAdmin: true,
    estimatedDuration: '5-15 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'services.stop': {
    id: 'services.stop',
    category: 'Services',
    name: 'Stop Windows Service',
    description: 'Stops non-critical Windows service with protection against stopping security services.',
    requiresAdmin: true,
    estimatedDuration: '5-15 secs',
    risk: 'moderate',
    isLongRunning: false
  },
  'services.restart': {
    id: 'services.restart',
    category: 'Services',
    name: 'Restart Windows Service',
    description: 'Sequentially stops and restarts Windows service.',
    requiresAdmin: true,
    estimatedDuration: '10-20 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'services.startup_type.set': {
    id: 'services.startup_type.set',
    category: 'Services',
    name: 'Configure Service Startup Type',
    description: 'Sets service startup type to Automatic, Manual, or Disabled.',
    requiresAdmin: true,
    estimatedDuration: '5 secs',
    risk: 'moderate',
    isLongRunning: false
  },
  'services.optional_features.dism': {
    id: 'services.optional_features.dism',
    category: 'Services',
    name: 'List Windows Optional Features (DISM)',
    description: 'Queries online Windows Optional Features list (Hyper-V, WSL, .NET runtimes).',
    requiresAdmin: true,
    estimatedDuration: '10-20 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'services.optional_features.launch': {
    id: 'services.optional_features.launch',
    category: 'Services',
    name: 'Launch Windows Features Dialog (optionalfeatures.exe)',
    description: 'Opens native Turn Windows Features On or Off management dialog.',
    requiresAdmin: true,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'services.hyperv.status': {
    id: 'services.hyperv.status',
    category: 'Services',
    name: 'Check Hyper-V Platform Status',
    description: 'Checks whether Hyper-V virtualization hypervisor is enabled.',
    requiresAdmin: false,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'services.wsl.status': {
    id: 'services.wsl.status',
    category: 'Services',
    name: 'Check Windows Subsystem for Linux (WSL) Status',
    description: 'Verifies WSL subsystem installation and Virtual Machine Platform readiness.',
    requiresAdmin: false,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'services.dotnet.status': {
    id: 'services.dotnet.status',
    category: 'Services',
    name: 'Audit .NET Framework Features',
    description: 'Checks .NET 3.5 and .NET 4.8 runtime availability.',
    requiresAdmin: false,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },

  // --- PHASE 8.4: EVENT LOG ANALYZER ---
  'logs.eventlog.query': {
    id: 'logs.eventlog.query',
    category: 'Event Logs',
    name: 'Query Windows Event Log Channel',
    description: 'Queries Application, System, Security, or Setup event log channels with filtering.',
    requiresAdmin: false,
    estimatedDuration: '10 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'logs.eventlog.issues': {
    id: 'logs.eventlog.issues',
    category: 'Event Logs',
    name: 'Correlate System & App Event Anomalies',
    description: 'Correlates app crashes (1000), power cuts (41), disk blocks (7), and service failures (7000).',
    requiresAdmin: false,
    estimatedDuration: '10 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'logs.eventlog.export': {
    id: 'logs.eventlog.export',
    category: 'Event Logs',
    name: 'Export Event Log Records',
    description: 'Exports filtered event logs to CSV, JSON, or TXT forensic archive.',
    requiresAdmin: false,
    estimatedDuration: '10 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'logs.eventviewer.launch': {
    id: 'logs.eventviewer.launch',
    category: 'Event Logs',
    name: 'Launch Windows Event Viewer (eventvwr.msc)',
    description: 'Opens native Windows Event Viewer MMC console.',
    requiresAdmin: true,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'reports.event_log.generate': {
    id: 'reports.event_log.generate',
    category: 'Event Logs',
    name: 'Generate Event Log Forensic HTML Report',
    description: 'Compiles formatted diagnostic report of critical events, errors, and system warnings.',
    requiresAdmin: false,
    estimatedDuration: '15 secs',
    risk: 'safe',
    isLongRunning: false
  },

  // --- PHASE 8.4: SYSTEM & ADMINISTRATION ---
  'sys.process.list': {
    id: 'sys.process.list',
    category: 'System',
    name: 'Enumerate Active Process Trees',
    description: 'Interrogates active processes, PIDs, CPU utilization, working set memory, and paths.',
    requiresAdmin: false,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'sys.process.terminate': {
    id: 'sys.process.terminate',
    category: 'System',
    name: 'Terminate Process Tree',
    description: 'Terminates specified process with confirmation and protection for system kernel PIDs.',
    requiresAdmin: true,
    estimatedDuration: '5 secs',
    risk: 'moderate',
    isLongRunning: false
  },
  'sys.startup.list': {
    id: 'sys.startup.list',
    category: 'System',
    name: 'Enumerate Windows Startup Applications',
    description: 'Discovers startup applications across HKCU/HKLM Run keys and Startup folder.',
    requiresAdmin: false,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'sys.startup.toggle': {
    id: 'sys.startup.toggle',
    category: 'System',
    name: 'Toggle Startup Application State',
    description: 'Safely enables or disables startup entries.',
    requiresAdmin: true,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'sys.tasks.list': {
    id: 'sys.tasks.list',
    category: 'System',
    name: 'Enumerate Windows Scheduled Tasks',
    description: 'Audits scheduled tasks, next run times, last exit codes, and triggers.',
    requiresAdmin: false,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'sys.admin.env_vars': {
    id: 'sys.admin.env_vars',
    category: 'System',
    name: 'Audit System & User Environment Variables',
    description: 'Reads PATH, system variables, and user environment configuration blocks.',
    requiresAdmin: false,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'sys.admin.sysdm_cpl': {
    id: 'sys.admin.sysdm_cpl',
    category: 'System',
    name: 'Launch Windows Environment Variables Editor (sysdm.cpl)',
    description: 'Launches native System Properties Environment Variables graphical dialog.',
    requiresAdmin: false,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'sys.admin.msinfo32': {
    id: 'sys.admin.msinfo32',
    category: 'System',
    name: 'Launch System Information (msinfo32.exe)',
    description: 'Opens native Microsoft System Information tool.',
    requiresAdmin: false,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'sys.admin.compmgmt': {
    id: 'sys.admin.compmgmt',
    category: 'System',
    name: 'Launch Computer Management MMC (compmgmt.msc)',
    description: 'Opens native Computer Management console.',
    requiresAdmin: true,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'sys.admin.taskmgr': {
    id: 'sys.admin.taskmgr',
    category: 'System',
    name: 'Launch Windows Task Manager (taskmgr.exe)',
    description: 'Opens native Windows Task Manager.',
    requiresAdmin: false,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'sys.admin.services_msc': {
    id: 'sys.admin.services_msc',
    category: 'System',
    name: 'Launch Services MMC Console (services.msc)',
    description: 'Opens native Services management console.',
    requiresAdmin: true,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'sys.admin.msconfig.launch': {
    id: 'sys.admin.msconfig.launch',
    category: 'System',
    name: 'Launch System Configuration (msconfig.exe)',
    description: 'Opens native Windows System Configuration utility.',
    requiresAdmin: true,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'sys.admin.regedit': {
    id: 'sys.admin.regedit',
    category: 'System',
    name: 'Launch Windows Registry Editor (regedit.exe)',
    description: 'Opens native Windows Registry Editor.',
    requiresAdmin: true,
    estimatedDuration: '5 secs',
    risk: 'moderate',
    isLongRunning: false
  },
  'sys.admin.sched_tasks': {
    id: 'sys.admin.sched_tasks',
    category: 'System',
    name: 'Launch Task Scheduler Console (taskschd.msc)',
    description: 'Opens native Windows Task Scheduler MMC.',
    requiresAdmin: true,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'sys.admin.godmode': {
    id: 'sys.admin.godmode',
    category: 'System',
    name: 'Create Windows GodMode Master Shortcut',
    description: 'Generates GodMode folder namespace shortcut to all Control Panel applets.',
    requiresAdmin: true,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },

  // --- PHASE 8.4: USER / ACCOUNT MANAGEMENT ---
  'user.accounts.list': {
    id: 'user.accounts.list',
    category: 'Accounts',
    name: 'Enumerate Local Users & Groups',
    description: 'Lists local user accounts, administrative rights, SIDs, and security groups.',
    requiresAdmin: true,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'user.admin_account.enable': {
    id: 'user.admin_account.enable',
    category: 'Accounts',
    name: 'Toggle Built-In Administrator Account',
    description: 'Enables or disables built-in Administrator account with explicit confirmation.',
    requiresAdmin: true,
    estimatedDuration: '5 secs',
    risk: 'high',
    isLongRunning: false
  },
  'user.account_settings.launch': {
    id: 'user.account_settings.launch',
    category: 'Accounts',
    name: 'Launch Windows Account Settings',
    description: 'Opens ms-settings:yourinfo Account Settings page.',
    requiresAdmin: false,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'user.netplwiz.launch': {
    id: 'user.netplwiz.launch',
    category: 'Accounts',
    name: 'Launch Advanced User Accounts (netplwiz)',
    description: 'Opens native User Accounts CPL (control userpasswords2).',
    requiresAdmin: true,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'user.lusrmgr.console': {
    id: 'user.lusrmgr.console',
    category: 'Accounts',
    name: 'Launch Local Users and Groups MMC (lusrmgr.msc)',
    description: 'Opens native lusrmgr.msc console.',
    requiresAdmin: true,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },

  // --- PHASE 8.4: REGISTRY / GROUP POLICY ---
  'policy.gpupdate.force': {
    id: 'policy.gpupdate.force',
    category: 'Policy',
    name: 'Force Local Group Policy Refresh (gpupdate /force)',
    description: 'Forces background refresh of computer and user policy settings.',
    requiresAdmin: true,
    estimatedDuration: '10-25 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'policy.gpresult.run': {
    id: 'policy.gpresult.run',
    category: 'Policy',
    name: 'Run Group Policy Results Diagnostic (gpresult /r)',
    description: 'Interrogates applied GPOs and resultant set of policy (RSOP).',
    requiresAdmin: true,
    estimatedDuration: '10-20 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'policy.gpedit.launch': {
    id: 'policy.gpedit.launch',
    category: 'Policy',
    name: 'Launch Group Policy Editor (gpedit.msc)',
    description: 'Opens native Local Group Policy Editor MMC console.',
    requiresAdmin: true,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'policy.report.generate': {
    id: 'policy.report.generate',
    category: 'Policy',
    name: 'Generate Group Policy Audit HTML Report',
    description: 'Compiles comprehensive HTML report of applied policies, GPOs, and security baselines.',
    requiresAdmin: true,
    estimatedDuration: '15 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'policy.secpol.launch': {
    id: 'policy.secpol.launch',
    category: 'Policy',
    name: 'Launch Local Security Policy (secpol.msc)',
    description: 'Opens native Windows Local Security Policy management console.',
    requiresAdmin: true,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'policy.wu.diagnose': {
    id: 'policy.wu.diagnose',
    category: 'Policy',
    name: 'Audit Windows Update Policy Configuration',
    description: 'Evaluates Windows Update GPO and registry configurations including AUOptions and WSUS server.',
    requiresAdmin: true,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },

  // --- PHASE 8.5: OFFICE / OUTLOOK ---
  'office.outlook.safemode': {
    id: 'office.outlook.safemode',
    category: 'Office',
    name: 'Launch Microsoft Outlook in Safe Mode',
    description: 'Launches Outlook with all add-ins, customizations, and reading pane extensions disabled (outlook.exe /safe).',
    requiresAdmin: false,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'office.outlook.profiles': {
    id: 'office.outlook.profiles',
    category: 'Office',
    name: 'Open Outlook Mail Profiles Manager',
    description: 'Launches the native Outlook profile configuration control panel (outlook.exe /profiles or mlcfg32.cpl).',
    requiresAdmin: false,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'office.outlook.resetnavpane': {
    id: 'office.outlook.resetnavpane',
    category: 'Office',
    name: 'Reset Outlook Navigation Pane',
    description: 'Clears and regenerates the navigation pane for the current profile (outlook.exe /resetnavpane).',
    requiresAdmin: false,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'office.outlook.scanpst': {
    id: 'office.outlook.scanpst',
    category: 'Office',
    name: 'Launch Microsoft Inbox Repair Tool (SCANPST)',
    description: 'Opens SCANPST.EXE to diagnose and repair damaged Outlook Personal Folders (.pst) and offline files (.ost).',
    requiresAdmin: false,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'office.repair.quick': {
    id: 'office.repair.quick',
    category: 'Office',
    name: 'Run Microsoft Office Quick Repair',
    description: 'Fixes corrupted application manifests and file associations without requiring internet connectivity.',
    requiresAdmin: true,
    estimatedDuration: '2-5 mins',
    risk: 'safe',
    isLongRunning: true
  },
  'office.repair.online': {
    id: 'office.repair.online',
    category: 'Office',
    name: 'Run Microsoft Office Online Repair',
    description: 'Full reinstall and repair of Microsoft 365 Click-to-Run installation via Microsoft CDN.',
    requiresAdmin: true,
    estimatedDuration: '5-12 mins',
    risk: 'safe',
    isLongRunning: true
  },
  'office.onedrive.reset': {
    id: 'office.onedrive.reset',
    category: 'Office',
    name: 'Reset Microsoft OneDrive Client',
    description: 'Clears and restarts the OneDrive synchronization engine and internal cache without deleting files.',
    requiresAdmin: false,
    estimatedDuration: '10-20 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'office.teams.cleancache': {
    id: 'office.teams.cleancache',
    category: 'Office',
    name: 'Clean Microsoft Teams Cache',
    description: 'Safely purges IndexedDB and temporary cache files for Microsoft Teams while preserving saved credentials.',
    requiresAdmin: false,
    estimatedDuration: '10 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'office.zoom.cleancache': {
    id: 'office.zoom.cleancache',
    category: 'Office',
    name: 'Clean Zoom Meeting Cache',
    description: 'Safely removes cached meeting logs, temporary meeting thumbnails, and diagnostic dumps.',
    requiresAdmin: false,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },

  // --- PHASE 8.5: REMOTE ACCESS & NETWORKING ---
  'remote.rdp.settings': {
    id: 'remote.rdp.settings',
    category: 'Remote Access',
    name: 'Open Remote Desktop System Settings',
    description: 'Opens the native Windows Remote Desktop configuration settings panel (ms-settings:remotedesktop).',
    requiresAdmin: false,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'remote.rdp.toggle': {
    id: 'remote.rdp.toggle',
    category: 'Remote Access',
    name: 'Configure Remote Desktop Protocol (fDenyTSConnections)',
    description: 'Enables or disables Remote Desktop host access via Terminal Server registry with administrative confirmation.',
    requiresAdmin: true,
    estimatedDuration: '10 secs',
    risk: 'moderate',
    isLongRunning: false
  },
  'remote.rdp.restart_service': {
    id: 'remote.rdp.restart_service',
    category: 'Remote Access',
    name: 'Restart Remote Desktop Service (TermService)',
    description: 'Restarts the Remote Desktop Service and its dependencies with NLA safety validation.',
    requiresAdmin: true,
    estimatedDuration: '10-20 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'remote.firewall.rdp_audit': {
    id: 'remote.firewall.rdp_audit',
    category: 'Remote Access',
    name: 'Audit Remote Desktop Firewall Inbound Rules',
    description: 'Inspects Windows Defender Firewall rules for TCP/UDP port 3389 without modifying rules.',
    requiresAdmin: true,
    estimatedDuration: '5-10 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'remote.nas.test': {
    id: 'remote.nas.test',
    category: 'Remote Access',
    name: 'Test NAS / Network Share Connectivity',
    description: 'Verifies SMB port 445 handshake, NetBIOS port 139, and latency to target storage server.',
    requiresAdmin: false,
    estimatedDuration: '5-10 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'remote.shares.audit': {
    id: 'remote.shares.audit',
    category: 'Remote Access',
    name: 'Audit Local SMB Shares & Sessions',
    description: 'Enumerates active SMB shares and open sessions on the local system.',
    requiresAdmin: true,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },

  // --- PHASE 8.5: BIOS, UEFI & BOOT ---
  'boot.recovery.launch': {
    id: 'boot.recovery.launch',
    category: 'Boot / BIOS',
    name: 'Open Windows Recovery Settings',
    description: 'Opens Windows Settings Recovery panel (ms-settings:recovery).',
    requiresAdmin: false,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'boot.advanced.startup': {
    id: 'boot.advanced.startup',
    category: 'Boot / BIOS',
    name: 'Reboot to Windows Advanced Startup (WinRE)',
    description: 'Executes clean restart directly into the Windows Recovery Environment. Requires administrator confirmation.',
    requiresAdmin: true,
    estimatedDuration: '10 secs',
    risk: 'high',
    isLongRunning: false
  },
  'boot.bcd.backup': {
    id: 'boot.bcd.backup',
    category: 'Boot / BIOS',
    name: 'Backup Boot Configuration Data (BCD)',
    description: 'Exports the current BCD system store to an archive file via bcdedit /export.',
    requiresAdmin: true,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'boot.bootrec.scan': {
    id: 'boot.bootrec.scan',
    category: 'Boot / BIOS',
    name: 'Scan Disks for Windows Installations (bootrec /scanos)',
    description: 'Scans all connected disk volumes for Windows installations compatible with the BCD store.',
    requiresAdmin: true,
    estimatedDuration: '10-20 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'boot.bootrec.rebuild': {
    id: 'boot.bootrec.rebuild',
    category: 'Boot / BIOS',
    name: 'Rebuild Boot Configuration Data (BCD)',
    description: 'Auto-creates pre-repair snapshot and invokes bootrec /rebuildbcd. Requires explicit administrator confirmation.',
    requiresAdmin: true,
    estimatedDuration: '15-30 secs',
    risk: 'high',
    isLongRunning: false
  },
  'boot.reagentc.enable': {
    id: 'boot.reagentc.enable',
    category: 'Boot / BIOS',
    name: 'Enable Windows Recovery Environment (reagentc /enable)',
    description: 'Validates and enables the local Windows Recovery Environment (WinRE) partition image.',
    requiresAdmin: true,
    estimatedDuration: '10 secs',
    risk: 'safe',
    isLongRunning: false
  },

  // --- PHASE 8.6: SOFTWARE, PORTABLE TOOLS & DEPLOYMENT ---
  'software.install': {
    id: 'software.install',
    category: 'Software',
    name: 'WinGet Application Install',
    description: 'Installs an approved software application silently using the Windows Package Manager (WinGet).',
    requiresAdmin: true,
    estimatedDuration: '1-3 mins',
    risk: 'safe',
    isLongRunning: true
  },
  'software.upgrade': {
    id: 'software.upgrade',
    category: 'Software',
    name: 'WinGet Application Upgrade',
    description: 'Upgrades an installed application to its latest verified release via WinGet.',
    requiresAdmin: true,
    estimatedDuration: '1-3 mins',
    risk: 'safe',
    isLongRunning: true
  },
  'software.upgrade.all': {
    id: 'software.upgrade.all',
    category: 'Software',
    name: 'WinGet Upgrade All Available Apps',
    description: 'Scans and batch-upgrades all outdated installed packages via WinGet.',
    requiresAdmin: true,
    estimatedDuration: '3-8 mins',
    risk: 'safe',
    isLongRunning: true
  },
  'software.uninstall': {
    id: 'software.uninstall',
    category: 'Software',
    name: 'WinGet Application Uninstall',
    description: 'Uninstalls an application safely with mandatory administrative confirmation.',
    requiresAdmin: true,
    estimatedDuration: '1-2 mins',
    risk: 'moderate',
    isLongRunning: true
  },
  'software.bundle.install': {
    id: 'software.bundle.install',
    category: 'Software',
    name: '100 Apps 1-Click Multi-App Batch Installer',
    description: 'Batch-installs selected applications or predefined bundles with per-app status tracking.',
    requiresAdmin: true,
    estimatedDuration: '3-10 mins',
    risk: 'safe',
    isLongRunning: true
  },
  'software.bundle.custom.save': {
    id: 'software.bundle.custom.save',
    category: 'Software',
    name: 'Save Custom Software Bundle',
    description: 'Persists user-curated application bundle with strict package ID validation.',
    requiresAdmin: false,
    estimatedDuration: '2 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'portable.launch': {
    id: 'portable.launch',
    category: 'Portable Tools',
    name: 'Launch Approved Portable Tool',
    description: 'Resolves and executes an approved, digitally signed standalone utility from the catalog.',
    requiresAdmin: true,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'deployment.runtime.install': {
    id: 'deployment.runtime.install',
    category: 'Deployment',
    name: 'Install Windows Desktop Runtime',
    description: 'Deploys official Microsoft .NET 8 Desktop Runtime or Visual C++ Redistributable.',
    requiresAdmin: true,
    estimatedDuration: '1-2 mins',
    risk: 'safe',
    isLongRunning: true
  },
  'deployment.store.repair': {
    id: 'deployment.store.repair',
    category: 'Deployment',
    name: 'Microsoft Store Cache Reset (wsreset)',
    description: 'Executes wsreset.exe and re-registers the Microsoft Store application package.',
    requiresAdmin: true,
    estimatedDuration: '30-45 secs',
    risk: 'safe',
    isLongRunning: true
  },
  'deployment.winget.health': {
    id: 'deployment.winget.health',
    category: 'Deployment',
    name: 'WinGet Health & Source Repository Audit',
    description: 'Interrogates WinGet package manager sources, agreements, and integrity status.',
    requiresAdmin: false,
    estimatedDuration: '10 secs',
    risk: 'safe',
    isLongRunning: false
  },

  // --- PHASE 8.7: ONE-CLICK SUPER REPAIR & AUTO-FIX ENGINE ---
  'repair.super.full_pipeline': {
    id: 'repair.super.full_pipeline',
    category: 'Windows Repair',
    name: 'One-Click Super Repair Autonomous Pipeline',
    description: 'Executes comprehensive 7-stage automated repair: Pre-flight snapshot, Windows integrity, Network stack, Update daemons, Modern runtime, Print subsystem, and Health audit.',
    requiresAdmin: true,
    estimatedDuration: '6-12 mins',
    risk: 'safe',
    isLongRunning: true
  },
  'repair.autofix.plan_execute': {
    id: 'repair.autofix.plan_execute',
    category: 'Windows Repair',
    name: 'Safe Auto-Fix Plan Execution',
    description: 'Safely executes approved multi-step diagnostic triage and remediation plan with restore point checkpointing.',
    requiresAdmin: true,
    estimatedDuration: '2-5 mins',
    risk: 'safe',
    isLongRunning: true
  },
  'system.selfheal.run': {
    id: 'system.selfheal.run',
    category: 'System',
    name: 'SelfHeal & Watchdog Health Diagnostic',
    description: 'Interrogates toolkit core services, loopback authentication state, WebView2 host, and operation allowlists.',
    requiresAdmin: false,
    estimatedDuration: '10 secs',
    risk: 'safe',
    isLongRunning: false
  },

  // --- PHASE 8.8: PERFORMANCE & POWER ---
  'perf.analysis.run': {
    id: 'perf.analysis.run',
    category: 'Performance',
    name: 'Comprehensive System Performance Analysis',
    description: 'Audits CPU thread topology, memory working set, physical disk queue depth, and boot event performance.',
    requiresAdmin: false,
    estimatedDuration: '10 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'perf.optimizer.execute': {
    id: 'perf.optimizer.execute',
    category: 'Performance',
    name: 'Safe Performance Optimizer Execution',
    description: 'Executes confirmed multi-stage optimizations: temporary file purge, Storage Sense activation, and power scheme tuning.',
    requiresAdmin: true,
    estimatedDuration: '30-60 secs',
    risk: 'safe',
    isLongRunning: true
  },
  'perf.temp.analyze': {
    id: 'perf.temp.analyze',
    category: 'Performance',
    name: 'Temporary Files Size & Clutter Analysis',
    description: 'Calculates reclaimable disk space across system temp, user temp, explorer thumbnail database, and Delivery Optimization.',
    requiresAdmin: false,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'perf.temp.clean': {
    id: 'perf.temp.clean',
    category: 'Performance',
    name: 'Purge Temporary Files & Cache Stores',
    description: 'Safely removes unlocked temporary files, installer scratchpads, and superseded update payload stores with confirmation.',
    requiresAdmin: true,
    estimatedDuration: '15-45 secs',
    risk: 'safe',
    isLongRunning: true
  },
  'perf.power.info': {
    id: 'perf.power.info',
    category: 'Performance',
    name: 'Query Active Power Scheme & Supported Sleep States',
    description: 'Interrogates active power scheme GUID, standby S0/S3 states, and hibernate configurations via powercfg.',
    requiresAdmin: false,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'perf.power.switch': {
    id: 'perf.power.switch',
    category: 'Performance',
    name: 'Switch Active Windows Power Scheme',
    description: 'Switches system power profile (Balanced, High Performance, Power Saver, Ultimate Performance) safely.',
    requiresAdmin: true,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'perf.power.energy_report': {
    id: 'perf.power.energy_report',
    category: 'Performance',
    name: 'Generate 60-Second Energy Efficiency Diagnostic Report',
    description: 'Runs powercfg /energy to audit background timer resolution, USB selective suspend, and device sleep efficiency.',
    requiresAdmin: true,
    estimatedDuration: '60 secs',
    risk: 'safe',
    isLongRunning: true
  },
  'perf.boot.report': {
    id: 'perf.boot.report',
    category: 'Performance',
    name: 'Generate Boot Performance & Degradation Report',
    description: 'Inspects Event 100 diagnostics to break down BIOS post, kernel initialization, and high-impact startup apps.',
    requiresAdmin: true,
    estimatedDuration: '15 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'perf.storage_sense.status': {
    id: 'perf.storage_sense.status',
    category: 'Performance',
    name: 'Query Windows Storage Sense State',
    description: 'Queries automated disk storage cleanup policy and cadence configuration.',
    requiresAdmin: false,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'perf.storage_sense.toggle': {
    id: 'perf.storage_sense.toggle',
    category: 'Performance',
    name: 'Configure Windows Storage Sense',
    description: 'Enables or disables automated Windows Storage Sense disk cleanup policy.',
    requiresAdmin: true,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'perf.visual_settings.launch': {
    id: 'perf.visual_settings.launch',
    category: 'Performance',
    name: 'Open Windows Visual Effects & Performance Options',
    description: 'Launches native Windows SystemPropertiesPerformance.exe graphical console.',
    requiresAdmin: false,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'perf.disk_cleanup.launch': {
    id: 'perf.disk_cleanup.launch',
    category: 'Performance',
    name: 'Launch Windows Disk Cleanup (cleanmgr.exe)',
    description: 'Opens native Windows Disk Cleanup utility.',
    requiresAdmin: true,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'perf.drive.trim': {
    id: 'perf.drive.trim',
    category: 'Performance',
    name: 'Solid State Drive Retrim & Optimization',
    description: 'Sends ATA/NVMe TRIM hints to solid state controller on volume C: via defrag /L.',
    requiresAdmin: true,
    estimatedDuration: '10 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'perf.indexing.status': {
    id: 'perf.indexing.status',
    category: 'Performance',
    name: 'Windows Search Indexing Diagnostics',
    description: 'Interrogates Windows Search catalog count, pending items, and indexing backoff status.',
    requiresAdmin: false,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },

  // --- PHASE 8.8: QUICK UTILITIES LAUNCHERS ---
  'sys.admin.devmgmt': {
    id: 'sys.admin.devmgmt',
    category: 'System',
    name: 'Launch Device Manager (devmgmt.msc)',
    description: 'Opens native Device Manager management console.',
    requiresAdmin: false,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'sys.admin.diskmgmt': {
    id: 'sys.admin.diskmgmt',
    category: 'System',
    name: 'Launch Disk Management (diskmgmt.msc)',
    description: 'Opens native Disk Management management console.',
    requiresAdmin: true,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'sys.admin.eventvwr': {
    id: 'sys.admin.eventvwr',
    category: 'System',
    name: 'Launch Event Viewer (eventvwr.msc)',
    description: 'Opens native Windows Event Viewer MMC console.',
    requiresAdmin: false,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'sys.admin.control': {
    id: 'sys.admin.control',
    category: 'System',
    name: 'Launch Classic Control Panel (control.exe)',
    description: 'Opens native legacy Windows Control Panel.',
    requiresAdmin: false,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'sys.admin.settings': {
    id: 'sys.admin.settings',
    category: 'System',
    name: 'Launch Modern Windows Settings (ms-settings:)',
    description: 'Opens modern Windows Settings dashboard.',
    requiresAdmin: false,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'sys.admin.resmon': {
    id: 'sys.admin.resmon',
    category: 'System',
    name: 'Launch Resource Monitor (resmon.exe)',
    description: 'Opens native Windows Resource Monitor deep diagnostics.',
    requiresAdmin: false,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'sys.admin.perfmon': {
    id: 'sys.admin.perfmon',
    category: 'System',
    name: 'Launch Performance Monitor (perfmon.msc)',
    description: 'Opens native Windows Performance Monitor console.',
    requiresAdmin: false,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'sys.admin.terminal': {
    id: 'sys.admin.terminal',
    category: 'System',
    name: 'Launch Windows Terminal / PowerShell Session',
    description: 'Launches verified local PowerShell or Windows Terminal console. No arbitrary command string injection.',
    requiresAdmin: false,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },

  // --- PHASE 8.8: DEVELOPER TOOLS & RUNTIMES ---
  'dev.environment.info': {
    id: 'dev.environment.info',
    category: 'Developer Tools',
    name: 'Audit Developer Toolchains & Virtualization',
    description: 'Compiles full diagnostic profile of WSL distributions, Hyper-V state, Windows Sandbox, and installed CLI toolchains.',
    requiresAdmin: false,
    estimatedDuration: '10 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'dev.wsl.status': {
    id: 'dev.wsl.status',
    category: 'Developer Tools',
    name: 'Inspect Windows Subsystem for Linux (WSL) Subsystem',
    description: 'Interrogates WSL default version, running Linux distributions, and kernel revision.',
    requiresAdmin: false,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'dev.hyperv.status': {
    id: 'dev.hyperv.status',
    category: 'Developer Tools',
    name: 'Audit Hyper-V Hypervisor & Virtualization',
    description: 'Checks HypervisorPresent, SLAT hardware support, and virtual switch interfaces.',
    requiresAdmin: false,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'dev.sandbox.status': {
    id: 'dev.sandbox.status',
    category: 'Developer Tools',
    name: 'Inspect Windows Sandbox Feature Status',
    description: 'Verifies Windows Sandbox optional feature availability and activation state.',
    requiresAdmin: false,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'dev.developermode.status': {
    id: 'dev.developermode.status',
    category: 'Developer Tools',
    name: 'Audit Windows Developer Mode State',
    description: 'Checks AppModelUnlock and Developer Mode policy configuration in the Windows registry.',
    requiresAdmin: false,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'dev.runtimes.inventory': {
    id: 'dev.runtimes.inventory',
    category: 'Developer Tools',
    name: 'Enumerate Developer Runtimes & CLI Toolchains',
    description: 'Detects installed .NET Framework, .NET Core runtimes, PowerShell versions, Git, Node.js, Python, and WinGet.',
    requiresAdmin: false,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'power.wsl.install': {
    id: 'power.wsl.install',
    category: 'Developer Tools',
    name: 'Windows Subsystem for Linux (WSL) Setup & Installation',
    description: 'Enables Virtual Machine Platform and provisions modern WSL2 subsystem architecture.',
    requiresAdmin: true,
    estimatedDuration: '30-90 secs',
    risk: 'moderate',
    isLongRunning: true
  },
  'power.hyperv.toggle': {
    id: 'power.hyperv.toggle',
    category: 'Developer Tools',
    name: 'Hyper-V Hypervisor Optional Feature Toggle',
    description: 'Enables or disables Microsoft Hyper-V virtualization hypervisor components with restart notice.',
    requiresAdmin: true,
    estimatedDuration: '15-45 secs',
    risk: 'moderate',
    isLongRunning: false
  }
};
