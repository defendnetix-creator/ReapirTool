/**
 * Phase 8.5 Verification Test Suite
 * Akshigo PC Toolkit Pro v8.0.0-rc.1
 * 
 * Verifies all 18 required scenarios:
 * 1. Office detection and version/licensing status
 * 2. Outlook Safe Mode, Profile CPL, Reset NavPane operations
 * 3. SCANPST / Inbox Repair Tool detection and status
 * 4. Office Click-to-Run Quick & Online repair launchers
 * 5. OneDrive reset & Teams cache cleanup operations
 * 6. RDP status inquiry (port, NLA, service, firewall)
 * 7. RDP firewall rule audit & configuration
 * 8. RDP settings toggle with admin confirmation requirement
 * 9. VPN adapters & System proxy configuration diagnostics
 * 10. SMB network shares and mapped drives inventory
 * 11. NAS network connectivity & NetBIOS diagnostic testing
 * 12. BIOS / UEFI firmware architecture & Secure Boot state
 * 13. TPM 2.0 security module state verification
 * 14. Boot Configuration Data (BCD) inventory & backup operation
 * 15. WinRE status and reagentc enable operation
 * 16. bootrec scan and bootrec rebuild with safety confirmation
 * 17. gpresult / gpupdate and Group Policy diagnostics (WU / Defender baselines)
 * 18. X-Toolkit-Auth enforcement and operation catalog validation
 */

import { operationsEngine } from '../server/operations/engine.js';
import { OPERATION_DEFINITIONS } from '../server/operations/registry.js';
import { getOfficeStatusData } from '../server/operations/handlers/office.js';
import {
  getRdpStatusData,
  getVpnProxyData,
  getSmbSharesData,
  getMappedDrivesData
} from '../server/operations/handlers/remote.js';
import { getBootBiosData } from '../server/operations/handlers/boot.js';
import { getPolicyDiagnosticsData, getGPResultData } from '../server/operations/handlers/policy.js';
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

