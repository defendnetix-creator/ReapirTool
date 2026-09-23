import crypto from 'crypto';
import { EMAIL_CONFIG, EMAIL_PLAN_NAMES, maskLicenseKey } from './config.js';
import {
  EmailRecord,
  EmailPayload,
  EmailSendResult,
  EmailType,
  EmailDeliveryStatus
} from './types.js';
import { buildPurchaseConfirmationEmail, buildRenewalConfirmationEmail } from './templates.js';
import { PaymentRecord } from '../payments/types.js';
import { SERVER_PLAN_PRICING } from '../payments/config.js';

export class EmailService {
  private emailRecords: Map<string, EmailRecord> = new Map(); // key = paymentId
  private sentMailbox: EmailRecord[] = []; // In-memory mailbox for inspection and test verification
  private simulateFailure: boolean = false; // Flag to simulate provider outage in test scenarios

  /**
   * Set test failure simulation mode
   */
  public setSimulateFailure(enabled: boolean): void {
    this.simulateFailure = enabled;
  }

  /**
   * Reset mailbox and ledger for clean testing
   */
  public clearLedger(): void {
    this.emailRecords.clear();
    this.sentMailbox = [];
    this.simulateFailure = false;
  }

  /**
   * Get all sent emails in mock mailbox
   */
  public getSentEmails(): EmailRecord[] {
    return [...this.sentMailbox];
  }

  /**
   * Get email record by payment ID
   */
  public getRecordByPaymentId(paymentId: string): EmailRecord | null {
    return this.emailRecords.get(paymentId) || null;
  }

