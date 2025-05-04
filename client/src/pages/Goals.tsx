import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2, BarChart, Clock } from "lucide-react";
import { Goal, GoalActivity } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { GoalList } from "@/components/goals/GoalList";
import { GoalForm } from "@/components/goals/GoalForm";
import { GoalsSummary } from "@/components/goals/GoalsSummary";
import { TimeTrackingChart } from "@/components/goals/TimeTrackingChart";
import { StreakChart } from "@/components/goals/StreakChart";

export default function Goals() {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("summary");
  
  // Fetch all goals
  const { data: goals, isLoading: isLoadingGoals } = useQuery<Goal[]>({
    queryKey: ['/api/goals'],
  });
  
  // Fetch summary statistics
  const { data: summary, isLoading: isLoadingSummary } = useQuery({
    queryKey: ['/api/goals/summary'],
  });
  
  // Fetch all activities across all goals
  const { data: allActivities, isLoading: isLoadingActivities } = useQuery<GoalActivity[]>({
    queryKey: ['/api/activities'],
  });
  
  // Filter goals by type based on active tab
  const filterGoalsByType = (type: string) => {
    if (!goals) return [];
    return goals.filter(goal => goal.type === type);
  };
  
  return (
    <div className="container max-w-6xl mx-auto p-4 space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 text-transparent bg-clip-text">
            Goal Tracking
          </h1>
          <p className="text-muted-foreground">
            Track your progress towards your life, yearly, monthly, weekly, and daily goals
          </p>
        </div>
        
        <Button onClick={() => setIsCreating(true)} className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Goal
        </Button>
      </header>
      
      <Tabs defaultValue="summary" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="life">Life</TabsTrigger>
          <TabsTrigger value="yearly">Yearly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="daily">Daily</TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="summary">
            {isLoadingSummary || isLoadingActivities ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-8">
                <GoalsSummary summary={summary} />
                
                {allActivities && allActivities.length > 0 && (
                  <div className="grid grid-cols-1 gap-8">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-primary" />
                          Time Tracking
                        </CardTitle>
                        <CardDescription>
                          Track the time you spend on your goals over time
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <TimeTrackingChart 
                          activities={allActivities} 
                          days={30}
                        />
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart className="h-5 w-5 text-primary" />
                          Activity Streaks
                        </CardTitle>
                        <CardDescription>
                          See your consistency and activity streaks
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <StreakChart 
                          activities={allActivities} 
                          days={30}
                        />
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="life">
            <GoalList 
              goals={filterGoalsByType('life')} 
              isLoading={isLoadingGoals} 
              emptyMessage="No life goals yet. Create one to get started!"
              type="life"
            />
          </TabsContent>
          
          <TabsContent value="yearly">
            <GoalList 
              goals={filterGoalsByType('yearly')} 
              isLoading={isLoadingGoals} 
              emptyMessage="No yearly goals yet. Create one to get started!"
              type="yearly"
            />
          </TabsContent>
          
          <TabsContent value="monthly">
            <GoalList 
              goals={filterGoalsByType('monthly')} 
              isLoading={isLoadingGoals} 
              emptyMessage="No monthly goals yet. Create one to get started!"
              type="monthly"
            />
          </TabsContent>
          
          <TabsContent value="weekly">
            <GoalList 
              goals={filterGoalsByType('weekly')} 
              isLoading={isLoadingGoals} 
              emptyMessage="No weekly goals yet. Create one to get started!"
              type="weekly"
            />
          </TabsContent>
          
          <TabsContent value="daily">
            <GoalList 
              goals={filterGoalsByType('daily')} 
              isLoading={isLoadingGoals} 
              emptyMessage="No daily goals yet. Create one to get started!"
              type="daily"
            />
          </TabsContent>
        </div>
      </Tabs>
      
      {/* Goal Creation Modal */}
      {isCreating && (
        <GoalForm 
          initialType={activeTab === 'summary' ? 'life' : activeTab}
          onClose={() => setIsCreating(false)}
          onSuccess={() => {
            setIsCreating(false);
            toast({
              title: "Goal created",
              description: "Your goal has been created successfully.",
            });
          }}
        />
      )}
    </div>
  );
}