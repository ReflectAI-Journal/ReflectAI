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
      id: 'pro-monthly',
      name: 'Pro',
      description: 'Essential features for regular journaling',
      price: 14.99,
      interval: 'month',
      features: [
        'Unlimited journal entries',
        'AI-powered insights',
        'Goal tracking',
        'Basic analytics',
        'Email support'
      ]
    },
    {
      id: 'pro-annually',
      name: 'Pro',
      description: 'Essential features for regular journaling',
      price: 152.90,
      interval: 'year',
      features: [
        'Unlimited journal entries',
        'AI-powered insights',
        'Goal tracking',
        'Basic analytics',
        'Email support'
      ]
    },
    {
      id: 'unlimited-monthly',
      name: 'Unlimited',
      description: 'Complete mental wellness toolkit',
      price: 24.99,
      interval: 'month',
      features: [
        'Everything in Pro',
        'Advanced AI counselor',
        'Philosophy mode',
        'Advanced analytics',
        'Priority support',
        'Export capabilities'
      ]
    },
    {
      id: 'unlimited-annually',
      name: 'Unlimited',
      description: 'Complete mental wellness toolkit',
      price: 254.90,
      interval: 'year',
      features: [
        'Everything in Pro',
        'Advanced AI counselor',
        'Philosophy mode',
        'Advanced analytics',
        'Priority support',
        'Export capabilities'
      ]
    }
  ];

  const handlePlanSelect = async (planId: string) => {
    if (!user) {
      navigate('/auth?tab=login');
      return;
    }

    // Find the selected plan
    const plan = plans.find(p => p.id === planId);
    if (!plan) {
      toast({
        title: 'Error',
        description: 'Invalid plan selected',
        variant: 'destructive',
      });
      return;
    }

    // Store selected plan for checkout page
    localStorage.setItem('selectedPlan', JSON.stringify(plan));
    
    // Navigate to embedded checkout
    navigate('/stripe-checkout');
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
    <div className="container max-w-5xl mx-auto p-4 pb-20">
      <BackButton />
      
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Choose Your Plan</h1>
        <p className="text-muted-foreground">
          Start your journey to better mental health with our AI-powered tools
        </p>
      </div>

      {/* Billing Period Toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-muted p-1 rounded-lg">
          <Button
            variant={billingPeriod === 'monthly' ? 'default' : 'ghost'}
            onClick={() => setBillingPeriod('monthly')}
            className="px-4 py-2"
          >
            Monthly
          </Button>
          <Button
            variant={billingPeriod === 'annually' ? 'default' : 'ghost'}
            onClick={() => setBillingPeriod('annually')}
            className="px-4 py-2"
          >
            Annually
          </Button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {plans?.filter(plan => 
          billingPeriod === 'monthly' ? plan.interval === 'month' : plan.interval === 'year'
        ).map(plan => {
          const savings = billingPeriod === 'annually' ? calculateAnnualSavings(plan.name) : null;
          
          return (
            <div key={plan.id} className="flex flex-col gap-3">
              <Card className={`border ${plan.name === 'Pro' 
                ? 'border-blue-500/30 shadow-blue-900/20'
                : 'border-purple-500/30 shadow-purple-900/20'
              } shadow-lg hover:shadow-xl transition-shadow backdrop-blur-md`}>
                <CardHeader className={`pb-2 ${plan.name === 'Pro'
                  ? 'bg-gradient-to-br from-blue-500/10 to-blue-600/5'
                  : 'bg-gradient-to-br from-purple-500/10 to-pink-600/5'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {plan.name === 'Pro' ? (
                        <Star className="h-5 w-5 text-blue-500" />
                      ) : (
                        <Brain className="h-5 w-5 text-purple-500" />
                      )}
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                    </div>
                    {savings && (
                      <div className="bg-green-500/20 text-green-600 px-2 py-1 rounded text-xs font-medium">
                        Save {savings.percent}%
                      </div>
                    )}
                  </div>
                  <CardDescription className="text-sm">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="text-center py-4">
                    <div className="text-3xl font-bold">
                      {formatPrice(plan.price, plan.interval)}
                    </div>
                    {savings && (
                      <div className="text-sm text-muted-foreground">
                        Save ${savings.amount.toFixed(2)} per year
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
                
                <CardFooter className="pt-4">
                  <Button 
                    onClick={() => handlePlanSelect(plan.id)}
                    className={`w-full ${
                      plan.name === 'Pro'
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-purple-600 hover:bg-purple-700'
                    } text-white`}
                  >
                    {user ? 'Start Subscription' : 'Sign Up & Subscribe'}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}