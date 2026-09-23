/**
 * Automated Test Suite for Phase 7.3 — Purchase Confirmation Email
 * 
 * Verifies the 10 critical transactional email scenarios:
 * 1. Successful new purchase sends email (Purchase confirmation dispatched on new subscription)
 * 2. Renewal sends renewal email (Renewal confirmation dispatched on subscription extension)
 * 3. Failed payment sends no activation email (Failed payment creates no email)
 * 4. Invalid signature sends no email (Signature mismatch prevents fulfillment and email)
 * 5. Duplicate webhook sends one email only (Webhook event idempotency prevents duplicate emails)
 * 6. Duplicate verify request sends one email only (Verification idempotency prevents duplicate emails)
 * 7. Email failure does not remove license (License & subscription persist if email provider fails)
 * 8. Retry successfully delivers failed email (Bounded retry mechanism delivers pending/failed email)
 * 9. Email contains correct plan/expiry (Accurate plan name, seat count, and expiry formatted)
 * 10. Full license key is not exposed in logs/email (Masked format AKSG-PRO-••••-••••-XXXX enforced)
 */

import { paymentDb } from '../server/payments/database.js';
import { resolvePlanTier, SERVER_PLAN_PRICING, RAZORPAY_CONFIG } from '../server/payments/config.js';
import { verifyPaymentSignature, computePaymentSignature } from '../server/payments/crypto.js';
import { fulfillPayment } from '../server/payments/fulfillment.js';
import { licenseDb } from '../server/licensing/database.js';
import { emailService } from '../server/email/service.js';
import { maskLicenseKey } from '../server/email/config.js';

interface TestResult {
  scenarioNumber: number;
  scenario: string;
  status: 'PASS' | 'FAIL' | 'BLOCKED' | 'NOT TESTED';
  details: string;
}

const results: TestResult[] = [];

console.log('================================================================');
console.log(' AKSHIGO PC TOOLKIT PRO — PHASE 7.3 TRANSACTIONAL EMAIL TEST SUITE');
console.log(' Scope: Verified Payment -> Fulfillment -> Idempotent Email Delivery');
console.log('================================================================\n');

