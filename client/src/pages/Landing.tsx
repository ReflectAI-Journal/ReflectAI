import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Heart, User, Target, Clock, Shield, ArrowRight, ArrowLeft } from 'lucide-react';
import logo from '@/assets/logo/reflectai-transparent.svg';

interface QuestionnaireData {
  age: string;
  gender: string;
  previousTherapy: string;
  currentChallenges: string[];
  communicationStyle: string;
  primaryGoal: string;
  counselorStyle: string;
}

const initialData: QuestionnaireData = {
  age: '',
  gender: '',
  previousTherapy: '',
  currentChallenges: [],
  communicationStyle: '',
  primaryGoal: '',
  counselorStyle: ''
};

const Landing = () => {
  const [, navigate] = useLocation();
  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState<QuestionnaireData>(initialData);

  const handleCheckboxChange = (field: keyof QuestionnaireData, value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...(prev[field] as string[]), value]
        : (prev[field] as string[]).filter(item => item !== value)
    }));
  };

  const handleInputChange = (field: keyof QuestionnaireData, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    console.log('Questionnaire data:', formData);
    // Store the questionnaire data
    localStorage.setItem('counselorQuestionnaire', JSON.stringify(formData));
    // Navigate to registration/auth
    navigate('/auth?tab=register');
  };

  const nextSection = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const sections = [
    // Section 1: Age Range
    {
      title: "What's your age range?",
      icon: <User className="w-6 h-6" />,
      content: (
        <div className="space-y-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 text-blue-300">What's your age range?</h2>
            <p className="text-blue-200 text-lg">
              This helps us match you with the right counseling approach
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { value: '18-25', label: '18-25' },
              { value: '26-35', label: '26-35' },
              { value: '36-45', label: '36-45' },
              { value: '46-55', label: '46-55' },
              { value: '56-65', label: '56-65' },
              { value: '65+', label: '65+' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleInputChange('age', option.value)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 text-left font-medium ${
                  formData.age === option.value
                    ? 'border-blue-500 bg-blue-600/20 text-blue-200'
                    : 'border-blue-700/50 bg-slate-800/50 text-blue-300 hover:border-blue-500/50 hover:bg-slate-700/50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )
    },

    // Section 2: Gender Identity
    {
      title: "How do you identify?",
      icon: <User className="w-6 h-6" />,
      content: (
        <div className="space-y-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 text-blue-300">How do you identify?</h2>
            <p className="text-blue-200 text-lg">
              We want to ensure you feel comfortable and understood
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { value: 'female', label: 'Female' },
              { value: 'male', label: 'Male' },
              { value: 'non-binary', label: 'Non-binary' },
              { value: 'prefer-not-to-say', label: 'Prefer not to say' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleInputChange('gender', option.value)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 text-left font-medium ${
                  formData.gender === option.value
                    ? 'border-blue-500 bg-blue-600/20 text-blue-200'
                    : 'border-blue-700/50 bg-slate-800/50 text-blue-300 hover:border-blue-500/50 hover:bg-slate-700/50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )
    },

    // Section 3: Previous Therapy Experience
    {
      title: "Have you tried therapy before?",
      icon: <Brain className="w-6 h-6" />,
      content: (
        <div className="space-y-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 text-blue-300">Have you tried therapy or counseling before?</h2>
            <p className="text-blue-200 text-lg">
              Your experience helps us understand your comfort level
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {[
              { value: 'never', label: 'Never tried therapy', desc: 'This would be my first experience' },
              { value: 'past', label: 'Yes, in the past', desc: 'I have previous experience with therapy' },
              { value: 'current', label: 'Currently in therapy', desc: 'I am actively working with a therapist' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleInputChange('previousTherapy', option.value)}
                className={`p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                  formData.previousTherapy === option.value
                    ? 'border-blue-500 bg-blue-600/20 text-blue-200'
                    : 'border-blue-700/50 bg-slate-800/50 text-blue-300 hover:border-blue-500/50 hover:bg-slate-700/50'
                }`}
              >
                <div className="font-semibold text-lg mb-2">{option.label}</div>
                <div className="text-sm opacity-80">{option.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )
    },
    
    // Section 4: Current Challenges
    {
      title: "What challenges are you facing?",
      icon: <Heart className="w-6 h-6" />,
      content: (
        <div className="space-y-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 text-blue-300">What challenges are you currently facing?</h2>
            <p className="text-blue-200 text-lg">
              Select all that apply - understanding your challenges helps us provide better support
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              'Anxiety', 'Depression', 'Stress', 'Relationships', 
              'Work/Career', 'Self-esteem', 'Grief/Loss', 'Trauma',
              'Sleep issues', 'Anger management', 'Life transitions', 'Other'
            ].map((challenge) => (
              <button
                key={challenge}
                onClick={() => {
                  const challenges = formData.currentChallenges.includes(challenge)
                    ? formData.currentChallenges.filter(c => c !== challenge)
                    : [...formData.currentChallenges, challenge];
                  handleInputChange('currentChallenges', challenges);
                }}
                className={`p-4 rounded-xl border-2 transition-all duration-200 text-left font-medium ${
                  formData.currentChallenges.includes(challenge)
                    ? 'border-blue-500 bg-blue-600/20 text-blue-200'
                    : 'border-blue-700/50 bg-slate-800/50 text-blue-300 hover:border-blue-500/50 hover:bg-slate-700/50'
                }`}
              >
                {challenge}
              </button>
            ))}
          </div>
        </div>
      )
    },
    
    // Section 5: Communication Style
    {
      title: "How do you prefer to communicate?",
      icon: <Target className="w-6 h-6" />,
      content: (
        <div className="space-y-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 text-blue-300">How do you prefer to communicate?</h2>
            <p className="text-blue-200 text-lg">
              Choose the style that feels most comfortable for you
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {[
              { value: 'direct', label: 'Direct and straightforward', desc: 'I like clear, honest feedback and practical advice' },
              { value: 'gentle', label: 'Gentle and supportive', desc: 'I prefer a soft, nurturing approach with encouragement' },
              { value: 'analytical', label: 'Analytical and logical', desc: 'I like to understand the reasoning behind suggestions' },
              { value: 'creative', label: 'Creative and exploratory', desc: 'I enjoy metaphors, storytelling, and creative exercises' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleInputChange('communicationStyle', option.value)}
                className={`p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                  formData.communicationStyle === option.value
                    ? 'border-blue-500 bg-blue-600/20 text-blue-200'
                    : 'border-blue-700/50 bg-slate-800/50 text-blue-300 hover:border-blue-500/50 hover:bg-slate-700/50'
                }`}
              >
                <div className="font-semibold text-lg mb-2">{option.label}</div>
                <div className="text-sm opacity-80">{option.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )
    },
    
    // Section 6: Primary Goals
    {
      title: "What's your main goal?",
      icon: <Shield className="w-6 h-6" />,
      content: (
        <div className="space-y-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 text-blue-300">What's your main goal for counseling?</h2>
            <p className="text-blue-200 text-lg">
              Select your primary focus area
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {[
              { value: 'manage-anxiety', label: 'Manage anxiety and stress', desc: 'Learn coping strategies and reduce worry' },
              { value: 'improve-mood', label: 'Improve mood and motivation', desc: 'Work through depression and build resilience' },
              { value: 'relationship-help', label: 'Relationship support', desc: 'Improve communication and connection with others' },
              { value: 'self-confidence', label: 'Build self-confidence', desc: 'Develop a stronger sense of self-worth' },
              { value: 'life-transitions', label: 'Navigate life changes', desc: 'Get support through major life transitions' },
              { value: 'general-support', label: 'General emotional support', desc: 'Have someone to talk through daily challenges' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleInputChange('primaryGoal', option.value)}
                className={`p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                  formData.primaryGoal === option.value
                    ? 'border-blue-500 bg-blue-600/20 text-blue-200'
                    : 'border-blue-700/50 bg-slate-800/50 text-blue-300 hover:border-blue-500/50 hover:bg-slate-700/50'
                }`}
              >
                <div className="font-semibold text-lg mb-2">{option.label}</div>
                <div className="text-sm opacity-80">{option.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )
    },
    
    // Section 7: Counselor Style Preference
    {
      title: "What counselor style do you prefer?",
      icon: <User className="w-6 h-6" />,
      content: (
        <div className="space-y-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 text-blue-300">What counselor style do you prefer?</h2>
            <p className="text-blue-200 text-lg">
              Choose the approach that resonates with you
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {[
              { value: 'warm-empathetic', label: 'Warm and empathetic', desc: 'Someone who listens with compassion and understanding' },
              { value: 'solution-focused', label: 'Solution-focused', desc: 'Someone who helps you find practical solutions quickly' },
              { value: 'challenging-growth', label: 'Challenging but supportive', desc: 'Someone who pushes you to grow while being supportive' },
              { value: 'flexible-adaptive', label: 'Flexible and adaptive', desc: 'Someone who adjusts their approach based on your needs' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleInputChange('counselorStyle', option.value)}
                className={`p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                  formData.counselorStyle === option.value
                    ? 'border-blue-500 bg-blue-600/20 text-blue-200'
                    : 'border-blue-700/50 bg-slate-800/50 text-blue-300 hover:border-blue-500/50 hover:bg-slate-700/50'
                }`}
              >
                <div className="font-semibold text-lg mb-2">{option.label}</div>
                <div className="text-sm opacity-80">{option.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 py-8 relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-full blur-3xl opacity-50 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full blur-2xl opacity-60 animate-bounce"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-br from-slate-600/20 to-blue-600/20 rounded-full blur-3xl opacity-40 animate-pulse"></div>
        <div className="absolute bottom-40 right-10 w-28 h-28 bg-gradient-to-br from-cyan-600/20 to-blue-600/20 rounded-full blur-2xl opacity-50 animate-bounce"></div>
      </div>
      
      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative inline-block">
            <img src={logo} alt="ReflectAI" className="h-16 mx-auto mb-4 drop-shadow-lg" />
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-300 bg-clip-text text-transparent">
            Find Your Perfect AI Counselor
          </h1>
          <p className="text-lg text-blue-200 max-w-2xl mx-auto leading-relaxed">
            Complete this personalized questionnaire to get matched with an AI counselor tailored to your needs
          </p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-blue-200 bg-blue-900/50 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-700/50">
              Step {currentSection + 1} of {sections.length}
            </span>
            <span className="text-sm font-medium text-cyan-200 bg-cyan-900/50 backdrop-blur-sm px-4 py-2 rounded-full border border-cyan-700/50">
              {Math.round(((currentSection + 1) / sections.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-slate-800/60 rounded-full h-3 shadow-inner border border-slate-700/50">
            <motion.div 
              className="bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-400 h-3 rounded-full transition-all duration-500 shadow-lg"
              style={{ width: `${((currentSection + 1) / sections.length) * 100}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${((currentSection + 1) / sections.length) * 100}%` }}
            />
          </div>
        </motion.div>

        {/* Question Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSection}
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
          >
            <Card className="mb-8 bg-slate-900/90 backdrop-blur-sm border border-blue-700/30 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="text-center bg-gradient-to-r from-slate-800/50 to-blue-900/50 rounded-t-lg border-b border-blue-700/30">
                <motion.div 
                  className="w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg border border-blue-500/30"
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="text-white text-2xl">
                    {sections[currentSection].icon}
                  </div>
                </motion.div>
                <CardTitle className="text-2xl bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  {sections[currentSection].title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                {sections[currentSection].content}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <motion.div 
          className="flex justify-between items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Button 
            variant="outline" 
            onClick={prevSection}
            disabled={currentSection === 0}
            className="flex items-center gap-2 border border-blue-700/50 bg-slate-800/50 backdrop-blur-sm text-blue-200 hover:bg-slate-700/50 hover:border-blue-500/50 transition-all duration-200 font-medium rounded-xl px-6 py-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          
          <div className="flex items-center space-x-2">
            {sections.map((_, index) => (
              <motion.div
                key={index}
                className={`w-4 h-4 rounded-full transition-all duration-300 ${
                  index === currentSection 
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg' 
                    : index < currentSection 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-400 shadow-md' 
                      : 'bg-slate-700'
                }`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </div>
          
          {currentSection === sections.length - 1 ? (
            <Button 
              onClick={handleSubmit}
              className="bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-500 hover:from-blue-700 hover:via-cyan-700 hover:to-blue-600 text-white flex items-center gap-2 font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Find My Counselor
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button 
              onClick={nextSection}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white flex items-center gap-2 font-medium px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Next Step
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </motion.div>

        {/* Already have account link */}
        <motion.div 
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <p className="text-blue-200 mb-2">Already have an account?</p>
          <Button 
            variant="ghost" 
            onClick={() => navigate('/auth?tab=login')}
            className="text-blue-300 hover:text-blue-200 hover:bg-blue-900/50 font-medium rounded-xl px-4 py-2 border border-blue-700/50"
          >
            Sign in here
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Landing;