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
    <div className="container max-w-2xl mx-auto p-4 pb-20">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/subscription')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Plans
        </Button>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Complete Your Subscription</h1>
          <p className="text-muted-foreground">
            You're subscribing to {selectedPlan.name} for ${selectedPlan.price.toFixed(2)}/{selectedPlan.interval === 'month' ? 'month' : 'year'}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Plan Summary */}
        <Card>
          <CardHeader>
            <CardTitle>{selectedPlan.name}</CardTitle>
            <CardDescription>{selectedPlan.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="font-medium">Plan</span>
                <span>{selectedPlan.name}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="font-medium">Billing</span>
                <span>{selectedPlan.interval === 'month' ? 'Monthly' : 'Annual'}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="font-medium">Price</span>
                <span className="font-bold">
                  ${selectedPlan.price.toFixed(2)}/{selectedPlan.interval === 'month' ? 'mo' : 'yr'}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-medium mb-3">Included Features:</h4>
              <ul className="space-y-2">
                {selectedPlan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Stripe Checkout Form */}
        <StripeCheckout plan={selectedPlan} onSuccess={handleSuccess} />
      </div>
    </div>
  );
}