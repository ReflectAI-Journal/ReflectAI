import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, ArrowRight, CreditCard } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import BackButton from '@/components/ui/back-button';

export default function CheckoutStep2() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [subscribeToNewsletter, setSubscribeToNewsletter] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [personalInfo, setPersonalInfo] = useState<any>(null);
  const [planId, setPlanId] = useState<string>('');

  useEffect(() => {
    // Get personal info from session storage
    const storedPersonalInfo = sessionStorage.getItem('checkoutPersonalInfo');
    if (storedPersonalInfo) {
      setPersonalInfo(JSON.parse(storedPersonalInfo));
    } else {
      // If no personal info, redirect back to step 1
      navigate('/checkout-step1');
      return;
    }

    // Get plan from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const plan = urlParams.get('plan');
    if (plan) {
      setPlanId(plan);
    } else {
      // If no plan, redirect to subscription page
      navigate('/subscription');
      return;
    }
  }, [navigate]);

  const handleContinueToPayment = async () => {
    if (!agreeToTerms) {
      toast({
        title: 'Terms Required',
        description: 'Please agree to the terms and conditions to continue.',
        variant: 'destructive',
      });
      return;
    }

    if (!personalInfo || !planId) {
      toast({
        title: 'Missing Information',
        description: 'Please complete all required information.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create Stripe checkout session with personal info
      const response = await apiRequest({
        method: 'POST',
        url: '/api/create-checkout-session',
        body: {
          planId,
          personalInfo,
          agreeToTerms,
          subscribeToNewsletter
        }
      });

      const data = await response.json();
      
      if (data.sessionId || data.url) {
        // Redirect to Stripe checkout using the URL from the response
        if (data.url) {
          window.location.href = data.url;
        } else {
          // Fallback: try to construct the URL or use Stripe SDK
          const stripe = (window as any).Stripe;
          if (stripe) {
            await stripe.redirectToCheckout({
              sessionId: data.sessionId
            });
          } else {
            // Last resort: try to construct URL (this might not work)
            window.location.href = `https://checkout.stripe.com/pay/${data.sessionId}`;
          }
        }
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: 'Checkout Error',
        description: error.message || 'Failed to start checkout process. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Map plan IDs to readable names
  const getPlanName = (planId: string) => {
    const planMap: Record<string, string> = {
      'pro-monthly': 'ReflectAI Pro - Monthly',
      'pro-annually': 'ReflectAI Pro - Annual',
      'unlimited-monthly': 'ReflectAI Unlimited - Monthly',
      'unlimited-annually': 'ReflectAI Unlimited - Annual'
    };
    return planMap[planId] || planId;
  };

  if (!personalInfo || !planId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-950/20 dark:to-purple-950/20">
        <div className="max-w-2xl mx-auto p-8 py-16">
          <Card className="border-2 border-blue-500/30 shadow-xl">
            <CardContent className="text-center py-16">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-muted-foreground mt-4">Loading...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-950/20 dark:to-purple-950/20">
      <div className="max-w-4xl mx-auto p-8 py-16">
        <BackButton fallbackPath="/checkout-step1" />
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Review & Payment
          </h1>
          <p className="text-xl text-muted-foreground">
            Step 3 of 3: Complete your purchase
          </p>
          
          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 text-gray-500 rounded-full flex items-center justify-center font-bold">1</div>
              <span className="font-medium text-gray-500">Choose Plan</span>
            </div>
            <div className="w-16 h-1 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 text-gray-500 rounded-full flex items-center justify-center font-bold">2</div>
              <span className="font-medium text-gray-500">Personal Info</span>
            </div>
            <div className="w-16 h-1 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
              <span className="font-medium text-blue-600">Payment</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card className="border-2 border-blue-500/30 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="font-medium">Plan</span>
                  <span className="text-blue-600 font-semibold">{getPlanName(planId)}</span>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Billing Information</h4>
                  <div className="space-y-1 text-sm">
                    <p>{personalInfo.firstName} {personalInfo.lastName}</p>
                    <p>{personalInfo.email}</p>
                    <p>{personalInfo.address}</p>
                    <p>{personalInfo.city}, {personalInfo.state} {personalInfo.zipCode}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Terms and Payment */}
          <Card className="border-2 border-blue-500/30 shadow-lg">
            <CardHeader>
              <CardTitle>Terms & Conditions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={agreeToTerms}
                    onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                    className="mt-1"
                  />
                  <label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                    I agree to the{' '}
                    <a href="/terms" target="_blank" className="text-blue-600 hover:underline">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="/privacy" target="_blank" className="text-blue-600 hover:underline">
                      Privacy Policy
                    </a>
                  </label>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="newsletter"
                    checked={subscribeToNewsletter}
                    onCheckedChange={(checked) => setSubscribeToNewsletter(checked as boolean)}
                    className="mt-1"
                  />
                  <label htmlFor="newsletter" className="text-sm leading-relaxed cursor-pointer">
                    Send me helpful tips and updates about ReflectAI (optional)
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button
                  onClick={handleContinueToPayment}
                  disabled={!agreeToTerms || isLoading}
                  className="w-full gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      Continue to Payment
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}