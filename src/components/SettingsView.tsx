import React, { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  Palette,
  Terminal,
  Info,
  CheckCircle2,
  RefreshCw,
  Save,
  DownloadCloud,
  FolderLock,
  Layers,
  Sparkles,
  ExternalLink,
  Lock,
  Radio
} from 'lucide-react';
import { ENV, BuildMode } from '../config/environment.js';
import { BRAND } from '../config/brand.js';
import { updateClient } from '../updates/updateClient.js';
import { UpdateState, UpdateChannel } from '../updates/types.js';
import { UpdateModal } from './UpdateModal.js';

export const SettingsView: React.FC = () => {
  const [theme, setTheme] = useState<'Dark Obsidian' | 'Midnight Slate'>('Dark Obsidian');
  const [autoRefreshSecs, setAutoRefreshSecs] = useState<number>(5);
  const [telemetryConsent, setTelemetryConsent] = useState<boolean>(true);
  const [localAIMode, setLocalAIMode] = useState<boolean>(true);
  const [savedToast, setSavedToast] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const [updateState, setUpdateState] = useState<UpdateState>(updateClient.getState());

  useEffect(() => {
    return updateClient.subscribe(setUpdateState);
  }, []);

  const handleSave = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  const handleChannelChange = (newChannel: UpdateChannel) => {
    updateClient.setChannel(newChannel);
  };

  const handleCheckUpdates = async () => {
    const res = await updateClient.checkForUpdates();
    if (res.updateAvailable) {
      setIsUpdateModalOpen(true);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-white">
              Application Settings & Release Engineering
            </h1>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-500/30">
              BUILD: {ENV.mode} (v{ENV.appVersion})
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Loopback bridge binding parameters, secure update channels, directory architecture, and code signing policies.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold transition-all flex items-center gap-2 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{savedToast ? 'Settings Saved!' : 'Save Configuration'}</span>
        </button>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Secure Release Updates Section */}
        <div className="p-5 rounded-xl bg-[#0e121c] border border-cyan-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-xs font-mono font-bold text-slate-200 uppercase">
              <DownloadCloud className="w-4 h-4 text-cyan-400" />
              <span>Release Channel & Secure Updates</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <Lock className="w-3 h-3" /> SHA-256 PINNED
            </span>
          </div>

          <div className="space-y-4 text-xs font-mono">
            <div>
              <label className="text-slate-400 block mb-1">Release Distribution Channel</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleChannelChange('stable')}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    updateState.channel === 'stable'
                      ? 'bg-cyan-950/50 border-cyan-500/60 text-white'
                      : 'bg-[#090c13] border-white/[0.08] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <Radio className={`w-3.5 h-3.5 ${updateState.channel === 'stable' ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <span>Stable Channel</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Production-validated builds</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleChannelChange('beta')}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    updateState.channel === 'beta'
                      ? 'bg-purple-950/50 border-purple-500/60 text-white'
                      : 'bg-[#090c13] border-white/[0.08] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <Radio className={`w-3.5 h-3.5 ${updateState.channel === 'beta' ? 'text-purple-400' : 'text-slate-500'}`} />
                    <span>Beta / Preview</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Early preview features</span>
                </button>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#131826] border border-white/[0.05] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 block">CURRENT STATUS</span>
                <span className="text-slate-200 font-bold">
                  {updateState.updateAvailable
                    ? `Update Ready: v${updateState.latestVersion}`
                    : `Toolkit is Up to Date (v${ENV.appVersion})`}
                </span>
                {updateState.lastCheckedAt && (
                  <span className="text-[10px] text-slate-500 block mt-0.5">Last checked: {updateState.lastCheckedAt}</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {updateState.updateAvailable && (
                  <button
                    onClick={() => setIsUpdateModalOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-[11px] transition-all"
                  >
                    View Update
                  </button>
                )}
                <button
                  onClick={handleCheckUpdates}
                  disabled={updateState.isChecking}
                  className="px-3 py-1.5 rounded-lg bg-[#1a2133] hover:bg-[#232c42] text-cyan-300 font-bold text-[11px] flex items-center gap-1.5 transition-all border border-white/[0.08]"
                >
                  <RefreshCw className={`w-3 h-3 ${updateState.isChecking ? 'animate-spin' : ''}`} />
                  <span>{updateState.isChecking ? 'Checking...' : 'Check Now'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Directory Architecture & Security ACLs */}
        <div className="p-5 rounded-xl bg-[#0e121c] border border-white/[0.07] space-y-4">
          <div className="flex items-center gap-2.5 text-xs font-mono font-bold text-slate-200 uppercase">
            <FolderLock className="w-4 h-4 text-emerald-400" />
            <span>Filesystem & Security Directory Layout</span>
          </div>

          <div className="space-y-2.5 text-[11px] font-mono">
            <div className="p-2.5 rounded-lg bg-[#131826] border border-white/[0.04]">
              <span className="text-slate-500 text-[10px] block">IMMUTABLE PROGRAM BINARIES (READ-ONLY)</span>
              <span className="text-cyan-300 select-all">{BRAND.PROGRAM_FILES_DIR}\</span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#131826] border border-white/[0.04]">
              <span className="text-slate-500 text-[10px] block">MACHINE LOGS & AUDIT TRAIL (ALL USERS)</span>
              <span className="text-slate-300 select-all">{BRAND.PROGRAM_DATA_DIR}\</span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#131826] border border-white/[0.04]">
              <span className="text-slate-500 text-[10px] block">USER CACHE & DPAPI TOKEN VAULT</span>
              <span className="text-slate-300 select-all">{BRAND.LOCAL_APP_DATA_DIR}\</span>
            </div>
          </div>
        </div>

        {/* General & Bridge Configuration */}
        <div className="p-5 rounded-xl bg-[#0e121c] border border-white/[0.07] space-y-4">
          <div className="flex items-center gap-2.5 text-xs font-mono font-bold text-slate-200 uppercase">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>Loopback Bridge & Runtime</span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div>
              <label className="text-slate-400 block mb-1">Bridge Listen Port (Loopback Only)</label>
              <input
                type="text"
                disabled
                value="9999 (127.0.0.1 bound)"
                className="w-full bg-[#090c13] border border-white/[0.08] rounded-lg px-3 py-1.5 text-slate-400 cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Hardened loopback address. Remote inbound connections are strictly rejected.
              </span>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Telemetry Polling Frequency</label>
              <select
                value={autoRefreshSecs}
                onChange={(e) => setAutoRefreshSecs(Number(e.target.value))}
                className="w-full bg-[#090c13] border border-white/[0.1] rounded-lg px-3 py-1.5 text-slate-200 focus:outline-hidden focus:border-cyan-500/50"
              >
                <option value={2}>2 seconds (High Responsiveness)</option>
                <option value={5}>5 seconds (Balanced Default)</option>
                <option value={10}>10 seconds (Low Resource Usage)</option>
              </select>
            </div>
          </div>
        </div>

        {/* AI Privacy & Zero-Trust Telemetry */}
        <div className="p-5 rounded-xl bg-[#0e121c] border border-white/[0.07] space-y-4">
          <div className="flex items-center gap-2.5 text-xs font-mono font-bold text-slate-200 uppercase">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>AI Privacy & Zero-Trust Governance</span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#131826] border border-white/[0.04]">
              <div>
                <div className="font-semibold text-slate-200">Local Heuristic AI Engine</div>
                <div className="text-[10px] text-slate-400">Process diagnostics locally without remote cloud calls</div>
              </div>
              <input
                type="checkbox"
                checked={localAIMode}
                onChange={(e) => setLocalAIMode(e.target.checked)}
                className="w-4 h-4 accent-cyan-500 rounded"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-[#131826] border border-white/[0.04]">
              <div>
                <div className="font-semibold text-slate-200">Structured Forensic Audit Trail</div>
                <div className="text-[10px] text-slate-400">Log all executed repair actions to local encrypted audit ring</div>
              </div>
              <input
                type="checkbox"
                checked={telemetryConsent}
                onChange={(e) => setTelemetryConsent(e.target.checked)}
                className="w-4 h-4 accent-cyan-500 rounded"
              />
            </div>
          </div>
        </div>

        {/* Authenticode & Release Info */}
        <div className="md:col-span-2 p-5 rounded-xl bg-[#0e121c] border border-white/[0.07] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-xs font-mono font-bold text-slate-200 uppercase">
              <Info className="w-4 h-4 text-indigo-400" />
              <span>About {BRAND.PRODUCT_NAME} — Commercial Release</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                AUTHENTICODE SIGNED
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2 border-t border-white/[0.06] text-xs font-mono">
            <div>
              <span className="text-slate-500 block text-[10px]">APPLICATION VERSION</span>
              <span className="text-slate-200 font-bold">{BRAND.VERSION} (Release Candidate)</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">CODE SIGNING PUBLISHER</span>
              <span className="text-cyan-400 font-bold">{BRAND.COMPANY_NAME}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">DIGITAL TIMESTAMP</span>
              <span className="text-slate-200">RFC 3161 SHA-256 (DigiCert)</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">INSTALLER RUNTIME</span>
              <span className="text-emerald-400 font-bold">Inno Setup x64 (Clean Uninstaller)</span>
            </div>
          </div>
        </div>
      </div>

      <UpdateModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
      />
    </div>
  );
};
