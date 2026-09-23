# ASHtech PC Toolkit Pro — Secure Update Architecture & Protocol Specification

**Version:** 8.0.0 Commercial Release  
**Service Endpoint:** `https://updates.ashtech.pro/api/v1/updates`

---

## 1. Architectural Philosophy

ASHtech PC Toolkit Pro enforces a multi-staged, zero-trust update architecture.

### Prohibited Update Anti-Patterns:
- **No PowerShell Download Cradles**: `Invoke-WebRequest ... | Invoke-Expression` is strictly banned.
- **No Unsigned Binary Ingestion**: Any payload failing Authenticode validation is immediately deleted.
- **No Silent Dropper Behavior**: The user is provided transparent release notes and clear UI progress indicators.

---

## 2. Multi-Stage Update Pipeline

```text
[1. Check]       --> Query HTTPS Manifest Endpoint with current version & channel
[2. Download]    --> Download installer package into isolated staging directory (%TEMP%\ASHtech\Updates\)
[3. Hash Check]  --> Compute SHA-256 digest of downloaded payload and match against manifest
[4. Sign Check]  --> Verify Authenticode digital signature and pin publisher to "ASHtech Technologies Inc"
[5. Consent]     --> Present Release Notes & update action to user (or enforce deadline if critical)
[6. Execute]     --> Launch installer in transactional upgrade mode (/SILENT /NORESTART)
[7. Transition]  --> Preserves license token, updates binaries, and restarts application
```

---

## 3. Release Manifest Specification (`release-manifest.json`)

```json
{
  "version": "8.0.0",
  "channel": "stable",
  "releaseDate": "2026-09-17T00:00:00Z",
  "minSupportedVersion": "7.0.0",
  "updateType": "recommended",
  "title": "ASHtech PC Toolkit Pro v8.0.0 — Commercial Release",
  "releaseNotes": "### What's New in v8.0.0 Commercial Release:\n- Professional Windows Distribution with Inno Setup\n- Authenticode SHA-256 Signing and Timestamping...",
  "installer": {
    "filename": "ASHtech-PC-Toolkit-Pro-8.0.0-Setup.exe",
    "url": "https://updates.ashtech.pro/releases/8.0.0/ASHtech-PC-Toolkit-Pro-8.0.0-Setup.exe",
    "sha256": "4f29a0b80f12c98d63a890471b4b9b9903b44b82db7ad1e8b23c21a415951c89",
    "sizeBytes": 48325912,
    "signature": {
      "algorithm": "SHA256withRSA",
      "signer": "CN=ASHtech Technologies Inc, O=ASHtech Technologies Inc, L=Seattle, S=Washington, C=US",
      "thumbprint": "B38914A89FE2208A5E12F4B309A98F72A5826649"
    }
  },
  "mandatoryDeadline": "2026-10-15T00:00:00Z"
}
```

---

## 4. Channels & Rollback Safety

### Distribution Channels:
1. **Stable**: Rigorously validated production builds deployed to all commercial subscribers.
2. **Beta / Preview**: Opt-in feature preview builds for early technical feedback.
3. **Internal**: Staging builds for regression testing and CI verification.

### Rollback Strategy:
- If a critical regression occurs in a newly released build, the update authority server marks `updateType: "critical"` pointing to the verified previous stable build as `rollbackTargetVersion`.
- The in-place installer automatically replaces binaries with the rollback target version while preserving user diagnostic history and active license tokens.
