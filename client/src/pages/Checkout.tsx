import { useEffect } from 'react';
import { useLocation } from 'wouter';

export default function CheckoutRedirect() {
  const [, navigate] = useLocation();

  useEffect(() => {
    // Redirect back to subscription page since checkout is no longer available
    navigate('/subscription');
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Redirecting to subscription plans...</p>
      </div>
    </div>
  );
}
