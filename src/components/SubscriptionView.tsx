import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ShieldCheck,
  CheckCircle2,
  Key,
  Laptop,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  Clock,
  WifiOff,
  Trash2,
  Sparkles,
  Users,
  Check,
  Layers,
  Lock,
  ChevronRight
} from 'lucide-react';
import { LicenseClientState } from '../licensing/types';
import { licenseClient } from '../licensing/licenseClient';
import { ENTITLEMENT_CATALOG } from '../licensing/entitlements';

interface SubscriptionViewProps {
  licenseState: LicenseClientState;
  onOpenActivation: () => void;
  onOpenCheckout?: (planId?: string) => void;
  onTriggerAction: (actionId: string, payload?: any) => void;
}

export const SubscriptionView: React.FC<SubscriptionViewProps> = ({
  licenseState,
  onOpenActivation,
  onOpenCheckout,
  onTriggerAction
}) => {
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'devices' | 'entitlements' | 'plans'>('overview');
  const [selectedEntitlementCategory, setSelectedEntitlementCategory] = useState<string>('All');

  const {
    status,
    plan,
    maskedKey,
    customerName,
    customerEmail,
    organization,
    expiryDate,
    daysRemaining,
    offlineGraceRemainingDays,
    activeDevices,
    maxDevices,
    currentDeviceId
  } = licenseState;

  const handleSimulateRenewal = async () => {
    setIsActionLoading(true);
    await licenseClient.simulateRenewal(365);
    setIsActionLoading(false);
    onTriggerAction('audit.log', {
      action: 'Simulate Subscription Renewal',
      status: 'SUCCESS',
      details: 'Extended subscription term by +365 days.'
    });
  };

  const handleSimulateRevocation = async (revoke: boolean) => {
    setIsActionLoading(true);
    await licenseClient.simulateRevocation(revoke);
    setIsActionLoading(false);
    onTriggerAction('audit.log', {
      action: revoke ? 'Simulate License Revocation' : 'Restore License',
      status: 'SUCCESS',
      details: revoke ? 'License marked as REVOKED.' : 'License marked as ACTIVE.'
    });
  };

  const handleDeactivateDevice = async (deviceId: string, name: string) => {
    if (!confirm(`Are you sure you want to deactivate seat for "${name}"?`)) return;
    setIsActionLoading(true);
    const res = await licenseClient.deactivateDevice(deviceId);
    setIsActionLoading(false);
    onTriggerAction('audit.log', {
      action: 'Deactivate Workstation Seat',
      status: res.success ? 'SUCCESS' : 'FAILED',
      details: `Device ID: ${deviceId}`
    });
  };

  const handleDeactivateCurrentPC = async () => {
    if (!currentDeviceId) return;
    if (!confirm('Deactivate this workstation? Pro tools will lock until re-activated with a valid license key.')) return;
    setIsActionLoading(true);
    await licenseClient.deactivateDevice(currentDeviceId);
    setIsActionLoading(false);
  };

  const categories = ['All', 'Diagnostics', 'Repairs', 'Performance', 'Software', 'Network', 'Security', 'AI', 'Reports', 'Technician', 'Enterprise'];
  const filteredEntitlements = selectedEntitlementCategory === 'All'
    ? ENTITLEMENT_CATALOG
    : ENTITLEMENT_CATALOG.filter((e) => e.category === selectedEntitlementCategory);

  const grantedEntitlements = licenseState.token?.payload?.entitlements || licenseState.plan?.entitlements || [];

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-white">
              Commercial License & Device Fleet
            </h1>
            <span
              className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                status === 'ACTIVE'
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                  : status === 'EXPIRING_SOON'
                  ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                  : status === 'OFFLINE_GRACE'
                  ? 'bg-blue-950/60 text-blue-300 border-blue-500/40'
                  : 'bg-rose-950/60 text-rose-300 border-rose-500/40'
              }`}
            >
              {status === 'ACTIVE'
                ? 'ACTIVE SUBSCRIPTION'
                : status === 'EXPIRING_SOON'
                ? `EXPIRING SOON (${daysRemaining}d)`
                : status === 'OFFLINE_GRACE'
                ? `OFFLINE GRACE (${offlineGraceRemainingDays}d left)`
                : status}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Authoritative cloud licensing, cryptographic token verification, and multi-seat workstation allocation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => licenseClient.refreshLicenseStatus()}
            disabled={isActionLoading}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-medium text-slate-300 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isActionLoading ? 'animate-spin' : ''}`} />
            <span>Verify Server</span>
          </button>
          {onOpenCheckout && (
            <button
              onClick={() => onOpenCheckout(plan?.planId || 'professional')}
              className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{status === 'ACTIVE' ? 'Renew / Upgrade' : 'Buy Commercial Plan'}</span>
            </button>
          )}
          <button
            onClick={onOpenActivation}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-xs rounded-xl transition-all"
          >
            <Key className="w-3.5 h-3.5" />
            <span>Enter License Key</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-1 text-xs">
        {[
          { id: 'overview', label: 'Subscription Overview' },
          { id: 'devices', label: `Registered Devices (${activeDevices.length}/${maxDevices})` },
          { id: 'entitlements', label: 'Feature Entitlements Matrix' },
          { id: 'plans', label: 'Available Plan Tiers' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 font-medium rounded-t-lg transition-colors relative ${
              activeTab === tab.id
                ? 'text-cyan-400 bg-cyan-950/30 border-b-2 border-cyan-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Bento Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Active Tier Card */}
            <div className="p-5 rounded-2xl bg-[#0e121c] border border-cyan-500/30 space-y-4 shadow-[0_0_25px_rgba(6,182,212,0.08)]">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  ACTIVE TIER
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 font-bold">
                  {status}
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-black text-white">{plan?.displayName || 'Professional'}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{plan?.description || 'Commercial workstation toolkit.'}</p>
              </div>

              <div className="space-y-2.5 pt-3 border-t border-white/[0.06] text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Licensed Account:</span>
                  <span className="text-slate-200 font-medium">{customerName || 'John Miller'}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Email:</span>
                  <span className="text-slate-300">{customerEmail || 'john.miller@quantumreach.com'}</span>
                </div>
                {organization && (
                  <div className="flex justify-between text-slate-400">
                    <span>Organization:</span>
                    <span className="text-slate-200">{organization}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>License Key:</span>
                  <span className="text-cyan-300 font-bold">{maskedKey || 'ASHT-PRO-7K2D-****'}</span>
                </div>
              </div>
            </div>

            {/* Allocation & Term Metrics */}
            <div className="p-5 rounded-2xl bg-[#0e121c] border border-white/[0.08] space-y-4">
              <span className="font-mono text-xs font-bold text-slate-400 uppercase tracking-wider">
                SEAT ALLOCATION & DATES
              </span>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[11px] text-slate-400 font-mono">Active Seats</div>
                  <div className="text-xl font-bold text-white mt-1">
                    {activeDevices.length} <span className="text-slate-500 text-sm">/ {maxDevices}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-cyan-400 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, (activeDevices.length / maxDevices) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[11px] text-slate-400 font-mono">Days Remaining</div>
                  <div className="text-xl font-bold text-emerald-400 mt-1">
                    {daysRemaining !== undefined ? daysRemaining : 280}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-2">
                    Term: 365 days (Annual)
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-1 border-t border-white/[0.06] text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Expiration Date:</span>
                  <span className="text-slate-200 font-medium">
                    {expiryDate ? new Date(expiryDate).toLocaleDateString() : '2027-06-25'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Offline Grace Window:</span>
                  <span className="text-indigo-300 font-medium">{plan?.offlineGracePeriodDays || 7} Days</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Token Authority:</span>
                  <span className="text-emerald-400 font-medium">RSA-2048 Asymmetric</span>
                </div>
              </div>
            </div>

            {/* Security & Cryptography Guarantee */}
            <div className="p-5 rounded-2xl bg-[#0e121c] border border-white/[0.08] space-y-4">
              <span className="font-mono text-xs font-bold text-slate-400 uppercase tracking-wider">
                SECURITY ARCHITECTURE
              </span>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Server Authoritative:</strong> Windows client never holds private signing key.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Anti-Clock Tamper:</strong> Monotonic time tracking guards against local date rollback.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Laptop className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Privacy Fingerprint:</strong> Zero PII hardware hash.
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-500">Current Workstation ID:</span>
                <span className="text-[11px] font-mono text-cyan-300">
                  {currentDeviceId ? currentDeviceId.substring(0, 16) + '...' : 'WIN11-LOCAL'}
                </span>
              </div>
            </div>
          </div>

          {/* Developer / QA Simulator Control Bar */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold text-slate-200">
                  Licensing Simulation & QA Controls (Live Protocol Verification)
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                QA BENCH
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Test real-time state changes on the authoritative backend without external payment gateways.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={handleSimulateRenewal}
                disabled={isActionLoading}
                className="px-3.5 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 rounded-lg text-xs font-medium transition-colors"
              >
                Simulate Renewal (+1 Year)
              </button>
              <button
                onClick={() => handleSimulateRevocation(status !== 'REVOKED')}
                disabled={isActionLoading}
                className="px-3.5 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 rounded-lg text-xs font-medium transition-colors"
              >
                {status === 'REVOKED' ? 'Restore License' : 'Simulate Key Revocation'}
              </button>
              <button
                onClick={handleDeactivateCurrentPC}
                disabled={isActionLoading || !currentDeviceId}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
              >
                Deactivate This Workstation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Registered Devices */}
      {activeTab === 'devices' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-400">
              Showing active workstations activated against license key{' '}
              <span className="text-cyan-300 font-mono font-semibold">{maskedKey}</span>.
            </div>
            <div className="text-xs font-mono text-slate-400">
              Seat Usage:{' '}
              <strong className="text-emerald-400">
                {activeDevices.length} / {maxDevices} Seats
              </strong>
            </div>
          </div>

          <div className="rounded-2xl bg-[#0e121c] border border-white/[0.08] overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/60 border-b border-white/[0.08] text-slate-400 font-mono">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Workstation Name</th>
                  <th className="px-5 py-3.5 font-semibold">Operating System</th>
                  <th className="px-5 py-3.5 font-semibold">Toolkit Version</th>
                  <th className="px-5 py-3.5 font-semibold">Activated On</th>
                  <th className="px-5 py-3.5 font-semibold">Last Heartbeat</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {activeDevices.map((dev) => {
                  const isCurrent = dev.deviceId === currentDeviceId;
                  return (
                    <tr key={dev.deviceId} className={`hover:bg-slate-900/40 transition-colors ${isCurrent ? 'bg-cyan-950/20' : ''}`}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <Laptop className={`w-4 h-4 ${isCurrent ? 'text-cyan-400' : 'text-slate-500'}`} />
                          <span className="font-semibold text-slate-200">{dev.deviceName}</span>
                          {isCurrent && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                              This PC
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-300 font-mono">{dev.osVersion}</td>
                      <td className="px-5 py-3.5 text-slate-400 font-mono">{dev.appVersion}</td>
                      <td className="px-5 py-3.5 text-slate-400 font-mono">
                        {new Date(dev.activatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5 text-slate-400 font-mono">
                        {new Date(dev.lastSeenAt).toLocaleTimeString()}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => handleDeactivateDevice(dev.deviceId, dev.deviceName)}
                          disabled={isActionLoading}
                          className="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[11px] font-mono transition-colors"
                        >
                          Deactivate Seat
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {activeDevices.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-slate-500 text-xs font-mono">
                      No active device seats registered. Click "Activate Workstation" to register.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Entitlements Matrix */}
      {activeTab === 'entitlements' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedEntitlementCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  selectedEntitlementCategory === cat
                    ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredEntitlements.map((ent) => {
              const isGranted = status === 'ACTIVE' || status === 'EXPIRING_SOON' || status === 'OFFLINE_GRACE'
                ? grantedEntitlements.includes(ent.key) || grantedEntitlements.includes('*')
                : ent.key === 'diagnostics.basic' || ent.key === 'reports.basic_html';

              return (
                <div
                  key={ent.key}
                  className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${
                    isGranted
                      ? 'bg-[#0e121c] border-emerald-500/20'
                      : 'bg-[#0a0c14] border-slate-800/60 opacity-60'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-200">{ent.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {ent.category}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-500/30">
                        Min: {ent.minTier}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{ent.description}</p>
                    <div className="text-[10px] font-mono text-slate-500">{ent.key}</div>
                  </div>

                  <div className="shrink-0 pt-0.5">
                    {isGranted ? (
                      <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400">
                        <Check className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="p-1 rounded-full bg-slate-800 text-slate-500">
                        <Lock className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Available Plan Tiers */}
      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              id: 'personal',
              name: 'Personal',
              price: '₹2,999 / year',
              seats: '1 PC Seat',
              grace: '7-Day Offline Grace',
              desc: 'Essential repair and diagnostics for home computing.',
              features: ['Standard Diagnostics', 'Basic Repair Engine', 'WinGet Package Manager', 'HTML Reports']
            },
            {
              id: 'professional',
              name: 'Professional',
              price: '₹5,999 / year',
              seats: '2 PC Seats',
              grace: '7-Day Offline Grace',
              desc: 'Power user & workstation grade with AI Copilot.',
              features: ['One-Click Super Repair', 'WMI & DISM Rebuilder', 'AI Diagnostic Copilot', 'Debloat Pro', 'SystemTwin Snapshot', 'JSON & CSV Export'],
              highlight: true
            },
            {
              id: 'technician',
              name: 'Technician',
              price: '₹14,999 / year',
              seats: '5 PC Seats',
              grace: '14-Day Offline Grace',
              desc: 'Field technician deployment with client reports.',
              features: ['Client Branded PDF Reports', '14-Day Offline Grace', 'Portable USB Mode', 'Printer Analyzer Pro', 'Standby RAM Purge', 'Port Scanner']
            },
            {
              id: 'business',
              name: 'Business & Fleet',
              price: '₹39,999 / year',
              seats: '25 PC Seats',
              grace: '14-Day Offline Grace',
              desc: 'Corporate & MSP fleet management.',
              features: ['Central Policy Sync', 'Fleet Telemetry', 'Unattended CLI Execution', 'Immutable Audit Logs', 'CIS Compliance Benchmark']
            }
          ].map((tier) => {
            const isCurrent = plan?.planId === tier.id;
            return (
              <div
                key={tier.id}
                className={`p-5 rounded-2xl border space-y-4 relative flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-[#0f172a] border-cyan-500/50 shadow-[0_0_25px_rgba(6,182,212,0.1)]'
                    : tier.highlight
                    ? 'bg-[#0e121c] border-indigo-500/30'
                    : 'bg-[#0a0d16] border-white/[0.06]'
                }`}
              >
                {isCurrent && (
                  <span className="absolute -top-3 right-4 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-500 text-slate-950">
                    CURRENT PLAN
                  </span>
                )}

                <div className="space-y-2">
                  <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                    {tier.name}
                  </div>
                  <div className="text-2xl font-black text-white">{tier.price}</div>
                  <div className="flex items-center gap-2 text-xs font-mono text-cyan-300">
                    <span>{tier.seats}</span>
                    <span>•</span>
                    <span>{tier.grace}</span>
                  </div>
                  <p className="text-xs text-slate-400">{tier.desc}</p>
                </div>

                <div className="space-y-2 pt-3 border-t border-white/[0.06] text-xs">
                  {tier.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-2 text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    onClick={() => (onOpenCheckout ? onOpenCheckout(tier.id) : onOpenActivation())}
                    className={`w-full py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                      tier.highlight || isCurrent
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-md shadow-cyan-500/20'
                        : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>{isCurrent ? 'Renew Subscription' : 'Buy Now'}</span>
                  </button>

                  <button
                    onClick={onOpenActivation}
                    className="w-full text-center text-[11px] font-mono text-slate-400 hover:text-cyan-300 transition-colors"
                  >
                    Have a license key? Activate
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
