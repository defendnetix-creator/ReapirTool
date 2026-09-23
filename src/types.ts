export type TabType =
  | 'dashboard'
  | 'diagnostics'
  | 'repairs'
  | 'performance'
  | 'command-vault'
  | 'network'
  | 'software'
  | 'security'
  | 'ai-copilot'
  | 'reports'
  | 'subscription'
  | 'settings';

export interface HardwareTelemetry {
  cpuUsage: number;
  cpuModel: string;
  cpuCores: number;
  cpuFrequency: string;
  ramUsagePercent: number;
  ramUsedGB: number;
  ramTotalGB: number;
  diskUsagePercent: number;
  diskUsedGB: number;
  diskTotalGB: number;
  diskHealth: string;
  netRxMbps: number;
  netTxMbps: number;
  netLatencyMs: number;
  batteryPercent: number;
  batteryStatus: string;
  osVersion: string;
  osBuild: string;
  uptime: string;
  hostname: string;
  ipAddress: string;
  macAddress: string;
  defenderStatus: 'Protected' | 'Warning' | 'Disabled';
  firewallStatus: 'Active' | 'Inactive';
  lastScanTime: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  scope: string;
  event: string;
  target: string;
  status: 'SUCCESS' | 'WARN' | 'FAIL' | 'AUTH OK';
  durationMs?: number;
}

export interface QuickActionItem {
  id: string;
  title: string;
  category: string;
  description: string;
  requiresAdmin: boolean;
  impact: 'Safe' | 'Moderate' | 'High';
  actionCommand: string;
}

export interface RepairToolItem {
  id: string;
  operationId?: string;
  params?: Record<string, any>;
  category: 'Windows Repairs' | 'Network Repairs' | 'Printer Repairs' | 'Recovery & Restore' | 'System Maintenance';
  title: string;
  description: string;
  estimatedDuration: string;
  requiresAdmin: boolean;
  requiresRestart: boolean;
  actionCommand: string;
  icon: string;
  details: string[];
}

export interface SoftwareItem {
  id: string;
  name: string;
  publisher: string;
  version: string;
  installDate: string;
  sizeMB: number;
  updateAvailable: boolean;
  latestVersion?: string;
  category: string;
}

export interface SystemReportItem {
  id: string;
  title: string;
  timestamp: string;
  type: 'Full Diagnostic' | 'Security Audit' | 'Hardware Health' | 'Network Test' | 'Repair Log';
  status: 'Complete' | 'Archived' | 'Failed';
  fileSize: string;
  summary: string;
}

export interface ToastMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: number;
}