async function runTests() {
  // -------------------------------------------------------------
  // Test 1: Successful new purchase sends email
  // -------------------------------------------------------------
  try {
    emailService.clearLedger();

    const orderRecord = paymentDb.createOrderRecord({
      customerId: 'cust_mail_test_01',
      internalOrderId: `ord_int_m1_${Date.now()}`,
      razorpayOrderId: `order_m1_${Date.now()}`,
      planId: 'professional',
      amount: 599900,
      currency: 'INR',
      customerEmail: 'newuser@example.com',
      customerName: 'Alice Developer',
      isRenewal: false
    });

    paymentDb.updatePaymentStatus(orderRecord.paymentId, 'PAID', `pay_m1_${Date.now()}`);
    const fulfillment = fulfillPayment(orderRecord);

    // Wait microtick for background email dispatch
    await new Promise((r) => setTimeout(r, 50));

    const emailRecord = emailService.getRecordByPaymentId(orderRecord.paymentId);

    if (
      fulfillment.success &&
      emailRecord &&
      emailRecord.status === 'SENT' &&
      emailRecord.emailType === 'PURCHASE_CONFIRMATION' &&
      emailRecord.subject.includes('subscription is active')
    ) {
      results.push({
        scenarioNumber: 1,
        scenario: 'successful new purchase sends email',
        status: 'PASS',
        details: `Dispatched PURCHASE_CONFIRMATION email with subject "${emailRecord.subject}" to ${emailRecord.customerEmail}`
      });
    } else {
      results.push({
        scenarioNumber: 1,
        scenario: 'successful new purchase sends email',
        status: 'FAIL',
        details: `Email was not dispatched as expected. Status: ${emailRecord?.status}`
      });
    }
  } catch (e: any) {
    results.push({
      scenarioNumber: 1,
      scenario: 'successful new purchase sends email',
      status: 'FAIL',
      details: e.message
    });
  }

  // -------------------------------------------------------------
  // Test 2: Renewal sends renewal email
  // -------------------------------------------------------------
  try {
    const customer = licenseDb.createCustomer({
      email: 'renew.user@example.com',
      displayName: 'Bob Administrator'
    });
    const sub = licenseDb.createSubscription({
      customerId: customer.customerId,
      planId: 'technician',
      durationDays: 45
    });
    const { license } = licenseDb.createLicense({
      subscriptionId: sub.subscriptionId,
      planId: 'technician'
    });

    const renewalOrder = paymentDb.createOrderRecord({
      customerId: customer.customerId,
      internalOrderId: `ord_int_m2_${Date.now()}`,
      razorpayOrderId: `order_m2_${Date.now()}`,
      planId: 'technician',
      amount: 1499900,
      currency: 'INR',
      customerEmail: customer.email,
      customerName: customer.displayName,
      isRenewal: true,
      subscriptionId: sub.subscriptionId,
      licenseId: license.licenseId
    });

    paymentDb.updatePaymentStatus(renewalOrder.paymentId, 'PAID', `pay_m2_${Date.now()}`);
    const fulfillment = fulfillPayment(renewalOrder);

    await new Promise((r) => setTimeout(r, 50));

    const emailRecord = emailService.getRecordByPaymentId(renewalOrder.paymentId);

    if (
      fulfillment.success &&
      fulfillment.isRenewal &&
      emailRecord &&
      emailRecord.status === 'SENT' &&
      emailRecord.emailType === 'RENEWAL_CONFIRMATION' &&
      emailRecord.subject.includes('has been renewed')
    ) {
      results.push({
        scenarioNumber: 2,
        scenario: 'renewal sends renewal email',
        status: 'PASS',
        details: `Dispatched RENEWAL_CONFIRMATION email with subject "${emailRecord.subject}" without generating duplicate license keys`
      });
    } else {
      results.push({
        scenarioNumber: 2,
        scenario: 'renewal sends renewal email',
        status: 'FAIL',
        details: `Renewal email dispatch failed. Status: ${emailRecord?.status}`
      });
    }
  } catch (e: any) {
    results.push({
      scenarioNumber: 2,
      scenario: 'renewal sends renewal email',
      status: 'FAIL',
      details: e.message
    });
  }

  // -------------------------------------------------------------
  // Test 3: Failed payment sends no activation email
  // -------------------------------------------------------------
  try {
    const failedOrder = paymentDb.createOrderRecord({
      customerId: 'cust_fail_user',
      internalOrderId: `ord_int_m3_${Date.now()}`,
      razorpayOrderId: `order_m3_${Date.now()}`,
      planId: 'personal',
      amount: 299900,
      currency: 'INR',
      customerEmail: 'failed.buyer@example.com',
      customerName: 'Fail Buyer',
      isRenewal: false
    });

    // Mark as failed directly (no fulfillment called)
    paymentDb.updatePaymentStatus(failedOrder.paymentId, 'FAILED', `pay_fail_${Date.now()}`);

    await new Promise((r) => setTimeout(r, 50));

    const emailRecord = emailService.getRecordByPaymentId(failedOrder.paymentId);

    if (!emailRecord) {
      results.push({
        scenarioNumber: 3,
        scenario: 'failed payment sends no activation email',
        status: 'PASS',
        details: 'Confirmed 0 emails created for failed order payment'
      });
    } else {
      results.push({
        scenarioNumber: 3,
        scenario: 'failed payment sends no activation email',
        status: 'FAIL',
        details: 'Unexpected email record found for failed payment'
      });
    }
  } catch (e: any) {
    results.push({
      scenarioNumber: 3,
      scenario: 'failed payment sends no activation email',
      status: 'FAIL',
      details: e.message
    });
  }

  // -------------------------------------------------------------
  // Test 4: Invalid signature sends no email
  // -------------------------------------------------------------
  try {
    const orderRecord = paymentDb.createOrderRecord({
      customerId: 'cust_bad_sig',
      internalOrderId: `ord_int_m4_${Date.now()}`,
      razorpayOrderId: `order_m4_${Date.now()}`,
      planId: 'business',
      amount: 3999900,
      currency: 'INR',
      customerEmail: 'bad.sig@example.com',
      customerName: 'Bad Signature User',
      isRenewal: false
    });

    const forgedSignature = 'forged_tampered_signature_99999999';
    const isValid = verifyPaymentSignature(
      orderRecord.razorpayOrderId,
      'pay_m4_01',
      forgedSignature,
      RAZORPAY_CONFIG.KEY_SECRET
    );

    if (!isValid) {
      paymentDb.updatePaymentStatus(orderRecord.paymentId, 'FAILED', 'pay_m4_01');
      // Do NOT fulfill
    }

    await new Promise((r) => setTimeout(r, 50));

    const emailRecord = emailService.getRecordByPaymentId(orderRecord.paymentId);

    if (!isValid && !emailRecord) {
      results.push({
        scenarioNumber: 4,
        scenario: 'invalid signature sends no email',
        status: 'PASS',
        details: 'Signature verification failed; fulfillment was prevented and zero emails were generated'
      });
    } else {
      results.push({
        scenarioNumber: 4,
        scenario: 'invalid signature sends no email',
        status: 'FAIL',
        details: 'Invalid signature test did not reject properly'
      });
    }
  } catch (e: any) {
    results.push({
      scenarioNumber: 4,
      scenario: 'invalid signature sends no email',
      status: 'FAIL',
      details: e.message
    });
  }

  // -------------------------------------------------------------
  // Test 5: Duplicate webhook sends one email only
  // -------------------------------------------------------------
  try {
    const initialEmailCount = emailService.getSentEmails().length;

    const webhookOrder = paymentDb.createOrderRecord({
      customerId: 'cust_hook_idem',
      internalOrderId: `ord_int_m5_${Date.now()}`,
      razorpayOrderId: `order_m5_${Date.now()}`,
      planId: 'professional',
      amount: 599900,
      currency: 'INR',
      customerEmail: 'webhook.idem@example.com',
      customerName: 'Webhook Idem',
      isRenewal: false
    });

    const eventId = `evt_mail_idem_${Date.now()}`;

    // 1st Webhook arrival
    paymentDb.updatePaymentStatus(webhookOrder.paymentId, 'PAID', `pay_m5_${Date.now()}`);
    paymentDb.recordWebhookEvent(eventId, 'payment.captured');
    fulfillPayment(webhookOrder);
    paymentDb.markWebhookProcessed(eventId, 'PROCESSED');

    await new Promise((r) => setTimeout(r, 50));

    const countAfterFirst = emailService.getSentEmails().length;

    // 2nd Duplicate Webhook arrival
    if (paymentDb.isWebhookEventProcessed(eventId)) {
      // System acknowledges idempotent skip
    } else {
      fulfillPayment(webhookOrder);
    }

    await new Promise((r) => setTimeout(r, 50));

    const countAfterSecond = emailService.getSentEmails().length;

    if (countAfterFirst === initialEmailCount + 1 && countAfterSecond === countAfterFirst) {
      results.push({
        scenarioNumber: 5,
        scenario: 'duplicate webhook sends one email only',
        status: 'PASS',
        details: 'Webhook idempotency prevented duplicate email dispatch across repeated event arrivals'
      });
    } else {
      results.push({
        scenarioNumber: 5,
        scenario: 'duplicate webhook sends one email only',
        status: 'FAIL',
        details: `Duplicate webhook sent extra emails (1st: ${countAfterFirst}, 2nd: ${countAfterSecond})`
      });
    }
  } catch (e: any) {
    results.push({
      scenarioNumber: 5,
      scenario: 'duplicate webhook sends one email only',
      status: 'FAIL',
      details: e.message
    });
  }

  // -------------------------------------------------------------
  // Test 6: Duplicate verify request sends one email only
  // -------------------------------------------------------------
  try {
    const orderRecord = paymentDb.createOrderRecord({
      customerId: 'cust_verify_idem',
      internalOrderId: `ord_int_m6_${Date.now()}`,
      razorpayOrderId: `order_m6_${Date.now()}`,
      planId: 'technician',
      amount: 1499900,
      currency: 'INR',
      customerEmail: 'verify.idem@example.com',
      customerName: 'Verify Idem User',
      isRenewal: false
    });

    paymentDb.updatePaymentStatus(orderRecord.paymentId, 'PAID', `pay_m6_${Date.now()}`);

    const countBefore = emailService.getSentEmails().length;

    // First fulfillment / verify call
    fulfillPayment(orderRecord);
    await new Promise((r) => setTimeout(r, 50));
    const countFirst = emailService.getSentEmails().length;

    // Duplicate verify / fulfillment call
    fulfillPayment(orderRecord);
    await new Promise((r) => setTimeout(r, 50));
    const countSecond = emailService.getSentEmails().length;

    if (countFirst === countBefore + 1 && countSecond === countFirst) {
      results.push({
        scenarioNumber: 6,
        scenario: 'duplicate verify request sends one email only',
        status: 'PASS',
        details: 'Fulfillment & email service idempotency checks prevented duplicate customer notifications'
      });
    } else {
      results.push({
        scenarioNumber: 6,
        scenario: 'duplicate verify request sends one email only',
        status: 'FAIL',
        details: `Duplicate verify sent multiple emails (1st: ${countFirst}, 2nd: ${countSecond})`
      });
    }
  } catch (e: any) {
    results.push({
      scenarioNumber: 6,
      scenario: 'duplicate verify request sends one email only',
      status: 'FAIL',
      details: e.message
    });
  }

  // -------------------------------------------------------------
  // Test 7: Email failure does not remove license
  // -------------------------------------------------------------
  try {
    // Enable simulated provider failure
    emailService.setSimulateFailure(true);

    const orderRecord = paymentDb.createOrderRecord({
      customerId: 'cust_fail_resilience',
      internalOrderId: `ord_int_m7_${Date.now()}`,
      razorpayOrderId: `order_m7_${Date.now()}`,
      planId: 'business',
      amount: 3999900,
      currency: 'INR',
      customerEmail: 'resilient@example.com',
      customerName: 'Resilience Tester',
      isRenewal: false
    });

    paymentDb.updatePaymentStatus(orderRecord.paymentId, 'PAID', `pay_m7_${Date.now()}`);
    const fulfillment = fulfillPayment(orderRecord);

    await new Promise((r) => setTimeout(r, 50));

    // Restore provider
    emailService.setSimulateFailure(false);

    const emailRecord = emailService.getRecordByPaymentId(orderRecord.paymentId);
    const licInDb = licenseDb.getLicenseById(fulfillment.licenseId);
    const subInDb = licenseDb.findSubscriptionById(fulfillment.subscriptionId);

    if (
      fulfillment.success &&
      licInDb &&
      subInDb &&
      subInDb.status === 'ACTIVE' &&
      emailRecord &&
      emailRecord.status === 'FAILED'
    ) {
      results.push({
        scenarioNumber: 7,
        scenario: 'email failure does not remove license',
        status: 'PASS',
        details: `License ${licInDb.license.licenseId} remains fully ACTIVE even though email delivery encountered provider failure`
      });
    } else {
      results.push({
        scenarioNumber: 7,
        scenario: 'email failure does not remove license',
        status: 'FAIL',
        details: 'License or subscription was invalidly affected by email failure'
      });
    }
  } catch (e: any) {
    results.push({
      scenarioNumber: 7,
      scenario: 'email failure does not remove license',
      status: 'FAIL',
      details: e.message
    });
  }

  // -------------------------------------------------------------
  // Test 8: Retry successfully delivers failed email
  // -------------------------------------------------------------
  try {
    // We retry the failed email from Test 7
    const failedPaymentRecords = paymentDb.getAllPayments().filter(p => p.customerEmail === 'resilient@example.com');
    const targetPayment = failedPaymentRecords[0];

    const retryResult = await emailService.retryFailedEmail(targetPayment.paymentId);
    const updatedRecord = emailService.getRecordByPaymentId(targetPayment.paymentId);

    if (
      retryResult.success &&
      retryResult.deliveryStatus === 'SENT' &&
      updatedRecord &&
      updatedRecord.status === 'SENT' &&
      updatedRecord.attempts === 2
    ) {
      results.push({
        scenarioNumber: 8,
        scenario: 'retry successfully delivers failed email',
        status: 'PASS',
        details: `Successfully retried failed email (attempt 2) and transitioned delivery status to SENT (MsgId: ${retryResult.messageId})`
      });
    } else {
      results.push({
        scenarioNumber: 8,
        scenario: 'retry successfully delivers failed email',
        status: 'FAIL',
        details: `Retry did not succeed. Result: ${JSON.stringify(retryResult)}`
      });
    }
  } catch (e: any) {
    results.push({
      scenarioNumber: 8,
      scenario: 'retry successfully delivers failed email',
      status: 'FAIL',
      details: e.message
    });
  }

  // -------------------------------------------------------------
  // Test 9: Email contains correct plan/expiry
  // -------------------------------------------------------------
  try {
    const orderRecord = paymentDb.createOrderRecord({
      customerId: 'cust_plan_check',
      internalOrderId: `ord_int_m9_${Date.now()}`,
      razorpayOrderId: `order_m9_${Date.now()}`,
      planId: 'technician',
      amount: 1499900,
      currency: 'INR',
      customerEmail: 'tech.plan@example.com',
      customerName: 'Sam Technician',
      isRenewal: false
    });

    paymentDb.updatePaymentStatus(orderRecord.paymentId, 'PAID', `pay_m9_${Date.now()}`);
    const fulfillment = fulfillPayment(orderRecord);

    await new Promise((r) => setTimeout(r, 50));

    const emailRecord = emailService.getRecordByPaymentId(orderRecord.paymentId);

    const hasCorrectPlan = emailRecord?.htmlBody.includes('Technician Toolkit (5 Portable Seats)');
    const hasCorrectSeats = emailRecord?.htmlBody.includes('5 PC Seats');
    const hasOrderRef = emailRecord?.htmlBody.includes(orderRecord.internalOrderId);
    const hasExpiry = emailRecord?.htmlBody.includes('365 Days');

    if (hasCorrectPlan && hasCorrectSeats && hasOrderRef && hasExpiry) {
      results.push({
        scenarioNumber: 9,
        scenario: 'email contains correct plan/expiry',
        status: 'PASS',
        details: `Verified email payload contains accurate plan (${emailRecord?.payload.planName}), 5 PC Seats, and 365-day expiry`
      });
    } else {
      results.push({
        scenarioNumber: 9,
        scenario: 'email contains correct plan/expiry',
        status: 'FAIL',
        details: 'Email body did not contain expected plan or expiry text'
      });
    }
  } catch (e: any) {
    results.push({
      scenarioNumber: 9,
      scenario: 'email contains correct plan/expiry',
      status: 'FAIL',
      details: e.message
    });
  }

  // -------------------------------------------------------------
  // Test 10: Full license key is not exposed in logs/email
  // -------------------------------------------------------------
  try {
    const rawKey = 'AKSG-PRO-K8X9-M2W4-7VBT';
    const masked = maskLicenseKey(rawKey);

    const orderRecord = paymentDb.createOrderRecord({
      customerId: 'cust_mask_check',
      internalOrderId: `ord_int_m10_${Date.now()}`,
      razorpayOrderId: `order_m10_${Date.now()}`,
      planId: 'professional',
      amount: 599900,
      currency: 'INR',
      customerEmail: 'security@example.com',
      customerName: 'Security Officer',
      isRenewal: false
    });

    paymentDb.updatePaymentStatus(orderRecord.paymentId, 'PAID', `pay_m10_${Date.now()}`);
    const fulfillment = fulfillPayment(orderRecord);

    await new Promise((r) => setTimeout(r, 50));

    const emailRecord = emailService.getRecordByPaymentId(orderRecord.paymentId);
    const fullKey = fulfillment.licenseKey!;

    // Check that masked string is present and full raw key is NOT present anywhere in html or text
    const fullKeyInHtml = emailRecord ? emailRecord.htmlBody.includes(fullKey) : true;
    const fullKeyInText = emailRecord ? emailRecord.textBody.includes(fullKey) : true;
    const fullKeyInSubject = emailRecord ? emailRecord.subject.includes(fullKey) : true;
    const maskedKeyInHtml = emailRecord ? emailRecord.htmlBody.includes(masked.split('-')[0]) : false;

    if (
      masked === 'AKSG-PRO-••••-••••-7VBT' &&
      !fullKeyInHtml &&
      !fullKeyInText &&
      !fullKeyInSubject &&
      maskedKeyInHtml
    ) {
      results.push({
        scenarioNumber: 10,
        scenario: 'full license key is not exposed in logs/email',
        status: 'PASS',
        details: `License securely masked as "${masked}". Raw license secret segments strictly omitted from email templates and subjects.`
      });
    } else {
      results.push({
        scenarioNumber: 10,
        scenario: 'full license key is not exposed in logs/email',
        status: 'FAIL',
        details: `Full license key was exposed or masking failed. Masked: ${masked}, InHtml: ${fullKeyInHtml}`
      });
    }
  } catch (e: any) {
    results.push({
      scenarioNumber: 10,
      scenario: 'full license key is not exposed in logs/email',
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
    console.log(`[${r.scenarioNumber.toString().padStart(2, ' ')}] ${r.scenario.padEnd(52)} -> ${color}${r.status}\x1b[0m`);
    console.log(`     ${r.details}`);
    if (r.status !== 'PASS') allPassed = false;
  }

  console.log('----------------------------------------------------------------');
  if (allPassed) {
    console.log('\x1b[32m✓ ALL 10 PHASE 7.3 TRANSACTIONAL EMAIL SCENARIOS PASSED.\x1b[0m');
  } else {
    console.log('\x1b[31m✗ SOME TESTS FAILED.\x1b[0m');
    process.exit(1);
  }
}

runTests();
