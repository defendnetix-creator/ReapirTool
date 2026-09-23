import { Router, Request, Response, NextFunction } from 'express';
import { resolvePlanTier, SERVER_PLAN_PRICING, RAZORPAY_CONFIG } from './config.js';
import { paymentDb } from './database.js';
import { verifyPaymentSignature, verifyWebhookSignature } from './crypto.js';
import { fulfillPayment } from './fulfillment.js';
import { licenseDb } from '../licensing/database.js';
import { emailService } from '../email/service.js';
import crypto from 'crypto';

export const paymentsRouter = Router();

// In-memory rate limiter
const ipRequestCounts = new Map<string, { count: number; resetAt: number }>();
function rateLimiter(limit: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const now = Date.now();
    const entry = ipRequestCounts.get(ip);

    if (!entry || now > entry.resetAt) {
      ipRequestCounts.set(ip, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (entry.count >= limit) {
      return res.status(429).json({
        success: false,
        error: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please try again shortly.'
      });
    }

    entry.count++;
    next();
  };
}

/**
 * GET /api/v1/payments/plans
 * Public catalog of available subscription plans with authoritative server prices in INR.
 */
paymentsRouter.get('/plans', (_req: Request, res: Response) => {
  res.json({
    success: true,
    paymentMode: RAZORPAY_CONFIG.MODE.toUpperCase(),
    currency: 'INR',
    termDays: 365,
    plans: Object.values(SERVER_PLAN_PRICING).map((p) => ({
      planId: p.planId,
      displayName: p.displayName,
      amountPaise: p.amountPaise,
      amountRupees: p.amountPaise / 100,
      formattedPrice: `₹${(p.amountPaise / 100).toLocaleString('en-IN')}`,
      maxDevices: p.maxDevices
    }))
  });
});

/**
 * POST /api/v1/payments/orders
 * Create a new Razorpay order based strictly on server-side plan pricing.
 */
paymentsRouter.post(
  '/orders',
  rateLimiter(30, 60000),
  (req: Request, res: Response) => {
    try {
      const { plan, planId, email, name, customerId, subscriptionId, licenseId } = req.body || {};

      // 1. Validate plan SKU
      const requestedPlan = plan || planId;
      const planTier = resolvePlanTier(requestedPlan);

      if (!planTier) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_PLAN',
          message: `Requested plan '${requestedPlan}' is invalid or unsupported. Valid plans: PERSONAL, PROFESSIONAL, TECHNICIAN, BUSINESS.`
        });
      }

      // 2. Read authoritative server-side price (never trust client amounts)
      const planConfig = SERVER_PLAN_PRICING[planTier];
      const amount = planConfig.amountPaise;
      const currency = planConfig.currency;

      // 3. Resolve customer information
      const customerEmail = (email || 'customer@akshigo.tech').trim().toLowerCase();
      const customerName = (name || customerEmail.split('@')[0]).trim();
      let resolvedCustomerId = customerId;

      if (!resolvedCustomerId) {
        const existingCust = licenseDb.findCustomerByEmail(customerEmail);
        resolvedCustomerId = existingCust ? existingCust.customerId : `cust_${Math.random().toString(36).substring(2, 10)}`;
      }

      // 4. Determine if renewal
      let isRenewal = false;
      let targetSubId = subscriptionId;
      let targetLicId = licenseId;

      if (targetSubId) {
        const existingSub = licenseDb.findSubscriptionById(targetSubId);
        if (existingSub) isRenewal = true;
      } else if (targetLicId) {
        const existingLic = licenseDb.getLicenseById(targetLicId);
        if (existingLic) {
          isRenewal = true;
          targetSubId = existingLic.subscription.subscriptionId;
        }
      }

      // 5. Generate internal and Razorpay order IDs
      const timestamp = Date.now();
      const randomSuffix = crypto.randomBytes(4).toString('hex');
      const internalOrderId = `ord_int_${timestamp}_${randomSuffix}`;
      const razorpayOrderId = `order_${randomSuffix}${Math.random().toString(36).substring(2, 8)}`;

      // 6. Create internal payment/order record
      paymentDb.createOrderRecord({
        customerId: resolvedCustomerId,
        internalOrderId,
        razorpayOrderId,
        planId: planTier,
        amount,
        currency,
        customerEmail,
        customerName,
        isRenewal,
        subscriptionId: targetSubId,
        licenseId: targetLicId,
        notes: {
          plan: planTier,
          term: '365_days',
          source: 'akshigo_backend_v8'
        }
      });

      // 7. Return safe checkout payload
      return res.status(201).json({
        success: true,
        internalOrderId,
        razorpayOrderId,
        amount,
        currency,
        keyId: RAZORPAY_CONFIG.KEY_ID,
        planId: planTier,
        planName: planConfig.displayName,
        paymentMode: 'TEST'
      });
    } catch (err: any) {
      console.error('[Payments] Error creating order:', err);
      return res.status(500).json({
        success: false,
        error: 'ORDER_CREATION_FAILED',
        message: 'Internal server error while creating payment order.'
      });
    }
  }
);

