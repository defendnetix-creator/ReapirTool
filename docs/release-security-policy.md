# ASHtech PC Toolkit Pro — Release Security & Governance Policy

**Version:** 8.0.0 Commercial Release  
**Effective Date:** 2026-09-17  
**Authority:** ASHtech Security & Release Engineering Team

---

## 1. Zero-Trust Release Principles

Every commercial release build of ASHtech PC Toolkit Pro must adhere strictly to these non-negotiable security mandates:

1. **No Secret Leakage**:
   - Private signing keys (`.pfx`, `.key`, `.pem`) and production server credentials must **never** be committed to the source repository or packaged in release outputs.
   - Cloud Key Vaults or hardware security modules (HSM) must be used for official release signing.

2. **No Unsolicited Elevation or UAC Bypasses**:
   - Application entry points must request `asInvoker`.
   - Elevated repair actions must be transparent and triggered explicitly with standard Windows UAC prompts.

3. **No Dynamic Remote Execution**:
   - The application does not fetch or execute unverified remote script payloads.
   - All update artifacts must be verified with SHA-256 digests and Authenticode signatures pinned to `ASHtech Technologies Inc`.

4. **Zero Dropper / Self-Extraction Heuristics**:
   - All binaries and tool modules are deployed by the professional installer to `C:\Program Files\ASHtech\PC Toolkit Pro\Modules\` with immutable read-only ACLs, completely replacing runtime zip extraction.

---

## 2. Release Gate Checklist

A release candidate cannot be promoted to `RELEASE` status unless all gates pass:

- [x] **Gate 1: Repository Cleanliness**: No uncommitted files or untracked test scripts.
- [x] **Gate 2: Security & Defender Scanner**: `scan_defender_regressions.ps1` returns 0 critical/high violations.
- [x] **Gate 3: Build Mode Isolation**: `ENV.mode === 'RELEASE'`, with evaluation sample keys, mock backdoors, and WebView2 DevTools completely disabled.
- [x] **Gate 4: Authenticode Verification**: All `.exe` and `.dll` artifacts pass `Get-AuthenticodeSignature` with valid timestamp.
- [x] **Gate 5: Checksum Manifest**: `SHA256SUMS.txt` and `release-manifest.json` generated and matching binary digests.
- [x] **Gate 6: Clean Uninstall Test**: Add/Remove Programs uninstall completes without leaving orphaned binaries in `Program Files`.
