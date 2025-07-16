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
import { BookOpen, Lightbulb, Heart, Star, Coffee, Sunset, Zap, TreePine, RefreshCw, Music, Camera, Sparkles, Target, Users, Wind, Brain } from "lucide-react";
import ProactiveSuggestions from "@/components/ai/ProactiveSuggestions";
import DialogueInterface from "@/components/chat/DialogueInterface";
import BreathingExercise from "@/components/mindfulness/BreathingExercise";
import MeditativeReflection from "@/components/mindfulness/MeditativeReflection";
import { motion, AnimatePresence } from 'framer-motion';

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
  
  // Mindfulness states
  const [showBreathingExercise, setShowBreathingExercise] = useState(false);
  const [showMeditativeReflection, setShowMeditativeReflection] = useState(false);
  const [showDialogueInterface, setShowDialogueInterface] = useState(false);
  
  // Handler for proactive suggestions and dialogue interface
  const handleSuggestionSelect = (prompt: string) => {
    // Set the journal content to the suggested prompt
    setCurrentEntry(prev => ({
      ...prev,
      content: prompt
    }));
    setShowDialogueInterface(false);
  };
  
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
        description: "Your journal entry has been saved and AI insights are being generated."
      });
      
      // Wait for the AI response to be generated and current entry to be updated
      setTimeout(() => {
        // Force regenerate AI response if it's missing after save
        if (currentEntry.id && !currentEntry.aiResponse) {
          regenerateAIResponse().catch(() => {
            console.log("AI response generation in progress...");
          });
        }
        
        // Clear only the content for the next entry after ensuring save is complete
        setCurrentEntry(prev => ({ 
          ...prev, 
          content: "" 
        }));
        setIsSubmitting(false);
      }, 2000); // Wait 2 seconds to allow AI response to be fully generated
      
    } catch (error) {
      toast({
        title: "Error saving journal",
        description: "There was a problem saving your journal entry. Please try again.",
        variant: "destructive"
      });
      console.error(error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`flex transition-all duration-300 ${isFocusMode ? 'focus-mode-layout' : ''}`}>


      {/* Main Content Area */}
      <div className={`w-full flex flex-col transition-all duration-300 ${isFocusMode ? 'focus-content' : ''}`}>
        <div className={`w-full overflow-y-auto transition-all duration-300 ${isFocusMode ? 'p-0' : 'app-content pb-36'}`} style={{ maxHeight: isFocusMode ? "100vh" : "calc(100vh - 136px)" }}>
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

          {/* Proactive AI Suggestions - Hidden in focus mode */}
          {!isFocusMode && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-6"
            >
              <ProactiveSuggestions onSuggestionSelect={handleSuggestionSelect} />
            </motion.div>
          )}

          {/* Dialogue Interface - Hidden in focus mode */}
          {!isFocusMode && showDialogueInterface && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-6"
            >
              <DialogueInterface onSelect={handleSuggestionSelect} />
            </motion.div>
          )}

          {/* Mindfulness Quick Access - Hidden in focus mode */}
          {!isFocusMode && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-8"
            >
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200/50 dark:border-blue-800/50 hover-lift">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Heart className="h-5 w-5 text-blue-500" />
                    Mindfulness & Wellness
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowBreathingExercise(true)}
                      className="btn-interactive hover-scale text-sm"
                    >
                      <Wind className="h-4 w-4 mr-2" />
                      Breathing Exercise
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowMeditativeReflection(true)}
                      className="btn-interactive hover-scale text-sm"
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      Meditative Reflection
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowDialogueInterface(true)}
                      className="btn-interactive hover-scale text-sm"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Guided Conversation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Daily Inspiration, Writing Prompts, and Mood Tracker - Hidden in focus mode */}
          {!isFocusMode && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-10 section-spacing"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Writing Prompts</CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={refreshPrompts}
                      className="text-muted-foreground hover:text-primary"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {currentPrompts.map((prompt, index) => {
                      const IconComponent = prompt.icon;
                      return (
                        <Button
                          key={index}
                          variant="ghost"
                          className="w-full text-left justify-start text-sm h-auto p-3 hover:bg-muted/50 rounded-lg border border-transparent hover:border-primary/20"
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
                          <div className="flex items-start gap-3 w-full">
                            <IconComponent className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                            <span className="text-left break-words">{prompt.text}</span>
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
                  <CardTitle className="text-lg">How are you feeling today?</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Click a mood to add it to your journal entry
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    {moodOptions.map((mood, index) => (
                      <Button
                        key={index}
                        variant={selectedMood === mood.label ? "default" : "outline"}
                        className={`h-auto p-3 flex flex-col gap-2 hover:bg-muted/50 transition-all ${
                          selectedMood === mood.label ? "ring-2 ring-primary/50" : ""
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
                        <div className="text-2xl">{mood.emoji}</div>
                        <div className="text-xs font-medium">{mood.label}</div>
                      </Button>
                    ))}
                  </div>
                  {selectedMood && (
                    <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Current mood: <span className="font-medium text-foreground">{selectedMood}</span>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
              </div>
            </motion.div>
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

      {/* Mindfulness Modals */}
      <BreathingExercise 
        isOpen={showBreathingExercise} 
        onClose={() => setShowBreathingExercise(false)} 
      />
      <MeditativeReflection 
        isOpen={showMeditativeReflection} 
        onClose={() => setShowMeditativeReflection(false)} 
      />
    </div>
  );
};

export default Home;