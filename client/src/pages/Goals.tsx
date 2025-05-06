import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Minus, Plus as PlusCircle, Loader2, Clock, Trash2, SmilePlus, BarChart3 } from "lucide-react";
import { Goal } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import BackButton from "@/components/layout/BackButton";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';

// Emotion colors for consistent styling
const emotionColors = {
  happy: '#10b981', // green-500
  neutral: '#3b82f6', // blue-500
  sad: '#ef4444', // red-500
  stressed: '#f97316', // orange-500
  motivated: '#8b5cf6', // purple-500
};

// Data structure for sample emotion data over time
type EmotionLogEntry = {
  emotion: string;
  timestamp: string;
  date?: string;
};

export default function Goals() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newGoal, setNewGoal] = useState("");
  const [hours, setHours] = useState<Record<number, number>>({});
  const [feelingValue, setFeelingValue] = useState("neutral");
  const [emotionLog, setEmotionLog] = useState<EmotionLogEntry[]>([]);
  const [emotionCounts, setEmotionCounts] = useState<{name: string, count: number, color: string}[]>([]);
  
  // Initialize with some sample data for demonstration purposes
  useEffect(() => {
    const initialData: EmotionLogEntry[] = [
      { emotion: 'happy', timestamp: '9:30 AM', date: 'Monday' },
      { emotion: 'motivated', timestamp: '10:15 AM', date: 'Tuesday' },
      { emotion: 'stressed', timestamp: '2:45 PM', date: 'Wednesday' },
      { emotion: 'neutral', timestamp: '11:20 AM', date: 'Thursday' },
      { emotion: 'happy', timestamp: '4:10 PM', date: 'Friday' },
    ];
    
    setEmotionLog(initialData);
    updateEmotionStats(initialData);
  }, []);
  
  // Update emotion statistics whenever emotionLog changes
  const updateEmotionStats = (log: EmotionLogEntry[]) => {
    // Count emotions
    const counts: Record<string, number> = {};
    
    log.forEach(entry => {
      counts[entry.emotion] = (counts[entry.emotion] || 0) + 1;
    });
    
    // Convert to array for charts
    const chartData = Object.keys(counts).map(emotion => ({
      name: emotion.charAt(0).toUpperCase() + emotion.slice(1),
      count: counts[emotion],
      color: emotionColors[emotion as keyof typeof emotionColors] || '#888888'
    }));
    
    setEmotionCounts(chartData);
  };
  
  // Fetch all goals
  const { data: goals, isLoading: isLoadingGoals } = useQuery<Goal[]>({
    queryKey: ['/api/goals'],
  });
  
  // Create goal mutation
  const createGoalMutation = useMutation({
    mutationFn: async (title: string) => {
      const response = await apiRequest({
        url: '/api/goals',
        method: 'POST',
        body: JSON.stringify({
          title,
          type: 'daily',
          status: 'in_progress',
        })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
      setNewGoal("");
      // No toast notification for successful creation
    }
  });
  
  // Delete goal mutation
  const [deletingGoalId, setDeletingGoalId] = useState<number | null>(null);
  const deleteGoalMutation = useMutation({
    mutationFn: async (goalId: number) => {
      setDeletingGoalId(goalId);
      try {
        const response = await apiRequest({
          url: `/api/goals/${goalId}`,
          method: 'DELETE'
        });
        // Handle both success responses with and without body
        if (response.status === 204) {
          return { success: true };
        }
        return response.json();
      } catch (error) {
        console.error("Error deleting goal:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
      // No toast notification for successful deletion
      setDeletingGoalId(null);
    },
    onError: (error) => {
      console.error("Delete mutation error:", error);
      toast({
        title: "Error",
        description: "Failed to delete goal. Please try again.",
        variant: "destructive"
      });
      setDeletingGoalId(null);
    }
  });
  
  // Log hours mutation
  const logHoursMutation = useMutation({
    mutationFn: async ({ goalId, minutesSpent }: { goalId: number, minutesSpent: number }) => {
      // Get the current goal to subtract its current time
      const currentGoal = goals?.find(g => g.id === goalId);
      // Calculate the difference in minutes (what we're adding/removing)
      const minutesChange = minutesSpent - (currentGoal?.timeSpent || 0);
      
      if (Math.abs(minutesChange) < 1) {
        // No significant change, skip the API call
        return { success: true };
      }
      
      const response = await apiRequest({
        url: `/api/goals/${goalId}/activities`,
        method: 'POST',
        body: JSON.stringify({
          goalId,
          minutesSpent: minutesChange, // Only log the difference
          progressIncrement: minutesChange > 0 ? 10 : 0, // Only increment progress for positive changes
          description: `${minutesChange > 0 ? 'Added' : 'Removed'} ${Math.abs(Math.round(minutesChange / 60 * 10) / 10)} hours`
        })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      // No toast notification for successful updates
    },
    onError: (error) => {
      console.error("Error updating hours:", error);
      toast({
        title: "Error",
        description: "Failed to update hours. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Initialize hours state from goals
  React.useEffect(() => {
    if (goals) {
      const newHours: Record<number, number> = {};
      goals.forEach(goal => {
        if (goal.timeSpent) {
          // Convert minutes to hours and round to nearest 0.5
          newHours[goal.id] = Math.round((goal.timeSpent / 60) * 2) / 2;
        } else {
          newHours[goal.id] = 0;
        }
      });
      setHours(newHours);
    }
  }, [goals]);
  
  // Handle adding a new goal
  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGoal.trim()) {
      createGoalMutation.mutate(newGoal);
    }
  };
  
  // Track which goal is currently being updated
  const [updatingHoursGoalId, setUpdatingHoursGoalId] = useState<number | null>(null);
  
  // Handle updating hours
  const updateHours = (goalId: number, change: number) => {
    // Check if the goal exists first
    if (!goals || !goals.some(g => g.id === goalId)) {
      toast({
        title: "Error",
        description: "Unable to update hours. Goal may have been deleted.",
        variant: "destructive"
      });
      return;
    }
    
    setUpdatingHoursGoalId(goalId);
    const currentHours = hours[goalId] || 0;
    let newHours = Math.max(0, currentHours + change);
    
    // Adjust to nearest 0.5 increment
    newHours = Math.round(newHours * 2) / 2;
    
    // Update local state
    setHours(prev => ({ ...prev, [goalId]: newHours }));
    
    // Calculate minutes for API call (convert hours to minutes)
    const minutes = Math.round(newHours * 60);
    
    // Log the updated hours
    logHoursMutation.mutate(
      { goalId, minutesSpent: minutes }, 
      {
        onSettled: () => {
          setUpdatingHoursGoalId(null);
        }
      }
    );
  };
  
  return (
    <div className="container max-w-6xl mx-auto p-4 space-y-6">
      <header className="flex items-start gap-3 mb-6">
        <BackButton className="mt-1" />
        <div>
          <h1 className="text-2xl font-bold">My Goals</h1>
          <p className="text-muted-foreground text-sm">
            Track your progress by logging hours
          </p>
        </div>
      </header>
      
      {/* Add new goal form */}
      <form onSubmit={handleAddGoal} className="flex gap-2 mb-6">
        <Input
          value={newGoal}
          onChange={(e) => setNewGoal(e.target.value)}
          placeholder="Enter a new goal"
          className="flex-1"
        />
        <Button 
          type="submit" 
          disabled={!newGoal.trim() || createGoalMutation.isPending}
        >
          {createGoalMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <PlusCircle className="h-4 w-4" />
          )}
          <span className="ml-2">Add</span>
        </Button>
      </form>
      
      {/* Goals list */}
      <div className="space-y-3">
        {isLoadingGoals ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !goals || goals.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No goals yet. Add your first goal above.
            </CardContent>
          </Card>
        ) : (
          goals.map(goal => (
            <Card key={goal.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="font-medium">{goal.title}</div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center text-sm">
                      <Clock className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                      <span>{hours[goal.id] || 0} hrs</span>
                    </div>
                    
                    <div className="flex">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="h-8 w-8 p-0 rounded-r-none"
                        onClick={() => updateHours(goal.id, -0.5)}
                        disabled={updatingHoursGoalId === goal.id || logHoursMutation.isPending}
                      >
                        {updatingHoursGoalId === goal.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Minus className="h-3 w-3" />
                        )}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="h-8 w-8 p-0 rounded-l-none border-l-0"
                        onClick={() => updateHours(goal.id, 0.5)}
                        disabled={updatingHoursGoalId === goal.id || logHoursMutation.isPending}
                      >
                        {updatingHoursGoalId === goal.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Plus className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                      onClick={() => deleteGoalMutation.mutate(goal.id)}
                      disabled={deleteGoalMutation.isPending && deletingGoalId === goal.id}
                    >
                      {deleteGoalMutation.isPending && deletingGoalId === goal.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      
      {/* Feeling chart */}
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <SmilePlus className="h-5 w-5 text-primary" />
              <h3 className="font-medium">How do you feel about these goals?</h3>
            </div>
            
            <RadioGroup
              value={feelingValue}
              onValueChange={(value) => {
                setFeelingValue(value);
                const now = new Date();
                const timeString = now.toLocaleTimeString();
                const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
                const newEntry = { emotion: value, timestamp: timeString, date: today };
                
                // Add to log and update stats
                const updatedLog = [...emotionLog, newEntry].slice(-10); // Keep last 10 entries
                setEmotionLog(updatedLog);
                updateEmotionStats(updatedLog);
              }}
              className="flex justify-between mt-2"
            >
              <div className="flex flex-col items-center space-y-1">
                <RadioGroupItem 
                  value="happy" 
                  id="happy" 
                  className="sr-only" 
                />
                <Label 
                  htmlFor="happy" 
                  className={`text-2xl cursor-pointer ${feelingValue === 'happy' ? 'text-green-500 scale-125' : 'text-muted-foreground'}`}
                >
                  😊
                </Label>
                <span className="text-xs">Happy</span>
              </div>
              
              <div className="flex flex-col items-center space-y-1">
                <RadioGroupItem 
                  value="neutral" 
                  id="neutral" 
                  className="sr-only" 
                />
                <Label 
                  htmlFor="neutral" 
                  className={`text-2xl cursor-pointer ${feelingValue === 'neutral' ? 'text-blue-500 scale-125' : 'text-muted-foreground'}`}
                >
                  😐
                </Label>
                <span className="text-xs">Neutral</span>
              </div>
              
              <div className="flex flex-col items-center space-y-1">
                <RadioGroupItem 
                  value="sad" 
                  id="sad" 
                  className="sr-only" 
                />
                <Label 
                  htmlFor="sad" 
                  className={`text-2xl cursor-pointer ${feelingValue === 'sad' ? 'text-red-500 scale-125' : 'text-muted-foreground'}`}
                >
                  🙁
                </Label>
                <span className="text-xs">Sad</span>
              </div>
              
              <div className="flex flex-col items-center space-y-1">
                <RadioGroupItem 
                  value="stressed" 
                  id="stressed" 
                  className="sr-only" 
                />
                <Label 
                  htmlFor="stressed" 
                  className={`text-2xl cursor-pointer ${feelingValue === 'stressed' ? 'text-orange-500 scale-125' : 'text-muted-foreground'}`}
                >
                  😰
                </Label>
                <span className="text-xs">Stressed</span>
              </div>
              
              <div className="flex flex-col items-center space-y-1">
                <RadioGroupItem 
                  value="motivated" 
                  id="motivated" 
                  className="sr-only" 
                />
                <Label 
                  htmlFor="motivated" 
                  className={`text-2xl cursor-pointer ${feelingValue === 'motivated' ? 'text-purple-500 scale-125' : 'text-muted-foreground'}`}
                >
                  💪
                </Label>
                <span className="text-xs">Motivated</span>
              </div>
            </RadioGroup>
            
            {/* Emotion visualization */}
            <div className="mt-4 p-4 bg-card rounded-md border border-border/40 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                <h4 className="font-medium text-sm">Your Emotion Tracking</h4>
              </div>
              
              <div className="text-xs text-muted-foreground mb-4">
                {feelingValue === 'happy' && "You're feeling positive about your goals. Great job!"}
                {feelingValue === 'neutral' && "You have a balanced perspective on your progress."}
                {feelingValue === 'sad' && "It's okay to feel down sometimes. Remember, progress isn't always linear."}
                {feelingValue === 'stressed' && "Take a moment to breathe. Small steps still move you forward."}
                {feelingValue === 'motivated' && "You're feeling energized and ready to tackle your goals!"}
              </div>
              
              {/* Bar chart visualization */}
              {emotionCounts.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-3">Weekly Emotion Distribution:</p>
                  <div className="h-[180px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={emotionCounts} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                        <Tooltip 
                          contentStyle={{ 
                            background: 'var(--background)', 
                            border: '1px solid var(--border)',
                            borderRadius: '6px',
                            fontSize: '12px'
                          }} 
                        />
                        <Bar dataKey="count" name="Occurrences">
                          {
                            emotionCounts.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))
                          }
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
              
              {/* Simple log list */}
              {emotionLog.length > 0 && (
                <div className="border-t border-border/30 pt-3 mt-4">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Recent Emotion Log:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
                    {emotionLog.slice(-5).map((entry, index) => (
                      <div key={index} className="flex items-center justify-between text-xs py-1 px-2 bg-muted/20 rounded">
                        <div>
                          <span className="capitalize mr-1 font-medium">{entry.emotion}</span>
                          <span className="text-muted-foreground text-[10px]">({entry.date})</span>
                        </div>
                        <span className="text-muted-foreground">{entry.timestamp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}