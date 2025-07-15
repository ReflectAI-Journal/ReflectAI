import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useTutorial } from '@/hooks/use-tutorial';

export default function CheckoutSuccess() {
  const [, setLocation] = useLocation();
  const { user, checkSubscriptionStatus } = useAuth();
  const { startTutorial } = useTutorial();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationComplete, setVerificationComplete] = useState(false);

  useEffect(() => {
    const handlePaymentVerification = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get('session_id');

      if (!sessionId || !user) {
        setIsVerifying(false);
        return;
      }

      try {
        // Verify the payment with our backend
        const response = await fetch(`/api/checkout-success?session_id=${sessionId}`, {
          credentials: 'include'
        });

        if (response.ok) {
          // Refresh subscription status
          await checkSubscriptionStatus();
          setVerificationComplete(true);
          
          // Start tutorial for new subscribers
          startTutorial();
        }
      } catch (error) {
        console.error('Payment verification error:', error);
      } finally {
        setIsVerifying(false);
      }
    };

    if (user) {
      handlePaymentVerification();
    }
  }, [user, checkSubscriptionStatus, startTutorial]);

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="w-full max-w-md text-center shadow-xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardHeader className="space-y-2">
            <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
              <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Verifying Payment...
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Please wait while we confirm your subscription.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md text-center shadow-xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
        <CardHeader className="space-y-2">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            {verificationComplete ? 'Payment Successful!' : 'Almost Done!'}
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            {verificationComplete 
              ? 'Welcome to ReflectAI Premium! Your subscription is now active.'
              : 'Your payment was processed. Please complete setup in the app.'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              You now have access to all premium features including unlimited AI conversations, 
              advanced analytics, and priority support.
            </p>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-3">
          <Button 
            onClick={() => setLocation('/app/counselor')}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
          >
            Go to App
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}