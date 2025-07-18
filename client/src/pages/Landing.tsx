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
      title: "Hey there! Let's get to know you! 👋",
      icon: <User className="w-6 h-6" />,
      content: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2 text-purple-700">Tell us about yourself! 🌈</h2>
            <p className="text-gray-600 text-lg">
              This helps us match you with the perfect counseling buddy who totally gets you! ✨
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="age" className="text-purple-700 font-semibold flex items-center gap-2">
                🎂 Age Range
              </Label>
              <Select value={formData.age} onValueChange={(value) => handleInputChange('age', value)}>
                <SelectTrigger className="border-2 border-purple-200 focus:border-purple-400 rounded-lg h-12 text-lg">
                  <SelectValue placeholder="How old are you? 🤔" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="18-25">18-25 (Young & awesome! 🌟)</SelectItem>
                  <SelectItem value="26-35">26-35 (Prime time! 💪)</SelectItem>
                  <SelectItem value="36-45">36-45 (Wise & wonderful! 🧠)</SelectItem>
                  <SelectItem value="46-55">46-55 (Experienced & amazing! ✨)</SelectItem>
                  <SelectItem value="56-65">56-65 (Seasoned & brilliant! 🎯)</SelectItem>
                  <SelectItem value="65+">65+ (Golden years! 🏆)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="gender" className="text-purple-700 font-semibold flex items-center gap-2">
                🌈 Gender Identity
              </Label>
              <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                <SelectTrigger className="border-2 border-purple-200 focus:border-purple-400 rounded-lg h-12 text-lg">
                  <SelectValue placeholder="How do you identify? 💖" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="female">Female 👩</SelectItem>
                  <SelectItem value="male">Male 👨</SelectItem>
                  <SelectItem value="non-binary">Non-binary 🌟</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say 🤝</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )
    },
    
    // Section 2: Mental Health Background
    {
      title: "Your Mental Health Journey 🧠💙",
      icon: <Brain className="w-6 h-6" />,
      content: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2 text-purple-700">Your wellness adventure so far! 🌟</h2>
            <p className="text-gray-600 text-lg">
              Tell us about your journey - every step matters and helps us support you better! 💪
            </p>
          </div>
          
          <div>
            <Label className="text-purple-700 font-semibold flex items-center gap-2 mb-4">
              🌱 Have you tried therapy or counseling before?
            </Label>
            <RadioGroup value={formData.previousTherapy} onValueChange={(value) => handleInputChange('previousTherapy', value)} className="space-y-3">
              <div className="flex items-center space-x-3 bg-purple-50 p-3 rounded-lg border-2 border-purple-100 hover:border-purple-200 transition-all">
                <RadioGroupItem value="never" id="never" className="text-purple-600" />
                <Label htmlFor="never" className="text-gray-700 cursor-pointer">Never tried therapy 🌟 (That's totally okay!)</Label>
              </div>
              <div className="flex items-center space-x-3 bg-purple-50 p-3 rounded-lg border-2 border-purple-100 hover:border-purple-200 transition-all">
                <RadioGroupItem value="past" id="past" className="text-purple-600" />
                <Label htmlFor="past" className="text-gray-700 cursor-pointer">Yes, in the past 💭 (Good for you!)</Label>
              </div>
              <div className="flex items-center space-x-3 bg-purple-50 p-3 rounded-lg border-2 border-purple-100 hover:border-purple-200 transition-all">
                <RadioGroupItem value="current" id="current" className="text-purple-600" />
                <Label htmlFor="current" className="text-gray-700 cursor-pointer">Currently in therapy 🌸 (Keep going!)</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div>
            <Label className="text-purple-700 font-semibold flex items-center gap-2 mb-4">
              🎯 What challenges are you currently facing? (Pick all that feel right!)
            </Label>
            <div className="grid grid-cols-2 gap-3 mt-3">
              {[
                ['Anxiety', '😰'], ['Depression', '💙'], ['Stress', '🌪️'], ['Relationships', '💕'], 
                ['Work/Career', '💼'], ['Self-esteem', '🌟'], ['Grief/Loss', '🕊️'], ['Trauma', '🛡️'],
                ['Sleep issues', '😴'], ['Anger management', '🔥'], ['Life transitions', '🚀'], ['Other', '✨']
              ].map(([challenge, emoji]) => (
                <div key={challenge} className="flex items-center space-x-3 bg-pink-50 p-3 rounded-lg border-2 border-pink-100 hover:border-pink-200 transition-all">
                  <Checkbox
                    id={challenge}
                    checked={formData.currentChallenges.includes(challenge)}
                    onCheckedChange={(checked) => handleCheckboxChange('currentChallenges', challenge, checked as boolean)}
                    className="text-pink-600"
                  />
                  <Label htmlFor={challenge} className="text-sm font-medium text-gray-700 cursor-pointer flex items-center gap-1">
                    {emoji} {challenge}
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
      title: "How You Love to Chat! 💬💕",
      icon: <Heart className="w-6 h-6" />,
      content: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2 text-purple-700">What's your vibe? 🎨</h2>
            <p className="text-gray-600 text-lg">
              Everyone has their own style - let's find yours so we can match you perfectly! 🎯
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
      title: "Your Dreams & Goals! 🎯⭐",
      icon: <Target className="w-6 h-6" />,
      content: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2 text-purple-700">What are your awesome goals? 🚀</h2>
            <p className="text-gray-600 text-lg">
              Dream big! Tell us what you want to achieve and we'll help you get there! 🌟
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
      title: "Almost Done! 🎉✨",
      icon: <Shield className="w-6 h-6" />,
      content: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2 text-purple-700">Paint us a picture! 🎨</h2>
            <p className="text-gray-600 text-lg">
              Describe your dream counselor - the final touches to make this match perfect! 💫
            </p>
          </div>
          
          <div>
            <Label htmlFor="idealCounselor">Describe your ideal counselor or what you're looking for in support</Label>
            <Textarea
              id="idealCounselor"
              placeholder="e.g., Someone who is patient, understanding, and helps me work through anxiety..."
              value={formData.idealCounselor}
              onChange={(e) => handleInputChange('idealCounselor', e.target.value)}
              rows={4}
            />
          </div>
          
          <div>
            <Label htmlFor="additionalInfo">Is there anything else you'd like us to know?</Label>
            <Textarea
              id="additionalInfo"
              placeholder="Any additional information that might help us understand your needs better..."
              value={formData.additionalInfo}
              onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
              rows={3}
            />
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-8 relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full blur-2xl opacity-40 animate-bounce"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-full blur-3xl opacity-25 animate-pulse"></div>
        <div className="absolute bottom-40 right-10 w-28 h-28 bg-gradient-to-br from-green-200 to-teal-200 rounded-full blur-2xl opacity-35 animate-bounce"></div>
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
            <div className="absolute -top-2 -right-2 text-2xl animate-bounce">✨</div>
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            Let's Find Your Perfect AI Counselor! 🌟
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Take this fun questionnaire and we'll match you with an AI counselor who totally gets you! 💕
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
            <span className="text-sm font-medium text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
              Step {currentSection + 1} of {sections.length} 🎯
            </span>
            <span className="text-sm font-medium text-pink-600 bg-pink-100 px-3 py-1 rounded-full">
              {Math.round(((currentSection + 1) / sections.length) * 100)}% Complete 🚀
            </span>
          </div>
          <div className="w-full bg-white/60 rounded-full h-3 shadow-inner border border-purple-100">
            <motion.div 
              className="bg-gradient-to-r from-pink-400 via-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500 shadow-lg"
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
            <Card className="mb-8 bg-white/80 backdrop-blur-sm border-2 border-purple-100 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="text-center bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
                <motion.div 
                  className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="text-white text-2xl">
                    {sections[currentSection].icon}
                  </div>
                </motion.div>
                <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
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
            className="flex items-center gap-2 border-2 border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back 👈
          </Button>
          
          <div className="flex items-center space-x-2">
            {sections.map((_, index) => (
              <motion.div
                key={index}
                className={`w-4 h-4 rounded-full transition-all duration-300 ${
                  index === currentSection 
                    ? 'bg-gradient-to-r from-pink-400 to-purple-500 shadow-lg' 
                    : index < currentSection 
                      ? 'bg-gradient-to-r from-green-400 to-blue-400 shadow-md' 
                      : 'bg-gray-200'
                }`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </div>
          
          {currentSection === sections.length - 1 ? (
            <Button 
              onClick={handleSubmit}
              className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 text-white flex items-center gap-2 font-bold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Find My Counselor! 🎉
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button 
              onClick={nextSection}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white flex items-center gap-2 font-medium px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Next Step 👉
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
          <p className="text-gray-600 mb-2">Already part of our community? 🎈</p>
          <Button 
            variant="ghost" 
            onClick={() => navigate('/auth?tab=login')}
            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 font-medium rounded-full px-4 py-2"
          >
            Sign in here! ✨
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Landing;