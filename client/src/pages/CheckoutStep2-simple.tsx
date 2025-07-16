import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default function CheckoutStep2Simple() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Redirect to subscription page since we're using hosted checkout only
    toast({
      title: 'Redirecting to Checkout',
      description: 'Using secure Stripe hosted checkout for payment processing',
    });
    
    setTimeout(() => {
      navigate('/subscription');
    }, 2000);
  }, [navigate, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-950/20 dark:to-purple-950/20">
      <div className="max-w-2xl mx-auto p-8 py-16">
        <Card className="border-2 border-blue-500/30 shadow-xl">
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              Redirecting to Secure Checkout
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-muted-foreground">
              We're redirecting you to our secure Stripe checkout page for payment processing.
            </p>
            <Button
              onClick={() => navigate('/subscription')}
              variant="outline"
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Plans
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}