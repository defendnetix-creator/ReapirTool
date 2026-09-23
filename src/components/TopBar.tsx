import React, { useState, useEffect } from 'react';
import {
  Search,
  Bell,
  Clock,
  Shield,
  Layers,
  Sparkles,
  Key,
  CheckCircle,
  AlertTriangle,
  WifiOff
} from 'lucide-react';
import { TabType, HardwareTelemetry } from '../types';
import { LicenseClientState } from '../licensing/types';

interface TopBarProps {
  activeTab: TabType;
  telemetry: HardwareTelemetry;
  licenseState: LicenseClientState;
  onOpenSearch: () => void;
  onOpenSubscription: () => void;
  unreadCount?: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  telemetry,
  licenseState,
  onOpenSearch,
  onOpenSubscription,
  unreadCount = 2
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const minutes = String(now.getUTCMinutes()).padStart(2, '0');
      const seconds = String(now.getUTCSeconds()).padStart(2, '0');
      setCurrentTime(`UTC ${hours}:${minutes}:${seconds}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getBreadcrumbTitle = (tab: TabType) => {
    switch (tab) {
      case 'dashboard':
        return 'Executive Console';
      case 'diagnostics':
        return 'System Diagnostics';
      case 'repairs':
        return 'Autonomous Fix Engine';
      case 'performance':
        return 'Real-Time Telemetry';
      case 'network':
        return 'Network & Connectivity';
      case 'software':
        return 'Software & Packages';
      case 'security':
        return 'Security & Defender';
      case 'ai-copilot':
        return 'AI Diagnostic Copilot';
      case 'reports':
        return 'Reports & Audit Logs';
      case 'subscription':
        return 'License & Device Fleet';
      case 'settings':
        return 'Settings & Privacy';
      default:
        return 'Console';
    }
  };

  const renderLicensePill = () => {
    const { status, plan, daysRemaining, offlineGraceRemainingDays } = licenseState;
    const planName = plan?.displayName || 'Pro';

    if (status === 'ACTIVE') {
      return (
        <button
          onClick={onOpenSubscription}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950/50 border border-emerald-500/40 hover:border-emerald-400 text-emerald-300 text-[11px] font-mono font-semibold transition-all shadow-[0_0_10px_rgba(16,185,129,0.15)] group"
          title="Active Commercial License — Click to manage"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 group-hover:scale-110 transition-transform"></span>
          <span>{planName} • Active</span>
        </button>
      );
    }

    if (status === 'EXPIRING_SOON') {
      return (
        <button
          onClick={onOpenSubscription}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-950/60 border border-amber-500/50 hover:border-amber-400 text-amber-300 text-[11px] font-mono font-semibold transition-all shadow-[0_0_10px_rgba(245,158,11,0.2)] animate-pulse"
          title={`Expiring in ${daysRemaining} days — Click to renew`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>{planName} • {daysRemaining}d left</span>
        </button>
      );
    }

    if (status === 'OFFLINE_GRACE') {
      return (
        <button
          onClick={onOpenSubscription}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-950/60 border border-blue-500/50 hover:border-blue-400 text-blue-300 text-[11px] font-mono font-semibold transition-all"
          title={`Offline License: ${offlineGraceRemainingDays} days remaining in grace window`}
        >
          <WifiOff className="w-3.5 h-3.5 text-blue-400" />
          <span>Offline • {offlineGraceRemainingDays}d left</span>
        </button>
      );
    }

    // EXPIRED, REVOKED, SUSPENDED, INVALID
    return (
      <button
        onClick={onOpenSubscription}
        className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-950/60 border border-rose-500/50 hover:border-rose-400 text-rose-300 text-[11px] font-mono font-semibold transition-all shadow-[0_0_10px_rgba(244,63,94,0.25)]"
        title="Restricted / Unlicensed — Click to activate"
      >
        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
        <span>
          {status === 'EXPIRED'
            ? 'Expired • Restricted'
            : status === 'REVOKED'
            ? 'Revoked'
            : status === 'DEVICE_LIMIT_REACHED'
            ? 'Seat Limit Reached'
            : 'Unlicensed'}
        </span>
      </button>
    );
  };

  return (
    <header className="h-14 bg-[#090c13] border-b border-white/[0.08] px-5 flex items-center justify-between shrink-0 select-none z-10">
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-mono">
        <span className="text-slate-400 hover:text-slate-200 cursor-pointer">
          Local Host
        </span>
        <span className="text-slate-600">/</span>
        <span className="text-slate-400">
          {telemetry.hostname || 'workstation-01'}
        </span>
        <span className="text-slate-600">/</span>
        <div className="px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 font-semibold shadow-[0_0_8px_rgba(6,182,212,0.15)]">
          {getBreadcrumbTitle(activeTab)}
        </div>
      </div>

      {/* Middle: Global Search Input */}
      <div className="flex-1 max-w-md mx-6">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#0e121c] border border-white/[0.08] hover:border-cyan-500/40 text-slate-400 hover:text-slate-200 text-xs transition-all group shadow-inner"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
            <span className="font-mono text-[11px] text-slate-400">
              Search diagnostics, repairs, modules...
            </span>
          </div>
          <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800/80 border border-white/10 text-slate-400 font-bold">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right: Telemetry & Controls */}
      <div className="flex items-center gap-3">
        {/* Loopback Bridge Status Pill */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 text-[11px] font-mono font-bold">
          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4] animate-pulse"></span>
          <span className="hidden sm:inline">Bridge: 127.0.0.1:9999</span>
        </div>

        {/* Live Clock */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0e121c] border border-white/[0.06] text-slate-400 text-[11px] font-mono">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>{currentTime || 'UTC 00:00:00'}</span>
        </div>

        {/* Dynamic Commercial License Status Pill */}
        {renderLicensePill()}
      </div>
    </header>
  );
};
