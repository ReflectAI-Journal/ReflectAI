import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Check, Crown, Zap, Shield, Brain, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const Pricing = () => {
  const [, navigate] = useLocation();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annually'>('monthly');

  const plans = [
    // Monthly plans
    {
      name: 'Basic',
      price: 14.99,
      interval: 'month',
      icon: Shield,
      description: 'Perfect for getting started with AI counseling',
      features: [
        '10 AI counselor sessions per month',
        'Manual journaling only (text-based input)',
        'Daily motivational quotes',
        'Access to the basic AI counselor mode'
      ],
      buttonText: 'Try Basic',
      popular: false,
      stripePriceId: 'basic-monthly'
    },
    {
      name: 'Pro',
      price: 24.99,
      interval: 'month',
      icon: Zap,
      description: 'Most popular plan for regular users',
      features: [
        '25 AI counselor sessions per month',
        'Voice and text input for journaling',
        'Advanced counselor mode with deeper prompts',
        'Mental health tips and reminders',
        'Access to a public community group or forum'
      ],
      buttonText: 'Try Pro',
      popular: true,
      stripePriceId: 'pro-monthly'
    },
    {
      name: 'Elite',
      price: 50,
      interval: 'month',
      icon: Crown,
      description: 'The ultimate experience for serious growth',
      features: [
        'Unlimited AI counselor sessions',
        'Personalized AI counselor trained on your journal',
        'Weekly mood analysis & mental health reports',
        '1:1 growth blueprint powered by AI',
        'Personalized daily strategy messages',
        'Early access to new app features',
        'Priority customer support'
      ],
      buttonText: 'Try Elite',
      popular: false,
      stripePriceId: 'elite-monthly'
    },
    // Annual plans (25% discount)
    {
      name: 'Basic',
      price: 152.90,
      interval: 'year',
      icon: Shield,
      description: 'Perfect for getting started with AI counseling',
      features: [
        '10 AI counselor sessions per month',
        'Manual journaling only (text-based input)',
        'Daily motivational quotes',
        'Access to the basic AI counselor mode'
      ],
      buttonText: 'Try Basic',
      popular: false,
      stripePriceId: 'basic-annually'
    },
    {
      name: 'Pro',
      price: 254.90,
      interval: 'year',
      icon: Zap,
      description: 'Most popular plan for regular users',
      features: [
        '25 AI counselor sessions per month',
        'Voice and text input for journaling',
        'Advanced counselor mode with deeper prompts',
        'Mental health tips and reminders',
        'Access to a public community group or forum'
      ],
      buttonText: 'Try Pro',
      popular: true,
      stripePriceId: 'pro-annually'
    },
    {
      name: 'Elite',
      price: 450.00,
      interval: 'year',
      icon: Crown,
      description: 'The ultimate experience for serious growth',
      features: [
        'Unlimited AI counselor sessions',
        'Personalized AI counselor trained on your journal',
        'Weekly mood analysis & mental health reports',
        '1:1 growth blueprint powered by AI',
        'Personalized daily strategy messages',
        'Early access to new app features',
        'Priority customer support'
      ],
      buttonText: 'Try Elite',
      popular: false,
      stripePriceId: 'elite-annually'
    }
  ];

  const handleSelectPlan = async (plan: typeof plans[0]) => {
    // Store selected plan in sessionStorage for after account creation
    sessionStorage.setItem('selectedPlan', JSON.stringify({
      name: plan.name,
      stripePriceId: plan.stripePriceId,
      price: plan.price,
      interval: plan.interval
    }));
    
    // Redirect back to login for account creation
    navigate('/auth?tab=login&source=pricing');
  };

  const calculateAnnualSavings = (planName: string) => {
    const monthlyPlan = plans.find(p => p.name === planName && p.interval === 'month');
    const annualPlan = plans.find(p => p.name === planName && p.interval === 'year');
    
    if (monthlyPlan && annualPlan) {
      const monthlyYearly = monthlyPlan.price * 12;
      const savings = monthlyYearly - annualPlan.price;
      const percent = Math.round((savings / monthlyYearly) * 100);
      return { amount: savings, percent };
    }
    return null;
  };

  const filteredPlans = plans.filter(plan => 
    billingPeriod === 'monthly' ? plan.interval === 'month' : plan.interval === 'year'
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 text-foreground">
      {/* Back Button */}
      <div className="container mx-auto px-4 pt-8">
        <motion.button
          onClick={() => navigate('/')}
          className="flex items-center text-muted-foreground hover:text-foreground transition-colors duration-200 mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          whileHover={{ x: -4 }}
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Home
        </motion.button>
      </div>

      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-16">
          <motion.h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-500">
              Choose Your Plan
            </span>
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Select the perfect plan to enhance your mental wellness journey with AI-powered counseling and journaling
          </motion.p>
        </div>

        {/* Billing Period Toggle */}
        <div className="flex flex-col items-center mb-16">
          <div className="bg-card/50 backdrop-blur-sm p-2 rounded-xl shadow-lg border border-border/50">
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
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {filteredPlans.map((plan, index) => {
            const savings = billingPeriod === 'annually' ? calculateAnnualSavings(plan.name) : null;
            const IconComponent = plan.icon;
            return (
              <motion.div
                key={`${plan.name}-${plan.interval}`}
                className={`pricing-card relative group overflow-visible rounded-2xl transition-all duration-500 ${
                  plan.popular 
                    ? 'scale-105 md:scale-110' 
                    : ''
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ 
                  y: -8,
                }}
              >
                {/* Glowing Border Background */}
                <div 
                  className={`absolute inset-0 rounded-2xl p-[2px] ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-primary via-violet-500 to-primary opacity-100'
                      : 'bg-gradient-to-r from-primary/30 via-violet-500/30 to-primary/30 opacity-100'
                  } transition-opacity duration-500`}
                  style={{
                    background: plan.popular
                      ? 'linear-gradient(270deg, hsl(var(--primary)), hsl(262 83% 58%), hsl(var(--primary)), hsl(262 83% 58%))'
                      : 'linear-gradient(270deg, hsl(var(--primary)/0.3), hsl(262 83% 58%/0.3), hsl(var(--primary)/0.3))',
                    backgroundSize: '400% 400%',
                    animation: plan.popular ? 'gradientShift 4s ease infinite' : 'none'
                  }}
                >
                  {/* Card Content */}
                  <div 
                    className="h-full w-full bg-card rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-500 relative z-10 flex"
                    style={{
                      boxShadow: plan.popular
                        ? '0 0 40px -8px hsl(var(--primary)/0.4), 0 20px 40px -8px rgba(0, 0, 0, 0.1)'
                        : '0 4px 20px -2px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    {/* Popular Badge */}
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                        <div className="bg-gradient-to-r from-primary to-violet-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                          Most Popular
                        </div>
                      </div>
                    )}

                    {savings && (
                      <div className="absolute -top-4 right-4 z-20">
                        <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                          Save ${savings.amount.toFixed(0)}
                        </div>
                      </div>
                    )}

                    <div className="p-8 card-content">
                      {/* Plan Header */}
                      <div className="text-center mb-8">
                        <div className="flex items-center justify-center mb-4">
                          <IconComponent className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                        <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
                        <div className="text-center">
                          <span className="text-4xl font-bold">${plan.price}</span>
                          <span className="text-muted-foreground text-lg">/{plan.interval === 'month' ? 'month' : 'year'}</span>
                          {billingPeriod === 'annually' && (
                            <div className="text-sm text-muted-foreground mt-1">
                              ${(plan.price / 12).toFixed(2)}/month billed annually
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Features List */}
                      <div className="space-y-4 mb-8 features-section">
                        {plan.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-sm leading-relaxed">{feature}</span>
                          </div>
                        ))}
                      </div>

                      {/* Select Button */}
                      <div className="button-section">
                        <Button
                          onClick={() => handleSelectPlan(plan)}
                          className={`w-full h-12 text-lg font-semibold rounded-xl transition-all duration-300 ${
                            plan.popular
                              ? 'bg-gradient-to-r from-primary to-violet-600 hover:from-primary-dark hover:to-violet-700 text-white shadow-lg'
                              : 'bg-card border-2 border-primary text-primary hover:bg-primary hover:text-white'
                          }`}
                        >
                          {plan.buttonText}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Money Back Guarantee */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="inline-flex items-center bg-green-500/10 border border-green-500/20 rounded-full px-6 py-3">
            <Shield className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-green-600 dark:text-green-400 font-medium">
              30-day money-back guarantee - email us for refunds
            </span>
          </div>
        </motion.div>


      </div>
    </div>
  );
};

export default Pricing;