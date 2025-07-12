import { useParams } from 'wouter';
import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/queryClient';

export default function CheckoutRedirect() {
  const params = useParams();
  const planId = params.planId;
  
  // Debug logging
  console.log('Checkout component - params:', params);
  console.log('Checkout component - planId:', planId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!planId) {
      setError('Invalid plan selected');
      return;
    }

    const createCheckout = async () => {
      try {
        // Use direct LemonSqueezy checkout URLs for reliability
        const checkoutUrls: Record<string, string> = {
          'pro-monthly': 'https://reflectaicounselor.lemonsqueezy.com/buy/95c7bbb7-ac66-498c-82c5-e2b6b90b8bf0',
          'pro-yearly': 'https://reflectaicounselor.lemonsqueezy.com/buy/e6de1b1a-4f94-4cd5-8ab0-c2cbedff7399',
          'unlimited-monthly': 'https://reflectaicounselor.lemonsqueezy.com/buy/db3a9b9e-2426-4d43-8e79-5e5e25b5f77f',
          'unlimited-yearly': 'https://reflectaicounselor.lemonsqueezy.com/buy/4b75e73c-b91b-473f-8d85-30b55bb8a6fe'
        };
        
        const checkoutUrl = checkoutUrls[planId];
        if (checkoutUrl) {
          // Add success URL parameter for redirect after payment
          const successUrl = encodeURIComponent(`${window.location.origin}/checkout-success`);
          const finalUrl = `${checkoutUrl}?checkout[custom][success_url]=${successUrl}`;
          window.location.href = finalUrl;
        } else {
          throw new Error('Invalid plan selected');
        }
      } catch (err: any) {
        console.error('Checkout creation failed:', err);
        setError(err.message || 'Failed to create checkout');
        setTimeout(() => {
          window.location.href = '/subscription';
        }, 3000);
      }
    };

    createCheckout();
  }, [planId]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <p className="text-lg font-semibold">Checkout Error</p>
            <p>{error}</p>
          </div>
          <p className="text-muted-foreground">Redirecting back to subscription page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Creating secure checkout...</p>
        <p className="text-sm text-muted-foreground mt-2">You'll be redirected to complete your purchase</p>
      </div>
    </div>
  );
}
