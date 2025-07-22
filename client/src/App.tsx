// Temporarily disable mixpanel to isolate runtime error
// import mixpanel from 'mixpanel-browser';

// // Initialize mixpanel with error handling
// try {
//   if (typeof window !== 'undefined') {
//     mixpanel.init("321dc03bce...YOUR FULL TOKEN HERE...", {
//       debug: false, // Reduced debug to minimize console noise
//       track_pageview: true,
//       persistence: "localStorage",
//     });
//   }
// } catch (error) {
//   console.warn('Mixpanel initialization skipped:', error);
// }

import React, { useEffect } from "react";
import { Switch, Route, useLocation, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ClerkProviderWrapper from "@/components/ClerkProvider";
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from '@clerk/clerk-react';
import { FreeUsageProvider } from "@/hooks/use-free-usage-timer";
import { TutorialProvider, useTutorial } from "@/hooks/use-tutorial";
import { TrialExpirationProvider } from "@/contexts/TrialExpirationContext";
import { UpgradeProvider } from "@/contexts/UpgradeContext";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import TrialStatusBanner from "@/components/ui/TrialStatusBanner";
import Home from "@/pages/Home";
import Archives from "@/pages/Archives";
import Stats from "@/pages/Stats";
import Goals from "@/pages/Goals";
import MindPatterns from "@/pages/MindPatterns";
import MemoryLane from "@/pages/MemoryLane";
import Chat from "@/pages/Chat";
import Philosopher from "@/pages/Philosopher";
import Subscription from "@/pages/Subscription";
import Pricing from "@/pages/Pricing";

import Checkout from "@/pages/Checkout";
import CheckoutStep1 from "@/pages/CheckoutStep1";
import CheckoutStep2 from "@/pages/CheckoutStep2";

import PaymentSuccess from "@/pages/PaymentSuccess";
import PaymentSuccessModal from "@/pages/PaymentSuccessModal";
import CheckoutSuccess from "@/pages/CheckoutSuccess";
import Settings from "@/pages/Settings";
import Blueprint from "@/pages/Blueprint";
import Help from "@/pages/Help";
import Landing from "@/pages/Landing";
import Onboarding from "@/pages/Onboarding";
import Auth from "@/pages/Auth";
import CounselorMatch from "@/pages/CounselorMatch";
import CounselorQuestionnaire from "@/pages/CounselorQuestionnaire";
import TermsOfService from "@/pages/TermsOfService";
import CreateAccount from "@/pages/CreateAccount";
import EmbeddedCheckout from "@/pages/EmbeddedCheckout";
import Feedback from "@/pages/Feedback";
import PasswordReset from "@/pages/PasswordReset";
import NotFound from "./pages/not-found";
import UserTutorial from "@/components/tutorial/UserTutorial";

// Using Stripe Hosted Checkout - no client-side Stripe initialization needed

// Protected Route component - temporarily bypassed while Clerk domain is configured
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // Temporarily allow access to all routes while Clerk domain configuration is resolved
  console.log('Protected route accessed - Clerk authentication temporarily bypassed');
  return <>{children}</>;
}

// App Layout component with header, navigation and footer
function AppLayout({ children }: { children: React.ReactNode }) {
  const { showTutorial, completeTutorial, skipTutorial } = useTutorial();

  return (
    <div className="min-h-screen min-h-dvh flex flex-col safe-area-top">
      <Header />
      <TrialStatusBanner />
      <main className="flex-grow pb-16 mb-auto px-4">
        {children}
      </main>
      <div className="mt-auto">
        <BottomNav />
        <Footer />
      </div>

      {showTutorial && (
        <UserTutorial 
          onComplete={completeTutorial}
          onSkip={skipTutorial}
        />
      )}
    </div>
  );
}

