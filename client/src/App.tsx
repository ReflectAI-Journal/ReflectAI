import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { FreeUsageProvider } from "@/hooks/use-free-usage-timer";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useEffect } from "react";
import logo from "@/assets/logo/reflect-ai-logo-user.png";

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
import Landing from "@/pages/Landing";
import Onboarding from "@/pages/Onboarding";
import Auth from "@/pages/Auth";
import NotFound from "./pages/not-found";

// Initialize Stripe with the public key
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

// App Layout component with header, navigation and footer
function AppLayout({ children }: { children: React.ReactNode }) {
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

function AppWithProviders() {
  const { user, isLoading } = useAuth();
  const [location, setLocation] = useLocation();
  
  console.log("Checking auth in App.tsx - User:", user ? `${user.username} (${user.id})` : "Not logged in");
  console.log("Current location:", location);

  // Redirect handling based on authentication status
  useEffect(() => {
    // Skip redirects during loading
    if (isLoading) return;
    
    // Landing page - accessible to all
    if (location === "/") return;
    
    // Public routes (no authentication required)
    const publicRoutes = ["/auth", "/onboarding", "/help"];
    if (publicRoutes.includes(location)) return;
    
    // Checkout routes are public but require Stripe
    if (location.startsWith("/checkout")) return;
    
    // Payment success page - public
    if (location === "/payment-success") return;
    
    // If user is not authenticated and trying to access protected routes
    if (!user) {
      console.log("User not authenticated, redirecting to landing page");
      setLocation("/");
      return;
    }
    
  }, [user, isLoading, location, setLocation]);

  // Show loading state during authentication check
  useEffect(() => {
    if (isLoading && location !== "/") {
      console.log("Authentication loading...");
    }
  }, [isLoading, location]);

  return (
    <div className="min-h-screen bg-gray-900 text-white relative">
      <img 
        src={logo} 
        alt="ReflectAI Logo" 
        className="absolute top-4 left-4 w-8 h-8 opacity-20 pointer-events-none z-0"
      />
      
      <div className="relative z-10">
        <Switch>
          {/* Landing Page - Always accessible */}
          <Route path="/" component={Landing} />
          <Route path="/auth" component={Auth} />
          <Route path="/onboarding" component={Onboarding} />
          <Route path="/help" component={Help} />
          
          {/* Checkout routes - Public but require Stripe */}
          <Route path="/checkout/:planId">
            {() => stripePromise ? (
              <Elements stripe={stripePromise}>
                <Checkout />
              </Elements>
            ) : (
              <div>Stripe not configured</div>
            )}
          </Route>
          
          <Route path="/payment-success" component={PaymentSuccess} />
          
          {/* Subscription page - accessible without auth for marketing */}
          <Route path="/subscription" component={Subscription} />
          
          {/* Protected Routes - Require authentication */}
          <Route path="/home">
            <AppLayout>
              <Home />
            </AppLayout>
          </Route>
          
          <Route path="/archives">
            <AppLayout>
              <Archives />
            </AppLayout>
          </Route>
          
          <Route path="/stats">
            <AppLayout>
              <Stats />
            </AppLayout>
          </Route>
          
          <Route path="/goals">
            <AppLayout>
              <Goals />
            </AppLayout>
          </Route>
          
          <Route path="/memory-lane">
            <AppLayout>
              <MemoryLane />
            </AppLayout>
          </Route>
          
          <Route path="/mind-patterns">
            <AppLayout>
              <MindPatterns />
            </AppLayout>
          </Route>
          
          <Route path="/chat">
            <AppLayout>
              <Chat />
            </AppLayout>
          </Route>
          
          <Route path="/philosopher">
            <AppLayout>
              <Philosopher />
            </AppLayout>
          </Route>
          
          <Route path="/settings">
            <AppLayout>
              <Settings />
            </AppLayout>
          </Route>
          
          <Route component={NotFound} />
        </Switch>
      </div>
      
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FreeUsageProvider>
          <TooltipProvider>
            <AppWithProviders />
          </TooltipProvider>
        </FreeUsageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}