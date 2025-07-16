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
  
  // Get theme-aware color for Stripe elements
  const getStripeTextColor = () => {
    const isDark = document.documentElement.classList.contains('dark');
    return isDark ? '#ffffff' : '#000000';
  };

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
        console.error('Backend error response:', errorData);
        throw new Error(errorData.error || errorData.message || 'Failed to create subscription');
      }

      const result = await response.json();
      console.log('Subscription creation result:', result);

      // If the backend returns a client_secret, confirm the payment using confirmCardPayment
      if (result.clientSecret) {
        const { error: confirmError } = await stripe.confirmCardPayment(result.clientSecret, {
          payment_method: {
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

      // Clear session storage
      sessionStorage.removeItem('checkoutPersonalInfo');

      toast({
        title: 'Payment Successful!',
        description: 'Your subscription has been activated.',
      });
      
      navigate('/checkout-success?plan=' + plan.id);
    } catch (error: any) {
      console.error('Payment error details:', error);
      
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (error && error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && error.error) {
        errorMessage = error.error;
      }
      
      toast({
        title: 'Payment Error',
        description: errorMessage,
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
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="max-w-6xl mx-auto p-6 py-12">
        <BackButton fallbackPath={`/checkout-step1${window.location.search}`} />
        
        {/* Progress Steps */}
        <div className="flex justify-center mb-16">
          <div className="flex items-center">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                <Check className="h-5 w-5" />
              </div>
              <span className="ml-3 text-sm font-medium text-green-600 dark:text-green-400">Choose Plan</span>
            </div>
            <div className="w-20 h-0.5 bg-green-500 mx-4"></div>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                <Check className="h-5 w-5" />
              </div>
              <span className="ml-3 text-sm font-medium text-green-600 dark:text-green-400">Personal Info</span>
            </div>
            <div className="w-20 h-0.5 bg-green-500 mx-4"></div>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <span className="ml-3 text-sm font-medium text-blue-600 dark:text-blue-400">Payment</span>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Complete Your Purchase
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Your payment is secured with industry-standard encryption
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Payment Form */}
          <div className="lg:col-span-3">
            <Card className="border border-gray-200 dark:border-gray-800 shadow-lg">
              <CardHeader className="pb-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold flex items-center gap-3 text-gray-900 dark:text-white">
                    <CreditCard className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    Payment Information
                  </CardTitle>
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <Shield className="h-4 w-4" />
                    <span className="text-sm font-medium">Secure</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {/* Back to Step 1 Button */}
                <Button
                  onClick={handleBackToStep1}
                  variant="ghost"
                  className="flex items-center gap-2 mb-8 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Edit Personal Information
                </Button>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Security Notice */}
                  <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                    <Lock className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">Secure Payment Processing</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Your payment information is encrypted and never stored on our servers</div>
                    </div>
                  </div>
                    
                  {/* Card Number */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">
                      Card number*
                    </Label>
                    <div className="p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 hover:border-gray-400 dark:hover:border-gray-600 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all h-12 flex items-center">
                      <div className="w-full">
                        <CardNumberElement
                          options={{
                            style: {
                              base: {
                                fontSize: '16px',
                                color: getStripeTextColor(),
                                fontFamily: 'Inter, system-ui, sans-serif',
                                lineHeight: '24px',
                                '::placeholder': { color: '#9ca3af' },
                              },
                              invalid: {
                                color: getStripeTextColor(),
                              }
                            },
                            showIcon: true,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Expiry and CVC */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">
                        Expiry date*
                      </Label>
                      <div className="p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 hover:border-gray-400 dark:hover:border-gray-600 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all h-12 flex items-center">
                        <div className="w-full">
                          <CardExpiryElement
                            options={{
                              style: {
                                base: {
                                  fontSize: '16px',
                                  color: getStripeTextColor(),
                                  fontFamily: 'Inter, system-ui, sans-serif',
                                  lineHeight: '24px',
                                  '::placeholder': { color: '#9ca3af' },
                                },
                                invalid: {
                                  color: getStripeTextColor(),
                                }
                              },
                            }}
                          />
                        </div>
                      </div>
                    </div>
                      
                    <div>
                      <Label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">
                        Security code*
                      </Label>
                      <div className="p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 hover:border-gray-400 dark:hover:border-gray-600 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all h-12 flex items-center">
                        <div className="w-full">
                          <CardCvcElement
                            options={{
                              style: {
                                base: {
                                  fontSize: '16px',
                                  color: getStripeTextColor(),
                                  fontFamily: 'Inter, system-ui, sans-serif',
                                  lineHeight: '24px',
                                  '::placeholder': { color: '#9ca3af' },
                                },
                                invalid: {
                                  color: getStripeTextColor(),
                                }
                              },
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                    <Checkbox
                      id="agreeToTerms"
                      checked={agreeToTerms}
                      onCheckedChange={setAgreeToTerms}
                      className="mt-0.5"
                    />
                    <label htmlFor="agreeToTerms" className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      I authorize ReflectAI to charge me automatically until I cancel. I agree to the{' '}
                      <a href="/terms-of-service" target="_blank" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                        Terms of Use
                      </a>{' '}
                      and{' '}
                      <a href="/privacy-policy" target="_blank" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                        Privacy Policy
                      </a>
                      .
                    </label>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <Button
                      type="submit"
                      disabled={!stripe || isProcessing || !agreeToTerms}
                      className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Processing payment...
                        </>
                      ) : (
                        <>
                          <Lock className="h-5 w-5 mr-2" />
                          Complete Secure Purchase • ${plan.price}
                        </>
                      )}
                    </Button>
                    
                    {/* Security Footer */}
                    <div className="mt-6 text-center">
                      <div className="flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          <span>256-bit SSL</span>
                        </div>
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        <div className="flex items-center gap-1">
                          <Lock className="h-3 w-3" />
                          <span>PCI Compliant</span>
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
          <div className="lg:col-span-2">
            <div className="sticky top-8">
              {/* Plan Summary */}
              <Card className="border border-gray-200 dark:border-gray-800 shadow-lg">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{plan.name} Plan</h3>
                  <div className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">${plan.price}</div>
                  <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-lg px-4 py-2 text-sm font-medium inline-block mb-6">
                    🎁 7-day free trial
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Billing Information</h4>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex justify-between">
                        <span>{personalInfo.firstName} {personalInfo.lastName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{personalInfo.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{personalInfo.address}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{personalInfo.city}, {personalInfo.state} {personalInfo.zipCode}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                      <Shield className="h-5 w-5" />
                      <span className="text-sm font-medium">Secure Payment</span>
                      <span className="text-xs">Protected by Stripe</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}