import assert from 'node:assert/strict';
import test from 'node:test';
import express from 'express';
import { request } from 'node:http';
import { planOperation, executeNative, nativeOperationIds } from '../server/operations/native.js';
import { OperationsEngine } from '../server/operations/engine.js';
import { operationsRouter } from '../server/operations/routes.js';
import { loopbackSecurity, localPort } from '../server/operations/security.js';

// Node fetch normalizes Host; raw HTTP lets this ephemeral-port test exercise Host validation.
function fetch(url: string, options: { headers?: Record<string, string>; method?: string; body?: string } = {}) {
  return new Promise<{ status: number; headers: { get: (key: string) => unknown }; json: () => Promise<any> }>((resolve, reject) => {
    const req = request(url, options, res => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => resolve({ status: res.statusCode!, headers: { get: key => res.headers[key] }, json: async () => JSON.parse(body) }));
    });
    req.on('error', reject);
    req.end(options.body);
  });
}

test('legacy SFC/DISM order and ordinary cleanup are preserved', () => {
  assert.deepEqual(planOperation('repair.sfc_dism.full'), [
    { executable: 'sfc.exe', args: ['/scannow'] },
    { executable: 'Dism.exe', args: ['/Online', '/Cleanup-Image', '/RestoreHealth'] }
  ]);
  assert.deepEqual(planOperation('repair.dism.clean_store')[0].args, ['/Online', '/Cleanup-Image', '/StartComponentCleanup']);
});

test('update repair and CBS viewing accept no caller-selected scripts or paths', () => {
  for (const id of ['repair.wu.reset_services', 'repair.cbs_log.view']) {
    const plan = planOperation(id);
    assert.equal(plan[0].json, true);
    assert.equal(plan[0].executable, 'WindowsPowerShell\\v1.0\\powershell.exe');
    assert.ok(plan[0].args.includes('-File'));
    for (const params of [{ script: 'evil.ps1' }, { serviceName: 'WinDefend' }, { filePath: 'C:\\secret.txt' }]) {
      assert.throws(() => planOperation(id, params));
    }
  }
});

test('source repair requires explicit image index, preserves spaces, blocks option injection', () => {
  const result = planOperation('repair.dism.source_wim', { sourcePath: 'D:\\Install Media\\install.esd', sourceIndex: 2 });
  assert.deepEqual(result[0].args.slice(-2), ['/Source:esd:D:\\Install Media\\install.esd:2', '/LimitAccess']);
  for (const sourcePath of ['relative.wim', '\\\\server\\share\\install.wim', 'D:\\a.wim" /ResetBase', 'D:\\a.wim:evil', 'D:\\a.wim\n']) {
    assert.throws(() => planOperation('repair.dism.source_wim', { sourcePath, sourceIndex: 1 }));
  }
  assert.throws(() => planOperation('repair.dism.source_wim', { sourcePath: 'D:\\a.wim' }));
  assert.throws(() => planOperation('repair.sfc.scannow', { command: 'whoami' }));
  assert.throws(() => planOperation('repair.sfc.scannow', null));
  assert.throws(() => planOperation('toString'));
});

test('real output/exit codes determine result; failures stop later commands', async () => {
  const calls: string[] = [];
  await assert.rejects(executeNative('repair.sfc_dism.full', {}, () => {}, async cmd => {
    calls.push(cmd.executable);
    return { exitCode: 5, output: 'Access is denied' };
  }), /exit code 5/);
  assert.deepEqual(calls, ['sfc.exe']);
  const result = await executeNative('repair.dism.restorehealth', {}, () => {}, async () => ({ exitCode: 3010, output: 'Restart required' }));
  assert.equal(result.requiresRestart, true);
  assert.equal(result.commands[0].output, 'Restart required');
  assert.equal('repairedFiles' in result, false);
});

test('unimplemented repair never creates a successful simulated job', () => {
  const engine = new OperationsEngine();
  assert.throws(() => engine.createJob('repair.super.full_pipeline', {}, true), /NOT_IMPLEMENTED/);
  assert.equal(engine.listRecentJobs().length, 0);
  assert.equal(engine.cancelJob('missing'), false);
  assert.ok(nativeOperationIds.size > 0);
});

test('network targets cannot introduce options or commands; disk inspection stays read-only', () => {
  for (const targetHost of ['-t', 'a & whoami', 'a\nb', 'https://example.com', 'a;whoami', '$(whoami)']) {
    assert.throws(() => planOperation('network.ping.test', { targetHost }));
  }
  assert.deepEqual(planOperation('network.ping.test', { targetHost: '::1' })[0].args, ['-n', '4', '::1']);
  assert.deepEqual(planOperation('network.dns.lookup', { hostname: 'microsoft.com' })[0].args, ['microsoft.com']);
  assert.deepEqual(planOperation('storage.chkdsk.scan', { volume: 'd:' })[0].args, ['D:']);
  assert.throws(() => planOperation('storage.chkdsk.scan', { volume: 'C: /f' }));
  assert.deepEqual(planOperation('network.ip.renew')[0].args, ['/renew']);
  assert.deepEqual(planOperation('network.workflow.common_repair').map(cmd => [cmd.executable, ...cmd.args]), [
    ['ipconfig.exe', '/release'], ['ipconfig.exe', '/flushdns'], ['netsh.exe', 'winsock', 'reset'],
    ['netsh.exe', 'int', 'ip', 'reset'], ['ipconfig.exe', '/renew']
  ]);
});

