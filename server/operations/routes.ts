import { Router } from 'express';
import { OPERATION_DEFINITIONS } from './registry.js';
import { operationsEngine } from './engine.js';
import { nativeOperationIds, executeNative } from './native.js';
import { loopbackSecurity, requireAuth, issueSession } from './security.js';

export const operationsRouter = Router();
operationsRouter.use(loopbackSecurity);
operationsRouter.get('/session', issueSession);
operationsRouter.use(requireAuth);
operationsRouter.get(['/catalog', '/registry'], (_req, res) => {
  res.json({ count: Object.keys(OPERATION_DEFINITIONS).length, operations: Object.values(OPERATION_DEFINITIONS).map(op => ({
    ...op, implementation: nativeOperationIds.has(op.id) ? 'NATIVE_UNVERIFIED_ON_TARGET' : 'NOT_IMPLEMENTED',
    available: nativeOperationIds.has(op.id) && process.platform === 'win32' && process.env.AKSHIGO_NATIVE_OPERATIONS === '1'
  })) });
});
operationsRouter.post('/execute', (req, res) => {
  try {
    const { operationId, params = {}, adminConfirmed = false } = req.body || {};
    if (typeof operationId !== 'string' || typeof adminConfirmed !== 'boolean') throw new Error('Invalid operation request.');
    const job = operationsEngine.createJob(operationId, params, adminConfirmed);
    res.status(202).json({ success: true, jobId: job.jobId, operationId, status: job.status, message: 'Operation accepted.' });
  } catch (error) {
    res.status(400).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});
operationsRouter.get('/jobs', (_req, res) => res.json({ jobs: operationsEngine.listRecentJobs() }));
operationsRouter.get('/jobs/:jobId', (req, res) => {
  const job = operationsEngine.getJob(req.params.jobId);
  if (!job) return res.status(404).json({ error: 'Job not found.' });
  res.json(job);
});
operationsRouter.post('/jobs/:jobId/cancel', (_req, res) => {
  res.status(409).json({ success: false, error: 'Windows servicing cannot safely be cancelled here. Wait for the command to finish.' });
});
// These providers only inspect Windows. Mutating actions still require an enabled host/job.
operationsRouter.get('/printers', async (_req, res) => {
  try {
    const result = await executeNative('printer.inventory.get', {}, () => {});
    if (!Array.isArray(result.printers)) throw new Error('Windows returned invalid printer inventory.');
    res.setHeader('Cache-Control', 'no-store');
    res.json({ printers: result.printers, spoolerStatus: result.spoolerStatus, totalQueuedJobs: result.totalQueuedJobs, defaultPrinter: result.defaultPrinter });
  } catch (error) { res.status(503).json({ error: error instanceof Error ? error.message : String(error) }); }
});
operationsRouter.get('/cbs-logs', async (_req, res) => {
  try {
    const result = await executeNative('repair.cbs_log.view', {}, () => {});
    if (!Array.isArray(result.lines)) throw new Error('Windows returned invalid CBS log data.');
    res.setHeader('Cache-Control', 'no-store');
    res.json({ logPath: result.logPath, entries: result.lines, excerpt: true, maximumLines: 200 });
  } catch (error) { res.status(503).json({ error: error instanceof Error ? error.message : String(error) }); }
});
const liveProviders = [
  { route: '/services/list', operation: 'services.inventory.list', property: 'services' },
  { route: '/backup/restore-points', operation: 'backup.restore_points.list', property: 'restorePoints' }
];
for (const provider of liveProviders) {
  operationsRouter.get(provider.route, async (_req, res) => {
    try {
      const result = await executeNative(provider.operation, {}, () => {});
      if (!Array.isArray(result[provider.property])) throw new Error('Windows provider returned invalid inventory data.');
      res.setHeader('Cache-Control', 'no-store');
      res.json({ [provider.property]: result[provider.property] });
    } catch (error) {
      res.status(503).json({ error: error instanceof Error ? error.message : String(error) });
    }
  });
}
// The previous inventories/reports returned invented machine data. Keep them unavailable
// until each provider is implemented and its UI response contract is verified.
operationsRouter.use((_req, res) => res.status(503).json({ error: 'NOT_IMPLEMENTED: Live Windows data provider is unavailable in this audit build.' }));
