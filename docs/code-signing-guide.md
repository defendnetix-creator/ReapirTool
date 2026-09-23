# ASHtech PC Toolkit Pro — Authenticode Code Signing & Identity Policy

**Version:** 8.0.0 Commercial Release  
**Publisher Identity:** `CN=ASHtech Technologies Inc, O=ASHtech Technologies Inc, L=Seattle, S=Washington, C=US`

---

## 1. Code Signing Standard

ASHtech PC Toolkit Pro enforces strict Authenticode digital code signing across all distributed artifacts.

### Mandatory Signature Parameters:
- **File Digest Algorithm**: `SHA-256` (`/fd SHA256`)
- **Timestamping Standard**: **RFC 3161 compliant** timestamp authority (`/tr http://timestamp.digicert.com /td SHA256`)
- **Dual Fallback Timestamping**: If DigiCert is unreachable, automatically retries with Sectigo (`http://timestamp.sectigo.com`).
- **Description & URL**: Embedded application metadata (`/d "ASHtech PC Toolkit Pro"` `/du "https://ashtech.pro"`).

---

## 2. Signing Pipeline Integration & Commands

The signing pipeline is abstracted via `scripts/signing/Sign-Artifacts.ps1` with four operational modes:

| Mode | Target Environment | Mechanism |
| :--- | :--- | :--- |
| `NONE` | Local development & unit tests | Skips signing to allow rapid iterative compilation. |
| `LOCAL_CERTIFICATE` | Staging & internal release QA | Signs with local PFX file or hardware token (YubiKey / SafeNet USB). |
| `MANAGED_SIGNING` | Official production distribution | Signs via cloud HSM (Azure Trusted Signing, DigiCert ONE, AWS CloudHSM). |
| `STORE` | Microsoft Store MSIX packaging | Signed with Microsoft Store flight certificate during store ingestion. |

### Canonical SignTool Invocations:
```powershell
# Sign application host executable
signtool.exe sign /fd SHA256 /tr http://timestamp.digicert.com /td SHA256 /d "ASHtech PC Toolkit Pro" /du "https://ashtech.pro" /f "C:\Certs\ASHtech_Prod.pfx" /p "<SecurePassword>" "publish\release\ASHtech_PC_Toolkit_Pro.exe"

# Sign installer setup executable
signtool.exe sign /fd SHA256 /tr http://timestamp.digicert.com /td SHA256 /d "ASHtech PC Toolkit Pro Setup" /du "https://ashtech.pro" /f "C:\Certs\ASHtech_Prod.pfx" /p "<SecurePassword>" "release\8.0.0\ASHtech-PC-Toolkit-Pro-8.0.0-Setup.exe"
```

---

## 3. Microsoft SmartScreen & Reputation Engineering

### Understanding SmartScreen Realities:
1. **Digital Signatures vs Instant Bypass**:
   - A valid Authenticode signature from a recognized Certificate Authority establishes **identity and tamper-proofing**, but **does not grant instant zero-warning bypass** on Day 1 of a new certificate or version.
2. **Reputation Building Mechanics**:
   - SmartScreen builds trust dynamically through **download volume, telemetry signals, and clean scan history**.
   - An Extended Validation (EV) certificate or Microsoft Trusted Signing accelerates reputation accrual compared to standard OV certificates.
3. **Strict Prohibition on Evasion**:
   - The release pipeline **never** uses artificial reputation generators, download tampering, or obfuscation.
   - Genuine trust is built through transparent publisher identity, clean virus total telemetry, and consistent signing certificates across version increments.

---

## 4. Automated Signature Verification

Before any release is published, `scripts/signing/Verify-Signatures.ps1` runs against the release directory:
```powershell
Get-AuthenticodeSignature -FilePath "release\8.0.0\ASHtech-PC-Toolkit-Pro-8.0.0-Setup.exe"
```
Verification checks:
- Status equals `Valid`.
- Signer certificate subject matches `CN=ASHtech Technologies Inc`.
- Signature algorithm is `sha256ECDSA` or `sha256RSA`.
- Timestamp signature is present and unexpired.
