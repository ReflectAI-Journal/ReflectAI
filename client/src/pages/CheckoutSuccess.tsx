import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function CheckoutSuccess() {
  const [, setLocation] = useLocation();
  const { user, checkSubscriptionStatus } = useAuth();

  useEffect(() => {
    // Refresh subscription status when user returns from payment
    if (user) {
      checkSubscriptionStatus().catch(console.error);
      
      // Auto-redirect to counselor page after a short delay
      const timer = setTimeout(() => {
        setLocation('/app/counselor');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [user, checkSubscriptionStatus, setLocation]);

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
            onClick={() => setLocation('/app/counselor')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Start Counseling Session Now
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}