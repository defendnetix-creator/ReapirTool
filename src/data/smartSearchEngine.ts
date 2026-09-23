/**
 * Smart Search Engine
 * Akshigo PC Toolkit Pro v8.0.0-rc.1
 * Phase 8.7: Global typed search across all toolkit facets
 */

import { ISSUE_LIBRARY, IssueDefinition } from './issueLibrary';
import { KNOWN_OPERATIONS_MAP } from './operationsCatalog';
import { COMMAND_VAULT_CATALOG } from './commandVaultCatalog';

export type SearchResultType =
  | 'FEATURE'
  | 'REPAIR_ACTION'
  | 'COMMAND_VAULT'
  | 'ISSUE'
  | 'INSTALLED_APP'
  | 'SERVICE'
  | 'PROCESS'
  | 'DRIVER'
  | 'EVENT_LOG'
  | 'SCHEDULED_TASK'
  | 'NETWORK_PORT';

export interface SmartSearchResult {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  type: SearchResultType;
  requiresAdmin: boolean;
  risk?: 'safe' | 'moderate' | 'high';
  operationId?: string;
  targetTab?: string;
  details?: string[];
  actionLabel?: string;
}

// Pre-seeded searchable system facets (derived from system diagnostics, services, drivers, and tasks)
const SYSTEM_SERVICES_DATA = [
  { name: 'wuauserv', displayName: 'Windows Update Service', status: 'Running', startup: 'Manual' },
  { name: 'Spooler', displayName: 'Print Spooler', status: 'Running', startup: 'Automatic' },
  { name: 'BITS', displayName: 'Background Intelligent Transfer Service', status: 'Running', startup: 'Manual' },
  { name: 'CryptSvc', displayName: 'Cryptographic Services', status: 'Running', startup: 'Automatic' },
  { name: 'Dhcp', displayName: 'DHCP Client Service', status: 'Running', startup: 'Automatic' },
  { name: 'Dnscache', displayName: 'DNS Client Resolver', status: 'Running', startup: 'Automatic' },
  { name: 'WinDefend', displayName: 'Microsoft Defender Antivirus Service', status: 'Running', startup: 'Automatic' },
  { name: 'TermService', displayName: 'Remote Desktop Services', status: 'Stopped', startup: 'Manual' },
  { name: 'RpcSs', displayName: 'Remote Procedure Call (RPC)', status: 'Running', startup: 'Automatic' },
  { name: 'LanmanServer', displayName: 'Server (SMB File & Print Sharing)', status: 'Running', startup: 'Automatic' }
];

