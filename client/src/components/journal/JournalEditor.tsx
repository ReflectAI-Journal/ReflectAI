import { useState, useRef, useEffect } from 'react';
import MoodSelector from './MoodSelector';
import { useJournal } from '@/hooks/useJournal';
import { Button } from '@/components/ui/button';
import { Mood } from '@/types/journal';
import { Save, Download, Sparkles } from 'lucide-react';

interface JournalEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  isSubmitting: boolean;
}

const JournalEditor = ({ value, onChange, onSave, isSubmitting }: JournalEditorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { currentEntry, setCurrentEntry } = useJournal();
  const [selectedMoods, setSelectedMoods] = useState<Mood[]>(currentEntry?.moods || []);
  
  // Auto-resize textarea as content grows
  useEffect(() => {
    const adjustHeight = () => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    };
    
    adjustHeight();
    
    // Add event listener for window resize
    window.addEventListener('resize', adjustHeight);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', adjustHeight);
    };
  }, [value]);
  
  // Update the moods in the journal entry when they change
  useEffect(() => {
    setCurrentEntry(prev => ({ ...prev, moods: selectedMoods }));
  }, [selectedMoods, setCurrentEntry]);
  
  // If currentEntry moods change externally, update local state
  useEffect(() => {
    if (currentEntry?.moods) {
      setSelectedMoods(currentEntry.moods);
    }
  }, [currentEntry?.moods]);
  
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    
    // Adjust height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };
  
  const formatDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-header text-xl font-semibold flex items-center">
          <span className="mr-2">Today's Entry</span>
          <Sparkles className="h-4 w-4 text-primary-light" />
        </h2>
        <div className="text-sm text-muted-foreground">{formatDate()}</div>
      </div>
      
      <div className="paper rounded-lg p-6 mb-6 shadow-journal overflow-hidden">
        <textarea
          ref={textareaRef}
          className="journal-editor"
          placeholder="How are you feeling today? What's on your mind?"
          value={value}
          onChange={handleTextChange}
        />
      </div>
      
      {/* Mood Selector */}
      <MoodSelector 
        selectedMoods={selectedMoods}
        onMoodSelect={(mood) => {
          if (selectedMoods.includes(mood)) {
            setSelectedMoods(selectedMoods.filter(m => m !== mood));
          } else {
            setSelectedMoods([...selectedMoods, mood]);
          }
        }}
      />
      
      {/* Buttons - visible on all screen sizes with different layouts */}
      <div className="flex flex-col sm:flex-row sm:justify-end gap-3 mt-6">
        <Button 
          className="btn-glow bg-primary hover:bg-primary-dark text-primary-foreground"
          onClick={onSave}
          disabled={isSubmitting}
          size="lg"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? "Saving..." : "Save Entry"}
        </Button>
        <Button 
          variant="outline"
          className="border border-border text-foreground hover:bg-muted"
          size="lg"
        >
          <Download className="h-4 w-4 mr-2" />
          Export Journal
        </Button>
      </div>
    </div>
  );
};

export default JournalEditor;
