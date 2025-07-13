import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Sparkles, Heart, Brain, Leaf } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MeditativeReflectionProps {
  isOpen: boolean;
  onClose: () => void;
}

const reflectionPrompts = [
  {
    icon: Heart,
    title: "Gratitude Reflection",
    prompt: "Take a moment to think of three things you're grateful for today. Feel the warmth of appreciation in your heart.",
    color: "from-pink-400 to-rose-500"
  },
  {
    icon: Brain,
    title: "Mindful Awareness",
    prompt: "Notice your thoughts without judgment. Observe them like clouds passing in the sky - present, but not permanent.",
    color: "from-blue-400 to-indigo-500"
  },
  {
    icon: Leaf,
    title: "Present Moment",
    prompt: "Focus on your breath. Feel your body in this moment. You are here, you are now, you are enough.",
    color: "from-green-400 to-emerald-500"
  },
  {
    icon: Sparkles,
    title: "Inner Wisdom",
    prompt: "What does your heart need to hear right now? Listen deeply to your inner voice and offer yourself compassion.",
    color: "from-purple-400 to-violet-500"
  }
];

const MeditativeReflection: React.FC<MeditativeReflectionProps> = ({ isOpen, onClose }) => {
  const [currentReflection, setCurrentReflection] = useState(0);
  const [isReflecting, setIsReflecting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(180); // 3 minutes default

  useEffect(() => {
    if (!isOpen) {
      setCurrentReflection(Math.floor(Math.random() * reflectionPrompts.length));
      setTimeRemaining(180);
      setIsReflecting(false);
    }
  }, [isOpen]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isReflecting && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsReflecting(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isReflecting, timeRemaining]);

  const startReflection = () => {
    setIsReflecting(true);
  };

  const stopReflection = () => {
    setIsReflecting(false);
  };

  const nextReflection = () => {
    setCurrentReflection((prev) => (prev + 1) % reflectionPrompts.length);
    setTimeRemaining(180);
    setIsReflecting(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  const reflection = reflectionPrompts[currentReflection];

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-card rounded-2xl shadow-2xl p-8 max-w-lg w-full mx-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-foreground">Meditative Reflection</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="hover-scale">
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="text-center mb-8">
            <motion.div
              className={`w-20 h-20 rounded-full bg-gradient-to-br ${reflection.color} mx-auto mb-6 flex items-center justify-center`}
              animate={{ 
                scale: isReflecting ? [1, 1.1, 1] : 1,
                rotate: isReflecting ? [0, 360] : 0 
              }}
              transition={{ 
                duration: 4, 
                repeat: isReflecting ? Infinity : 0,
                ease: "easeInOut"
              }}
            >
              <reflection.icon className="h-10 w-10 text-white" />
            </motion.div>

            <h3 className="text-xl font-semibold mb-4 text-foreground">
              {reflection.title}
            </h3>

            <Card className="bg-muted/30 mb-6">
              <CardContent className="p-6">
                <p className="text-foreground leading-relaxed">
                  {reflection.prompt}
                </p>
              </CardContent>
            </Card>

            {isReflecting && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <div className="text-3xl font-mono font-bold text-primary mb-2">
                  {formatTime(timeRemaining)}
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-primary to-violet-500 h-2 rounded-full"
                    initial={{ width: "100%" }}
                    animate={{ width: `${(timeRemaining / 180) * 100}%` }}
                    transition={{ duration: 1, ease: "linear" }}
                  />
                </div>
              </motion.div>
            )}

            <div className="flex justify-center gap-3 mb-6">
              {!isReflecting ? (
                <Button 
                  onClick={startReflection}
                  className="btn-interactive hover-scale"
                  size="lg"
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  Begin Reflection
                </Button>
              ) : (
                <Button 
                  onClick={stopReflection}
                  className="btn-interactive hover-scale"
                  variant="outline"
                  size="lg"
                >
                  Complete
                </Button>
              )}
              
              <Button 
                onClick={nextReflection}
                className="btn-interactive hover-scale"
                variant="outline"
                size="lg"
              >
                Next Prompt
              </Button>
            </div>
          </div>

          <Card className="bg-gradient-to-r from-primary/5 to-violet-500/5 border-primary/20">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-2 text-foreground">Reflection Tips:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Find a comfortable, quiet space</li>
                <li>• Close your eyes or soften your gaze</li>
                <li>• Breathe naturally and deeply</li>
                <li>• Let thoughts come and go without attachment</li>
                <li>• Be gentle and patient with yourself</li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MeditativeReflection;