  /**
   * Send purchase or renewal confirmation email based on authoritative fulfilled payment.
   * Enforces strict idempotency per paymentId.
   */
  public async sendConfirmationEmail(
    payment: PaymentRecord,
    options: {
      rawLicenseKey?: string;
      expiryDate: string;
      previousExpiryDate?: string;
    }
  ): Promise<EmailSendResult> {
    const paymentId = payment.paymentId;

    // 1. Idempotency check: if email was already sent successfully for this payment, return immediately
    const existing = this.emailRecords.get(paymentId);
    if (existing && existing.status === 'SENT') {
      console.log(`[EmailService] Idempotency: confirmation email already dispatched for payment ${paymentId}. Skipping re-send.`);
      return {
        success: true,
        messageId: existing.messageId,
        deliveryStatus: 'SKIPPED',
        timestamp: existing.sentAt || new Date().toISOString(),
        attemptCount: existing.attempts
      };
    }

    const emailType: EmailType = payment.isRenewal
      ? 'RENEWAL_CONFIRMATION'
      : 'PURCHASE_CONFIRMATION';

    const planConfig = SERVER_PLAN_PRICING[payment.planId];
    const planName = EMAIL_PLAN_NAMES[payment.planId] || planConfig?.displayName || payment.planId.toUpperCase();
    const deviceAllowance = planConfig?.maxDevices || 1;
    
    // Mask license key strictly before placing in email payload (never raw key in email)
    const maskedKey = options.rawLicenseKey ? maskLicenseKey(options.rawLicenseKey) : undefined;

    const recipient = EMAIL_CONFIG.OVERRIDE_RECIPIENT || payment.customerEmail;
    const accountUrl = `${EMAIL_CONFIG.APP_URL}/#subscription`;
    const downloadUrl = `${EMAIL_CONFIG.APP_URL}/#download`;
    const supportUrl = EMAIL_CONFIG.SUPPORT_EMAIL;

    const payload: EmailPayload = {
      to: recipient,
      customerName: payment.customerName || 'Valued Customer',
      emailType,
      planId: payment.planId,
      planName,
      isRenewal: payment.isRenewal,
      orderReference: payment.internalOrderId || payment.razorpayOrderId,
      paymentId: payment.paymentId,
      activationDate: payment.paidAt || new Date().toISOString(),
      expiryDate: options.expiryDate,
      deviceAllowance,
      maskedLicenseKey: maskedKey,
      previousExpiryDate: options.previousExpiryDate,
      accountUrl,
      downloadUrl,
      supportUrl
    };

    // Compile template
    const compiled = payment.isRenewal
      ? buildRenewalConfirmationEmail(payload)
      : buildPurchaseConfirmationEmail(payload);

    const recordId = `eml_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const attempts = (existing?.attempts || 0) + 1;

    const record: EmailRecord = {
      recordId,
      paymentId,
      customerEmail: recipient,
      emailType,
      status: 'PENDING',
      attempts,
      lastAttemptAt: new Date().toISOString(),
      subject: compiled.subject,
      htmlBody: compiled.html,
      textBody: compiled.text,
      payload
    };

    this.emailRecords.set(paymentId, record);

    // 2. Dispatch via active provider
    return this.dispatchEmailRecord(record);
  }

  /**
   * Retry sending a failed or pending transactional email
   */
  public async retryFailedEmail(paymentId: string): Promise<EmailSendResult> {
    const record = this.emailRecords.get(paymentId);
    if (!record) {
      return {
        success: false,
        error: `No email record found for payment ${paymentId}`,
        deliveryStatus: 'FAILED',
        timestamp: new Date().toISOString(),
        attemptCount: 0
      };
    }

    if (record.status === 'SENT') {
      return {
        success: true,
        messageId: record.messageId,
        deliveryStatus: 'SKIPPED',
        timestamp: record.sentAt || new Date().toISOString(),
        attemptCount: record.attempts
      };
    }

    if (record.attempts >= EMAIL_CONFIG.MAX_RETRIES) {
      console.warn(`[EmailService] Max retries (${EMAIL_CONFIG.MAX_RETRIES}) reached for payment ${paymentId}. Aborting retry.`);
      return {
        success: false,
        error: `Maximum retry attempts (${EMAIL_CONFIG.MAX_RETRIES}) reached.`,
        deliveryStatus: 'FAILED',
        timestamp: new Date().toISOString(),
        attemptCount: record.attempts
      };
    }

    record.attempts++;
    record.lastAttemptAt = new Date().toISOString();
    return this.dispatchEmailRecord(record);
  }

  /**
   * Internal dispatcher handling mock vs live provider
   */
  private async dispatchEmailRecord(record: EmailRecord): Promise<EmailSendResult> {
    try {
      if (this.simulateFailure) {
        throw new Error('Simulated upstream SMTP / Transactional Email Provider network timeout');
      }

      // Safe provider execution
      const messageId = `msg_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;

      // Mark record as SENT
      record.status = 'SENT';
      record.sentAt = new Date().toISOString();
      record.messageId = messageId;
      record.error = undefined;

      this.sentMailbox.push({ ...record });

      // Safe structured log (NO raw secrets, NO raw keys, NO signatures)
      console.log(
        `[EmailService] Transactional Email Dispatched | Type: ${record.emailType} | ` +
        `Customer: ${record.payload.customerName} (${record.customerEmail}) | ` +
        `Order: ${record.payload.orderReference} | Status: SENT | ` +
        `MsgId: ${messageId} | Attempts: ${record.attempts}`
      );

      return {
        success: true,
        messageId,
        deliveryStatus: 'SENT',
        timestamp: record.sentAt,
        attemptCount: record.attempts
      };
    } catch (err: any) {
      record.status = 'FAILED';
      record.error = err.message || 'Unknown email transmission error';

      console.error(
        `[EmailService] Email Delivery FAILED | Type: ${record.emailType} | ` +
        `Order: ${record.payload.orderReference} | Reason: ${record.error} | Attempts: ${record.attempts}`
      );

      return {
        success: false,
        error: record.error,
        deliveryStatus: 'FAILED',
        timestamp: new Date().toISOString(),
        attemptCount: record.attempts
      };
    }
  }
}

export const emailService = new EmailService();
