# Third-Party Component & Utility Security Audit

**Product:** ASHtech PC Toolkit Pro  
**Phase:** Phase 2 — Security Hardening & Windows Defender Compatibility  
**Date:** September 2026  
**Status:** Completed & Enforced  

---

## 1. Executive Summary

As part of Phase 2 security hardening, a comprehensive audit of all external binaries and third-party utilities packaged or referenced by the toolkit was conducted. The primary objective is to achieve full compatibility with Microsoft Defender SmartScreen and enterprise endpoint protection suites while eliminating high-risk credential-dumping and grey-hat utilities.

### Audit Policy Categorization:
1. **SAFE (Retained):** Legitimate diagnostic, administrative, or hardware evaluation tools from verified reputable vendors that perform non-offensive functions.
2. **SUSPICIOUS (Monitored / Isolated):** Tools that interact with system low-level layers (e.g., driver injectors, raw partition modifiers) requiring clear signing, isolated sandboxing, or native Windows API replacements in Phase 3/4.
3. **UNACCEPTABLE (Purged & Replaced):** Tools designed to extract, dump, or decrypt stored user passwords, browser credentials, Wi-Fi security keys, or cryptographic vault tokens. These tools trigger critical Microsoft Defender signatures (e.g., `HackTool:Win32/Passview`, `HackTool:Win32/Keyview`) and violate commercial application trust boundaries.

---

## 2. Complete Catalog Inventory & Disposition

| # | Tool / Utility Name | Vendor | Primary Function | License / Distribution | Security Assessment | Action Taken / Replacement Plan |
|---|---------------------|--------|------------------|------------------------|---------------------|---------------------------------|
| 01 | Battery Optimizer | ReviverSoft | Battery health & power management | Commercial Freeware | SAFE | Retained in catalog |
| 02 | BlueScreenView | NirSoft | BSOD minidump analysis | Freeware | SAFE | Retained in catalog |
| 03 | Duplicate Cleaner Pro | Digital Volcano | Duplicate file detection | Commercial / Trial | SAFE | Retained in catalog |
| 04 | Glary Utilities Pro | Glarysoft | PC maintenance & registry cleanup | Commercial / Trial | SAFE | Retained in catalog |
| 05 | Hard Disk Sentinel Pro | H.D.S. Hungary | SMART disk health monitoring | Commercial / Trial | SAFE | Retained in catalog |
| 06 | Lazesoft Recovery Suite | Lazesoft | System backup & boot recovery | Commercial | SAFE | Retained in catalog |
| 07 | Macrium Reflect | Paramount Software | Disk imaging & backup | Commercial | SAFE | Retained in catalog |
| 08 | Malware Hunter Pro | Glarysoft | On-demand malware scanner | Commercial / Trial | SAFE | Retained in catalog |
| 09 | MiniTool Partition Wizard | MiniTool | Partition & disk management | Commercial / Trial | SAFE | Retained in catalog |
| 10 | OCCT | OCBase | CPU/GPU hardware stress testing | Freeware / Commercial | SAFE | Retained in catalog |
| 11 | Quick CPU Pro | CoderBag | CPU frequency & power tuning | Freeware | SAFE | Retained in catalog |
| 12 | WhoCrashed | Resplendence Software | Crash dump diagnosis helper | Freeware | SAFE | Retained in catalog |
| 13 | WSCC | KLS Soft | Sysinternals / NirSoft launcher | Freeware | SAFE | Retained in catalog |
| 14 | PortableApps Platform | Rare Ideas LLC | Portable app management | Open Source / GPL | SAFE | Retained in catalog |
| 15 | Block Internet in Apps (Fab) | Sordum | Firewall outbound rule wrapper | Freeware | SAFE | Retained in catalog |
| **16** | **WirelessKeyView** | NirSoft | Wi-Fi password extraction | Freeware | **UNACCEPTABLE** | **PURGED.** Replaced with native `Modules\WiFiDiagnostics.cmd` querying interfaces, SSIDs, and signal state without reading cleartext keys. |
| **17** | **WebBrowserPassView** | NirSoft | Browser password decryption | Freeware | **UNACCEPTABLE** | **PURGED.** Removed from catalog. Web credential dumping is prohibited. |
| **18** | **ProduKey** | NirSoft | Windows/Office product key extraction | Freeware | **UNACCEPTABLE** | **PURGED.** Replaced with native `Modules\CheckActivation.cmd` utilizing Windows Software Licensing Management tool (`slmgr.vbs /dli`). |
| 19 | USBDeview | NirSoft | USB device connection auditing | Freeware | SAFE | Retained in catalog |
| **20** | **PasswordFox** | NirSoft | Firefox password extractor | Freeware | **UNACCEPTABLE** | **PURGED.** Removed from catalog. |
| **21** | **VaultPasswordView** | NirSoft | Windows Vault & Credential decrypter | Freeware | **UNACCEPTABLE** | **PURGED.** Removed from catalog. |
| 22 | AnyDesk | AnyDesk GmbH | Remote desktop support | Commercial / Free | SAFE | Retained in catalog |
| 23 | Advanced IP Scanner | Famatech | LAN device discovery | Freeware | SAFE | Retained in catalog |
| 24 | PowerISO Portable | Power Software | Disc image & ISO mounting | Commercial / Shareware | SAFE | Retained in catalog |
| **25** | **RouterPassView** | NirSoft | Router config credential decrypter | Freeware | **UNACCEPTABLE** | **PURGED.** Removed from catalog. |
| 26 | USBDriveLog | NirSoft | USB drive historical timeline | Freeware | SAFE | Retained in catalog |
| 27 | WifiInfoView | NirSoft | Wi-Fi channel and signal analyzer | Freeware | SAFE | Retained in catalog |
| 28 | LastActivityView | NirSoft | System event & user timeline audit | Freeware | SAFE | Retained in catalog |
| 29 | UninstallView | NirSoft | Installed software registry auditor | Freeware | SAFE | Retained in catalog |
| 30 | SearchMyFiles | NirSoft | Advanced file metadata search | Freeware | SAFE | Retained in catalog |
| 31 | CurrPorts | NirSoft | TCP/IP active ports and processes | Freeware | SAFE | Retained in catalog |
| **32** | **Network Password Recovery (netpass)** | NirSoft | Network credential dumper | Freeware | **UNACCEPTABLE** | **PURGED.** Removed from catalog. |
| 33 | WhatInStartup | NirSoft | Startup run-key manager | Freeware | SAFE | Retained in catalog |
| 34 | OpenedFilesView | NirSoft | Locked handle & open file monitor | Freeware | SAFE | Retained in catalog |
| 35 | RegScanner | NirSoft | Deep registry binary search | Freeware | SAFE | Retained in catalog |
| 36 | TaskSchedulerView | NirSoft | Scheduled task inspector | Freeware | SAFE | Retained in catalog |
| 37 | DevManView | NirSoft | Hardware device driver manager | Freeware | SAFE | Retained in catalog |
| 38 | WinCrashReport | NirSoft | Program crash diagnostic report | Freeware | SAFE | Retained in catalog |
| 39 | Wireless Network Watcher | NirSoft | LAN active host watcher | Freeware | SAFE | Retained in catalog |

