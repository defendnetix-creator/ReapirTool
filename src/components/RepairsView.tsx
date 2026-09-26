import React, { useState } from 'react';
import {
  Wrench,
  ShieldAlert,
  RotateCcw,
  Network,
  Printer,
  FileCheck,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  ArrowRight,
  HardDrive,
  FileText,
  BookmarkPlus,
  Play,
  RefreshCw,
  FolderOpen,
  Search,
  Sliders,
  Check
} from 'lucide-react';
import { RepairToolItem } from '../types';
import { operationsClient } from '../api/operationsClient';
import { BackupRecoverySection } from './repairs/BackupRecoverySection';
import { OfficeOutlookSection } from './repairs/OfficeOutlookSection';
import { SuperRepairSection } from './repairs/SuperRepairSection';
import { ProblemMasterHub } from './repairs/ProblemMasterHub';
import { WatchdogSection } from './repairs/WatchdogSection';
import { QuickAccessSection } from './repairs/QuickAccessSection';

interface ExtendedRepairItem extends RepairToolItem {
  operationId: string;
  isLongRunning?: boolean;
}

interface RepairsViewProps {
  onTriggerAction: (actionName: string, command: string, requiresAdmin?: boolean) => void;
  onRequestConfirmation: (item: RepairToolItem) => void;
  onExecuteOperation?: (operationId: string, params?: Record<string, any>, requiresAdmin?: boolean) => void;
}

