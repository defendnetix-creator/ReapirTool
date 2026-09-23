/**
 * Dynamic loader for Razorpay Standard Checkout JS SDK.
 * Loads the script only on demand when checkout is initiated.
 */

let loadPromise: Promise<boolean> | null = null;

export function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === 'undefined') {
    return Promise.resolve(false);
  }

  // If already loaded on window, resolve immediately
  if ((window as any).Razorpay) {
    return Promise.resolve(true);
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise((resolve) => {
    // Check if script tag already exists in document
    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      console.warn('[Razorpay] Failed to load official checkout script from CDN.');
      resolve(false);
    };
    document.body.appendChild(script);
  });

  return loadPromise;
}
