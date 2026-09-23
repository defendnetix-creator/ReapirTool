# Current Architecture Analysis — ASHtech PC Toolkit Pro
**Project:** ASHtech PC Toolkit Pro (Legacy: UltimateToolkit / Akash Toolkit)  
**Document:** Current Architecture (Phase 1 Baseline)  
**Date:** September 2026  
**Status:** Discovery Complete  

---

## 1. Executive Summary & Architectural Overview

The repository represents a hybrid Windows system diagnostic, administration, repair, and optimization suite. Rather than a single unified application, the current architecture is a **heterogeneous multi-tier system** consisting of four distinct runtime surfaces and presentation layers, managed by a C# bootstrapper:

```
                                  ┌──────────────────────────────────────────────┐
                                  │   UltimateToolkit_Bundle_new.exe (.NET 4.0)   │
                                  │  - Program.cs: Unpacks embedded StagingZip   │
                                  │  - LauncherForm.cs: Hosts WinForms IE11      │
                                  │  - ScriptManager.cs: COM automation bridge   │
                                  └──────────────────────┬───────────────────────┘
                                                         │ Extracts to %ProgramData%\UltimateToolkitSuite
                   ┌─────────────────────────────────────┼────────────────────────────────────┐
                   ▼                                     ▼                                    ▼
       ┌────────────────────────┐            ┌──────────────────────┐            ┌────────────────────────┐
       │     V5 Classic GUI     │            │   V6 Web Dashboard   │            │  Printer Analyzer Pro  │
       │   (Toolkit-GUI-Pro.ps1)│            │ (dashboard.html +    │            │ (Printer_Analyzer_Pro) │
       │  - PowerShell WinForms │            │  WebBridgeServer.ps1)│            │  - C# WinForms runner  │
       │  - 30,000+ lines PS1   │            │  - Port 9999 HTTP    │            │  - Spawns Toolkit.bat  │
       │  - Direct native WMI   │            │  - Vanilla JS + CSS  │            │    with --label        │
       └───────────┬────────────┘            └──────────┬───────────┘            └───────────┬────────────┘
                   │                                    │                                    │
                   └────────────────────────────────────┼────────────────────────────────────┘
                                                        ▼
                                       ┌──────────────────────────────────┐
                                       │    Toolkit.bat (Master CLI)      │
                                       │  - 13,000+ lines Batch script    │
                                       │  - 37 operational categories     │
                                       │  - 2,830 discrete options        │
                                       │  - Parameter routing (--label)   │
                                       └──────────────────────────────────┘
```

---

## 2. Component Breakdown

### 2.1 The Launcher Executable (`UltimateToolkit_Bundle_new.exe`)
- **Language / Runtime:** C# targeting .NET Framework 4.0 (x86/x64).
- **Executable Role:** Single-file self-extracting bootstrap wrapper and visual suite selector.
- **Manifest Settings (`app.manifest`):**
  - Requires Administrator (`requestedExecutionLevel level="requireAdministrator" uiAccess="false"`).
  - High-DPI aware declared.
  - OS compatibility manifests for Windows Vista through Windows 10/11.
- **Registry Injection:** Dynamically writes to `HKCU\Software\Microsoft\Internet Explorer\Main\FeatureControl\FEATURE_BROWSER_EMULATION` setting the executable's process value to `11001` (IE11 Edge mode) to prevent the `WebBrowser` control from defaulting to IE7 quirks mode.
- **Embedded Web Engine:** WinForms `System.Windows.Forms.WebBrowser` control loading dynamic HTML generated in memory or via temporary files.
- **COM Interop (`ScriptManager.cs`):** Decorates `ScriptManager` with `[ComVisible(true)]` and registers it as `ObjectForScripting` so that JavaScript running inside the embedded WebBrowser can directly invoke native C# launch methods (`LaunchV5()`, `LaunchV6()`, `LaunchPrinterTool()`, `ExitApplication()`).

