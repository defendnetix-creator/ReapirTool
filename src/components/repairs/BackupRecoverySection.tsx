import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  HardDrive,
  FileCode,
  FolderArchive,
  RefreshCw,
  Plus,
  Play,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Clock,
  Download,
  Upload,
  Layers,
  FileText,
  Database,
  Trash2
} from 'lucide-react';
import { operationsClient } from '../../api/operationsClient';

interface BackupRecoverySectionProps {
  onExecuteOperation?: (
    operationId: string,
    params?: Record<string, any>,
    requiresAdmin?: boolean
  ) => void;
}

export const BackupRecoverySection: React.FC<BackupRecoverySectionProps> = ({
  onExecuteOperation
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'restore_points' | 'files' | 'registry' | 'winre' | 'policy'>('restore_points');
  const [restorePoints, setRestorePoints] = useState<any[]>([]);
  const [backupHistory, setBackupHistory] = useState<any[]>([]);
  const [winReStatus, setWinReStatus] = useState<any | null>(null);
  const [gpResult, setGpResult] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Form inputs
  const [newRpDescription, setNewRpDescription] = useState<string>('Akshigo Manual Checkpoint');
  const [fileBackupSource, setFileBackupSource] = useState<string>('C:\\Users\\Default\\Documents');
  const [regHive, setRegHive] = useState<'HKLM' | 'HKCU' | 'SYSTEM' | 'SOFTWARE'>('HKLM');
  const [regSubKey, setRegSubKey] = useState<string>('SYSTEM\\CurrentControlSet\\Services');

  // VSS State
  const [vssVolume, setVssVolume] = useState<string>('C:');
  const [vssMaxStorage, setVssMaxStorage] = useState<string>('15GB');
  const [vssPurgeModal, setVssPurgeModal] = useState<boolean>(false);
  const [vssResizeModal, setVssResizeModal] = useState<boolean>(false);
  const [showAdvancedVss, setShowAdvancedVss] = useState<boolean>(false);
  const [isManagingVss, setIsManagingVss] = useState<boolean>(false);

  // Confirmation modals
  const [restoreTarget, setRestoreTarget] = useState<{ type: 'file' | 'registry'; path: string } | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [rpRes, histRes, winreRes, gpRes] = await Promise.all([
        operationsClient.getRestorePoints(),
        operationsClient.getBackupHistory(),
        operationsClient.getWinReStatus(),
        operationsClient.getGPResult()
      ]);
      setRestorePoints(rpRes.restorePoints || []);
      setBackupHistory(histRes.history || []);
      setWinReStatus(winreRes);
      setGpResult(gpRes);
    } catch (err) {
      console.error('Failed to load backup telemetry:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateRestorePoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRpDescription.trim()) return;
    if (onExecuteOperation) {
      onExecuteOperation(
        'backup.restore_point.create',
        { description: newRpDescription },
        true
      );
    }
  };

  const handleCreateFileBackup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileBackupSource.trim()) return;
    if (onExecuteOperation) {
      onExecuteOperation(
        'backup.file.create',
        { sourcePath: fileBackupSource },
        true
      );
    }
  };

  const handleCreateRegBackup = (e: React.FormEvent) => {
    e.preventDefault();
    if (onExecuteOperation) {
      onExecuteOperation(
        'backup.registry.export',
        { hive: regHive, subKey: regSubKey },
        true
      );
    }
  };

  const handleConfirmRestore = () => {
    if (!restoreTarget) return;
    if (restoreTarget.type === 'file') {
      onExecuteOperation?.(
        'backup.file.restore',
        { archivePath: restoreTarget.path, confirmation: true },
        true
      );
    } else if (restoreTarget.type === 'registry') {
      onExecuteOperation?.(
        'backup.registry.restore',
        { regFilePath: restoreTarget.path, confirmation: true },
        true
      );
    }
    setRestoreTarget(null);
  };

  const handleListShadows = () => {
    onExecuteOperation?.('backup.vss.manage', { action: 'list', volume: vssVolume }, true);
  };

  const handleResizeShadowStorage = () => {
    setVssResizeModal(true);
  };

  const handleConfirmResizeShadowStorage = () => {
    onExecuteOperation?.('backup.vss.manage', { action: 'resize', volume: vssVolume, maxSize: vssMaxStorage, confirmation: true }, true);
    setVssResizeModal(false);
  };

  const handleConfirmPurgeShadows = () => {
    onExecuteOperation?.('backup.vss.manage', { action: 'purge_oldest', volume: vssVolume, confirmation: true }, true);
    setVssPurgeModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header and Sub-tabs */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <RotateCcw className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-semibold text-slate-100">
              Backup, Recovery & Policy Governance
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            VSS System Restore checkpoints, file/hive backups, Windows Recovery Environment, and Group Policy updates.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="inline-flex rounded-lg bg-slate-800 p-1 border border-slate-700/60 text-xs">
            <button
              onClick={() => setActiveSubTab('restore_points')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeSubTab === 'restore_points'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Restore Points
            </button>
            <button
              onClick={() => setActiveSubTab('files')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeSubTab === 'files'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              File Archives
            </button>
            <button
              onClick={() => setActiveSubTab('registry')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeSubTab === 'registry'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Registry Hives
            </button>
            <button
              onClick={() => setActiveSubTab('winre')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeSubTab === 'winre'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              WinRE
            </button>
            <button
              onClick={() => setActiveSubTab('policy')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeSubTab === 'policy'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Group Policy
            </button>
          </div>

          <button
            onClick={loadData}
            disabled={isLoading}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Subtab 1: System Restore Points */}
      {activeSubTab === 'restore_points' && (
        <div className="space-y-4">
          {/* Create New Restore Point Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
              Create Windows System Restore Point
            </h4>
            <p className="text-xs text-slate-400 mb-4">
              Invokes Windows Volume Shadow Copy (VSS) and SCM to create a snapshot of system binaries, registry hives, and drivers.
            </p>

            <form onSubmit={handleCreateRestorePoint} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={newRpDescription}
                onChange={(e) => setNewRpDescription(e.target.value)}
                placeholder="Restore Point Description (e.g. Pre-Patch Checkpoint)..."
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Point</span>
              </button>
            </form>
          </div>

          {/* List Existing Restore Points */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-slate-800/80 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold">
                Available Restore Checkpoints ({restorePoints.length})
              </span>
              <button
                onClick={() => onExecuteOperation?.('backup.restore_point.launch', {}, true)}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 flex items-center space-x-1 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Launch rstrui.exe</span>
              </button>
            </div>

            <div className="divide-y divide-slate-800/60 font-mono text-xs">
              {restorePoints.map((rp) => (
                <div
                  key={rp.sequenceNumber}
                  className="p-3 hover:bg-slate-800/40 flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-indigo-400 font-bold font-sans">
                        #{rp.sequenceNumber}
                      </span>
                      <span className="text-slate-200 font-sans font-medium text-xs">
                        {rp.description}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700 font-sans">
                        {rp.restorePointType}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(rp.creationTime).toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onExecuteOperation?.('backup.restore_point.launch', {}, true)}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700 flex items-center space-x-1 transition-colors"
                  >
                    <span>Restore</span>
                  </button>
                </div>
              ))}
              {restorePoints.length === 0 && (
                <div className="p-8 text-center text-slate-500 font-sans">
                  No restore points detected on this system.
                </div>
              )}
            </div>
          </div>

          {/* Volume Shadow Copy (VSS) Management & Storage */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                  <Database className="w-4 h-4 text-indigo-400" />
                  <span>Volume Shadow Copy (VSS) Administration</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Inspect shadow copy status and volume protection points (vssadmin). Destructive operations are strictly isolated.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                  VSS Service Active
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded">
                  Protected from Auto-Fix
                </span>
              </div>
            </div>

            {/* Normal Query & Status Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-3 space-y-2">
                <div className="text-[11px] font-medium text-slate-300">Target Volume & Shadow Enumeration</div>
                <div className="flex items-center space-x-2">
                  <select
                    value={vssVolume}
                    onChange={(e) => setVssVolume(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="C:">C: (System Drive)</option>
                    <option value="D:">D: (Data Drive)</option>
                    <option value="E:">E: (Backup Drive)</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleListShadows}
                    className="px-3.5 py-1.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium flex items-center space-x-1.5 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Query Shadows</span>
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">
                  Queries active volume snapshots via vssadmin without modifying disk allocations.
                </p>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-3 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-medium text-slate-300">System Protection Options</div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Open native Windows System Properties System Protection tab to configure drive protection manually.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onExecuteOperation?.('repair.recovery.open_options', {}, true)}
                  className="mt-2 w-full px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open System Protection Dialog</span>
                </button>
              </div>
            </div>

            {/* Advanced Maintenance Accordion (High Risk Actions) */}
            <div className="border border-amber-900/60 bg-amber-950/20 rounded-lg p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-amber-300">Advanced Shadow Maintenance (High Risk)</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800 font-bold">
                    ELEVATION & CONFIRMATION REQUIRED
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAdvancedVss(!showAdvancedVss)}
                  className="text-xs text-amber-400 hover:text-amber-300 font-medium"
                >
                  {showAdvancedVss ? 'Hide Controls' : 'Show Advanced Controls'}
                </button>
              </div>

              <p className="text-[10px] text-slate-300">
                ⚠️ Policy Notice: Shadow storage resizing and snapshot purging can invalidate rollback restore points. These operations are NEVER executed automatically by Super Repair or Auto Fix.
              </p>

              {showAdvancedVss && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-amber-900/40">
                  <div className="bg-slate-900/90 border border-slate-700/60 rounded-lg p-3 space-y-2">
                    <div className="text-[11px] font-medium text-slate-300">Max Shadow Storage Quota</div>
                    <div className="flex items-center space-x-2">
                      <select
                        value={vssMaxStorage}
                        onChange={(e) => setVssMaxStorage(e.target.value)}
                        className="flex-1 bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="5GB">5 GB</option>
                        <option value="10GB">10 GB</option>
                        <option value="15GB">15 GB (Default)</option>
                        <option value="25GB">25 GB</option>
                        <option value="10%">10% Total Disk</option>
                        <option value="20%">20% Total Disk</option>
                      </select>
                      <button
                        type="button"
                        onClick={handleResizeShadowStorage}
                        className="px-3.5 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center space-x-1.5 transition-colors"
                      >
                        <HardDrive className="w-3.5 h-3.5" />
                        <span>Resize Quota</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-700/60 rounded-lg p-3 space-y-2">
                    <div className="text-[11px] font-medium text-slate-300">Purge Oldest Shadow Copies</div>
                    <p className="text-[10px] text-slate-400">
                      Deletes oldest volume shadow snapshots to reclaim disk space.
                    </p>
                    <button
                      type="button"
                      onClick={() => setVssPurgeModal(true)}
                      className="w-full px-3 py-1.5 rounded bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Purge Oldest Snapshots...</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Subtab 2: File Backup & Restore */}
      {activeSubTab === 'files' && (
        <div className="space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
              Create File & Folder Backup Archive
            </h4>
            <p className="text-xs text-slate-400 mb-4">
              Archives directory files with cryptographic SHA-256 manifest validation and metadata preservation.
            </p>

            <form onSubmit={handleCreateFileBackup} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={fileBackupSource}
                onChange={(e) => setFileBackupSource(e.target.value)}
                placeholder="Source Folder Path (e.g. C:\Users\Username\Documents)..."
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
              >
                <FolderArchive className="w-3.5 h-3.5" />
                <span>Backup Folder</span>
              </button>
            </form>
          </div>

          {/* Backup History Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-slate-800/80 px-4 py-2.5 border-b border-slate-800 text-xs text-slate-300 font-semibold">
              Backup History & Archives
            </div>
            <div className="divide-y divide-slate-800/60 font-mono text-xs">
              {backupHistory
                .filter((b) => b.type === 'File' || b.type === 'Driver')
                .map((item) => (
                  <div key={item.id} className="p-3 hover:bg-slate-800/40 flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-200 font-sans">{item.name}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {item.type}
                        </span>
                        <span className="text-[10px] text-emerald-400">
                          {(item.sizeBytes / (1024 * 1024)).toFixed(1)} MB
                        </span>
                      </div>
                      <code className="text-[10px] text-slate-500 block truncate max-w-lg mt-0.5">
                        {item.destinationPath}
                      </code>
                    </div>

                    <button
                      onClick={() => setRestoreTarget({ type: 'file', path: item.destinationPath })}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700 flex items-center space-x-1 transition-colors"
                    >
                      <Upload className="w-3 h-3" />
                      <span>Restore</span>
                    </button>
                  </div>
                ))}
              {backupHistory.length === 0 && (
                <div className="p-8 text-center text-slate-500 font-sans">
                  No backup archives in local repository.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Subtab 3: Registry Backup & Restore */}
      {activeSubTab === 'registry' && (
        <div className="space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
              Safe Registry Hive Export
            </h4>
            <p className="text-xs text-slate-400 mb-4">
              Exports selected registry keys to a standalone .reg file for emergency restoration.
            </p>

            <form onSubmit={handleCreateRegBackup} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <select
                  value={regHive}
                  onChange={(e) => setRegHive(e.target.value as any)}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                >
                  <option value="HKLM">HKLM (Local Machine)</option>
                  <option value="HKCU">HKCU (Current User)</option>
                  <option value="SYSTEM">HKLM\SYSTEM</option>
                  <option value="SOFTWARE">HKLM\SOFTWARE</option>
                </select>

                <input
                  type="text"
                  value={regSubKey}
                  onChange={(e) => setRegSubKey(e.target.value)}
                  placeholder="Subkey (e.g. SYSTEM\CurrentControlSet\Services)..."
                  className="sm:col-span-3 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => onExecuteOperation?.('sys.admin.regedit', {}, true)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 flex items-center space-x-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open regedit.exe</span>
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-sm"
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Export Registry Key</span>
                </button>
              </div>
            </form>
          </div>

          {/* Registry Backups List */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-slate-800/80 px-4 py-2.5 border-b border-slate-800 text-xs text-slate-300 font-semibold">
              Exported Registry Hive Snapshots
            </div>
            <div className="divide-y divide-slate-800/60 font-mono text-xs">
              {backupHistory
                .filter((b) => b.type === 'Registry')
                .map((item) => (
                  <div key={item.id} className="p-3 hover:bg-slate-800/40 flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-200 font-sans">{item.name}</span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(item.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <code className="text-[10px] text-indigo-400 block truncate max-w-lg mt-0.5">
                        {item.destinationPath}
                      </code>
                    </div>

                    <button
                      onClick={() => setRestoreTarget({ type: 'registry', path: item.destinationPath })}
                      className="px-2.5 py-1 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-[11px] border border-rose-800/60 flex items-center space-x-1 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Import .reg</span>
                    </button>
                  </div>
                ))}
              {backupHistory.filter((b) => b.type === 'Registry').length === 0 && (
                <div className="p-8 text-center text-slate-500 font-sans">
                  No registry backups generated yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Subtab 4: Windows Recovery Environment (WinRE) */}
      {activeSubTab === 'winre' && winReStatus && (
        <div className="space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-semibold text-slate-200">
                  Windows Recovery Environment (WinRE) Status
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Preinstallation diagnostic container used for startup repairs, system restores, and BCD rebuilds.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onExecuteOperation?.('backup.winre.recovery_settings', {}, false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 flex items-center space-x-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Recovery Settings</span>
                </button>
                <button
                  onClick={() => onExecuteOperation?.('backup.winre.sdclt', {}, true)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 flex items-center space-x-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>sdclt.exe (Win7)</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
              <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-sans">WinRE State</span>
                <span className="text-sm font-bold text-emerald-400 flex items-center space-x-1 mt-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{winReStatus.status}</span>
                </span>
              </div>

              <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-sans">BCD Identifier</span>
                <span className="text-xs text-slate-300 block truncate mt-1" title={winReStatus.bcdId}>
                  {winReStatus.bcdId}
                </span>
              </div>

              <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-sans">Image Path</span>
                <span className="text-xs text-slate-300 block truncate mt-1" title={winReStatus.location}>
                  {winReStatus.location}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 5: Group Policy Tools */}
      {activeSubTab === 'policy' && (
        <div className="space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-semibold text-slate-200">
                Windows Group Policy Governance
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Local Group Policy Object (GPO) inspection, force refresh (gpupdate), and audit reporting.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => onExecuteOperation?.('policy.gpedit.launch', {}, true)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 flex items-center space-x-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>gpedit.msc</span>
              </button>
              <button
                onClick={() => onExecuteOperation?.('policy.report.generate', {}, false)}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Generate GPO Report</span>
              </button>
              <button
                onClick={() => onExecuteOperation?.('policy.gpupdate.force', {}, true)}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                <span>gpupdate /force</span>
              </button>
            </div>
          </div>

          {gpResult && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
              <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Applied Group Policy Objects (GPResult)
              </h5>

              <div className="space-y-2">
                {gpResult.appliedGPOs.map((gpo: any) => (
                  <div
                    key={gpo.name}
                    className="bg-slate-800/40 border border-slate-800 rounded-lg p-3 flex items-center justify-between"
                  >
                    <div>
                      <h6 className="text-xs font-bold text-slate-200">{gpo.name}</h6>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Version: {gpo.version} | Filter: {gpo.filtering}
                      </span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-800/60 font-semibold">
                      APPLIED
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal for Restore Operations */}
      {restoreTarget && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-amber-800/80 rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center space-x-3 text-amber-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-100">
                Confirm {restoreTarget.type === 'registry' ? 'Registry Import' : 'File Restore'}
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              You are about to restore data from:{' '}
              <strong className="text-indigo-300 font-mono block break-all mt-1">
                {restoreTarget.path}
              </strong>
              {restoreTarget.type === 'registry' && (
                <span className="text-rose-400 block mt-2 text-[11px]">
                  Warning: Modifying system registry hives can affect system stability.
                </span>
              )}
            </p>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setRestoreTarget(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRestore}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors shadow-sm"
              >
                Proceed with Restore
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for VSS Shadow Storage Purge */}
      {vssPurgeModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-rose-800/80 rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center space-x-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-100">
                Confirm Volume Shadow Purge
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              You are about to delete the oldest volume shadow copies on drive{' '}
              <strong className="text-rose-300 font-mono">{vssVolume}</strong> (vssadmin delete shadows /for={vssVolume} /oldest).
            </p>
            <div className="p-3 bg-rose-950/40 border border-rose-800/50 rounded-lg text-[11px] text-rose-200">
              ⚠️ Warning: Purged shadow copies cannot be recovered. Older restore points relying on these snapshots will no longer be available.
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setVssPurgeModal(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPurgeShadows}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors shadow-sm"
              >
                Confirm & Purge Oldest
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for VSS Shadow Storage Resize */}
      {vssResizeModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-amber-800/80 rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center space-x-3 text-amber-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-100">
                Confirm Shadow Storage Quota Resize
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              You are about to resize the volume shadow copy allocation on drive{' '}
              <strong className="text-indigo-300 font-mono">{vssVolume}</strong> to maximum capacity{' '}
              <strong className="text-indigo-300 font-mono">{vssMaxStorage}</strong> (vssadmin resize shadowstorage).
            </p>
            <div className="p-3 bg-amber-950/40 border border-amber-800/50 rounded-lg text-[11px] text-amber-200">
              ⚠️ Warning: If the new quota is smaller than current shadow usage, Windows will automatically delete the oldest shadow copies to fit within the new limit.
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setVssResizeModal(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmResizeShadowStorage}
                className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors shadow-sm"
              >
                Confirm & Resize Quota
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
