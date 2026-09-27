/**
 * Operation Engine Types
 * Akshigo PC Toolkit Pro v8.0.0-rc.1
 * Phase 8.2: Windows Repair + Network + Printer Feature Parity
 */

export type JobStatus = 'RUNNING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';

export type OperationCategory =
  | 'Windows Repair'
  | 'Network'
  | 'Printer'
  | 'Hardware'
  | 'Driver'
  | 'Storage'
  | 'Reports'
  | 'Backup'
  | 'Services'
  | 'Event Logs'
  | 'System'
  | 'Accounts'
  | 'Policy'
  | 'Office'
  | 'Remote Access'
  | 'Boot / BIOS'
  | 'Software'
  | 'Portable Tools'
  | 'Deployment'
  | 'Performance'
  | 'Developer Tools';

export interface OperationJob {
  jobId: string;
  operationId: string;
  category: OperationCategory;
  status: JobStatus;
  progressPercent: number;
  currentStep: string;
  logs: string[];
  result?: any;
  error?: string;
  startTime: string;
  endTime?: string;
  requiresAdmin: boolean;
  canCancel: boolean;
}

export interface OperationDefinition {
  id: string;
  category: OperationCategory;
  name: string;
  description: string;
  requiresAdmin: boolean;
  estimatedDuration: string;
  risk: 'safe' | 'moderate' | 'high';
  isLongRunning: boolean;
}

export interface NetworkAdapterInfo {
  id: string;
  name: string;
  description: string;
  macAddress: string;
  status: 'Up' | 'Down' | 'Disconnected';
  ipv4Address: string;
  ipv4Subnet: string;
  gateway: string;
  dnsServers: string[];
  dhcpEnabled: boolean;
  dhcpServer?: string;
  leaseObtained?: string;
  leaseExpires?: string;
  isWifi: boolean;
  ssid?: string;
  signalPercent?: number;
  isApipa: boolean;
  speedMbps: number;
}

export interface NetworkDiagnosticsResult {
  connectivity: {
    gatewayReachable: boolean;
    gatewayLatencyMs: number;
    dnsReachable: boolean;
    dnsLatencyMs: number;
    internetReachable: boolean;
    internetLatencyMs: number;
  };
  apipaDetected: boolean;
  apipaDetails?: string;
  proxy: {
    enabled: boolean;
    server?: string;
    exceptions?: string;
  };
  dnsLookupTest: {
    hostname: string;
    resolvedIps: string[];
    responseTimeMs: number;
  };
  tracerouteHops: Array<{
    hop: number;
    ip: string;
    latencyMs: number;
  }>;
}

export interface NetstatSocketEntry {
  protocol: 'TCP' | 'UDP';
  localAddress: string;
  localPort: number;
  foreignAddress: string;
  foreignPort: number;
  state: 'LISTENING' | 'ESTABLISHED' | 'TIME_WAIT' | 'CLOSE_WAIT' | 'BOUND';
  pid: number;
  processName: string;
}

export interface PrinterInfo {
  id: string;
  name: string;
  isDefault: boolean;
  status: 'Ready' | 'Offline' | 'Error' | 'Paused' | 'Printing' | 'Unknown';
  queueCount: number | null;
  port: string;
  driverName: string;
  driverVersion: string | null;
  isShared: boolean;
  shareName?: string;
  location?: string;
  colorSupported: boolean | null;
  duplexSupported: boolean | null;
  diagnosticNotes?: string;
}

export interface RestorePointInfo {
  sequenceNumber: number;
  description: string;
  creationTime: string;
  restorePointType: 'APPLICATION_INSTALL' | 'SYSTEM_CHECKPOINT' | 'DEVICE_DRIVER_INSTALL' | 'MANUAL' | 'MANUAL_CHECKPOINT' | 'SYSTEM_UPDATE' | 'DEVICE_DRIVER';
  eventType: 'BEGIN_NESTED_SYSTEM_CHANGE' | 'BEGIN_SYSTEM_CHANGE' | 'END_SYSTEM_CHANGE' | 'END_NESTED_SYSTEM_CHANGE';
}

