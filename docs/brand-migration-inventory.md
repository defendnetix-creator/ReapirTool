# Brand Migration Inventory: ASHtech → Akshigo Tech
**Phase 6.1: Commercial Identity Transition**  
**Product:** Akshigo PC Toolkit Pro  
**Publisher / Company:** Akshigo Tech  
**Target Release:** `8.0.0-rc.1`

---

## 1. Executive Summary

This document catalogues the comprehensive commercial brand migration of the Windows PC repair and diagnostic suite from the legacy identifier **ASHtech** to the new commercial brand identity **Akshigo Tech** and product name **Akshigo PC Toolkit Pro**.

All customer-facing UI components, installers, registry hives, file paths, license keys, update channels, and build scripts have been migrated while strictly preserving cryptographic security, backward compatibility with legacy license keys (`ASHT-`), DPAPI token storage, and Defender hardening.

---

## 2. Brand Identity Mapping

| Category | Legacy Identifier | New Brand Identifier |
| :--- | :--- | :--- |
| **Product Name** | ASHtech PC Toolkit Pro | **Akshigo PC Toolkit Pro** |
| **Publisher / Company** | ASHtech Technologies Inc. | **Akshigo Tech** |
| **Short Brand / Acronym** | ASHTECH | **AKSHIGO** |
| **Executable Name** | `ASHtech_PC_Toolkit_Pro.exe` | `Akshigo-PC-Toolkit-Pro.exe` |
| **Program Files Path** | `C:\Program Files\ASHtech\PC Toolkit Pro` | `C:\Program Files\Akshigo Tech\PC Toolkit Pro` |
| **ProgramData Path** | `C:\ProgramData\ASHtech\PC Toolkit Pro` | `C:\ProgramData\Akshigo Tech\PC Toolkit Pro` |
| **AppData (Local) Path** | `%LOCALAPPDATA%\ASHtech\PC Toolkit Pro` | `%LOCALAPPDATA%\Akshigo Tech\PC Toolkit Pro` |
| **WebView2 Data Path** | `%LOCALAPPDATA%\ASHtech\WebView2Data` | `%LOCALAPPDATA%\Akshigo Tech\WebView2Data` |
| **Registry Hive** | `HKLM\Software\ASHtech\PC Toolkit Pro` | `HKLM\Software\Akshigo Tech\PC Toolkit Pro` |
| **License Key Prefix** | `ASHT-` (e.g., `ASHT-PRO-2026-X8K9-M2Q1-W4P7`) | `AKSG-` (e.g., `AKSG-PRO-2026-X8K9-M2Q1-W4P7`) |
| **Update Channel Storage** | `ashtech_update_channel` | `akshigo_update_channel` |
| **License Token Storage** | `ashtech_license_token` | `akshigo_license_token` |
| **Device ID Storage** | `ashtech_device_id` | `akshigo_device_id` |
| **Inno Setup Script** | `installer/ASHtech_PC_Toolkit_Pro.iss` | `installer/Akshigo_PC_Toolkit_Pro.iss` |
| **Authenticode Signer** | `CN=ASHtech Technologies Inc` | `CN=Akshigo Tech` |
| **Update Endpoint** | `https://updates.ashtech.pro` | `https://updates.akshigo.tech` (or configured via ENV) |

---

## 3. Inventory of Migrated Components

### A. Core Architecture & Configuration
- `src/config/brand.ts`: Created single source of truth for all brand constants, paths, URLs, and registry keys.
- `src/config/environment.ts`: Updated default update endpoints and signer identity verification.
- `metadata.json`: Updated product name to `Akshigo PC Toolkit Pro` and description to `Akshigo Tech`.
- `index.html`: Updated HTML title, meta tags, and OpenGraph metadata.
- `VERSION`: Updated to `8.0.0-rc.1`.
- `sbom.json`: Updated CycloneDX SBOM supplier, tools, and component definitions.

### B. User Interface & Presentation
- `src/components/Sidebar.tsx`: Updated logo brand header, tags, and product labels to AKSHIGO.
- `src/components/TopBar.tsx`: Dynamic breadcrumbs and licensing pills with real-time status.
- `src/components/SettingsView.tsx`: Filesystem path displays and About dialog updated to Akshigo Tech.
- `src/components/ActivationModal.tsx`: Brand banners, input placeholders, and test key references migrated to `AKSG-` series.
- `src/components/SubscriptionView.tsx`: Updated tier cards and license renewal indicators.
- `src/components/UpdateModal.tsx`: Updated publisher and release notes presentation.

### C. Licensing Engine & Server Authority
- `src/licensing/licenseClient.ts`: Added automated storage key migration (`performLegacyBrandMigration()`), fallback verification, and `AKSG-` test keys.
- `server/licensing/crypto.ts`: Added dual-hash verification supporting both legacy `ASHT` and new `AKSG` salt hashes.
- `server/licensing/database.ts`: Seeded dual-key aliases ensuring both legacy keys and new `AKSG` keys authenticate seamlessly against the authoritative license records.

### D. Update Engine & Release Engineering
- `src/updates/updateClient.ts`: Configurable Authenticode signer pinning (`ENV.expectedSignerIdentity`), `akshigo_update_channel` storage, and installer path.
- `server/updates/manifests.ts`: Release manifests for `8.0.0-rc.1` with `Akshigo-PC-Toolkit-Pro-8.0.0-rc.1-Setup.exe`.
- `server/updates/routes.ts`: Update download routes and manifest endpoints updated with Akshigo branding.

### E. Installer & Packaging
- `installer/Akshigo_PC_Toolkit_Pro.iss`: Full Inno Setup 6 script with backward-compatible AppId (`{{C81F7A23-5C32-4E2B-981D-F81A96010214}}`), Akshigo installation directories, clean uninstallation, and legacy data migration Pascal hook.
- `installer/EULA.txt`: Updated End User License Agreement to Akshigo Tech.
- `installer/build_installer.ps1`: Automated packaging pipeline targeting `Akshigo_PC_Toolkit_Pro.iss`.
- `scripts/build_release.ps1`: Master commercial build pipeline with Akshigo branding and SHA-256 release manifests.
- `scripts/signing/Sign-Artifacts.ps1`: Authenticode SHA-256 code signing pipeline for Akshigo Tech.
- `scripts/scan_defender_regressions.ps1`: Automated Defender heuristics & anti-regression audit.

---

## 4. Verification Checklist

- [x] No customer-facing `ASHtech` strings in UI views.
- [x] Backward-compatibility layer safely migrates legacy local storage keys.
- [x] Legacy `ASHT-` license keys continue to validate against authoritative licensing engine.
- [x] New `AKSG-` license keys activate instantly and persist to DPAPI/secure client cache.
- [x] Windows Inno Setup installer seamlessly upgrades existing installations with identical AppId.
- [x] Zero Defender regressions detected across all codebase modules.
