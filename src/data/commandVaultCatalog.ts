/**
 * Command Vault & Mega Command Vault Catalog
 * Akshigo PC Toolkit Pro v8.0.0-rc.1
 * Phase 8.8: Command Vault Parity (Safe Execution, Reference Only & Security Blocked)
 */

export type CommandClassification =
  | 'SAFE_EXECUTABLE'
  | 'REFERENCE_ONLY'
  | 'ADMIN_CONFIRM'
  | 'REMOVED_SECURITY'
  | 'OBSOLETE';

export interface CommandVaultItem {
  id: string;
  title: string;
  description: string;
  category: string;
  commandPreview: string;
  requiresAdmin: boolean;
  riskLevel: 'safe' | 'moderate' | 'high';
  registeredOperationId?: string;
  classification: CommandClassification;
  documentation: string;
  tags: string[];
  securityNote?: string;
}

export const COMMAND_VAULT_CATEGORIES = [
  'All',
  'System',
  'Network',
  'Windows Repair',
  'Storage',
  'Drivers',
  'Services',
  'Processes',
  'Event Logs',
  'PowerShell',
  'WinGet',
  'DISM',
  'SFC',
  'User/Admin',
  'Group Policy',
  'RDP',
  'Printer',
  'Development',
  'Security Blocked'
] as const;

