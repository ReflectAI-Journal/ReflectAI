import { useParams } from 'wouter';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';

export default function CheckoutRedirect() {
  const params = useParams();
  const planId = params.planId;
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      window.location.href = '/auth';
      return;
    }

    // Create checkout session with your actual LemonSqueezy store
    const createCheckout = async () => {
      try {
        const response = await fetch('/api/create-checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            planId,
            customData: {
              user_id: user.id,
              user_email: user.email,
              plan_id: planId
            }
          }),
        });

        const data = await response.json();
        
        if (response.ok && data.url) {
          // Redirect to actual LemonSqueezy checkout
          window.location.href = data.url;
        } else {
          setError(data.message || 'Failed to create checkout session');
        }
      } catch (err) {
        console.error('Checkout error:', err);
        setError('Failed to connect to payment system');
      }
    };

    createCheckout();
  }, [planId, user]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️ {error}</div>
          <button 
            onClick={() => window.location.href = '/subscription'}
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
          >
            Back to Subscription Plans
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Redirecting to secure checkout...</p>
      </div>
    </div>
  );
}
