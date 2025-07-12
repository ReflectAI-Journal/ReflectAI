import { useParams } from 'wouter';
import { useEffect } from 'react';

// Direct LemonSqueezy checkout URLs with custom success redirect
const planToLemonURL: Record<string, string> = {
  'pro-monthly': 'https://reflectai-journal.lemonsqueezy.com/buy/595b09c1-be42-45e8-9f6e-468dbcf84aba?checkout[custom][success_url]=' + encodeURIComponent(window.location.origin + '/checkout-success'),
  'pro-annually': 'https://reflectai-journal.lemonsqueezy.com/buy/364e51aa-d4ab-4a85-a218-c42f88f899ba?checkout[custom][success_url]=' + encodeURIComponent(window.location.origin + '/checkout-success'),
  'unlimited-monthly': 'https://reflectai-journal.lemonsqueezy.com/buy/5325558c-e886-4a4c-9926-a3b8b6be6689?checkout[custom][success_url]=' + encodeURIComponent(window.location.origin + '/checkout-success'),
  'unlimited-annually': 'https://reflectai-journal.lemonsqueezy.com/buy/84991f1c-f488-4959-9303-457ecffac914?checkout[custom][success_url]=' + encodeURIComponent(window.location.origin + '/checkout-success'),
};

export default function CheckoutRedirect() {
  const params = useParams();
  const planId = params.planId;

  useEffect(() => {
    const url = planToLemonURL[planId];
    if (url) {
      // Redirect to LemonSqueezy with custom success URL
      window.location.href = url;
    } else {
      alert('Invalid plan selected');
      window.location.href = '/subscription';
    }
  }, [planId]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Redirecting to secure checkout...</p>
      </div>
    </div>
  );
}
