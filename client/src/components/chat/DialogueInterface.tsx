import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, MessageCircle, Heart, Brain, Target, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DialogueOption {
  id: string;
  text: string;
  icon?: typeof MessageCircle;
  color?: string;
  followUp?: DialogueOption[];
}

interface DialogueInterfaceProps {
  onSelect: (prompt: string) => void;
  className?: string;
}

const DialogueInterface: React.FC<DialogueInterfaceProps> = ({ onSelect, className = '' }) => {
  const [currentOptions, setCurrentOptions] = useState<DialogueOption[]>([]);
  const [conversationPath, setConversationPath] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // Main dialogue tree
  const dialogueTree: DialogueOption[] = [
    {
      id: 'emotional_support',
      text: "I'm feeling overwhelmed and could use some emotional support",
      icon: Heart,
      color: 'from-pink-400 to-rose-500',
      followUp: [
        {
          id: 'stress_work',
          text: "It's mainly work-related stress that's getting to me",
          followUp: [
            {
              id: 'work_boundaries',
              text: "I struggle with setting boundaries at work",
            },
            {
              id: 'work_pressure',
              text: "The pressure and deadlines feel overwhelming",
            }
          ]
        },
        {
          id: 'stress_personal',
          text: "Personal relationships are causing me stress",
          followUp: [
            {
              id: 'family_tension',
              text: "There's tension in my family relationships",
            },
            {
              id: 'friendship_issues',
              text: "I'm having difficulties with friends",
            }
          ]
        },
        {
          id: 'general_anxiety',
          text: "I just feel anxious and don't know why",
        }
      ]
    },
    {
      id: 'personal_growth',
      text: "I want to work on personal development and growth",
      icon: Brain,
      color: 'from-blue-400 to-indigo-500',
      followUp: [
        {
          id: 'self_awareness',
          text: "I want to understand myself better",
          followUp: [
            {
              id: 'personality_explore',
              text: "Help me explore my personality and traits",
            },
            {
              id: 'values_clarify',
              text: "I want to clarify my core values and beliefs",
            }
          ]
        },
        {
          id: 'habits_building',
          text: "I want to build better habits and routines",
          followUp: [
            {
              id: 'morning_routine',
              text: "Help me create a morning routine",
            },
            {
              id: 'productivity_habits',
              text: "I want to develop better productivity habits",
            }
          ]
        }
      ]
    },
    {
      id: 'goal_setting',
      text: "I need help setting and achieving my goals",
      icon: Target,
      color: 'from-green-400 to-emerald-500',
      followUp: [
        {
          id: 'career_goals',
          text: "I want to focus on career and professional goals",
          followUp: [
            {
              id: 'career_change',
              text: "I'm considering a career change",
            },
            {
              id: 'skill_development',
              text: "I want to develop new professional skills",
            }
          ]
        },
        {
          id: 'personal_goals',
          text: "I have personal life goals I want to achieve",
          followUp: [
            {
              id: 'health_fitness',
              text: "My goals are related to health and fitness",
            },
            {
              id: 'relationships_goals',
              text: "I want to improve my relationships",
            }
          ]
        }
      ]
    },
    {
      id: 'daily_reflection',
      text: "I just want to reflect on my day and thoughts",
      icon: Lightbulb,
      color: 'from-purple-400 to-violet-500',
      followUp: [
        {
          id: 'day_review',
          text: "Let me tell you about my day",
        },
        {
          id: 'gratitude_practice',
          text: "I want to practice gratitude",
        },
        {
          id: 'mind_dump',
          text: "I need to clear my mind of scattered thoughts",
        }
      ]
    }
  ];

  const initializeDialogue = () => {
    setCurrentOptions(dialogueTree);
    setIsExpanded(true);
  };

  const handleOptionSelect = (option: DialogueOption) => {
    const newPath = [...conversationPath, option.text];
    setConversationPath(newPath);

    if (option.followUp && option.followUp.length > 0) {
      setCurrentOptions(option.followUp);
    } else {
      // Generate prompt from conversation path
      const prompt = `I'd like to discuss: ${newPath.join(' → ')}. Can you help me explore this topic and provide guidance?`;
      onSelect(prompt);
      resetDialogue();
    }
  };

  const resetDialogue = () => {
    setCurrentOptions([]);
    setConversationPath([]);
    setIsExpanded(false);
  };

  const goBack = () => {
    if (conversationPath.length === 1) {
      setCurrentOptions(dialogueTree);
      setConversationPath([]);
    } else {
      // Navigate back in the tree (simplified - in real implementation you'd maintain the tree path)
      setConversationPath(prev => prev.slice(0, -1));
    }
  };

  if (!isExpanded) {
    return (
      <div className={className}>
        <Card className="dialogue-box hover-lift cursor-pointer" onClick={initializeDialogue}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">What's on your mind?</h4>
                  <p className="text-sm text-muted-foreground">Choose a topic to explore together</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={className}>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Card className="dialogue-box">
            <CardContent className="p-4">
              {conversationPath.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <span>Path:</span>
                    {conversationPath.map((step, index) => (
                      <span key={index}>
                        {index > 0 && <ChevronRight className="h-3 w-3 mx-1" />}
                        {step}
                      </span>
                    ))}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={goBack}
                    className="text-xs h-7"
                  >
                    ← Back
                  </Button>
                </div>
              )}

              <h4 className="font-semibold mb-3 text-foreground">
                {conversationPath.length === 0 ? "What would you like to explore?" : "Tell me more..."}
              </h4>

              <div className="space-y-2">
                {currentOptions.map((option, index) => (
                  <motion.div
                    key={option.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div
                      className="dialogue-option p-3 rounded-xl border border-border/30 bg-muted/30 cursor-pointer hover:bg-primary/10 hover:border-primary/30 click-scale"
                      onClick={() => handleOptionSelect(option)}
                    >
                      <div className="flex items-center gap-3">
                        {option.icon && (
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${option.color || 'from-gray-400 to-gray-500'} flex items-center justify-center flex-shrink-0`}>
                            <option.icon className="h-4 w-4 text-white" />
                          </div>
                        )}
                        <span className="text-sm text-foreground flex-1">{option.text}</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex justify-between items-center mt-4 pt-3 border-t border-border/30">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={resetDialogue}
                  className="text-xs"
                >
                  Close
                </Button>
                <p className="text-xs text-muted-foreground">
                  Or type your own message below
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default DialogueInterface;