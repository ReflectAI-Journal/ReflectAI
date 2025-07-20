import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocation } from 'wouter';
import { Check, Star, Brain, Shield, Zap, Crown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import BackButton from '@/components/ui/back-button';
import { useAuth } from '@/hooks/use-auth';
import { motion } from 'framer-motion';

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
      description: 'Perfect for every day regular use',
      price: 14.99,
      interval: 'month',
      features: [
        'Advanced AI reflections',
        'Calendar integration',
        'Enhanced goal tracking',
        'Limited to 15 AI chat interactions per week'
      ]
    },
    {
      id: 'pro-annually',
      name: 'Pro',
      description: 'Perfect for every day regular use',
      price: 152.90,
      interval: 'year',
      features: [
        'Advanced AI reflections',
        'Calendar integration',
        'Enhanced goal tracking',
        'Limited to 15 AI chat interactions per week'
      ]
    },
    {
      id: 'unlimited-monthly',
      name: 'Unlimited',
      description: 'For those who want the complete experience',
      price: 24.99,
      interval: 'month',
      features: [
        'Everything in Pro plan',
        'Advanced analytics',
        'Custom AI personalities',
        'Priority support'
      ]
    },
    {
      id: 'unlimited-annually',
      name: 'Unlimited',
      description: 'For those who want the complete experience',
      price: 254.90,
      interval: 'year',
      features: [
        'Everything in Pro plan',
        'Advanced analytics',
        'Custom AI personalities',
        'Priority support'
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

  const filteredPlans = plans.filter(plan => 
    billingPeriod === 'monthly' ? plan.interval === 'month' : plan.interval === 'year'
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 text-foreground">
      <div className="max-w-6xl mx-auto p-8 py-16">
        <BackButton />

        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-500">
              Choose Your Plan
            </span>
          </motion.h1>
          <motion.p 
            className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Select the perfect plan to enhance your journaling and self-reflection journey
          </motion.p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {filteredPlans.map((plan, index) => {
            const isPopular = plan.name === 'Unlimited';
            const savings = billingPeriod === 'annually' ? calculateAnnualSavings(plan.name) : null;
            
            return (
              <motion.div
                key={`${plan.name}-${plan.interval}`}
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className={`relative h-full ${
                  isPopular 
                    ? 'border-2 border-primary bg-gradient-to-b from-primary/5 to-background' 
                    : 'border border-border'
                } shadow-lg hover:shadow-xl transition-all duration-300`}>
                  
                  {isPopular && (
                    <div className="absolute -top-3 right-6 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium shadow-lg z-10">
                      Popular
                    </div>
                  )}
                  
                  {/* Free Trial Button */}
                  <div className="p-6 pb-4">
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 rounded-lg transition-all duration-300"
                      onClick={() => handlePlanSelect(plan.id)}
                    >
                      Free Trial
                    </Button>
                  </div>

                  {/* Annual Savings Banner */}
                  {billingPeriod === 'annually' && (
                    <div className="mx-6 mb-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-center py-2 rounded-lg font-medium text-sm">
                      Get {plan.name} Annually - Save 15%
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-6 pt-2">
                    <CardTitle className="text-3xl font-bold mb-2">{plan.name}</CardTitle>
                    
                    <div className="mb-4">
                      <div className="text-4xl font-bold">
                        ${plan.price.toFixed(2)}<span className="text-lg text-muted-foreground">/{plan.interval === 'month' ? 'month' : 'month'}</span>
                      </div>
                      {billingPeriod === 'annually' && (
                        <div className="text-sm text-muted-foreground mt-1">
                          or ${plan.price.toFixed(2)}/year (save 15%)
                        </div>
                      )}
                    </div>
                    
                    <CardDescription className="text-base">{plan.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="px-6 pb-6">
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => {
                        const isLimited = feature.includes('Limited to');
                        return (
                          <li key={featureIndex} className="flex items-start">
                            {isLimited ? (
                              <div className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5 text-muted-foreground">✕</div>
                            ) : (
                              <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                            )}
                            <span className={`text-sm leading-relaxed ${isLimited ? 'text-muted-foreground' : ''}`}>
                              {feature}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}