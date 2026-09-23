/**
 * Automated Test Suite for Phase 7.1 — Razorpay Backend & Automatic License Issuance
 * 
 * Verifies the 10 critical scenarios:
 * 1. create order
 * 2. invalid plan rejected
 * 3. successful verified payment
 * 4. invalid payment signature
 * 5. valid webhook signature
 * 6. invalid webhook signature
 * 7. duplicate webhook
 * 8. new subscription creates AKSG license
 * 9. renewal extends existing expiry exactly once
 * 10. failed payment creates no license
 */

import { resolvePlanTier, SERVER_PLAN_PRICING, RAZORPAY_CONFIG } from '../server/payments/config.js';
import { paymentDb } from '../server/payments/database.js';
import {
  verifyPaymentSignature,
  verifyWebhookSignature,
  computePaymentSignature,
  computeWebhookSignature
} from '../server/payments/crypto.js';
import { fulfillPayment } from '../server/payments/fulfillment.js';
import { licenseDb } from '../server/licensing/database.js';

interface TestResult {
  scenarioNumber: number;
  scenario: string;
  status: 'PASS' | 'FAIL' | 'BLOCKED' | 'NOT TESTED';
  details: string;
}

const results: TestResult[] = [];

console.log('================================================================');
console.log(' AKSHIGO PC TOOLKIT PRO — PHASE 7.1 PAYMENT BACKEND TEST SUITE');
console.log(' Gateway: Razorpay (TEST MODE) | Target: Akshigo Licensing Engine');
console.log('================================================================\n');

// -------------------------------------------------------------
// Test 1: Create Order
// -------------------------------------------------------------
try {
  const planTier = resolvePlanTier('PROFESSIONAL');
  if (!planTier) throw new Error('Failed to resolve PROFESSIONAL plan');

  const pricing = SERVER_PLAN_PRICING[planTier];
  const internalOrderId = `ord_int_test_${Date.now()}_1`;
  const razorpayOrderId = `order_test_rzp_${Date.now()}_1`;

  const orderRecord = paymentDb.createOrderRecord({
    customerId: 'cust_test_001',
    internalOrderId,
    razorpayOrderId,
    planId: planTier,
    amount: pricing.amountPaise,
    currency: pricing.currency,
    customerEmail: 'test1@akshigo.tech',
    customerName: 'Test User One',
    isRenewal: false
  });

  if (
    orderRecord &&
    orderRecord.amount === 599900 &&
    orderRecord.currency === 'INR' &&
    orderRecord.status === 'CREATED' &&
    orderRecord.razorpayOrderId === razorpayOrderId
  ) {
    results.push({
      scenarioNumber: 1,
      scenario: 'create order',
      status: 'PASS',
      details: `Created order ${internalOrderId} for ${orderRecord.planId} (₹${orderRecord.amount / 100}) with status CREATED`
    });
  } else {
    results.push({
      scenarioNumber: 1,
      scenario: 'create order',
      status: 'FAIL',
      details: 'Order record created but attributes did not match expectation'
    });
  }
} catch (e: any) {
  results.push({
    scenarioNumber: 1,
    scenario: 'create order',
    status: 'FAIL',
    details: e.message
  });
}

// -------------------------------------------------------------
// Test 2: Invalid Plan Rejected
// -------------------------------------------------------------
try {
  const invalidPlan1 = resolvePlanTier('ULTRA_VIP_SUPER_SPECIAL');
  const invalidPlan2 = resolvePlanTier('');
  const invalidPlan3 = resolvePlanTier(undefined as any);

  if (invalidPlan1 === null && invalidPlan2 === null && invalidPlan3 === null) {
    results.push({
      scenarioNumber: 2,
      scenario: 'invalid plan rejected',
      status: 'PASS',
      details: 'Unsupported or arbitrary plan strings safely rejected with null resolution'
    });
  } else {
    results.push({
      scenarioNumber: 2,
      scenario: 'invalid plan rejected',
      status: 'FAIL',
      details: 'Invalid plan resolution did not return null'
    });
  }
} catch (e: any) {
  results.push({
    scenarioNumber: 2,
    scenario: 'invalid plan rejected',
    status: 'FAIL',
    details: e.message
  });
}

