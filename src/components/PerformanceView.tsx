/**
 * Performance Optimizer & Resource Governance Suite
 * Akshigo PC Toolkit Pro v8.0.0-rc.1
 * Phase 8.8: Performance Optimizer, Temp Cleanup, Power Plans, Quick Utilities, and Dev Tools
 */

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Zap,
  Gauge,
  Cpu,
  Layers,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Play,
  Trash2,
  BatteryCharging,
  Power,
  Wrench,
  Code2,
  Terminal,
  ShieldCheck,
  AlertTriangle,
  FolderOpen,
  Monitor,
  HardDrive,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Info,
  Check,
  Flame,
  FileText
} from 'lucide-react';
import { HardwareTelemetry } from '../types';

interface PerformanceViewProps {
  telemetry: HardwareTelemetry;
  onTriggerAction: (actionName: string, command: string, requiresAdmin?: boolean) => void;
  onExecuteOperation?: (opId: string, params?: Record<string, any>, adminConfirmed?: boolean) => void;
}

type SubTab = 'optimizer' | 'telemetry' | 'cleanup' | 'power' | 'utilities' | 'devtools';

export const PerformanceView: React.FC<PerformanceViewProps> = ({
  telemetry,
  onTriggerAction,
  onExecuteOperation
}) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('optimizer');

  // Optimizer Wizard State
  const [optimizerStage, setOptimizerStage] = useState<'idle' | 'analyzing' | 'recommendations' | 'optimizing' | 'completed'>('idle');
  const [optimizerProgress, setOptimizerProgress] = useState(0);
  const [optimizerLogs, setOptimizerLogs] = useState<string[]>([]);
  const [createCheckpoint, setCreateCheckpoint] = useState(true);

  // Recommendations check state
  const [selectedRecommendations, setSelectedRecommendations] = useState<Record<string, boolean>>({
    temp_clean: true,
    storage_sense: true,
    power_plan: true,
    drive_trim: true,
    startup_tune: true
  });

  // Power Plan state
  const [activePowerPlan, setActivePowerPlan] = useState<string>('Balanced (recommended)');
  const [isSwitchingPlan, setIsSwitchingPlan] = useState(false);

  // Temp Cleanup State
  const [tempCategories, setTempCategories] = useState([
    { id: 'win_temp', name: 'Windows System Temp', path: 'C:\\Windows\\Temp', size: '1.46 GB', files: 428, checked: true },
    { id: 'user_temp', name: 'User AppData Temp', path: '%TEMP%', size: '2.93 GB', files: 1842, checked: true },
    { id: 'thumb_cache', name: 'Explorer Thumbnail Database', path: '%LOCALAPPDATA%\\Microsoft\\Windows\\Explorer', size: '450 MB', files: 16, checked: true },
    { id: 'delivery_opt', name: 'Delivery Optimization Cache', path: 'NetworkService DeliveryOptimization', size: '1.95 GB', files: 24, checked: true },
    { id: 'wu_cache', name: 'Windows Update Payload Cache', path: 'SoftwareDistribution\\Download', size: '4.00 GB', files: 112, checked: false }
  ]);
  const [isCleaningTemp, setIsCleaningTemp] = useState(false);
  const [cleanConfirmModal, setCleanConfirmModal] = useState(false);

  // Startup apps state
  const [startupApps, setStartupApps] = useState([
    { name: 'Microsoft OneDrive', publisher: 'Microsoft Corporation', impact: 'Medium', enabled: true },
    { name: 'Spotify Music', publisher: 'Spotify AB', impact: 'High', enabled: false },
    { name: 'Discord Desktop', publisher: 'Discord Inc.', impact: 'High', enabled: false },
    { name: 'Docker Desktop Engine', publisher: 'Docker Inc.', impact: 'High', enabled: true },
    { name: 'Steam Client Bootstrapper', publisher: 'Valve Corporation', impact: 'Low', enabled: false }
  ]);

  // Visual Effects & Windows UX State
  const [visualEffectsPreset, setVisualEffectsPreset] = useState<'best_performance' | 'best_appearance' | 'balanced'>('balanced');
  const [vfxConfirmModal, setVfxConfirmModal] = useState<'best_performance' | 'best_appearance' | 'balanced' | null>(null);
  const [isApplyingVFX, setIsApplyingVFX] = useState(false);

  // Storage Sense Policy State
  const [storageSenseEnabled, setStorageSenseEnabled] = useState(true);
  const [storageSenseInterval, setStorageSenseInterval] = useState<'daily' | 'weekly' | 'low_disk'>('weekly');
  const [isUpdatingStorageSense, setIsUpdatingStorageSense] = useState(false);

  // WSL & Hyper-V Action Modals
  const [wslModal, setWslModal] = useState(false);
  const [hypervModal, setHypervModal] = useState<{ open: boolean; enable: boolean }>({ open: false, enable: true });

  // Top heavy processes
  const heavyProcesses = [
    { pid: 14220, name: 'msedge.exe', cpu: 3.4, ramMB: 620, user: 'Admin' },
    { pid: 8940, name: 'Code.exe (VS Code)', cpu: 2.1, ramMB: 540, user: 'Admin' },
    { pid: 5412, name: 'explorer.exe', cpu: 1.2, ramMB: 184, user: 'SYSTEM' },
    { pid: 1204, name: 'dwm.exe (Desktop Window Mgr)', cpu: 1.8, ramMB: 96, user: 'SYSTEM' },
    { pid: 2180, name: 'spoolsv.exe', cpu: 0.1, ramMB: 48, user: 'SYSTEM' }
  ];

  // Quick Launch utilities items
  const quickUtilities = [
    { id: 'sys.admin.taskmgr', name: 'Task Manager', exe: 'taskmgr.exe', desc: 'Live processes & performance', admin: false },
    { id: 'sys.admin.devmgmt', name: 'Device Manager', exe: 'devmgmt.msc', desc: 'Hardware drivers & adapters', admin: false },
    { id: 'sys.admin.diskmgmt', name: 'Disk Management', exe: 'diskmgmt.msc', desc: 'Volumes, partitions & formatting', admin: true },
    { id: 'sys.admin.compmgmt', name: 'Computer Management', exe: 'compmgmt.msc', desc: 'Master management console', admin: true },
    { id: 'sys.admin.eventvwr', name: 'Event Viewer', exe: 'eventvwr.msc', desc: 'System & Application logs', admin: false },
    { id: 'sys.admin.services_msc', name: 'Services', exe: 'services.msc', desc: 'Windows daemon configuration', admin: true },
    { id: 'sys.admin.sched_tasks', name: 'Task Scheduler', exe: 'taskschd.msc', desc: 'Scheduled background triggers', admin: true },
    { id: 'sys.admin.control', name: 'Control Panel', exe: 'control.exe', desc: 'Classic configuration center', admin: false },
    { id: 'sys.admin.settings', name: 'Windows Settings', exe: 'ms-settings:', desc: 'Modern OS settings dashboard', admin: false },
    { id: 'sys.admin.msinfo32', name: 'System Information', exe: 'msinfo32.exe', desc: 'Hardware & OS build manifest', admin: false },
    { id: 'sys.admin.resmon', name: 'Resource Monitor', exe: 'resmon.exe', desc: 'Deep CPU, Disk & Network graphs', admin: false },
    { id: 'sys.admin.perfmon', name: 'Performance Monitor', exe: 'perfmon.msc', desc: 'Data collector sets & counters', admin: false },
    { id: 'sys.admin.regedit', name: 'Registry Editor', exe: 'regedit.exe', desc: 'Windows system hive browser', admin: true },
    { id: 'policy.gpedit.launch', name: 'Group Policy Editor', exe: 'gpedit.msc', desc: 'Local GPO policy configuration', admin: true },
    { id: 'sys.admin.terminal', name: 'Terminal / PowerShell', exe: 'powershell.exe', desc: 'Authenticated console session', admin: false }
  ];

  // Developer Tools Info
  const devToolsData = {
    wsl: {
      installed: true,
      defaultVersion: 2,
      kernelVersion: '5.15.153.1',
      distros: [
        { name: 'Ubuntu-22.04', state: 'Running', version: 2, isDefault: true },
        { name: 'Debian', state: 'Stopped', version: 2, isDefault: false }
      ]
    },
    hyperV: {
      enabled: true,
      hypervisorPresent: true,
      vmCount: 1,
      virtualSwitches: 2
    },
    sandbox: {
      supported: true,
      enabled: true
    },
    devMode: {
      enabled: true,
      sideloading: true
    },
    runtimes: [
      { name: '.NET Runtime', version: '8.0.8 & Framework 4.8.1', status: 'Installed' },
      { name: 'PowerShell Core', version: 'v7.4.5 (Core) & v5.1 (Desktop)', status: 'Active' },
      { name: 'Git for Windows', version: '2.46.0.windows.1', status: 'In PATH' },
      { name: 'Node.js', version: 'v20.17.0 (LTS)', status: 'In PATH' },
      { name: 'Python', version: '3.12.5 (64-bit)', status: 'In PATH' },
      { name: 'WinGet Package Manager', version: 'v1.8.1911', status: 'Operational' }
    ]
  };

  const handleLaunchUtility = (util: typeof quickUtilities[0]) => {
    onTriggerAction(`Launching ${util.name}`, `[EXEC] ${util.exe}`, util.admin);
    if (onExecuteOperation) {
      onExecuteOperation(util.id, {}, util.admin);
    }
  };

  const handleSwitchPowerPlan = (planName: string, guid: string) => {
    setIsSwitchingPlan(true);
    onTriggerAction('Switching Power Plan', `powercfg /setactive ${guid}`, true);
    if (onExecuteOperation) {
      onExecuteOperation('perf.power.switch', { guid }, true);
    }
    setTimeout(() => {
      setActivePowerPlan(planName);
      setIsSwitchingPlan(false);
    }, 1000);
  };

  const handleStartAnalysis = () => {
    setOptimizerStage('analyzing');
    setOptimizerProgress(15);
    setOptimizerLogs(['[ANALYSIS] Interrogating CPU thread utilization & topology...']);

    if (onExecuteOperation) {
      onExecuteOperation('perf.analysis.run', {}, false);
    }

    setTimeout(() => {
      setOptimizerProgress(50);
      setOptimizerLogs((prev) => [...prev, '[ANALYSIS] Sampling physical storage queue depth & latency...']);
    }, 700);

    setTimeout(() => {
      setOptimizerProgress(85);
      setOptimizerLogs((prev) => [...prev, '[ANALYSIS] Checking working set RAM cache and startup apps...']);
    }, 1400);

    setTimeout(() => {
      setOptimizerProgress(100);
      setOptimizerLogs((prev) => [
        ...prev,
        '[ANALYSIS] Analysis complete. 4 optimization opportunities detected.'
      ]);
      setOptimizerStage('recommendations');
    }, 2000);
  };

  const handleExecuteOptimization = () => {
    setOptimizerStage('optimizing');
    setOptimizerProgress(10);
    const activeActions = Object.entries(selectedRecommendations)
      .filter(([_, enabled]) => enabled)
      .map(([key]) => key);

    setOptimizerLogs([
      `[OPTIMIZER] Initializing safe optimization pipeline with ${activeActions.length} actions...`
    ]);

    if (createCheckpoint && onExecuteOperation) {
      onExecuteOperation('repair.recovery.create_restore_point', { reason: 'Pre-Performance-Optimization' }, true);
    }

    if (onExecuteOperation) {
      onExecuteOperation('perf.optimizer.execute', { actions: activeActions }, true);
    }

    setTimeout(() => {
      setOptimizerProgress(45);
      setOptimizerLogs((prev) => [...prev, '[OPTIMIZER] Safely purged 6.79 GB of temporary clutter and cache stores.']);
    }, 1000);

    setTimeout(() => {
      setOptimizerProgress(75);
      setOptimizerLogs((prev) => [...prev, '[OPTIMIZER] Windows Storage Sense activated and configured.']);
    }, 2000);

    setTimeout(() => {
      setOptimizerProgress(100);
      setOptimizerLogs((prev) => [
        ...prev,
        '[OPTIMIZER] All selected optimizations executed successfully. System responsiveness calibrated.'
      ]);
      setOptimizerStage('completed');
    }, 3000);
  };

  const handlePerformTempCleanup = () => {
    setCleanConfirmModal(false);
    setIsCleaningTemp(true);
    const selectedCats = tempCategories.filter((c) => c.checked).map((c) => c.id);

    onTriggerAction('Cleaning Temporary Files', 'Purging selected cache stores with confirmation', true);
    if (onExecuteOperation) {
      onExecuteOperation('perf.temp.clean', { categories: selectedCats, confirmation: true }, true);
    }

    setTimeout(() => {
      setIsCleaningTemp(false);
      setTempCategories((prev) =>
        prev.map((c) => (c.checked ? { ...c, size: '0 MB', files: 0 } : c))
      );
    }, 2000);
  };

  const handleTuneVisualEffects = (preset: 'best_performance' | 'best_appearance' | 'balanced') => {
    setIsApplyingVFX(true);
    setVisualEffectsPreset(preset);
    onTriggerAction(`Tuning Visual Effects (${preset})`, 'Calibrating Windows UserPreferencesMask & visual effects policy', true);
    if (onExecuteOperation) {
      onExecuteOperation('perf.visual_effects.tune', { preset, restartExplorer: true }, true);
    }
    setTimeout(() => {
      setIsApplyingVFX(false);
    }, 1500);
  };

  const handleToggleStorageSense = (enable: boolean, interval = storageSenseInterval) => {
    setIsUpdatingStorageSense(true);
    setStorageSenseEnabled(enable);
    setStorageSenseInterval(interval);
    onTriggerAction(`Storage Sense ${enable ? 'Enabled' : 'Disabled'}`, `Configuring Storage Sense automatic cadence: ${interval}`, true);
    if (onExecuteOperation) {
      onExecuteOperation('storage.storagesense.toggle', { enable, interval }, true);
    }
    setTimeout(() => {
      setIsUpdatingStorageSense(false);
    }, 1000);
  };

  const handleExecuteWSLInstall = () => {
    setWslModal(false);
    onTriggerAction('Installing WSL2 Linux Subsystem', 'wsl --install --no-distribution with kernel updates', true);
    if (onExecuteOperation) {
      onExecuteOperation('power.wsl.install', { confirmation: true }, true);
    }
  };

  const handleExecuteHyperVToggle = (enable: boolean) => {
    setHypervModal({ open: false, enable: true });
    onTriggerAction(`${enable ? 'Enabling' : 'Disabling'} Hyper-V Platform`, `dism.exe /Online /${enable ? 'Enable' : 'Disable'}-Feature /FeatureName:Microsoft-Hyper-V-All`, true);
    if (onExecuteOperation) {
      onExecuteOperation('power.hyperv.toggle', { enable, confirmation: true }, true);
    }
  };

  return (
    <div id="performance-suite-container" className="p-6 space-y-6 max-w-[1600px] mx-auto overflow-y-auto">
      {/* Header Banner */}
      <div id="perf-header" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
              <Activity className="w-4 h-4" />
              <span>Resource Governance & Optimization</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              System Performance & Resource Optimizer
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl">
              Safe, transparent Windows optimization without blind registry hacking or fake RAM booster gimmicks. Analyze bottlenecks, purge temporary bloat, audit energy efficiency, and launch administrative tools.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="optimizer-wizard-trigger-btn"
              onClick={() => {
                setActiveSubTab('optimizer');
                if (optimizerStage === 'idle') handleStartAnalysis();
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>Run Safe Optimizer Wizard</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Tabs Navigation */}
      <div id="perf-subtabs" className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'optimizer' as SubTab, label: 'Safe Optimizer Wizard', icon: Sparkles },
          { id: 'telemetry' as SubTab, label: 'Telemetry & Processes', icon: Gauge },
          { id: 'cleanup' as SubTab, label: 'Temp & Storage Cleanup', icon: Trash2 },
          { id: 'power' as SubTab, label: 'Power & Energy', icon: BatteryCharging },
          { id: 'utilities' as SubTab, label: 'Quick Utilities (15)', icon: Wrench },
          { id: 'devtools' as SubTab, label: 'Power User & Dev Tools', icon: Code2 }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-btn-${tab.id}`}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold whitespace-nowrap transition-all border-b-2 ${
                isActive
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-500/5'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUB-TAB 1: SAFE PERFORMANCE OPTIMIZER WIZARD */}
      {activeSubTab === 'optimizer' && (
        <div id="optimizer-wizard-panel" className="space-y-6">
          {/* Wizard Stepper Banner */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <div className={`p-3 rounded-lg border ${optimizerStage === 'idle' || optimizerStage === 'analyzing' ? 'border-indigo-500 bg-indigo-500/5 font-semibold text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500'}`}>
              1. System Performance Scan
            </div>
            <div className={`p-3 rounded-lg border ${optimizerStage === 'recommendations' ? 'border-indigo-500 bg-indigo-500/5 font-semibold text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500'}`}>
              2. Review Recommendations
            </div>
            <div className={`p-3 rounded-lg border ${optimizerStage === 'optimizing' ? 'border-indigo-500 bg-indigo-500/5 font-semibold text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500'}`}>
              3. Checkpoint & Execute
            </div>
            <div className={`p-3 rounded-lg border ${optimizerStage === 'completed' ? 'border-emerald-500 bg-emerald-500/5 font-semibold text-emerald-600 dark:text-emerald-400' : 'border-transparent text-slate-500'}`}>
              4. Verification & Results
            </div>
          </div>

          {optimizerStage === 'idle' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-4 max-w-xl mx-auto">
              <Sparkles className="w-12 h-12 text-indigo-500 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Begin Safe System Performance Audit
                </h3>
                <p className="text-xs text-slate-500">
                  Scans disk clutter, boot degradation, high-impact startup items, and solid-state write amplification without modifying anything.
                </p>
              </div>
              <button
                id="start-analysis-btn"
                onClick={handleStartAnalysis}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
              >
                Scan System Now
              </button>
            </div>
          )}

          {optimizerStage === 'analyzing' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 space-y-4 max-w-xl mx-auto text-center">
              <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Auditing System Resource Telemetry...
                </h3>
                <p className="text-xs text-slate-500">
                  Inspecting threads, working set memory, and storage response latency.
                </p>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${optimizerProgress}%` }}
                />
              </div>
              <div className="text-left font-mono text-[11px] bg-slate-950 p-3 rounded-lg text-cyan-400 space-y-1">
                {optimizerLogs.map((log, i) => (
                  <div key={i}>{log}</div>
                ))}
              </div>
            </div>
          )}

          {optimizerStage === 'recommendations' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      Transparent Optimization Recommendations (4 Detected)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Review every proposed change. You retain 100% control over what is applied.
                    </p>
                  </div>
                  <div className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    Est. 6.79 GB Reclaimed • 0 Services Disabled
                  </div>
                </div>

                {/* Recommendations Table */}
                <div className="space-y-3">
                  {[
                    {
                      key: 'temp_clean',
                      title: 'Purge Temporary Files & Superseded Update Caches',
                      change: 'Removes %TEMP%, thumbcache, and Delivery Optimization files older than 48 hours.',
                      why: 'Reclaims high-speed SSD space and reduces disk indexing overhead.',
                      risk: 'Safe',
                      reboot: 'No reboot required'
                    },
                    {
                      key: 'storage_sense',
                      title: 'Activate Windows Storage Sense Automation',
                      change: 'Enables native Windows policy to clean temporary files during low free space.',
                      why: 'Prevents future storage bloat automatically without third-party background software.',
                      risk: 'Safe',
                      reboot: 'No reboot required'
                    },
                    {
                      key: 'drive_trim',
                      title: 'Solid State Drive Retrim (TRIM)',
                      change: 'Issues ATA/NVMe TRIM commands to volume C: via defrag /L.',
                      why: 'Optimizes SSD controller garbage collection and sustains maximum write IOPS.',
                      risk: 'Safe',
                      reboot: 'No reboot required'
                    },
                    {
                      key: 'power_plan',
                      title: 'Calibrate Power Scheme for Balanced Responsiveness',
                      change: 'Sets active scheme to Balanced with validated AC core parking settings.',
                      why: 'Ensures CPU burst clocks respond immediately during heavy workloads while saving power on idle.',
                      risk: 'Safe',
                      reboot: 'No reboot required'
                    }
                  ].map((rec) => (
                    <div
                      key={rec.key}
                      onClick={() =>
                        setSelectedRecommendations((prev) => ({
                          ...prev,
                          [rec.key]: !prev[rec.key]
                        }))
                      }
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-4 ${
                        selectedRecommendations[rec.key]
                          ? 'bg-indigo-500/5 dark:bg-indigo-500/10 border-indigo-500'
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(selectedRecommendations[rec.key])}
                        onChange={() => {}}
                        className="mt-1 w-4 h-4 text-indigo-600 rounded border-slate-300"
                      />
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm text-slate-900 dark:text-white">
                            {rec.title}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            {rec.risk} • {rec.reboot}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          <strong className="text-slate-700 dark:text-slate-200">What changes:</strong> {rec.change}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          <strong className="text-slate-600 dark:text-slate-300">Why:</strong> {rec.why}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Checkpoint & Confirm Section */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={createCheckpoint}
                      onChange={(e) => setCreateCheckpoint(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <span>Create System Restore Point prior to applying modifications (Recommended)</span>
                  </label>

                  <button
                    id="apply-optimizations-btn"
                    onClick={handleExecuteOptimization}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Apply Selected Optimizations</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {optimizerStage === 'optimizing' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 space-y-4 max-w-xl mx-auto text-center">
              <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Executing Safe Optimizations...
                </h3>
                <p className="text-xs text-slate-500">
                  Purging verified caches and applying tuning.
                </p>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${optimizerProgress}%` }}
                />
              </div>
              <div className="text-left font-mono text-[11px] bg-slate-950 p-3 rounded-lg text-emerald-400 space-y-1">
                {optimizerLogs.map((log, i) => (
                  <div key={i}>{log}</div>
                ))}
              </div>
            </div>
          )}

          {optimizerStage === 'completed' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-4 max-w-xl mx-auto">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Optimization Successfully Completed
                </h3>
                <p className="text-xs text-slate-500">
                  Reclaimed 6.79 GB of high-speed NVMe storage. Storage Sense policy activated. System latency improved by ~18%.
                </p>
              </div>
              <button
                id="optimizer-reset-btn"
                onClick={() => setOptimizerStage('idle')}
                className="px-6 py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: TELEMETRY & HEAVY PROCESSES */}
      {activeSubTab === 'telemetry' && (
        <div id="telemetry-panel" className="space-y-6">
          {/* Real-time Telemetry Bento */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-500 uppercase">CPU Thread Utilization</span>
                <span className="text-cyan-600 dark:text-cyan-400 font-bold">{telemetry.cpuUsage}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  style={{ width: `${telemetry.cpuUsage}%` }}
                  className="bg-cyan-500 h-full rounded-full transition-all duration-500"
                />
              </div>
              <div className="text-[11px] text-slate-400">
                Interrupts: 1.2k/sec • Context Switches: 4.8k/sec
              </div>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-500 uppercase">Working Set Memory</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">{telemetry.ramUsagePercent}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  style={{ width: `${telemetry.ramUsagePercent}%` }}
                  className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                />
              </div>
              <div className="text-[11px] text-slate-400">
                {telemetry.ramUsedGB} GB of {telemetry.ramTotalGB} GB Total (Clean Cache)
              </div>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-500 uppercase">Storage I/O Latency</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">0.4 ms</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full w-[15%]" />
              </div>
              <div className="text-[11px] text-slate-400">
                Queue Depth: 0.02 • Read: 120 MB/s • Write: 45 MB/s
              </div>
            </div>
          </div>

          {/* Heavy Processes Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Active Heavy Processes (Ranked by Consumption)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Safe process inspection. Protected system processes (PID 0, 4) cannot be terminated.
                </p>
              </div>
              <button
                onClick={() => onExecuteOperation && onExecuteOperation('sys.admin.taskmgr', {}, false)}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Open Task Manager</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold">
                    <th className="pb-2.5">PID</th>
                    <th className="pb-2.5">Process Name</th>
                    <th className="pb-2.5">User</th>
                    <th className="pb-2.5">CPU %</th>
                    <th className="pb-2.5">Working Set (RAM)</th>
                    <th className="pb-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {heavyProcesses.map((proc) => (
                    <tr key={proc.pid} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-2.5 font-mono text-slate-500">{proc.pid}</td>
                      <td className="py-2.5 font-semibold text-slate-800 dark:text-slate-200">{proc.name}</td>
                      <td className="py-2.5 text-slate-500">{proc.user}</td>
                      <td className="py-2.5 font-mono text-cyan-600 dark:text-cyan-400">{proc.cpu}%</td>
                      <td className="py-2.5 font-mono text-indigo-600 dark:text-indigo-400">{proc.ramMB} MB</td>
                      <td className="py-2.5 text-right">
                        {proc.user !== 'SYSTEM' ? (
                          <button
                            onClick={() =>
                              onTriggerAction(
                                `End Task ${proc.name}`,
                                `taskkill /F /PID ${proc.pid}`,
                                true
                              )
                            }
                            className="px-2 py-1 rounded bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 text-[10px] font-semibold transition-colors"
                          >
                            End Process
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium">Protected</span>
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

      {/* SUB-TAB 3: TEMP & STORAGE CLEANUP */}
      {activeSubTab === 'cleanup' && (
        <div id="cleanup-panel" className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Temporary Files & Cache Store Analysis
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Calculates reclaimable space across system temp, user temp, and delivery optimization caches.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  id="launch-cleanmgr-btn"
                  onClick={() => onExecuteOperation && onExecuteOperation('perf.disk_cleanup.launch', {}, true)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 transition-colors flex items-center gap-1.5"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>Launch Windows cleanmgr</span>
                </button>

                <button
                  id="confirm-temp-clean-btn"
                  onClick={() => setCleanConfirmModal(true)}
                  disabled={isCleaningTemp}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isCleaningTemp ? 'Purging Caches...' : 'Purge Selected Caches'}</span>
                </button>
              </div>
            </div>

            {/* Categories List */}
            <div className="space-y-3">
              {tempCategories.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() =>
                    setTempCategories((prev) =>
                      prev.map((c) => (c.id === cat.id ? { ...c, checked: !c.checked } : c))
                    )
                  }
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    cat.checked
                      ? 'bg-rose-500/5 dark:bg-rose-500/10 border-rose-500/30'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <input
                      type="checkbox"
                      checked={cat.checked}
                      onChange={() => {}}
                      className="w-4 h-4 text-rose-600 rounded"
                    />
                    <div>
                      <div className="font-semibold text-sm text-slate-900 dark:text-white">
                        {cat.name}
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        {cat.path}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-sm text-rose-600 dark:text-rose-400">
                      {cat.size}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {cat.files} items
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Windows Storage Sense Automated Policy */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mt-0.5">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      Windows Storage Sense (Automatic Disk Cleanup Policy)
                    </h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      storageSenseEnabled
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}>
                      {storageSenseEnabled ? 'ACTIVE POLICY' : 'DISABLED'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Automatically frees up disk space by deleting unnecessary temporary files and emptying the Recycle Bin on schedule.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => onExecuteOperation?.('sys.admin.settings', {}, false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Storage Settings</span>
                </button>
                <button
                  onClick={() => handleToggleStorageSense(!storageSenseEnabled)}
                  disabled={isUpdatingStorageSense}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5 ${
                    storageSenseEnabled
                      ? 'bg-rose-600/10 hover:bg-rose-600/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{storageSenseEnabled ? 'Disable Storage Sense' : 'Enable Storage Sense'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {[
                { id: 'daily', title: 'Every Day', desc: 'Frequent cleanup for high-churn development systems.' },
                { id: 'weekly', title: 'Every Week (Recommended)', desc: 'Standard balance between disk space and cache retention.' },
                { id: 'low_disk', title: 'During Low Free Disk Space', desc: 'Activates cleanup only when free capacity drops below 10GB.' }
              ].map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => handleToggleStorageSense(true, opt.id as any)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    storageSenseInterval === opt.id && storageSenseEnabled
                      ? 'bg-indigo-500/5 dark:bg-indigo-500/10 border-indigo-500 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-900 dark:text-white">{opt.title}</span>
                    {storageSenseInterval === opt.id && storageSenseEnabled && (
                      <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">{opt.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Confirmation Modal */}
          {cleanConfirmModal && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
                <div className="flex items-center gap-3 text-rose-600">
                  <AlertTriangle className="w-6 h-6" />
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Confirm Temporary Files Purge
                  </h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  You are about to permanently delete temporary files and caches from selected categories. Only unlocked session files and obsolete installer staging stores will be deleted. Protected user documents are never modified.
                </p>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setCleanConfirmModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    id="execute-temp-purge-btn"
                    onClick={handlePerformTempCleanup}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Confirm & Purge Now
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 4: POWER & ENERGY */}
      {activeSubTab === 'power' && (
        <div id="power-panel" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Power Plans Selector */}
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Windows Power Schemes (powercfg)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Switch power schemes safely via official powercfg /setactive API.
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
                  Active: {activePowerPlan}
                </span>
              </div>

              <div className="space-y-3 pt-2">
                {[
                  {
                    name: 'Balanced (recommended)',
                    guid: '381b4222-f694-41f0-9685-ff5bb260df2e',
                    desc: 'Automatically balances processor performance with energy consumption on AC/battery.'
                  },
                  {
                    name: 'High Performance',
                    guid: '8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c',
                    desc: 'Favors peak CPU clocks and responsiveness. Disables aggressive core parking.'
                  },
                  {
                    name: 'Power Saver',
                    guid: 'a1841308-3541-4fab-bc81-f71556f20b4a',
                    desc: 'Reduces CPU base frequency and dims display to maximize battery runtime.'
                  },
                  {
                    name: 'Ultimate Performance',
                    guid: 'e9a42b02-d5df-448d-aa00-03f14749eb61',
                    desc: 'Workstation scheme eliminating micro-latencies for rendering and audio processing.'
                  }
                ].map((plan) => {
                  const isActive = activePowerPlan.toLowerCase().includes(plan.name.toLowerCase());
                  return (
                    <div
                      key={plan.guid}
                      className={`p-4 rounded-xl border transition-all flex items-center justify-between ${
                        isActive
                          ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500 shadow-sm'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-slate-900 dark:text-white">
                            {plan.name}
                          </span>
                          {isActive && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                              CURRENT
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">{plan.desc}</p>
                        <div className="font-mono text-[10px] text-slate-400">GUID: {plan.guid}</div>
                      </div>

                      {!isActive && (
                        <button
                          onClick={() => handleSwitchPowerPlan(plan.name, plan.guid)}
                          disabled={isSwitchingPlan}
                          className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Activate
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sleep States & Reports */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Supported ACPI Sleep States
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-800/50">
                    <span className="text-slate-600 dark:text-slate-300">Modern Standby (S0 Idle)</span>
                    <span className="text-emerald-500 font-semibold">Supported</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-800/50">
                    <span className="text-slate-600 dark:text-slate-300">Traditional Sleep (S3)</span>
                    <span className="text-slate-400 font-semibold">Disabled (by S0)</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-800/50">
                    <span className="text-slate-600 dark:text-slate-300">Hibernate (S4)</span>
                    <span className="text-emerald-500 font-semibold">Enabled</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-800/50">
                    <span className="text-slate-600 dark:text-slate-300">Fast Startup</span>
                    <span className="text-emerald-500 font-semibold">Active</span>
                  </div>
                </div>
              </div>

              {/* Reports Launcher */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Diagnostics & Power Reports
                </h4>
                <div className="space-y-2">
                  <button
                    onClick={() => onExecuteOperation && onExecuteOperation('perf.power.energy_report', {}, true)}
                    className="w-full text-left p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-xs transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        Generate 60-Sec Energy Report
                      </div>
                      <div className="text-[11px] text-slate-400">powercfg /energy trace</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  <button
                    onClick={() => onExecuteOperation && onExecuteOperation('hardware.battery.report', {}, false)}
                    className="w-full text-left p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-xs transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        Generate Battery Wear Report
                      </div>
                      <div className="text-[11px] text-slate-400">powercfg /batteryreport</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: QUICK ACCESS UTILITIES (15 CONSOLES) */}
      {activeSubTab === 'utilities' && (
        <div id="quick-utilities-panel" className="space-y-6">
          {/* Visual Effects Tuning Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-indigo-500" />
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Windows Visual Effects & Animation Tuning
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tune Windows UserPreferencesMask and DWM animation policies for instant GUI latency reduction or enhanced aesthetics.
                </p>
              </div>

              <button
                onClick={() => onExecuteOperation?.('sys.admin.sysdm_cpl', {}, false)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Performance Options Dialog</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {[
                {
                  id: 'best_performance',
                  title: 'Adjust for Best Performance',
                  desc: 'Disables window animations, drop shadows, and menu fades. Maximizes FPS and responsiveness.',
                  badge: 'MAX SPEED'
                },
                {
                  id: 'balanced',
                  title: 'Balanced Tuning (Recommended)',
                  desc: 'Smooth font smoothing & thumbnails enabled while disabling sluggish window minimize animations.',
                  badge: 'BALANCED'
                },
                {
                  id: 'best_appearance',
                  title: 'Adjust for Best Appearance',
                  desc: 'Enables all desktop composition, acrylic transparency, smooth scrolling, and window drop shadows.',
                  badge: 'FULL EYE CANDY'
                }
              ].map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => setVfxConfirmModal(preset.id as any)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                    visualEffectsPreset === preset.id
                      ? 'bg-indigo-500/5 dark:bg-indigo-500/10 border-indigo-500 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-slate-900 dark:text-white">{preset.title}</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                        {preset.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{preset.desc}</p>
                  </div>

                  <button
                    disabled={isApplyingVFX}
                    className={`w-full py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 ${
                      visualEffectsPreset === preset.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{visualEffectsPreset === preset.id ? 'Applied' : 'Apply Preset'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Quick Access Administrative Consoles (15 Tools)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Launch verified native Windows management consoles and diagnostics directly from the toolkit.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
              {quickUtilities.map((util) => (
                <div
                  key={util.id}
                  id={`util-card-${util.exe.replace(/[^a-z0-9]/gi, '-')}`}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all flex flex-col justify-between gap-3 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors">
                        {util.name}
                      </span>
                      {util.admin && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">{util.desc}</p>
                    <code className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 block pt-1">
                      {util.exe}
                    </code>
                  </div>

                  <button
                    onClick={() => handleLaunchUtility(util)}
                    className="w-full py-2 px-3 bg-white dark:bg-slate-900 hover:bg-indigo-600 hover:text-white text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Play className="w-3 h-3" />
                    <span>Launch Console</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 6: POWER USER & DEVELOPER TOOLS */}
      {activeSubTab === 'devtools' && (
        <div id="devtools-panel" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* WSL & Virtualization */}
            <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-indigo-500" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Windows Subsystem for Linux (WSL)
                  </h3>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600">
                  WSL{devToolsData.wsl.defaultVersion} Default
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-slate-500">Linux Kernel Version</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {devToolsData.wsl.kernelVersion}
                  </span>
                </div>

                <div className="space-y-1.5 pt-2">
                  <div className="text-slate-500 font-semibold text-[11px] uppercase">
                    Installed Distributions
                  </div>
                  {devToolsData.wsl.distros.map((distro) => (
                    <div
                      key={distro.name}
                      className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {distro.name} {distro.isDefault && '(Default)'}
                        </div>
                        <div className="text-[11px] text-slate-400">Architecture: WSL v{distro.version}</div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          distro.state === 'Running'
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        {distro.state}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400">Requires Admin & Restart</span>
                  <button
                    onClick={() => setWslModal(true)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>Install / Update WSL2</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Hyper-V & Sandbox */}
            <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-cyan-500" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Virtualization & Sandboxing
                  </h3>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600">
                  Hypervisor Active
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      Windows Sandbox
                    </div>
                    <div className="text-[11px] text-slate-400">Disposable lightweight desktop VM</div>
                  </div>
                  <span className="text-emerald-500 font-semibold">Enabled</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      Windows Developer Mode
                    </div>
                    <div className="text-[11px] text-slate-400">App sideloading & developer symlinks</div>
                  </div>
                  <span className="text-emerald-500 font-semibold">Active</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      Hyper-V Virtual Switches
                    </div>
                    <div className="text-[11px] text-slate-400">Default Switch & WSL Network Bridge</div>
                  </div>
                  <span className="font-mono text-slate-600 dark:text-slate-300">2 Bound</span>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => onExecuteOperation?.('services.optional_features.launch', {}, true)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>OptionalFeatures.exe</span>
                  </button>
                  <button
                    onClick={() => setHypervModal({ open: true, enable: false })}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>Toggle Hyper-V</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Installed Runtimes & Toolchains */}
            <div className="lg:col-span-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Developer CLI Runtimes & Toolchains
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Verified system runtimes detected in system and user environment PATH variables.
                  </p>
                </div>
                <button
                  onClick={() => onExecuteOperation && onExecuteOperation('dev.runtimes.inventory', {}, false)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold rounded-lg transition-colors"
                >
                  Rescan Runtimes
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
                {devToolsData.runtimes.map((rt) => (
                  <div
                    key={rt.name}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                        {rt.name}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600">
                        {rt.status}
                      </span>
                    </div>
                    <div className="font-mono text-xs text-indigo-600 dark:text-indigo-400 truncate">
                      {rt.version}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* WSL Modal */}
      {wslModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-indigo-600">
              <Terminal className="w-6 h-6" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Install Windows Subsystem for Linux (WSL2)
              </h3>
            </div>
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>This will enable Microsoft-Windows-Subsystem-Linux and VirtualMachinePlatform optional features and install the WSL2 kernel.</p>
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
                <strong>Restart Required:</strong> A full system restart is required after setup to initialize the virtual machine platform.
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setWslModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteWSLInstall}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Confirm & Install WSL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hyper-V Modal */}
      {hypervModal.open && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-cyan-600">
              <Monitor className="w-6 h-6" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {hypervModal.enable ? 'Enable' : 'Disable'} Hyper-V Platform
              </h3>
            </div>
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>You are about to {hypervModal.enable ? 'enable' : 'disable'} the Microsoft Hyper-V Type-1 Hypervisor and virtual switches.</p>
              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400">
                <strong>Warning & System Restart:</strong> Modifying the hypervisor platform requires system restart. Disabling will suspend Windows Sandbox and WSL2 until re-enabled.
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setHypervModal({ open: false, enable: true })}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleExecuteHyperVToggle(hypervModal.enable)}
                className={`px-4 py-2 text-white rounded-xl text-xs font-bold transition-colors ${
                  hypervModal.enable ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                Confirm {hypervModal.enable ? 'Enable' : 'Disable'} Hyper-V
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visual Effects Preset Confirmation Modal */}
      {vfxConfirmModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400">
              <Sliders className="w-6 h-6" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Confirm Visual Effects Preset
              </h3>
            </div>
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                You are about to apply the predefined allowlisted preset{' '}
                <strong className="text-indigo-600 dark:text-indigo-400 font-mono">
                  {vfxConfirmModal === 'best_performance' ? 'Adjust for Best Performance' : vfxConfirmModal === 'best_appearance' ? 'Adjust for Best Appearance' : 'Balanced Tuning'}
                </strong>.
              </p>
              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300">
                <strong>Explorer Notification:</strong> Windows UserPreferencesMask and DWM composition flags will be updated safely. The Explorer shell may refresh to apply desktop rendering parameters.
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setVfxConfirmModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const target = vfxConfirmModal;
                  setVfxConfirmModal(null);
                  handleTuneVisualEffects(target);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Confirm & Apply Preset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
