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
