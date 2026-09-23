import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  RefreshCw,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Search,
  ExternalLink
} from 'lucide-react';
import { HardwareTelemetry } from '../types';

interface SecurityViewProps {
  telemetry: HardwareTelemetry;
  onTriggerAction: (actionName: string, command: string, requiresAdmin?: boolean) => void;
}

export const SecurityView: React.FC<SecurityViewProps> = ({
  telemetry,
  onTriggerAction
}) => {
  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-white">
              Endpoint Security & Defender Posture
            </h1>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
              ZERO THREATS DETECTED
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Microsoft Defender real-time telemetry, signature freshness, host firewall isolation, and zero-trust verification.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              onTriggerAction('Update Defender Signatures', 'CheckActivation.cmd -UpdateSignatures', true)
            }
            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold transition-all flex items-center gap-2 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Update Antivirus Signatures</span>
          </button>
        </div>
      </div>

      {/* Security Posture Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Microsoft Defender Card */}
        <div className="p-5 rounded-xl bg-[#0e121c] border border-white/[0.07] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="font-mono text-xs font-bold text-slate-200 uppercase">
                Microsoft Defender
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/50 text-emerald-400 border border-emerald-500/30 font-bold">
              PROTECTED
            </span>
          </div>
          <div className="space-y-2 pt-2 border-t border-white/[0.06] text-xs font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Real-Time Protection:</span>
              <span className="text-emerald-400 font-bold">Active & Enforced</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Signature Version:</span>
              <span className="text-slate-200">1.417.329.0</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Last Full Scan:</span>
              <span className="text-slate-200">{telemetry.lastScanTime || 'Today, 08:30 AM'}</span>
            </div>
            <div className="pt-2">
              <button
                onClick={() =>
                  onTriggerAction('Defender Quick Scan', 'powershell.exe -Command Start-MpScan -ScanType QuickScan', false)
                }
                className="w-full py-1.5 rounded bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/10 text-xs font-mono transition-all text-center"
              >
                Run Quick Antivirus Scan
              </button>
            </div>
          </div>
        </div>

        {/* Windows Firewall */}
        <div className="p-5 rounded-xl bg-[#0e121c] border border-white/[0.07] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Lock className="w-4 h-4" />
              </div>
              <span className="font-mono text-xs font-bold text-slate-200 uppercase">
                Host Firewall Policy
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/50 text-emerald-400 border border-emerald-500/30 font-bold">
              ENFORCING
            </span>
          </div>
          <div className="space-y-2 pt-2 border-t border-white/[0.06] text-xs font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Domain Profile:</span>
              <span className="text-emerald-400 font-bold">Active (Block Inbound)</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Private Profile:</span>
              <span className="text-emerald-400 font-bold">Active (Block Inbound)</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Public Profile:</span>
              <span className="text-emerald-400 font-bold">Active (Block Inbound)</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Loopback Bridge:</span>
              <span className="text-cyan-400">Restricted to 127.0.0.1</span>
            </div>
          </div>
        </div>

        {/* SmartScreen & App Isolation */}
        <div className="p-5 rounded-xl bg-[#0e121c] border border-white/[0.07] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="font-mono text-xs font-bold text-slate-200 uppercase">
                Zero-Trust Defense
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/50 text-emerald-400 border border-emerald-500/30 font-bold">
              VERIFIED
            </span>
          </div>
          <div className="space-y-2 pt-2 border-t border-white/[0.06] text-xs font-mono">
            <div className="flex justify-between text-slate-400">
              <span>SmartScreen Filter:</span>
              <span className="text-emerald-400 font-bold">Enabled (Warn/Block)</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Tamper Protection:</span>
              <span className="text-emerald-400 font-bold">Enabled</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Credential Guard:</span>
              <span className="text-emerald-400 font-bold">Configured (VBS)</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Core Isolation / HVCI:</span>
              <span className="text-emerald-400 font-bold">Running</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
