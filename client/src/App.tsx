import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch } from "wouter";
import { AuthProvider } from "@/hooks/use-auth";
import { Toaster } from "@/components/ui/toaster";
import { ProtectedRoute } from "@/lib/protected-route";

import Landing from "@/pages/Landing";
import Auth from "@/pages/Auth";
import Home from "@/pages/Home";
import Archives from "@/pages/Archives";
import Stats from "@/pages/Stats";
import Goals from "@/pages/Goals";
import Settings from "@/pages/Settings";
import Subscription from "@/pages/Subscription";
import Chat from "@/pages/Chat";
import Philosopher from "@/pages/Philosopher";
import MemoryLane from "@/pages/MemoryLane";
import MindPatterns from "@/pages/MindPatterns";
import Help from "@/pages/Help";
import Onboarding from "@/pages/Onboarding";
import Checkout from "@/pages/Checkout";
import PaymentSuccess from "@/pages/PaymentSuccess";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/auth" component={Auth} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/payment-success" component={PaymentSuccess} />
      
      <ProtectedRoute path="/home" component={Home} />
      <ProtectedRoute path="/archives" component={Archives} />
      <ProtectedRoute path="/stats" component={Stats} />
      <ProtectedRoute path="/goals" component={Goals} />
      <ProtectedRoute path="/settings" component={Settings} />
      <ProtectedRoute path="/subscription" component={Subscription} />
      <ProtectedRoute path="/chat" component={Chat} />
      <ProtectedRoute path="/philosopher" component={Philosopher} />
      <ProtectedRoute path="/memory-lane" component={MemoryLane} />
      <ProtectedRoute path="/mind-patterns" component={MindPatterns} />
      <ProtectedRoute path="/help" component={Help} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;