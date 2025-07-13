import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'wouter';
import { Loader2, Check, Star, Heart, Brain, Shield } from 'lucide-react';
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
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annually'>('monthly');
  const [personalizedCounselor, setPersonalizedCounselor] = useState<any>(null);

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

  useEffect(() => {
    const storedProfile = localStorage.getItem('personalizedCounselor');
    if (storedProfile) {
      try {
        setPersonalizedCounselor(JSON.parse(storedProfile));
      } catch (e) {
        console.error('Failed to parse counselor profile:', e);
      }
    }
  }, []);

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
  };

  const formatPrice = (price: number, interval: string) => {
    return `$${price.toFixed(2)}/${interval === 'month' ? 'mo' : 'yr'}`;
  };

  const calculateAnnualSavings = (planId: string) => {
    if (!plans) return null;

    const monthlyPlan = plans.find(p => p.id === planId.replace('-annually', '-monthly'));
    const annualPlan = plans.find(p => p.id === planId);

    if (!monthlyPlan || !annualPlan) return null;

    const monthlyAnnualTotal = monthlyPlan.price * 12;
    const savings = monthlyAnnualTotal - annualPlan.price;
    const savingsPercent = Math.round((savings / monthlyAnnualTotal) * 100);

    return { amount: savings, percent: savingsPercent };
  };

  return (
    <div className="container max-w-5xl mx-auto p-4 pb-20">
      <div className="flex items-center mb-8">
        <BackButton to="/" />
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          {personalizedCounselor ? 'Your Personalized Counselor Awaits' : 'Upgrade to Premium'}
        </h1>
      </div>

      {/* Personalized Counselor Section */}
      {personalizedCounselor && (
        <div className="mb-8">
          <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-violet-600/5 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-violet-600 flex items-center justify-center text-white shadow-lg">
                  <Heart className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-2xl text-foreground flex items-center gap-2">
                    {personalizedCounselor.name}
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </CardTitle>
                  <CardDescription className="text-lg font-medium text-primary">
                    {personalizedCounselor.specialty}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="px-3 py-1 bg-green-500/20 text-green-600 text-sm font-medium rounded-full">
                    Perfect Match
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">98% compatibility</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed mb-4">
                {personalizedCounselor.description}
              </p>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" />
                  <span>AI-Powered Insights</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span>24/7 Availability</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-primary" />
                  <span>Personalized Approach</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Billing period toggle */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex items-center bg-muted rounded-lg p-1">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              billingPeriod === 'monthly'
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingPeriod('annually')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              billingPeriod === 'annually'
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Annually
            <span className="ml-1 text-xs text-green-600 font-semibold">Save 15%</span>
          </button>
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
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {plans?.filter(plan => 
              billingPeriod === 'monthly' ? !plan.id.includes('annually') : plan.id.includes('annually')
            ).map(plan => {
              return (
                <div key={plan.id} className="flex flex-col gap-3">
                  <Card className={`border ${plan.id.includes('pro') 
                    ? 'border-blue-500/30 shadow-blue-900/20'
                    : 'border-purple-500/30 shadow-purple-900/20'
                  } shadow-lg hover:shadow-xl transition-shadow backdrop-blur-md`}>
                    <CardHeader className={`pb-2 ${plan.id.includes('pro')
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
                      {plan.interval === 'year' && (() => {
                        const savings = calculateAnnualSavings(plan.id);
                        return savings && (
                          <div className="mt-2 bg-green-500/20 text-green-400 px-2 py-1 rounded-md text-sm font-medium">
                            Save ${savings.amount.toFixed(2)} ({savings.percent}% off)
                          </div>
                        );
                      })()}
                    </CardHeader>

                    <CardContent className="pt-4">
                      {plan.features && plan.features.length > 0 && (
                        <ul className="space-y-2">
                          {plan.features.map((feature, idx) => {
                            const isDisabled = feature.startsWith('✗');
                            const featureText = isDisabled ? feature.substring(2) : feature;

                            return (
                              <li key={idx} className="flex items-start">
                                {isDisabled ? (
                                  <span className="h-5 w-5 text-gray-500 mr-2 shrink-0 flex items-center justify-center font-bold">✗</span>
                                ) : (
                                  <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                                )}
                                <span className={isDisabled ? "text-gray-500" : ""}>{featureText}</span>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </CardContent>

                    <CardFooter className="pt-4">
                      <Link href={`/checkout/${plan.id}`} className="w-full">
                        <Button 
                          className={`w-full ${
                            plan.id.includes('pro')
                              ? 'bg-blue-600 hover:bg-blue-700'
                              : 'bg-purple-600 hover:bg-purple-700'
                          } text-white`}
                        >
                          Start Free Trial
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
