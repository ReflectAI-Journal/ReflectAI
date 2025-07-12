import { useQuery } from '@tanstack/react-query';
import { SubscriptionPlan, getFeatureAccess, hasFeatureAccess } from '@/utils/subscriptionFeatures';

interface SubscriptionStatus {
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  plan: SubscriptionPlan;
  trialEndsAt?: string;
  subscriptionId?: string;
}

/**
 * Hook to get user's subscription status and feature access
 */
export function useSubscription() {
  const { data: subscriptionData, isLoading, error } = useQuery({
    queryKey: ['/api/subscription/status'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const subscription = subscriptionData as SubscriptionStatus | undefined;
  
  // Determine the user's subscription plan
  const plan: SubscriptionPlan = subscription?.plan || null;
  
  // Get feature access for this plan
  const featureAccess = getFeatureAccess(plan);
  
  // Helper function to check feature access
  const canAccess = (feature: keyof typeof featureAccess) => {
    return hasFeatureAccess(plan, feature);
  };
  
  // Check if user is on trial
  const isOnTrial = subscription?.status === 'trial';
  
  // Check if subscription is active
  const hasActiveSubscription = subscription?.status === 'active';
  
  // Check if user has any paid plan
  const hasPaidPlan = plan === 'pro' || plan === 'unlimited';
  
  return {
    // Subscription info
    subscription,
    plan,
    isLoading,
    error,
    
    // Status checks
    isOnTrial,
    hasActiveSubscription,
    hasPaidPlan,
    
    // Feature access
    featureAccess,
    canAccess,
    
    // Plan-specific checks
    isPro: plan === 'pro',
    isUnlimited: plan === 'unlimited',
  };
}