export interface HardwareSystemInfo {
  manufacturer: string;
  model: string;
  serialNumber: string;
  motherboard: {
    manufacturer: string;
    product: string;
    serialNumber: string;
  };
  bios: {
    vendor: string;
    version: string;
    releaseDate: string;
    isUefi: boolean;
    secureBoot: boolean;
  };
  cpu: {
    name: string;
    cores: number;
    logicalProcessors: number;
    baseClockGhz: number;
    maxClockGhz: number;
    currentUtilizationPercent: number;
    architecture: string;
  };
  ram: {
    totalBytes: number;
    totalGB: number;
    usedGB: number;
    freeGB: number;
    utilizationPercent: number;
    speedMhz: number;
    slotsUsed: number;
    slotsTotal: number;
    memoryType: string;
  };
  gpus: Array<{
    name: string;
    driverVersion: string;
    vramGB: number;
    status: string;
  }>;
  storageSummary: {
    driveCount: number;
    totalCapacityGB: number;
    freeCapacityGB: number;
  };
  networkAdaptersCount: number;
}

export interface ProblemDevice {
  deviceId: string;
  friendlyName: string;
  status: string;
  problemCode: number;
  problemDescription: string;
  deviceClass: string;
  hardwareIds: string[];
}

export interface BatteryHealthInfo {
  present: boolean;
  name: string;
  status: string;
  chargePercent: number;
  estimatedRunTimeMinutes?: number;
  designCapacityMWh: number;
  fullChargeCapacityMWh: number;
  wearLevelPercent: number;
  healthPercent: number;
  cycleCount?: number;
  isCharging: boolean;
  powerScheme: string;
}

export interface ThermalInfo {
  available: boolean;
  cpuTempCelsius?: number | string;
  systemTempCelsius?: number | string;
  gpuTempCelsius?: number | string;
  thermalZoneCount: number;
  notes: string;
}

export interface DriverItem {
  id: string;
  deviceClass: string;
  className: string;
  provider: string;
  driverDate: string;
  driverVersion: string;
  signer: string;
  infPath: string;
  isSigned: boolean;
  status: 'Operational' | 'Problem' | 'Disabled' | 'Unknown';
  problemCode?: number;
  matchingDeviceId?: string;
}

export interface DriverBackupResult {
  destinationPath: string;
  totalExportedCount: number;
  durationSeconds: number;
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  exportedPackages: string[];
}

export interface DriverRestoreResult {
  sourcePath: string;
  packagesDiscovered: number;
  installedCount: number;
  failedCount: number;
  status: 'SUCCESS' | 'FAILED';
  installedInfList: string[];
}

export interface PhysicalDiskInfo {
  diskIndex: number;
  model: string;
  busType: string;
  mediaType: 'SSD' | 'HDD' | 'NVMe' | 'SCM' | 'Unspecified';
  sizeBytes: number;
  sizeGB: number;
  serialNumber: string;
  healthStatus: 'Healthy' | 'Warning' | 'Unhealthy' | 'Unknown';
  operationalStatus: string;
  partitionCount: number;
  isBootDisk: boolean;
}

export interface SmartHealthInfo {
  diskIndex: number;
  model: string;
  temperatureCelsius: number;
  healthStatus: 'PASSED' | 'WARNING' | 'FAILED';
  reallocatedSectorsCount: number;
  powerOnHours: number;
  powerCycles: number;
  unsafeShutdowns: number;
  wearPercentageRemaining: number;
  attributes: Array<{
    id: number;
    name: string;
    value: number;
    worst: number;
    threshold: number;
    raw: string;
    status: 'OK' | 'WARN' | 'BAD';
  }>;
}

export interface StorageVolumeInfo {
  driveLetter: string;
  label: string;
  fileSystem: string;
  totalBytes: number;
  totalGB: number;
  freeBytes: number;
  freeGB: number;
  usedGB: number;
  usedPercent: number;
  healthStatus: 'Healthy' | 'Degraded' | 'Unknown';
  isSystemVolume: boolean;
  bitLockerProtection: 'On' | 'Off' | 'Locked' | 'Unprotected';
}

