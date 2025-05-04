import React, { useState } from 'react';
import { Goal } from '@shared/schema';
import { Loader2, Calendar, Clock, Target, ChevronRight, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LogHoursForm } from './LogHoursForm';

interface GoalListProps {
  goals: Goal[] | undefined;
  isLoading: boolean;
  emptyMessage: string;
  type: string;
}

export const GoalList: React.FC<GoalListProps> = ({ 
  goals, 
  isLoading, 
  emptyMessage,
  type 
}) => {
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!goals || goals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center h-64 bg-muted/20 rounded-lg border border-dashed">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 text-white';
      case 'in_progress':
        return 'bg-blue-500 text-white';
      case 'not_started':
        return 'bg-gray-500 text-white';
      case 'abandoned':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const formatTimeSpent = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="space-y-4">
      {/* Log Hours Form Dialog */}
      {selectedGoal && (
        <LogHoursForm
          goal={selectedGoal}
          isOpen={!!selectedGoal}
          onClose={() => setSelectedGoal(null)}
          onSuccess={() => setSelectedGoal(null)}
        />
      )}
    
      {goals.map((goal) => (
        <Card key={goal.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">{goal.title}</CardTitle>
                {goal.description && (
                  <CardDescription className="mt-1">
                    {goal.description}
                  </CardDescription>
                )}
              </div>
              <Badge className={getStatusColor(goal.status || 'not_started')}>
                {goal.status?.replace('_', ' ') || 'Not Started'}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="pb-2">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">Progress</div>
                <div className="text-sm font-medium">{goal.progress || 0}%</div>
              </div>
              <Progress
                value={goal.progress || 0}
                className="h-2"
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-wrap justify-between pt-2 text-sm text-muted-foreground gap-2">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>{goal.timeSpent ? formatTimeSpent(goal.timeSpent) : '0m'}</span>
            </div>
            
            {goal.targetDate && (
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{format(new Date(goal.targetDate), 'MMM d, yyyy')}</span>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button 
                variant="default" 
                size="sm"
                className="text-xs h-8 bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-sm hover:shadow-md transition-all"
                onClick={() => setSelectedGoal(goal)}
              >
                <PlusCircle className="h-3 w-3 mr-1" />
                Entry
              </Button>
              
              <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};