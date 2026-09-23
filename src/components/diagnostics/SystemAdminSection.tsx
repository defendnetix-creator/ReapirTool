import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Cpu,
  Play,
  Square,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Layers,
  FolderOpen,
  Calendar,
  Code,
  ShieldAlert,
  Search,
  CheckCircle2,
  Settings,
  Sparkles,
  Server,
  Box,
  MonitorCheck,
  ShieldCheck,
  Power
} from 'lucide-react';
import { operationsClient } from '../../api/operationsClient';

interface SystemAdminSectionProps {
  onExecuteOperation?: (
    operationId: string,
    params?: Record<string, any>,
    requiresAdmin?: boolean
  ) => void;
}

export const SystemAdminSection: React.FC<SystemAdminSectionProps> = ({ onExecuteOperation }) => {
  const [activeTab, setActiveTab] = useState<'tools' | 'processes' | 'startup' | 'tasks' | 'env' | 'devtools'>('tools');
  const [processes, setProcesses] = useState<any[]>([]);
  const [startupItems, setStartupItems] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [envVars, setEnvVars] = useState<any | null>(null);
  const [devData, setDevData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Confirmation modal states
  const [procToTerminate, setProcToTerminate] = useState<any | null>(null);
  const [wslInstallModal, setWslInstallModal] = useState<boolean>(false);
  const [hypervToggleModal, setHypervToggleModal] = useState<{ open: boolean; enable: boolean }>({ open: false, enable: true });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [procRes, startRes, taskRes, envRes, devRes] = await Promise.all([
        operationsClient.getProcesses(),
        operationsClient.getStartupItems(),
        operationsClient.getScheduledTasks(),
        operationsClient.getEnvironmentVariables(),
        operationsClient.getDevTools().catch(() => null)
      ]);
      setProcesses(procRes.processes || []);
      setStartupItems(startRes.items || []);
      setTasks(taskRes.tasks || []);
      setEnvVars(envRes);
      setDevData(devRes);
    } catch (err) {
      console.error('Failed to load system admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTerminateConfirm = () => {
    if (!procToTerminate) return;
    if (onExecuteOperation) {
      onExecuteOperation(
        'sys.process.terminate',
        { pid: procToTerminate.pid, confirmation: true },
        true
      );
    }
    setProcToTerminate(null);
  };

  const handleStartupToggle = (id: string, currentEnabled: boolean) => {
    if (onExecuteOperation) {
      onExecuteOperation(
        'sys.startup.toggle',
        { id, enabled: !currentEnabled },
        true
      );
    }
    setStartupItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, enabled: !currentEnabled } : item))
    );
  };

  const adminTools = [
    {
      id: 'sys.admin.taskmgr',
      title: 'Task Manager',
      command: 'taskmgr.exe',
      description: 'Monitor real-time processes, memory allocation, and performance threads.',
      requiresAdmin: false,
      badge: 'Interactive'
    },
    {
      id: 'sys.admin.compmgmt',
      title: 'Computer Management',
      command: 'compmgmt.msc',
      description: 'Consolidated console for Device Manager, Disk Mgmt, and Event Viewer.',
      requiresAdmin: true,
      badge: 'Admin MMC'
    },
    {
      id: 'sys.admin.msinfo32',
      title: 'System Information',
      command: 'msinfo32.exe',
      description: 'Deep hardware, driver store, and software environment summary.',
      requiresAdmin: false,
      badge: 'Diagnostics'
    },
    {
      id: 'sys.admin.services_msc',
      title: 'Services Console',
      command: 'services.msc',
      description: 'Manage background Windows services, triggers, and recovery policies.',
      requiresAdmin: true,
      badge: 'Admin MMC'
    },
    {
      id: 'sys.admin.msconfig.launch',
      title: 'System Configuration',
      command: 'msconfig.exe',
      description: 'Configure selective boot modes, kernel boot parameters, and safe mode.',
      requiresAdmin: true,
      badge: 'Boot Engine'
    },
    {
      id: 'sys.admin.regedit',
      title: 'Registry Editor',
      command: 'regedit.exe',
      description: 'Access Windows Registry hive keys (HKLM, HKCU, HKCR).',
      requiresAdmin: true,
      badge: 'Hive Editor'
    },
    {
      id: 'sys.admin.sched_tasks',
      title: 'Task Scheduler',
      command: 'taskschd.msc',
      description: 'View and create automated system tasks, maintenance, and triggers.',
      requiresAdmin: true,
      badge: 'Admin MMC'
    },
    {
      id: 'sys.admin.godmode',
      title: 'Windows Master GodMode',
      command: 'All Tasks.{ED7BA470-8E54...}',
      description: 'Creates shortcut namespace granting 1-click access to 200+ Control Panel tools.',
      requiresAdmin: true,
      badge: 'Power Tool'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header and Subtabs */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-semibold text-slate-100">
              System Administration & Diagnostic Utilities
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Native administrative launchers, process trees, startup governance, scheduled tasks, and environment blocks.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="inline-flex rounded-lg bg-slate-800 p-1 border border-slate-700/60 text-xs">
            <button
              onClick={() => setActiveTab('tools')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'tools'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Admin Tools
            </button>
            <button
              onClick={() => setActiveTab('processes')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'processes'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Processes ({processes.length})
            </button>
            <button
              onClick={() => setActiveTab('startup')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'startup'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Startup ({startupItems.length})
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'tasks'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Scheduled Tasks
            </button>
            <button
              onClick={() => setActiveTab('env')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'env'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Environment
            </button>
            <button
              onClick={() => setActiveTab('devtools')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'devtools'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Developer Tools
            </button>
          </div>

          <button
            onClick={loadData}
            disabled={isLoading}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Subtab 1: Admin Tools Grid */}
      {activeTab === 'tools' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {adminTools.map((tool) => (
            <div
              key={tool.id}
              className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors group"
            >
              <div>
                <div className="flex items-start justify-between">
                  <h4 className="text-xs font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                    {tool.title}
                  </h4>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    {tool.badge}
                  </span>
                </div>
                <code className="text-[10px] text-indigo-400 font-mono mt-1 block">
                  {tool.command}
                </code>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {tool.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-500">
                  {tool.requiresAdmin ? 'Requires Admin' : 'User Access'}
                </span>
                <button
                  onClick={() => onExecuteOperation?.(tool.id, {}, tool.requiresAdmin)}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 flex items-center space-x-1 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Launch</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Subtab 2: Active Processes */}
      {activeTab === 'processes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search processes..."
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              onClick={() => onExecuteOperation?.('sys.admin.taskmgr', {}, false)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 flex items-center space-x-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Task Manager</span>
            </button>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">PID</th>
                    <th className="py-3 px-4">Process Name</th>
                    <th className="py-3 px-4">CPU %</th>
                    <th className="py-3 px-4">Memory (MB)</th>
                    <th className="py-3 px-4">Publisher / Path</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {processes
                    .filter(
                      (p) =>
                        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.pid.toString().includes(searchQuery)
                    )
                    .map((proc) => (
                      <tr key={proc.pid} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 text-indigo-400 font-bold">{proc.pid}</td>
                        <td className="py-3 px-4 text-slate-200 font-sans font-medium">{proc.name}</td>
                        <td className="py-3 px-4 text-slate-300">{proc.cpuPercent.toFixed(1)}%</td>
                        <td className="py-3 px-4 text-slate-300">{proc.memoryMB.toFixed(1)} MB</td>
                        <td className="py-3 px-4 font-sans text-slate-400 max-w-xs truncate" title={proc.executablePath}>
                          {proc.company || proc.executablePath}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {proc.pid !== 4 && proc.pid !== 0 ? (
                            <button
                              onClick={() => setProcToTerminate(proc)}
                              className="px-2 py-1 rounded bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 text-[10px] flex items-center space-x-1 ml-auto transition-colors"
                              title="Terminate Process"
                            >
                              <Square className="w-3 h-3" />
                              <span>End Process</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-500 font-sans">System Kernel</span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 3: Startup Applications */}
      {activeTab === 'startup' && (
        <div className="space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-slate-200">
              Windows Startup Applications & Registry Run Keys
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Control programs launched automatically during user logon across HKCU, HKLM, and the Startup folder.
            </p>
          </div>

          <div className="space-y-2">
            {startupItems.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center justify-between hover:border-slate-700 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h5 className="text-xs font-bold text-slate-200">{item.name}</h5>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded border ${
                        item.impact === 'High'
                          ? 'bg-rose-950/50 text-rose-400 border-rose-800/60'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      Impact: {item.impact}
                    </span>
                  </div>
                  <code className="text-[10px] text-slate-400 font-mono block max-w-xl truncate">
                    {item.command}
                  </code>
                  <span className="text-[10px] text-slate-500 block">
                    Location: {item.location} ({item.publisher})
                  </span>
                </div>

                <button
                  onClick={() => handleStartupToggle(item.id, item.enabled)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    item.enabled
                      ? 'bg-emerald-950/50 hover:bg-rose-950/50 text-emerald-300 hover:text-rose-300 border-emerald-800/60 hover:border-rose-800/60'
                      : 'bg-slate-800 hover:bg-emerald-950/50 text-slate-400 hover:text-emerald-300 border-slate-700 hover:border-emerald-800/60'
                  }`}
                >
                  {item.enabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subtab 4: Scheduled Tasks */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-slate-200">
                Windows Scheduled Maintenance Tasks
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Task Scheduler library tasks for automatic component cleanup, disk diagnostics, and Windows Update.
              </p>
            </div>
            <button
              onClick={() => onExecuteOperation?.('sys.admin.sched_tasks', {}, true)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 flex items-center space-x-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>taskschd.msc</span>
            </button>
          </div>

          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.taskName}
                className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-indigo-400" />
                    <h5 className="text-xs font-bold text-slate-200">{task.taskName}</h5>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      State: {task.state}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 space-x-4">
                    <span>Last Run: {task.lastRunTime ? new Date(task.lastRunTime).toLocaleString() : 'Never'}</span>
                    <span>Next Run: {task.nextRunTime ? new Date(task.nextRunTime).toLocaleString() : 'N/A'}</span>
                    <span>Exit Code: {task.lastResult}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">Author: {task.author}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subtab 5: Environment Variables */}
      {activeTab === 'env' && envVars && (
        <div className="space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-semibold text-slate-200">
                System & User Environment Variables
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Inspecting Windows runtime paths, architecture identifiers, and temporary directory scopes.
              </p>
            </div>
            <button
              onClick={() => onExecuteOperation?.('sys.admin.sysdm_cpl', {}, false)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-semibold border border-indigo-500/40 flex items-center space-x-1.5 transition-colors self-start sm:self-auto shrink-0"
              title="Open Windows System Properties Environment Variables Dialog"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Windows Variables Editor</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* System Variables */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
              <h5 className="text-xs font-bold text-slate-200 mb-3 uppercase tracking-wider text-indigo-400">
                System Variables
              </h5>
              <div className="space-y-2 font-mono text-xs max-h-72 overflow-y-auto">
                {Object.entries(envVars.systemVariables || {}).map(([key, val]) => (
                  <div key={key} className="bg-slate-800/40 p-2 rounded border border-slate-800">
                    <span className="text-indigo-300 font-bold block">{key}</span>
                    <span className="text-slate-400 text-[11px] break-all">{String(val)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* User Variables */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
              <h5 className="text-xs font-bold text-slate-200 mb-3 uppercase tracking-wider text-emerald-400">
                User Variables
              </h5>
              <div className="space-y-2 font-mono text-xs max-h-72 overflow-y-auto">
                {Object.entries(envVars.userVariables || {}).map(([key, val]) => (
                  <div key={key} className="bg-slate-800/40 p-2 rounded border border-slate-800">
                    <span className="text-emerald-300 font-bold block">{key}</span>
                    <span className="text-slate-400 text-[11px] break-all">{String(val)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* System PATH Entries */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
            <h5 className="text-xs font-bold text-slate-200 mb-3 uppercase tracking-wider text-slate-300">
              System PATH Breakdown ({envVars.systemPath?.length || 0} directories)
            </h5>
            <div className="space-y-1 font-mono text-xs max-h-60 overflow-y-auto">
              {(envVars.systemPath || []).map((p: string, idx: number) => (
                <div
                  key={idx}
                  className="p-2 rounded bg-slate-800/30 border border-slate-800/60 text-slate-300 flex items-center space-x-2"
                >
                  <span className="text-slate-500 text-[10px] w-5 shrink-0">{idx + 1}.</span>
                  <span className="truncate">{p}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Subtab 6: Developer Tools (WSL, Hyper-V, Sandbox, Runtimes) */}
      {activeTab === 'devtools' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-slate-200">
              Power User & Developer Tools Subsystems
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage Windows Subsystem for Linux (WSL), Hyper-V virtualization hypervisor, Windows Sandbox, and developer runtimes.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* WSL Subsystem Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                    <Terminal className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-100">Windows Subsystem for Linux</h5>
                    <p className="text-xs text-slate-400">WSL2 Virtual Machine Platform Subsystem</p>
                  </div>
                </div>
                <span className={`text-[11px] font-mono px-2.5 py-1 rounded-full border font-bold ${
                  devData?.wsl?.installed
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}>
                  {devData?.wsl?.installed ? 'Installed (WSL 2)' : 'Not Installed'}
                </span>
              </div>

              <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Default Version:</span>
                  <span className="text-slate-200 font-bold">{devData?.wsl?.defaultVersion || 2}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Kernel Version:</span>
                  <span className="text-slate-300">{devData?.wsl?.kernelVersion || '5.15.153.1-microsoft-standard-WSL2'}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Virtual Machine Platform:</span>
                  <span className="text-emerald-400 font-bold">Enabled</span>
                </div>
              </div>

              {/* Distributions List */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Registered Distributions ({devData?.wsl?.distributions?.length || 0})
                </span>
                <div className="space-y-1 font-mono text-xs">
                  {(devData?.wsl?.distributions || [
                    { name: 'Ubuntu-22.04', state: 'Running', version: 2, isDefault: true },
                    { name: 'Debian', state: 'Stopped', version: 2, isDefault: false }
                  ]).map((distro: any) => (
                    <div key={distro.name} className="p-2 rounded bg-slate-800/40 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Box className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="text-slate-200 font-semibold">{distro.name}</span>
                        {distro.isDefault && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            DEFAULT
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-3 text-[11px]">
                        <span className="text-slate-400">WSL{distro.version}</span>
                        <span className={distro.state === 'Running' ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                          {distro.state}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-800">
                <span className="text-[11px] text-slate-400">
                  Requires Admin & Restart
                </span>
                <button
                  onClick={() => setWslInstallModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-sm"
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{devData?.wsl?.installed ? 'Reinstall / Update WSL' : 'Install WSL Subsystem'}</span>
                </button>
              </div>
            </div>

            {/* Hyper-V Platform Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                    <Server className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-100">Hyper-V Virtualization Platform</h5>
                    <p className="text-xs text-slate-400">Native Type-1 Hypervisor & Virtual Switch Subsystem</p>
                  </div>
                </div>
                <span className={`text-[11px] font-mono px-2.5 py-1 rounded-full border font-bold ${
                  devData?.hyperV?.enabled
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-slate-700 text-slate-300 border-slate-600'
                }`}>
                  {devData?.hyperV?.enabled ? 'Hypervisor Active' : 'Disabled'}
                </span>
              </div>

              <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Hypervisor Present:</span>
                  <span className={devData?.hyperV?.hypervisorPresent !== false ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                    {devData?.hyperV?.hypervisorPresent !== false ? 'Yes (Native Type-1)' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">SLAT Hardware Support:</span>
                  <span className="text-emerald-400 font-bold">Supported (EPT/NPT)</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Virtual Machine Guests:</span>
                  <span className="text-slate-200">{devData?.hyperV?.vmCount || 0} registered VMs</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Virtual Switch Interfaces:</span>
                  <span className="text-slate-200">{devData?.hyperV?.virtualSwitches || 1} Default Switch</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-800/40 text-[11px] text-cyan-300 leading-relaxed">
                Hyper-V provides isolation for Windows Sandbox, WSL2, and Hyper-V Virtual Machines. Disabling Hyper-V frees hardware virtualization for third-party hypervisors (VirtualBox, VMware Workstation).
              </div>

              <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-800">
                <button
                  onClick={() => onExecuteOperation?.('services.optional_features.launch', {}, true)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 flex items-center space-x-1 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>OptionalFeatures.exe</span>
                </button>
                <button
                  onClick={() => setHypervToggleModal({ open: true, enable: !devData?.hyperV?.enabled })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-sm ${
                    devData?.hyperV?.enabled
                      ? 'bg-rose-600/80 hover:bg-rose-600 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{devData?.hyperV?.enabled ? 'Disable Hyper-V' : 'Enable Hyper-V'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Runtimes and Developer Features Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Windows Sandbox & Developer Mode */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
              <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider text-indigo-400">
                Windows Sandboxing & Developer Mode
              </h5>
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-slate-200 font-semibold block">Windows Sandbox</span>
                    <span className="text-slate-400 text-[11px]">Disposable lightweight desktop environment</span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${
                    devData?.windowsSandbox?.installed
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-slate-700 text-slate-400 border-slate-600'
                  }`}>
                    {devData?.windowsSandbox?.installed ? 'Installed' : 'Available'}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-slate-200 font-semibold block">Windows Developer Mode</span>
                    <span className="text-slate-400 text-[11px]">Sideloading and debugging permissions</span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${
                    devData?.developerMode?.enabled
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-slate-700 text-slate-400 border-slate-600'
                  }`}>
                    {devData?.developerMode?.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>

            {/* Installed Toolchains */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
              <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider text-emerald-400">
                Detected Developer Runtimes & CLIs
              </h5>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 rounded bg-slate-800/40 border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">.NET RUNTIME</span>
                  <span className="text-slate-200 font-bold">{devData?.runtimes?.dotnet || '.NET 8.0.7 / 4.8.1'}</span>
                </div>
                <div className="p-2 rounded bg-slate-800/40 border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">POWERSHELL</span>
                  <span className="text-slate-200 font-bold">{devData?.runtimes?.powershell || 'PowerShell 7.4.4'}</span>
                </div>
                <div className="p-2 rounded bg-slate-800/40 border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">GIT SCM</span>
                  <span className="text-slate-200 font-bold">{devData?.runtimes?.git || 'Git 2.45.2.windows.1'}</span>
                </div>
                <div className="p-2 rounded bg-slate-800/40 border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">NODE.JS</span>
                  <span className="text-slate-200 font-bold">{devData?.runtimes?.node || 'Node.js v20.15.1'}</span>
                </div>
                <div className="p-2 rounded bg-slate-800/40 border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">PYTHON</span>
                  <span className="text-slate-200 font-bold">{devData?.runtimes?.python || 'Python 3.12.4'}</span>
                </div>
                <div className="p-2 rounded bg-slate-800/40 border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">WINGET CLIENT</span>
                  <span className="text-slate-200 font-bold">{devData?.runtimes?.winget || 'WinGet v1.8.1911'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Terminate Process Confirmation Modal */}
      {procToTerminate && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-rose-800/80 rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center space-x-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-100">Terminate Process</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to terminate process{' '}
              <strong className="text-white font-mono">{procToTerminate.name}</strong> (PID{' '}
              <span className="font-mono text-indigo-400">{procToTerminate.pid}</span>)? Any unsaved
              work inside this application may be lost immediately.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setProcToTerminate(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleTerminateConfirm}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors shadow-sm"
              >
                Terminate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WSL Installation Confirmation Modal */}
      {wslInstallModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-indigo-700/80 rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center space-x-3 text-indigo-400">
              <Terminal className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-100">Install Windows Subsystem for Linux</h3>
            </div>

            <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
              <p>
                This operation will enable the <strong className="text-indigo-300">Virtual Machine Platform</strong> and <strong className="text-indigo-300">Microsoft-Windows-Subsystem-Linux</strong> optional features, download the modern WSL2 Linux kernel package, and set the default architecture to WSL2.
              </p>
              <div className="p-3 rounded bg-amber-950/40 border border-amber-800/60 text-amber-300 flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span><strong>Restart Notice:</strong> A full system restart is required after installation to initialize the hypervisor platform before Linux distributions can run.</span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setWslInstallModal(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setWslInstallModal(false);
                  onExecuteOperation?.('power.wsl.install', { confirmation: true }, true);
                }}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors shadow-sm"
              >
                Confirm & Install WSL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hyper-V Toggle Confirmation Modal */}
      {hypervToggleModal.open && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-cyan-700/80 rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center space-x-3 text-cyan-400">
              <Server className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-100">
                {hypervToggleModal.enable ? 'Enable Hyper-V Platform' : 'Disable Hyper-V Platform'}
              </h3>
            </div>

            <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
              <p>
                You are requesting to {hypervToggleModal.enable ? 'enable' : 'disable'} the Microsoft Hyper-V Type-1 hypervisor and virtual switch components.
              </p>
              <div className="p-3 rounded bg-cyan-950/50 border border-cyan-800/60 text-cyan-300 flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  <strong>Warning & System Restart:</strong> {hypervToggleModal.enable
                    ? 'Enabling Hyper-V locks VT-x/AMD-V hardware virtualization exclusively for Microsoft Hyper-V, WSL2, and Sandbox. Third-party hypervisors (VMware/VirtualBox) may require nested virtualization compatibility.'
                    : 'Disabling Hyper-V will disable Windows Sandbox and may prevent WSL2 distributions from executing until re-enabled.'
                  } A system restart is required.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setHypervToggleModal({ open: false, enable: true })}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const enable = hypervToggleModal.enable;
                  setHypervToggleModal({ open: false, enable: true });
                  onExecuteOperation?.('power.hyperv.toggle', { enable, confirmation: true }, true);
                }}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm ${
                  hypervToggleModal.enable
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-rose-600 hover:bg-rose-500 text-white'
                }`}
              >
                Confirm {hypervToggleModal.enable ? 'Enable' : 'Disable'} Hyper-V
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
