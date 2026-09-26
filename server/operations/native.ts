import { spawn } from 'node:child_process';
import path from 'node:path';
import { isIP } from 'node:net';
import { OPERATION_DEFINITIONS } from './registry.js';

export interface Command { executable: string; args: string[]; reboot?: boolean; json?: boolean }
const command = (executable: string, ...args: string[]): Command => ({ executable, args });
const dism = (action: string) => command('Dism.exe', '/Online', '/Cleanup-Image', action);
const script = (file: 'services.ps1' | 'restore-points.ps1', ...args: string[]): Command => ({
  executable: 'WindowsPowerShell\\v1.0\\powershell.exe',
  args: ['-NoLogo', '-NoProfile', '-NonInteractive', '-File', path.resolve('server/operations/windows', file), ...args], json: true
});
export const controllableServices = new Set(['spooler', 'wuauserv', 'bits', 'sysmain', 'wsearch', 'trustedinstaller', 'msiserver']);

// No shell, downloaded programs, encoded scripts, or caller-supplied executable names.
const plans: Record<string, Command[]> = {
  'repair.sfc.scannow': [command('sfc.exe', '/scannow')],
  'repair.sfc.verifyonly': [command('sfc.exe', '/verifyonly')],
  'repair.dism.checkhealth': [dism('/CheckHealth')],
  'repair.dism.scanhealth': [dism('/ScanHealth')],
  'repair.dism.restorehealth': [dism('/RestoreHealth')],
  'repair.dism.clean_store': [dism('/StartComponentCleanup')],
  // Toolkit.bat:sfc_dism option 10: preserve SFC then DISM; no added cleanup.
  'repair.sfc_dism.full': [command('sfc.exe', '/scannow'), dism('/RestoreHealth')],
  'network.dns.flush': [command('ipconfig.exe', '/flushdns')],
  'network.ip.release': [command('ipconfig.exe', '/release')],
  'network.ip.renew': [command('ipconfig.exe', '/renew')],
  'network.winsock.reset': [{ ...command('netsh.exe', 'winsock', 'reset'), reboot: true }],
  'network.tcpip.reset': [{ ...command('netsh.exe', 'int', 'ip', 'reset'), reboot: true }],
  'network.proxy.status': [command('netsh.exe', 'winhttp', 'show', 'proxy')],
  'network.proxy.reset': [command('netsh.exe', 'winhttp', 'reset', 'proxy')],
  'network.netstat.sockets': [command('netstat.exe', '-ano')],
  'driver.pnputil.enum': [command('pnputil.exe', '/enum-drivers')],
  'sys.process.list': [command('tasklist.exe')],
  'sys.tasks.list': [command('schtasks.exe', '/query', '/fo', 'LIST', '/v')],
  'services.optional_features.dism': [command('Dism.exe', '/Online', '/Get-Features', '/Format:Table')],
  'services.hyperv.status': [command('Dism.exe', '/Online', '/Get-FeatureInfo', '/FeatureName:Microsoft-Hyper-V-All')],
  'services.wsl.status': [command('Dism.exe', '/Online', '/Get-FeatureInfo', '/FeatureName:Microsoft-Windows-Subsystem-Linux')],
  'services.inventory.list': [script('services.ps1', '-Action', 'List')],
  'backup.restore_points.list': [script('restore-points.ps1', '-Action', 'List')],
  'repair.recovery.list_restore_points': [script('restore-points.ps1', '-Action', 'List')],
};

export const nativeOperationIds = new Set([...Object.keys(plans), 'repair.sfc.scanfile', 'repair.dism.source_wim', 'network.ping.test', 'network.dns.lookup', 'network.traceroute', 'storage.chkdsk.scan', 'services.start', 'services.stop', 'services.restart', 'services.startup_type.set', 'backup.restore_point.create', 'repair.recovery.create_restore_point']);

