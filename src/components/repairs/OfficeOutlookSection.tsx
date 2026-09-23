import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Mail,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  HardDrive,
  Cloud,
  MessageSquare,
  Video,
  Wrench,
  Zap,
  Info
} from 'lucide-react';
import { operationsClient } from '../../api/operationsClient';

interface OfficeOutlookSectionProps {
  onExecuteOperation?: (
    operationId: string,
    params?: Record<string, any>,
    requiresAdmin?: boolean
  ) => void;
}

export const OfficeOutlookSection: React.FC<OfficeOutlookSectionProps> = ({
  onExecuteOperation
}) => {
  const [officeStatus, setOfficeStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchOfficeData = async () => {
    setIsLoading(true);
    try {
      const data = await operationsClient.getOfficeStatus();
      setOfficeStatus(data);
    } catch (err: any) {
      console.error('Failed to load Office status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficeData();
  }, []);

  const handleRunOp = (
    opId: string,
    params: Record<string, any> = {},
    requiresAdmin: boolean = false,
    msg: string = ''
  ) => {
    if (onExecuteOperation) {
      onExecuteOperation(opId, params, requiresAdmin);
      setActionMessage(msg);
      setTimeout(() => setActionMessage(null), 5000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Status Refresh */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-semibold text-white">
              Microsoft Office & Outlook Management
            </h2>
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Phase 8.5
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Diagnostics, Outlook recovery tools, Click-to-Run repairs, and collaboration cache management.
          </p>
        </div>
        <button
          id="btn-refresh-office-status"
          onClick={fetchOfficeData}
          disabled={isLoading}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Status
        </button>
      </div>

      {actionMessage && (
        <div className="flex items-center gap-2 p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-sm text-indigo-300">
          <Info className="w-4 h-4 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Office Installation & License Overview */}
      {officeStatus && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Installation Edition</span>
            <p className="text-base font-bold text-white mt-1">{officeStatus.edition}</p>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
              <span>Type: <strong className="text-slate-200">{officeStatus.installType}</strong></span>
              <span>•</span>
              <span>Arch: <strong className="text-slate-200">{officeStatus.architecture}</strong></span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-mono truncate">{officeStatus.installPath}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Build & Release Channel</span>
            <p className="text-base font-bold text-white mt-1">Version {officeStatus.version}</p>
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {officeStatus.channel}
            </p>
            <p className="text-xs text-slate-500 mt-2">Up to date with Microsoft 365 security updates</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Activation Status</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 text-xs font-bold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {officeStatus.activation.licenseStatus}
              </span>
              <span className="text-xs text-slate-300 font-mono">Key: ****{officeStatus.activation.partialKey}</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              License Type: <strong className="text-slate-200">{officeStatus.activation.licenseType}</strong>
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Remaining Days: {officeStatus.activation.remainingDays} days
            </p>
          </div>
        </div>
      )}

      {/* Installed Applications Bar */}
      {officeStatus?.installedApps && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Detected Office & Productivity Apps</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {officeStatus.installedApps.map((app: any) => (
              <div
                key={app.name}
                className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-2.5 flex flex-col items-center text-center"
              >
                <div className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs mb-1">
                  {app.name.substring(0, 1)}
                </div>
                <span className="text-xs font-semibold text-slate-200">{app.name}</span>
                <span className="text-[10px] text-emerald-400 mt-0.5">Installed</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Outlook Diagnostics & Repair Suite */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-sky-400" />
            <h3 className="text-base font-semibold text-white">Outlook Profile & Cache Diagnostics</h3>
          </div>
          {officeStatus?.outlook && (
            <div className="text-xs text-slate-400">
              Profile: <strong className="text-white">{officeStatus.outlook.defaultProfile}</strong> (Cache:{' '}
              <strong className="text-sky-400">{officeStatus.outlook.cacheSizeMB} MB</strong>)
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-slate-800/40 border border-slate-700/60 rounded-lg p-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm mb-1">
                <Zap className="w-4 h-4 text-amber-400" />
                Outlook Safe Mode
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Launches Outlook with all add-ins, customizations, and reading pane extensions disabled (outlook.exe /safe).
              </p>
            </div>
            <button
              id="btn-outlook-safemode"
              onClick={() =>
                handleRunOp('office.outlook.safemode', {}, false, 'Outlook opened in Safe Mode.')
              }
              className="w-full py-2 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-medium transition"
            >
              Launch Safe Mode
            </button>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/60 rounded-lg p-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm mb-1">
                <ExternalLink className="w-4 h-4 text-sky-400" />
                Profile Manager
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Opens native Mail profiles dialog (control mlcfg32.cpl / outlook.exe /profiles) to repair or create accounts.
              </p>
            </div>
            <button
              id="btn-outlook-profiles"
              onClick={() =>
                handleRunOp('office.outlook.profiles', {}, false, 'Opening Outlook Mail Profiles dialog...')
              }
              className="w-full py-2 px-3 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded-lg text-xs font-medium transition"
            >
              Open Profiles CPL
            </button>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/60 rounded-lg p-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm mb-1">
                <RotateCcw className="w-4 h-4 text-indigo-400" />
                Reset Nav Pane
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Regenerates the Outlook navigation pane configuration to resolve "Cannot start Microsoft Outlook" launch hangs.
              </p>
            </div>
            <button
              id="btn-outlook-resetnavpane"
              onClick={() =>
                handleRunOp(
                  'office.outlook.resetnavpane',
                  {},
                  false,
                  'Outlook navigation pane reset successfully.'
                )
              }
              className="w-full py-2 px-3 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-medium transition"
            >
              Reset Navigation Pane
            </button>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/60 rounded-lg p-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm mb-1">
                <Wrench className="w-4 h-4 text-emerald-400" />
                Inbox Repair (SCANPST)
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Opens Microsoft SCANPST.EXE to diagnose and repair damaged Personal Folders (.pst) and offline (.ost) cache files.
              </p>
            </div>
            <button
              id="btn-outlook-scanpst"
              onClick={() =>
                handleRunOp('office.outlook.scanpst', {}, false, 'Inbox Repair Tool (SCANPST) launched.')
              }
              className="w-full py-2 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-medium transition"
            >
              Launch SCANPST
            </button>
          </div>
        </div>

        {/* Offline Cache Files Table */}
        {officeStatus?.outlook?.ostFiles && (
          <div className="mt-4 pt-4 border-t border-slate-800">
            <span className="text-xs font-medium text-slate-400">Offline Cache Files (.ost)</span>
            <div className="mt-2 space-y-2">
              {officeStatus.outlook.ostFiles.map((ost: any) => (
                <div
                  key={ost.path}
                  className="flex items-center justify-between text-xs bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 font-mono"
                >
                  <span className="text-slate-300 truncate max-w-xl">{ost.path}</span>
                  <span className="text-sky-400 font-bold shrink-0 ml-4">{ost.sizeMB} MB</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Office Suite Repairs & Collaboration Cleanup */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Office Suite Click-to-Run Repair */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-5 h-5 text-purple-400" />
              <h3 className="text-base font-semibold text-white">Office Installation Repairs</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Fixes corrupted shortcuts, broken COM add-ins, file association errors, or missing DLLs using native Click-to-Run repair pipelines.
            </p>

            <div className="space-y-3">
              <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-700/60 flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-slate-200">Quick Repair</span>
                  <p className="text-xs text-slate-400">
                    Fast offline repair of corrupt manifests without re-downloading files.
                  </p>
                </div>
                <button
                  id="btn-office-quick-repair"
                  onClick={() =>
                    handleRunOp('office.repair.quick', {}, true, 'Quick Repair sequence dispatched.')
                  }
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-medium transition shrink-0 ml-3"
                >
                  Run Quick Repair
                </button>
              </div>

              <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-700/60 flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-slate-200">Online Repair</span>
                  <p className="text-xs text-slate-400">
                    Comprehensive full repair via Microsoft CDN. Preserves settings and licenses.
                  </p>
                </div>
                <button
                  id="btn-office-online-repair"
                  onClick={() =>
                    handleRunOp('office.repair.online', {}, true, 'Online Repair sequence started.')
                  }
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-medium transition shrink-0 ml-3"
                >
                  Run Online Repair
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sync & Collaboration Cache Cleanup */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Cloud className="w-5 h-5 text-teal-400" />
              <h3 className="text-base font-semibold text-white">Collaboration & Cloud Sync Cleanup</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Safely clears temporary caches and restarts sync engines for OneDrive, Microsoft Teams, and Zoom.
            </p>

            <div className="space-y-3">
              <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-700/60 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <Cloud className="w-3.5 h-3.5 text-sky-400" />
                    <span className="text-sm font-semibold text-slate-200">Reset OneDrive Client</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Executes onedrive.exe /reset to resolve stuck syncing and index loop freezes.
                  </p>
                </div>
                <button
                  id="btn-onedrive-reset"
                  onClick={() =>
                    handleRunOp('office.onedrive.reset', {}, false, 'OneDrive client reset successfully.')
                  }
                  className="px-3 py-1.5 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/30 rounded-lg text-xs font-medium transition shrink-0 ml-3"
                >
                  Reset Sync
                </button>
              </div>

              <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-700/60 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-sm font-semibold text-slate-200">Clean Teams Cache</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Purges {officeStatus?.teams?.cacheSizeMB || 312} MB of temporary blobs without signing out.
                  </p>
                </div>
                <button
                  id="btn-teams-cleancache"
                  onClick={() =>
                    handleRunOp('office.teams.cleancache', {}, false, 'Microsoft Teams cache purged.')
                  }
                  className="px-3 py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-medium transition shrink-0 ml-3"
                >
                  Clean Teams
                </button>
              </div>

              <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-700/60 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-sm font-semibold text-slate-200">Clean Zoom Cache</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Purges {officeStatus?.zoom?.cacheSizeMB || 48} MB of cached meeting logs and thumbnail blobs.
                  </p>
                </div>
                <button
                  id="btn-zoom-cleancache"
                  onClick={() =>
                    handleRunOp('office.zoom.cleancache', {}, false, 'Zoom cache cleaned.')
                  }
                  className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 rounded-lg text-xs font-medium transition shrink-0 ml-3"
                >
                  Clean Zoom
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