export interface ChkdskScanResult {
  volume: string;
  mode: 'READ_ONLY' | 'REPAIR_SCHEDULED';
  clean: boolean;
  badSectors: number;
  summary: string;
  rebootRequired: boolean;
}

export interface DiskOptimizeStatus {
  volume: string;
  mediaType: 'SSD' | 'HDD' | 'NVMe';
  fragmentationPercent: number;
  trimSupported: boolean;
  lastRunTime?: string;
  recommendation: 'Optimal' | 'Optimize Needed' | 'Defrag Needed';
}

export interface StorageBenchmarkResult {
  volume: string;
  sequentialReadMBs: number;
  sequentialWriteMBs: number;
  randomRead4kIOPS: number;
  randomWrite4kIOPS: number;
  averageLatencyMs: number;
  testDurationSeconds: number;
}

export interface StorageCleanupAnalysis {
  userTempBytes: number;
  systemTempBytes: number;
  windowsUpdateCacheBytes: number;
  crashDumpsBytes: number;
  recycleBinBytes: number;
  totalReclaimableGB: number;
  largeFilesCount: number;
  topLargeFiles: Array<{
    name: string;
    path: string;
    sizeMB: number;
  }>;
}

export interface GeneratedReportInfo {
  reportId: string;
  reportType: 'System Inventory' | 'Battery Health' | 'Driver Manifest' | 'Storage Diagnostic' | 'Event Log' | 'Policy Audit';
  title: string;
  format: 'HTML' | 'CSV' | 'TXT';
  createdTimestamp: string;
  fileSizeBytes: number;
  filePath: string;
  summary: string;
  htmlContent?: string;
}

// --- PHASE 8.4: BACKUP & RESTORE ---
export interface BackupHistoryItem {
  id: string;
  backupType: 'RESTORE_POINT' | 'FILE_BACKUP' | 'REGISTRY_BACKUP' | 'DRIVER_BACKUP';
  name: string;
  sourcePath: string;
  targetPath: string;
  timestamp: string;
  sizeBytes: number;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  details: string;
}

export interface WinReStatusInfo {
  enabled: boolean;
  location: string;
  bootKey: string;
  bcdIdentifier: string;
  customImageConfigured: boolean;
}

export interface FileBackupResult {
  sourcePath: string;
  destinationPath: string;
  totalFiles: number;
  totalBytes: number;
  archiveName: string;
  hashSha256?: string;
}

export interface RegistryBackupResult {
  hive: string;
  exportPath: string;
  fileSizeBytes: number;
  timestamp: string;
  keyCount: number;
}

// --- PHASE 8.4: SERVICES & FEATURES ---
export interface ServiceItem {
  name: string;
  displayName: string;
  status: 'Running' | 'Stopped' | 'Paused' | 'Pending';
  startType: 'Automatic' | 'Manual' | 'Disabled' | 'Automatic (Delayed)';
  account: string;
  pid?: number;
  dependencies: string[];
  isCritical: boolean;
  category: 'System' | 'Network' | 'Security' | 'Hardware' | 'Audio/Visual' | 'Other';
}

export interface CriticalServiceStatus {
  serviceName: string;
  displayName: string;
  expectedStatus: 'Running';
  currentStatus: 'Running' | 'Stopped';
  isCompliant: boolean;
  remediationAvailable: boolean;
  description: string;
}

export interface OptionalFeatureInfo {
  featureName: string;
  state: 'Enabled' | 'Disabled' | 'EnablePending' | 'DisablePending';
  restartRequired: boolean;
  category: 'Virtualization' | 'Developer' | 'Legacy' | 'Diagnostics' | 'System' | 'Security';
  description: string;
}

// --- PHASE 8.4: EVENT LOGS ---
export interface EventLogItem {
  id: string;
  recordNumber: number;
  logName: 'Application' | 'System' | 'Security' | 'Setup';
  level: 'Critical' | 'Error' | 'Warning' | 'Information';
  source: string;
  eventId: number;
  timeGenerated: string;
  message: string;
  categoryName?: string;
  computerName: string;
  taskCategory?: string;
}

