export interface OperationCatalogItem {
  id: string;
  category: string;
  name: string;
  description: string;
  requiresAdmin: boolean;
  estimatedDuration: string;
  risk: 'safe' | 'moderate' | 'high';
  isLongRunning: boolean;
}

export const KNOWN_OPERATIONS_MAP: Record<string, OperationCatalogItem> = {
  'repair.sfc.scannow': {
    id: 'repair.sfc.scannow',
    category: 'Windows Repair',
    name: 'SFC System File Integrity Scan & Repair',
    description: 'Scans all protected system files and replaces corrupted files with a cached copy from WinSxS.',
    requiresAdmin: true,
    estimatedDuration: '3-8 mins',
    risk: 'safe',
    isLongRunning: true
  },
  'repair.dism.restorehealth': {
    id: 'repair.dism.restorehealth',
    category: 'Windows Repair',
    name: 'DISM Component Store RestoreHealth',
    description: 'Repairs corrupted Windows Component Store image manifests using official Windows Update or cache payloads.',
    requiresAdmin: true,
    estimatedDuration: '5-12 mins',
    risk: 'safe',
    isLongRunning: true
  },
  'repair.super.full_pipeline': {
    id: 'repair.super.full_pipeline',
    category: 'Windows Repair',
    name: 'One-Click Super Repair Autonomous Pipeline',
    description: 'Executes comprehensive 7-stage automated repair: Snapshot, Windows integrity, Network stack, Update daemons, Modern runtime, Print subsystem, and Health audit.',
    requiresAdmin: true,
    estimatedDuration: '6-12 mins',
    risk: 'safe',
    isLongRunning: true
  },
  'network.dns.flush': {
    id: 'network.dns.flush',
    category: 'Network Operations',
    name: 'Flush DNS Resolver Cache',
    description: 'Purges client-side DNS resolver cache to resolve host-not-found errors.',
    requiresAdmin: true,
    estimatedDuration: '2 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'network.winsock.reset': {
    id: 'network.winsock.reset',
    category: 'Network Operations',
    name: 'Reset Winsock Catalog Protocol Stack',
    description: 'Resets Windows Sockets API catalog state to default configuration.',
    requiresAdmin: true,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'printer.spooler.restart': {
    id: 'printer.spooler.restart',
    category: 'Printer Operations',
    name: 'Restart Windows Print Spooler Service',
    description: 'Safely stops and restarts spoolsv.exe to restore print queue responsiveness.',
    requiresAdmin: true,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'printer.queue.purge': {
    id: 'printer.queue.purge',
    category: 'Printer Operations',
    name: 'Purge Jammed Print Jobs',
    description: 'Clears stale .SHD and .SPL job manifests from System32\\spool\\PRINTERS.',
    requiresAdmin: true,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'repair.recovery.create_restore_point': {
    id: 'repair.recovery.create_restore_point',
    category: 'Recovery & Restore',
    name: 'Create System Restore Point',
    description: 'Creates an immediate Volume Shadow Copy checkpoint for system rollback.',
    requiresAdmin: true,
    estimatedDuration: '30 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'hardware.battery.report': {
    id: 'hardware.battery.report',
    category: 'Diagnostics',
    name: 'Generate Battery Report',
    description: 'Generates detailed HTML battery wear level and cycle count report.',
    requiresAdmin: false,
    estimatedDuration: '10 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'network.ping.dns': {
    id: 'network.ping.dns',
    category: 'Network Operations',
    name: 'DNS Latency & Health Check',
    description: 'Tests response times to primary Cloudflare and Google DNS servers.',
    requiresAdmin: false,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'storage.temp.clean': {
    id: 'storage.temp.clean',
    category: 'Storage Operations',
    name: 'Prune Temporary Files & Cache',
    description: 'Purges stale %TEMP% files, crash dumps, and thumbnail caches safely.',
    requiresAdmin: true,
    estimatedDuration: '15 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'repair.dism.clean_store': {
    id: 'repair.dism.clean_store',
    category: 'Windows Repair',
    name: 'Clean Component Store (WinSxS)',
    description: 'Reclaims disk space by purging superseded update packages in WinSxS.',
    requiresAdmin: true,
    estimatedDuration: '2-5 mins',
    risk: 'safe',
    isLongRunning: true
  },
  // Performance & Power Operations
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

  // Quick Utility Launchers
  'sys.admin.taskmgr': {
    id: 'sys.admin.taskmgr',
    category: 'System',
    name: 'Launch Task Manager (taskmgr.exe)',
    description: 'Opens Windows Task Manager for live process and performance monitoring.',
    requiresAdmin: false,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
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
  'sys.admin.compmgmt': {
    id: 'sys.admin.compmgmt',
    category: 'System',
    name: 'Launch Computer Management (compmgmt.msc)',
    description: 'Opens native Computer Management administration console.',
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
  'sys.admin.services_msc': {
    id: 'sys.admin.services_msc',
    category: 'System',
    name: 'Launch Services Console (services.msc)',
    description: 'Opens Windows Services management console.',
    requiresAdmin: true,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'sys.admin.sched_tasks': {
    id: 'sys.admin.sched_tasks',
    category: 'System',
    name: 'Launch Task Scheduler (taskschd.msc)',
    description: 'Opens Windows Task Scheduler console.',
    requiresAdmin: true,
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
  'sys.admin.msinfo32': {
    id: 'sys.admin.msinfo32',
    category: 'System',
    name: 'Launch System Information (msinfo32.exe)',
    description: 'Opens native Windows System Information utility.',
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
  'sys.admin.regedit': {
    id: 'sys.admin.regedit',
    category: 'System',
    name: 'Launch Registry Editor (regedit.exe)',
    description: 'Opens native Windows Registry Editor console.',
    requiresAdmin: true,
    estimatedDuration: '5 secs',
    risk: 'moderate',
    isLongRunning: false
  },
  'policy.gpedit.launch': {
    id: 'policy.gpedit.launch',
    category: 'System',
    name: 'Launch Group Policy Editor (gpedit.msc)',
    description: 'Opens native Local Group Policy Editor MMC console.',
    requiresAdmin: true,
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

  // Developer Tools
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
  'backup.vss.manage': {
    id: 'backup.vss.manage',
    category: 'Backup & Restore',
    name: 'Volume Shadow Copy (VSS) Administration',
    description: 'Audits Volume Shadow Copy service status, storage allocation, and snapshot catalog without destructive purge.',
    requiresAdmin: true,
    estimatedDuration: '5-10 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'sys.admin.sysdm_cpl': {
    id: 'sys.admin.sysdm_cpl',
    category: 'System & Administration',
    name: 'Launch Windows Environment Variables Editor (sysdm.cpl)',
    description: 'Launches native System Properties Environment Variables graphical dialog.',
    requiresAdmin: false,
    estimatedDuration: '5 secs',
    risk: 'safe',
    isLongRunning: false
  },
  'power.wsl.install': {
    id: 'power.wsl.install',
    category: 'Power User / Developer',
    name: 'Windows Subsystem for Linux (WSL) Setup & Installation',
    description: 'Enables Virtual Machine Platform and provisions modern WSL2 subsystem architecture.',
    requiresAdmin: true,
    estimatedDuration: '30-90 secs',
    risk: 'moderate',
    isLongRunning: true
  },
  'power.hyperv.toggle': {
    id: 'power.hyperv.toggle',
    category: 'Power User / Developer',
    name: 'Hyper-V Hypervisor Optional Feature Toggle',
    description: 'Enables or disables Microsoft Hyper-V virtualization hypervisor components with restart notice.',
    requiresAdmin: true,
    estimatedDuration: '15-45 secs',
    risk: 'moderate',
    isLongRunning: false
  }
};
