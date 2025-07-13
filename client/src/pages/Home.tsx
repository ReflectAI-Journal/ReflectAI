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
import { BookOpen, Lightbulb, Heart, Star, Coffee, Sunset, Zap, TreePine, RefreshCw, Music, Camera, Sparkles, Target, Users } from "lucide-react";

const allJournalPrompts = [
  { text: "What am I most grateful for today?", category: "Gratitude", icon: Heart },
  { text: "What challenge did I overcome this week?", category: "Growth", icon: Star },
  { text: "How do I want to feel tomorrow?", category: "Intention", icon: Sunset },
  { text: "What lesson did I learn today?", category: "Learning", icon: Lightbulb },
  { text: "What made me smile today?", category: "Joy", icon: Coffee },
  { text: "How did I show kindness today?", category: "Kindness", icon: TreePine },
  { text: "What energized me the most today?", category: "Energy", icon: Zap },
  { text: "What creative thought crossed my mind?", category: "Creativity", icon: Sparkles },
  { text: "How did I connect with someone today?", category: "Connection", icon: Users },
  { text: "What goal am I working toward?", category: "Achievement", icon: Target },
  { text: "What beautiful thing did I notice today?", category: "Beauty", icon: Camera },
  { text: "What song or sound made me feel good?", category: "Music", icon: Music },
  { text: "What am I looking forward to?", category: "Anticipation", icon: Sunset },
  { text: "How did I take care of myself today?", category: "Self-Care", icon: Heart },
  { text: "What surprised me today?", category: "Discovery", icon: Lightbulb },
  { text: "How did I make a difference today?", category: "Impact", icon: Star }
];

