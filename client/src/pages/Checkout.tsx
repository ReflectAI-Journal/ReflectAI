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

      console.log('Payment confirmation result:', { error, paymentIntent });

      if (error) {
        console.error('Payment error:', error);
        // Show error to your customer
        setErrorMessage(error.message || 'Something went wrong with your payment');
        toast({
          title: 'Payment Failed',
          description: error.message || 'An error occurred during payment processing',
          variant: 'destructive',
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('Payment succeeded!');
        // Payment succeeded without redirect
        toast({
          title: 'Payment Successful!',
          description: 'Welcome to ReflectAI! Your subscription is now active.',
        });
        
        // Navigate to app instead of payment-success page to avoid permission issues
        setTimeout(() => {
          setLocation('/app');
        }, 1500);
      } else {
        console.log('Payment status:', paymentIntent?.status);
        // Handle other payment statuses
        if (paymentIntent?.status === 'processing') {
          toast({
            title: 'Payment Processing',
            description: 'Your payment is being processed. Please wait...',
          });
        } else if (paymentIntent?.status === 'requires_action') {
          toast({
            title: 'Additional Authentication Required',
            description: 'Please complete the additional authentication steps.',
          });
        }
      }
    } catch (err: any) {
      console.error('Unexpected error during payment:', err);
      setErrorMessage(err.message || 'An unexpected error occurred');
      toast({
        title: 'Error',
        description: err.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-center mb-4">
        <div className="text-center bg-gradient-to-r from-blue-500 to-purple-600 rounded-full py-1 px-4 text-white text-sm font-medium">
          Includes 7-day free trial
        </div>
      </div>
    
      <PaymentElement />
      
      <div className="text-sm text-slate-600 dark:text-slate-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="space-y-1">
          <p className="flex items-center font-medium text-blue-700 dark:text-blue-300">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-2">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
            </svg>
            Risk-free 7-day trial
          </p>
          <p className="flex items-center ml-6">
            No charge until trial ends • Cancel anytime
          </p>
        </div>
      </div>
      
      {errorMessage && (
        <div className="p-3 text-sm bg-red-100 border border-red-200 rounded-md text-red-600 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400">
          {errorMessage}
        </div>
      )}
      
      <Button 
        type="submit" 
        disabled={!stripe || isLoading} 
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>Processing Payment...</span>
          </div>
        ) : (
          'Start My Free Trial'
        )}
      </Button>
    </form>
  );
}

// The main checkout page component
export default function Checkout() {
  const params = useParams();
  const planId = params.planId;
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [originalAmount, setOriginalAmount] = useState<number | null>(null);
  const [planInfo, setPlanInfo] = useState<{name: string, interval: string, trialPeriodDays: number} | null>(null);
  const { toast } = useToast();

  // Calculate the subscription amount based on plan ID
  const calculateAmount = (planId: string | undefined): number => {
    let amount;
    
    if (planId?.includes('pro-monthly')) {
      amount = 9.99;
    } else if (planId?.includes('pro-yearly')) {
      amount = 9.99 * 12 * 0.85; // 15% discount
    } else if (planId?.includes('unlimited-monthly') || planId?.includes('mvp-monthly')) {
      amount = 17.99;
    } else if (planId?.includes('unlimited-yearly') || planId?.includes('mvp-yearly')) {
      amount = 17.99 * 12 * 0.85; // 15% discount
    } else {
      // Default fallback
      amount = planId?.includes('yearly') ? 95.88 : 9.99;
    }
    
    // Round to 2 decimal places
    return parseFloat(amount.toFixed(2));
  };



  useEffect(() => {
    async function createPaymentIntent() {
      try {
        console.log('Checkout page loaded with planId:', planId);
        
        // Calculate amount based on plan ID
        const amount = calculateAmount(planId);
        setOriginalAmount(amount);
        console.log('Calculated amount:', amount);
        
        console.log('Making api request to /api/create-payment-intent');
        const response = await apiRequest('POST', '/api/create-payment-intent', { 
          amount,
          planId
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
            <>
              {/* Subscription Plan Information */}
              {originalAmount !== null && planInfo && (
                <div className="mb-8 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-700 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-indigo-900 dark:text-indigo-100">
                      ReflectAI {planInfo.name} Plan
                    </h3>
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1.5 rounded-full text-sm font-medium shadow-md">
                      7-Day Free Trial
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        Start with complete access to all {planInfo.name} features for 7 days at no cost.
                      </p>
                      
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
                          per {planInfo.interval}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              



              {/* Clean white payment box */}
              <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 mx-auto max-w-md">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Information</h3>
                  <p className="text-sm text-gray-600">Secure payment processing</p>
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
                        '.Tab': {
                          backgroundColor: '#F9FAFB',
                          border: '1px solid #D1D5DB',
                          padding: '12px 16px',
                          borderRadius: '8px 8px 0 0',
                          color: '#374151',
                        },
                        '.Tab:hover': {
                          backgroundColor: '#F3F4F6',
                        },
                        '.Tab--selected': {
                          backgroundColor: '#FFFFFF',
                          borderColor: '#3B82F6',
                          color: '#3B82F6',
                        },
                        '.TabIcon': {
                          color: '#6B7280',
                        },
                        '.TabIcon--selected': {
                          color: '#3B82F6',
                        },
                      }
                    }
                  }}
                >
                  <CheckoutForm />
                </Elements>
              </div>
            </>
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