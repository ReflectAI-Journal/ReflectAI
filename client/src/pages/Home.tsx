import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import JournalEditor from "@/components/journal/JournalEditor";
import AIResponse from "@/components/journal/AIResponse";
import JournalGallery from "@/components/journal/JournalGallery";
import CalendarSelector from "@/components/journal/CalendarSelector";
import { useToast } from "@/hooks/use-toast";
import { useJournal } from "@/hooks/useJournal";
import { format } from "date-fns";
import { JournalEntry, JournalStats } from "@/types/journal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Lightbulb, Heart, Star, Coffee, Sunset, Zap, TreePine } from "lucide-react";

const journalPrompts = [
  { text: "What am I most grateful for today?", category: "Gratitude", icon: Heart },
  { text: "What challenge did I overcome this week?", category: "Growth", icon: Star },
  { text: "How do I want to feel tomorrow?", category: "Intention", icon: Sunset },
  { text: "What lesson did I learn today?", category: "Learning", icon: Lightbulb },
  { text: "What made me smile today?", category: "Joy", icon: Coffee },
  { text: "How did I show kindness today?", category: "Kindness", icon: TreePine }
];

const moodOptions = [
  { emoji: "😊", label: "Happy", color: "bg-yellow-500" },
  { emoji: "😌", label: "Calm", color: "bg-blue-500" },
  { emoji: "😔", label: "Sad", color: "bg-gray-500" },
  { emoji: "😰", label: "Anxious", color: "bg-orange-500" },
  { emoji: "😴", label: "Tired", color: "bg-purple-500" },
  { emoji: "🔥", label: "Energized", color: "bg-red-500" }
];

const inspirationalQuotes = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Life is what happens to you while you're busy making other plans.", author: "John Lennon" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" }
];

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
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [currentQuote] = useState(() => 
    inspirationalQuotes[Math.floor(Math.random() * inspirationalQuotes.length)]
  );
  
  // Get today's date for display
  const todayFormatted = format(new Date(), "EEEE, MMMM d, yyyy");
  
  // Load journal stats and entries with optimized caching
  const { data: stats, isLoading: statsLoading } = useQuery<JournalStats>({
    queryKey: ["/api/stats"],
    staleTime: 60000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes cache
  });
  
  const { data: entries = [] } = useQuery<JournalEntry[]>({
    queryKey: ["/api/entries"],
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes cache
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
    <div className={`flex transition-all duration-300 ${isFocusMode ? 'focus-mode-layout' : ''}`}>


      {/* Main Content Area */}
      <div className={`w-full flex flex-col transition-all duration-300 ${isFocusMode ? 'focus-content' : ''}`}>
        <div className={`w-full overflow-y-auto transition-all duration-300 ${isFocusMode ? '' : 'p-6 md:p-8 lg:p-12 pb-36'}`} style={{ maxHeight: isFocusMode ? "100vh" : "calc(100vh - 136px)" }}>
          {/* Journal Header - Hidden in focus mode */}
          {!isFocusMode && (
            <div className="mb-4 flex justify-between items-center">
              <div>
                <h1 className="font-header text-3xl font-bold text-primary">Today's Journal</h1>
                <p className="text-muted-foreground">{todayFormatted}</p>
              </div>
            </div>
          )}
          
          {/* Journal Editor */}
          <JournalEditor 
            value={currentEntry.content || ""}
            onChange={(content) => setCurrentEntry(prev => ({ ...prev, content }))}
            onSave={handleSave}
            isSubmitting={isSubmitting}
            isFocusMode={isFocusMode}
            onFocusModeChange={setIsFocusMode}
          />
          
          {/* AI Response - Hidden in focus mode */}
          {!isFocusMode && (
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
          )}

          {/* Daily Inspiration, Writing Prompts, and Mood Tracker - Hidden in focus mode */}
          {!isFocusMode && (
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Daily Inspiration */}
              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Zap className="h-5 w-5 text-green-500" />
                    Daily Inspiration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <blockquote className="text-sm italic text-muted-foreground mb-2">
                    "{currentQuote.text}"
                  </blockquote>
                  <cite className="text-xs font-medium">— {currentQuote.author}</cite>
                </CardContent>
              </Card>

              {/* Journal Prompts */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Writing Prompts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {journalPrompts.slice(0, 4).map((prompt, index) => {
                      const IconComponent = prompt.icon;
                      return (
                        <Button
                          key={index}
                          variant="ghost"
                          className="w-full text-left justify-start text-sm h-auto p-3 hover:bg-muted/50"
                          onClick={() => {
                            const currentContent = currentEntry.content || "";
                            const promptText = currentContent ? `\n\n${prompt.text}\n` : `${prompt.text}\n`;
                            setCurrentEntry(prev => ({ 
                              ...prev, 
                              content: currentContent + promptText 
                            }));
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <IconComponent className="h-4 w-4 mt-0.5 text-primary" />
                            <span>{prompt.text}</span>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Mood Tracker */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">How are you feeling?</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    {moodOptions.map((mood, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="h-auto p-3 flex flex-col gap-2 hover:bg-muted/50"
                        onClick={() => {
                          // Add mood to journal entry
                          const moodText = `\n\nMood: ${mood.emoji} ${mood.label}\n`;
                          setCurrentEntry(prev => ({ 
                            ...prev, 
                            content: (prev.content || "") + moodText 
                          }));
                        }}
                      >
                        <div className="text-2xl">{mood.emoji}</div>
                        <div className="text-xs">{mood.label}</div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Journal Stats - Hidden in focus mode */}
          {!isFocusMode && (
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
          )}

          {/* Calendar Component - Hidden in focus mode */}
          {!isFocusMode && (
            <div className="mt-8 p-6 bg-card/50 rounded-2xl shadow-sm border border-border/40">
              <h2 className="font-header text-2xl font-semibold mb-4">Calendar View</h2>
              <CalendarSelector onSelectDate={(year, month, day) => {
                // When a date is selected from the calendar, load that day's entry
                console.log(`Calendar date selected: ${year}-${month}-${day}`);
                loadEntry(year, month, day);
              }} />
            </div>
          )}
          
          {/* Journal Gallery - Hidden in focus mode */}
          {!isFocusMode && <JournalGallery />}
        </div>
      </div>
    </div>
  );
};

export default Home;