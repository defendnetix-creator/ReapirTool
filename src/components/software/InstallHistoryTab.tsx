/**
 * Install History Tab (Deployment Audit Log)
 * Akshigo PC Toolkit Pro v8.0.0-rc.1
 * Phase 8.6: Software Deployment, 100 Apps & Portable Tools Parity
 */

import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Search,
  ArrowUpCircle,
  Trash2,
  Download,
  Info
} from 'lucide-react';

interface InstallHistoryTabProps {
  history: any[];
  onRefresh: () => void;
  loading: boolean;
}

export const InstallHistoryTab: React.FC<InstallHistoryTabProps> = ({
  history,
  onRefresh,
  loading
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');

  const filteredHistory = history.filter((item) => {
    const matchesAction = actionFilter === 'ALL' || item.action === actionFilter;
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.appName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.appId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.details && item.details.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesAction && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Header and Filter */}
      <div className="p-4 rounded-xl bg-[#0e121c] border border-white/[0.07] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-80">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search history records..."
              className="w-full bg-[#090c13] border border-white/[0.08] rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-cyan-500/50"
            />
          </div>

          <div className="flex items-center gap-1 bg-[#090c13] p-1 rounded-lg border border-white/[0.06] text-xs font-mono">
            {['ALL', 'INSTALL', 'UPGRADE', 'UNINSTALL'].map((action) => (
              <button
                key={action}
                onClick={() => setActionFilter(action)}
                className={`px-2.5 py-1 rounded transition-all ${
                  actionFilter === action
                    ? 'bg-white/[0.08] text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {action}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] text-slate-400 hover:text-slate-200 border border-white/[0.08] transition-all self-start sm:self-auto shrink-0"
          title="Refresh history"
        >
          <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* History Table */}
      <div className="rounded-xl bg-[#0e121c] border border-white/[0.07] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-[#090c13] text-slate-400 border-b border-white/[0.08] text-[11px]">
                <th className="py-3 px-4 font-bold">TIMESTAMP</th>
                <th className="py-3 px-4 font-bold">APPLICATION</th>
                <th className="py-3 px-4 font-bold">VERSION</th>
                <th className="py-3 px-4 font-bold">ACTION</th>
                <th className="py-3 px-4 font-bold">STATUS</th>
                <th className="py-3 px-4 font-bold">SOURCE</th>
                <th className="py-3 px-4 font-bold">DETAILS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-slate-300">
              {filteredHistory.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                    {new Date(item.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-semibold text-white">
                    <div>{item.appName}</div>
                    <div className="text-[10px] text-slate-500">{item.appId}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{item.version}</td>
                  <td className="py-3 px-4">
                    {item.action === 'INSTALL' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950/60 text-cyan-400 border border-cyan-500/30 flex items-center gap-1 w-max">
                        <Download className="w-2.5 h-2.5" />
                        INSTALL
                      </span>
                    )}
                    {item.action === 'UPGRADE' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/60 text-amber-400 border border-amber-500/30 flex items-center gap-1 w-max">
                        <ArrowUpCircle className="w-2.5 h-2.5" />
                        UPGRADE
                      </span>
                    )}
                    {item.action === 'UNINSTALL' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950/60 text-rose-400 border border-rose-500/30 flex items-center gap-1 w-max">
                        <Trash2 className="w-2.5 h-2.5" />
                        UNINSTALL
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {item.status === 'SUCCESS' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-max">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        SUCCESS
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950/60 text-rose-400 border border-rose-500/30 flex items-center gap-1 w-max">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        {item.status}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-400 uppercase text-[11px]">{item.source}</td>
                  <td className="py-3 px-4 text-slate-400 text-[11px] max-w-xs truncate">
                    {item.details || 'Executed silently.'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredHistory.length === 0 && (
          <div className="text-center py-10 space-y-1 font-mono text-xs text-slate-400">
            <Info className="w-6 h-6 text-slate-500 mx-auto" />
            <p>No deployment history records found.</p>
          </div>
        )}
      </div>
    </div>
  );
};
