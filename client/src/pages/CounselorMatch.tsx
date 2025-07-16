import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Heart, Brain, Clock, CheckCircle, User, ArrowRight } from 'lucide-react';
import BackButton from '@/components/ui/back-button';

interface CounselorProfile {
  name: string;
  title: string;
  avatar: string;
  bio: string;
  specialties: string[];
  approach: string;
  communicationStyle: string;
  matchReason: string;
  availableHours: string;
  sessionTypes: string[];
}

export default function CounselorMatch() {
  const [, navigate] = useLocation();
  const [counselorProfile, setCounselorProfile] = useState<CounselorProfile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/user', {
          credentials: 'include'
        });
        setIsLoggedIn(response.ok);
      } catch (error) {
        setIsLoggedIn(false);
      }
    };

    checkAuth();

    // Get questionnaire data and generate counselor profile
    const questionnaireData = sessionStorage.getItem('counselorQuestionnaire');
    if (questionnaireData) {
      const data = JSON.parse(questionnaireData);
      setCounselorProfile(generateCounselorProfile(data));
    } else {
      // Fallback for direct navigation
      setCounselorProfile(generateDefaultCounselorProfile());
    }
  }, []);

  const generateCounselorProfile = (data: any): CounselorProfile => {
    // Generate personalized counselor based on questionnaire responses
    const profiles = {
      anxiety: {
        name: 'Dr. Sarah Chen',
        title: 'Anxiety & Stress Specialist',
        avatar: 'SC',
        bio: 'Specializes in cognitive-behavioral therapy and mindfulness-based approaches for anxiety management.',
        specialties: ['Anxiety Disorders', 'Stress Management', 'Mindfulness', 'CBT'],
        approach: 'Cognitive Behavioral Therapy with mindfulness integration',
        communicationStyle: 'Gentle and reassuring with practical techniques',
        matchReason: 'Your responses indicate anxiety concerns and preference for mindful, gentle approaches.',
        availableHours: '24/7 AI Support',
        sessionTypes: ['Daily Check-ins', 'Crisis Support', 'Guided Exercises']
      },
      depression: {
        name: 'Dr. Michael Rodriguez',
        title: 'Depression & Mood Specialist',
        avatar: 'MR',
        bio: 'Expert in treating depression and mood disorders using evidence-based therapeutic approaches.',
        specialties: ['Depression', 'Mood Disorders', 'Emotional Regulation', 'Solution-Focused Therapy'],
        approach: 'Solution-focused therapy with emotional support',
        communicationStyle: 'Empathetic and encouraging with actionable guidance',
        matchReason: 'Your responses suggest mood concerns and need for emotional support.',
        availableHours: '24/7 AI Support',
        sessionTypes: ['Weekly Sessions', 'Mood Tracking', 'Goal Setting']
      },
      relationships: {
        name: 'Dr. Emily Johnson',
        title: 'Relationship & Communication Expert',
        avatar: 'EJ',
        bio: 'Focuses on improving communication skills and building healthier relationships.',
        specialties: ['Relationship Issues', 'Communication Skills', 'Conflict Resolution', 'Boundaries'],
        approach: 'Humanistic and communication-focused therapy',
        communicationStyle: 'Direct and insightful with practical relationship tools',
        matchReason: 'Your responses indicate relationship challenges and communication preferences.',
        availableHours: '24/7 AI Support',
        sessionTypes: ['Couple Guidance', 'Communication Practice', 'Boundary Setting']
      },
      stress: {
        name: 'Dr. David Park',
        title: 'Stress & Life Transitions Counselor',
        avatar: 'DP',
        bio: 'Helps individuals navigate life transitions and develop effective stress management strategies.',
        specialties: ['Stress Management', 'Life Transitions', 'Coping Strategies', 'Resilience Building'],
        approach: 'Eclectic approach combining CBT and mindfulness',
        communicationStyle: 'Balanced and practical with stress-reduction techniques',
        matchReason: 'Your responses show stress concerns and need for practical coping strategies.',
        availableHours: '24/7 AI Support',
        sessionTypes: ['Stress Coaching', 'Coping Skills', 'Relaxation Techniques']
      }
    };

    // Determine best match based on primary concerns
    let bestMatch = 'stress'; // default
    if (data.currentChallenges?.includes('Anxiety')) bestMatch = 'anxiety';
    else if (data.currentChallenges?.includes('Depression')) bestMatch = 'depression';
    else if (data.currentChallenges?.includes('Relationship issues')) bestMatch = 'relationships';

    return profiles[bestMatch as keyof typeof profiles];
  };

  const generateDefaultCounselorProfile = (): CounselorProfile => {
    return {
      name: 'Dr. Alex Thompson',
      title: 'General Mental Health Counselor',
      avatar: 'AT',
      bio: 'Experienced in providing comprehensive mental health support with a personalized approach.',
      specialties: ['General Counseling', 'Emotional Support', 'Personal Growth', 'Life Coaching'],
      approach: 'Integrative approach tailored to individual needs',
      communicationStyle: 'Warm and adaptive to your preferences',
      matchReason: 'A versatile counselor ready to support your unique journey.',
      availableHours: '24/7 AI Support',
      sessionTypes: ['General Sessions', 'Personal Growth', 'Emotional Support']
    };
  };

  const handleBeginJourney = () => {
    if (isLoggedIn) {
      navigate('/app/counselor');
    } else {
      navigate('/auth?tab=register&source=questionnaire');
    }
  };

  if (!counselorProfile) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950">
      <div className="max-w-4xl mx-auto p-6 py-12">
        <BackButton fallbackPath="/counselor-questionnaire" />
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Perfect Match Found!
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Based on your responses, we've created an AI counselor specifically designed for your needs and preferences.
          </p>
        </div>

        {/* Counselor Profile Card */}
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-2 border-gray-200 dark:border-gray-700 shadow-2xl mb-8">
          <CardHeader className="text-center pb-6">
            <div className="flex flex-col items-center">
              <Avatar className="w-24 h-24 mb-4 border-4 border-blue-200 dark:border-blue-800">
                <AvatarFallback className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  {counselorProfile.avatar}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">
                {counselorProfile.name}
              </CardTitle>
              <Badge variant="secondary" className="mt-2 text-sm">
                {counselorProfile.title}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Bio */}
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {counselorProfile.bio}
              </p>
            </div>

            {/* Match Reason */}
            <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center">
                <Heart className="h-5 w-5 mr-2" />
                Why This Match?
              </h3>
              <p className="text-blue-700 dark:text-blue-300">
                {counselorProfile.matchReason}
              </p>
            </div>

            {/* Specialties */}
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center">
                <Brain className="h-5 w-5 mr-2" />
                Specialties
              </h3>
              <div className="flex flex-wrap gap-2">
                {counselorProfile.specialties.map((specialty, index) => (
                  <Badge key={index} variant="outline" className="text-sm">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Approach & Communication */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
                  Therapeutic Approach
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {counselorProfile.approach}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
                  Communication Style
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {counselorProfile.communicationStyle}
                </p>
              </div>
            </div>

            {/* Availability */}
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-white mb-2 flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Availability
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                {counselorProfile.availableHours}
              </p>
              <div className="flex flex-wrap gap-2">
                {counselorProfile.sessionTypes.map((type, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <div className="text-center pt-6">
              <Button
                onClick={handleBeginJourney}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                {isLoggedIn ? 'Begin Your Journey' : 'Create Account & Start'} 
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                {isLoggedIn ? 'Start your counseling session now' : 'Create your account to begin counseling'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6 text-center">
              <Heart className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-800 dark:text-white mb-2">24/7 Support</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Your AI counselor is available anytime you need support or guidance.
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6 text-center">
              <Brain className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Personalized</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Tailored specifically to your personality, needs, and communication style.
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6 text-center">
              <User className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Private & Secure</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Your conversations are completely private and secure with end-to-end protection.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}