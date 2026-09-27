# Akshigo source audit and hardening

Baseline: `audit/original-vs-akshigo-v8`, commit `45916a300f057b6a17ca26c61dc15b8237f2ce5f`.
Working branch: `audit/native-behavior-hardening`.

## Verdict: not release-ready

The baseline React application is substantially a demonstration, not a working replacement for the original toolkit. All 18 operation-handler modules lack Windows process/API execution. They return seeded data, timers and scripted success messages. The previous 93.5% parity / 100% backend coverage claims are not command-level validation.

The source index contains 196 backend operation definitions, 158 feature entries, and 649 labels in the top-level legacy batch file. The changes provide native implementations for 45 operation IDs. The other 151 are explicitly unavailable. This is partial remediation, not completion of the requested full parity audit. The 649 label blocks are indexed for further review; they have not each been certified equivalent. The individual count of legitimate original user actions remains unestablished.

All 136 files under `legacy-original` remain unchanged. The supplied project `sources/` directory was not edited. The preservation commit `9f08fb8c1d90e2d30bb9060be6fca259191fa589` was pushed to `audit/native-behavior-hardening`. No merge was performed. Subsequent Phase A changes are detailed in [repair parity evidence](audit/phase-a-repair-parity.md).

## Evidence and behavior changes

| Area | Original source evidence | Baseline Akshigo behavior | Current change / classification |
|---|---|---|---|
| SFC scan and verification | `legacy-original/Toolkit.bat:4359-4361` | Fabricated findings, repaired filenames and counts | Direct `sfc.exe` arguments; custom file is required, validated, passed as one argument. PARTIAL_EQUIVALENT pending target tests. |
| DISM Check/Scan/RestoreHealth | `Toolkit.bat:4362-4364` | Timed healthy/repairable/restored responses | Direct DISM commands; actual output and exit codes; 3010 retained as restart-required. PARTIAL_EQUIVALENT. |
| Full SFC + DISM | `Toolkit.bat:4368` | DISM, then SFC, then added cleanup | Restored SFC then DISM. No extra cleanup. Stops on a failed command instead of hiding failure; documented safety difference. |
| Component cleanup | `Toolkit.bat:4366-4367` | Ordinary cleanup conflated with `/ResetBase` | Ordinary action uses only `/StartComponentCleanup`. Separate destructive ResetBase behavior remains missing, not silently substituted. |
| DISM source image | `Toolkit.bat:4365`, `Toolkit.bat:7322-7323` | No image opened or repaired | Explicit local WIM/ESD path and image index; `/Source:wim:path:index` or ESD plus `/LimitAccess`. Mounted directories, split WIM and ISO mounting remain unsupported. |
| DNS/IP/Winsock | `Toolkit.bat:4046`, `Toolkit.bat:4123-4128` | Simulated addresses, lease state and resets | Exact standalone commands. Renew no longer performs an extra release. Restart requirement retained for stack resets. |
| Ping/DNS/traceroute | `Toolkit.bat:3932-3936`, `Toolkit.bat:4057` | Invented replies/hops/addresses | Native tools with validated IP/hostname arguments; real text output. No arbitrary options or shell. |
| Process/task enumeration | `Toolkit.bat:3825`, `Toolkit.bat:7774`, `Toolkit.bat:12538` | Seeded process/task entries | `tasklist` and verbose `schtasks /query /fo LIST /v`; structured inventory pages still unavailable. |
| Driver store | `Toolkit.bat:6061`, `Toolkit.bat:6147` | Invented OEM packages | `pnputil /enum-drivers` output shown in operation results. Structured driver inventory remains missing. |
| CHKDSK read-only | `Toolkit.bat:8597` | Claimed clean disk and zero bad sectors | `chkdsk <drive>`, without `/f`, `/r` or `/scan`. No automatic restart or repair. |
| Optional features / Hyper-V / WSL | Existing UI requests and `server/operations/handlers/services.ts:423-456` | Seeded feature states | DISM read-only queries. These do not restore the separate legacy enable/disable actions. PARTIAL_EQUIVALENT. |
| WinHTTP proxy / sockets | Existing handlers and legacy network commands | Seeded proxy/socket results | `netsh winhttp show/reset proxy`, `netstat -ano`. WinINet proxy support and structured socket results remain missing. |
| Super Repair | `legacy-original/Modules/OneClickSuperRepair.ps1` vs `src/components/repairs/SuperRepairSection.tsx` | Different seven-stage workflow and invented checkpoint | Unavailable pending full reconstruction. Original nine stages include restore point, temp cleanup, network resets, SFC **verifyonly**, DISM **CheckHealth**, CHKDSK `/scan`, driver signature audit, update cache cleanup, health report. Do not replace these silently with scannow/RestoreHealth. |
| Service inventory/control | `Toolkit.bat:4616-4647` and original SCM operations | Seeded inventory and in-memory status changes | Live CIM/SCM inventory; audited start/stop/restart/startup changes wait for and verify Windows state. No forced dependent-service cascade; security/core services and unknown services are not mutable. Service mutation remains untested on a target VM. |
| Restore-point list/create | `Toolkit.bat:6120`, `Toolkit.bat:6149`, `Modules/OneClickSuperRepair.ps1` | Invented point IDs, timestamps and sizes | Native cmdlets, no frequency-limit bypass, require a newly enumerated matching checkpoint before success. Does not enable System Protection automatically. Cmdlet behavior tested with mocks; no actual checkpoint created on this PC. |
| Generic UI dispatcher | Baseline `src/App.tsx`, `handleTriggerAction` | Timer creates successful execution toast without running anything | Unmapped actions now report unavailable. Administrative native jobs use the existing confirmation dialog. |

