# Commercialization Readiness Assessment — ASHtech PC Toolkit Pro
**Project:** ASHtech PC Toolkit Pro  
**Document:** Commercialization & Distribution Readiness  
**Date:** September 2026  

---

## 1. Executive Summary

Transforming an internal IT toolkit into a commercial desktop product (**ASHtech PC Toolkit Pro**) requires addressing several legal, operational, and distribution prerequisites beyond code functionality. This document audits third-party licensing, code signing requirements, installation packaging, enterprise deployment compatibility, and privacy compliance.

---

## 2. Third-Party Licensing & Intellectual Property Audit

### 2.1 NirSoft Utilities (Critical Legal Risk)
- **Status in Codebase:** `Config\tools.catalog` references 7 NirSoft credential-recovery and diagnostic utilities (`wirelesskeyview.exe`, `produkey.exe`, `cports.exe`, etc.).
- **License Terms:** NirSoft explicitly states in its license terms that **commercial redistribution of NirSoft utilities is prohibited without express permission or licensing agreements**, and bundling them into commercial software packages is forbidden.
- **Remediation:** Remove all bundled NirSoft binaries prior to commercial release. Replace diagnostic functions with native Windows APIs:
  - Open Ports: Use `Get-NetTCPConnection` / `Get-NetUDPEndpoint`.
  - Windows Product Key: Query `(Get-CimInstance SoftwareLicensingService).OA3xOriginalProductKey`.
  - USB History: Query registry key `HKLM:\SYSTEM\CurrentControlSet\Enum\USBSTOR`.

### 2.2 Win11Debloat (Open Source Compliance)
- **Status in Codebase:** `Modules\Win11Debloat.ps1` originates from the open-source Win11Debloat project by Raphire.
- **License Terms:** Governed by the GNU General Public License (GPL) / MIT License.
- **Remediation:** Include original copyright notice and license text in a dedicated `ThirdPartyNotices.txt` file within the distribution package.

### 2.3 Assets & Typography
- **Fonts:** Currently relies on Google Fonts CDN (`Inter`, `JetBrains Mono`). For an enterprise application that may operate on air-gapped or restricted networks, fonts should be bundled locally as WOFF2 files to eliminate external CDN dependencies.
- **Images:** Hero banners and wallpapers must be verified for commercial intellectual property rights or replaced with original ASHtech corporate branding assets.

---

## 3. Code Signing & Windows SmartScreen Strategy

Unsigned Windows binaries or binaries with self-signed certificates immediately trigger **Windows Defender SmartScreen** warnings (*"Windows protected your PC - Microsoft Defender SmartScreen prevented an unrecognized app from starting"*), causing high friction and abandonment in commercial sales.

### Code Signing Architecture:
1. **Certificate Type:** Obtain a standard **OV (Organization Validation)** or **EV (Extended Validation)** Code Signing Certificate issued to ASHtech Corporation, or leverage **Microsoft Azure Trusted Signing** (formerly Azure Code Signing).
2. **Signing Pipeline:**
   - Sign all compiled PE binaries (`ASHtech_PCToolkitPro.exe`, `ASHtech_Classic.exe`, helper DLLs).
   - Sign all primary PowerShell scripts (`.ps1`, `.psm1`) with `Set-AuthenticodeSignature`.
   - Sign the final installation executable (`ASHtech_PCToolkitPro_Setup.exe`).
   - Use a reliable RFC 3161 timestamping server (`http://timestamp.digicert.com`) to ensure signatures remain valid after certificate expiration.

---

## 4. Packaging, Installer, & Lifecycle Management

### 4.1 Installer Recommendation: Inno Setup
Instead of runtime extraction from an embedded ZIP to `%ProgramData%`, use an industry-standard **Inno Setup** compiler script:
- **Default Installation Path:** `{autopf}\ASHtech\PC Toolkit Pro` (`C:\Program Files\ASHtech\PC Toolkit Pro`).
- **Administrative Rights:** Configured with `PrivilegesRequired=admin`.
- **Start Menu & Desktop Shortcuts:** Cleanly created with official ASHtech icons.
- **Silent Deployment Support:** Full support for enterprise flags:
  ```cmd
  ASHtech_PCToolkitPro_Setup.exe /VERYSILENT /SUPPRESSMSGBOXES /NORESTART /SP-
  ```
- **Clean Uninstaller:** Registers in Windows `Apps & Features` (`UninstallString`). Completely purges installed binaries and optionally prompts to archive or delete diagnostic logs.

### 4.2 Portable Mode Support
Technicians frequently operate from bootable USB drives. The architecture should support a portable flag:
- When an `ash_portable.marker` file exists in the executable directory, the application stores logs and settings in `.\Data\` rather than system folders, operating without installation.

---

## 5. Enterprise IT & RMM Readiness

Commercial IT technicians and Managed Service Providers (MSPs) require seamless integration with Remote Monitoring and Management (RMM) platforms (NinjaOne, Datto RMM, ConnectWise Automate, N-able):

1. **Exit Codes:** Ensure all headless CLI actions return standardized return codes:
   - `0`: Success / System healthy
   - `1`: Error encountered during execution
   - `2`: Reboot required
   - `3`: Administrative elevation missing
2. **Structured Output:** Support `--json` flag on CLI calls for machine-readable status output that RMM monitoring sensors can parse directly.
3. **Non-Interactive Execution:** Ensure that when invoked via script or CLI, commands never hang waiting for an interactive `pause` or `Press any key to continue...`.

---

## 6. Privacy & Data Handling Compliance

1. **Local-First Processing:** All hardware metrics, event logs, and repair operations run entirely on the local client.
2. **Zero Default Telemetry:** No user analytics, trackers, or telemetry beacons are present or transmitted.
3. **AI Governance:**
   - Any AI diagnostics must require explicit user opt-in and the user's own API key.
   - Diagnostic prompts must sanitize personal identifiers (PII), usernames, IP addresses, and MAC addresses before transmission.
