import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Pause, RotateCcw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BreathingExerciseProps {
  isOpen: boolean;
  onClose: () => void;
}

const BreathingExercise: React.FC<BreathingExerciseProps> = ({ isOpen, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'rest'>('inhale');
  const [count, setCount] = useState(0);
  const [cycles, setCycles] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 4-7-8 breathing pattern (4 seconds inhale, 7 seconds hold, 8 seconds exhale)
  const breathingPattern = {
    inhale: 4000,
    hold: 7000,
    exhale: 8000,
    rest: 1000
  };

  const totalCycleTime = Object.values(breathingPattern).reduce((a, b) => a + b, 0);

  useEffect(() => {
    if (isPlaying) {
      const startCycle = () => {
        // Inhale phase
        setPhase('inhale');
        setTimeout(() => {
          setPhase('hold');
          setTimeout(() => {
            setPhase('exhale');
            setTimeout(() => {
              setPhase('rest');
              setTimeout(() => {
                setCycles(prev => prev + 1);
                startCycle(); // Start next cycle
              }, breathingPattern.rest);
            }, breathingPattern.exhale);
          }, breathingPattern.hold);
        }, breathingPattern.inhale);
      };

      startCycle();
    }

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [isPlaying]);

  const handleStart = () => {
    setIsPlaying(true);
    setCycles(0);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setPhase('inhale');
    setCycles(0);
    setCount(0);
  };

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale':
        return 'Breathe In';
      case 'hold':
        return 'Hold';
      case 'exhale':
        return 'Breathe Out';
      case 'rest':
        return 'Rest';
      default:
        return 'Ready';
    }
  };

  const getPhaseColor = () => {
    switch (phase) {
      case 'inhale':
        return 'from-blue-400 to-cyan-500';
      case 'hold':
        return 'from-indigo-400 to-purple-500';
      case 'exhale':
        return 'from-purple-400 to-pink-500';
      case 'rest':
        return 'from-green-400 to-emerald-500';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  if (!isOpen) return null;

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
          className="bg-card rounded-2xl shadow-2xl p-8 max-w-md w-full mx-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-foreground">Breathing Exercise</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="hover-scale">
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="text-center mb-8">
            <div className="relative mx-auto mb-6">
              <motion.div
                className={`w-32 h-32 rounded-full bg-gradient-to-br ${getPhaseColor()} mx-auto flex items-center justify-center text-white font-semibold text-lg shadow-lg`}
                animate={{
                  scale: phase === 'inhale' ? 1.2 : phase === 'exhale' ? 0.8 : 1,
                }}
                transition={{
                  duration: phase === 'inhale' ? 4 : phase === 'exhale' ? 8 : phase === 'hold' ? 0 : 1,
                  ease: "easeInOut"
                }}
              >
                {getPhaseText()}
              </motion.div>
            </div>

            <div className="space-y-2 mb-6">
              <p className="text-lg font-medium text-foreground">
                {getPhaseText()}
              </p>
              <p className="text-sm text-muted-foreground">
                4-7-8 Breathing Pattern
              </p>
              <p className="text-sm text-muted-foreground">
                Cycles completed: {cycles}
              </p>
            </div>

            <div className="flex justify-center gap-3">
              {!isPlaying ? (
                <Button 
                  onClick={handleStart}
                  className="btn-interactive hover-scale"
                  size="lg"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Start
                </Button>
              ) : (
                <Button 
                  onClick={handlePause}
                  className="btn-interactive hover-scale"
                  variant="outline"
                  size="lg"
                >
                  <Pause className="h-5 w-5 mr-2" />
                  Pause
                </Button>
              )}
              
              <Button 
                onClick={handleReset}
                className="btn-interactive hover-scale"
                variant="outline"
                size="lg"
              >
                <RotateCcw className="h-5 w-5 mr-2" />
                Reset
              </Button>
            </div>
          </div>

          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">4-7-8 Breathing Benefits:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Reduces anxiety and stress</li>
                <li>• Improves focus and concentration</li>
                <li>• Helps with better sleep</li>
                <li>• Promotes relaxation</li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BreathingExercise;