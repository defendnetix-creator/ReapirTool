# Phase A: command-level repair restoration

Preserved baseline: `9f08fb8c1d90e2d30bb9060be6fca259191fa589`, pushed to `audit/native-behavior-hardening`. No merge to main. Original source remains unchanged.

These findings compare code and fixture behavior. They are **PARTIAL_EQUIVALENT** until the Windows outcome, UI flow, and failure recovery pass on target systems. None of the fixture passes below certify an actual Windows repair. The user confirmed that no disposable VM is available.

## Newly restored operations

| Operation | Original evidence and effective behavior | Current implementation and intentional differences | Prerequisites, affected state, restart |
|---|---|---|---|
| `repair.cbs_log.view` | `Toolkit.bat:sfc_dism`, option 11 opens `C:\Windows\Logs\CBS\CBS.log` in Notepad. | Reads the last 200 lines from `%SystemRoot%\Logs\CBS\CBS.log`, through the existing viewer and authenticated `/cbs-logs` endpoint. Full file is not displayed; no synthetic entries. Missing/access-denied file fails explicitly. | Windows, log read permission. Read-only; no restart. |
| `repair.wu.reset_services` | `Toolkit.bat:update_fix`, option 2 stops wuauserv, cryptSvc, bits, msiserver; starts bits, cryptSvc, wuauserv, msiserver. | Same ordered service states via service APIs, waits up to 30 seconds per transition. Preflight blocks disabled/transitional services and outside running dependents. No startup configuration changes. On failure, attempts restoration of initial states and reports recovery failures; does not claim rollback. | Administrator; services must exist. Interrupts update/installer activity. Does not request reboot or change policy. |
| `repair.wu.softwaredist_reset` | `Toolkit.bat:sfc_dism`, option 13 stops wuauserv, renames SoftwareDistribution to SoftwareDistribution.old, starts wuauserv. Also part of `update_fix` option 3. | Stops wuauserv and BITS, renames only the fixed cache directory to a unique sibling `.old.<GUID>`, keeps the backup, restores initially running services. No deletion. Missing folders and reparse-point paths fail. Original states replace unconditional startup. | Administrator; ordinary local cache path; no running dependents. Affects cache folder and service state, not registry/policy. Windows recreates cache as needed; update success is not inferred. |
| `repair.wu.catroot2_reset` | `Toolkit.bat:sfc_dism`, option 12 stops cryptsvc, renames System32\catroot2 to catroot2.old, starts cryptsvc. `update_fix` option 3 incorrectly omits stopping cryptsvc. | Uses the working service-stop semantics, retains a unique sibling backup, restores prior service state, rejects reparse paths. Does not rename Catroot or modify Defender. | Administrator; Cryptographic Services and cache directory exist. No reboot automatically requested; recovery errors require attention. |
| `network.workflow.common_repair` | `Toolkit.bat:net_advanced`, option 15: ipconfig /release, ipconfig /flushdns, netsh winsock reset, netsh int ip reset, ipconfig /renew. | Restores that order. Removes the new implementation's unsupported proxy reset substitution. Stops on command failure, with a separate best-effort DHCP renewal; recovery does not turn failure into success. No firewall reset. | Administrator; Windows network tools. Disrupts connectivity, affects DHCP leases/DNS cache/Winsock/TCP-IP. Restart required after successful reset. A partial failed reset may also require a restart. |
| `printer.spooler.restart` | `Toolkit.bat:printer_restart_spooler_core`: stop spooler, delay, start spooler. Queue deletion is in a different label. | Uses fixed Spooler service control, verifies Stopped then Running instead of sleeping. Refuses forced dependent-service cascade. Does not delete queued documents or kill processes. UI wording now reflects this. | Administrator; Spooler exists. Printing interruption; no planned reboot. Generic service provider reports failures, not atomic rollback. |
| `printer.spooler.stop` | Original `net stop spooler` operation. | Fixed allowlisted service, waits for Stopped, refuses active dependents. No caller-selected service. | Administrator; Spooler exists. Stops printing; no planned reboot. |
| `printer.spooler.start` | Original `net start spooler` operation. | Fixed allowlisted service, waits for Running. Service startup policy is unchanged. | Administrator; Spooler can start under current Windows policy; no planned reboot. |
| `printer.inventory.get` | `Toolkit.bat:ps_printers` uses CIM Win32_Printer for Name, Default, WorkOffline, PortName. | CIM inventory preserves these properties and reads print-job counts where available. Unknown driver versions, capabilities and untested reachability are not guessed. Queue failure yields null count and an explanation. Authenticated `/printers` feeds the existing layout. | Windows CIM; PrintManagement for counts. Read-only; scope is the current user's Windows printer visibility. |

## SFC/DISM gaps remain explicit

Ordinary StartComponentCleanup is distinct from irreversible ResetBase. ResetBase, pending.xml removal, the original WIM/ISO helper's complete mount/export workflow, and all other unmapped actions have not been silently folded into existing operations. Direct pending.xml deletion requires a separately reviewed safe servicing approach; it must not be automatically restored just because it existed. CBS viewing is an excerpt, not full Notepad parity. SFC-before-DISM order remains preserved with fail-fast handling. Full Windows repair outcomes have not been exercised.

## Super Repair remains blocked

`legacy-original/Modules/OneClickSuperRepair.ps1` specifies nine stages:

1. Create a restore point.
2. Clear temporary files.
3. Flush DNS, reset Winsock, reset TCP/IP.
4. **SFC /verifyonly**.
5. **DISM /Online /Cleanup-Image /CheckHealth**.
6. **chkdsk C: /scan**.
7. Query unsigned Win32_PnPSignedDriver records.
8. Clear SoftwareDistribution **Download contents**, with wuauserv/BITS service handling.
9. Query real OS, uptime, CPU load and RAM summary.

The full SoftwareDistribution rename above is not a substitute for stage 8, and read-only CHKDSK without `/scan` is not stage 6. No production Super Repair job is enabled until all stages have safe implementations, accurate results and reviewed failure semantics. The original's restore-frequency override and unconditional success messages will not be restored.

## Evidence and release limitations

SelfHeal source review: `legacy-original/Modules/SelfHeal-Watchdog.ps1` checks the old bridge's `/api/status` every 30 seconds, restarts after two consecutive failures, and logs RAM/disk/CPU thresholds on every tenth successful cycle. Its process search includes overly broad matching, and its restart uses execution-policy bypass. Neither behavior will be copied. The current `system.selfheal.run` cannot be certified as equivalent to a persistent watchdog. Backend lifetime supervision belongs with the new host and must be limited to the exact owned child process, with a bounded restart policy and actual readiness checks. This is an explicit unresolved dependency between Phase A parity and Phase B host integration, not a completed repair operation.

`scripts/test_native_audit.ts` covers command sequence, parameter rejection, real exit-code handling and network recovery using an injected runner. `scripts/test_native_windows.ts` covers live read-only queries plus fixture scripts that shadow mutating service commands. Cache fixture tests rename private temporary directories and verify retained bytes; they never rename Windows caches. Tests include partial stop failure, start failure, failed recovery, disabled services, dependencies, transitional states, rename failure, missing cache and reparse rejection.

No destructive Windows tests, clean installation, EXE/installer build or Defender scan is certified. The legacy Phase 8.4/8.5 failures remain in the preservation checkpoint. Phase A is incomplete; Phase B is not yet authorized by its dependency gate, and no build tool installation or archived-host substitution has been attempted.
