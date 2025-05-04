import { useRef, useEffect, useState } from 'react';
import { useJournal } from '@/hooks/useJournal';
import { Button } from '@/components/ui/button';
import { Save, Download, Sparkles, Pencil, Lightbulb } from 'lucide-react';

interface JournalEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  isSubmitting: boolean;
}

const JournalEditor = ({ value, onChange, onSave, isSubmitting }: JournalEditorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { currentEntry, setCurrentEntry } = useJournal();
  
  // Journal prompts for inspiration
  const journalPrompts = [
    "What made you smile today?",
    "What's something you're looking forward to?",
    "Describe a challenge you're facing and how you might overcome it",
    "What are you grateful for right now?",
    "If you could change one thing about today, what would it be?",
    "What's something new you learned recently?",
    "Describe your perfect day",
    "What's something you're proud of accomplishing?",
  ];

  const [currentPrompt, setCurrentPrompt] = useState(() => {
    const randomIndex = Math.floor(Math.random() * journalPrompts.length);
    return journalPrompts[randomIndex];
  });
  
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

  // Get a random prompt
  const getRandomPrompt = () => {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * journalPrompts.length);
    } while (journalPrompts[randomIndex] === currentPrompt);
    
    setCurrentPrompt(journalPrompts[randomIndex]);
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
      
      <div className="paper rounded-lg mb-6 shadow-journal overflow-hidden relative">
        {/* Colorful gradient border at top */}
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-secondary to-accent absolute top-0 left-0 right-0"></div>
        
        {/* Writing inspiration section */}
        <div className="p-4 border-b border-border/30 flex items-start gap-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <Lightbulb className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-medium mb-1">Writing inspiration:</h3>
            <p className="text-sm text-muted-foreground">{currentPrompt}</p>
            <Button 
              variant="link" 
              className="h-auto p-0 text-xs text-primary"
              onClick={getRandomPrompt}
            >
              Try another prompt
            </Button>
          </div>
        </div>
        
        {/* Journal editor area */}
        <div className="p-6">
          <div className="flex items-center text-muted-foreground mb-3">
            <Pencil className="h-4 w-4 mr-2" />
            <span className="text-sm">Write freely, reflect deeply</span>
          </div>
          <textarea
            ref={textareaRef}
            className="journal-editor"
            placeholder="What's on your mind today? Tap into your thoughts, feelings, and experiences..."
            value={value}
            onChange={handleTextChange}
          />
        </div>
      </div>
      
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
