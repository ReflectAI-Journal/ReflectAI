import React, { useState } from 'react';
import { useLocation } from 'wouter';
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

const QuestionnaireLanding = () => {
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
          
          <div className="grid grid-cols-1 gap-4">
            {[
              { value: '18-25', label: '18-25 years old', desc: 'Young adult navigating early independence' },
              { value: '26-35', label: '26-35 years old', desc: 'Building career and relationships' },
              { value: '36-45', label: '36-45 years old', desc: 'Managing family and career responsibilities' },
              { value: '46-55', label: '46-55 years old', desc: 'Navigating midlife transitions' },
              { value: '56-65', label: '56-65 years old', desc: 'Preparing for or entering retirement' },
              { value: '65+', label: '65+ years old', desc: 'Enjoying retirement and life experience' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleInputChange('age', option.value)}
                className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left backdrop-blur-sm ${
                  formData.age === option.value
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

    // Section 2: Gender Identity
    {
      title: "How do you identify?",
      icon: <Heart className="w-6 h-6" />,
      content: (
        <div className="space-y-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 text-blue-300">How do you identify?</h2>
            <p className="text-blue-200 text-lg">
              We respect all identities and want to provide inclusive support
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {[
              { value: 'woman', label: 'Woman', desc: 'Female identity' },
              { value: 'man', label: 'Man', desc: 'Male identity' },
              { value: 'non-binary', label: 'Non-binary', desc: 'Gender identity outside the binary' },
              { value: 'genderfluid', label: 'Genderfluid', desc: 'Gender identity that varies over time' },
              { value: 'prefer-not-to-say', label: 'Prefer not to say', desc: 'Keep this information private' },
              { value: 'other', label: 'Other', desc: 'Another gender identity' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleInputChange('gender', option.value)}
                className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left backdrop-blur-sm ${
                  formData.gender === option.value
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

    // Section 3: Previous Therapy Experience
    {
      title: "Previous therapy experience?",
      icon: <Brain className="w-6 h-6" />,
      content: (
        <div className="space-y-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 text-blue-300">Have you tried therapy before?</h2>
            <p className="text-blue-200 text-lg">
              Your experience helps us understand your comfort level
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {[
              { value: 'never', label: 'Never tried therapy', desc: 'This would be my first experience' },
              { value: 'some-sessions', label: 'A few sessions', desc: 'Tried it briefly but didn\'t continue' },
              { value: 'short-term', label: 'Short-term therapy', desc: 'Attended for a few months' },
              { value: 'long-term', label: 'Long-term therapy', desc: 'Attended for over a year' },
              { value: 'multiple-times', label: 'Multiple times', desc: 'Tried therapy with different providers' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleInputChange('previousTherapy', option.value)}
                className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left backdrop-blur-sm ${
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
      icon: <Target className="w-6 h-6" />,
      content: (
        <div className="space-y-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 text-blue-300">What challenges are you facing?</h2>
            <p className="text-blue-200 text-lg">
              Select all that apply - this helps us understand your needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {[
              { value: 'anxiety', label: 'Anxiety and worry', desc: 'Persistent worry, panic, or nervousness' },
              { value: 'depression', label: 'Depression and mood', desc: 'Low mood, sadness, or emotional numbness' },
              { value: 'stress', label: 'Stress management', desc: 'Feeling overwhelmed by daily responsibilities' },
              { value: 'relationships', label: 'Relationship issues', desc: 'Difficulties with family, friends, or partners' },
              { value: 'work-life', label: 'Work-life balance', desc: 'Struggling to balance career and personal life' },
              { value: 'self-esteem', label: 'Self-esteem and confidence', desc: 'Low self-worth or confidence issues' },
              { value: 'trauma', label: 'Trauma or past experiences', desc: 'Processing difficult past events' },
              { value: 'life-transitions', label: 'Life transitions', desc: 'Major changes like moving, job change, etc.' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  const isSelected = formData.currentChallenges.includes(option.value);
                  handleCheckboxChange('currentChallenges', option.value, !isSelected);
                }}
                className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left backdrop-blur-sm ${
                  formData.currentChallenges.includes(option.value)
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

    // Section 5: Communication Style
    {
      title: "How do you like to communicate?",
      icon: <Clock className="w-6 h-6" />,
      content: (
        <div className="space-y-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 text-blue-300">How do you like to communicate?</h2>
            <p className="text-blue-200 text-lg">
              Choose the style that feels most comfortable for you
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {[
              { value: 'direct', label: 'Direct and straightforward', desc: 'Clear, honest communication without sugar-coating' },
              { value: 'gentle', label: 'Gentle and supportive', desc: 'Warm, nurturing approach with encouragement' },
              { value: 'collaborative', label: 'Collaborative and interactive', desc: 'Working together to find solutions' },
              { value: 'analytical', label: 'Analytical and structured', desc: 'Logical, step-by-step problem-solving approach' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleInputChange('communicationStyle', option.value)}
                className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left backdrop-blur-sm ${
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
              { value: 'personal-growth', label: 'Personal growth', desc: 'Become the best version of yourself' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleInputChange('primaryGoal', option.value)}
                className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left backdrop-blur-sm ${
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
                className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left backdrop-blur-sm ${
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

  const currentSectionData = sections[currentSection];
  const isLastSection = currentSection === sections.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* Header with logo and progress */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <img src={logo} alt="ReflectAI" className="h-10 w-auto" />
            <span className="text-2xl font-bold text-white">ReflectAI</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-blue-300 text-sm">{currentSection + 1} of {sections.length}</span>
            <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                style={{ width: `${((currentSection + 1) / sections.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="min-h-[500px]"
            >
              {currentSectionData.content}
            </motion.div>
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="flex justify-between items-center mt-12">
            <button
              onClick={prevSection}
              disabled={currentSection === 0}
              className={`flex items-center space-x-2 px-6 py-3 rounded-2xl border-2 transition-all duration-300 ${
                currentSection === 0
                  ? 'border-slate-700 bg-slate-800/50 text-slate-500 cursor-not-allowed'
                  : 'border-blue-700/50 bg-slate-800/50 text-blue-300 hover:border-blue-500/50 hover:bg-slate-700/50 backdrop-blur-sm'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {isLastSection ? (
              <button
                onClick={handleSubmit}
                className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl border-2 border-blue-500 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 backdrop-blur-sm shadow-lg"
              >
                <span className="font-semibold">Find My Counselor</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={nextSection}
                className="flex items-center space-x-2 px-6 py-3 rounded-2xl border-2 border-blue-700/50 bg-slate-800/50 text-blue-300 hover:border-blue-500/50 hover:bg-slate-700/50 transition-all duration-300 backdrop-blur-sm"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionnaireLanding;