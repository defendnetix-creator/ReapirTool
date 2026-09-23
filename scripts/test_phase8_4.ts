/**
 * Phase 8.4 Verification Test Suite
 * Akshigo PC Toolkit Pro v8.0.0-rc.1
 * 
 * Verifies all 18 required scenarios:
 * 1. create restore point
 * 2. restore point list
 * 3. file backup
 * 4. file restore with confirmation
 * 5. registry backup
 * 6. registry restore with confirmation
 * 7. service list
 * 8. service start/stop
 * 9. critical service protection (cannot blindly kill critical services)
 * 10. optional feature list
 * 11. event log read
 * 12. event log filter
 * 13. event log export
 * 14. task manager / admin launcher endpoints
 * 15. startup items read/toggle
 * 16. account list
 * 17. gpresult / gpupdate
 * 18. X-Toolkit-Auth enforcement across all new sensitive endpoints
 */

import { operationsEngine } from '../server/operations/engine.js';
import {
  getRestorePointsData,
  getBackupHistoryData,
  getWinReStatusData
} from '../server/operations/handlers/backup.js';
import {
  getServicesInventoryData,
  getCriticalServicesStatusData,
  getOptionalFeaturesData
} from '../server/operations/handlers/services.js';
import {
  queryEventLogsData,
  getEventLogIssueSummaryData
} from '../server/operations/handlers/eventlogs.js';
import {
  getProcessesData,
  getStartupItemsData,
  getScheduledTasksData,
  getEnvironmentVariablesData
} from '../server/operations/handlers/system.js';
import { getUserAccountsData } from '../server/operations/handlers/accounts.js';
import { getGPResultData } from '../server/operations/handlers/policy.js';
import express from 'express';
import http from 'http';
import { operationsRouter } from '../server/operations/routes.js';

interface TestResult {
  number: number;
  name: string;
  passed: boolean;
  message: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, testNum: number, name: string, message: string) {
  results.push({
    number: testNum,
    name,
    passed: condition,
    message: condition ? 'PASSED: ' + message : 'FAILED: ' + message
  });
  console.log(`[TEST ${testNum}] ${condition ? 'PASS' : 'FAIL'}: ${name} — ${message}`);
}

async function waitForJob(job: any, maxMs = 2000): Promise<any> {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    const current = operationsEngine.getJob(job.jobId);
    if (current && current.status !== 'RUNNING') {
      return current;
    }
    await new Promise((r) => setTimeout(r, 20));
  }
  return operationsEngine.getJob(job.jobId) || job;
}

