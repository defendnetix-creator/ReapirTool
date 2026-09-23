/**
 * Software Deployment, 100 Apps & Portable Tools Parity
 * Akshigo PC Toolkit Pro v8.0.0-rc.1
 * Phase 8.6
 */

import React, { useState, useEffect } from 'react';
import {
  PackageCheck,
  Layers,
  Wrench,
  Activity,
  Clock,
  ArrowUpCircle,
  Download,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  X,
  Play
} from 'lucide-react';
import { operationsClient } from '../api/operationsClient';
import { AppCatalogTab } from './software/AppCatalogTab';
import { BundlesTab } from './software/BundlesTab';
import { InventoryUpdatesTab } from './software/InventoryUpdatesTab';
import { PortableToolsTab } from './software/PortableToolsTab';
import { DeploymentHelpersTab } from './software/DeploymentHelpersTab';
import { InstallHistoryTab } from './software/InstallHistoryTab';

interface SoftwareViewProps {
  onTriggerAction: (actionName: string, command: string, requiresAdmin?: boolean) => void;
}

type TabType = 'CATALOG' | 'BUNDLES' | 'INVENTORY' | 'PORTABLE' | 'DEPLOYMENT' | 'HISTORY';

export const SoftwareView: React.FC<SoftwareViewProps> = ({ onTriggerAction }) => {
  const [activeTab, setActiveTab] = useState<TabType>('CATALOG');
  const [loading, setLoading] = useState<boolean>(false);

  // Data states
  const [catalog, setCatalog] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [updates, setUpdates] = useState<any[]>([]);
  const [bundles, setBundles] = useState<{ predefined: any[]; custom: any[] }>({
    predefined: [],
    custom: []
  });
  const [portableTools, setPortableTools] = useState<any[]>([]);
  const [deploymentHelpers, setDeploymentHelpers] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  // Selection states
  const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);

  // Batch Job Tracking Modal
  const [batchModal, setBatchModal] = useState<{
    open: boolean;
    title: string;
    appIds: string[];
    currentStep: string;
    progress: number;
    completed: boolean;
    logs: string[];
  }>({
    open: false,
    title: '',
    appIds: [],
    currentStep: '',
    progress: 0,
    completed: false,
    logs: []
  });

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [
        catalogRes,
        inventoryRes,
        updatesRes,
        bundlesRes,
        portableRes,
        helpersRes,
        historyRes
      ] = await Promise.all([
        operationsClient.getSoftwareCatalog(),
        operationsClient.getSoftwareInventory(),
        operationsClient.getSoftwareUpdates(),
        operationsClient.getSoftwareBundles(),
        operationsClient.getPortableTools(),
        operationsClient.getDeploymentHelpers(),
        operationsClient.getSoftwareHistory()
      ]);

      setCatalog(catalogRes.catalog || []);
      setInventory(inventoryRes.inventory || []);
      setUpdates(updatesRes.updates || []);
      setBundles(bundlesRes || { predefined: [], custom: [] });
      setPortableTools(portableRes.tools || []);
      setDeploymentHelpers(helpersRes.helpers || []);
      setHistory(historyRes.history || []);
    } catch (err: any) {
      console.error('Failed to load software operations data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Handlers for App Selection
  const handleToggleSelect = (appId: string) => {
    if (selectedAppIds.includes(appId)) {
      setSelectedAppIds(selectedAppIds.filter((id) => id !== appId));
    } else {
      setSelectedAppIds([...selectedAppIds, appId]);
    }
  };

  const handleSelectAll = (appIds: string[]) => {
    const combined = Array.from(new Set([...selectedAppIds, ...appIds]));
    setSelectedAppIds(combined);
  };

  const handleClearSelection = () => {
    setSelectedAppIds([]);
  };

  // Execution Handlers
  const handleInstallApp = async (app: any) => {
    onTriggerAction(
      `Install ${app.name}`,
      `winget install --id "${app.id}" -e --silent --accept-package-agreements`,
      app.requiresAdmin
    );
    // Submit real async job to operations engine
    try {
      await operationsClient.submitJob('software.install', { appId: app.id });
      await loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpgradeApp = async (app: any) => {
    onTriggerAction(`Upgrade ${app.name}`, `winget upgrade --id "${app.id}" --silent`, true);
    try {
      await operationsClient.submitJob('software.upgrade', { appId: app.id });
      await loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpgradeAll = async () => {
    onTriggerAction(
      'Upgrade All Software',
      'winget upgrade --all --include-unknown --silent',
      true
    );
    try {
      await operationsClient.submitJob('software.upgrade.all', {});
      await loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUninstallApp = async (app: any) => {
    if (!window.confirm(`Are you sure you want to uninstall "${app.name}"?`)) {
      return;
    }
    onTriggerAction(
      `Uninstall ${app.name}`,
      `winget uninstall --id "${app.id}" --silent`,
      true
    );
    try {
      await operationsClient.submitJob('software.uninstall', {
        appId: app.id,
        confirmation: true
      });
      await loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // 1-Click Multi-App Batch Installer
  const handleBatchInstall = async (appIds: string[], bundleName?: string) => {
    if (appIds.length === 0) return;
    const title = bundleName || `${appIds.length} Selected Applications`;

    setBatchModal({
      open: true,
      title,
      appIds,
      currentStep: 'Submitting batch installer job...',
      progress: 5,
      completed: false,
      logs: [`[INIT] Batch installation initiated for ${appIds.length} packages.`]
    });

    try {
      const job = await operationsClient.submitJob('software.bundle.install', {
        appIds,
        bundleName: title
      });

      // Poll progress until complete
      const checkInterval = setInterval(async () => {
        try {
          const status = await operationsClient.getJobStatus(job.jobId);
          setBatchModal((prev) => ({
            ...prev,
            currentStep: status.currentStep || 'Installing packages...',
            progress: status.progressPercent || 20,
            completed: status.status === 'SUCCESS' || status.status === 'FAILED',
            logs: status.logs || prev.logs
          }));

          if (status.status === 'SUCCESS' || status.status === 'FAILED') {
            clearInterval(checkInterval);
            setSelectedAppIds([]);
            await loadAllData();
          }
        } catch (pollErr) {
          clearInterval(checkInterval);
        }
      }, 750);
    } catch (err: any) {
      setBatchModal((prev) => ({
        ...prev,
        currentStep: `Error: ${err.message}`,
        completed: true,
        logs: [...prev.logs, `[ERR] ${err.message}`]
      }));
    }
  };

  // Save Custom Bundle
  const handleSaveCustomBundle = async (
    name: string,
    description: string,
    appIds: string[]
  ) => {
    await operationsClient.saveCustomBundle(name, description, appIds);
    await loadAllData();
  };

  // Launch Portable Tool
  const handleLaunchTool = async (tool: any) => {
    onTriggerAction(
      `Launch ${tool.name}`,
      `Start-Process -FilePath "${tool.executableName}"`,
      tool.requiresAdmin
    );
    try {
      await operationsClient.submitJob('portable.launch', { toolId: tool.id });
    } catch (err: any) {
      alert(`Launch error: ${err.message}`);
    }
  };

  // Store Reset
  const handleTriggerStoreReset = async () => {
    onTriggerAction('Reset Microsoft Store (wsreset)', 'wsreset.exe', true);
    try {
      await operationsClient.submitJob('deployment.store.repair', {});
    } catch (err) {
      console.error(err);
    }
  };

  // WinGet Health
  const handleTriggerWingetHealth = async () => {
    onTriggerAction('WinGet Source Diagnostics', 'winget source list && winget --info', false);
    try {
      await operationsClient.submitJob('deployment.winget.health', {});
    } catch (err) {
      console.error(err);
    }
  };

  // Install Runtime
  const handleInstallRuntime = async (helper: any) => {
    onTriggerAction(
      `Install ${helper.name}`,
      `Start-Process -FilePath "${helper.officialUrl}" -ArgumentList "/quiet /norestart"`,
      true
    );
    try {
      await operationsClient.submitJob('deployment.runtime.install', { helperId: helper.id });
      await loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <PackageCheck className="w-5 h-5 text-cyan-400" />
              Software Deployment & 100 Apps Parity
            </h1>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-500/30">
              WINGET v1.8 READY
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Curated 100+ verified software catalog, 1-click batch profiles, audited portable diagnostics, and deployment runtimes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadAllData}
            disabled={loading}
            className="p-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] text-slate-400 hover:text-slate-200 border border-white/[0.08] transition-all"
            title="Refresh all software data"
          >
            <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleUpgradeAll}
            disabled={updates.length === 0}
            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:hover:bg-emerald-500 text-slate-950 font-mono text-xs font-bold transition-all flex items-center gap-2 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
          >
            <ArrowUpCircle className="w-3.5 h-3.5" />
            <span>Update All Available ({updates.length})</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-white/[0.08] pb-1 overflow-x-auto no-scrollbar font-mono text-xs">
        <button
          onClick={() => setActiveTab('CATALOG')}
          className={`px-3.5 py-2 rounded-t-lg transition-all flex items-center gap-2 ${
            activeTab === 'CATALOG'
              ? 'bg-[#0e121c] text-cyan-300 font-bold border-t border-x border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
          }`}
        >
          <PackageCheck className="w-3.5 h-3.5" />
          <span>App Catalog (100 Apps)</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/20">
            {catalog.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('BUNDLES')}
          className={`px-3.5 py-2 rounded-t-lg transition-all flex items-center gap-2 ${
            activeTab === 'BUNDLES'
              ? 'bg-[#0e121c] text-cyan-300 font-bold border-t border-x border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>1-Click Bundles</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/[0.05] text-slate-400">
            {(bundles.predefined?.length || 0) + (bundles.custom?.length || 0)}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('INVENTORY')}
          className={`px-3.5 py-2 rounded-t-lg transition-all flex items-center gap-2 ${
            activeTab === 'INVENTORY'
              ? 'bg-[#0e121c] text-cyan-300 font-bold border-t border-x border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Installed & Updates</span>
          {updates.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950/60 text-amber-300 border border-amber-500/30 font-bold">
              {updates.length} Updates
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('PORTABLE')}
          className={`px-3.5 py-2 rounded-t-lg transition-all flex items-center gap-2 ${
            activeTab === 'PORTABLE'
              ? 'bg-[#0e121c] text-cyan-300 font-bold border-t border-x border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>Portable Tools</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/[0.05] text-slate-400">
            {portableTools.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('DEPLOYMENT')}
          className={`px-3.5 py-2 rounded-t-lg transition-all flex items-center gap-2 ${
            activeTab === 'DEPLOYMENT'
              ? 'bg-[#0e121c] text-cyan-300 font-bold border-t border-x border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Deployment & Runtimes</span>
        </button>

        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`px-3.5 py-2 rounded-t-lg transition-all flex items-center gap-2 ${
            activeTab === 'HISTORY'
              ? 'bg-[#0e121c] text-cyan-300 font-bold border-t border-x border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Install History</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'CATALOG' && (
        <AppCatalogTab
          catalog={catalog}
          selectedAppIds={selectedAppIds}
          onToggleSelect={handleToggleSelect}
          onSelectAll={handleSelectAll}
          onClearSelection={handleClearSelection}
          onInstallApp={handleInstallApp}
          onUpgradeApp={handleUpgradeApp}
          onUninstallApp={handleUninstallApp}
          onBatchInstall={(appIds) => handleBatchInstall(appIds)}
          loading={loading}
          onRefresh={loadAllData}
        />
      )}

      {activeTab === 'BUNDLES' && (
        <BundlesTab
          bundles={bundles}
          catalog={catalog}
          onDeployBundle={(name, appIds) => handleBatchInstall(appIds, name)}
          onSaveCustomBundle={handleSaveCustomBundle}
          loading={loading}
        />
      )}

      {activeTab === 'INVENTORY' && (
        <InventoryUpdatesTab
          inventory={inventory}
          updates={updates}
          onUpgradeApp={handleUpgradeApp}
          onUpgradeAll={handleUpgradeAll}
          onUninstallApp={handleUninstallApp}
          onRefresh={loadAllData}
          loading={loading}
        />
      )}

      {activeTab === 'PORTABLE' && (
        <PortableToolsTab
          tools={portableTools}
          onLaunchTool={handleLaunchTool}
          loading={loading}
          onRefresh={loadAllData}
        />
      )}

      {activeTab === 'DEPLOYMENT' && (
        <DeploymentHelpersTab
          helpers={deploymentHelpers}
          onTriggerStoreReset={handleTriggerStoreReset}
          onTriggerWingetHealth={handleTriggerWingetHealth}
          onInstallRuntime={handleInstallRuntime}
          loading={loading}
        />
      )}

      {activeTab === 'HISTORY' && (
        <InstallHistoryTab history={history} onRefresh={loadAllData} loading={loading} />
      )}

      {/* Real-Time Batch Progress Modal */}
      {batchModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0b0e17] border border-cyan-500/30 rounded-2xl max-w-xl w-full flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-white/[0.08] flex items-center justify-between bg-[#0e121c]">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Download className="w-4 h-4 text-cyan-400 animate-bounce" />
                  {batchModal.title}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Deploying {batchModal.appIds.length} applications via silent WinGet package manager.
                </p>
              </div>
              {batchModal.completed && (
                <button
                  onClick={() => setBatchModal((prev) => ({ ...prev, open: false }))}
                  className="text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="p-5 space-y-4 font-mono text-xs">
              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-cyan-300 font-bold">{batchModal.currentStep}</span>
                  <span className="text-slate-400">{batchModal.progress}%</span>
                </div>
                <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-white/[0.06]">
                  <div
                    className="h-full bg-cyan-500 transition-all duration-300"
                    style={{ width: `${batchModal.progress}%` }}
                  />
                </div>
              </div>

              {/* Log stream console */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                  Live Operations Log:
                </span>
                <div className="bg-[#06080e] p-3 rounded-lg border border-white/[0.05] h-44 overflow-y-auto space-y-1 text-[11px] text-slate-300">
                  {batchModal.logs.map((log, idx) => (
                    <div key={idx} className="font-mono leading-relaxed">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-white/[0.08] flex items-center justify-end bg-[#080b12]">
              <button
                disabled={!batchModal.completed}
                onClick={() => setBatchModal((prev) => ({ ...prev, open: false }))}
                className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-mono text-xs font-bold transition-all"
              >
                {batchModal.completed ? 'Close' : 'Installing in background...'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
