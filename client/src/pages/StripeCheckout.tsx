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
    // Navigate to checkout success page to handle subscription update
    navigate('/checkout-success');
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container max-w-6xl mx-auto p-4 pb-20">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/subscription')}
            className="mb-6 rounded-lg px-4 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Plans
          </Button>
          
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              Complete Your Subscription
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              You're subscribing to <span className="font-semibold text-blue-600 dark:text-blue-400">{selectedPlan.name}</span> for{' '}
              <span className="font-bold text-xl text-gray-900 dark:text-gray-100">
                ${selectedPlan.price.toFixed(2)}/{selectedPlan.interval === 'month' ? 'month' : 'year'}
              </span>
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 items-start">
          {/* Plan Summary - Smaller and on the side */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md sticky top-4">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">Selected Plan</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">{selectedPlan.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{selectedPlan.description}</p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Billing</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {selectedPlan.interval === 'month' ? 'Monthly' : 'Annual'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Price</span>
                  <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
                    ${selectedPlan.price.toFixed(2)}/{selectedPlan.interval === 'month' ? 'mo' : 'yr'}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-gray-700 dark:text-gray-300">
                  Included Features:
                </h4>
                <ul className="space-y-2">
                  {selectedPlan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
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