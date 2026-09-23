# ASHtech PC Toolkit Pro — Release Build & Distribution Guide

**Version:** 8.0.0 Commercial Release  
**Publisher:** ASHtech Technologies Inc.

---

## 1. Quick Start: Generating a Production Release Package

To produce an official, signed commercial release package:

```powershell
# Run from repository root
.\scripts\build_release.ps1 -Version "8.0.0" -BuildMode "RELEASE" -SigningProvider "LOCAL_CERTIFICATE" -CertificatePath "C:\Certs\ASHtech_Prod.pfx" -CertificatePassword "<Password>"
```

### Build Pipeline Stages:
1. **Security & Defender Scan**: Runs `scripts/scan_defender_regressions.ps1` to detect dangerous patterns.
2. **Web Assets Compilation**: Executes `npm run build` to generate optimized static files in `dist/`.
3. **.NET Host Packaging**: Gathers host executables and specialized diagnostic modules.
4. **Installer Compilation**: Inno Setup (`ISCC.exe`) compiles `ASHtech-PC-Toolkit-Pro-8.0.0-Setup.exe`.
5. **Authenticode Signing**: Applies SHA-256 signatures with RFC 3161 DigiCert timestamps to all EXEs and DLLs.
6. **Integrity Manifests**: Generates `SHA256SUMS.txt` and signed `release-manifest.json` for update distribution.

---

## 2. Release Directory Output Layout

Generated release artifacts reside in `release/8.0.0/`:

```text
release/8.0.0/
├── ASHtech-PC-Toolkit-Pro-8.0.0-Setup.exe   # Authenticode-signed installer
├── SHA256SUMS.txt                           # Cryptographic SHA-256 digests of all artifacts
├── release-manifest.json                    # Authoritative HTTPS update manifest
└── EULA.txt                                 # Commercial End User License Agreement
```

---

## 3. Verifying the Release Package

To verify the release signatures and checksums:

```powershell
# Verify digital signatures and publisher pinning
.\scripts\signing\Verify-Signatures.ps1 -TargetDirectory "release\8.0.0" -ExpectedSigner "CN=ASHtech Technologies Inc"

# Verify SHA-256 digests
Get-FileHash -Path "release\8.0.0\ASHtech-PC-Toolkit-Pro-8.0.0-Setup.exe" -Algorithm SHA256
```
