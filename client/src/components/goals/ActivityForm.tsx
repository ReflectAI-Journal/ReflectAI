import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { Loader2, Clock, Calendar as CalendarIcon, Timer, BarChart, Repeat, Award } from 'lucide-react';
import { format } from 'date-fns';
import { Goal } from '@shared/schema';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const formSchema = z.object({
  description: z.string().min(2, 'Description must be at least 2 characters'),
  minutesSpent: z.number().min(1, 'Time spent must be at least 1 minute'),
  date: z.string(),
  progressIncrement: z.number().min(0, 'Progress must be positive').max(100, 'Progress cannot exceed 100%'),
});

type FormValues = z.infer<typeof formSchema>;

interface ActivityFormProps {
  goal: Goal;
  onClose: () => void;
  onSuccess: () => void;
}

export const ActivityForm: React.FC<ActivityFormProps> = ({ goal, onClose, onSuccess }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isHourMode, setIsHourMode] = useState<boolean>(true);
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(30);
  const queryClient = useQueryClient();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      minutesSpent: 30,
      date: new Date().toISOString(),
      progressIncrement: 5,
    },
  });
  
  // Update the form value when hours or minutes change
  useEffect(() => {
    const totalMinutes = (hours * 60) + minutes;
    form.setValue('minutesSpent', totalMinutes);
  }, [hours, minutes, form]);
  
  const createActivityMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      return await apiRequest({
        url: `/api/goals/${goal.id}/activities`,
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
      queryClient.invalidateQueries({ queryKey: [`/api/goals/${goal.id}/activities`] });
      queryClient.invalidateQueries({ queryKey: ['/api/goals/summary'] });
      onSuccess();
    },
  });
  
  const onSubmit = (data: FormValues) => {
    createActivityMutation.mutate(data);
  };
  
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      form.setValue('date', date.toISOString());
    }
  };
  
  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Log Activity for {goal.title}</DialogTitle>
          <DialogDescription>
            Track time spent and progress on this goal.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What did you do?</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the activity you completed..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-md font-medium">Time Tracking</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">Simple</span>
                  <Switch 
                    checked={isHourMode} 
                    onCheckedChange={setIsHourMode} 
                    id="time-mode" 
                  />
                  <span className="text-sm text-muted-foreground">Detailed</span>
                </div>
              </div>

              {/* Hidden field for form submission */}
              <input 
                type="hidden" 
                {...form.register("minutesSpent", { 
                  valueAsNumber: true,
                })} 
              />
              
              {isHourMode ? (
                <Card className="border-primary/20">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">Hours</span>
                        </div>
                        <div className="flex items-center">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-r-none"
                            onClick={() => setHours(Math.max(0, hours - 1))}
                            disabled={hours === 0}
                          >
                            -
                          </Button>
                          <Input
                            type="number"
                            min={0}
                            className="h-8 rounded-none text-center w-12"
                            value={hours}
                            onChange={(e) => setHours(parseInt(e.target.value) || 0)}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-l-none"
                            onClick={() => setHours(hours + 1)}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Timer className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">Minutes</span>
                        </div>
                        <div className="flex items-center">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-r-none"
                            onClick={() => setMinutes(Math.max(0, minutes - 5))}
                            disabled={minutes === 0}
                          >
                            -
                          </Button>
                          <Input
                            type="number"
                            min={0}
                            max={59}
                            className="h-8 rounded-none text-center w-12"
                            value={minutes}
                            onChange={(e) => setMinutes(parseInt(e.target.value) || 0)}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-l-none"
                            onClick={() => setMinutes(Math.min(59, minutes + 5))}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 text-center text-sm text-muted-foreground">
                      Total time: <span className="font-medium text-foreground">{hours} hours {minutes} minutes</span> ({(hours * 60) + minutes} minutes)
                    </div>
                    
                    <div className="mt-6">
                      <FormLabel className="mb-2 block">Quick Presets</FormLabel>
                      <div className="grid grid-cols-3 gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => { setHours(0); setMinutes(15); }}>15 min</Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => { setHours(0); setMinutes(30); }}>30 min</Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => { setHours(1); setMinutes(0); }}>1 hour</Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => { setHours(1); setMinutes(30); }}>1.5 hours</Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => { setHours(2); setMinutes(0); }}>2 hours</Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => { setHours(3); setMinutes(0); }}>3 hours</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <FormItem>
                  <FormLabel>Time spent (minutes)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      value={(hours * 60) + minutes}
                      onChange={(e) => {
                        const totalMin = parseInt(e.target.value) || 0;
                        const h = Math.floor(totalMin / 60);
                        const m = totalMin % 60;
                        setHours(h);
                        setMinutes(m);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the total time spent in minutes
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            </div>
            
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
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
            
            <FormField
              control={form.control}
              name="progressIncrement"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center mb-2">
                    <FormLabel>Progress made towards goal completion</FormLabel>
                    <Badge variant="outline" className="ml-2 font-mono">
                      +{field.value}%
                    </Badge>
                  </div>
                  <Card className="border-primary/20 overflow-hidden">
                    <CardContent className="p-6 pb-4">
                      <div className="mb-6 mt-2">
                        <div className="relative pt-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-primary/10 text-primary">
                                No Progress
                              </span>
                            </div>
                            <div>
                              <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-primary/10 text-primary">
                                Major Progress
                              </span>
                            </div>
                          </div>
                          <FormControl>
                            <Slider
                              min={0}
                              max={100}
                              step={5}
                              defaultValue={[field.value]}
                              onValueChange={(values) => field.onChange(values[0])}
                              className="mt-2"
                            />
                          </FormControl>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-5 gap-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={() => field.onChange(5)}
                          className={field.value === 5 ? "border-primary" : ""}
                        >
                          5%
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={() => field.onChange(10)}
                          className={field.value === 10 ? "border-primary" : ""}
                        >
                          10%
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={() => field.onChange(25)}
                          className={field.value === 25 ? "border-primary" : ""}
                        >
                          25%
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={() => field.onChange(50)}
                          className={field.value === 50 ? "border-primary" : ""}
                        >
                          50%
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={() => field.onChange(100)}
                          className={field.value === 100 ? "border-primary" : ""}
                        >
                          100%
                        </Button>
                      </div>
                      
                      <div className="text-xs text-muted-foreground mt-4">
                        {field.value === 100 ? (
                          <div className="flex items-center gap-1 text-green-500">
                            <Award className="h-3 w-3" />
                            <span>This will mark your goal as 100% complete!</span>
                          </div>
                        ) : field.value >= 50 ? (
                          <div className="flex items-center gap-1">
                            <BarChart className="h-3 w-3" />
                            <span>This is a significant step toward completing your goal</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <Repeat className="h-3 w-3" />
                            <span>Remember: small, consistent progress adds up over time</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
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
                disabled={createActivityMutation.isPending}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
              >
                {createActivityMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Log Activity'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};