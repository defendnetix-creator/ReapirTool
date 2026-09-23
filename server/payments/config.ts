import { SubscriptionTier } from '../licensing/types.js';
import { PlanPricing } from './types.js';

export const RAZORPAY_CONFIG = {
  get KEY_ID(): string {
    return process.env.RAZORPAY_KEY_ID || 'rzp_test_akshigo_demo_key';
  },
  get KEY_SECRET(): string {
    return process.env.RAZORPAY_KEY_SECRET || 'rzp_test_akshigo_demo_secret';
  },
  get WEBHOOK_SECRET(): string {
    return process.env.RAZORPAY_WEBHOOK_SECRET || 'akshigo_whsec_test_secret_2026';
  },
  get MODE(): 'test' {
    const mode = (process.env.RAZORPAY_MODE || process.env.PAYMENT_MODE || 'test').toLowerCase();
    if (mode !== 'test') {
      console.warn('[Razorpay] Non-test mode detected in Phase 7.1. Enforcing TEST mode for safety.');
    }
    return 'test';
  }
};

/**
 * Authoritative Server-Side Plan Pricing Table (INR minor units / paise, 365-day term)
 * Client prices are never trusted.
 */
export const SERVER_PLAN_PRICING: Record<SubscriptionTier, PlanPricing> = {
  personal: {
    planId: 'personal',
    displayName: 'Personal',
    amountPaise: 299900, // ₹2,999.00
    currency: 'INR',
    termDays: 365,
    maxDevices: 1
  },
  professional: {
    planId: 'professional',
    displayName: 'Professional',
    amountPaise: 599900, // ₹5,999.00
    currency: 'INR',
    termDays: 365,
    maxDevices: 2
  },
  technician: {
    planId: 'technician',
    displayName: 'Technician',
    amountPaise: 1499900, // ₹14,999.00
    currency: 'INR',
    termDays: 365,
    maxDevices: 5
  },
  business: {
    planId: 'business',
    displayName: 'Business & MSP Fleet',
    amountPaise: 3999900, // ₹39,999.00
    currency: 'INR',
    termDays: 365,
    maxDevices: 25
  }
};

/**
 * Normalize and validate requested plan SKU
 */
export function resolvePlanTier(sku: string | undefined): SubscriptionTier | null {
  if (!sku || typeof sku !== 'string') return null;
  const normalized = sku.trim().toLowerCase();

  switch (normalized) {
    case 'personal':
    case 'pers':
      return 'personal';
    case 'professional':
    case 'pro':
      return 'professional';
    case 'technician':
    case 'tech':
      return 'technician';
    case 'business':
    case 'biz':
    case 'enterprise':
      return 'business';
    default:
      return null;
  }
}
