/**
 * App Catalog Tab (100 Apps WinGet Catalog)
 * Akshigo PC Toolkit Pro v8.0.0-rc.1
 * Phase 8.6: Software Deployment, 100 Apps & Portable Tools Parity
 */

import React, { useState } from 'react';
import {
  Search,
  Download,
  CheckCircle2,
  ArrowUpCircle,
  Shield,
  Layers,
  Sparkles,
  Info,
  Check,
  RotateCw,
  Trash2
} from 'lucide-react';

interface AppCatalogTabProps {
  catalog: any[];
  selectedAppIds: string[];
  onToggleSelect: (appId: string) => void;
  onSelectAll: (appIds: string[]) => void;
  onClearSelection: () => void;
  onInstallApp: (app: any) => void;
  onUpgradeApp: (app: any) => void;
  onUninstallApp: (app: any) => void;
  onBatchInstall: (appIds: string[]) => void;
  loading: boolean;
  onRefresh: () => void;
}

const CATEGORIES = [
  'All',
  'Browsers',
  'Communication',
  'Media',
  'Utilities',
  'Productivity',
  'Developer Tools',
  'Remote Support',
  'Cloud Storage',
  'Security Utilities',
  'Runtimes',
  'Compression',
  'PDF Tools',
  'Hardware Utilities',
  'AI Tools'
];

