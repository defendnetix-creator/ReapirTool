import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const read = p => fs.readFileSync(p, 'utf8');
const definitions = read('server/operations/registry.ts');
const ids = [...definitions.matchAll(/^  '([^']+)': \{/gm)].map(m => m[1]);
const native = new Set([...read('server/operations/native.ts').matchAll(/^  '([^']+)': \[/gm)].map(m => m[1]));
for (const match of read('server/operations/native.ts').match(/export const nativeOperationIds[^\n]+/)[0].matchAll(/'([^']+)'/g)) native.add(match[1]);
const handlers = fs.readdirSync('server/operations/handlers').filter(p => p.endsWith('.ts'));
const evidence = new Map();
for (const file of handlers) read(`server/operations/handlers/${file}`).split(/\r?\n/).forEach((line, index) => {
  const id = line.match(/case '([^']+)'/);
  if (id) evidence.set(id[1], `server/operations/handlers/${file}:${index + 1}`);
});
const features = JSON.parse(read('src/config/feature-registry.json'));
const escape = value => String(value ?? '').replaceAll('|', '\\|').replaceAll('\n', ' ');
const operations = ids.map(id => ({ id, baselineEvidence: evidence.get(id) || 'No handler case found', classification: native.has(id) ? 'PARTIAL_EQUIVALENT' : 'MISSING_BEHAVIOR', reason: native.has(id) ? 'Native command plan restored; Windows outcome/UI integration not validated.' : 'No native Windows execution. Former simulation is blocked.' }));
fs.mkdirSync('docs/audit', { recursive: true });
fs.writeFileSync('docs/audit/operations.json', JSON.stringify(operations, null, 2) + '\n');
fs.writeFileSync('docs/audit/operations.md', '# Operation implementation audit\n\nThese are source-level findings, not Windows runtime certification. PARTIAL_EQUIVALENT does not mean release-ready.\n\n| Operation | Classification | Baseline handler evidence | Finding |\n|---|---|---|---|\n' + operations.map(o => `| ${o.id} | ${o.classification} | ${o.baselineEvidence} | ${o.reason} |`).join('\n') + '\n');
fs.writeFileSync('docs/audit/features.md', '# Feature mapping audit\n\nOriginal IMPLEMENTED_WORKING labels are not trusted. A declared operation mapping is not proof of parity. REMOVED_SECURITY rows retain the original policy decision but require individual review; no unsafe feature has been reinstated.\n\n| Feature | Original reference | Declared operation | Source verdict |\n|---|---|---|---|\n' + features.map(f => {
  const op = operations.find(o => o.id === f.currentBackendOp);
  const verdict = f.status === 'REMOVED_SECURITY' ? 'REMOVED_SECURITY — prior decision, review pending' : op ? op.classification : 'MISSING_BEHAVIOR — no matching native operation mapping';
  return `| ${escape(f.id)} | ${escape(f.legacySource)} / ${escape(f.legacyLabel)} | ${escape(f.currentBackendOp)} | ${verdict} |`;
}).join('\n') + '\n');
const legacy = read('legacy-original/Toolkit.bat').split(/\r?\n/);
const labels = [];
for (let i = 0; i < legacy.length; i++) {
  if (/^:[^:]/.test(legacy[i])) {
    const name = legacy[i].slice(1).trim();
    let end = i + 1;
    while (end < legacy.length && !/^:[^:]/.test(legacy[end])) end++;
    labels.push({ label: name, startLine: i + 1, endLine: end, declaredFeatureMappings: features.filter(f => String(f.legacyLabel).split(/\s*\/\s*/).includes(name)).map(f => f.id), review: 'INDEXED_NOT_INDIVIDUALLY_VERIFIED', source: legacy.slice(i, end).join('\n') });
  }
}
fs.writeFileSync('docs/audit/legacy-labels.json', JSON.stringify(labels, null, 2) + '\n');
const manifest = [];
function walk(dir) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const name = path.join(dir, item.name);
    if (item.isDirectory()) walk(name);
    else manifest.push(`${crypto.createHash('sha256').update(fs.readFileSync(name)).digest('hex')}  ${name.replaceAll('\\', '/')}`);
  }
}
walk('legacy-original');
fs.writeFileSync('docs/audit/legacy-preserved.sha256', manifest.sort().join('\n') + '\n');
const summary = { operations: operations.length, nativeCommandPlans: native.size, missingNativeOperations: operations.filter(o => o.classification === 'MISSING_BEHAVIOR').length, declaredFeatures: features.length, indexedLegacyLabels: labels.length, preservedLegacyFiles: manifest.length, releaseReady: false };
fs.writeFileSync('docs/audit/summary.json', JSON.stringify(summary, null, 2) + '\n');
console.log(summary);
