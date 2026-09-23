# UI-to-Backend Feature Mapping Matrix
**Product:** ASHtech PC Toolkit Pro v8.0.0  
**Status:** Connected & Validated Against Canonical Backend  

---

| UI Page | UI Component | Action | Backend Operation | Source Module | Privilege Required | Status |
|---|---|---|---|---|---|---|
| **Dashboard** | Hero Healing Banner | "Trigger Full Healing" | `Invoke-FullHealing` | `Modules/OneClickSuperRepair.ps1` | Administrator | CONNECTED |
| **Dashboard** | Quick Actions | "Run Fast PC Scan" | `Invoke-FastScan` | `Modules/SystemInventory.cmd` | User | CONNECTED |
| **Dashboard** | Quick Actions | "Flush DNS & Reset Net" | `Invoke-NetReset` | `Modules/WiFiDiagnostics.cmd` | Administrator | CONNECTED |
| **Dashboard** | Quick Actions | "Optimize Performance"| `Invoke-PerfOptimize` | `Modules/Win11Debloat.ps1` | Administrator | CONNECTED |
| **Dashboard** | Quick Actions | "Update Signatures" | `Invoke-DefenderUpdate` | `Modules/CheckActivation.cmd` | Administrator | CONNECTED |
| **Dashboard** | Copilot Card | "Approve Suggested Flush"| `Invoke-PruneTempFiles` | `Modules/OneClickSuperRepair.ps1` | User | CONNECTED |
| **Dashboard** | Audit Trail | "Export CSV" | `Export-AuditLogs` | `Modules/ToolkitReportCenter.ps1` | User | CONNECTED |
| **Diagnostics** | Hardware Matrix | "Refresh Hardware Vitals" | `Get-HardwareTelemetry` | `Modules/SystemInventoryReport.ps1` | User | CONNECTED |
| **Diagnostics** | Storage Inspector | "Inspect S.M.A.R.T Drive" | `Get-DriveHealth` | `Modules/SystemInventoryReport.ps1` | User | CONNECTED |
| **Diagnostics** | Battery Tab | "Generate Battery Report" | `Invoke-BatteryReport` | `Modules/BatteryReport.cmd` | User | CONNECTED |
| **Repairs** | Windows Repair | "Run SFC File Checker" | `Invoke-SfcScan` | `Modules/OneClickSuperRepair.ps1` | Administrator | CONNECTED |
| **Repairs** | Windows Repair | "Run DISM Health Restore" | `Invoke-DismRestore` | `Modules/OneClickSuperRepair.ps1` | Administrator | CONNECTED |
| **Repairs** | Windows Repair | "Reset Windows Update" | `Invoke-WURepair` | `Modules/OneClickSuperRepair.ps1` | Administrator | CONNECTED |
| **Repairs** | Network Repair | "Reset TCP/IP & Winsock" | `Invoke-NetReset` | `Modules/WiFiDiagnostics.cmd` | Administrator | CONNECTED |
| **Repairs** | Printer Repair | "Restart Print Spooler" | `Invoke-SpoolerRestart` | `Printer_Analyzer_Pro.cs` | Administrator | CONNECTED |
| **Repairs** | Printer Repair | "Purge Stuck Print Queue" | `Invoke-QueuePurge` | `Printer_Analyzer_Pro.cs` | Administrator | CONNECTED |
| **Performance**| Startup Manager | "Toggle Startup Item" | `Set-StartupState` | `Modules/Win11Debloat.ps1` | Administrator | CONNECTED |
| **Performance**| Debloat Preset | "Run Safe Telemetry Trim"| `Invoke-SafeDebloat` | `Modules/Win11Debloat.ps1` | Administrator | CONNECTED |
| **Security** | Defender Health | "Run Quick Malware Scan"| `Start-MpQuickScan` | `Modules/CheckActivation.cmd` | User | CONNECTED |
| **Security** | Defender Health | "Verify Firewall Rules"| `Get-NetFirewallProfile` | `Modules/CheckActivation.cmd` | User | CONNECTED |
| **AI Copilot** | Prompt Input | "Ask Copilot Question" | `Invoke-AIInference` | `Modules/WebBridgeServer.ps1` (Local Heuristic Safe API) | User | CONNECTED |
| **Reports** | Report Center | "Generate System Report"| `Invoke-GenerateReport` | `Modules/ToolkitReportCenter.ps1` | User | CONNECTED |
| **Subscription**| Plan Card | "Enter License Key" | UI Shell (Mock Dialog) | Planned Phase 5 | User | UI_SHELL_ONLY |
| **Settings** | General / Theme | "Toggle Theme / Port" | Save Preferences (LocalStorage/Bridge) | `Config/gui_settings.cfg` | User | CONNECTED |
