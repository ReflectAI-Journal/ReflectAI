import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

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
import NotFound from "@/pages/not-found";

// Initialize Stripe with the public key
let stripePromise;
if (import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
}

function Router() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pb-24 mb-auto">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/archives" component={Archives} />
          <Route path="/archives/:year/:month" component={Archives} />
          <Route path="/stats" component={Stats} />
          <Route path="/goals" component={Goals} />
          <Route path="/memory-lane" component={MemoryLane} />
          <Route path="/journal/:year/:month/:day" component={Home} />
          <Route path="/chat" component={Chat} />
          <Route path="/philosopher" component={Philosopher} />
          <Route path="/subscription" component={Subscription} />
          <Route path="/checkout/:planId" component={Checkout} />
          <Route path="/payment-success" component={PaymentSuccess} />
          <Route path="/settings" component={Settings} />
          <Route path="/help" component={Help} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <div className="mt-auto">
        <BottomNav />
        <Footer />
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
