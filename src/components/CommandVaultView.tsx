/**
 * Command Vault & Knowledge Base View
 * Akshigo PC Toolkit Pro v8.0.0-rc.1
 * Phase 8.8: Command Vault Parity (Safe Execution, Categorization & Security Enforcement)
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Terminal,
  Search,
  Star,
  Play,
  Copy,
  Check,
  Shield,
  ShieldAlert,
  AlertTriangle,
  Info,
  ExternalLink,
  BookOpen,
  Filter,
  CheckCircle2,
  Clock,
  ChevronRight,
  Flame,
  FileCode2,
  Lock
} from 'lucide-react';
import {
  COMMAND_VAULT_CATALOG,
  COMMAND_VAULT_CATEGORIES,
  CommandVaultItem,
  CommandClassification
} from '../data/commandVaultCatalog';
import { KNOWN_OPERATIONS_MAP } from '../data/operationsCatalog';

interface CommandVaultViewProps {
  onExecuteOperation: (opId: string, params?: Record<string, any>, adminConfirmed?: boolean) => void;
  onTriggerAction: (action: string, details?: string) => void;
}

export const CommandVaultView: React.FC<CommandVaultViewProps> = ({
  onExecuteOperation,
  onTriggerAction
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [filterType, setFilterType] = useState<'ALL' | 'EXECUTABLE' | 'REFERENCE' | 'SECURITY_BLOCKED'>('ALL');
  const [selectedCommand, setSelectedCommand] = useState<CommandVaultItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Favorites state persisted in localStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('akshigo_cmd_vault_favorites');
      return saved ? JSON.parse(saved) : ['cmd-sfc-scannow', 'cmd-ipconfig-flushdns', 'cmd-powercfg-active'];
    } catch {
      return ['cmd-sfc-scannow', 'cmd-ipconfig-flushdns'];
    }
  });

  // Recent executions state
  const [recentExecutions, setRecentExecutions] = useState<Array<{ id: string; timestamp: string }>>(() => {
    try {
      const saved = localStorage.getItem('akshigo_cmd_vault_recents');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const updated = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem('akshigo_cmd_vault_favorites', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleCopyCommand = (command: CommandVaultItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(command.commandPreview);
    setCopiedId(command.id);
    setTimeout(() => setCopiedId(null), 2000);
    onTriggerAction('Command Copied', `Copied "${command.commandPreview}" to clipboard`);
  };

  const handleRunCommand = (command: CommandVaultItem) => {
    if (command.classification === 'REMOVED_SECURITY') {
      onTriggerAction(
        'Execution Blocked by Security Policy',
        'Dangerous command execution is blocked by Akshigo Security Guard.'
      );
      return;
    }

    if (!command.registeredOperationId || command.classification === 'REFERENCE_ONLY' || command.classification === 'OBSOLETE') {
      onTriggerAction(
        'Reference Command Only',
        'Arbitrary shell execution is disabled. Only approved registered operations may be executed.'
      );
      return;
    }

    // Verify operation exists in catalog
    const registeredOp = KNOWN_OPERATIONS_MAP[command.registeredOperationId];
    if (!registeredOp) {
      onTriggerAction(
        'Operation Not Registered',
        `Operation ID ${command.registeredOperationId} is not in the approved allowlist.`
      );
      return;
    }

    // Record in recents
    setRecentExecutions((prev) => {
      const filtered = prev.filter((r) => r.id !== command.id);
      const updated = [{ id: command.id, timestamp: new Date().toLocaleTimeString() }, ...filtered].slice(0, 10);
      try {
        localStorage.setItem('akshigo_cmd_vault_recents', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    onTriggerAction('Executing Approved Command', `${command.title} (${command.registeredOperationId})`);
    onExecuteOperation(command.registeredOperationId, {}, command.requiresAdmin);
  };

  // Filtered commands
  const filteredCommands = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return COMMAND_VAULT_CATALOG.filter((cmd) => {
      // Category match
      if (selectedCategory !== 'All' && cmd.category !== selectedCategory) {
        if (selectedCategory === 'Security Blocked' && cmd.classification === 'REMOVED_SECURITY') {
          // match
        } else {
          return false;
        }
      }

      // Filter type
      if (filterType === 'EXECUTABLE' && !cmd.registeredOperationId) return false;
      if (filterType === 'REFERENCE' && cmd.classification !== 'REFERENCE_ONLY') return false;
      if (filterType === 'SECURITY_BLOCKED' && cmd.classification !== 'REMOVED_SECURITY') return false;

      // Text query
      if (!q) return true;
      const matchTitle = cmd.title.toLowerCase().includes(q);
      const matchPreview = cmd.commandPreview.toLowerCase().includes(q);
      const matchDesc = cmd.description.toLowerCase().includes(q);
      const matchTags = cmd.tags.some((t) => t.toLowerCase().includes(q));
      const matchCategory = cmd.category.toLowerCase().includes(q);
      return matchTitle || matchPreview || matchDesc || matchTags || matchCategory;
    });
  }, [searchQuery, selectedCategory, filterType]);

  // Classification styling helper
  const getClassificationBadge = (classification: CommandClassification) => {
    switch (classification) {
      case 'SAFE_EXECUTABLE':
        return {
          bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
          label: 'Safe Executable',
          icon: CheckCircle2
        };
      case 'ADMIN_CONFIRM':
        return {
          bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
          label: 'Admin Confirm',
          icon: AlertTriangle
        };
      case 'REFERENCE_ONLY':
        return {
          bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
          label: 'Reference Only',
          icon: BookOpen
        };
      case 'REMOVED_SECURITY':
        return {
          bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
          label: 'Blocked for Security',
          icon: ShieldAlert
        };
      case 'OBSOLETE':
        return {
          bg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
          label: 'Obsolete Legacy',
          icon: Info
        };
    }
  };

  return (
    <div id="command-vault-container" className="space-y-6">
      {/* Header Banner */}
      <div id="cmd-vault-header" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
              <Terminal className="w-4 h-4" />
              <span>Safe Command Knowledge Base & Runner</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Command Vault & Mega Command Reference
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl">
              Searchable catalog of legitimate Windows administration, diagnostics, and repair commands. Execution is strictly routed through approved backend operations with loopback authorization.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-700/60 text-xs text-slate-300">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>Zero Arbitrary Shell Injection</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div id="cmd-vault-toolbar" className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Search Bar */}
        <div className="lg:col-span-8 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            id="cmd-vault-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search commands by keyword, tool (sfc, dism, netsh, powercfg), error code, or category..."
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Chips */}
        <div className="lg:col-span-4 flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium">
          <button
            id="filter-all-btn"
            onClick={() => setFilterType('ALL')}
            className={`flex-1 py-2 px-2.5 rounded-lg transition-colors text-center ${
              filterType === 'ALL'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-semibold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            All ({COMMAND_VAULT_CATALOG.length})
          </button>
          <button
            id="filter-executable-btn"
            onClick={() => setFilterType('EXECUTABLE')}
            className={`flex-1 py-2 px-2.5 rounded-lg transition-colors text-center ${
              filterType === 'EXECUTABLE'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm font-semibold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Executable
          </button>
          <button
            id="filter-reference-btn"
            onClick={() => setFilterType('REFERENCE')}
            className={`flex-1 py-2 px-2.5 rounded-lg transition-colors text-center ${
              filterType === 'REFERENCE'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm font-semibold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Reference
          </button>
          <button
            id="filter-blocked-btn"
            onClick={() => setFilterType('SECURITY_BLOCKED')}
            className={`flex-1 py-2 px-2.5 rounded-lg transition-colors text-center ${
              filterType === 'SECURITY_BLOCKED'
                ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-sm font-semibold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Blocked
          </button>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div id="cmd-vault-categories" className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {COMMAND_VAULT_CATEGORIES.map((cat) => (
          <button
            key={cat}
            id={`cmd-category-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Command Cards List */}
        <div className="xl:col-span-8 space-y-3">
          {filteredCommands.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <Terminal className="w-10 h-10 text-slate-400 mx-auto" />
              <div className="text-base font-semibold text-slate-800 dark:text-slate-200">
                No matching commands found
              </div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try searching for general keywords like "sfc", "dism", "dns", "ping", "powercfg", or select "All" categories.
              </p>
            </div>
          ) : (
            filteredCommands.map((cmd) => {
              const badge = getClassificationBadge(cmd.classification);
              const BadgeIcon = badge.icon;
              const isFav = favorites.includes(cmd.id);
              const isSelected = selectedCommand?.id === cmd.id;
              const canExecute = Boolean(cmd.registeredOperationId && cmd.classification !== 'REMOVED_SECURITY');

              return (
                <div
                  key={cmd.id}
                  id={`cmd-card-${cmd.id}`}
                  onClick={() => setSelectedCommand(cmd)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500/5 dark:bg-cyan-500/10 border-cyan-500 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                          {cmd.title}
                        </span>

                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badge.bg}`}
                        >
                          <BadgeIcon className="w-3 h-3" />
                          <span>{badge.label}</span>
                        </span>

                        {cmd.requiresAdmin && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            Admin
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {cmd.description}
                      </p>

                      {/* Command Preview Bar */}
                      <div className="flex items-center justify-between gap-2 bg-slate-950 px-3 py-1.5 rounded-lg font-mono text-xs text-cyan-300 border border-slate-800 overflow-hidden">
                        <code className="truncate">{cmd.commandPreview}</code>
                        <button
                          id={`copy-btn-${cmd.id}`}
                          onClick={(e) => handleCopyCommand(cmd, e)}
                          title="Copy command string"
                          className="text-slate-400 hover:text-white transition-colors p-1"
                        >
                          {copiedId === cmd.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-center">
                      <button
                        id={`star-btn-${cmd.id}`}
                        onClick={(e) => toggleFavorite(cmd.id, e)}
                        title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                        className={`p-2 rounded-lg transition-colors ${
                          isFav
                            ? 'text-amber-500 hover:bg-amber-500/10'
                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${isFav ? 'fill-amber-500' : ''}`} />
                      </button>

                      {canExecute ? (
                        <button
                          id={`run-btn-${cmd.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRunCommand(cmd);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>Run</span>
                        </button>
                      ) : cmd.classification === 'REMOVED_SECURITY' ? (
                        <span className="flex items-center gap-1 px-2.5 py-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-lg text-xs font-medium border border-rose-500/20">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>Blocked</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg text-xs font-medium">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Ref</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Command Detail Drawer / Sidebar */}
        <div className="xl:col-span-4 space-y-4">
          {selectedCommand ? (
            <div
              id="cmd-detail-pane"
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-5 sticky top-4"
            >
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                    {selectedCommand.category} Reference
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {selectedCommand.title}
                  </h3>
                </div>
                <button
                  id={`detail-fav-btn`}
                  onClick={(e) => toggleFavorite(selectedCommand.id, e)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 transition-colors"
                >
                  <Star
                    className={`w-5 h-5 ${
                      favorites.includes(selectedCommand.id) ? 'fill-amber-500 text-amber-500' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Classification Info */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Classification & Security Policy
                </div>
                {(() => {
                  const badge = getClassificationBadge(selectedCommand.classification);
                  const BadgeIcon = badge.icon;
                  return (
                    <div className={`p-3 rounded-xl border flex items-start gap-2.5 ${badge.bg}`}>
                      <BadgeIcon className="w-4 h-4 mt-0.5 shrink-0" />
                      <div className="text-xs space-y-1">
                        <div className="font-semibold">{badge.label}</div>
                        {selectedCommand.securityNote && (
                          <div className="text-slate-700 dark:text-slate-300 font-medium">
                            {selectedCommand.securityNote}
                          </div>
                        )}
                        {selectedCommand.classification === 'REFERENCE_ONLY' && (
                          <div className="text-slate-600 dark:text-slate-300">
                            Arbitrary shell command execution is prohibited for security. This command is provided as reference.
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Command Code Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <span>Syntax Preview</span>
                  <button
                    onClick={() => handleCopyCommand(selectedCommand)}
                    className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400 hover:underline"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedId === selectedCommand.id ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-cyan-300 font-mono text-xs break-all select-all">
                  {selectedCommand.commandPreview}
                </div>
              </div>

              {/* Documentation */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Technical Documentation
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  {selectedCommand.documentation}
                </p>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Search Tags
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCommand.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Primary Action Button */}
              <div className="pt-2">
                {selectedCommand.registeredOperationId && selectedCommand.classification !== 'REMOVED_SECURITY' ? (
                  <button
                    id="detail-run-action-btn"
                    onClick={() => handleRunCommand(selectedCommand)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Execute Approved Operation ({selectedCommand.registeredOperationId})</span>
                  </button>
                ) : selectedCommand.classification === 'REMOVED_SECURITY' ? (
                  <div className="w-full p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-2">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Permanently Blocked by Security Policy</span>
                  </div>
                ) : (
                  <div className="w-full p-3 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl text-xs font-medium text-center flex items-center justify-center gap-2">
                    <Info className="w-4 h-4" />
                    <span>Reference Only — No Backend Operation Mapped</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center space-y-3">
              <FileCode2 className="w-10 h-10 text-slate-400 mx-auto" />
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Select a Command
              </div>
              <p className="text-xs text-slate-500">
                Click any command card to inspect its full syntax, parameters, classification, and execution status.
              </p>
            </div>
          )}

          {/* Quick Favorites Section */}
          {favorites.length > 0 && (
            <div id="cmd-favorites-box" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Pinned Favorites ({favorites.length})</span>
              </div>
              <div className="space-y-1.5">
                {favorites.map((favId) => {
                  const cmd = COMMAND_VAULT_CATALOG.find((c) => c.id === favId);
                  if (!cmd) return null;
                  return (
                    <button
                      key={favId}
                      onClick={() => setSelectedCommand(cmd)}
                      className="w-full text-left p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center justify-between text-xs transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                    >
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                        {cmd.title}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent Executions Box */}
          {recentExecutions.length > 0 && (
            <div id="cmd-recents-box" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                <Clock className="w-4 h-4 text-cyan-500" />
                <span>Recent Runs ({recentExecutions.length})</span>
              </div>
              <div className="space-y-1.5">
                {recentExecutions.map((rec) => {
                  const cmd = COMMAND_VAULT_CATALOG.find((c) => c.id === rec.id);
                  if (!cmd) return null;
                  return (
                    <div
                      key={rec.id}
                      onClick={() => setSelectedCommand(cmd)}
                      className="cursor-pointer p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center justify-between text-xs transition-colors"
                    >
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                        {cmd.title}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {rec.timestamp}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
