import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'wouter';
import { Loader2, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import BackButton from '@/components/ui/back-button';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: string;
  features?: string[];
}

export default function Subscription() {
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  
  const { data: plans, isLoading, error } = useQuery<SubscriptionPlan[]>({
    queryKey: ['/api/subscription-plans'],
  });

  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load subscription plans. Please try again later.',
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
  };

  const formatPrice = (price: number, interval: string) => {
    return `$${price.toFixed(2)}/${interval === 'month' ? 'mo' : 'yr'}`;
  };

  return (
    <div className="container max-w-6xl mx-auto p-6 pb-24">
      <div className="flex items-center mb-12">
        <BackButton to="/" />
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          Upgrade to Premium
        </h1>
      </div>
      
      {/* Time limit notice removed - all users now have unlimited access */}

      <div className="relative max-w-3xl mx-auto px-6 py-8 mb-12 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm rounded-xl border border-slate-700/50 shadow-lg">
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-full text-lg font-medium">
          START WITH 7 DAYS FREE
        </div>
        
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">Try Premium With No Risk</h2>
        
        <p className="text-xl mb-8 text-center max-w-2xl mx-auto">
          Enhance your journaling experience with premium features and unlock the full potential of ReflectAI.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <div className="flex items-center bg-slate-900/60 p-3 rounded-lg">
            <div className="rounded-full bg-green-500/20 p-2 mr-3">
              <Check className="h-5 w-5 text-green-400" />
            </div>
            <span>7-day free trial</span>
          </div>
          
          <div className="flex items-center bg-slate-900/60 p-3 rounded-lg">
            <div className="rounded-full bg-green-500/20 p-2 mr-3">
              <Check className="h-5 w-5 text-green-400" />
            </div>
            <span>Cancel anytime</span>
          </div>
          
          <div className="flex items-center bg-slate-900/60 p-3 rounded-lg">
            <div className="rounded-full bg-green-500/20 p-2 mr-3">
              <Check className="h-5 w-5 text-green-400" />
            </div>
            <span>Unlimited access</span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-center p-6 border border-red-300 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400">Failed to load subscription plans. Please try again later.</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans?.filter(plan => !plan.id.includes('yearly')).map(plan => {
            // Find corresponding yearly plan if exists
            const yearlyPlan = plans.find(p => 
              p.id === plan.id.replace('monthly', 'yearly') ||
              p.id === `${plan.id}-yearly`
            );
            
            return (
              <div key={plan.id} className="flex flex-col gap-3">
                <Card className={`border ${
                  plan.id.includes('pro')
                    ? 'border-blue-500/30 shadow-blue-900/20'
                    : 'border-purple-500/30 shadow-purple-900/20'
                } shadow-lg hover:shadow-xl transition-shadow backdrop-blur-md`}>
                  <CardHeader className={`pb-2 ${
                    plan.id.includes('pro')
                      ? 'bg-gradient-to-br from-blue-500/10 to-blue-600/5'
                      : 'bg-gradient-to-br from-purple-500/10 to-pink-600/5'
                  }`}>
                    <CardTitle className={`text-xl font-bold ${
                      plan.id.includes('pro')
                        ? 'text-blue-400'
                        : 'text-purple-400'
                    }`}>
                      {plan.name}
                    </CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-2 flex items-end gap-1">
                      <span className="text-2xl font-bold">{formatPrice(plan.price, plan.interval)}</span>
                      <span className="text-sm text-muted-foreground pb-1">
                        • 7 days free
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-4">
                    {plan.features && plan.features.length > 0 && (
                      <ul className="space-y-2">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                  
                  <CardFooter>
                    {/* Direct checkout button component */}
                    <div className="w-full">
                      <Button 
                        className={`w-full ${
                          plan.id.includes('pro')
                            ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600'
                            : 'bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600'
                        }`}
                        onClick={() => window.location.href = `/checkout/${plan.id}`}
                      >
                        Upgrade to {plan.name}
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
                
                {/* Yearly option button */}
                {yearlyPlan && (
                  <div className="w-full">
                    <div className="border border-slate-600 border-dashed rounded-md p-3">
                      <div className="flex flex-col items-center mb-2">
                        <span>Upgrade to {yearlyPlan.name}: {formatPrice(yearlyPlan.price, yearlyPlan.interval)}</span>
                        <div className="flex gap-2 items-center mt-1">
                          <span className="text-xs bg-gradient-to-r from-green-600 to-emerald-600 text-white px-2 py-0.5 rounded-sm">FREE 7 DAYS</span>
                          <span className="text-xs text-emerald-500 font-medium">Save 15% with annual billing</span>
                        </div>
                      </div>
                      <Button 
                        className="w-full bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600"
                        onClick={() => window.location.href = `/checkout/${yearlyPlan.id}`}
                      >
                        Get Annual Plan
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      <div className="mt-16 max-w-3xl mx-auto">
        <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-center">What You Get With Premium</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
            <div className="space-y-2">
              <h4 className="font-medium text-blue-400">Advanced Features</h4>
              <ul className="space-y-2">
                {/* Unlimited usage time removed since all users now have it */}
                <li className="flex items-start">
                  <span className="text-emerald-500 mr-2">✓</span>
                  <span>Advanced AI-powered insights</span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-500 mr-2">✓</span>
                  <span>Custom AI personalities</span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-500 mr-2">✓</span>
                  <span>Enhanced goal tracking</span>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-purple-400">Premium Analytics</h4>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-emerald-500 mr-2">✓</span>
                  <span>Deep sentiment analysis</span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-500 mr-2">✓</span>
                  <span>Personalized growth recommendations</span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-500 mr-2">✓</span>
                  <span>Trend tracking and reporting</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}