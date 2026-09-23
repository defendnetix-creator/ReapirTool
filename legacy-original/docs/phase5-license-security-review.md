# Phase 5 — Licensing Security & Threat Modeling Review

## 1. Threat Matrix & Countermeasures

| Threat Scenario | Vector | Defensive Countermeasure | Status |
| :--- | :--- | :--- | :--- |
| **Token Forgery** | Attacker crafts synthetic JSON token claiming "Enterprise" entitlement. | Signed using server-side RSA-2048 private key. Client verifies using SPKI public key. Forged signatures fail verification immediately. | **MITIGATED** |
| **Clock Rollback Attack** | User sets system clock backward to 2025 to bypass expiration. | Client tracks monotonic time delta in DPAPI storage. If backward jump > 1 hour, status changes to `INVALID` and requires online sync. | **MITIGATED** |
| **Plaintext Key Harvesting** | Attacker dumps process memory or reads local files for license keys. | License keys are never stored on the client or server in plaintext. Server stores salted SHA-256 hashes only. | **MITIGATED** |
| **Seat Piracy / Cloning** | Attacker clones virtual machine image to 50 computers. | Each device generates a unique composite hardware hash (`DeviceIdentity.cs`). Server checks seat quota (`maxDevices`) and rejects cloned seats with `DEVICE_LIMIT_REACHED`. | **MITIGATED** |
| **Reverse Engineering Host** | Attacker inspects .NET assembly. | Authority is hosted server-side. Decompiling the client only reveals public verification keys; private keys never exist in binary. | **MITIGATED** |
| **API Denial of Service / Brute Force** | Bot repeatedly attempts activation key combinations. | Licensing API enforces per-IP rate limiting (20 req/min for activation, 120 req/min for validation). | **MITIGATED** |

---

## 2. Cryptographic Assurance
- **Algorithm**: RSA with SHA-256 digest (PKCS#1 v1.5 / PSS).
- **Key Length**: 2048-bit minimum modulus.
- **Local Storage**: Windows DPAPI (`CryptProtectData` via `System.Security.Cryptography.ProtectedData`).
- **Transport Security**: HTTPS TLS 1.3 encryption with strict TLS cipher suites.
