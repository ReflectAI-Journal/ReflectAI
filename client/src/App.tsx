import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { FreeUsageProvider, useFreeUsage } from "@/hooks/use-free-usage-timer";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useEffect } from "react";
import logo from "@/assets/logo/reflect-ai-logo-user.png";
import { useIsiOS } from '@/hooks/use-ios-detection.ts';

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import Home from "@/pages/Home";
import Archives from "@/pages/Archives";
import Stats from "@/pages/Stats";
import Goals from "@/pages/Goals";
import MemoryLane from "@/pages/MemoryLane";
import MindPatterns from "@/pages/MindPatterns";
import Chat from "@/pages/Chat";
import Philosopher from "@/pages/Philosopher";
import Subscription from "@/pages/Subscription";
import Checkout from "@/pages/Checkout";
import PaymentSuccess from "@/pages/PaymentSuccess";
import Settings from "@/pages/Settings";
import Help from "@/pages/Help";
import Onboarding from "@/pages/Onboarding";
import Auth from "@/pages/Auth";
import NotFound from "./pages/not-found";

// Initialize Stripe with the public key
let stripePromise;
if (import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
}

// App Layout component with header, navigation and footer
function AppLayout({ children }: { children: React.ReactNode }) {
  const isiOS = useIsiOS();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pb-16 mb-auto">
        {children}
      </main>
      <div className="mt-auto">
        <BottomNav />
        <Footer />
      </div>
    </div>
  );
}

// Authorization Check Component
function AuthCheck({ children }: { children: React.ReactNode }) {
  const { user, isLoading, subscriptionStatus, isSubscriptionLoading, checkSubscriptionStatus } = useAuth();
  const [, navigate] = useLocation();
  
  // Redirect to auth if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);
  
  // Check subscription status if logged in
  useEffect(() => {
    if (user && !isSubscriptionLoading && !subscriptionStatus) {
      checkSubscriptionStatus().catch(console.error);
    }
  }, [user, isSubscriptionLoading, subscriptionStatus]);
  
  // Commented out redirection to subscription page to allow users to access the journal
  // useEffect(() => {
  //   if (user && subscriptionStatus && !subscriptionStatus.trialActive && subscriptionStatus.status !== 'active' && subscriptionStatus.requiresSubscription) {
  //     navigate('/subscription');
  //   }
  // }, [user, subscriptionStatus, navigate]);
  
  if (isLoading || isSubscriptionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!user) {
    return null; // Will redirect to /auth via useEffect
  }
  
  return <>{children}</>;
}

// Main Router component
function Router() {
  const { 
    user, 
    isLoading, 
    subscriptionStatus,
    isSubscriptionLoading,
    checkSubscriptionStatus
  } = useAuth();
  const [, navigate] = useLocation();
  const [location] = useLocation();
  
  // Free usage time limit enforcement
  const { timeRemaining } = useFreeUsage();

  // Debug: Log current location
  useEffect(() => {
    console.log("Checking auth in App.tsx - User:", user ? "Logged in" : "Not logged in");
    console.log("Current location:", location);
  }, [user, location]);
  
  // Check subscription status if logged in
  useEffect(() => {
    if (user && !isSubscriptionLoading && !subscriptionStatus) {
      checkSubscriptionStatus().catch(console.error);
    }
  }, [user, isSubscriptionLoading, subscriptionStatus]);
  
  // Free usage time limit - redirect to subscription page when time is up
  useEffect(() => {
    if (user && subscriptionStatus && 
        !subscriptionStatus.trialActive && 
        subscriptionStatus.status !== 'active' && 
        timeRemaining === 0 &&
        location !== "/subscription" && 
        !location.startsWith("/checkout/") && 
        location !== "/payment-success") {
      navigate('/subscription');
    }
  }, [user, subscriptionStatus, timeRemaining, location, navigate]);
  
  // Redirect to auth page if not logged in and trying to access protected routes
  // Also redirect subscribed users to home page when they access the onboarding flow
  useEffect(() => {
    if (!isLoading) {
      const path = window.location.pathname;
      
      // If user is logged in and on auth page or root (onboarding) page, redirect to home
      if (user && (path === "/auth" || path === "/")) {
        navigate('/app');
      }
      
      // If not logged in, redirect to auth except for root, auth, subscription, checkout, and payment success pages
      if (!user && 
          path !== "/" && 
          path !== "/auth" && 
          path !== "/subscription" && 
          !path.startsWith("/checkout/") && 
          path !== "/payment-success") {
        navigate('/auth');
      }
    }
  }, [user, isLoading, navigate]);
  
  // Commented out redirection to subscription page to always allow users to access the journaling page
  // useEffect(() => {
  //   if (user && subscriptionStatus && 
  //       !subscriptionStatus.trialActive && 
  //       subscriptionStatus.status !== 'active' && 
  //       subscriptionStatus.requiresSubscription &&
  //       location !== "/" &&  // Allow access to landing page
  //       location !== "/subscription" && 
  //       !location.startsWith("/checkout/") && 
  //       location !== "/payment-success") {
  //     navigate('/subscription');
  //   }
  // }, [user, subscriptionStatus, location, navigate]);

  if (isLoading || (user && isSubscriptionLoading)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <img 
          src={logo} 
          alt="ReflectAI Logo" 
          className="h-20 filter drop-shadow-[0_0_8px_rgba(0,123,255,0.7)]" 
        />
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Onboarding} />
      <Route path="/auth" component={Auth} />
      <Route path="/subscription" component={Subscription} />
      <Route path="/checkout/:planId" component={Checkout} />
      <Route path="/payment-success" component={PaymentSuccess} />
      
      {/* App routes - only render if logged in */}
      {user && (
        <>
          <Route path="/app">
            <AppLayout>
              <Home />
            </AppLayout>
          </Route>
          
          <Route path="/app/archives">
            <AppLayout>
              <Archives />
            </AppLayout>
          </Route>
          
          <Route path="/app/archives/:year/:month">
            <AppLayout>
              <Archives />
            </AppLayout>
          </Route>
          
          <Route path="/app/stats">
            <AppLayout>
              <Stats />
            </AppLayout>
          </Route>
          
          <Route path="/app/goals">
            <AppLayout>
              <Goals />
            </AppLayout>
          </Route>
          
          <Route path="/app/memory-lane">
            <AppLayout>
              <MemoryLane />
            </AppLayout>
          </Route>
          
          <Route path="/app/mind-patterns">
            <AppLayout>
              <MindPatterns />
            </AppLayout>
          </Route>
          
          <Route path="/app/journal/:year/:month/:day">
            <AppLayout>
              <Home />
            </AppLayout>
          </Route>
          
          <Route path="/app/chat">
            <AppLayout>
              <Chat />
            </AppLayout>
          </Route>
          
          <Route path="/app/philosopher">
            <AppLayout>
              <Philosopher />
            </AppLayout>
          </Route>
          
          <Route path="/app/settings">
            <AppLayout>
              <Settings />
            </AppLayout>
          </Route>
          
          <Route path="/app/help">
            <AppLayout>
              <Help />
            </AppLayout>
          </Route>
        </>
      )}
      
      {/* 404 page */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FreeUsageProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </FreeUsageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

