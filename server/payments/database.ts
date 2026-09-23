import { PaymentRecord, WebhookEventRecord, PaymentStatus } from './types.js';
import { SubscriptionTier } from '../licensing/types.js';

class PaymentDatabase {
  private payments: Map<string, PaymentRecord> = new Map(); // key = paymentId
  private internalOrderMap: Map<string, string> = new Map(); // key = internalOrderId -> paymentId
  private razorpayOrderMap: Map<string, string> = new Map(); // key = razorpayOrderId -> paymentId
  private razorpayPaymentMap: Map<string, string> = new Map(); // key = razorpayPaymentId -> paymentId
  private webhookEvents: Map<string, WebhookEventRecord> = new Map(); // key = eventId

  /**
   * Create an initial payment / order record
   */
  public createOrderRecord(params: {
    customerId: string;
    internalOrderId: string;
    razorpayOrderId: string;
    planId: SubscriptionTier;
    amount: number;
    currency: string;
    customerEmail: string;
    customerName: string;
    isRenewal: boolean;
    subscriptionId?: string;
    licenseId?: string;
    notes?: Record<string, string>;
  }): PaymentRecord {
    const paymentId = `pay_rec_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const record: PaymentRecord = {
      paymentId,
      customerId: params.customerId,
      internalOrderId: params.internalOrderId,
      razorpayOrderId: params.razorpayOrderId,
      planId: params.planId,
      amount: params.amount,
      currency: params.currency,
      status: 'CREATED',
      createdAt: new Date().toISOString(),
      isRenewal: params.isRenewal,
      customerEmail: params.customerEmail,
      customerName: params.customerName,
      subscriptionId: params.subscriptionId,
      licenseId: params.licenseId,
      notes: params.notes
    };

    this.payments.set(paymentId, record);
    this.internalOrderMap.set(params.internalOrderId, paymentId);
    this.razorpayOrderMap.set(params.razorpayOrderId, paymentId);

    return record;
  }

  public getPaymentById(paymentId: string): PaymentRecord | null {
    return this.payments.get(paymentId) || null;
  }

  public getOrderByInternalId(internalOrderId: string): PaymentRecord | null {
    const paymentId = this.internalOrderMap.get(internalOrderId);
    if (!paymentId) return null;
    return this.payments.get(paymentId) || null;
  }

  public getOrderByRazorpayId(razorpayOrderId: string): PaymentRecord | null {
    const paymentId = this.razorpayOrderMap.get(razorpayOrderId);
    if (!paymentId) return null;
    return this.payments.get(paymentId) || null;
  }

  public getPaymentByRazorpayPaymentId(razorpayPaymentId: string): PaymentRecord | null {
    const paymentId = this.razorpayPaymentMap.get(razorpayPaymentId);
    if (!paymentId) return null;
    return this.payments.get(paymentId) || null;
  }

  /**
   * Update payment status and associate Razorpay payment ID
   */
  public updatePaymentStatus(
    paymentId: string,
    status: PaymentStatus,
    razorpayPaymentId?: string
  ): PaymentRecord | null {
    const record = this.payments.get(paymentId);
    if (!record) return null;

    record.status = status;
    if (razorpayPaymentId) {
      record.razorpayPaymentId = razorpayPaymentId;
      this.razorpayPaymentMap.set(razorpayPaymentId, paymentId);
    }
    if (status === 'PAID' && !record.paidAt) {
      record.paidAt = new Date().toISOString();
    }
    return record;
  }

  /**
   * Associate fulfillment details with payment record
   */
  public attachFulfillmentDetails(
    paymentId: string,
    details: { subscriptionId: string; licenseId: string }
  ): void {
    const record = this.payments.get(paymentId);
    if (!record) return;

    record.subscriptionId = details.subscriptionId;
    record.licenseId = details.licenseId;
    record.processedAt = new Date().toISOString();
  }

  /**
   * Update transactional email delivery status for a payment
   */
  public updatePaymentEmailStatus(
    paymentId: string,
    status: 'PENDING' | 'SENT' | 'FAILED' | 'SKIPPED',
    messageId?: string
  ): void {
    const record = this.payments.get(paymentId);
    if (!record) return;

    record.emailStatus = status;
    if (status === 'SENT') {
      record.emailSentAt = new Date().toISOString();
    }
    if (messageId) {
      record.emailMessageId = messageId;
    }
  }

  /**
   * Check if a webhook event ID has already been processed (Idempotency)
   */
  public isWebhookEventProcessed(eventId: string): boolean {
    const event = this.webhookEvents.get(eventId);
    return !!(event && event.status === 'PROCESSED');
  }

  /**
   * Record receipt of a webhook event
   */
  public recordWebhookEvent(
    eventId: string,
    eventType: string,
    payloadSummary?: string
  ): WebhookEventRecord {
    const existing = this.webhookEvents.get(eventId);
    if (existing) return existing;

    const record: WebhookEventRecord = {
      eventId,
      eventType,
      receivedAt: new Date().toISOString(),
      status: 'IGNORED',
      payloadSummary
    };
    this.webhookEvents.set(eventId, record);
    return record;
  }

  /**
   * Mark webhook event as processed
   */
  public markWebhookProcessed(
    eventId: string,
    status: 'PROCESSED' | 'IGNORED' | 'FAILED'
  ): void {
    const record = this.webhookEvents.get(eventId);
    if (record) {
      record.status = status;
      record.processedAt = new Date().toISOString();
    }
  }

  /**
   * List all payment records (for testing and verification)
   */
  public getAllPayments(): PaymentRecord[] {
    return Array.from(this.payments.values());
  }
}

export const paymentDb = new PaymentDatabase();
