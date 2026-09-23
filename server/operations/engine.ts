/**
 * Operations Job Engine
 * Akshigo PC Toolkit Pro v8.0.0-rc.1
 * Phase 8.2: Async Job Execution, Cancellation, and Progress Streaming
 */

import { OperationJob, JobStatus } from './types.js';
import { OPERATION_DEFINITIONS } from './registry.js';
import { executeRepairOperation } from './handlers/repair.js';
import { executeNetworkOperation } from './handlers/network.js';
import { executePrinterOperation } from './handlers/printer.js';
import { executeHardwareOperation } from './handlers/hardware.js';
import { executeDriverOperation } from './handlers/driver.js';
import { executeStorageOperation } from './handlers/storage.js';
import { executeReportsOperation } from './handlers/reports.js';
import { executeBackupOperation } from './handlers/backup.js';
import { executeServicesOperation } from './handlers/services.js';
import { executeEventLogsOperation } from './handlers/eventlogs.js';
import { executeSystemOperation } from './handlers/system.js';
import { executeAccountsOperation } from './handlers/accounts.js';
import { executePolicyOperation } from './handlers/policy.js';
import { executeOfficeOperation } from './handlers/office.js';
import { executeRemoteOperation } from './handlers/remote.js';
import { executeBootOperation } from './handlers/boot.js';
import { executeSoftwareOperation } from './handlers/software.js';
import { executePerformanceOperation } from './handlers/performance.js';

class OperationsEngine {
  private jobs: Map<string, OperationJob> = new Map();
  private cancellationTokens: Map<string, boolean> = new Map();

  constructor() {
    // Keep max 50 recent jobs in memory
  }

  public createJob(
    operationId: string,
    params: Record<string, any> = {},
    adminConfirmed: boolean = false
  ): OperationJob {
    const def = OPERATION_DEFINITIONS[operationId];
    if (!def) {
      throw new Error(`Invalid or disallowed operation ID: ${operationId}`);
    }

    if (def.requiresAdmin && !adminConfirmed) {
      throw new Error(`Operation "${def.name}" requires administrative elevation confirmation.`);
    }

    const jobId = `job-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const job: OperationJob = {
      jobId,
      operationId,
      category: def.category,
      status: 'RUNNING',
      progressPercent: 0,
      currentStep: 'Queued for execution',
      logs: [`[ENGINE] Operation ${operationId} (${def.name}) initiated with Admin=${adminConfirmed}.`],
      startTime: new Date().toISOString(),
      requiresAdmin: def.requiresAdmin,
      canCancel: def.isLongRunning
    };

    this.jobs.set(jobId, job);
    this.cancellationTokens.set(jobId, false);

    // Run asynchronously
    this.executeAsync(job, params).catch((err) => {
      job.status = 'FAILED';
      job.error = err?.message || String(err);
      job.logs.push(`[ERROR] Execution failed: ${job.error}`);
      job.endTime = new Date().toISOString();
    });

    return job;
  }

  private async executeAsync(job: OperationJob, params: Record<string, any>): Promise<void> {
    const def = OPERATION_DEFINITIONS[job.operationId];

    const updateProgress = (percent: number, step: string, log: string) => {
      if (this.cancellationTokens.get(job.jobId)) {
        throw new Error('OPERATION_CANCELLED_BY_USER');
      }
      job.progressPercent = Math.min(100, Math.max(0, percent));
      job.currentStep = step;
      if (log) {
        job.logs.push(log);
      }
    };

    try {
      let result: any;
      if (def.category === 'Windows Repair') {
        result = await executeRepairOperation(job, params, updateProgress);
      } else if (def.category === 'Network') {
        result = await executeNetworkOperation(job, params, updateProgress);
      } else if (def.category === 'Printer') {
        result = await executePrinterOperation(job, params, updateProgress);
      } else if (def.category === 'Hardware') {
        result = await executeHardwareOperation(job, params, updateProgress);
      } else if (def.category === 'Driver') {
        result = await executeDriverOperation(job, params, updateProgress);
      } else if (def.category === 'Storage') {
        result = await executeStorageOperation(job, params, updateProgress);
      } else if (def.category === 'Reports') {
        result = await executeReportsOperation(job, params, updateProgress);
      } else if (def.category === 'Backup') {
        result = await executeBackupOperation(job, params, updateProgress);
      } else if (def.category === 'Services') {
        result = await executeServicesOperation(job, params, updateProgress);
      } else if (def.category === 'Event Logs') {
        result = await executeEventLogsOperation(job, params, updateProgress);
      } else if (def.category === 'System') {
        result = await executeSystemOperation(job, params, updateProgress);
      } else if (def.category === 'Accounts') {
        result = await executeAccountsOperation(job, params, updateProgress);
      } else if (def.category === 'Policy') {
        result = await executePolicyOperation(job, params, updateProgress);
      } else if (def.category === 'Office') {
        result = await executeOfficeOperation(job, params, updateProgress);
      } else if (def.category === 'Remote Access') {
        result = await executeRemoteOperation(job, params, updateProgress);
      } else if (def.category === 'Boot / BIOS') {
        result = await executeBootOperation(job, params, updateProgress);
      } else if (
        def.category === 'Software' ||
        def.category === 'Portable Tools' ||
        def.category === 'Deployment'
      ) {
        result = await executeSoftwareOperation(job, params, updateProgress);
      } else if (def.category === 'Performance' || def.category === 'Developer Tools') {
        result = await executePerformanceOperation(job, params, updateProgress);
      } else {
        throw new Error(`Unsupported category: ${def.category}`);
      }

      if (this.cancellationTokens.get(job.jobId)) {
        job.status = 'CANCELLED';
        job.logs.push('[ENGINE] Operation was cancelled by user request.');
      } else {
        job.status = 'SUCCESS';
        job.progressPercent = 100;
        job.result = result;
        job.logs.push(`[ENGINE] Operation completed with exit code 0.`);
      }
    } catch (err: any) {
      if (err.message === 'OPERATION_CANCELLED_BY_USER' || this.cancellationTokens.get(job.jobId)) {
        job.status = 'CANCELLED';
        job.logs.push('[ENGINE] Operation cancelled.');
      } else {
        job.status = 'FAILED';
        job.error = err.message || String(err);
        job.logs.push(`[ERROR] ${job.error}`);
      }
    } finally {
      job.endTime = new Date().toISOString();
    }
  }

  public getJob(jobId: string): OperationJob | undefined {
    return this.jobs.get(jobId);
  }

  public cancelJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job) return false;
    if (job.status !== 'RUNNING') return false;

    this.cancellationTokens.set(jobId, true);
    job.status = 'CANCELLED';
    job.logs.push('[ENGINE] Cancellation signal dispatched.');
    job.endTime = new Date().toISOString();
    return true;
  }

  public listRecentJobs(): OperationJob[] {
    return Array.from(this.jobs.values())
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, 25);
  }
}

export const operationsEngine = new OperationsEngine();