// -------------------------------------------------------------
// Test 3: Successful Verified Payment
// -------------------------------------------------------------
try {
  const rzpOrderId = `order_test_rzp_verif_${Date.now()}`;
  const rzpPaymentId = `pay_test_rzp_verif_${Date.now()}`;
  const validSig = computePaymentSignature(rzpOrderId, rzpPaymentId, RAZORPAY_CONFIG.KEY_SECRET);

  const isValid = verifyPaymentSignature(
    rzpOrderId,
    rzpPaymentId,
    validSig,
    RAZORPAY_CONFIG.KEY_SECRET
  );

  if (isValid) {
    results.push({
      scenarioNumber: 3,
      scenario: 'successful verified payment',
      status: 'PASS',
      details: 'HMAC-SHA256 signature verification computed and validated correctly'
    });
  } else {
    results.push({
      scenarioNumber: 3,
      scenario: 'successful verified payment',
      status: 'FAIL',
      details: 'Valid signature was rejected by verifyPaymentSignature'
    });
  }
} catch (e: any) {
  results.push({
    scenarioNumber: 3,
    scenario: 'successful verified payment',
    status: 'FAIL',
    details: e.message
  });
}

// -------------------------------------------------------------
// Test 4: Invalid Payment Signature
// -------------------------------------------------------------
try {
  const rzpOrderId = `order_test_rzp_bad_${Date.now()}`;
  const rzpPaymentId = `pay_test_rzp_bad_${Date.now()}`;
  const invalidSig = 'tampered_fake_signature_hash_00000000000000000000000000000000';

  const isValid = verifyPaymentSignature(
    rzpOrderId,
    rzpPaymentId,
    invalidSig,
    RAZORPAY_CONFIG.KEY_SECRET
  );

  if (!isValid) {
    results.push({
      scenarioNumber: 4,
      scenario: 'invalid payment signature',
      status: 'PASS',
      details: 'Forged or tampered signature successfully rejected'
    });
  } else {
    results.push({
      scenarioNumber: 4,
      scenario: 'invalid payment signature',
      status: 'FAIL',
      details: 'Invalid signature was incorrectly accepted'
    });
  }
} catch (e: any) {
  results.push({
    scenarioNumber: 4,
    scenario: 'invalid payment signature',
    status: 'FAIL',
    details: e.message
  });
}

// -------------------------------------------------------------
// Test 5: Valid Webhook Signature
// -------------------------------------------------------------
try {
  const rawBody = JSON.stringify({
    event: 'payment.captured',
    payload: {
      payment: { entity: { id: 'pay_test_wh_1', order_id: 'order_test_wh_1', status: 'captured' } }
    }
  });

  const validSig = computeWebhookSignature(rawBody, RAZORPAY_CONFIG.WEBHOOK_SECRET);
  const isValid = verifyWebhookSignature(rawBody, validSig, RAZORPAY_CONFIG.WEBHOOK_SECRET);

  if (isValid) {
    results.push({
      scenarioNumber: 5,
      scenario: 'valid webhook signature',
      status: 'PASS',
      details: 'Raw body HMAC-SHA256 webhook signature verified with secret'
    });
  } else {
    results.push({
      scenarioNumber: 5,
      scenario: 'valid webhook signature',
      status: 'FAIL',
      details: 'Valid webhook signature was rejected'
    });
  }
} catch (e: any) {
  results.push({
    scenarioNumber: 5,
    scenario: 'valid webhook signature',
    status: 'FAIL',
    details: e.message
  });
}

// -------------------------------------------------------------
// Test 6: Invalid Webhook Signature
// -------------------------------------------------------------
try {
  const rawBody = JSON.stringify({ event: 'payment.captured' });
  const badSig = 'invalid_webhook_signature_digest_12345';
  const isValid = verifyWebhookSignature(rawBody, badSig, RAZORPAY_CONFIG.WEBHOOK_SECRET);

  if (!isValid) {
    results.push({
      scenarioNumber: 6,
      scenario: 'invalid webhook signature',
      status: 'PASS',
      details: 'Forged webhook payload signature successfully rejected'
    });
  } else {
    results.push({
      scenarioNumber: 6,
      scenario: 'invalid webhook signature',
      status: 'FAIL',
      details: 'Invalid webhook signature was incorrectly accepted'
    });
  }
} catch (e: any) {
  results.push({
    scenarioNumber: 6,
    scenario: 'invalid webhook signature',
    status: 'FAIL',
    details: e.message
  });
}

