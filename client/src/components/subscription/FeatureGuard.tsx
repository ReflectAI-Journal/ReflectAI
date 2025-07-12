import React from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { FeatureAccess, getUpgradeMessage } from '@/utils/subscriptionFeatures';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Crown, Zap } from 'lucide-react';
import { useLocation } from 'wouter';

interface FeatureGuardProps {
  feature: keyof FeatureAccess;
  children: React.ReactNode;
  fallbackTitle?: string;
  fallbackDescription?: string;
  showUpgradeCard?: boolean;
}

/**
 * Component that restricts access to features based on subscription plan
 */
export function FeatureGuard({ 
  feature, 
  children, 
  fallbackTitle,
  fallbackDescription,
  showUpgradeCard = true 
}: FeatureGuardProps) {
  const { canAccess, plan, isLoading } = useSubscription();
  const [, navigate] = useLocation();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Allow access if user has the required subscription
  if (canAccess(feature)) {
    return <>{children}</>;
  }

  // Show upgrade prompt if access is denied
  if (!showUpgradeCard) {
    return null;
  }

  const upgradeMessage = getUpgradeMessage(feature);
  const isPro = feature === 'aiJournalInsights' || feature === 'goalTracking' || feature === 'enhancedMoodTracking' || feature === 'calendarIntegration';
  
  return (
    <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-violet-500/5">
      <CardHeader className="text-center pb-4">
        <div className={`w-16 h-16 rounded-full ${isPro ? 'bg-gradient-to-r from-primary to-blue-600' : 'bg-gradient-to-r from-purple-600 to-violet-600'} flex items-center justify-center text-white shadow-lg mx-auto mb-4`}>
          {isPro ? <Crown className="h-8 w-8" /> : <Zap className="h-8 w-8" />}
        </div>
        
        <CardTitle className="text-xl text-foreground flex items-center justify-center gap-2">
          <Lock className="h-5 w-5 text-muted-foreground" />
          {fallbackTitle || `${isPro ? 'Pro' : 'Unlimited'} Feature`}
        </CardTitle>
        
        <CardDescription className="text-base">
          {fallbackDescription || upgradeMessage}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {isPro && (
            <Button 
              onClick={() => navigate('/subscription')}
              className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary-dark hover:to-blue-700 text-white"
            >
              <Crown className="mr-2 h-4 w-4" />
              Upgrade to Pro
            </Button>
          )}
          
          {!isPro && (
            <Button 
              onClick={() => navigate('/subscription')}
              className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white"
            >
              <Zap className="mr-2 h-4 w-4" />
              Upgrade to Unlimited
            </Button>
          )}
          
          <Button 
            variant="outline" 
            onClick={() => navigate('/subscription')}
          >
            View All Plans
          </Button>
        </div>
        
        {plan === 'trial' && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Currently on 7-day trial • Upgrade to keep access to all features
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Simple inline feature guard for smaller UI elements
 */
export function InlineFeatureGuard({ feature, children }: { feature: keyof FeatureAccess; children: React.ReactNode }) {
  const { canAccess } = useSubscription();
  
  if (!canAccess(feature)) {
    return null;
  }
  
  return <>{children}</>;
}

/**
 * Hook to check feature access and get upgrade info
 */
export function useFeatureAccess(feature: keyof FeatureAccess) {
  const { canAccess, plan } = useSubscription();
  const hasAccess = canAccess(feature);
  const upgradeMessage = getUpgradeMessage(feature);
  
  return {
    hasAccess,
    upgradeMessage,
    currentPlan: plan,
    needsUpgrade: !hasAccess
  };
}