export const RepairsView: React.FC<RepairsViewProps> = ({
  onTriggerAction,
  onRequestConfirmation,
  onExecuteOperation
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cbsLogsOpen, setCbsLogsOpen] = useState<boolean>(false);
  const [cbsLogData, setCbsLogData] = useState<{ logPath: string; entries: string[] } | null>(null);
  const [isLoadingLogs, setIsLoadingLogs] = useState<boolean>(false);
  const [customFileScanPath, setCustomFileScanPath] = useState<string>('C:\\Windows\\System32\\kernel32.dll');
  const [customWimPath, setCustomWimPath] = useState<string>('D:\\sources\\install.wim');
  const [customWimIndex, setCustomWimIndex] = useState<string>('');
  const [restorePointName, setRestorePointName] = useState<string>('Akshigo Manual Checkpoint');
  const [restorePointsList, setRestorePointsList] = useState<any[] | null>(null);
  const [isLoadingRestorePoints, setIsLoadingRestorePoints] = useState<boolean>(false);

  const repairItems: ExtendedRepairItem[] = [
    // --- SFC & DISM ---
    {
      id: 'sfc-scannow',
      operationId: 'repair.sfc.scannow',
      title: 'SFC /scannow Integrity Scan & Auto-Repair',
      category: 'Windows Repairs',
      description:
        'Scans the integrity of all protected Windows system files and replaces corrupted, modified, or damaged manifests with trusted Microsoft versions.',
      estimatedDuration: '3-8 mins',
      requiresAdmin: true,
      requiresRestart: false,
      isLongRunning: true,
      actionCommand: 'sfc /scannow',
      icon: 'FileCheck',
      details: [
        'Executes elevated sfc /scannow in protected subshell',
        'Validates CBS component store signatures',
        'Restores damaged DLLs from %windir%\\System32\\dllcache'
      ]
    },
    {
      id: 'sfc-verifyonly',
      operationId: 'repair.sfc.verifyonly',
      title: 'SFC /verifyonly Audit Mode',
      category: 'Windows Repairs',
      description:
        'Audits protected system files and reports corrupted hashes to CBS.log without altering or replacing any disk files.',
      estimatedDuration: '2-5 mins',
      requiresAdmin: true,
      requiresRestart: false,
      isLongRunning: true,
      actionCommand: 'sfc /verifyonly',
      icon: 'FileCheck',
      details: [
        'Read-only integrity verification',
        'Detects modified system files without disk writes',
        'Logs violations directly to CBS.log'
      ]
    },
    {
      id: 'sfc-scanfile',
      operationId: 'repair.sfc.scanfile',
      title: 'SFC Scan Specific System File',
      category: 'Windows Repairs',
      description:
        'Validates and repairs a single user-specified system DLL, executable, or driver against the Component Store.',
      estimatedDuration: '15 secs',
      requiresAdmin: true,
      requiresRestart: false,
      actionCommand: `sfc /scanfile=${customFileScanPath}`,
      icon: 'FileCheck',
      details: [
        `Target: ${customFileScanPath}`,
        'Validates digital signature and manifest hash',
        'Restores healthy file from Component Store'
      ]
    },
    {
      id: 'dism-checkhealth',
      operationId: 'repair.dism.checkhealth',
      title: 'DISM CheckHealth Quick Scan',
      category: 'Windows Repairs',
      description:
        'Instantly checks whether the Windows Component Store has been flagged as corrupt by past servicing transactions.',
      estimatedDuration: '15 secs',
      requiresAdmin: true,
      requiresRestart: false,
      actionCommand: 'Dism.exe /Online /Cleanup-Image /CheckHealth',
      icon: 'Layers',
      details: [
        'Checks Component Store corruption flags',
        'Fast non-invasive servicing query',
        'Zero disk impact check'
      ]
    },
    {
      id: 'dism-scanhealth',
      operationId: 'repair.dism.scanhealth',
      title: 'DISM ScanHealth Deep Store Audit',
      category: 'Windows Repairs',
      description:
        'Performs a full deep scan of all component packages and manifests to detect any latent corruption in WinSxS.',
      estimatedDuration: '2-5 mins',
      requiresAdmin: true,
      requiresRestart: false,
      isLongRunning: true,
      actionCommand: 'Dism.exe /Online /Cleanup-Image /ScanHealth',
      icon: 'Layers',
      details: [
        'Deep package manifest hash verification',
        'Reports if store is repairable or healthy',
        'Prepares servicing engine for repair'
      ]
    },
    {
      id: 'dism-restorehealth',
      operationId: 'repair.dism.restorehealth',
      title: 'DISM RestoreHealth (Cloud Servicing)',
      category: 'Windows Repairs',
      description:
        'Repairs damaged Windows Component Store packages using official Microsoft Windows Update cloud payload images.',
      estimatedDuration: '5-12 mins',
      requiresAdmin: true,
      requiresRestart: false,
      isLongRunning: true,
      actionCommand: 'Dism.exe /Online /Cleanup-Image /RestoreHealth',
      icon: 'Layers',
      details: [
        'Runs Dism.exe /Online /Cleanup-Image /RestoreHealth',
        'Downloads clean payload files via Windows Update',
        'Replaces modified packages without re-installing Windows'
      ]
    },
    {
      id: 'dism-source-wim',
      operationId: 'repair.dism.source_wim',
      title: 'DISM Repair from ISO/WIM Source',
      category: 'Windows Repairs',
      description:
        'Repairs the running Windows component store using a local install.wim/install.esd image and its selected index, without cloud access.',
      estimatedDuration: '5-10 mins',
      requiresAdmin: true,
      requiresRestart: false,
      isLongRunning: true,
      actionCommand: `Dism.exe /Online /Cleanup-Image /RestoreHealth /Source:${customWimPath.toLowerCase().endsWith('.esd') ? 'esd' : 'wim'}:${customWimPath}:${customWimIndex || '<index>'} /LimitAccess`,
      icon: 'Layers',
      details: [
        `Source: ${customWimPath}`,
        'Uses /LimitAccess to block external cloud connections',
        'Ideal for offline or air-gapped technician environments'
      ]
    },
    {
      id: 'dism-clean-store',
      operationId: 'repair.dism.clean_store',
      title: 'DISM Component Store Cleanup',
      category: 'Windows Repairs',
      description:
        'Removes superseded component packages using StartComponentCleanup.',
      estimatedDuration: '3-6 mins',
      requiresAdmin: true,
      requiresRestart: false,
      isLongRunning: true,
      actionCommand: 'Dism.exe /Online /Cleanup-Image /StartComponentCleanup',
      icon: 'HardDrive',
      details: [
        'Removes superseded service pack updates',
        'Executes StartComponentCleanup',
        'Space recovered depends on the installed updates'
      ]
    },
    {
      id: 'sfc-dism-full',
      operationId: 'repair.sfc_dism.full',
      title: 'Full SFC + DISM Autonomous Super Repair',
      category: 'Windows Repairs',
      description:
        'Runs SFC /scannow followed by DISM RestoreHealth, preserving the original Full SFC + DISM sequence.',
      estimatedDuration: '8-18 mins',
      requiresAdmin: true,
      requiresRestart: false,
      isLongRunning: true,
      actionCommand: 'sfc /scannow then Dism.exe /Online /Cleanup-Image /RestoreHealth',
      icon: 'Zap',
      details: [
        'Step 1: SFC /scannow protected file validation',
        'Step 2: DISM RestoreHealth servicing repair',
        'Stops and reports failures before continuing'
      ]
    },

    // --- WINDOWS UPDATE REPAIR ---
    {
      id: 'wu-reset-services',
      operationId: 'repair.wu.reset_services',
      title: 'Stop / Restart Windows Update Services',
      category: 'Windows Repairs',
      description:
        'Safely stops wuauserv, bits, cryptSvc, and msiserver, flushes service state buffers, and cleanly restarts all daemons.',
      estimatedDuration: '30 secs',
      requiresAdmin: true,
      requiresRestart: false,
      actionCommand: 'net stop wuauserv & net stop bits & net start bits & net start wuauserv',
      icon: 'RotateCcw',
      details: [
        'Restarts Windows Update (wuauserv)',
        'Restarts Background Intelligent Transfer (BITS)',
        'Restarts Cryptographic Services (cryptSvc)'
      ]
    },
    {
      id: 'wu-softwaredist-reset',
      operationId: 'repair.wu.softwaredist_reset',
      title: 'SoftwareDistribution Cache Reset',
      category: 'Windows Repairs',
      description:
        'Stops update services, renames corrupted C:\\Windows\\SoftwareDistribution to .bak, and forces a clean catalog recreation.',
      estimatedDuration: '1 min',
      requiresAdmin: true,
      requiresRestart: false,
      actionCommand: 'OneClickSuperRepair.ps1 -ResetSoftwareDistribution',
      icon: 'RotateCcw',
      details: [
        'Stops wuauserv and bits',
        'Renames C:\\Windows\\SoftwareDistribution cache',
        'Clears stuck update download blobs'
      ]
    },
    {
      id: 'wu-catroot2-reset',
      operationId: 'repair.wu.catroot2_reset',
      title: 'Catroot2 Signature Catalog Store Reset',
      category: 'Windows Repairs',
      description:
        'Rebuilds corrupted Catroot2 package signature database in %SystemRoot%\\System32\\catroot2 to fix 0x800b0100 errors.',
      estimatedDuration: '45 secs',
      requiresAdmin: true,
      requiresRestart: false,
      actionCommand: 'OneClickSuperRepair.ps1 -ResetCatroot2',
      icon: 'RotateCcw',
      details: [
        'Stops cryptsvc service',
        'Rebuilds Catroot2 signature store',
        'Resolves cryptographic verification failures'
      ]
    },
    {
      id: 'wu-diagnostics',
      operationId: 'repair.wu.diagnostics',
      title: 'Windows Update Policy & Service Diagnostics',
      category: 'Windows Repairs',
      description:
        'Scans Group Policy registry keys for WSUS update blocks, validates BITS transfer queues, and audits connectivity to update endpoints.',
      estimatedDuration: '20 secs',
      requiresAdmin: true,
      requiresRestart: false,
      actionCommand: 'OneClickSuperRepair.ps1 -WUDiagnostics',
      icon: 'FileText',
      details: [
        'Audits HKLM\\Software\\Policies\\Microsoft\\Windows\\WindowsUpdate',
        'Validates BITS transfer job status',
        'Reports pending update state and blockers'
      ]
    },

    // --- EXPLORER & APP REPAIRS ---
    {
      id: 'explorer-restart',
      operationId: 'repair.explorer.restart',
      title: 'Restart Windows Explorer Shell',
      category: 'Windows Repairs',
      description:
        'Gracefully restarts explorer.exe process to unfreeze the desktop, taskbar, system tray icons, and file dialogs.',
      estimatedDuration: '10 secs',
      requiresAdmin: false,
      requiresRestart: false,
      actionCommand: 'taskkill /f /im explorer.exe & start explorer.exe',
      icon: 'RefreshCw',
      details: [
        'Sends graceful termination signal to explorer.exe',
        'Clears frozen shell hooks',
        'Spawns fresh shell instance immediately'
      ]
    },
    {
      id: 'startmenu-troubleshoot',
      operationId: 'repair.startmenu.troubleshoot',
      title: 'Start Menu & ShellExperienceHost Repair',
      category: 'Windows Repairs',
      description:
        'Remediates frozen Start Menu, notification center, and taskbar widgets by refreshing ShellExperienceHost and local tile databases.',
      estimatedDuration: '20 secs',
      requiresAdmin: true,
      requiresRestart: false,
      actionCommand: 'OneClickSuperRepair.ps1 -RepairStartMenu',
      icon: 'Sliders',
      details: [
        'Terminates hung StartMenuExperienceHost.exe',
        'Resets corrupted AppX Shell Experience database',
        'Restores Start Menu search responsiveness'
      ]
    },
    {
      id: 'store-wsreset',
      operationId: 'repair.store.wsreset',
      title: 'Microsoft Store Cache Reset (wsreset)',
      category: 'Windows Repairs',
      description:
        'Clears the Microsoft Store download cache and resets application catalog manifests to fix download errors.',
      estimatedDuration: '30 secs',
      requiresAdmin: true,
      requiresRestart: false,
      actionCommand: 'wsreset.exe',
      icon: 'RotateCcw',
      details: [
        'Executes official Microsoft wsreset.exe utility',
        'Purges corrupted WinRT app store cache',
        'Resolves 0x80073D02 and 0x80070005 store errors'
      ]
    },
    {
      id: 'store-reregister',
      operationId: 'repair.store.reregister',
      title: 'Re-register Windows Store & Inbox Apps',
      category: 'Windows Repairs',
      description:
        'Re-registers all native Windows AppX packages via clean PowerShell cmdlets to restore missing system apps.',
      estimatedDuration: '1 min',
      requiresAdmin: true,
      requiresRestart: false,
      isLongRunning: true,
      actionCommand: 'Get-AppXPackage *WindowsStore* | Foreach {Add-AppxPackage -DisableDevelopmentMode -Register "$($_.InstallLocation)\\AppXManifest.xml"}',
      icon: 'Layers',
      details: [
        'Re-registers Microsoft.WindowsStore',
        'Re-indexes AppX package manifests',
        'Fixes deleted or unclickable modern apps'
      ]
    },
    {
      id: 'msi-repair',
      operationId: 'repair.msi.repair',
      title: 'Windows Installer (msiexec) Service Repair',
      category: 'Windows Repairs',
      description:
        'Unregisters and cleanly re-registers the msiexec.exe core engine and restores default service registry permissions.',
      estimatedDuration: '15 secs',
      requiresAdmin: true,
      requiresRestart: false,
      actionCommand: 'msiexec /unregister & msiexec /regserver',
      icon: 'Wrench',
      details: [
        'Executes msiexec /unregister and /regserver',
        'Validates Windows Installer service configuration',
        'Resolves error 1719 (Windows Installer not accessible)'
      ]
    },
    {
      id: 'time-sync',
      operationId: 'repair.time.sync',
      title: 'Force Time Synchronization (w32tm)',
      category: 'Windows Repairs',
      description:
        'Forces local system clock resynchronization against time.windows.com to fix SSL/TLS handshake failures and token timeouts.',
      estimatedDuration: '15 secs',
      requiresAdmin: true,
      requiresRestart: false,
      actionCommand: 'w32tm /resync /rediscover',
      icon: 'Clock',
      details: [
        'Queries official time.windows.com NTP source',
        'Resynchronizes CMOS and kernel timer',
        'Eliminates SSL certificate validation failures'
      ]
    },

    // --- RECOVERY & RESTORE ---
    {
      id: 'recovery-create-point',
      operationId: 'repair.recovery.create_restore_point',
      title: 'Create System Restore Point Checkpoint',
      category: 'Recovery & Restore',
      description:
        'Instantly creates a Volume Shadow Copy system restore point before making low-level system adjustments.',
      estimatedDuration: '30 secs',
      requiresAdmin: true,
      requiresRestart: false,
      actionCommand: `Checkpoint-Computer -Description "${restorePointName}"`,
      icon: 'BookmarkPlus',
      details: [
        `Description: ${restorePointName}`,
        'Captures system registry and driver snapshots',
        'Provides instant rollback protection'
      ]
    },
    {
      id: 'recovery-open-options',
      operationId: 'repair.recovery.open_options',
      title: 'Open System Protection & Recovery Options',
      category: 'Recovery & Restore',
      description:
        'Launches the native Windows System Protection properties dialog for configuring restore disk allocations and safe rollbacks.',
      estimatedDuration: '5 secs',
      requiresAdmin: false,
      requiresRestart: false,
      actionCommand: 'systempropertiesprotection.exe',
      icon: 'FolderOpen',
      details: [
        'Launches SystemPropertiesProtection.exe',
        'Configure shadow copy disk space limits',
        'Safe manual restore wizard'
      ]
    },

    // --- NETWORK REPAIRS ---
    {
      id: 'net-flush-dns',
      operationId: 'network.dns.flush',
      title: 'Flush DNS Resolver Cache',
      category: 'Network Repairs',
      description:
        'Flushes local DNS cache table and clears cached outdated IP resolutions across all adapters.',
      estimatedDuration: '10 secs',
      requiresAdmin: true,
      requiresRestart: false,
      actionCommand: 'ipconfig /flushdns',
      icon: 'Network',
      details: [
        'Executes ipconfig /flushdns',
        'Clears corrupt DNS name resolutions',
        'Forces fresh lookups to configured DNS servers'
      ]
    },
    {
      id: 'net-winsock-reset',
      operationId: 'network.winsock.reset',
      title: 'Reset Winsock Catalog & Sockets',
      category: 'Network Repairs',
      description:
        'Resets the Windows socket catalog to factory defaults to repair socket errors and LSP corruption.',
      estimatedDuration: '20 secs',
      requiresAdmin: true,
      requiresRestart: true,
      actionCommand: 'netsh winsock reset',
      icon: 'Network',
      details: [
        'Executes netsh winsock reset catalog',
        'Unbinds third-party socket filter hooks',
        'Requires system reboot to finalize'
      ]
    },
    {
      id: 'net-tcpip-reset',
      operationId: 'network.tcpip.reset',
      title: 'Reset TCP/IP Protocol Stack',
      category: 'Network Repairs',
      description:
        'Completely rewrites TCP/IP protocol stack registry configuration to resolve stubborn connection drops.',
      estimatedDuration: '20 secs',
      requiresAdmin: true,
      requiresRestart: false,
      actionCommand: 'netsh int ip reset C:\\resetlog.txt',
      icon: 'Network',
      details: [
        'Executes netsh int ip reset C:\\resetlog.txt',
        'Reconstructs TCP/IP interface bindings',
        'Saves transaction audit log to C:\\resetlog.txt'
      ]
    },
    {
      id: 'net-ip-renew',
      operationId: 'network.ip.renew',
      title: 'Renew DHCP IP Address Lease',
      category: 'Network Repairs',
      description:
        'Releases stale IP addresses and negotiates fresh IPv4/IPv6 leases from the local network DHCP server.',
      estimatedDuration: '15 secs',
      requiresAdmin: true,
      requiresRestart: false,
      actionCommand: 'ipconfig /renew',
      icon: 'RefreshCw',
      details: [
        'Executes ipconfig /release followed by /renew',
        'Requests fresh gateway and subnet allocation',
        'Resolves IP conflict errors'
      ]
    },
    {
      id: 'net-common-workflow',
      operationId: 'network.workflow.common_repair',
      title: 'Automated 5-Step Connectivity Recovery',
      category: 'Network Repairs',
      description:
        'Autonomous remediation pipeline: executes DNS flush, Winsock reset, TCP/IP stack reset, DHCP renewal, and proxy reset in one click.',
      estimatedDuration: '1-2 mins',
      requiresAdmin: true,
      requiresRestart: true,
      isLongRunning: true,
      actionCommand: 'OneClickSuperRepair.ps1 -NetworkSuite',
      icon: 'Zap',
      details: [
        'Step 1: Flush DNS resolver cache',
        'Step 2: Reset Winsock catalog',
        'Step 3: Reset TCP/IP stack',
        'Step 4: Renew DHCP address lease',
        'Step 5: Reset proxy configurations'
      ]
    },

    // --- PRINTER & SPOOLER REPAIRS ---
    {
      id: 'printer-spooler-restart',
      operationId: 'printer.spooler.restart',
      title: 'Restart Print Spooler & Purge Stuck Queue',
      category: 'Printer Repairs',
      description:
        'Terminates jammed spoolsv.exe processes, purges locked .SHD and .SPL job files from C:\\Windows\\System32\\spool\\PRINTERS, and restarts the spooler.',
      estimatedDuration: '20 secs',
      requiresAdmin: true,
      requiresRestart: false,
      actionCommand: 'Stop-Service Spooler -Force; Remove-Item C:\\Windows\\System32\\spool\\PRINTERS\\* -Force; Start-Service Spooler',
      icon: 'Printer',
      details: [
        'Stops Print Spooler service safely',
        'Purges corrupt spool manifests (*.spl, *.shd)',
        'Restarts Spooler and unlocks print port buffers'
      ]
    },
    {
      id: 'printer-queue-purge',
      operationId: 'printer.queue.purge',
      title: 'Clear Stuck Print Queue Jobs Only',
      category: 'Printer Repairs',
      description:
        'Safely cancels and purges locked documents in all print queues without interrupting active spooler threads.',
      estimatedDuration: '15 secs',
      requiresAdmin: true,
      requiresRestart: false,
      actionCommand: 'Printer_Analyzer_Pro.cs -PurgeQueues',
      icon: 'Printer',
      details: [
        'Terminates hung document jobs across all queues',
        'Frees locked printer communication handles',
        '0 printer restart downtime'
      ]
    },
    {
      id: 'printer-diagnostics-run',
      operationId: 'printer.diagnostics.run',
      title: 'Printer Analyzer Pro Full Diagnostics',
      category: 'Printer Repairs',
      description:
        'Audits RPC services, DcomLaunch, port connectivity (RAW 9100, LPR 515, WSD), and validates printer driver store integrity.',
      estimatedDuration: '15 secs',
      requiresAdmin: false,
      requiresRestart: false,
      actionCommand: 'Printer_Analyzer_Pro.cs -RunDiagnostics',
      icon: 'Printer',
      details: [
        'Audits RPC service endpoints (RpcSs)',
        'Tests printer IP port responsiveness',
        'Validates V3/V4 PCL-6 driver health'
      ]
    },
    {
      id: 'printer-offline-fix',
      operationId: 'printer.offline.fix',
      title: 'Fix Offline Printer Status Flag',
      category: 'Printer Repairs',
      description:
        'Queries SNMP port metrics and clears the WorkOffline registry flag to force printer back to online ready status.',
      estimatedDuration: '15 secs',
      requiresAdmin: true,
      requiresRestart: false,
      actionCommand: 'Set-Printer -Name "<DefaultPrinter>" -WorkOffline $false',
      icon: 'Printer',
      details: [
        'Queries SNMP port availability',
        'Sets WorkOffline flag to $false',
        'Restores immediate desktop printing'
      ]
    },
    {
      id: 'printer-sharing-audit',
      operationId: 'printer.sharing.diagnose',
      title: 'Printer Sharing & SMB Protocol Audit',
      category: 'Printer Repairs',
      description:
        'Inspects LanmanServer sharing status, verifies Point and Print group policies, and validates SMBv2/v3 print submission ports.',
      estimatedDuration: '15 secs',
      requiresAdmin: true,
      requiresRestart: false,
      actionCommand: 'Printer_Analyzer_Pro.cs -AuditSharing',
      icon: 'Printer',
      details: [
        'Audits LanmanServer print sharing',
        'Checks Point and Print restrictions',
        'Verifies port 445 network discovery'
      ]
    },
    {
      id: 'printer-fix-0x0000011b',
      operationId: 'printer.fix_0x0000011b',
      title: 'Remediate 0x0000011b Network Print Error',
      category: 'Printer Repairs',
      description:
        'Remediates Windows Update RPC privacy mismatch (0x0000011b) by applying authenticated RPC level compatibility configuration.',
      estimatedDuration: '20 secs',
      requiresAdmin: true,
      requiresRestart: false,
      actionCommand: 'reg add "HKLM\\System\\CurrentControlSet\\Control\\Print" /v RpcAuthnLevelPrivacyEnabled /t REG_DWORD /d 0 /f',
      icon: 'Printer',
      details: [
        'Sets RpcAuthnLevelPrivacyEnabled=0 compatibility key',
        'Cycles Spooler service to apply parameters',
        'Resolves network print sharing handshake errors'
      ]
    },
    {
      id: 'printer-fix-0x00000709',
      operationId: 'printer.fix_0x00000709',
      title: 'Remediate 0x00000709 Point & Print Error',
      category: 'Printer Repairs',
      description:
        'Corrects Point and Print default printer pointer corruption in user registry profiles and releases dead print handles.',
      estimatedDuration: '20 secs',
      requiresAdmin: true,
      requiresRestart: false,
      actionCommand: 'Printer_Analyzer_Pro.cs -Fix0x709',
      icon: 'Printer',
      details: [
        'Repairs corrupted default printer registry pointers',
        'Re-indexes Point and Print policies',
        'Fixes "Operation could not be completed (error 0x00000709)"'
      ]
    },
    {
      id: 'printer-subsystem-cleanup',
      operationId: 'printer.subsystem.cleanup',
      title: 'Deep Print Subsystem Cleanup',
      category: 'Printer Repairs',
      description:
        'Performs deep spool cleanup: terminates hung processes, purges orphan temp files, and re-registers spoolss.dll without deleting installed drivers.',
      estimatedDuration: '30 secs',
      requiresAdmin: true,
      requiresRestart: false,
      actionCommand: 'Printer_Analyzer_Pro.cs -SubsystemCleanup',
      icon: 'Printer',
      details: [
        'Stops Spooler gracefully',
        'Purges dead shadow buffers (*.tmp, *.shd, *.spl)',
        'Re-registers spoolss.dll and starts Spooler'
      ]
    }
  ];

  const handleOpenCbsLogs = async () => {
    setIsLoadingLogs(true);
    setCbsLogsOpen(true);
    try {
      const data = await operationsClient.getCbsLogs();
      setCbsLogData(data);
    } catch (err) {
      console.error('Failed to load CBS logs:', err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const handleFetchRestorePoints = async () => {
    setIsLoadingRestorePoints(true);
    try {
      const res = await operationsClient.getRestorePoints();
      setRestorePointsList(res.restorePoints || []);
    } catch (err) {
      console.error('Failed to query restore points:', err);
    } finally {
      setIsLoadingRestorePoints(false);
    }
  };

  const handleExecute = (item: ExtendedRepairItem) => {
    const params: Record<string, any> = {};
    if (item.operationId === 'repair.sfc.scanfile') {
      params.filePath = customFileScanPath;
    } else if (item.operationId === 'repair.dism.source_wim') {
      params.sourcePath = customWimPath;
      params.sourceIndex = Number(customWimIndex);
    } else if (item.operationId === 'repair.recovery.create_restore_point') {
      params.description = restorePointName;
    }

    if (onExecuteOperation) {
      onExecuteOperation(item.operationId, params, item.requiresAdmin);
    } else {
      onRequestConfirmation(item);
    }
  };

  const filteredItems = repairItems
    .filter((item) => (activeCategory === 'All' ? true : item.category === activeCategory))
    .filter(
      (item) =>
        searchQuery === '' ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.operationId.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto overflow-y-auto">
      {/* Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-white">
              Autonomous Repair & Remediation Center
            </h1>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
              SAFETY CHECKS ENFORCED
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-500/30">
              PHASE 8.2 PARITY ACTIVE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Deterministic repair playbooks covering SFC / DISM, Windows Update recovery, Start menu/Explorer repairs, network stacks, and Printer Analyzer Pro.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleOpenCbsLogs}
            className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white border border-white/[0.08] text-xs font-mono flex items-center gap-1.5 transition-all"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>CBS Log Viewer</span>
          </button>

          <button
            onClick={() => {
              setActiveCategory('Recovery & Restore');
              handleFetchRestorePoints();
            }}
            className="px-3 py-1.5 rounded-lg bg-cyan-950/50 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/30 text-xs font-mono flex items-center gap-1.5 transition-all"
          >
            <BookmarkPlus className="w-3.5 h-3.5" />
            <span>Restore Points</span>
          </button>
        </div>
      </div>

      {/* Category Tabs & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          {[
            'All',
            'Problem Master Hub',
            'One-Click Super Repair',
            'Windows Repairs',
            'Network Repairs',
            'Printer Repairs',
            'Recovery & Restore',
            'Office & Outlook',
            'SelfHeal Watchdog',
            'Quick Access'
          ].map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                }`}
              >
                {cat}
              </button>
            )
          )}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tools or operation IDs..."
            className="w-full bg-[#0a0d15] border border-white/[0.08] rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500/50 placeholder:text-slate-600"
          />
        </div>
      </div>

      {/* Target Parameters Bar (for custom scans) */}
      {(activeCategory === 'All' || activeCategory === 'Windows Repairs' || activeCategory === 'Recovery & Restore') && (
        <div className="p-3.5 rounded-xl bg-[#0a0e18] border border-white/[0.06] flex flex-wrap items-center gap-4 text-xs font-mono text-slate-300">
          <span className="text-slate-400 font-bold flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            Active Parameters:
          </span>

          <div className="flex items-center gap-2">
            <label className="text-slate-500 text-[11px]">SFC Target File:</label>
            <input
              type="text"
              value={customFileScanPath}
              onChange={(e) => setCustomFileScanPath(e.target.value)}
              className="bg-[#05070c] border border-white/[0.08] rounded px-2 py-1 text-[11px] text-cyan-300 w-56 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-slate-500 text-[11px]">DISM WIM Source:</label>
            <input
              type="text"
              value={customWimPath}
              onChange={(e) => setCustomWimPath(e.target.value)}
              className="bg-[#05070c] border border-white/[0.08] rounded px-2 py-1 text-[11px] text-cyan-300 w-52 focus:outline-none focus:border-cyan-500"
            />
            <label className="text-slate-500 text-[11px]">Image index:</label>
            <input aria-label="WIM or ESD image index" type="number" min="1" step="1" value={customWimIndex}
              onChange={(e) => setCustomWimIndex(e.target.value)}
              className="bg-[#05070c] border border-white/[0.08] rounded px-2 py-1 text-[11px] text-cyan-300 w-16" />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-slate-500 text-[11px]">Restore Point Label:</label>
            <input
              type="text"
              value={restorePointName}
              onChange={(e) => setRestorePointName(e.target.value)}
              className="bg-[#05070c] border border-white/[0.08] rounded px-2 py-1 text-[11px] text-cyan-300 w-56 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>
      )}

      {/* Problem Master Hub Dedicated Suite */}
      {activeCategory === 'Problem Master Hub' && (
        <ProblemMasterHub onExecuteOperation={onExecuteOperation} />
      )}

      {/* One-Click Super Repair Dedicated Suite */}
      {activeCategory === 'One-Click Super Repair' && (
        <SuperRepairSection onExecuteOperation={onExecuteOperation} />
      )}

      {/* SelfHeal Watchdog Dedicated Suite */}
      {activeCategory === 'SelfHeal Watchdog' && (
        <WatchdogSection />
      )}

      {/* Quick Access Dedicated Suite */}
      {activeCategory === 'Quick Access' && (
        <QuickAccessSection onExecuteOperation={onExecuteOperation} />
      )}

      {/* Backup & Recovery Dedicated Suite */}
      {activeCategory === 'Recovery & Restore' && (
        <BackupRecoverySection onExecuteOperation={onExecuteOperation} />
      )}

      {/* Office & Outlook Dedicated Suite */}
      {activeCategory === 'Office & Outlook' && (
        <OfficeOutlookSection onExecuteOperation={onExecuteOperation} />
      )}

      {/* Repair Cards Grid */}
      {activeCategory !== 'Recovery & Restore' &&
        activeCategory !== 'Office & Outlook' &&
        activeCategory !== 'Problem Master Hub' &&
        activeCategory !== 'One-Click Super Repair' &&
        activeCategory !== 'SelfHeal Watchdog' &&
        activeCategory !== 'Quick Access' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-xl bg-[#0e121c] border border-white/[0.07] hover:border-cyan-500/30 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                    {item.category === 'Printer Repairs' ? (
                      <Printer className="w-4 h-4 text-amber-400" />
                    ) : item.category === 'Network Repairs' ? (
                      <Network className="w-4 h-4 text-blue-400" />
                    ) : (
                      <Wrench className="w-4 h-4 text-cyan-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xs font-mono font-bold text-white leading-tight">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-slate-500 font-mono">
                        {item.category}
                      </span>
                      <span className="text-[9px] text-cyan-500/80 font-mono">
                        [{item.operationId}]
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {item.isLongRunning && (
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-950/50 text-blue-400 border border-blue-500/30">
                      ASYNC
                    </span>
                  )}
                  {item.requiresAdmin && (
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-950/50 text-amber-400 border border-amber-500/30">
                      ADMIN
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {item.description}
              </p>

              {/* Sub-steps checklist */}
              <div className="p-3 rounded-lg bg-[#131826] border border-white/[0.04] space-y-1.5 text-[11px] font-mono text-slate-400">
                {item.details.map((detail, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{detail}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500">
                <Clock className="w-3.5 h-3.5" />
                <span>Est: {item.estimatedDuration}</span>
              </div>

              <button
                onClick={() => handleExecute(item)}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold transition-all shadow-[0_0_12px_rgba(16,185,129,0.2)] flex items-center gap-1.5"
              >
                <span>Run Operation</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* CBS Log Viewer Modal */}
      {cbsLogsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-3xl bg-[#0b0e17] border border-white/[0.12] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#0e1322]">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-cyan-400" />
                <div>
                  <h2 className="text-sm font-bold text-white font-mono">
                    Windows Component-Based Servicing (CBS) Log Viewer
                  </h2>
                  <p className="text-xs text-slate-400 font-mono">
                    {cbsLogData?.logPath || 'C:\\Windows\\Logs\\CBS\\CBS.log'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCbsLogsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-[#05070c] font-mono text-xs overflow-y-auto max-h-[420px] space-y-1 text-slate-300">
              {isLoadingLogs ? (
                <div className="flex items-center gap-2 text-cyan-400 py-8 justify-center">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Loading CBS servicing stream...</span>
                </div>
              ) : cbsLogData?.entries ? (
                cbsLogData.entries.map((line, idx) => (
                  <div
                    key={idx}
                    className={`leading-relaxed ${
                      line.includes('[SR]')
                        ? 'text-cyan-300 font-semibold'
                        : line.includes('Repair') || line.includes('SUCCESS')
                        ? 'text-emerald-300'
                        : 'text-slate-400'
                    }`}
                  >
                    {line}
                  </div>
                ))
              ) : (
                <div className="text-slate-500 italic">No log entries available.</div>
              )}
            </div>

            <div className="px-6 py-3 bg-[#0a0d14] border-t border-white/[0.06] flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-500">
                Extracted via elevated loopback RPC
              </span>
              <button
                onClick={() => setCbsLogsOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.12] text-white text-xs font-mono font-bold"
              >
                Close Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Points Drawer/List */}
      {restorePointsList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-[#0b0e17] border border-white/[0.12] rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2.5">
                <BookmarkPlus className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold font-mono text-white">
                  Active Windows System Restore Points
                </h3>
              </div>
              <button
                onClick={() => setRestorePointsList(null)}
                className="text-slate-400 hover:text-white font-mono text-xs"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {restorePointsList.map((rp, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-[#0e1320] border border-white/[0.05] flex items-center justify-between text-xs font-mono"
                >
                  <div>
                    <div className="text-white font-bold">{rp.description}</div>
                    <div className="text-slate-500 text-[11px]">
                      Created: {new Date(rp.creationTime).toLocaleString()} • Seq #{rp.sequenceNumber}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950/60 text-cyan-400 border border-cyan-500/30">
                    {rp.restorePointType}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
