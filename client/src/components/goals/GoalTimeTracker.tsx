import { useQuery } from "@tanstack/react-query";
import { Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Define the type for the goals summary data
interface GoalsSummary {
  total: number;
  completed: number;
  inProgress: number;
  timeSpent: number;
  byType: Record<string, number>;
}

export function GoalTimeTracker() {
  // Fetch goals summary which includes total time spent
  const { data: summary, isLoading } = useQuery<GoalsSummary>({
    queryKey: ["/api/goals/summary"],
  });

  if (isLoading) {
    return (
      <Card className="bg-card/70 backdrop-blur-sm border border-primary/20 shadow-sm">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center mr-3">
              <Clock className="h-5 w-5 text-primary/50" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Time invested in goals</p>
              <Skeleton className="h-6 w-40" />
            </div>
          </div>
          <div className="hidden sm:block">
            <Skeleton className="h-6 w-20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Format the total time spent from minutes to hours and minutes
  const formatTimeSpent = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours === 0) {
      return `${remainingMinutes} minutes`;
    } else if (remainingMinutes === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    } else {
      return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
    }
  };

  const timeSpent = summary?.timeSpent || 0;

  return (
    <Card className="bg-card/70 backdrop-blur-sm border border-primary/20 shadow-sm hover:shadow-md transition-all">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center mr-3">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Time invested in goals</p>
            <p className="text-lg font-bold gradient-text">{formatTimeSpent(timeSpent)}</p>
          </div>
        </div>
        <div className="hidden sm:block bg-primary/10 px-3 py-1 rounded-full text-xs text-primary font-medium">
          {summary?.total || 0} active goals
        </div>
      </CardContent>
    </Card>
  );
}