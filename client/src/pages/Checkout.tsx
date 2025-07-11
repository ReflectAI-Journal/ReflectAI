import { useParams, useLocation } from 'wouter';
import { useEffect, useState } from 'react';

export default function CheckoutRedirect() {
  const params = useParams();
  const planId = params.planId;
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const createCheckout = async () => {
      if (!planId) {
        setError('Invalid plan selected');
        setIsLoading(false);
        return;
      }

      try {
        // Use our backend API to create a properly configured checkout
        const response = await fetch('/api/create-checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            planId: planId,
            customData: {} 
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create checkout');
        }

        const { checkoutUrl } = await response.json();
        
        if (checkoutUrl) {
          // Redirect to the properly configured LemonSqueezy checkout
          window.location.href = checkoutUrl;
        } else {
          throw new Error('No checkout URL received');
        }
      } catch (err: any) {
        console.error('Checkout error:', err);
        setError(err.message || 'Failed to create checkout');
        setIsLoading(false);
        
        // Redirect back to subscription page after a delay
        setTimeout(() => {
          setLocation('/subscription?error=checkout_failed');
        }, 3000);
      }
    };

    createCheckout();
  }, [planId, setLocation]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <p className="text-muted-foreground">Redirecting back to subscription page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Setting up secure checkout...</p>
      </div>
    </div>
  );
}
