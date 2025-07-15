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

      // Create payment intent on the server
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          amount: plan.price,
          planId: plan.id,
          billingAddress: formData
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

      // Confirm payment with billing details
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            address: {
              line1: formData.address,
              city: formData.city,
              state: formData.state,
              postal_code: formData.zipCode,
              country: formData.country,
            }
          }
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
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Personal Information Section */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 p-6 rounded-3xl border-2 border-blue-100 dark:border-blue-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <span className="font-semibold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
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
              className="mt-1 rounded-2xl border-2 border-blue-200 focus:border-purple-400 transition-colors"
              min="13"
              max="120"
              required
            />
          </div>
        </div>
      </div>

      {/* Billing Address Section */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-6 rounded-3xl border-2 border-purple-100 dark:border-purple-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
            <MapPin className="h-5 w-5 text-white" />
          </div>
          <span className="font-semibold text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
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
              className="mt-1 rounded-2xl border-2 border-purple-200 focus:border-pink-400 transition-colors"
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
              className="mt-1 rounded-2xl border-2 border-purple-200 focus:border-pink-400 transition-colors"
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
              className="mt-1 rounded-2xl border-2 border-purple-200 focus:border-pink-400 transition-colors"
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
              className="mt-1 rounded-2xl border-2 border-purple-200 focus:border-pink-400 transition-colors"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="country" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Country
            </Label>
            <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
              <SelectTrigger className="mt-1 rounded-2xl border-2 border-purple-200 focus:border-pink-400">
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
      <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/20 dark:to-teal-950/20 p-6 rounded-3xl border-2 border-green-100 dark:border-green-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-full">
            <CreditCard className="h-5 w-5 text-white" />
          </div>
          <span className="font-semibold text-lg bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
            Payment Information
          </span>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border-2 border-green-200 dark:border-green-700">
          <CardElement options={cardElementOptions} />
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-4">
          <Lock className="h-4 w-4" />
          <span>Your payment information is secure and encrypted with 256-bit SSL</span>
        </div>
      </div>

      {/* Total and Submit Section */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 p-6 rounded-3xl border-2 border-yellow-100 dark:border-yellow-800">
        <div className="flex justify-between items-center py-4 px-2">
          <span className="font-semibold text-lg text-gray-700 dark:text-gray-300">Total</span>
          <span className="font-bold text-2xl bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
            ${plan.price.toFixed(2)}/{plan.interval === 'month' ? 'mo' : 'yr'}
          </span>
        </div>

        <Button 
          type="submit" 
          disabled={!stripe || isProcessing}
          className="w-full h-14 text-lg font-semibold rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-3 h-5 w-5 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              🎉 Subscribe to {plan.name} Now!
            </>
          )}
        </Button>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700">
          🔒 By subscribing, you agree to our Terms of Service and Privacy Policy. <br />
          💫 You can cancel anytime from your account settings - no hidden fees!
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
      <div className="bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-indigo-950/20 dark:via-gray-900 dark:to-cyan-950/20 p-8 rounded-3xl border-2 border-indigo-100 dark:border-indigo-800 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full shadow-lg">
              <CreditCard className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
              Almost There! 🚀
            </h2>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Complete your subscription to <span className="font-semibold text-indigo-600 dark:text-indigo-400">{plan.name}</span>
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
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