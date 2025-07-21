import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useLocation } from 'wouter';
import { Brain, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';

interface QuestionnaireAnswers {
  question1: string; // Communication style preference
  question2: string; // Problem-solving approach
  question3: string; // Emotional support need
  question4: string; // Learning style
  question5: string; // Session atmosphere preference
}

const questions = [
  {
    id: 'question1',
    text: 'How do you prefer to receive guidance?',
    options: [
      { value: 'empathetic', label: 'With deep understanding and emotional validation' },
      { value: 'practical', label: 'Through direct advice and concrete action steps' },
      { value: 'creative', label: 'Using creative approaches and meaningful metaphors' },
      { value: 'wise', label: 'With calm wisdom and bigger picture perspective' }
    ]
  },
  {
    id: 'question2',
    text: 'When facing a challenge, what helps you most?',
    options: [
      { value: 'practical', label: 'Clear, step-by-step solutions to try immediately' },
      { value: 'empathetic', label: 'Someone who truly understands how I feel' },
      { value: 'energetic', label: 'Encouragement and motivation to push forward' },
      { value: 'wise', label: 'Help seeing the situation from a different angle' }
    ]
  },
  {
    id: 'question3',
    text: 'What type of emotional support resonates with you?',
    options: [
      { value: 'empathetic', label: 'Gentle validation and deep emotional connection' },
      { value: 'energetic', label: 'Uplifting encouragement and confidence building' },
      { value: 'wise', label: 'Thoughtful reflection and meaningful insights' },
      { value: 'creative', label: 'Expressive exploration and breakthrough moments' }
    ]
  },
  {
    id: 'question4',
    text: 'How do you best process and learn from experiences?',
    options: [
      { value: 'creative', label: 'Through stories, images, and creative expression' },
      { value: 'practical', label: 'By analyzing what works and making concrete plans' },
      { value: 'wise', label: 'Through reflection and finding deeper meaning' },
      { value: 'empathetic', label: 'By exploring feelings and emotional connections' }
    ]
  },
  {
    id: 'question5',
    text: 'What kind of counseling atmosphere appeals to you most?',
    options: [
      { value: 'energetic', label: 'Motivating and confidence-building sessions' },
      { value: 'empathetic', label: 'Safe, nurturing, and deeply understanding space' },
      { value: 'practical', label: 'Focused, efficient, and solution-oriented approach' },
      { value: 'creative', label: 'Exploratory and innovative therapeutic experience' }
    ]
  }
];

const counselorPersonalities = {
  empathetic: {
    name: 'Maya',
    title: 'Empathetic Guide',
    description: 'Maya provides deeply understanding, emotionally supportive guidance with a focus on validation and gentle healing.',
    personality: 'empathetic'
  },
  practical: {
    name: 'Alex',
    title: 'Practical Problem-Solver', 
    description: 'Alex offers direct, solution-focused support with concrete steps and actionable strategies.',
    personality: 'practical'
  },
  creative: {
    name: 'River',
    title: 'Creative Healer',
    description: 'River uses creative approaches, metaphors, and expressive techniques for breakthrough insights.',
    personality: 'creative'
  },
  wise: {
    name: 'Samuel',
    title: 'Wise Mentor',
    description: 'Samuel brings life-experienced, calm wisdom to help you see the bigger picture and find meaning.',
    personality: 'wise'
  },
  energetic: {
    name: 'Jordan',
    title: 'Motivational Coach',
    description: 'Jordan provides energetic, encouraging support to help build confidence and motivation for positive change.',
    personality: 'energetic'
  }
};

export default function CounselorQuestionnaire() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({
    question1: '',
    question2: '',
    question3: '',
    question4: '',
    question5: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  // Check if user already completed questionnaire
  useEffect(() => {
    if (user?.completedCounselorQuestionnaire) {
      navigate('/app/counselor');
    }
  }, [user, navigate]);

  // Calculate best match counselor personality
  const getBestMatch = (answers: QuestionnaireAnswers): string => {
    const scores: Record<string, number> = {
      empathetic: 0,
      practical: 0,
      creative: 0,
      wise: 0,
      energetic: 0
    };

    // Count votes for each personality type
    Object.values(answers).forEach(answer => {
      if (answer && scores[answer] !== undefined) {
        scores[answer]++;
      }
    });

    // Return the personality with the highest score
    return Object.keys(scores).reduce((a, b) => 
      scores[a] > scores[b] ? a : b
    );
  };

  // Handle answer selection
  const handleAnswerSelect = (value: string) => {
    const questionKey = questions[currentQuestion].id as keyof QuestionnaireAnswers;
    setAnswers(prev => ({ ...prev, [questionKey]: value }));
  };

  // Navigate to next question
  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  // Navigate to previous question
  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // Mutation to complete questionnaire and save matched personality
  const completeQuestionnaireMutation = useMutation({
    mutationFn: async (matchedPersonality: string) => {
      const response = await apiRequest('POST', '/api/user/complete-questionnaire', {
        matchedPersonality
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    }
  });

  // Submit questionnaire
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const bestMatch = getBestMatch(answers);
      const matchedCounselor = counselorPersonalities[bestMatch as keyof typeof counselorPersonalities];

      // Save matched personality to database
      await completeQuestionnaireMutation.mutateAsync(bestMatch);

      // Store counselor data for the match page
      sessionStorage.setItem('counselorQuestionnaire', JSON.stringify({
        ...matchedCounselor,
        answers
      }));

      // Auto-redirect to counselor chat instead of match page
      navigate('/app/counselor');
    } catch (error) {
      console.error('Failed to submit questionnaire:', error);
      // Still proceed to match page even if API fails
      const bestMatch = getBestMatch(answers);
      const matchedCounselor = counselorPersonalities[bestMatch as keyof typeof counselorPersonalities];
      
      sessionStorage.setItem('counselorQuestionnaire', JSON.stringify({
        ...matchedCounselor,
        answers
      }));
      
      // Auto-redirect to counselor chat instead of match page
      navigate('/app/counselor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQuestionData = questions[currentQuestion];
  const currentAnswer = answers[currentQuestionData.id as keyof QuestionnaireAnswers];
  const isLastQuestion = currentQuestion === questions.length - 1;
  const canProceed = currentAnswer !== '';
  const allAnswered = Object.values(answers).every(answer => answer !== '');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Brain className="h-8 w-8 text-blue-600 mr-2" />
            <h1 className="text-3xl font-bold text-gray-900">Find Your Perfect Counselor</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Answer 5 quick questions to get matched with the AI counselor that fits your style
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-medium text-gray-700">
              {currentQuestion + 1} of {questions.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <Card className="mb-8 shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="text-xl font-semibold">
              Question {currentQuestion + 1}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              {currentQuestionData.text}
            </h2>
            
            <RadioGroup 
              value={currentAnswer} 
              onValueChange={handleAnswerSelect}
              className="space-y-4"
            >
              {currentQuestionData.options.map((option, index) => (
                <div key={option.value} className="flex items-start space-x-3">
                  <RadioGroupItem 
                    value={option.value} 
                    id={option.value}
                    className="mt-1"
                  />
                  <Label 
                    htmlFor={option.value}
                    className="text-base leading-relaxed cursor-pointer hover:text-blue-600 transition-colors"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Previous</span>
          </Button>

          {!isLastQuestion ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
            >
              <span>Next</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!allAnswered || isSubmitting}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Finding Your Match...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span>Find My Counselor</span>
                </>
              )}
            </Button>
          )}
        </div>

        {/* Completion indicator */}
        {allAnswered && isLastQuestion && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">All questions answered! Ready to find your perfect counselor match.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}