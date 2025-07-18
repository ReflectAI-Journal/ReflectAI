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
  // Basic Demographics
  age: string;
  gender: string;
  
  // Mental Health Background
  previousTherapy: string;
  currentChallenges: string[];
  mentalHealthGoals: string[];
  
  // Communication Preferences
  communicationStyle: string;
  preferredApproach: string;
  sessionFrequency: string;
  
  // Specific Concerns
  primaryConcerns: string[];
  triggerWarnings: string[];
  copingMechanisms: string[];
  
  // Personality & Preferences
  personalityType: string;
  learningStyle: string;
  motivationFactors: string[];
  
  // Life Context
  relationshipStatus: string;
  workSituation: string;
  stressLevel: string;
  
  // Open-ended responses
  additionalInfo: string;
  idealCounselor: string;
}

const initialData: QuestionnaireData = {
  age: '',
  gender: '',
  previousTherapy: '',
  currentChallenges: [],
  mentalHealthGoals: [],
  communicationStyle: '',
  preferredApproach: '',
  sessionFrequency: '',
  primaryConcerns: [],
  triggerWarnings: [],
  copingMechanisms: [],
  personalityType: '',
  learningStyle: '',
  motivationFactors: [],
  relationshipStatus: '',
  workSituation: '',
  stressLevel: '',
  additionalInfo: '',
  idealCounselor: ''
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

  const handleInputChange = (field: keyof QuestionnaireData, value: string) => {
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
    // Section 1: Welcome & Basic Info
    {
      title: "Welcome! Let's get to know you",
      icon: <User className="w-6 h-6" />,
      content: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2 text-blue-300">Tell us about yourself</h2>
            <p className="text-blue-200 text-lg">
              This helps us match you with the right counseling approach for your needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="age" className="text-blue-300 font-semibold mb-2 block">
                Age Range
              </Label>
              <Select value={formData.age} onValueChange={(value) => handleInputChange('age', value)}>
                <SelectTrigger className="border border-blue-700/50 bg-slate-800/50 backdrop-blur-sm focus:border-blue-500 rounded-xl h-12 text-blue-100 hover:bg-slate-700/50 transition-all">
                  <SelectValue placeholder="Select your age range" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-blue-700/50">
                  <SelectItem value="18-25">18-25</SelectItem>
                  <SelectItem value="26-35">26-35</SelectItem>
                  <SelectItem value="36-45">36-45</SelectItem>
                  <SelectItem value="46-55">46-55</SelectItem>
                  <SelectItem value="56-65">56-65</SelectItem>
                  <SelectItem value="65+">65+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="gender" className="text-blue-300 font-semibold mb-2 block">
                Gender Identity
              </Label>
              <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                <SelectTrigger className="border border-blue-700/50 bg-slate-800/50 backdrop-blur-sm focus:border-blue-500 rounded-xl h-12 text-blue-100 hover:bg-slate-700/50 transition-all">
                  <SelectValue placeholder="Select your gender identity" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-blue-700/50">
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="non-binary">Non-binary</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )
    },
    
    // Section 2: Mental Health Background
    {
      title: "Your Mental Health Journey",
      icon: <Brain className="w-6 h-6" />,
      content: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2 text-blue-300">Your wellness journey so far</h2>
            <p className="text-blue-200 text-lg">
              Tell us about your experience - this helps us provide better support
            </p>
          </div>
          
          <div>
            <Label className="text-blue-300 font-semibold mb-4 block">
              Have you tried therapy or counseling before?
            </Label>
            <RadioGroup value={formData.previousTherapy} onValueChange={(value) => handleInputChange('previousTherapy', value)} className="space-y-3">
              <div className="flex items-center space-x-3 bg-slate-800/50 backdrop-blur-sm p-4 rounded-xl border border-blue-700/50 hover:border-blue-500/50 transition-all">
                <RadioGroupItem value="never" id="never" className="text-blue-400" />
                <Label htmlFor="never" className="text-blue-100 cursor-pointer">Never tried therapy</Label>
              </div>
              <div className="flex items-center space-x-3 bg-slate-800/50 backdrop-blur-sm p-4 rounded-xl border border-blue-700/50 hover:border-blue-500/50 transition-all">
                <RadioGroupItem value="past" id="past" className="text-blue-400" />
                <Label htmlFor="past" className="text-blue-100 cursor-pointer">Yes, in the past</Label>
              </div>
              <div className="flex items-center space-x-3 bg-slate-800/50 backdrop-blur-sm p-4 rounded-xl border border-blue-700/50 hover:border-blue-500/50 transition-all">
                <RadioGroupItem value="current" id="current" className="text-blue-400" />
                <Label htmlFor="current" className="text-blue-100 cursor-pointer">Currently in therapy</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div>
            <Label className="text-blue-300 font-semibold mb-4 block">
              What challenges are you currently facing? (Select all that apply)
            </Label>
            <div className="grid grid-cols-2 gap-3 mt-3">
              {[
                'Anxiety', 'Depression', 'Stress', 'Relationships', 
                'Work/Career', 'Self-esteem', 'Grief/Loss', 'Trauma',
                'Sleep issues', 'Anger management', 'Life transitions', 'Other'
              ].map((challenge) => (
                <div key={challenge} className="flex items-center space-x-3 bg-slate-800/50 backdrop-blur-sm p-3 rounded-xl border border-blue-700/50 hover:border-blue-500/50 transition-all">
                  <Checkbox
                    id={challenge}
                    checked={formData.currentChallenges.includes(challenge)}
                    onCheckedChange={(checked) => handleCheckboxChange('currentChallenges', challenge, checked as boolean)}
                    className="text-blue-400"
                  />
                  <Label htmlFor={challenge} className="text-sm font-medium text-blue-100 cursor-pointer">
                    {challenge}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    
    // Section 3: Communication Style
    {
      title: "Communication Preferences",
      icon: <Heart className="w-6 h-6" />,
      content: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2 text-blue-300">What's your communication style?</h2>
            <p className="text-blue-200 text-lg">
              Understanding your preferences helps us match you with the right counselor approach
            </p>
          </div>
          
          <div>
            <Label>What communication style do you prefer?</Label>
            <RadioGroup value={formData.communicationStyle} onValueChange={(value) => handleInputChange('communicationStyle', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="direct" id="direct" />
                <Label htmlFor="direct">Direct and straightforward</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="gentle" id="gentle" />
                <Label htmlFor="gentle">Gentle and supportive</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="collaborative" id="collaborative" />
                <Label htmlFor="collaborative">Collaborative and interactive</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="analytical" id="analytical" />
                <Label htmlFor="analytical">Analytical and structured</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div>
            <Label>What therapeutic approach appeals to you most?</Label>
            <RadioGroup value={formData.preferredApproach} onValueChange={(value) => handleInputChange('preferredApproach', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cbt" id="cbt" />
                <Label htmlFor="cbt">Cognitive Behavioral Therapy (CBT) - Focus on changing thought patterns</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mindfulness" id="mindfulness" />
                <Label htmlFor="mindfulness">Mindfulness-based - Focus on present moment awareness</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="solution-focused" id="solution-focused" />
                <Label htmlFor="solution-focused">Solution-focused - Focus on practical solutions</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="humanistic" id="humanistic" />
                <Label htmlFor="humanistic">Humanistic - Focus on personal growth and self-acceptance</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      )
    },
    
    // Section 4: Goals & Preferences
    {
      title: "Your Goals & Lifestyle",
      icon: <Target className="w-6 h-6" />,
      content: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2 text-blue-300">What are your goals?</h2>
            <p className="text-blue-200 text-lg">
              Understanding your objectives helps us provide targeted support
            </p>
          </div>
          
          <div>
            <Label>What are your main mental health goals? (Select all that apply)</Label>
            <div className="grid grid-cols-2 gap-3 mt-3">
              {[
                'Reduce anxiety', 'Improve mood', 'Better sleep', 'Stress management',
                'Build confidence', 'Improve relationships', 'Process emotions', 'Personal growth',
                'Work-life balance', 'Coping skills', 'Communication skills', 'Other'
              ].map((goal) => (
                <div key={goal} className="flex items-center space-x-2">
                  <Checkbox
                    id={goal}
                    checked={formData.mentalHealthGoals.includes(goal)}
                    onCheckedChange={(checked) => handleCheckboxChange('mentalHealthGoals', goal, checked as boolean)}
                  />
                  <Label htmlFor={goal} className="text-sm">{goal}</Label>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <Label>How would you rate your current stress level?</Label>
            <RadioGroup value={formData.stressLevel} onValueChange={(value) => handleInputChange('stressLevel', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="low" id="low" />
                <Label htmlFor="low">Low - Generally manageable</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="moderate" id="moderate" />
                <Label htmlFor="moderate">Moderate - Sometimes overwhelming</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high" id="high" />
                <Label htmlFor="high">High - Often overwhelming</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="severe" id="severe" />
                <Label htmlFor="severe">Severe - Constantly overwhelming</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      )
    },
    
    // Section 5: Final Details
    {
      title: "Final Details",
      icon: <Shield className="w-6 h-6" />,
      content: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2 text-blue-300">Tell us about your ideal counselor</h2>
            <p className="text-blue-200 text-lg">
              These final details help us create the perfect match for your needs
            </p>
          </div>
          
          <div>
            <Label htmlFor="idealCounselor" className="text-blue-300 font-semibold mb-2 block">
              Describe your ideal counselor or what you're looking for in support
            </Label>
            <Textarea
              id="idealCounselor"
              placeholder="e.g., Someone who is patient, understanding, and helps me work through anxiety..."
              value={formData.idealCounselor}
              onChange={(e) => handleInputChange('idealCounselor', e.target.value)}
              rows={4}
              className="border border-blue-700/50 bg-slate-800/50 backdrop-blur-sm text-blue-100 placeholder:text-blue-300/50 focus:border-blue-500 rounded-xl resize-none"
            />
          </div>
          
          <div>
            <Label htmlFor="additionalInfo" className="text-blue-300 font-semibold mb-2 block">
              Is there anything else you'd like us to know?
            </Label>
            <Textarea
              id="additionalInfo"
              placeholder="Any additional information that might help us understand your needs better..."
              value={formData.additionalInfo}
              onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
              rows={3}
              className="border border-blue-700/50 bg-slate-800/50 backdrop-blur-sm text-blue-100 placeholder:text-blue-300/50 focus:border-blue-500 rounded-xl resize-none"
            />
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