export interface EventLogIssueSummary {
  crashesCount: number;
  serviceFailuresCount: number;
  unexpectedShutdownsCount: number;
  updateFailuresCount: number;
  diskEventsCount: number;
  driverErrorsCount: number;
  recentCriticalEvents: EventLogItem[];
}

export interface EventLogQueryFilter {
  logName?: 'Application' | 'System' | 'Security' | 'Setup';
  level?: 'Critical' | 'Error' | 'Warning' | 'Information' | 'All';
  eventId?: number;
  source?: string;
  search?: string;
  limit?: number;
}

// --- PHASE 8.4: SYSTEM & ADMINISTRATION ---
export interface ProcessItem {
  pid: number;
  name: string;
  cpuPercent: number;
  memoryMB: number;
  threadCount: number;
  responding: boolean;
  executablePath: string;
  commandLine?: string;
  company?: string;
}

export interface StartupItem {
  id: string;
  name: string;
  command: string;
  location: 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run' | 'HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run' | 'Startup Folder' | 'Task Scheduler';
  enabled: boolean;
  publisher: string;
  impact: 'High' | 'Medium' | 'Low' | 'Not Measured';
}

export interface ScheduledTaskItem {
  taskName: string;
  taskPath: string;
  state: 'Ready' | 'Running' | 'Disabled';
  lastRunTime?: string;
  nextRunTime?: string;
  lastResult: number;
  author?: string;
}

export interface EnvironmentVariablesInfo {
  userVariables: Record<string, string>;
  systemVariables: Record<string, string>;
  systemPath: string[];
  userPath: string[];
}

// --- PHASE 8.4: USER / ACCOUNT MANAGEMENT ---
export interface LocalUserInfo {
  username: string;
  fullName: string;
  enabled: boolean;
  isAdmin: boolean;
  accountType: 'Local' | 'Microsoft Account' | 'Domain';
  passwordRequired: boolean;
  passwordExpires: boolean;
  lastLogon?: string;
  profilePath: string;
  description: string;
}

export interface LocalGroupInfo {
  groupName: string;
  description: string;
  members: string[];
}

export interface UserAccountsData {
  currentUser: {
    username: string;
    domain: string;
    computerName: string;
    isAdmin: boolean;
    sid: string;
    profilePath: string;
  };
  localUsers: LocalUserInfo[];
  localGroups: LocalGroupInfo[];
}

// --- PHASE 8.4: REGISTRY / GROUP POLICY ---
export interface GPResultReportInfo {
  computerPolicyApplied: string[];
  userPolicyApplied: string[];
  appliedGPOs: Array<{
    name: string;
    guid: string;
    version: string;
    status: 'Enabled' | 'Disabled';
  }>;
  securitySettingsSummary: Record<string, string>;
  generatedAt: string;
}

// --- PHASE 8.5: OFFICE / OUTLOOK ---
export interface OfficeStatusInfo {
  isInstalled: boolean;
  edition: string;
  version: string;
  channel: string;
  installType: 'Click-to-Run' | 'MSI' | 'AppX / Store' | 'None';
  installPath: string;
  architecture: 'x64' | 'x86';
  installedApps: Array<{
    name: string;
    executable: string;
    detected: boolean;
    version: string;
  }>;
  activation: {
    licenseStatus: 'LICENSED' | 'OOB_GRACE' | 'NOTIFICATION' | 'UNLICENSED' | 'UNKNOWN';
    productName: string;
    partialKey: string;
    remainingDays: number;
    licenseType: 'Subscription' | 'Volume MAK' | 'Volume KMS' | 'Retail' | 'None';
  };
  outlook: {
    detected: boolean;
    defaultProfile: string;
    profilesCount: number;
    profiles: string[];
    cacheSizeMB: number;
    ostFiles: Array<{
      path: string;
      sizeMB: number;
    }>;
    scanpstPath?: string;
    scanpstInstalled?: boolean;
    scanpstDetected?: boolean;
  };
  onedrive: {
    installed: boolean;
    version: string;
    syncRunning: boolean;
  };
  teams: {
    installed: boolean;
    cacheSizeMB: number;
  };
  zoom: {
    installed: boolean;
    cacheSizeMB: number;
  };
}

