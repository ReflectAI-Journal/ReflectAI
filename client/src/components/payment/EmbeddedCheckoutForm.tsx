import React, { useState } from 'react';
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Lock, Shield, Check, Star } from 'lucide-react';
import { useLocation } from 'wouter';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: string;
  features: string[];
}

interface EmbeddedCheckoutFormProps {
  plan: SubscriptionPlan;
  clientSecret?: string;
  onSuccess?: () => void;
}

export default function EmbeddedCheckoutForm({ plan, clientSecret, onSuccess }: EmbeddedCheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [, navigate] = useLocation();
  
  // State to track Stripe initialization
  const [stripeReady, setStripeReady] = useState(false);
  
  // Check if Stripe is ready
  React.useEffect(() => {
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
  
  // Form state for minimal checkout
  const [formData, setFormData] = useState({
    agreeToTerms: false,
    subscribeToNewsletter: false
  });

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

    // Validate terms agreement
    if (!formData.agreeToTerms) {
      toast({
        title: 'Terms Agreement Required',
        description: 'Please agree to the Terms and Conditions to continue.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      const cardNumberElement = elements?.getElement(CardNumberElement);
      
      if (!cardNumberElement) {
        throw new Error('Card element not found');
      }

      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardNumberElement,
      });

      if (error) {
        throw error;
      }

      // Create subscription on the backend
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          planId: plan.id,
          customerInfo: {
            subscribeToNewsletter: formData.subscribeToNewsletter,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create subscription');
      }

      const result = await response.json();

      toast({
        title: 'Payment Successful!',
        description: 'Your subscription has been activated.',
      });
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/checkout-success?plan=' + plan.id);
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: 'Payment Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-950/20 dark:to-purple-950/20">
      {/* Enhanced Trust Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <Shield className="h-8 w-8 text-green-500" />
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Secure Checkout
              </h1>
            </div>
            <p className="text-xl text-muted-foreground mb-6">
              Complete your subscription with confidence
            </p>
            
            <div className="flex items-center justify-center gap-2 text-lg text-muted-foreground mb-6">
              <span>Powered by</span>
              <div className="text-2xl font-bold text-primary tracking-wide">stripe</div>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-8 text-base text-green-600 dark:text-green-400">
            <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 px-6 py-3 rounded-xl shadow-lg">
              <Shield className="h-6 w-6" />
              <span className="font-semibold">256-bit SSL encryption</span>
            </div>
            <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 px-6 py-3 rounded-xl shadow-lg">
              <Lock className="h-6 w-6" />
              <span className="font-semibold">PCI DSS compliant</span>
            </div>
          </div>
          <p className="text-center text-lg text-muted-foreground mt-6">Your payment information is encrypted and secure</p>
        </div>
      </div>

      {/* Enhanced Main Content Layout */}
      <div className="max-w-7xl mx-auto p-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left Column - Enhanced Payment Form */}
          <div className="lg:col-span-2 order-1">
            <div className="space-y-10">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-12 text-center">Complete Your Purchase</h2>
                
                <form onSubmit={handleSubmit} className="space-y-10">
                  {/* Enhanced Personal Information Section */}
                  <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 group">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                        <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-foreground">Personal Information</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="fullName" className="text-sm text-muted-foreground">Full name*</Label>
                        <Input
                          id="fullName"
                          type="text"
                          value={`${formData.firstName} ${formData.lastName}`.trim()}
                          onChange={(e) => {
                            const names = e.target.value.split(' ');
                            setFormData(prev => ({
                              ...prev,
                              firstName: names[0] || '',
                              lastName: names.slice(1).join(' ') || ''
                            }));
                          }}
                          className="mt-1"
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="country" className="text-sm text-muted-foreground">Country*</Label>
                          <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="US">🇺🇸 United States</SelectItem>
                              <SelectItem value="CA">🇨🇦 Canada</SelectItem>
                              <SelectItem value="GB">🇬🇧 United Kingdom</SelectItem>
                              <SelectItem value="AU">🇦🇺 Australia</SelectItem>
                              <SelectItem value="DE">🇩🇪 Germany</SelectItem>
                              <SelectItem value="FR">🇫🇷 France</SelectItem>
                              <SelectItem value="JP">🇯🇵 Japan</SelectItem>
                              <SelectItem value="BR">🇧🇷 Brazil</SelectItem>
                              <SelectItem value="IN">🇮🇳 India</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="address" className="text-sm text-muted-foreground">Address*</Label>
                          <Input
                            id="address"
                            type="text"
                            value={formData.address}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                            className="mt-1"
                            placeholder="Street address"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="city" className="text-sm text-muted-foreground">City*</Label>
                          <Input
                            id="city"
                            type="text"
                            value={formData.city}
                            onChange={(e) => handleInputChange('city', e.target.value)}
                            className="mt-1"
                            placeholder="City"
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="state" className="text-sm text-muted-foreground">State*</Label>
                          <Input
                            id="state"
                            type="text"
                            value={formData.state}
                            onChange={(e) => handleInputChange('state', e.target.value)}
                            className="mt-1"
                            placeholder="State/Province"
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="zipCode" className="text-sm text-muted-foreground">Postal code*</Label>
                          <Input
                            id="zipCode"
                            type="text"
                            value={formData.zipCode}
                            onChange={(e) => handleInputChange('zipCode', e.target.value)}
                            className="mt-1"
                            placeholder="ZIP/Postal code"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Card Payment Section */}
                  <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 group">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                        <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-foreground">Payment Method</h3>
                      <div className="flex gap-3 ml-auto">
                        <div className="w-12 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-lg">V</div>
                        <div className="w-12 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-lg">MC</div>
                        <div className="w-12 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-lg">AE</div>
                      </div>
                    </div>
                    
                    <div className="text-base text-muted-foreground mb-8 p-4 bg-green-50/50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                          <Lock className="h-4 w-4 text-green-500" />
                        </div>
                        <span className="font-medium">Your card details are encrypted and secure. We may temporarily hold a small amount to verify your card.</span>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      {/* Card Number */}
                      <div>
                        <Label className="text-base font-semibold text-muted-foreground mb-3 block">Card number*</Label>
                        <div className="p-4 border-2 border-input rounded-xl bg-background hover:border-blue-400/50 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all duration-200 min-h-[56px] cursor-text shadow-md hover:shadow-lg">
                          <CardNumberElement
                            options={{
                              style: {
                                base: {
                                  fontSize: '14px',
                                  color: 'hsl(var(--foreground))',
                                  fontFamily: 'Inter, system-ui, sans-serif',
                                  fontWeight: '400',
                                  lineHeight: '1.5',
                                  '::placeholder': {
                                    color: 'hsl(var(--muted-foreground))',
                                  },
                                },
                                invalid: {
                                  color: '#ef4444',
                                  iconColor: '#ef4444',
                                },
                                complete: {
                                  color: 'hsl(var(--foreground))',
                                  iconColor: 'hsl(var(--foreground))',
                                },
                              },
                              showIcon: true,
                            }}
                            onReady={() => console.log('Card number ready')}
                            onChange={(event) => console.log('Card number changed:', event.complete)}
                          />
                        </div>
                      </div>

                      {/* Expiry and CVC */}
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <Label className="text-base font-semibold text-muted-foreground mb-3 block">Expiry date*</Label>
                          <div className="p-4 border-2 border-input rounded-xl bg-background hover:border-blue-400/50 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all duration-200 min-h-[56px] cursor-text shadow-md hover:shadow-lg">
                            <CardExpiryElement
                              options={{
                                style: {
                                  base: {
                                    fontSize: '14px',
                                    color: 'hsl(var(--foreground))',
                                    fontFamily: 'Inter, system-ui, sans-serif',
                                    fontWeight: '400',
                                    lineHeight: '1.5',
                                    '::placeholder': {
                                      color: 'hsl(var(--muted-foreground))',
                                    },
                                  },
                                  invalid: {
                                    color: '#ef4444',
                                  },
                                  complete: {
                                    color: 'hsl(var(--foreground))',
                                  },
                                },
                              }}
                              onReady={() => console.log('Expiry ready')}
                              onChange={(event) => console.log('Expiry changed:', event.complete)}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-base font-semibold text-muted-foreground mb-3 block">Security code*</Label>
                          <div className="p-4 border-2 border-input rounded-xl bg-background hover:border-blue-400/50 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all duration-200 min-h-[56px] cursor-text shadow-md hover:shadow-lg">
                            <CardCvcElement
                              options={{
                                style: {
                                  base: {
                                    fontSize: '14px',
                                    color: 'hsl(var(--foreground))',
                                    fontFamily: 'Inter, system-ui, sans-serif',
                                    fontWeight: '400',
                                    lineHeight: '1.5',
                                    '::placeholder': {
                                      color: 'hsl(var(--muted-foreground))',
                                    },
                                  },
                                  invalid: {
                                    color: '#ef4444',
                                  },
                                  complete: {
                                    color: 'hsl(var(--foreground))',
                                  },
                                },
                              }}
                              onReady={() => console.log('CVC ready')}
                              onChange={(event) => console.log('CVC changed:', event.complete)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Terms & Agreement */}
                  <div className="bg-blue-50/50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-6 backdrop-blur-md shadow-lg">
                    <div className="flex items-start space-x-4">
                      <Checkbox
                        id="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked)}
                        className="mt-2 h-5 w-5"
                      />
                      <label htmlFor="agreeToTerms" className="text-base text-foreground leading-relaxed font-medium">
                        I authorize ReflectAI to charge me automatically until I cancel my subscription. I have read and agree to{' '}
                        <a href="/terms-of-service" target="_blank" className="text-blue-600 hover:text-blue-800 hover:underline font-semibold transition-colors duration-200">
                          Terms of Use
                        </a>{' '}
                        and{' '}
                        <a href="/privacy-policy" target="_blank" className="text-blue-600 hover:text-blue-800 hover:underline font-semibold transition-colors duration-200">
                          Privacy Policy
                        </a>
                        .
                      </label>
                    </div>
                  </div>

                  {/* Enhanced Complete Purchase Button */}
                  <div className="space-y-6 pt-4">
                    <Button
                      type="submit"
                      className="w-full h-16 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-xl rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      disabled={!stripe || isProcessing || !formData.agreeToTerms}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                          Processing your secure payment...
                        </>
                      ) : (
                        <>
                          <Lock className="h-5 w-5 mr-3" />
                          Complete your purchase
                        </>
                      )}
                    </Button>
                    
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Shield className="h-4 w-4 text-green-600" />
                          <span>SSL encryption</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Check className="h-4 w-4 text-green-600" />
                          <span>PCI compliant</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-indigo-600">stripe</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Your payment information is encrypted and secure
                      </p>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Enhanced Right Column - Order Summary */}
          <div className="lg:col-span-1 order-2">
            <div className="sticky top-8 space-y-8">
              {/* Enhanced Plan Header */}
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-2xl p-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-white/20 rounded-xl">
                      <span className="text-4xl">✨</span>
                    </div>
                    <h3 className="text-3xl font-bold">{plan.name} Plan</h3>
                  </div>
                  <div className="text-6xl font-bold mb-6">${plan.price}</div>
                  <div className="bg-white/25 backdrop-blur-md rounded-xl px-6 py-3 text-lg font-semibold inline-block">
                    🎁 7-day free trial included
                  </div>
                </div>
              </div>

              {/* Enhanced Promo Code */}
              <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:shadow-xl transition-all duration-300">
                <p className="text-lg text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-semibold flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Have a promo code?
                </p>
              </div>
              
              {/* Enhanced Billing Breakdown */}
              <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-2xl">
                <h4 className="text-xl font-bold mb-6 text-foreground">Order Summary</h4>
                <div className="space-y-6">
                  <div className="flex justify-between text-lg">
                    <span className="text-muted-foreground font-medium">Subtotal</span>
                    <span className="font-bold text-xl">${plan.price}</span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span className="text-muted-foreground font-medium">Tax</span>
                    <span className="font-bold text-xl text-green-600">$0.00</span>
                  </div>
                  <div className="border-t-2 border-gray-200 dark:border-gray-600 pt-6">
                    <div className="flex justify-between font-bold text-2xl">
                      <span>Total</span>
                      <span className="text-blue-600">US ${plan.price}</span>
                    </div>
                    <p className="text-base text-muted-foreground mt-4 font-medium">
                      Billed every {plan.interval}
                    </p>
                  </div>
                </div>
              </div>

              {/* Enhanced Security Badge */}
              <div className="bg-green-50/80 dark:bg-green-900/20 backdrop-blur-md border-2 border-green-200 dark:border-green-800 rounded-2xl p-6 text-center shadow-lg">
                <div className="flex items-center justify-center gap-3 text-lg font-bold text-green-700 dark:text-green-400 mb-2">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Shield className="h-6 w-6" />
                  </div>
                  <span>100% Secure Payment</span>
                </div>
                <p className="text-base text-muted-foreground font-medium">
                  Protected by Stripe's industry-leading security
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}