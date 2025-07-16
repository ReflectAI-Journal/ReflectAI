import { useState, useEffect } from 'react';
import { useStripe, useElements, PaymentElement, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: string;
}

// Initialize Stripe with the public key
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required environment variable: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
console.log("Stripe Public Key:", import.meta.env.VITE_STRIPE_PUBLIC_KEY);


// Form component to handle payment submission
function CheckoutFormInner() {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-center mb-2">
        <div className="text-center bg-gradient-to-r from-blue-500 to-purple-600 rounded-full py-1 px-4 text-white text-sm font-medium">
          Includes 3-day free trial
        </div>
      </div>
    
      <PaymentElement />
      
      <div className="text-sm text-slate-400 bg-slate-900/40 p-3 rounded-md border border-slate-700">
        <p className="flex items-center">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-2 text-blue-400">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
          </svg>
          You won't be charged until after your 3-day free trial ends
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

// Checkout Dialog Component
export function DirectCheckoutButton({ plan }: { plan: SubscriptionPlan }) {
  const [open, setOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Calculate the subscription amount based on plan
  const calculateAmount = (): number => {
    const amount = plan.price;
    // Round to 2 decimal places
    return parseFloat(amount.toFixed(2));
  };

  // Store the current plan ID to detect plan changes
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  
  // Reset client secret when plan changes
  useEffect(() => {
    if (currentPlanId && currentPlanId !== plan.id) {
      setClientSecret(null);
    }
    setCurrentPlanId(plan.id);
  }, [plan.id, currentPlanId]);
  
  // Create payment intent when the dialog is opened (only once per plan)
  useEffect(() => {
    if (!open || clientSecret) {
      return;
    }

    let isMounted = true;
    
    async function createPaymentIntent() {
      if (!isMounted) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Creating payment intent for plan:', plan.id);
        const amount = calculateAmount();
        console.log('Calculated amount:', amount);
        
        const response = await apiRequest('POST', '/api/create-payment-intent', { 
          amount,
          planId: plan.id
        });
        
        if (!isMounted) return;
        
        console.log('API response received:', response.status);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to create payment intent');
        }
        
        console.log('Setting client secret from API response');
        setClientSecret(data.clientSecret);
      } catch (err: any) {
        if (!isMounted) return;
        
        console.error('Error creating payment intent:', err);
        setError(err.message || 'Failed to initialize payment');
        toast({
          title: 'Payment Setup Failed',
          description: err.message || 'Unable to initialize payment process',
          variant: 'destructive',
        });
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    createPaymentIntent();
    
    // Cleanup function to prevent state updates if component unmounts
    return () => {
      isMounted = false;
    };
  }, [open, clientSecret, plan.id, toast]);

  return (
    <>
      <Button 
        className={`w-full ${
          plan.id.includes('pro')
            ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600'
            : 'bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600'
        }`}
        onClick={() => {
          console.log('Opening checkout dialog for plan:', plan.id);
          setOpen(true);
        }}
      >
        Upgrade to {plan.name}
      </Button>

      <Dialog 
        open={open} 
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          // Reset state when dialog is closed
          if (!isOpen) {
            // Keep clientSecret to avoid recreating payment intent unnecessarily
            setError(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Subscribe to {plan.name}</DialogTitle>
            <DialogDescription>
              ${plan.price.toFixed(2)} per {plan.interval === 'month' ? 'month' : 'year'} after your 7-day free trial
            </DialogDescription>
          </DialogHeader>
          
          {error ? (
            <div className="text-center p-6 border border-red-300 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-800">
              <p className="text-red-600 dark:text-red-400">{error}</p>
              <Button variant="outline" className="mt-4" onClick={() => setOpen(false)}>
                Close
              </Button>
            </div>
          ) : clientSecret ? (
            <Elements 
              key={clientSecret} 
              stripe={stripePromise} 
              options={{ 
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#3B82F6',
                    colorBackground: '#FFFFFF',
                    colorText: '#1E293B',
                    colorDanger: '#EF4444',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    spacingUnit: '4px',
                    borderRadius: '8px',
                  },
                  rules: {
                    '.Input': {
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      padding: '12px',
                      fontSize: '14px',
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
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      padding: '12px 16px',
                      borderRadius: '8px 8px 0 0',
                    },
                    '.Tab:hover': {
                      backgroundColor: '#F1F5F9',
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
              <CheckoutFormInner />
            </Elements>
          ) : (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}