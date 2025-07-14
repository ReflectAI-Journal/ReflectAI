import { useParams } from 'wouter';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';

// Base LemonSqueezy checkout URLs
const planToLemonBaseURL: Record<string, string> = {
  'pro-monthly': 'https://reflectai-journal.lemonsqueezy.com/buy/595b09c1-be42-45e8-9f6e-468dbcf84aba',
  'pro-annually': 'https://reflectai-journal.lemonsqueezy.com/buy/364e51aa-d4ab-4a85-a218-c42f88f899ba',
  'unlimited-monthly': 'https://reflectai-journal.lemonsqueezy.com/buy/5325558c-e886-4a4c-9926-a3b8b6be6689',
  'unlimited-annually': 'https://reflectai-journal.lemonsqueezy.com/buy/84991f1c-f488-4959-9303-457ecffac914',
};

export default function CheckoutRedirect() {
  const params = useParams();
  const planId = params.planId;
  const { user } = useAuth();

  useEffect(() => {
    const baseUrl = planToLemonBaseURL[planId];
    if (baseUrl && user) {
      // Construct checkout URL with user information and success URL
      const successUrl = encodeURIComponent(window.location.origin + '/checkout-success');
      const email = encodeURIComponent(user.email || '');
      const userId = encodeURIComponent(user.id.toString());
      const planIdParam = encodeURIComponent(planId);
      
      const fullUrl = `${baseUrl}?checkout[email]=${email}&checkout[custom][success_url]=${successUrl}&checkout[custom][user_id]=${userId}&checkout[custom][plan_id]=${planIdParam}`;
      
      console.log('[Checkout] Full LemonSqueezy URL:', fullUrl);
      
      console.log('[Checkout] Redirecting to LemonSqueezy with user data:', { userId: user.id, email: user.email, planId });
      
      // Redirect to LemonSqueezy with user data
      window.location.href = fullUrl;
    } else if (baseUrl && !user) {
      // If no user, redirect without custom data (user should login first)
      const successUrl = encodeURIComponent(window.location.origin + '/checkout-success');
      const fullUrl = `${baseUrl}?checkout[custom][success_url]=${successUrl}`;
      
      console.log('[Checkout] Redirecting to LemonSqueezy without user data');
      window.location.href = fullUrl;
    } else {
      console.error('[Checkout] Invalid plan selected:', planId);
      alert('Invalid plan selected');
      window.location.href = '/subscription';
    }
  }, [planId, user]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Redirecting to secure checkout...</p>
      </div>
    </div>
  );
}