function targetHost(value: unknown): string {
  if (typeof value !== 'string' || value.length > 253 ||
      !(isIP(value) || /^(?=.{1,253}$)[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)*\.?$/i.test(value))) {
    throw new Error('Enter an IP address or DNS host name, without command options.');
  }
  return value;
}

function localFile(value: unknown): string {
  if (typeof value !== 'string' || !/^[a-z]:\\/i.test(value) || /[\x00-\x1f"<>|?*]/.test(value) || value.slice(2).includes(':')) {
    throw new Error('An absolute local Windows file path is required.');
  }
  return path.win32.normalize(value);
}

export function planOperation(id: string, params: Record<string, unknown> = {}): Command[] {
  if (!Object.hasOwn(OPERATION_DEFINITIONS, id) || !nativeOperationIds.has(id)) throw new Error(`NOT_IMPLEMENTED: ${id} has no verified native implementation.`);
  const parameterKeys: Record<string, string[]> = {
    'repair.sfc.scanfile': ['filePath'], 'repair.dism.source_wim': ['sourcePath', 'sourceIndex'],
    'network.ping.test': ['targetHost'], 'network.dns.lookup': ['hostname'],
    'network.traceroute': ['target'], 'storage.chkdsk.scan': ['volume'],
    'services.start': ['serviceName'], 'services.stop': ['serviceName'], 'services.restart': ['serviceName'],
    'services.startup_type.set': ['serviceName', 'startType'],
    'backup.restore_point.create': ['description'], 'repair.recovery.create_restore_point': ['description']
  };
  const allowed = parameterKeys[id] || [];
  if (!params || typeof params !== 'object' || Array.isArray(params) || Object.keys(params).some(k => !allowed.includes(k))) throw new Error('Unexpected operation parameters.');
  if (['services.start', 'services.stop', 'services.restart', 'services.startup_type.set'].includes(id)) {
    if (typeof params.serviceName !== 'string' || !controllableServices.has(params.serviceName.toLowerCase())) throw new Error('Service is outside the audited control allowlist.');
    const action = { 'services.start': 'Start', 'services.stop': 'Stop', 'services.restart': 'Restart', 'services.startup_type.set': 'SetStartup' }[id];
    const args = ['-Action', action, '-ServiceName', params.serviceName];
    if (id === 'services.startup_type.set') {
      if (typeof params.startType !== 'string' || !['Automatic', 'Manual', 'Disabled', 'Automatic (Delayed)'].includes(params.startType)) throw new Error('Invalid service startup type.');
      if (params.startType === 'Disabled' && ['wuauserv', 'bits', 'trustedinstaller', 'msiserver'].includes(params.serviceName.toLowerCase())) throw new Error('Disabling Windows servicing/update infrastructure is not supported.');
      args.push('-StartType', params.startType);
    }
    return [script('services.ps1', ...args)];
  }
  if (id === 'backup.restore_point.create' || id === 'repair.recovery.create_restore_point') {
    if (typeof params.description !== 'string' || !params.description.trim() || params.description.length > 128 || /^[\s]*-/.test(params.description) || /[\x00-\x1f]/.test(params.description)) throw new Error('A description of 1–128 characters is required; it cannot begin with a hyphen.');
    return [script('restore-points.ps1', '-Action', 'Create', '-Description', params.description)];
  }
  if (id === 'repair.sfc.scanfile') return [command('sfc.exe', `/scanfile=${localFile(params.filePath)}`)];
  if (id === 'network.ping.test') return [command('ping.exe', '-n', '4', targetHost(params.targetHost))];
  if (id === 'network.dns.lookup') return [command('nslookup.exe', targetHost(params.hostname))];
  if (id === 'network.traceroute') return [command('tracert.exe', targetHost(params.target))];
  if (id === 'storage.chkdsk.scan') {
    if (typeof params.volume !== 'string' || !/^[a-z]:$/i.test(params.volume)) throw new Error('Select a drive letter such as C:.');
    // A read-only inspection: /scan is an online NTFS scan with different semantics.
    return [command('chkdsk.exe', params.volume.toUpperCase())];
  }
  if (id === 'repair.dism.source_wim') {
    const source = localFile(params.sourcePath);
    const kind = path.win32.extname(source).slice(1).toLowerCase();
    if (!['wim', 'esd'].includes(kind) || !Number.isInteger(params.sourceIndex) || Number(params.sourceIndex) < 1) throw new Error('A WIM/ESD file and explicit positive sourceIndex are required.');
    return [{ ...dism('/RestoreHealth'), args: [...dism('/RestoreHealth').args, `/Source:${kind}:${source}:${params.sourceIndex}`, '/LimitAccess'] }];
  }
  return plans[id].map(c => ({ ...c, args: [...c.args] }));
}

export type Runner = (cmd: Command) => Promise<{ exitCode: number; output: string }>;

export const runCommand: Runner = cmd => new Promise((resolve, reject) => {
  if (process.platform !== 'win32') return reject(new Error('Windows is required.'));
  const root = process.env.SystemRoot;
  if (!root || !/^[a-z]:\\[^\r\n]+$/i.test(root)) return reject(new Error('Invalid Windows system root.'));
  const systemDirectory = process.arch === 'ia32' && process.env.PROCESSOR_ARCHITEW6432 ? 'Sysnative' : 'System32';
  const child = spawn(path.win32.join(root, systemDirectory, cmd.executable), cmd.args, {
    shell: false, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe']
  });
  let output = Buffer.alloc(0);
  let truncated = false;
  const outputLimit = cmd.json ? 4194304 : 262144;
  const capture = (data: Buffer) => {
    truncated ||= output.length + data.length > outputLimit;
    output = Buffer.concat([output, data]).subarray(-outputLimit);
  };
  child.stdout.on('data', capture);
  child.stderr.on('data', capture);
  child.once('error', reject);
  child.once('close', code => {
    if (code === null) return reject(new Error('Process ended without an exit code.'));
    if (cmd.json && truncated) return reject(new Error('Windows inventory exceeded the output limit; no partial inventory will be reported.'));
    const utf16 = (output[0] === 255 && output[1] === 254) || output.subarray(0, 512).includes(0);
    resolve({ exitCode: code, output: output.toString(utf16 ? 'utf16le' : 'utf8').replace(/^\uFEFF/, '') });
  });
});

export interface NativeResult extends Record<string, unknown> {
  commands: Array<{ exitCode: number; output: string }>;
  requiresRestart: boolean;
  message: string;
}

export async function executeNative(id: string, params: Record<string, unknown>, progress: (percent: number, step: string, log: string) => void, runner: Runner = runCommand): Promise<NativeResult> {
  const plan = planOperation(id, params);
  const results: Array<{ exitCode: number; output: string }> = [];
  let requiresRestart = false;
  let data: Record<string, unknown> = {};
  for (const [index, cmd] of plan.entries()) {
    progress(Math.round(index / plan.length * 100), `Running ${cmd.executable}`, `${cmd.executable} ${cmd.args.join(' ')}`);
    const result = await runner(cmd);
    results.push(result);
    progress(Math.round((index + 1) / plan.length * 100), `${cmd.executable} exited: ${result.exitCode}`, result.output);
    // DISM 3010 is successful with reboot required. Never invent repair counts or health.
    if (result.exitCode !== 0 && !(cmd.executable === 'Dism.exe' && result.exitCode === 3010)) throw new Error(`${cmd.executable} failed with exit code ${result.exitCode}. See operation output.`);
    if (cmd.json) {
      const parsed = JSON.parse(result.output.trim());
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Windows provider did not return a structured result.');
      data = parsed;
    }
    requiresRestart ||= !!cmd.reboot || result.exitCode === 3010;
  }
  return { ...data, commands: results, requiresRestart, message: 'Commands completed. Review their output for findings.' };
}
