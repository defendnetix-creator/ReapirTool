import React from 'react';
import {
  LayoutDashboard,
  Cpu,
  Wrench,
  Gauge,
  Network,
  PackageCheck,
  ShieldCheck,
  Bot,
  FileSpreadsheet,
  CreditCard,
  Settings,
  Terminal,
  Activity,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { TabType, HardwareTelemetry } from '../types';
import { BRAND } from '../config/brand';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  telemetry: HardwareTelemetry;
  unreadCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  telemetry,
  unreadCount = 2
}) => {
  const navSections = [
    {
      group: 'TELEMETRY & WORKSPACES',
      items: [
        {
          id: 'dashboard' as TabType,
          label: 'Executive Dashboard',
          icon: LayoutDashboard,
          indicator: 'dot'
        },
        {
          id: 'diagnostics' as TabType,
          label: 'System Diagnostics',
          icon: Cpu,
          badge: '28'
        },
        {
          id: 'performance' as TabType,
          label: 'Performance Suite',
          icon: Gauge,
          badge: 'OPTIMIZE'
        }
      ]
    },
    {
      group: 'GOVERNANCE & REPAIR',
      items: [
        {
          id: 'repairs' as TabType,
          label: 'Autonomous Fix Engine',
          icon: Wrench,
          pill: 'ACTIVE'
        },
        {
          id: 'command-vault' as TabType,
          label: 'Command Vault',
          icon: Terminal,
          pill: 'VAULT'
        },
        {
          id: 'security' as TabType,
          label: 'Security & Defender',
          icon: ShieldCheck,
          indicator: 'dot-green'
        },
        {
          id: 'network' as TabType,
          label: 'Network & Connectivity',
          icon: Network
        },
        {
          id: 'software' as TabType,
          label: 'Software & Packages',
          icon: PackageCheck
        }
      ]
    },
    {
      group: 'INTELLIGENCE & AUDIT',
      items: [
        {
          id: 'ai-copilot' as TabType,
          label: 'AI Diagnostic Copilot',
          icon: Bot,
          pill: 'LOCAL AI'
        },
        {
          id: 'reports' as TabType,
          label: 'Reports & Audit Logs',
          icon: FileSpreadsheet
        }
      ]
    },
    {
      group: 'MANAGEMENT',
      items: [
        {
          id: 'subscription' as TabType,
          label: 'License & Subscription',
          icon: CreditCard,
          pill: 'PRO TIER'
        },
        {
          id: 'settings' as TabType,
          label: 'Settings & Privacy',
          icon: Settings
        }
      ]
    }
  ];

  return (
    <aside className="w-64 bg-[#090c13] border-r border-white/[0.08] flex flex-col h-screen shrink-0 select-none z-20">
      {/* Brand Header */}
      <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-black shadow-[0_0_12px_rgba(6,182,212,0.15)]">
            <Terminal className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-extrabold text-sm tracking-wider text-white">
                AKSHIGO
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-500/30">
                v8.0
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono tracking-tight">
              Enterprise PC Suite
            </p>
          </div>
        </div>
      </div>

      {/* Target Node Profile Card */}
      <div className="px-3 pt-3">
        <div className="p-2.5 rounded-lg bg-[#0e131f] border border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-xs font-mono">
              PC
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-200 tracking-tight">
                  {telemetry.hostname || 'WORKSTATION-01'}
                </span>
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-emerald-950/50 text-emerald-400 border border-emerald-500/30 font-bold">
                  LIVE
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono">
                ID: #PC-8841 • {telemetry.osVersion || 'Win 11 Pro'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <div className="px-3 text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">
              {section.group}
            </div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-cyan-950/40 text-cyan-300 border border-cyan-500/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive
                          ? 'text-cyan-400'
                          : 'text-slate-500 group-hover:text-slate-300'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {/* Indicators / Badges */}
                  {item.indicator === 'dot' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]"></span>
                  )}
                  {item.indicator === 'dot-green' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]"></span>
                  )}
                  {item.badge && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-semibold">
                      {item.badge}
                    </span>
                  )}
                  {item.pill && (
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                        item.pill === 'ACTIVE'
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                          : item.pill === 'LOCAL AI'
                          ? 'bg-purple-950/60 text-purple-400 border border-purple-500/30'
                          : 'bg-indigo-950/60 text-indigo-400 border border-indigo-500/30'
                      }`}
                    >
                      {item.pill}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer System SLA & User Profile */}
      <div className="p-3 border-t border-white/[0.08] space-y-2 bg-[#07090e]">
        <div className="flex items-center justify-between text-[10px] font-mono px-2 py-1.5 rounded bg-black/40 border border-white/[0.04]">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-subtle"></span>
            <span>Loopback SLA: 99.98%</span>
          </div>
          <span className="text-slate-500">{telemetry.netLatencyMs}ms</span>
        </div>

        <div className="p-2 rounded-md bg-[#0e121c] border border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-slate-800 border border-white/10 flex items-center justify-center text-slate-300 font-bold text-[10px] font-mono">
              AD
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-200">
                Administrator
              </div>
              <div className="text-[9px] text-slate-500 font-mono">
                Elevated Privileges
              </div>
            </div>
          </div>
          <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/50 px-1.5 py-0.5 rounded border border-cyan-500/30">
            PRO
          </span>
        </div>
      </div>
    </aside>
  );
};
