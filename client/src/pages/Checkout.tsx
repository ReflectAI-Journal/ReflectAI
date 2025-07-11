import { useParams } from 'wouter';
import { useEffect } from 'react';

const planToLemonURL: Record<string, string> = {
  'pro-monthly': 'https://reflectai-journal.lemonsqueezy.com/buy/595b09c1-be42-45e8-9f6e-468dbcf84aba',
  'pro-annually': 'https://reflectai-journal.lemonsqueezy.com/buy/364e51aa-d4ab-4a85-a218-c42f88f899ba',
  'unlimited-monthly': 'https://reflectai-journal.lemonsqueezy.com/buy/5325558c-e886-4a4c-9926-a3b8b6be6689',
  'unlimited-annually': 'https://reflectai-journal.lemonsqueezy.com/buy/84991f1c-f488-4959-9303-457ecffac914',
};

export default function CheckoutRedirect() {
  const params = useParams();
  const planId = params.planId;

  useEffect(() => {
    const url = planToLemonURL[planId];
    if (url) {
      window.location.href = url;
    } else {
      alert('Invalid plan selected');
    }
  }, [planId]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Redirecting you to secure checkout...</p>
    </div>
  );
}
