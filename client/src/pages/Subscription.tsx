import { useEffect, useState } from 'react';
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
    <div className="container max-w-5xl mx-auto p-4 pb-20">
      <div className="flex items-center mb-8">
        <BackButton />
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          Upgrade to Premium
        </h1>
      </div>

      <div className="relative max-w-3xl mx-auto px-6 py-8 mb-12 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm rounded-xl border border-slate-700/50 shadow-lg">
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-1 rounded-full text-sm font-medium">
          START WITH 7 DAYS FREE
        </div>
        
        <h2 className="text-2xl font-bold text-center mb-4">Try Premium With No Risk</h2>
        
        <p className="text-lg mb-5 text-center max-w-2xl mx-auto">
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
            <span>No charges during trial</span>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6 text-center">Choose Your Plan</h2>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-center p-8 border border-red-300 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400">Failed to load subscription plans</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-2 max-w-4xl mx-auto">
          {plans?.filter(plan => plan.interval === 'month').map((plan) => {
            // Find the yearly equivalent of this plan
            const yearlyPlan = plans.find(p => 
              p.interval === 'year' && p.id.includes(plan.id.split('-')[0])
            );
            
            return (
              <div key={plan.id} className="flex flex-col space-y-4">
                <Card 
                  className={`relative overflow-hidden transition-all hover:shadow-lg flex-1 ${
                    selectedPlan?.id === plan.id 
                      ? 'border-2 border-primary shadow-lg shadow-primary/20' 
                      : 'border border-slate-700 bg-slate-800/40'
                  }`}
                >
                  <div className={`absolute top-0 left-0 right-0 h-1 ${
                    plan.id.includes('pro') 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-400' 
                      : 'bg-gradient-to-r from-purple-600 to-pink-500'
                  }`}></div>
                  
                  <CardHeader>
                    <CardTitle className={`text-2xl ${
                      plan.id.includes('pro') 
                        ? 'bg-gradient-to-r from-blue-400 to-blue-500' 
                        : 'bg-gradient-to-r from-purple-400 to-pink-500'
                      } bg-clip-text text-transparent`}>
                      {plan.name}
                    </CardTitle>
                    <CardDescription className="text-base">{plan.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="mb-2 flex items-baseline">
                      <span className="text-4xl font-bold">{formatPrice(plan.price, plan.interval)}</span>
                      <span className="ml-2 text-gray-400 line-through text-sm">first 7 days $0.00</span>
                    </div>
                    
                    <div className="mb-4">
                      <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                        7-DAY FREE TRIAL
                      </span>
                    </div>
                    
                    {plan.features && (
                      <ul className="space-y-3">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <span className={`mr-2 mt-1 ${
                              plan.id.includes('pro') ? 'text-blue-500' : 'text-purple-500'
                            }`}>
                              <Check className="h-4 w-4" />
                            </span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                  
                  <CardFooter>
                    <Link to={`/checkout/${plan.id}`} className="w-full">
                      <Button 
                        className={`w-full ${
                          plan.id.includes('pro')
                            ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600'
                            : 'bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600'
                        }`}
                        onClick={() => handlePlanSelect(plan)}
                      >
                        Start Your Free Trial
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
                
                {/* Yearly option button */}
                {yearlyPlan && (
                  <Link to={`/checkout/${yearlyPlan.id}`} className="w-full">
                    <Button 
                      variant="outline" 
                      className="w-full border-dashed flex flex-col py-3 h-auto"
                      onClick={() => handlePlanSelect(yearlyPlan)}
                    >
                      <span>Try Yearly Plan: {formatPrice(yearlyPlan.price, yearlyPlan.interval)}</span>
                      <div className="flex gap-2 items-center mt-1">
                        <span className="text-xs bg-gradient-to-r from-green-600 to-emerald-600 text-white px-2 py-0.5 rounded-sm">FREE 7 DAYS</span>
                        <span className="text-xs text-emerald-500 font-medium">Save 15% with annual billing</span>
                      </div>
                    </Button>
                  </Link>
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