const moodOptions = [
  { emoji: "😊", label: "Happy", color: "bg-yellow-500", description: "Feeling joyful and positive" },
  { emoji: "😌", label: "Calm", color: "bg-blue-500", description: "Peaceful and relaxed" },
  { emoji: "😔", label: "Sad", color: "bg-gray-500", description: "Feeling down or melancholy" },
  { emoji: "😰", label: "Anxious", color: "bg-orange-500", description: "Worried or stressed" },
  { emoji: "😴", label: "Tired", color: "bg-purple-500", description: "Feeling exhausted or sleepy" },
  { emoji: "🔥", label: "Energized", color: "bg-red-500", description: "Full of energy and motivation" },
  { emoji: "🤔", label: "Thoughtful", color: "bg-indigo-500", description: "Reflective and contemplative" },
  { emoji: "😍", label: "Inspired", color: "bg-pink-500", description: "Feeling motivated and creative" },
  { emoji: "😤", label: "Frustrated", color: "bg-amber-500", description: "Feeling annoyed or stuck" }
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
  const [currentPrompts, setCurrentPrompts] = useState(() => 
    allJournalPrompts.sort(() => Math.random() - 0.5).slice(0, 4)
  );
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  
  // Function to refresh prompts
  const refreshPrompts = () => {
    setCurrentPrompts(allJournalPrompts.sort(() => Math.random() - 0.5).slice(0, 4));
    toast({
      title: "Prompts refreshed!",
      description: "New writing ideas are ready for you.",
    });
  };
  
  // Get today's date for display
  const todayFormatted = format(new Date(), "EEEE, MMMM d, yyyy");
  
  // Load journal stats and entries
  const { data: stats, isLoading: statsLoading } = useQuery<JournalStats>({
    queryKey: ["/api/stats"], 
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
    <div className={`flex transition-all duration-300 bg-premium-gradient min-h-screen relative overflow-hidden ${isFocusMode ? 'focus-mode-layout' : ''}`}>
      {/* Premium background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/5 via-purple-900/10 to-pink-900/5 pointer-events-none" />
      <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(circle at 25% 25%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
                         radial-gradient(circle at 75% 75%, rgba(255, 119, 198, 0.1) 0%, transparent 50%)`
      }} />

      {/* Main Content Area */}
      <div className={`w-full flex flex-col transition-all duration-300 relative z-10 ${isFocusMode ? 'focus-content' : ''}`}>
        <div className={`w-full overflow-y-auto transition-all duration-300 ${isFocusMode ? '' : 'p-6 md:p-8 lg:p-12 pb-36'}`} style={{ maxHeight: isFocusMode ? "100vh" : "calc(100vh - 136px)" }}>
          {/* Enhanced Journal Header - Hidden in focus mode */}
          {!isFocusMode && (
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h1 className="font-header text-3xl font-bold text-premium-gradient mb-2">Today's Journal</h1>
                <p className="text-gray-300 font-medium">{todayFormatted}</p>
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
              {/* Enhanced Daily Inspiration */}
              <Card className="glass-card border-l-4 border-l-blue-400 glass-card-hover">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg text-gray-200">
                    <Zap className="h-5 w-5 text-blue-400 animate-pulse-slow" />
                    <span className="text-premium-gradient">Daily Inspiration</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <blockquote className="text-sm italic text-gray-300 mb-3 leading-relaxed">
                    "{currentQuote.text}"
                  </blockquote>
                  <cite className="text-xs font-semibold text-blue-400">— {currentQuote.author}</cite>
                </CardContent>
              </Card>

              {/* Enhanced Journal Prompts */}
              <Card className="glass-card glass-card-hover">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-premium-gradient">Writing Prompts</CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={refreshPrompts}
                      className="text-gray-400 hover:text-blue-400 btn-hover-lift"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {currentPrompts.map((prompt, index) => {
                      const IconComponent = prompt.icon;
                      return (
                        <Button
                          key={index}
                          variant="ghost"
                          className="w-full text-left justify-start text-sm h-auto p-3 hover:bg-white/5 text-gray-300 hover:text-white transition-all duration-300 group border border-transparent hover:border-blue-400/30 rounded-xl"
                          onClick={() => {
                            const currentContent = currentEntry.content || "";
                            const promptText = currentContent ? `\n\n${prompt.text}\n` : `${prompt.text}\n`;
                            setCurrentEntry(prev => ({ 
                              ...prev, 
                              content: currentContent + promptText 
                            }));
                            toast({
                              title: "Prompt added",
                              description: "Writing idea added to your journal entry.",
                            });
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <IconComponent className="h-4 w-4 mt-0.5 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                            <span className="group-hover:text-blue-200 transition-colors duration-300">{prompt.text}</span>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Mood Tracker */}
              <Card className="glass-card glass-card-hover">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-premium-gradient">How are you feeling today?</CardTitle>
                  <p className="text-sm text-gray-300">
                    Click a mood to add it to your journal entry
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    {moodOptions.map((mood, index) => (
                      <Button
                        key={index}
                        variant={selectedMood === mood.label ? "default" : "outline"}
                        className={`h-auto p-3 flex flex-col gap-2 hover:bg-white/10 transition-all duration-300 group border-white/10 hover:border-blue-400/50 ${
                          selectedMood === mood.label ? "ring-2 ring-blue-400/50 bg-blue-500/20" : ""
                        }`}
                        onClick={() => {
                          setSelectedMood(mood.label);
                          // Add mood to journal entry with more context
                          const moodText = `\n\nMood: ${mood.emoji} ${mood.label}\n${mood.description}\n`;
                          setCurrentEntry(prev => ({ 
                            ...prev, 
                            content: (prev.content || "") + moodText 
                          }));
                          toast({
                            title: `Mood added: ${mood.emoji} ${mood.label}`,
                            description: mood.description,
                          });
                        }}
                      >
                        <div className="text-2xl group-hover:scale-125 transition-transform duration-300">{mood.emoji}</div>
                        <div className="text-xs font-medium text-gray-300 group-hover:text-white transition-colors duration-300">{mood.label}</div>
                      </Button>
                    ))}
                  </div>
                  {selectedMood && (
                    <div className="mt-3 p-3 bg-blue-500/10 rounded-lg border border-blue-400/30">
                      <p className="text-sm text-gray-300">
                        Current mood: <span className="font-semibold text-blue-400">{selectedMood}</span>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Journal Stats - Hidden in focus mode */}
          {!isFocusMode && (
            <div className="mt-12 mb-8">
            <h2 className="font-header text-2xl font-semibold mb-6 text-premium-gradient">Journal Stats</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass-card p-4 glass-card-hover group">
                <p className="text-gray-400 text-sm mb-2 group-hover:text-gray-300 transition-colors duration-300">Entries this month</p>
                <p className="font-bold text-2xl text-blue-400 group-hover:scale-110 transition-transform duration-300">{stats?.entriesCount || 0}</p>
              </div>
              <div className="glass-card p-4 glass-card-hover group">
                <p className="text-gray-400 text-sm mb-2 group-hover:text-gray-300 transition-colors duration-300">Journaling streak</p>
                <p className="font-bold text-2xl text-purple-400 group-hover:scale-110 transition-transform duration-300">{stats?.currentStreak || 0} days</p>
              </div>
              <div className="glass-card p-4 glass-card-hover group">
                <p className="text-gray-400 text-sm mb-2 group-hover:text-gray-300 transition-colors duration-300">Top mood</p>
                <p className="font-bold text-xl text-pink-400 group-hover:scale-110 transition-transform duration-300">
                  {stats?.topMoods && Object.keys(stats.topMoods).length > 0
                    ? Object.entries(stats.topMoods).sort((a, b) => b[1] - a[1])[0][0]
                    : 'None yet'
                  }
                </p>
              </div>
              <div className="glass-card p-4 glass-card-hover group">
                <p className="text-gray-400 text-sm mb-2 group-hover:text-gray-300 transition-colors duration-300">Total entries</p>
                <p className="font-bold text-2xl text-green-400 group-hover:scale-110 transition-transform duration-300">{entries?.length || 0}</p>
              </div>
            </div>
          </div>
          )}

          {/* Calendar Component - Hidden in focus mode */}
          {!isFocusMode && (
            <div className="mt-8 glass-card p-6 glass-card-hover">
              <h2 className="font-header text-2xl font-semibold mb-4 text-premium-gradient">Calendar View</h2>
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