import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useStripe, useElements, PaymentElement, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Tag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import BackButton from '@/components/ui/back-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Initialize Stripe with the public key
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required environment variable: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// The checkout form component using Stripe Elements
function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't loaded yet
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      console.log('Starting payment confirmation...');
      
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          // Use current origin for redirect
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: 'if_required', // Only redirect if required by payment method
      });

      if (error) {
        console.error('Payment confirmation error:', error);
        setErrorMessage(error.message || 'An error occurred during payment processing');
        toast({
          title: 'Payment Failed',
          description: error.message || 'Please check your payment information and try again',
          variant: 'destructive',
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('Payment succeeded:', paymentIntent);
        toast({
          title: 'Payment Successful',
          description: 'Your subscription has been activated!',
        });
        // Redirect to success page
        setLocation('/payment-success');
      }
    } catch (error: any) {
      console.error('Unexpected error during payment:', error);
      setErrorMessage(error.message || 'An unexpected error occurred');
      toast({
        title: 'Payment Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      {errorMessage && (
        <div className="text-red-600 text-sm text-center p-3 bg-red-50 rounded-lg border border-red-200">
          {errorMessage}
        </div>
      )}
      
      <Button 
        type="submit" 
        disabled={!stripe || isLoading} 
        className="w-full"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          'Complete Payment'
        )}
      </Button>
    </form>
  );
}

// Main checkout component
export default function Checkout() {
  const { planId } = useParams<{ planId: string }>();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [planInfo, setPlanInfo] = useState<any>(null);
  const { toast } = useToast();

  // Calculate amount based on plan
  const getAmount = (planId: string) => {
    switch (planId) {
      case 'pro-monthly':
        return 9.99;
      case 'pro-yearly':
        return 99.99;
      default:
        return 9.99;
    }
  };

  const amount = getAmount(planId || 'pro-monthly');
  const originalAmount = amount; // For display purposes

  console.log('Checkout page loaded with planId:', planId);
  console.log('Calculated amount:', amount);

  useEffect(() => {
    async function createPaymentIntent() {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Making api request to /api/create-payment-intent');
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            planId: planId || 'pro-monthly',
            amount: Math.round(amount * 100), // Convert to cents
          }),
        });
        
        console.log('API response received:', response.status);
        const data = await response.json();
        console.log('API response data available');
        
        if (!response.ok) {
          console.error('Payment intent creation failed:', data);
          throw new Error(data.message || 'Failed to create payment intent');
        }
        
        console.log('Setting client secret from API response');
        setClientSecret(data.clientSecret);
        
        // Store plan info for display
        if (data.planInfo) {
          setPlanInfo(data.planInfo);
        }
      } catch (err: any) {
        console.error('Error creating payment intent:', err);
        setError(err.message || 'Failed to initialize payment');
        toast({
          title: 'Payment Setup Failed',
          description: err.message || 'Unable to initialize payment process',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }

    if (planId) {
      createPaymentIntent();
    } else {
      setError('No subscription plan selected');
      setIsLoading(false);
    }
  }, [planId, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-center gap-6 mb-12">
          <BackButton to="/subscription" />
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Complete Your Purchase
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">
              Start your ReflectAI journey with a 7-day free trial
            </p>
          </div>
        </div>

        <Card className="border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-2xl max-w-3xl mx-auto">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-semibold">Secure Checkout</CardTitle>
            <CardDescription className="text-base">
              Secure payment processing powered by Stripe
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-8 pb-8">
            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center p-6 border border-red-300 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                <p className="text-red-600 dark:text-red-400">{error}</p>
                <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            ) : clientSecret ? (
              <div className="space-y-8">
                {/* Plan Details Section */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Tag className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {planId === 'pro-yearly' ? 'Pro Annual Plan' : 'Pro Monthly Plan'}
                      </h3>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        ${originalAmount.toFixed(2)}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        per {planId === 'pro-yearly' ? 'year' : 'month'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        Start with complete access to all Pro features for 7 days at no cost.
                      </p>
                      
                      <div className="flex items-center text-green-600 dark:text-green-400 text-sm font-medium">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        7-day free trial included
                      </div>
                      
                      <div className="flex items-center text-green-600 dark:text-green-400 text-sm font-medium">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Cancel anytime with one click
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
                      <div className="text-center">
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">After trial:</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                          ${originalAmount.toFixed(2)}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          per {planId === 'pro-yearly' ? 'year' : 'month'}
                        </p>
                        {planId === 'pro-yearly' && (
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            Save 17% with annual billing
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Form Section */}
                <div className="bg-white dark:bg-slate-800/50 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Payment Information</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Secure payment processing powered by Stripe</p>
                  </div>

                  <Elements 
                    stripe={stripePromise} 
                    options={{ 
                      clientSecret,
                      appearance: {
                        theme: 'stripe',
                        variables: {
                          colorPrimary: '#3B82F6',
                          colorBackground: '#FFFFFF',
                          colorText: '#1F2937',
                          colorDanger: '#EF4444',
                          fontFamily: 'system-ui, -apple-system, sans-serif',
                          spacingUnit: '4px',
                          borderRadius: '8px',
                        },
                        rules: {
                          '.Input': {
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #D1D5DB',
                            padding: '12px',
                            fontSize: '14px',
                            color: '#1F2937',
                          },
                          '.Input:focus': {
                            border: '1px solid #3B82F6',
                            boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                          },
                          '.Label': {
                            color: '#374151',
                            fontSize: '14px',
                            fontWeight: '500',
                            marginBottom: '6px',
                          },
                        }
                      }
                    }}
                  >
                    <CheckoutForm />
                  </Elements>
                </div>
              </div>
            ) : (
              <div className="text-center p-6">
                <p>Unable to initialize payment. Please try again.</p>
              </div>
            )}
          </CardContent>
          
          {!isLoading && !error && !clientSecret && (
            <CardFooter className="flex justify-center">
              <Button variant="outline" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}