### 2.2 V5 Classic GUI (`Modules\Toolkit-GUI-Pro.ps1`)
- **Language / Runtime:** Windows PowerShell 5.1 hosting Windows Forms (`System.Windows.Forms` & `System.Drawing`).
- **Scale:** Over 30,400 lines of procedural PowerShell code.
- **Features:** Standalone desktop window featuring dark/light theme switching, winget package deployment, hardware sensor queries, event viewer log parsing, offline repair automations, and registry tweak catalogs.
- **Invoker:** Launched via `powershell.exe -NoProfile -STA -WindowStyle Hidden -ExecutionPolicy Bypass -File Toolkit-GUI-Pro.ps1` or through compiled helper `V5.exe`.

### 2.3 V6 Web Dashboard (`dashboard.html` + `Modules\WebBridgeServer.ps1`)
- **Frontend (`dashboard.html`):**
  - 417,000+ characters of standalone HTML, inline CSS, and JavaScript.
  - Cyberpunk-styled operations dashboard featuring real-time CPU/RAM meters, active network connection maps, scheduled task tables, process managers, and a chat interface.
- **Backend Bridge Server (`Modules\WebBridgeServer.ps1`):**
  - Over 20,700 lines of PowerShell implementing a custom HTTP server using `System.Net.HttpListener`.
  - Binds to port `9999` across loopback and local IPv4 network adapters.
  - Exposes REST-like JSON endpoints (`/api/status`, `/api/sysinfo`, `/api/metrics`, `/api/run-ps`, `/api/execute-option`, `/api/chat`, etc.).
  - Runs with `Access-Control-Allow-Origin: *` to serve the browser frontend.
- **Launch Harness (`Launch-WebDashboard.cmd`):**
  - Elevates via UAC loop if not elevated.
  - Automatically executes `netsh advfirewall firewall add rule` opening TCP port 9999.
  - Kills any existing PowerShell process listening on port 9999.
  - Spawns `WebBridgeServer.ps1` in a background hidden window.
  - Uses `start http://localhost:9999/dashboard.html` to open the user's default browser.

### 2.4 Printer Analyzer Pro (`Printer_Analyzer_Pro.exe`)
- **Language / Runtime:** C# .NET WinForms launcher.
- **Role:** Dedicated quick-launch executable for printer, print spooler, queue purge, and driver troubleshooting.
- **Invocation Flow:** Triggers `Toolkit.bat --no-elevate --label menu_printer_spooler`.

### 2.5 Master Engine CLI (`Toolkit.bat`)
- **Language / Runtime:** Windows Command Prompt batch script (`cmd.exe`) with `EnableDelayedExpansion`.
- **Scale:** Over 13,000 lines.
- **Architecture:** Contains 37 top-level operational categories and 2,830 actionable labels/commands.
- **CLI Parameter Parsing:** Supports `--no-elevate`, `--label <LabelName>`, and `--back <BackMenu>` to allow direct sub-menu execution from external GUI wrappers without displaying the main ASCII menu.

---

## 3. Startup Flow and Payload Lifecycle

1. **User Execution:** User double-clicks `UltimateToolkit_Bundle_new.exe`.
2. **Elevation (UAC):** The embedded `app.manifest` triggers an immediate Windows UAC credential prompt.
3. **Payload Extraction Verification (`Program.cs`):**
   - Target Directory: `C:\ProgramData\UltimateToolkitSuite` (`Environment.SpecialFolder.CommonApplicationData`).
   - Check: Tests if `C:\ProgramData\UltimateToolkitSuite\Toolkit.bat` exists.
   - If missing:
     - Extracts the embedded manifest resource `StagingZip` (unencrypted ~4.7 MB ZIP archive).
     - Writes payload to disk and unpacks using `System.IO.Compression.ZipFile.ExtractToDirectory()`.
     - Applies NTFS ACLs: Clears inherited permissions and grants full control strictly to `NTAccount("SYSTEM")` and `NTAccount("Administrators")` using native .NET `DirectorySecurity` API.
