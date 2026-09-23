import React, { useState } from 'react';
import { Star, Clock, Trash2, Play, Wrench } from 'lucide-react';
import { KNOWN_OPERATIONS_MAP } from '../../data/operationsCatalog';

interface QuickAccessSectionProps {
  onExecuteOperation?: (operationId: string, params?: Record<string, any>, requiresAdmin?: boolean) => void;
}

const DEFAULT_FAVORITES = [
  'repair.sfc.scannow',
  'repair.dism.restorehealth',
  'network.dns.flush',
  'printer.spooler.restart',
  'repair.super.full_pipeline',
  'repair.recovery.create_restore_point'
];

const DEFAULT_RECENT = [
  { opId: 'network.ping.dns', executedAt: '10 mins ago', status: 'SUCCESS' },
  { opId: 'hardware.battery.report', executedAt: '25 mins ago', status: 'SUCCESS' },
  { opId: 'repair.sfc.scannow', executedAt: '1 hour ago', status: 'SUCCESS' }
];

export const QuickAccessSection: React.FC<QuickAccessSectionProps> = ({ onExecuteOperation }) => {
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('akshigo_favorites');
      return saved ? JSON.parse(saved) : DEFAULT_FAVORITES;
    } catch {
      return DEFAULT_FAVORITES;
    }
  });

  const [recents, setRecents] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('akshigo_recent_ops');
      return saved ? JSON.parse(saved) : DEFAULT_RECENT;
    } catch {
      return DEFAULT_RECENT;
    }
  });

  const toggleFavorite = (opId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(opId) ? prev.filter((id) => id !== opId) : [...prev, opId];
      try {
        localStorage.setItem('akshigo_favorites', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleRun = (opId: string) => {
    const def = KNOWN_OPERATIONS_MAP[opId];
    if (def && onExecuteOperation) {
      onExecuteOperation(opId, {}, def.requiresAdmin);

      // Record to recent
      const newRecent = [
        { opId, executedAt: 'Just now', status: 'SUCCESS' },
        ...recents.filter((r) => r.opId !== opId).slice(0, 7)
      ];
      setRecents(newRecent);
      try {
        localStorage.setItem('akshigo_recent_ops', JSON.stringify(newRecent));
      } catch {}
    }
  };

  return (
    <div className="space-y-6">
      {/* Pinned Favorites */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Pinned Quick-Access Favorites ({favorites.length})
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            Click star icon to unpin or manage
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((opId) => {
            const def = KNOWN_OPERATIONS_MAP[opId];
            if (!def) return null;
            return (
              <div
                key={opId}
                className="p-4 rounded-xl bg-[#090d15] border border-white/[0.06] hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-3 group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
                      {def.category}
                    </span>
                    <button
                      onClick={() => toggleFavorite(opId)}
                      className="text-amber-400 hover:text-amber-300 transition-colors p-1"
                      title="Unpin Favorite"
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                    </button>
                  </div>
                  <h4 className="text-xs font-mono font-bold text-white mt-2 group-hover:text-amber-300 transition-colors">
                    {def.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {def.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500">
                    Est: {def.estimatedDuration}
                  </span>
                  <button
                    onClick={() => handleRun(opId)}
                    className="px-3 py-1 rounded-lg bg-cyan-950/70 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(6,182,212,0.15)]"
                  >
                    <Play className="w-3 h-3 fill-cyan-300" />
                    <span>Run</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Tool History */}
      <div className="space-y-3 pt-3 border-t border-white/[0.06]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Recently Executed Tools & Remediation Operations
            </h3>
          </div>
          {recents.length > 0 && (
            <button
              onClick={() => {
                setRecents([]);
                try {
                  localStorage.removeItem('akshigo_recent_ops');
                } catch {}
              }}
              className="text-[10px] font-mono text-slate-500 hover:text-slate-300 flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        <div className="divide-y divide-white/[0.04] rounded-xl bg-[#090d15] border border-white/[0.06] overflow-hidden">
          {recents.map((item, idx) => {
            const def = KNOWN_OPERATIONS_MAP[item.opId];
            return (
              <div
                key={idx}
                className="p-3.5 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                    <Wrench className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-mono font-semibold text-slate-200">
                      {def ? def.name : item.opId}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">
                      {item.opId} • Executed {item.executedAt}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/50 text-emerald-400 border border-emerald-500/30">
                    {item.status}
                  </span>
                  <button
                    onClick={() => handleRun(item.opId)}
                    className="p-1 text-slate-400 hover:text-cyan-400 transition-colors"
                    title="Re-run Operation"
                  >
                    <Play className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
