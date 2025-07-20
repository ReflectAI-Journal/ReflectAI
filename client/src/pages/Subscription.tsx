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
  const [location, navigate] = useLocation();
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
      price: 152.90,
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
        'Personalized daily strategy messages',
        'Early access to new app features',
        'Priority customer support'
      ]
    }
  ];

  const handlePlanSelect = async (planId: string) => {
    // Store selected plan in sessionStorage for after account creation
    const plan = plans.find(p => p.id === planId);
    if (plan) {
      sessionStorage.setItem('selectedPlan', JSON.stringify({
        name: plan.name,
        stripePriceId: plan.id,
        price: plan.price,
        interval: plan.interval
      }));
    }
    
    // Redirect to account creation
    navigate('/auth?tab=register&source=pricing');
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
            Start your mental wellness journey with our AI-powered counseling and journaling platform
          </motion.p>
        </div>

        {/* Billing Period Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-muted p-1 rounded-lg">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2 rounded-md transition-all duration-200 ${
                billingPeriod === 'monthly'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('annually')}
              className={`px-6 py-2 rounded-md transition-all duration-200 ${
                billingPeriod === 'annually'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Annually
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {filteredPlans.map((plan, index) => {
            const isPopular = plan.name === 'Pro';
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
                  
                  {/* CTA Button */}
                  <div className="p-6 pb-4">
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 rounded-lg transition-all duration-300"
                      onClick={() => handlePlanSelect(plan.id)}
                    >
                      {`Try ${plan.name}`}
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
                        ${plan.price.toFixed(2)}<span className="text-lg text-muted-foreground">/{plan.interval === 'month' ? 'month' : 'year'}</span>
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