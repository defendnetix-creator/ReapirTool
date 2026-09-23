# Feature Entitlement Model & Capability Resolution

## 1. Architectural Philosophy
Feature gating is managed through a **centralized entitlement resolver** (`EntitlementService.cs` in .NET host and `src/licensing/entitlements.ts` in web UI).

- Features do not hardcode plan names (e.g. `if (plan == "Pro")`); instead, they query capabilities: `if (hasEntitlement("repair.one_click_super"))`.
- Each plan definition maps to an explicit array of granted entitlement keys.

---

## 2. Entitlement Matrix by Plan Tier

| Entitlement Key | Feature Name | Personal | Professional | Technician | Business |
| :--- | :--- | :---: | :---: | :---: | :---: |
| `diagnostics.basic` | Hardware & OS Baseline | **✓** | **✓** | **✓** | **✓** |
| `diagnostics.hardware` | Sensor & Thermal Telemetry | **✓** | **✓** | **✓** | **✓** |
| `diagnostics.deep_benchmarks` | Stress & Disk I/O Benchmarks | — | **✓** | **✓** | **✓** |
| `diagnostics.system_twin` | Digital SystemTwin Baseline | — | **✓** | **✓** | **✓** |
| `diagnostics.event_log_analyzer` | WMI Event Log Parsing | — | — | **✓** | **✓** |
| `diagnostics.fleet_telemetry` | Multi-Node Fleet Telemetry | — | — | — | **✓** |
| `repair.basic` | Temp Files & Spooler Clean | **✓** | **✓** | **✓** | **✓** |
| `repair.registry` | Registry Hygiene & Compact | **✓** | **✓** | **✓** | **✓** |
| `repair.disk_cleanup` | Delivery Optimization Purge | **✓** | **✓** | **✓** | **✓** |
| `repair.deep_wmi` | WMI Repository Rebuild | — | **✓** | **✓** | **✓** |
| `repair.dism_sfc` | DISM Component Store Scrub | — | **✓** | **✓** | **✓** |
| `repair.one_click_super` | Autonomous Super Repair | — | **✓** | **✓** | **✓** |
| `repair.driver_store_purge` | DriverStore Staging Purge | — | — | **✓** | **✓** |
| `repair.printer_analyzer_pro` | Printer Analyzer Pro | — | — | **✓** | **✓** |
| `performance.basic` | Startup Manager | **✓** | **✓** | **✓** | **✓** |
| `performance.pro_tweaks` | Kernel & Power Tweaks | — | **✓** | **✓** | **✓** |
| `performance.ram_cache_purge` | Standby List RAM Flush | — | — | **✓** | **✓** |
| `software.winget_basic` | WinGet Package Manager | **✓** | **✓** | **✓** | **✓** |
| `software.bulk_installer` | Bulk Software Deploy | — | **✓** | **✓** | **✓** |
| `software.debloat_pro` | Windows 11 Debloat Pro | — | **✓** | **✓** | **✓** |
| `software.custom_bundles` | Custom Corporate Bundles | — | — | **✓** | **✓** |
| `network.diagnostics` | Network Diagnostics | **✓** | **✓** | **✓** | **✓** |
| `network.adapter_reset` | Winsock & Adapter Reset | — | **✓** | **✓** | **✓** |
| `network.port_scanner` | Port & Subnet Auditor | — | — | **✓** | **✓** |
| `security.defender_status` | Defender Real-Time Status | **✓** | **✓** | **✓** | **✓** |
| `security.hardening_pro` | OS Hardening Baseline | — | **✓** | **✓** | **✓** |
| `security.bitlocker_audit` | BitLocker Key & TPM Audit | — | — | **✓** | **✓** |
| `ai.copilot_diagnostics` | AI Diagnostic Copilot | — | **✓** | **✓** | **✓** |
| `ai.powershell_generator` | AI PowerShell Script Crafter | — | **✓** | **✓** | **✓** |
| `reports.basic_html` | HTML Diagnostic Report | **✓** | **✓** | **✓** | **✓** |
| `reports.json_export` | Raw JSON / CSV Export | — | **✓** | **✓** | **✓** |
| `reports.client_branded_pdf` | Client-Branded PDF Report | — | — | **✓** | **✓** |
| `technician.portable_mode` | USB Portable Deployment | — | — | **✓** | **✓** |
| `technician.multi_client_profiles` | Multi-Client Profiles | — | — | **✓** | **✓** |
| `business.central_policy_sync` | Central Policy Sync | — | — | — | **✓** |
| `business.fleet_audit_logs` | Immutable Audit Trail | — | — | — | **✓** |
| `business.unattended_cli_execution`| Unattended CLI Orchestration | — | — | — | **✓** |

---

## 3. Fallback & Expired Behavior
When a subscription expires:
- `diagnostics.basic` and `reports.basic_html` (viewing past reports) remain accessible.
- All mutating repair tools, AI Copilot, and batch installers are locked with a discreet gating modal explaining the renewal path.
- Local configuration and historical diagnostic reports are **NEVER deleted or destroyed**.
