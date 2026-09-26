import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { ExpiringBanner } from './components/ExpiringBanner';
import { ActivationModal } from './components/ActivationModal';
import { FeatureGateModal } from './components/FeatureGateModal';
import { RazorpayCheckoutModal } from './components/RazorpayCheckoutModal';
import { DashboardView } from './components/DashboardView';
import { DiagnosticsView } from './components/DiagnosticsView';
import { RepairsView } from './components/RepairsView';
import { PerformanceView } from './components/PerformanceView';
import { CommandVaultView } from './components/CommandVaultView';
import { NetworkView } from './components/NetworkView';
import { SoftwareView } from './components/SoftwareView';
import { SecurityView } from './components/SecurityView';
import { AICopilotView } from './components/AICopilotView';
import { ReportsView } from './components/ReportsView';
import { SubscriptionView } from './components/SubscriptionView';
import { SettingsView } from './components/SettingsView';
import { ConfirmationModal } from './components/ConfirmationModal';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { ToastContainer } from './components/ToastContainer';
import { OperationJobModal } from './components/OperationJobModal';
import { operationsClient, OperationJob } from './api/operationsClient';
import {
  TabType,
  HardwareTelemetry,
  AuditLogEntry,
  RepairToolItem,
  ToastMessage
} from './types';
import { licenseClient } from './licensing/licenseClient';
import { LicenseClientState } from './licensing/types';
import { hasEntitlement } from './licensing/entitlements';

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isActivationOpen, setIsActivationOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutPlanId, setCheckoutPlanId] = useState<string>('professional');
  const [gatingFeature, setGatingFeature] = useState<string | null>(null);
  const [pendingConfirmationItem, setPendingConfirmationItem] = useState<RepairToolItem | null>(null);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Licensing state
  const [licenseState, setLicenseState] = useState<LicenseClientState>(licenseClient.getState());

  useEffect(() => {
    const unsubscribe = licenseClient.subscribe((newState) => {
      setLicenseState(newState);
    });
    licenseClient.initialize();
    return () => unsubscribe();
  }, []);

  // Telemetry state
  const [telemetry, setTelemetry] = useState<HardwareTelemetry>({
    cpuUsage: 18.4,
    cpuModel: 'Intel Core i9-14900K 14th Gen',
    cpuCores: 24,
    cpuFrequency: '3.4 GHz (5.8 GHz Boost)',
    ramUsagePercent: 42.1,
    ramUsedGB: 13.5,
    ramTotalGB: 32.0,
    diskUsagePercent: 67.0,
    diskUsedGB: 1340,
    diskTotalGB: 2000,
    diskHealth: 'Healthy • 100% SMART Life',
    netRxMbps: 460,
    netTxMbps: 520,
    netLatencyMs: 12,
    batteryPercent: 94,
    batteryStatus: 'Good • AC Connected',
    osVersion: 'Windows 11 Pro 64-bit',
    osBuild: '26100.1742 (24H2)',
    uptime: '4d 18h 42m',
    hostname: 'DESKTOP-ASH8841',
    ipAddress: '192.168.1.144',
    macAddress: '00:1A:2B:3C:4D:5E',
    defenderStatus: 'Protected',
    firewallStatus: 'Active',
    lastScanTime: 'Today, 08:30 AM'
  });

  // Audit Logs state
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
    {
      id: 'log-lic-0',
      timestamp: '19:00:12.802',
      actor: 'license:authority',
      scope: 'Licensing-Engine',
      event: 'VerifySignedTokenSignature (RSA-2048)',
      target: 'ASHtech Authority API',
      status: 'AUTH OK'
    },
    {
      id: 'log-1',
      timestamp: '18:50:41.109',
      actor: 'service:kms-auto',
      scope: 'Loopback-Sec',
      event: 'RotateEncryptionCert (AES-256)',
      target: '127.0.0.1:9999',
      status: 'SUCCESS'
    },
    {
      id: 'log-2',
      timestamp: '18:49:12.004',
      actor: 'admin:elevated',
      scope: 'Network-Repair',
      event: 'FlushDnsSocketBuffer()',
      target: '127.0.0.1',
      status: 'SUCCESS'
    },
    {
      id: 'log-3',
      timestamp: '17:31:04.882',
      actor: 'system:watchdog',
      scope: 'Defender-Signatures',
      event: 'VerifySignaturesFreshness',
      target: 'Windows Defender',
      status: 'AUTH OK'
    }
  ]);

  const addToast = (type: ToastMessage['type'], title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, message, timestamp: Date.now() }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Map high-level action names to entitlement keys
  const mapActionToEntitlement = (actionName: string, command: string): string => {
    const lower = `${actionName} ${command}`.toLowerCase();
    if (lower.includes('one-click') || lower.includes('super repair')) return 'repair.one_click_super';
    if (lower.includes('dism') || lower.includes('sfc')) return 'repair.dism_sfc';
    if (lower.includes('wmi')) return 'repair.deep_wmi';
    if (lower.includes('printer')) return 'repair.printer_analyzer_pro';
    if (lower.includes('debloat')) return 'software.debloat_pro';
    if (lower.includes('copilot') || lower.includes('ai')) return 'ai.copilot_diagnostics';
    if (lower.includes('benchmark')) return 'diagnostics.deep_benchmarks';
    if (lower.includes('systemtwin')) return 'diagnostics.system_twin';
    if (lower.includes('export pdf') || lower.includes('branded')) return 'reports.client_branded_pdf';
    return 'diagnostics.basic';
  };

  const mapOperationToEntitlement = (opId: string): string => {
    if (opId.startsWith('repair.sfc') || opId.startsWith('repair.dism')) return 'repair.dism_sfc';
    if (opId.startsWith('repair.wu') || opId.startsWith('repair.super')) return 'repair.one_click_super';
    if (opId.startsWith('printer.')) return 'repair.printer_analyzer_pro';
    if (opId.startsWith('network.')) return 'diagnostics.basic';
    if (opId.startsWith('perf.optimizer')) return 'software.debloat_pro';
    return 'diagnostics.basic';
  };

  // Structured Autonomous Operation Runner (Phase 8.2)
  const handleExecuteOperation = async (
    operationId: string,
    params: Record<string, any> = {},
    requiresAdmin: boolean = false,
    confirmed: boolean = false
  ) => {
    const requiredEntitlement = mapOperationToEntitlement(operationId);
    if (!hasEntitlement(requiredEntitlement, licenseState)) {
      setGatingFeature(requiredEntitlement);
      return;
    }

    if (requiresAdmin && !confirmed) {
      setPendingConfirmationItem({
        id: operationId, operationId, params, title: operationId,
        category: 'System Maintenance', description: 'Confirm this Windows operation.',
        estimatedDuration: 'Varies', requiresAdmin: true, requiresRestart: true,
        actionCommand: '', icon: 'Shield',
        details: ['Run the selected operation with the current parameters.',
          'Windows administrative permissions are required. This dialog does not grant elevation.',
          'Some repairs interrupt connectivity or require a restart. Windows servicing cannot be cancelled here.',
          `Parameters: ${JSON.stringify(params)}`]
      });
      return;
    }

    try {
      addToast('info', 'Dispatching Operation', `Initializing ${operationId}...`);
      const res = await operationsClient.executeOperation(operationId, params, requiresAdmin);
      setActiveJobId(res.jobId);

      // Audit log entry
      const now = new Date();
      const timeStr = `${String(now.getUTCHours()).padStart(2, '0')}:${String(
        now.getUTCMinutes()
      ).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')}.${String(
        now.getMilliseconds()
      ).padStart(3, '0')}`;

      const newLog: AuditLogEntry = {
        id: `op-${res.jobId}`,
        timestamp: timeStr,
        actor: requiresAdmin ? 'user:confirmed-admin-operation' : 'user:technician',
        scope: operationId.split('.')[0].toUpperCase(),
        event: `Accepted: ${operationId}; awaiting Windows result`,
        target: window.location.host,
        status: 'WARN'
      };

      setAuditLogs((prev) => [newLog, ...prev]);
    } catch (err: any) {
      addToast('error', 'Execution Failed', err.message || 'Operation failed to initialize');
    }
  };

  // Arbitrary command strings have no audited native implementation.
  const handleTriggerAction = (actionName: string, _command: string, _requiresAdmin = false) => {
    if (['Command Copied', 'Reference Command Only', 'Execution Blocked by Security Policy'].includes(actionName)) {
      addToast('info', actionName, _command);
      return;
    }
    addToast('warning', 'Operation Unavailable', `${actionName} has not been connected to a verified Windows operation.`);
  };
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#07090e] text-slate-100 antialiased">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        telemetry={telemetry}
      />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Navigation Bar */}
        <TopBar
          activeTab={activeTab}
          telemetry={telemetry}
          licenseState={licenseState}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenSubscription={() => setActiveTab('subscription')}
        />

        {/* Dynamic Expiring or Grace Banner */}
        <ExpiringBanner
          licenseState={licenseState}
          onOpenSubscription={() => setActiveTab('subscription')}
          onOpenActivation={() => setIsActivationOpen(true)}
        />

        <div role="status" className="px-4 py-2 text-xs text-amber-200 bg-amber-950/50 border-b border-amber-800">
          Audit build — not release-ready. Dashboard values are demonstration data. Some repairs and inventories remain unavailable.
        </div>
        {/* View Router */}
        <main className="flex-1 overflow-y-auto bg-[#07090e]">
          {activeTab === 'dashboard' && (
            <DashboardView
              telemetry={telemetry}
              auditLogs={auditLogs}
              onTriggerAction={handleTriggerAction}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'diagnostics' && (
            <DiagnosticsView
              telemetry={telemetry}
              onTriggerAction={handleTriggerAction}
              onExecuteOperation={handleExecuteOperation}
            />
          )}

          {activeTab === 'repairs' && (
            <RepairsView
              onTriggerAction={handleTriggerAction}
              onExecuteOperation={handleExecuteOperation}
              onRequestConfirmation={(item) => {
                const ent = item.operationId
                  ? mapOperationToEntitlement(item.operationId)
                  : mapActionToEntitlement(item.title, item.actionCommand);
                if (!hasEntitlement(ent, licenseState)) {
                  setGatingFeature(ent);
                } else {
                  setPendingConfirmationItem(item);
                }
              }}
            />
          )}

          {activeTab === 'performance' && (
            <PerformanceView
              telemetry={telemetry}
              onTriggerAction={handleTriggerAction}
              onExecuteOperation={handleExecuteOperation}
            />
          )}

          {activeTab === 'command-vault' && (
            <CommandVaultView
              onExecuteOperation={handleExecuteOperation}
              onTriggerAction={handleTriggerAction}
            />
          )}

          {activeTab === 'network' && (
            <NetworkView
              telemetry={telemetry}
              onTriggerAction={handleTriggerAction}
              onExecuteOperation={handleExecuteOperation}
            />
          )}

          {activeTab === 'software' && (
            <SoftwareView onTriggerAction={handleTriggerAction} />
          )}

          {activeTab === 'security' && (
            <SecurityView
              telemetry={telemetry}
              onTriggerAction={handleTriggerAction}
            />
          )}

          {activeTab === 'ai-copilot' && (
            <AICopilotView
              telemetry={telemetry}
              onTriggerAction={handleTriggerAction}
              onExecuteOperation={handleExecuteOperation}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              onTriggerAction={handleTriggerAction}
              onExecuteOperation={handleExecuteOperation}
            />
          )}

          {activeTab === 'subscription' && (
            <SubscriptionView
              licenseState={licenseState}
              onOpenActivation={() => setIsActivationOpen(true)}
              onOpenCheckout={(planId) => {
                setCheckoutPlanId(planId || 'professional');
                setIsCheckoutOpen(true);
              }}
              onTriggerAction={handleTriggerAction}
            />
          )}

          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Razorpay Standard Checkout Portal Modal (Test Mode) */}
      <RazorpayCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        initialPlanId={checkoutPlanId}
        licenseState={licenseState}
        onSuccessFulfillment={(fulfillment) => {
          handleTriggerAction(
            fulfillment.isRenewal ? 'Subscription Renewed' : 'License Purchased & Issued',
            `Plan: ${fulfillment.planId.toUpperCase()} • Expiry: ${fulfillment.expiryDate}`
          );
        }}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!pendingConfirmationItem}
        item={pendingConfirmationItem}
        onClose={() => setPendingConfirmationItem(null)}
        onConfirm={() => {
          if (pendingConfirmationItem) {
            const item = pendingConfirmationItem;
            setPendingConfirmationItem(null);
            if (item.operationId) {
              handleExecuteOperation(
                item.operationId,
                item.params || {},
                item.requiresAdmin,
                true
              );
            } else {
              handleTriggerAction(
                item.title,
                item.actionCommand,
                item.requiresAdmin
              );
            }
          }
        }}
      />

      {/* Async Operations Job Runner Modal (Phase 8.2) */}
      <OperationJobModal
        jobId={activeJobId}
        onClose={() => setActiveJobId(null)}
        onJobCompleted={(job) => {
          if (job.status === 'SUCCESS') {
            addToast('success', 'Operation Completed', `${job.operationId} completed successfully.`);
          } else if (job.status === 'FAILED') {
            addToast('error', 'Operation Failed', `${job.operationId} failed: ${job.error || 'Unknown error'}`);
          } else if (job.status === 'CANCELLED') {
            addToast('warning', 'Operation Cancelled', `${job.operationId} was cancelled.`);
          }
        }}
      />

      {/* Activation Modal */}
      <ActivationModal
        isOpen={isActivationOpen}
        onClose={() => setIsActivationOpen(false)}
        licenseState={licenseState}
      />

      {/* Feature Gating Modal */}
      <FeatureGateModal
        isOpen={!!gatingFeature}
        featureKey={gatingFeature || ''}
        licenseState={licenseState}
        onClose={() => setGatingFeature(null)}
        onOpenSubscription={() => {
          setGatingFeature(null);
          setActiveTab('subscription');
        }}
        onOpenActivation={() => {
          setGatingFeature(null);
          setIsActivationOpen(true);
        }}
      />

      {/* Command Palette Modal (Ctrl+K) */}
      <CommandPaletteModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setIsSearchOpen(false);
        }}
        onTriggerAction={handleTriggerAction}
        onExecuteOperation={handleExecuteOperation}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}

export default App;
