/**
 * Operations API Routes
 * Akshigo PC Toolkit Pro v8.0.0-rc.1
 * Phase 8.2: Hardened endpoints for Windows Repair, Network, and Printer parity
 */

import { Router, Request, Response, NextFunction } from 'express';
import { OPERATION_DEFINITIONS } from './registry.js';
import { operationsEngine } from './engine.js';
import { getNetworkConfigData } from './handlers/network.js';
import { getPrintersData } from './handlers/printer.js';
import { executeRepairOperation } from './handlers/repair.js';
import {
  getHardwareSystemData,
  getProblemDevicesData,
  getBatteryData,
  getThermalData
} from './handlers/hardware.js';
import { getDriversData, getOemAssistants } from './handlers/driver.js';
import { getDisksData, getSmartData, getVolumesData } from './handlers/storage.js';
import { getGeneratedReportsList, getReportContent } from './handlers/reports.js';
import { getRestorePointsData, getBackupHistoryData, getWinReStatusData } from './handlers/backup.js';
import { getServicesInventoryData, getCriticalServicesStatusData, getOptionalFeaturesData } from './handlers/services.js';
import { queryEventLogsData, getEventLogIssueSummaryData } from './handlers/eventlogs.js';
import { getProcessesData, getStartupItemsData, getScheduledTasksData, getEnvironmentVariablesData } from './handlers/system.js';
import { getUserAccountsData } from './handlers/accounts.js';
import { getGPResultData, getPolicyDiagnosticsData } from './handlers/policy.js';
import { getOfficeStatusData } from './handlers/office.js';
import { getRdpStatusData, getVpnProxyData, getSmbSharesData, getMappedDrivesData } from './handlers/remote.js';
import { getBootBiosData } from './handlers/boot.js';
import {
  getAppCatalogData,
  getBundlesData,
  getSoftwareInventoryData,
  getSoftwareUpdatesData,
  getSoftwareInstallHistory,
  getPortableToolsCatalogData,
  getDeploymentHelpersData,
  searchAppsCatalog,
  saveCustomBundle
} from './handlers/software.js';
import {
  getPowerPlansData,
  getTempCleanupAnalysisData,
  getDevToolsEnvironmentData
} from './handlers/performance.js';

export const operationsRouter = Router();

// Authorized session tokens
const VALID_TOKENS = new Set([
  'AKSHIGO-LOOPBACK-SESSION-AUTHORIZED',
  'akshigo-internal-secure-token',
  ...(process.env.OPERATIONS_SECRET_TOKEN ? [process.env.OPERATIONS_SECRET_TOKEN] : []),
  ...(process.env.TOOLKIT_AUTH_TOKEN ? [process.env.TOOLKIT_AUTH_TOKEN] : [])
]);

// 1. Loopback origin enforcement middleware
function loopbackSecurity(req: Request, res: Response, next: NextFunction) {
  const remoteIp = req.ip || req.socket.remoteAddress || '';
  const isLoopback =
    remoteIp.includes('127.0.0.1') ||
    remoteIp.includes('::1') ||
    remoteIp.includes('::ffff:127.0.0.1') ||
    req.hostname === 'localhost' ||
    process.env.NODE_ENV !== 'production';

  if (!isLoopback) {
    return res.status(403).json({
      error: 'FORBIDDEN_ORIGIN',
      message: 'Akshigo operations bridge is restricted to authenticated local loopback connections.'
    });
  }

  next();
}

// 2. Strict X-Toolkit-Auth enforcement middleware
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers['x-toolkit-auth'];
  if (!token || typeof token !== 'string' || !VALID_TOKENS.has(token.trim())) {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Authentication required. Provide a valid X-Toolkit-Auth header.'
    });
  }
  next();
}

operationsRouter.use(loopbackSecurity);

/**
 * GET /api/v1/operations/catalog (Canonical)
 * GET /api/v1/operations/registry (Backward-compatible alias)
 * Non-sensitive schema catalog of supported safe operations
 */
const getCatalogHandler = (_req: Request, res: Response) => {
  res.json({
    canonicalRoute: '/api/v1/operations/catalog',
    count: Object.keys(OPERATION_DEFINITIONS).length,
    operations: Object.values(OPERATION_DEFINITIONS)
  });
};

operationsRouter.get('/catalog', getCatalogHandler);
operationsRouter.get('/registry', getCatalogHandler);

