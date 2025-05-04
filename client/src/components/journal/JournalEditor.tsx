import { useState, useRef, useEffect } from 'react';
import MoodSelector from './MoodSelector';
import { useJournal } from '@/hooks/useJournal';
import { Button } from '@/components/ui/button';
import { Mood } from '@/types/journal';

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
  
  return (
    <div className="mb-8">
      <div className="paper rounded-lg p-6 mb-4">
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
      
      {/* Mobile buttons */}
      <div className="flex space-x-3 md:hidden mt-4">
        <Button 
          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={onSave}
          disabled={isSubmitting}
        >
          <i className="fas fa-save mr-2"></i>
          {isSubmitting ? "Saving..." : "Save"}
        </Button>
        <Button 
          variant="outline"
          className="flex-1 border border-primary text-primary hover:bg-primary/10"
        >
          <i className="fas fa-download mr-2"></i>Export
        </Button>
      </div>
    </div>
  );
};

export default JournalEditor;
