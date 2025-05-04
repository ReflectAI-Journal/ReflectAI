import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

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
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pb-24">
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
          <Route component={NotFound} />
        </Switch>
      </main>
      <BottomNav />
      <Footer className="hidden" />
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
