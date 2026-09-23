import crypto from 'crypto';
import { RAZORPAY_CONFIG } from './config.js';

/**
 * Verify Razorpay Checkout Payment Signature
 * Computes HMAC-SHA256(order_id + "|" + payment_id, secret)
 */
export function verifyPaymentSignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  signature: string,
  secret?: string
): boolean {
  try {
    if (!razorpayOrderId || !razorpayPaymentId || !signature) {
      return false;
    }

    const keySecret = secret || RAZORPAY_CONFIG.KEY_SECRET;
    const payload = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(payload)
      .digest('hex');

    const expectedBuf = Buffer.from(expectedSignature, 'utf8');
    const actualBuf = Buffer.from(signature, 'utf8');

    if (expectedBuf.length !== actualBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuf, actualBuf);
  } catch (err) {
    console.error('[PaymentCrypto] Error verifying payment signature:', err);
    return false;
  }
}

/**
 * Verify Razorpay Webhook Signature
 * Computes HMAC-SHA256(rawBody, webhookSecret)
 */
export function verifyWebhookSignature(
  rawBody: string | Buffer,
  signature: string,
  secret?: string
): boolean {
  try {
    if (!rawBody || !signature) {
      return false;
    }

    const webhookSecret = secret || RAZORPAY_CONFIG.WEBHOOK_SECRET;
    const bodyBuffer = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(rawBody, 'utf8');

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(bodyBuffer)
      .digest('hex');

    const expectedBuf = Buffer.from(expectedSignature, 'utf8');
    const actualBuf = Buffer.from(signature, 'utf8');

    if (expectedBuf.length !== actualBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuf, actualBuf);
  } catch (err) {
    console.error('[PaymentCrypto] Error verifying webhook signature:', err);
    return false;
  }
}

/**
 * Compute payment checkout signature (helper for test suite)
 */
export function computePaymentSignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  secret?: string
): string {
  const keySecret = secret || RAZORPAY_CONFIG.KEY_SECRET;
  const payload = `${razorpayOrderId}|${razorpayPaymentId}`;
  return crypto.createHmac('sha256', keySecret).update(payload).digest('hex');
}

/**
 * Compute webhook signature (helper for test suite)
 */
export function computeWebhookSignature(
  rawBody: string | Buffer,
  secret?: string
): string {
  const webhookSecret = secret || RAZORPAY_CONFIG.WEBHOOK_SECRET;
  const bodyBuffer = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(rawBody, 'utf8');
  return crypto.createHmac('sha256', webhookSecret).update(bodyBuffer).digest('hex');
}
