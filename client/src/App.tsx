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

import React, { useEffect, useState } from "react";
import { Switch, Route, useLocation, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { FreeUsageProvider, useFreeUsage } from "@/hooks/use-free-usage-timer";
import { TutorialProvider, useTutorial } from "@/hooks/use-tutorial";
import { TrialExpirationProvider } from "@/contexts/TrialExpirationContext";
import { UpgradeProvider } from "@/contexts/UpgradeContext";
// Removed Stripe Elements - using hosted checkout only
import logo from "@/assets/logo/reflectai-transparent.svg";

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
import EmbeddedCheckout from "@/pages/EmbeddedCheckout";
import Feedback from "@/pages/Feedback";
import PasswordReset from "@/pages/PasswordReset";
import NotFound from "./pages/not-found";
import UserTutorial from "@/components/tutorial/UserTutorial";

// Using Stripe Hosted Checkout - no client-side Stripe initialization needed

// Protected Route component that handles authentication
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const [hasToken] = useState(() => !!localStorage.getItem('token'));

  useEffect(() => {
    // If we have a token but no user yet, wait for auth to load
    if (hasToken && !user && !isLoading) {
      // Give a bit more time for auth to initialize
      const timer = setTimeout(() => {
        if (!user) {
          navigate('/auth');
        }
      }, 500);
      return () => clearTimeout(timer);
    } else if (!isLoading && !user && !hasToken) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate, hasToken]);

  // Show loading if we're still initializing auth or if we have a token but no user yet
  if (isLoading || (hasToken && !user)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

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

  // Free usage time limit has been removed
  // Keeping the hook for compatibility but not using its values

  // Debug: Log current location (reduced logging)
  useEffect(() => {
    // Only log in development and reduce console noise
    if (process.env.NODE_ENV === 'development') {
      try {
        console.log("Auth status:", user ? "authenticated" : "unauthenticated", "location:", location || 'undefined');
      } catch (error) {
        console.error("Location logging error:", error);
      }
    }
  }, [user, location]);

  // Check subscription status if logged in
  useEffect(() => {
    if (user && !isSubscriptionLoading && !subscriptionStatus) {
      checkSubscriptionStatus().catch(error => {
        console.error('Subscription status check failed:', error);
        // Don't throw or rethrow - just log and continue
      });
    }
  }, [user, isSubscriptionLoading, subscriptionStatus, checkSubscriptionStatus]);

  // Free usage time limit has been removed - no redirect needed
  // All users now have unlimited free usage

  // Redirect authenticated users away from public pages and protect app routes
  useEffect(() => {
    if (!isLoading) {
      try {
        const path = window.location.pathname || '/';

        // Only redirect if user just logged in and is on landing page
        // Don't redirect from auth page to prevent login bounce
        if (user && path === "/" && !path.includes("auth")) {
          navigate('/app/counselor');
        }

        // If not logged in and trying to access app routes, redirect to landing page
        if (!user && path.startsWith("/app")) {
          navigate('/');
        }
      } catch (error) {
        console.error('Navigation error:', error);
        // Don't redirect on error - let user stay where they are
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
          className="h-45" 
        />
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

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
        <Route path="/password-reset" component={PasswordReset} />

      <Route path="/embedded-checkout" component={EmbeddedCheckout} />

      <Route path="/checkout-step1">
        <CheckoutStep1 />
      </Route>

      <Route path="/checkout-step2" component={CheckoutStep2} />

      <Route path="/checkout/:planId" component={Checkout} />
      <Route path="/payment-success" component={PaymentSuccess} />
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
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
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
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;