export const COMMAND_VAULT_CATALOG: CommandVaultItem[] = [
  // ==========================================
  // SFC & DISM (WINDOWS REPAIR)
  // ==========================================
  {
    id: 'cmd-sfc-scannow',
    title: 'SFC System File Integrity Scan & Repair',
    description: 'Scans all protected system files and replaces corrupted files with a cached copy located in %WinDir%\\System32\\dllcache or WinSxS.',
    category: 'SFC',
    commandPreview: 'sfc /scannow',
    requiresAdmin: true,
    riskLevel: 'safe',
    registeredOperationId: 'repair.sfc.scannow',
    classification: 'SAFE_EXECUTABLE',
    documentation: 'Runs the System File Checker utility. Requires elevated administrator privileges. Does not restart the PC upon completion.',
    tags: ['sfc', 'integrity', 'corruption', 'scannow', 'repair']
  },
  {
    id: 'cmd-sfc-verifyonly',
    title: 'SFC Integrity Audit (Verify Only)',
    description: 'Scans all protected system files without modifying or repairing detected discrepancies.',
    category: 'SFC',
    commandPreview: 'sfc /verifyonly',
    requiresAdmin: true,
    riskLevel: 'safe',
    registeredOperationId: 'repair.sfc.scannow',
    classification: 'SAFE_EXECUTABLE',
    documentation: 'Logs discrepancies to CBS.log without altering on-disk files. Useful for non-invasive system health auditing.',
    tags: ['sfc', 'verify', 'audit', 'check']
  },
  {
    id: 'cmd-dism-checkhealth',
    title: 'DISM Component Store CheckHealth',
    description: 'Quickly checks whether corruption has been flagged in the local component store without performing repairs.',
    category: 'DISM',
    commandPreview: 'dism /online /cleanup-image /checkhealth',
    requiresAdmin: true,
    riskLevel: 'safe',
    registeredOperationId: 'repair.dism.restorehealth',
    classification: 'SAFE_EXECUTABLE',
    documentation: 'Reads the servicing registry flag. Takes 2-5 seconds. Does not scan the entire filesystem.',
    tags: ['dism', 'checkhealth', 'component store', 'quick']
  },
  {
    id: 'cmd-dism-scanhealth',
    title: 'DISM Component Store ScanHealth',
    description: 'Scans the Windows image for component store corruption and reports whether repair is possible.',
    category: 'DISM',
    commandPreview: 'dism /online /cleanup-image /scanhealth',
    requiresAdmin: true,
    riskLevel: 'safe',
    registeredOperationId: 'repair.dism.restorehealth',
    classification: 'SAFE_EXECUTABLE',
    documentation: 'Performs deep hash verification of package manifests against WinSxS. Takes 3-10 minutes.',
    tags: ['dism', 'scanhealth', 'component store', 'hash']
  },
  {
    id: 'cmd-dism-restorehealth',
    title: 'DISM Component Store RestoreHealth',
    description: 'Scans the Windows image for corruption and automatically performs repair operations using official Windows Update payloads.',
    category: 'DISM',
    commandPreview: 'dism /online /cleanup-image /restorehealth',
    requiresAdmin: true,
    riskLevel: 'safe',
    registeredOperationId: 'repair.dism.restorehealth',
    classification: 'SAFE_EXECUTABLE',
    documentation: 'Downloads clean component manifests from Microsoft Windows Update servers if local cache is corrupted.',
    tags: ['dism', 'restorehealth', 'repair', 'image', 'winsxs']
  },
  {
    id: 'cmd-dism-startcomponentcleanup',
    title: 'DISM Component Store ResetBase & Cleanup',
    description: 'Reclaims disk space by purging superseded component versions and resetting the component store baseline.',
    category: 'DISM',
    commandPreview: 'dism /online /cleanup-image /startcomponentcleanup /resetbase',
    requiresAdmin: true,
    riskLevel: 'safe',
    registeredOperationId: 'repair.dism.clean_store',
    classification: 'SAFE_EXECUTABLE',
    documentation: 'Removes all superseded versions of every component in the component store. Reclaims 2-8 GB of disk space.',
    tags: ['dism', 'clean_store', 'winsxs', 'resetbase', 'cleanup']
  },

  // ==========================================
  // NETWORK
  // ==========================================
  {
    id: 'cmd-ipconfig-flushdns',
    title: 'Flush DNS Resolver Cache',
    description: 'Purges and resets the contents of the DNS client resolver cache.',
    category: 'Network',
    commandPreview: 'ipconfig /flushdns',
    requiresAdmin: true,
    riskLevel: 'safe',
    registeredOperationId: 'network.dns.flush',
    classification: 'SAFE_EXECUTABLE',
    documentation: 'Flushes cached DNS records. Critical when DNS records have updated or stale host IP resolutions cause connection drops.',
    tags: ['ipconfig', 'dns', 'flush', 'network', 'resolver']
  },
  {
    id: 'cmd-netsh-winsock-reset',
    title: 'Reset Winsock Catalog & TCP/IP Stack',
    description: 'Resets Windows Sockets API catalog state to default configuration to repair corrupt network protocol bindings.',
    category: 'Network',
    commandPreview: 'netsh winsock reset',
    requiresAdmin: true,
    riskLevel: 'moderate',
    registeredOperationId: 'network.winsock.reset',
    classification: 'ADMIN_CONFIRM',
    documentation: 'Restores the Winsock catalog. May require computer restart to complete full protocol binding reload.',
    tags: ['netsh', 'winsock', 'tcpip', 'reset', 'stack']
  },
  {
    id: 'cmd-ipconfig-renew',
    title: 'Renew IPv4 DHCP Lease',
    description: 'Renews DHCP configuration for all network adapters by querying the local DHCP router.',
    category: 'Network',
    commandPreview: 'ipconfig /renew',
    requiresAdmin: true,
    riskLevel: 'safe',
    registeredOperationId: 'network.ip.renew',
    classification: 'SAFE_EXECUTABLE',
    documentation: 'Re-negotiates IP lease with local router or DHCP server. Transiently interrupts active connections for 1-2 seconds.',
    tags: ['ipconfig', 'renew', 'dhcp', 'ip', 'lease']
  },
  {
    id: 'cmd-netstat-ano',
    title: 'Netstat Active Connections & Listening Ports',
    description: 'Displays active TCP connections, listening ports, and owning Process IDs (PIDs).',
    category: 'Network',
    commandPreview: 'netstat -ano',
    requiresAdmin: false,
    riskLevel: 'safe',
    classification: 'REFERENCE_ONLY',
    documentation: 'Use to identify which process PID has bound a particular port (e.g. :80, :443, :3000, :8080). Cross-reference PID with Task Manager.',
    tags: ['netstat', 'ports', 'connections', 'pid', 'listening']
  },
  {
    id: 'cmd-tracert-hops',
    title: 'Trace Route Network Latency Diagnostics',
    description: 'Determines the path taken to a destination by sending ICMP Echo Request messages with incrementally increasing Time-To-Live (TTL).',
    category: 'Network',
    commandPreview: 'tracert 1.1.1.1',
    requiresAdmin: false,
    riskLevel: 'safe',
    classification: 'REFERENCE_ONLY',
    documentation: 'Shows intermediate gateway router hops and round-trip times. Hops with * indicate ICMP filtering or packet loss.',
    tags: ['tracert', 'hops', 'latency', 'icmp', 'routing']
  },
  {
    id: 'cmd-nslookup-query',
    title: 'NSLookup Interactive DNS Query',
    description: 'Queries DNS name servers directly to resolve domain names, MX records, and TXT SPF/DKIM verification tags.',
    category: 'Network',
    commandPreview: 'nslookup -type=any google.com 8.8.8.8',
    requiresAdmin: false,
    riskLevel: 'safe',
    classification: 'REFERENCE_ONLY',
    documentation: 'Allows manual specification of DNS resolver server to troubleshoot ISP DNS hijacking or propagation delays.',
    tags: ['nslookup', 'dns', 'resolver', 'mx', 'txt']
  },

  // ==========================================
  // STORAGE & FILE SYSTEM
  // ==========================================
  {
    id: 'cmd-chkdsk-scan',
    title: 'Check Disk Non-Invasive Read-Only Scan',
    description: 'Checks the file system and file metadata on volume C: for logical and physical errors without taking the drive offline.',
    category: 'Storage',
    commandPreview: 'chkdsk C: /scan',
    requiresAdmin: true,
    riskLevel: 'safe',
    registeredOperationId: 'storage.chkdsk.scan',
    classification: 'SAFE_EXECUTABLE',
    documentation: 'Runs online NTFS self-healing scan. Does not require volume dismount or system reboot.',
    tags: ['chkdsk', 'scan', 'storage', 'ntfs', 'disk']
  },
  {
    id: 'cmd-chkdsk-repair',
    title: 'Check Disk Volume Repair & Bad Sector Recovery',
    description: 'Schedules offline sector repair and directory index rebuilding on system boot.',
    category: 'Storage',
    commandPreview: 'chkdsk C: /f /r',
    requiresAdmin: true,
    riskLevel: 'high',
    registeredOperationId: 'storage.chkdsk.repair',
    classification: 'ADMIN_CONFIRM',
    documentation: 'Requires system restart. Forces volume lock and scans physical sectors. Can take 1-4 hours on mechanical HDDs.',
    tags: ['chkdsk', 'repair', 'bad sectors', 'reboot']
  },
  {
    id: 'cmd-defrag-trim',
    title: 'Solid State Drive Retrim (TRIM)',
    description: 'Sends ATA/NVMe TRIM hints to SSD controller to reclaim unused memory blocks and optimize write amplification.',
    category: 'Storage',
    commandPreview: 'defrag C: /L /U',
    requiresAdmin: true,
    riskLevel: 'safe',
    registeredOperationId: 'perf.drive.trim',
    classification: 'SAFE_EXECUTABLE',
    documentation: 'Crucial for maintaining sustained SSD write speeds. Safe to run regularly on SSDs. Never defragment flash storage.',
    tags: ['defrag', 'trim', 'ssd', 'nvme', 'performance']
  },
  {
    id: 'cmd-cleanmgr-sageset',
    title: 'Windows Disk Cleanup Configuration (cleanmgr)',
    description: 'Launches Windows Disk Cleanup to purge temporary files, offline web pages, and recycle bin.',
    category: 'Storage',
    commandPreview: 'cleanmgr.exe /d C:',
    requiresAdmin: true,
    riskLevel: 'safe',
    registeredOperationId: 'perf.disk_cleanup.launch',
    classification: 'SAFE_EXECUTABLE',
    documentation: 'Opens native Windows Disk Cleanup utility.',
    tags: ['cleanmgr', 'cleanup', 'temp', 'disk space']
  },
  {
    id: 'cmd-fsutil-dirty',
    title: 'Query Volume Dirty Bit Status',
    description: 'Queries whether the volume dirty bit has been set by the NTFS driver indicating uncommitted transactions.',
    category: 'Storage',
    commandPreview: 'fsutil dirty query C:',
    requiresAdmin: true,
    riskLevel: 'safe',
    classification: 'REFERENCE_ONLY',
    documentation: 'If dirty bit is set, Windows will automatically attempt chkdsk on next boot.',
    tags: ['fsutil', 'dirty bit', 'ntfs', 'filesystem']
  },

  // ==========================================
  // SYSTEM & PERFORMANCE
  // ==========================================
  {
    id: 'cmd-perf-analysis',
    title: 'Comprehensive System Performance Audit',
    description: 'Audits CPU thread topology, memory working set, physical disk queue depth, and boot event performance.',
    category: 'System',
    commandPreview: 'typeperf "\\Processor(_Total)\\% Processor Time" -sc 5',
    requiresAdmin: false,
    riskLevel: 'safe',
    registeredOperationId: 'perf.analysis.run',
    classification: 'SAFE_EXECUTABLE',
    documentation: 'Evaluates real-time hardware telemetry and compares against performance baselines.',
    tags: ['performance', 'cpu', 'ram', 'disk', 'telemetry']
  },
  {
    id: 'cmd-powercfg-active',
    title: 'Query Active Power Scheme & GUID',
    description: 'Retrieves the currently active Windows power scheme and supported sleep states.',
    category: 'System',
    commandPreview: 'powercfg /getactivescheme',
    requiresAdmin: false,
    riskLevel: 'safe',
    registeredOperationId: 'perf.power.info',
    classification: 'SAFE_EXECUTABLE',
    documentation: 'Shows active power plan GUID (e.g. Balanced, High Performance, Power Saver, Ultimate Performance).',
    tags: ['powercfg', 'power plan', 'battery', 'energy']
  },
  {
    id: 'cmd-powercfg-energy',
    title: 'Generate 60-Second Energy Efficiency Diagnostic',
    description: 'Monitors system behavior for 60 seconds to detect energy efficiency problems and battery drain culprits.',
    category: 'System',
    commandPreview: 'powercfg /energy /duration 60',
    requiresAdmin: true,
    riskLevel: 'safe',
    registeredOperationId: 'perf.power.energy_report',
    classification: 'SAFE_EXECUTABLE',
    documentation: 'Generates detailed HTML report auditing processor power management, platform timer resolution, and USB devices.',
    tags: ['powercfg', 'energy', 'battery drain', 'report']
  },
  {
    id: 'cmd-powercfg-batteryreport',
    title: 'Generate ACPI Battery Diagnostic Report',
    description: 'Generates a detailed battery degradation and cycle count report from ACPI hardware counters.',
    category: 'System',
    commandPreview: 'powercfg /batteryreport /output "C:\\battery-report.html"',
    requiresAdmin: false,
    riskLevel: 'safe',
    registeredOperationId: 'hardware.battery.report',
    classification: 'SAFE_EXECUTABLE',
    documentation: 'Tracks factory design capacity vs current full charge capacity to calculate true wear percentage.',
    tags: ['powercfg', 'battery', 'health', 'wear level']
  },
  {
    id: 'cmd-taskmgr-launch',
    title: 'Launch Windows Task Manager',
    description: 'Opens native Windows Task Manager for live process and performance monitoring.',
    category: 'System',
    commandPreview: 'taskmgr.exe',
    requiresAdmin: false,
    riskLevel: 'safe',
    registeredOperationId: 'sys.admin.taskmgr',
    classification: 'SAFE_EXECUTABLE',
    documentation: 'Launches native task manager GUI.',
    tags: ['taskmgr', 'processes', 'performance', 'cpu']
  },

  // ==========================================
  // SERVICES & PROCESSES
  // ==========================================
  {
    id: 'cmd-printer-spooler-restart',
    title: 'Restart Windows Print Spooler Service',
    description: 'Safely stops and restarts spoolsv.exe to restore print queue responsiveness and clear hung print jobs.',
    category: 'Printer',
    commandPreview: 'net stop spooler && net start spooler',
    requiresAdmin: true,
    riskLevel: 'safe',
    registeredOperationId: 'printer.spooler.restart',
    classification: 'SAFE_EXECUTABLE',
    documentation: 'Restarts print spooler service cleanly without rebooting the system.',
    tags: ['spooler', 'printer', 'print queue', 'restart']
  },
  {
    id: 'cmd-services-msc-launch',
    title: 'Launch Services Management Console (services.msc)',
    description: 'Opens native Windows Services MMC console to inspect and configure service startup types.',
    category: 'Services',
    commandPreview: 'services.msc',
    requiresAdmin: true,
    riskLevel: 'safe',
    registeredOperationId: 'sys.admin.services_msc',
    classification: 'SAFE_EXECUTABLE',
    documentation: 'Opens graphical Services console.',
    tags: ['services', 'services.msc', 'daemon', 'startup']
  },
  {
    id: 'cmd-sc-query-service',
    title: 'Query Windows Service Configuration (sc query)',
    description: 'Interrogates the Windows Service Control Manager to view real-time state, WIN32_EXIT_CODE, and PID.',
    category: 'Services',
    commandPreview: 'sc query wuauserv',
    requiresAdmin: false,
    riskLevel: 'safe',
    classification: 'REFERENCE_ONLY',
    documentation: 'Low-level CLI tool for querying service status directly from the Service Control Manager.',
    tags: ['sc', 'query', 'wuauserv', 'services']
  },
  {
    id: 'cmd-tasklist-v',
    title: 'Tasklist Verbose Process Listing',
    description: 'Displays list of currently running processes with memory usage, user context, and window titles.',
    category: 'Processes',
    commandPreview: 'tasklist /v /fo table',
    requiresAdmin: false,
    riskLevel: 'safe',
    classification: 'REFERENCE_ONLY',
    documentation: 'Displays process names, session IDs, CPU time, and memory usage. Safe read-only inspection.',
    tags: ['tasklist', 'processes', 'pid', 'memory']
  },
  {
    id: 'cmd-taskkill-f',
    title: 'Taskkill Terminate Hung Process Tree',
    description: 'Forces termination of unresponsive process and all spawned child processes by PID.',
    category: 'Processes',
    commandPreview: 'taskkill /F /T /PID <target_pid>',
    requiresAdmin: true,
    riskLevel: 'moderate',
    classification: 'ADMIN_CONFIRM',
    documentation: 'Forces immediate termination. Always verify PID before executing to avoid killing system processes.',
    tags: ['taskkill', 'kill', 'terminate', 'hung', 'process']
  },

  // ==========================================
  // EVENT LOGS
  // ==========================================
  {
    id: 'cmd-eventvwr-launch',
    title: 'Launch Windows Event Viewer (eventvwr.msc)',
    description: 'Opens native Event Viewer MMC to inspect System, Application, and Security event streams.',
    category: 'Event Logs',
    commandPreview: 'eventvwr.msc',
    requiresAdmin: false,
    riskLevel: 'safe',
    registeredOperationId: 'sys.admin.eventvwr',
    classification: 'SAFE_EXECUTABLE',
    documentation: 'Opens native Event Viewer console.',
    tags: ['eventvwr', 'logs', 'system', 'application']
  },
  {
    id: 'cmd-wevtutil-query',
    title: 'Query Recent Critical System Events (wevtutil)',
    description: 'Extracts the last 10 Error and Critical events from the Windows System log.',
    category: 'Event Logs',
    commandPreview: 'wevtutil qe System "/q:*[System[(Level=1 or Level=2)]]" /f:text /c:10 /rd:true',
    requiresAdmin: false,
    riskLevel: 'safe',
    classification: 'REFERENCE_ONLY',
    documentation: 'Command-line interface to Windows Event Log engine. Level 1 = Critical, Level 2 = Error.',
    tags: ['wevtutil', 'events', 'errors', 'bsod', 'crashes']
  },

  // ==========================================
  // WINGET & SOFTWARE
  // ==========================================
  {
    id: 'cmd-winget-upgrade-all',
    title: 'WinGet Upgrade All Outdated Software',
    description: 'Scans all installed applications against the Microsoft Community Repository and batch-upgrades outdated packages.',
    category: 'WinGet',
    commandPreview: 'winget upgrade --all --include-unknown',
    requiresAdmin: true,
    riskLevel: 'safe',
    registeredOperationId: 'software.upgrade.all',
    classification: 'SAFE_EXECUTABLE',
    documentation: 'Windows Package Manager batch upgrade command. Uses official package manifests and hashes.',
    tags: ['winget', 'upgrade', 'apps', 'packages', 'update']
  },
  {
    id: 'cmd-winget-list',
    title: 'WinGet Enumerate Installed Packages',
    description: 'Lists all software packages installed on the system that match official package IDs.',
    category: 'WinGet',
    commandPreview: 'winget list',
    requiresAdmin: false,
    riskLevel: 'safe',
    classification: 'REFERENCE_ONLY',
    documentation: 'Displays software name, package ID, installed version, and available upgrade version.',
    tags: ['winget', 'list', 'installed', 'inventory']
  },
  {
    id: 'cmd-winget-search',
    title: 'WinGet Search Official Repository',
    description: 'Searches the official Windows Package Manager source repository for software by keyword.',
    category: 'WinGet',
    commandPreview: 'winget search <keyword>',
    requiresAdmin: false,
    riskLevel: 'safe',
    classification: 'REFERENCE_ONLY',
    documentation: 'Queries the winget source repository catalog. Does not download or install anything.',
    tags: ['winget', 'search', 'catalog', 'find']
  },

  // ==========================================
  // GROUP POLICY & USER / ADMIN
  // ==========================================
  {
    id: 'cmd-gpupdate-force',
    title: 'Force Group Policy Update (gpupdate /force)',
    description: 'Forces background refresh of all local and Active Directory computer and user policy settings.',
    category: 'Group Policy',
    commandPreview: 'gpupdate /force',
    requiresAdmin: true,
    riskLevel: 'safe',
    registeredOperationId: 'policy.gpupdate.force',
    classification: 'SAFE_EXECUTABLE',
    documentation: 'Re-applies all registry client-side extensions and policy objects without waiting for the default 90-minute refresh interval.',
    tags: ['gpupdate', 'gpo', 'policy', 'refresh', 'active directory']
  },
  {
    id: 'cmd-gpresult-r',
    title: 'Generate Group Policy Results Summary (gpresult /r)',
    description: 'Displays Resultant Set of Policy (RSoP) information for the computer and logged on user.',
    category: 'Group Policy',
    commandPreview: 'gpresult /r',
    requiresAdmin: true,
    riskLevel: 'safe',
    registeredOperationId: 'policy.gpresult.run',
    classification: 'SAFE_EXECUTABLE',
    documentation: 'Shows applied GPOs, security group memberships, and OS version.',
    tags: ['gpresult', 'rsop', 'policy', 'gpo', 'audit']
  },
  {
    id: 'cmd-gpedit-msc-launch',
    title: 'Launch Local Group Policy Editor (gpedit.msc)',
    description: 'Opens Local Group Policy Editor MMC console on Windows Pro, Enterprise, and Education editions.',
    category: 'Group Policy',
    commandPreview: 'gpedit.msc',
    requiresAdmin: true,
    riskLevel: 'safe',
    registeredOperationId: 'policy.gpedit.launch',
    classification: 'SAFE_EXECUTABLE',
    documentation: 'Opens native Group Policy Editor graphical console.',
    tags: ['gpedit', 'policy editor', 'gpo', 'windows pro']
  },
  {
    id: 'cmd-net-user-list',
    title: 'Enumerate Local User Accounts (net user)',
    description: 'Lists all local Windows user accounts and security identifiers.',
    category: 'User/Admin',
    commandPreview: 'net user',
    requiresAdmin: false,
    riskLevel: 'safe',
    classification: 'REFERENCE_ONLY',
    documentation: 'Displays active accounts, disabled accounts, and built-in administrator account status.',
    tags: ['net user', 'accounts', 'users', 'admin']
  },
  {
    id: 'cmd-whoami-priv',
    title: 'Audit User Security Privileges (whoami /priv)',
    description: 'Displays the security token privileges for the current security context.',
    category: 'User/Admin',
    commandPreview: 'whoami /priv',
    requiresAdmin: false,
    riskLevel: 'safe',
    classification: 'REFERENCE_ONLY',
    documentation: 'Shows privileges such as SeDebugPrivilege, SeShutdownPrivilege, and SeBackupPrivilege.',
    tags: ['whoami', 'privileges', 'token', 'security']
  },

  // ==========================================
  // RDP & REMOTE ACCESS
  // ==========================================
  {
    id: 'cmd-mstsc-launch',
    title: 'Launch Remote Desktop Connection (mstsc.exe)',
    description: 'Opens native Windows Remote Desktop client for connecting to remote Windows workstations or servers.',
    category: 'RDP',
    commandPreview: 'mstsc.exe',
    requiresAdmin: false,
    riskLevel: 'safe',
    classification: 'REFERENCE_ONLY',
    documentation: 'Opens native RDP client. Connects using TCP/UDP port 3389.',
    tags: ['rdp', 'mstsc', 'remote desktop', 'terminal services']
  },
  {
    id: 'cmd-net-share',
    title: 'Audit Local SMB File Shares (net share)',
    description: 'Displays information about all active shared network resources on the local computer.',
    category: 'RDP',
    commandPreview: 'net share',
    requiresAdmin: true,
    riskLevel: 'safe',
    registeredOperationId: 'remote.shares.audit',
    classification: 'SAFE_EXECUTABLE',
    documentation: 'Lists administrative shares (C$, ADMIN$, IPC$) and user-created SMB shares.',
    tags: ['net share', 'smb', 'shares', 'network']
  },

  // ==========================================
  // DEVELOPMENT & POWER USER TOOLS
  // ==========================================
  {
    id: 'cmd-wsl-status',
    title: 'Inspect Windows Subsystem for Linux (WSL)',
    description: 'Interrogates WSL default version, running Linux distributions, and kernel revision.',
    category: 'Development',
    commandPreview: 'wsl.exe --status',
    requiresAdmin: false,
    riskLevel: 'safe',
    registeredOperationId: 'dev.wsl.status',
    classification: 'SAFE_EXECUTABLE',
    documentation: 'Queries WSL status, default distribution, and virtualization platform backend.',
    tags: ['wsl', 'linux', 'ubuntu', 'kernel', 'virtualization']
  },
  {
    id: 'cmd-hyperv-status',
    title: 'Audit Hyper-V Hypervisor & Virtualization',
    description: 'Checks HypervisorPresent, SLAT hardware support, and virtual switch interfaces.',
    category: 'Development',
    commandPreview: 'Get-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V-All',
    requiresAdmin: false,
    riskLevel: 'safe',
    registeredOperationId: 'dev.hyperv.status',
    classification: 'SAFE_EXECUTABLE',
    documentation: 'Audits Hyper-V hypervisor role and virtualization capabilities.',
    tags: ['hyper-v', 'virtualization', 'vms', 'hypervisor']
  },
  {
    id: 'cmd-dev-runtimes',
    title: 'Enumerate Developer Runtimes & CLI Toolchains',
    description: 'Detects installed .NET Framework, .NET Core runtimes, PowerShell versions, Git, Node.js, Python, and WinGet.',
    category: 'Development',
    commandPreview: 'dotnet --list-runtimes && pwsh -v && git --version',
    requiresAdmin: false,
    riskLevel: 'safe',
    registeredOperationId: 'dev.runtimes.inventory',
    classification: 'SAFE_EXECUTABLE',
    documentation: 'Scans system PATH for installed developer SDKs and runtime environments.',
    tags: ['runtimes', 'dotnet', 'powershell', 'git', 'node', 'python']
  },

  // ==========================================
  // DRIVERS & HARDWARE
  // ==========================================
  {
    id: 'cmd-devmgmt-msc-launch',
    title: 'Launch Device Manager (devmgmt.msc)',
    description: 'Opens native Device Manager management console to inspect device drivers and hardware IDs.',
    category: 'Drivers',
    commandPreview: 'devmgmt.msc',
    requiresAdmin: false,
    riskLevel: 'safe',
    registeredOperationId: 'sys.admin.devmgmt',
    classification: 'SAFE_EXECUTABLE',
    documentation: 'Opens graphical Device Manager console.',
    tags: ['devmgmt', 'drivers', 'hardware', 'device manager']
  },
  {
    id: 'cmd-pnputil-enum-drivers',
    title: 'Enumerate OEM Third-Party Drivers (pnputil)',
    description: 'Lists all third-party OEM driver packages stored in the driver store repository (%WinDir%\\System32\\DriverStore).',
    category: 'Drivers',
    commandPreview: 'pnputil /enum-drivers',
    requiresAdmin: false,
    riskLevel: 'safe',
    classification: 'REFERENCE_ONLY',
    documentation: 'Displays published driver name (oem*.inf), original inf name, class, provider, date, and version.',
    tags: ['pnputil', 'drivers', 'oem', 'driverstore', 'hardware']
  },
  {
    id: 'cmd-driverquery-v',
    title: 'Driverquery Verbose Driver Table',
    description: 'Queries installed kernel drivers, link dates, and memory addresses.',
    category: 'Drivers',
    commandPreview: 'driverquery /v /fo table',
    requiresAdmin: false,
    riskLevel: 'safe',
    classification: 'REFERENCE_ONLY',
    documentation: 'Displays module name, display name, driver type, and start mode.',
    tags: ['driverquery', 'kernel', 'drivers', 'sys']
  },

  // ==========================================
  // SECURITY BLOCKED (LEGACY / DANGEROUS / MALICIOUS)
  // ==========================================
  {
    id: 'cmd-blocked-defender-disable',
    title: 'Disable Windows Defender Real-Time Protection',
    description: 'Attempts to disable Windows Defender antivirus real-time monitoring via PowerShell preferences.',
    category: 'Security Blocked',
    commandPreview: 'Set-MpPreference -DisableRealtimeMonitoring $true',
    requiresAdmin: true,
    riskLevel: 'high',
    classification: 'REMOVED_SECURITY',
    documentation: 'CRITICAL SECURITY VIOLATION: Disabling Defender removes endpoint protection, exposing the system to malware and ransomware.',
    securityNote: 'Execution is permanently blocked by Akshigo Security Guard. Akshigo will never disable antivirus protections.',
    tags: ['defender', 'antivirus', 'security bypass', 'blocked']
  },
  {
    id: 'cmd-blocked-firewall-off',
    title: 'Disable All Windows Defender Firewall Profiles',
    description: 'Attempts to completely disable all inbound and outbound firewall filtering profiles.',
    category: 'Security Blocked',
    commandPreview: 'netsh advfirewall set allprofiles state off',
    requiresAdmin: true,
    riskLevel: 'high',
    classification: 'REMOVED_SECURITY',
    documentation: 'CRITICAL SECURITY VIOLATION: Disabling the firewall exposes all local ports and services to the network.',
    securityNote: 'Execution is permanently blocked. Akshigo enforces Windows Defender Firewall security baselines.',
    tags: ['firewall', 'netsh', 'security bypass', 'blocked']
  },
  {
    id: 'cmd-blocked-mimikatz-dump',
    title: 'LSASS Memory Password & Credential Extraction',
    description: 'Attempts to read cleartext credentials or hashes from LSASS memory.',
    category: 'Security Blocked',
    commandPreview: 'rundll32.exe C:\\windows\\System32\\comsvcs.dll, MiniDump <lsass_pid> lsass.dmp full',
    requiresAdmin: true,
    riskLevel: 'high',
    classification: 'REMOVED_SECURITY',
    documentation: 'CRITICAL SECURITY VIOLATION: Dumping LSASS memory exposes user passwords and Kerberos tickets to theft.',
    securityNote: 'Execution is permanently blocked. Malicious credential harvesting is strictly prohibited.',
    tags: ['lsass', 'mimikatz', 'credential dumping', 'blocked']
  },
  {
    id: 'cmd-blocked-format-system',
    title: 'Destructive Unconditional Volume Format',
    description: 'Attempts to perform quick format on the primary system volume.',
    category: 'Security Blocked',
    commandPreview: 'format C: /fs:NTFS /q /y',
    requiresAdmin: true,
    riskLevel: 'high',
    classification: 'REMOVED_SECURITY',
    documentation: 'CRITICAL DATA LOSS RISK: Formatting volume C: destroys the Windows operating system and all user files.',
    securityNote: 'Execution is permanently blocked. Akshigo prohibits destructive filesystem operations.',
    tags: ['format', 'data destruction', 'wipe', 'blocked']
  },
  {
    id: 'cmd-blocked-delete-shadows',
    title: 'Delete All Volume Shadow Copies (vssadmin)',
    description: 'Attempts to purge all system restore points and volume snapshots (common ransomware pattern).',
    category: 'Security Blocked',
    commandPreview: 'vssadmin delete shadows /all /quiet',
    requiresAdmin: true,
    riskLevel: 'high',
    classification: 'REMOVED_SECURITY',
    documentation: 'CRITICAL RECOVERY DESTRUCTION: Deleting shadow copies destroys rollback checkpoints, preventing system recovery.',
    securityNote: 'Execution is permanently blocked. Akshigo protects system restore points and VSS snapshots.',
    tags: ['vssadmin', 'shadow copies', 'restore points', 'ransomware', 'blocked']
  },

  // ==========================================
  // OBSOLETE / DEPRECATED COMMANDS
  // ==========================================
  {
    id: 'cmd-obsolete-edlin',
    title: 'EDLIN Line Editor',
    description: 'Legacy MS-DOS line-oriented text editor deprecated in modern 64-bit Windows.',
    category: 'System',
    commandPreview: 'edlin.exe',
    requiresAdmin: false,
    riskLevel: 'safe',
    classification: 'OBSOLETE',
    documentation: 'EDLIN is a 16-bit MS-DOS utility removed from 64-bit Windows architectures (x64 / ARM64). Use Notepad or modern text editors.',
    tags: ['edlin', 'ms-dos', 'legacy', 'obsolete']
  },
  {
    id: 'cmd-obsolete-bootcfg',
    title: 'Bootcfg Boot.ini Manager',
    description: 'Legacy Windows XP boot.ini configuration tool replaced by BCDEdit in Windows Vista and later.',
    category: 'Windows Repair',
    commandPreview: 'bootcfg /rebuild',
    requiresAdmin: true,
    riskLevel: 'high',
    classification: 'OBSOLETE',
    documentation: 'Bootcfg was designed for NTLDR/boot.ini. Modern UEFI/BIOS systems use BCD (Boot Configuration Data) managed via bcdedit.',
    tags: ['bootcfg', 'boot.ini', 'ntldr', 'obsolete']
  },
  {
    id: 'cmd-obsolete-syskey',
    title: 'Syskey SAM Encryption Utility',
    description: 'Deprecated utility removed in Windows 10 Version 1709 due to cryptographic weaknesses and misuse.',
    category: 'User/Admin',
    commandPreview: 'syskey.exe',
    requiresAdmin: true,
    riskLevel: 'high',
    classification: 'OBSOLETE',
    documentation: 'Syskey was permanently removed by Microsoft in 2017. Use BitLocker Drive Encryption for full volume security.',
    tags: ['syskey', 'sam', 'bitlocker', 'obsolete']
  }
];
