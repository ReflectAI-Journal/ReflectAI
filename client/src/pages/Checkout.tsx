import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Checkout() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // If user is not logged in, redirect to login
    if (!user) {
      navigate('/auth?tab=login');
      return;
    }

    // Check for plan selection in URL or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const planId = urlParams.get('plan') || localStorage.getItem('selectedPlan');

    if (planId) {
      // Automatically start checkout process
      handleCheckout(planId);
    } else {
      // No plan selected, redirect to subscription page
      navigate('/subscription');
    }
  }, [user, navigate]);

  const handleCheckout = async (planId: string) => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ planId }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        // Clear selected plan from storage
        localStorage.removeItem('selectedPlan');
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to start checkout process. Please try again.',
        variant: 'destructive',
      });
      navigate('/subscription');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader className="space-y-2">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            {isLoading ? (
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            ) : (
              <CreditCard className="w-8 h-8 text-blue-600" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold">
            {isLoading ? 'Setting Up Checkout...' : 'Ready for Checkout'}
          </CardTitle>
          <CardDescription>
            {isLoading 
              ? 'Please wait while we prepare your secure checkout session.'
              : 'Something went wrong. Please try again.'
            }
          </CardDescription>
        </CardHeader>
        
        {!isLoading && (
          <CardContent>
            <Button 
              onClick={() => navigate('/subscription')}
              className="w-full"
            >
              Back to Plans
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}