export interface PlanCatalogItem {
  planId: string;
  displayName: string;
  amountPaise: number;
  amountRupees: number;
  formattedPrice: string;
  maxDevices: number;
}

export interface CreateOrderResponse {
  success: boolean;
  internalOrderId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
  planId: string;
  planName: string;
  paymentMode: 'TEST' | 'LIVE';
  error?: string;
  message?: string;
}

export interface RazorpayPaymentSuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface PaymentFulfillmentResult {
  success: boolean;
  isRenewal: boolean;
  paymentId: string;
  customerId: string;
  subscriptionId: string;
  licenseId: string;
  licenseKey?: string;
  expiryDate: string;
  planId: string;
  message: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
  paymentId: string;
  status: 'PAID' | 'FAILED';
  fulfillment: PaymentFulfillmentResult;
  error?: string;
}

export type CheckoutStep =
  | 'SELECT_OR_CONFIRM'
  | 'CUSTOMER_INFO'
  | 'CREATING_ORDER'
  | 'GATEWAY_OPEN'
  | 'VERIFYING'
  | 'SUCCESS'
  | 'FAILED'
  | 'CANCELLED';
