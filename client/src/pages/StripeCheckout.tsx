import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: string;
  features: string[];
}

interface StripeCheckoutProps {
  plan: SubscriptionPlan;
  stripeCustomerId: string;
  onSuccess: () => void;
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!);

export default function StripeCheckout(props: StripeCheckoutProps) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  );
}

function CheckoutForm({
  plan,
  stripeCustomerId,
  onSuccess,
}: StripeCheckoutProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!stripe || !elements) {
      setError('Stripe not loaded');
      setLoading(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError('Card element not found');
      setLoading(false);
      return;
    }

    const { error: methodError, paymentMethod } =
      await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

    if (methodError || !paymentMethod) {
      setError(methodError?.message || 'Payment method creation failed');
      setLoading(false);
      return;
    }

    const res = await fetch('/api/stripe/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personalInfo: {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          address: '123 Test St',
          city: 'Testville',
          state: 'CA',
          zipCode: '90001',
        },
        agreeToTerms: true,
        subscribeToNewsletter: false,
        paymentMethodId: paymentMethod.id,
        stripeCustomerId,
        planId: plan.id,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Something went wrong');
      setLoading(false);
      return;
    }

    // Handle subscription success
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md">
        <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-200">
          Card Details
        </label>
        <div className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900">
          <CardElement options={{ hidePostalCode: true }} />
        </div>
      </div>

      {error && (
        <div className="text-red-600 font-medium text-sm">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={!stripe || loading}
        className="w-full"
      >
        {loading
          ? 'Processing...'
          : `Subscribe for $${plan.price.toFixed(2)}/${plan.interval === 'month' ? 'mo' : 'yr'}`}
      </Button>
    </form>
  );
}
