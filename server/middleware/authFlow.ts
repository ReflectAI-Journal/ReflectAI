import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage.js';
import { verifyToken } from '../auth.js';

// Extended request interface to include user and flow data
interface AuthFlowRequest extends Request {
  user?: any;
  flowData?: {
    selectedPlan?: string;
    source?: string;
    redirectAfterAuth?: string;
  };
}

/**
 * Middleware to check authentication status without forcing redirect
 * Sets req.user if authenticated, continues regardless
 */
export function checkAuth(req: AuthFlowRequest, res: Response, next: NextFunction) {
  let user = null;

  // Check for JWT token in Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = verifyToken(token);
      if (decoded && decoded.id) {
        // We'll fetch the full user in requireAuth if needed
        req.user = decoded;
      }
    } catch (error) {
      // Token invalid, continue without user
    }
  }

  // Fallback to session-based authentication
  if (!req.user && req.isAuthenticated && req.isAuthenticated()) {
    req.user = (req as any).user;
  }

  next();
}

/**
 * Middleware to require authentication
 * Redirects to login or returns 401 based on request type
 */
export function requireAuth(req: AuthFlowRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    // For API requests, return 401
    if (req.path.startsWith('/api/')) {
      return res.status(401).json({ 
        error: 'Authentication required',
        redirectTo: '/auth?tab=login'
      });
    }
    
    // For page requests, redirect to auth
    return res.redirect('/auth?tab=login');
  }
  
  next();
}

/**
 * Middleware to check subscription status
 * Allows access if user has active subscription or trial
 */
export async function requireSubscription(req: AuthFlowRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Authentication required',
      redirectTo: '/auth?tab=login'
    });
  }

  try {
    // Fetch full user data to check subscription
    const user = await storage.getUserById(req.user.id);
    
    if (!user) {
      return res.status(401).json({ 
        error: 'User not found',
        redirectTo: '/auth?tab=login'
      });
    }

    // Check if user has active subscription or trial
    const hasActiveSubscription = user.hasActiveSubscription;
    const hasActiveTrial = user.trialEndsAt && new Date(user.trialEndsAt) > new Date();
    const isVipUser = user.isVipUser;

    if (hasActiveSubscription || hasActiveTrial || isVipUser) {
      req.user = user; // Update with full user data
      return next();
    }

    // User needs subscription
    if (req.path.startsWith('/api/')) {
      return res.status(402).json({ 
        error: 'Subscription required',
        redirectTo: '/subscription',
        requiresPayment: true
      });
    }
    
    // For page requests, redirect to subscription
    return res.redirect('/subscription');
    
  } catch (error) {
    console.error('Error checking subscription:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Middleware for app route protection
 * Handles the complex logic for /app/* routes
 */
export async function protectAppRoutes(req: AuthFlowRequest, res: Response, next: NextFunction) {
  // Check authentication first
  if (!req.user) {
    // For API requests, return structured response
    if (req.path.startsWith('/api/')) {
      return res.status(401).json({ 
        error: 'Authentication required',
        redirectTo: '/auth?tab=login',
        flow: 'login_required'
      });
    }
    
    // For page requests, redirect to login
    return res.redirect('/auth?tab=login');
  }

  try {
    // Fetch full user data
    const user = await storage.getUserById(req.user.id);
    
    if (!user) {
      return res.status(401).json({ 
        error: 'User not found',
        redirectTo: '/auth?tab=login'
      });
    }

    // Check subscription status
    const hasActiveSubscription = user.hasActiveSubscription;
    const hasActiveTrial = user.trialEndsAt && new Date(user.trialEndsAt) > new Date();
    const isVipUser = user.isVipUser;

    // If user doesn't have subscription or trial, they need to subscribe
    if (!hasActiveSubscription && !hasActiveTrial && !isVipUser) {
      if (req.path.startsWith('/api/')) {
        return res.status(402).json({ 
          error: 'Subscription required',
          redirectTo: '/subscription',
          flow: 'subscription_required',
          requiresPayment: true
        });
      }
      
      // For page requests, redirect to subscription
      return res.redirect('/subscription');
    }

    // User is authenticated and has valid subscription/trial
    req.user = user; // Update with full user data
    next();
    
  } catch (error) {
    console.error('Error in app route protection:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Middleware to handle post-registration flow
 * Redirects new users appropriately based on their signup source
 */
export function handlePostRegistration(req: AuthFlowRequest, res: Response, next: NextFunction) {
  // Check if there's a stored plan selection or source
  const selectedPlan = req.session?.selectedPlan;
  const source = req.session?.source;
  
  if (selectedPlan) {
    // User came from pricing, redirect to Stripe checkout
    req.flowData = {
      selectedPlan,
      source,
      redirectAfterAuth: '/subscription'
    };
  } else if (source === 'questionnaire') {
    // User came from questionnaire, redirect to subscription plans
    req.flowData = {
      source,
      redirectAfterAuth: '/subscription'
    };
  } else {
    // Default: new users go to pricing first
    req.flowData = {
      redirectAfterAuth: '/pricing'
    };
  }
  
  next();
}

/**
 * Middleware to handle post-login flow
 * Redirects existing users appropriately
 */
export async function handlePostLogin(req: AuthFlowRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return next();
  }

  try {
    const user = await storage.getUserById(req.user.id);
    
    if (!user) {
      return next();
    }

    // Check subscription status
    const hasActiveSubscription = user.hasActiveSubscription;
    const hasActiveTrial = user.trialEndsAt && new Date(user.trialEndsAt) > new Date();
    const isVipUser = user.isVipUser;

    if (hasActiveSubscription || hasActiveTrial || isVipUser) {
      // User has access, redirect to app
      req.flowData = {
        redirectAfterAuth: '/app/counselor'
      };
    } else {
      // User needs subscription
      req.flowData = {
        redirectAfterAuth: '/subscription'
      };
    }
    
    next();
    
  } catch (error) {
    console.error('Error in post-login flow:', error);
    next();
  }
}

/**
 * Middleware to store plan selection in session
 * Used when user selects a plan before authentication
 */
export function storePlanSelection(req: AuthFlowRequest, res: Response, next: NextFunction) {
  const { planId, source } = req.body;
  
  if (planId) {
    req.session!.selectedPlan = planId;
  }
  
  if (source) {
    req.session!.source = source;
  }
  
  next();
}