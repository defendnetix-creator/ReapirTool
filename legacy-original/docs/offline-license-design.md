# Offline License Design, Grace Period & Clock Protection

## 1. Offline Operation Model
ASHtech PC Toolkit Pro is designed for field technicians, air-gapped forensic workstations, and field laptops that may operate without internet connectivity for extended periods.

```
                      +-----------------------------+
                      |   Online Activation / Sync  |
                      +-----------------------------+
                                     |
                          [Cache Signed RSA Token]
                                     |
                                     v
+-----------------------------------------------------------------------------------+
|                            OFFLINE EXECUTION PIPELINE                             |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  1. Decrypt DPAPI Container (%LOCALAPPDATA%\ASHtech\Licensing\license.dat)        |
|                                                                                   |
|  2. Verify Monotonic Clock Progress (Detect Clock Rollback > 1 hour)             |
|                                                                                   |
|  3. Validate RSA Token Signature with Embedded SPKI Public Key                    |
|                                                                                   |
|  4. Evaluate Expiration & Grace Period:                                           |
|     - If Current UTC <= offlineGraceUntil: GRANT OFFLINE ACCESS                   |
|     - If Current UTC > offlineGraceUntil: LOCK PRO TOOLS & REQUIRE RECONNECT      |
|                                                                                   |
+-----------------------------------------------------------------------------------+
```

---

## 2. Grace Period Windows by Tier

| Plan Tier | Offline Grace Window | Target Persona |
| :--- | :--- | :--- |
| **Personal** | 7 Days | Single user desktop |
| **Professional** | 7 Days | Power user workstation & laptop |
| **Technician** | 14 Days | Field service technician / mobile repair |
| **Business / Fleet** | 14 Days | Remote branch office & enterprise endpoints |

---

## 3. Clock Rollback & Anti-Tamper Protection
To prevent attackers from freezing or rolling back the system clock to perpetually operate an expired license:
1. **Monotonic Execution Log**: The client writes an encrypted timestamp tick to `monotonic.dat` on every run and during background operations.
2. **Backward Drift Detection**: If `Current UTC Time < Last Known Server Time - 1 Hour`, the client immediately flags clock tampering:
   - Sets status to `INVALID`.
   - Displays clear remediation message: *"System clock tampering or significant time rollback detected. Online validation required."*
   - Demands an online sync with the licensing authority to resynchronize time.
