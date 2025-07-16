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
    <div className="min-h-screen w-full bg-background p-0 m-0">
      {/* Trust Header */}
      <div className="text-center py-6 px-6 bg-background border-b-2 border-border">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Shield className="h-6 w-6 text-green-500" />
          <h1 className="text-2xl font-bold text-foreground">Secure Checkout</h1>
        </div>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2">
          <span>Powered by</span>
          <div className="text-lg font-bold text-primary tracking-wide">stripe</div>
        </div>
        <div className="flex items-center justify-center gap-4 text-xs text-green-500 mb-3">
          <div className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            <span>256-bit SSL encryption</span>
          </div>
          <div className="flex items-center gap-1">
            <Lock className="h-3 w-3" />
            <span>PCI DSS compliant</span>
          </div>
        </div>
        <p className="text-muted-foreground text-sm">Your payment information is encrypted and secure</p>
      </div>



      {/* Main Content - Clean Two Column Layout */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Payment Form */}
          <div className="lg:col-span-2 order-1">
            <div className="space-y-8">
              <div>
                <h1 className="text-2xl font-semibold text-foreground mb-8">Payment method</h1>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Card Payment Section */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-2 border-green-200 dark:border-green-800 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">💳</span>
                      </div>
                      <span className="font-semibold text-foreground text-lg">Card Payment</span>
                      <div className="flex gap-2 ml-auto">
                        <div className="w-8 h-5 bg-blue-600 rounded-sm flex items-center justify-center text-white text-xs font-bold">V</div>
                        <div className="w-8 h-5 bg-red-600 rounded-sm flex items-center justify-center text-white text-xs font-bold">MC</div>
                        <div className="w-8 h-5 bg-blue-500 rounded-sm flex items-center justify-center text-white text-xs font-bold">AE</div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-6 p-3 bg-blue-50 dark:bg-blue-950/50 rounded-lg border border-blue-200 dark:border-blue-800">
                      🔒 Your card details are encrypted and secure. We may temporarily hold a small amount to verify your card.
                    </p>
                    
                    <div className="space-y-4">
                      {/* Card Number */}
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground mb-2 block">Card number*</Label>
                        <div className="p-4 border-2 border-border rounded-xl bg-white dark:bg-gray-900 hover:border-green-400 focus-within:border-green-400 transition-colors duration-200 min-h-[56px] cursor-text shadow-sm">
                          <CardNumberElement
                            options={{
                              style: {
                                base: {
                                  fontSize: '16px',
                                  color: '#1f2937',
                                  fontFamily: 'Inter, system-ui, sans-serif',
                                  fontWeight: '400',
                                  lineHeight: '1.5',
                                  '::placeholder': {
                                    color: '#9ca3af',
                                  },
                                },
                                invalid: {
                                  color: '#ef4444',
                                  iconColor: '#ef4444',
                                },
                                complete: {
                                  color: '#059669',
                                  iconColor: '#059669',
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
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground mb-2 block">Expiry date*</Label>
                          <div className="p-4 border-2 border-border rounded-xl bg-white dark:bg-gray-900 hover:border-green-400 focus-within:border-green-400 transition-colors duration-200 min-h-[56px] cursor-text shadow-sm">
                            <CardExpiryElement
                              options={{
                                style: {
                                  base: {
                                    fontSize: '16px',
                                    color: '#1f2937',
                                    fontFamily: 'Inter, system-ui, sans-serif',
                                    fontWeight: '400',
                                    lineHeight: '1.5',
                                    '::placeholder': {
                                      color: '#9ca3af',
                                    },
                                  },
                                  invalid: {
                                    color: '#ef4444',
                                  },
                                  complete: {
                                    color: '#059669',
                                  },
                                },
                              }}
                              onReady={() => console.log('Expiry ready')}
                              onChange={(event) => console.log('Expiry changed:', event.complete)}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground mb-2 block">Security code*</Label>
                          <div className="p-4 border-2 border-border rounded-xl bg-white dark:bg-gray-900 hover:border-green-400 focus-within:border-green-400 transition-colors duration-200 min-h-[56px] cursor-text shadow-sm">
                            <CardCvcElement
                              options={{
                                style: {
                                  base: {
                                    fontSize: '16px',
                                    color: '#1f2937',
                                    fontFamily: 'Inter, system-ui, sans-serif',
                                    fontWeight: '400',
                                    lineHeight: '1.5',
                                    '::placeholder': {
                                      color: '#9ca3af',
                                    },
                                  },
                                  invalid: {
                                    color: '#ef4444',
                                  },
                                  complete: {
                                    color: '#059669',
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

                  {/* Personal Information */}
                  <div>
                    <h2 className="text-xl font-semibold text-foreground mb-6">Enter your name and address</h2>
                    
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
                              <SelectItem value="US">🇺🇸 USA</SelectItem>
                              <SelectItem value="CA">🇨🇦 Canada</SelectItem>
                              <SelectItem value="GB">🇬🇧 United Kingdom</SelectItem>
                              <SelectItem value="AU">🇦🇺 Australia</SelectItem>
                              <SelectItem value="DE">🇩🇪 Germany</SelectItem>
                              <SelectItem value="FR">🇫🇷 France</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="state" className="text-sm text-muted-foreground">State/Region*</Label>
                          <Input
                            id="state"
                            type="text"
                            value={formData.state}
                            onChange={(e) => handleInputChange('state', e.target.value)}
                            className="mt-1"
                            placeholder="Enter state"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="city" className="text-sm text-muted-foreground">City*</Label>
                          <Input
                            id="city"
                            type="text"
                            value={formData.city}
                            onChange={(e) => handleInputChange('city', e.target.value)}
                            className="mt-1"
                            placeholder="Enter city"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="zipCode" className="text-sm text-muted-foreground">Zip/Postal code*</Label>
                          <Input
                            id="zipCode"
                            type="text"
                            value={formData.zipCode}
                            onChange={(e) => handleInputChange('zipCode', e.target.value)}
                            className="mt-1"
                            placeholder="Enter zip code"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="address" className="text-sm text-muted-foreground">Address line 1*</Label>
                        <Input
                          id="address"
                          type="text"
                          value={formData.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          className="mt-1"
                          placeholder="Enter street address"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="email" className="text-sm text-muted-foreground">Email*</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="mt-1"
                          placeholder="Enter email address"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Terms & Agreement */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-2 border-purple-200 dark:border-purple-800 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked)}
                        className="mt-1 data-[state=checked]:bg-purple-500 border-purple-300"
                      />
                      <label htmlFor="agreeToTerms" className="text-sm text-foreground leading-relaxed">
                        ✅ I authorize ReflectAI to charge me automatically until I cancel my subscription. I have read and agree to{' '}
                        <a href="/terms-of-service" target="_blank" className="text-purple-600 hover:text-purple-800 hover:underline font-medium">
                          Terms of Use
                        </a>{' '}
                        and{' '}
                        <a href="/privacy-policy" target="_blank" className="text-purple-600 hover:text-purple-800 hover:underline font-medium">
                          Privacy Policy
                        </a>
                        .
                      </label>
                    </div>
                  </div>

                  {/* Complete Purchase Button */}
                  <div className="space-y-4">
                    <Button
                      type="submit"
                      className="w-full h-16 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                      disabled={!stripe || isProcessing || !formData.agreeToTerms}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                          Processing your secure payment...
                        </>
                      ) : (
                        <>
                          <Lock className="h-6 w-6 mr-3" />
                          Complete your purchase
                          <span className="ml-2">🚀</span>
                        </>
                      )}
                    </Button>
                    
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                      <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Shield className="h-4 w-4 text-green-600" />
                          <span>256-bit SSL encryption</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Check className="h-4 w-4 text-green-600" />
                          <span>PCI DSS compliant</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>💳</span>
                          <span>Powered by Stripe</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Your payment information is encrypted and secure
                      </p>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1 order-2">
            <div className="sticky top-6 space-y-4">
              {/* Plan Header */}
              <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">✨</span>
                  <h3 className="text-xl font-bold">{plan.name} plan</h3>
                </div>
                <div className="text-3xl font-bold mb-2">${plan.price}</div>
                <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium inline-block">
                  🎉 7-day free trial included
                </div>
              </div>

              {/* Promo Code */}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 border-2 border-yellow-200 dark:border-yellow-800 rounded-2xl p-4">
                <p className="text-sm text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium flex items-center gap-2">
                  🎫 Have a promo code?
                </p>
              </div>
              
              {/* Billing Breakdown */}
              <div className="bg-gradient-to-br from-gray-50 to-slate-100 dark:from-gray-900 dark:to-slate-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">📋 Subtotal</span>
                    <span className="font-medium">${plan.price}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">💰 Tax</span>
                    <span className="font-medium text-green-600">$0.00</span>
                  </div>
                  <div className="border-t-2 border-gray-300 dark:border-gray-600 pt-3">
                    <div className="flex justify-between font-bold text-lg">
                      <span>🎯 Total</span>
                      <span className="text-indigo-600">US ${plan.price}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <span>🔄</span>
                      Billed every {plan.interval}
                    </p>
                  </div>
                </div>
              </div>

              {/* Security Badge */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-2 border-green-200 dark:border-green-800 rounded-2xl p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-sm font-medium text-green-700 dark:text-green-400">
                  <Shield className="h-4 w-4" />
                  <span>🔒 Secure Payment</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Protected by Stripe
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}