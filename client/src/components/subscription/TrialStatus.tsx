import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react';

export function TrialStatus() {
  const { subscriptionStatus, isSubscriptionLoading, checkSubscriptionStatus } = useAuth();
  const [navigate] = useNavigate();
  const [isChecking, setIsChecking] = useState(false);

  // Check subscription status on component mount
  useEffect(() => {
    if (!subscriptionStatus && !isSubscriptionLoading) {
      refreshStatus();
    }
  }, []);

  const refreshStatus = async () => {
    setIsChecking(true);
    try {
      await checkSubscriptionStatus();
    } catch (error) {
      console.error('Failed to check subscription status:', error);
    } finally {
      setIsChecking(false);
    }
  };

  if (isSubscriptionLoading || isChecking) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1 flex items-center justify-center">
          <CardTitle className="text-2xl text-center font-bold">Checking Subscription Status</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-4">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          <p className="mt-4 text-center text-muted-foreground">Please wait while we check your subscription status...</p>
        </CardContent>
      </Card>
    );
  }

  if (!subscriptionStatus) {
    return (
      <Card className="w-full max-w-md mx-auto border-destructive">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-2">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-2xl text-center font-bold">Subscription Status Unavailable</CardTitle>
          <CardDescription className="text-center">
            We couldn't retrieve your subscription information. Please try again.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center pt-0">
          <Button onClick={refreshStatus} disabled={isChecking}>
            Try Again
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Trial is active
  if (subscriptionStatus.trialActive) {
    return (
      <Card className="w-full max-w-md mx-auto border-primary">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-2">
            <Clock className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center font-bold">Your Free Trial is Active</CardTitle>
          <CardDescription className="text-center text-lg">
            You have <span className="font-bold text-primary">{subscriptionStatus.daysLeft} days</span> left in your trial.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center">
            Enjoy all premium features during your trial period. To continue using ReflectAI after your trial ends, 
            please choose a subscription plan.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center pt-0">
          <Button onClick={() => navigate('/subscription')} variant="default">
            View Subscription Plans
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Subscription is active
  if (subscriptionStatus.status === 'active') {
    return (
      <Card className="w-full max-w-md mx-auto border-success">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-2">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <CardTitle className="text-2xl text-center font-bold">Active Subscription</CardTitle>
          <CardDescription className="text-center text-lg">
            {subscriptionStatus.plan === 'pro' ? 'Pro Plan' : 
             subscriptionStatus.plan === 'unlimited' ? 'Unlimited Plan' : 
             'Active Plan'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center">
            Thank you for subscribing to ReflectAI. You have full access to all features.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center pt-0">
          <Button onClick={() => navigate('/settings')} variant="outline">
            Manage Subscription
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Trial has expired
  return (
    <Card className="w-full max-w-md mx-auto border-destructive">
      <CardHeader className="space-y-1">
        <div className="flex justify-center mb-2">
          <AlertTriangle className="h-12 w-12 text-destructive" />
        </div>
        <CardTitle className="text-2xl text-center font-bold">Your Trial Has Expired</CardTitle>
        <CardDescription className="text-center">
          Your free trial period has ended. Subscribe now to continue using ReflectAI.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-center">
          Choose a subscription plan to unlock all features and continue your journaling journey.
        </p>
      </CardContent>
      <CardFooter className="flex justify-center pt-0">
        <Button onClick={() => navigate('/subscription')} variant="default">
          Subscribe Now
        </Button>
      </CardFooter>
    </Card>
  );
}