
import { Request, Response, NextFunction } from 'express';
import { storage } from './storage';

export type SubscriptionPlan = 'trial' | 'pro' | 'unlimited' | null;

interface FeatureRequirement {
  plans: SubscriptionPlan[];
  errorMessage: string;
}

const FEATURE_REQUIREMENTS: Record<string, FeatureRequirement> = {
  'ai-journal-insights': {
    plans: ['pro', 'unlimited'],
    errorMessage: 'AI journal insights require Pro plan ($14.99/month) or higher. Upgrade to unlock this feature.'
  },
  'goal-tracking': {
    plans: ['trial', 'pro', 'unlimited'],
    errorMessage: 'Goal tracking requires Pro plan ($14.99/month) or higher. Upgrade to unlock this feature.'
  },
  'enhanced-mood-tracking': {
    plans: ['pro', 'unlimited'],
    errorMessage: 'Enhanced mood tracking requires Pro plan ($14.99/month) or higher. Upgrade to unlock this feature.'
  },
  'calendar-integration': {
    plans: ['pro', 'unlimited'],
    errorMessage: 'Calendar integration requires Pro plan ($14.99/month) or higher. Upgrade to unlock this feature.'
  },
  'advanced-analytics': {
    plans: ['unlimited'],
    errorMessage: 'Advanced analytics require Unlimited plan ($24.99/month). Upgrade to unlock this feature.'
  },
  'export-features': {
    plans: ['unlimited'],
    errorMessage: 'Export features require Unlimited plan ($24.99/month). Upgrade to unlock this feature.'
  },
  'custom-personalities': {
    plans: ['unlimited'],
    errorMessage: 'Custom AI personalities require Unlimited plan ($24.99/month). Upgrade to unlock this feature.'
  }
};

/**
 * Middleware to check if user has required subscription for a feature
 */
export function requiresSubscription(feature: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      const requirement = FEATURE_REQUIREMENTS[feature];
      if (!requirement) {
        console.warn(`Unknown feature requirement: ${feature}`);
        return next(); // Allow access if feature requirement is not defined
      }

      const userPlan = getUserPlan(user);
      
      if (!requirement.plans.includes(userPlan)) {
        return res.status(403).json({ 
          error: 'Subscription required',
          message: requirement.errorMessage,
          feature,
          currentPlan: userPlan,
          requiredPlans: requirement.plans
        });
      }

      next();
    } catch (error) {
      console.error('Subscription check error:', error);
      res.status(500).json({ error: 'Failed to check subscription status' });
    }
  };
}

/**
 * Get user's current subscription plan
 */
function getUserPlan(user: any): SubscriptionPlan {
  // Check if user has active subscription
  if (user.hasActiveSubscription) {
    return user.subscriptionPlan as SubscriptionPlan;
  }
  
  // Check if user is still in trial period
  if (user.trialEndsAt && new Date(user.trialEndsAt) > new Date()) {
    return 'trial';
  }
  
  // No active subscription or trial
  return null;
}

/**
 * Check if user has access to a feature (for programmatic checks)
 */
export async function hasFeatureAccess(userId: number, feature: string): Promise<boolean> {
  try {
    const user = await storage.getUser(userId);
    if (!user) return false;

    const requirement = FEATURE_REQUIREMENTS[feature];
    if (!requirement) return true; // Allow access if feature requirement is not defined

    const userPlan = getUserPlan(user);
    return requirement.plans.includes(userPlan);
  } catch (error) {
    console.error('Feature access check error:', error);
    return false;
  }
}

/**
 * Get subscription status for API responses
 */
export function getSubscriptionStatus(user: any) {
  const plan = getUserPlan(user);
  const now = new Date();
  
  if (plan === 'trial') {
    const trialEndDate = new Date(user.trialEndsAt);
    const daysLeft = Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      status: 'trial',
      plan: 'trial',
      trialActive: true,
      trialEndsAt: user.trialEndsAt,
      daysLeft: Math.max(0, daysLeft),
      requiresSubscription: false
    };
  }
  
  if (user.hasActiveSubscription) {
    return {
      status: 'active',
      plan: user.subscriptionPlan,

      trialActive: false,
      requiresSubscription: false
    };
  }
  
  return {
    status: 'expired',
    plan: null,
    trialActive: false,
    trialEndsAt: user.trialEndsAt,
    requiresSubscription: true
  };
}

/**
 * Middleware to enforce trial expiration - redirect to subscription page if trial expired
 */
export function enforceTrialExpiration(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const user = req.user as any;
  const subscriptionStatus = getSubscriptionStatus(user);
  
  // If trial expired and no active subscription, block access
  if (subscriptionStatus.status === 'expired' && subscriptionStatus.requiresSubscription) {
    return res.status(403).json({ 
      error: 'Trial expired',
      message: 'Your trial has expired. Please subscribe to continue using the app.',
      redirectTo: '/subscription',
      subscriptionStatus
    });
  }
  
  next();
}