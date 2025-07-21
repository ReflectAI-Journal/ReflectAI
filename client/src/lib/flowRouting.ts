import { apiRequest } from './queryClient';

interface FlowResponse {
  success: boolean;
  redirectTo: string;
  flow: string;
  selectedPlan?: string;
  source?: string;
  hasAccess?: boolean;
  requiresPayment?: boolean;
}

interface PlanSelection {
  planId: string;
  source?: string;
}

/**
 * Store plan selection before authentication
 */
export async function storePlanSelection(planData: PlanSelection): Promise<void> {
  try {
    await apiRequest('/api/flow/store-plan', {
      method: 'POST',
      body: JSON.stringify(planData)
    });
  } catch (error) {
    console.error('Failed to store plan selection:', error);
  }
}

/**
 * Get post-registration routing information
 */
export async function getPostRegistrationRoute(): Promise<FlowResponse> {
  try {
    const response = await apiRequest('/api/flow/post-registration', {
      method: 'POST'
    });
    console.log('Post-registration API response:', response);
    return response;
  } catch (error) {
    console.error('Failed to get post-registration route:', error);
    return {
      success: false,
      redirectTo: '/subscription',
      flow: 'default'
    };
  }
}

/**
 * Get post-login routing information
 */
export async function getPostLoginRoute(): Promise<FlowResponse> {
  try {
    const response = await apiRequest('/api/flow/post-login', {
      method: 'POST'
    });
    return response;
  } catch (error) {
    console.error('Failed to get post-login route:', error);
    return {
      success: false,
      redirectTo: '/app/counselor',
      flow: 'default'
    };
  }
}

/**
 * Check if user has access to app routes
 */
export async function checkAppAccess(): Promise<{ hasAccess: boolean; user?: any }> {
  try {
    const response = await apiRequest('/api/flow/app-access');
    return { hasAccess: true, user: response.user };
  } catch (error: any) {
    if (error.status === 401) {
      return { hasAccess: false };
    }
    if (error.status === 402) {
      return { hasAccess: false };
    }
    console.error('Failed to check app access:', error);
    return { hasAccess: false };
  }
}

/**
 * Handle plan selection from pricing page
 */
export async function handlePlanSelection(planId: string, source: string = 'pricing'): Promise<string> {
  await storePlanSelection({ planId, source });
  
  // Always redirect to account creation with plan info
  return `/auth?tab=register&source=${source}&plan=${planId}`;
}

/**
 * Handle post-authentication routing
 */
export async function handlePostAuth(type: 'login' | 'register'): Promise<string> {
  try {
    if (type === 'register') {
      const route = await getPostRegistrationRoute();
      return route.redirectTo || '/subscription';
    } else {
      const route = await getPostLoginRoute();
      return route.redirectTo || '/app/counselor';
    }
  } catch (error) {
    console.error('Error in handlePostAuth:', error);
    // Return safe defaults
    return type === 'register' ? '/subscription' : '/app/counselor';
  }
}

/**
 * Get Stripe checkout URL for selected plan
 */
export async function getStripeCheckoutUrl(planId: string): Promise<string> {
  try {
    const response = await apiRequest('/api/checkout-session', {
      method: 'POST',
      body: JSON.stringify({ planId })
    });
    return response.url;
  } catch (error) {
    console.error('Failed to create checkout session:', error);
    throw error;
  }
}

/**
 * Complete user flow navigation helper
 */
export class FlowNavigator {
  static async fromPricing(planId: string): Promise<string> {
    return handlePlanSelection(planId, 'pricing');
  }

  static async fromQuiz(planId: string): Promise<string> {
    return handlePlanSelection(planId, 'questionnaire');
  }

  static async afterRegistration(): Promise<string> {
    return handlePostAuth('register');
  }

  static async afterLogin(): Promise<string> {
    return handlePostAuth('login');
  }

  static async toStripeCheckout(planId: string): Promise<string> {
    return getStripeCheckoutUrl(planId);
  }

  static async checkAppAccess(): Promise<{ hasAccess: boolean; redirectTo?: string }> {
    const { hasAccess } = await checkAppAccess();
    
    if (!hasAccess) {
      return { 
        hasAccess: false, 
        redirectTo: '/auth?tab=login' 
      };
    }
    
    return { hasAccess: true };
  }
}