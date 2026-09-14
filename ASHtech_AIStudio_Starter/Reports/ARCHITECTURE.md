# UltimateToolkit Suite — Architecture & Working Document

> **Version:** 7.0.0.0 | **Last Updated:** July 2026 | **Author:** Akash Hodlur

---

## Table of Contents

1. [Overview](#1-overview)
2. [Project Structure](#2-project-structure)
3. [Entry Point & Startup Flow](#3-entry-point--startup-flow)
4. [The Main Launcher — UltimateToolkit_Bundle_new.exe](#4-the-main-launcher)
5. [V5 Classic GUI — PowerShell WinForms Application](#5-v5-classic-gui)
6. [V6 Web Dashboard — HTTP Server + HTML5 Frontend](#6-v6-web-dashboard)
7. [Printer Analyzer Pro — Printer Diagnostics Tool](#7-printer-analyzer-pro)
8. [Toolkit.bat — The Core Engine](#8-toolkitbat-the-core-engine)
9. [Module Inventory](#9-module-inventory)
10. [API Reference — WebBridgeServer Endpoints](#10-api-reference)
11. [Build System & Dependencies](#11-build-system--dependencies)
12. [Configuration & Data Flow](#12-configuration--data-flow)
13. [System Interaction](#13-system-interaction)
14. [Deployment Mechanism](#14-deployment-mechanism)

---

## 1. Overview

UltimateToolkit Suite is a **Windows PC administration and repair toolkit** with three independent user interfaces sharing a common backend. It provides system diagnostics, automated repair, printer troubleshooting, software management, network tools, and reporting — all accessible through a single launcher executable.

### Core Design Principle

The application follows a **"three-headed architecture"**: one launcher EXE provides three entirely different user interfaces, all backed by the same massive `Toolkit.bat` engine and PowerShell modules. Each UI is independent and can be used without the others.

| Aspect | V5 Classic GUI | V6 Web Dashboard | Printer Analyzer Pro |
|--------|----------------|------------------|---------------------|
| **Runtime** | PowerShell WinForms | PowerShell HTTP Server | CMD Batch |
| **UI Technology** | .NET WinForms (via PowerShell) | HTML5/CSS/JS (single-page app) | Console menu |
| **Port** | None (local process) | 9999 (HTTP) | None (local process) |
| **State** | Stateless | Stateless (with caching) | Stateless |
| **Primary Users** | Desktop power users | Browser/mobile users | Print support technicians |

### Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Launcher | C# WinForms | .NET Framework 4.0 |
| V5 GUI | PowerShell 5.1 + WinForms | .NET 4.0 via PowerShell |
| V6 Server | PowerShell 5.1 + HttpListener | .NET 4.0 via PowerShell |
| Printer Tool | CMD Batch + Registry + Netsh | Windows built-in |
| Web Frontend | HTML5 + Vanilla JS | IE11-compatible |
| Database | Flat files (JSON, CSV, TXT) | N/A |
| Deployment | Embedded ZIP resource | 4.7 MB compressed |

---

## 2. Project Structure

```
UltimateToolkit_Bundle_new/
|
|-- UltimateToolkit_Bundle_new.exe    (4.7 MB)  Main launcher executable
|-- UltimateToolkit_Bundle_new.csproj (2.6 KB)  MSBuild project file
|-- Program.cs                        (3.4 KB)  Entry point — extraction + launcher
|-- LauncherForm.cs                   (26 KB)   Main form + V5/V6/Printer launch logic
|-- LauncherForm.Designer.cs          (154 B)   Designer stub
|-- ScriptManager.cs                  (1.4 KB)  COM bridge: HTML <-> C# methods
|-- V5.cs                             (1.6 KB)  V5.exe source (PowerShell spawner)
|-- V5.exe                            (5 KB)    Compiled V5 launcher
|-- V5.exe.bak                        (544 KB)  Backup of older V5 binary
|-- Printer_Analyzer_Pro.cs           (920 B)   Printer Analyzer source
|-- Printer_Analyzer_Pro.exe          (1 MB)    Compiled Printer Analyzer
|-- Printer_Analyzer_Pro.exe.old      (1 MB)    Backup of older binary
|-- Toolkit.bat                       (830 KB)  13,224-line batch engine
|-- dashboard.html                    (2.4 MB)  V6 Web Dashboard single-page app
|-- launcher.html                     (14 KB)   HTML UI for launcher's WebBrowser
|-- server_running.html               (2 KB)    "Server Active" page shown after V6 start
|-- app.manifest                      (675 B)   Admin elevation requirement
|-- Launch-WebDashboard.cmd           (3.1 KB)  Standalone V6 launcher
|-- StagingZip                        (4.7 MB)  Embedded ZIP resource (first-run extract)
|-- UltimateToolkit_Bundle_new.ico    (2.4 KB)  Application icon
|
|-- Assets/                           Icons, banners, wallpapers
|-- Config/                           10 configuration files
|-- Docs/                             9 documentation files
|-- Logs/                             Task logs, web server log
|-- Modules/                          13 module files (see Section 9)
|   |-- Toolkit-GUI-Pro.ps1          (793 KB)  V5 WinForms GUI (31,217 lines)
|   |-- WebBridgeServer.ps1          (362 KB)  V6 HTTP API server (20,703 lines)
|   |-- ToolkitReportCenter.ps1      (97 KB)   Report generator
|   |-- SystemInventoryReport.ps1    (36 KB)   Hardware/software inventory
|   |-- GUI-SelfRepair.ps1           (22 KB)   AI-powered GUI self-repair
|   |-- Web-Dashboard.ps1            (21 KB)   Legacy web server (port 8282)
|   |-- Win11Debloat.ps1             (8 KB)    Windows 11 debloater
|   |-- OneClickSuperRepair.ps1      (8 KB)    SFC + DISM + CHKDSK
|   |-- SelfHeal-Watchdog.ps1        (6 KB)    Server watchdog
|   |-- PortableToolsMenu.cmd        (4 KB)    Tools launcher
|   |-- SystemInventory.cmd          (1.4 KB)  Inventory wrapper
|   |-- BatteryReport.cmd            (1 KB)    Battery report wrapper
|   |-- web_assets/index.html        (64 KB)   Legacy web command center
|-- Properties/AssemblyInfo.cs        Assembly metadata
|-- scratch/                          Runtime logs (printer_analyzer.log)
|-- bin/Release/                      Built binaries
```

---

## 3. Entry Point & Startup Flow

### 3.1 `Program.Main()` — Complete Startup Sequence

```
User double-clicks UltimateToolkit_Bundle_new.exe
        |
        v
UAC Prompt (due to app.manifest: requireAdministrator)
        |
        v
Program.Main() [Program.cs:15]
        |
    +-- [Line 20] Check for embedded "StagingZip" resource
    |
    +-- IF embedded resource exists:
    |       |
    |       +-- [Line 27] Set extract path:
    |       |   %CommonAppData%\UltimateToolkitSuite\
    |       |   (e.g., C:\ProgramData\UltimateToolkitSuite\)
    |       |
    |       +-- [Line 29] Check marker file ".utinstalled"
    |       |   and presence of core files (V5.exe, WebBridgeServer.ps1)
    |       |
    |       +-- IF needs extraction (first run or files missing):
    |       |       |
    |       |       +-- [Line 36] Delete old directory if exists
    |       |       +-- [Line 44] Create fresh directory
    |       |       +-- [Line 45] Read embedded StagingZip resource
    |       |       +-- [Line 53] Write to _ut_pkg.zip
    |       |       +-- [Line 55] Extract ZIP
    |       |       +-- [Line 56] Delete ZIP
    |       |       +-- [Line 58] Create .utinstalled marker
    |       |       +-- [Line 61] Set NTFS permissions:
    |       |       |   SYSTEM + Administrators: Full Control
    |       |
    |       +-- [Line 78] Set env var UT_ORIGINAL_DIR = extracted path
    |
    +-- ELSE (no embedded resource — running from source/dev):
    |       |
    |       +-- [Line 76] runtimeDir = current directory
    |
    +-- [Line 79] Application.EnableVisualStyles()
    +-- [Line 81] LauncherForm form = new LauncherForm(runtimeDir)
    +-- [Line 81] Application.Run(form)
    |
    +-- ON CRASH:
        +-- [Line 87] Write launcher_crash.log
```

### 3.2 `LauncherForm` Construction [LauncherForm.cs:21]

1. Window setup: 1020×650, min 880×560, dark background (#08090d)
2. Title: "ULTIMATE TOOLKIT SUITE CORE MANAGER"
3. Dark titlebar enabled via DWM API (`DwmSetWindowAttribute`)
4. IE11 emulation mode set (`FEATURE_BROWSER_EMULATION` = 11001)
5. WebBrowser control created (docked fill, script enabled)
6. `ScriptManager` assigned as `ObjectForScripting` (COM bridge)
7. `launcher.html` written to temp, browser navigates to it

---

## 4. The Main Launcher

### 4.1 UI Layout [launcher.html]

The launcher displays a dark cyberpunk-themed HTML page with **three option cards** in a table-based grid:

```
+======================================================+
|  SELECT SUITE INTERFACE                              |
|  Premium Windows Diagnostic • Repair Core • Akash    |
+======================================================+
|  [V5 CLASSIC GUI]   | [V6 WEB DASHBOARD] | [PRINTER] |
|  ★ RECOMMENDED      | NEXT-GEN INTERACTIVE| EXPERT    |
|  LIGHTWEIGHT ENGINE |                    | TOOL      |
|                     |                    |           |
|  Fast Native        | Premium HTML5 Web  | Spooler   |
|  Windows Forms      | Real-Time Monitors | Health     |
|  50+ Color Themes   | Log Streaming      | Port/Drive|
|  No Port Bindings   | Cyberpunk Styling  | 1-Click   |
|                     |                    | Resets    |
|  [LAUNCH CLASSIC]   | [LAUNCH WEB]       | [LAUNCH]  |
+======================================================+
|  DUAL ENGINE  | OPTIMIZED   | SECURE     | LICENSED  |
|  SYSTEM       | PERFORMANCE | & SAFE     | EDITION   |
+======================================================+
|  SYSTEM STATUS: All Systems Operational              |
+======================================================+
```

### 4.2 JavaScript-to-C# Bridge [ScriptManager.cs]

The HTML buttons call C# methods through the COM-visible `ScriptManager` class:

| HTML Call | C# Method | Action |
|-----------|-----------|--------|
| `window.external.LaunchV5()` | `ExecuteLaunchV5()` | Launch V5 Classic GUI |
| `window.external.LaunchV6()` | `ExecuteLaunchV6()` | Launch V6 Web Dashboard |
| `window.external.LaunchPrinter()` | `ExecuteLaunchPrinter()` | Launch Printer Analyzer |
| `window.external.StopV6()` | `ExecuteStopV6()` | Stop the V6 server |
| `window.external.OpenUrl(url)` | `OpenUrl(string)` | Open URL in default browser |

All methods use `form.Invoke()` to marshal to the UI thread — required for WinForms WebBrowser safety.

### 4.3 Launch Methods

#### V5 Classic GUI [LauncherForm.cs:86]
1. Look for `{runtimeDir}\V5.exe`
2. If found → `Process.Start()` with `UseShellExecute=true`
3. Hide launcher form (`base.Hide()`)
4. V5.exe (5 KB) executes PowerShell → `Toolkit-GUI-Pro.ps1`

#### V6 Web Dashboard [LauncherForm.cs:113]
1. Verify `{runtimeDir}\Modules\WebBridgeServer.ps1` exists
2. Kill any existing WebBridgeServer processes (via WMI)
3. Open firewall port 9999 (`netsh advfirewall`)
4. Start WebBridgeServer.ps1 as hidden PowerShell with `-Port 9999`
5. Wait 3 seconds
6. Open `http://localhost:9999/dashboard.html` in default browser
7. Switch embedded browser to `server_running.html` (shows STOP button)

#### Printer Analyzer [LauncherForm.cs:180]
1. Look for `Printer_Analyzer_Pro.exe` in base directory
2. Fallback: look on Desktop
3. `Process.Start()` with `UseShellExecute=true`
4. Printer_Analyzer_Pro.exe runs Toolkit.bat with `--label menu_printer_spooler`

---

## 5. V5 Classic GUI

### 5.1 Launch Chain

```
Launcher clicks "V5 Classic GUI"
    → window.external.LaunchV5()
    → ExecuteLaunchV5() [LauncherForm.cs:86]
    → Process.Start("V5.exe") [5 KB]
        → V5.exe Main() [V5.cs:26]
            → Process.Start(powershell, "-File Modules\Toolkit-GUI-Pro.ps1")
                → Toolkit-GUI-Pro.ps1 (31,217 lines)
                    → Full WinForms PowerShell GUI
```

### 5.2 V5.exe [V5.cs]

A minimal 5 KB C# executable. Its sole purpose:
1. Resolve its own directory
2. Construct path: `{dir}\Modules\Toolkit-GUI-Pro.ps1`
3. Launch: `powershell -NoProfile -ExecutionPolicy Bypass -Command "try { & '...\Toolkit-GUI-Pro.ps1' } catch { ... }"`
4. PowerShell runs hidden (`CreateNoWindow=true`)

### 5.3 Toolkit-GUI-Pro.ps1 Architecture

The V5 GUI is a self-contained **PowerShell WinForms application** (793 KB, 31,217 lines) built entirely programmatically — no XAML, no designer files.

#### Phase 1: Initialization (Lines 1-200)
- Parameter parsing: `-NoElevate`, `-SelfTest`, `-SilentClean`
- Custom `Out-MessageBox`: Suppresses OK-only dialogs (logs them instead) — prevents popup fatigue
- Start-Process override: Blocks URL/HTML opens, logs as "Browser Bypass"
- **Auto-elevation** (lines 139-173): If not admin, relaunch via `-Verb RunAs`
- SilentClean mode: Quick temp cleanup without GUI

#### Phase 2: Module Loading (Lines 200-1230)
- Load `gui.catalog` — menu hierarchy database (76 entries)
- Load `tools.catalog` — portable tools registry (45 entries)
- Load theme definitions (50+ color themes)
- Build menu model: 37 main modules with submenus
- Self-test mode validates all label targets

#### Phase 3: GUI Construction (Lines 1231-5850)
```
Add-Type System.Windows.Forms
Add-Type System.Drawing
[Application]::EnableVisualStyles()
Set DPI awareness (for 4K rendering)

Define 50 theme color sets (15+ properties each)
    e.g., "Cyberpunk Neon", "Glass Morphism", "Matrix Green"

Build main form:
    Left sidebar (~180px): Navigation categories
    Main content area: Dynamic card grid
    Search bar: Real-time filtering
    Theme switcher dropdown

Show-Menu(label) function (~line 5800):
    Navigation system — renders any menu by label

Render-Cards(options, title, mode) function (~line 8506):
    Renders option cards in grid layout

Set-UiTheme(themeName) function (~line 6910):
    Applies theme colors recursively to all controls
```

#### Phase 4: Event Loop (Lines 31140-31217)
- Search box handler (~line 30650): Real-time menu filtering
- Form closing (line 31140): Clean up temp files
- Global exception handlers (lines 31154-31192):
  - `Application.ThreadException` → log to `startup_err.log`
  - `AppDomain.UnhandledException` → log to `startup_err.log`
- Line 31196-31216: `Set-UiTheme('Default')`, `Show-Menu('main')`, `[Application]::Run($form)`

### 5.4 GUI Layout

```
+=====================================================+
| [≡] ULTIMATE TOOLKIT v5               [Search...]  |
|      Akash Hodlur                                   |
+=========+===========================================+
|         |                                           |
|  🖥️    |  +----+  +----+  +----+  +----+         |
|  Admin  |  |Sys |  |Disk|  |Net |  |Sec |         |
|  🛠️    |  |Admin|  |Mgmt|  |Work|  |Scan|         |
|  Tools  |  +----+  +----+  +----+  +----+         |
|         |                                           |
|  🖥️    |  [01] System Information                  |
|  System|  [02] Task Manager                          |
|  🖥️    |  [03] Service Manager                      |
|  Disk  |  [04] Registry Cleaner                     |
|  🖥️    |  [05] Startup Manager                      |
|  Net   |  ...                                       |
|  🖥️    |                                           |
|  Print |   Theme: [Cyberpunk Neon ▼]                |
|  ...   |                                           |
+=========+===========================================+
|  CPU: 12%  |  RAM: 6.2/16 GB  |  Disk: 45%        |
+=====================================================+
```

### 5.5 How V5 Interacts with Toolkit.bat

The V5 GUI reads `Config/gui.catalog` which maps menu options to Toolkit.bat labels. When a user clicks a card:

1. Look up the target label (e.g., `menu_system_admin`)
2. Call Toolkit.bat with `--label {target} --back {current}`
3. Toolkit.bat jumps directly to that label's menu

The batch file and the V5 GUI are **parallel navigation systems** — same backend (Toolkit.bat operations), different frontend (GUI cards vs console menu).

---

## 6. V6 Web Dashboard

### 6.1 Launch Chain

```
Launcher clicks "V6 WEB DASHBOARD"
    → window.external.LaunchV6()
    → ExecuteLaunchV6() [LauncherForm.cs:113]
    → Kill existing WebBridgeServer processes (WMI query)
    → Open firewall port 9999 (netsh advfirewall)
    → Start PowerShell hidden:
        powershell -NoProfile -ExecutionPolicy Bypass
            -File "Modules\WebBridgeServer.ps1" -Port 9999
    → Wait 3 seconds
    → Open browser: http://localhost:9999/dashboard.html
    → Show server_running.html in embedded browser (STOP button)
```

### 6.2 WebBridgeServer.ps1 — HTTP Server Architecture

A 362 KB, 20,703-line PowerShell HTTP server built on `System.Net.HttpListener`.

#### Server Setup [Lines 4917-5097]

```powershell
$listener = New-Object System.Net.HttpListener
$prefixes = @(
    "http://localhost:9999/"
    "http://127.0.0.1:9999/"
    "http://+:9999/"   # All local IPs (for mobile access)
)
$listener.Prefixes.Add(prefix)
$listener.Start()
```

If binding to all IPs fails, falls back to localhost-only.

#### Request Handling Pipeline [Process-Request function, ~line 5109]

```
HTTP Request arrives on port 9999
        │
        v
Parse HTTP method + URL path
        │
        v
[Line 5133] Add CORS headers
    Access-Control-Allow-Origin: *
    Access-Control-Allow-Methods: GET, POST
    Access-Control-Allow-Headers: Content-Type
        │
        v
[Line 5171] Is static file request?
    (.html, .css, .js, .png, .jpg, .gif, .ico, .svg, .txt)
    │           │
    YES         NO
    │           │
    v           v
  Serve file   Route to /api/* handler
  from disk    [~line 5899]
                │
                v
          Match endpoint → execute → return JSON
```

#### Global Caching System [Lines 30-62]

```powershell
Cache_SysInfo      # System information (per-request)
Cache_InstalledApps # Installed applications (per-request)
Cache_NetworkInfo   # Network configuration (per-request)
Cache_Metrics       # CPU/RAM/disk metrics (per-request)
Cache_Processes     # Running processes (per-request)
Cache_Services      # Windows services (per-request)
Cache_Startup       # Startup programs (per-request)
Cache_Disks         # Disk health info (per-request)
```

Most cache entries have a TTL of 1.5-5 seconds (configurable) to balance freshness vs performance.

### 6.3 dashboard.html — Single-Page Web Application

A **2.4 MB** self-contained HTML5 application with embedded JavaScript (no external libraries). Communicates with the server exclusively via HTTP fetch.

#### Communication Pattern

```javascript
// GET request (dashboard.html:~152251)
async function GET(path) {
    const r = await fetch(API + path, {
        mode: 'cors',
        cache: 'no-store'
    });
    return await r.json();
}

// POST request (dashboard.html:~152379)
async function POST(path, data) {
    const r = await fetch(API + path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        mode: 'cors'
    });
    return await r.json();
}

// Usage
const sysinfo = await GET('/api/sysinfo');          // System info
const metrics = await GET('/api/metrics');           // Live metrics
const result  = await POST('/api/launch', { id });  // Launch tool
```

#### Dashboard UI Sections

| Section | API Endpoint | Polling |
|---------|-------------|---------|
| System Overview | `/api/sysinfo` | On load |
| Live Metrics (CPU/RAM/Disk) | `/api/metrics` | Every 5s |
| Network Info | `/api/network-info` | On load |
| Process Manager | `/api/processes` | On demand |
| Service Manager | `/api/services` | On demand |
| Disk Health | `/api/disks` | On demand |
| Event Logs | `/api/event-logs` | On demand |
| Installed Apps | `/api/installed-apps` | On demand |
| Software Updates | `/api/updater-software` | On demand |
| Driver Updates | `/api/updater-drivers` | On demand |
| Hardware Diagnostics | `/api/hardware-diagnostics` | On demand |
| Battery Report | `/api/battery-health` | On demand |
| Network Tools | `/api/ping`, `/api/dns-query` | On demand |

---

## 7. Printer Analyzer Pro

### 7.1 Launch Chain

```
Launcher clicks "PRINTER ANALYZER"
    → window.external.LaunchPrinter()
    → ExecuteLaunchPrinter() [LauncherForm.cs:180]
    → Find Printer_Analyzer_Pro.exe
        (base directory → Desktop fallback)
    → Process.Start("Printer_Analyzer_Pro.exe") [1 MB]
        → Printer_Analyzer_Pro.exe Main() [Printer_Analyzer_Pro.cs:15]
            → Process.Start(cmd.exe,
                "/c Toolkit.bat --label menu_printer_spooler")
                → :menu_printer_spooler label [Toolkit.bat:1442]
                    → 22 printer fix options
```

### 7.2 Printer_Analyzer_Pro.exe [Printer_Analyzer_Pro.cs]

A minimal C# executable that:
1. Locates `Toolkit.bat` in its own directory
2. Runs: `cmd.exe /c "path\Toolkit.bat" --label menu_printer_spooler`
3. The `--label` flag causes Toolkit.bat to jump directly to the printer menu

### 7.3 Printer Menu (Toolkit.bat Lines 1442-1724)

The Printer Spooler menu provides **22 diagnostic and repair options**:

| # | Fix | Line | Command |
|---|-----|------|---------|
| 01 | Error 0x0000011b | 1537 | `reg` — RpcAuthnLevelPrivacyEnabled = 0 |
| 02 | Error 0x00000709 | 1545 | `reg` — RpcUseNamedPipeProtocol = 1 |
| 03 | Default Printer | 1553 | `reg` — LegacyDefaultPrinterMode = 1 |
| 04 | Shared Printer | 1560 | `netsh` — File and Printer Sharing firewall rule |
| 05 | Printer Offline | 1567 | `net stop/start spooler` + settings |
| 06 | Spooler Error | 1575 | `net stop/start spooler` |
| 07 | Print Queue Stuck | 1582 | Delete files in `spool\PRINTERS\` |
| 08 | Access Denied | 1589 | `takeown` + `icacls` on spool folder |
| 09 | SMB Guest Error | 1597 | `reg` — AllowInsecureGuestAuth = 1 |
| 10 | Driver Problem | 1604 | `printui /s /t2` (driver management) |
| 11 | Network Discovery | 1611 | `netsh` — Network Discovery firewall rule |
| 12 | RPC Server Error | 1618 | `sc start RpcSs` |
| 13 | Operation Failed | 1626 | `dism` — enable LPD/LPR features |
| 14 | Remove Printers | 1634 | PowerShell `Remove-Printer` |
| 15 | Remove Drivers | 1643 | `printui /s /t2` |
| 16 | Clean Version-3 | 1650 | Delete `Version-3` driver registry |
| 17 | Clean Version-4 | 1661 | Delete `Version-4` driver registry |
| 18 | Registry Cleanup | 1672 | Delete `HKCU\Printers` + `HKLM\...\Printers` |
| 19 | Clear Print Queue | 1684 | Delete spool files |
| 20 | Restart Spooler | 1691 | `net stop/start spooler` |
| 21 | COMPLETE CLEANUP | 1698 | All of 14-18 combined |
| 22 | APPLY ALL FIXES | 1713 | Registry fixes + firewall + queue clear |

---

## 8. Toolkit.bat — The Core Engine

**830 KB, 13,224 lines** — the largest and most critical file in the application.

### 8.1 Architecture

```
:main [line ~1]
    │
    ├── Initialization (~first 200 lines)
    │   ├── Title, color setup
    │   ├── CMD variables
    │   ├── Menu display routines
    │   └── Label routing
    │
    ├── Main Menu (~lines 200-300)
    │   └── 37 module options (1-37)
    │
    ├── Module 1: Internet & Browsers
    ├── Module 2: Disk Management
    ├── Module 3: File & OS Management
    ├── Module 4: System Optimization
    ├── Module 5: Security & Antivirus
    ├── Module 6: Malware Removal
    ├── Module 7: User & Account Tools
    ├── Module 8: Privacy Tools
    ├── Module 9: Network & WiFi Tools
    ├── Module 10: Advanced System Admin
    ├── Module 11: Hardware & Drivers
    ├── Module 12: Printer Toolkit ← Printer Analyzer target
    ├── Module 13: Remote Access / RDP
    ├── Module 14: BIOS / UEFI / Boot
    ├── Module 15: System Restore & Recovery
    ├── Module 16: Windows Update & Repairs
    ├── Module 17: Customization & Theme
    ├── Module 18: Developer / Power User
    ├── Module 19: Quick Access Utilities
    ├── Module 20: Power User / Dev Tools
    ├── Module 21: AI Smart Auto Fix Engine
    ├── Module 22-37: Additional tools
    │
    └── Utility functions (~lines 10000+)
        ├── Printer fix routines
        ├── System repair routines
        ├── Report generation
        └── Cleanup
```

### 8.2 Label Routing System

`Toolkit.bat` uses a label-based navigation system. The `--label` argument causes it to skip the main menu and jump directly to a specific module:

```
REM Toolkit.bat main entry
IF "%~1"=="--label" (
    set "TARGET=%~2"
    goto %TARGET%
)
```

All modules are implemented as batch labels (`:menu_system_admin`, `:menu_disk_tools`, etc.) with their own sub-menus. The V5 GUI maps its card grid directly to these labels via `Config/gui.catalog`.

### 8.3 Shared Utilities

Throughout the batch file, reusable utility functions:

```
call :printer_restart_spooler_core    # Lines 1515-1519
call :printer_clear_queue_core        # Lines 1521-1525
call :printer_confirm_danger          # Lines 1527-1535
```

These are called from multiple fix routines to avoid code duplication.

---

## 9. Module Inventory

### 9.1 PowerShell Modules

| File | Size | Lines | Purpose |
|------|------|-------|---------|
| `Toolkit-GUI-Pro.ps1` | 793 KB | 31,217 | V5 Classic WinForms GUI with 50 themes |
| `WebBridgeServer.ps1` | 362 KB | 20,703 | V6 HTTP API server with 100+ endpoints |
| `ToolkitReportCenter.ps1` | 97 KB | — | Report generator (inventory, health, network) |
| `SystemInventoryReport.ps1` | 36 KB | — | Detailed system inventory |
| `GUI-SelfRepair.ps1` | 22 KB | — | AI-powered GUI repair (uses Gemini API) |
| `Web-Dashboard.ps1` | 21 KB | — | Legacy web server (port 8282) |
| `Win11Debloat.ps1` | 8 KB | — | Windows 11 debloater script |
| `OneClickSuperRepair.ps1` | 8 KB | — | SFC + DISM + CHKDSK + network reset |
| `SelfHeal-Watchdog.ps1` | 6 KB | — | Monitors WebBridgeServer, auto-restarts |

### 9.2 CMD/Batch Modules

| File | Size | Purpose |
|------|------|---------|
| `Toolkit.bat` | 830 KB | Core engine — 37 modules, printer tools |
| `PortableToolsMenu.cmd` | 4 KB | Launches portable tools from catalog |
| `SystemInventory.cmd` | 1.4 KB | Wrapper for inventory report |
| `BatteryReport.cmd` | 1 KB | Wrapper for powercfg battery report |

### 9.3 Web Frontend

| File | Size | Purpose |
|------|------|---------|
| `dashboard.html` | 2.4 MB | V6 Web Dashboard (single-page app) |
| `launcher.html` | 14 KB | Launcher's embedded HTML UI |
| `server_running.html` | 2 KB | "Server Active" page |
| `web_assets/index.html` | 64 KB | Legacy web command center |

---

## 10. API Reference

### 10.1 Response Format

All API responses follow a consistent envelope:

```json
{
    "ok": true,
    "data": { ... },
    "ts": "2026-07-06T12:00:00.000Z"
}
```

Error responses:

```json
{
    "ok": false,
    "error": "Description of what went wrong",
    "ts": "2026-07-06T12:00:00.000Z"
}
```

### 10.2 Endpoint Categories

#### System Information

| Endpoint | Method | Description | Key Fields |
|----------|--------|-------------|------------|
| `/api/status` | GET | Server status + version | `ok`, `admin`, `version` |
| `/api/sysinfo` | GET | Full system information | `os`, `cpu`, `ram`, `motherboard` |
| `/api/metrics` | GET | Real-time CPU/RAM/disk | `cpu`, `ram`, `disk`, `network` |
| `/api/processes` | GET | Running processes | `processes[]` with PID, CPU, RAM |
| `/api/services` | GET | Windows services | `services[]` with status |
| `/api/startup` | GET | Startup programs | `startup[]` |
| `/api/disks` | GET | Disk health info | `disks[]` with SMART data |
| `/api/battery` | GET | Battery status | `percentage`, `status` |
| `/api/battery-health` | GET | Deep battery health | Full battery report |
| `/api/network-info` | GET | Network configuration | `adapters[]`, `ip`, `dns` |
| `/api/network` | GET | Network status | Connection state |
| `/api/network-speed` | GET | Network speed test | `download`, `upload`, `ping` |
| `/api/installed-apps` | GET | Installed software list | `apps[]` with version |
| `/api/event-logs` | GET | Windows event logs | `events[]` filtered |
| `/api/scheduled-tasks` | GET | Scheduled tasks | `tasks[]` |
| `/api/system-status` | GET | Overall health status | Aggregated health score |

#### Diagnostics

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/hardware-diagnostics` | GET | Deep hardware diagnostics |
| `/api/software-diagnostics` | GET | Deep software diagnostics |
| `/api/cpu-stress` | POST | CPU stress test |
| `/api/ping` | POST | ICMP ping to specified host |
| `/api/dns-query` | POST | DNS lookup |
| `/api/wifi-passwords` | GET | Retrieve saved WiFi passwords |
| `/api/netstat` | GET | Network connections |
| `/api/netstat-lookup` | POST | IP lookup for connections |
| `/api/netstat-geoip` | POST | GeoIP for connections |

#### Repair & Maintenance

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/clean-temp` | POST | Clean temporary files |
| `/api/bloatware-scan` | GET | Scan for bloatware applications |
| `/api/debloat-tasks` | GET | List debloat tasks |
| `/api/os-repair` | POST | Run SFC + DISM repairs |

#### Toolkit Execution

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/launch` | POST | Launch toolkit operation by ID |
| `/api/run-op` | POST | Run operation by name |
| `/api/launch-exe` | POST | Launch external executable |
| `/api/launch-gui` | POST | Launch V5 Classic GUI |
| `/api/toolkit-run` | POST | Run Toolkit.bat with label |
| `/api/run-ps` | POST | Run arbitrary PowerShell command |
| `/api/execute-option` | POST | Execute a menu option |

#### Software Management (Winget)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/winget-install` | POST | Install app via winget |
| `/api/winget-search` | GET | Search winget repository |
| `/api/updater-software` | GET | List updatable software |
| `/api/updater-drivers` | GET | List updatable drivers |
| `/api/upgrade-all-apps` | POST | Upgrade all winget apps |
| `/api/upgrade-single-app` | POST | Upgrade single app |
| `/api/install-single-driver` | POST | Install single driver |
| `/api/install-all-drivers` | POST | Install all drivers |

#### Self-Heal System

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/selfheal-report-error` | POST | Report JS error from dashboard |
| `/api/selfheal-scan` | GET | Scan for errors |
| `/api/selfheal-autofix` | POST | Auto-fix detected errors |
| `/api/selfheal-clearlog` | POST | Clear self-heal log |
| `/api/selfheal-watchdog` | GET | Watchdog status |
| `/api/selfheal-watchdog-log` | GET | Watchdog log |

#### Utilities

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/open-folder` | POST | Open folder in Explorer |
| `/api/open-reg-path` | POST | Open registry path |
| `/api/kill-process` | POST | Kill process by PID |
| `/api/service-control` | POST | Start/stop/restart service |
| `/api/list-commands` | GET | List available commands |
| `/api/menu-hierarchy` | GET | Get menu hierarchy structure |
| `/api/portable-tools` | GET | List portable tools |
| `/api/launch-portable` | POST | Launch portable tool by ID |
| `/api/reports-list` | GET | List available reports |
| `/api/reports-run` | POST | Generate a report |

#### AI Features

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/predictive-metrics` | GET | AI-predicted system metrics |
| `/api/twin-snapshot` | GET | System twin snapshot |
| `/api/generate-script-mock` | POST | Generate mock PowerShell scripts |

---

## 11. Build System & Dependencies

### 11.1 Build Configuration [UltimateToolkit_Bundle_new.csproj]

| Property | Value |
|----------|-------|
| Target Framework | .NET Framework 4.0 (`v4.0`) |
| Output Type | `WinExe` (Windows executable) |
| Assembly Name | `UltimateToolkit_Bundle_new` |
| Root Namespace | `UltimateToolkitLauncher` |
| Startup Object | `UltimateToolkitLauncher.Program` |
| Application Icon | `UltimateToolkit_Bundle_new.ico` |
| Manifest | `app.manifest` (admin required) |

**References:**
- `System`
- `System.Drawing`
- `System.IO.Compression.FileSystem`
- `System.Windows.Forms`

**Source Files:**
- `Program.cs` — Entry point
- `LauncherForm.cs` — Main form
- `LauncherForm.Designer.cs` — Designer partial
- `ScriptManager.cs` — COM bridge
- `Properties/AssemblyInfo.cs` — Assembly metadata

**Embedded Resource:**
- `StagingZip` — 4.7 MB ZIP archive (deployment payload)

### 11.2 External Dependencies

| Dependency | Version | Used By | Purpose |
|------------|---------|---------|---------|
| .NET Framework | 4.0+ | All C# EXEs | Runtime |
| PowerShell | 5.1+ | All .ps1 modules | Scripting engine |
| Windows Management Instrumentation | Built-in | WebBridgeServer, reports | System queries |
| HttpListener | .NET 4.0 | WebBridgeServer | HTTP server |
| WinForms | .NET 4.0 | Toolkit-GUI-Pro.ps1 | GUI rendering |
| WebBrowser (IE11) | Windows | LauncherForm | Embedded HTML UI |
| Winget | Windows 10/11 | V6 Dashboard | Package management |
| DWM API | Windows Vista+ | LauncherForm.cs | Dark mode titlebar |
| Gemini AI API | External (optional) | GUI-SelfRepair.ps1 | AI-powered GUI repair |

### 11.3 Assembly Metadata [Properties/AssemblyInfo.cs]

```
Title:           Ultimate Toolkit Suite Core Manager
Description:     Launcher for Ultimate Toolkit Suite — deploys and manages
                 toolkit modules including V5 GUI, V6 Web Dashboard,
                 and Printer Analyzer Pro.
Company:         Akash Hodlur
Product:         Ultimate Toolkit Suite
Copyright:       Copyright (c) Akash Hodlur. All rights reserved.
Version:         7.0.0.0
GUID:            {F9E26553-86D2-4840-9F0B-795DD701C971}
```

---

## 12. Configuration & Data Flow

### 12.1 Configuration Files

| File | Format | Contents |
|------|--------|----------|
| `Config/gui_settings.cfg` | Key=Value | Theme, Layout, DynamicTheme |
| `Config/gui.catalog` | Custom | 76 menu entries with labels, descriptions, colors |
| `Config/tools.catalog` | Custom | 45 portable tool entries with paths |
| `Config/SystemTwin.json` | JSON | 4,384-line cached system state snapshot |
| `Config/gemini_api.key` | Text | Optional Gemini AI API key |
| `Config/ai_key.txt` | Text | Alternative AI key location |
| `Config/favorites.bundle` | Text | Favorite winget apps |
| `Config/custom_winget_apps.bundle` | Text | Custom winget app list |
| `Config/custom_bundle.txt` | Text | Alternative custom bundle |
| `Config/install_history.log` | Text | Installation history |

### 12.2 Data Flow Between Components

```
┌─────────────────────────────────────────────────────────────────┐
│                    Shared Filesystem                             │
├─────────────────────────────────────────────────────────────────┤
│  Config/gui.catalog       ← Read by V5 GUI, V6 WebBridgeServer  │
│  Config/tools.catalog     ← Read by V5 GUI, PortableToolsMenu   │
│  Config/SystemTwin.json   ← Written by WebBridgeServer,          │
│                              Read by dashboard.html             │
│  Logs/gui_errors.jsonl    ← Written by V5 GUI, Read by SelfHeal │
│  Logs/WebServer.log       ← Written by WebBridgeServer          │
│  scratch/printer_analyzer.log ← Written by Printer Analyzer      │
│  Toolkit.bat              ← Executed by V5 GUI & Printer        │
└─────────────────────────────────────────────────────────────────┘
         ▲                                  ▲
         │                                  │
         ▼                                  ▼
┌─────────────────┐              ┌──────────────────────┐
│  V5 GUI          │              │  V6 Web Dashboard    │
│  (PowerShell)    │              │  (PowerShell + HTML) │
│                  │              │                      │
│  Reads catalog   │              │  Reads WMI directly  │
│  Launches batch  │              │  100+ API endpoints  │
│  50 themes       │              │  Real-time polling   │
└─────────────────┘              └──────────────────────┘
         ▲
         │
         ▼
┌─────────────────┐
│ Printer Analyzer │
│ (CMD + Registry) │
│                  │
│ 22 printer fixes │
│ Direct system    │
│ commands         │
└─────────────────┘
```

### 12.3 State Management

The application is **stateless** — no persistent runtime state is shared between UIs:

- **V5 GUI**: Each action is independent. Launches Toolkit.bat for each operation.
- **V6 Dashboard**: Has a per-request caching layer (TTL 1.5-5 seconds), but no session state.
- **Printer Analyzer**: Each fix is a standalone command.

The only persistent state is:
- `Config/SystemTwin.json` — Cached system snapshot for dashboard quick-load
- `Logs/*.log` — Log files for error tracking
- `scratch/*.log` — Runtime operation logs

---

## 13. System Interaction

### 13.1 Privilege Requirements

| Operation | Windows API | Minimum Privilege |
|-----------|-------------|-------------------|
| Registry modifications | `reg.exe` / .NET Registry | Administrator |
| Service control | `sc.exe` / `net.exe` | Administrator |
| File operations (temp/spool) | Direct file I/O | Administrator |
| Firewall rules | `netsh advfirewall` | Administrator |
| DISM / SFC | Built-in Windows | Administrator |
| WMI queries | PowerShell `Get-CimInstance` | User (admin for some) |
| Winget operations | `winget.exe` | User |
| Process management | PowerShell `Stop-Process` | Depends on target |
| HTTP server | .NET `HttpListener` | User (admin for all IPs) |
| Registry reads | .NET / `reg query` | User |

### 13.2 Filesystem Footprint

```
%ProgramData%\UltimateToolkitSuite\     ← Full deployment (first-run extract)
  ├── V5.exe
  ├── Toolkit.bat
  ├── Modules\
  ├── Config\
  ├── Tools\                            ← Portable tools
  └── ...

%TEMP%\UltimateToolkit\                 ← Runtime temp files
  ├── launcher.html
  ├── server_running.html
  └── ...

%PUBLIC%\UltimateToolkit_Logs\          ← GUI event logs
  └── gui_events.log

Local directory (where EXE runs):
  ├── Logs\                             ← Task logs, server log
  ├── scratch\                          ← Printer analyzer log
  └── Reports\                          ← Generated reports
```

### 13.3 Network Footprint

| Port | Protocol | Used By | Purpose |
|------|----------|---------|---------|
| 9999 | HTTP | WebBridgeServer | V6 Dashboard API |
| 8282 | HTTP | Web-Dashboard.ps1 (legacy) | Alternative web server |

Firewall rule created: `UltimateToolkit Web Bridge` (TCP port 9999, inbound)

---

## 14. Deployment Mechanism

### 14.1 Embedded StagingZip

The 4.7 MB `StagingZip` file is embedded as a resource in `UltimateToolkit_Bundle_new.exe`. On first run:

1. Program.Main() detects the embedded resource
2. Extracts to `%ProgramData%\UltimateToolkitSuite\`
3. Creates `.utinstalled` marker file
4. Sets NTFS permissions (SYSTEM + Administrators only)
5. Sets `UT_ORIGINAL_DIR` environment variable

Re-extraction is triggered if core files (`V5.exe`, `WebBridgeServer.ps1`) are missing.

### 14.2 What Gets Extracted

The ZIP contains:
- `V5.exe` — Classic GUI launcher
- All `Modules/` — PowerShell scripts, CMD files
- `Toolkit.bat` — Core engine
- `dashboard.html` — Web dashboard
- `Config/` — Configuration files
- `Tools/` — Portable tool binaries
- `Properties/AssemblyInfo.cs` — Metadata

### 14.3 Upgrade Path

The extraction check on every launch means:
- Delete or rename the `.utinstalled` marker → forces re-extraction
- Delete `V5.exe` or `WebBridgeServer.ps1` → triggers re-extraction
- This provides a simple upgrade mechanism: replace the .exe with a new version containing an updated StagingZip

---

## Appendix: File Size Breakdown

```
Total deployment size (extracted): ~6.5 MB

Largest files by size:
  1. dashboard.html         2,412 KB  (36%)
  2. Toolkit.bat              830 KB  (12%)
  3. Toolkit-GUI-Pro.ps1     793 KB  (12%)
  4. Printer_Analyzer_Pro.exe 1,096 KB (16%)
  5. WebBridgeServer.ps1     362 KB   (5%)
  6. V5.exe.bak              544 KB   (8%)
  7. StagingZip (embedded)   4,739 KB
  8. UltimateToolkit_Bundle_new.exe 4,790 KB
  Remaining 25+ files       ~200 KB   (3%)
```
