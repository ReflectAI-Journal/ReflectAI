import { useParams } from 'wouter';
import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/queryClient';

export default function CheckoutRedirect() {
  const params = useParams();
  const planId = params.planId;
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!planId) {
      setError('Invalid plan selected');
      return;
    }

    const createCheckout = async () => {
      try {
        // Call our API to create a checkout using LemonSqueezy API
        const response = await apiRequest(`/api/create-checkout`, {
          method: 'POST',
          body: {
            planId,
            customData: {
              plan_id: planId,
              timestamp: Date.now()
            }
          }
        });

        if (response.checkoutUrl) {
          // Redirect to LemonSqueezy checkout in production mode
          window.location.href = response.checkoutUrl;
        } else {
          throw new Error('No checkout URL received');
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
