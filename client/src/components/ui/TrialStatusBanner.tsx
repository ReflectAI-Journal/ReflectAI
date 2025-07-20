import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { Clock, Crown, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TrialStatusBanner() {
  const { subscriptionStatus } = useAuth();
  const [, navigate] = useLocation();

  // Don't show banner if no subscription status or user has active subscription
  if (!subscriptionStatus || subscriptionStatus.status === 'active') {
    return null;
  }

  const handleUpgrade = () => {
    navigate('/subscription');
  };

  // Show subscription required message
  const subscriptionInfo = {
    icon: <Crown className="h-4 w-4" />,
    title: "Subscription Required",
    message: "Subscribe to access premium features",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
    borderColor: "border-purple-200 dark:border-purple-800",
    textColor: "text-purple-800 dark:text-purple-200"
  };

  return (
    <div className={`${subscriptionInfo.bgColor} ${subscriptionInfo.borderColor} border rounded-lg p-3 mx-4 mb-4`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={subscriptionInfo.textColor}>
            {subscriptionInfo.icon}
          </div>
          <div>
            <p className={`font-medium text-sm ${subscriptionInfo.textColor}`}>
              {subscriptionInfo.title}
            </p>
            <p className={`text-xs ${subscriptionInfo.textColor} opacity-80`}>
              {subscriptionInfo.message}
            </p>
          </div>
        </div>
        
        <Button
          size="sm"
          onClick={handleUpgrade}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
        >
          <Crown className="h-3 w-3 mr-1" />
          Subscribe
        </Button>
      </div>
    </div>
  );
}