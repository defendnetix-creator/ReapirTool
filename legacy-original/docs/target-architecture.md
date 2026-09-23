# Target Architecture Definition — ASHtech PC Toolkit Pro
**Project:** ASHtech PC Toolkit Pro  
**Document:** Target Modernized Architecture Specification  
**Date:** September 2026  
**Guiding Principle:** Modernize, secure, and stabilize without throwing away working functionality.  

---

## 1. Architectural Vision & Design Principles

The target architecture for **ASHtech PC Toolkit Pro** transforms the existing multi-headed prototype into a cohesive, commercial-grade Windows desktop application. It preserves the comprehensive functional depth (all 2,830 capabilities across 37 categories) while upgrading the hosting shell, securing the inter-process communication layer, and eliminating every heuristic pattern flagged by Windows Defender and SmartScreen.

### Non-Negotiable Core Tenets:
1. **Preserve Functional Assets:** Retain the battle-tested PowerShell diagnostic scripts and the 37-module batch engine.
2. **True Windows Desktop Application:** Remains a local, on-premise Windows utility that functions offline and does not require cloud hosting or web servers.
3. **Enterprise Security & Zero Evasion:** Fully compliant with Microsoft Defender and SmartScreen; zero attempts to disable security features or use malware-like evasion tricks.
4. **Clean Installation Lifecycle:** Standard Windows installer (`%ProgramFiles%`) replacing runtime extraction to `%ProgramData%`.

---

## 2. Target Component Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                    ASHtech PC Toolkit Pro (Desktop Shell)                   │
│               .NET 8 / Modern .NET Framework Host (.exe)                     │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │                    Microsoft Edge WebView2 Runtime                    │  │
│  │  - Hardware accelerated, modern Chromium rendering (replaces IE11)     │  │
│  │  - Direct asynchronous WebMessage IPC (window.chrome.webview)         │  │
│  │  - Native dark/light Fluent theme support                              │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                      │                                       │
│                       Local In-Process / Loopback IPC                        │
│            (HMAC-SHA256 Auth Token + 127.0.0.1 Only + Strict CORS)           │
│                                      │                                       │
│  ┌───────────────────────────────────▼────────────────────────────────────┐  │
│  │                      Local Engine & Security Bridge                    │  │
│  │  - Loopback REST/JSON endpoints (authenticated via X-Toolkit-Auth)     │  │
│  │  - Strictly whitelisted command dispatcher (no arbitrary cmd injection)│  │
│  │  - Real-time event streaming via Server-Sent Events (SSE)              │  │
│  │  - Built-in hardware sensor & WMI diagnostic caching                  │  │
│  └───────────────────────────────────┬────────────────────────────────────┘  │
└──────────────────────────────────────┼───────────────────────────────────────┘
                                       │
       ┌───────────────────────────────┼──────────────────────────────┐
       ▼                               ▼                              ▼
