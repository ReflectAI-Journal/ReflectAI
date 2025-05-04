import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { X, Plus, Smile, HeartHandshake } from 'lucide-react';
import { Mood } from '@/types/journal';

// Predefined mood options
const moodOptions: Mood[] = [
  'Happy', 'Sad', 'Anxious', 'Excited', 'Calm', 
  'Frustrated', 'Grateful', 'Tired', 'Inspired', 'Proud',
  'Lonely', 'Relaxed', 'Confused', 'Energetic', 'Hopeful',
  'Overwhelmed', 'Content', 'Bored', 'Stressed', 'Peaceful'
];

// Modern mood colors with gradients
const moodColors: Record<string, { bg: string, text: string, border: string }> = {
  Happy: { bg: 'bg-gradient-to-r from-amber-100 to-yellow-100', text: 'text-amber-700', border: 'border-amber-200' },
  Sad: { bg: 'bg-gradient-to-r from-blue-100 to-indigo-100', text: 'text-blue-700', border: 'border-blue-200' },
  Anxious: { bg: 'bg-gradient-to-r from-yellow-100 to-orange-100', text: 'text-yellow-700', border: 'border-yellow-200' },
  Excited: { bg: 'bg-gradient-to-r from-fuchsia-100 to-purple-100', text: 'text-fuchsia-700', border: 'border-fuchsia-200' },
  Calm: { bg: 'bg-gradient-to-r from-teal-100 to-cyan-100', text: 'text-teal-700', border: 'border-teal-200' },
  Frustrated: { bg: 'bg-gradient-to-r from-red-100 to-rose-100', text: 'text-red-700', border: 'border-red-200' },
  Grateful: { bg: 'bg-gradient-to-r from-emerald-100 to-green-100', text: 'text-emerald-700', border: 'border-emerald-200' },
  Tired: { bg: 'bg-gradient-to-r from-slate-100 to-gray-100', text: 'text-slate-700', border: 'border-slate-200' },
  Inspired: { bg: 'bg-gradient-to-r from-violet-100 to-purple-100', text: 'text-violet-700', border: 'border-violet-200' },
  Proud: { bg: 'bg-gradient-to-r from-emerald-100 to-teal-100', text: 'text-emerald-700', border: 'border-emerald-200' },
  Lonely: { bg: 'bg-gradient-to-r from-indigo-100 to-blue-100', text: 'text-indigo-700', border: 'border-indigo-200' },
  Relaxed: { bg: 'bg-gradient-to-r from-sky-100 to-blue-100', text: 'text-sky-700', border: 'border-sky-200' },
  Confused: { bg: 'bg-gradient-to-r from-amber-100 to-orange-100', text: 'text-amber-700', border: 'border-amber-200' },
  Energetic: { bg: 'bg-gradient-to-r from-orange-100 to-amber-100', text: 'text-orange-700', border: 'border-orange-200' },
  Hopeful: { bg: 'bg-gradient-to-r from-purple-100 to-fuchsia-100', text: 'text-purple-700', border: 'border-purple-200' },
  Overwhelmed: { bg: 'bg-gradient-to-r from-rose-100 to-red-100', text: 'text-rose-700', border: 'border-rose-200' },
  Content: { bg: 'bg-gradient-to-r from-lime-100 to-green-100', text: 'text-lime-700', border: 'border-lime-200' },
  Bored: { bg: 'bg-gradient-to-r from-gray-100 to-slate-100', text: 'text-gray-700', border: 'border-gray-200' },
  Stressed: { bg: 'bg-gradient-to-r from-orange-100 to-red-100', text: 'text-orange-700', border: 'border-orange-200' },
  Peaceful: { bg: 'bg-gradient-to-r from-cyan-100 to-sky-100', text: 'text-cyan-700', border: 'border-cyan-200' },
};

interface MoodSelectorProps {
  selectedMoods: Mood[];
  onMoodSelect: (mood: Mood) => void;
}

