import { SubscriptionTier } from '../licensing/types.js';

export type PaymentStatus = 'CREATED' | 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface PlanPricing {
  planId: SubscriptionTier;
  displayName: string;
  amountPaise: number; // e.g. 299900 = ₹2,999.00
  currency: 'INR';
  termDays: number; // 365
  maxDevices: number;
}

export interface PaymentRecord {
  paymentId: string;
  customerId: string;
  internalOrderId: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  planId: SubscriptionTier;
  amount: number; // Amount in paise
  currency: string; // 'INR'
  status: PaymentStatus;
  createdAt: string;
  paidAt?: string;
  processedAt?: string;
  licenseId?: string;
  subscriptionId?: string;
  isRenewal: boolean;
  customerEmail: string;
  customerName: string;
  notes?: Record<string, string>;
  emailStatus?: 'PENDING' | 'SENT' | 'FAILED' | 'SKIPPED';
  emailSentAt?: string;
  emailMessageId?: string;
}

export interface WebhookEventRecord {
  eventId: string;
  eventType: string;
  receivedAt: string;
  processedAt?: string;
  status: 'PROCESSED' | 'IGNORED' | 'FAILED';
  payloadSummary?: string;
}

export interface CreateOrderRequest {
  plan: string;
  email?: string;
  name?: string;
  customerId?: string;
  subscriptionId?: string;
  licenseId?: string;
}

export interface CreateOrderResponse {
  success: boolean;
  internalOrderId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
  planId: SubscriptionTier;
  planName: string;
  paymentMode: 'TEST';
}

export interface VerifyPaymentRequest {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  internal_order_id?: string;
}

export interface FulfillmentResult {
  success: boolean;
  isRenewal: boolean;
  paymentId: string;
  customerId: string;
  subscriptionId: string;
  licenseId: string;
  licenseKey?: string;
  expiryDate: string;
  planId: SubscriptionTier;
  emailStatus?: 'PENDING' | 'SENT' | 'FAILED' | 'SKIPPED';
  message: string;
}
