import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useEffect } from "react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import Home from "@/pages/Home";
import Archives from "@/pages/Archives";
import Stats from "@/pages/Stats";
import Goals from "@/pages/Goals";
import MemoryLane from "@/pages/MemoryLane";
import Chat from "@/pages/Chat";
import Philosopher from "@/pages/Philosopher";
import Subscription from "@/pages/Subscription";
import Checkout from "@/pages/Checkout";
import PaymentSuccess from "@/pages/PaymentSuccess";
import Settings from "@/pages/Settings";
import Help from "@/pages/Help";
import Landing from "@/pages/Landing";
import Auth from "@/pages/Auth";
import TrialExpired from "@/pages/TrialExpired";
import NotFound from "@/pages/not-found";

// Initialize Stripe with the public key
let stripePromise;
if (import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
}

// App Layout component with header, navigation and footer
function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pb-24 mb-auto">
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
  
  // Redirect to trial-expired page if trial has expired
  useEffect(() => {
    if (user && subscriptionStatus && !subscriptionStatus.trialActive && subscriptionStatus.status !== 'active' && subscriptionStatus.requiresSubscription) {
      navigate('/trial-expired');
    }
  }, [user, subscriptionStatus, navigate]);
  
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
  
  // Redirect to auth page if not logged in and trying to access protected routes
  useEffect(() => {
    if (!isLoading && !user) {
      const path = window.location.pathname;
      if (path !== "/" && path !== "/auth" && path !== "/trial-expired") {
        navigate('/auth');
      }
    }
  }, [user, isLoading, navigate]);
  
  // Redirect to trial-expired page if trial has expired
  useEffect(() => {
    if (user && subscriptionStatus && 
        !subscriptionStatus.trialActive && 
        subscriptionStatus.status !== 'active' && 
        subscriptionStatus.requiresSubscription &&
        location !== "/subscription" && 
        location !== "/checkout" && 
        location !== "/payment-success" && 
        location !== "/trial-expired") {
      navigate('/trial-expired');
    }
  }, [user, subscriptionStatus, location, navigate]);

  if (isLoading || (user && isSubscriptionLoading)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Landing} />
      <Route path="/auth" component={Auth} />
      <Route path="/trial-expired" component={TrialExpired} />
      
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
          
          {/* Other protected routes */}
          <Route path="/subscription">
            <Subscription />
          </Route>
          
          <Route path="/checkout/:planId">
            <Checkout />
          </Route>
          
          <Route path="/payment-success">
            <PaymentSuccess />
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
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
