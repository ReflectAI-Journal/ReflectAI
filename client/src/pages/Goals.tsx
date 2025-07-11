import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus as PlusCircle, Loader2, Trash2, Target, BarChart3, CheckCircle, Flame, Calendar, TrendingUp, Star, Award, SmilePlus } from "lucide-react";
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
  const [completingGoals, setCompletingGoals] = useState<Set<number>>(new Set());
  const [celebratingGoals, setCelebratingGoals] = useState<Set<number>>(new Set());
  
  // Daily streak tracking
  const [currentStreak, setCurrentStreak] = useState(3); // Mock data for now
  const [longestStreak, setLongestStreak] = useState(7); // Mock data for now
  const [hasVisitedToday, setHasVisitedToday] = useState(false);
  
  // Goal progress tracking
  const [goalProgress, setGoalProgress] = useState({
    totalGoals: 0,
    completedToday: 0,
    completedThisWeek: 5,
    completedThisMonth: 12
  });
  
  // Check for daily visit and update streak
  useEffect(() => {
    const checkDailyVisit = () => {
      const today = new Date().toDateString();
      const lastVisit = localStorage.getItem('lastGoalsVisit');
      
      if (lastVisit !== today) {
        localStorage.setItem('lastGoalsVisit', today);
        setHasVisitedToday(true);
        
        // Update streak logic (simplified)
        if (lastVisit) {
          const lastVisitDate = new Date(lastVisit);
          const todayDate = new Date(today);
          const daysDiff = Math.floor((todayDate.getTime() - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysDiff === 1) {
            // Consecutive day - increment streak
            setCurrentStreak(prev => {
              const newStreak = prev + 1;
              if (newStreak > longestStreak) {
                setLongestStreak(newStreak);
              }
              return newStreak;
            });
          } else if (daysDiff > 1) {
            // Missed days - reset streak
            setCurrentStreak(1);
          }
        } else {
          // First visit
          setCurrentStreak(1);
        }
      }
    };
    
    checkDailyVisit();
  }, [longestStreak]);
  
  // Fetch all goals
  const { data: allGoals, isLoading: isLoadingGoals } = useQuery<Goal[]>({
    queryKey: ['/api/goals'],
  });

  // Separate active and completed goals and update progress
  const goals = allGoals?.filter(goal => goal.status !== 'completed' || celebratingGoals.has(goal.id)) || [];
  const completedGoals = allGoals?.filter(goal => goal.status === 'completed' && !celebratingGoals.has(goal.id)) || [];
  
  // Update goal progress when goals change
  useEffect(() => {
    if (allGoals) {
      const completed = allGoals.filter(goal => goal.status === 'completed');
      const today = new Date().toDateString();
      const completedToday = completed.filter(goal => {
        const goalDate = new Date(goal.updatedAt || goal.createdAt).toDateString();
        return goalDate === today;
      }).length;
      
      setGoalProgress({
        totalGoals: allGoals.length,
        completedToday,
        completedThisWeek: completed.length, // Simplified for demo
        completedThisMonth: completed.length
      });
    }
  }, [allGoals]);
  
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
    onSuccess: (updatedGoal) => {
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
      
      // If goal was just completed, start celebration
      if (updatedGoal && updatedGoal.status === 'completed') {
        setCelebratingGoals(prev => new Set([...prev, updatedGoal.id]));
        
        // Show celebration toast
        toast({
          title: "🎉 Awesome!",
          description: "Goal completed! Keep up the great work!",
          duration: 3000,
        });
        
        // Remove from celebration after 3 seconds
        setTimeout(() => {
          setCelebratingGoals(prev => {
            const newSet = new Set(prev);
            newSet.delete(updatedGoal.id);
            return newSet;
          });
        }, 3000);
      }
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
            Track your progress and build daily habits
          </p>
        </div>
      </header>

      {/* Daily Streak Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Current Streak */}
        <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-200 dark:border-orange-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Flame className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                  {currentStreak}
                </div>
                <div className="text-xs text-muted-foreground">
                  Day{currentStreak !== 1 ? 's' : ''} Streak
                </div>
              </div>
            </div>
            <div className="mt-2 text-xs text-orange-600 dark:text-orange-400">
              {hasVisitedToday ? "Visited today! 🎉" : "Come back tomorrow!"}
            </div>
          </CardContent>
        </Card>

        {/* Longest Streak */}
        <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {longestStreak}
                </div>
                <div className="text-xs text-muted-foreground">
                  Best Streak
                </div>
              </div>
            </div>
            <div className="mt-2 text-xs text-purple-600 dark:text-purple-400">
              Personal record! 🏆
            </div>
          </CardContent>
        </Card>

        {/* Goals Progress */}
        <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {goalProgress.completedToday}
                </div>
                <div className="text-xs text-muted-foreground">
                  Completed Today
                </div>
              </div>
            </div>
            <div className="mt-2 text-xs text-green-600 dark:text-green-400">
              {goalProgress.completedThisWeek} this week
            </div>
          </CardContent>
        </Card>
      </div>
      
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
                    {goal.status === 'completed' && celebratingGoals.has(goal.id) && (
                      <span className="text-green-600 dark:text-green-400 font-medium text-xs animate-pulse">
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
      
      {/* Completed Goals Section */}
      {completedGoals.length > 0 && (
        <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <h3 className="font-semibold text-green-800 dark:text-green-200">
                Completed Goals ({completedGoals.length})
              </h3>
            </div>
            
            <div className="space-y-2">
              {completedGoals.map(goal => (
                <div 
                  key={goal.id}
                  className="flex items-center gap-3 p-3 bg-white/50 dark:bg-background/50 rounded-md border border-green-200/50 dark:border-green-800/50"
                >
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  
                  <div className="flex-1 text-sm line-through text-muted-foreground">
                    {goal.title}
                  </div>
                  
                  <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                    Done ✓
                  </div>
                  
                  {/* Delete completed goal button */}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10 opacity-60 hover:opacity-100"
                    onClick={() => deleteGoalMutation.mutate(goal.id)}
                    disabled={deleteGoalMutation.isPending && deletingGoalId === goal.id}
                    title="Delete completed goal"
                  >
                    {deleteGoalMutation.isPending && deletingGoalId === goal.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Goal Progress Insights */}
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Your Progress Insights</h3>
            </div>
            
            {/* Progress Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">This Week</span>
                </div>
                <div className="text-lg font-bold text-blue-800 dark:text-blue-200">
                  {goalProgress.completedThisWeek} goals
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400">
                  {goalProgress.completedThisWeek > 0 ? "Making great progress!" : "Time to get started!"}
                </div>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">Success Rate</span>
                </div>
                <div className="text-lg font-bold text-green-800 dark:text-green-200">
                  {goalProgress.totalGoals > 0 ? Math.round((completedGoals.length / goalProgress.totalGoals) * 100) : 0}%
                </div>
                <div className="text-xs text-green-600 dark:text-green-400">
                  {completedGoals.length} of {goalProgress.totalGoals} completed
                </div>
              </div>
              
              <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Active Goals</span>
                </div>
                <div className="text-lg font-bold text-purple-800 dark:text-purple-200">
                  {goals.length}
                </div>
                <div className="text-xs text-purple-600 dark:text-purple-400">
                  {goals.length === 0 ? "Add your first goal!" : "Keep pushing forward!"}
                </div>
              </div>
            </div>
            
            {/* Motivational Messages */}
            <div className="mt-4 p-4 bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-lg border border-primary/20">
              <div className="text-sm">
                {currentStreak >= 7 && (
                  <div className="text-primary font-medium">🔥 You're on fire! A {currentStreak}-day streak is amazing!</div>
                )}
                {currentStreak >= 3 && currentStreak < 7 && (
                  <div className="text-primary font-medium">⭐ Great consistency! Keep your {currentStreak}-day streak going!</div>
                )}
                {currentStreak < 3 && goals.length > 0 && (
                  <div className="text-muted-foreground">💪 You've got {goals.length} active goal{goals.length !== 1 ? 's' : ''}. Small steps lead to big changes!</div>
                )}
                {goals.length === 0 && (
                  <div className="text-muted-foreground">🎯 Ready to start your journey? Add your first goal above!</div>
                )}
              </div>
              
              {completedGoals.length > 0 && (
                <div className="mt-2 text-xs text-muted-foreground">
                  🏆 You've completed {completedGoals.length} goal{completedGoals.length !== 1 ? 's' : ''} - celebrate your wins!
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}