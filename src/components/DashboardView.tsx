import React, { useState } from 'react';
import {
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Cpu,
  HardDrive,
  Activity,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Bot,
  Send,
  Download,
  Filter,
  RefreshCw,
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';
import { HardwareTelemetry, AuditLogEntry, TabType } from '../types';

interface DashboardViewProps {
  telemetry: HardwareTelemetry;
  auditLogs: AuditLogEntry[];
  onTriggerAction: (actionName: string, command: string, requiresAdmin?: boolean) => void;
  setActiveTab: (tab: TabType) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  telemetry,
  auditLogs,
  onTriggerAction,
  setActiveTab
}) => {
  const [copilotInput, setCopilotInput] = useState('');
  const [copilotHistory, setCopilotHistory] = useState<string[]>([]);
  const [isDryRunModalOpen, setIsDryRunModalOpen] = useState(false);

  const handleCopilotSend = () => {
    if (!copilotInput.trim()) return;
    setCopilotHistory((prev) => [...prev, copilotInput]);
    onTriggerAction('AI Copilot Query', `copilot:${copilotInput}`);
    setCopilotInput('');
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto overflow-y-auto">
      {/* Title & Executive Status Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-white">
              System Health & Executive Console
            </h1>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
              HEALTH: OPTIMAL
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Autonomous endpoint telemetry feeds, zero-trust loopback boundary, and real-time remediation.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-lg bg-[#0e121c] border border-white/[0.06] text-slate-300">
            <span className="text-slate-500 mr-2">System Uptime:</span>
            <span className="text-cyan-400 font-bold">{telemetry.uptime || '99.992%'}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-[#0e121c] border border-white/[0.06] text-slate-300">
            <span className="text-slate-500 mr-2">Privilege:</span>
            <span className="text-emerald-400 font-bold">Elevated SuperAdmin</span>
          </div>
        </div>
      </div>

      {/* Hero Automated Healing Banner */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-[#0d1527] via-[#0e1628] to-[#09101f] border border-cyan-500/20 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-full bg-cyan-500/5 blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-mono font-bold text-sm tracking-wider text-white">
                  AUTOMATED PC HEALING & GOVERNANCE SWEEP
                </span>
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-rose-950/60 text-rose-400 border border-rose-500/30">
                  ZERO DOWNTIME
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                Autonomous agent scans 48 subsystem components: verifies Windows Defender signatures, flushes anomalous DNS socket buffers, repairs damaged print spooler pipes, runs RAM garbage collection, and generates SOC2 audit checkpoints.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('diagnostics')}
              className="px-4 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/10 font-mono text-xs font-semibold transition-all"
            >
              View Dry-Run Spec
            </button>
            <button
              onClick={() =>
                onTriggerAction(
                  'Automated PC Healing Sweep',
                  'OneClickSuperRepair.ps1 -FullHealing',
                  true
                )
              }
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center gap-2 group"
            >
              <span>TRIGGER FULL HEALING</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>

      {/* 4 Bento Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: PC Health Score */}
        <div className="p-4 rounded-xl bg-[#0e121c] border border-white/[0.07] hover:border-cyan-500/30 transition-all space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">
              PC HEALTH SCORE
            </span>
            <span className="text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/30 text-[10px]">
              Grade A+
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">98</span>
            <span className="text-xs text-slate-500 font-mono">/ 100 Index</span>
          </div>
          {/* Segmented Bar */}
          <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full rounded-full w-[98%] shadow-[0_0_8px_#34d399]"></div>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span className="text-emerald-400 flex items-center gap-1 font-semibold">
              ▲ 2.4% vs last cycle
            </span>
            <span>0 Critical CVEs</span>
          </div>
        </div>

        {/* Card 2: Active System Incidents */}
        <div className="p-4 rounded-xl bg-[#0e121c] border border-white/[0.07] hover:border-amber-500/30 transition-all space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">
              ACTIVE SYSTEM ISSUES
            </span>
            <span className="text-amber-400 font-bold px-1.5 py-0.5 rounded bg-amber-950/40 border border-amber-500/30 text-[10px]">
              P2 WARNING
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-400 font-mono">02</span>
            <span className="text-xs text-slate-400">Non-Fatal Alerts</span>
          </div>
          <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
            <div className="bg-amber-400 h-full rounded-full w-[24%]"></div>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-slate-400">DNS socket buffer throttle</span>
            <button
              onClick={() => setActiveTab('repairs')}
              className="text-amber-400 hover:underline font-bold"
            >
              Inspect
            </button>
          </div>
        </div>

        {/* Card 3: Repairs Applied */}
        <div className="p-4 rounded-xl bg-[#0e121c] border border-white/[0.07] hover:border-emerald-500/30 transition-all space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">
              REPAIRS APPLIED
            </span>
            <span className="text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/30 text-[10px]">
              TODAY
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-400 font-mono">142</span>
            <span className="text-xs text-slate-400">Fixes Executed</span>
          </div>
          <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-400 h-full rounded-full w-[100%] shadow-[0_0_8px_#34d399]"></div>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span className="text-emerald-400 font-semibold">100% automated</span>
            <span>0 human escalations</span>
          </div>
        </div>

        {/* Card 4: Network Ingress / RPS */}
        <div className="p-4 rounded-xl bg-[#0e121c] border border-white/[0.07] hover:border-cyan-500/30 transition-all space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">
              NET THROUGHPUT / I/O
            </span>
            <span className="text-cyan-400 font-bold px-1.5 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/30 text-[10px]">
              {telemetry.netTxMbps + telemetry.netRxMbps} Mb/s
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-cyan-400 font-mono">156K</span>
            <span className="text-xs text-slate-400">Active Packets</span>
          </div>
          {/* Mini Sparkline Bars */}
          <div className="flex items-end gap-1 h-3 pt-1">
            {[4, 6, 8, 12, 10, 7, 9, 14, 11, 15, 13, 16].map((val, i) => (
              <div
                key={i}
                style={{ height: `${(val / 16) * 100}%` }}
                className={`flex-1 rounded-xs ${
                  i > 8 ? 'bg-emerald-400' : 'bg-cyan-400/60'
                }`}
              ></div>
            ))}
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>p99 Latency: {telemetry.netLatencyMs}ms</span>
            <span className="text-emerald-400 font-semibold">Edge Synced</span>
          </div>
        </div>
      </div>

      {/* Middle Row: Hardware Matrix & AI Copilot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Columns: Hardware & Virtualization Matrix */}
        <div className="lg:col-span-7 p-5 rounded-xl bg-[#0e121c] border border-white/[0.07] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
                SYSTEM HARDWARE & VIRTUALIZATION MATRIX
              </h3>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Real-time consumption across 16 core hardware channels
              </p>
            </div>
            <button
              onClick={() => setActiveTab('diagnostics')}
              className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>View Full Telemetry</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* 4 Hardware Mini Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* CPU */}
            <div className="p-3 rounded-lg bg-[#131826] border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  <span>CPU POOL</span>
                </span>
                <span className="font-bold text-white">{telemetry.cpuUsage}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
                <div
                  style={{ width: `${telemetry.cpuUsage}%` }}
                  className="bg-cyan-400 h-full rounded-full"
                ></div>
              </div>
              <div className="text-[9px] text-slate-400 font-mono">
                {telemetry.cpuCores} Cores • {telemetry.cpuFrequency}
              </div>
            </div>

            {/* RAM */}
            <div className="p-3 rounded-lg bg-[#131826] border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="flex items-center gap-1.5 text-indigo-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                  <span>RAM USAGE</span>
                </span>
                <span className="font-bold text-white">{telemetry.ramUsagePercent}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
                <div
                  style={{ width: `${telemetry.ramUsagePercent}%` }}
                  className="bg-indigo-400 h-full rounded-full"
                ></div>
              </div>
              <div className="text-[9px] text-slate-400 font-mono">
                {telemetry.ramUsedGB} GB / {telemetry.ramTotalGB} GB
              </div>
            </div>

            {/* NVME SSD */}
            <div className="p-3 rounded-lg bg-[#131826] border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>NVME SSD</span>
                </span>
                <span className="font-bold text-white">{telemetry.diskUsagePercent}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
                <div
                  style={{ width: `${telemetry.diskUsagePercent}%` }}
                  className="bg-emerald-400 h-full rounded-full"
                ></div>
              </div>
              <div className="text-[9px] text-slate-400 font-mono">
                {telemetry.diskUsedGB} GB / {telemetry.diskTotalGB} GB • {telemetry.diskHealth}
              </div>
            </div>

            {/* NET I/O */}
            <div className="p-3 rounded-lg bg-[#131826] border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="flex items-center gap-1.5 text-amber-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  <span>NET I/O</span>
                </span>
                <span className="font-bold text-white">{telemetry.netRxMbps} Mb/s</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
                <div className="bg-amber-400 h-full rounded-full w-[45%]"></div>
              </div>
              <div className="text-[9px] text-slate-400 font-mono">
                TX: {telemetry.netTxMbps}M / RX: {telemetry.netRxMbps}M
              </div>
            </div>
          </div>

          {/* 60Hz Frequency Stream Waveform */}
          <div className="p-3 rounded-lg bg-[#07090e] border border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span>SYSTEM VITALS FREQUENCY: 60Hz Real-Time Stream</span>
            </div>
            {/* SVG Harmonic Sine Wave */}
            <svg className="w-48 h-6 text-cyan-400/80" viewBox="0 0 200 24" fill="none">
              <path
                d="M0 12 Q25 0 50 12 T100 12 T150 12 T200 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Right 5 Columns: AI Diagnostics Copilot */}
        <div className="lg:col-span-5 p-5 rounded-xl bg-[#0e121c] border border-white/[0.07] flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
                    ASHTECH DIAGNOSTICS COPILOT
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">
                    ● Connected: Local Heuristic Diagnostics
                  </p>
                </div>
              </div>
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-500/30">
                PRO AI
              </span>
            </div>

            {/* Autonomous Audit Summary */}
            <div className="mt-3 p-3 rounded-lg bg-[#131826] border border-white/[0.06] space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase font-bold">
                <span>AUTONOMOUS AUDIT SUMMARY</span>
                <span className="text-slate-500 font-normal">Just now</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Greetings, Systems Engineer. All zero-trust boundaries are compliant. I detected an 8% socket anomaly on the DNS gateway, but automated rate-limiting handled the spike without dropping packets.
              </p>
            </div>

            {/* Recommended Action Card */}
            <div className="mt-3 p-3 rounded-lg bg-[#161c2e] border border-cyan-500/20 space-y-2">
              <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                RECOMMENDED ACTION:
              </div>
              <p className="text-xs text-slate-300">
                Prune 14 idle temp keys and flush DNS cache to recover ~1.4 GB disk memory.
              </p>
              <button
                onClick={() =>
                  onTriggerAction(
                    'Prune Temp Files & Flush DNS',
                    'OneClickSuperRepair.ps1 -PruneTemp',
                    false
                  )
                }
                className="w-full py-1.5 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-semibold transition-all text-center"
              >
                Approve Suggested Flush
              </button>
            </div>
          </div>

          {/* Interactive Copilot Input */}
          <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
            <input
              type="text"
              value={copilotInput}
              onChange={(e) => setCopilotInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCopilotSend()}
              placeholder="Ask Copilot: e.g., 'Analyze disk fragmentation'..."
              className="flex-1 bg-[#090c13] border border-white/[0.1] rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-cyan-500/50 font-mono"
            />
            <button
              onClick={handleCopilotSend}
              className="p-1.5 rounded-lg bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-all font-bold"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section: Real-Time Security & System Audit Trail */}
      <div className="p-5 rounded-xl bg-[#0e121c] border border-white/[0.07] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
              REAL-TIME SECURITY & SYSTEM AUDIT TRAIL
            </h3>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Continuous stream of authenticated API actions & zero-trust loopback validations
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onTriggerAction('Export Audit Logs', 'ToolkitReportCenter.ps1 -ExportLogs')}
              className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/10 font-mono text-xs flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3 h-3 text-slate-400" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/10 font-mono text-xs flex items-center gap-1.5 transition-all"
            >
              <Filter className="w-3 h-3 text-slate-400" />
              <span>Filters (0)</span>
            </button>
          </div>
        </div>

        {/* Audit Table */}
        <div className="overflow-x-auto rounded-lg border border-white/[0.06]">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-[#090c13] text-slate-400 border-b border-white/[0.08] text-[11px]">
                <th className="py-2.5 px-4 font-bold tracking-wider">TIMESTAMP (UTC)</th>
                <th className="py-2.5 px-4 font-bold tracking-wider">PRINCIPAL ACTOR</th>
                <th className="py-2.5 px-4 font-bold tracking-wider">MODULE / SCOPE</th>
                <th className="py-2.5 px-4 font-bold tracking-wider">ACTION / EVENT</th>
                <th className="py-2.5 px-4 font-bold tracking-wider">TARGET IP</th>
                <th className="py-2.5 px-4 font-bold tracking-wider text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-slate-300">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-2.5 px-4 text-slate-400">{log.timestamp}</td>
                  <td className="py-2.5 px-4 font-semibold text-slate-200">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                      <span>{log.actor}</span>
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-400">{log.scope}</td>
                  <td className="py-2.5 px-4 font-mono text-slate-300">{log.event}</td>
                  <td className="py-2.5 px-4 text-slate-400">{log.target}</td>
                  <td className="py-2.5 px-4 text-right">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        log.status === 'SUCCESS'
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                          : log.status === 'AUTH OK'
                          ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-500/30'
                          : log.status === 'WARN'
                          ? 'bg-amber-950/60 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-950/60 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
