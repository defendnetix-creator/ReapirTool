import { randomUUID } from 'node:crypto';
import { OperationJob } from './types.js';
import { OPERATION_DEFINITIONS } from './registry.js';
import { executeNative, planOperation } from './native.js';

export class OperationsEngine {
  private jobs = new Map<string, OperationJob>();

  public createJob(operationId: string, params: Record<string, unknown> = {}, adminConfirmed = false): OperationJob {
    planOperation(operationId, params);
    if (process.platform !== 'win32' || process.env.AKSHIGO_NATIVE_OPERATIONS !== '1') {
      throw new Error('Native operations are unavailable. An explicitly enabled Windows host is required.');
    }
    const def = OPERATION_DEFINITIONS[operationId];
    if (def.requiresAdmin && adminConfirmed !== true) throw new Error('Administrative operation requires explicit confirmation.');
    if (Array.from(this.jobs.values()).some(j => j.status === 'RUNNING')) throw new Error('Wait for the current operation to finish.');
    for (const [id] of this.jobs) {
      if (this.jobs.size < 50) break;
      this.jobs.delete(id);
    }
    const job: OperationJob = {
      jobId: randomUUID(), operationId, category: def.category, status: 'RUNNING', progressPercent: 0,
      currentStep: 'Waiting for Windows', logs: [], startTime: new Date().toISOString(),
      requiresAdmin: def.requiresAdmin,
      // HTTP cancellation cannot safely stop a Windows servicing process.
      canCancel: false
    };
    this.jobs.set(job.jobId, job);
    void this.execute(job, structuredClone(params));
    return job;
  }

  private async execute(job: OperationJob, params: Record<string, unknown>) {
    try {
      job.result = await executeNative(job.operationId, params, (percent, step, log) => {
        job.progressPercent = percent;
        job.currentStep = step;
        if (log) job.logs.push(log);
      });
      job.status = 'SUCCESS';
      job.currentStep = 'Commands completed; review Windows output';
      job.progressPercent = 100;
    } catch (error) {
      job.status = 'FAILED';
      job.error = error instanceof Error ? error.message : String(error);
      job.logs.push(`[ERROR] ${job.error}`);
    } finally {
      job.endTime = new Date().toISOString();
    }
  }

  public getJob(id: string) { return this.jobs.get(id); }
  public cancelJob(_id: string) { return false; }
  public listRecentJobs() { return Array.from(this.jobs.values()).reverse().slice(0, 25); }
}

export const operationsEngine = new OperationsEngine();
