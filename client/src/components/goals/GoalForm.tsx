import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { X, Loader2, BarChart, GraduationCap, Timer, BookOpen, Target, Dumbbell, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { insertGoalSchema } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { AutoResizeTextarea } from '@/components/ui/auto-resize-textarea';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';

const formSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  type: z.enum(['life', 'yearly', 'monthly', 'weekly', 'daily']),
  status: z.enum(['not_started', 'in_progress', 'completed', 'abandoned']).default('not_started'),
  targetDate: z.string().optional(),
  parentGoalId: z.number().optional(),
  estimatedHours: z.number().min(0, 'Estimated hours must be positive').optional(),
  category: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  templateType: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface GoalFormProps {
  initialType?: string;
  onClose: () => void;
  onSuccess: () => void;
}

// Goal templates with predefined settings
const GOAL_TEMPLATES = {
  fitness: {
    title: 'Fitness Goal',
    description: 'Track your fitness progress and workouts',
    category: 'health',
    estimatedHours: 20,
    priority: 'medium' as const,
  },
  learning: {
    title: 'Learning Goal',
    description: 'Track your progress learning a new skill',
    category: 'education',
    estimatedHours: 40,
    priority: 'medium' as const,
  },
  project: {
    title: 'Project Completion',
    description: 'Track your progress on a specific project',
    category: 'productivity',
    estimatedHours: 30,
    priority: 'high' as const,
  },
  habit: {
    title: 'Habit Building',
    description: 'Track your progress establishing a new habit',
    category: 'personal',
    estimatedHours: 10,
    priority: 'medium' as const,
  },
  reading: {
    title: 'Reading Goal',
    description: 'Track your reading progress',
    category: 'education',
    estimatedHours: 15,
    priority: 'low' as const,
  },
};

export const GoalForm: React.FC<GoalFormProps> = ({ initialType = 'life', onClose, onSuccess }) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const queryClient = useQueryClient();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      type: initialType as any,
      status: 'not_started',
      targetDate: undefined,
      parentGoalId: undefined,
      estimatedHours: 0,
      category: '',
      priority: 'medium',
      templateType: '',
    },
  });
  
  const createGoalMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await apiRequest({
        url: '/api/goals',
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/goals/summary'] });
      onSuccess();
    },
  });
  
  const onSubmit = (data: FormValues) => {
    createGoalMutation.mutate(data);
  };
  
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      form.setValue('targetDate', date.toISOString());
    } else {
      form.setValue('targetDate', undefined);
    }
  };
  
  // Function to apply template data to form
  const applyTemplate = (templateKey: string) => {
    const template = GOAL_TEMPLATES[templateKey as keyof typeof GOAL_TEMPLATES];
    if (template) {
      form.setValue('title', template.title);
      form.setValue('description', template.description);
      form.setValue('category', template.category);
      form.setValue('estimatedHours', template.estimatedHours);
      form.setValue('priority', template.priority);
      form.setValue('templateType', templateKey);
      setSelectedTemplate(templateKey);
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create New Goal</DialogTitle>
          <DialogDescription>
            Set a new goal to track your progress and achievements.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="basic" className="w-full mt-4">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="basic">Basic Setup</TabsTrigger>
            <TabsTrigger value="templates">Choose Template</TabsTrigger>
          </TabsList>
          
          <TabsContent value="templates">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <Card 
                className={`cursor-pointer hover:shadow-md transition-all ${selectedTemplate === 'fitness' ? 'border-primary ring-2 ring-primary/20' : ''}`} 
                onClick={() => applyTemplate('fitness')}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Dumbbell className="h-5 w-5 text-primary" />
                    </div>
                    <Badge variant={selectedTemplate === 'fitness' ? 'default' : 'outline'}>
                      {selectedTemplate === 'fitness' ? 'Selected' : 'Fitness'}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg mt-2">Fitness Goal</CardTitle>
                  <CardDescription>Track workouts and progress</CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  Est. time investment: 20 hours ・ Priority: Medium
                </CardContent>
              </Card>
              
              <Card 
                className={`cursor-pointer hover:shadow-md transition-all ${selectedTemplate === 'learning' ? 'border-primary ring-2 ring-primary/20' : ''}`}
                onClick={() => applyTemplate('learning')}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <GraduationCap className="h-5 w-5 text-primary" />
                    </div>
                    <Badge variant={selectedTemplate === 'learning' ? 'default' : 'outline'}>
                      {selectedTemplate === 'learning' ? 'Selected' : 'Learning'}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg mt-2">Learning Goal</CardTitle>
                  <CardDescription>Master a new skill</CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  Est. time investment: 40 hours ・ Priority: Medium
                </CardContent>
              </Card>
              
              <Card 
                className={`cursor-pointer hover:shadow-md transition-all ${selectedTemplate === 'project' ? 'border-primary ring-2 ring-primary/20' : ''}`}
                onClick={() => applyTemplate('project')}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Target className="h-5 w-5 text-primary" />
                    </div>
                    <Badge variant={selectedTemplate === 'project' ? 'default' : 'outline'}>
                      {selectedTemplate === 'project' ? 'Selected' : 'Project'}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg mt-2">Project Goal</CardTitle>
                  <CardDescription>Complete an important project</CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  Est. time investment: 30 hours ・ Priority: High
                </CardContent>
              </Card>
              
              <Card 
                className={`cursor-pointer hover:shadow-md transition-all ${selectedTemplate === 'reading' ? 'border-primary ring-2 ring-primary/20' : ''}`}
                onClick={() => applyTemplate('reading')}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <Badge variant={selectedTemplate === 'reading' ? 'default' : 'outline'}>
                      {selectedTemplate === 'reading' ? 'Selected' : 'Reading'}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg mt-2">Reading Goal</CardTitle>
                  <CardDescription>Read books on a regular basis</CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  Est. time investment: 15 hours ・ Priority: Low
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="basic">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Learn Spanish, Run a marathon, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <AutoResizeTextarea
                          placeholder="Add more details about your goal..."
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Goal Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select goal type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="life">Life Goal</SelectItem>
                            <SelectItem value="yearly">Yearly Goal</SelectItem>
                            <SelectItem value="monthly">Monthly Goal</SelectItem>
                            <SelectItem value="weekly">Weekly Goal</SelectItem>
                            <SelectItem value="daily">Daily Goal</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="not_started">Not Started</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="abandoned">Abandoned</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ''}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="health">Health & Fitness</SelectItem>
                            <SelectItem value="education">Education & Skills</SelectItem>
                            <SelectItem value="productivity">Productivity & Work</SelectItem>
                            <SelectItem value="personal">Personal Growth</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || 'medium'}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="estimatedHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Hours to Complete: {field.value || 0}</FormLabel>
                      <FormControl>
                        <Slider
                          min={0}
                          max={100}
                          step={1}
                          defaultValue={[field.value || 0]}
                          onValueChange={(values) => field.onChange(values[0])}
                          className="py-4"
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Estimate how many hours you think you'll need to achieve this goal
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="targetDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Target Date (Optional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={`w-full justify-start text-left font-normal ${
                                !selectedDate && "text-muted-foreground"
                              }`}
                            >
                              <CalendarIcon className="h-4 w-4 mr-2" />
                              {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={handleDateSelect}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createGoalMutation.isPending}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                  >
                    {createGoalMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Goal'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};