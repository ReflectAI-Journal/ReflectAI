import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CreditCard, Lock } from 'lucide-react';
import { useLocation } from 'wouter';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: string;
  features: string[];
}

interface StripeCheckoutFormProps {
  plan: SubscriptionPlan;
  onSuccess: () => void;
}

function StripeCheckoutForm({ plan, onSuccess }: StripeCheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [, navigate] = useLocation();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment intent on the server
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          amount: plan.price,
          planId: plan.id 
        }),
      });

      const { clientSecret } = await response.json();

      if (!clientSecret) {
        throw new Error('Failed to create payment intent');
      }

      const cardElement = elements.getElement(CardElement);
      
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        }
      });

      if (error) {
        throw error;
      }

      if (paymentIntent.status === 'succeeded') {
        toast({
          title: 'Payment Successful!',
          description: `You've successfully subscribed to ${plan.name}`,
        });
        onSuccess();
        navigate('/app');
      }
    } catch (error: any) {
      toast({
        title: 'Payment Failed',
        description: error.message || 'There was an error processing your payment.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: false,
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="h-5 w-5" />
            <span className="font-medium">Payment Information</span>
          </div>
          <div className="bg-white dark:bg-gray-800 p-3 rounded border">
            <CardElement options={cardElementOptions} />
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Lock className="h-4 w-4" />
          <span>Your payment information is secure and encrypted</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center py-2 border-t">
          <span className="font-medium">Total</span>
          <span className="font-bold text-lg">
            ${plan.price.toFixed(2)}/{plan.interval === 'month' ? 'mo' : 'yr'}
          </span>
        </div>

        <Button 
          type="submit" 
          disabled={!stripe || isProcessing}
          className="w-full"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Subscribe to ${plan.name}`
          )}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        By subscribing, you agree to our Terms of Service and Privacy Policy. 
        You can cancel anytime from your account settings.
      </p>
    </form>
  );
}

interface StripeCheckoutProps {
  plan: SubscriptionPlan;
  onSuccess: () => void;
}

export default function StripeCheckout({ plan, onSuccess }: StripeCheckoutProps) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Complete Your Subscription
        </CardTitle>
        <CardDescription>
          Subscribe to {plan.name} - {plan.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Elements stripe={stripePromise}>
          <StripeCheckoutForm plan={plan} onSuccess={onSuccess} />
        </Elements>
      </CardContent>
    </Card>
  );
}