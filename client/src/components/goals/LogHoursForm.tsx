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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Log Time for "{goal.title}"
          </DialogTitle>
          <DialogDescription>
            Record the time you spent working towards this goal today.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="time">Time spent</Label>
              <div className="text-sm font-medium text-primary">
                {hours}h {minutes}m
              </div>
            </div>
            
            <Slider 
              id="time"
              min={0}
              max={12}
              step={0.25}
              value={[hours + (minutes / 60)]}
              onValueChange={handleSliderChange}
              className="my-6"
            />
            
            <div className="flex gap-4">
              <div className="space-y-1 flex-1">
                <Label htmlFor="hours">Hours</Label>
                <Input
                  id="hours"
                  type="number"
                  min={0}
                  max={24}
                  value={hours}
                  onChange={(e) => setHours(parseInt(e.target.value) || 0)}
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
                  onChange={(e) => setMinutes(parseInt(e.target.value) || 0)}
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
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
              ) : (
                <>Log Hours</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};