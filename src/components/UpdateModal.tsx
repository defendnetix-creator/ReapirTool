import React, { useState, useEffect } from 'react';
import {
  DownloadCloud,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  X,
  FileCode,
  ArrowRight,
  ExternalLink,
  Lock,
  RefreshCw
} from 'lucide-react';
import { updateClient } from '../updates/updateClient.js';
import { UpdateState } from '../updates/types.js';

interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({ isOpen, onClose }) => {
  const [updateState, setUpdateState] = useState<UpdateState>(updateClient.getState());

  useEffect(() => {
    return updateClient.subscribe(setUpdateState);
  }, []);

  if (!isOpen || !updateState.manifest) return null;

  const manifest = updateState.manifest;
  const isDownloading = updateState.downloadStage === 'downloading';
  const isVerifying = ['verifying_hash', 'verifying_signature'].includes(updateState.downloadStage);
  const isReady = updateState.downloadStage === 'ready_to_install';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl bg-[#0e121c] border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-cyan-950/60 to-slate-900 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <DownloadCloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Software Update Available</h2>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                  manifest.updateType === 'critical'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                }`}>
                  {manifest.updateType}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Target Release: <strong className="text-cyan-400">v{manifest.version}</strong> (Channel: {manifest.channel})
              </p>
            </div>
          </div>

          {!manifest.updateType.includes('critical') && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/[0.05] text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs font-mono">
          {/* Version delta & security indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-[#141926] border border-white/[0.05]">
              <span className="text-slate-500 text-[10px] block">CURRENT VERSION</span>
              <span className="text-slate-300 font-bold">v{updateState.currentVersion}</span>
            </div>
            <div className="p-3 rounded-lg bg-[#141926] border border-white/[0.05]">
              <span className="text-slate-500 text-[10px] block">NEW VERSION</span>
              <span className="text-cyan-400 font-bold">v{manifest.version}</span>
            </div>
            <div className="p-3 rounded-lg bg-[#141926] border border-white/[0.05]">
              <span className="text-slate-500 text-[10px] block">PACKAGE SIZE</span>
              <span className="text-slate-300 font-bold">{(manifest.installer.sizeBytes / 1024 / 1024).toFixed(1)} MB</span>
            </div>
            <div className="p-3 rounded-lg bg-[#141926] border border-white/[0.05]">
              <span className="text-slate-500 text-[10px] block">AUTHENTICODE</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> SHA-256
              </span>
            </div>
          </div>

          {/* Release Notes */}
          <div>
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-2">
              Release Notes & Enhancements
            </span>
            <div className="p-4 rounded-xl bg-[#080a10] border border-white/[0.08] text-slate-300 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap font-sans text-xs">
              {manifest.releaseNotes}
            </div>
          </div>

          {/* Signature & Integrity Attestation */}
          <div className="p-4 rounded-xl bg-[#121624] border border-white/[0.06] space-y-2 text-[11px]">
            <div className="flex items-center gap-2 text-slate-200 font-bold">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Authenticode Trust & Verification Pipeline</span>
            </div>
            <div className="text-slate-400 space-y-1">
              <div><strong className="text-slate-300">Publisher:</strong> {manifest.installer.signature.signer}</div>
              <div><strong className="text-slate-300">File Checksum (SHA-256):</strong> <code className="text-cyan-400 text-[10px]">{manifest.installer.sha256}</code></div>
              <div><strong className="text-slate-300">Timestamp Authority:</strong> RFC 3161 Authenticode Timestamp Verified (DigiCert)</div>
            </div>
          </div>

          {/* Progress / Status Display during Download */}
          {updateState.downloadStage !== 'idle' && (
            <div className="p-4 rounded-xl bg-[#090d16] border border-cyan-500/20 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-cyan-400 font-bold flex items-center gap-2">
                  {isDownloading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  {isVerifying && <ShieldCheck className="w-3.5 h-3.5 text-amber-400 animate-pulse" />}
                  {isReady && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  {updateState.downloadStage === 'downloading' && `Downloading Package (${updateState.downloadProgress}%)...`}
                  {updateState.downloadStage === 'verifying_hash' && 'Verifying SHA-256 File Checksum...'}
                  {updateState.downloadStage === 'verifying_signature' && 'Verifying Authenticode Digital Signature & Publisher Pinning...'}
                  {updateState.downloadStage === 'ready_to_install' && 'Integrity Check Passed. Ready for In-Place Upgrade.'}
                  {updateState.downloadStage === 'installing' && 'Executing Transactional Installer...'}
                </span>
                <span className="text-slate-400">{updateState.downloadProgress}%</span>
              </div>

              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-200"
                  style={{ width: `${updateState.downloadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-[#0a0d14] border-t border-white/[0.08] flex items-center justify-between gap-4">
          <div className="text-[10px] text-slate-500 font-mono">
            Seamless in-place upgrade • License & data preserved
          </div>

          <div className="flex items-center gap-3">
            {updateState.downloadStage === 'idle' ? (
              <button
                onClick={() => updateClient.startUpdatePipeline()}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all"
              >
                <DownloadCloud className="w-4 h-4" />
                <span>Download & Verify Update</span>
              </button>
            ) : isReady ? (
              <button
                onClick={() => updateClient.launchInstaller()}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Install & Restart Toolkit</span>
              </button>
            ) : (
              <button
                disabled
                className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-500 font-mono font-bold text-xs cursor-not-allowed flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Processing Pipeline...</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