const MoodSelector = ({ selectedMoods, onMoodSelect }: MoodSelectorProps) => {
  const [customMood, setCustomMood] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Get color for a mood, with fallback
  const getMoodColor = (mood: string) => {
    return moodColors[mood] || { bg: 'bg-gradient-to-r from-gray-100 to-slate-100', text: 'text-gray-700', border: 'border-gray-200' };
  };
  
  // Add custom mood
  const handleAddCustomMood = () => {
    if (customMood.trim() && !moodOptions.includes(customMood as Mood)) {
      onMoodSelect(customMood as Mood);
      setCustomMood('');
      setIsDialogOpen(false);
    }
  };
  
  // Render the most common moods plus user's selected moods
  const getDisplayedMoods = () => {
    const commonMoods = moodOptions.slice(0, 10);
    const additionalSelected = selectedMoods.filter(mood => !commonMoods.includes(mood));
    return [...commonMoods, ...additionalSelected];
  };
  
  return (
    <div className="mb-6 bg-card/30 p-5 rounded-lg border border-border/50">
      <h3 className="font-header font-medium mb-4 flex items-center">
        <Smile className="h-4 w-4 mr-2 text-primary" />
        How are you feeling today?
      </h3>
      
      <div className="flex flex-wrap gap-2">
        {getDisplayedMoods().map((mood) => {
          const isSelected = selectedMoods.includes(mood);
          const { bg, text, border } = getMoodColor(mood);
          
          return (
            <div
              key={mood}
              className={`
                mood-tag inline-block px-3 py-1 rounded-full text-sm cursor-pointer border
                ${bg} ${text} ${border}
                ${isSelected ? 'ring-2 ring-primary ring-offset-1 shadow-sm' : ''}
                transition-all duration-200
              `}
              onClick={() => onMoodSelect(mood)}
            >
              {mood}
            </div>
          );
        })}
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <div className="mood-tag inline-block bg-primary/10 text-primary border border-primary/30 cursor-pointer px-3 py-1 rounded-full text-sm flex items-center">
              <Plus className="h-3 w-3 mr-1" /> Add mood
            </div>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <HeartHandshake className="h-5 w-5 mr-2 text-primary" />
                <span>Add a custom mood</span>
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Input
                placeholder="Enter a mood (e.g. Thoughtful, Nostalgic)"
                value={customMood}
                onChange={(e) => setCustomMood(e.target.value)}
                className="focus-visible:ring-primary"
              />
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-3 text-muted-foreground">Or choose from:</h4>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
                  {moodOptions.filter(mood => !selectedMoods.includes(mood)).map((mood) => {
                    const { bg, text, border } = getMoodColor(mood);
                    return (
                      <div
                        key={mood}
                        className={`${bg} ${text} ${border} px-2 py-1 rounded-full text-xs cursor-pointer border hover:shadow-sm transition-all`}
                        onClick={() => {
                          onMoodSelect(mood);
                          setIsDialogOpen(false);
                        }}
                      >
                        {mood}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddCustomMood} className="bg-primary hover:bg-primary-dark">Add Mood</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Display selected moods with remove option */}
      {selectedMoods.length > 0 && (
        <div className="mt-4 border-t border-border/50 pt-4">
          <p className="text-sm text-muted-foreground mb-3 flex items-center">
            <HeartHandshake className="h-4 w-4 mr-1 opacity-70" />
            Selected moods:
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedMoods.map((mood) => {
              const { bg, text, border } = getMoodColor(mood);
              return (
                <div
                  key={mood}
                  className={`${bg} ${text} ${border} px-3 py-1 rounded-full text-sm flex items-center border shadow-sm`}
                >
                  {mood}
                  <button 
                    onClick={() => onMoodSelect(mood)}
                    className="ml-1 rounded-full hover:bg-white/50 p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MoodSelector;
