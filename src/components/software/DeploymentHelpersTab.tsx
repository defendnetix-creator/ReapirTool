/**
 * Deployment & Runtimes Tab
 * Akshigo PC Toolkit Pro v8.0.0-rc.1
 * Phase 8.6: Software Deployment, 100 Apps & Portable Tools Parity
 */

import React from 'react';
import {
  Download,
  ExternalLink,
  Shield,
  RotateCw,
  Sparkles,
  CheckCircle2,
  Terminal,
  Activity,
  Layers,
  Wrench
} from 'lucide-react';

interface DeploymentHelpersTabProps {
  helpers: any[];
  onTriggerStoreReset: () => void;
  onTriggerWingetHealth: () => void;
  onInstallRuntime: (helper: any) => void;
  loading: boolean;
}

export const DeploymentHelpersTab: React.FC<DeploymentHelpersTabProps> = ({
  helpers,
  onTriggerStoreReset,
  onTriggerWingetHealth,
  onInstallRuntime,
  loading
}) => {
  return (
    <div className="space-y-6">
      {/* Quick Diagnostics & Store Repair Card */}
      <div className="p-5 rounded-xl bg-[#0e121c] border border-white/[0.07] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Windows Package Manager & Store Diagnostics
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Verify WinGet database sources, repair Microsoft Store corruption, and re-register AppX manifests.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onTriggerWingetHealth}
              disabled={loading}
              className="px-3.5 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] text-slate-200 border border-white/[0.08] text-xs font-mono font-bold transition-all flex items-center gap-2"
            >
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Audit WinGet Health</span>
            </button>

            <button
              onClick={onTriggerStoreReset}
              disabled={loading}
              className="px-3.5 py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold transition-all flex items-center gap-2"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Reset Store (wsreset)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Runtimes and Official Microsoft Installers Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
          Essential Windows Runtimes & Deployment Portals ({helpers.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {helpers.map((helper) => {
            const isStoreRepair = helper.id === 'deploy.store.repair';
            const isDirectDownload = helper.downloadType === 'Direct Web';

            return (
              <div
                key={helper.id}
                className="p-5 rounded-xl bg-[#0e121c] border border-white/[0.07] hover:border-white/[0.14] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-white leading-tight">{helper.name}</h4>
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 whitespace-nowrap">
                      {helper.category}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-2.5 leading-relaxed">
                    {helper.description}
                  </p>

                  <div className="mt-3.5 space-y-1 text-[10px] font-mono text-slate-400">
                    <div className="flex items-center justify-between bg-[#080a11] px-2.5 py-1 rounded border border-white/[0.04]">
                      <span className="text-slate-500">Publisher:</span>
                      <span className="text-slate-300">{helper.publisher}</span>
                    </div>
                    <div className="flex items-center justify-between bg-[#080a11] px-2.5 py-1 rounded border border-white/[0.04]">
                      <span className="text-slate-500">Arch:</span>
                      <span className="text-slate-300 uppercase">{helper.architecture}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="mt-5 pt-3.5 border-t border-white/[0.04] flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500">
                    {helper.requiresAdmin && (
                      <span className="flex items-center gap-1 text-blue-400">
                        <Shield className="w-2.5 h-2.5" />
                        Admin
                      </span>
                    )}
                  </div>

                  {isStoreRepair ? (
                    <button
                      onClick={onTriggerStoreReset}
                      className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Execute wsreset</span>
                    </button>
                  ) : isDirectDownload && helper.officialUrl.startsWith('https://') ? (
                    <div className="flex items-center gap-2">
                      {helper.category === 'Runtimes' && (
                        <button
                          onClick={() => onInstallRuntime(helper)}
                          className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold transition-all flex items-center gap-1"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Install</span>
                        </button>
                      )}
                      <a
                        href={helper.officialUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] text-slate-300 font-mono text-xs transition-all flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Portal</span>
                      </a>
                    </div>
                  ) : (
                    <a
                      href={helper.officialUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] text-slate-300 font-mono text-xs transition-all flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Official Link</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
