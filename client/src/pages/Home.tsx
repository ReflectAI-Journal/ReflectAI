import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import JournalEditor from "@/components/journal/JournalEditor";
import AIResponse from "@/components/journal/AIResponse";
import JournalGallery from "@/components/journal/JournalGallery";
import CalendarSelector from "@/components/journal/CalendarSelector";
import { useToast } from "@/hooks/use-toast";
import { useJournal } from "@/hooks/useJournal";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { JournalEntry, JournalStats } from "@/types/journal";

const Home = () => {
  const { toast } = useToast();
  const { user } = useAuth();
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
  
  // Load journal stats and entries
  const { data: stats, isLoading: statsLoading } = useQuery<JournalStats>({
    queryKey: ["/api/stats"],
    queryFn: async () => {
      // For guest users, return mock stats
      if (user?.isGuest) {
        return {
          id: 9999,
          userId: 0,
          entriesCount: 6, // Match the number of mock entries
          currentStreak: 3,
          longestStreak: 7,
          topMoods: {
            "Relaxed": 3,
            "Productive": 2,
            "Creative": 2,
            "Focused": 2,
            "Grateful": 1
          },
          lastUpdated: new Date().toISOString()
        };
      }
      
      // For regular users, proceed with the API request
      const res = await apiRequest("GET", "/api/stats");
      return res.json();
    }
  });
  
  const { data: entries = [] } = useQuery<JournalEntry[]>({
    queryKey: ["/api/entries"], 
  });
  
  // Fetch or create today's entry on component mount
  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    
    // Check if we have a stored date in localStorage
    const storedDateStr = localStorage.getItem('lastJournalDate');
    if (storedDateStr) {
      const storedDate = new Date(storedDateStr);
      const currentDateStr = `${year}-${month}-${day}`;
      
      // If the stored date is different from today, we should clear any empty entries
      if (storedDate.getFullYear() !== year || 
          storedDate.getMonth() + 1 !== month || 
          storedDate.getDate() !== day) {
        console.log("New day detected - loading fresh entry");
        localStorage.setItem('lastJournalDate', today.toISOString());
      }
    } else {
      // First time loading, set the date
      localStorage.setItem('lastJournalDate', today.toISOString());
    }
    
    // Load today's entry
    console.log("Home component mount - loading today's entry");
    loadEntry(year, month, day);
    
    // Return cleanup function to avoid state updates after unmount
    return () => {
      console.log("Home component unmounting - clearing state");
    };
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
    <div className="flex flex-col">
      <div className="w-full p-6 md:p-8 lg:p-12 overflow-y-auto pb-36" style={{ maxHeight: "calc(100vh - 136px)" }}>
        {/* Journal Header */}
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h1 className="font-header text-3xl font-bold text-primary">Today's Journal</h1>
            <p className="text-muted-foreground">{todayFormatted}</p>
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

        {/* Journal Stats */}
        <div className="mt-12 mb-8">
          <h2 className="font-header text-2xl font-semibold mb-4">Journal Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card p-4 rounded-md border border-border/40 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-muted-foreground text-sm">Entries this month</p>
              <p className="font-semibold text-xl">{stats?.entriesCount || 0}</p>
            </div>
            <div className="bg-card p-4 rounded-md border border-border/40 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-muted-foreground text-sm">Journaling streak</p>
              <p className="font-semibold text-xl">{stats?.currentStreak || 0} days</p>
            </div>
            <div className="bg-card p-4 rounded-md border border-border/40 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-muted-foreground text-sm">Top mood</p>
              <p className="font-semibold text-xl">
                {stats?.topMoods && Object.keys(stats.topMoods).length > 0
                  ? Object.entries(stats.topMoods).sort((a, b) => b[1] - a[1])[0][0]
                  : 'None yet'
                }
              </p>
            </div>
            <div className="bg-card p-4 rounded-md border border-border/40 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-muted-foreground text-sm">Total entries</p>
              <p className="font-semibold text-xl">{entries?.length || 0}</p>
            </div>
          </div>
        </div>

        {/* Calendar Component */}
        <div className="mt-8 p-6 bg-card/50 rounded-2xl shadow-sm border border-border/40">
          <h2 className="font-header text-2xl font-semibold mb-4">Calendar View</h2>
          <CalendarSelector onSelectDate={(year, month, day) => {
            // When a date is selected from the calendar, load that day's entry
            console.log(`Calendar date selected: ${year}-${month}-${day}`);
            loadEntry(year, month, day);
          }} />
        </div>
        
        {/* Journal Gallery */}
        <JournalGallery />
      </div>
    </div>
  );
};

export default Home;