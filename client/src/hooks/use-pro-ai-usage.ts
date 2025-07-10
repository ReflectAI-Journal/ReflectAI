import { useQuery } from '@tanstack/react-query';

export interface ProAIUsage {
  canUse: boolean;
  remaining: number;
  resetDate: string;
  chatsUsed: number;
  maxChats: number;
  biweeklyPeriodStart: string | null;
}

export function useProAIUsage() {
  return useQuery<ProAIUsage>({
    queryKey: ['/api/pro-ai-usage'],
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute to keep countdown updated
  });
}