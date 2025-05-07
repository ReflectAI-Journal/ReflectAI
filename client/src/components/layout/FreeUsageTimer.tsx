import { useFreeUsage } from "@/hooks/use-free-usage-timer";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";

export default function FreeUsageTimer() {
  const { timeRemaining } = useFreeUsage();
  const { subscriptionStatus } = useAuth();
  const [, navigate] = useLocation();
  const [visible, setVisible] = useState(false);
  
  // Format time display
  const minutes = Math.floor(timeRemaining / 60000);
  const seconds = Math.floor((timeRemaining % 60000) / 1000);
  const formattedTime = `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  
  // Check if user has a paid subscription or active trial
  const isPaidUser = subscriptionStatus?.status === 'active' || 
                    subscriptionStatus?.trialActive;
  
  // Show timer only for free users with less than 2 minutes remaining
  useEffect(() => {
    if (!isPaidUser && timeRemaining <= 120000) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [isPaidUser, timeRemaining]);
  
  if (!visible) return null;
  
  return (
    <div className="flex items-center">
      <Button 
        variant="outline" 
        size="sm" 
        className="gap-1 text-xs text-yellow-500 border-yellow-500 hover:text-yellow-600 hover:border-yellow-600"
        onClick={() => navigate('/subscription')}
      >
        <Clock className="h-3 w-3" />
        {formattedTime}
      </Button>
    </div>
  );
}