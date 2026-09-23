# Phase 7.1 — Razorpay Backend + Automatic License Issuance Summary
**Product:** Akshigo PC Toolkit Pro v8.0.0-rc.1  
**Gateway:** Razorpay (TEST MODE)  
**Licensing Service:** Akshigo Cryptographic Authority  
**Billing Term:** 365 Days (Annual)  
**Currency:** INR  

---

## 1. Files Changed & Added

### Added Files
- `/server/payments/types.ts`: TypeScript definitions for payment statuses, records, webhook events, and request/response contracts.
- `/server/payments/config.ts`: Server-side plan pricing table (in INR paise), plan SKU resolvers, and environment variable configuration for Razorpay TEST mode.
- `/server/payments/crypto.ts`: Cryptographic verification functions for payment checkout signatures (`HMAC-SHA256(order_id + "|" + payment_id, secret)`) and raw-body webhook signatures (`HMAC-SHA256(rawBody, webhookSecret)`).
- `/server/payments/database.ts`: Thread-safe payment, order, and webhook event database with lookup indices and idempotency tracking.
- `/server/payments/fulfillment.ts`: Payment fulfillment engine integrating with existing Phase 5 licensing services, creating subscriptions and `AKSG-` licenses or extending existing subscription terms.
- `/server/payments/routes.ts`: Express router handling order creation, payment verification, webhook ingestion, and plan catalog.
- `/scripts/test_phase7_1.ts`: Automated test suite for all 10 Phase 7.1 payment and licensing scenarios.
- `/docs/phase7.1-summary.md`: This Phase 7.1 summary documentation.

### Modified Files
- `/server/licensing/crypto.ts`: Added `generateAksgLicenseKey()` generator for authentic `AKSG-<TIER>-XXXX-XXXX-XXXX` license keys.
- `/server/licensing/database.ts`: Added customer creation/lookup, subscription creation, license issuance, and renewal helper methods (`createCustomer`, `findCustomerByEmail`, `createSubscription`, `createLicense`, `findLicenseBySubscriptionId`, `renewSubscriptionBySubscriptionId`).
- `/server.ts`: Configured raw body capture in `express.json({ verify: ... })`, mounted `/api/v1/payments` router, and updated server metadata.
- `/.env.example`: Added Razorpay environment variables (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `RAZORPAY_MODE=test`).

---

## 2. Endpoints Added

| HTTP Method | Route | Description | Auth / Security |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/payments/plans` | Public catalog of available subscription plans with authoritative server-side prices in INR. | Public, rate-limited |
| **POST** | `/api/v1/payments/orders` | Creates a new payment order record and Razorpay Order based strictly on server plan pricing (rejects client amounts). | Rate-limited (30 req/min) |
| **POST** | `/api/v1/payments/verify` | Verifies checkout signature server-side (`HMAC-SHA256`), updates payment status to `PAID`, and triggers automatic fulfillment. | Rate-limited (30 req/min) |
| **POST** | `/api/v1/payments/webhook` | Ingests Razorpay webhook events using raw body signature verification and event-ID idempotency. | `X-Razorpay-Signature` validation |

---

## 3. Test Results

Automated execution via `npx tsx scripts/test_phase7_1.ts`:

| # | Test Scenario | Status | Result Details |
| :-: | :--- | :-: | :--- |
| 1 | **Create order** | **PASS** | Validated server-side price injection (₹5,999 for Professional) and created payment order with `CREATED` status. |
| 2 | **Invalid plan rejected** | **PASS** | Arbitrary or unknown plan SKUs (e.g., `ULTRA_VIP_SUPER_SPECIAL`, empty strings) safely rejected with `INVALID_PLAN` (400). |
| 3 | **Successful verified payment** | **PASS** | Valid HMAC-SHA256 signature verified server-side with authoritative Razorpay secret. |
| 4 | **Invalid payment signature** | **PASS** | Forged or tampered signature rejected, preventing unauthorized fulfillment. |
| 5 | **Valid webhook signature** | **PASS** | Raw request body HMAC-SHA256 signature verified against `RAZORPAY_WEBHOOK_SECRET`. |
| 6 | **Invalid webhook signature** | **PASS** | Tampered webhook payload correctly rejected with 400 Bad Request. |
| 7 | **Duplicate webhook** | **PASS** | Webhook event ID idempotency verified; duplicate events return HTTP 200 without duplicate fulfillment. |
| 8 | **New subscription creates AKSG license** | **PASS** | Captured payment generates `Customer` → `Subscription` (365 days) → `AKSG-TECH-****` license registered in licensing authority. |
| 9 | **Renewal extends existing expiry exactly once** | **PASS** | Renewal extends existing subscription expiry by `max(current_expiry, now) + 365 days`. Duplicate calls remain idempotent. |
| 10 | **Failed payment creates no license** | **PASS** | Orders with `FAILED` status do not create subscriptions or allocate license seats. |

---

## 4. Known Blockers

- **None**. All Phase 7.1 requirements verified and operating in Razorpay TEST mode.