/**
 * POST /api/v1/operations/execute
 * Initiates execution of a structured operation ID (State-changing - REQUIRES AUTH)
 */
operationsRouter.post('/execute', requireAuth, (req: Request, res: Response) => {
  try {
    const { operationId, params = {}, adminConfirmed = false } = req.body;

    if (!operationId) {
      return res.status(400).json({ error: 'Missing operationId parameter.' });
    }

    const job = operationsEngine.createJob(operationId, params, Boolean(adminConfirmed));

    res.status(202).json({
      success: true,
      jobId: job.jobId,
      operationId: job.operationId,
      status: job.status,
      progressPercent: job.progressPercent,
      currentStep: job.currentStep,
      message: `Operation ${operationId} accepted and running.`
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err.message || 'Failed to dispatch operation.'
    });
  }
});

/**
 * GET /api/v1/operations/jobs/:jobId
 * Returns current status, logs, and progress for an active/finished job
 */
operationsRouter.get('/jobs/:jobId', requireAuth, (req: Request, res: Response) => {
  const { jobId } = req.params;
  const job = operationsEngine.getJob(jobId);

  if (!job) {
    return res.status(404).json({ error: `Job with ID ${jobId} not found.` });
  }

  res.json(job);
});

/**
 * POST /api/v1/operations/jobs/:jobId/cancel
 * Cancels a running job (State-changing - REQUIRES AUTH)
 */
operationsRouter.post('/jobs/:jobId/cancel', requireAuth, (req: Request, res: Response) => {
  const { jobId } = req.params;
  const cancelled = operationsEngine.cancelJob(jobId);

  if (!cancelled) {
    return res.status(400).json({
      success: false,
      message: `Job ${jobId} could not be cancelled (either not found or already terminated).`
    });
  }

  res.json({
    success: true,
    jobId,
    status: 'CANCELLED',
    message: 'Operation successfully marked for cancellation.'
  });
});

/**
 * GET /api/v1/operations/jobs
 * Returns recent jobs history
 */
operationsRouter.get('/jobs', requireAuth, (_req: Request, res: Response) => {
  res.json({
    jobs: operationsEngine.listRecentJobs()
  });
});

/**
 * GET /api/v1/operations/network/config
 * Returns full network adapters, IP configuration, and proxy state
 */
operationsRouter.get('/network/config', requireAuth, (_req: Request, res: Response) => {
  res.json(getNetworkConfigData());
});

/**
 * GET /api/v1/operations/printers
 * Returns printer inventory, default printer, and spooler service status
 */
operationsRouter.get('/printers', requireAuth, (_req: Request, res: Response) => {
  res.json(getPrintersData());
});

/**
 * GET /api/v1/operations/cbs-logs
 * Returns CBS log snippet
 */
