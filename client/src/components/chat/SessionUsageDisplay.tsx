import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Zap, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

interface SessionUsageData {
  canSend: boolean;
  remaining: number;
  used: number;
  monthlyLimit: number;
  currentPlan: string;
  hasActiveSubscription: boolean;
  isVipUser: boolean;
  resetDate: string;
}

export const SessionUsageDisplay: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [, navigate] = useLocation();
  
  const { data: usage, isLoading } = useQuery<SessionUsageData>({
    queryKey: ['/api/chatbot/usage'],
    enabled: true,
    refetchInterval: 30000 // Refetch every 30 seconds
  });

  if (isLoading || !usage) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="h-4 w-16 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  // VIP or Elite users get unlimited sessions
  if (usage.isVipUser || usage.monthlyLimit === -1) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Crown className="h-4 w-4 text-yellow-500" />
        <Badge variant="secondary" className="bg-gradient-to-r from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30 text-yellow-800 dark:text-yellow-200">
          Unlimited Sessions
        </Badge>
      </div>
    );
  }

  const progressPercent = usage.monthlyLimit > 0 ? (usage.used / usage.monthlyLimit) * 100 : 0;
  const isLowOnSessions = usage.remaining <= 3 && usage.remaining > 0;
  const isOutOfSessions = usage.remaining === 0;
  const isBasicPlan = usage.currentPlan === 'basic' && usage.hasActiveSubscription;

  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {isBasicPlan ? 
              "AI counselor not included in Basic plan" : 
              `${usage.remaining} of ${usage.monthlyLimit} sessions left`
            }
          </span>
        </div>
        
        {usage.currentPlan && (
          <Badge 
            variant={usage.hasActiveSubscription ? "default" : "outline"}
            className={`text-xs ${
              usage.currentPlan === 'pro' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200' :
              usage.currentPlan === 'basic' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' :
              'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200'
            }`}
          >
            {usage.currentPlan === 'basic' ? 'Basic Plan' : 
             usage.currentPlan === 'pro' ? 'Pro Plan' : 
             usage.currentPlan.charAt(0).toUpperCase() + usage.currentPlan.slice(1)}
          </Badge>
        )}
      </div>

      {usage.monthlyLimit > 0 && (
        <Progress 
          value={progressPercent} 
          className={`h-2 ${
            isOutOfSessions ? 'bg-red-100 dark:bg-red-900/30' :
            isLowOnSessions ? 'bg-yellow-100 dark:bg-yellow-900/30' :
            'bg-green-100 dark:bg-green-900/30'
          }`}
        />
      )}

      {(isBasicPlan || isLowOnSessions || isOutOfSessions) && (
        <div className="flex items-center justify-between">
          <span className={`text-xs ${isBasicPlan || isOutOfSessions ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
            {isBasicPlan ? 'Upgrade to access AI counselor' : 
             isOutOfSessions ? 'No sessions remaining' : 
             'Running low on sessions'}
          </span>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/subscription')}
            className="h-6 px-2 text-xs bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-blue-200 dark:border-blue-700 hover:from-blue-100 hover:to-purple-100"
          >
            <Zap className="h-3 w-3 mr-1" />
            Upgrade
          </Button>
        </div>
      )}

      {usage.resetDate && (
        <div className="text-xs text-muted-foreground">
          Resets: {new Date(usage.resetDate).toLocaleDateString()}
        </div>
      )}
    </div>
  );
};