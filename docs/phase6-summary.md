# ASHtech PC Toolkit Pro — Phase 6 Release Engineering Summary

**Product Version:** **8.0.0 Commercial Release**  
**Milestone:** Phase 6 — Professional Installer, Authenticode Signing, Secure Updates & Release Engineering  
**Status:** **COMPLETE & VERIFIED**

---

## 1. Accomplished Deliverables

### A. Release Build Configurations & Mode Separation
- Implemented `src/config/environment.ts` supporting `DEBUG`, `STAGING`, and `RELEASE` modes.
- In `RELEASE` mode:
  - Evaluation license key presets are completely stripped from the customer UI.
  - Production licensing authority endpoints (`https://licensing.ashtech.pro/api/v1/licenses`) and update authority endpoints (`https://updates.ashtech.pro/api/v1/updates`) are enforced.
  - WebView2 developer tools and context menus are disabled.
  - Test backdoors and mock evaluation shortcuts are eliminated.

### B. Standard Windows Directory Architecture
- **Immutable Application Assets**: `C:\Program Files\ASHtech\PC Toolkit Pro\` (Read-only for standard users).
- **Machine Operational Logs & Reports**: `C:\ProgramData\ASHtech\PC Toolkit Pro\` (Shared, secure ACLs).
- **User State & License Vault**: `%LOCALAPPDATA%\ASHtech\PC Toolkit Pro\` (Protected by Windows DPAPI).
- **Isolated WebView2 Profile**: `%LOCALAPPDATA%\ASHtech\WebView2Data\`.

### C. Commercial Windows Installer (Inno Setup 6)
- Created `installer/ASHtech_PC_Toolkit_Pro.iss` and `installer/build_installer.ps1`.
- Clean Add/Remove Programs uninstaller registration.
- Automated prerequisite detection for .NET Framework 4.8+ and Microsoft Edge WebView2 runtime (with silent Evergreen bootstrapper installer fallback).
- In-place transactional upgrades (8.0.0 -> 8.0.1) preserving user license tokens and diagnostic reports.

### D. Authenticode Code Signing & Timestamping Pipeline
- Created `scripts/signing/Sign-Artifacts.ps1` and `scripts/signing/Verify-Signatures.ps1`.
- Enforces modern **SHA-256 Authenticode digest** (`/fd SHA256`) and **RFC 3161 timestamping** (`/tr http://timestamp.digicert.com /td SHA256`) with automatic Sectigo fallback.
- Configurable signing modes: `NONE`, `LOCAL_CERTIFICATE`, `MANAGED_SIGNING` (Azure Trusted Signing / Cloud HSM), and `STORE`.
- Published `docs/code-signing-guide.md` with factual SmartScreen reputation guidance.

### E. Secure Update Architecture & Manifest Authority
- Created `/server/updates/routes.ts` and `/src/updates/updateClient.ts`.
- Manifest-driven HTTPS update system with semantic versioning, distribution channels (`stable`, `beta`), release notes, and mandatory update deadlines.
- Multi-stage verification pipeline: Download -> SHA-256 Digest Check -> Authenticode Digital Signature Check -> Publisher Pinning (`CN=ASHtech Technologies Inc`) -> Transactional Installer Execution.
- Interactive Update UI in `SettingsView.tsx` and `UpdateModal.tsx`.

### F. Build Automation, SBOM & Defender Regression Audit
- Created master release script `scripts/build_release.ps1`.
- Created CycloneDX 1.5 Software Bill of Materials `sbom.json`.
- Created automated security and Defender regression scanner `scripts/scan_defender_regressions.ps1`.
- Comprehensive documentation suite produced in `docs/`.
