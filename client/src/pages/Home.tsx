import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/Sidebar";
import JournalEditor from "@/components/journal/JournalEditor";
import AIResponse from "@/components/journal/AIResponse";
import JournalGallery from "@/components/journal/JournalGallery";
import FlyingBirdAnimation from "@/components/animations/FlyingBirdAnimation";
import { useToast } from "@/hooks/use-toast";
import { useJournal } from "@/hooks/useJournal";
import { format } from "date-fns";

const Home = () => {
  const { toast } = useToast();
  const { 
    currentEntry, 
    saveEntry, 
    isNewEntry, 
    loadEntry,
    setCurrentEntry,
    regenerateAIResponse
  } = useJournal();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBirdAnimation, setShowBirdAnimation] = useState(false);
  const saveButtonRef = useRef<HTMLButtonElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  // Get today's date for display
  const todayFormatted = format(new Date(), "EEEE, MMMM d, yyyy");
  
  // Load journal stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats"], 
  });
  
  // Fetch or create today's entry on component mount
  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    
    loadEntry(year, month, day);
  }, [loadEntry]);
  
  // Function to add highlight class to the target element
  const highlightCalendarDay = () => {
    // First remove any existing highlights
    document.querySelectorAll('.calendar-day.highlight').forEach(el => {
      el.classList.remove('highlight');
    });
    
    // Add highlight to the target element
    if (targetCalendarDayRef.current) {
      targetCalendarDayRef.current.classList.add('highlight');
    }
  };
  
  // Function to remove highlight class
  const removeHighlight = () => {
    document.querySelectorAll('.calendar-day.highlight').forEach(el => {
      el.classList.remove('highlight');
    });
  };
  
  const handleAnimationComplete = () => {
    setShowBirdAnimation(false);
    setTimeout(removeHighlight, 1500); // Keep highlighting for a moment after animation finishes
  };
  
  const handleSave = async () => {
    if (!currentEntry.content) {
      toast({
        title: "Cannot save empty entry",
        description: "Please write something in your journal before saving.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await saveEntry();
      toast({
        title: "Journal saved",
        description: "Your journal entry has been saved successfully."
      });
      
      // Highlight the calendar day
      highlightCalendarDay();
      
      // Trigger the flying bird animation
      setShowBirdAnimation(true);
    } catch (error) {
      toast({
        title: "Error saving journal",
        description: "There was a problem saving your journal entry. Please try again.",
        variant: "destructive"
      });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Calculate animation positions (will be updated in useEffect)
  const [animationPositions, setAnimationPositions] = useState({
    start: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    end: { x: 100, y: 100 }
  });
  
  // Reference to the current target element for animation
  const targetCalendarDayRef = useRef<Element | null>(null);

  // Update animation positions when elements are available
  useEffect(() => {
    const updateAnimationPositions = () => {
      // Get save button position
      if (saveButtonRef.current) {
        const saveButtonRect = saveButtonRef.current.getBoundingClientRect();
        const startX = saveButtonRect.left + saveButtonRect.width / 2;
        const startY = saveButtonRect.top + saveButtonRect.height / 2;

        // Get calendar in sidebar position - prioritize finding days with entries
        
        // Find any day with an entry
        let sidebarElement = document.querySelector('.calendar-day.has-entry:not(.inactive)');
        
        // If no entry found, use today's date
        if (!sidebarElement) {
          sidebarElement = document.querySelector('.calendar-day.today');
        }
        
        // If still not found, use any date
        if (!sidebarElement) {
          sidebarElement = document.querySelector('.calendar-day:not(.inactive)');
        }
        
        // Save reference to the target element
        targetCalendarDayRef.current = sidebarElement;
        
        let endX = 100;
        let endY = 150;

        if (sidebarElement) {
          const sidebarRect = sidebarElement.getBoundingClientRect();
          endX = sidebarRect.left + sidebarRect.width / 2;
          endY = sidebarRect.top + sidebarRect.height / 2;
        }

        setAnimationPositions({
          start: { x: startX, y: startY },
          end: { x: endX, y: endY }
        });
      }
    };

    // Initial update
    updateAnimationPositions();

    // Update on resize
    window.addEventListener('resize', updateAnimationPositions);
    return () => window.removeEventListener('resize', updateAnimationPositions);
  }, []);

  return (
    <div className="flex flex-col md:flex-row">
      <Sidebar ref={sidebarRef} />
      
      <div className="w-full md:w-3/4 lg:w-4/5 p-6 md:p-8 lg:p-12 overflow-y-auto" style={{ maxHeight: "calc(100vh - 136px)" }}>
        {/* Flying Bird Animation */}
        <FlyingBirdAnimation 
          isVisible={showBirdAnimation}
          onAnimationComplete={handleAnimationComplete}
          startPosition={animationPositions.start}
          endPosition={animationPositions.end}
        />

        {/* Journal Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="font-header text-3xl font-bold text-primary">Today's Journal</h1>
            <p className="text-muted-foreground">{todayFormatted}</p>
          </div>
          <div className="hidden md:flex space-x-3">
            <button 
              ref={saveButtonRef}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors shadow-sm flex items-center"
              onClick={handleSave}
              disabled={isSubmitting}
            >
              <i className="fas fa-save mr-2"></i>
              {isSubmitting ? "Saving..." : "Save"}
            </button>
            <button className="px-4 py-2 bg-white border border-primary text-primary hover:bg-gray-50 rounded-md transition-colors shadow-sm flex items-center">
              <i className="fas fa-download mr-2"></i>Export
            </button>
          </div>
        </div>
        
        {/* Journal Editor */}
        <JournalEditor 
          value={currentEntry.content || ""}
          onChange={(content) => setCurrentEntry(prev => ({ ...prev, content }))}
          onSave={handleSave}
          isSubmitting={isSubmitting}
        />
        
        {/* AI Response - Always show below the journal entry */}
        <AIResponse 
          response={currentEntry.aiResponse || ""} 
          onRegenerateClick={() => {
            if (currentEntry.content) {
              setIsSubmitting(true);
              regenerateAIResponse()
                .then(() => {
                  toast({
                    title: "AI Response Generated",
                    description: "Your journal entry has been analyzed with new insights."
                  });
                })
                .catch((error) => {
                  toast({
                    title: "Error generating AI response",
                    description: "There was a problem generating the AI response. Please try again.",
                    variant: "destructive"
                  });
                })
                .finally(() => {
                  setIsSubmitting(false);
                });
            }
          }}
        />
        
        {/* Journal Gallery */}
        <JournalGallery />
      </div>
    </div>
  );
};

export default Home;