// --- PHASE 8.5: REMOTE ACCESS & NETWORKING ---
export interface RdpStatusInfo {
  rdpEnabled: boolean;
  fDenyTSConnections: number;
  nlaEnabled: boolean;
  userAuthentication: number;
  portNumber: number;
  serviceState: 'Running' | 'Stopped' | 'Paused' | 'Unknown';
  serviceStartup: 'Auto' | 'Manual' | 'Disabled';
  firewallRulesEnabled: boolean;
  activeSessions: Array<{
    sessionId: number;
    sessionName: string;
    username: string;
    state: 'Active' | 'Conn' | 'Disc' | 'Listen';
    clientName?: string;
  }>;
}

export interface VpnProxyInfo {
  vpnAdapters: Array<{
    name: string;
    type: string;
    status: 'Connected' | 'Disconnected' | 'Connecting';
    serverAddress: string;
  }>;
  proxy: {
    enabled: boolean;
    server: string;
    autoDetect: boolean;
    autoConfigUrl: string;
    bypassList: string[];
  };
}

export interface SmbShareInfo {
  name: string;
  path: string;
  description: string;
  scope: string;
  special: boolean;
}

export interface MappedDriveInfo {
  driveLetter: string;
  uncPath: string;
  status: 'Connected' | 'Unavailable' | 'Disconnected';
  fileSystem: string;
  freeSpaceGB: number;
  totalSpaceGB: number;
}

// --- PHASE 8.5: BIOS, UEFI & BOOT ---
export interface BootBiosInfo {
  biosVendor: string;
  biosVersion: string;
  biosReleaseDate: string;
  smbiosVersion: string;
  uefiMode: boolean;
  secureBootEnabled: boolean;
  tpm: {
    present: boolean;
    specVersion: string;
    enabled: boolean;
    activated: boolean;
    manufacturer: string;
  };
  bootMode: 'Normal' | 'Safe Mode' | 'WinPE' | 'Recovery';
  bcd: {
    identifier: string;
    device: string;
    path: string;
    description: string;
    osDevice: string;
    systemRoot: string;
    nx: string;
    testsigning: boolean;
    hypervisorLaunchType: string;
  };
  winRe: {
    enabled: boolean;
    location: string;
    bcdIdentifier: string;
  };
}

// --- PHASE 8.5: POLICY ADVANCED DIAGNOSTICS ---
export interface PolicyDiagnosticsInfo {
  windowsUpdate: {
    noAutoUpdate: number; // 0 = enabled, 1 = disabled
    auOptions: number; // 2=notify, 3=download&notify, 4=auto install, 5=local admin
    useWUServer: boolean;
    wuServerUrl?: string;
    targetReleaseVersion?: string;
    policiesConfigured: boolean;
  };
  rdpPolicy: {
    fDenyTSConnections: number;
    userAuthentication: number;
    minEncryptionLevel: string;
  };
  defenderPolicy: {
    disableAntiSpyware: number;
    disableRealtimeMonitoring: number;
    puaProtection: number;
    cloudBlockLevel: string;
  };
  uacPolicy: {
    enableLUA: number;
    consentPromptBehaviorAdmin: number;
    promptOnSecureDesktop: number;
  };
}

// --- PHASE 8.6: SOFTWARE DEPLOYMENT, 100 APPS & PORTABLE TOOLS ---
export type AppInstallStatus = 'PENDING' | 'INSTALLING' | 'SUCCESS' | 'FAILED' | 'SKIPPED' | 'CANCELLED';

export interface SoftwareAppItem {
  id: string; // WinGet ID (e.g. Google.Chrome)
  name: string; // Display Name
  category:
    | 'Browsers'
    | 'Communication'
    | 'Media'
    | 'Utilities'
    | 'Productivity'
    | 'Developer Tools'
    | 'Remote Support'
    | 'Cloud Storage'
    | 'Security Utilities'
    | 'Runtimes'
    | 'Compression'
    | 'PDF Tools'
    | 'Hardware Utilities'
    | 'AI Tools';
  publisher: string;
  version: string;
  source: 'winget' | 'msstore' | 'official';
  packageManager: 'winget';
  installScope: 'machine' | 'user';
  requiresAdmin: boolean;
  license: string;
  description: string;
  sizeMB?: number;
  iconHint?: string;
  installed?: boolean;
  installedVersion?: string;
  updateAvailable?: boolean;
}

