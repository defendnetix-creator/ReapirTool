# Modernization Roadmap — ASHtech PC Toolkit Pro
**Project:** ASHtech PC Toolkit Pro  
**Document:** Modernization & Execution Roadmap (Phases 1–6)  
**Date:** September 2026  

---

## 1. Roadmap Overview

The modernization strategy is structured into six discrete, sequential phases to guarantee zero regressions to working capabilities while systematically mitigating security vulnerabilities and modernizing the developer and end-user experience.

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   PHASE 1    │ ──> │   PHASE 2    │ ──> │   PHASE 3    │
│  Discovery & │     │   Security   │     │  Repository  │
│ Architecture │     │  Hardening   │     │Consolidation │
│  [COMPLETE]  │     │ [NEXT STEP]  │     │              │
└──────────────┘     └──────────────┘     └──────────────┘
                            │
                            ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   PHASE 6    │ <── │   PHASE 5    │ <── │   PHASE 4    │
│ Installer &  │     │ Rebranding & │     │   WebView2   │
│ Commercial   │     │ UI Overhaul  │     │ Desktop Host │
│   Release    │     │              │     │              │
└──────────────┘     └──────────────┘     └──────────────┘
```

---

## 2. Phase-by-Phase Breakdown

### Phase 1: Deep Discovery, Security Audit, & Architectural Baseline
- **Status:** **COMPLETE**
- **Objectives:** Full 30-point repository scan, component mapping, security threat classification, and target architecture definition.
- **Key Deliverables:**
  - `docs/current-architecture.md`
  - `docs/feature-inventory.md`
  - `docs/security-and-defender-audit.md`
  - `docs/target-architecture.md`
  - `docs/modernization-roadmap.md`
  - `docs/commercialization-readiness.md`
  - `docs/phase1-summary.md`

---

### Phase 2: Security Hardening & Windows Defender Remediation (Immediate Next Priority)
- **Objective:** Eliminate every pattern that triggers Windows Defender, SmartScreen, or enterprise EDR flags, and close network security vulnerabilities.
- **Work Items:**
  1. **Secure Loopback API:**
     - Restrict HTTP listener strictly to `http://127.0.0.1:<port>/`.
     - Remove `Access-Control-Allow-Origin: *` and enforce strict local origin checks.
     - Implement ephemeral HMAC-SHA256 session token (`X-Toolkit-Auth`) required on all requests.
     - Remove inbound Windows Firewall rules from `Launch-WebDashboard.cmd` and `LauncherForm.cs`.
  2. **Purge Security Evasion & Disabling Routines:**
     - Delete options that execute `Set-MpPreference -DisableRealtimeMonitoring $true` and `Add-MpPreference -ExclusionPath`.
     - Remove all scripts that disable the Windows Firewall (`netsh advfirewall set allprofiles state off`).
     - Remove SmartScreen toggle scripts that set `EnableSmartScreen = 0`.
  3. **Remediate PowerShell Heuristic Patterns:**
     - Remove the Base64 `-EncodedCommand` from `Toolkit.bat:808` and replace with native logic.
     - Remove `Invoke-Expression` from `WebBridgeServer.ps1:9943` in favor of typed scriptblock execution.
     - Purge NirSoft password-recovery references from `Config\tools.catalog`.
  4. **Secure AI & External Communication:**
     - Route all LLM requests through authenticated server-side handlers; remove unauthenticated client-side fetches to public LLM endpoints.

---

### Phase 3: Canonical Repository Consolidation & Code Integrity
- **Objective:** Unify duplicated source trees, fix script syntax errors, and establish clean source control.
- **Work Items:**
  1. Merge `V7/` and `tool/UltimateToolkit_Bundle_new/` into a single canonical source root (`src/`).
  2. Fix the 111 corrupted lines at the head of `V7/Modules/WebBridgeServer.ps1`.
  3. Update `build_payload.ps1` to stage exclusively from the canonical root.
  4. Add a production `.gitignore` excluding generated files (`Config\SystemTwin.json`, `Logs\`, build artifacts).

---

### Phase 4: Modern Desktop Host & WebView2 Migration
- **Objective:** Upgrade the desktop shell from legacy IE11 to Microsoft Edge WebView2.
- **Work Items:**
  1. Update the C# launcher project to target .NET 6/8 or modern .NET Framework with the `Microsoft.Web.WebView2` NuGet package.
  2. Replace `System.Windows.Forms.WebBrowser` with `Microsoft.Web.WebView2.WinForms.WebView2`.
  3. Remove the registry manipulation code writing to `FEATURE_BROWSER_EMULATION`.
  4. Implement asynchronous bidirectional messaging using `window.chrome.webview.postMessage` to reduce HTTP listener surface.

---

### Phase 5: Rebranding & Visual Identity Alignment
- **Objective:** Complete the transition to **ASHtech PC Toolkit Pro**.
- **Work Items:**
  1. Update application titles, window captions, banner graphics, and icons across all interfaces.
  2. Update `Toolkit.bat` headers, CLI title bars, and echo statements.
  3. Refine `dashboard.html` styling: adopt a modern, cohesive enterprise theme with accessible typography and clean negative space.
  4. Update metadata in `Properties/AssemblyInfo.cs` to reflect ASHtech Corporation as publisher.

---

### Phase 6: Commercial Packaging, Installer, & Release Readiness
- **Objective:** Create a commercial installer and establish distribution readiness.
- **Work Items:**
  1. Build an Inno Setup script to install the suite to `%ProgramFiles%\ASHtech\PC Toolkit Pro`.
  2. Replace runtime unpacking of `StagingZip` with standard installer deployment.
  3. Provide Authenticode code signing integration scripts for enterprise deployment.
  4. Validate clean installation, execution, and uninstallation on clean Windows 10 and Windows 11 VMs with Windows Defender active.
