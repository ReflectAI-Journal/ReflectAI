import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus as PlusCircle, Loader2, Trash2, SmilePlus, BarChart3, CheckCircle } from "lucide-react";
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
  const [feelingValue, setFeelingValue] = useState("neutral");
  const [completingGoals, setCompletingGoals] = useState<Set<number>>(new Set());
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
    onSuccess: (newGoalData) => {
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
      setNewGoal("");
      
      // Goal created successfully
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
  
  // Complete goal mutation
  const completeGoalMutation = useMutation({
    mutationFn: async (goalId: number) => {
      const goal = goals?.find(g => g.id === goalId);
      if (!goal) return;
      
      const response = await apiRequest({
        url: `/api/goals/${goalId}`,
        method: 'PUT',
        body: JSON.stringify({
          status: goal.status === 'completed' ? 'in_progress' : 'completed',
          progress: goal.status === 'completed' ? Math.max(0, (goal.progress || 0) - 25) : 100
        })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
      // Show celebration for completion
      toast({
        title: "🎉 Awesome!",
        description: "Goal completed! Keep up the great work!",
        duration: 3000,
      });
    },
    onError: (error) => {
      console.error("Error updating goal:", error);
      toast({
        title: "Error",
        description: "Failed to update goal. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Handle goal completion with animation
  const handleGoalToggle = async (goalId: number) => {
    setCompletingGoals(prev => new Set([...prev, goalId]));
    
    // Add slight delay for animation effect
    setTimeout(() => {
      completeGoalMutation.mutate(goalId);
      setCompletingGoals(prev => {
        const newSet = new Set(prev);
        newSet.delete(goalId);
        return newSet;
      });
    }, 200);
  };
  
  // Handle adding a new goal
  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGoal.trim()) {
      createGoalMutation.mutate(newGoal);
    }
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
      
      {/* Add new goal form - Enhanced */}
      <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-r from-primary/5 to-purple-500/5 hover:border-primary/50 transition-colors">
        <CardContent className="p-6">
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
              <PlusCircle className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              Create Your Next Goal
            </h3>
            <p className="text-sm text-muted-foreground">
              What would you like to achieve? Start by adding a new goal to track your progress.
            </p>
          </div>
          
          <form onSubmit={handleAddGoal} className="space-y-4">
            <div className="relative">
              <Input
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                placeholder="e.g., Exercise 30 minutes daily, Learn a new skill, Read 10 books..."
                className="text-center py-3 text-base border-2 focus:border-primary/50 bg-background/80"
              />
            </div>
            
            <Button 
              type="submit" 
              disabled={!newGoal.trim() || createGoalMutation.isPending}
              className="w-full py-3 text-base bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg hover:shadow-xl transition-all"
            >
              {createGoalMutation.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Creating Goal...
                </>
              ) : (
                <>
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Add New Goal
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {/* Goals list */}
      <div className="space-y-3">
        {isLoadingGoals ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !goals || goals.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">Ready to Start Your Journey?</h3>
              <p className="text-muted-foreground mb-4">
                Your goals will appear here once you create them. Use the form above to get started!
              </p>
              <div className="text-sm text-muted-foreground/80">
                💡 Tip: Start with small, achievable goals to build momentum
              </div>
            </CardContent>
          </Card>
        ) : (
          goals.map(goal => (
            <Card 
              key={goal.id} 
              className={`overflow-hidden transition-all duration-300 ${
                goal.status === 'completed' 
                  ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800' 
                  : 'hover:shadow-md'
              } ${completingGoals.has(goal.id) ? 'scale-105 shadow-lg' : ''}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Checkbox with animation */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`w-8 h-8 p-0 rounded-full border-2 transition-all duration-300 hover:scale-110 ${
                      goal.status === 'completed'
                        ? 'bg-green-500 border-green-500 text-white shadow-lg'
                        : 'border-muted-foreground/30 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950/20'
                    } ${completingGoals.has(goal.id) ? 'animate-pulse bg-green-400' : ''}`}
                    onClick={() => handleGoalToggle(goal.id)}
                    disabled={completeGoalMutation.isPending}
                  >
                    {completingGoals.has(goal.id) ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : goal.status === 'completed' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : null}
                  </Button>
                  
                  {/* Goal text */}
                  <div className={`flex-1 font-medium transition-all duration-300 ${
                    goal.status === 'completed' 
                      ? 'line-through text-muted-foreground' 
                      : ''
                  }`}>
                    {goal.title}
                  </div>
                  
                  {/* Progress indicator */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {goal.status === 'completed' && (
                      <span className="text-green-600 dark:text-green-400 font-medium text-xs">
                        ✨ Completed!
                      </span>
                    )}
                  </div>
                  
                  {/* Delete button */}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 opacity-60 hover:opacity-100"
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