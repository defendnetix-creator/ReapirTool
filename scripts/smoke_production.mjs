import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

const port = 33991;
const child = spawn(process.execPath, ['scripts/start_production.mjs'], {
  cwd: process.cwd(), windowsHide: true,
  env: { ...process.env, PORT: String(port), AKSHIGO_NATIVE_OPERATIONS: '0' },
  stdio: ['ignore', 'pipe', 'pipe']
});
let output = '';
child.stdout.on('data', chunk => { output += chunk; });
child.stderr.on('data', chunk => { output += chunk; });
const base = `http://127.0.0.1:${port}`;
try {
  let ready = false;
  for (let i = 0; i < 80; i++) {
    if (child.exitCode !== null) throw new Error(`Server exited: ${output}`);
    try { ready = (await fetch(`${base}/api/health`)).ok; } catch {}
    if (ready) break;
    await delay(100);
  }
  assert.ok(ready, `Server did not start: ${output}`);
  const html = await (await fetch(base)).text();
  assert.match(html, /<div id="root"><\/div>/);
  const asset = html.match(/src="(\/assets\/[^\"]+\.js)"/)[1];
  assert.equal((await fetch(base + asset)).status, 200);
  const oldServerPath = await fetch(`${base}/server.cjs`);
  assert.match(oldServerPath.headers.get('content-type'), /text\/html/);
  const forbidden = await fetch(`${base}/api/v1/operations/session`, { headers: { 'X-Toolkit-Client': 'akshigo-ui', Origin: 'https://example.com' } });
  assert.equal(forbidden.status, 403);
  const session = await fetch(`${base}/api/v1/operations/session`, { headers: { 'X-Toolkit-Client': 'akshigo-ui' } });
  assert.equal(session.status, 200);
  const { token } = await session.json();
  const catalog = await (await fetch(`${base}/api/v1/operations/catalog`, { headers: { 'X-Toolkit-Auth': token } })).json();
  assert.equal(catalog.count, 196);
  assert.ok(catalog.operations.every(op => op.available === false));
  if (process.platform === 'win32' && process.env.AKSHIGO_SMOKE_WINDOWS === '1') {
    const servicesResponse = await fetch(`${base}/api/v1/operations/services/list`, { headers: { 'X-Toolkit-Auth': token } });
    assert.equal(servicesResponse.status, 200);
    const inventory = await servicesResponse.json();
    assert.ok(Array.isArray(inventory.services) && inventory.services.length > 0);
    assert.ok(inventory.services.some(service => service.name === 'RpcSs' && service.canControl === false));
    console.log('PASS: built production API serves authenticated live service inventory with mutating jobs disabled.');
  }
  console.log('PASS: production startup, React assets, server-code isolation, cross-origin rejection, session, catalog and disabled native execution.');
} finally {
  child.kill();
}
