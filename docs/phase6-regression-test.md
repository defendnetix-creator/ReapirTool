# ASHtech PC Toolkit Pro — Phase 6 Quality Assurance & Regression Test Plan

**Version:** 8.0.0 Commercial Release  
**Scope:** Installer, Code Signing, Update Architecture, Directory Separation, and Runtime Compatibility

---

## 1. Test Matrix

### Category A: Installer & Directory Architecture
| Test Case ID | Description | Expected Outcome | Status |
| :--- | :--- | :--- | :--- |
| **TC-INST-01** | Clean installation on Windows 11 x64. | Application installs to `C:\Program Files\ASHtech\PC Toolkit Pro\`. Desktop & Start Menu shortcuts created. | **PASS** |
| **TC-INST-02** | Standard user ACL test in `Program Files`. | Standard user cannot write, rename, or delete files in application folder. | **PASS** |
| **TC-INST-03** | Shared log test in `ProgramData`. | Diagnostic reports and audit ring logs write cleanly to `C:\ProgramData\ASHtech\PC Toolkit Pro\Logs\`. | **PASS** |
| **TC-INST-04** | Clean uninstallation test. | Add/Remove Programs unregisters app; binaries removed; user prompted regarding preserving reports. | **PASS** |
| **TC-INST-05** | In-place upgrade test (8.0.0 -> 8.0.1). | Seamless upgrade without uninstalling; DPAPI license token and diagnostics preserved. | **PASS** |

---

### Category B: Authenticode Code Signing & Integrity
| Test Case ID | Description | Expected Outcome | Status |
| :--- | :--- | :--- | :--- |
| **TC-SIGN-01** | SHA-256 digital signature validation. | `Get-AuthenticodeSignature` returns `Status: Valid` with SHA-256 digest. | **PASS** |
| **TC-SIGN-02** | RFC 3161 Timestamp validation. | Embedded timestamp is verified and valid past certificate expiration. | **PASS** |
| **TC-SIGN-03** | Publisher identity pinning test. | Publisher verified as `CN=ASHtech Technologies Inc`. | **PASS** |
| **TC-SIGN-04** | SHA-256 checksums catalog. | `SHA256SUMS.txt` accurately reflects binary hashes. | **PASS** |

---

### Category C: Secure Updates & Manifest Pipeline
| Test Case ID | Description | Expected Outcome | Status |
| :--- | :--- | :--- | :--- |
| **TC-UPD-01** | HTTPS manifest check on Stable channel. | Returns current version status or valid update metadata. | **PASS** |
| **TC-UPD-02** | Beta channel switching in Settings UI. | Correctly queries preview manifest (`8.1.0-beta.1`) with release notes. | **PASS** |
| **TC-UPD-03** | Download & hash integrity check. | Downloads payload and validates SHA-256 before allowing installation. | **PASS** |
| **TC-UPD-04** | Untrusted publisher rejection. | If signature signer doesn't match pinned publisher, update is aborted. | **PASS** |

---

### Category D: Security Regression & Defender Scans
| Test Case ID | Description | Expected Outcome | Status |
| :--- | :--- | :--- | :--- |
| **TC-SEC-01** | Automated Defender heuristics scan. | `scan_defender_regressions.ps1` returns 0 critical/high violations. | **PASS** |
| **TC-SEC-02** | Secret leakage audit. | No hardcoded private keys or passwords in build artifacts. | **PASS** |
| **TC-SEC-03** | Evaluation keys stripped in RELEASE mode. | Sample QA keys in activation modal hidden when `ENV.mode === 'RELEASE'`. | **PASS** |
