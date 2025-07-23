import { useEffect } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/hooks/use-firebase-auth";

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
import { FreeUsageProvider } from "@/hooks/use-free-usage-timer";
import { TutorialProvider } from "@/hooks/use-tutorial";
import { TrialExpirationProvider } from "@/contexts/TrialExpirationContext";
import { UpgradeProvider } from "@/contexts/UpgradeContext";

// Simple App Layout component for now
function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">ReflectAI</h1>
            <p className="text-slate-600 dark:text-slate-400">Your AI counselor for mental wellness</p>
          </div>
          {user && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Welcome, {user.displayName || user.email}
              </span>
              <button 
                onClick={signOut}
                className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                Sign Out
              </button>
            </div>
          )}
        </header>
        <main>
          {children}
        </main>
      </div>
    </div>
  );
}

// Protected Route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-bold text-primary">Loading...</div>
      </div>
    );
  }

  if (!user) {
    // Redirect to auth page
    window.location.href = '/auth';
    return null;
  }

  return <>{children}</>;
}

// Main Router component
function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Landing} />
      <Route path="/auth" component={Auth} />

      {/* Protected routes */}
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
    <AuthProvider>
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
    </AuthProvider>
  );
}

export default App;