/**
 * POST /api/v1/payments/verify
 * Server-side verification of payment signature and immediate fulfillment.
 */
paymentsRouter.post(
  '/verify',
  rateLimiter(30, 60000),
  (req: Request, res: Response) => {
    try {
      const {
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
        internal_order_id
      } = req.body || {};

      if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
        return res.status(400).json({
          success: false,
          error: 'MISSING_PAYMENT_CREDENTIALS',
          message: 'razorpay_payment_id, razorpay_order_id, and razorpay_signature are all required.'
        });
      }

      // Look up authoritative order record
      let paymentRecord = paymentDb.getOrderByRazorpayId(razorpay_order_id);
      if (!paymentRecord && internal_order_id) {
        paymentRecord = paymentDb.getOrderByInternalId(internal_order_id);
      }

      if (!paymentRecord) {
        return res.status(404).json({
          success: false,
          error: 'ORDER_NOT_FOUND',
          message: `No payment order record found matching order ID '${razorpay_order_id}'.`
        });
      }

      // Verify signature server-side
      const isValid = verifyPaymentSignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      );

      if (!isValid) {
        paymentDb.updatePaymentStatus(paymentRecord.paymentId, 'FAILED', razorpay_payment_id);
        return res.status(400).json({
          success: false,
          error: 'INVALID_SIGNATURE',
          message: 'Payment verification failed: cryptographic signature mismatch.'
        });
      }

      // Mark payment as PAID
      paymentDb.updatePaymentStatus(paymentRecord.paymentId, 'PAID', razorpay_payment_id);

      // Fulfill payment (create AKSG license or extend subscription)
      const fulfillment = fulfillPayment(paymentRecord);

      return res.json({
        success: true,
        message: 'Payment successfully verified and fulfilled.',
        paymentId: paymentRecord.paymentId,
        status: 'PAID',
        fulfillment
      });
    } catch (err: any) {
      console.error('[Payments] Error verifying payment:', err);
      return res.status(500).json({
        success: false,
        error: 'VERIFICATION_ERROR',
        message: 'Internal error occurred during payment verification.'
      });
    }
  }
);

/**
 * POST /api/v1/payments/webhook
 * Razorpay Webhook Handler with raw body HMAC-SHA256 signature verification & event idempotency.
 */