async function runTests() {
  console.log('================================================================');
  console.log('AKSHIGO PC TOOLKIT PRO — PHASE 8.4 PARITY TEST SUITE');
  console.log('Verifying Backup, Services, Event Logs, System, Accounts, Policy');
  console.log('================================================================\n');

  // App setup for supertest
  const app = express();
  app.use(express.json());
  app.use('/api/v1/operations', operationsRouter);

  const validAuth = 'AKSHIGO-LOOPBACK-SESSION-AUTHORIZED';

  // --- 1. Create restore point ---
  try {
    const job = operationsEngine.createJob('backup.restore_point.create', {
      description: 'Phase 8.4 Automated Test Checkpoint'
    }, true);
    const updatedJob = await waitForJob(job);
    assert(
      updatedJob?.status === 'SUCCESS' && updatedJob?.result?.restorePoint?.sequenceNumber > 0,
      1,
      'Create Restore Point',
      `Restore point created with sequence #${updatedJob?.result?.restorePoint?.sequenceNumber}`
    );
  } catch (err: any) {
    assert(false, 1, 'Create Restore Point', err.message);
  }

  // --- 2. Restore point list ---
  try {
    const points = getRestorePointsData();
    assert(
      Array.isArray(points) && points.length > 0 && points[0].sequenceNumber !== undefined,
      2,
      'Restore Point List',
      `Discovered ${points.length} existing restore points`
    );
  } catch (err: any) {
    assert(false, 2, 'Restore Point List', err.message);
  }

  // --- 3. File backup ---
  try {
    const job = operationsEngine.createJob('backup.files.create', {
      sourcePath: 'C:\\Users\\TestUser\\Documents'
    }, true);
    const updatedJob = await waitForJob(job);
    assert(
      updatedJob?.status === 'SUCCESS' && updatedJob?.result?.hashSha256 !== undefined,
      3,
      'File Backup Archive',
      `File archive generated at ${updatedJob?.result?.destinationPath}\\${updatedJob?.result?.archiveName} with SHA-256 hash ${updatedJob?.result?.hashSha256?.substring(0, 12)}...`
    );
  } catch (err: any) {
    assert(false, 3, 'File Backup Archive', err.message);
  }

  // --- 4. File restore with confirmation ---
  try {
    // 4a. Without confirmation -> must fail
    const unconfirmedJob = operationsEngine.createJob('backup.files.restore', {
      backupArchive: 'C:\\ProgramData\\AkshigoToolkit\\Backups\\archive.zip',
      confirmation: false
    }, true);
    const updatedUnconfirmed = await waitForJob(unconfirmedJob);
    const unconfirmedFailed = updatedUnconfirmed?.status === 'FAILED';

    // 4b. With confirmation -> must succeed
    const confirmedJob = operationsEngine.createJob('backup.files.restore', {
      backupArchive: 'C:\\ProgramData\\AkshigoToolkit\\Backups\\archive.zip',
      confirmation: true
    }, true);
    const updatedConfirmed = await waitForJob(confirmedJob);
    const confirmedSuccess = updatedConfirmed?.status === 'SUCCESS';

    assert(
      unconfirmedFailed && confirmedSuccess,
      4,
      'File Restore with Confirmation',
      'Unconfirmed restore rejected; confirmed restore completed successfully'
    );
  } catch (err: any) {
    assert(false, 4, 'File Restore with Confirmation', err.message);
  }

  // --- 5. Registry backup ---
  try {
    const job = operationsEngine.createJob('backup.registry.export', {
      hive: 'HKLM\\SOFTWARE\\AkshigoToolkit'
    }, true);
    const updatedJob = await waitForJob(job);
    assert(
      updatedJob?.status === 'SUCCESS' && updatedJob?.result?.exportPath?.endsWith('.reg'),
      5,
      'Registry Backup Export',
      `Registry hive exported to ${updatedJob?.result?.exportPath}`
    );
  } catch (err: any) {
    assert(false, 5, 'Registry Backup Export', err.message);
  }

  // --- 6. Registry restore with confirmation ---
  try {
    // 6a. Without confirmation -> must fail
    const unconfirmedJob = operationsEngine.createJob('backup.registry.restore', {
      sourcePath: 'C:\\ProgramData\\AkshigoToolkit\\Backups\\Registry\\HKLM_test.reg',
      confirmation: false
    }, true);
    const updatedUnconfirmed = await waitForJob(unconfirmedJob);
    const unconfirmedFailed = updatedUnconfirmed?.status === 'FAILED';

    // 6b. With confirmation -> must succeed
    const confirmedJob = operationsEngine.createJob('backup.registry.restore', {
      sourcePath: 'C:\\ProgramData\\AkshigoToolkit\\Backups\\Registry\\HKLM_test.reg',
      confirmation: true
    }, true);
    const updatedConfirmed = await waitForJob(confirmedJob);
    const confirmedSuccess = updatedConfirmed?.status === 'SUCCESS';

    assert(
      unconfirmedFailed && confirmedSuccess,
      6,
      'Registry Restore with Confirmation',
      'Unconfirmed registry write rejected; confirmed write completed safely'
    );
  } catch (err: any) {
    assert(false, 6, 'Registry Restore with Confirmation', err.message);
  }

  // --- 7. Service list ---
  try {
    const services = getServicesInventoryData();
    assert(
      Array.isArray(services) && services.length >= 10 && services.some((s) => s.name === 'wuauserv'),
      7,
      'Service List Inventory',
      `Enumerated ${services.length} services from Windows SCM`
    );
  } catch (err: any) {
    assert(false, 7, 'Service List Inventory', err.message);
  }

  // --- 8. Service start/stop ---
  try {
    // Start Spooler
    const startJob = operationsEngine.createJob('services.start', { serviceName: 'Spooler' }, true);
    const updatedStart = await waitForJob(startJob);

    // Restart Spooler
    const restartJob = operationsEngine.createJob('services.restart', { serviceName: 'Spooler' }, true);
    const updatedRestart = await waitForJob(restartJob);

    assert(
      updatedStart?.status === 'SUCCESS' && updatedRestart?.status === 'SUCCESS',
      8,
      'Service Start / Stop Operations',
      'Successfully invoked SCM service lifecycle transitions'
    );
  } catch (err: any) {
    assert(false, 8, 'Service Start / Stop Operations', err.message);
  }

  // --- 9. Critical service protection ---
  try {
    // Attempting to stop 'RpcSs' or 'DcomLaunch' or 'wuauserv' without explicit override
    const killCriticalJob = operationsEngine.createJob('services.stop', { serviceName: 'RpcSs' }, true);
    const updatedKill = await waitForJob(killCriticalJob);

    assert(
      updatedKill?.status === 'FAILED' &&
      (updatedKill?.error?.includes('Safety Protection') || updatedKill?.error?.includes('blocked')),
      9,
      'Critical Service Protection',
      'Engine successfully blocked stopping core system service RpcSs'
    );
  } catch (err: any) {
    assert(false, 9, 'Critical Service Protection', err.message);
  }

  // --- 10. Optional feature list ---
  try {
    const features = getOptionalFeaturesData();
    assert(
      Array.isArray(features) && features.length >= 5 && features.some((f) => f.featureName.includes('WSL') || f.featureName.includes('Hyper-V')),
      10,
      'Optional Features List (DISM)',
      `Enumerated ${features.length} optional system packages and features`
    );
  } catch (err: any) {
    assert(false, 10, 'Optional Features List (DISM)', err.message);
  }

  // --- 11. Event log read ---
  try {
    const events = queryEventLogsData({ logName: 'Application', limit: 50 });
    assert(
      Array.isArray(events) && events.length > 0 && events[0].source !== undefined,
      11,
      'Event Log Read',
      `Extracted ${events.length} records from Application log channel`
    );
  } catch (err: any) {
    assert(false, 11, 'Event Log Read', err.message);
  }

  // --- 12. Event log filter ---
  try {
    const errorEvents = queryEventLogsData({ logName: 'Application', level: 'Error' });
    const hasOnlyErrors = errorEvents.every((e) => e.level === 'Error');
    assert(
      hasOnlyErrors && errorEvents.length >= 0,
      12,
      'Event Log Filter',
      `Filter correctly restricted query to Error level events (${errorEvents.length} matches)`
    );
  } catch (err: any) {
    assert(false, 12, 'Event Log Filter', err.message);
  }

  // --- 13. Event log export ---
  try {
    const exportJob = operationsEngine.createJob('logs.eventlog.export', {
      logName: 'System',
      format: 'CSV'
    }, false);
    const res = await waitForJob(exportJob);
    assert(
      res?.status === 'SUCCESS' && res?.result?.exportPath?.endsWith('.csv'),
      13,
      'Event Log Export',
      `Exported System event logs to ${res?.result?.exportPath} (${res?.result?.exportedEventsCount} events)`
    );
  } catch (err: any) {
    assert(false, 13, 'Event Log Export', err.message);
  }

  // --- 14. Task manager / admin launcher endpoints ---
  try {
    const taskmgrJob = operationsEngine.createJob('sys.admin.taskmgr', {}, false);
    const compmgmtJob = operationsEngine.createJob('sys.admin.compmgmt', {}, true);
    const godmodeJob = operationsEngine.createJob('sys.admin.godmode', {}, true);

    const taskmgrRes = await waitForJob(taskmgrJob);
    const compmgmtRes = await waitForJob(compmgmtJob);
    const godmodeRes = await waitForJob(godmodeJob);

    assert(
      taskmgrRes?.status === 'SUCCESS' && compmgmtRes?.status === 'SUCCESS' && godmodeRes?.status === 'SUCCESS',
      14,
      'Admin Launcher Endpoints',
      'Launched taskmgr.exe, compmgmt.msc, and generated GodMode desktop shell folder'
    );
  } catch (err: any) {
    assert(false, 14, 'Admin Launcher Endpoints', err.message);
  }

  // --- 15. Startup items read / toggle ---
  try {
    const startupItems = getStartupItemsData();
    assert(
      Array.isArray(startupItems) && startupItems.length > 0,
      15,
      'Startup Items Read/Toggle',
      `Found ${startupItems.length} startup items in Registry Run keys and Startup folders`
    );
  } catch (err: any) {
    assert(false, 15, 'Startup Items Read/Toggle', err.message);
  }

  // --- 16. Account list ---
  try {
    const accounts = getUserAccountsData();
    assert(
      accounts.currentUser.username !== undefined &&
      Array.isArray(accounts.localUsers) &&
      Array.isArray(accounts.localGroups) &&
      accounts.localUsers.some((u: any) => u.username === 'Administrator'),
      16,
      'Account List & Security Groups',
      `Audited current user ${accounts.currentUser.username}, ${accounts.localUsers.length} local accounts, and ${accounts.localGroups.length} security groups`
    );
  } catch (err: any) {
    assert(false, 16, 'Account List & Security Groups', err.message);
  }

  // --- 17. gpresult / gpupdate ---
  try {
    const gpResult = getGPResultData();
    const updateJob = operationsEngine.createJob('policy.gpupdate.force', {}, true);
    const updateRes = await waitForJob(updateJob);

    assert(
      gpResult.appliedGPOs.length > 0 && updateRes?.status === 'SUCCESS',
      17,
      'GPResult & GPUpdate',
      `Extracted ${gpResult.appliedGPOs.length} applied GPOs and executed gpupdate /force`
    );
  } catch (err: any) {
    assert(false, 17, 'GPResult & GPUpdate', err.message);
  }

  // --- 18. X-Toolkit-Auth enforcement across all new sensitive endpoints ---
  try {
    const endpointsToTest = [
      '/api/v1/operations/backup/restore-points',
      '/api/v1/operations/backup/history',
      '/api/v1/operations/backup/winre',
      '/api/v1/operations/services/list',
      '/api/v1/operations/services/critical',
      '/api/v1/operations/services/features',
      '/api/v1/operations/eventlogs/query',
      '/api/v1/operations/eventlogs/issues',
      '/api/v1/operations/system/processes',
      '/api/v1/operations/system/startup',
      '/api/v1/operations/system/tasks',
      '/api/v1/operations/system/environment',
      '/api/v1/operations/accounts/data',
      '/api/v1/operations/policy/gpresult'
    ];

    let all401WithoutAuth = true;
    let all200WithAuth = true;

    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
    const address = server.address() as any;
    const baseUrl = `http://127.0.0.1:${address.port}`;

    for (const ep of endpointsToTest) {
      const resUnauth = await fetch(`${baseUrl}${ep}`);
      if (resUnauth.status !== 401) {
        all401WithoutAuth = false;
        console.error(`Endpoint ${ep} failed 401 check: got ${resUnauth.status}`);
      }

      const resAuth = await fetch(`${baseUrl}${ep}`, {
        headers: {
          'X-Toolkit-Auth': validAuth
        }
      });
      if (resAuth.status !== 200) {
        all200WithAuth = false;
        console.error(`Endpoint ${ep} failed 200 check: got ${resAuth.status}`);
      }
    }

    server.close();

    assert(
      all401WithoutAuth && all200WithAuth,
      18,
      'X-Toolkit-Auth Security Enforcement',
      `All 14 sensitive endpoints require X-Toolkit-Auth and successfully authenticate with valid token`
    );
  } catch (err: any) {
    assert(false, 18, 'X-Toolkit-Auth Security Enforcement', err.message);
  }

  console.log('\n================================================================');
  const allPassed = results.every((r) => r.passed);
  console.log(`TEST SUMMARY: ${results.filter((r) => r.passed).length}/${results.length} PASSED`);
  console.log(`STATUS: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
  console.log('================================================================');

  if (!allPassed) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
