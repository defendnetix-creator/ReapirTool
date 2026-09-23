import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { ToastMessage } from '../types';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full select-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`p-3.5 rounded-xl border shadow-xl flex items-start gap-3 transition-all animate-in slide-in-from-bottom-3 duration-200 ${
            t.type === 'success'
              ? 'bg-[#091a14] border-emerald-500/40 text-emerald-300'
              : t.type === 'error'
              ? 'bg-[#1f0d11] border-rose-500/40 text-rose-300'
              : t.type === 'warning'
              ? 'bg-[#1f1709] border-amber-500/40 text-amber-300'
              : 'bg-[#0e1628] border-cyan-500/40 text-cyan-300'
          }`}
        >
          {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
          {t.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />}
          {t.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />}
          {t.type === 'info' && <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />}

          <div className="flex-1 text-xs font-mono">
            <div className="font-bold text-white uppercase tracking-tight">{t.title}</div>
            <div className="text-slate-300 mt-0.5 leading-snug">{t.message}</div>
          </div>

          <button
            onClick={() => onDismiss(t.id)}
            className="text-slate-400 hover:text-white p-0.5 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
