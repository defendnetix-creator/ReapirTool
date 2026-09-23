import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  AlertOctagon,
  AlertTriangle,
  Info,
  Download,
  ExternalLink,
  Filter,
  RefreshCw,
  Clock,
  ShieldAlert,
  HardDrive,
  Cpu,
  CheckCircle2,
  Copy,
  Check
} from 'lucide-react';
import { operationsClient } from '../../api/operationsClient';

interface EventLogsSectionProps {
  onExecuteOperation?: (
    operationId: string,
    params?: Record<string, any>,
    requiresAdmin?: boolean
  ) => void;
}

export const EventLogsSection: React.FC<EventLogsSectionProps> = ({ onExecuteOperation }) => {
  const [events, setEvents] = useState<any[]>([]);
  const [issueSummary, setIssueSummary] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [logName, setLogName] = useState<'Application' | 'System' | 'Security' | 'Setup'>('Application');
  const [levelFilter, setLevelFilter] = useState<'All' | 'Critical' | 'Error' | 'Warning' | 'Information'>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const [eventsRes, issuesRes] = await Promise.all([
        operationsClient.queryEventLogs({
          logName,
          level: levelFilter,
          search: searchQuery
        }),
        operationsClient.getEventLogIssues()
      ]);
      setEvents(eventsRes.events || []);
      setIssueSummary(issuesRes);
      if (eventsRes.events && eventsRes.events.length > 0) {
        setSelectedEvent(eventsRes.events[0]);
      }
    } catch (err) {
      console.error('Failed to load event log telemetry:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [logName, levelFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadEvents();
  };

  const handleExport = (format: 'CSV' | 'JSON' | 'TXT') => {
    if (onExecuteOperation) {
      onExecuteOperation('logs.eventlog.export', { logName, format }, false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Anomaly Detection Correlation */}
      {issueSummary && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-semibold text-slate-100">
                System Forensic Correlation & Health Anomalies
              </h3>
            </div>
            <button
              onClick={() => onExecuteOperation?.('reports.event_log.generate', {}, false)}
              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center space-x-1.5 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Generate Forensic Report</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-2.5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">App Crashes</span>
              <span className="text-base font-bold text-rose-400 font-mono">
                {issueSummary.crashesCount}
              </span>
              <span className="text-[9px] text-slate-500 block">IDs 1000, 1001</span>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-2.5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Power Loss</span>
              <span className="text-base font-bold text-amber-400 font-mono">
                {issueSummary.unexpectedShutdownsCount}
              </span>
              <span className="text-[9px] text-slate-500 block">Kernel-Power 41</span>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-2.5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">SCM Failures</span>
              <span className="text-base font-bold text-orange-400 font-mono">
                {issueSummary.serviceFailuresCount}
              </span>
              <span className="text-[9px] text-slate-500 block">IDs 7000, 7009</span>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-2.5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Disk Events</span>
              <span className="text-base font-bold text-sky-400 font-mono">
                {issueSummary.diskEventsCount}
              </span>
              <span className="text-[9px] text-slate-500 block">IDs 7, 11, 55</span>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-2.5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">PnP Warnings</span>
              <span className="text-base font-bold text-purple-400 font-mono">
                {issueSummary.driverErrorsCount}
              </span>
              <span className="text-[9px] text-slate-500 block">Kernel-PnP 219</span>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-2.5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">WU Errors</span>
              <span className="text-base font-bold text-slate-200 font-mono">
                {issueSummary.updateFailuresCount}
              </span>
              <span className="text-[9px] text-slate-500 block">Client ID 20</span>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Control Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Channel Selector */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Channel:</span>
          <div className="flex rounded-lg bg-slate-800 p-0.5 border border-slate-700/60 text-xs">
            {(['Application', 'System', 'Security', 'Setup'] as const).map((channel) => (
              <button
                key={channel}
                onClick={() => setLogName(channel)}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  logName === channel
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {channel}
              </button>
            ))}
          </div>
        </div>

        {/* Severity Selector & Search */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <div className="flex rounded-lg bg-slate-800 p-0.5 border border-slate-700/60 text-xs">
            {(['All', 'Critical', 'Error', 'Warning', 'Information'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setLevelFilter(lvl)}
                className={`px-2.5 py-1.5 rounded-md font-medium transition-colors ${
                  levelFilter === lvl
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events..."
              className="bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-36 sm:w-48"
            />
          </form>

          {/* Export Dropdown / Buttons */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handleExport('CSV')}
              className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 flex items-center space-x-1 transition-colors"
              title="Export to CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
            <button
              onClick={() => handleExport('JSON')}
              className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 flex items-center space-x-1 transition-colors"
              title="Export to JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>
            <button
              onClick={() => onExecuteOperation?.('logs.eventviewer.launch', {}, true)}
              className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 flex items-center space-x-1 transition-colors"
              title="Open eventvwr.msc"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>eventvwr</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Event Table + Detail Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Event List */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col h-[460px]">
          <div className="bg-slate-800/80 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              Channel: <strong className="text-slate-200">{logName}</strong> ({events.length} records)
            </span>
            <button
              onClick={loadEvents}
              disabled={isLoading}
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 font-mono text-xs">
            {events.map((evt) => {
              const isSelected = selectedEvent?.id === evt.id;
              return (
                <div
                  key={evt.id}
                  onClick={() => setSelectedEvent(evt)}
                  className={`p-3 cursor-pointer transition-colors flex items-start space-x-3 ${
                    isSelected ? 'bg-indigo-950/40 border-l-2 border-indigo-500' : 'hover:bg-slate-800/40'
                  }`}
                >
                  <div className="pt-0.5">
                    {evt.level === 'Critical' && <AlertOctagon className="w-4 h-4 text-rose-500" />}
                    {evt.level === 'Error' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                    {evt.level === 'Warning' && <AlertTriangle className="w-4 h-4 text-yellow-400" />}
                    {evt.level === 'Information' && <Info className="w-4 h-4 text-sky-400" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-200 truncate">{evt.source}</span>
                      <span className="text-[10px] text-slate-500 whitespace-nowrap">
                        ID: <strong className="text-indigo-300">{evt.eventId}</strong>
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-sans truncate mt-0.5">
                      {evt.message}
                    </p>
                    <div className="text-[10px] text-slate-500 mt-1 flex items-center space-x-2">
                      <Clock className="w-3 h-3 text-slate-600" />
                      <span>{new Date(evt.timeGenerated).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {events.length === 0 && !isLoading && (
              <div className="p-8 text-center text-slate-500 font-sans">
                No events found matching current channel and filter criteria.
              </div>
            )}
          </div>
        </div>

        {/* Selected Event Details Pane */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between h-[460px]">
          {selectedEvent ? (
            <div className="space-y-4 overflow-y-auto">
              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div>
                  <span
                    className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold mb-1 ${
                      selectedEvent.level === 'Critical'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        : selectedEvent.level === 'Error'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : selectedEvent.level === 'Warning'
                        ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                        : 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                    }`}
                  >
                    <span>{selectedEvent.level}</span>
                  </span>
                  <h4 className="text-sm font-bold text-slate-100 font-sans">{selectedEvent.source}</h4>
                  <span className="text-xs text-slate-400 font-mono">Event ID: {selectedEvent.eventId}</span>
                </div>

                <button
                  onClick={() => handleCopy(JSON.stringify(selectedEvent, null, 2), selectedEvent.id)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs flex items-center space-x-1"
                  title="Copy full JSON"
                >
                  {copiedId === selectedEvent.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>Copy</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-slate-800/40 p-2 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">Log Name</span>
                  <span className="text-slate-300">{selectedEvent.logName}</span>
                </div>
                <div className="bg-slate-800/40 p-2 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">Record Number</span>
                  <span className="text-slate-300">#{selectedEvent.recordNumber}</span>
                </div>
                <div className="bg-slate-800/40 p-2 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">Computer</span>
                  <span className="text-slate-300">{selectedEvent.computerName}</span>
                </div>
                <div className="bg-slate-800/40 p-2 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">Logged Timestamp</span>
                  <span className="text-slate-300 text-[11px]">
                    {new Date(selectedEvent.timeGenerated).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
                  Event Description & Stack Data
                </span>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto select-all">
                  {selectedEvent.message}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs font-sans">
              Select an event from the list to inspect forensic details.
            </div>
          )}

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-sans">
            <span>Protected Windows Event Log Engine</span>
            <span>Zero Log Alteration Enforced</span>
          </div>
        </div>
      </div>
    </div>
  );
};
