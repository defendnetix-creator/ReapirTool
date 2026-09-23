import {
  CreateOrderResponse,
  VerifyPaymentResponse,
  PlanCatalogItem
} from './types';

export class CheckoutService {
  /**
   * Fetch official plan catalog with server-side authoritative pricing.
   */
  public async fetchPlans(): Promise<PlanCatalogItem[]> {
    try {
      const res = await fetch('/api/v1/payments/plans');
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return data.plans || [];
    } catch (err) {
      console.warn('[CheckoutService] Failed to load remote plans catalog, falling back to static catalog:', err);
      return [
        { planId: 'personal', displayName: 'Personal', amountPaise: 299900, amountRupees: 2999, formattedPrice: '₹2,999', maxDevices: 1 },
        { planId: 'professional', displayName: 'Professional', amountPaise: 599900, amountRupees: 5999, formattedPrice: '₹5,999', maxDevices: 2 },
        { planId: 'technician', displayName: 'Technician', amountPaise: 1499900, amountRupees: 14999, formattedPrice: '₹14,999', maxDevices: 5 },
        { planId: 'business', displayName: 'Business & Fleet', amountPaise: 399900, amountRupees: 39999, formattedPrice: '₹39,999', maxDevices: 25 }
      ];
    }
  }

  /**
   * Create an order on the backend.
   * Frontend NEVER dictates price or duration; only sends plan SKU and customer details.
   */
  public async createOrder(params: {
    plan: string;
    email: string;
    name: string;
    customerId?: string;
    subscriptionId?: string;
    licenseId?: string;
  }): Promise<CreateOrderResponse> {
    const res = await fetch('/api/v1/payments/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plan: params.plan.toUpperCase(),
        email: params.email.trim(),
        name: params.name.trim(),
        customerId: params.customerId,
        subscriptionId: params.subscriptionId,
        licenseId: params.licenseId
      })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || data.error || 'Failed to initialize payment order on server.');
    }

    return data;
  }

  /**
   * Verify completed payment signature on server-side and trigger automatic fulfillment.
   */
  public async verifyPayment(params: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
    internal_order_id?: string;
  }): Promise<VerifyPaymentResponse> {
    const res = await fetch('/api/v1/payments/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpay_payment_id: params.razorpay_payment_id,
        razorpay_order_id: params.razorpay_order_id,
        razorpay_signature: params.razorpay_signature,
        internal_order_id: params.internal_order_id
      })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || data.error || 'Server rejected payment verification.');
    }

    return data;
  }
}

export const checkoutService = new CheckoutService();
