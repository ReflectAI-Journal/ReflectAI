import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, MessageCircle, Heart, Brain, Target, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';

interface Suggestion {
  id: string;
  type: 'mood_followup' | 'conversation_theme' | 'goal_reminder' | 'wellness_check';
  title: string;
  description: string;
  prompt: string;
  icon: typeof Lightbulb;
  priority: 'low' | 'medium' | 'high';
  color: string;
}

interface ProactiveSuggestionsProps {
  onSuggestionSelect: (prompt: string) => void;
  className?: string;
}

const ProactiveSuggestions: React.FC<ProactiveSuggestionsProps> = ({ 
  onSuggestionSelect, 
  className = '' 
}) => {
  const [dismissedSuggestions, setDismissedSuggestions] = useState<string[]>([]);
  const [currentSuggestion, setCurrentSuggestion] = useState<Suggestion | null>(null);

  // Fetch user patterns and generate suggestions
  const { data: userStats } = useQuery({
    queryKey: ['/api/stats'],
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  // Generate contextual suggestions based on user patterns
  const generateSuggestions = (): Suggestion[] => {
    const suggestions: Suggestion[] = [];
    const now = new Date();
    const hour = now.getHours();

    // Time-based suggestions
    if (hour >= 6 && hour < 12) {
      suggestions.push({
        id: 'morning_intention',
        type: 'wellness_check',
        title: 'Set Morning Intention',
        description: 'Start your day with clarity and purpose',
        prompt: "Good morning! Let's set a positive intention for your day. What would you like to focus on or accomplish today? How are you feeling as you begin this new day?",
        icon: Brain,
        priority: 'medium',
        color: 'from-amber-400 to-orange-500'
      });
    }

    if (hour >= 12 && hour < 17) {
      suggestions.push({
        id: 'midday_checkin',
        type: 'mood_followup',
        title: 'Midday Check-in',
        description: 'How is your energy and mood?',
        prompt: "How has your day been going so far? What's your energy level like right now? Is there anything on your mind that you'd like to explore or discuss?",
        icon: Heart,
        priority: 'medium',
        color: 'from-blue-400 to-cyan-500'
      });
    }

    if (hour >= 17 && hour < 22) {
      suggestions.push({
        id: 'evening_reflection',
        type: 'conversation_theme',
        title: 'Evening Reflection',
        description: 'Process today\'s experiences',
        prompt: "As the day winds down, let's reflect on your experiences. What went well today? What challenged you? How are you feeling about tomorrow?",
        icon: Sparkles,
        priority: 'high',
        color: 'from-purple-400 to-violet-500'
      });
    }

    // Pattern-based suggestions
    if (userStats?.currentStreak > 0 && userStats.currentStreak % 7 === 0) {
      suggestions.push({
        id: 'streak_celebration',
        type: 'mood_followup',
        title: 'Celebrate Your Streak!',
        description: `You've maintained a ${userStats.currentStreak}-day journaling streak`,
        prompt: `Congratulations on your ${userStats.currentStreak}-day journaling streak! This is a wonderful achievement. How does it feel to maintain this consistent practice? What have you learned about yourself through this journey?`,
        icon: Target,
        priority: 'high',
        color: 'from-green-400 to-emerald-500'
      });
    }

    // Mood-based suggestions (simulated based on recent patterns)
    const recentMoodSuggestions = [
      {
        id: 'stress_support',
        type: 'wellness_check' as const,
        title: 'Stress Management',
        description: 'Let\'s work through any stress you might be feeling',
        prompt: "I've noticed stress can build up throughout the week. How are you managing stress lately? What techniques have been helpful, and what new strategies might we explore together?",
        icon: Heart,
        priority: 'high' as const,
        color: 'from-pink-400 to-rose-500'
      },
      {
        id: 'productivity_reflection',
        type: 'conversation_theme' as const,
        title: 'Productivity & Balance',
        description: 'Explore your work-life balance',
        prompt: "How has your productivity been lately? Are you finding a good balance between work, rest, and personal fulfillment? What adjustments might help you feel more balanced?",
        icon: Brain,
        priority: 'medium' as const,
        color: 'from-indigo-400 to-purple-500'
      }
    ];

    suggestions.push(...recentMoodSuggestions);

    return suggestions.filter(s => !dismissedSuggestions.includes(s.id));
  };

  useEffect(() => {
    const suggestions = generateSuggestions();
    if (suggestions.length > 0 && !currentSuggestion) {
      // Show highest priority suggestion first
      const highPriority = suggestions.find(s => s.priority === 'high');
      const mediumPriority = suggestions.find(s => s.priority === 'medium');
      setCurrentSuggestion(highPriority || mediumPriority || suggestions[0]);
    }
  }, [userStats, dismissedSuggestions]);

  const handleDismiss = (suggestionId: string) => {
    setDismissedSuggestions(prev => [...prev, suggestionId]);
    setCurrentSuggestion(null);
    
    // Show next suggestion after a delay
    setTimeout(() => {
      const suggestions = generateSuggestions();
      if (suggestions.length > 0) {
        setCurrentSuggestion(suggestions[0]);
      }
    }, 5000);
  };

  const handleSelect = (suggestion: Suggestion) => {
    onSuggestionSelect(suggestion.prompt);
    handleDismiss(suggestion.id);
  };

  if (!currentSuggestion) return null;

  return (
    <div className={className}>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="suggestion-bubble"
        >
          <Card className="border-primary/20 shadow-lg hover-lift">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${currentSuggestion.color} flex items-center justify-center flex-shrink-0`}>
                  <currentSuggestion.icon className="h-5 w-5 text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-sm text-foreground">
                      {currentSuggestion.title}
                    </h4>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDismiss(currentSuggestion.id)}
                      className="h-6 w-6 hover-scale flex-shrink-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                    {currentSuggestion.description}
                  </p>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleSelect(currentSuggestion)}
                      className="btn-interactive text-xs h-7 px-3"
                    >
                      <MessageCircle className="h-3 w-3 mr-1" />
                      Explore This
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDismiss(currentSuggestion.id)}
                      className="text-xs h-7 px-3"
                    >
                      Maybe Later
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ProactiveSuggestions;