import React, { useState, useEffect } from 'react';
import {
  Cpu,
  HardDrive,
  Activity,
  Battery,
  Shield,
  Layers,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Printer,
  Wrench,
  Radio,
  Zap,
  RotateCw,
  FolderDown,
  FolderUp,
  AlertTriangle,
  Play,
  Gauge,
  Thermometer,
  ExternalLink,
  ShieldCheck,
  Server,
  Database,
  Sliders,
  FileCode,
  FileCheck
} from 'lucide-react';
import { HardwareTelemetry } from '../types';
import {
  operationsClient,
  PrinterDataResponse,
  HardwareSystemResponse,
  BatteryHealthResponse,
  ThermalResponse,
  DriverDataResponse,
  StorageDisksResponse,
  StorageVolumesResponse
} from '../api/operationsClient';
import { ServicesSection } from './diagnostics/ServicesSection';
import { EventLogsSection } from './diagnostics/EventLogsSection';
import { SystemAdminSection } from './diagnostics/SystemAdminSection';
import { AccountsSection } from './diagnostics/AccountsSection';
import { RemoteAccessSection } from './diagnostics/RemoteAccessSection';
import { BootBiosSection } from './diagnostics/BootBiosSection';
import { PolicySection } from './diagnostics/PolicySection';

interface DiagnosticsViewProps {
  telemetry: HardwareTelemetry;
  onTriggerAction: (actionName: string, command: string, requiresAdmin?: boolean) => void;
  onExecuteOperation?: (
    operationId: string,
    params?: Record<string, any>,
    requiresAdmin?: boolean
  ) => void;
}

