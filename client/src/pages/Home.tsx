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
          {/* Minimalist Journal Header - Hidden in focus mode */}
          {!isFocusMode && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="space-y-1">
                  <h1 className="text-2xl font-light tracking-wide text-foreground/90">
                    Today
                  </h1>
                  <div className="h-px w-12 bg-gradient-to-r from-primary/40 to-transparent"></div>
                </div>
                <div className="text-right space-y-1">
                  <div className="text-sm text-muted-foreground/70 font-mono">
                    {format(new Date(), "MMM dd")}
                  </div>
                  <div className="text-xs text-muted-foreground/50 font-mono">
                    {format(new Date(), "yyyy")}
                  </div>
                </div>
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
          
          {/* Minimal Action Bar */}
          {!isFocusMode && currentEntry.content && (
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  disabled={isSubmitting}
                  variant="outline"
                  size="sm"
                  className="h-8 px-4 text-xs rounded-full border-border/40 hover:border-border/60"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                      Saving
                    </>
                  ) : (
                    'Save'
                  )}
                </Button>
                
                <Button
                  onClick={() => setIsFocusMode(true)}
                  variant="ghost"
                  size="sm"
                  className="h-8 px-4 text-xs rounded-full"
                >
                  Focus
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground/50 font-mono">
                {currentEntry.content?.length || 0} characters
              </div>
            </div>
          )}

          {/* AI Response - Hidden in focus mode */}
          {!isFocusMode && currentEntry.aiResponse && (
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-px flex-1 bg-border/30"></div>
                <span className="text-xs text-muted-foreground/60 font-mono">AI reflection</span>
                <div className="h-px flex-1 bg-border/30"></div>
              </div>
              <div className="text-sm leading-relaxed text-muted-foreground/80 font-light">
                {currentEntry.aiResponse}
              </div>
              <Button
                onClick={() => {
                  if (currentEntry.content) {
                    setIsSubmitting(true);
                    regenerateAIResponse()
                      .then(() => setIsSubmitting(false))
                      .catch(() => setIsSubmitting(false));
                  }
                }}
                variant="ghost"
                size="sm"
                className="h-8 px-4 text-xs rounded-full mt-3 text-muted-foreground/60 hover:text-foreground"
              >
                Regenerate
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;