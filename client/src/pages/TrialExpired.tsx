import { useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { TrialStatus } from '@/components/subscription/TrialStatus';
import { Button } from '@/components/ui/button';

export default function TrialExpired() {
  const { user, subscriptionStatus, checkSubscriptionStatus } = useAuth();
  const [location, setLocation] = useLocation();

  // Check subscription status when component mounts
  useEffect(() => {
    if (user) {
      checkSubscriptionStatus().catch(console.error);
    }
  }, [user]);

  // If subscription is active or trial is valid, redirect back to the app
  useEffect(() => {
    if (subscriptionStatus) {
      if (subscriptionStatus.status === 'active' || subscriptionStatus.trialActive) {
        setLocation('/app');
      }
    }
  }, [subscriptionStatus, setLocation]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-background/90">
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <div className="mr-4 hidden md:flex">
            <Link to="/" className="mr-6 flex items-center space-x-2">
              <span className="hidden font-bold sm:inline-block">
                <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  ReflectAI
                </span>
              </span>
            </Link>
          </div>
        </div>
      </header>
      
      <main className="flex-1 bg-dot-pattern py-10">
        <div className="container max-w-6xl mx-auto px-4 space-y-12">
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Subscription Required
              </span>
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Your trial period has ended. Please subscribe to continue using the application.
            </p>
          </div>
          
          <TrialStatus />
          
          <div className="text-center space-y-5">
            <h2 className="text-2xl font-bold">Premium Features Include:</h2>
            
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="rounded-lg border bg-card p-5 shadow-sm text-center">
                <div className="text-lg font-semibold mb-2">AI-Powered Journal Analysis</div>
                <p className="text-sm text-muted-foreground">Get personalized insights and patterns from your journaling.</p>
              </div>
              
              <div className="rounded-lg border bg-card p-5 shadow-sm text-center">
                <div className="text-lg font-semibold mb-2">Philosopher AI Mode</div>
                <p className="text-sm text-muted-foreground">Gain deeper insights with philosophical perspectives.</p>
              </div>
              
              <div className="rounded-lg border bg-card p-5 shadow-sm text-center">
                <div className="text-lg font-semibold mb-2">Unlimited Goal Tracking</div>
                <p className="text-sm text-muted-foreground">Track and visualize progress on multiple personal goals.</p>
              </div>
              
              <div className="rounded-lg border bg-card p-5 shadow-sm text-center">
                <div className="text-lg font-semibold mb-2">Advanced Analytics</div>
                <p className="text-sm text-muted-foreground">Review detailed mood trends and writing patterns.</p>
              </div>
              
              <div className="rounded-lg border bg-card p-5 shadow-sm text-center">
                <div className="text-lg font-semibold mb-2">Custom AI Personalities</div>
                <p className="text-sm text-muted-foreground">Create your own AI assistant personas for different needs.</p>
              </div>
              
              <div className="rounded-lg border bg-card p-5 shadow-sm text-center">
                <div className="text-lg font-semibold mb-2">Premium Support</div>
                <p className="text-sm text-muted-foreground">Get priority support from our dedicated team.</p>
              </div>
            </div>
            
            <div className="pt-5">
              <Button asChild size="lg" className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90">
                <Link to="/subscription">
                  View Subscription Plans
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="border-t border-border/40 py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} ReflectAI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}