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
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    console.log("[CheckoutSuccess] Component mounted, user:", user ? "authenticated" : "not authenticated");
    console.log("[CheckoutSuccess] URL search params:", window.location.search);
    console.log("[CheckoutSuccess] Full URL:", window.location.href);
    
    // Refresh subscription status when user returns from payment
    if (user) {
      console.log("[CheckoutSuccess] Refreshing subscription status for user ID:", user.id);
      checkSubscriptionStatus()
        .then((result) => {
          console.log("[CheckoutSuccess] Subscription status check result:", result);
        })
        .catch((error) => {
          console.error("[CheckoutSuccess] Error checking subscription status:", error);
          // Don't block the user flow even if this fails
        });
      
      // Start tutorial for new subscribers
      console.log("[CheckoutSuccess] Starting tutorial for new subscriber");
      try {
        startTutorial();
      } catch (error) {
        console.error("[CheckoutSuccess] Error starting tutorial:", error);
      }
    } else {
      console.log("[CheckoutSuccess] No user found, they may need to log in");
    }
  }, [user, checkSubscriptionStatus, startTutorial]);

  return (
    <div className="container max-w-md mx-auto p-4 flex flex-col items-center justify-center min-h-[80vh]">
      <Card className="w-full border border-slate-700 bg-slate-800/40 backdrop-blur-sm shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-emerald-500" />
          </div>
          <CardTitle className="text-2xl bg-gradient-to-r from-blue-400 to-emerald-500 bg-clip-text text-transparent">
            Payment Successful!
          </CardTitle>
          <CardDescription>
            Welcome to ReflectAI Premium
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="p-4 mb-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
            <p className="text-slate-300 mb-2">
              Your premium features have been activated! You now have unlimited access to your AI counselor.
            </p>
            <p className="text-slate-400 text-sm">
              Redirecting you to your AI counselor in a few seconds...
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center space-x-4">
          <Button 
            onClick={async () => {
              console.log('[CheckoutSuccess] Go to App button clicked');
              console.log('[CheckoutSuccess] User state:', user ? 'authenticated' : 'not authenticated');
              
              if (!user) {
                console.log('[CheckoutSuccess] User not authenticated, redirecting to login');
                setLocation('/auth?tab=login&message=please_login_to_access_premium');
                return;
              }
              
              setIsProcessing(true);
              
              try {
                // Refresh subscription status before navigating
                await checkSubscriptionStatus();
                console.log('[CheckoutSuccess] Subscription status refreshed, navigating to counselor');
                setLocation('/app/counselor');
              } catch (error) {
                console.error('[CheckoutSuccess] Error during navigation process:', error);
                // Still try to navigate - the subscription might have been updated via webhook
                setLocation('/app/counselor');
              } finally {
                setIsProcessing(false);
              }
            }}
            disabled={isProcessing}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Setting up your account...
              </>
            ) : (
              'Go to App'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}