paymentsRouter.post('/webhook', (req: Request, res: Response) => {
  try {
    const signature = (
      req.headers['x-razorpay-signature'] ||
      req.headers['X-Razorpay-Signature']
    ) as string;

    const eventIdHeader = (
      req.headers['x-razorpay-event-id'] ||
      req.headers['X-Razorpay-Event-Id']
    ) as string;

    if (!signature) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_WEBHOOK_SIGNATURE',
        message: 'X-Razorpay-Signature header is missing.'
      });
    }

    // Capture raw body
    const rawBody: Buffer | string = (req as any).rawBody || (typeof req.body === 'string' ? req.body : JSON.stringify(req.body));

    // Verify webhook signature with RAW body
    const isValid = verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_WEBHOOK_SIGNATURE',
        message: 'Webhook signature validation failed.'
      });
    }

    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const eventId = eventIdHeader || payload.event_id || payload.id || `evt_${Date.now()}`;
    const eventType = payload.event || payload.type || 'unknown';

    // Idempotency check: if event was already processed, acknowledge without re-processing
    if (paymentDb.isWebhookEventProcessed(eventId)) {
      return res.status(200).json({
        status: 'ok',
        message: 'Event already processed (Idempotent response).',
        eventId
      });
    }

    // Record incoming webhook event
    paymentDb.recordWebhookEvent(eventId, eventType, JSON.stringify(payload).substring(0, 300));

    // Process event types
    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      const paymentEntity = payload.payload?.payment?.entity || payload.payment || {};
      const orderEntity = payload.payload?.order?.entity || payload.order || {};
      const razorpayOrderId = paymentEntity.order_id || orderEntity.id;
      const razorpayPaymentId = paymentEntity.id;

      if (razorpayOrderId) {
        const paymentRecord = paymentDb.getOrderByRazorpayId(razorpayOrderId);
        if (paymentRecord) {
          paymentDb.updatePaymentStatus(paymentRecord.paymentId, 'PAID', razorpayPaymentId);
          fulfillPayment(paymentRecord);
        }
      }
    } else if (eventType === 'payment.failed') {
      const paymentEntity = payload.payload?.payment?.entity || payload.payment || {};
      const razorpayOrderId = paymentEntity.order_id;
      const razorpayPaymentId = paymentEntity.id;

      if (razorpayOrderId) {
        const paymentRecord = paymentDb.getOrderByRazorpayId(razorpayOrderId);
        if (paymentRecord) {
          paymentDb.updatePaymentStatus(paymentRecord.paymentId, 'FAILED', razorpayPaymentId);
        }
      }
    }

    // Mark event as processed
    paymentDb.markWebhookProcessed(eventId, 'PROCESSED');

    return res.status(200).json({
      status: 'ok',
      received: true,
      eventId
    });
  } catch (err: any) {
    console.error('[Payments] Webhook processing error:', err);
    return res.status(500).json({
      success: false,
      error: 'WEBHOOK_PROCESSING_FAILED',
      message: 'Failed to process webhook.'
    });
  }
});

/**
 * POST /api/v1/payments/email/retry
 * Retries a failed or pending transactional email for a verified payment.
 */
paymentsRouter.post(
  '/email/retry',
  rateLimiter(10, 60000),
  async (req: Request, res: Response) => {
    try {
      const { paymentId, razorpayOrderId } = req.body || {};
      let targetPaymentId = paymentId;

      if (!targetPaymentId && razorpayOrderId) {
        const payment = paymentDb.getOrderByRazorpayId(razorpayOrderId);
        if (payment) targetPaymentId = payment.paymentId;
      }

      if (!targetPaymentId) {
        return res.status(400).json({
          success: false,
          error: 'MISSING_PAYMENT_ID',
          message: 'paymentId or razorpayOrderId is required to retry email delivery.'
        });
      }

      const payment = paymentDb.getPaymentById(targetPaymentId);
      if (!payment || payment.status !== 'PAID') {
        return res.status(400).json({
          success: false,
          error: 'INVALID_PAYMENT_STATE',
          message: 'Can only retry emails for paid and verified orders.'
        });
      }

      const retryResult = await emailService.retryFailedEmail(targetPaymentId);
      if (retryResult.success) {
        paymentDb.updatePaymentEmailStatus(targetPaymentId, retryResult.deliveryStatus, retryResult.messageId);
        return res.json({
          success: true,
          message: 'Email retry succeeded.',
          deliveryStatus: retryResult.deliveryStatus,
          messageId: retryResult.messageId,
          attemptCount: retryResult.attemptCount
        });
      } else {
        paymentDb.updatePaymentEmailStatus(targetPaymentId, 'FAILED');
        return res.status(502).json({
          success: false,
          error: 'EMAIL_RETRY_FAILED',
          message: retryResult.error || 'Failed to deliver email on retry.',
          attemptCount: retryResult.attemptCount
        });
      }
    } catch (err: any) {
      console.error('[Payments] Error retrying email:', err);
      return res.status(500).json({
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'Internal error processing email retry.'
      });
    }
  }
);