export const AppCatalogTab: React.FC<AppCatalogTabProps> = ({
  catalog,
  selectedAppIds,
  onToggleSelect,
  onSelectAll,
  onClearSelection,
  onInstallApp,
  onUpgradeApp,
  onUninstallApp,
  onBatchInstall,
  loading,
  onRefresh
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredApps = catalog.filter((app) => {
    const matchesCategory =
      selectedCategory === 'All' || app.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      searchQuery.trim() === '' ||
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.publisher.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const allFilteredSelected =
    filteredApps.length > 0 && filteredApps.every((a) => selectedAppIds.includes(a.id));

  const totalSelectedSize = catalog
    .filter((a) => selectedAppIds.includes(a.id))
    .reduce((acc, a) => acc + (a.sizeMB || 0), 0);

  return (
    <div className="space-y-4">
      {/* Category Pills & Action Bar */}
      <div className="p-4 rounded-xl bg-[#0e121c] border border-white/[0.07] space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 100+ vetted apps by name, publisher, or package ID..."
              className="w-full bg-[#090c13] border border-white/[0.08] rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-cyan-500/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300 text-xs"
              >
                ×
              </button>
            )}
          </div>

          {/* Selection Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {selectedAppIds.length > 0 && (
              <div className="flex items-center gap-2 bg-cyan-950/40 border border-cyan-500/30 px-3 py-1.5 rounded-lg text-xs font-mono text-cyan-300">
                <span className="font-bold">{selectedAppIds.length}</span> selected
                <span className="text-slate-400">({totalSelectedSize} MB)</span>
                <button
                  onClick={onClearSelection}
                  className="ml-2 text-slate-400 hover:text-white underline text-[11px]"
                >
                  Clear
                </button>
              </div>
            )}

            <button
              onClick={() => {
                if (allFilteredSelected) {
                  onClearSelection();
                } else {
                  onSelectAll(filteredApps.map((a) => a.id));
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] text-slate-300 border border-white/[0.08] text-xs font-mono transition-all"
            >
              {allFilteredSelected ? 'Deselect Visible' : `Select All Visible (${filteredApps.length})`}
            </button>

            <button
              disabled={selectedAppIds.length === 0}
              onClick={() => onBatchInstall(selectedAppIds)}
              className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:hover:bg-cyan-500 text-slate-950 font-mono text-xs font-bold transition-all flex items-center gap-2 shadow-[0_0_12px_rgba(6,182,212,0.2)]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install Selected ({selectedAppIds.length})</span>
            </button>

            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] text-slate-400 hover:text-slate-200 border border-white/[0.08] transition-all"
              title="Refresh catalog data"
            >
              <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Category horizontal scrolling bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar border-t border-white/[0.04]">
          {CATEGORIES.map((cat) => {
            const count =
              cat === 'All'
                ? catalog.length
                : catalog.filter((a) => a.category.toLowerCase() === cat.toLowerCase()).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold'
                    : 'bg-white/[0.03] text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] border border-white/[0.04]'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[9px] px-1 py-0.2 rounded ${
                    isSelected ? 'bg-cyan-500/30 text-cyan-200' : 'bg-white/[0.05] text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Applications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredApps.map((app) => {
          const isSelected = selectedAppIds.includes(app.id);
          const isInstalled = !!app.installed;
          const hasUpdate = !!app.updateAvailable;

          return (
            <div
              key={app.id}
              className={`p-4 rounded-xl border transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-cyan-950/20 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                  : 'bg-[#0e121c] border-white/[0.07] hover:border-white/[0.14]'
              }`}
            >
              <div>
                {/* Card Top: Checkbox, Name, Status Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => onToggleSelect(app.id)}
                      className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border transition-colors shrink-0 ${
                        isSelected
                          ? 'bg-cyan-500 border-cyan-500 text-slate-950'
                          : 'border-slate-600 hover:border-slate-400 bg-black/40'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xs font-bold text-white truncate" title={app.name}>
                        {app.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className="text-[10px] text-slate-400 font-mono truncate max-w-[120px]">
                          {app.publisher}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">•</span>
                        <span className="text-[10px] text-slate-400 font-mono">v{app.version}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="shrink-0">
                    {hasUpdate ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/60 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                        <ArrowUpCircle className="w-2.5 h-2.5" />
                        Update
                      </span>
                    ) : isInstalled ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Installed
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-white/[0.04] border border-white/[0.06]">
                        {app.sizeMB ? `${app.sizeMB} MB` : 'WinGet'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-[11px] text-slate-400 mt-2.5 line-clamp-2 leading-relaxed">
                  {app.description}
                </p>

                {/* Badges */}
                <div className="flex items-center gap-1.5 mt-3 flex-wrap text-[9px] font-mono">
                  <span className="px-1.5 py-0.5 rounded bg-black/40 text-slate-400 border border-white/[0.05] truncate max-w-[180px]">
                    ID: {app.id}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-white/[0.03] text-slate-400 border border-white/[0.04]">
                    {app.license}
                  </span>
                  {app.requiresAdmin && (
                    <span className="px-1.5 py-0.5 rounded bg-blue-950/40 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                      <Shield className="w-2.5 h-2.5" />
                      Admin
                    </span>
                  )}
                </div>
              </div>

              {/* Card Actions */}
              <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-white/[0.04]">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                  {app.category}
                </span>

                <div className="flex items-center gap-1.5">
                  {hasUpdate && (
                    <button
                      onClick={() => onUpgradeApp(app)}
                      className="px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold transition-all flex items-center gap-1"
                    >
                      <ArrowUpCircle className="w-3 h-3" />
                      Upgrade
                    </button>
                  )}

                  {isInstalled ? (
                    <button
                      onClick={() => onUninstallApp(app)}
                      className="px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-mono transition-all flex items-center gap-1"
                      title="Uninstall application"
                    >
                      <Trash2 className="w-3 h-3" />
                      Remove
                    </button>
                  ) : (
                    <button
                      onClick={() => onInstallApp(app)}
                      className="px-3 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold transition-all flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      Install
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredApps.length === 0 && (
        <div className="text-center py-12 rounded-xl bg-[#0e121c] border border-white/[0.07] space-y-2">
          <Info className="w-8 h-8 text-slate-500 mx-auto" />
          <p className="text-xs font-mono text-slate-300">No applications found matching query.</p>
          <p className="text-[11px] text-slate-500">
            Try adjusting your search terms or clearing the category filter.
          </p>
        </div>
      )}
    </div>
  );
};
