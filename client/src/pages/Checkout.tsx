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
import { useAuth } from '@/hooks/use-auth';
import { useIsiOS } from '@/hooks/use-ios-detection';

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
  const isiOS = useIsiOS();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't loaded yet
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          // Redirect to success page after payment
          return_url: `${window.location.origin}/payment-success`,
        },
      });

      if (error) {
        // Show error to your customer
        setErrorMessage(error.message || 'Something went wrong with your payment');
        toast({
          title: 'Payment Failed',
          description: error.message || 'An error occurred during payment processing',
          variant: 'destructive',
        });
      }
    } catch (err: any) {
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
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex items-center justify-center mb-2">
        <div className="text-center bg-gradient-to-r from-blue-500 to-purple-600 rounded-full py-1 px-4 text-white text-sm font-medium">
          Includes 7-day free trial
        </div>
      </div>
    
      <div className={`${isiOS ? 'pt-[45px]' : ''}`}>
        <PaymentElement />
      </div>
      
      <div className="text-sm text-slate-400 bg-slate-900/40 p-3 rounded-md border border-slate-700">
        <p className="flex items-center">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-2 text-blue-400">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
          </svg>
          You won't be charged until after your 7-day free trial ends
        </p>
        <p className="mt-1 flex items-center">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-2 text-blue-400">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Cancel anytime during your trial and you won't be charged
        </p>
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
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          'Start Your Free Trial'
        )}
      </Button>
    </form>
  );
}

// The main checkout page component
export default function Checkout() {
  const [, navigate] = useLocation();
  const params = useParams();
  const planId = params.planId;
  const { user, isLoading: isLoadingAuth, loginAsGuest } = useAuth();
  const { toast } = useToast();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [discount, setDiscount] = useState<number | null>(null);
  const [originalAmount, setOriginalAmount] = useState<number | null>(null);
  const [planInfo, setPlanInfo] = useState<{name: string, interval: string, trialPeriodDays: number} | null>(null);

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

  // Handle promo code application
  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) return;
    
    setIsApplyingPromo(true);
    try {
      // Our special promo code
      if (promoCode.trim().toUpperCase() === 'FREETRUSTGOD777') {
        // Calculate the original amount first
        const amount = calculateAmount(planId);
        setOriginalAmount(amount);
        
        // Apply 100% discount (free forever)
        const discountAmount = amount;
        const discountedAmount = 0;
        
        // Update the payment intent with the discounted amount
        const response = await apiRequest('POST', '/api/create-payment-intent', { 
          amount: discountedAmount,
          promoCode: promoCode.trim()
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to apply promo code');
        }
        
        setClientSecret(data.clientSecret);
        setDiscount(discountAmount);
        
        toast({
          title: 'Special Promo Code Applied!',
          description: `Your subscription will be completely FREE forever! Enjoy premium features at no cost.`,
          variant: 'default',
        });
      } else {
        throw new Error('Invalid promo code');
      }
    } catch (err: any) {
      console.error('Error applying promo code:', err);
      toast({
        title: 'Invalid Promo Code',
        description: err.message || 'The promo code you entered is invalid or has expired.',
        variant: 'destructive',
      });
    } finally {
      setIsApplyingPromo(false);
    }
  };

  // Handle guest access
  const handleGuestAccess = () => {
    loginAsGuest();
    navigate('/app');
  };

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoadingAuth && !user) {
      toast({
        title: "Authentication Required",
        description: "Please login to continue with checkout",
        variant: "destructive",
      });
      navigate('/auth?tab=login&redirect=/checkout?plan=' + planId);
      return;
    }

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

    if (planId && user) {
      createPaymentIntent();
    } else if (!planId) {
      setError('No subscription plan selected');
      setIsLoading(false);
    }
  }, [planId, toast, user, isLoadingAuth, navigate]);

  return (
    <div className="container max-w-3xl mx-auto p-4">
      <div className="flex items-center mb-8">
        <BackButton to="/subscription" />
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          Checkout
        </h1>
      </div>

      <Card className="border border-slate-700 bg-slate-800/40 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <CardTitle>Complete Your Purchase</CardTitle>
          <CardDescription>
            Secure payment processing powered by Stripe
          </CardDescription>
        </CardHeader>
        <CardContent>
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
              <div className="mt-6 pt-4 border-t border-red-200 dark:border-red-800">
                <p className="text-sm mb-3">Or continue without a subscription</p>
                <Button 
                  variant="ghost" 
                  className="w-full" 
                  onClick={handleGuestAccess}
                >
                  Continue as Guest
                </Button>
              </div>
            </div>
          ) : clientSecret ? (
            <>
              {discount !== null && originalAmount !== null && (
                <div className="mb-8 p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
                  <h3 className="text-lg font-medium mb-3">Order Summary</h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span>Original Price:</span>
                      <span>${originalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-400">
                      <span>Special Discount (FREETRUSTGOD777):</span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-medium pt-2 border-t border-slate-700">
                      <span>Total:</span>
                      <span className="text-emerald-400 font-bold">FREE FOREVER!</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Free Trial Information */}
              {!discount && originalAmount !== null && planInfo && (
                <div className="mb-8 p-4 bg-indigo-900/30 border border-indigo-700 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Your ReflectAI Subscription</h3>
                  <div className="space-y-3">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-2 rounded-md inline-block text-sm font-medium mb-2">
                      7-DAY FREE TRIAL
                    </div>
                    
                    <p className="text-sm text-slate-300">
                      You'll get full access to {planInfo.name} features for 7 days completely free.
                    </p>
                    
                    <div className="flex items-center pt-2 border-t border-indigo-700/50">
                      <div className="flex-1">
                        <p className="text-sm text-slate-300">After trial period:</p>
                        <p className="font-medium text-white">
                          ${originalAmount.toFixed(2)} per {planInfo.interval}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">
                          You won't be charged until your free trial ends. Cancel anytime.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm />
              </Elements>
            </>
          ) : (
            <div className="text-center p-6">
              <p>Unable to initialize payment. Please try again.</p>
              <div className="mt-6 pt-4 border-t border-slate-700">
                <p className="text-sm mb-3">Or continue without a subscription</p>
                <Button 
                  variant="ghost" 
                  className="w-full" 
                  onClick={handleGuestAccess}
                >
                  Continue as Guest
                </Button>
              </div>
            </div>
          )}
          
          {/* Promo Code Section */}
          {!isLoading && !error && (
            <div className="mt-8 pt-6 border-t border-slate-700">
              <div className="flex flex-col space-y-4">
                <Label htmlFor="promo-code">Have a promo code?</Label>
                <div className="flex space-x-2">
                  <div className="relative flex-grow">
                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input
                      id="promo-code"
                      placeholder="Enter promo code"
                      className="pl-10"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      disabled={discount !== null || isApplyingPromo}
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={handleApplyPromoCode}
                    disabled={!promoCode.trim() || discount !== null || isApplyingPromo}
                  >
                    {isApplyingPromo ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Applying...
                      </>
                    ) : discount !== null ? (
                      'Applied'
                    ) : (
                      'Apply'
                    )}
                  </Button>
                </div>
                {discount !== null && (
                  <div className="text-sm text-emerald-400 flex items-center">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className="mr-1"
                    >
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Special promo code FREETRUSTGOD777 applied! Your subscription will be FREE FOREVER!
                  </div>
                )}
              </div>
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
  );
}