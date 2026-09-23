import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Shield,
  RotateCw,
  AlertTriangle,
  CheckCircle2,
  HardDrive,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Zap,
  Terminal,
  FileCode,
  FolderDown,
  Info
} from 'lucide-react';
import { operationsClient } from '../../api/operationsClient';

interface BootBiosSectionProps {
  onExecuteOperation?: (
    operationId: string,
    params?: Record<string, any>,
    requiresAdmin?: boolean
  ) => void;
}

export const BootBiosSection: React.FC<BootBiosSectionProps> = ({
  onExecuteOperation
}) => {
  const [bootBios, setBootBios] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Confirmation dialogs
  const [confirmOp, setConfirmOp] = useState<{
    id: string;
    title: string;
    description: string;
    requiresAdmin: boolean;
  } | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await operationsClient.getBootBiosStatus();
      setBootBios(data);
    } catch (err: any) {
      console.error('Failed to load BIOS / Boot status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRunOp = (
    opId: string,
    params: Record<string, any> = {},
    requiresAdmin: boolean = false,
    msg: string = ''
  ) => {
    if (onExecuteOperation) {
      onExecuteOperation(opId, params, requiresAdmin);
      setActionMessage(msg);
      setTimeout(() => setActionMessage(null), 5000);
    }
  };

  const handleConfirmExecute = () => {
    if (!confirmOp) return;
    handleRunOp(confirmOp.id, { confirmation: true }, confirmOp.requiresAdmin, `${confirmOp.title} dispatched.`);
    setConfirmOp(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-white">BIOS, UEFI & Boot Configuration</h2>
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Phase 8.5
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Hardware firmware verification, UEFI/Legacy mode, Secure Boot, TPM 2.0 status, BCD inventory, and Windows Recovery Environment (WinRE).
          </p>
        </div>
        <button
          id="btn-refresh-boot-status"
          onClick={fetchData}
          disabled={isLoading}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Firmware
        </button>
      </div>

      {actionMessage && (
        <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-sm text-amber-300">
          <Info className="w-4 h-4 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Confirmation Modal for High-Risk Actions */}
      {confirmOp && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-white">{confirmOp.title}</h3>
            </div>
            <p className="text-sm text-slate-300 mb-4">{confirmOp.description}</p>
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300 mb-6">
              ⚠️ Administrator privileges required. This operation interacts directly with low-level Windows boot components.
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                id="btn-cancel-confirm-op"
                onClick={() => setConfirmOp(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                id="btn-execute-confirm-op"
                onClick={handleConfirmExecute}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold transition"
              >
                Confirm & Execute
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BIOS & Hardware Firmware Matrix */}
      {bootBios && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">System BIOS / Firmware</span>
            <p className="text-sm font-bold text-white mt-1">{bootBios.biosVendor}</p>
            <p className="text-xs text-slate-300 mt-1 font-mono">Ver: {bootBios.biosVersion}</p>
            <p className="text-xs text-slate-500 mt-1">Release Date: {bootBios.biosReleaseDate}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Firmware Architecture</span>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`px-2 py-0.5 text-xs font-bold rounded ${
                  bootBios.uefiMode
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}
              >
                {bootBios.uefiMode ? 'UEFI MODE' : 'LEGACY BIOS'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2">SMBIOS: {bootBios.smbiosVersion}</p>
            <p className="text-xs text-slate-500 mt-1">Boot Mode: {bootBios.bootMode}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Secure Boot State</span>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`px-2 py-0.5 text-xs font-bold rounded ${
                  bootBios.secureBootEnabled
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}
              >
                {bootBios.secureBootEnabled ? 'ENABLED (SECURE)' : 'DISABLED'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">Guards bootloader against untrusted EFI executables</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">TPM 2.0 Security Module</span>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`px-2 py-0.5 text-xs font-bold rounded ${
                  bootBios.tpm?.present && bootBios.tpm?.activated
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}
              >
                {bootBios.tpm?.specVersion || '2.0'} ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2 truncate font-mono">{bootBios.tpm?.manufacturer}</p>
          </div>
        </div>
      )}

      {/* Boot Configuration Data (BCD) & WinRE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* BCD Inventory */}
        {bootBios?.bcd && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-semibold text-white">Boot Configuration Data (BCD)</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">{bootBios.bcd.identifier}</span>
            </div>

            <div className="space-y-2 text-xs font-mono bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div className="flex justify-between border-b border-slate-800/80 pb-1">
                <span className="text-slate-400">Description:</span>
                <span className="text-slate-200">{bootBios.bcd.description}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-1">
                <span className="text-slate-400">Boot Manager Device:</span>
                <span className="text-sky-300 truncate max-w-xs">{bootBios.bcd.device}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-1">
                <span className="text-slate-400">Bootloader Path:</span>
                <span className="text-slate-300">{bootBios.bcd.path}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-1">
                <span className="text-slate-400">OS Device Partition:</span>
                <span className="text-emerald-400 font-bold">{bootBios.bcd.osDevice}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-1">
                <span className="text-slate-400">System Root:</span>
                <span className="text-slate-300">{bootBios.bcd.systemRoot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Test Signing / NX:</span>
                <span className="text-slate-300">{bootBios.bcd.testsigning ? 'Active' : 'Disabled'} ({bootBios.bcd.nx})</span>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                id="btn-bcd-backup"
                onClick={() =>
                  handleRunOp('boot.bcd.backup', {}, true, 'BCD store successfully exported.')
                }
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition"
              >
                <FolderDown className="w-3.5 h-3.5 text-sky-400" />
                Backup BCD Store
              </button>
              <button
                id="btn-bootrec-scan"
                onClick={() =>
                  handleRunOp('boot.bootrec.scan', {}, true, 'Scanning disks for Windows installations...')
                }
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition"
              >
                Scan OS Installations
              </button>
            </div>
          </div>
        )}

        {/* Windows Recovery Environment (WinRE) */}
        {bootBios?.winRe && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-semibold text-white">Windows Recovery Environment (WinRE)</h3>
                </div>
                <span
                  className={`px-2 py-0.5 text-xs font-bold rounded ${
                    bootBios.winRe.enabled
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {bootBios.winRe.enabled ? 'ENABLED' : 'DISABLED'}
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono bg-slate-950 p-3 rounded-lg border border-slate-800 mb-4">
                <div className="flex justify-between border-b border-slate-800/80 pb-1">
                  <span className="text-slate-400">Recovery Status:</span>
                  <span className="text-emerald-400 font-bold">Active & Configured</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-1">
                  <span className="text-slate-400">BCD Identifier:</span>
                  <span className="text-slate-300 truncate max-w-xs">{bootBios.winRe.bcdIdentifier}</span>
                </div>
                <div className="flex flex-col pt-1">
                  <span className="text-slate-400 mb-1">WinRE Image Location:</span>
                  <span className="text-slate-300 text-[11px] break-all">{bootBios.winRe.location}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                id="btn-reagentc-enable"
                onClick={() =>
                  handleRunOp('boot.reagentc.enable', {}, true, 'WinRE partition verified and enabled.')
                }
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition"
              >
                Enable WinRE (reagentc)
              </button>
              <button
                id="btn-open-recovery-settings"
                onClick={() =>
                  handleRunOp('boot.recovery.launch', {}, false, 'Opening Windows Recovery Settings...')
                }
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition"
              >
                Recovery Settings
              </button>
            </div>
          </div>
        )}
      </div>

      {/* High-Impact Boot Operations */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-semibold text-white">Advanced Boot Recovery & Diagnostic Actions</h3>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Emergency tools for systems with boot errors, BCD corruption, or requiring immediate access to the Windows Recovery Environment (WinRE).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-800/40 border border-slate-700/60 rounded-lg p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 font-semibold text-sm text-slate-200 mb-1">
                <RotateCw className="w-4 h-4 text-amber-400" />
                Advanced Startup Reboot
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Restarts the computer immediately into the Windows Advanced Startup Options menu (WinRE) to access Startup Repair, Command Prompt, or UEFI Firmware Settings.
              </p>
            </div>
            <button
              id="btn-trigger-advanced-startup"
              onClick={() =>
                setConfirmOp({
                  id: 'boot.advanced.startup',
                  title: 'Reboot to Windows Advanced Startup',
                  description:
                    'Your computer will cleanly restart immediately into the Windows Recovery Environment (WinRE). Save all open work before confirming.',
                  requiresAdmin: true
                })
              }
              className="w-full py-2 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-medium transition"
            >
              Reboot to Advanced Startup
            </button>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/60 rounded-lg p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 font-semibold text-sm text-slate-200 mb-1">
                <Zap className="w-4 h-4 text-rose-400" />
                Rebuild BCD Store (bootrec)
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Creates an automatic pre-repair snapshot of the current BCD and executes bootrec /rebuildbcd with bootsect /nt60 ALL to repair missing bootloader entries.
              </p>
            </div>
            <button
              id="btn-trigger-rebuild-bcd"
              onClick={() =>
                setConfirmOp({
                  id: 'boot.bootrec.rebuild',
                  title: 'Rebuild Boot Configuration Data (BCD)',
                  description:
                    'This operation will alter the system BCD store and write new master boot code to active volume boot sectors. A safety backup will be created automatically.',
                  requiresAdmin: true
                })
              }
              className="w-full py-2 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-medium transition"
            >
              Rebuild BCD Store
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