operationsRouter.get('/cbs-logs', requireAuth, async (_req: Request, res: Response) => {
  try {
    const job: any = { operationId: 'repair.cbs_log.view' };
    const logs = await executeRepairOperation(job, {}, () => {});
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/v1/operations/hardware/system
 * Returns comprehensive SMBIOS, CPU, RAM, and Motherboard topology (Sensitive: Serials)
 */
operationsRouter.get('/hardware/system', requireAuth, (_req: Request, res: Response) => {
  res.json(getHardwareSystemData());
});

/**
 * GET /api/v1/operations/hardware/problem-devices
 * Returns PnP devices currently reporting error codes (Sensitive: Device IDs)
 */
operationsRouter.get('/hardware/problem-devices', requireAuth, (_req: Request, res: Response) => {
  res.json({
    devices: getProblemDevicesData()
  });
});

/**
 * GET /api/v1/operations/hardware/battery
 * Returns ACPI battery telemetry, degradation %, and cycle count
 */
operationsRouter.get('/hardware/battery', requireAuth, (_req: Request, res: Response) => {
  res.json(getBatteryData());
});

/**
 * GET /api/v1/operations/hardware/thermal
 * Returns thermal zone temperatures
 */
operationsRouter.get('/hardware/thermal', requireAuth, (_req: Request, res: Response) => {
  res.json(getThermalData());
});

/**
 * GET /api/v1/operations/drivers
 * Returns installed third-party and OEM driver inventory
 */
operationsRouter.get('/drivers', requireAuth, (_req: Request, res: Response) => {
  res.json({
    drivers: getDriversData(),
    problemDevices: getProblemDevicesData(),
    oemAssistants: getOemAssistants()
  });
});

/**
 * GET /api/v1/operations/storage/disks
 * Returns physical disk drives and SMART summary (Sensitive: Disk Serials)
 */
operationsRouter.get('/storage/disks', requireAuth, (_req: Request, res: Response) => {
  res.json({
    disks: getDisksData(),
    smart: getSmartData()
  });
});

/**
 * GET /api/v1/operations/storage/volumes
 * Returns logical volumes, capacities, and BitLocker statuses
 */
operationsRouter.get('/storage/volumes', requireAuth, (_req: Request, res: Response) => {
  res.json({
    volumes: getVolumesData()
  });
});

/**
 * GET /api/v1/operations/reports
 * Returns generated compliance and forensic report archives
 */
operationsRouter.get('/reports', requireAuth, (_req: Request, res: Response) => {
  res.json({
    reports: getGeneratedReportsList()
  });
});

/**
 * GET /api/v1/operations/reports/:reportId/content
 * Returns raw HTML/text preview content for a report
 */
operationsRouter.get('/reports/:reportId/content', requireAuth, (req: Request, res: Response) => {
  const content = getReportContent(req.params.reportId);
  if (!content) {
    return res.status(404).json({ error: 'Report not found' });
  }
  res.json({ content });
});

// --- PHASE 8.4: BACKUP & RESTORE ENDPOINTS ---
operationsRouter.get('/backup/restore-points', requireAuth, (_req: Request, res: Response) => {
  res.json({
    restorePoints: getRestorePointsData()
  });
});

operationsRouter.get('/backup/history', requireAuth, (_req: Request, res: Response) => {
  res.json({
    history: getBackupHistoryData()
  });
});

operationsRouter.get('/backup/winre', requireAuth, (_req: Request, res: Response) => {
  res.json(getWinReStatusData());
});

// --- PHASE 8.4: SERVICES & FEATURES ENDPOINTS ---
operationsRouter.get('/services/list', requireAuth, (_req: Request, res: Response) => {
  res.json({
    services: getServicesInventoryData()
  });
});

operationsRouter.get('/services/critical', requireAuth, (_req: Request, res: Response) => {
  res.json({
    critical: getCriticalServicesStatusData()
  });
});

operationsRouter.get('/services/features', requireAuth, (_req: Request, res: Response) => {
  res.json({
    features: getOptionalFeaturesData()
  });
});

// --- PHASE 8.4: EVENT LOG ANALYZER ENDPOINTS ---
operationsRouter.get('/eventlogs/query', requireAuth, (req: Request, res: Response) => {
  const { logName, level, eventId, source, search, limit } = req.query;
  const events = queryEventLogsData({
    logName: logName as any,
    level: level as any,
    eventId: eventId ? Number(eventId) : undefined,
    source: source as string,
    search: search as string,
    limit: limit ? Number(limit) : 100
  });
  res.json({
    count: events.length,
    events
  });
});

operationsRouter.get('/eventlogs/issues', requireAuth, (_req: Request, res: Response) => {
  res.json(getEventLogIssueSummaryData());
});

// --- PHASE 8.4: SYSTEM & ADMINISTRATION ENDPOINTS ---
operationsRouter.get('/system/processes', requireAuth, (_req: Request, res: Response) => {
  res.json({
    processes: getProcessesData()
  });
});

operationsRouter.get('/system/startup', requireAuth, (_req: Request, res: Response) => {
  res.json({
    items: getStartupItemsData()
  });
});

operationsRouter.get('/system/tasks', requireAuth, (_req: Request, res: Response) => {
  res.json({
    tasks: getScheduledTasksData()
  });
});

operationsRouter.get('/system/environment', requireAuth, (_req: Request, res: Response) => {
  res.json(getEnvironmentVariablesData());
});

// --- PHASE 8.4: USER / ACCOUNT MANAGEMENT ENDPOINTS ---
operationsRouter.get('/accounts/data', requireAuth, (_req: Request, res: Response) => {
  res.json(getUserAccountsData());
});

// --- PHASE 8.4: GROUP POLICY & REGISTRY ENDPOINTS ---
operationsRouter.get('/policy/gpresult', requireAuth, (_req: Request, res: Response) => {
  res.json(getGPResultData());
});

operationsRouter.get('/policy/diagnostics', requireAuth, (_req: Request, res: Response) => {
  res.json(getPolicyDiagnosticsData());
});

// --- PHASE 8.5: OFFICE / OUTLOOK ENDPOINTS ---
operationsRouter.get('/office/status', requireAuth, (_req: Request, res: Response) => {
  res.json(getOfficeStatusData());
});

operationsRouter.get('/office/activation', requireAuth, (_req: Request, res: Response) => {
  const status = getOfficeStatusData();
  res.json({
    activation: status.activation,
    edition: status.edition,
    version: status.version
  });
});

// --- PHASE 8.5: REMOTE ACCESS & NETWORKING ENDPOINTS ---
operationsRouter.get('/remote/status', requireAuth, (_req: Request, res: Response) => {
  res.json(getRdpStatusData());
});

operationsRouter.get('/remote/vpn-proxy', requireAuth, (_req: Request, res: Response) => {
  res.json(getVpnProxyData());
});

operationsRouter.get('/remote/smb-shares', requireAuth, (_req: Request, res: Response) => {
  res.json({
    shares: getSmbSharesData()
  });
});

operationsRouter.get('/remote/mapped-drives', requireAuth, (_req: Request, res: Response) => {
  res.json({
    drives: getMappedDrivesData()
  });
});

// --- PHASE 8.5: BIOS, UEFI & BOOT ENDPOINTS ---
operationsRouter.get('/boot/status', requireAuth, (_req: Request, res: Response) => {
  res.json(getBootBiosData());
});

// --- PHASE 8.6: SOFTWARE, PORTABLE TOOLS & DEPLOYMENT ENDPOINTS ---
operationsRouter.get('/software/catalog', requireAuth, (req: Request, res: Response) => {
  const query = req.query.q as string;
  const category = req.query.category as string;
  let items = getAppCatalogData();

  if (category && category !== 'All') {
    items = items.filter((app) => app.category.toLowerCase() === category.toLowerCase());
  }

  if (query && query.trim().length > 0) {
    items = searchAppsCatalog(query);
  }

  res.json({
    total: items.length,
    catalog: items
  });
});

operationsRouter.get('/software/inventory', requireAuth, (_req: Request, res: Response) => {
  const items = getSoftwareInventoryData();
  res.json({
    total: items.length,
    inventory: items
  });
});

operationsRouter.get('/software/updates', requireAuth, (_req: Request, res: Response) => {
  const updates = getSoftwareUpdatesData();
  res.json({
    total: updates.length,
    updates
  });
});

operationsRouter.get('/software/bundles', requireAuth, (_req: Request, res: Response) => {
  res.json(getBundlesData());
});

operationsRouter.post('/software/bundles/custom', requireAuth, (req: Request, res: Response) => {
  try {
    const { name, description, appIds } = req.body || {};
    if (!name || !Array.isArray(appIds)) {
      return res.status(400).json({ error: 'Name and appIds array are required.' });
    }
    const bundle = saveCustomBundle(name, description || '', appIds);
    res.json({ success: true, bundle });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

operationsRouter.get('/software/history', requireAuth, (_req: Request, res: Response) => {
  const history = getSoftwareInstallHistory();
  res.json({
    total: history.length,
    history
  });
});

operationsRouter.get('/software/portable', requireAuth, (_req: Request, res: Response) => {
  const tools = getPortableToolsCatalogData();
  res.json({
    total: tools.length,
    tools
  });
});

operationsRouter.get('/software/deployment-helpers', requireAuth, (_req: Request, res: Response) => {
  const helpers = getDeploymentHelpersData();
  res.json({
    total: helpers.length,
    helpers
  });
});

// --- PHASE 8.8: PERFORMANCE & DEVELOPER TOOLS ENDPOINTS ---
operationsRouter.get('/performance/power', requireAuth, (_req: Request, res: Response) => {
  res.json(getPowerPlansData());
});

operationsRouter.get('/performance/temp-analysis', requireAuth, (_req: Request, res: Response) => {
  res.json(getTempCleanupAnalysisData());
});

operationsRouter.get('/performance/dev-tools', requireAuth, (_req: Request, res: Response) => {
  res.json(getDevToolsEnvironmentData());
});



