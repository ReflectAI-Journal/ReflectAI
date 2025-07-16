import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Heart, Brain, Target, MessageCircle, CheckCircle, Star, Clock, Users, Shield } from 'lucide-react';
import BackButton from '@/components/ui/back-button';

interface CounselorProfile {
  name: string;
  title: string;
  specializations: string[];
  approach: string;
  communicationStyle: string;
  personality: string;
  experience: string;
  strengths: string[];
  sessionStyle: string;
  avatar: string;
  matchScore: number;
  whyMatched: string[];
}

export default function CounselorMatch() {
  const [, navigate] = useLocation();
  const [counselor, setCounselor] = useState<CounselorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get questionnaire data from sessionStorage
    const questionnaireData = sessionStorage.getItem('counselorQuestionnaire');
    if (!questionnaireData) {
      navigate('/counselor-questionnaire');
      return;
    }

    // Generate counselor profile based on questionnaire responses
    const data = JSON.parse(questionnaireData);
    const generatedCounselor = generateCounselorProfile(data);
    setCounselor(generatedCounselor);
    setIsLoading(false);
  }, [navigate]);

  const generateCounselorProfile = (data: any): CounselorProfile => {
    // Generate name based on preferences
    const maleNames = ['Dr. Michael Rodriguez', 'Dr. James Chen', 'Dr. David Thompson', 'Dr. Alex Johnson'];
    const femaleNames = ['Dr. Sarah Williams', 'Dr. Emily Davis', 'Dr. Maria Gonzalez', 'Dr. Lisa Wang'];
    const neutralNames = ['Dr. Jordan Taylor', 'Dr. Casey Morgan', 'Dr. Riley Parker', 'Dr. Avery Smith'];
    
    let namePool = neutralNames;
    if (data.gender === 'male') namePool = maleNames;
    else if (data.gender === 'female') namePool = femaleNames;
    
    const name = namePool[Math.floor(Math.random() * namePool.length)];
    
    // Generate specializations based on challenges
    const challengeSpecializations = {
      'Anxiety': 'Anxiety Disorders',
      'Depression': 'Mood Disorders',
      'Stress': 'Stress Management',
      'Relationship issues': 'Relationship Counseling',
      'Work/Career concerns': 'Career Psychology',
      'Family problems': 'Family Therapy',
      'Grief/Loss': 'Grief Counseling',
      'Trauma': 'Trauma-Informed Care',
      'Self-esteem': 'Self-Esteem Building',
      'Life transitions': 'Life Transitions',
      'Addiction': 'Addiction Recovery',
      'Sleep issues': 'Sleep Psychology',
      'Anger management': 'Anger Management',
      'Social anxiety': 'Social Anxiety',
      'Perfectionism': 'Perfectionism Recovery'
    };
    
    const specializations = data.currentChallenges
      .slice(0, 3)
      .map((challenge: string) => challengeSpecializations[challenge] || challenge);
    
    // Generate approach based on preferences
    const approachMap = {
      'cbt': 'Cognitive Behavioral Therapy (CBT)',
      'mindfulness': 'Mindfulness-Based Therapy',
      'psychodynamic': 'Psychodynamic Therapy',
      'humanistic': 'Person-Centered Therapy',
      'solution-focused': 'Solution-Focused Brief Therapy',
      'trauma-informed': 'Trauma-Informed Care',
      'eclectic': 'Integrative Approach',
      'unsure': 'Flexible, Client-Centered Approach'
    };
    
    const approach = approachMap[data.preferredApproach] || 'Holistic Therapeutic Approach';
    
    // Generate communication style
    const styleMap = {
      'direct': 'Direct and solution-focused',
      'gentle': 'Gentle and nurturing',
      'analytical': 'Analytical and structured',
      'creative': 'Creative and metaphorical',
      'humorous': 'Warm with appropriate humor'
    };
    
    const communicationStyle = styleMap[data.communicationStyle] || 'Adaptive to your needs';
    
    // Generate personality based on user preferences
    const personalityMap = {
      'introvert': 'Thoughtful and introspective, respects quiet reflection',
      'extrovert': 'Energetic and engaging, encourages active participation',
      'ambivert': 'Balanced and adaptable, adjusts to your energy level',
      'unsure': 'Flexible and observant, adapts to your preferred style'
    };
    
    const personality = personalityMap[data.personalityType] || 'Empathetic and understanding';
    
    // Generate experience based on age and challenges
    const ageExperienceMap = {
      '18-25': '8 years specializing in young adult transitions',
      '26-35': '12 years focusing on career and relationship development',
      '36-45': '15 years in midlife transitions and family dynamics',
      '46-55': '18 years in career changes and personal growth',
      '56-65': '20 years in life transitions and wisdom integration',
      '65+': '25 years in aging, legacy, and life reflection'
    };
    
    const experience = ageExperienceMap[data.age] || '15 years in diverse therapeutic settings';
    
    // Generate strengths based on goals
    const goalStrengths = {
      'Reduce anxiety': 'Anxiety reduction techniques',
      'Improve mood': 'Mood regulation strategies',
      'Better relationships': 'Communication skills building',
      'Stress management': 'Stress reduction methods',
      'Increase self-confidence': 'Self-esteem enhancement',
      'Process trauma': 'Trauma processing and healing',
      'Develop coping skills': 'Coping strategy development',
      'Find purpose': 'Purpose and meaning exploration',
      'Improve communication': 'Communication skills training',
      'Set boundaries': 'Boundary setting techniques',
      'Manage emotions': 'Emotional regulation skills',
      'Build resilience': 'Resilience building practices'
    };
    
    const strengths = data.mentalHealthGoals
      .slice(0, 4)
      .map((goal: string) => goalStrengths[goal] || goal);
    
    // Generate session style based on frequency preference
    const sessionStyleMap = {
      'daily': 'Brief, focused daily check-ins with ongoing support',
      'few-times-week': 'Regular sessions with continuous progress tracking',
      'weekly': 'Structured weekly sessions with goal-oriented focus',
      'as-needed': 'Flexible, responsive sessions based on your needs'
    };
    
    const sessionStyle = sessionStyleMap[data.sessionFrequency] || 'Adaptive session scheduling';
    
    // Generate why matched reasons
    const whyMatched = [];
    if (data.currentChallenges.length > 0) {
      whyMatched.push(`Specializes in ${data.currentChallenges.slice(0, 2).join(' and ')}`);
    }
    if (data.communicationStyle) {
      whyMatched.push(`Matches your ${data.communicationStyle} communication preference`);
    }
    if (data.preferredApproach && data.preferredApproach !== 'unsure') {
      whyMatched.push(`Expert in ${approachMap[data.preferredApproach]}`);
    }
    if (data.stressLevel === 'high' || data.stressLevel === 'overwhelming') {
      whyMatched.push('Experienced with high-stress situations');
    }
    if (data.previousTherapy === 'never') {
      whyMatched.push('Excellent at making therapy newcomers feel comfortable');
    }
    
    // Calculate match score (80-98%)
    const matchScore = Math.floor(Math.random() * 19) + 80;
    
    return {
      name,
      title: 'Licensed Clinical Psychologist',
      specializations,
      approach,
      communicationStyle,
      personality,
      experience,
      strengths,
      sessionStyle,
      avatar: name.split(' ')[1].charAt(0) + name.split(' ')[2].charAt(0),
      matchScore,
      whyMatched
    };
  };

  const handleStartCounseling = () => {
    if (counselor) {
      // Store the counselor profile for the chat
      sessionStorage.setItem('selectedCounselor', JSON.stringify(counselor));
      navigate('/app/counselor');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-300">Finding your perfect counselor match...</p>
        </div>
      </div>
    );
  }

  if (!counselor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600 dark:text-gray-300">Unable to generate counselor profile. Please try again.</p>
          <Button onClick={() => navigate('/counselor-questionnaire')} className="mt-4">
            Retake Questionnaire
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950">
      <div className="max-w-4xl mx-auto p-6 py-12">
        <BackButton fallbackPath="/counselor-questionnaire" />
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-green-600 rounded-full">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Your Perfect Counselor Match
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Based on your responses, we've found the ideal AI counselor for your needs and preferences.
          </p>
        </div>

        {/* Match Score */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 px-6 py-3 rounded-full">
            <Star className="h-5 w-5 text-green-600" />
            <span className="text-2xl font-bold text-green-600">{counselor.matchScore}% Match</span>
          </div>
        </div>

        {/* Counselor Profile */}
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-2 border-gray-200 dark:border-gray-700 shadow-2xl mb-8">
          <CardHeader className="pb-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-2xl font-bold">
                <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  {counselor.avatar}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{counselor.name}</h2>
                <p className="text-lg text-gray-600 dark:text-gray-300">{counselor.title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{counselor.experience}</p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* Specializations */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Specializations
              </h3>
              <div className="flex flex-wrap gap-2">
                {counselor.specializations.map((spec, index) => (
                  <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    {spec}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Why You Matched */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-600" />
                Why You Matched
              </h3>
              <div className="space-y-2">
                {counselor.whyMatched.map((reason, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{reason}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Approach & Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  Therapeutic Approach
                </h3>
                <p className="text-gray-700 dark:text-gray-300">{counselor.approach}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-green-600" />
                  Communication Style
                </h3>
                <p className="text-gray-700 dark:text-gray-300">{counselor.communicationStyle}</p>
              </div>
            </div>

            {/* Personality & Session Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-5 w-5 text-orange-600" />
                  Personality
                </h3>
                <p className="text-gray-700 dark:text-gray-300">{counselor.personality}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-indigo-600" />
                  Session Style
                </h3>
                <p className="text-gray-700 dark:text-gray-300">{counselor.sessionStyle}</p>
              </div>
            </div>

            {/* Key Strengths */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Shield className="h-5 w-5 text-teal-600" />
                Key Strengths
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {counselor.strengths.map((strength, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-teal-600 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{strength}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={handleStartCounseling}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg"
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            Start Counseling with {counselor.name.split(' ')[1]}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => navigate('/counselor-questionnaire')}
            className="px-8 py-3 text-lg"
          >
            Retake Questionnaire
          </Button>
        </div>
      </div>
    </div>
  );
}