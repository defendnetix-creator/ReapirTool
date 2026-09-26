import React, { useState, useEffect } from 'react';
import {
  Server,
  Play,
  Square,
  RotateCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Zap,
  Sliders,
  RefreshCw,
  Cpu,
  Layers
} from 'lucide-react';
import { operationsClient } from '../../api/operationsClient';

interface ServicesSectionProps {
  onExecuteOperation?: (
    operationId: string,
    params?: Record<string, any>,
    requiresAdmin?: boolean
  ) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onExecuteOperation }) => {
  const [services, setServices] = useState<any[]>([]);
  const [criticalServices, setCriticalServices] = useState<any[]>([]);
  const [optionalFeatures, setOptionalFeatures] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dataWarnings, setDataWarnings] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Running' | 'Stopped'>('All');
  const [activeSubTab, setActiveSubTab] = useState<'services' | 'critical' | 'features'>('services');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const results = await Promise.allSettled([
        operationsClient.getServicesList(),
        operationsClient.getCriticalServices(),
        operationsClient.getOptionalFeatures()
      ]);
      const [svcRes, critRes, featRes] = results;
      setServices(svcRes.status === 'fulfilled' ? svcRes.value.services || [] : []);
      setCriticalServices(critRes.status === 'fulfilled' ? critRes.value.critical || [] : []);
      setOptionalFeatures(featRes.status === 'fulfilled' ? featRes.value.features || [] : []);
      const labels = ['Service inventory', 'Critical-service assessment', 'Optional features'];
      setDataWarnings(results.flatMap((result, i) => result.status === 'rejected' ? [`${labels[i]} unavailable: ${result.reason?.message || 'Windows query failed'}`] : []));
    } catch (err) {
      console.error('Failed to load services telemetry:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredServices = services.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.displayName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'All' || s.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const handleStart = (serviceName: string) => {
    if (onExecuteOperation) {
      onExecuteOperation('services.start', { serviceName }, true);
    }
  };

  const handleStop = (serviceName: string) => {
    if (onExecuteOperation) {
      onExecuteOperation('services.stop', { serviceName }, true);
    }
  };

  const handleRestart = (serviceName: string) => {
    if (onExecuteOperation) {
      onExecuteOperation('services.restart', { serviceName }, true);
    }
  };

  return (
    <div className="space-y-6">
      {dataWarnings.length > 0 && <div role="status" className="text-xs text-amber-200 bg-amber-950/40 rounded p-3">{dataWarnings.join(' · ')}</div>}
      {/* Header with Sub-Tabs */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Server className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-semibold text-slate-100">
              Windows Services & Optional Features
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Service Control Manager (SCM) inventory, critical system service compliance, and DISM features.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="inline-flex rounded-lg bg-slate-800 p-1 border border-slate-700/60 text-xs">
            <button
              onClick={() => setActiveSubTab('services')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeSubTab === 'services'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Services ({services.length})
            </button>
            <button
              onClick={() => setActiveSubTab('critical')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center space-x-1.5 ${
                activeSubTab === 'critical'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Critical Health</span>
              {criticalServices.some((c) => !c.isCompliant) && (
                <span className="w-2 h-2 rounded-full bg-amber-400" />
              )}
            </button>
            <button
              onClick={() => setActiveSubTab('features')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeSubTab === 'features'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Optional Features ({optionalFeatures.length})
            </button>
          </div>

          <button
            onClick={loadData}
            disabled={isLoading}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Refresh Services"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Subtab 1: All Services */}
      {activeSubTab === 'services' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services by name or description..."
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <div className="flex rounded-lg bg-slate-900 p-0.5 border border-slate-800 text-xs">
                {(['All', 'Running', 'Stopped'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      statusFilter === filter
                        ? 'bg-slate-800 text-white font-medium'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              <button
                onClick={() => onExecuteOperation?.('sys.admin.services_msc', {}, true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition-colors whitespace-nowrap"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>services.msc</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Service Name</th>
                    <th className="py-3 px-4">Display Name</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Startup Type</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredServices.map((s) => (
                    <tr key={s.name} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-200 flex items-center space-x-1.5">
                        <span>{s.name}</span>
                        {s.isCritical && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800/60 uppercase">
                            Core
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-300 max-w-xs truncate" title={s.displayName}>
                        {s.displayName}
                      </td>
                      <td className="py-3 px-4 font-sans">
                        <span
                          className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                            s.status === 'Running'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              s.status === 'Running' ? 'bg-emerald-400' : 'bg-slate-500'
                            }`}
                          />
                          <span>{s.status}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-400">{s.startType}</td>
                      <td className="py-3 px-4 font-sans text-slate-400">{s.category}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {s.canControl !== true ? <span className="text-xs text-slate-500">Read-only</span> : s.status === 'Stopped' ? (
                            <button
                              onClick={() => handleStart(s.name)}
                              className="px-2 py-1 rounded bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/60 text-[10px] flex items-center space-x-1 transition-colors"
                              title={`Start ${s.name}`}
                            >
                              <Play className="w-3 h-3" />
                              <span>Start</span>
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => handleRestart(s.name)}
                                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[10px] flex items-center space-x-1 transition-colors"
                                title={`Restart ${s.name}`}
                              >
                                <RotateCw className="w-3 h-3" />
                                <span>Restart</span>
                              </button>
                              {!s.isCritical && (
                                <button
                                  onClick={() => handleStop(s.name)}
                                  className="px-2 py-1 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 text-[10px] flex items-center space-x-1 transition-colors"
                                  title={`Stop ${s.name}`}
                                >
                                  <Square className="w-3 h-3" />
                                  <span>Stop</span>
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredServices.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500 font-sans">
                        No services matching your filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 2: Critical Subsystem Services */}
      {activeSubTab === 'critical' && (
        <div className="space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-slate-200">
                  Critical Windows Subsystem Compliance
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Protects core operating system functions: Windows Update, BITS, Spooler, CryptSvc, Audio, and DHCP Client.
                </p>
              </div>
              <button
                onClick={() => onExecuteOperation?.('services.critical.detect', {}, false)}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center space-x-1.5 transition-colors shadow-sm"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Run Compliance Scan</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {criticalServices.map((crit) => (
              <div
                key={crit.serviceName}
                className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-slate-200">{crit.displayName}</h5>
                      <span className="font-mono text-[11px] text-slate-400">{crit.serviceName}</span>
                    </div>
                    <span
                      className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        crit.isCompliant
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {crit.isCompliant ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 text-amber-400" />
                      )}
                      <span>{crit.currentStatus}</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">{crit.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Expected: {crit.expectedStatus}</span>
                  {crit.remediationAvailable && (
                    <button
                      onClick={() => handleStart(crit.serviceName)}
                      className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-medium flex items-center space-x-1 transition-colors"
                    >
                      <Zap className="w-3 h-3" />
                      <span>Start Service</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subtab 3: Optional Features (DISM) */}
      {activeSubTab === 'features' && (
        <div className="space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-slate-200">
                Windows Optional Features (DISM Engine)
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Audit state of Hyper-V, Windows Subsystem for Linux (WSL), and .NET Framework runtimes.
              </p>
            </div>
            <button
              onClick={() => onExecuteOperation?.('services.optional_features.launch', {}, true)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 flex items-center space-x-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Turn Features On/Off</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {optionalFeatures.map((feat) => (
              <div
                key={feat.featureName}
                className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="text-xs font-mono font-bold text-slate-200">
                        {feat.featureName}
                      </h5>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                        {feat.category}
                      </span>
                    </div>
                    <span
                      className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        feat.state === 'Enabled'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          feat.state === 'Enabled' ? 'bg-emerald-400' : 'bg-slate-500'
                        }`}
                      />
                      <span>{feat.state}</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">{feat.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
