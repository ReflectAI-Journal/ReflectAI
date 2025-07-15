import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import EmbeddedCheckoutForm from '@/components/payment/EmbeddedCheckoutForm';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import BackButton from '@/components/ui/back-button';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: string;
  features: string[];
}

export default function EmbeddedCheckout() {
  const [location] = useLocation();
  const { toast } = useToast();
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Static pricing plans matching Subscription.tsx
  const plans: SubscriptionPlan[] = [
    {
      id: 'pro-monthly',
      name: 'Pro',
      description: 'Essential features for regular journaling',
      price: 14.99,
      interval: 'month',
      features: [
        'Unlimited journal entries',
        'AI-powered insights',
        'Goal tracking',
        'Basic analytics',
        'Email support'
      ]
    },
    {
      id: 'pro-annually',
      name: 'Pro',
      description: 'Essential features for regular journaling',
      price: 152.90,
      interval: 'year',
      features: [
        'Unlimited journal entries',
        'AI-powered insights',
        'Goal tracking',
        'Basic analytics',
        'Email support'
      ]
    },
    {
      id: 'unlimited-monthly',
      name: 'Unlimited',
      description: 'Complete mental wellness toolkit',
      price: 24.99,
      interval: 'month',
      features: [
        'Everything in Pro',
        'Advanced AI counselor',
        'Philosophy mode',
        'Advanced analytics',
        'Priority support',
        'Export capabilities'
      ]
    },
    {
      id: 'unlimited-annually',
      name: 'Unlimited',
      description: 'Complete mental wellness toolkit',
      price: 254.90,
      interval: 'year',
      features: [
        'Everything in Pro',
        'Advanced AI counselor',
        'Philosophy mode',
        'Advanced analytics',
        'Priority support',
        'Export capabilities'
      ]
    }
  ];

  useEffect(() => {
    // Parse URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const planId = urlParams.get('plan');

    if (!planId) {
      toast({
        title: 'Invalid Plan',
        description: 'No plan specified. Redirecting to subscription page.',
        variant: 'destructive',
      });
      window.location.href = '/subscription';
      return;
    }

    // Find the selected plan
    const selectedPlan = plans.find(p => p.id === planId);
    if (!selectedPlan) {
      toast({
        title: 'Plan Not Found',
        description: 'The requested plan was not found. Redirecting to subscription page.',
        variant: 'destructive',
      });
      window.location.href = '/subscription';
      return;
    }

    setPlan(selectedPlan);

    // Create payment intent for embedded checkout
    createPaymentIntent(planId);
  }, [location]);

  const createPaymentIntent = async (planId: string) => {
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ planId })
      });

      if (!response.ok) {
        throw new Error(`Failed to create payment intent: ${response.statusText}`);
      }

      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (error) {
      console.error('Error creating payment intent:', error);
      toast({
        title: 'Payment Setup Error',
        description: 'Failed to initialize payment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Setting up secure payment...</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Plan Not Found</h1>
          <p className="mb-4">The requested subscription plan could not be found.</p>
          <BackButton href="/subscription" />
        </div>
      </div>
    );
  }

  const appearance = {
    theme: 'night' as const,
    variables: {
      colorPrimary: '#3b82f6',
      colorBackground: '#1f2937',
      colorText: '#f9fafb',
      colorDanger: '#ef4444',
      colorWarning: '#f59e0b',
      colorSuccess: '#10b981',
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSizeBase: '16px',
      spacingUnit: '6px',
      borderRadius: '8px',
      // Input styling
      colorInputBackground: '#374151',
      colorInputBorder: '#6b7280',
      colorInputText: '#f9fafb',
      colorInputPlaceholder: '#9ca3af',
      // Focus states
      colorInputBorderFocus: '#3b82f6',
      // Tab styling
      tabBackgroundColor: '#374151',
      tabBorderColor: '#6b7280',
      tabTextColor: '#f9fafb',
      tabSelectedBackgroundColor: '#3b82f6',
      tabSelectedBorderColor: '#3b82f6',
      tabSelectedTextColor: '#ffffff',
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4">
        <div className="mb-6 pt-8">
          <BackButton href="/subscription" />
        </div>
        
        {stripePromise && (
          <Elements 
            stripe={stripePromise} 
            options={{ 
              clientSecret: clientSecret || undefined,
              appearance 
            }}
          >
            <EmbeddedCheckoutForm 
              plan={plan} 
              clientSecret={clientSecret || undefined}
            />
          </Elements>
        )}
      </div>
    </div>
  );
}