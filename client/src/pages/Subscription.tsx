import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'wouter';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import BackButton from '@/components/ui/back-button';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: string;
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
    <div className="container max-w-5xl mx-auto p-4">
      <div className="flex items-center mb-8">
        <BackButton />
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          Upgrade to Premium
        </h1>
      </div>

      <div className="mb-8">
        <p className="text-lg mb-4">
          Enhance your journaling experience with premium features and unlock the full potential of ReflectAI.
        </p>
        <div className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-2">
          <div className="p-6 rounded-lg bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-slate-700">
            <h3 className="text-xl font-semibold mb-3">Premium Features</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-emerald-500 mr-2">✓</span>
                <span>Advanced AI-powered insights and analysis</span>
              </li>
              <li className="flex items-start">
                <span className="text-emerald-500 mr-2">✓</span>
                <span>Unlimited AI interactions per day</span>
              </li>
              <li className="flex items-start">
                <span className="text-emerald-500 mr-2">✓</span>
                <span>Advanced goal tracking and visualization</span>
              </li>
              <li className="flex items-start">
                <span className="text-emerald-500 mr-2">✓</span>
                <span>Export journals in multiple formats</span>
              </li>
            </ul>
          </div>
          <div className="p-6 rounded-lg bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-slate-700">
            <h3 className="text-xl font-semibold mb-3">Premium Analytics</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-emerald-500 mr-2">✓</span>
                <span>Deep sentiment analysis of journal entries</span>
              </li>
              <li className="flex items-start">
                <span className="text-emerald-500 mr-2">✓</span>
                <span>Personalized growth recommendations</span>
              </li>
              <li className="flex items-start">
                <span className="text-emerald-500 mr-2">✓</span>
                <span>Trend tracking and mood insights</span>
              </li>
              <li className="flex items-start">
                <span className="text-emerald-500 mr-2">✓</span>
                <span>Custom AI personalities with unlimited profiles</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6 mt-8">Choose Your Plan</h2>
      
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
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
          {plans?.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative overflow-hidden transition-all hover:shadow-lg ${
                selectedPlan?.id === plan.id 
                  ? 'border-2 border-primary shadow-lg shadow-primary/20' 
                  : 'border border-slate-700 bg-slate-800/40'
              }`}
            >
              {plan.interval === 'year' && (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                  Save 20%
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-xl bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  {plan.name}
                </CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <span className="text-3xl font-bold">{formatPrice(plan.price, plan.interval)}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Link to={`/checkout/${plan.id}`}>
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    onClick={() => handlePlanSelect(plan)}
                  >
                    Select Plan
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}