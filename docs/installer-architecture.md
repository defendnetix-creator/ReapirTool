# ASHtech PC Toolkit Pro — Installer Architecture & Filesystem Specification

**Version:** 8.0.0 Commercial Release  
**Publisher:** ASHtech Technologies Inc.  
**Target Platform:** Windows 10 / Windows 11 (x64)

---

## 1. Executive Overview

ASHtech PC Toolkit Pro v8.0.0 utilizes an **Inno Setup 6** installer pipeline designed to package, deploy, and register the application in standard Windows enterprise locations.

The architecture enforces strict separation between:
1. **Immutable Application Binaries & Assets** (`Program Files`)
2. **Machine-Wide Diagnostic & Operational Logs** (`ProgramData`)
3. **User Identity, Preferences & Protected License Tokens** (`%LOCALAPPDATA%`)

---

## 2. Directory Architecture & Access Control (ACLs)

| Directory Path | Role & Contents | Access Control / Permissions | Lifecycle |
| :--- | :--- | :--- | :--- |
| `C:\Program Files\ASHtech\PC Toolkit Pro\` | Application executable, .NET assemblies, WebView2 web assets (`dist/`), and specialized diagnostic modules. | **Read-Only** for Standard Users.<br>**Full Control** for SYSTEM and Administrators. | Removed on complete uninstall; overwritten during in-place upgrade. |
| `C:\ProgramData\ASHtech\PC Toolkit Pro\` | Machine operational logs, forensic audit ring, diagnostic report storage, and staging directory for update packages (`Updates/`). | **Read/Write/Modify** for Authenticated Users.<br>**Full Control** for Administrators. | Preserved by default on uninstall unless user opts to purge. |
| `%LOCALAPPDATA%\ASHtech\PC Toolkit Pro\` | DPAPI-encrypted offline license token cache (`license.dat`), device identity metadata, and UI preferences. | **User-Private** (Restricted to logged-in Windows user SID). | Preserved during upgrades to maintain continuous activation. |
| `%LOCALAPPDATA%\ASHtech\WebView2Data\` | Isolated Chromium WebView2 profile (IndexedDB, localStorage, GPU cache, HTTP cache). | **User-Private** (Per-user browser partition). | Managed by WebView2 Runtime. |

---

## 3. Privilege Model & Elevation Rules

1. **Setup Elevation (`admin`)**:
   - The installer requires administrative privileges (`PrivilegesRequired=admin`) to install files into `Program Files` and register system-wide uninstall metadata in `HKLM\Software\Microsoft\Windows\CurrentVersion\Uninstall`.
2. **Application Execution (`asInvoker`)**:
   - The main application executable (`ASHtech_PC_Toolkit_Pro.exe`) starts at standard user privilege level (`asInvoker` in `app.manifest`).
   - Diagnostic and repair operations requiring elevated privileges communicate through the hardened local loopback bridge with explicit user confirmation, preventing unnecessary full-app elevation.

---

## 4. Prerequisites & Runtime Detection

The installer automatically inspects the target host prior to copying files:

1. **Operating System Minimum Version**:
   - Minimum supported Windows build is **Windows 10 Build 17763 (1809)** or **Windows 11**.
2. **.NET Framework 4.8 / .NET 6+ Verification**:
   - Checks `HKLM\SOFTWARE\Microsoft\NET Framework Setup\NDP\v4\Full\Release >= 528040`.
3. **Microsoft Edge WebView2 Evergreen Runtime**:
   - Checks registry keys `SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}`.
   - If missing, the installer extracts the bundled `MicrosoftEdgeWebview2Setup.exe` bootstrapper and runs `/silent /install`.

---

## 5. Clean Uninstall & In-Place Upgrades

### Uninstaller Behavior
- Registered in Windows Settings (Add or Remove Programs) with full metadata (Publisher, Help Link, Display Version, Size).
- Fully unregisters shortcuts, binaries, and registry keys.
- **Data Retention Prompt**: Offers user a clear confirmation prompt during uninstall:
  > *"Would you like to preserve your diagnostic reports and license registration on this device?"*
  - **Yes (Default)**: Keeps `ProgramData` and license token for seamless reinstallation.
  - **No**: Completely purges all application traces and DPAPI tokens.

### In-Place Upgrade Behavior
- When running a newer setup version (e.g. 8.0.1 or 8.1.0):
  - Automatically identifies running instances and requests graceful close.
  - Replaces application binaries and web assets without touching user license tokens or diagnostic history.
  - Ensures continuous subscription status without re-entering activation keys.
