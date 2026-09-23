# Feature & Module Inventory — ASHtech PC Toolkit Pro
**Project:** ASHtech PC Toolkit Pro (Legacy: UltimateToolkit / Akash Toolkit)  
**Document:** Complete Feature & Capability Inventory (Phase 1 Baseline)  
**Date:** September 2026  

---

## 1. Overview & Scope of Capabilities

ASHtech PC Toolkit Pro encompasses an extensive library of Windows maintenance, diagnostic, administrative, and repair functions. Across its primary engines (`Toolkit.bat`, `Toolkit-GUI-Pro.ps1`, `dashboard.html`, and helper modules), the suite contains **2,830 discrete executable actions** organized across 37 functional categories.

---

## 2. Core Operational Domains & 37 Master Categories

The 37 primary categories mapped from the master engine (`Toolkit.bat`) and available through the GUI dashboards include:

| # | Menu Label | Functional Domain | Primary Tools & Actions Included |
|---|------------|-------------------|----------------------------------|
| 1 | `menu_system_admin` | System Administration | Task Manager, MMC consoles, GodMode, Component Services, Group Policy, Environment Variables, UAC configuration |
| 2 | `menu_network_internet` | Network & Connectivity | Winsock reset, TCP/IP stack reset, DNS flush/registration, adapter resets, ARP clear, Netsh routing, proxy resets |
| 3 | `menu_windows_repair` | Windows OS Repair | SFC (`/scannow`, `/verifyonly`), DISM (`CheckHealth`, `ScanHealth`, `RestoreHealth`), Component Store cleanup, BCD repair |
| 4 | `menu_security_defender` | Security & Antivirus | Defender status queries, threat scans (Quick/Full/Offline), definition updates, PUA protection, Attack Surface Reduction |
| 5 | `menu_performance_optimization`| Performance & Tuning | Visual effects tuning, power plans (Ultimate Performance), paging file configuration, startup app analysis, memory diagnostics |
| 6 | `menu_storage_disk` | Storage & File Systems | CHKDSK scans, Storage Sense configuration, NTFS volume repairs, defrag/TRIM optimization, disk space analyzer |
| 7 | `menu_user_account` | User & Credential Admin | Local account management, password expiry rules, Administrator account activation, profile reset, group membership |
| 8 | `menu_backup_restore` | Backup & Recovery | System Restore point creation/reversion, volume shadow copy management, registry backup/restore, file history |
| 9 | `menu_driver_hardware` | Drivers & Hardware | PnP driver enumeration, driver export/import, signed driver audit, device manager consoles, hardware diagnostics |
| 10 | `menu_update_activation` | Windows Update & Licensing | Windows Update service reset, SoftwareDistribution cache purge, activation troubleshooting, slmgr queries |
| 11 | `menu_office_outlook` | Office & M365 Repair | Office C2R repair, Office Document cache purge, Outlook safe mode, PST/OST integrity checks, Office licensing diagnostics |
| 12 | `menu_printer_spooler` | Print & Peripheral Services | Print Spooler restart, queue purge (`spool\PRINTERS\*`), printer driver resets, port queries, test print generation |
| 13 | `menu_remote_rdp` | Remote Desktop & Access | RDP enablement/disablement, Remote Assistance, firewall rules for port 3389, terminal service restart |
| 14 | `menu_bios_boot` | BIOS, UEFI & Boot Manager | UEFI firmware reboot, Secure Boot verification, TPM state verification, BCD boot configuration review |
| 15 | `menu_registry_policy` | Registry & Policies | Registry backup, Corrupted registry hive repair, GPUpdate force, Local Security Policy, Registry Editor shortcuts |
| 16 | `menu_services_features` | Windows Services & Features | Windows optional features management, service dependency check, essential service recovery, DISM feature toggle |
| 17 | `menu_event_logs` | Event Viewer & Diagnostics | System/Application event log exports, Event Viewer consoles, crash dump analysis, BSOD log viewer integration |
| 18 | `menu_live_monitor` | System Telemetry & Monitor | Real-time CPU, RAM, Disk, and Network performance monitors, active task lists, hardware telemetry polling |
| 19 | `menu_download_deploy` | Software Deployment | Winget integration, silent application installer packages (Browsers, Runtimes, IT Utilities, Office tools) |
| 20 | `menu_quick_access` | Quick Tools & Utilities | Windows Control Panel applets, administrative shortcuts, direct GodMode folder access, quick diagnostic consoles |
| 21 | `menu_power_user_dev` | Developer & Power User | WSL installation, Hyper-V toggle, Developer Mode configuration, Git/Node/Python setup shortcuts |
| 22 | `menu_settings_themes` | Suite Settings & Themes | UI color scheme customization, font scaling, audio cue toggles, log directory preferences |
| 23 | `cmd_vault` | CLI Command Vault | Library of over 10,000 reference terminal commands for sysadmins, organized by syntax and operational goal |
| 24 | `windows_ai_controls` | Windows AI & Copilot | Windows Copilot toggle, Recall toggle, Bing search in Windows search toggle, Edge AI integration toggles |
| 25 | `cyber_pc_guard` | Cyber Security & Auditing | Failed login audit (Event 4625), open port scanner, unauthorized startup entries, USB connection history |
| 26 | `driver_auto_center` | Driver Auto Center | Automated OEM driver matching (Dell, HP, Lenovo, Intel, Realtek), driver backup routines, signature validation |
| 27 | `bootable_usb_creator` | Boot Media & ISO Tools | USB drive preparation, partition formatting, Rufus/Ventoy integration points, ISO extraction |
| 28 | `problem_master_hub` | Automated Problem Hub | Guided triage wizards for No Audio, Slow Boot, High CPU, Network Dropout, and Windows Update Failure |
| 29 | `missing_mega_vault_launcher`| Utility Vault | Consolidated shortcuts to native Windows diagnostic utilities (dxdiag, msinfo32, perfmon, resmon) |
| 30 | `portable_tools_menu` | Portable Software Menu | Launcher for 34 external portable IT applications (NirSoft, Sysinternals, hardware tools) |
| 31 | `wifi_tools` | Wi-Fi Management | Wi-Fi profile list, signal strength analysis, Wi-Fi driver reset, wireless network backup |
| 32 | `firewall_mgr` | Windows Firewall Manager | Inbound/outbound rule configuration, default profile reset, block all incoming connections |
| 33 | `debloat_center` | Windows Debloater | Uninstallation of pre-installed consumer bloatware, telemetry minimization, Cortana removal |
| 34 | `self_heal_center` | Self-Healing Diagnostics | Automated background health watchdog, crash monitoring, automatic bridge server restart |
| 35 | `battery_center` | Battery & Power Diagnostics | Battery health generation, discharge rate calculations, battery cycle count reporting |
| 36 | `smart_disk_center` | S.M.A.R.T. Disk Health | Physical drive attribute queries, drive temperature polling, raw read error rates, predictive failure warnings |
| 37 | `ai_assistant_center` | AI IT Helpdesk Assistant | Integrated AI chat diagnostic assistant powered by LLM endpoints (Gemini / Pollinations) |

