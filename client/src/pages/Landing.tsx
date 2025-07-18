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
      title: "Welcome! Let's find your perfect AI counselor",
      icon: <User className="w-6 h-6" />,
      content: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Tell us about yourself</h2>
            <p className="text-muted-foreground">
              This helps us match you with the right counseling approach
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="age">Age Range</Label>
              <Select value={formData.age} onValueChange={(value) => handleInputChange('age', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select age range" />
                </SelectTrigger>
                <SelectContent>
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
              <Label htmlFor="gender">Gender Identity</Label>
              <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
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
            <h2 className="text-2xl font-bold mb-2">Your experience with mental health</h2>
            <p className="text-muted-foreground">
              Understanding your background helps us provide better support
            </p>
          </div>
          
          <div>
            <Label>Have you tried therapy or counseling before?</Label>
            <RadioGroup value={formData.previousTherapy} onValueChange={(value) => handleInputChange('previousTherapy', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="never" id="never" />
                <Label htmlFor="never">Never tried therapy</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="past" id="past" />
                <Label htmlFor="past">Yes, in the past</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="current" id="current" />
                <Label htmlFor="current">Currently in therapy</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div>
            <Label>What challenges are you currently facing? (Select all that apply)</Label>
            <div className="grid grid-cols-2 gap-3 mt-3">
              {[
                'Anxiety', 'Depression', 'Stress', 'Relationships', 
                'Work/Career', 'Self-esteem', 'Grief/Loss', 'Trauma',
                'Sleep issues', 'Anger management', 'Life transitions', 'Other'
              ].map((challenge) => (
                <div key={challenge} className="flex items-center space-x-2">
                  <Checkbox
                    id={challenge}
                    checked={formData.currentChallenges.includes(challenge)}
                    onCheckedChange={(checked) => handleCheckboxChange('currentChallenges', challenge, checked as boolean)}
                  />
                  <Label htmlFor={challenge} className="text-sm">{challenge}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    
    // Section 3: Communication Style
    {
      title: "How You Like to Communicate",
      icon: <Heart className="w-6 h-6" />,
      content: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Your communication preferences</h2>
            <p className="text-muted-foreground">
              This helps us match your counselor's style to your needs
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
      title: "Your Goals and Lifestyle",
      icon: <Target className="w-6 h-6" />,
      content: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">What are your goals?</h2>
            <p className="text-muted-foreground">
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
            <h2 className="text-2xl font-bold mb-2">Tell us more about your ideal counselor</h2>
            <p className="text-muted-foreground">
              These final details help us create the perfect match
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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <img src={logo} alt="ReflectAI" className="h-12 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Find Your Perfect AI Counselor</h1>
          <p className="text-muted-foreground">
            Answer a few questions to get matched with a personalized counseling experience
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">
              Step {currentSection + 1} of {sections.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(((currentSection + 1) / sections.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-muted/30 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary to-violet-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentSection + 1) / sections.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="mb-8">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  {sections[currentSection].icon}
                </div>
                <CardTitle className="text-xl">{sections[currentSection].title}</CardTitle>
              </CardHeader>
              <CardContent>
                {sections[currentSection].content}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={prevSection}
            disabled={currentSection === 0}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>
          
          <div className="flex items-center space-x-2">
            {sections.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentSection 
                    ? 'bg-primary' 
                    : index < currentSection 
                      ? 'bg-primary/50' 
                      : 'bg-muted/30'
                }`}
              />
            ))}
          </div>
          
          {currentSection === sections.length - 1 ? (
            <Button 
              onClick={handleSubmit}
              className="bg-gradient-to-r from-primary to-violet-600 hover:from-primary-dark hover:to-violet-700 text-white flex items-center gap-2"
            >
              Get My Counselor
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button 
              onClick={nextSection}
              className="flex items-center gap-2"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Already have account link */}
        <div className="text-center mt-8">
          <p className="text-muted-foreground mb-2">Already have an account?</p>
          <Button 
            variant="ghost" 
            onClick={() => navigate('/auth?tab=login')}
            className="text-primary hover:text-primary-dark"
          >
            Sign in here
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Landing;