import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { X, Plus } from 'lucide-react';
import { Mood } from '@/types/journal';

// Predefined mood options
const moodOptions: Mood[] = [
  'Happy', 'Sad', 'Anxious', 'Excited', 'Calm', 
  'Frustrated', 'Grateful', 'Tired', 'Inspired', 'Proud',
  'Lonely', 'Relaxed', 'Confused', 'Energetic', 'Hopeful',
  'Overwhelmed', 'Content', 'Bored', 'Stressed', 'Peaceful'
];

// Mood colors
const moodColors: Record<string, { bg: string, text: string }> = {
  Happy: { bg: 'bg-green-100', text: 'text-green-800' },
  Sad: { bg: 'bg-blue-100', text: 'text-blue-800' },
  Anxious: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  Excited: { bg: 'bg-purple-100', text: 'text-purple-800' },
  Calm: { bg: 'bg-blue-100', text: 'text-blue-800' },
  Frustrated: { bg: 'bg-red-100', text: 'text-red-800' },
  Grateful: { bg: 'bg-green-100', text: 'text-green-800' },
  Tired: { bg: 'bg-gray-100', text: 'text-gray-800' },
  Inspired: { bg: 'bg-purple-100', text: 'text-purple-800' },
  Proud: { bg: 'bg-green-100', text: 'text-green-800' },
  Lonely: { bg: 'bg-blue-100', text: 'text-blue-800' },
  Relaxed: { bg: 'bg-blue-100', text: 'text-blue-800' },
  Confused: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  Energetic: { bg: 'bg-orange-100', text: 'text-orange-800' },
  Hopeful: { bg: 'bg-purple-100', text: 'text-purple-800' },
  Overwhelmed: { bg: 'bg-red-100', text: 'text-red-800' },
  Content: { bg: 'bg-green-100', text: 'text-green-800' },
  Bored: { bg: 'bg-gray-100', text: 'text-gray-800' },
  Stressed: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  Peaceful: { bg: 'bg-blue-100', text: 'text-blue-800' },
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
    return moodColors[mood] || { bg: 'bg-gray-100', text: 'text-gray-800' };
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
    <div className="mb-6">
      <h3 className="font-medium mb-2">How are you feeling today?</h3>
      <div className="flex flex-wrap gap-2">
        {getDisplayedMoods().map((mood) => {
          const isSelected = selectedMoods.includes(mood);
          const { bg, text } = getMoodColor(mood);
          
          return (
            <div
              key={mood}
              className={`
                mood-tag inline-block px-3 py-1 rounded-full text-sm cursor-pointer
                ${bg} ${text}
                ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}
              `}
              onClick={() => onMoodSelect(mood)}
            >
              {mood}
            </div>
          );
        })}
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <div className="mood-tag inline-block bg-blue-100 text-blue-800 cursor-pointer px-3 py-1 rounded-full text-sm flex items-center">
              <Plus className="h-3 w-3 mr-1" /> Add mood
            </div>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a custom mood</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Input
                placeholder="Enter a mood (e.g. Thoughtful, Nostalgic)"
                value={customMood}
                onChange={(e) => setCustomMood(e.target.value)}
              />
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Or choose from:</h4>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                  {moodOptions.filter(mood => !selectedMoods.includes(mood)).map((mood) => {
                    const { bg, text } = getMoodColor(mood);
                    return (
                      <div
                        key={mood}
                        className={`${bg} ${text} px-2 py-1 rounded-full text-xs cursor-pointer`}
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
              <Button onClick={handleAddCustomMood}>Add Mood</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Display selected moods with remove option */}
      {selectedMoods.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-muted-foreground mb-2">Selected moods:</p>
          <div className="flex flex-wrap gap-2">
            {selectedMoods.map((mood) => {
              const { bg, text } = getMoodColor(mood);
              return (
                <div
                  key={mood}
                  className={`${bg} ${text} px-3 py-1 rounded-full text-sm flex items-center`}
                >
                  {mood}
                  <button 
                    onClick={() => onMoodSelect(mood)}
                    className="ml-1 rounded-full hover:bg-white/20 p-0.5"
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
