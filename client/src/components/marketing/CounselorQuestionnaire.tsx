import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Heart, Brain, Shield, Target, Users, Clock, X, Sparkles } from 'lucide-react';
import { useLocation } from 'wouter';

interface CounselorQuestionnaireProps {
  onClose: () => void;
}

const CounselorQuestionnaire: React.FC<CounselorQuestionnaireProps> = ({ onClose }) => {
  const [, navigate] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  const questions = [
    {
      id: 'support_type',
      title: 'What type of support do you need most?',
      icon: Heart,
      options: [
        { id: 'emotional', label: 'Emotional Support', description: 'Help managing feelings and stress' },
        { id: 'anxiety', label: 'Anxiety Management', description: 'Dealing with worry and anxious thoughts' },
        { id: 'relationships', label: 'Relationship Guidance', description: 'Improving connections with others' },
        { id: 'life_goals', label: 'Life Direction', description: 'Finding purpose and setting goals' }
      ]
    },
    {
      id: 'communication_style',
      title: 'How would you prefer your counselor to communicate?',
      icon: Brain,
      options: [
        { id: 'gentle', label: 'Gentle & Supportive', description: 'Warm, caring, and understanding' },
        { id: 'direct', label: 'Direct & Practical', description: 'Straightforward advice and solutions' },
        { id: 'thoughtful', label: 'Thoughtful & Reflective', description: 'Deep questions to help you discover insights' },
        { id: 'motivational', label: 'Motivational & Energetic', description: 'Encouraging and inspiring' }
      ]
    },
    {
      id: 'session_timing',
      title: 'When do you most need support?',
      icon: Clock,
      options: [
        { id: 'crisis', label: 'During Crisis Moments', description: 'When overwhelming feelings hit' },
        { id: 'daily', label: 'Daily Check-ins', description: 'Regular guidance throughout the day' },
        { id: 'evening', label: 'Evening Reflection', description: 'Processing the day before sleep' },
        { id: 'flexible', label: 'Flexible Availability', description: 'Whenever I need to talk' }
      ]
    },
    {
      id: 'focus_area',
      title: 'What would you like to focus on first?',
      icon: Target,
      options: [
        { id: 'stress', label: 'Stress Reduction', description: 'Learning to manage daily pressures' },
        { id: 'confidence', label: 'Building Confidence', description: 'Developing self-esteem and courage' },
        { id: 'habits', label: 'Healthy Habits', description: 'Creating positive routines' },
        { id: 'mindfulness', label: 'Mindfulness & Peace', description: 'Finding calm and presence' }
      ]
    }
  ];

  const handleAnswerSelect = (answerId: string) => {
    const newAnswers = [...answers];
    newAnswers[currentStep] = answerId;
    setAnswers(newAnswers);

    if (currentStep < questions.length - 1) {
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, 300);
    } else {
      // Generate personalized counselor profile
      setTimeout(() => {
        handleComplete();
      }, 500);
    }
  };

  const handleComplete = () => {
    // Store the "personalized" counselor profile
    const counselorProfile = generateCounselorProfile(answers);
    localStorage.setItem('personalizedCounselor', JSON.stringify(counselorProfile));
    localStorage.setItem('questionnaireAnswers', JSON.stringify(answers));
    
    // Close questionnaire and navigate to account creation
    onClose();
    setTimeout(() => {
      navigate('/auth?tab=register&source=questionnaire');
    }, 200);
  };

  const generateCounselorProfile = (userAnswers: string[]) => {
    const profiles = {
      gentle: {
        name: 'Dr. Sarah Chen',
        specialty: 'Emotional Wellness',
        description: 'Specializes in providing gentle, supportive guidance with a warm, empathetic approach.',
        personality: 'socratic'
      },
      direct: {
        name: 'Dr. Marcus Thompson',
        specialty: 'Solution-Focused Therapy',
        description: 'Known for practical, direct advice that helps you take immediate action.',
        personality: 'analytical'
      },
      thoughtful: {
        name: 'Dr. Elena Rodriguez',
        specialty: 'Depth Psychology',
        description: 'Expert in helping you discover deep insights through thoughtful reflection.',
        personality: 'existentialist'
      },
      motivational: {
        name: 'Dr. James Wilson',
        specialty: 'Positive Psychology',
        description: 'Energetic coach focused on building motivation and inspiring positive change.',
        personality: 'humorous'
      }
    };

    // Use communication style to determine counselor
    const communicationStyle = userAnswers[1] || 'gentle';
    return profiles[communicationStyle as keyof typeof profiles] || profiles.gentle;
  };

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-background rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-4 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-primary to-violet-600 flex items-center justify-center text-white shadow-lg">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl">Find Your Perfect Counselor</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Step {currentStep + 1} of {questions.length} - Creating your personalized match
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-4">
              <motion.div
                className="bg-gradient-to-r from-primary to-violet-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary/20 to-violet-600/20 flex items-center justify-center mx-auto mb-4">
                    <currentQuestion.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">{currentQuestion.title}</h3>
                  <p className="text-muted-foreground">
                    This helps us match you with the perfect counseling approach
                  </p>
                </div>

                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <motion.button
                      key={option.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleAnswerSelect(option.id)}
                      className="w-full p-4 rounded-xl border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 text-left group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                            {option.label}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {option.description}
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default CounselorQuestionnaire;