import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { CreateAccountModal } from '@/components/CreateAccountModal';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2 } from 'lucide-react';

const PaymentSuccessModal = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { setUser } = useAuth();
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [planType, setPlanType] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    // Extract session ID from URL parameters
    const params = new URLSearchParams(window.location.search);
    const session = params.get('session_id');
    
    if (!session) {
      toast({
        title: "Invalid Access",
        description: "No valid payment session found. Redirecting to pricing...",
        variant: "destructive",
      });
      navigate('/pricing');
      return;
    }

    // Verify the session and get plan information
    const verifySession = async () => {
      try {
        const response = await fetch(`/api/stripe/verify-session/${session}`, {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Session verification failed');
        }

        const sessionData = await response.json();
        
        setSessionId(session);
        setPlanType(sessionData.planType || 'Premium');
        setIsVerifying(false);
        setShowCreateAccount(true);

      } catch (error) {
        console.error('Session verification error:', error);
        toast({
          title: "Session Verification Failed",
          description: "Unable to verify your payment. Please contact support.",
          variant: "destructive",
        });
        navigate('/pricing');
      }
    };

    verifySession();
  }, [navigate, toast]);

  const handleAccountCreated = async () => {
    // Account was successfully created, now redirect to counselor
    toast({
      title: "Welcome to ReflectAI!",
      description: "Your account has been created. Let's start your journey...",
    });

    // Refresh user auth state and redirect
    try {
      // Fetch updated user info
      const userResponse = await fetch('/api/user', {
        credentials: 'include'
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }

    setShowCreateAccount(false);
    navigate('/app/counselor');
  };

  if (isVerifying) {
    return (
      <div className="container max-w-md mx-auto p-4 flex flex-col items-center justify-center min-h-[80vh]">
        <Card className="w-full border border-slate-700 bg-slate-800/40 backdrop-blur-sm shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
            </div>
            <CardTitle className="text-2xl bg-gradient-to-r from-primary to-violet-600 bg-clip-text text-transparent">
              Verifying Payment...
            </CardTitle>
            <CardDescription>
              Please wait while we confirm your payment details
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="container max-w-md mx-auto p-4 flex flex-col items-center justify-center min-h-[80vh]">
        <Card className="w-full border border-slate-700 bg-slate-800/40 backdrop-blur-sm shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-emerald-500" />
            </div>
            <CardTitle className="text-2xl bg-gradient-to-r from-primary to-violet-600 bg-clip-text text-transparent">
              Payment Successful!
            </CardTitle>
            <CardDescription>
              Your {planType} subscription is now active
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="p-4 mb-4 rounded-lg bg-gradient-to-r from-primary/10 to-violet-500/10 border border-primary/20">
              <p className="text-muted-foreground">
                Your payment has been processed successfully. Please create your account to access your premium features.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <CreateAccountModal
        open={showCreateAccount}
        onClose={() => {}} // Prevent closing
        sessionId={sessionId}
        planType={planType}
        onSuccess={handleAccountCreated}
      />
    </>
  );
};

export default PaymentSuccessModal;