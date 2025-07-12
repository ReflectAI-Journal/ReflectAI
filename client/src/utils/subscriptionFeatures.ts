export type SubscriptionPlan = 'trial' | 'pro' | 'unlimited' | null;

export interface FeatureAccess {
  aiJournalInsights: boolean;
  goalTracking: boolean;
  enhancedMoodTracking: boolean;
  calendarIntegration: boolean;
  advancedAnalytics: boolean;
  exportFeatures: boolean;
  customPersonalities: boolean;
  prioritySupport: boolean;
  earlyAccess: boolean;
}

/**
 * Get feature access for a subscription plan
 */
export function getFeatureAccess(plan: SubscriptionPlan): FeatureAccess {
  switch (plan) {
    case 'trial':
      return {
        aiJournalInsights: false,
        goalTracking: false,
        enhancedMoodTracking: false,
        calendarIntegration: false,
        advancedAnalytics: false,
        exportFeatures: false,
        customPersonalities: false,
        prioritySupport: false,
        earlyAccess: false,
      };
    case 'pro':
      return {
        aiJournalInsights: true,
        goalTracking: true,
        enhancedMoodTracking: true,
        calendarIntegration: true,
        advancedAnalytics: false,
        exportFeatures: false,
        customPersonalities: false,
        prioritySupport: false,
        earlyAccess: false,
      };
    case 'unlimited':
      return {
        aiJournalInsights: true,
        goalTracking: true,
        enhancedMoodTracking: true,
        calendarIntegration: true,
        advancedAnalytics: true,
        exportFeatures: true,
        customPersonalities: true,
        prioritySupport: true,
        earlyAccess: true,
      };
    default:
      // No subscription - no premium features
      return {
        aiJournalInsights: false,
        goalTracking: false,
        enhancedMoodTracking: false,
        calendarIntegration: false,
        advancedAnalytics: false,
        exportFeatures: false,
        customPersonalities: false,
        prioritySupport: false,
        earlyAccess: false,
      };
  }
}

/**
 * Check if a user has access to a specific feature
 */
export function hasFeatureAccess(plan: SubscriptionPlan, feature: keyof FeatureAccess): boolean {
  const features = getFeatureAccess(plan);
  return features[feature];
}

/**
 * Get upgrade message for a specific feature
 */
export function getUpgradeMessage(feature: keyof FeatureAccess): string {
  const messages: Record<keyof FeatureAccess, string> = {
    aiJournalInsights: 'Get AI-powered insights for your journal entries with Pro plan ($14.99/month).',
    goalTracking: 'Track your goals and build daily habits with Pro plan ($14.99/month).',
    enhancedMoodTracking: 'Access advanced mood tracking and analytics with Pro plan ($14.99/month).',
    calendarIntegration: 'Sync your reflections with calendar events using Pro plan ($14.99/month).',
    advancedAnalytics: 'Unlock detailed progress analytics and insights with Unlimited plan ($24.99/month).',
    exportFeatures: 'Export your journal and data in multiple formats with Unlimited plan ($24.99/month).',
    customPersonalities: 'Create custom AI personalities tailored to your needs with Unlimited plan ($24.99/month).',
    prioritySupport: 'Get priority customer support with Unlimited plan ($24.99/month).',
    earlyAccess: 'Access new features before everyone else with Unlimited plan ($24.99/month).',
  };
  
  return messages[feature] || 'Upgrade your plan to access this feature.';
}

/**
 * Get the minimum plan required for a feature
 */
export function getRequiredPlan(feature: keyof FeatureAccess): SubscriptionPlan {
  const proFeatures: (keyof FeatureAccess)[] = [
    'aiJournalInsights',
    'goalTracking', 
    'enhancedMoodTracking',
    'calendarIntegration'
  ];
  
  const unlimitedFeatures: (keyof FeatureAccess)[] = [
    'advancedAnalytics',
    'exportFeatures',
    'customPersonalities',
    'prioritySupport',
    'earlyAccess'
  ];
  
  if (unlimitedFeatures.includes(feature)) {
    return 'unlimited';
  } else if (proFeatures.includes(feature)) {
    return 'pro';
  }
  
  return null;
}