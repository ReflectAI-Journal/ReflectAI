import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useLocation } from 'wouter';
import { 
  MessageCircle, 
  PenTool, 
  Sparkles, 
  Target, 
  BarChart3, 
  Calendar,
  Heart,
  CheckCircle,
  ArrowRight,
  X
} from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: {
    text: string;
    path: string;
  };
  highlight?: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to ReflectAI!',
    description: 'You now have full access to your AI counselor. Let\'s take a quick tour of what you can do.',
    icon: <Sparkles className="h-6 w-6" />,
  },
  {
    id: 'counselor',
    title: 'Talk to Your AI Counselor',
    description: 'Get 24/7 emotional support and guidance. Your AI counselor is trained to provide thoughtful, personalized responses.',
    icon: <MessageCircle className="h-6 w-6" />,
    action: {
      text: 'Start Counseling',
      path: '/app'
    },
    highlight: 'Main feature - unlimited conversations'
  },
  {
    id: 'journal',
    title: 'Daily Journaling',
    description: 'Write your thoughts and get AI insights. Track your mood and emotional patterns over time.',
    icon: <PenTool className="h-6 w-6" />,
    action: {
      text: 'Start Writing',
      path: '/app/journal'
    },
    highlight: 'Perfect for daily reflection'
  },
  {
    id: 'philosopher',
    title: 'Deep Conversations',
    description: 'Engage in philosophical discussions and explore life\'s big questions with your AI philosopher.',
    icon: <Sparkles className="h-6 w-6" />,
    action: {
      text: 'Explore Philosophy',
      path: '/app/philosopher'
    },
    highlight: 'For deeper thinking sessions'
  },
  {
    id: 'goals',
    title: 'Goal Tracking',
    description: 'Set personal goals and track your progress with AI-powered insights and motivation.',
    icon: <Target className="h-6 w-6" />,
    action: {
      text: 'Set Goals',
      path: '/app/goals'
    },
    highlight: 'Build better habits'
  },
  {
    id: 'checkins',
    title: 'Daily Check-ins',
    description: 'Get personalized wellness questions and follow-up support for ongoing issues.',
    icon: <Heart className="h-6 w-6" />,
    action: {
      text: 'View Check-ins',
      path: '/app/memory-lane'
    },
    highlight: 'Continuous wellness support'
  },
  {
    id: 'analytics',
    title: 'Track Your Progress',
    description: 'View detailed analytics about your emotional patterns, journaling streaks, and personal growth.',
    icon: <BarChart3 className="h-6 w-6" />,
    action: {
      text: 'View Stats',
      path: '/app/stats'
    },
    highlight: 'See your growth over time'
  }
];

interface UserTutorialProps {
  onComplete: () => void;
  onSkip: () => void;
}

const UserTutorial: React.FC<UserTutorialProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [, navigate] = useLocation();

  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;
  const step = tutorialSteps[currentStep];

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleActionClick = () => {
    if (step.action) {
      navigate(step.action.path);
      onComplete();
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-md"
      >
        <Card className="relative">
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-primary/10 text-primary">
                {step.icon}
              </div>
            </div>
            <CardTitle className="text-xl">{step.title}</CardTitle>
            <div className="mt-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground mt-2">
                Step {currentStep + 1} of {tutorialSteps.length}
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              {step.description}
            </p>

            {step.highlight && (
              <div className="text-center">
                <Badge variant="secondary" className="text-xs">
                  {step.highlight}
                </Badge>
              </div>
            )}

            <div className="flex flex-col gap-3 pt-4">
              {step.action && (
                <Button onClick={handleActionClick} className="w-full">
                  {step.action.text}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="flex-1"
                >
                  Previous
                </Button>
                <Button
                  onClick={handleNext}
                  variant={step.action ? "outline" : "default"}
                  className="flex-1"
                >
                  {currentStep === tutorialSteps.length - 1 ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Complete
                    </>
                  ) : (
                    'Next'
                  )}
                </Button>
              </div>

              <Button
                variant="ghost"
                onClick={handleSkip}
                className="w-full text-sm text-muted-foreground"
              >
                Skip Tutorial
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default UserTutorial;