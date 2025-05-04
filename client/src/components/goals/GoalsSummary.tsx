import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTheme } from 'next-themes';
import { Goal, GoalActivity } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';
import { TimeTrackingChart } from './TimeTrackingChart';
import { StreakChart } from './StreakChart';

interface GoalsSummaryProps {
  summary: {
    total: number;
    completed: number;
    inProgress: number;
    timeSpent: number;
    byType: Record<string, number>;
  } | undefined;
}

export const GoalsSummary: React.FC<GoalsSummaryProps> = ({ summary }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [currentGoal, setCurrentGoal] = useState<Goal | null>(null);

  // Fetch all goals and activities
  const { data: goals = [] } = useQuery<Goal[]>({ 
    queryKey: ['/api/goals'] 
  });
  
  // Get the most recent goal if none is selected
  useEffect(() => {
    if (goals.length > 0 && !currentGoal) {
      setCurrentGoal(goals[0]);
    }
  }, [goals, currentGoal]);
  
  // Fetch activities for the selected goal
  const { data: goalActivities = [] } = useQuery<GoalActivity[]>({ 
    queryKey: [`/api/goals/${currentGoal?.id}/activities`],
    enabled: !!currentGoal
  });
  
  // Fetch all activities (for overall summary)
  const { data: allActivities = [] } = useQuery<GoalActivity[]>({ 
    queryKey: ['/api/activities'],
    enabled: !currentGoal
  });
  
  const activities = currentGoal ? goalActivities : allActivities;
  
  if (!summary) {
    return <div>No summary data available</div>;
  }
  
  const { total, completed, inProgress, timeSpent } = summary;
  
  // Format time spent
  const formatTimeSpent = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ${hours % 24} hr${hours % 24 !== 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `${hours} hr${hours !== 1 ? 's' : ''} ${minutes % 60} min${minutes % 60 !== 1 ? 's' : ''}`;
    }
    return `${minutes} min${minutes !== 1 ? 's' : ''}`;
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{total}</CardTitle>
            <CardDescription>Total Goals</CardDescription>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{inProgress}</CardTitle>
            <CardDescription>In Progress</CardDescription>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{completed}</CardTitle>
            <CardDescription>Completed</CardDescription>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{formatTimeSpent(timeSpent)}</CardTitle>
            <CardDescription>Total Time Invested</CardDescription>
          </CardHeader>
        </Card>
      </div>
      
      <Card>
        <Tabs defaultValue="time" className="w-full">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Time Tracking Analytics</CardTitle>
                <CardDescription>
                  {currentGoal 
                    ? `Showing data for: ${currentGoal.title}`
                    : 'Showing data for all goals'}
                </CardDescription>
              </div>
              <TabsList>
                <TabsTrigger value="time">Hours Spent</TabsTrigger>
                <TabsTrigger value="streak">Activity Streak</TabsTrigger>
              </TabsList>
            </div>
          </CardHeader>
          
          <CardContent>
            {goals.length > 0 && (
              <div className="mb-4">
                <ScrollArea className="whitespace-nowrap rounded-md border">
                  <div className="flex p-4 gap-2">
                    <div 
                      className={`px-3 py-1 rounded-full text-sm cursor-pointer transition-colors
                        ${!currentGoal 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted hover:bg-muted/80'
                        }`}
                      onClick={() => setCurrentGoal(null)}
                    >
                      All Goals
                    </div>
                    {goals.map(goal => (
                      <div 
                        key={goal.id}
                        className={`px-3 py-1 rounded-full text-sm cursor-pointer transition-colors
                          ${currentGoal?.id === goal.id 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted hover:bg-muted/80'
                          }`}
                        onClick={() => setCurrentGoal(goal)}
                      >
                        {goal.title}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
            
            <TabsContent value="time" className="mt-0">
              <TimeTrackingChart 
                activities={activities}
                goal={currentGoal || undefined}
              />
            </TabsContent>
            
            <TabsContent value="streak" className="mt-0">
              <StreakChart activities={activities} />
            </TabsContent>
          </CardContent>
          
          <CardFooter className="text-sm text-muted-foreground border-t pt-4">
            {activities.length === 0 
              ? 'No activities recorded yet. Start tracking your progress by adding activities to your goals.' 
              : `Showing data from ${activities.length} logged activities.`
            }
          </CardFooter>
        </Tabs>
      </Card>
    </div>
  );
};