4. **GUI Display (`LauncherForm.cs`):**
   - Configures IE11 emulation registry key.
   - Initializes `WebBrowser` control pointing to the in-memory suite launcher HTML.
   - User is presented with 3 visual launcher cards:
     1. **V5 Classic Pro (WinForms GUI)**
     2. **V6 Web Console (Cyberpunk Browser Dashboard)**
     3. **Printer Analyzer Pro**
5. **Secondary Launch:** Clicking an option invokes `ScriptManager.cs` which spawns the corresponding runtime using `Process.Start()` with `ExecutionPolicy Bypass`.

---

## 4. Inter-Process Communication & Web Bridge Architecture

The Web Dashboard interacts with the operating system through an asynchronous HTTP polling and event pattern:

```
[Default Web Browser]
       │
       │ HTTP GET / POST (JSON)
       ▼
[System.Net.HttpListener (Port 9999)]
       │
       │ WebBridgeServer.ps1
       ├─────────────────────────────────────────┐
       │ Direct In-Memory PowerShell Cmdlets     │ Background Process Execution
       │ (Get-CimInstance, Get-Process, etc.)   │ (cmd.exe /c, powershell.exe)
       ▼                                         ▼
[Windows Management / Registry / WMI]      [Real-time stdout redirection to Logs\Task_<guid>.log]
                                                 │
                                                 │ Client polls /api/task-stream?guid=...
                                                 ▼
                                           [Browser Terminal UI Output]
```

- **Data Serialization:** PowerShell objects are converted to JSON via `ConvertTo-Json -Compress -Depth 4`.
- **Long-Running Commands:** Long commands (e.g., `sfc /scannow`, `dism /online`, `chkdsk`) are executed via `Start-ProcessWithRealtimeLogging` which streams standard output to `Logs\Task_<guid>.log` while returning `{ streaming: true, guid: "<id>" }` to the frontend.

---

## 5. Repository Duplication & Divergence Analysis

A critical architectural finding is that the repository contains two redundant source trees:
1. `tool/UltimateToolkit_Bundle_new/` (Root build source)
2. `V7/` (Secondary tree used by `build_payload.ps1` staging)

### Comparison Summary:
- `Toolkit.bat`, `dashboard.html`, `Assets/`, and `Config/` are byte-for-byte identical.
- **Critical Divergence in `V7/Modules/WebBridgeServer.ps1`:**
  - `V7/Modules/WebBridgeServer.ps1` contains 111 lines of broken syntax prepended to the top of the file (lines 1–111 contain stripped variable assignments such as ` = @(...)` and `foreach ( in )`).
  - `tool/UltimateToolkit_Bundle_new/Modules/WebBridgeServer.ps1` is clean and uncorrupted.
  - **Risk:** Because `build_payload.ps1` explicitly stages payload files from `V7/Modules/`, rebuilding the payload packaging would bundle the broken PowerShell script into `StagingZip`, crashing the Web Bridge Server on startup.
- **Resolution Plan:** Consolidate to a single canonical source root (`src/` or `tool/`) and eliminate divergent shadow copies.

---

## 6. State, Configuration, and Cache Systems

| File Path | Format | Role | Volatility |
|-----------|--------|------|------------|
| `Config\gui_settings.cfg` | Key=Value | GUI theme, font size, sound toggles | Persistent user preferences |
| `Config\tools.catalog` | Pipe-delimited | Catalog of 34+ portable utilities | Static configuration |
| `Config\gui.catalog` | Pipe-delimited | UI action definitions and labels | Static configuration |
| `Config\favorites.bundle` | Plaintext | Bookmarked quick-actions | User-defined |
| `Config\custom_winget_apps.bundle`| JSON / text | Custom software installer catalog | User-defined |
| `Config\SystemTwin.json` | JSON (~189 KB) | Snapshot cache of installed hardware, OS, BIOS, drivers | Generated cache (should not be committed) |
| `Config\ai_settings.json` | JSON | AI provider selection, model, endpoint, API key | User runtime config |
| `Logs\gui_events.log` | Plaintext | Event trail of tool executions and errors | Ephemeral runtime logs |
| `Logs\Task_*.log` | Plaintext | Real-time command execution output stream | Ephemeral job logs |
