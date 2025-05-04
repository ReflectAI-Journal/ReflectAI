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
      
      <div className="paper rounded-2xl mb-6 shadow-journal overflow-hidden relative bg-white/80">
        {/* Colorful gradient border at top */}
        <div className="h-2 w-full bg-gradient-to-r from-primary via-secondary to-accent absolute top-0 left-0 right-0 z-10"></div>
        
        {/* Bubble decorations */}
        <div className="absolute -top-4 -right-4 w-12 h-12 bg-primary/10 rounded-full"></div>
        <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-secondary/10 rounded-full"></div>
        <div className="absolute top-1/3 -right-3 w-8 h-8 bg-accent/10 rounded-full"></div>
        
        {/* Writing inspiration section */}
        <div className="p-5 border-b border-border/30 flex items-start gap-4 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="bg-primary/15 p-3 rounded-full shadow-sm">
            <Lightbulb className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-base font-medium mb-1 text-gray-800">Writing inspiration:</h3>
            <p className="text-base text-gray-600 font-medium">{currentPrompt}</p>
            <Button 
              variant="link" 
              className="h-auto p-0 text-sm text-primary mt-1 font-medium"
              onClick={getRandomPrompt}
            >
              Try another prompt ✨
            </Button>
          </div>
        </div>
        
        {/* Journal editor area */}
        <div className="p-7 bg-white/90 rounded-b-2xl">
          <div className="flex items-center text-gray-600 mb-4">
            <Pencil className="h-5 w-5 mr-3 text-primary/70" />
            <span className="text-base font-medium">Write freely, reflect deeply</span>
          </div>
          <textarea
            ref={textareaRef}
            className="journal-editor font-normal text-xl"
            placeholder="What's on your mind today? Tap into your thoughts, feelings, and experiences..."
            value={value}
            onChange={handleTextChange}
            style={{
              fontFamily: "'Caveat', 'Open Sans', sans-serif",
              lineHeight: "1.6",
              color: "#333",
            }}
          />
        </div>
      </div>
      
      {/* Buttons - visible on all screen sizes with different layouts */}
      <div className="flex flex-col sm:flex-row sm:justify-end gap-4 mt-8">
        <Button 
          className="btn-glow bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary text-white font-medium tracking-wide"
          onClick={onSave}
          disabled={isSubmitting}
          size="lg"
          style={{
            borderRadius: "1.2rem",
            padding: "1.5rem 2rem",
            boxShadow: "0 8px 16px -4px rgba(79, 70, 229, 0.2), 0 2px 4px -2px rgba(79, 70, 229, 0.2)",
            transition: "all 0.3s ease",
            transform: isSubmitting ? "scale(0.98)" : "scale(1)",
          }}
        >
          <Save className="h-5 w-5 mr-3" />
          {isSubmitting ? "Saving..." : "Save Journal Entry"}
        </Button>
        <Button 
          variant="outline"
          className="border-2 border-primary/30 text-primary hover:bg-primary/5 font-medium"
          size="lg"
          style={{
            borderRadius: "1.2rem",
            padding: "1.5rem 2rem",
          }}
        >
          <Download className="h-5 w-5 mr-3" />
          Export Journal
        </Button>
      </div>
    </div>
  );
};

export default JournalEditor;
