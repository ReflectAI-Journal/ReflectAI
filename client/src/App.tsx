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

// Main Router component
function Router() {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  
  // Redirect to auth page if not logged in and trying to access protected routes
  useEffect(() => {
    if (!isLoading && !user) {
      const path = window.location.pathname;
      if (path.startsWith('/app') || 
          path.startsWith('/subscription') || 
          path.startsWith('/checkout') || 
          path.startsWith('/payment-success')) {
        navigate('/auth');
      }
    }
  }, [user, isLoading, navigate]);

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Landing} />
      <Route path="/auth" component={Auth} />
      
      {/* App routes wrapped in AppLayout */}
      <Route path="/app">
        {() => (
          <AppLayout>
            <Switch>
              <Route path="/app" component={Home} />
              <Route path="/app/archives" component={Archives} />
              <Route path="/app/archives/:year/:month" component={Archives} />
              <Route path="/app/stats" component={Stats} />
              <Route path="/app/goals" component={Goals} />
              <Route path="/app/memory-lane" component={MemoryLane} />
              <Route path="/app/journal/:year/:month/:day" component={Home} />
              <Route path="/app/chat" component={Chat} />
              <Route path="/app/philosopher" component={Philosopher} />
              <Route path="/app/settings" component={Settings} />
              <Route path="/app/help" component={Help} />
            </Switch>
          </AppLayout>
        )}
      </Route>
      
      {/* Standalone routes */}
      <Route path="/subscription" component={Subscription} />
      <Route path="/checkout/:planId" component={Checkout} />
      <Route path="/payment-success" component={PaymentSuccess} />
      
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