┌─────────────────────────┐ ┌─────────────────────────┐ ┌─────────────────────────┐
│     ASHtech Web UI      │ │    ASHtech Classic UI   │ │   ASHtech CLI Engine    │
│  (Modern Dashboard)     │ │   (PowerShell WinForms) │ │      (Toolkit.bat)      │
│ - Responsive modern CSS │ │ - Standalone fallback   │ │ - Hardened batch engine │
│ - Real-time metrics     │ │ - Zero-dependency       │ │ - Direct CLI parameters │
│ - Interactive diagnostic│ │   technician interface  │ │ - Whitelisted operations│
└─────────────────────────┘ └─────────────────────────┘ └─────────────────────────┘
```

---

## 3. Key Architectural Improvements

### 3.1 Migration from Trident (IE11) to Microsoft Edge WebView2
- **Current State:** Uses the obsolete WinForms `WebBrowser` control, requiring an invasive registry hack (`FEATURE_BROWSER_EMULATION = 11001`) to prevent IE7 quirks mode. Modern JavaScript (ES6+, async/await, Flexbox, Grid) requires polyfills or risks runtime syntax errors.
- **Target State:** Host UI inside **Microsoft Edge WebView2**:
  - Pre-installed natively on Windows 10 (20H2+) and Windows 11.
  - Full support for modern web standards, CSS variables, hardware-accelerated animations, and responsive layouts.
  - Eliminates the need to write to `HKCU\Software\Microsoft\Internet Explorer\...`.
  - Enables bidirectional messaging via `chrome.webview.postMessage` directly to C#, bypassing HTTP listener overhead for internal UI actions.

### 3.2 Hardened Local Loopback API & Zero-Trust IPC
- **Current State:** `WebBridgeServer.ps1` opens TCP 9999 to all network adapters, adds an inbound Windows Firewall rule, permits wildcard CORS, and accepts raw arbitrary strings in POST `/api/execute-option`.
- **Target State:**
  - **Loopback Binding Only:** Listener exclusively binds to `http://127.0.0.1:<random-or-fixed-port>/`.
  - **No Firewall Modifications:** Completely remove all `netsh advfirewall firewall add rule` scripts.
  - **Ephemeral Session Token:** When the desktop shell starts, it generates a high-entropy cryptographically random session token (stored in memory). Every API call from the UI must supply `X-Toolkit-Auth: <token>`. Unauthenticated requests receive HTTP 401 Unauthorized.
  - **CORS Restriction:** Responses enforce `Access-Control-Allow-Origin: http://127.0.0.1:<port>`.
  - **Command Whitelist Dispatcher:** Incoming execution requests send an action ID (e.g. `action: "repair_sfc_scan"`) with validated parameters. The server resolves the ID against a strict internal registry.

### 3.3 Elimination of Dropper/Payload Unpacking
- **Current State:** Embedded 4.7 MB ZIP resource extracted at runtime into `%ProgramData%\UltimateToolkitSuite`. Antivirus engines treat runtime payload droppers with extreme suspicion.
- **Target State:** Professional Windows Installer (Inno Setup / WiX MSI):
  - Installs cleanly to `%ProgramFiles%\ASHtech\PC Toolkit Pro`.
  - Creates Start Menu shortcuts and uninstaller registry entries.
  - Writes per-user settings to `%LocalAppData%\ASHtech\PCToolkitPro`.
  - Writes shared logs to `%ProgramData%\ASHtech\PCToolkitPro\Logs`.

### 3.4 Canonical Source Tree Unification
- **Current State:** Two redundant codebases (`tool/UltimateToolkit_Bundle_new/` and `V7/`) with diverging versions and corrupted scripts.
- **Target State:** Single canonical `src/` tree:
  - `src/Launcher/` (C# Desktop Application)
  - `src/Dashboard/` (HTML/CSS/JS modern web UI)
  - `src/Modules/` (PowerShell diagnostic & maintenance modules)
  - `src/Engine/` (`Toolkit.bat` core CLI engine)
  - `src/Config/` (Application catalogs & schemas)
  - `src/Assets/` (Branded icons & graphic assets)

---

## 4. Operational Modes Supported in Target State

1. **Integrated Modern Dashboard Mode (Primary):**
   - User launches `ASHtech_PCToolkitPro.exe`.
   - Desktop window opens with modern WebView2 interface, displaying real-time system vitals, guided diagnostic workflows, and automated repair runners.
2. **Classic Field-Tech Mode (Fallback / WinPE):**
   - User or script launches `ASHtech_Classic.exe` or `Toolkit-GUI-Pro.ps1`.
   - Lightweight, zero-dependency WinForms interface opens without web engine overhead. Ideal for offline systems, safe mode, and WinPE recovery environments.
3. **Headless / Automation CLI Mode (Sysadmin):**
   - User runs `Toolkit.bat --label <LabelName>` or `ASHtech_PCToolkitPro.exe --cli <ActionName>`.
   - Executes specified diagnostic or repair script directly to console standard output, suitable for remote management (RMM), SCCM, or scheduled tasks.
