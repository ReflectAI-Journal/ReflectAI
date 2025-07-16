import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useLocation } from 'wouter';
import { Brain, Heart, User, Target, Clock, Shield } from 'lucide-react';
import BackButton from '@/components/ui/back-button';

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

export default function CounselorQuestionnaire() {
  const [, navigate] = useLocation();
  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState<QuestionnaireData>(initialData);

  const handleInputChange = (field: keyof QuestionnaireData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: keyof QuestionnaireData, value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...(prev[field] as string[]), value]
        : (prev[field] as string[]).filter(item => item !== value)
    }));
  };

  const handleSubmit = () => {
    // Store questionnaire data
    sessionStorage.setItem('counselorQuestionnaire', JSON.stringify(formData));
    navigate('/counselor-match');
  };

  const sections = [
    {
      title: "Basic Information",
      icon: <User className="h-5 w-5" />,
      component: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="age">Age Range</Label>
              <Select value={formData.age} onValueChange={(value) => handleInputChange('age', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your age range" />
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
                  <SelectValue placeholder="Select gender identity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>


        </div>
      )
    },
    {
      title: "Mental Health Background",
      icon: <Brain className="h-5 w-5" />,
      component: (
        <div className="space-y-6">
          <div>
            <Label>Have you had therapy or counseling before?</Label>
            <RadioGroup value={formData.previousTherapy} onValueChange={(value) => handleInputChange('previousTherapy', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="never" id="never" />
                <Label htmlFor="never">Never</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="past" id="past" />
                <Label htmlFor="past">In the past (not currently)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="current" id="current" />
                <Label htmlFor="current">Currently in therapy</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="considering" id="considering" />
                <Label htmlFor="considering">Considering it</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label>What challenges are you currently facing? (Select all that apply)</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              {[
                'Anxiety', 'Depression', 'Stress', 'Relationship issues', 'Work/Career concerns',
                'Family problems', 'Grief/Loss', 'Trauma', 'Self-esteem', 'Life transitions',
                'Addiction', 'Sleep issues', 'Anger management', 'Social anxiety', 'Perfectionism'
              ].map((challenge) => (
                <div key={challenge} className="flex items-center space-x-2">
                  <Checkbox
                    id={challenge}
                    checked={formData.currentChallenges.includes(challenge)}
                    onCheckedChange={(checked) => handleArrayChange('currentChallenges', challenge, !!checked)}
                  />
                  <Label htmlFor={challenge}>{challenge}</Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>What are your mental health goals? (Select all that apply)</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              {[
                'Reduce anxiety', 'Improve mood', 'Better relationships', 'Stress management',
                'Increase self-confidence', 'Process trauma', 'Develop coping skills', 'Find purpose',
                'Improve communication', 'Set boundaries', 'Manage emotions', 'Build resilience'
              ].map((goal) => (
                <div key={goal} className="flex items-center space-x-2">
                  <Checkbox
                    id={goal}
                    checked={formData.mentalHealthGoals.includes(goal)}
                    onCheckedChange={(checked) => handleArrayChange('mentalHealthGoals', goal, !!checked)}
                  />
                  <Label htmlFor={goal}>{goal}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Communication Preferences",
      icon: <Heart className="h-5 w-5" />,
      component: (
        <div className="space-y-6">
          <div>
            <Label>Preferred communication style</Label>
            <RadioGroup value={formData.communicationStyle} onValueChange={(value) => handleInputChange('communicationStyle', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="direct" id="direct" />
                <Label htmlFor="direct">Direct and straightforward</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="gentle" id="gentle" />
                <Label htmlFor="gentle">Gentle and nurturing</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="analytical" id="analytical" />
                <Label htmlFor="analytical">Analytical and logical</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="creative" id="creative" />
                <Label htmlFor="creative">Creative and metaphorical</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="humorous" id="humorous" />
                <Label htmlFor="humorous">Light-hearted with humor</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label>Preferred therapeutic approach</Label>
            <Select value={formData.preferredApproach} onValueChange={(value) => handleInputChange('preferredApproach', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select preferred approach" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cbt">Cognitive Behavioral Therapy (CBT)</SelectItem>
                <SelectItem value="mindfulness">Mindfulness-based</SelectItem>
                <SelectItem value="psychodynamic">Psychodynamic</SelectItem>
                <SelectItem value="humanistic">Humanistic/Person-centered</SelectItem>
                <SelectItem value="solution-focused">Solution-focused</SelectItem>
                <SelectItem value="trauma-informed">Trauma-informed</SelectItem>
                <SelectItem value="eclectic">Eclectic (combination)</SelectItem>
                <SelectItem value="unsure">Not sure</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>How often would you like to have sessions?</Label>
            <RadioGroup value={formData.sessionFrequency} onValueChange={(value) => handleInputChange('sessionFrequency', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="daily" id="daily" />
                <Label htmlFor="daily">Daily check-ins</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="few-times-week" id="few-times-week" />
                <Label htmlFor="few-times-week">A few times per week</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="weekly" id="weekly" />
                <Label htmlFor="weekly">Weekly</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="as-needed" id="as-needed" />
                <Label htmlFor="as-needed">As needed</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      )
    },
    {
      title: "Life Context & Personality",
      icon: <Target className="h-5 w-5" />,
      component: (
        <div className="space-y-6">
          <div>
            <Label>Current stress level</Label>
            <Select value={formData.stressLevel} onValueChange={(value) => handleInputChange('stressLevel', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select stress level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="overwhelming">Overwhelming</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Relationship status</Label>
            <Select value={formData.relationshipStatus} onValueChange={(value) => handleInputChange('relationshipStatus', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select relationship status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="dating">Dating</SelectItem>
                <SelectItem value="relationship">In a relationship</SelectItem>
                <SelectItem value="married">Married</SelectItem>
                <SelectItem value="divorced">Divorced</SelectItem>
                <SelectItem value="widowed">Widowed</SelectItem>
                <SelectItem value="complicated">It's complicated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Work situation</Label>
            <Select value={formData.workSituation} onValueChange={(value) => handleInputChange('workSituation', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select work situation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employed">Employed full-time</SelectItem>
                <SelectItem value="part-time">Employed part-time</SelectItem>
                <SelectItem value="freelance">Freelance/Contract</SelectItem>
                <SelectItem value="unemployed">Unemployed</SelectItem>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
                <SelectItem value="caregiver">Stay-at-home caregiver</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Personality type (if known)</Label>
            <Select value={formData.personalityType} onValueChange={(value) => handleInputChange('personalityType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select personality type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="introvert">Introvert</SelectItem>
                <SelectItem value="extrovert">Extrovert</SelectItem>
                <SelectItem value="ambivert">Ambivert</SelectItem>
                <SelectItem value="unsure">Not sure</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>What motivates you? (Select all that apply)</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              {[
                'Achievement', 'Recognition', 'Personal growth', 'Helping others',
                'Financial security', 'Creative expression', 'Independence', 'Stability',
                'Adventure', 'Knowledge', 'Relationships', 'Spiritual connection'
              ].map((factor) => (
                <div key={factor} className="flex items-center space-x-2">
                  <Checkbox
                    id={factor}
                    checked={formData.motivationFactors.includes(factor)}
                    onCheckedChange={(checked) => handleArrayChange('motivationFactors', factor, !!checked)}
                  />
                  <Label htmlFor={factor}>{factor}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Final Questions",
      icon: <Shield className="h-5 w-5" />,
      component: (
        <div className="space-y-6">
          <div>
            <Label>Are there any topics you'd prefer to avoid or that might be triggering?</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              {[
                'Violence', 'Abuse', 'Addiction', 'Death/Loss', 'Self-harm',
                'Eating disorders', 'Sexual content', 'Family trauma', 'Medical issues',
                'Financial stress', 'Religious topics', 'Political topics'
              ].map((trigger) => (
                <div key={trigger} className="flex items-center space-x-2">
                  <Checkbox
                    id={trigger}
                    checked={formData.triggerWarnings.includes(trigger)}
                    onCheckedChange={(checked) => handleArrayChange('triggerWarnings', trigger, !!checked)}
                  />
                  <Label htmlFor={trigger}>{trigger}</Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>What coping mechanisms work best for you? (Select all that apply)</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              {[
                'Exercise', 'Meditation', 'Journaling', 'Music', 'Art/Creativity',
                'Talking to friends', 'Nature/Outdoors', 'Reading', 'Breathing exercises',
                'Alone time', 'Social activities', 'Routine/Structure'
              ].map((coping) => (
                <div key={coping} className="flex items-center space-x-2">
                  <Checkbox
                    id={coping}
                    checked={formData.copingMechanisms.includes(coping)}
                    onCheckedChange={(checked) => handleArrayChange('copingMechanisms', coping, !!checked)}
                  />
                  <Label htmlFor={coping}>{coping}</Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="idealCounselor">Describe your ideal counselor or therapist</Label>
            <Textarea
              id="idealCounselor"
              placeholder="What qualities, approach, or characteristics would make you feel most comfortable and supported?"
              value={formData.idealCounselor}
              onChange={(e) => handleInputChange('idealCounselor', e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div>
            <Label htmlFor="additionalInfo">Anything else you'd like to share?</Label>
            <Textarea
              id="additionalInfo"
              placeholder="Any additional information that might help us match you with the right counselor..."
              value={formData.additionalInfo}
              onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>
      )
    }
  ];

  const isCurrentSectionValid = () => {
    switch (currentSection) {
      case 0:
        return formData.age && formData.gender;
      case 1:
        return formData.previousTherapy && formData.currentChallenges.length > 0;
      case 2:
        return formData.communicationStyle && formData.preferredApproach;
      case 3:
        return formData.stressLevel && formData.personalityType;
      case 4:
        return formData.idealCounselor.length > 10;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950">
      <div className="max-w-4xl mx-auto p-6 py-12">
        <BackButton fallbackPath="/" />
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Personalized Counselor Matching
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Help us understand you better so we can create an AI counselor perfectly tailored to your needs, communication style, and goals.
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-2">
            {sections.map((_, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index <= currentSection 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                }`}>
                  {index + 1}
                </div>
                {index < sections.length - 1 && (
                  <div className={`w-12 h-1 mx-2 ${
                    index < currentSection ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-2 border-gray-200 dark:border-gray-700 shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              {sections[currentSection].icon}
              {sections[currentSection].title}
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            {sections[currentSection].component}
            
            {/* Navigation buttons */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
                disabled={currentSection === 0}
              >
                Previous
              </Button>
              
              {currentSection < sections.length - 1 ? (
                <Button
                  onClick={() => setCurrentSection(currentSection + 1)}
                  disabled={!isCurrentSectionValid()}
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!isCurrentSectionValid()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Create My Counselor
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}