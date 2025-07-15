import React from 'react';
import { useLocation } from 'wouter';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import EmbeddedCheckoutForm from '@/components/payment/EmbeddedCheckoutForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

// Initialize Stripe with error handling
const stripePromise = (() => {
  try {
    const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!key || typeof key !== 'string' || key.length === 0) {
      console.warn('Stripe publishable key not found or invalid');
      return null;
    }
    return loadStripe(key);
  } catch (error) {
    console.error('Error loading Stripe:', error);
    return null;
  }
})();

export default function EmbeddedCheckout() {
  const [location] = useLocation();
  
  // Parse URL parameters with robust error handling
  let urlParams;
  try {
    // Ensure location is a string and handle edge cases
    const locationStr = location || '';
    const locationParts = locationStr.includes('?') ? locationStr.split('?') : [locationStr];
    const queryString = locationParts.length > 1 ? locationParts[1] : '';
    urlParams = new URLSearchParams(queryString || '');
  } catch (error) {
    console.error('Error parsing URL parameters:', error);
    urlParams = new URLSearchParams();
  }
  
  const planId = urlParams.get('planId') || 'pro-monthly';
  const planName = urlParams.get('planName') || 'Pro';
  const planPrice = urlParams.get('planPrice') || '$14.99';
  const isAnnual = urlParams.get('isAnnual') === 'true';

  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#6366f1',
      colorBackground: '#ffffff',
      colorText: '#1f2937',
      colorDanger: '#ef4444',
      fontFamily: 'Inter, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
  };

  const options = {
    appearance,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => window.history.back()}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-primary ml-4">Complete Your Subscription</h1>
        </div>

        {/* Stripe Elements Provider */}
        <Elements stripe={stripePromise} options={options}>
          <EmbeddedCheckoutForm 
            planId={planId}
            planName={planName}
            planPrice={planPrice}
            isAnnual={isAnnual}
          />
        </Elements>
      </div>
    </div>
  );
}