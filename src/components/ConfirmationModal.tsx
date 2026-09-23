import React from 'react';
import { AlertTriangle, ShieldAlert, X, ArrowRight, CheckCircle2 } from 'lucide-react';
import { RepairToolItem } from '../types';

interface ConfirmationModalProps {
  item: RepairToolItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  item,
  isOpen,
  onClose,
  onConfirm
}) => {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs select-none">
      <div className="w-full max-w-lg rounded-xl bg-[#0e121c] border border-cyan-500/40 p-6 shadow-2xl space-y-5 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Confirm System Operation
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {item.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Warning / Impact Description */}
        <div className="p-4 rounded-lg bg-[#131826] border border-white/[0.06] space-y-2">
          <div className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>This action will perform the following steps:</span>
          </div>
          <ul className="space-y-1.5 text-xs font-mono text-slate-300 pl-2">
            {item.details.map((detail, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">•</span>
                <span>{detail}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Operational Safeguards */}
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
          <span>
            {item.requiresAdmin ? '🔒 Elevated Administrator Privilege' : '👤 Standard User Execution'}
          </span>
          <span>
            {item.requiresRestart ? '⚠️ Windows Restart May Be Required' : '✓ No Restart Required'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.06]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/10 text-xs font-mono font-semibold transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center gap-2"
          >
            <span>Execute Playbook</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