test('spooler restart cannot clear print queues or target another service', () => {
  assert.deepEqual(planOperation('printer.spooler.restart')[0].args.slice(-4), ['-Action', 'Restart', '-ServiceName', 'Spooler']);
  assert.equal(planOperation('printer.spooler.restart').length, 1);
  assert.throws(() => planOperation('printer.spooler.restart', { serviceName: 'WinDefend' }));
});

test('network repair attempts DHCP recovery on failure and never reports recovery as repair success', async () => {
  const calls: string[][] = [];
  const logs: string[] = [];
  await assert.rejects(executeNative('network.workflow.common_repair', {}, (_percent, _step, log) => logs.push(log), async cmd => {
    calls.push(cmd.args);
    return { exitCode: cmd.args[0] === 'winsock' ? 5 : 0, output: 'fixture output' };
  }), /exit code 5/);
  assert.deepEqual(calls, [['/release'], ['/flushdns'], ['winsock', 'reset'], ['/renew']]);
  assert.ok(logs.some(log => log.includes('recovery after failed repair')));
});

test('service control protects security/core services and validates startup parameters', () => {
  for (const serviceName of ['WinDefend', 'mpssvc', 'BFE', 'RpcSs', 'SecurityHealthService', 'Spooler; whoami', '*', 'ThirdPartyEDR']) {
    for (const id of ['services.start', 'services.stop', 'services.restart', 'services.startup_type.set']) {
      assert.throws(() => planOperation(id, { serviceName, ...(id.endsWith('.set') ? { startType: 'Disabled' } : {}) }));
    }
  }
  assert.throws(() => planOperation('services.startup_type.set', { serviceName: 'wuauserv', startType: 'Disabled' }));
  assert.throws(() => planOperation('services.startup_type.set', { serviceName: 'Spooler', startType: 'auto & whoami' }));
  const restart = planOperation('services.restart', { serviceName: 'Spooler' })[0];
  assert.equal(restart.json, true);
  assert.ok(restart.args.includes('-File'));
  assert.deepEqual(restart.args.slice(-4), ['-Action', 'Restart', '-ServiceName', 'Spooler']);
  assert.equal(restart.args.some(arg => /ExecutionPolicy|EncodedCommand/.test(arg)), false);
});

test('restore point descriptions are passed as data; creation is not assumed from process success', async () => {
  const description = 'Before maintenance & diagnostics';
  const plan = planOperation('backup.restore_point.create', { description });
  assert.deepEqual(plan[0].args.slice(-2), ['-Description', description]);
  assert.throws(() => planOperation('backup.restore_point.create', { description: '-Action' }));
  assert.throws(() => planOperation('backup.restore_point.create', { description: 'x\ny' }));
  await assert.rejects(executeNative('backup.restore_point.create', { description }, () => {}, async () => ({ exitCode: 1, output: 'Checkpoint throttled' })), /exit code 1/);
  await assert.rejects(executeNative('backup.restore_points.list', {}, () => {}, async () => ({ exitCode: 0, output: 'invalid JSON' })));
  const result = await executeNative('backup.restore_points.list', {}, () => {}, async () => ({ exitCode: 0, output: '{"restorePoints":[]}' }));
  assert.deepEqual(result.restorePoints, []);
});

test('loopback rejects Host spoofing, cross-origin access and remote sockets', () => {
  for (const [remote, host, origin] of [
    ['10.0.0.2', `localhost:${localPort}`, undefined],
    ['127.0.0.1', `evil.example:${localPort}`, undefined],
    ['127.0.0.1', `localhost:${localPort}`, 'https://evil.example'],
    ['127.0.0.11', `localhost:${localPort}`, undefined]
  ]) {
    let code = 0;
    loopbackSecurity({ socket: { remoteAddress: remote }, headers: { host, origin } } as any,
      { status: (value: number) => { code = value; return { json: () => {} }; } } as any,
      () => assert.fail('untrusted request accepted'));
    assert.equal(code, 403);
  }
});

test('API rejects old tokens, guards session bootstrap and blocks fake data', async () => {
  const app = express();
  app.use(express.json());
  app.use('/api/v1/operations', operationsRouter);
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  const port = (server.address() as any).port;
  const base = `http://127.0.0.1:${port}/api/v1/operations`;
  const headers = { Host: `127.0.0.1:${localPort}` };
  try {
    assert.equal((await fetch(`${base}/session`, { headers })).status, 403);
    assert.equal((await fetch(`${base}/jobs`, { headers: { ...headers, 'X-Toolkit-Auth': 'AKSHIGO-LOOPBACK-SESSION-AUTHORIZED' } })).status, 401);
    const session = await fetch(`${base}/session`, { headers: { ...headers, 'X-Toolkit-Client': 'akshigo-ui' } });
    assert.equal(session.status, 200);
    assert.equal(session.headers.get('cache-control'), 'no-store');
    const { token } = await session.json();
    assert.match(token, /^[a-f0-9]{64}$/);
    const auth = { ...headers, 'X-Toolkit-Auth': token };
    assert.equal((await fetch(`${base}/hardware/system`, { headers: auth })).status, 503);
    const rejected = await fetch(`${base}/execute`, { method: 'POST', headers: { ...auth, 'Content-Type': 'application/json' }, body: JSON.stringify({ operationId: 'repair.super.full_pipeline', adminConfirmed: true }) });
    assert.equal(rejected.status, 400);
    assert.match((await rejected.json()).error, /NOT_IMPLEMENTED/);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) => server.close(err => err ? reject(err) : resolve()));
  }
});
