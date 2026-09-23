# ASHtech PC Toolkit Pro — Phase 2 Security Hardening & Windows Defender Compatibility Report

**Product:** ASHtech PC Toolkit Pro  
**Milestone:** Phase 2 — Security Hardening & Antivirus / EDR Compatibility  
**Repository:** `https://github.com/defendnetix-creator/ReapirTool.git`  
**Target Platform:** Windows 10 / Windows 11 / Windows Server (x64)  
**Execution Date:** September 2026  
**Status:** COMPLETED & VERIFIED  

---

## 1. Executive Summary

In accordance with the approved Phase 2 modernization roadmap, the entire codebase of the PC Toolkit has undergone exhaustive security hardening. The overarching principle was preserved: **maintain legitimate administrative and diagnostic capabilities while completely eliminating offensive malware-like behaviors, insecure network bindings, unauthenticated local APIs, credential dumpers, obfuscated code, and security control suppression.**

The resulting application establishes enterprise-grade operational trust, complete immunity to cross-site scripting (XSS) / cross-site request forgery (CSRF) loopback hijacking, clean Defender SmartScreen compatibility, and comprehensive forensic audit logging.

---

## 2. Detailed Task Implementation & Verification Matrix

### Task 1 & 2: Loopback Isolation & Firewall Exposure Removal
* **Prior State:** `WebBridgeServer.ps1` dynamically enumerated all active IPv4 interfaces on the machine and bound `HttpListener` prefixes to `http://+:$Port/`, `http://*:$Port/`, and physical LAN IP addresses (`192.168.x.x`, `10.x.x.x`). Additionally, both `LauncherForm.cs` and `Launch-WebDashboard.cmd` ran commands adding an inbound Windows Firewall allow rule (`netsh advfirewall firewall add rule name='UltimateToolkit Web Bridge' dir=in action=allow protocol=TCP localport=9999`).
* **Vulnerability:** Exposed high-privilege administrative execution capabilities to any machine on the local area network (LAN/Wi-Fi).
* **Remediation:**
  1. Bound the `HttpListener` strictly to loopback endpoints:
     - `http://127.0.0.1:9999/`
     - `http://localhost:9999/`
  2. Completely removed the inbound firewall rule creation from `LauncherForm.cs` and `Launch-WebDashboard.cmd`.
  3. Added an automated cleanup command to delete any legacy inbound firewall rule if previously left behind.
* **Verification:** Validated that listening sockets bind exclusively to loopback addresses, preventing LAN packets from reaching the bridge.

