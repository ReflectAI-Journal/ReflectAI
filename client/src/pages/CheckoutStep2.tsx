import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useLocation } from 'wouter';
import { ArrowLeft, Lock, Shield, CreditCard, Check, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement } from '@stripe/react-stripe-js';
import BackButton from '@/components/ui/back-button';
import { Loader2 } from 'lucide-react';

export default function CheckoutStep2() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const stripe = useStripe();
  const elements = useElements();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [personalInfo, setPersonalInfo] = useState<any>(null);
  const [plan, setPlan] = useState<any>(null);

  useEffect(() => {
    // Get personal info from sessionStorage
    const savedInfo = sessionStorage.getItem('checkoutPersonalInfo');
    if (savedInfo) {
      setPersonalInfo(JSON.parse(savedInfo));
    } else {
      // Redirect back to step 1 if no personal info
      navigate('/checkout-step1');
      return;
    }

    // Get plan from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const planId = urlParams.get('plan');
    
    // Mock plan data - in real implementation, fetch from API
    const plans = {
      'pro-monthly': { id: 'pro-monthly', name: 'Pro', price: 14.99, interval: 'month' },
      'pro-annually': { id: 'pro-annually', name: 'Pro', price: 152.90, interval: 'year' },
      'unlimited-monthly': { id: 'unlimited-monthly', name: 'Unlimited', price: 24.99, interval: 'month' },
      'unlimited-annually': { id: 'unlimited-annually', name: 'Unlimited', price: 254.90, interval: 'year' }
    };
    
    if (planId && plans[planId as keyof typeof plans]) {
      setPlan(plans[planId as keyof typeof plans]);
    } else {
      navigate('/subscription');
    }
  }, [navigate]);

  const handleBackToStep1 = () => {
    navigate('/checkout-step1' + window.location.search);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements || !personalInfo || !plan) return;
    
    setIsProcessing(true);

    try {
      // Create payment method with Stripe Elements
      const cardElement = elements.getElement(CardNumberElement);
      if (!cardElement) throw new Error('Card element not found');

      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: `${personalInfo.firstName} ${personalInfo.lastName}`,
          email: personalInfo.email,
          address: {
            line1: personalInfo.address,
            city: personalInfo.city,
            state: personalInfo.state,
            postal_code: personalInfo.zipCode,
            country: 'US',
          },
        },
      });

      if (paymentMethodError) {
        throw new Error(paymentMethodError.message);
      }

      // Create subscription with embedded payment method
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          planId: plan.id,
          paymentMethodId: paymentMethod.id,
          subscribeToNewsletter: personalInfo.subscribeToNewsletter,
          firstName: personalInfo.firstName,
          lastName: personalInfo.lastName,
          email: personalInfo.email,
          address: personalInfo.address,
          city: personalInfo.city,
          state: personalInfo.state,
          zipCode: personalInfo.zipCode,
          dateOfBirth: personalInfo.dateOfBirth
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create subscription');
      }

      const result = await response.json();

      // Clear session storage
      sessionStorage.removeItem('checkoutPersonalInfo');

      toast({
        title: 'Payment Successful!',
        description: 'Your subscription has been activated.',
      });
      
      navigate('/checkout-success?plan=' + plan.id);
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: 'Payment Error',
        description: error.message || 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!personalInfo || !plan) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-950/20 dark:to-purple-950/20">
      <div className="max-w-4xl mx-auto p-8 py-16">
        <BackButton />
        
        {/* Progress Steps */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center">
                <Check className="h-4 w-4" />
              </div>
              <span className="font-medium text-green-600">Choose Plan</span>
            </div>
            <div className="w-16 h-1 bg-green-600 rounded-full"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center">
                <Check className="h-4 w-4" />
              </div>
              <span className="font-medium text-green-600">Personal Info</span>
            </div>
            <div className="w-16 h-1 bg-green-600 rounded-full"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
              <span className="font-medium text-blue-600">Payment</span>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600/10 to-purple-600/10 px-6 py-3 rounded-2xl border border-blue-200/50 dark:border-blue-700/50 mb-6">
            <Shield className="h-6 w-6 text-blue-600" />
            <span className="text-sm font-semibold text-blue-600">256-bit SSL Encrypted & PCI Compliant</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Complete Your Purchase
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Secure payment powered by Stripe. Your information is protected with bank-level security.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <div>
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-2 border-gray-200 dark:border-gray-700 shadow-2xl">
              <CardHeader className="pb-8">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold flex items-center gap-3">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                      <CreditCard className="h-6 w-6 text-blue-600" />
                    </div>
                    Payment Information
                  </CardTitle>
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">Secure</span>
                  </div>
                </div>
                
                {/* Trust Badges */}
                <div className="flex items-center justify-center gap-6 mt-6 p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">SSL Secure</span>
                  </div>
                  <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
                  <div className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">PCI Compliant</span>
                  </div>
                  <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Powered by <span className="text-blue-600 font-semibold">Stripe</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-8">
                {/* Back to Step 1 Button */}
                <Button
                  onClick={handleBackToStep1}
                  variant="outline"
                  className="flex items-center gap-2 mb-6"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Edit Personal Information
                </Button>

                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Card Details */}
                  <div className="space-y-6">
                    <div className="text-base text-muted-foreground p-5 bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border-2 border-blue-200/50 dark:border-blue-700/50">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                          <Lock className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-gray-100">Secure Payment Processing</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Your payment information is encrypted and never stored on our servers</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Card Number */}
                    <div>
                      <Label className="text-base font-semibold mb-3 block flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-blue-600" />
                        Card number*
                      </Label>
                      <div className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-950 hover:border-blue-400/50 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all duration-200 h-14 flex items-center shadow-sm">
                        <div className="w-full">
                          <CardNumberElement
                            options={{
                              style: {
                                base: {
                                  fontSize: '16px',
                                  color: '#1f2937',
                                  fontFamily: 'Inter, system-ui, sans-serif',
                                  lineHeight: '24px',
                                  '::placeholder': { color: '#9ca3af' },
                                },
                                dark: {
                                  color: '#f9fafb',
                                }
                              },
                              showIcon: true,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Expiry and CVC */}
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <Label className="text-base font-semibold mb-3 block flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-purple-600" />
                          Expiry date*
                        </Label>
                        <div className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-950 hover:border-blue-400/50 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all duration-200 h-14 flex items-center shadow-sm">
                          <div className="w-full">
                            <CardExpiryElement
                              options={{
                                style: {
                                  base: {
                                    fontSize: '16px',
                                    color: '#1f2937',
                                    fontFamily: 'Inter, system-ui, sans-serif',
                                    lineHeight: '24px',
                                    '::placeholder': { color: '#9ca3af' },
                                  },
                                  dark: {
                                    color: '#f9fafb',
                                  }
                                },
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-base font-semibold mb-3 block flex items-center gap-2">
                          <Shield className="h-4 w-4 text-green-600" />
                          Security code*
                        </Label>
                        <div className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-950 hover:border-blue-400/50 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all duration-200 h-14 flex items-center shadow-sm">
                          <div className="w-full">
                            <CardCvcElement
                              options={{
                                style: {
                                  base: {
                                    fontSize: '16px',
                                    color: '#1f2937',
                                    fontFamily: 'Inter, system-ui, sans-serif',
                                    lineHeight: '24px',
                                    '::placeholder': { color: '#9ca3af' },
                                  },
                                  dark: {
                                    color: '#f9fafb',
                                  }
                                },
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="bg-blue-50/50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-6">
                    <div className="flex items-start space-x-4">
                      <Checkbox
                        id="agreeToTerms"
                        checked={agreeToTerms}
                        onCheckedChange={setAgreeToTerms}
                        className="mt-2 h-5 w-5"
                      />
                      <label htmlFor="agreeToTerms" className="text-base font-medium leading-relaxed">
                        I authorize ReflectAI to charge me automatically until I cancel. I agree to the{' '}
                        <a href="/terms-of-service" target="_blank" className="text-blue-600 hover:underline font-semibold">
                          Terms of Use
                        </a>{' '}
                        and{' '}
                        <a href="/privacy-policy" target="_blank" className="text-blue-600 hover:underline font-semibold">
                          Privacy Policy
                        </a>
                        .
                      </label>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <Button
                      type="submit"
                      disabled={!stripe || isProcessing || !agreeToTerms}
                      className="w-full h-16 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 hover:from-blue-700 hover:via-blue-800 hover:to-purple-700 text-white font-bold text-xl rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative z-10 flex items-center justify-center">
                        {isProcessing ? (
                          <>
                            <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                            <span className="tracking-wide">Processing your payment securely...</span>
                          </>
                        ) : (
                          <>
                            <Lock className="h-5 w-5 mr-3" />
                            <span className="tracking-wide">Complete Secure Purchase • ${plan.price}</span>
                          </>
                        )}
                      </div>
                    </Button>
                    
                    {/* Security Footer */}
                    <div className="mt-4 text-center">
                      <div className="flex items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Shield className="h-4 w-4 text-green-600" />
                          <span>256-bit SSL</span>
                        </div>
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        <div className="flex items-center gap-1">
                          <Lock className="h-4 w-4 text-blue-600" />
                          <span>PCI DSS Compliant</span>
                        </div>
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        <span>Powered by Stripe</span>
                      </div>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <div className="sticky top-8 space-y-8">
              {/* Plan Summary */}
              <Card className="bg-gradient-to-br from-blue-600 to-purple-600 text-white border-0 shadow-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4">{plan.name} Plan</h3>
                  <div className="text-5xl font-bold mb-4">${plan.price}</div>
                  <div className="bg-white/20 rounded-xl px-4 py-2 text-lg font-semibold inline-block">
                    🎁 3-day free trial
                  </div>
                </CardContent>
              </Card>

              {/* Customer Info */}
              <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-2 shadow-xl">
                <CardContent className="p-6">
                  <h4 className="font-bold text-lg mb-4">Billing Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>{personalInfo.firstName} {personalInfo.lastName}</strong></p>
                    <p>{personalInfo.email}</p>
                    <p>{personalInfo.address}</p>
                    <p>{personalInfo.city}, {personalInfo.state} {personalInfo.zipCode}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Security Badge */}
              <Card className="bg-green-50/80 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center gap-3 text-lg font-bold text-green-700 dark:text-green-400 mb-2">
                    <Shield className="h-6 w-6" />
                    <span>Secure Payment</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Protected by Stripe</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}