import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  FileText,
  CheckCircle2,
  RefreshCw,
  Plus,
  Eye,
  Trash2,
  Server,
  Battery,
  HardDrive,
  Sliders,
  ExternalLink,
  ShieldCheck,
  X
} from 'lucide-react';
import { operationsClient } from '../api/operationsClient';

interface ReportsViewProps {
  onTriggerAction: (actionName: string, command: string, requiresAdmin?: boolean) => void;
  onExecuteOperation?: (
    operationId: string,
    params?: Record<string, any>,
    requiresAdmin?: boolean
  ) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  onTriggerAction,
  onExecuteOperation
}) => {
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [reportContent, setReportContent] = useState<string | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState<boolean>(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const data = await operationsClient.getReports();
      if (data && data.reports) {
        setReports(data.reports);
      }
    } catch (err) {
      console.error('Failed to query reports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDispatch = (
    opId: string,
    params: Record<string, any> = {},
    requiresAdmin: boolean = false
  ) => {
    if (onExecuteOperation) {
      onExecuteOperation(opId, params, requiresAdmin);
    } else {
      onTriggerAction(opId, `Invoke-ToolkitOperation -Id "${opId}"`, requiresAdmin);
    }
  };

  const handleViewReport = async (rep: any) => {
    setSelectedReport(rep);
    setIsLoadingContent(true);
    try {
      const res = await operationsClient.getReportContent(rep.reportId || rep.id);
      setReportContent(res?.content || 'Preview unavailable');
    } catch (err) {
      setReportContent('Failed to load report preview.');
    } finally {
      setIsLoadingContent(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto overflow-y-auto font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-white font-sans">
              System Audit Reports & Compliance Archive
            </h1>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-500/30">
              AUDIT LOGS ACTIVE
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
              HTML/TXT GENERATORS ONLINE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Deep hardware topology, ACPI battery life history, driver manifests, and SMART diagnostics generated via native toolkit routines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchReports}
            className="px-3 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 text-xs font-bold transition-all flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Archive</span>
          </button>

          <button
            onClick={() => handleDispatch('reports.system_inventory.generate', {}, false)}
            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-2 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Generate System Inventory</span>
          </button>
        </div>
      </div>

      {/* Report Generator Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0e121c] border border-white/[0.07] space-y-3 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
              <Server className="w-4 h-4" />
              <span>Full System Inventory</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Generates executive HTML audit matching legacy SystemInventoryReport.ps1.
            </p>
          </div>
          <button
            onClick={() => handleDispatch('reports.system_inventory.generate', {}, false)}
            className="w-full py-1.5 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold transition-all text-center"
          >
            Generate HTML Report
          </button>
        </div>

        <div className="p-4 rounded-xl bg-[#0e121c] border border-white/[0.07] space-y-3 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <Battery className="w-4 h-4" />
              <span>Battery Health Report</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Executes powercfg /batteryreport tracking cycle deterioration and capacity.
            </p>
          </div>
          <button
            onClick={() => handleDispatch('reports.battery.generate', {}, false)}
            className="w-full py-1.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold transition-all text-center"
          >
            Generate Battery Report
          </button>
        </div>

        <div className="p-4 rounded-xl bg-[#0e121c] border border-white/[0.07] space-y-3 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
              <Sliders className="w-4 h-4" />
              <span>Driver Manifest & IDs</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Audits all installed OEM driver packages and matching PnP hardware IDs.
            </p>
          </div>
          <button
            onClick={() => handleDispatch('reports.driver.generate', {}, false)}
            className="w-full py-1.5 rounded bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs font-bold transition-all text-center"
          >
            Export Manifest
          </button>
        </div>

        <div className="p-4 rounded-xl bg-[#0e121c] border border-white/[0.07] space-y-3 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <HardDrive className="w-4 h-4" />
              <span>Storage & SMART Diagnostic</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              NVMe SMART endurance registers, volume health scores, and sector integrity.
            </p>
          </div>
          <button
            onClick={() => handleDispatch('reports.storage.generate', {}, false)}
            className="w-full py-1.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all text-center"
          >
            Generate Storage Report
          </button>
        </div>
      </div>

      {/* Crash Dump & Portable Diagnostics Section */}
      <div className="p-4 rounded-xl bg-[#0e121c] border border-white/[0.07] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <ExternalLink className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">BlueScreenView Crash Dump Analyzer</div>
            <div className="text-[11px] text-slate-400 font-sans">
              Analyzes minidump files (C:\Windows\Minidump) created during BSOD crashes.
            </div>
          </div>
        </div>
        <button
          onClick={() =>
            onTriggerAction(
              'BlueScreenView Crash Dump Analyzer',
              'Tools\\BlueScreenView.exe',
              true
            )
          }
          className="px-3 py-1.5 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-bold transition-all"
        >
          Launch Crash Dump Analyzer
        </button>
      </div>

      {/* Reports Table */}
      <div className="p-5 rounded-xl bg-[#0e121c] border border-white/[0.07] space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <h3 className="text-xs font-mono font-bold text-white uppercase">
            Available Diagnostic Reports & Forensic Handover Archive
          </h3>
          <span className="text-xs font-mono text-slate-400">
            Total: {reports.length} Reports
          </span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-white/[0.06]">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-[#090c13] text-slate-400 border-b border-white/[0.08] text-[11px]">
                <th className="py-2.5 px-4 font-bold">REPORT NAME</th>
                <th className="py-2.5 px-4 font-bold">CREATED TIMESTAMP</th>
                <th className="py-2.5 px-4 font-bold">REPORT TYPE</th>
                <th className="py-2.5 px-4 font-bold">FORMAT</th>
                <th className="py-2.5 px-4 font-bold">SIZE</th>
                <th className="py-2.5 px-4 font-bold text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-slate-300">
              {reports.map((rep) => (
                <tr key={rep.reportId || rep.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-2.5 px-4 font-semibold text-white">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>{rep.title}</span>
                    </div>
                    {rep.summary && (
                      <div className="text-[11px] text-slate-400 font-sans mt-0.5 ml-6">
                        {rep.summary}
                      </div>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-slate-400">
                    {rep.createdTimestamp || rep.timestamp}
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-500/30">
                      {rep.reportType || rep.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-300">{rep.format || 'HTML'}</td>
                  <td className="py-2.5 px-4 text-slate-400">
                    {rep.fileSizeBytes ? `${(rep.fileSizeBytes / 1024).toFixed(0)} KB` : rep.fileSize || '120 KB'}
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleViewReport(rep)}
                        className="p-1 rounded bg-white/[0.04] hover:bg-white/[0.1] text-cyan-400 transition-colors"
                        title="View Report Preview"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          onTriggerAction('Export Report', `explorer.exe "${rep.filePath || 'C:\\ProgramData\\AkshigoToolkit\\Reports'}"`, false)
                        }
                        className="p-1 rounded bg-white/[0.04] hover:bg-white/[0.1] text-slate-300 transition-colors"
                        title="Open in Explorer"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Preview Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-3xl p-6 rounded-xl bg-[#0e121c] border border-white/[0.1] space-y-4 text-xs shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">{selectedReport.title}</h3>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-1 rounded hover:bg-white/[0.1] text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 rounded bg-[#070a12] border border-white/[0.05] text-slate-300">
              {isLoadingContent ? (
                <div className="py-8 text-center text-slate-400 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                  <span>Loading report content...</span>
                </div>
              ) : (
                <div
                  className="prose prose-invert max-w-none text-xs"
                  dangerouslySetInnerHTML={{ __html: reportContent || '' }}
                />
              )}
            </div>

            <div className="flex justify-between items-center pt-2 text-[11px] text-slate-400">
              <div>File Path: {selectedReport.filePath}</div>
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