---

## 3. Wi-Fi Security & Password Exposure Remediation

In addition to removing binary password-recovery tools, all script-based password dumping commands (`netsh wlan show profile name=... key=clear`) were audited and remediated:

1. **`Toolkit.bat` Remediation:**
   - Removed `key=clear` arguments from interactive and batch Wi-Fi queries.
   - Replaced cleartext password dumps with diagnostic metadata: SSID, 802.11 Authentication Standard (e.g., WPA2-Personal, WPA3-Enterprise), Cipher suite (AES/TKIP), and Connection Mode (Auto/Manual).
   - Replaced cleartext profile export (`netsh wlan export profile key=clear`) with standard XML profile backup without cleartext secrets.

2. **`WebBridgeServer.ps1` Remediation:**
   - Removed `key=clear` arguments from all Wi-Fi diagnostic script blocks and API routes.
   - Ensured the web dashboard JSON responses never return plaintext passphrase fields.

3. **Auxiliary PowerShell Modules:**
   - Patched `SystemInventoryReport.ps1`, `Toolkit-GUI-Pro.ps1`, `ToolkitReportCenter.ps1`, and `Web-Dashboard.ps1` to eliminate all occurrences of `key=clear`.

---

## 4. Defender Compatibility Impact

The removal of the 7 unacceptable credential-harvesting tools and all `key=clear` dumping routines directly mitigates the highest-severity detection triggers flagged by Microsoft Defender Antivirus:
- **`HackTool:Win32/Passview`** (Eliminated)
- **`HackTool:Win32/Keyview`** (Eliminated)
- **`HackTool:Win32/ProduKey`** (Eliminated)
- **`Pua:Win32/PasswordStealer`** (Eliminated)
- **Behavioral AMSI Script-Block Alert: Wi-Fi Cleartext Dumping** (Eliminated)

The resulting toolkit operates strictly as a legitimate, compliant PC maintenance and diagnostic solution.
