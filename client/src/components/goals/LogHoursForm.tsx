import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Goal } from '@shared/schema';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Clock } from 'lucide-react';

interface LogHoursFormProps {
  goal: Goal;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const LogHoursForm: React.FC<LogHoursFormProps> = ({ 
  goal, 
  isOpen, 
  onClose,
  onSuccess 
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [hours, setHours] = useState(1);
  const [minutes, setMinutes] = useState(0);
  const [note, setNote] = useState('');

  // Calculate total minutes
  const totalMinutes = (hours * 60) + minutes;

  // Create mutation for adding activity
  const mutation = useMutation({
    mutationFn: async (data: {
      goalId: number;
      minutesSpent: number;
      progressIncrement: number;
      note: string;
    }) => {
      const response = await apiRequest({
        url: `/api/goals/${goal.id}/activities`,
        method: 'POST',
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: [`/api/goals/${goal.id}/activities`] });
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      queryClient.invalidateQueries({ queryKey: ['/api/goals/summary'] });
      
      // Close dialog and show success toast
      onClose();
      toast({
        title: 'Hours logged successfully',
        description: `You logged ${hours}h ${minutes}m towards "${goal.title}"`,
      });
      
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to log hours. Please try again.',
        variant: 'destructive',
      });
    }
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (totalMinutes <= 0) {
      toast({
        title: 'Invalid time',
        description: 'Please enter a time greater than 0 minutes',
        variant: 'destructive',
      });
      return;
    }
    
    // Calculate progress increment based on goal type
    // For simplicity, we're using a fixed amount per activity
    // This could be enhanced to be more sophisticated
    const progressIncrement = 10;
    
    mutation.mutate({
      goalId: goal.id,
      minutesSpent: totalMinutes,
      progressIncrement,
      note: note.trim() || `Worked on "${goal.title}" for ${hours}h ${minutes}m`
    });
  };

  // Handle slider change
  const handleSliderChange = (value: number[]) => {
    // Total hours in decimals
    const totalHours = value[0];
    
    // Split into hours and minutes
    const newHours = Math.floor(totalHours);
    const newMinutes = Math.round((totalHours - newHours) * 60);
    
    setHours(newHours);
    setMinutes(newMinutes);
  };
  
  // Handle hours input change
  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHours = parseInt(e.target.value) || 0;
    setHours(Math.max(0, Math.min(24, newHours))); // Limit to 0-24 hours
  };
  
  // Handle minutes input change
  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMinutes = parseInt(e.target.value) || 0;
    setMinutes(Math.max(0, Math.min(59, newMinutes))); // Limit to 0-59 minutes
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
            <Clock className="h-5 w-5 text-blue-500" />
            Log Time for "{goal.title}"
          </DialogTitle>
          <DialogDescription>
            Record the time you spent working towards this goal today.
            This will help track your progress and build streak consistency.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="time">Time spent</Label>
              <div className="text-sm font-medium px-3 py-1 rounded-full bg-primary/10 text-primary">
                {hours}h {minutes}m
              </div>
            </div>
            
            <div className="px-1">
              <Slider 
                id="time"
                min={0}
                max={12}
                step={0.25}
                value={[hours + (minutes / 60)]}
                onValueChange={handleSliderChange}
                className="my-6"
              />
              
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0h</span>
                <span>3h</span>
                <span>6h</span>
                <span>9h</span>
                <span>12h</span>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="space-y-1 flex-1">
                <Label htmlFor="hours">Hours</Label>
                <Input
                  id="hours"
                  type="number"
                  min={0}
                  max={24}
                  value={hours}
                  onChange={handleHoursChange}
                />
              </div>
              <div className="space-y-1 flex-1">
                <Label htmlFor="minutes">Minutes</Label>
                <Input
                  id="minutes"
                  type="number"
                  min={0}
                  max={59}
                  value={minutes}
                  onChange={handleMinutesChange}
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="note">Note (optional)</Label>
            <Input
              id="note"
              placeholder="What did you accomplish?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={mutation.isPending}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              {mutation.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
              ) : (
                <><Clock className="mr-2 h-4 w-4" /> Log Hours</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};