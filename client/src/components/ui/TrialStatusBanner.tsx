import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { Clock, Crown, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TrialStatusBanner() {
  const { subscriptionStatus } = useAuth();
  const [, navigate] = useLocation();

  // Don't show banner if no subscription status or user has active subscription
  if (!subscriptionStatus || subscriptionStatus.status === 'active' || !subscriptionStatus.trialActive) {
    return null;
  }

  const handleUpgrade = () => {
    navigate('/subscription');
  };

  // Different messages based on trial status
  const getTrialMessage = () => {
    if (subscriptionStatus.isOnStripeTrial) {
      return {
        icon: <Crown className="h-4 w-4" />,
        title: "Free Trial Active",
        message: `Your Stripe trial expires in ${subscriptionStatus.daysLeft} days`,
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
        borderColor: "border-blue-200 dark:border-blue-800",
        textColor: "text-blue-800 dark:text-blue-200"
      };
    } else {
      return {
        icon: <Clock className="h-4 w-4" />,
        title: "Trial Period",
        message: `${subscriptionStatus.daysLeft} days remaining`,
        bgColor: "bg-amber-50 dark:bg-amber-900/20",
        borderColor: "border-amber-200 dark:border-amber-800",
        textColor: "text-amber-800 dark:text-amber-200"
      };
    }
  };

  const trialInfo = getTrialMessage();

  return (
    <div className={`${trialInfo.bgColor} ${trialInfo.borderColor} border rounded-lg p-3 mx-4 mb-4`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={trialInfo.textColor}>
            {trialInfo.icon}
          </div>
          <div>
            <p className={`font-medium text-sm ${trialInfo.textColor}`}>
              {trialInfo.title}
            </p>
            <p className={`text-xs ${trialInfo.textColor} opacity-80`}>
              {trialInfo.message}
            </p>
          </div>
        </div>
        
        <Button
          size="sm"
          onClick={handleUpgrade}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
        >
          <Crown className="h-3 w-3 mr-1" />
          Upgrade
        </Button>
      </div>
      
      {subscriptionStatus.stripeTrialEnd && (
        <div className="mt-2 flex items-center gap-1 text-xs opacity-70">
          <Calendar className="h-3 w-3" />
          <span>Trial ends: {new Date(subscriptionStatus.stripeTrialEnd).toLocaleDateString()}</span>
        </div>
      )}
    </div>
  );
}