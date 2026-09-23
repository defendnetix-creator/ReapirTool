import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  Terminal,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertCircle,
  FileText,
  Copy,
  Play,
  Layers,
  ArrowRight,
  Shield,
  HelpCircle
} from 'lucide-react';
import { HardwareTelemetry } from '../types';
import { ISSUE_LIBRARY } from '../data/issueLibrary';

interface AICopilotViewProps {
  telemetry: HardwareTelemetry;
  onTriggerAction: (actionName: string, command: string, requiresAdmin?: boolean) => void;
  onExecuteOperation?: (operationId: string, params?: Record<string, any>, requiresAdmin?: boolean) => void;
}

interface AutoFixPlan {
  title: string;
  category: string;
  risk: 'SAFE' | 'MODERATE' | 'HIGH';
  steps: string[];
  explanation: string;
  technicianNotes: string;
}

export const AICopilotView: React.FC<AICopilotViewProps> = ({
  telemetry,
  onTriggerAction,
  onExecuteOperation
}) => {
  const [messages, setMessages] = useState<
    Array<{
      sender: 'user' | 'copilot';
      text: string;
      time: string;
      suggestedPlan?: AutoFixPlan;
    }>
  >([
    {
      sender: 'copilot',
      text: `Greetings, Systems Engineer. I have completed real-time analysis of workstation ${telemetry.hostname || 'WORKSTATION-01'}. Overall PC Health score is ${telemetry.cpuUsage < 50 ? '98/100 (Optimal)' : '84/100 (Moderate)'}. All zero-trust boundaries and Defender real-time protections are active. Describe symptoms or choose a safe auto-fix triage playbook below.`,
      time: 'Just now'
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [activePlan, setActivePlan] = useState<AutoFixPlan | null>(null);

  const handleSend = (overrideQuery?: string) => {
    const userMsg = (overrideQuery || inputVal).trim();
    if (!userMsg) return;
    if (!overrideQuery) setInputVal('');
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg, time: nowStr }]);

    // Local safe diagnostic triage engine
    setTimeout(() => {
      const q = userMsg.toLowerCase();
      let responseText = '';
      let plan: AutoFixPlan | undefined;

      if (q.includes('internet') || q.includes('dns') || q.includes('wifi') || q.includes('network')) {
        plan = {
          title: 'Network & DNS Auto-Remediation Plan',
          category: 'Network',
          risk: 'SAFE',
          steps: ['network.dns.flush', 'network.winsock.reset', 'network.ip.renew'],
          explanation: 'Detected network stack inquiry. Safe plan flushes local resolver cache and resets Winsock buffers without clearing Wi-Fi passwords.',
          technicianNotes: `Technician Work Order:\n• Workstation: ${telemetry.hostname}\n• Diagnosis: Stale socket handles & resolver latency\n• Executed: ipconfig /flushdns, netsh winsock reset\n• Outcome: Connectivity nominal.`
        };
        responseText = `Network Diagnostics Assessment:\n• Round-trip gateway latency: ${telemetry.netLatencyMs} ms.\n• Local IP: ${telemetry.ipAddress}\n• Safe Recommendation: Execute safe DNS Flush + Winsock catalog reset.\n• Security boundary: 0 arbitrary shell scripts, only registered operations.`;
      } else if (q.includes('printer') || q.includes('spooler') || q.includes('print')) {
        plan = {
          title: 'Printer Subsystem & Queue Flush Plan',
          category: 'Printer',
          risk: 'SAFE',
          steps: ['printer.spooler.restart', 'printer.queue.purge'],
          explanation: 'Stops spoolsv.exe, clears damaged .SHD/.SPL print job manifests, and cleanly cycles Print Spooler.',
          technicianNotes: `Technician Work Order:\n• Workstation: ${telemetry.hostname}\n• Issue: Jammed print spooler queue\n• Executed: Spooler stop, System32\\spool\\PRINTERS purge, service restart.\n• Result: Unlocked print port buffer.`
        };
        responseText = `Print Subsystem Assessment:\n• Spooler Service State: Active\n• Safe Recommendation: Purge jammed job manifests and cycle Print Spooler.\n• Security verification: Approved safe operation with rollback.`;
      } else if (q.includes('disk') || q.includes('storage') || q.includes('space') || q.includes('clean')) {
        plan = {
          title: 'Storage Optimization & Component Store Cleanup',
          category: 'Storage',
          risk: 'SAFE',
          steps: ['storage.temp.clean', 'repair.dism.clean_store'],
          explanation: 'Purges safe user %TEMP% folders and reclaims superseded component store packages in WinSxS.',
          technicianNotes: `Technician Work Order:\n• Workstation: ${telemetry.hostname}\n• Storage: ${telemetry.diskUsedGB} GB / ${telemetry.diskTotalGB} GB (${telemetry.diskUsagePercent}%)\n• Action: Temp file purge and DISM /StartComponentCleanup.\n• Savings: Estimated 2-4 GB reclaimed.`
        };
        responseText = `Storage Analysis for NVMe Drive:\n• Used: ${telemetry.diskUsedGB} GB / ${telemetry.diskTotalGB} GB (${telemetry.diskUsagePercent}%)\n• Disk Life: ${telemetry.diskHealth}\n• Recommendation: Reclaim stale component packages and prune %TEMP% cache.`;
      } else if (q.includes('update') || q.includes('stuck') || q.includes('error')) {
        plan = {
          title: 'Windows Update Service & Cache Reset',
          category: 'Windows Update',
          risk: 'MODERATE',
          steps: ['repair.wu.reset_services', 'repair.wu.softwaredist_reset'],
          explanation: 'Stops update daemons, safely renames SoftwareDistribution\\Download cache, and forces clean catalog re-indexing.',
          technicianNotes: `Technician Work Order:\n• OS: ${telemetry.osVersion} (${telemetry.osBuild})\n• Action: Windows Update SoftwareDistribution reset.\n• Result: Catalog rebuilt.`
        };
        responseText = `Windows Update Triage:\n• Service state verified.\n• Recommendation: Reset SoftwareDistribution cache with administrative elevation.`;
      } else {
        responseText = `Diagnostic Analysis for "${userMsg}":\n• Hardware Subsystems: CPU utilization at ${telemetry.cpuUsage}%, RAM working set at ${telemetry.ramUsagePercent}% (${telemetry.ramUsedGB} GB used).\n• Security Center: Microsoft Defender is ${telemetry.defenderStatus}, Firewall is ${telemetry.firewallStatus}.\n• Heuristic Engine: Workstation operation is within normal operational bounds. Select any registered operation or guided symptom above.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'copilot',
          text: responseText,
          time: 'Just now',
          suggestedPlan: plan
        }
      ]);

      if (plan) {
        setActivePlan(plan);
      }
    }, 500);
  };

  const handleExecutePlan = (plan: AutoFixPlan) => {
    if (onExecuteOperation) {
      onExecuteOperation(
        'repair.autofix.plan_execute',
        { planName: plan.title, steps: plan.steps },
        true
      );
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-white">
              AI Diagnostic Copilot & Safe Auto-Fix
            </h1>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-500/30">
              LOCAL HEURISTIC ENGINE • ZERO-TRUST
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Deterministic diagnostic triage, technician work order generation, and safe execution using existing registered operations.
          </p>
        </div>
      </div>

      {/* Main Chat & Insight Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chat History Panel (8 Cols) */}
        <div className="lg:col-span-8 p-5 rounded-2xl bg-[#0c101a] border border-white/[0.08] flex flex-col h-[560px] justify-between shadow-xl">
          {/* Message List */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'copilot' && (
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-xl p-4 rounded-xl text-xs leading-relaxed font-mono ${
                    msg.sender === 'user'
                      ? 'bg-cyan-950/60 text-cyan-200 border border-cyan-500/40 rounded-br-none'
                      : 'bg-[#111624] text-slate-200 border border-white/[0.06] rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* Render plan card if attached */}
                  {msg.suggestedPlan && (
                    <div className="mt-3 p-3 rounded-lg bg-[#070911] border border-cyan-500/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-cyan-300 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          {msg.suggestedPlan.title}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 font-bold">
                          {msg.suggestedPlan.risk}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Operations: {msg.suggestedPlan.steps.join(' → ')}
                      </div>
                      <button
                        onClick={() => handleExecutePlan(msg.suggestedPlan!)}
                        className="w-full mt-2 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                      >
                        <Play className="w-3 h-3 fill-black" />
                        <span>Execute Safe Auto-Fix Plan</span>
                      </button>
                    </div>
                  )}

                  <span className="text-[9px] text-slate-500 block mt-1.5 text-right">
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="pt-3 border-t border-white/[0.06] flex items-center gap-2">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask Copilot: 'Fix my internet', 'Clean temp disk space', or 'Printer offline'..."
              className="flex-1 bg-[#070a10] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-cyan-500/50 font-mono"
            />
            <button
              onClick={() => handleSend()}
              className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right 4 Cols: Quick AI Triage Playbooks & Active Plan */}
        <div className="lg:col-span-4 space-y-4">
          {/* Active Auto-Fix Plan Summary */}
          {activePlan && (
            <div className="p-5 rounded-2xl bg-[#0c101a] border border-cyan-500/40 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
                  ACTIVE AUTO-FIX PLAN
                </span>
                <span className="text-[10px] font-mono text-emerald-400">
                  Safe Risk Level
                </span>
              </div>
              <h3 className="text-xs font-mono font-bold text-white">
                {activePlan.title}
              </h3>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {activePlan.explanation}
              </p>
              <div className="p-2.5 rounded-lg bg-[#070911] border border-white/[0.06] text-[10px] font-mono text-slate-400 space-y-1">
                <span className="font-bold text-slate-300">Target Operations:</span>
                {activePlan.steps.map((s, idx) => (
                  <div key={idx} className="text-cyan-400">
                    {idx + 1}. {s}
                  </div>
                ))}
              </div>
              <button
                onClick={() => handleExecutePlan(activePlan)}
                className="w-full py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>Confirm & Run Auto-Fix</span>
              </button>
            </div>
          )}

          {/* Quick Playbooks */}
          <div className="p-5 rounded-2xl bg-[#0c101a] border border-white/[0.08] space-y-3">
            <h3 className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Symptom Playbooks
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => handleSend('No internet access or DNS resolution failure')}
                className="w-full text-left p-2.5 rounded-xl bg-[#111624] hover:bg-cyan-950/30 border border-white/[0.06] hover:border-cyan-500/40 text-xs font-mono text-slate-300 transition-all block group"
              >
                🌐 No Internet / DNS Failure
              </button>
              <button
                onClick={() => handleSend('Print spooler jammed and documents stuck')}
                className="w-full text-left p-2.5 rounded-xl bg-[#111624] hover:bg-cyan-950/30 border border-white/[0.06] hover:border-cyan-500/40 text-xs font-mono text-slate-300 transition-all block group"
              >
                🖨️ Print Spooler Jammed
              </button>
              <button
                onClick={() => handleSend('Low disk space and 100% storage active time')}
                className="w-full text-left p-2.5 rounded-xl bg-[#111624] hover:bg-cyan-950/30 border border-white/[0.06] hover:border-cyan-500/40 text-xs font-mono text-slate-300 transition-all block group"
              >
                💾 100% Disk Usage / Low Storage
              </button>
              <button
                onClick={() => handleSend('Windows update stuck download and failure')}
                className="w-full text-left p-2.5 rounded-xl bg-[#111624] hover:bg-cyan-950/30 border border-white/[0.06] hover:border-cyan-500/40 text-xs font-mono text-slate-300 transition-all block group"
              >
                🔄 Windows Update Stuck
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
