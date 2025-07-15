import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import StripeCheckout from '@/components/payment/StripeCheckout';
import { useAuth } from '@/hooks/use-auth';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: string;
  features: string[];
}

export default function StripeCheckoutPage() {
  const [, navigate] = useLocation();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    // Get the selected plan from localStorage or URL params
    const savedPlan = localStorage.getItem('selectedPlan');
    if (savedPlan) {
      setSelectedPlan(JSON.parse(savedPlan));
    } else {
      // If no plan selected, redirect to subscription page
      navigate('/subscription');
    }
  }, [navigate]);

  const handleSuccess = () => {
    // Clean up stored plan
    localStorage.removeItem('selectedPlan');
    // Navigate to success page or app
    navigate('/app');
  };

  if (!user) {
    navigate('/auth?tab=login');
    return null;
  }

  if (!selectedPlan) {
    return (
      <div className="container max-w-md mx-auto p-4 flex items-center justify-center min-h-screen">
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>Please wait while we prepare your checkout.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-950/20 dark:to-purple-950/20">
      <div className="container max-w-6xl mx-auto p-4 pb-20">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/subscription')}
            className="mb-6 rounded-full px-6 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-300"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Plans
          </Button>
          
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              🎉 Let's Get You Started!
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              You're just one step away from unlocking <span className="font-semibold text-indigo-600 dark:text-indigo-400">{selectedPlan.name}</span> for only{' '}
              <span className="font-bold text-2xl bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                ${selectedPlan.price.toFixed(2)}/{selectedPlan.interval === 'month' ? 'month' : 'year'}
              </span>
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 items-start">
          {/* Plan Summary - Smaller and on the side */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-6 rounded-3xl border-2 border-gray-200 dark:border-gray-700 shadow-xl sticky top-4">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-600 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">Selected Plan</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{selectedPlan.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{selectedPlan.description}</p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-2xl">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Billing Cycle</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    {selectedPlan.interval === 'month' ? '📅 Monthly' : '🗓️ Annual'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-2xl">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Total Price</span>
                  <span className="font-bold text-xl text-green-600 dark:text-green-400">
                    💰 ${selectedPlan.price.toFixed(2)}/{selectedPlan.interval === 'month' ? 'mo' : 'yr'}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  ✨ What's Included:
                </h4>
                <ul className="space-y-3">
                  {selectedPlan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Stripe Checkout Form - Larger and main focus */}
          <div className="lg:col-span-3">
            <StripeCheckout plan={selectedPlan} onSuccess={handleSuccess} />
          </div>
        </div>
      </div>
    </div>
  );
}