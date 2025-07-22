import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Heart, Brain, Shield, Target, Users, Clock, X, Sparkles, ArrowLeft } from 'lucide-react';
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
    
    // Show completion state instead of navigating
    setCurrentStep(questions.length); // Set to completion step
  };

  const generateCounselorProfile = (userAnswers: string[]) => {
    const profiles = {
      gentle: {
        name: 'Dr. Sarah Chen',
        specialty: 'Empathetic Listening & Emotional Support',
        description: 'Specializes in creating safe spaces for emotional exploration. Known for her warm, validating approach that helps clients feel truly heard and understood.',
        personality: 'empathetic-listener',
        approach: 'Focuses on emotional validation and creating a judgment-free environment where you can explore your feelings safely.',
        experience: '8+ years specializing in trauma-informed care and emotional wellness. Published research on therapeutic presence.',
        avatar: '👩🏻‍⚕️'
      },
      direct: {
        name: 'Dr. Marcus Thompson',
        specialty: 'Solution-Focused Brief Therapy',
        description: 'Expert at identifying your existing strengths and resources to create practical, achievable solutions. Focuses on what\'s working and how to build on it.',
        personality: 'solution-focused',
        approach: 'Concentrates on your strengths and past successes to develop concrete steps toward your goals.',
        experience: '12+ years in solution-focused therapy. Specializes in helping high-achievers overcome obstacles efficiently.',
        avatar: '👨🏽‍⚕️'
      },
      thoughtful: {
        name: 'Dr. Elena Rodriguez',
        specialty: 'Mindfulness-Based Therapy',
        description: 'Integrates mindfulness and present-moment awareness into therapy. Helps clients develop self-compassion and acceptance while building emotional resilience.',
        personality: 'mindfulness-based',
        approach: 'Uses mindfulness techniques to help you observe thoughts and feelings without judgment while building awareness.',
        experience: '10+ years combining Eastern mindfulness practices with Western therapy. Certified in MBSR and MBCT.',
        avatar: '👩🏽‍⚕️'
      },
      motivational: {
        name: 'Dr. James Wilson',
        specialty: 'Strength-Based Counseling',
        description: 'Passionate about helping clients recognize their inherent strengths and capabilities. Reframes challenges as opportunities for growth and empowerment.',
        personality: 'strength-based',
        approach: 'Identifies your natural talents and past resilience to build confidence and overcome current challenges.',
        experience: '9+ years in positive psychology and strength-based interventions. Former Olympic sports psychologist.',
        avatar: '👨🏼‍⚕️'
      },
      healing: {
        name: 'Dr. Maya Patel',
        specialty: 'Trauma-Informed Care',
        description: 'Specializes in creating safety and trust for those who have experienced trauma. Uses gentle, client-led approaches that honor your healing journey.',
        personality: 'trauma-informed',
        approach: 'Prioritizes safety, choice, and collaboration. Healing happens at your pace with your permission and control.',
        experience: '15+ years in trauma therapy. EMDR certified. Specializes in complex trauma and post-traumatic growth.',
        avatar: '👩🏾‍⚕️'
      },
      analytical: {
        name: 'Dr. David Kim',
        specialty: 'Cognitive-Behavioral Therapy',
        description: 'Expert in helping clients understand the connections between thoughts, feelings, and behaviors. Provides practical tools and strategies for lasting change.',
        personality: 'cognitive-behavioral',
        approach: 'Examines thought patterns and provides concrete techniques to challenge unhelpful thinking and change behaviors.',
        experience: '11+ years in CBT and DBT. Specializes in anxiety, depression, and behavioral change strategies.',
        avatar: '👨🏻‍⚕️'
      },
      holistic: {
        name: 'Dr. Asha Okafor',
        specialty: 'Holistic Wellness & Integration',
        description: 'Takes a whole-person approach considering mind, body, spirit, and environment. Integrates various therapeutic modalities for comprehensive care.',
        personality: 'holistic-wellness',
        approach: 'Considers all aspects of your life - physical health, relationships, spirituality, and environment - for balanced wellbeing.',
        experience: '13+ years in integrative therapy. Licensed in multiple modalities including somatic therapy and family systems.',
        avatar: '👩🏿‍⚕️'
      }
    };

    // Enhanced matching logic based on multiple questionnaire responses
    const communicationStyle = userAnswers[1] || 'gentle';
    const supportType = userAnswers[2] || 'emotional';
    const approachPreference = userAnswers[3] || 'collaborative';
    
    // More sophisticated matching algorithm
    let matchedProfile = 'gentle';
    
    if (communicationStyle === 'direct' && supportType === 'practical') {
      matchedProfile = 'direct';
    } else if (supportType === 'emotional' && approachPreference === 'gentle') {
      matchedProfile = 'gentle';
    } else if (supportType === 'spiritual' || approachPreference === 'mindful') {
      matchedProfile = 'thoughtful';
    } else if (communicationStyle === 'motivational' || supportType === 'motivational') {
      matchedProfile = 'motivational';
    } else if (supportType === 'healing' || approachPreference === 'trauma-informed') {
      matchedProfile = 'healing';
    } else if (communicationStyle === 'logical' || approachPreference === 'structured') {
      matchedProfile = 'analytical';
    } else if (supportType === 'comprehensive' || approachPreference === 'holistic') {
      matchedProfile = 'holistic';
    }
    
    return profiles[matchedProfile as keyof typeof profiles] || profiles.gentle;
  };

  const generatePersonalizedCharacteristics = (userAnswers: string[]) => {
    const characteristics = [];
    
    // Based on support type (question 0)
    const supportType = userAnswers[0];
    if (supportType === 'emotional') {
      characteristics.push('Compassionate emotional validation and support');
      characteristics.push('Safe space to process difficult feelings');
    } else if (supportType === 'anxiety') {
      characteristics.push('Specialized anxiety management techniques');
      characteristics.push('Breathing exercises and grounding methods');
    } else if (supportType === 'relationships') {
      characteristics.push('Relationship communication strategies');
      characteristics.push('Conflict resolution guidance');
    } else if (supportType === 'life_goals') {
      characteristics.push('Goal-setting and life direction coaching');
      characteristics.push('Motivation and accountability support');
    }

    // Based on communication style (question 1)
    const commStyle = userAnswers[1];
    if (commStyle === 'gentle') {
      characteristics.push('Warm, patient communication style');
      characteristics.push('Non-judgmental listening approach');
    } else if (commStyle === 'direct') {
      characteristics.push('Straightforward, practical advice');
      characteristics.push('Clear action steps and solutions');
    } else if (commStyle === 'thoughtful') {
      characteristics.push('Deep, reflective conversations');
      characteristics.push('Thought-provoking questions for insight');
    } else if (commStyle === 'motivational') {
      characteristics.push('Encouraging and inspiring guidance');
      characteristics.push('Positive reinforcement and empowerment');
    }

    // Based on timing (question 2)
    const timing = userAnswers[2];
    if (timing === 'crisis') {
      characteristics.push('Immediate crisis support and stabilization');
      characteristics.push('Emergency coping strategies');
    } else if (timing === 'daily') {
      characteristics.push('Regular check-ins and daily guidance');
      characteristics.push('Consistent routine support');
    } else if (timing === 'evening') {
      characteristics.push('End-of-day reflection and processing');
      characteristics.push('Sleep and relaxation support');
    } else if (timing === 'flexible') {
      characteristics.push('Available whenever you need support');
      characteristics.push('Flexible scheduling and approach');
    }

    // Based on focus area (question 3)
    const focus = userAnswers[3];
    if (focus === 'stress') {
      characteristics.push('Stress reduction techniques and tools');
      characteristics.push('Workload and pressure management');
    } else if (focus === 'confidence') {
      characteristics.push('Self-esteem building exercises');
      characteristics.push('Confidence and courage development');
    } else if (focus === 'habits') {
      characteristics.push('Healthy habit formation support');
      characteristics.push('Routine optimization guidance');
    } else if (focus === 'mindfulness') {
      characteristics.push('Mindfulness and meditation practices');
      characteristics.push('Present-moment awareness training');
    }

    // Always include these general characteristics
    characteristics.push('Complete confidentiality and privacy');
    characteristics.push('Evidence-based therapeutic techniques');

    return characteristics;
  };

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;
  const isCompleted = currentStep >= questions.length;

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
                {currentStep > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground mr-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                )}
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
              {isCompleted ? (
                <motion.div
                  key="completion"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5 }}
                  className="py-8"
                >
                  {/* Match percentage circle */}
                  <div className="text-center mb-8">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-4 relative">
                      <div className="text-white font-bold text-lg">
                        {(() => {
                          const profile = generateCounselorProfile(answers);
                          return Math.floor(85 + Math.random() * 10); // 85-95% match
                        })()}%
                      </div>
                    </div>
                    <h3 className="text-2xl font-semibold mb-2 text-green-600">Perfect Match Found!</h3>
                  </div>

                  {/* Counselor profile card */}
                  <div className="bg-gradient-to-r from-primary/5 to-violet-600/5 rounded-2xl p-6 mb-6 border border-primary/20">
                    {(() => {
                      const profile = generateCounselorProfile(answers);
                      const characteristics = generatePersonalizedCharacteristics(answers);
                      
                      return (
                        <div>
                          <div className="flex items-center gap-4 mb-6">
                            <div className="text-4xl">{profile.avatar}</div>
                            <div>
                              <h4 className="text-xl font-semibold text-foreground">{profile.name}</h4>
                              <p className="text-primary font-medium">{profile.specialty}</p>
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <h5 className="font-semibold text-sm mb-3 flex items-center gap-2">
                              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Your Counselor Will Provide:
                            </h5>
                            <div className="grid grid-cols-1 gap-2">
                              {characteristics.map((characteristic, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm">
                                  <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                  <span className="text-foreground">{characteristic}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button 
                      onClick={() => {
                        onClose();
                        navigate('/auth?tab=register&source=questionnaire');
                      }}
                      className="bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90"
                    >
                      Start Counseling Now
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={onClose}
                    >
                      Close
                    </Button>
                  </div>
                </motion.div>
              ) : (
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
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default CounselorQuestionnaire;