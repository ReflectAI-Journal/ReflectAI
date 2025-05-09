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
          Includes 7-day free trial
        </div>
      </div>
    
      <PaymentElement />
      
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

  // Create payment intent when the dialog is opened
  useEffect(() => {
    if (!open) {
      return;
    }

    async function createPaymentIntent() {
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
        
        console.log('API response received:', response.status);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to create payment intent');
        }
        
        console.log('Setting client secret from API response');
        setClientSecret(data.clientSecret);
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

    createPaymentIntent();
  }, [open, plan, toast]);

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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Subscribe to {plan.name}</DialogTitle>
            <DialogDescription>
              ${plan.price.toFixed(2)} per {plan.interval === 'month' ? 'month' : 'year'} after your 7-day free trial
            </DialogDescription>
          </DialogHeader>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center p-6 border border-red-300 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-800">
              <p className="text-red-600 dark:text-red-400">{error}</p>
              <Button variant="outline" className="mt-4" onClick={() => setOpen(false)}>
                Close
              </Button>
            </div>
          ) : clientSecret ? (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
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