### Task 3: Session Authentication (`X-Toolkit-Auth`)
* **Prior State:** Any HTTP client executing on localhost (including malicious JavaScript running inside an ordinary browser tab visiting an attacker's website) could send unauthorized `POST` requests to `http://localhost:9999/api/run-op` to execute code.
* **Remediation:**
  1. Implemented a cryptographically secure, ephemeral 32-byte session token generated at bridge startup via `[System.Security.Cryptography.RandomNumberGenerator]`.
  2. The bridge writes the session token to an ephemeral, user-restricted runtime file (`Config/.session_token`) and injects it into `dashboard.html`.
  3. Strict constant-time token validation (`Test-ConstantTimeMatch`) is enforced on all incoming API requests (except `/health` and static assets). Unauthorized requests immediately receive `HTTP 401 Unauthorized`.
  4. Patched `dashboard.html` to globally intercept and append `X-Toolkit-Auth` headers to all internal `fetch` requests.
* **Verification:** Confirmed that requests missing `X-Toolkit-Auth` or presenting mismatched tokens are rejected with HTTP 401.

### Task 4 & 5: Host / Origin Validation & Command Allowlisting
* **Prior State:** CORS header was set to wildcard `Access-Control-Allow-Origin: *`. Endpoint `/api/run-cli` and `/api/run-op` accepted arbitrary shell strings.
* **Remediation:**
  1. Removed `Access-Control-Allow-Origin: *`. Enforced strict origin matching against `http://localhost:9999`, `http://127.0.0.1:9999`, and `null` (local file context).
  2. Validated the `Host` header to ensure incoming requests target loopback interfaces.
  3. Built an explicit, predefined allowlist registry for all executable diagnostic actions. Unrecognized operations are rejected with HTTP 403.
  4. Implemented strict input sanitization on all parameters using alphanumeric regex constraints (`^[a-zA-Z0-9_\-\. ]+$`).
* **Verification:** Tested invalid origins and arbitrary shell injection attempts; all are blocked with security audit log entries.

### Task 6: Removal of Defender-Disabling Functions
* **Prior State:** 
  - `Toolkit.bat` option 8 under `:defender_tools` executed `Set-MpPreference -DisableRealtimeMonitoring $true`.
  - Option 9 allowed arbitrary path exclusions (`Add-MpPreference -ExclusionPath`).
  - `WebBridgeServer.ps1` contained `'tweak_defender_disable'` and a toggle allowing clients to turn Real-Time Protection off.
  - `smartscreen_filter` toggle permitted setting `EnableSmartScreen = 0`.
* **Remediation:**
  1. Replaced `Toolkit.bat` Option 8 with **"Update Defender Antivirus Signatures"** (`Update-MpSignature`).
  2. Replaced `Toolkit.bat` Option 9 with **"Microsoft Defender Diagnostics & Status Query"**.
  3. Replaced `'tweak_defender_disable'` in `WebBridgeServer.ps1` with an enterprise security policy notice: Real-Time Protection must remain enabled.
  4. Updated the `defender_realtime` and `smartscreen_filter` endpoints in `WebBridgeServer.ps1` to only permit enabling protection. Any attempt to disable protection is blocked and logged as a security alert.
* **Verification:** Verified across all `.bat`, `.cmd`, and `.ps1` files that no routine sets `DisableRealtimeMonitoring $true` or `EnableSmartScreen 0`.

### Task 7: Removal of Firewall-Disabling Functions
* **Prior State:** `Toolkit.bat` option 4 in `:firewall_mgr` and `:fw_disable_all` executed `netsh advfirewall set allprofiles state off`.
* **Remediation:**
  1. Replaced Option 4 in `Toolkit.bat` with **"Enforce Secure Firewall State (All Profiles ON)"**.
  2. Updated `:fw_disable_all` to notify the technician that firewall suppression is blocked by enterprise policy, automatically enforcing state ON.
* **Verification:** Zero scripts or bridge endpoints permit disabling Windows Firewall.

### Task 8: Elimination of Base64 Encoded PowerShell Commands
* **Prior State:** `Toolkit.bat:808` invoked `powershell.exe -EncodedCommand <Base64String>`. This heuristic pattern triggers Windows Defender AMSI and EDR threat detectors.
* **Remediation:**
  1. Decoded the command: it was a keyword-routing script for the interactive menu search feature.
  2. Replaced the inline base64 command with a dedicated, clean, human-readable script: `Modules\SmartMenuSearch.ps1`.
  3. Updated `Toolkit.bat` to call `powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Modules\SmartMenuSearch.ps1"`.
* **Verification:** Confirmed zero `-EncodedCommand`, `-encoded`, or `-enc` invocations remain anywhere in the codebase.

### Task 9 & 10: Removal of Credential Dumpers & Cleartext Password Dumps
* **Prior State:**
  - `Config/tools.catalog` listed 7 third-party credential-dumping tools: `wirelesskeyview.exe`, `webbrowserpassview.exe`, `produkey.exe`, `passwordfox.exe`, `vaultpasswordview.exe`, `routerpassview.exe`, and `netpass.exe`.
  - Multiple scripts invoked `netsh wlan show profile name=... key=clear` to output cleartext Wi-Fi passphrases to the console or desktop text files.
* **Remediation:**
  1. Purged all 7 credential-harvesting utilities from `tools.catalog`.
  2. Created safe native diagnostic replacements:
     - `Modules\WiFiDiagnostics.cmd`: Gathers network adapters, SSIDs, signal levels, and encryption types without reading security keys.
     - `Modules\CheckActivation.cmd`: Queries native Windows Software Licensing (`slmgr.vbs /dli`) to confirm genuine activation.
  3. Audited and eliminated all occurrences of `key=clear` across `Toolkit.bat`, `WebBridgeServer.ps1`, `SystemInventoryReport.ps1`, `Toolkit-GUI-Pro.ps1`, `ToolkitReportCenter.ps1`, and `Web-Dashboard.ps1`.
  4. Published complete third-party component assessment documentation in `docs/third-party-components.md`.
* **Verification:** Verified with recursive grep that zero occurrences of `key=clear` remain across the entire repository.

### Task 11: Structured Forensic Logging & Audit Trail
* **Prior State:** Log messages were unstructured strings appended to a loose file without log rotation or user context.
* **Remediation:**
  1. Redesigned `function Log` in `WebBridgeServer.ps1` to produce standardized structured log lines:
     `[TIMESTAMP_ISO8601] [LOG_LEVEL] [COMPONENT] [User: USERNAME (Elevated: BOOL)] [OPERATION] [RESULT] MESSAGE`
  2. Integrated automatic log rotation (`Rotate-LogFile`) capping log files at 10 MB and retaining 5 rotated archive generations.
  3. Integrated automatic token sanitization: session authentication tokens are intercepted and redacted (`[REDACTED_AUTH_TOKEN]`) before writing to disk.
* **Verification:** Verified log format and confirmed no credential material is recorded.

### Task 12: Secure Server-Side AI Integration
* **Prior State:** `dashboard.html` contained direct browser `fetch('https://text.pollinations.ai/...')` fallbacks, transmitting system telemetry directly from the web client.
* **Remediation:**
  1. Isolated all external AI communications to server-side bridge handlers (`/api/chat`, `/api/ai-diagnose`).
  2. Removed all direct browser external API calls from `dashboard.html`.
  3. Implemented a robust local offline diagnostics synthesis fallback: if external AI is unconfigured or offline, the dashboard gracefully formats hardware telemetry without errors or external network dependencies.
  4. Restricted local credential file access permissions (`icacls.exe /inheritance:r`) when saving `Config/ai_settings.json`.
  5. Added comprehensive `.gitignore` ensuring runtime keys (`*.key`, `*.token`, `ai_settings.json`) are never committed to version control.
* **Verification:** Verified zero external HTTPS calls originate directly from `dashboard.html`.

---

## 3. Microsoft Defender & EDR Compatibility Verification

| Detection Rule / Threat Category | Legacy Status | Hardened Status | Verification Method |
|----------------------------------|---------------|-----------------|---------------------|
| `HackTool:Win32/Passview` | Flagged | **Clean** | Binary removed from catalog; replaced with native diagnostics |
| `HackTool:Win32/Keyview` | Flagged | **Clean** | Binary removed; Wi-Fi `key=clear` dumps eliminated |
| `HackTool:Win32/ProduKey` | Flagged | **Clean** | Binary removed; replaced with `slmgr.vbs` |
| `Pua:Win32/PasswordStealer` | Flagged | **Clean** | All browser and vault decryptors purged |
| AMSI Script Obfuscation (Base64) | High Heuristic | **Clean** | Converted to clear `SmartMenuSearch.ps1` |
| Defense Evasion: Defender Disabling | Critical Alarm | **Clean** | All `Set-MpPreference -DisableRealtimeMonitoring $true` removed |
| Defense Evasion: Firewall Disabling | High Alarm | **Clean** | All `netsh advfirewall set allprofiles state off` removed |
| Network Attack Surface: LAN Exposure | High Risk | **Clean** | Restricted strictly to `127.0.0.1` and `localhost` |
| CSRF / Remote Port 9999 Hijacking | Critical Vulnerability | **Clean** | Mitigated by ephemeral `X-Toolkit-Auth` and Origin checking |

---

## 4. Conclusion & Next Phase Readiness

The toolkit has successfully achieved **Phase 2 Security Hardening & Windows Defender Compatibility**. All legitimate functionality — including hardware benchmarking, partition management, registry repair, SFC/DISM servicing, network troubleshooting, and live dashboard monitoring — remains completely operational.

The repository is now fully prepared for **Phase 3 (WebView2 Migration & Modern Native UI Shell)**.
