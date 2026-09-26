import fs from 'node:fs';
import { spawn } from 'node:child_process';

const directory = 'docs/audit/checkpoint-tests';
fs.mkdirSync(directory, { recursive: true });
const suites = fs.readdirSync('scripts').filter(name => /^test.*\.ts$/.test(name)).sort();
const generatedPath = 'scripts/qa_report_data.json';
const originalReport = fs.readFileSync(generatedPath);
const results = [];
try {
  for (const suite of suites) {
    const result = await new Promise(resolve => {
      const child = spawn(process.execPath, ['--import', 'tsx', '--test', `scripts/${suite}`], {
        windowsHide: true,
        env: { ...process.env, AKSHIGO_NATIVE_OPERATIONS: '0', EMAIL_PROVIDER: 'mock', RAZORPAY_MODE: 'test', RAZORPAY_KEY_SECRET: 'test-only-checkpoint-secret', RAZORPAY_WEBHOOK_SECRET: 'test-only-checkpoint-webhook' },
        stdio: ['ignore', 'pipe', 'pipe']
      });
      let output = '';
      child.stdout.on('data', chunk => { output += chunk; });
      child.stderr.on('data', chunk => { output += chunk; });
      child.on('error', error => { output += error.message; });
      child.on('close', (code, signal) => resolve({ suite, exitCode: code, signal, output }));
    });
    fs.writeFileSync(`${directory}/${suite}.txt`, result.output);
    const { output, ...summary } = result;
    results.push(summary);
    console.log(`${suite}: exit ${result.exitCode}`);
  }
} finally {
  // The historical Phase 9 script generates metadata-based parity assertions. Do not
  // overwrite the repository report or treat its result as Windows runtime evidence.
  fs.writeFileSync(generatedPath, originalReport);
  fs.writeFileSync(`${directory}/summary.json`, JSON.stringify({ nativeMutationsEnabled: false, emailProvider: 'mock', results, note: 'Phase 7/8/9 legacy suites use simulations/metadata and are not native runtime certification.' }, null, 2) + '\n');
}
if (results.some(result => result.exitCode !== 0)) process.exitCode = 1;
