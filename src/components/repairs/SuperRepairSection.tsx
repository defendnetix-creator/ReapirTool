import React, { useState } from 'react';
import {
  Wrench,
  RotateCcw,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  ArrowRight,
  Shield,
  Play,
  FileCheck,
  Check,
  BookmarkPlus
} from 'lucide-react';
import { operationsClient } from '../../api/operationsClient';

interface SuperRepairStage {
  stageNumber: number;
  name: string;
  category: string;
  operations: string[];
  description: string;
  estimatedTime: string;
  risk: 'safe' | 'moderate';
}

interface SuperRepairSectionProps {
  onExecuteOperation?: (operationId: string, params?: Record<string, any>, requiresAdmin?: boolean) => void;
}

export const SuperRepairSection: React.FC<SuperRepairSectionProps> = ({ onExecuteOperation }) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [createCheckpoint, setCreateCheckpoint] = useState(true);

  const stages: SuperRepairStage[] = [
    {
      stageNumber: 1,
      name: 'System Health & Snapshot Checkpoint',
      category: 'Snapshot',
      operations: ['repair.recovery.create_restore_point', 'hardware.telemetry.get'],
      description: 'Captures a rollback Volume Shadow Copy system restore point before applying modifications.',
      estimatedTime: '45 secs',
      risk: 'safe'
    },
    {
      stageNumber: 2,
      name: 'Windows Servicing & System Integrity',
      category: 'Windows Integrity',
      operations: ['repair.dism.restorehealth', 'repair.sfc.scannow'],
      description: 'Executes DISM Component Store RestoreHealth followed by SFC /scannow deep file validation.',
      estimatedTime: '4-7 mins',
      risk: 'safe'
    },
    {
      stageNumber: 3,
      name: 'Network & Sockets Health Sweep',
      category: 'Network',
      operations: ['network.dns.flush', 'network.winsock.reset', 'network.ip.renew'],
      description: 'Flushes DNS resolver cache, purges ARP tables, and resets corrupted Winsock catalog handles.',
      estimatedTime: '30 secs',
      risk: 'safe'
    },
    {
      stageNumber: 4,
      name: 'Windows Update Daemons & Catalog Reset',
      category: 'Windows Update',
      operations: ['repair.wu.reset_services', 'repair.wu.softwaredist_reset'],
      description: 'Restarts wuauserv, bits, and cryptSvc; purges stale SoftwareDistribution\\Download cache.',
      estimatedTime: '1-2 mins',
      risk: 'moderate'
    },
    {
      stageNumber: 5,
      name: 'Modern Store & AppX Framework Refresh',
      category: 'Store & Runtime',
      operations: ['repair.store.wsreset', 'deployment.runtime.install'],
      description: 'Resets Microsoft Store cache (wsreset) and validates official Desktop Runtimes.',
      estimatedTime: '45 secs',
      risk: 'safe'
    },
    {
      stageNumber: 6,
      name: 'Printer Subsystem & Spooler Sanitation',
      category: 'Print Subsystem',
      operations: ['printer.spooler.restart', 'printer.queue.purge'],
      description: 'Purges hung .SHD/.SPL print job manifests and cycles the Print Spooler daemon.',
      estimatedTime: '20 secs',
      risk: 'safe'
    },
    {
      stageNumber: 7,
      name: 'Final Subsystem Health Scan & Verification',
      category: 'Final Audit',
      operations: ['repair.wu.status', 'system.selfheal.run'],
      description: 'Conducts final verification across all subsystems and registers completed remediation in audit log.',
      estimatedTime: '30 secs',
      risk: 'safe'
    }
  ];

  const handleLaunchSuperRepair = () => {
    setIsConfirmOpen(false);
    if (onExecuteOperation) {
      onExecuteOperation(
        'repair.super.full_pipeline',
        { createRestorePoint: createCheckpoint },
        true
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0c1322] via-[#0d182b] to-[#0a1120] border border-cyan-500/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Zap className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <h2 className="text-lg font-mono font-bold text-white tracking-wide">
                One-Click Super Repair
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 font-bold">
                  AUTONOMOUS 7-STAGE PC HEALING ENGINE
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 font-bold">
                  RESTORE POINT GUARANTEED
                </span>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Restores system health end-to-end. Runs sequential, deterministic repairs across Windows component store, system integrity, network connectivity, update services, modern runtime, and print queues.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <button
            onClick={() => setIsConfirmOpen(true)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-mono font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.35)] transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Play className="w-4 h-4 fill-black" />
            <span>Launch Super Repair Pipeline</span>
          </button>
        </div>
      </div>

      {/* Pipeline Stages View */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            Super Repair Execution Sequence (7 Verified Stages)
          </h3>
          <span className="text-[11px] font-mono text-slate-500">
            Total Est. Duration: ~8-12 Minutes
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stages.map((stage) => (
            <div
              key={stage.stageNumber}
              className="p-4 rounded-xl bg-[#0b0e17] border border-white/[0.06] hover:border-cyan-500/30 transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
                    STAGE {stage.stageNumber}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {stage.estimatedTime}
                  </span>
                </div>
                <h4 className="text-xs font-mono font-bold text-white">
                  {stage.name}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  {stage.description}
                </p>
              </div>

              <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[10px] font-mono">
                <span className="text-cyan-400/80 truncate">
                  {stage.operations.join(' • ')}
                </span>
                <span
                  className={`px-1.5 py-0.2 rounded border font-semibold ${
                    stage.risk === 'safe'
                      ? 'bg-emerald-950/50 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-950/50 text-amber-400 border-amber-500/30'
                  }`}
                >
                  {stage.risk.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation Modal */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs select-none">
          <div className="w-full max-w-lg rounded-2xl bg-[#0c101a] border border-cyan-500/50 p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <Zap className="w-5 h-5 text-cyan-300" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-mono font-bold text-white">
                  Confirm One-Click Super Repair Execution
                </h3>
                <p className="text-xs text-slate-400">
                  This procedure will execute the entire 7-stage PC remediation pipeline in an elevated subshell.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#06080e] border border-white/[0.08] space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between text-slate-300">
                <span>Stages to run:</span>
                <span className="font-bold text-cyan-300">7 Automated Stages</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Admin Elevation:</span>
                <span className="text-amber-400 font-bold">Required (UAC Active)</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Restart Required:</span>
                <span className="text-emerald-400 font-bold">No (Zero immediate reboots)</span>
              </div>
            </div>

            <label className="flex items-center gap-3 p-3 rounded-xl bg-[#0a0d15] border border-cyan-500/30 cursor-pointer">
              <input
                type="checkbox"
                checked={createCheckpoint}
                onChange={(e) => setCreateCheckpoint(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500 bg-slate-900 border-white/20"
              />
              <div className="text-xs font-mono">
                <span className="font-bold text-white">Create Volume Shadow Copy Restore Point</span>
                <p className="text-[10px] text-slate-400">
                  Safely captures system state prior to modifications for 1-click rollback.
                </p>
              </div>
            </label>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsConfirmOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleLaunchSuperRepair}
                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-mono font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Confirm & Execute</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
