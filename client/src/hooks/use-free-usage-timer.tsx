import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useAuth } from "./use-auth";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock, AlertTriangle } from "lucide-react";

// Free usage time in milliseconds (effectively unlimited)
const FREE_USAGE_TIME = Number.MAX_SAFE_INTEGER;

type FreeUsageContextType = {
  timeRemaining: number;
  showTimeWarning: boolean;
  resetTimer: () => void;
  dismissWarning: () => void;
};

export const FreeUsageContext = createContext<FreeUsageContextType | null>(null);

export function FreeUsageProvider({ children }: { children: ReactNode }) {
  const { user, subscriptionStatus } = useAuth();
  const [location, navigate] = useLocation();
  
  // Time remaining in milliseconds
  const [timeRemaining, setTimeRemaining] = useState(FREE_USAGE_TIME);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  
  // Check if user is on a paid subscription or trial
  const isPaidUser = subscriptionStatus?.status === 'active' || 
                      subscriptionStatus?.trialActive;
  
  const resetTimer = () => {
    setTimeRemaining(FREE_USAGE_TIME);
    setLastActivity(Date.now());
    setShowTimeWarning(false);
  };
  
  const dismissWarning = () => {
    setShowTimeWarning(false);
  };
  
  // Reset timer when a user logs in or subscription status changes
  useEffect(() => {
    resetTimer();
  }, [user, subscriptionStatus]);
  
  // Update activity timestamp on user interaction
  useEffect(() => {
    const updateActivity = () => {
      setLastActivity(Date.now());
    };

    // Listen for user activity
    window.addEventListener('click', updateActivity);
    window.addEventListener('keypress', updateActivity);
    
    return () => {
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('keypress', updateActivity);
    };
  }, []);
  
  // Timer is disabled - all users get unlimited time
  useEffect(() => {
    // Keep the time always at maximum
    setTimeRemaining(FREE_USAGE_TIME);
    
    // Never show time warning
    setShowTimeWarning(false);
    
    // No interval needed as we're not counting down
  }, []);
  
  return (
    <FreeUsageContext.Provider value={{ 
      timeRemaining, 
      showTimeWarning, 
      resetTimer, 
      dismissWarning 
    }}>
      {children}
      {/* Warning modal removed */}
    </FreeUsageContext.Provider>
  );
}

function FreeUsageWarningModal() {
  const context = useContext(FreeUsageContext);
  const [, navigate] = useLocation();
  
  if (!context) {
    throw new Error("useFreeUsage must be used within FreeUsageProvider");
  }
  
  const { timeRemaining, showTimeWarning, dismissWarning } = context;
  
  // Convert milliseconds to minutes and seconds
  const minutes = Math.floor(timeRemaining / 60000);
  const seconds = Math.floor((timeRemaining % 60000) / 1000);
  
  return (
    <Dialog open={showTimeWarning} onOpenChange={dismissWarning}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Free Usage Time Limit
          </DialogTitle>
          <DialogDescription>
            You have {minutes} minutes and {seconds} seconds of free usage time remaining. 
            Upgrade to a premium plan for unlimited access.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center py-4">
          <div className="w-24 h-24 rounded-full border-4 border-primary flex items-center justify-center">
            <Clock className="h-10 w-10 text-primary" />
            <div className="absolute text-xl font-bold">
              {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
            </div>
          </div>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
          <Button variant="outline" onClick={dismissWarning}>
            Continue Using ({minutes}:{seconds < 10 ? `0${seconds}` : seconds})
          </Button>
          <Button onClick={() => navigate('/subscription')}>
            Upgrade Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function useFreeUsage() {
  const context = useContext(FreeUsageContext);
  
  if (!context) {
    throw new Error("useFreeUsage must be used within FreeUsageProvider");
  }
  
  return context;
}