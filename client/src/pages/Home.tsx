import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/Sidebar";
import JournalEditor from "@/components/journal/JournalEditor";
import AIResponse from "@/components/journal/AIResponse";
import JournalGallery from "@/components/journal/JournalGallery";
import CalendarSelector from "@/components/journal/CalendarSelector";
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

  return (
    <div className="flex flex-col md:flex-row">
      <Sidebar />
      
      <div className="w-full md:w-3/4 lg:w-4/5 p-6 md:p-8 lg:p-12 overflow-y-auto" style={{ maxHeight: "calc(100vh - 136px)" }}>
        {/* Journal Header */}
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h1 className="font-header text-3xl font-bold text-primary">Today's Journal</h1>
            <p className="text-muted-foreground">{todayFormatted}</p>
          </div>
        </div>

        {/* Calendar Component - Use existing calendar from Sidebar */}
        <div className="mb-8 p-6 bg-card/50 rounded-2xl shadow-sm border border-border/40">
          <CalendarSelector onSelectDate={(year, month, day) => loadEntry(year, month, day)} />
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