const SYSTEM_PROCESSES_DATA = [
  { name: 'explorer.exe', pid: 5412, cpu: 1.2, memoryMB: 184, path: 'C:\\Windows\\explorer.exe' },
  { name: 'spoolsv.exe', pid: 2180, cpu: 0.1, memoryMB: 48, path: 'C:\\Windows\\System32\\spoolsv.exe' },
  { name: 'msedge.exe', pid: 14220, cpu: 3.4, memoryMB: 620, path: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe' },
  { name: 'dwm.exe', pid: 1204, cpu: 1.8, memoryMB: 96, path: 'C:\\Windows\\System32\\dwm.exe' },
  { name: 'taskmgr.exe', pid: 8940, cpu: 0.8, memoryMB: 65, path: 'C:\\Windows\\System32\\Taskmgr.exe' }
];

const SYSTEM_DRIVERS_DATA = [
  { name: 'nvlddmkm.sys', displayName: 'NVIDIA Windows Kernel Display Driver', version: '560.94', status: 'Running' },
  { name: 'e1d.sys', displayName: 'Intel Gigabit Network Connection Driver', version: '12.19.2.55', status: 'Running' },
  { name: 'iaStorVD.sys', displayName: 'Intel Rapid Storage NVMe Controller', version: '19.5.2.1049', status: 'Running' },
  { name: 'rtwlane.sys', displayName: 'Realtek 802.11ac Wireless LAN NIC Driver', version: '2024.0.10.223', status: 'Running' }
];

const SYSTEM_TASKS_DATA = [
  { name: 'AutomaticMaintenance', path: '\\Microsoft\\Windows\\TaskScheduler\\Maintenance Configurator', state: 'Ready' },
  { name: 'ScheduledScan', path: '\\Microsoft\\Windows\\Windows Defender\\Scheduled Scan', state: 'Ready' },
  { name: 'ChkdskScan', path: '\\Microsoft\\Windows\\Chkdsk\\ProactiveScan', state: 'Ready' },
  { name: 'DiskCleanup', path: '\\Microsoft\\Windows\\DiskCleanup\\SilentCleanup', state: 'Ready' }
];

const SYSTEM_PORTS_DATA = [
  { port: 80, protocol: 'TCP', service: 'HTTP Web Traffic', state: 'LISTENING' },
  { port: 443, protocol: 'TCP', service: 'HTTPS Secure Web', state: 'ESTABLISHED' },
  { port: 445, protocol: 'TCP', service: 'SMB File & Printer Sharing', state: 'LISTENING' },
  { port: 3389, protocol: 'TCP', service: 'RDP Remote Desktop Protocol', state: 'LISTENING' },
  { port: 9100, protocol: 'TCP', service: 'RAW Network Print Submission', state: 'LISTENING' },
  { port: 53, protocol: 'UDP', service: 'DNS Resolver Upstream', state: 'ESTABLISHED' }
];

export function executeSmartSearch(rawQuery: string): SmartSearchResult[] {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return [];

  const results: SmartSearchResult[] = [];

  // 1. Search Issue Library
  for (const issue of ISSUE_LIBRARY) {
    const matchTitle = issue.title.toLowerCase().includes(query);
    const matchCategory = issue.category.toLowerCase().includes(query);
    const matchDesc = issue.description.toLowerCase().includes(query);
    const matchSymptoms = issue.symptoms.some((s) => s.toLowerCase().includes(query));

    if (matchTitle || matchCategory || matchDesc || matchSymptoms) {
      results.push({
        id: `search-${issue.id}`,
        title: issue.title,
        subtitle: `Issue: ${issue.category} • Symptoms: ${issue.symptoms.slice(0, 2).join(', ')}`,
        category: issue.category,
        type: 'ISSUE',
        requiresAdmin: issue.requiresAdmin,
        risk: issue.riskLevel.toLowerCase() as any,
        operationId: issue.recommendedOperations[0],
        targetTab: 'repairs',
        details: [issue.description, `Recommended: ${issue.recommendedOperations.join(', ')}`],
        actionLabel: 'View Solution'
      });
    }
  }

  // 2. Search Operations / Repair Actions
  for (const [opId, op] of Object.entries(KNOWN_OPERATIONS_MAP)) {
    const matchId = op.id.toLowerCase().includes(query);
    const matchName = op.name.toLowerCase().includes(query);
    const matchDesc = op.description.toLowerCase().includes(query);
    const matchCat = op.category.toLowerCase().includes(query);

    if (matchId || matchName || matchDesc || matchCat) {
      results.push({
        id: `search-op-${op.id}`,
        title: op.name,
        subtitle: `[${op.id}] • ${op.category} • ${op.estimatedDuration}`,
        category: op.category,
        type: 'REPAIR_ACTION',
        requiresAdmin: op.requiresAdmin,
        risk: op.risk,
        operationId: op.id,
        targetTab: op.category.toLowerCase().includes('network')
          ? 'network'
          : op.category.toLowerCase().includes('software')
          ? 'software'
          : 'repairs',
        details: [op.description, `Admin required: ${op.requiresAdmin ? 'Yes' : 'No'}`],
        actionLabel: 'Execute Operation'
      });
    }
  }

  // 3. Search System Services
  for (const s of SYSTEM_SERVICES_DATA) {
    if (s.name.toLowerCase().includes(query) || s.displayName.toLowerCase().includes(query)) {
      results.push({
        id: `search-svc-${s.name}`,
        title: `${s.displayName} (${s.name})`,
        subtitle: `Windows Service • Status: ${s.status} • Startup: ${s.startup}`,
        category: 'Services',
        type: 'SERVICE',
        requiresAdmin: true,
        risk: 'moderate',
        targetTab: 'diagnostics',
        actionLabel: 'Inspect Service'
      });
    }
  }

  // 4. Search Processes
  for (const p of SYSTEM_PROCESSES_DATA) {
    if (p.name.toLowerCase().includes(query) || String(p.pid).includes(query)) {
      results.push({
        id: `search-proc-${p.pid}`,
        title: `${p.name} (PID: ${p.pid})`,
        subtitle: `Active Process • RAM: ${p.memoryMB} MB • CPU: ${p.cpu}%`,
        category: 'Process',
        type: 'PROCESS',
        requiresAdmin: false,
        risk: 'safe',
        targetTab: 'performance',
        actionLabel: 'View in Telemetry'
      });
    }
  }

  // 5. Search Drivers
  for (const d of SYSTEM_DRIVERS_DATA) {
    if (d.name.toLowerCase().includes(query) || d.displayName.toLowerCase().includes(query)) {
      results.push({
        id: `search-drv-${d.name}`,
        title: `${d.displayName} [${d.name}]`,
        subtitle: `Kernel Driver Store • Version: ${d.version} • ${d.status}`,
        category: 'Drivers',
        type: 'DRIVER',
        requiresAdmin: true,
        risk: 'safe',
        targetTab: 'diagnostics',
        actionLabel: 'Audit Driver'
      });
    }
  }

  // 6. Search Scheduled Tasks
  for (const t of SYSTEM_TASKS_DATA) {
    if (t.name.toLowerCase().includes(query) || t.path.toLowerCase().includes(query)) {
      results.push({
        id: `search-task-${t.name}`,
        title: t.name,
        subtitle: `Scheduled Task: ${t.path} • State: ${t.state}`,
        category: 'Tasks',
        type: 'SCHEDULED_TASK',
        requiresAdmin: true,
        risk: 'safe',
        targetTab: 'diagnostics',
        actionLabel: 'View Task'
      });
    }
  }

  // 7. Search Network Ports
  for (const port of SYSTEM_PORTS_DATA) {
    if (
      String(port.port).includes(query) ||
      port.service.toLowerCase().includes(query) ||
      port.protocol.toLowerCase().includes(query)
    ) {
      results.push({
        id: `search-port-${port.port}`,
        title: `Port ${port.port}/${port.protocol} - ${port.service}`,
        subtitle: `Socket Listening State: ${port.state}`,
        category: 'Network',
        type: 'NETWORK_PORT',
        requiresAdmin: false,
        risk: 'safe',
        targetTab: 'network',
        actionLabel: 'Inspect Port'
      });
    }
  }

  // 8. Navigation features
  const NAV_FEATURES = [
    { title: 'Problem Master Hub', cat: 'Troubleshooting', tab: 'repairs', desc: 'Guided symptom-based troubleshooting and auto-fix center' },
    { title: 'One-Click Super Repair', cat: 'Repair', tab: 'repairs', desc: 'Full automated 7-stage PC remediation pipeline' },
    { title: 'Self-Heal & Watchdog Monitor', cat: 'SelfHeal', tab: 'repairs', desc: 'Monitors toolkit background engine, loopback, and processes' },
    { title: 'AI Smart Auto Fix', cat: 'AI Repair', tab: 'ai-copilot', desc: 'Local heuristic triage, technician notes, and safe execution' },
    { title: 'Winget App Catalog & 100 Apps', cat: 'Software', tab: 'software', desc: 'Multi-app 1-click batch installer and software manager' },
    { title: 'System Diagnostics & Telemetry', cat: 'Diagnostics', tab: 'diagnostics', desc: 'Hardware components, SMART health, and logs' },
    { title: 'Reports & Audit Logs', cat: 'Reports', tab: 'reports', desc: 'Historical compliance, diagnostics, and remediation logs' },
    { title: 'Command Vault & Knowledge Base', cat: 'Reference', tab: 'command-vault', desc: 'Searchable administrative command library and safe runner' },
    { title: 'Performance Optimizer & Resource Suite', cat: 'Performance', tab: 'performance', desc: 'Safe optimizer, temp cleanup, power plans, and quick utilities' }
  ];

  for (const f of NAV_FEATURES) {
    if (f.title.toLowerCase().includes(query) || f.desc.toLowerCase().includes(query)) {
      results.push({
        id: `search-nav-${f.tab}-${f.title}`,
        title: f.title,
        subtitle: `Workspace: ${f.cat} • ${f.desc}`,
        category: f.cat,
        type: 'FEATURE',
        requiresAdmin: false,
        risk: 'safe',
        targetTab: f.tab,
        actionLabel: 'Navigate'
      });
    }
  }

  // 9. Search Command Vault Catalog
  for (const cmd of COMMAND_VAULT_CATALOG) {
    const matchTitle = cmd.title.toLowerCase().includes(query);
    const matchPreview = cmd.commandPreview.toLowerCase().includes(query);
    const matchDesc = cmd.description.toLowerCase().includes(query);
    const matchCat = cmd.category.toLowerCase().includes(query);
    const matchTags = cmd.tags.some((t) => t.toLowerCase().includes(query));

    if (matchTitle || matchPreview || matchDesc || matchCat || matchTags) {
      results.push({
        id: `search-cmd-${cmd.id}`,
        title: `${cmd.title} [${cmd.commandPreview}]`,
        subtitle: `Command Vault (${cmd.category}) • ${cmd.classification}`,
        category: cmd.category,
        type: 'COMMAND_VAULT',
        requiresAdmin: cmd.requiresAdmin,
        risk: cmd.riskLevel,
        operationId: cmd.registeredOperationId,
        targetTab: 'command-vault',
        details: [cmd.description, `Command: ${cmd.commandPreview}`, cmd.documentation],
        actionLabel: cmd.registeredOperationId ? 'Run Command' : 'View Reference'
      });
    }
  }

  return results.slice(0, 30);
}