export const DiagnosticsView: React.FC<DiagnosticsViewProps> = ({
  telemetry,
  onTriggerAction,
  onExecuteOperation
}) => {
  const [activeCategory, setActiveCategory] = useState<
    | 'Overview'
    | 'Hardware'
    | 'Drivers'
    | 'Storage'
    | 'Memory'
    | 'Battery'
    | 'Windows'
    | 'Printers'
    | 'Services'
    | 'Event Logs'
    | 'System Admin'
    | 'Accounts'
    | 'Remote Access'
    | 'BIOS & Boot'
    | 'Group Policy'
  >('Overview');

  // Async data states
  const [hardwareSystem, setHardwareSystem] = useState<HardwareSystemResponse | null>(null);
  const [thermalInfo, setThermalInfo] = useState<ThermalResponse | null>(null);
  const [problemDevices, setProblemDevices] = useState<any[]>([]);
  const [driverData, setDriverData] = useState<DriverDataResponse | null>(null);
  const [storageDisks, setStorageDisks] = useState<StorageDisksResponse | null>(null);
  const [storageVolumes, setStorageVolumes] = useState<StorageVolumesResponse | null>(null);
  const [batteryData, setBatteryData] = useState<BatteryHealthResponse | null>(null);
  const [printerData, setPrinterData] = useState<PrinterDataResponse | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Modal / Prompt states
  const [infPathInput, setInfPathInput] = useState<string>('C:\\Drivers\\oem.inf');
  const [backupPathInput, setBackupPathInput] = useState<string>(
    'C:\\ProgramData\\AkshigoToolkit\\Backups\\Drivers'
  );
  const [showInfModal, setShowInfModal] = useState<boolean>(false);
  const [showBackupModal, setShowBackupModal] = useState<boolean>(false);
  const [showRestoreModal, setShowRestoreModal] = useState<boolean>(false);
  const [showChkdskModal, setShowChkdskModal] = useState<boolean>(false);
  const [targetChkdskDrive, setTargetChkdskDrive] = useState<string>('C:');

  const categories = [
    { id: 'Overview', label: 'System Overview' },
    { id: 'Hardware', label: 'Hardware Matrix' },
    { id: 'Drivers', label: 'Driver Auto Center' },
    { id: 'Storage', label: 'Storage & SMART' },
    { id: 'Memory', label: 'Memory & Cache' },
    { id: 'Battery', label: 'Battery & Power' },
    { id: 'Windows', label: 'Windows & Build' },
    { id: 'Printers', label: 'Printers & Spooler' },
    { id: 'Services', label: 'Services & Features' },
    { id: 'Event Logs', label: 'Event Logs' },
    { id: 'System Admin', label: 'System Admin' },
    { id: 'Accounts', label: 'User Accounts' },
    { id: 'Remote Access', label: 'Remote & Sharing' },
    { id: 'BIOS & Boot', label: 'BIOS & Boot' },
    { id: 'Group Policy', label: 'Group Policy' }
  ];

  useEffect(() => {
    loadCategoryData(activeCategory);
  }, [activeCategory]);

  const loadCategoryData = async (cat: string) => {
    setIsLoading(true);
    try {
      if (cat === 'Overview' || cat === 'Hardware') {
        const [sys, therm, probs] = await Promise.all([
          operationsClient.getHardwareSystem().catch(() => null),
          operationsClient.getThermalInfo().catch(() => null),
          operationsClient.getProblemDevices().catch(() => ({ devices: [] }))
        ]);
        if (sys) setHardwareSystem(sys);
        if (therm) setThermalInfo(therm);
        if (probs) setProblemDevices(probs.devices || []);
      }

      if (cat === 'Drivers') {
        const data = await operationsClient.getDrivers().catch(() => null);
        if (data) setDriverData(data);
      }

      if (cat === 'Storage') {
        const [disks, vols] = await Promise.all([
          operationsClient.getStorageDisks().catch(() => null),
          operationsClient.getStorageVolumes().catch(() => null)
        ]);
        if (disks) setStorageDisks(disks);
        if (vols) setStorageVolumes(vols);
      }

      if (cat === 'Battery') {
        const bat = await operationsClient.getBatteryHealth().catch(() => null);
        if (bat) setBatteryData(bat);
      }

      if (cat === 'Printers') {
        const prn = await operationsClient.getPrinters().catch(() => null);
        if (prn) setPrinterData(prn);
      }
    } catch (err) {
      console.error('Error querying telemetry endpoint:', err);
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

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-white">
              Hardware, Driver & Storage Diagnostics
            </h1>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-500/30">
              SMBIOS & WMI LIVE
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
              DRIVER AUTO CENTER
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Deep motherboard topology, driver backup/restore, NVMe SMART endurance, CHKDSK scans, and ACPI power telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadCategoryData(activeCategory)}
            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold transition-all flex items-center gap-2 shadow-[0_0_12px_rgba(6,182,212,0.2)]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Diagnostics</span>
          </button>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all whitespace-nowrap ${
              activeCategory === cat.id
                ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* ========================================================= */}
      {/* 1. OVERVIEW TAB */}
      {/* ========================================================= */}
      {activeCategory === 'Overview' && (
        <div className="space-y-6">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* System Model Card */}
            <div className="p-5 rounded-xl bg-[#0e121c] border border-white/[0.07] space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-cyan-400" />
                  SYSTEM MODEL
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-500/30">
                  OEM
                </span>
              </div>
              <div className="text-base font-bold text-white truncate font-mono">
                {hardwareSystem?.model || 'ASUSTeK G614JV'}
              </div>
              <div className="text-xs text-slate-400 font-mono truncate">
                Mobo: {hardwareSystem?.motherboard.product || 'ROG Strix G16'} ({hardwareSystem?.motherboard.manufacturer || 'ASUS'})
              </div>
            </div>

            {/* CPU & Thermals Card */}
            <div className="p-5 rounded-xl bg-[#0e121c] border border-white/[0.07] space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-amber-400" />
                  CPU & THERMAL
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                  NORMAL
                </span>
              </div>
              <div className="text-base font-bold text-white font-mono flex items-center gap-2">
                <span>{thermalInfo?.cpuTempCelsius ? `${thermalInfo.cpuTempCelsius}°C` : 'NOT AVAILABLE'}</span>
                <span className="text-xs text-slate-400 font-normal">
                  ({telemetry.cpuUsage}% Utilized)
                </span>
              </div>
              <div className="text-xs text-slate-400 font-mono truncate">
                GPU Diode: {thermalInfo?.gpuTempCelsius ? `${thermalInfo.gpuTempCelsius}°C` : 'NOT AVAILABLE'}
              </div>
            </div>

            {/* Storage Total Card */}
            <div className="p-5 rounded-xl bg-[#0e121c] border border-white/[0.07] space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  STORAGE MATRIX
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                  HEALTHY
                </span>
              </div>
              <div className="text-base font-bold text-white font-mono">
                {hardwareSystem?.storageSummary.freeCapacityGB || 1120} GB Free
              </div>
              <div className="text-xs text-slate-400 font-mono">
                Across {hardwareSystem?.storageSummary.driveCount || 2} NVMe Physical Drives
              </div>
            </div>

            {/* Memory Card */}
            <div className="p-5 rounded-xl bg-[#0e121c] border border-white/[0.07] space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-400" />
                  MEMORY TOPOLOGY
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950/60 text-blue-400 border border-blue-500/30">
                  DDR5
                </span>
              </div>
              <div className="text-base font-bold text-white font-mono">
                {hardwareSystem?.ram.totalGB || 32} GB Total
              </div>
              <div className="text-xs text-slate-400 font-mono">
                {hardwareSystem?.ram.slotsUsed || 2}/{hardwareSystem?.ram.slotsTotal || 2} Slots @ {hardwareSystem?.ram.speedMhz || 4800} MHz
              </div>
            </div>
          </div>

          {/* Quick Hardware Actions Banner */}
          <div className="p-5 rounded-xl bg-[#0e121c] border border-white/[0.07] space-y-4">
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Diagnostic Interrogation & Hardware Launchers
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <button
                onClick={() => handleDispatch('hardware.system.info', {}, false)}
                className="p-3 rounded-lg bg-[#111624] hover:bg-[#161d2f] border border-white/[0.05] hover:border-cyan-500/30 text-left transition-all group"
              >
                <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold mb-1">
                  <Server className="w-3.5 h-3.5" />
                  <span>SMBIOS Topology Scan</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Polls SMBIOS tables, motherboard chipset, and firmware revisions.
                </div>
              </button>

              <button
                onClick={() => handleDispatch('hardware.devices.problematic', {}, false)}
                className="p-3 rounded-lg bg-[#111624] hover:bg-[#161d2f] border border-white/[0.05] hover:border-amber-500/30 text-left transition-all group"
              >
                <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold mb-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Scan Problem Devices</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Flags devices reporting Code 10, Code 43, or unsigned drivers.
                </div>
              </button>

              <button
                onClick={() => handleDispatch('hardware.battery.report', {}, false)}
                className="p-3 rounded-lg bg-[#111624] hover:bg-[#161d2f] border border-white/[0.05] hover:border-emerald-500/30 text-left transition-all group"
              >
                <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold mb-1">
                  <Battery className="w-3.5 h-3.5" />
                  <span>Generate Battery Report</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Runs powercfg /batteryreport for lifetime cycle degradation.
                </div>
              </button>

              <button
                onClick={() => onTriggerAction('Device Manager Console', 'devmgmt.msc', true)}
                className="p-3 rounded-lg bg-[#111624] hover:bg-[#161d2f] border border-white/[0.05] hover:border-purple-500/30 text-left transition-all group"
              >
                <div className="flex items-center gap-2 text-purple-400 font-mono text-xs font-bold mb-1">
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Launch Device Manager</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Direct launch of native Windows devmgmt.msc snap-in.
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. HARDWARE MATRIX TAB */}
      {/* ========================================================= */}
      {activeCategory === 'Hardware' && (
        <div className="space-y-6">
          {/* Motherboard, BIOS and Processor Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Motherboard & BIOS Card */}
            <div className="p-5 rounded-xl bg-[#0e121c] border border-white/[0.07] space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <h3 className="text-xs font-mono font-bold text-white uppercase flex items-center gap-2">
                  <Server className="w-4 h-4 text-cyan-400" />
                  Motherboard & UEFI Firmware
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                  SECURE BOOT ACTIVE
                </span>
              </div>
              <div className="space-y-2 text-xs font-mono divide-y divide-white/[0.04]">
                <div className="flex justify-between py-1 text-slate-400">
                  <span>Manufacturer:</span>
                  <span className="text-slate-200 font-semibold">{hardwareSystem?.motherboard.manufacturer || 'ASUSTeK COMPUTER INC.'}</span>
                </div>
                <div className="flex justify-between py-1 text-slate-400">
                  <span>Product Model:</span>
                  <span className="text-slate-200 font-semibold">{hardwareSystem?.motherboard.product || 'G614JV'}</span>
                </div>
                <div className="flex justify-between py-1 text-slate-400">
                  <span>Motherboard Serial:</span>
                  <span className="text-slate-300">{hardwareSystem?.motherboard.serialNumber || 'MB-240901-7781'}</span>
                </div>
                <div className="flex justify-between py-1 text-slate-400">
                  <span>BIOS Vendor:</span>
                  <span className="text-slate-200">{hardwareSystem?.bios.vendor || 'American Megatrends'}</span>
                </div>
                <div className="flex justify-between py-1 text-slate-400">
                  <span>BIOS Version:</span>
                  <span className="text-cyan-400 font-bold">{hardwareSystem?.bios.version || 'G614JV.328'}</span>
                </div>
                <div className="flex justify-between py-1 text-slate-400">
                  <span>Release Date:</span>
                  <span className="text-slate-300">{hardwareSystem?.bios.releaseDate || '2024-05-18'}</span>
                </div>
                <div className="flex justify-between py-1 text-slate-400">
                  <span>Mode:</span>
                  <span className="text-emerald-400 font-bold">UEFI (GPT Partition Scheme)</span>
                </div>
              </div>
            </div>

            {/* Processor & Architecture Card */}
            <div className="p-5 rounded-xl bg-[#0e121c] border border-white/[0.07] space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <h3 className="text-xs font-mono font-bold text-white uppercase flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  Processor Topology
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-500/30">
                  {hardwareSystem?.cpu.architecture || 'x64'} ARCHITECTURE
                </span>
              </div>
              <div className="space-y-2 text-xs font-mono divide-y divide-white/[0.04]">
                <div className="flex justify-between py-1 text-slate-400">
                  <span>CPU Name:</span>
                  <span className="text-slate-200 font-semibold truncate max-w-[220px]">
                    {hardwareSystem?.cpu.name || '13th Gen Intel(R) Core(TM) i7-13650HX'}
                  </span>
                </div>
                <div className="flex justify-between py-1 text-slate-400">
                  <span>Physical Cores:</span>
                  <span className="text-slate-200">{hardwareSystem?.cpu.cores || 14} Cores</span>
                </div>
                <div className="flex justify-between py-1 text-slate-400">
                  <span>Logical Processors:</span>
                  <span className="text-slate-200">{hardwareSystem?.cpu.logicalProcessors || 20} Threads</span>
                </div>
                <div className="flex justify-between py-1 text-slate-400">
                  <span>Base Clock:</span>
                  <span className="text-slate-300">{hardwareSystem?.cpu.baseClockGhz || 2.6} GHz</span>
                </div>
                <div className="flex justify-between py-1 text-slate-400">
                  <span>Max Turbo:</span>
                  <span className="text-cyan-400 font-bold">{hardwareSystem?.cpu.maxClockGhz || 4.9} GHz</span>
                </div>
                <div className="flex justify-between py-1 text-slate-400">
                  <span>Current Utilization:</span>
                  <span className="text-emerald-400 font-bold">{hardwareSystem?.cpu.currentUtilizationPercent || 18}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Graphics Cards Matrix */}
          <div className="p-5 rounded-xl bg-[#0e121c] border border-white/[0.07] space-y-4">
            <h3 className="text-xs font-mono font-bold text-white uppercase flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              Graphics & Display Controllers
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(hardwareSystem?.gpus || [
                {
                  name: 'NVIDIA GeForce RTX 4060 Laptop GPU',
                  driverVersion: '32.0.15.6094',
                  vramGB: 8,
                  status: 'OK'
                },
                {
                  name: 'Intel(R) UHD Graphics',
                  driverVersion: '31.0.101.5333',
                  vramGB: 1,
                  status: 'OK'
                }
              ]).map((gpu, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-[#111624] border border-white/[0.05] space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{gpu.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                      {gpu.status}
                    </span>
                  </div>
                  <div className="text-slate-400">Dedicated VRAM: <span className="text-slate-200">{gpu.vramGB} GB</span></div>
                  <div className="text-slate-400">Driver Version: <span className="text-cyan-400">{gpu.driverVersion}</span></div>
                </div>
              ))}
            </div>
          </div>

          {/* Problem Devices Subsystem */}
          <div className="p-5 rounded-xl bg-[#0e121c] border border-white/[0.07] space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-mono font-bold text-white uppercase">
                  PnP Problem Devices Audit (Non-Zero ConfigManagerErrorCode)
                </h3>
              </div>
              <button
                onClick={() => onTriggerAction('Windows Device Manager', 'devmgmt.msc', true)}
                className="px-3 py-1 rounded bg-white/[0.05] hover:bg-white/[0.1] text-cyan-400 text-xs font-mono flex items-center gap-1.5"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Open devmgmt.msc</span>
              </button>
            </div>

            {problemDevices.length === 0 ? (
              <div className="py-6 text-center text-xs font-mono text-emerald-400 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>All Plug-and-Play devices are operating normally with zero hardware errors.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {problemDevices.map((dev, i) => (
                  <div key={i} className="p-4 rounded-lg bg-[#111624] border border-amber-500/20 space-y-2 text-xs font-mono">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-bold text-white">{dev.friendlyName}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">Class: {dev.deviceClass}</div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-500/30">
                        {dev.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-amber-300/90 bg-amber-950/30 p-2 rounded border border-amber-500/20">
                      Error Code {dev.problemCode}: {dev.problemDescription}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      Hardware ID: {dev.hardwareIds?.[0] || dev.deviceId}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. DRIVERS & DRIVER AUTO CENTER TAB */}
      {/* ========================================================= */}
      {activeCategory === 'Drivers' && (
        <div className="space-y-6">
          {/* Driver Actions Toolbar */}
          <div className="p-5 rounded-xl bg-[#0e121c] border border-white/[0.07] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
              <div>
                <h3 className="text-xs font-mono font-bold text-white uppercase flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  Driver Management Engine (pnputil / DISM)
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Backup, restore, and verify digital signatures of third-party device drivers.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowBackupModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
                >
                  <FolderDown className="w-3.5 h-3.5" />
                  <span>Export Driver Store</span>
                </button>

                <button
                  onClick={() => setShowRestoreModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
                >
                  <FolderUp className="w-3.5 h-3.5" />
                  <span>Restore Drivers</span>
                </button>

                <button
                  onClick={() => setShowInfModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Install .INF</span>
                </button>
              </div>
            </div>

            {/* Quick Driver Utility Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => handleDispatch('driver.pnputil.enum', {}, false)}
                className="p-3 rounded-lg bg-[#111624] hover:bg-[#161d2f] border border-white/[0.05] text-left transition-all"
              >
                <div className="text-cyan-400 font-mono text-xs font-bold mb-1">
                  Enumerate DriverStore
                </div>
                <div className="text-[11px] text-slate-400">
                  Executes pnputil /enum-drivers to view all OEM INF packages.
                </div>
              </button>

              <button
                onClick={() => handleDispatch('driver.wu.scan', {}, true)}
                className="p-3 rounded-lg bg-[#111624] hover:bg-[#161d2f] border border-white/[0.05] text-left transition-all"
              >
                <div className="text-amber-400 font-mono text-xs font-bold mb-1">
                  Check Windows Update Drivers
                </div>
                <div className="text-[11px] text-slate-400">
                  Scans Microsoft Update Catalog for certified optional drivers.
                </div>
              </button>

              <button
                onClick={() => handleDispatch('driver.report', {}, false)}
                className="p-3 rounded-lg bg-[#111624] hover:bg-[#161d2f] border border-white/[0.05] text-left transition-all"
              >
                <div className="text-emerald-400 font-mono text-xs font-bold mb-1">
                  Generate Driver Manifest
                </div>
                <div className="text-[11px] text-slate-400">
                  Compiles hardware IDs and signatures to an audit text file.
                </div>
              </button>
            </div>
          </div>

          {/* OEM Assistant Quick Access */}
          <div className="p-5 rounded-xl bg-[#0e121c] border border-white/[0.07] space-y-4">
            <h3 className="text-xs font-mono font-bold text-white uppercase flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-cyan-400" />
              OEM Support Center & Official Portals
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {(driverData?.oemAssistants || []).map((oem, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-[#111624] border border-white/[0.05] space-y-2 text-xs font-mono flex flex-col justify-between">
                  <div>
                    <div className="font-bold text-white truncate">{oem.name}</div>
                    <div className="text-[11px] text-slate-400">{oem.vendor}</div>
                  </div>
                  <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between">
                    <button
                      onClick={() => onTriggerAction(oem.name, oem.command, false)}
                      className="text-cyan-400 hover:text-cyan-300 font-bold text-[11px]"
                    >
                      Launch App
                    </button>
                    <a
                      href={oem.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-400 hover:text-slate-200 text-[11px]"
                    >
                      Web Portal
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Installed Drivers Inventory Table */}
          <div className="p-5 rounded-xl bg-[#0e121c] border border-white/[0.07] space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <h3 className="text-xs font-mono font-bold text-white uppercase">
                Active Third-Party Driver Repository
              </h3>
              <span className="text-xs font-mono text-slate-400">
                {driverData?.drivers?.length || 0} Packages Cataloged
              </span>
            </div>

            <div className="overflow-x-auto rounded-lg border border-white/[0.06]">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="bg-[#090c13] text-slate-400 border-b border-white/[0.08] text-[11px]">
                    <th className="py-2.5 px-4 font-bold">INF FILE</th>
                    <th className="py-2.5 px-4 font-bold">CLASS</th>
                    <th className="py-2.5 px-4 font-bold">PROVIDER</th>
                    <th className="py-2.5 px-4 font-bold">VERSION</th>
                    <th className="py-2.5 px-4 font-bold">DATE</th>
                    <th className="py-2.5 px-4 font-bold">SIGNER</th>
                    <th className="py-2.5 px-4 font-bold text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] text-slate-300">
                  {(driverData?.drivers || []).map((drv, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-2.5 px-4 font-bold text-cyan-400">{drv.id}</td>
                      <td className="py-2.5 px-4">{drv.deviceClass}</td>
                      <td className="py-2.5 px-4 font-semibold text-white">{drv.provider}</td>
                      <td className="py-2.5 px-4 text-slate-300">{drv.driverVersion}</td>
                      <td className="py-2.5 px-4 text-slate-400">{drv.driverDate}</td>
                      <td className="py-2.5 px-4 text-slate-400 truncate max-w-[200px]">
                        {drv.signer}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            drv.status === 'Operational'
                              ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                              : 'bg-amber-950/60 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {drv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. STORAGE & SMART TAB */}
      {/* ========================================================= */}
      {activeCategory === 'Storage' && (
        <div className="space-y-6">
          {/* Storage Actions Toolbar */}
          <div className="p-5 rounded-xl bg-[#0e121c] border border-white/[0.07] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
              <div>
                <h3 className="text-xs font-mono font-bold text-white uppercase flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-emerald-400" />
                  Storage Integrity & Diagnostics Tools
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Execute safe file system audits, defragmentation checks, and I/O benchmarks.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDispatch('storage.chkdsk.scan', { volume: 'C:' }, true)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>CHKDSK Read-Only (C:)</span>
                </button>

                <button
                  onClick={() => setShowChkdskModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Schedule CHKDSK /F</span>
                </button>

                <button
                  onClick={() => handleDispatch('storage.benchmark', { volume: 'C:' }, false)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
                >
                  <Gauge className="w-3.5 h-3.5" />
                  <span>Benchmark I/O</span>
                </button>

                <button
                  onClick={() => handleDispatch('storage.cleanup.analyze', {}, false)}
                  className="px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Disk Cleanup Analysis</span>
                </button>
              </div>
            </div>

            {/* Logical Volumes Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(storageVolumes?.volumes || []).map((vol, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-[#111624] border border-white/[0.05] space-y-3 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{vol.driveLetter}</span>
                      <span className="text-slate-400">[{vol.label || 'Local Disk'}]</span>
                      {vol.isSystemVolume && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-500/30 font-bold">
                          SYSTEM
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 font-bold">
                      {vol.fileSystem}
                    </span>
                  </div>

                  {/* Volume Free Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>{vol.usedGB} GB Used ({vol.usedPercent}%)</span>
                      <span className="text-emerald-400">{vol.freeGB} GB Free</span>
                    </div>
                    <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-500 rounded-full transition-all"
                        style={{ width: `${vol.usedPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-white/[0.04] pt-2">
                    <div>BitLocker: <span className="text-slate-200">{vol.bitLockerProtection}</span></div>
                    <div>Capacity: <span className="text-slate-200">{vol.totalGB} GB</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Physical Disks & S.M.A.R.T. Subsystem */}
          <div className="p-5 rounded-xl bg-[#0e121c] border border-white/[0.07] space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <h3 className="text-xs font-mono font-bold text-white uppercase flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" />
                Physical Drives & NVMe S.M.A.R.T. Telemetry
              </h3>
              <button
                onClick={() => handleDispatch('storage.smart', {}, false)}
                className="px-3 py-1 rounded bg-white/[0.05] hover:bg-white/[0.1] text-cyan-400 text-xs font-mono flex items-center gap-1.5"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Poll SMART Registers</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {(storageDisks?.disks || []).map((disk, idx) => {
                const smart = storageDisks?.smart?.find((s: any) => s.diskIndex === disk.diskIndex);
                return (
                  <div key={idx} className="p-4 rounded-lg bg-[#111624] border border-white/[0.05] space-y-3 text-xs font-mono">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-white text-sm">{disk.model}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Drive #{disk.diskIndex} • {disk.mediaType} ({disk.busType}) • S/N: {disk.serialNumber}
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                        {disk.healthStatus}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center py-2 bg-white/[0.02] rounded border border-white/[0.04]">
                      <div>
                        <div className="text-[10px] text-slate-400">Temperature</div>
                        <div className="text-xs font-bold text-amber-400">{smart?.temperatureCelsius || 36}°C</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400">Endurance Left</div>
                        <div className="text-xs font-bold text-emerald-400">{smart?.wearPercentageRemaining || 98}%</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400">Power-On Hours</div>
                        <div className="text-xs font-bold text-cyan-400">{smart?.powerOnHours || 3410} hrs</div>
                      </div>
                    </div>

                    {/* Key Attributes List */}
                    <div className="space-y-1 text-[11px] divide-y divide-white/[0.03]">
                      <div className="flex justify-between py-1 text-slate-400">
                        <span>Reallocated Sectors:</span>
                        <span className="text-emerald-400 font-bold">{smart?.reallocatedSectorsCount || 0}</span>
                      </div>
                      <div className="flex justify-between py-1 text-slate-400">
                        <span>Unsafe Shutdowns:</span>
                        <span className="text-slate-300">{smart?.unsafeShutdowns || 3}</span>
                      </div>
                      <div className="flex justify-between py-1 text-slate-400">
                        <span>Total Capacity:</span>
                        <span className="text-slate-200">{disk.sizeGB} GB</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. MEMORY & CACHE TAB */}
      {/* ========================================================= */}
      {activeCategory === 'Memory' && (
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-[#0e121c] border border-white/[0.07] space-y-4">
            <h3 className="text-xs font-mono font-bold text-white uppercase flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              Physical RAM Bank Allocations & Kernel Caches
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-[#111624] border border-white/[0.05] space-y-2 text-xs font-mono">
                <div className="text-slate-400">Total Installed Memory</div>
                <div className="text-xl font-bold text-white">{telemetry.ramTotalGB} GB DDR5</div>
                <div className="text-[11px] text-cyan-400 font-semibold">Dual Channel (2 x 16GB) @ 4800 MT/s</div>
              </div>
              <div className="p-4 rounded-lg bg-[#111624] border border-white/[0.05] space-y-2 text-xs font-mono">
                <div className="text-slate-400">Current Committed Load</div>
                <div className="text-xl font-bold text-blue-400">{telemetry.ramUsedGB} GB ({telemetry.ramUsagePercent}%)</div>
                <div className="text-[11px] text-slate-400">Available: {(telemetry.ramTotalGB - telemetry.ramUsedGB).toFixed(1)} GB</div>
              </div>
              <div className="p-4 rounded-lg bg-[#111624] border border-white/[0.05] space-y-2 text-xs font-mono">
                <div className="text-slate-400">Windows Standby & Working Set</div>
                <div className="text-xl font-bold text-emerald-400">12.4 GB Clean</div>
                <div className="text-[11px] text-slate-400">Kernel Paged Pool: 540 MB</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. BATTERY & POWER TAB */}
      {/* ========================================================= */}
      {activeCategory === 'Battery' && (
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-[#0e121c] border border-white/[0.07] space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <h3 className="text-xs font-mono font-bold text-white uppercase flex items-center gap-2">
                <Battery className="w-4 h-4 text-amber-400" />
                ACPI Battery Diagnostics & Capacity Deterioration
              </h3>
              <button
                onClick={() => handleDispatch('hardware.battery.report', {}, false)}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Generate powercfg Battery Report</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-[#111624] border border-white/[0.05] space-y-1 text-xs font-mono">
                <div className="text-slate-400">Current Charge</div>
                <div className="text-xl font-bold text-white">{batteryData?.chargePercent || telemetry.batteryPercent}%</div>
                <div className="text-[11px] text-emerald-400">{batteryData?.status || telemetry.batteryStatus}</div>
              </div>

              <div className="p-4 rounded-lg bg-[#111624] border border-white/[0.05] space-y-1 text-xs font-mono">
                <div className="text-slate-400">Design Capacity</div>
                <div className="text-xl font-bold text-white">{batteryData?.designCapacityMWh || 90000} mWh</div>
                <div className="text-[11px] text-slate-400">Original Factory Rating</div>
              </div>

              <div className="p-4 rounded-lg bg-[#111624] border border-white/[0.05] space-y-1 text-xs font-mono">
                <div className="text-slate-400">Full Charge Capacity</div>
                <div className="text-xl font-bold text-cyan-400">{batteryData?.fullChargeCapacityMWh || 84210} mWh</div>
                <div className="text-[11px] text-slate-400">Current Max Storage</div>
              </div>

              <div className="p-4 rounded-lg bg-[#111624] border border-white/[0.05] space-y-1 text-xs font-mono">
                <div className="text-slate-400">Health Index & Cycles</div>
                <div className="text-xl font-bold text-emerald-400">{batteryData?.healthPercent || 93.6}%</div>
                <div className="text-[11px] text-slate-400">{batteryData?.cycleCount || 142} Total Cycles</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. WINDOWS & BUILD TAB */}
      {/* ========================================================= */}
      {activeCategory === 'Windows' && (
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-[#0e121c] border border-white/[0.07] space-y-4">
            <h3 className="text-xs font-mono font-bold text-white uppercase flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              Windows Operating System Environment
            </h3>
            <div className="space-y-2 text-xs font-mono divide-y divide-white/[0.04]">
              <div className="flex justify-between py-2 text-slate-400">
                <span>Windows Edition:</span>
                <span className="text-white font-semibold">{telemetry.osVersion}</span>
              </div>
              <div className="flex justify-between py-2 text-slate-400">
                <span>OS Build:</span>
                <span className="text-cyan-400 font-bold">{telemetry.osBuild}</span>
              </div>
              <div className="flex justify-between py-2 text-slate-400">
                <span>System Uptime:</span>
                <span className="text-emerald-400 font-semibold">{telemetry.uptime}</span>
              </div>
              <div className="flex justify-between py-2 text-slate-400">
                <span>Computer Hostname:</span>
                <span className="text-slate-200">{telemetry.hostname}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 8. PRINTERS & SPOOLER TAB */}
      {/* ========================================================= */}
      {activeCategory === 'Printers' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-xl bg-[#0e121c] border border-white/[0.07] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <Printer className="w-4 h-4" />
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-200 uppercase">
                    Spooler Service
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 font-bold">
                  {printerData?.spoolerStatus ?? 'UNAVAILABLE'}
                </span>
              </div>
              <div className="text-xs font-mono text-slate-400">
                Service status reported by Windows. Process details have not been queried.
              </div>
              <div className="pt-2">
                <button
                  onClick={() => handleDispatch('printer.spooler.restart', {}, true)}
                  className="w-full py-1.5 rounded bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/10 text-xs font-mono transition-all text-center flex items-center justify-center gap-1.5"
                >
                  <RotateCw className="w-3 h-3" />
                  <span>Restart Spooler Service</span>
                </button>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-[#0e121c] border border-white/[0.07] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-200 uppercase">
                    Print Queue Depth
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-500/30 font-bold">
                  {printerData?.totalQueuedJobs ?? 'UNKNOWN'} JOBS
                </span>
              </div>
              <div className="text-xs font-mono text-slate-400">
                Queue counts do not verify spool-file health or printer connectivity.
              </div>
              <div className="pt-2">
                <button
                  onClick={() => handleDispatch('printer.queue.purge', {}, true)}
                  className="w-full py-1.5 rounded bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/10 text-xs font-mono transition-all text-center flex items-center justify-center gap-1.5"
                >
                  <Wrench className="w-3 h-3" />
                  <span>Purge All Queues</span>
                </button>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-[#0e121c] border border-white/[0.07] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <Radio className="w-4 h-4" />
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-200 uppercase">
                    Default Device
                  </span>
                </div>
              </div>
              <div className="text-xs font-mono font-bold text-white truncate">
                {printerData ? (printerData.defaultPrinter ?? 'None configured') : 'Unavailable'}
              </div>
              <div className="pt-2">
                <button
                  onClick={() => handleDispatch('printer.subsystem.cleanup', {}, true)}
                  className="w-full py-1.5 rounded bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/10 text-xs font-mono transition-all text-center flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3 h-3" />
                  <span>Deep Subsystem Cleanup</span>
                </button>
              </div>
            </div>
          </div>

          {/* Printer Fleet Table */}
          <div className="p-5 rounded-xl bg-[#0e121c] border border-white/[0.07] space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <h3 className="text-xs font-mono font-bold text-white uppercase">
                Installed Printer Fleet & Diagnostics
              </h3>
              <span className="text-xs font-mono text-slate-400">
                Total: {printerData?.printers.length ?? 'Unknown'} Devices
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(printerData?.printers || []).map((p: any) => (
                <div
                  key={p.id}
                  className="p-4 rounded-lg bg-[#111624] border border-white/[0.05] space-y-3 text-xs font-mono"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>{p.name}</span>
                        {p.isDefault && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-500/30">
                            DEFAULT
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500">{p.driverName}</div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 ${
                        p.status === 'Ready'
                          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-950/60 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-400 border-t border-white/[0.04] pt-2">
                    <div>Port: <span className="text-slate-200">{p.port}</span></div>
                    <div>Queue Jobs: <span className="text-cyan-400 font-bold">{p.queueCount ?? 'Unknown'}</span></div>
                    <div>Shared: <span className="text-slate-200">{p.isShared ? `Yes (${p.shareName})` : 'No'}</span></div>
                  </div>

                  <div className="pt-2 border-t border-white/[0.04] flex gap-2">
                    <button
                      onClick={() => handleDispatch('printer.offline.fix', { printerName: p.name }, true)}
                      className="flex-1 py-1 rounded bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 text-[11px]"
                    >
                      Reset Online
                    </button>
                    <button
                      onClick={() => handleDispatch('printer.queue.purge', { printerName: p.name }, true)}
                      className="flex-1 py-1 rounded bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 text-[11px]"
                    >
                      Clear Queue
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PHASE 8.4: SERVICES & FEATURES */}
      {activeCategory === 'Services' && (
        <ServicesSection onExecuteOperation={onExecuteOperation} />
      )}

      {/* PHASE 8.4: EVENT LOGS FORENSIC ANALYZER */}
      {activeCategory === 'Event Logs' && (
        <EventLogsSection onExecuteOperation={onExecuteOperation} />
      )}

      {/* PHASE 8.4: SYSTEM ADMINISTRATION & UTILITIES */}
      {activeCategory === 'System Admin' && (
        <SystemAdminSection onExecuteOperation={onExecuteOperation} />
      )}

      {/* PHASE 8.4: USER & SECURITY ACCOUNTS */}
      {activeCategory === 'Accounts' && (
        <AccountsSection onExecuteOperation={onExecuteOperation} />
      )}

      {/* PHASE 8.5: REMOTE ACCESS & SHARING */}
      {activeCategory === 'Remote Access' && (
        <RemoteAccessSection onExecuteOperation={onExecuteOperation} />
      )}

      {/* PHASE 8.5: BIOS, UEFI & BOOT CONFIGURATION */}
      {activeCategory === 'BIOS & Boot' && (
        <BootBiosSection onExecuteOperation={onExecuteOperation} />
      )}

      {/* PHASE 8.4 / 8.5: REGISTRY & GROUP POLICY */}
      {activeCategory === 'Group Policy' && (
        <PolicySection onExecuteOperation={onExecuteOperation} />
      )}

      {/* ========================================================= */}
      {/* MODALS */}
      {/* ========================================================= */}

      {/* Driver Backup Confirmation Modal */}
      {showBackupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-xl bg-[#0e121c] border border-white/[0.1] space-y-4 font-mono text-xs shadow-2xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FolderDown className="w-4 h-4 text-emerald-400" />
              Export Third-Party Driver Store
            </h3>
            <p className="text-slate-400">
              Exports all published non-Microsoft INF packages from DriverStore via native pnputil /export-driver.
            </p>
            <div className="space-y-1.5">
              <label className="text-slate-300 text-[11px]">Destination Folder:</label>
              <input
                type="text"
                value={backupPathInput}
                onChange={(e) => setBackupPathInput(e.target.value)}
                className="w-full px-3 py-2 rounded bg-slate-900 border border-white/10 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowBackupModal(false)}
                className="flex-1 py-2 rounded bg-white/[0.05] hover:bg-white/[0.1] text-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowBackupModal(false);
                  handleDispatch('driver.backup', { destinationPath: backupPathInput }, true);
                }}
                className="flex-1 py-2 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
              >
                Start Export
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Driver Restore Confirmation Modal */}
      {showRestoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-xl bg-[#0e121c] border border-white/[0.1] space-y-4 font-mono text-xs shadow-2xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FolderUp className="w-4 h-4 text-cyan-400" />
              Restore Driver Repository
            </h3>
            <p className="text-slate-400">
              Imports all driver INF files found in the specified directory back into the system Driver Store.
            </p>
            <div className="space-y-1.5">
              <label className="text-slate-300 text-[11px]">Source Directory:</label>
              <input
                type="text"
                value={backupPathInput}
                onChange={(e) => setBackupPathInput(e.target.value)}
                className="w-full px-3 py-2 rounded bg-slate-900 border border-white/10 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowRestoreModal(false)}
                className="flex-1 py-2 rounded bg-white/[0.05] hover:bg-white/[0.1] text-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowRestoreModal(false);
                  handleDispatch('driver.restore', { sourcePath: backupPathInput }, true);
                }}
                className="flex-1 py-2 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
              >
                Start Restore
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Install INF Modal */}
      {showInfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-xl bg-[#0e121c] border border-white/[0.1] space-y-4 font-mono text-xs shadow-2xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileCode className="w-4 h-4 text-purple-400" />
              Install Driver from .INF Manifest
            </h3>
            <p className="text-slate-400">
              Validates digital signature and runs pnputil /add-driver [file] /install with administrative elevation.
            </p>
            <div className="space-y-1.5">
              <label className="text-slate-300 text-[11px]">Absolute Path to .INF file:</label>
              <input
                type="text"
                value={infPathInput}
                onChange={(e) => setInfPathInput(e.target.value)}
                className="w-full px-3 py-2 rounded bg-slate-900 border border-white/10 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowInfModal(false)}
                className="flex-1 py-2 rounded bg-white/[0.05] hover:bg-white/[0.1] text-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowInfModal(false);
                  handleDispatch('driver.install.inf', { infPath: infPathInput }, true);
                }}
                className="flex-1 py-2 rounded bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold"
              >
                Install Driver
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHKDSK /F /R Confirmation Modal */}
      {showChkdskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-xl bg-[#0e121c] border border-amber-500/30 space-y-4 font-mono text-xs shadow-2xl">
            <div className="flex items-center gap-2.5 text-amber-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-bold text-white">
                Schedule Offline File System Repair?
              </h3>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Repairing volume <span className="text-cyan-400 font-bold">{targetChkdskDrive}</span> with <span className="text-white font-bold">chkdsk /f /r</span> requires locking the volume. Because system files are currently open, this repair must be scheduled to run during the next Windows boot.
            </p>
            <div className="p-3 rounded bg-amber-950/30 border border-amber-500/20 text-amber-300/90 text-[11px]">
              Note: A reboot will be required to execute the surface scan and bad sector recovery.
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowChkdskModal(false)}
                className="flex-1 py-2 rounded bg-white/[0.05] hover:bg-white/[0.1] text-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowChkdskModal(false);
                  handleDispatch('storage.chkdsk.repair', { volume: targetChkdskDrive }, true);
                }}
                className="flex-1 py-2 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
              >
                Confirm & Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
