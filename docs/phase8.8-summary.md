# Phase 8.8 — Command Vault, Performance & Quick Utilities Parity Summary

## Executive Overview
Phase 8.8 restores the legitimate functionality from legacy **CMD Vault**, **Mega Command Vault**, **Performance Optimization**, **Auto Performance**, **Quick Access Utilities**, and safe **Power User / Developer Tools** into the modern, production-grade Akshigo PC Toolkit Pro architecture.

All restored capabilities strictly comply with Akshigo security mandates:
- **Zero Arbitrary Execution**: Frontend command strings, arbitrary PowerShell, and arbitrary CMD strings are never executed directly.
- **Backend Operation Allowlist**: Execution is permitted only when a command maps to a registered, verified `OperationDefinition` in `server/operations/registry.ts`.
- **Security & Authorization**: All operations enforce `X-Toolkit-Auth` loopback headers and role-based privilege checks.
- **Anti-Malware & Defender Friendly**: Dangerous commands (such as disabling Windows Defender or deleting shadow copies) are explicitly classified as `REMOVED_SECURITY` and blocked by policy.

---

## 1. Command Vault & Mega Command Reference

### Architecture & Classification Engine
Commands in `src/data/commandVaultCatalog.ts` are categorized and classified under a 5-tier safety model:

| Classification | Behavior & Security Handling | UI Representation |
| :--- | :--- | :--- |
| `SAFE_EXECUTABLE` | Mapped to an approved backend `registeredOperationId`. Fully safe to execute. | Green pill badge with active "Run" button |
| `ADMIN_CONFIRM` | Mapped to an approved operation requiring explicit elevation and admin confirmation. | Amber pill badge with confirmation prompt |
| `REFERENCE_ONLY` | High-value technical diagnostic command. Executed only as reference documentation. | Blue pill badge; arbitrary execution prevented |
| `REMOVED_SECURITY` | Legacy or dangerous command (disabling Defender, clearing shadow copies, LSASS dumping). | Red badge; permanently blocked by security policy |
| `OBSOLETE` | Deprecated legacy commands removed from modern 64-bit Windows (e.g. `edlin`, `bootcfg`). | Gray badge with modern alternative recommendations |

### Categories Included
1. **SFC & DISM** (System File Checker, Component Store health, resetbase cleanup)
2. **Network** (DNS flush, Winsock reset, DHCP renew, Netstat, Tracert, NSLookup)
3. **Storage** (CHKDSK scan/repair, SSD TRIM, cleanmgr, fsutil dirty query)
4. **System** (Performance audit, typeperf, powercfg active scheme, Task Manager)
5. **Services & Processes** (Print spooler restart, services.msc, sc query, tasklist, taskkill)
6. **Event Logs** (Event Viewer launch, wevtutil critical event query)
7. **WinGet** (Batch upgrade all packages, package list, search)
8. **Group Policy & User/Admin** (gpupdate /force, gpresult /r, gpedit.msc, net user, whoami)
9. **RDP & Remote Access** (mstsc.exe, net share audit)
10. **Development** (WSL status, Hyper-V audit, developer runtimes inventory)
11. **Drivers & Hardware** (Device Manager, pnputil driver store enumeration, driverquery)
12. **Security Blocked** (Explicit list of blocked commands demonstrating security policy enforcement)

### Ctrl+K Smart Search Integration
- Integrated with `src/data/smartSearchEngine.ts`.
- Typing any command name, syntax keyword (e.g. `sfc`, `dism`, `powercfg`, `netsh`), tag, or description returns the Command Vault entry with instant run or reference options.

---

## 2. Performance Optimizer & Resource Governance

### 4-Stage Transparent Optimizer Wizard
Replaces legacy black-box scripts with a deterministic, technician-guided optimization flow:
1. **Analyze**: Audits CPU thread topology, working set memory, disk queue depth, and boot event metrics without touching the filesystem.
2. **Review Recommendations**:
   - Safe Temporary Files & Cache Purge (reclaims ~6.8 GB)
   - Windows Storage Sense activation & configuration
   - Solid State Drive Retrim (TRIM) via `defrag /L`
   - Active Power Scheme calibration
   *Every recommendation includes explicit transparency on: What changes, Why, Risk level, and Reboot requirement.*
3. **Checkpoint & Confirmation**:
   - Automated Volume Shadow Copy restore point creation before applying changes (`repair.recovery.create_restore_point`).
4. **Execution & Results**:
   - Multi-stage execution with real-time logs, space reclaimed, and latency improvements.

### Real-Time Telemetry & Heavy Processes
- Live CPU, RAM, and Disk latency meters.
- Heavy processes ranked by consumption with protected status for core Windows processes (`PID 0`, `PID 4`).

### Storage & Temp Cleanup Center
- Pre-flight categorization across Windows Temp (`C:\Windows\Temp`), User Temp (`%TEMP%`), Explorer Thumbnail cache, Delivery Optimization, and Windows Update downloads.
- Interactive selection with explicit confirmation modal before purging.
- Quick launcher for native Windows Disk Cleanup (`cleanmgr.exe`).

### Power & Energy Management
- Interactive power scheme switcher (`powercfg /setactive`) between Balanced, High Performance, Power Saver, and Ultimate Performance.
- ACPI Sleep States audit (S0 Modern Standby, S3, S4 Hibernate, Fast Startup).
- 60-Second Energy Efficiency Report generator (`powercfg /energy`).
- Battery Wear & Cycle Count diagnostic report generator (`powercfg /batteryreport`).

---

## 3. Quick Access Utilities (15 Administrative Consoles)
Restores fast one-click launching of native Windows administrative management consoles via `sys.admin.*` backend operations:
1. **Task Manager** (`taskmgr.exe`)
2. **Device Manager** (`devmgmt.msc`)
3. **Disk Management** (`diskmgmt.msc`)
4. **Computer Management** (`compmgmt.msc`)
5. **Event Viewer** (`eventvwr.msc`)
6. **Services Console** (`services.msc`)
7. **Task Scheduler** (`taskschd.msc`)
8. **Control Panel** (`control.exe`)
9. **Windows Settings** (`ms-settings:`)
10. **System Information** (`msinfo32.exe`)
11. **Resource Monitor** (`resmon.exe`)
12. **Performance Monitor** (`perfmon.msc`)
13. **Registry Editor** (`regedit.exe`)
14. **Group Policy Editor** (`gpedit.msc`)
15. **Terminal / PowerShell** (`powershell.exe`)

---

## 4. Power User & Developer Tools
Restores environment diagnostics for developers and system administrators:
- **WSL Status**: Linux kernel version, default distribution, and container states.
- **Virtualization & Hyper-V**: Hypervisor presence, SLAT hardware support, and virtual switch enumeration.
- **Windows Sandbox**: Feature activation status and readiness.
- **Windows Developer Mode**: Sideloading and developer policy status.
- **Runtime Inventory**: Scans for .NET 8.0, .NET Framework 4.8.1, PowerShell Core 7.4, Git, Node.js, Python, and WinGet.

---

## 5. Security & Verification Summary
- **No Arbitrary Shell Strings**: Commands are never executed as raw user-supplied strings.
- **Strict Allowlist**: Every executable action routes to an immutable, pre-approved ID in `KNOWN_OPERATIONS_MAP`.
- **Audit Logging**: All executed actions are recorded in the central audit trail.
- **Defender Compliance**: Antivirus features are protected; malicious patterns are blocked.
