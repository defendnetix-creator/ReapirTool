import { paymentDb } from './database.js';
import { licenseDb } from '../licensing/database.js';
import { PaymentRecord, FulfillmentResult } from './types.js';
import { emailService } from '../email/service.js';

/**
 * Fulfill a verified, captured payment.
 * Handles both new subscriptions (generating AKSG license) and renewals (extending existing expiry).
 * Idempotent: safe to invoke repeatedly for the same payment.
 * Automatically triggers purchase/renewal confirmation transactional email after successful fulfillment.
 */
export function fulfillPayment(payment: PaymentRecord): FulfillmentResult {
  // Idempotency check: if payment is already fulfilled, return existing details
  if (payment.processedAt && payment.subscriptionId && payment.licenseId) {
    const existingSub = licenseDb.findSubscriptionById(payment.subscriptionId);

    return {
      success: true,
      isRenewal: payment.isRenewal,
      paymentId: payment.paymentId,
      customerId: payment.customerId,
      subscriptionId: payment.subscriptionId,
      licenseId: payment.licenseId,
      expiryDate: existingSub ? existingSub.expiryDate : new Date(Date.now() + 365 * 86400000).toISOString(),
      planId: payment.planId,
      emailStatus: payment.emailStatus,
      message: 'Payment was already fulfilled previously (Idempotent response).'
    };
  }

  // Ensure customer exists or is created
  let customer = licenseDb.findCustomerById(payment.customerId);
  if (!customer) {
    customer = licenseDb.createCustomer({
      email: payment.customerEmail,
      displayName: payment.customerName
    });
  }

  // Renewal flow: if flagged as renewal or subscriptionId/licenseId is attached
  if (payment.isRenewal && (payment.subscriptionId || payment.licenseId)) {
    let renewedSub = null;
    let licenseId = payment.licenseId;
    let prevExpiryDate: string | undefined;

    if (payment.subscriptionId) {
      const existingSub = licenseDb.findSubscriptionById(payment.subscriptionId);
      if (existingSub) prevExpiryDate = existingSub.expiryDate;

      renewedSub = licenseDb.renewSubscriptionBySubscriptionId(payment.subscriptionId, 365);
      if (!licenseId) {
        const foundLic = licenseDb.findLicenseBySubscriptionId(payment.subscriptionId);
        if (foundLic) licenseId = foundLic.licenseId;
      }
    } else if (licenseId) {
      const existingLic = licenseDb.getLicenseById(licenseId);
      if (existingLic) prevExpiryDate = existingLic.subscription.expiryDate;

      renewedSub = licenseDb.renewSubscription(licenseId, 365);
    }

    if (renewedSub && licenseId) {
      paymentDb.attachFulfillmentDetails(payment.paymentId, {
        subscriptionId: renewedSub.subscriptionId,
        licenseId
      });

      // Dispatch confirmation email (idempotent, safe, failure does NOT roll back license/subscription)
      emailService.sendConfirmationEmail(payment, {
        expiryDate: renewedSub.expiryDate,
        previousExpiryDate: prevExpiryDate
      }).then((result) => {
        paymentDb.updatePaymentEmailStatus(payment.paymentId, result.deliveryStatus, result.messageId);
      }).catch((err) => {
        console.error('[Fulfillment] Error dispatching renewal email:', err);
        paymentDb.updatePaymentEmailStatus(payment.paymentId, 'FAILED');
      });

      return {
        success: true,
        isRenewal: true,
        paymentId: payment.paymentId,
        customerId: customer.customerId,
        subscriptionId: renewedSub.subscriptionId,
        licenseId,
        expiryDate: renewedSub.expiryDate,
        planId: payment.planId,
        emailStatus: payment.emailStatus || 'PENDING',
        message: `Subscription successfully renewed. New expiry: ${renewedSub.expiryDate}`
      };
    }
  }

  // New Subscription & License Flow
  const newSub = licenseDb.createSubscription({
    customerId: customer.customerId,
    planId: payment.planId,
    durationDays: 365
  });

  const { license, rawKey } = licenseDb.createLicense({
    subscriptionId: newSub.subscriptionId,
    planId: payment.planId,
    notes: `Issued via Razorpay Payment ${payment.razorpayPaymentId || payment.paymentId}`
  });

  paymentDb.attachFulfillmentDetails(payment.paymentId, {
    subscriptionId: newSub.subscriptionId,
    licenseId: license.licenseId
  });

  // Dispatch confirmation email (idempotent, safe, failure does NOT roll back license/subscription)
  emailService.sendConfirmationEmail(payment, {
    rawLicenseKey: rawKey,
    expiryDate: newSub.expiryDate
  }).then((result) => {
    paymentDb.updatePaymentEmailStatus(payment.paymentId, result.deliveryStatus, result.messageId);
  }).catch((err) => {
    console.error('[Fulfillment] Error dispatching purchase email:', err);
    paymentDb.updatePaymentEmailStatus(payment.paymentId, 'FAILED');
  });

  return {
    success: true,
    isRenewal: false,
    paymentId: payment.paymentId,
    customerId: customer.customerId,
    subscriptionId: newSub.subscriptionId,
    licenseId: license.licenseId,
    licenseKey: rawKey,
    expiryDate: newSub.expiryDate,
    planId: payment.planId,
    emailStatus: payment.emailStatus || 'PENDING',
    message: 'New subscription and AKSG license successfully generated.'
  };
}