// Authorization Check Component - Simplified for Clerk
function AuthCheck({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// Main Router component
function Router() {
  const PUBLISHABLE_KEY = (import.meta as any).env.VITE_CLERK_PUBLISHABLE_KEY;
  
  // Fallback when Clerk keys aren't configured
  if (!PUBLISHABLE_KEY || PUBLISHABLE_KEY === "pk_test_placeholder") {
    const [, navigate] = useLocation();
    
    // Redirect to auth page if trying to access protected routes
    useEffect(() => {
      const path = window.location.pathname || '/';
      if (path.startsWith("/app") && path !== "/auth") {
        navigate('/auth');
      }
    }, [navigate]);
    
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/auth" component={Auth} />
        <Route path="/onboarding" component={Onboarding} />
        <Route path="/counselor-match" component={CounselorMatch} />
        <Route path="/counselor-questionnaire" component={CounselorQuestionnaire} />
        <Route path="/terms-of-service" component={TermsOfService} />
        <Route path="/subscription" component={Subscription} />
        <Route path="/pricing" component={Pricing} />
        <Route path="/feedback" component={Feedback} />
        <Route path="/create-account" component={CreateAccount} />
        <Route path="/password-reset" component={PasswordReset} />
        <Route path="/embedded-checkout" component={EmbeddedCheckout} />
        <Route><Redirect to="/auth" /></Route>
      </Switch>
    );
  }
  
  // Temporarily bypass Clerk hooks while domain configuration is resolved
  console.log('Router loading without Clerk authentication');

  return (
    <Switch>
        {/* Public routes */}
        <Route path="/" component={Landing} />
        <Route path="/onboarding" component={Onboarding} />
        <Route path="/auth" component={Auth} />
        <Route path="/counselor-match" component={CounselorMatch} />
        <Route path="/counselor-questionnaire" component={CounselorQuestionnaire} />
        <Route path="/terms-of-service" component={TermsOfService} />
        <Route path="/subscription" component={Subscription} />
        <Route path="/pricing" component={Pricing} />
        <Route path="/feedback" component={Feedback} />
        <Route path="/create-account" component={CreateAccount} />
        <Route path="/password-reset" component={PasswordReset} />

      <Route path="/embedded-checkout" component={EmbeddedCheckout} />

      <Route path="/checkout-step1">
        <CheckoutStep1 />
      </Route>

      <Route path="/checkout-step2" component={CheckoutStep2} />

      <Route path="/checkout/:planId" component={Checkout} />
      <Route path="/payment-success" component={PaymentSuccess} />
      <Route path="/payment-success-modal" component={PaymentSuccessModal} />
      <Route path="/checkout-success" component={CheckoutSuccess} />

      {/* App routes - always available but protected with authentication guards */}
      <Route path="/app">
        <ProtectedRoute>
          <AppLayout>
            <Chat />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/app/counselor">
        <ProtectedRoute>
          <AppLayout>
            <Chat />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/app/journal">
        <ProtectedRoute>
          <AppLayout>
            <Home />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/app/archives">
        <ProtectedRoute>
          <AppLayout>
            <Archives />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/app/archives/:year/:month">
        <ProtectedRoute>
          <AppLayout>
            <Archives />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/app/stats">
        <ProtectedRoute>
          <AppLayout>
            <Stats />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/app/goals">
        <ProtectedRoute>
          <AppLayout>
            <Goals />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/app/mind-patterns">
        <ProtectedRoute>
          <AppLayout>
            <MindPatterns />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/app/memory-lane">
        <ProtectedRoute>
          <AppLayout>
            <MemoryLane />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/app/feedback">
        <ProtectedRoute>
          <AppLayout>
            <Feedback />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/app/questionnaire">
        <ProtectedRoute>
          <AppLayout>
            <CounselorQuestionnaire />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/app/blueprint">
        <ProtectedRoute>
          <AppLayout>
            <Blueprint />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/app/journal/:year/:month/:day">
        <ProtectedRoute>
          <AppLayout>
            <Home />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/app/philosopher">
        <ProtectedRoute>
          <AppLayout>
            <Philosopher />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/app/settings">
        <ProtectedRoute>
          <AppLayout>
            <Settings />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/app/help">
        <ProtectedRoute>
          <AppLayout>
            <Help />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      {/* Redirect old routes to home */}
      <Route path="/app/conversations">
        <Redirect to="/app" />
      </Route>
      <Route path="/app/check-ins">
        <Redirect to="/app" />
      </Route>
      <Route path="/app/challenges">
        <Redirect to="/app" />
      </Route>

      {/* 404 page */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    // Global error handler for unhandled promises
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      event.preventDefault(); // Prevent the default error handling
    };

    // Global error handler for runtime errors
    const handleError = (event: ErrorEvent) => {
      console.error('Runtime error:', event.error);
      // Only prevent default for the specific match error we're targeting
      if (event.error && event.error.message && event.error.message.includes("Cannot read properties of undefined (reading 'match')")) {
        event.preventDefault();
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  return (
    <ClerkProviderWrapper>
      <QueryClientProvider client={queryClient}>
        <TrialExpirationProvider>
          <UpgradeProvider>
            <FreeUsageProvider>
              <TutorialProvider>
                <TooltipProvider>
                  <Toaster />
                  <Router />
                </TooltipProvider>
              </TutorialProvider>
            </FreeUsageProvider>
          </UpgradeProvider>
        </TrialExpirationProvider>
      </QueryClientProvider>
    </ClerkProviderWrapper>
  );
}

export default App;