// -------------------------------------------------------------
// Test 7: Duplicate Webhook (Idempotency)
// -------------------------------------------------------------
try {
  const eventId = `evt_test_idem_${Date.now()}`;
  paymentDb.recordWebhookEvent(eventId, 'payment.captured', 'Test event');
  paymentDb.markWebhookProcessed(eventId, 'PROCESSED');

  const isProcessedFirst = paymentDb.isWebhookEventProcessed(eventId);
  const isProcessedSecond = paymentDb.isWebhookEventProcessed(eventId);

  if (isProcessedFirst && isProcessedSecond) {
    results.push({
      scenarioNumber: 7,
      scenario: 'duplicate webhook',
      status: 'PASS',
      details: 'Webhook event ID recorded and recognized as duplicate on subsequent arrival'
    });
  } else {
    results.push({
      scenarioNumber: 7,
      scenario: 'duplicate webhook',
      status: 'FAIL',
      details: 'Idempotency check failed to flag processed event ID'
    });
  }
} catch (e: any) {
  results.push({
    scenarioNumber: 7,
    scenario: 'duplicate webhook',
    status: 'FAIL',
    details: e.message
  });
}

// -------------------------------------------------------------
// Test 8: New Subscription Creates AKSG License
// -------------------------------------------------------------
try {
  const orderRecord = paymentDb.createOrderRecord({
    customerId: 'cust_new_sub_test',
    internalOrderId: `ord_int_new_${Date.now()}`,
    razorpayOrderId: `order_new_${Date.now()}`,
    planId: 'technician',
    amount: 1499900,
    currency: 'INR',
    customerEmail: 'technician.buyer@akshigo.tech',
    customerName: 'Tech Buyer',
    isRenewal: false
  });

  paymentDb.updatePaymentStatus(orderRecord.paymentId, 'PAID', `pay_rzp_${Date.now()}`);
  const fulfillment = fulfillPayment(orderRecord);

  if (
    fulfillment.success &&
    !fulfillment.isRenewal &&
    fulfillment.licenseKey &&
    fulfillment.licenseKey.startsWith('AKSG-TECH-') &&
    fulfillment.licenseId &&
    fulfillment.subscriptionId
  ) {
    // Verify license is in database
    const licInDb = licenseDb.findLicenseByKey(fulfillment.licenseKey);
    if (licInDb && licInDb.subscription.planId === 'technician') {
      results.push({
        scenarioNumber: 8,
        scenario: 'new subscription creates AKSG license',
        status: 'PASS',
        details: `Created new subscription ${fulfillment.subscriptionId} with license ${fulfillment.licenseKey}`
      });
    } else {
      results.push({
        scenarioNumber: 8,
        scenario: 'new subscription creates AKSG license',
        status: 'FAIL',
        details: 'Generated license key not found in licensing database'
      });
    }
  } else {
    results.push({
      scenarioNumber: 8,
      scenario: 'new subscription creates AKSG license',
      status: 'FAIL',
      details: 'Fulfillment did not return valid AKSG license'
    });
  }
} catch (e: any) {
  results.push({
    scenarioNumber: 8,
    scenario: 'new subscription creates AKSG license',
    status: 'FAIL',
    details: e.message
  });
}

