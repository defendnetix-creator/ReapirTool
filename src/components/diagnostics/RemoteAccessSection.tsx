import React, { useState, useEffect } from 'react';
import {
  Monitor,
  Network,
  ShieldCheck,
  RotateCw,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  FolderSync,
  HardDrive,
  RefreshCw,
  Globe,
  Radio,
  Server,
  Activity,
  Terminal,
  Info
} from 'lucide-react';
import { operationsClient } from '../../api/operationsClient';

interface RemoteAccessSectionProps {
  onExecuteOperation?: (
    operationId: string,
    params?: Record<string, any>,
    requiresAdmin?: boolean
  ) => void;
}

export const RemoteAccessSection: React.FC<RemoteAccessSectionProps> = ({
  onExecuteOperation
}) => {
  const [rdpStatus, setRdpStatus] = useState<any>(null);
  const [vpnProxy, setVpnProxy] = useState<any>(null);
  const [smbShares, setSmbShares] = useState<any[]>([]);
  const [mappedDrives, setMappedDrives] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // NAS Diagnostic test state
  const [nasHostInput, setNasHostInput] = useState<string>('NAS-STORAGE01');
  const [nasTestResult, setNasTestResult] = useState<any>(null);
  const [isTestingNas, setIsTestingNas] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [rdp, vpn, smb, drives] = await Promise.all([
        operationsClient.getRdpStatus(),
        operationsClient.getVpnProxy(),
        operationsClient.getSmbShares(),
        operationsClient.getMappedDrives()
      ]);
      setRdpStatus(rdp);
      setVpnProxy(vpn);
      setSmbShares(smb.shares || []);
      setMappedDrives(drives.drives || []);
    } catch (err: any) {
      console.error('Failed to load remote access data:', err);
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

  const handleTestNas = async () => {
    setIsTestingNas(true);
    setNasTestResult(null);
    try {
      const res = await operationsClient.executeOperation('remote.nas.test', { host: nasHostInput });
      const job = await operationsClient.getJob(res.jobId);
      if (job.status === 'SUCCESS' && job.result) {
        setNasTestResult(job.result);
      } else {
        setNasTestResult({ error: job.error || 'Failed to ping NAS host' });
      }
    } catch (err: any) {
      setNasTestResult({ error: err.message || 'Diagnostic failed' });
    } finally {
      setIsTestingNas(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div>
          <div className="flex items-center gap-2">
            <Monitor className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-semibold text-white">Remote Access & Network Sharing</h2>
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Phase 8.5
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Remote Desktop (RDP) state, NLA security validation, active sessions, VPN/Proxy configuration, SMB shares, and NAS connectivity diagnostics.
          </p>
        </div>
        <button
          id="btn-refresh-remote-status"
          onClick={fetchData}
          disabled={isLoading}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Diagnostics
        </button>
      </div>

      {actionMessage && (
        <div className="flex items-center gap-2 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-sm text-cyan-300">
          <Info className="w-4 h-4 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* RDP Status & Key Security Indicators */}
      {rdpStatus && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Remote Desktop (RDP)</span>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`px-2 py-0.5 text-xs font-bold rounded ${
                  rdpStatus.rdpEnabled
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}
              >
                {rdpStatus.rdpEnabled ? 'ENABLED' : 'DISABLED'}
              </span>
              <span className="text-xs text-slate-400">Port {rdpStatus.portNumber}</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Service: <strong className="text-slate-300">{rdpStatus.serviceState}</strong> ({rdpStatus.serviceStartup})
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Network Level Auth (NLA)</span>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`px-2 py-0.5 text-xs font-bold rounded ${
                  rdpStatus.nlaEnabled
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}
              >
                {rdpStatus.nlaEnabled ? 'ENFORCED (SECURE)' : 'OPTIONAL / OFF'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">Requires client authentication before session negotiation</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Windows Defender Firewall</span>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`px-2 py-0.5 text-xs font-bold rounded ${
                  rdpStatus.firewallRulesEnabled
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}
              >
                {rdpStatus.firewallRulesEnabled ? 'ALLOWED (TCP 3389)' : 'BLOCKED'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">Active on Domain & Private profiles</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Quick Actions</span>
            <div className="flex items-center gap-2 mt-2">
              <button
                id="btn-open-rdp-settings"
                onClick={() =>
                  handleRunOp('remote.rdp.settings', {}, false, 'Opened Remote Desktop Settings.')
                }
                className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium transition text-center"
              >
                Settings
              </button>
              <button
                id="btn-restart-termservice"
                onClick={() =>
                  handleRunOp('remote.rdp.restart_service', {}, true, 'Restarting TermService safely...')
                }
                className="flex-1 py-1.5 px-2 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 rounded text-xs font-medium transition text-center"
              >
                Restart Service
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Sessions & Security Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Active RDP & Console Sessions */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-semibold text-white">Active Terminal Sessions (qwinsta)</h3>
            </div>
            <span className="text-xs text-slate-400">
              {rdpStatus?.activeSessions?.length || 0} session(s)
            </span>
          </div>

          <div className="space-y-2">
            {rdpStatus?.activeSessions?.map((session: any) => (
              <div
                key={session.sessionId}
                className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-200">{session.username}</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">
                      ID: {session.sessionId}
                    </span>
                  </div>
                  <p className="text-slate-500 mt-0.5 font-mono">
                    Session: {session.sessionName} {session.clientName ? `• Client: ${session.clientName}` : ''}
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded font-semibold text-xs ${
                    session.state === 'Active'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {session.state}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* VPN & Web Proxy Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-teal-400" />
                <h3 className="text-base font-semibold text-white">VPN & Proxy Configuration</h3>
              </div>
              <span className="text-xs text-slate-400">WinINet & RAS API</span>
            </div>

            {vpnProxy?.vpnAdapters && (
              <div className="space-y-2 mb-4">
                <span className="text-xs font-medium text-slate-400">Configured VPN Connections</span>
                {vpnProxy.vpnAdapters.map((vpn: any) => (
                  <div
                    key={vpn.name}
                    className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-200">{vpn.name}</span>
                      <p className="text-slate-500 font-mono text-[11px]">{vpn.type} • {vpn.serverAddress}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded font-bold text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {vpn.status}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {vpnProxy?.proxy && (
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">System Proxy Status</span>
                  <span
                    className={`font-semibold ${
                      vpnProxy.proxy.enabled ? 'text-amber-400' : 'text-slate-400'
                    }`}
                  >
                    {vpnProxy.proxy.enabled ? 'Enabled' : 'Direct Connection (Disabled)'}
                  </span>
                </div>
                <div className="mt-2 text-slate-500 text-[11px] space-y-1">
                  <p>Auto-Detect WPAD: <strong className="text-slate-300">{vpnProxy.proxy.autoDetect ? 'Yes' : 'No'}</strong></p>
                  {vpnProxy.proxy.server && <p>Proxy Server: <strong className="text-slate-300">{vpnProxy.proxy.server}</strong></p>}
                  <p>Bypass: {vpnProxy.proxy.bypassList?.join(', ')}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Network Storage, SMB Shares & Mapped Drives */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Local SMB Shares */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-semibold text-white">Local SMB File Shares</h3>
            </div>
            <button
              id="btn-audit-shares"
              onClick={() =>
                handleRunOp('remote.shares.audit', {}, true, 'Auditing SMB shares...')
              }
              className="text-xs text-amber-400 hover:text-amber-300 font-medium"
            >
              Scan Shares
            </button>
          </div>

          <div className="space-y-2">
            {smbShares.map((share: any) => (
              <div
                key={share.name}
                className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-200 font-bold">{share.name}</span>
                    {share.special && (
                      <span className="px-1.5 py-0.2 text-[10px] rounded bg-slate-800 text-slate-400">
                        Admin
                      </span>
                    )}
                  </div>
                  <span className="text-slate-500 text-[11px] truncate">{share.path || '(IPC)'}</span>
                </div>
                <span className="text-slate-400 text-[11px]">{share.description}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mapped Network Drives & NAS Tester */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FolderSync className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-semibold text-white">Mapped Network Drives & NAS</h3>
              </div>
              <span className="text-xs text-slate-400">{mappedDrives.length} active drive(s)</span>
            </div>

            <div className="space-y-2 mb-4">
              {mappedDrives.map((drive: any) => (
                <div
                  key={drive.driveLetter}
                  className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs flex items-center justify-between font-mono"
                >
                  <div>
                    <span className="font-bold text-emerald-400">{drive.driveLetter}</span>
                    <span className="text-slate-300 ml-2">{drive.uncPath}</span>
                  </div>
                  <div className="text-right text-[11px]">
                    <span className="text-slate-400">Free: {drive.freeSpaceGB} GB / {drive.totalSpaceGB} GB</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Interactive NAS Diagnostic Test */}
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-xs font-medium text-slate-300 block mb-2">Test NAS / File Share Host Connectivity</span>
              <div className="flex items-center gap-2">
                <input
                  id="input-nas-host"
                  type="text"
                  value={nasHostInput}
                  onChange={(e) => setNasHostInput(e.target.value)}
                  placeholder="e.g. NAS-STORAGE01 or 192.168.1.150"
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500"
                />
                <button
                  id="btn-test-nas"
                  onClick={handleTestNas}
                  disabled={isTestingNas || !nasHostInput}
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition shrink-0"
                >
                  {isTestingNas ? 'Testing...' : 'Test Port 445'}
                </button>
              </div>

              {nasTestResult && (
                <div className="mt-3 p-2.5 bg-slate-900 rounded border border-slate-800 text-xs">
                  {nasTestResult.error ? (
                    <div className="flex items-center gap-2 text-rose-400">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{nasTestResult.error}</span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-emerald-400 font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Host {nasTestResult.host} is responding ({nasTestResult.latencyMs} ms)
                      </p>
                      <p className="text-slate-400 text-[11px] font-mono">
                        Resolved: {nasTestResult.resolvedIp} • SMB 445: Open • NetBIOS 139: Open
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
