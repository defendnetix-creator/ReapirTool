import { SubscriptionTier } from '../licensing/types.js';

export type EmailDeliveryStatus = 'PENDING' | 'SENT' | 'FAILED' | 'SKIPPED';
export type EmailType = 'PURCHASE_CONFIRMATION' | 'RENEWAL_CONFIRMATION';

export interface EmailPayload {
  to: string;
  customerName: string;
  emailType: EmailType;
  planId: SubscriptionTier;
  planName: string;
  isRenewal: boolean;
  orderReference: string;
  paymentId: string;
  activationDate: string;
  expiryDate: string;
  deviceAllowance: number;
  maskedLicenseKey?: string;
  previousExpiryDate?: string;
  accountUrl: string;
  downloadUrl: string;
  supportUrl: string;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  deliveryStatus: EmailDeliveryStatus;
  timestamp: string;
  attemptCount: number;
}

export interface EmailRecord {
  recordId: string;
  paymentId: string;
  customerEmail: string;
  emailType: EmailType;
  status: EmailDeliveryStatus;
  attempts: number;
  lastAttemptAt?: string;
  sentAt?: string;
  messageId?: string;
  error?: string;
  subject: string;
  htmlBody: string;
  textBody: string;
  payload: EmailPayload;
}
