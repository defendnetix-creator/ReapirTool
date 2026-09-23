# ASHtech Licensing Authority — API Specification (v1)

## 1. Overview & Transport Protocol
- **Base URL (Production)**: `https://licensing.ashtech.pro/api/v1/licenses`
- **Base URL (Dev / Local Bridge)**: `http://127.0.0.1:3000/api/v1/licenses`
- **Transport Security**: Mandatory TLS 1.3 in production with HSTS and rate limiting.
- **Content-Type**: `application/json`

---

## 2. Endpoints

### 2.1 Activate Workstation
Registers a workstation against a license key and issues a cryptographically signed token.

- **Method**: `POST /api/v1/licenses/activate`
- **Rate Limit**: 20 requests / minute / IP
- **Request Body**:
```json
{
  "licenseKey": "ASHT-PRO-7K2D-93MX-8QPL",
  "deviceFingerprint": "sha256_fp_win11_desktop_99182a",
  "deviceName": "DESKTOP-PRO-WK01",
  "osVersion": "Windows 11 Pro 23H2",
  "appVersion": "8.0.0-phase5"
}
```
- **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "licenseState": "ACTIVE",
  "activeDevices": 1,
  "maxDevices": 2,
  "message": "Activated successfully on Professional tier.",
  "token": {
    "payload": {
      "tokenVersion": 1,
      "licenseId": "lic_pro_8820",
      "subscriptionId": "sub_pro_9941",
      "planId": "professional",
      "planName": "Professional",
      "deviceId": "dev_w11_pc_771",
      "issuedAt": "2026-09-17T12:00:00.000Z",
      "expiresAt": "2027-06-25T12:00:00.000Z",
      "offlineGraceUntil": "2026-09-24T12:00:00.000Z",
      "maxDevices": 2,
      "activeDeviceCount": 1,
      "entitlements": ["diagnostics.basic", "repair.one_click_super", "ai.copilot_diagnostics", "..."],
      "customerEmail": "john.miller@quantumreach.com",
      "customerName": "John Miller"
    },
    "signature": "base64_encoded_rsa_signature...",
    "algorithm": "RSA-SHA256"
  }
}
```
- **Error Responses**:
  - `400 Bad Request` — Missing parameter (`MISSING_PARAMETERS`)
  - `404 Not Found` — Key not found (`LICENSE_NOT_FOUND`)
  - `403 Forbidden` — Expired / Revoked (`LICENSE_REVOKED`, `SUBSCRIPTION_EXPIRED`)
  - `409 Conflict` — Seat limit exceeded (`DEVICE_LIMIT_EXCEEDED`)

---

### 2.2 Heartbeat & Online Validation
Periodic validation heartbeat refreshing the signed token and grace window.

- **Method**: `POST /api/v1/licenses/validate`
- **Request Body**:
```json
{
  "licenseId": "lic_pro_8820",
  "deviceId": "dev_w11_pc_771",
  "deviceFingerprint": "sha256_fp_win11_desktop_99182a",
  "appVersion": "8.0.0-phase5"
}
```
- **Response (`200 OK`)**:
```json
{
  "success": true,
  "licenseState": "ACTIVE",
  "serverTimestamp": "2026-09-17T12:00:00.000Z",
  "token": { ... },
  "message": "License validated successfully."
}
```

---

### 2.3 Deactivate Device Seat
Releases an allocated seat so another workstation can be activated.

- **Method**: `POST /api/v1/licenses/deactivate`
- **Request Body**:
```json
{
  "licenseId": "lic_pro_8820",
  "deviceId": "dev_w11_pc_771"
}
```
- **Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "Device seat successfully released.",
  "activeDevicesCount": 0
}
```

---

### 2.4 License Status & Device Fleet
Fetches authoritative metadata, expiration countdown, and active device list.

- **Method**: `GET /api/v1/licenses/status?licenseId=lic_pro_8820`
- **Response (`200 OK`)**:
```json
{
  "success": true,
  "licenseId": "lic_pro_8820",
  "licenseKeyPrefix": "ASHT-PRO-7K2D-****",
  "plan": { "planId": "professional", "displayName": "Professional", "maxDevices": 2, "...": "..." },
  "subscription": {
    "status": "ACTIVE",
    "startDate": "2026-06-25T00:00:00.000Z",
    "expiryDate": "2027-06-25T00:00:00.000Z",
    "daysRemaining": 280,
    "autoRenew": true
  },
  "customer": {
    "name": "John Miller",
    "email": "john.miller@quantumreach.com",
    "organization": "Quantum Reach Labs"
  },
  "devices": [
    {
      "deviceId": "dev_w11_pc_771",
      "deviceName": "DESKTOP-PRO-WK01",
      "osVersion": "Windows 11 Pro 23H2",
      "appVersion": "8.0.0-phase5",
      "activatedAt": "2026-08-01T10:00:00.000Z",
      "lastSeenAt": "2026-09-17T12:00:00.000Z",
      "isCurrentDevice": true
    }
  ],
  "activeDeviceCount": 1,
  "maxDevices": 2,
  "entitlements": ["..."],
  "licenseState": "ACTIVE"
}
```

---

### 2.5 Public Verification Key
Returns the RSA public key in PEM format used by clients to verify signatures.

- **Method**: `GET /api/v1/licenses/public-key`
- **Response (`200 OK`)**:
```json
{
  "success": true,
  "algorithm": "RSA-SHA256",
  "publicKeyPem": "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA..."
}
```
