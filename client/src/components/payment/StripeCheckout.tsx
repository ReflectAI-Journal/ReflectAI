import React, { useState, useEffect } from 'react';
import {
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CreditCard, Lock, MapPin, Calendar } from 'lucide-react';
import { useLocation } from 'wouter';

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
  
  // State to track Stripe initialization
  const [stripeReady, setStripeReady] = useState(false);
  
  // Check if Stripe is ready
  useEffect(() => {
    if (stripe && elements) {
      setStripeReady(true);
    }
  }, [stripe, elements]);
  
  // Show loading while Stripe initializes
  if (!stripeReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading payment form...</p>
        </div>
      </div>
    );
  }
  
  // Form state for additional fields
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    dateOfBirth: '',
    agreeToTerms: false,
    subscribeToNewsletter: false
  });

  // Get theme-aware color for Stripe elements
  const getStripeTextColor = () => {
    const isDark = document.documentElement.classList.contains('dark');
    return isDark ? '#ffffff' : '#424770';
  };

  const getStripePlaceholderColor = () => {
    const isDark = document.documentElement.classList.contains('dark');
    return isDark ? '#9ca3af' : '#aab7c4';
  };

  const handleInputChange = (field: string, value: string | boolean) => {
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
      if (!formData.address || !formData.city || !formData.zipCode || !formData.dateOfBirth) {
        throw new Error('Please fill in all required fields');
      }

      if (!formData.agreeToTerms) {
        throw new Error('You must agree to the Terms and Conditions to subscribe');
      }

      // Validate age from date of birth
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear() - 
        (today.getMonth() < birthDate.getMonth() || 
         (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate()) ? 1 : 0);

      if (age < 13) {
        throw new Error('You must be at least 13 years old to subscribe');
      }

      // Get the card element to create payment method with Stripe
      const cardElement = elements.getElement(CardElement);
      
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Create payment method with credit card information
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          address: {
            line1: formData.address,
            city: formData.city,
            state: formData.state,
            postal_code: formData.zipCode,
            country: formData.country,
          },
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to process payment method');
      }

      console.log('Payment method created:', paymentMethod.id);

      // Send payment method and billing info to create subscription
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          planId: plan.id,
          personalInfo: formData,
          agreeToTerms: formData.agreeToTerms,
          billingDetails: {
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            country: formData.country,
          },
          subscribeToNewsletter: formData.subscribeToNewsletter
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create subscription');
      }

      console.log('Subscription created successfully');

      // If the backend returns a client_secret, confirm the payment using confirmCardPayment
      if (data.clientSecret) {
        const { error: confirmError } = await stripe.confirmCardPayment(data.clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: { 
              name: 'Caleb Lozier',
              address: {
                line1: formData.address,
                city: formData.city,
                state: formData.state,
                postal_code: formData.zipCode,
                country: formData.country,
              },
            }
          }
        });

        if (confirmError) {
          throw new Error(confirmError.message);
        }
      }

      // For trial subscriptions, no payment confirmation is needed
      // The payment method is already attached to the customer for future use
      console.log('Trial subscription created successfully - no payment confirmation needed');
      
      // Redirect to success page
      window.location.href = '/checkout-success?plan=' + plan.id;
    } catch (error: any) {
      console.error('Payment error details:', error);
      
      let errorMessage = 'There was an error processing your payment.';
      
      if (error && error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && error.error) {
        errorMessage = error.error;
      }
      
      toast({
        title: 'Payment Failed',
        description: errorMessage,
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
        color: getStripeTextColor(),
        '::placeholder': {
          color: getStripePlaceholderColor(),
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
            <Label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Date of Birth *
            </Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              className="mt-1 rounded-lg border focus:border-blue-500 transition-colors"
              max={new Date().toISOString().split('T')[0]} // Prevent future dates
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

        {/* Agreement Checkboxes */}
        <div className="space-y-4 border-t border-gray-200 dark:border-gray-600 pt-6">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="agreeToTerms"
              checked={formData.agreeToTerms}
              onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked as boolean)}
              className="mt-1"
            />
            <Label 
              htmlFor="agreeToTerms" 
              className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed cursor-pointer"
            >
              I agree to the{' '}
              <a 
                href="/terms-of-service" 
                target="_blank" 
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Terms and Conditions
              </a>{' '}
              and{' '}
              <a 
                href="/privacy-policy" 
                target="_blank" 
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Privacy Policy
              </a>{' '}
              *
            </Label>
          </div>
          
          <div className="flex items-start space-x-3">
            <Checkbox
              id="subscribeToNewsletter"
              checked={formData.subscribeToNewsletter}
              onCheckedChange={(checked) => handleInputChange('subscribeToNewsletter', checked as boolean)}
              className="mt-1"
            />
            <Label 
              htmlFor="subscribeToNewsletter" 
              className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed cursor-pointer"
            >
              I want to receive newsletters and alerts about new features and updates
            </Label>
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={!stripe || isProcessing || !formData.agreeToTerms}
          className="w-full h-12 text-base font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
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

        <StripeCheckoutForm plan={plan} onSuccess={onSuccess} />
      </div>
    </div>
  );
}