import React from 'react';
import { useLocation } from 'wouter';
import { ChatProvider } from '@/contexts/ChatContext';
import { Brain } from 'lucide-react';
import BackButton from '@/components/layout/BackButton';
import PhilosopherChat from '@/components/philosopher/PhilosopherChat';

const philosophicalTopics = [
  {
    category: "Existence",
    icon: <Brain className="h-5 w-5" />,
    questions: [
      "What is the meaning of life?",
      "How do we find purpose in a seemingly random universe?",
      "Is there an objective reality, or is everything subjective?",
      "How do we reconcile our mortality with our desire for significance?"
    ]
  },
  {
    category: "Ethics",
    icon: <BookOpen className="h-5 w-5" />,
    questions: [
      "What makes an action morally good or bad?",
      "Do moral truths exist independently of culture and time?",
      "How do we balance personal happiness with moral duty?",
      "Is it better to be just or to appear just?"
    ]
  },
  {
    category: "Knowledge",
    icon: <Lightbulb className="h-5 w-5" />,
    questions: [
      "How do we know what we claim to know?",
      "What are the limits of human understanding?",
      "Is certainty possible, or are all beliefs tentative?",
      "How should we respond to the unknown?"
    ]
  },
  {
    category: "Consciousness",
    icon: <MessageCircle className="h-5 w-5" />,
    questions: [
      "What is the nature of consciousness?",
      "How does the mind relate to the physical world?",
      "Could artificial intelligence ever be truly conscious?",
      "Are we more than our thoughts and memories?"
    ]
  }
];

const PhilosopherPage: React.FC = () => {
  const [, setLocation] = useLocation();
  
  return (
    <div className="min-h-screen p-6 md:p-8 lg:p-12 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-start gap-3 mb-8">
          <BackButton className="mt-1" />
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-lg bg-indigo-600 flex items-center justify-center text-white mr-4 shadow-sm">
              <Brain className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-header font-bold mb-2 text-indigo-600">
                Philosopher
              </h1>
              <p className="text-muted-foreground">
                Engage in deep philosophical discourse and explore life's profound questions
              </p>
            </div>
          </div>
        </div>
        
        <div className="w-full">
          <ChatProvider>
            <PhilosopherChat />
          </ChatProvider>
        </div>
      </div>
    </div>
  );
};

export default PhilosopherPage;