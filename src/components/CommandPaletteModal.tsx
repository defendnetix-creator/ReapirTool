import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  Wrench,
  Cpu,
  ShieldCheck,
  FileSpreadsheet,
  Settings,
  ArrowRight,
  AlertTriangle,
  Layers,
  Sparkles,
  HelpCircle,
  Activity,
  FolderOpen,
  CheckCircle2,
  HardDrive
} from 'lucide-react';
import { TabType } from '../types';
import { executeSmartSearch, SmartSearchResult } from '../data/smartSearchEngine';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: TabType) => void;
  onTriggerAction: (actionName: string, command: string, requiresAdmin?: boolean) => void;
  onExecuteOperation?: (operationId: string, params?: Record<string, any>, requiresAdmin?: boolean) => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onTriggerAction,
  onExecuteOperation
}) => {
  const [query, setQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Execute typed multi-facet smart search
  const smartResults = executeSmartSearch(query.trim() || 'a'); // Provide quick recommendations if empty

  const filterOptions = [
    { id: 'ALL', label: 'All Results' },
    { id: 'COMMAND_VAULT', label: 'Command Vault' },
    { id: 'ISSUE', label: 'Issues & Symptoms' },
    { id: 'REPAIR_ACTION', label: 'Repairs & Operations' },
    { id: 'SERVICE', label: 'Services' },
    { id: 'DRIVER', label: 'Drivers' },
    { id: 'PROCESS', label: 'Processes' },
    { id: 'FEATURE', label: 'Features' }
  ];

  const filteredResults = smartResults.filter((res) => {
    if (selectedTypeFilter === 'ALL') return true;
    return res.type === selectedTypeFilter;
  });

  const handleResultClick = (res: SmartSearchResult) => {
    onClose();
    if (res.type === 'FEATURE' && res.targetTab) {
      onSelectTab(res.targetTab as TabType);
    } else if (res.operationId && onExecuteOperation) {
      onExecuteOperation(res.operationId, {}, res.requiresAdmin);
    } else if (res.targetTab) {
      onSelectTab(res.targetTab as TabType);
    } else {
      onTriggerAction(res.title, res.operationId || 'diagnostic', res.requiresAdmin);
    }
  };

  const getBadgeForType = (type: SmartSearchResult['type']) => {
    switch (type) {
      case 'COMMAND_VAULT':
        return { label: 'CMD VAULT', bg: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40' };
      case 'ISSUE':
        return { label: 'ISSUE', bg: 'bg-rose-950/60 text-rose-300 border-rose-500/30' };
      case 'REPAIR_ACTION':
        return { label: 'ACTION', bg: 'bg-cyan-950/60 text-cyan-300 border-cyan-500/30' };
      case 'SERVICE':
        return { label: 'SERVICE', bg: 'bg-indigo-950/60 text-indigo-300 border-indigo-500/30' };
      case 'DRIVER':
        return { label: 'DRIVER', bg: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30' };
      case 'PROCESS':
        return { label: 'PROCESS', bg: 'bg-amber-950/60 text-amber-300 border-amber-500/30' };
      case 'SCHEDULED_TASK':
        return { label: 'TASK', bg: 'bg-purple-950/60 text-purple-300 border-purple-500/30' };
      case 'NETWORK_PORT':
        return { label: 'PORT', bg: 'bg-blue-950/60 text-blue-300 border-blue-500/30' };
      default:
        return { label: 'FEATURE', bg: 'bg-slate-800 text-slate-300 border-white/10' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-xs select-none">
      <div className="w-full max-w-2xl rounded-2xl bg-[#0c101a] border border-cyan-500/40 p-5 shadow-2xl space-y-4 animate-in fade-in duration-150 flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-[#070a10] border border-white/[0.1] focus-within:border-cyan-500/60 transition-all">
          <Search className="w-4 h-4 text-cyan-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search symptoms, tools, repairs, apps, services, drivers, ports..."
            className="flex-1 bg-transparent text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-hidden"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-500 hover:text-slate-300 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-bold border border-white/5">
            ESC
          </kbd>
        </div>

        {/* Facet Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-white/[0.06]">
          {filterOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelectedTypeFilter(opt.id)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono whitespace-nowrap transition-all ${
                selectedTypeFilter === opt.id
                  ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-500/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 min-h-[220px]">
          {filteredResults.length > 0 ? (
            filteredResults.map((res) => {
              const badge = getBadgeForType(res.type);
              return (
                <button
                  key={res.id}
                  onClick={() => handleResultClick(res)}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-cyan-950/30 border border-white/[0.04] hover:border-cyan-500/40 text-left transition-all group"
                >
                  <div className="flex items-center gap-3.5 min-w-0 pr-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-800/80 group-hover:bg-cyan-500/10 text-slate-400 group-hover:text-cyan-400 flex items-center justify-center shrink-0 border border-white/[0.05] group-hover:border-cyan-500/30 transition-all">
                      {res.type === 'ISSUE' ? (
                        <HelpCircle className="w-4 h-4 text-rose-400" />
                      ) : res.type === 'REPAIR_ACTION' ? (
                        <Wrench className="w-4 h-4 text-cyan-400" />
                      ) : res.type === 'SERVICE' ? (
                        <Layers className="w-4 h-4 text-indigo-400" />
                      ) : res.type === 'DRIVER' ? (
                        <HardDrive className="w-4 h-4 text-emerald-400" />
                      ) : res.type === 'PROCESS' ? (
                        <Activity className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-purple-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-semibold text-slate-100 group-hover:text-cyan-300 truncate">
                          {res.title}
                        </span>
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.2 rounded border font-bold ${badge.bg}`}
                        >
                          {badge.label}
                        </span>
                        {res.requiresAdmin && (
                          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-950/50 text-amber-400 border border-amber-500/30 font-bold">
                            ADMIN
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                        {res.subtitle}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono text-slate-500 group-hover:text-cyan-400 transition-colors">
                      {res.actionLabel || 'Select'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </button>
              );
            })
          ) : (
            <div className="py-12 text-center text-xs font-mono text-slate-500">
              No matching symptoms, tools, or system entities found for &quot;{query}&quot;.
            </div>
          )}
        </div>

        {/* Footer shortcuts info */}
        <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span>Search spans Issue Library, Operations, Services, Drivers, Tasks & Ports</span>
          <span>Tip: Press ESC to dismiss</span>
        </div>
      </div>
    </div>
  );
};