async function waitForJob(job: any, maxMs = 3000): Promise<any> {
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
  console.log('===============================================================');
  console.log('AKSHIGO PC TOOLKIT PRO - PHASE 8.5 VERIFICATION TEST SUITE');
  console.log('===============================================================\n');

  // Test 1: Office Detection & Version/Licensing Status
  try {
    const officeData = getOfficeStatusData();
    const valid =
      typeof officeData.isInstalled === 'boolean' &&
      Array.isArray(officeData.installedApps) &&
      typeof officeData.architecture === 'string' &&
      officeData.activation?.licenseStatus !== undefined;
    assert(
      valid,
      1,
      'Office Installation & Licensing Detection',
      `Installed: ${officeData.isInstalled}, Suite: ${officeData.edition}, Apps: ${officeData.installedApps.length}, Status: ${officeData.activation?.licenseStatus}`
    );
  } catch (err: any) {
    assert(false, 1, 'Office Installation & Licensing Detection', err.message);
  }

  // Test 2: Outlook Safe Mode, Profile CPL & Reset NavPane Operations
  try {
    const safeModeOp = OPERATION_DEFINITIONS['office.outlook.safemode'];
    const profileOp = OPERATION_DEFINITIONS['office.outlook.profiles'];
    const navPaneOp = OPERATION_DEFINITIONS['office.outlook.resetnavpane'];
    const validOps = !!safeModeOp && !!profileOp && !!navPaneOp;

    const job = operationsEngine.createJob('office.outlook.resetnavpane', {}, false);
    const updatedJob = await waitForJob(job);

    assert(
      validOps && updatedJob?.status === 'SUCCESS',
      2,
      'Outlook Safe Mode, Profile & NavPane Operations',
      `Operations registered and job finished with status: ${updatedJob?.status}`
    );
  } catch (err: any) {
    assert(false, 2, 'Outlook Safe Mode, Profile & NavPane Operations', err.message);
  }

  // Test 3: SCANPST / Inbox Repair Tool Detection & Status
  try {
    const officeData = getOfficeStatusData();
    const hasScanpstInfo =
      officeData.outlook?.scanpstInstalled !== undefined &&
      typeof officeData.outlook?.scanpstPath === 'string';
    const scanpstOp = OPERATION_DEFINITIONS['office.outlook.scanpst'];
    assert(
      hasScanpstInfo && !!scanpstOp,
      3,
      'SCANPST / Inbox Repair Tool Detection',
      `ScanPST installed flag: ${officeData.outlook?.scanpstInstalled}, Path: ${officeData.outlook?.scanpstPath}`
    );
  } catch (err: any) {
    assert(false, 3, 'SCANPST / Inbox Repair Tool Detection', err.message);
  }

  // Test 4: Office Click-to-Run Quick & Online Repair Launchers
  try {
    const quickRepairOp = OPERATION_DEFINITIONS['office.repair.quick'];
    const onlineRepairOp = OPERATION_DEFINITIONS['office.repair.online'];
    const adminCheck = quickRepairOp?.requiresAdmin === true && onlineRepairOp?.requiresAdmin === true;

    // Run quick repair
    const job = operationsEngine.createJob('office.repair.quick', {}, true);
    const updatedJob = await waitForJob(job);

    assert(
      adminCheck && updatedJob?.status === 'SUCCESS',
      4,
      'Office C2R Quick & Online Repair Launchers',
      `RequiresAdmin enforced. Quick repair status: ${updatedJob?.status}`
    );
  } catch (err: any) {
    assert(false, 4, 'Office C2R Quick & Online Repair Launchers', err.message);
  }

  // Test 5: OneDrive Reset & Teams Cache Cleanup
  try {
    const oneDriveJob = operationsEngine.createJob('office.onedrive.reset', {}, false);
    const teamsJob = operationsEngine.createJob('office.teams.cleancache', {}, false);

    const odRes = await waitForJob(oneDriveJob);
    const tmRes = await waitForJob(teamsJob);

    assert(
      odRes?.status === 'SUCCESS' && tmRes?.status === 'SUCCESS',
      5,
      'OneDrive Reset & Teams Cache Cleanup',
      `OneDrive: ${odRes?.status}, Teams cache: ${tmRes?.status} (freed: ${tmRes?.result?.freedSpaceBytes || 0} bytes)`
    );
  } catch (err: any) {
    assert(false, 5, 'OneDrive Reset & Teams Cache Cleanup', err.message);
  }

  // Test 6: RDP Status Inquiry (Port, NLA, Service, Firewall)
  try {
    const rdp = getRdpStatusData();
    const valid =
      typeof rdp.rdpEnabled === 'boolean' &&
      typeof rdp.portNumber === 'number' &&
      typeof rdp.nlaEnabled === 'boolean' &&
      typeof rdp.serviceState === 'string';

    assert(
      valid,
      6,
      'RDP Status Inquiry (Port, NLA, Service)',
      `Enabled: ${rdp.rdpEnabled}, Port: ${rdp.portNumber}, NLA: ${rdp.nlaEnabled}, Service: ${rdp.serviceState}`
    );
  } catch (err: any) {
    assert(false, 6, 'RDP Status Inquiry (Port, NLA, Service)', err.message);
  }

  // Test 7: RDP Firewall Rule Audit & Configuration
  try {
    const job = operationsEngine.createJob('remote.firewall.rdp_audit', {}, true);
    const updatedJob = await waitForJob(job);
    const valid =
      updatedJob?.status === 'SUCCESS' &&
      updatedJob?.result?.inboundTcpAllowed !== undefined;

    assert(
      valid,
      7,
      'RDP Firewall Rule Audit',
      `Inbound TCP 3389 allowed: ${updatedJob?.result?.inboundTcpAllowed}, Profiles: ${JSON.stringify(updatedJob?.result?.profile)}`
    );
  } catch (err: any) {
    assert(false, 7, 'RDP Firewall Rule Audit', err.message);
  }

  // Test 8: RDP Settings Toggle with Admin Confirmation Requirement
  try {
    const rdpOp = OPERATION_DEFINITIONS['remote.rdp.toggle'];
    const requiresAdmin = rdpOp?.requiresAdmin === true;

    // Test without admin elevation - should fail
    let blockedWithoutElevation = false;
    try {
      operationsEngine.createJob('remote.rdp.toggle', { enabled: true, confirmation: true }, false);
    } catch (e: any) {
      blockedWithoutElevation = true;
    }

    // Test without confirmation flag - should fail in execution
    const noConfirmJob = operationsEngine.createJob(
      'remote.rdp.toggle',
      { enabled: true, confirmation: false },
      true
    );
    const noConfirmRes = await waitForJob(noConfirmJob);
    const blockedWithoutConfirmation = noConfirmRes?.status === 'FAILED';

    // Test with confirmation and elevation
    const job = operationsEngine.createJob(
      'remote.rdp.toggle',
      { enabled: true, confirmation: true },
      true
    );
    const updatedJob = await waitForJob(job);

    assert(
      requiresAdmin && blockedWithoutElevation && blockedWithoutConfirmation && updatedJob?.status === 'SUCCESS',
      8,
      'RDP Settings Toggle Safety & Admin Check',
      `Admin required: ${requiresAdmin}, Non-elevated blocked: ${blockedWithoutElevation}, Blocked without confirmation: ${blockedWithoutConfirmation}, Safe execution: ${updatedJob?.status}`
    );
  } catch (err: any) {
    assert(false, 8, 'RDP Settings Toggle Safety & Admin Check', err.message);
  }

  // Test 9: VPN Adapters & System Proxy Diagnostics
  try {
    const vpnProxy = getVpnProxyData();
    const valid =
      Array.isArray(vpnProxy.vpnAdapters) &&
      typeof vpnProxy.proxy === 'object' &&
      typeof vpnProxy.proxy.enabled === 'boolean';

    assert(
      valid,
      9,
      'VPN Adapters & Proxy Configuration',
      `VPN Adapters detected: ${vpnProxy.vpnAdapters.length}, Proxy enabled: ${vpnProxy.proxy.enabled}`
    );
  } catch (err: any) {
    assert(false, 9, 'VPN Adapters & Proxy Configuration', err.message);
  }

  // Test 10: SMB Network Shares & Mapped Drives Inventory
  try {
    const shares = getSmbSharesData();
    const mapped = getMappedDrivesData();
    const valid = Array.isArray(shares) && Array.isArray(mapped);

    assert(
      valid,
      10,
      'SMB Network Shares & Mapped Drives Inventory',
      `SMB Shares: ${shares.length} (including ADMIN$), Mapped Drives: ${mapped.length}`
    );
  } catch (err: any) {
    assert(false, 10, 'SMB Network Shares & Mapped Drives Inventory', err.message);
  }

  // Test 11: NAS Network Connectivity & NetBIOS Diagnostic Testing
  try {
    const job = operationsEngine.createJob('remote.nas.test', { host: '127.0.0.1' }, false);
    const updatedJob = await waitForJob(job);
    const valid =
      updatedJob?.status === 'SUCCESS' &&
      updatedJob?.result?.host === '127.0.0.1' &&
      typeof updatedJob?.result?.smbPortOpen === 'boolean';

    assert(
      valid,
      11,
      'NAS Connectivity & NetBIOS Diagnostic Testing',
      `Host: ${updatedJob?.result?.host}, Pingable: ${updatedJob?.result?.pingable}, SMB Port 445: ${updatedJob?.result?.smbPortOpen}`
    );
  } catch (err: any) {
    assert(false, 11, 'NAS Connectivity & NetBIOS Diagnostic Testing', err.message);
  }

  // Test 12: BIOS / UEFI Firmware Architecture & Secure Boot State
  try {
    const bootData = getBootBiosData();
    const valid =
      typeof bootData.biosVendor === 'string' &&
      typeof bootData.uefiMode === 'boolean' &&
      typeof bootData.secureBootEnabled === 'boolean';

    assert(
      valid,
      12,
      'BIOS / UEFI Firmware Architecture & Secure Boot',
      `Firmware: ${bootData.biosVendor}, UEFI: ${bootData.uefiMode}, Secure Boot: ${bootData.secureBootEnabled}`
    );
  } catch (err: any) {
    assert(false, 12, 'BIOS / UEFI Firmware Architecture & Secure Boot', err.message);
  }

  // Test 13: TPM 2.0 Security Module State Verification
  try {
    const bootData = getBootBiosData();
    const valid =
      bootData.tpm !== undefined &&
      typeof bootData.tpm.present === 'boolean' &&
      typeof bootData.tpm.specVersion === 'string';

    assert(
      valid,
      13,
      'TPM 2.0 Security Module State Verification',
      `TPM Present: ${bootData.tpm.present}, Version: ${bootData.tpm.specVersion}, Manufacturer: ${bootData.tpm.manufacturer}`
    );
  } catch (err: any) {
    assert(false, 13, 'TPM 2.0 Security Module State Verification', err.message);
  }

  // Test 14: Boot Configuration Data (BCD) Inventory & Backup Operation
  try {
    const bootData = getBootBiosData();
    const validBcd =
      bootData.bcd !== undefined &&
      typeof bootData.bcd.identifier === 'string' &&
      typeof bootData.bcd.osDevice === 'string';

    const backupJob = operationsEngine.createJob('boot.bcd.backup', {}, true);
    const backupRes = await waitForJob(backupJob);

    assert(
      validBcd && backupRes?.status === 'SUCCESS',
      14,
      'BCD Inventory & Backup Operation',
      `BCD ID: ${bootData.bcd.identifier}, Backup destination: ${backupRes?.result?.backupPath}`
    );
  } catch (err: any) {
    assert(false, 14, 'BCD Inventory & Backup Operation', err.message);
  }

  // Test 15: Windows Recovery Environment (WinRE) Status & ReAgentC Enable
  try {
    const bootData = getBootBiosData();
    const hasWinRe =
      bootData.winRe !== undefined &&
      typeof bootData.winRe.enabled === 'boolean';

    const enableJob = operationsEngine.createJob('boot.reagentc.enable', {}, true);
    const enableRes = await waitForJob(enableJob);

    assert(
      hasWinRe && enableRes?.status === 'SUCCESS',
      15,
      'WinRE Status & ReAgentC Enable Operation',
      `WinRE Enabled: ${bootData.winRe.enabled}, ReAgentC status: ${enableRes?.result?.reagentcStatus}`
    );
  } catch (err: any) {
    assert(false, 15, 'WinRE Status & ReAgentC Enable Operation', err.message);
  }

  // Test 16: bootrec Scan and bootrec Rebuild with Safety Confirmation
  try {
    const scanJob = operationsEngine.createJob('boot.bootrec.scan', {}, true);
    const scanRes = await waitForJob(scanJob);

    // Rebuild must fail if confirmation is missing
    const noConfirmJob = operationsEngine.createJob(
      'boot.bootrec.rebuild',
      { confirmation: false },
      true
    );
    const noConfirmRes = await waitForJob(noConfirmJob);
    const blockedWithoutConfirmation = noConfirmRes?.status === 'FAILED';

    const rebuildJob = operationsEngine.createJob(
      'boot.bootrec.rebuild',
      { confirmation: true },
      true
    );
    const rebuildRes = await waitForJob(rebuildJob);

    assert(
      scanRes?.status === 'SUCCESS' && blockedWithoutConfirmation && rebuildRes?.status === 'SUCCESS',
      16,
      'bootrec Scan and Rebuild with Confirmation',
      `Scan installations: ${scanRes?.result?.installationsFound?.length || 0}, Blocked without confirmation: ${blockedWithoutConfirmation}, Rebuild: ${rebuildRes?.status}`
    );
  } catch (err: any) {
    assert(false, 16, 'bootrec Scan and Rebuild with Confirmation', err.message);
  }

  // Test 17: gpresult / gpupdate & Policy Diagnostics
  try {
    const gpResult = getGPResultData();
    const policyDiag = getPolicyDiagnosticsData();

    const valid =
      Array.isArray(gpResult.appliedGPOs) &&
      policyDiag.windowsUpdate !== undefined &&
      policyDiag.defenderPolicy !== undefined;

    const gpUpdateJob = operationsEngine.createJob('policy.gpupdate.force', {}, true);
    const updateRes = await waitForJob(gpUpdateJob);

    assert(
      valid && updateRes?.status === 'SUCCESS',
      17,
      'Group Policy Diagnostics & Force Update',
      `Applied GPOs: ${gpResult.appliedGPOs.length}, AUOptions: ${policyDiag.windowsUpdate.auOptions}, gpupdate: ${updateRes?.status}`
    );
  } catch (err: any) {
    assert(false, 17, 'Group Policy Diagnostics & Force Update', err.message);
  }

  // Test 18: HTTP Endpoints & X-Toolkit-Auth Security Enforcement
  try {
    const app = express();
    app.use(express.json());
    app.use('/api/v1/operations', operationsRouter);

    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
    const port = (server.address() as any).port;

    // 18a: Sensitive endpoint without auth header should be rejected (401)
    let authRejected = false;
    try {
      const resp = await fetch(`http://127.0.0.1:${port}/api/v1/operations/office/status`);
      if (resp.status === 401) authRejected = true;
    } catch {
      authRejected = false;
    }

    // 18b: Catalog endpoint is accessible
    const catalogResp = await fetch(`http://127.0.0.1:${port}/api/v1/operations/catalog`);
    const catalogData = await catalogResp.json();
    const opsArray = catalogData.operations || [];
    const hasNewOps =
      opsArray.some((op: any) => op.id.startsWith('office.')) &&
      opsArray.some((op: any) => op.id.startsWith('remote.')) &&
      opsArray.some((op: any) => op.id.startsWith('boot.'));

    // 18c: Sensitive endpoint with auth header should succeed (200)
    const authedResp = await fetch(`http://127.0.0.1:${port}/api/v1/operations/office/status`, {
      headers: { 'X-Toolkit-Auth': 'AKSHIGO-LOOPBACK-SESSION-AUTHORIZED' }
    });
    const officeData = await authedResp.json();

    server.close();

    assert(
      authRejected && authedResp.status === 200 && hasNewOps && officeData.isInstalled !== undefined,
      18,
      'X-Toolkit-Auth Enforcement & Operations Catalog',
      `401 on missing token: ${authRejected}, 200 with token: ${authedResp.status === 200}, Catalog contains Phase 8.5 ops: ${hasNewOps}`
    );
  } catch (err: any) {
    assert(false, 18, 'X-Toolkit-Auth Enforcement & Operations Catalog', err.message);
  }

  console.log('\n===============================================================');
  const passCount = results.filter((r) => r.passed).length;
  console.log(`TEST SUMMARY: ${passCount} / ${results.length} PASSED`);
  console.log('===============================================================');

  if (passCount !== results.length) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
