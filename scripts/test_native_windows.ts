import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { runCommand, planOperation, executeNative } from '../server/operations/native.js';

test('Windows runner invokes the real read-only WinHTTP proxy query', { skip: process.platform !== 'win32' }, async () => {
  const result = await runCommand(planOperation('network.proxy.status')[0]);
  assert.equal(result.exitCode, 0);
  assert.ok(result.output.trim().length > 0);
  assert.equal(result.output.includes('\u0000'), false);
});

test('restore-point provider verifies a new checkpoint and rejects throttling or stale data (mocked cmdlets)', { skip: process.platform !== 'win32' }, async () => {
  for (const scenario of ['Success', 'Throttled', 'NoNewPoint']) {
    const result = await runCommand({ executable: 'WindowsPowerShell\\v1.0\\powershell.exe',
      args: ['-NoProfile', '-NonInteractive', '-File', path.resolve('scripts/test_restore_provider.ps1'), '-Scenario', scenario] });
    if (scenario === 'Success') {
      assert.equal(result.exitCode, 0);
      const data = JSON.parse(result.output);
      assert.equal(data.restorePoint.sequenceNumber, 101);
    } else {
      assert.notEqual(result.exitCode, 0);
      assert.match(result.output, /Restore point operation failed/);
    }
  }
});

test('Windows service inventory returns actual service records without changing services', { skip: process.platform !== 'win32' }, async () => {
  const result = await executeNative('services.inventory.list', {}, () => {});
  assert.ok(Array.isArray(result.services));
  const services = result.services as any[];
  assert.ok(services.length > 0);
  assert.ok(services.some(service => service.name === 'RpcSs'));
  assert.ok(services.every(service => typeof service.name === 'string' && typeof service.canControl === 'boolean'));
  assert.equal(services.find(service => service.name === 'RpcSs').canControl, false);
});

test('Windows printer inventory exposes unknown values rather than guessed driver versions or health', { skip: process.platform !== 'win32' }, async () => {
  const result = await executeNative('printer.inventory.get', {}, () => {});
  assert.ok(Array.isArray(result.printers));
  for (const printer of result.printers as any[]) {
    assert.equal(typeof printer.name, 'string');
    assert.equal(printer.driverVersion, null);
    assert.ok(['Offline', 'Unknown'].includes(printer.status));
    assert.ok(printer.queueCount === null || Number.isInteger(printer.queueCount));
  }
  assert.ok(typeof result.spoolerStatus === 'string' && result.spoolerStatus.length > 0);
});

test('update reset preserves sequence, rejects unsafe preflight, and reports recovery failures (fixture only)', { skip: process.platform !== 'win32' }, async () => {
  for (const scenario of ['Success', 'StopFailure', 'StartFailure', 'RecoveryFailure', 'Disabled', 'Dependent', 'Pending']) {
    const result = await runCommand({ executable: 'WindowsPowerShell\\v1.0\\powershell.exe',
      args: ['-NoProfile', '-NonInteractive', '-File', path.resolve('scripts/test_update_provider.ps1'), '-Scenario', scenario] });
    assert.equal(result.exitCode, 0, result.output);
    const fixture = JSON.parse(result.output);
    if (scenario === 'Success') {
      assert.equal(fixture.providerExitCode, 0);
      assert.deepEqual(fixture.calls, ['Stop:wuauserv', 'Stop:cryptSvc', 'Stop:bits', 'Start:bits', 'Start:cryptSvc', 'Start:wuauserv', 'Start:msiserver']);
      assert.equal(fixture.result.events.length, 8);
      assert.equal(fixture.result.startupTypesChanged, false);
      assert.ok(Object.values(fixture.states).every(state => state === 'Running'));
    } else {
      assert.equal(fixture.providerExitCode, 1, scenario);
      if (['Disabled', 'Dependent', 'Pending'].includes(scenario)) {
        assert.deepEqual(fixture.calls, []);
        assert.equal(fixture.result.recoveryAttempted, false);
      } else if (scenario === 'RecoveryFailure') {
        assert.ok(fixture.result.recoveryErrors.some((error: string) => error.includes('wuauserv')));
      } else {
        assert.deepEqual(fixture.states, { wuauserv: 'Running', cryptSvc: 'Running', bits: 'Running', msiserver: 'Stopped' });
        assert.deepEqual(fixture.result.recoveryErrors, []);
      }
    }
  }
});

test('update cache rename retains bytes and recovers services; links and missing directories are rejected (temporary fixtures)', { skip: process.platform !== 'win32' }, async () => {
  for (const action of ['SoftwareDistribution', 'Catroot2']) {
    for (const scenario of ['Success', 'RenameFailure', 'RestartFailure', 'Reparse', 'Missing']) {
      const result = await runCommand({ executable: 'WindowsPowerShell\\v1.0\\powershell.exe', args: [
        '-NoProfile', '-NonInteractive', '-File', path.resolve('scripts/test_update_cache.ps1'), '-Action', action, '-Scenario', scenario
      ] });
      assert.equal(result.exitCode, 0, result.output);
      const fixture = JSON.parse(result.output);
      assert.equal(fixture.providerExitCode, scenario === 'Success' ? 0 : 1, result.output);
      assert.equal(fixture.result.cacheRenamed, ['Success', 'RestartFailure'].includes(scenario));
      if (scenario !== 'Missing') assert.equal(fixture.preserved, 'fixture bytes must survive');
      if (['Reparse', 'Missing'].includes(scenario)) assert.deepEqual(fixture.calls, []);
      if (scenario === 'RestartFailure') assert.equal(fixture.result.recoveryErrors.length, 1);
      else assert.deepEqual(fixture.states, { wuauserv: 'Running', bits: 'Stopped', cryptSvc: 'Running' });
      if (scenario === 'Success') assert.match(fixture.result.backupPath, /\.old\.[a-f0-9]{32}$/);
    }
  }
});
