import React from 'react';
import { useProAIUsageByType } from '@/hooks/use-pro-ai-usage';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ProAICountdownProps {
  aiType: 'counselor' | 'philosopher';
}

const ProAICountdown: React.FC<ProAICountdownProps> = ({ aiType }) => {
  const { subscriptionStatus } = useAuth();
  const { data: usage, isLoading } = useProAIUsageByType(aiType);
  
  // Only show for pro users
  const isProUser = subscriptionStatus?.status === 'active' || subscriptionStatus?.hasActiveSubscription;
  
  if (!isProUser || isLoading || !usage) {
    return null;
  }
  
  // Calculate days until reset
  const resetDate = new Date(usage.resetDate);
  const now = new Date();
  const daysUntilReset = Math.ceil((resetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  // Determine status color and icon
  const getStatusInfo = () => {
    if (usage.remaining === 0) {
      return {
        color: 'destructive' as const,
        icon: AlertCircle,
        message: 'Limit reached'
      };
    } else if (usage.remaining <= 2) {
      return {
        color: 'warning' as const,
        icon: AlertCircle,
        message: 'Almost at limit'
      };
    } else {
      return {
        color: 'success' as const,
        icon: CheckCircle,
        message: 'Questions available'
      };
    }
  };
  
  const { color, icon: StatusIcon, message } = getStatusInfo();
  
  return (
    <Card className="mb-4 border-l-4 border-l-primary">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <StatusIcon className={`h-5 w-5 ${
              color === 'destructive' ? 'text-red-500' : 
              color === 'warning' ? 'text-yellow-500' : 
              'text-green-500'
            }`} />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-sm">
                  {usage.remaining} / {usage.maxQuestions} questions remaining
                </span>
                <Badge variant={color} className="text-xs">
                  {message}
                </Badge>
              </div>
              <div className="flex items-center space-x-1 mt-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>
                  Resets in {daysUntilReset} {daysUntilReset === 1 ? 'day' : 'days'} 
                  ({resetDate.toLocaleDateString()})
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProAICountdown;