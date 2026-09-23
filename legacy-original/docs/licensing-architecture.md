# ASHtech PC Toolkit Pro — Commercial Licensing Architecture (Phase 5)

## 1. Executive Summary & Core Principle
ASHtech PC Toolkit Pro v8.0.0-dev implements an **authoritative server-side subscription licensing model** with asymmetric cryptographic token verification for offline field use.

```
+-------------------------------------------------------------------------------+
|                        COMMERCIAL LICENSING TOPOLOGY                          |
+-------------------------------------------------------------------------------+

  +---------------------------+                HTTPS Request (TLS 1.3)
  | ASHtech PC Toolkit Pro    | ------------------------------------+
  | (.NET Host / WebView2)    | <---------------------------------- |
  | Device Fingerprint (Hash) |        Signed RSA-2048 Token        |
  +---------------------------+                                     |
               |                                                    v
      DPAPI-Encrypted Cache                           +---------------------------+
      Anti-Clock Tamper Check                         | ASHtech Licensing Server  |
      Entitlement Engine                              | (Authority / Database)    |
                                                      | - License Key Hashes      |
                                                      | - Seat Allocation Table   |
                                                      | - RSA Private Signing Key |
                                                      +---------------------------+
```

### Architectural Guardrails
1. **The Windows Client is NEVER the Final Authority**: The client executable never contains the private signing key, never decides licensing terms in isolation, and cannot fabricate valid licenses.
2. **Never Trust Easily Tampered Local Artifacts**:
   - Plaintext `.json` / `.xml` files are rejected.
   - Plain registry strings are never treated as proof of active entitlement.
   - Operating system clock changes are validated against monotonic timestamps and server heartbeat responses.
3. **Graceful Offline Tolerance**:
   - 7-day default offline grace window (14 days for Technician and Enterprise tiers).
   - Once grace expires, destructive local resets are avoided; pro capabilities are locked into read-only diagnostic review mode until connectivity is restored.

---

## 2. Subscription Data Model

| Entity | Primary Key | Key Attributes | Description |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer_id` | `email`, `display_name`, `organization`, `status`, `created_at` | Customer account and billing record. |
| **Subscription** | `subscription_id` | `customer_id`, `plan_id`, `status`, `start_date`, `expiry_date`, `auto_renew` | Master term record governing duration and renewal. |
| **License** | `license_id` | `subscription_id`, `license_key_hash`, `license_key_prefix`, `activation_limit`, `status` | Commercial key instance with seat limit. Keys are stored only as salted SHA-256 hashes. |
| **Device** | `device_id` | `license_id`, `device_fingerprint`, `device_name`, `os_version`, `app_version`, `last_seen_at` | Registered workstation node occupying 1 seat. |
| **ValidationLog** | `validation_id` | `license_id`, `device_id`, `validation_time`, `result`, `ip_address` | Audit log of all heartbeat and validation attempts. |

---

## 3. License Key Generation and Hashing
- **Human-Readable Format**: `ASHT-[PLAN]-[4CHARS]-[4CHARS]-[4CHARS]` (e.g. `ASHT-PRO-7K2D-93MX-8QPL`).
- **Server-Side Storage**: Hashed using salted SHA-256 (`SHA256("ashtech_lic_salt_" + normalizedKey)`).
- **Public Masking**: The client and portal only ever display masked keys (`ASHT-PRO-7K2D-****`).

---

## 4. State Machine & Transitions

```
                    +--------------------+
                    |    UNLICENSED      |
                    +--------------------+
                              |
                     [Activate Valid Key]
                              |
                              v
    +---------------------------------------------------+
    |                      ACTIVE                       | <---------------+
    +---------------------------------------------------+                 |
      |                     |                         |                   |
 [<= 30d term]         [Offline > 4h]          [Term Elapsed]     [Online Heartbeat]
      |                     |                         |                   |
      v                     v                         v                   |
+---------------+     +---------------+     +--------------------+        |
| EXPIRING_SOON |     | OFFLINE_GRACE |     |      EXPIRED       |        |
+---------------+     +---------------+     +--------------------+        |
      |                     |                         |                   |
      |            [Grace Expired > 7d]               |                   |
      |                     |                         |                   |
      +---------------------+-------------------------+-------------------+
```

---

## 5. Security & DPAPI Storage
- **Windows DPAPI**: Local tokens are encrypted with `System.Security.Cryptography.ProtectedData.Protect` using `DataProtectionScope.CurrentUser` and dedicated entropy.
- **Clock Rollback Detection**: Monotonic timestamp records ensure that moving the Windows system clock back does not artificially extend expired subscriptions.