export interface SoftwareBundle {
  id: string;
  name: string;
  category: string;
  description: string;
  appIds: string[];
  requiresAdmin: boolean;
  estimatedTime: string;
}

export interface CustomBundle {
  id: string;
  name: string;
  description: string;
  appIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SoftwareInventoryItem {
  id: string;
  name: string;
  publisher: string;
  version: string;
  installDate?: string;
  sizeMB?: number;
  packageId?: string;
  source?: string;
  architecture?: string;
  installScope?: 'machine' | 'user';
  updateAvailable?: boolean;
  latestVersion?: string;
  category?: string;
}

export interface SoftwareInstallHistoryItem {
  id: string;
  appId: string;
  appName: string;
  version: string;
  action: 'INSTALL' | 'UPGRADE' | 'UNINSTALL' | 'REPAIR';
  timestamp: string;
  status: 'SUCCESS' | 'FAILED' | 'CANCELLED';
  source: string;
  jobId: string;
  details?: string;
}

export type PortableToolClassification =
  | 'SAFE_TO_INCLUDE'
  | 'LICENSE_REVIEW'
  | 'REMOVE_SECURITY'
  | 'OBSOLETE';

export interface PortableToolItem {
  id: string;
  name: string;
  purpose: string;
  publisher: string;
  source: string;
  downloadUrl?: string;
  licenseStatus: string;
  signatureStatus: 'Digitally Signed' | 'Vendor Authenticated' | 'Unsigned' | 'Requires License';
  classification: PortableToolClassification;
  executableName: string;
  requiresAdmin: boolean;
  category: 'Diagnostic' | 'System' | 'Network' | 'Hardware' | 'Maintenance';
  description: string;
}

export interface DeploymentHelperItem {
  id: string;
  name: string;
  category: 'Runtimes' | 'Windows OS' | 'Office Deployment' | 'Store Repair';
  description: string;
  publisher: string;
  officialUrl: string;
  downloadType: 'Direct Web' | 'Silent Installer' | 'System Launcher';
  architecture: 'x64' | 'x86' | 'all';
  requiresAdmin: boolean;
}

export interface PowerPlanItem {
  guid: string;
  name: string;
  description: string;
  isActive: boolean;
}

export interface SleepStatesInfo {
  standbyS0LowPowerIdle: boolean;
  standbyS3: boolean;
  hibernateS4: boolean;
  fastStartup: boolean;
  hybridSleep: boolean;
}

export interface TempCleanupCategory {
  id: string;
  name: string;
  path: string;
  fileCount: number;
  sizeBytes: number;
  sizeFormatted: string;
  safeToDelete: boolean;
  description: string;
}

export interface TempCleanupAnalysisResult {
  categories: TempCleanupCategory[];
  totalBytes: number;
  totalFormatted: string;
  totalFiles: number;
  analyzedAt: string;
}

export interface DevToolsEnvironmentInfo {
  wsl: {
    installed: boolean;
    defaultVersion: number;
    wsl2KernelVersion: string;
    distributions: Array<{ name: string; state: 'Running' | 'Stopped'; version: number; isDefault: boolean }>;
  };
  hyperV: {
    enabled: boolean;
    hypervisorPresent: boolean;
    virtualMachineCount: number;
    virtualSwitchCount: number;
  };
  windowsSandbox: {
    supported: boolean;
    enabled: boolean;
  };
  developerMode: {
    enabled: boolean;
    sideloadingAllowed: boolean;
  };
  runtimes: {
    dotNetFramework: string[];
    dotNetCoreRuntimes: string[];
    powerShellVersions: Array<{ edition: string; version: string; path: string }>;
    git?: { installed: boolean; version: string };
    node?: { installed: boolean; version: string };
    python?: { installed: boolean; version: string };
    winget?: { installed: boolean; version: string };
  };
}




