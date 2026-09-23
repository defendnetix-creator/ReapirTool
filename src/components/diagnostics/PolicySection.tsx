import React, { useState, useEffect } from 'react';
import {
  FileText,
  ShieldAlert,
  RotateCw,
  Search,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FolderDown,
  Terminal,
  FileCheck,
  Shield,
  Info
} from 'lucide-react';
import { operationsClient } from '../../api/operationsClient';

interface PolicySectionProps {
  onExecuteOperation?: (
    operationId: string,
    params?: Record<string, any>,
    requiresAdmin?: boolean
  ) => void;
}

export const PolicySection: React.FC<PolicySectionProps> = ({
  onExecuteOperation
}) => {
  const [gpResultData, setGpResultData] = useState<any>(null);
  const [policyDiagnostics, setPolicyDiagnostics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [gp, diag] = await Promise.all([
        operationsClient.getGPResult(),
        operationsClient.getPolicyDiagnostics()
      ]);
      setGpResultData(gp);
      setPolicyDiagnostics(diag);
    } catch (err: any) {
      console.error('Failed to load Policy data:', err);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-semibold text-white">Registry & Group Policy Administration</h2>
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Phase 8.4 / 8.5
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Resultant Set of Policy (RSOP), GPO enforcement, local security baselines, Windows Update policy audit, and gpupdate.
          </p>
        </div>
        <button
          id="btn-refresh-policy-data"
          onClick={fetchData}
          disabled={isLoading}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Policies
        </button>
      </div>

      {actionMessage && (
        <div className="flex items-center gap-2 p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-sm text-indigo-300">
          <Info className="w-4 h-4 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Policy Actions Toolbar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          id="btn-force-gpupdate"
          onClick={() =>
            handleRunOp('policy.gpupdate.force', {}, true, 'Force gpupdate /force dispatched.')
          }
          className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl flex flex-col items-center text-center transition"
        >
          <RotateCw className="w-5 h-5 text-indigo-400 mb-1.5" />
          <span className="text-xs font-semibold text-slate-200">Force gpupdate</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Refresh GPOs</span>
        </button>

        <button
          id="btn-run-gpresult"
          onClick={() =>
            handleRunOp('policy.gpresult.run', {}, true, 'Running gpresult /r diagnostic...')
          }
          className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl flex flex-col items-center text-center transition"
        >
          <Search className="w-5 h-5 text-sky-400 mb-1.5" />
          <span className="text-xs font-semibold text-slate-200">Run gpresult /r</span>
          <span className="text-[10px] text-slate-400 mt-0.5">RSOP Diagnostic</span>
        </button>

        <button
          id="btn-launch-gpedit"
          onClick={() =>
            handleRunOp('policy.gpedit.launch', {}, true, 'Launching gpedit.msc...')
          }
          className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl flex flex-col items-center text-center transition"
        >
          <ExternalLink className="w-5 h-5 text-teal-400 mb-1.5" />
          <span className="text-xs font-semibold text-slate-200">Open gpedit.msc</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Policy Editor</span>
        </button>

        <button
          id="btn-launch-secpol"
          onClick={() =>
            handleRunOp('policy.secpol.launch', {}, true, 'Launching secpol.msc...')
          }
          className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl flex flex-col items-center text-center transition"
        >
          <Shield className="w-5 h-5 text-purple-400 mb-1.5" />
          <span className="text-xs font-semibold text-slate-200">Open secpol.msc</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Security Policy</span>
        </button>

        <button
          id="btn-audit-wu-policy"
          onClick={() =>
            handleRunOp('policy.wu.diagnose', {}, true, 'Auditing Windows Update policies...')
          }
          className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl flex flex-col items-center text-center transition"
        >
          <FileCheck className="w-5 h-5 text-emerald-400 mb-1.5" />
          <span className="text-xs font-semibold text-slate-200">Audit Update GPO</span>
          <span className="text-[10px] text-slate-400 mt-0.5">AU Registry Check</span>
        </button>

        <button
          id="btn-generate-policy-html"
          onClick={() =>
            handleRunOp('policy.report.generate', {}, true, 'Generating HTML audit report...')
          }
          className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl flex flex-col items-center text-center transition"
        >
          <FolderDown className="w-5 h-5 text-amber-400 mb-1.5" />
          <span className="text-xs font-semibold text-slate-200">HTML RSOP Report</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Export Report</span>
        </button>
      </div>

      {/* Windows Update Policies & Defender Baselines */}
      {policyDiagnostics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Windows Update GPO</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 text-xs font-bold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                AUOptions: {policyDiagnostics.windowsUpdate.auOptions} (Auto Download)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Target Release: <strong className="text-slate-200">{policyDiagnostics.windowsUpdate.targetReleaseVersion}</strong>
            </p>
            <p className="text-xs text-slate-500 mt-1">
              WSUS Server: {policyDiagnostics.windowsUpdate.useWUServer ? 'Enforced' : 'Microsoft Cloud Update'}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Windows Defender Policy</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 text-xs font-bold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Real-Time Protection ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              PUA Protection: <strong className="text-slate-200">Enabled</strong>
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Cloud Block Level: {policyDiagnostics.defenderPolicy.cloudBlockLevel}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">UAC & NLA Security Policy</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 text-xs font-bold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                UAC Admin Approval Mode
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              RDP NLA: <strong className="text-emerald-400">Enforced by Policy</strong>
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Secure Desktop: Prompt on Secure Desktop Enabled
            </p>
          </div>
        </div>
      )}

      {/* Applied GPOs & Security Baseline Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Applied GPOs */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-400" />
            Applied Group Policy Objects (GPOs)
          </h3>
          <div className="space-y-2">
            {gpResultData?.appliedGPOs?.map((gpo: any) => (
              <div
                key={gpo.guid}
                className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs flex items-center justify-between"
              >
                <div>
                  <span className="font-semibold text-slate-200">{gpo.name}</span>
                  <p className="text-slate-500 font-mono text-[11px] mt-0.5">{gpo.guid} • v{gpo.version}</p>
                </div>
                <span className="px-2 py-0.5 rounded font-bold text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {gpo.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Security Baseline Settings Summary */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            Active Security Baseline Enforcement
          </h3>
          <div className="space-y-2 font-mono text-xs">
            {gpResultData?.securitySettingsSummary &&
              Object.entries(gpResultData.securitySettingsSummary).map(([key, value]: [string, any]) => (
                <div
                  key={key}
                  className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between"
                >
                  <span className="text-slate-400 text-[11px] font-sans">{key}</span>
                  <span className="text-slate-200 font-bold ml-3 text-right">{value}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
