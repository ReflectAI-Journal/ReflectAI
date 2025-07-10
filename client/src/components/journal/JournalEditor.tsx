import { useRef, useEffect, useState } from 'react';
import { useJournal } from '@/hooks/useJournal';
import { Button } from '@/components/ui/button';
import { Save, Download, Sparkles, Pencil, Lightbulb, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface JournalEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  isSubmitting: boolean;
  isFocusMode?: boolean;
  onFocusModeChange?: (isFocused: boolean) => void;
}

const JournalEditor = ({ value, onChange, onSave, isSubmitting, isFocusMode = false, onFocusModeChange }: JournalEditorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { currentEntry, setCurrentEntry, entries, clearEntry, loadEntry } = useJournal();
  const { toast } = useToast();

  
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
        const scrollHeight = textarea.scrollHeight;
        const maxHeight = isFocusMode ? window.innerHeight * 0.8 : Math.min(scrollHeight, window.innerHeight * 0.6);
        textarea.style.height = `${Math.max(isFocusMode ? 400 : 200, maxHeight)}px`;
        
        // Show scrollbar if content exceeds max height
        if (scrollHeight > maxHeight) {
          textarea.style.overflowY = 'auto';
        } else {
          textarea.style.overflowY = 'hidden';
        }
      }
    };
    
    adjustHeight();
    
    // Add event listener for window resize
    window.addEventListener('resize', adjustHeight);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', adjustHeight);
    };
  }, [value, isFocusMode]);
  
  // Listen for the custom event dispatched from Memory Lane
  useEffect(() => {
    const handleLoadEntry = (event: Event) => {
      const { year, month, day } = (event as CustomEvent).detail;
      
      // Use the loadEntry function from the useJournal hook
      loadEntry(year, month, day);
      
      // Show notification or visual feedback
      const entryDate = new Date(year, month - 1, day);
      const formattedDate = entryDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      // You can add a toast notification here if desired
    };
    
    window.addEventListener('load-journal-entry', handleLoadEntry as EventListener);
    
    return () => {
      window.removeEventListener('load-journal-entry', handleLoadEntry as EventListener);
    };
  }, [loadEntry]);
  
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    
    // Adjust height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = isFocusMode ? window.innerHeight * 0.8 : Math.min(scrollHeight, window.innerHeight * 0.6);
      textareaRef.current.style.height = `${Math.max(isFocusMode ? 400 : 200, maxHeight)}px`;
      
      // Show scrollbar if content exceeds max height
      if (scrollHeight > maxHeight) {
        textareaRef.current.style.overflowY = 'auto';
      } else {
        textareaRef.current.style.overflowY = 'hidden';
      }
    }
  };

  const handleFocus = () => {
    // Removed focus mode activation for iPhone-style inline interface
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    // Don't exit focus mode on blur - only through swipe gesture
    return;
  };

  // Handle swipe gestures to exit focus mode
  const exitFocusMode = () => {
    if (onFocusModeChange) {
      onFocusModeChange(false);
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



  // Enhanced save handler with simple click feedback
  const handleSaveWithFeedback = () => {
    onSave();
  };
  
  // Export journal entries to a downloadable file
  const exportJournal = () => {
    try {
      // If no entries, show message
      if (!entries || entries.length === 0) {
        toast({
          title: "No entries to export",
          description: "You haven't created any journal entries yet.",
          variant: "destructive",
        });
        return;
      }
      
      // Format entries for the export
      const formattedEntries = entries.map(entry => {
        const entryDate = new Date(entry.date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        return `
# Journal Entry - ${entryDate}
        
${entry.content}

${entry.aiResponse ? `\n## AI Reflection\n\n${entry.aiResponse}\n` : ''}
----------------------------
`;
      }).join('\n\n');
      
      // Create a title for the file
      const title = `# ReflectAI Journal Export\n## Created on ${new Date().toLocaleDateString()}\n\n`;
      
      // Combine title and entries
      const fileContent = title + formattedEntries;
      
      // Create a blob from the content
      const blob = new Blob([fileContent], { type: 'text/plain' });
      
      // Create a URL for the blob
      const url = URL.createObjectURL(blob);
      
      // Create a download link
      const a = document.createElement('a');
      a.href = url;
      a.download = `reflectai-journal-${new Date().toISOString().split('T')[0]}.txt`;
      
      // Trigger the download
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Journal Exported",
        description: "Your journal has been exported as a text file.",
      });
    } catch (error) {
      console.error('Error exporting journal:', error);
      toast({
        title: "Export Failed",
        description: "There was a problem exporting your journal.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className={`transition-all duration-500 ease-out ${isFocusMode ? 'focus-mode' : 'mb-8'}`}>
      {/* Focus mode indicator */}
      {isFocusMode && (
        <div className="absolute top-4 right-4 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={exitFocusMode}
            className="h-8 w-8 rounded-full bg-background/80 hover:bg-background shadow-md"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {/* Header - Hidden in focus mode */}
      {!isFocusMode && (
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-header text-lg md:text-xl font-semibold flex items-center">
            <span className="mr-2">Today's Entry</span>
            <Sparkles className="h-3 w-3 md:h-4 md:w-4 text-primary-light" />
          </h2>
          <div className="text-xs md:text-sm text-muted-foreground">{formatDate()}</div>
        </div>
      )}
      
      <div className={`paper rounded-xl md:rounded-2xl mb-4 md:mb-6 overflow-hidden relative bg-card ${isFocusMode ? 'focus-editor' : ''}`}>
        
        {/* Simplified writing inspiration section - Hidden in focus mode */}
        {!isFocusMode && (
          <div className="p-3 md:p-4 flex items-center gap-2 md:gap-3">
            <div className="bg-primary/10 p-2 md:p-2.5 rounded-full flex-shrink-0">
              <Lightbulb className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs md:text-sm text-muted-foreground font-medium">{currentPrompt}</p>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-6 md:h-7 px-2 mt-1 text-xs text-primary hover:bg-primary/5"
                onClick={getRandomPrompt}
              >
                New prompt ✨
              </Button>
            </div>
          </div>
        )}
        
        {/* Journal editor area with iPhone-style messaging interface */}
        <div className="p-3 md:p-5 bg-card rounded-b-xl md:rounded-b-2xl">
          <div className="bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl border border-gray-200/30 dark:border-gray-700/30 p-4 message-input-container focus-within:border-primary/30 focus-within:shadow-lg">
            <textarea
              ref={textareaRef}
              className="w-full bg-transparent border-0 resize-none outline-none text-sm md:text-base font-normal cursor-text placeholder:text-gray-500 dark:placeholder:text-gray-400"
              placeholder="What's on your mind today? Share your thoughts, feelings, and experiences..."
              value={value || ""}
              onChange={handleTextChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              style={{ 
                minHeight: '120px',
                maxHeight: '300px',
                overflowY: 'auto',
                lineHeight: '1.6'
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Floating Action Buttons - Always visible in focus mode, positioned above keyboard */}
      {isFocusMode && (
        <div className="fixed bottom-6 left-4 right-4 flex justify-center gap-3 z-20">
          <Button
            onClick={onSave}
            disabled={isSubmitting || !value.trim()}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg px-6 py-3 rounded-full"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
          
          <Button
            onClick={() => {
              onChange('');
            }}
            variant="outline"
            className="flex items-center gap-2 shadow-lg px-6 py-3 rounded-full bg-background border-2"
          >
            <Pencil className="h-4 w-4" />
            Clear
          </Button>
          
          <Button
            onClick={exportJournal}
            variant="outline"
            className="flex items-center gap-2 shadow-lg px-6 py-3 rounded-full bg-background border-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      )}

      {/* Regular Buttons - visible when not in focus mode */}
      {!isFocusMode && (
        <div className="flex flex-col sm:flex-row sm:justify-end gap-3 md:gap-4 mt-4 md:mt-8 journal-controls">
        <Button 
          className={`btn-glow bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary text-white font-medium tracking-wide journal-save-btn journal-btn-ripple journal-btn-press ${isSubmitting ? 'journal-loading' : ''}`}
          onClick={handleSaveWithFeedback}
          disabled={isSubmitting}
          size="default"
          style={{
            borderRadius: "1rem",
            padding: "1rem 1.5rem",
            boxShadow: "0 6px 12px -4px rgba(79, 70, 229, 0.2), 0 2px 4px -2px rgba(79, 70, 229, 0.2)",
            transition: "all 0.3s ease",
            transform: isSubmitting ? "scale(0.98)" : "scale(1)",
            fontSize: "0.875rem"
          }}
        >
          <Save className={`h-4 w-4 md:h-5 md:w-5 mr-2 md:mr-3 journal-icon-rotate ${isSubmitting ? 'journal-typing' : ''}`} />
          {isSubmitting ? "Saving..." : "Save Journal Entry"}
        </Button>
        <Button 
          variant="outline"
          className="border-2 border-primary/30 text-primary hover:bg-primary/5 font-medium journal-btn-bounce journal-btn-ripple journal-btn-press"
          size="default"
          onClick={async () => {
            // First update the local state immediately for responsive UI
            onChange("");
            
            // Then save the cleared entry to the database
            await clearEntry();
          }}
          style={{
            borderRadius: "1rem",
            padding: "1rem 1.5rem",
            fontSize: "0.875rem"
          }}
        >
          <Pencil className="h-4 w-4 md:h-5 md:w-5 mr-2 md:mr-3 journal-icon-rotate" />
          Clear Entry
        </Button>
        <Button 
          variant="outline"
          className="border-2 border-primary/30 text-primary hover:bg-primary/5 font-medium journal-btn-shimmer journal-btn-ripple journal-btn-press"
          size="default"
          onClick={exportJournal}
          style={{
            borderRadius: "1rem",
            padding: "1rem 1.5rem",
            fontSize: "0.875rem"
          }}
        >
          <Download className="h-4 w-4 md:h-5 md:w-5 mr-2 md:mr-3 journal-icon-rotate" />
          Export Journal
        </Button>
        </div>
      )}
    </div>
  );
};

export default JournalEditor;