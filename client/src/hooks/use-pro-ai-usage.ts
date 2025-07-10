import { useQuery } from '@tanstack/react-query';

export interface ProAIUsage {
  aiType: string;
  canUse: boolean;
  remaining: number;
  resetDate: string;
  questionsUsed: number;
  maxQuestions: number;
  biweeklyPeriodStart: string | null;
}

export interface ProAIUsageResponse {
  counselor: ProAIUsage;
  philosopher: ProAIUsage;
}

export function useProAIUsage() {
  return useQuery<ProAIUsageResponse>({
    queryKey: ['/api/pro-ai-usage'],
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute to keep countdown updated
  });
}

export function useProAIUsageByType(aiType: 'counselor' | 'philosopher') {
  return useQuery<ProAIUsage>({
    queryKey: ['/api/pro-ai-usage', aiType],
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute to keep countdown updated
  });
}