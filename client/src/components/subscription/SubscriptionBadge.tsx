import { useQuery } from '@tanstack/react-query';
import { Crown, Clock, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SubscriptionStatus {
  status: 'active' | 'trial' | 'expired';
  plan: string | null;
  trialEndsAt?: string;
  daysLeft?: number;
}

export default function SubscriptionBadge() {
  const { data: subscriptionStatus } = useQuery<SubscriptionStatus>({
    queryKey: ['/api/subscription/status'],
    staleTime: 30 * 1000, // 30 seconds
  });

  if (!subscriptionStatus) {
    return null;
  }

  // Active subscription
  if (subscriptionStatus.status === 'active') {
    const planName = subscriptionStatus.plan === 'pro' ? 'Pro' : 
                     subscriptionStatus.plan === 'unlimited' ? 'Unlimited' : 
                     'Premium';
    
    return (
      <Badge variant="secondary" className="bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30 flex items-center gap-1">
        <Crown className="h-3 w-3" />
        {planName}
      </Badge>
    );
  }

  // Trial active
  if (subscriptionStatus.status === 'trial') {
    const daysLeft = subscriptionStatus.daysLeft || 0;
    const isUrgent = daysLeft <= 2;
    
    return (
      <Badge 
        variant="secondary" 
        className={`${
          isUrgent 
            ? 'bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/30' 
            : 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30'
        } flex items-center gap-1`}
      >
        <Clock className="h-3 w-3" />
        Trial ({daysLeft}d)
      </Badge>
    );
  }

  // Trial expired
  if (subscriptionStatus.status === 'expired') {
    return (
      <Badge variant="secondary" className="bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30 flex items-center gap-1">
        <AlertTriangle className="h-3 w-3" />
        Expired
      </Badge>
    );
  }

  return null;
}