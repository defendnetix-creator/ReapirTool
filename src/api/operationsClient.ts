/**
 * Operations Client
 * Akshigo PC Toolkit Pro v8.0.0-rc.1
 * Phase 8.2: Structured operation execution, job polling, and cancellation
 */

export interface OperationJob {
  jobId: string;
  operationId: string;
  category:
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
    | 'Deployment';
  status: 'RUNNING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
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

export interface NetworkConfigResponse {
  adapters: any[];
  primaryAdapter: any;
  proxy: {
    enabled: boolean;
    server?: string;
    exceptions?: string;
  };
  dnsCacheFlushedAt: string;
}

export interface PrinterDataResponse {
  printers: any[];
  spoolerStatus: string;
  totalQueuedJobs: number;
  defaultPrinter: string;
}

export interface HardwareSystemResponse {
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

export interface BatteryHealthResponse {
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

export interface ThermalResponse {
  available: boolean;
  cpuTempCelsius?: number | string;
  systemTempCelsius?: number | string;
  gpuTempCelsius?: number | string;
  thermalZoneCount: number;
  notes: string;
}

export interface DriverDataResponse {
  drivers: any[];
  problemDevices: any[];
  oemAssistants: any[];
}

export interface StorageDisksResponse {
  disks: any[];
  smart: any[];
}

export interface StorageVolumesResponse {
  volumes: any[];
}

export interface ReportsResponse {
  reports: any[];
}

class OperationsClient {
  private authHeader = 'AKSHIGO-LOOPBACK-SESSION-AUTHORIZED';

  private async request(path: string, options: RequestInit = {}): Promise<any> {
    const headers = {
      'Content-Type': 'application/json',
      'X-Toolkit-Auth': this.authHeader,
      ...(options.headers || {})
    };

    const res = await fetch(path, { ...options, headers });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || data.message || `Request failed with status ${res.status}`);
    }
    return data;
  }

  public async fetchCatalog(): Promise<any> {
    return this.request('/api/v1/operations/catalog');
  }

  public async fetchRegistry(): Promise<any> {
    return this.fetchCatalog();
  }

  public async executeOperation(
    operationId: string,
    params: Record<string, any> = {},
    adminConfirmed: boolean = true
  ): Promise<{ jobId: string; status: string; message: string }> {
    return this.request('/api/v1/operations/execute', {
      method: 'POST',
      body: JSON.stringify({ operationId, params, adminConfirmed })
    });
  }

  public async submitJob(
    operationId: string,
    params: Record<string, any> = {},
    adminConfirmed: boolean = true
  ): Promise<{ jobId: string; status: string; message: string }> {
    return this.executeOperation(operationId, params, adminConfirmed);
  }

  public async getJob(jobId: string): Promise<OperationJob> {
    return this.request(`/api/v1/operations/jobs/${jobId}`);
  }

  public async getJobStatus(jobId: string): Promise<OperationJob> {
    return this.getJob(jobId);
  }

  public async cancelJob(jobId: string): Promise<any> {
    return this.request(`/api/v1/operations/jobs/${jobId}/cancel`, {
      method: 'POST'
    });
  }

  public async getNetworkConfig(): Promise<NetworkConfigResponse> {
    return this.request('/api/v1/operations/network/config');
  }

  public async getPrinters(): Promise<PrinterDataResponse> {
    return this.request('/api/v1/operations/printers');
  }

  public async getCbsLogs(): Promise<{ logPath: string; entries: string[] }> {
    return this.request('/api/v1/operations/cbs-logs');
  }

  public async getHardwareSystem(): Promise<HardwareSystemResponse> {
    return this.request('/api/v1/operations/hardware/system');
  }

  public async getProblemDevices(): Promise<{ devices: any[] }> {
    return this.request('/api/v1/operations/hardware/problem-devices');
  }

  public async getBatteryHealth(): Promise<BatteryHealthResponse> {
    return this.request('/api/v1/operations/hardware/battery');
  }

  public async getThermalInfo(): Promise<ThermalResponse> {
    return this.request('/api/v1/operations/hardware/thermal');
  }

  public async getDrivers(): Promise<DriverDataResponse> {
    return this.request('/api/v1/operations/drivers');
  }

  public async getStorageDisks(): Promise<StorageDisksResponse> {
    return this.request('/api/v1/operations/storage/disks');
  }

  public async getStorageVolumes(): Promise<StorageVolumesResponse> {
    return this.request('/api/v1/operations/storage/volumes');
  }

  public async getReports(): Promise<ReportsResponse> {
    return this.request('/api/v1/operations/reports');
  }

  public async getReportContent(reportId: string): Promise<{ content: string }> {
    return this.request(`/api/v1/operations/reports/${reportId}/content`);
  }

  // --- PHASE 8.4 METHODS ---
  public async getRestorePoints(): Promise<{ restorePoints: any[] }> {
    return this.request('/api/v1/operations/backup/restore-points');
  }

  public async getBackupHistory(): Promise<{ history: any[] }> {
    return this.request('/api/v1/operations/backup/history');
  }

  public async getWinReStatus(): Promise<any> {
    return this.request('/api/v1/operations/backup/winre');
  }

  public async getServicesList(): Promise<{ services: any[] }> {
    return this.request('/api/v1/operations/services/list');
  }

  public async getCriticalServices(): Promise<{ critical: any[] }> {
    return this.request('/api/v1/operations/services/critical');
  }

  public async getOptionalFeatures(): Promise<{ features: any[] }> {
    return this.request('/api/v1/operations/services/features');
  }

  public async queryEventLogs(params: Record<string, any> = {}): Promise<{ count: number; events: any[] }> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        searchParams.append(k, String(v));
      }
    });
    const queryStr = searchParams.toString();
    return this.request(`/api/v1/operations/eventlogs/query${queryStr ? `?${queryStr}` : ''}`);
  }

  public async getEventLogIssues(): Promise<any> {
    return this.request('/api/v1/operations/eventlogs/issues');
  }

  public async getProcesses(): Promise<{ processes: any[] }> {
    return this.request('/api/v1/operations/system/processes');
  }

  public async getStartupItems(): Promise<{ items: any[] }> {
    return this.request('/api/v1/operations/system/startup');
  }

  public async getScheduledTasks(): Promise<{ tasks: any[] }> {
    return this.request('/api/v1/operations/system/tasks');
  }

  public async getEnvironmentVariables(): Promise<any> {
    return this.request('/api/v1/operations/system/environment');
  }

  public async getUserAccounts(): Promise<any> {
    return this.request('/api/v1/operations/accounts/data');
  }

  public async getGPResult(): Promise<any> {
    return this.request('/api/v1/operations/policy/gpresult');
  }

  public async getPolicyDiagnostics(): Promise<any> {
    return this.request('/api/v1/operations/policy/diagnostics');
  }

  public async getOfficeStatus(): Promise<any> {
    return this.request('/api/v1/operations/office/status');
  }

  public async getOfficeActivation(): Promise<any> {
    return this.request('/api/v1/operations/office/activation');
  }

  public async getRdpStatus(): Promise<any> {
    return this.request('/api/v1/operations/remote/status');
  }

  public async getVpnProxy(): Promise<any> {
    return this.request('/api/v1/operations/remote/vpn-proxy');
  }

  public async getSmbShares(): Promise<{ shares: any[] }> {
    return this.request('/api/v1/operations/remote/smb-shares');
  }

  public async getMappedDrives(): Promise<{ drives: any[] }> {
    return this.request('/api/v1/operations/remote/mapped-drives');
  }

  public async getBootBiosStatus(): Promise<any> {
    return this.request('/api/v1/operations/boot/status');
  }

  // --- PHASE 8.6: SOFTWARE, PORTABLE TOOLS & DEPLOYMENT ---
  public async getSoftwareCatalog(category?: string, query?: string): Promise<{ total: number; catalog: any[] }> {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.set('category', category);
    if (query && query.trim()) params.set('q', query.trim());
    const qs = params.toString();
    return this.request(`/api/v1/operations/software/catalog${qs ? `?${qs}` : ''}`);
  }

  public async getSoftwareInventory(): Promise<{ total: number; inventory: any[] }> {
    return this.request('/api/v1/operations/software/inventory');
  }

  public async getSoftwareUpdates(): Promise<{ total: number; updates: any[] }> {
    return this.request('/api/v1/operations/software/updates');
  }

  public async getSoftwareBundles(): Promise<{ predefined: any[]; custom: any[] }> {
    return this.request('/api/v1/operations/software/bundles');
  }

  public async saveCustomBundle(name: string, description: string, appIds: string[]): Promise<any> {
    return this.request('/api/v1/operations/software/bundles/custom', {
      method: 'POST',
      body: JSON.stringify({ name, description, appIds })
    });
  }

  public async getSoftwareHistory(): Promise<{ total: number; history: any[] }> {
    return this.request('/api/v1/operations/software/history');
  }

  public async getPortableTools(): Promise<{ total: number; tools: any[] }> {
    return this.request('/api/v1/operations/software/portable');
  }

  public async getDeploymentHelpers(): Promise<{ total: number; helpers: any[] }> {
    return this.request('/api/v1/operations/software/deployment-helpers');
  }

  public async getDevTools(): Promise<any> {
    return this.request('/api/v1/operations/performance/dev-tools');
  }

  public async getPowerPlans(): Promise<any> {
    return this.request('/api/v1/operations/performance/power');
  }

  public async getTempCleanupAnalysis(): Promise<any> {
    return this.request('/api/v1/operations/performance/temp-analysis');
  }
}

export const operationsClient = new OperationsClient();
