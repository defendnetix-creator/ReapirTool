# Legacy Brand Migration Architecture & Compatibility Guide
**Product:** Akshigo PC Toolkit Pro  
**Legacy Brand:** ASHtech PC Toolkit Pro  
**Version:** `8.0.0-rc.1`

---

## 1. Overview

When upgrading an existing workstation from ASHtech PC Toolkit Pro to **Akshigo PC Toolkit Pro**, the software must guarantee that:
1. Active subscriptions and activated device tokens remain valid without requiring the customer to re-enter their license key.
2. Historical diagnostic reports, hardware manifests, and audit logs are preserved.
3. Inno Setup upgrades the existing installation in-place without leaving duplicate entries in Add/Remove Programs.
4. Legacy license keys (`ASHT-PRO-...`) continue to activate and renew against the server-side license authority.

---

## 2. In-Place Installer Upgrade Strategy

### Fixed Inno Setup AppId
The application preserves its immutable GUID:
```ini
AppId={{C81F7A23-5C32-4E2B-981D-F81A96010214}}
```
Because the `AppId` is identical, Windows Installer recognizes the setup package as an upgrade to the existing installation rather than a new standalone application.

### Automatic Directory & Data Migration
During `InitializeSetup()` in `Akshigo_PC_Toolkit_Pro.iss`, the installer detects if legacy data exists in:
- `C:\ProgramData\ASHtech\PC Toolkit Pro`
- `%LOCALAPPDATA%\ASHtech\PC Toolkit Pro`

If present and the new target directories (`C:\ProgramData\Akshigo Tech\PC Toolkit Pro`) do not yet exist, the installer automatically provisions the new directories and migrates local logs and cached diagnostic states.

---

## 3. Client-Side Local Storage & DPAPI Token Migration

When the application loads, `licenseClient.ts` executes `performLegacyBrandMigration()` before any network calls:

```typescript
function performLegacyBrandMigration() {
  try {
    // 1. Migrate license token
    const legacyToken = localStorage.getItem('ashtech_license_token');
    if (legacyToken && !localStorage.getItem('akshigo_license_token')) {
      localStorage.setItem('akshigo_license_token', legacyToken);
    }

    // 2. Migrate hardware device fingerprint
    const legacyDeviceId = localStorage.getItem('ashtech_device_id');
    if (legacyDeviceId && !localStorage.getItem('akshigo_device_id')) {
      localStorage.setItem('akshigo_device_id', legacyDeviceId);
    }

    // 3. Migrate update channel selection
    const legacyChannel = localStorage.getItem('ashtech_update_channel');
    if (legacyChannel && !localStorage.getItem('akshigo_update_channel')) {
      localStorage.setItem('akshigo_update_channel', legacyChannel);
    }
  } catch (e) {
    console.warn('[BrandMigration] Storage migration warning:', e);
  }
}
```

If an older installation only contains `ashtech_` keys, the client transparently reads the legacy keys as a fallback, saves them to the new `akshigo_` keys, and maintains an uninterrupted active license state.

---

## 4. Server-Side Dual Key Authentication

The authoritative license database maps both the legacy `ASHT` key hash and the new `AKSG` key hash to the same underlying license record:

```typescript
// Dual-hash lookup logic in server/licensing/crypto.ts
export function hashLicenseKey(key: string): string {
  const normalized = key.trim().toUpperCase();
  return crypto.createHmac('sha256', SERVER_KEY_SALT).update(normalized).digest('hex');
}

export function hashLegacyLicenseKey(key: string): string {
  const normalized = key.trim().toUpperCase();
  return crypto.createHmac('sha256', LEGACY_KEY_SALT).update(normalized).digest('hex');
}
```

This guarantees that:
- Existing customers who purchased `ASHT-PRO-2026-X8K9-M2Q1-W4P7` can activate, deactivate, or renew their seats at any time.
- New customers activating `AKSG-PRO-2026-X8K9-M2Q1-W4P7` use the new brand standard.

---

## 5. Security & Isolation Invariants

The brand migration maintains all Phase 1–6 security guarantees:
- **Zero-Trust Loopback**: 127.0.0.1 bridge with origin checking and authorization headers.
- **DPAPI Token Protection**: Token storage on Windows endpoints uses local user DPAPI entropy.
- **Authenticode Pinning**: Signatures are verified against the authoritative publisher certificate (`CN=Akshigo Tech`).
- **Defender Compliance**: No dropper patterns, no encoded commands, no remote script cradles.
