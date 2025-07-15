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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CreditCard, Lock, MapPin, Calendar } from 'lucide-react';
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
  
  // Form state for additional fields
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    age: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      // Validate required fields
      if (!formData.address || !formData.city || !formData.zipCode || !formData.age) {
        throw new Error('Please fill in all required fields');
      }

      if (parseInt(formData.age) < 13) {
        throw new Error('You must be at least 13 years old to subscribe');
      }

      // Create checkout session for subscription instead of one-time payment
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          planId: plan.id,
          billingAddress: formData
        }),
      });

      const data = await response.json();

      if (!data.url) {
        throw new Error('Failed to create checkout session');
      }

      // Redirect to Stripe hosted checkout for subscriptions
      // This ensures proper subscription creation and webhook handling
      window.location.href = data.url;
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
      {/* Personal Information Section */}
      <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <span className="font-semibold text-lg text-gray-900 dark:text-gray-100">
            Personal Information
          </span>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="age" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Age *
            </Label>
            <Input
              id="age"
              type="number"
              placeholder="Enter your age"
              value={formData.age}
              onChange={(e) => handleInputChange('age', e.target.value)}
              className="mt-1 rounded-lg border focus:border-blue-500 transition-colors"
              min="13"
              max="120"
              required
            />
          </div>
        </div>
      </div>

      {/* Billing Address Section */}
      <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-600 rounded-lg">
            <MapPin className="h-5 w-5 text-white" />
          </div>
          <span className="font-semibold text-lg text-gray-900 dark:text-gray-100">
            Billing Address
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="address" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Street Address *
            </Label>
            <Input
              id="address"
              type="text"
              placeholder="123 Main Street"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="mt-1 rounded-lg border focus:border-blue-500 transition-colors"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="city" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              City *
            </Label>
            <Input
              id="city"
              type="text"
              placeholder="New York"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className="mt-1 rounded-lg border focus:border-blue-500 transition-colors"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="state" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              State/Province
            </Label>
            <Input
              id="state"
              type="text"
              placeholder="NY"
              value={formData.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              className="mt-1 rounded-lg border focus:border-blue-500 transition-colors"
            />
          </div>
          
          <div>
            <Label htmlFor="zipCode" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              ZIP/Postal Code *
            </Label>
            <Input
              id="zipCode"
              type="text"
              placeholder="10001"
              value={formData.zipCode}
              onChange={(e) => handleInputChange('zipCode', e.target.value)}
              className="mt-1 rounded-lg border focus:border-blue-500 transition-colors"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="country" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Country
            </Label>
            <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
              <SelectTrigger className="mt-1 rounded-lg border focus:border-blue-500">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="US">United States</SelectItem>
                <SelectItem value="CA">Canada</SelectItem>
                <SelectItem value="GB">United Kingdom</SelectItem>
                <SelectItem value="AU">Australia</SelectItem>
                <SelectItem value="DE">Germany</SelectItem>
                <SelectItem value="FR">France</SelectItem>
                <SelectItem value="IT">Italy</SelectItem>
                <SelectItem value="ES">Spain</SelectItem>
                <SelectItem value="NL">Netherlands</SelectItem>
                <SelectItem value="SE">Sweden</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Payment Information Section */}
      <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-600 rounded-lg">
            <CreditCard className="h-5 w-5 text-white" />
          </div>
          <span className="font-semibold text-lg text-gray-900 dark:text-gray-100">
            Payment Information
          </span>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
          <CardElement options={cardElementOptions} />
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-4">
          <Lock className="h-4 w-4" />
          <span>Your payment information is secure and encrypted</span>
        </div>
      </div>

      {/* Total and Submit Section */}
      <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center py-4 px-2 border-b border-gray-200 dark:border-gray-600 mb-6">
          <span className="font-semibold text-lg text-gray-700 dark:text-gray-300">Total</span>
          <span className="font-bold text-2xl text-gray-900 dark:text-gray-100">
            ${plan.price.toFixed(2)}/{plan.interval === 'month' ? 'mo' : 'yr'}
          </span>
        </div>

        <Button 
          type="submit" 
          disabled={!stripe || isProcessing}
          className="w-full h-12 text-base font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              Subscribe to {plan.name}
            </>
          )}
        </Button>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          By subscribing, you agree to our Terms of Service and Privacy Policy. 
          You can cancel anytime from your account settings.
        </p>
      </div>
    </form>
  );
}

interface StripeCheckoutProps {
  plan: SubscriptionPlan;
  onSuccess: () => void;
}

export default function StripeCheckout({ plan, onSuccess }: StripeCheckoutProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-lg">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Complete Your Subscription
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Subscribe to <span className="font-semibold text-blue-600 dark:text-blue-400">{plan.name}</span>
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {plan.description}
          </p>
        </div>

        <Elements stripe={stripePromise}>
          <StripeCheckoutForm plan={plan} onSuccess={onSuccess} />
        </Elements>
      </div>
    </div>
  );
}