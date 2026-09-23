# ASHtech PC Toolkit Pro — Microsoft Store & MSIX Packaging Readiness Evaluation

**Version:** 8.0.0 Commercial Release  
**Platform Evaluation:** Win32 Desktop Application vs. MSIX Containerized App

---

## 1. Technical Evaluation Summary

ASHtech PC Toolkit Pro is currently distributed as a **Win32 desktop application with Inno Setup** due to its deep hardware diagnostics, system repair routines, and specialized Windows subsystem management.

This document evaluates the trade-offs and readiness requirements for future Microsoft Store (MSIX / Centipede) distribution.

---

## 2. Capabilities Comparison Matrix

| Application Capability | Win32 + Inno Setup (Current) | MSIX / Microsoft Store | Impact on ASHtech Toolkit Pro |
| :--- | :--- | :--- | :--- |
| **System Repair & SFC / DISM** | Direct execution via elevated background bridge. | Restricted. Requires `runFullTrust` capability. | Fully compatible only if `runFullTrust` is granted by Store policy. |
| **Direct Hardware & SMART Access** | Direct Win32 / WMI low-level device queries. | Restricted without full trust. | Win32 full trust container required. |
| **Printer Spooler Reset & Driver Diagnostics** | Direct service management (`Restart-Service spooler`). | Sandboxed. Service stop/start restricted in standard UWP. | Requires standard desktop elevation model. |
| **Installation Directory Architecture** | Installs to `C:\Program Files\ASHtech\PC Toolkit Pro\` with read-only ACLs and `ProgramData` logs. | Virtualized VFS file system (`C:\Program Files\WindowsApps\...`). | Requires virtual file system redirections and `localAppData` mappings. |
| **Code Signing & Distribution** | Authenticode SHA-256 with DigiCert RFC 3161 timestamping. | Microsoft Store signed during ingestion. | Store signing removes need for external CA; however, dual-signing is required for hybrid distribution. |
| **Updates Pipeline** | HTTPS manifest-driven updater with Inno Setup in-place upgrades. | Handled automatically by Microsoft Store infrastructure. | Store updates eliminate custom updater complexity for Store users. |

---

## 3. Recommended Store Roadmap

1. **Phase 1 (Current - v8.0.0)**:
   - Primary distribution via **Signed Win32 Installer (Inno Setup)** for direct enterprise and technician customers.
2. **Phase 2 (Store Listing via Windows App SDK / Win32 Packaging)**:
   - Utilize the **Microsoft Store Win32 Desktop App submission pathway** (which allows submitting standard signed EXE/MSI installers directly to the Store while preserving Win32 capabilities).
3. **Phase 3 (MSIX Package with Desktop Bridge)**:
   - Package with `runFullTrust` capability manifest for organizations enforcing MSIX enterprise deployment policies via Microsoft Intune.