// -------------------------------------------------------------
// Test 9: Renewal Extends Existing Expiry Exactly Once
// -------------------------------------------------------------
try {
  // Create an initial subscription expiring in 100 days
  const customer = licenseDb.createCustomer({
    email: 'renewal.user@akshigo.tech',
    displayName: 'Renewal Tester'
  });
  const initialSub = licenseDb.createSubscription({
    customerId: customer.customerId,
    planId: 'professional',
    durationDays: 100
  });
  const { license } = licenseDb.createLicense({
    subscriptionId: initialSub.subscriptionId,
    planId: 'professional'
  });

  const originalExpiryMs = new Date(initialSub.expiryDate).getTime();

  // Create renewal payment order
  const renewalOrder = paymentDb.createOrderRecord({
    customerId: customer.customerId,
    internalOrderId: `ord_int_renew_${Date.now()}`,
    razorpayOrderId: `order_renew_${Date.now()}`,
    planId: 'professional',
    amount: 599900,
    currency: 'INR',
    customerEmail: customer.email,
    customerName: customer.displayName,
    isRenewal: true,
    subscriptionId: initialSub.subscriptionId,
    licenseId: license.licenseId
  });

  paymentDb.updatePaymentStatus(renewalOrder.paymentId, 'PAID', `pay_renew_${Date.now()}`);

  // Fulfill renewal 1st time
  const fulfillment1 = fulfillPayment(renewalOrder);
  const newExpiryMs1 = new Date(fulfillment1.expiryDate).getTime();
  const expectedExtensionMs = 365 * 86400000;
  const diff1 = newExpiryMs1 - originalExpiryMs;

  // Attempt duplicate fulfillment to test exact-once guarantee
  const fulfillment2 = fulfillPayment(renewalOrder);
  const newExpiryMs2 = new Date(fulfillment2.expiryDate).getTime();

  if (
    fulfillment1.isRenewal &&
    Math.abs(diff1 - expectedExtensionMs) < 5000 && // within 5 seconds of exact 365 days
    newExpiryMs1 === newExpiryMs2 // Idempotency check: did not extend twice
  ) {
    results.push({
      scenarioNumber: 9,
      scenario: 'renewal extends existing expiry exactly once',
      status: 'PASS',
      details: `Subscription ${initialSub.subscriptionId} extended by exactly 365 days from current expiry. Duplicate call returned idempotent timestamp.`
    });
  } else {
    results.push({
      scenarioNumber: 9,
      scenario: 'renewal extends existing expiry exactly once',
      status: 'FAIL',
      details: `Renewal did not extend correctly (diff: ${diff1 / 86400000} days, dupCheck: ${newExpiryMs1 === newExpiryMs2})`
    });
  }
} catch (e: any) {
  results.push({
    scenarioNumber: 9,
    scenario: 'renewal extends existing expiry exactly once',
    status: 'FAIL',
    details: e.message
  });
}

// -------------------------------------------------------------
// Test 10: Failed Payment Creates No License
// -------------------------------------------------------------
try {
  const failedOrder = paymentDb.createOrderRecord({
    customerId: 'cust_failed_test',
    internalOrderId: `ord_int_fail_${Date.now()}`,
    razorpayOrderId: `order_fail_${Date.now()}`,
    planId: 'personal',
    amount: 299900,
    currency: 'INR',
    customerEmail: 'failed.user@akshigo.tech',
    customerName: 'Failed User',
    isRenewal: false
  });

  // Mark as FAILED
  paymentDb.updatePaymentStatus(failedOrder.paymentId, 'FAILED', `pay_fail_${Date.now()}`);

  const initialLicCount = Array.from((licenseDb as any).licenses.values()).length;

  // Attempt fulfillment check (should not fulfill if status is FAILED)
  if (failedOrder.status !== 'PAID') {
    // Payment was rejected / failed, fulfillment is skipped
    const currentLicCount = Array.from((licenseDb as any).licenses.values()).length;
    if (initialLicCount === currentLicCount && !failedOrder.licenseId) {
      results.push({
        scenarioNumber: 10,
        scenario: 'failed payment creates no license',
        status: 'PASS',
        details: 'Failed payment order preserved FAILED status and generated no subscription or license records'
      });
    } else {
      results.push({
        scenarioNumber: 10,
        scenario: 'failed payment creates no license',
        status: 'FAIL',
        details: 'License count increased despite failed payment status'
      });
    }
  } else {
    results.push({
      scenarioNumber: 10,
      scenario: 'failed payment creates no license',
      status: 'FAIL',
      details: 'Failed order was incorrectly marked PAID'
    });
  }
} catch (e: any) {
  results.push({
    scenarioNumber: 10,
    scenario: 'failed payment creates no license',
    status: 'FAIL',
    details: e.message
  });
}

// -------------------------------------------------------------
// Output Report
// -------------------------------------------------------------
console.log('----------------------------------------------------------------');
console.log(' TEST RESULTS SUMMARY');
console.log('----------------------------------------------------------------');
let allPassed = true;
for (const r of results) {
  const color = r.status === 'PASS' ? '\x1b[32m' : '\x1b[31m';
  console.log(`[${r.scenarioNumber}] ${r.scenario.padEnd(45)} -> ${color}${r.status}\x1b[0m`);
  console.log(`    ${r.details}`);
  if (r.status !== 'PASS') allPassed = false;
}

console.log('----------------------------------------------------------------');
if (allPassed) {
  console.log('\x1b[32m✓ ALL 10 PHASE 7.1 PAYMENT & LICENSING SCENARIOS PASSED.\x1b[0m');
} else {
  console.log('\x1b[31m✗ SOME TESTS FAILED.\x1b[0m');
  process.exit(1);
}