The detailed [operation matrix](audit/operations.md), [feature mapping matrix](audit/features.md), and [legacy label index](audit/legacy-labels.json) distinguish source evidence from runtime proof. `PARTIAL_EQUIVALENT` is deliberately conservative; a command plan is not complete feature parity.

## Security changes and limits

- Windows tools are launched from the Windows system directory with an argument array and `shell: false`. No remote code, encoded PowerShell, execution-policy bypass, Defender exclusions, or Defender/firewall disablement was added.
- State-changing job execution requires Windows plus an explicit `AKSHIGO_NATIVE_OPERATIONS=1` host setting. It is disabled in ordinary audit previews. Authenticated live service and restore-point inventory endpoints remain read-only and available on Windows. Windows enforces the actual process privileges; a UI checkbox is not elevation.
- The listener binds to `127.0.0.1`. Socket addresses, exact Host and Origin are checked. Client-supplied Host cannot establish loopback trust.
- Removed shared hardcoded API credentials and development-origin exemptions. Sessions use a fresh random token, no-store delivery and a same-origin custom-header bootstrap. This protects against remote web pages; it is not an isolation boundary against malicious local processes or same-origin script execution.
- Unimplemented inventory APIs return 503 instead of fictitious machine data. Service and restore-point inventories now query Windows; partial page loads preserve available data and display errors for unavailable sections. Existing dashboard demonstration values are prominently labelled; a complete live dashboard replacement remains required.
- Operations run one at a time. History and captured process output are bounded. Fake cancellation was removed: servicing continues until the Windows tool exits. Output is currently delivered after each command, not streamed live; OEM codepage output may require additional localization work.
- Browser assets and server code are built into different directories. Production startup explicitly selects production mode.
- The static source scanner now prunes dependencies/output directories and correctly matches literal PowerShell variables. Its output explicitly does not certify Defender compatibility. Five matches are reviewed reference strings: two in the feature generator, two in the feature registry, and one in the blocked Command Vault entry. They describe `REMOVED_SECURITY` features, not executed commands. The strict pattern check still reports them for review.

## Build and release blockers

The current application has **no native Akshigo host project outside `legacy-original`**. The archived WebView2 form launches the old PowerShell dashboard at port 9999; compiling it would not package this React/Node application. The machine has a dotnet runtime but `dotnet --list-sdks` returns no SDK. Inno Setup is not present at its standard path or on PATH.

The old release pipeline wrote plain text to a filename ending in `.exe`, supplied a fabricated installer hash/size/signer, and treated a missing Inno compiler as success. Those paths are removed. Release and installer scripts now fail explicitly. No EXE, installer, signing claim, publication or Defender scan result has been fabricated.

A release still needs a current WebView2 host, tested session/process lifetime and elevation integration, a packaged Node runtime and dependencies, completed native operations/live data providers, repaired Inno payload layout, and Windows VM tests. The original ISS references a nonexistent icon location, absent prerequisite bootstrapper and host files, and an undefined signing tool. It is retained as an unvalidated draft, not a functioning installer definition. Installing a compiler alone will not make the toolkit release-ready.

## Validation

- TypeScript check: passed after adding the service and restore-point providers.
- React/server build: succeeded; Vite warns about the large existing JavaScript bundle.
- Native/security and provider tests have been expanded for update service recovery, retained cache backups, network DHCP recovery and real printer inventory. See `audit/phase-a-tests.txt` for the latest run. Mutations use fixture cmdlets and temporary directories, not Windows repair targets.
- Real Windows runner checks: read-only WinHTTP proxy and service inventory queries passed. No repair, network reset, disk repair, service change or reboot ran on this PC.
- At the earlier 27-operation checkpoint, existing phase 8.4 and 8.5 suites were run with native execution disabled: each reported 7/18 passing, with 11 failures. Their passes read seeded legacy providers, and their failures include unfinished operations and the removed authentication assumptions. The old runner also emitted a Windows libuv teardown assertion; its log is preserved in `docs/audit/legacy-test-results.txt`. These suites still depend on simulated data and old authentication. They are not Windows functional certification; outstanding failures must not be patched by reintroducing mock successes.
- Full Defender scan, signing, installer execution, target Windows repair tests and all-feature equivalence: not performed / blocked.

## Reproduce and continue

Run `npm ci`, `npm run lint`, `npm test`, `npm run build`, and `npm run audit:source` from the repository root. `npm start` runs the labelled audit preview. The optional `node --import tsx --test scripts/test_native_windows.ts` performs the read-only Windows runner check. `node scripts/smoke_production.mjs` verifies the built server with native execution disabled.

Use the operation matrix as the migration backlog. Implement providers and workflows against legacy commands, keep legitimate behavior and parameters, add failure/parameter tests, and validate on a disposable Windows VM before enabling them for release. Preserve the existing React design and implement its native WebView2 host rather than shipping the archived launcher.
