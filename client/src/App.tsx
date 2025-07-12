import mixpanel from 'mixpanel-browser';

mixpanel.init("321dc03bce...YOUR FULL TOKEN HERE...", {
  debug: true,
  track_pageview: true,
  persistence: "localStorage",
});

import { useEffect } from "react";
import { Switch, Route, useLocation, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { FreeUsageProvider } from "@/hooks/use-free-usage-timer";
import { TutorialProvider, useTutorial } from "@/hooks/use-tutorial";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import logo from "@/assets/logo/reflectai-transparent.svg";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import Home from "@/pages/Home";
import Archives from "@/pages/Archives";
import Stats from "@/pages/Stats";
import Goals from "@/pages/Goals";
import MindPatterns from "@/pages/MindPatterns";
import MemoryLane from "@/pages/MemoryLane";
import Chat from "@/pages/Chat";
import Philosopher from "@/pages/Philosopher";
import Subscription from "@/pages/Subscription";
import Checkout from "@/pages/Checkout";
import PaymentSuccess from "@/pages/PaymentSuccess";
import CheckoutSuccess from "@/pages/CheckoutSuccess";
import Settings from "@/pages/Settings";
import Help from "@/pages/Help";
import Landing from "@/pages/Landing";
import Onboarding from "@/pages/Onboarding";
import Auth from "@/pages/Auth";
import CounselorMatch from "@/pages/CounselorMatch";
import NotFound from "./pages/not-found";
import UserTutorial from "@/components/tutorial/UserTutorial";

let stripePromise;
if (import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
}

function AppLayout({ children }: { children: JSX.Element }) {
  const { showTutorial, completeTutorial, skipTutorial } = useTutorial();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pb-16 mb-auto">{children}</main>
      <div className="mt-auto">
        <BottomNav />
        <Footer />
      </div>
      {showTutorial && <UserTutorial onComplete={completeTutorial} onSkip={skipTutorial} />}
    </div>
  );
}

function Router() {
  const {
    user,
    isLoading,
    subscriptionStatus,
    isSubscriptionLoading,
    checkSubscriptionStatus,
  } = useAuth();
  const [, navigate] = useLocation();
  const [location] = useLocation();

  useEffect(() => {
    if (user && !isSubscriptionLoading && !subscriptionStatus) {
      checkSubscriptionStatus().catch(console.error);
    }
  }, [user, isSubscriptionLoading, subscriptionStatus]);

  useEffect(() => {
    if (!isLoading) {
      const path = window.location.pathname;

      // Only redirect auth page for logged-in users, let them stay on homepage
      if (user && path === "/auth") {
        navigate("/app");
      }

      // Redirect non-logged-in users from protected app routes
      if (!user && path.startsWith("/app")) {
        navigate("/");
      }
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (
      user &&
      subscriptionStatus &&
      subscriptionStatus.status !== "active" &&
      !subscriptionStatus.trialActive &&
      location !== "/subscription" &&
      location !== "/payment-success" &&
      !location.startsWith("/checkout")
    ) {
      navigate("/subscription");
    }
  }, [user, subscriptionStatus, location, navigate]);

  if (isLoading || (user && isSubscriptionLoading)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <img src={logo} alt="ReflectAI Logo" className="h-45" />
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/auth" component={Auth} />
      <Route path="/counselor-match" component={CounselorMatch} />
      <Route path="/subscription">
        {stripePromise ? (
          <Elements stripe={stripePromise}>
            <Subscription />
          </Elements>
        ) : (
          <Subscription />
        )}
      </Route>
      <Route path="/checkout/:planId" component={Checkout} />
      <Route path="/payment-success" component={PaymentSuccess} />
      <Route path="/checkout-success" component={CheckoutSuccess} />

      {user && (
        <>
          <Route path="/app">
            <AppLayout>
              <Chat />
            </AppLayout>
          </Route>
          <Route path="/app/counselor">
            <AppLayout>
              <Chat />
            </AppLayout>
          </Route>
          <Route path="/app/journal">
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
          <Route path="/app/mind-patterns">
            <AppLayout>
              <MindPatterns />
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
          <Route path="/app/conversations">
            <Redirect to="/app" />
          </Route>
          <Route path="/app/check-ins">
            <Redirect to="/app" />
          </Route>
          <Route path="/app/challenges">
            <Redirect to="/app" />
          </Route>
        </>
      )}

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FreeUsageProvider>
          <TutorialProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </TutorialProvider>
        </FreeUsageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
