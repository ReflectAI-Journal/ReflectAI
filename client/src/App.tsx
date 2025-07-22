import { useEffect } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { FallbackSignedIn, FallbackSignedOut, FallbackRedirectToSignIn } from '@/components/FallbackAuth';

// Import pages
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Chat from "./pages/Chat";
import Philosopher from "./pages/Philosopher";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

// Import contexts and providers
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ClerkProviderWrapper from "@/components/ClerkProvider";
import { FreeUsageProvider } from "@/hooks/use-free-usage-timer";
import { TutorialProvider } from "@/hooks/use-tutorial";
import { TrialExpirationProvider } from "@/contexts/TrialExpirationContext";
import { UpgradeProvider } from "@/contexts/UpgradeContext";

// Simple App Layout component for now
function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">ReflectAI</h1>
          <p className="text-slate-600 dark:text-slate-400">Your AI counselor for mental wellness</p>
        </header>
        <main>
          {children}
        </main>
      </div>
    </div>
  );
}

// Main Router component
function Router() {
  // Always use fallback for now due to domain configuration issues
  const shouldUseFallback = true;
  
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Landing} />
      <Route path="/auth" component={Auth} />

      {/* Protected routes - using fallback auth components */}
      <FallbackSignedIn>
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
      </FallbackSignedIn>

      {/* Redirect unauthenticated users */}
      <FallbackSignedOut>
        <Route path="/app*">
          <FallbackRedirectToSignIn />
        </Route>
      </FallbackSignedOut>

      {/* 404 page for unknown routes */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    // Global error handler for unhandled promises
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      event.preventDefault();
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
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