---

## 3. Dedicated PowerShell & Batch Sub-Modules

In addition to the central engine, the suite incorporates modular specialized scripts:

1. **`Modules\OneClickSuperRepair.ps1` (9-Step Automated Repair):**
   - Step 1: Automated System Restore Point generation (`Checkpoint-Computer`).
   - Step 2: Temporary cache and user junk purge.
   - Step 3: Network stack, Winsock, and DNS flush.
   - Step 4: System File Checker verification (`sfc /verifyonly`).
   - Step 5: DISM component store health check (`DISM /Online /Cleanup-Image /CheckHealth`).
   - Step 6: Online NTFS volume integrity scan (`chkdsk C: /scan`).
   - Step 7: Unsigned PnP driver security check (`Win32_PnPSignedDriver`).
   - Step 8: Windows Update service restart and cache reset (`SoftwareDistribution\Download`).
   - Step 9: System health summary generation.

2. **`Modules\Win11Debloat.ps1` (Comprehensive OS Debloater):**
   - Removal of non-essential Windows 11 AppX packages (Gaming apps, OEM bloatware, consumer telemetry).
   - Taskbar alignment, search box toggles, recommendations disabling.
   - Privacy configuration: Diagnostic data limiting, location service toggles, advertising ID disabling.

3. **`Modules\SystemInventoryReport.ps1` & `SystemInventory.cmd`:**
   - Deep hardware and software inventory generator outputting styled standalone HTML reports:
     - CPU, RAM modules, motherboard serial, BIOS revision, GPU details.
     - Storage SMART status, partition tables, network adapters, IP/MAC bindings.
     - Installed Win32 software and Windows Updates (KB hotfixes).

4. **`Modules\BatteryReport.cmd`:**
   - Triggers native Windows battery analytics (`powercfg /batteryreport`) and auto-opens the formatted report in the default browser.

5. **`Modules\SelfHeal-Watchdog.ps1`:**
   - Standalone background guardian polling `http://localhost:9999/api/status` every 30 seconds.
   - Restarts `WebBridgeServer.ps1` if 2 consecutive heartbeats fail.
   - Monitors RAM, CPU, and disk thresholds every 5 minutes.

6. **`Modules\GUI-SelfRepair.ps1`:**
   - Automated code repair script scanning `gui_errors.jsonl` for runtime WinForms errors and invoking the Gemini API to suggest patches.

---

## 4. External Portable Tools Catalog (`Config\tools.catalog`)

The toolkit references 34 external standalone utilities in `Config\tools.catalog`:
- **Hardware & Crash Analysis:** BlueScreenView, WhoCrashed, OCCT, Hard Disk Sentinel, Battery Optimizer, Quick CPU Pro.
- **System Maintenance:** Glary Utilities Portable, Duplicate Cleaner Pro, Lazesoft Recovery Suite, Macrium Reflect, MiniTool Partition Wizard.
- **Sysinternals & NirSoft Tools:** WSCC, CurrPorts, USBDeview, USBDriveLog, LastActivityView, WhatInStartup, OpenedFilesView, SearchMyFiles.
- **Credential Recovery Utilities (NirSoft):** WirelessKeyView, WebBrowserPassView, ProduKey, PasswordFox, VaultPasswordView, RouterPassView, Network Password Recovery.

*Note for Commercialization:* Bundled third-party commercial and password-recovery EXEs represent licensing and Defender reputation liabilities. The Phase 2 roadmap defines replacement with native Windows API implementations and clean PowerShell alternatives.
