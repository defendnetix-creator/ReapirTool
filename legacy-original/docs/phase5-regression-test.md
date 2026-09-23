# Phase 5 — Commercial Licensing Regression & Verification Test Plan

## 1. Test Matrix Overview

| Test ID | Category | Scenario | Expected Result | Result |
| :--- | :--- | :--- | :--- | :---: |
| **TC-LIC-01** | Activation | Enter valid Pro key (`ASHT-PRO-7K2D-93MX-8QPL`) | Successfully activates workstation, receives signed token, enables Pro entitlements. | **PASS** |
| **TC-LIC-02** | Validation | Online heartbeat to `/api/v1/licenses/validate` | Refreshes signed token, returns `ACTIVE` status and server timestamp. | **PASS** |
| **TC-LIC-03** | Seat Limit | Exceed maximum device seats (e.g. >2 on Pro) | Returns `409 Conflict` with `DEVICE_LIMIT_REACHED` and clear allocation explanation. | **PASS** |
| **TC-LIC-04** | Offline Grace | Disconnect network after valid activation | Client smoothly falls back to `OFFLINE_GRACE` mode with countdown indicator. | **PASS** |
| **TC-LIC-05** | Grace Expiry | Offline duration exceeds 7-day grace window | Pro tools transition to locked state; past reports remain readable; prompts internet sync. | **PASS** |
| **TC-LIC-06** | Clock Rollback | System clock rolled backward by > 1 hour | Anti-tamper trigger detects rollback; flags `INVALID`; requests online revalidation. | **PASS** |
| **TC-LIC-07** | Deactivation | Click "Deactivate Seat" in portal | Releases seat on server, removes local token, resets workstation to unlicensed. | **PASS** |
| **TC-LIC-08** | Renewal | Server-side renewal via `/api/v1/licenses/renew` | Extends expiration date by +365 days; UI updates immediately. | **PASS** |
| **TC-LIC-09** | Revocation | Key marked `REVOKED` on server | Heartbeat detects revocation; locks pro tools with clear support contact guidance. | **PASS** |
| **TC-LIC-10** | Entitlements | Personal plan attempts Pro One-Click Super Repair | Feature gate modal appears with tier difference explanation. | **PASS** |

---

## 2. Regression Safeguards
- All Phase 4 UI components, Stitch dark theme, and navigation remain 100% operational.
- Diagnostics, loopback bridge, and audit logging continue without regression.
