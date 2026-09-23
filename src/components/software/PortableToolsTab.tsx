/**
 * Portable Tools Tab (Audited Portable Catalog)
 * Akshigo PC Toolkit Pro v8.0.0-rc.1
 * Phase 8.6: Software Deployment, 100 Apps & Portable Tools Parity
 */

import React, { useState } from 'react';
import {
  Wrench,
  Play,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Ban,
  Search,
  ExternalLink,
  Shield,
  RotateCw,
  Info
} from 'lucide-react';

interface PortableToolsTabProps {
  tools: any[];
  onLaunchTool: (tool: any) => void;
  loading: boolean;
  onRefresh: () => void;
}

export const PortableToolsTab: React.FC<PortableToolsTabProps> = ({
  tools,
  onLaunchTool,
  loading,
  onRefresh
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('SAFE_TO_INCLUDE');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredTools = tools.filter((tool) => {
    const matchesClassification =
      selectedFilter === 'ALL' || tool.classification === selectedFilter;
    const matchesSearch =
      searchQuery.trim() === '' ||
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.publisher.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.executableName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesClassification && matchesSearch;
  });

  const countByClass = (cls: string) => tools.filter((t) => t.classification === cls).length;

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="p-5 rounded-xl bg-[#0e121c] border border-white/[0.07] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Wrench className="w-4 h-4 text-cyan-400" />
            Audited Portable Diagnostic & System Tools
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Single-executable standalone utilities for rapid troubleshooting. Curated with strict security, code-signing, and license compliance audits.
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] text-slate-400 hover:text-slate-200 border border-white/[0.08] transition-all self-start sm:self-auto shrink-0"
          title="Refresh tools catalog"
        >
          <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-[#0e121c] border border-white/[0.07] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search portable tools by executable name, publisher, or purpose..."
            className="w-full bg-[#090c13] border border-white/[0.08] rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-cyan-500/50"
          />
        </div>

        {/* Audit Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 font-mono text-xs">
          <button
            onClick={() => setSelectedFilter('SAFE_TO_INCLUDE')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              selectedFilter === 'SAFE_TO_INCLUDE'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                : 'bg-white/[0.03] text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Verified Safe ({countByClass('SAFE_TO_INCLUDE')})</span>
          </button>

          <button
            onClick={() => setSelectedFilter('LICENSE_REVIEW')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              selectedFilter === 'LICENSE_REVIEW'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                : 'bg-white/[0.03] text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>License Review ({countByClass('LICENSE_REVIEW')})</span>
          </button>

          <button
            onClick={() => setSelectedFilter('REMOVE_SECURITY')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              selectedFilter === 'REMOVE_SECURITY'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold'
                : 'bg-white/[0.03] text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Prohibited / Removed ({countByClass('REMOVE_SECURITY')})</span>
          </button>

          <button
            onClick={() => setSelectedFilter('OBSOLETE')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              selectedFilter === 'OBSOLETE'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold'
                : 'bg-white/[0.03] text-slate-400 hover:text-slate-200'
            }`}
          >
            <Ban className="w-3.5 h-3.5 text-purple-400" />
            <span>Obsolete ({countByClass('OBSOLETE')})</span>
          </button>

          <button
            onClick={() => setSelectedFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedFilter === 'ALL'
                ? 'bg-white/[0.08] text-white font-bold'
                : 'bg-white/[0.03] text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({tools.length})
          </button>
        </div>
      </div>

      {/* Security Classification Note */}
      {selectedFilter === 'REMOVE_SECURITY' && (
        <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-200 text-xs font-mono space-y-1">
          <div className="flex items-center gap-2 font-bold text-rose-300">
            <ShieldAlert className="w-4 h-4" />
            <span>Policy Notice: Offensive & Anti-Tamper Tools Strictly Prohibited</span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            In adherence to professional IT standards and anti-malware guidelines, offensive credential extractors, unauthorized Wi-Fi password dumpers, and Defender disablers have been completely removed from this toolkit. Execution is strictly blocked.
          </p>
        </div>
      )}

      {selectedFilter === 'LICENSE_REVIEW' && (
        <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs font-mono space-y-1">
          <div className="flex items-center gap-2 font-bold text-amber-300">
            <AlertTriangle className="w-4 h-4" />
            <span>Commercial License Notice</span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            These commercial utilities require valid individual or technician licenses. The toolkit provides verified launcher stubs but will not bundle or bypass proprietary commercial licensing terms.
          </p>
        </div>
      )}

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredTools.map((tool) => {
          const isSafe = tool.classification === 'SAFE_TO_INCLUDE';
          const isBlocked = tool.classification === 'REMOVE_SECURITY';
          const isObsolete = tool.classification === 'OBSOLETE';

          return (
            <div
              key={tool.id}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                isBlocked
                  ? 'bg-rose-950/10 border-rose-500/20'
                  : isObsolete
                  ? 'bg-purple-950/10 border-purple-500/20'
                  : 'bg-[#0e121c] border-white/[0.07] hover:border-white/[0.14]'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold text-white">{tool.name}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-slate-400 font-mono">{tool.publisher}</span>
                      <span className="text-[10px] text-slate-500">•</span>
                      <span className="text-[10px] text-cyan-400 font-mono">{tool.category}</span>
                    </div>
                  </div>

                  {/* Classification Badge */}
                  <div>
                    {isSafe && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                        SAFE
                      </span>
                    )}
                    {tool.classification === 'LICENSE_REVIEW' && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-950/60 text-amber-400 border border-amber-500/30">
                        COMMERCIAL
                      </span>
                    )}
                    {isBlocked && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-rose-950/60 text-rose-400 border border-rose-500/30">
                        BLOCKED
                      </span>
                    )}
                    {isObsolete && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-purple-950/60 text-purple-400 border border-purple-500/30">
                        OBSOLETE
                      </span>
                    )}
                  </div>
                </div>

                {/* Purpose */}
                <p className="text-[11px] text-slate-300 mt-2.5 leading-relaxed font-sans">
                  {tool.purpose}
                </p>

                {/* Executable & Signature info */}
                <div className="mt-3 space-y-1 text-[10px] font-mono text-slate-400">
                  <div className="flex items-center justify-between bg-[#080a11] px-2 py-1 rounded border border-white/[0.04]">
                    <span className="text-slate-500">Binary:</span>
                    <span className="text-slate-300 font-bold truncate max-w-[170px]">
                      {tool.executableName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-[#080a11] px-2 py-1 rounded border border-white/[0.04]">
                    <span className="text-slate-500">Signature:</span>
                    <span className="text-slate-300">{tool.signatureStatus}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Launch / Action Bar */}
              <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center justify-between">
                <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500">
                  {tool.requiresAdmin && (
                    <span className="flex items-center gap-1 text-blue-400">
                      <Shield className="w-2.5 h-2.5" />
                      Elevated
                    </span>
                  )}
                </div>

                <div>
                  {isSafe ? (
                    <button
                      onClick={() => onLaunchTool(tool)}
                      className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                    >
                      <Play className="w-3 h-3 fill-slate-950" />
                      <span>Launch</span>
                    </button>
                  ) : tool.classification === 'LICENSE_REVIEW' ? (
                    <div className="flex items-center gap-2">
                      {tool.source && tool.source.startsWith('http') ? (
                        <a
                          href={tool.source}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-medium flex items-center gap-1.5 transition-all"
                        >
                          <ExternalLink className="w-3 h-3 text-amber-400" />
                          <span>Official Source</span>
                        </a>
                      ) : (
                        <button
                          disabled
                          className="px-3 py-1 rounded bg-white/[0.03] text-slate-500 text-xs font-mono border border-white/[0.05] cursor-not-allowed"
                        >
                          License Required
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      disabled
                      className="px-3 py-1 rounded bg-white/[0.03] text-slate-500 text-xs font-mono border border-white/[0.05] cursor-not-allowed"
                    >
                      {isBlocked ? 'Blocked by Policy' : 'Obsolete'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTools.length === 0 && (
        <div className="text-center py-10 space-y-1 font-mono text-xs text-slate-400">
          <Info className="w-6 h-6 text-slate-500 mx-auto" />
          <p>No portable tools match the current filter.</p>
        </div>
      )}
    </div>
  );
};
