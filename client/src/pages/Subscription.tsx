import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocation } from 'wouter';
import { Check, Star, Brain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import BackButton from '@/components/ui/back-button';
import { useAuth } from '@/hooks/use-auth';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: string;
  features: string[];
}

export default function Subscription() {
  const { toast } = useToast();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annually'>('monthly');
  const [, navigate] = useLocation();
  const { user } = useAuth();

  // Static pricing plans
  const plans: SubscriptionPlan[] = [
    {
      id: 'basic-monthly',
      name: 'Basic',
      description: 'Perfect for getting started with AI counseling',
      price: 14.99,
      interval: 'month',
      features: [
        '10 AI counselor sessions per month',
        'Manual journaling only (text-based input)',
        'Daily motivational quotes',
        'Access to the basic AI counselor mode'
      ]
    },
    {
      id: 'basic-annually',
      name: 'Basic',
      description: 'Perfect for getting started with AI counseling',
      price: 134.91,
      interval: 'year',
      features: [
        '10 AI counselor sessions per month',
        'Manual journaling only (text-based input)',
        'Daily motivational quotes',
        'Access to the basic AI counselor mode'
      ]
    },
    {
      id: 'pro-monthly',
      name: 'Pro',
      description: 'Most popular plan for regular users',
      price: 24.99,
      interval: 'month',
      features: [
        '25 AI counselor sessions per month',
        'Voice and text input for journaling',
        'Advanced counselor mode with deeper prompts',
        'Mental health tips and reminders',
        'Access to a public community group or forum'
      ]
    },
    {
      id: 'pro-annually',
      name: 'Pro',
      description: 'Most popular plan for regular users',
      price: 254.90,
      interval: 'year',
      features: [
        '25 AI counselor sessions per month',
        'Voice and text input for journaling',
        'Advanced counselor mode with deeper prompts',
        'Mental health tips and reminders',
        'Access to a public community group or forum'
      ]
    },
    {
      id: 'elite-monthly',
      name: 'Elite',
      description: 'The ultimate experience for serious growth',
      price: 50.00,
      interval: 'month',
      features: [
        'Unlimited AI counselor sessions',
        'Personalized AI counselor trained on your journal',
        'Weekly mood analysis & mental health reports',
        '1:1 growth blueprint powered by AI',
        'Private mastermind community access',
        'Personalized daily strategy messages',
        'Early access to new app features',
        'Priority customer support'
      ]
    },
    {
      id: 'elite-annually',
      name: 'Elite',
      description: 'The ultimate experience for serious growth',
      price: 450.00,
      interval: 'year',
      features: [
        'Unlimited AI counselor sessions',
        'Personalized AI counselor trained on your journal',
        'Weekly mood analysis & mental health reports',
        '1:1 growth blueprint powered by AI',
        'Private mastermind community access',
        'Personalized daily strategy messages',
        'Early access to new app features',
        'Priority customer support'
      ]
    }
  ];

  const handlePlanSelect = async (planId: string) => {
    // Direct Stripe checkout - no authentication required
    await createDirectCheckout(planId);
  };

  const createDirectCheckout = async (planId: string) => {
    try {
      // Create checkout session without authentication - using simple endpoint
      const response = await fetch("/api/checkout-session", { 
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          planId: planId
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
      
      const data = await response.json();
      
      if (data.url) {
        // Redirect to Stripe checkout in same window
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: 'Checkout Error',
        description: error.message || 'Failed to start checkout process. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const formatPrice = (price: number, interval: string) => {
    return `$${price.toFixed(2)}/${interval === 'month' ? 'mo' : 'yr'}`;
  };

  const calculateAnnualSavings = (planName: string) => {
    const monthlyPlan = plans.find(p => p.name === planName && p.interval === 'month');
    const annualPlan = plans.find(p => p.name === planName && p.interval === 'year');

    if (!monthlyPlan || !annualPlan) return null;

    const monthlyAnnualTotal = monthlyPlan.price * 12;
    const savings = monthlyAnnualTotal - annualPlan.price;
    const savingsPercent = Math.round((savings / monthlyAnnualTotal) * 100);

    return { amount: savings, percent: savingsPercent };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-950/20 dark:to-purple-950/20">
      <div className="max-w-4xl mx-auto p-8 py-16">
        <BackButton />
        
        {/* Removed progress steps - using direct Stripe checkout */}

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="text-xl text-muted-foreground">
            Choose your plan and checkout securely with Stripe
          </p>
          
          <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 px-6 py-3 rounded-full text-base font-medium mt-6 shadow-lg">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            30-Day Money Back Guarantee
          </div>
        </div>

        {/* Billing Period Toggle */}
        <div className="flex flex-col items-center mb-16">
          <div className="bg-white dark:bg-gray-800 p-2 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <Button
              variant={billingPeriod === 'monthly' ? 'default' : 'ghost'}
              onClick={() => setBillingPeriod('monthly')}
              className="px-8 py-3 text-base font-medium rounded-lg transition-all duration-200"
            >
              Monthly
            </Button>
            <Button
              variant={billingPeriod === 'annually' ? 'default' : 'ghost'}
              onClick={() => setBillingPeriod('annually')}
              className="px-8 py-3 text-base font-medium rounded-lg transition-all duration-200 relative"
            >
              Annually
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                25% OFF
              </span>
            </Button>
          </div>
          {billingPeriod === 'annually' && (
            <div className="mt-4 text-center">
              <p className="text-green-600 dark:text-green-400 font-medium text-lg">
                🎉 Save 25% with annual billing!
              </p>
            </div>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans?.filter(plan => 
            billingPeriod === 'monthly' ? plan.interval === 'month' : plan.interval === 'year'
          ).map(plan => {
            const savings = billingPeriod === 'annually' ? calculateAnnualSavings(plan.name) : null;
            
            return (
              <div key={plan.id} className="flex flex-col gap-4 transform hover:scale-105 transition-all duration-300">
                <Card className={`border-2 ${plan.name === 'Pro' 
                  ? 'border-blue-500/30 shadow-blue-900/20 hover:border-blue-500/60 hover:shadow-blue-500/20'
                  : 'border-purple-500/30 shadow-purple-900/20 hover:border-purple-500/60 hover:shadow-purple-500/20'
                } shadow-2xl hover:shadow-3xl transition-all duration-300 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 min-h-[600px] relative overflow-hidden group`}>
                  
                  {/* Animated background gradient */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                    plan.name === 'Pro'
                      ? 'bg-gradient-to-br from-blue-500/5 via-blue-400/3 to-blue-600/5'
                      : 'bg-gradient-to-br from-purple-500/5 via-purple-400/3 to-pink-600/5'
                  }`} />
                  
                  <CardHeader className={`pb-6 relative z-10 ${plan.name === 'Pro'
                    ? 'bg-gradient-to-br from-blue-500/10 to-blue-600/5'
                    : 'bg-gradient-to-br from-purple-500/10 to-pink-600/5'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {plan.name === 'Pro' ? (
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Star className="h-6 w-6 text-blue-500" />
                          </div>
                        ) : (
                          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <Brain className="h-6 w-6 text-purple-500" />
                          </div>
                        )}
                        <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                      </div>
                      {savings && (
                        <div className="bg-green-500/20 text-green-600 px-3 py-2 rounded-lg text-sm font-bold animate-pulse">
                          Save {savings.percent}%
                        </div>
                      )}
                    </div>
                    <CardDescription className="text-base leading-relaxed">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-6 flex-grow relative z-10 px-8 py-6">
                    <div className="text-center py-6 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl">
                      <div className="text-5xl font-bold mb-2">
                        {formatPrice(plan.price, plan.interval)}
                      </div>

                      {savings && (
                        <div className="text-base text-muted-foreground font-medium">
                          Save ${savings.amount.toFixed(2)} per year
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                          <div className="p-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                            <Check className="h-4 w-4 text-green-500" />
                          </div>
                          <span className="text-base font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="pt-6 pb-8 px-8 relative z-10">
                    <Button 
                      onClick={() => handlePlanSelect(plan.id)}
                      className={`w-full h-14 text-lg font-bold ${
                        plan.name === 'Pro'
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-blue-500/25'
                          : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-purple-500/25'
                      } text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 rounded-xl`}
                    >
                      {user ? 'Subscribe Now' : 'Sign Up & Subscribe'}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}