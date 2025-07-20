import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Check, Crown, Zap, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const Pricing = () => {
  const [, navigate] = useLocation();

  const plans = [
    {
      name: 'Basic',
      price: 15,
      icon: Shield,
      emoji: '✅',
      description: 'Perfect for getting started with AI counseling',
      features: [
        '10 AI counselor sessions per month',
        'Manual journaling only (text-based input)',
        'Daily motivational quotes',
        'Access to the basic AI counselor mode'
      ],
      buttonText: 'Select Basic',
      popular: false,
      stripePriceId: 'basic-monthly' // Placeholder for Stripe integration
    },
    {
      name: 'Pro',
      price: 25,
      icon: Zap,
      emoji: '🚀',
      description: 'Most popular plan for regular users',
      features: [
        '25 AI counselor sessions per month',
        'Voice and text input for journaling',
        'Advanced counselor mode with deeper prompts',
        'Mental health tips and reminders',
        'Access to a public community group or forum'
      ],
      buttonText: 'Select Pro',
      popular: true,
      stripePriceId: 'pro-monthly'
    },
    {
      name: 'Elite',
      price: 75,
      icon: Crown,
      emoji: '👑',
      description: 'The ultimate experience for serious growth',
      features: [
        'Unlimited AI counselor sessions',
        'Personalized AI counselor trained on your journal',
        'Weekly mood analysis & mental health reports',
        '1:1 growth blueprint powered by AI',
        'Private mastermind community access',
        'Personalized daily strategy messages',
        'Early access to new app features',
        'Priority customer support'
      ],
      buttonText: 'Select Elite',
      popular: false,
      stripePriceId: 'elite-monthly'
    }
  ];

  const handleSelectPlan = (plan: typeof plans[0]) => {
    // For now, redirect to checkout with plan parameter
    // In production, this would integrate with Stripe
    navigate(`/checkout-step1?plan=${plan.stripePriceId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 text-foreground">
      {/* Header */}
      <div className="container mx-auto px-4 py-16">
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

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => {
            const IconComponent = plan.icon;
            return (
              <motion.div
                key={plan.name}
                className={`relative bg-card border-2 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ${
                  plan.popular 
                    ? 'border-primary scale-105 md:scale-110' 
                    : 'border-border/40 hover:border-primary/50'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-primary to-violet-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                      <span className="text-4xl mr-3">{plan.emoji}</span>
                      <IconComponent className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
                    <div className="text-center">
                      <span className="text-4xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground text-lg">/month</span>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm leading-relaxed">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Select Button */}
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

        {/* FAQ or Additional Info */}
        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <p className="text-muted-foreground">
            Need help choosing? <Button variant="link" className="p-0 h-auto text-primary">Contact our support team</Button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Pricing;