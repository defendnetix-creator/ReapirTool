/**
 * Inventory & Updates Tab
 * Akshigo PC Toolkit Pro v8.0.0-rc.1
 * Phase 8.6: Software Deployment, 100 Apps & Portable Tools Parity
 */

import React, { useState } from 'react';
import {
  PackageCheck,
  ArrowUpCircle,
  Search,
  CheckCircle2,
  Trash2,
  RotateCw,
  Shield,
  Layers,
  Info
} from 'lucide-react';

interface InventoryUpdatesTabProps {
  inventory: any[];
  updates: any[];
  onUpgradeApp: (app: any) => void;
  onUpgradeAll: () => void;
  onUninstallApp: (app: any) => void;
  onRefresh: () => void;
  loading: boolean;
}

export const InventoryUpdatesTab: React.FC<InventoryUpdatesTabProps> = ({
  inventory,
  updates,
  onUpgradeApp,
  onUpgradeAll,
  onUninstallApp,
  onRefresh,
  loading
}) => {
  const [filterUpdatesOnly, setFilterUpdatesOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const displayList = (filterUpdatesOnly ? updates : inventory).filter(
    (app) =>
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.publisher.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.category && app.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      {/* Action Header */}
      <div className="p-4 rounded-xl bg-[#0e121c] border border-white/[0.07] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-80">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search installed packages..."
              className="w-full bg-[#090c13] border border-white/[0.08] rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-cyan-500/50"
            />
          </div>

          <div className="flex items-center gap-1 bg-[#090c13] p-1 rounded-lg border border-white/[0.06]">
            <button
              onClick={() => setFilterUpdatesOnly(false)}
              className={`px-2.5 py-1 rounded text-xs font-mono transition-all ${
                !filterUpdatesOnly
                  ? 'bg-white/[0.08] text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Installed ({inventory.length})
            </button>
            <button
              onClick={() => setFilterUpdatesOnly(true)}
              className={`px-2.5 py-1 rounded text-xs font-mono transition-all flex items-center gap-1.5 ${
                filterUpdatesOnly
                  ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowUpCircle className="w-3 h-3 text-amber-400" />
              <span>Updates ({updates.length})</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] text-slate-400 hover:text-slate-200 border border-white/[0.08] transition-all"
            title="Refresh inventory"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            disabled={updates.length === 0}
            onClick={onUpgradeAll}
            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:hover:bg-emerald-500 text-slate-950 font-mono text-xs font-bold transition-all flex items-center gap-2 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
          >
            <ArrowUpCircle className="w-3.5 h-3.5" />
            <span>Update All Available ({updates.length})</span>
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="rounded-xl bg-[#0e121c] border border-white/[0.07] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-[#090c13] text-slate-400 border-b border-white/[0.08] text-[11px]">
                <th className="py-3 px-4 font-bold">PACKAGE NAME</th>
                <th className="py-3 px-4 font-bold">PUBLISHER</th>
                <th className="py-3 px-4 font-bold">CURRENT VERSION</th>
                <th className="py-3 px-4 font-bold">LATEST VERSION</th>
                <th className="py-3 px-4 font-bold">SIZE</th>
                <th className="py-3 px-4 font-bold">STATUS</th>
                <th className="py-3 px-4 font-bold text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-slate-300">
              {displayList.map((app) => (
                <tr key={app.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 font-semibold text-white">
                    <div className="flex items-center gap-2">
                      <span>{app.name}</span>
                      <span className="text-[10px] text-slate-500 bg-white/[0.03] px-1.5 py-0.5 rounded border border-white/[0.04]">
                        {app.packageId || app.id}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-400">{app.publisher}</td>
                  <td className="py-3 px-4 text-slate-200">{app.version}</td>
                  <td className="py-3 px-4 text-slate-400">
                    {app.latestVersion || app.version}
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {app.sizeMB ? `${app.sizeMB} MB` : 'N/A'}
                  </td>
                  <td className="py-3 px-4">
                    {app.updateAvailable ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/60 text-amber-400 border border-amber-500/30 flex items-center gap-1 w-max">
                        <ArrowUpCircle className="w-2.5 h-2.5" />
                        Update Available
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-max">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Latest
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {app.updateAvailable && (
                        <button
                          onClick={() => onUpgradeApp(app)}
                          className="px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold transition-all flex items-center gap-1"
                        >
                          <ArrowUpCircle className="w-3 h-3" />
                          Upgrade
                        </button>
                      )}
                      <button
                        onClick={() => onUninstallApp(app)}
                        className="px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] transition-all flex items-center gap-1"
                        title="Uninstall"
                      >
                        <Trash2 className="w-3 h-3" />
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {displayList.length === 0 && (
          <div className="text-center py-10 space-y-1 font-mono text-xs text-slate-400">
            <Info className="w-6 h-6 text-slate-500 mx-auto" />
            <p>No applications match current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};
