# ASHtech PC Toolkit Pro — Build & Packaging Guide

**Milestone:** Phase 3 Task 6 — Reproducible Build  
**Target Version:** 8.0.0-dev  
**Branch:** `feature/phase3-modern-host`

---

## 1. Overview

ASHtech PC Toolkit Pro features a fully automated, deterministic build engine configured via `build/build.ps1`. The build system enforces cryptographic payload integrity against `build/payload-manifest.json`, stages runtime dependencies, bundles embedded resources, compiles the host application, and outputs a clean standalone distribution to `dist/`.

A developer or CI/CD agent can execute **one single command** to produce a fully validated, production-ready build.

---

## 2. Prerequisites

1. **Operating System:** Windows 10/11 or Windows Server 2016+ (or PowerShell 5.1 / PowerShell 7+ on any platform for payload staging).
2. **Execution Policy:** RemoteSigned or Bypass (`Set-ExecutionPolicy -Scope Process Bypass`).
3. **Build Tooling (Optional for portable packaging, required for C# compilation):**
   - .NET SDK (6.0, 7.0, 8.0, or 9.0) OR Visual Studio 2019/2022 with MSBuild.
   - For legacy target: .NET Framework 4.0/4.8 developer pack.
   - For WebView2: Microsoft.Web.WebView2 package (NuGet).

---

## 3. One-Step Build Execution

Open PowerShell as Administrator (or standard user) and run:

```powershell
.\build\build.ps1
```

### Build Parameters

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `-Configuration` | String | `Release` | Build mode (`Release` or `Debug`). |
| `-OutputDir` | String | `dist` | Destination folder for compiled and staged assets. |
| `-Clean` | Switch | `$false` | Cleans pre-existing staging and dist directories before building. |
| `-SkipChecksum` | Switch | `$false` | Bypasses SHA-256 integrity verification (for development iterations). |

### Example Invocations

```powershell
# Standard Release build with clean output
.\build\build.ps1 -Configuration Release -Clean

# Fast development iteration without hash checks
.\build\build.ps1 -SkipChecksum

# Custom output destination
.\build\build.ps1 -OutputDir "C:\Builds\ASHtech_v8"
```

---

## 4. Build Pipeline Stages

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Initialization & Cleaning                                │
│    Creates clean temp_stage/ and dist/ directories          │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ 2. Manifest Verification (payload-manifest.json)            │
│    Calculates SHA-256 of all 54 certified files             │
│    Halts immediately if any file is missing or altered      │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ 3. Runtime Payload Staging                                  │
│    Copies Assets, Config, Modules, and core scripts         │
│    Generates required empty runtime directories (Tools, Logs)│
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ 4. Staging Archive Generation                               │
│    Compresses staged files into StagingZip embedded resource │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ 5. C# Host Compilation                                      │
│    Invokes MSBuild or dotnet to compile executable host     │
│    Embeds StagingZip and application manifest                │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ 6. Finalization & Receipt Emission                          │
│    Outputs dist/ directory, launcher, and build-receipt.json │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Output Directory Structure (`dist/`)

```
dist/
├── bin/                             # Compiled C# Host binaries
│   ├── ASHtech_PCToolkitPro.exe
│   └── Microsoft.Web.WebView2.Core.dll
├── Assets/                          # Brand logos, icons, wallpapers
├── Config/                          # Tool catalogs, bundles, profiles
├── Docs/                            # Reference documentation & audit logs
├── Modules/                         # Hardened PowerShell engine & WebBridge
│   ├── WebBridgeServer.ps1
│   ├── Toolkit-GUI-Pro.ps1
│   └── SmartMenuSearch.ps1
├── Tools/                           # Portable diagnostics staging (empty)
├── Logs/                            # Audit and execution logs (empty)
├── dashboard.html                   # Modernized WebView2 UI dashboard
├── Toolkit.bat                      # CLI batch launcher
├── Launch-ASHtech-Toolkit.cmd       # One-click portable launcher
└── build-receipt.json               # Cryptographic build metadata
```

---

## 6. Updating the Manifest

When files are modified or added during feature development:
1. Update `build/payload-manifest.json` with the new file path and its SHA-256 hash.
2. Run `.\build\build.ps1 -Clean` to generate a fresh certified build.
