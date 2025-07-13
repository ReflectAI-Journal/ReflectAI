import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { ChatProvider } from '@/contexts/ChatContext';
import { Brain, BookOpen, Lightbulb, Quote, Sparkles, Clock, Zap } from 'lucide-react';
import BackButton from '@/components/layout/BackButton';
import PhilosopherChat from '@/components/philosopher/PhilosopherChat';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const philosophicalQuotes = [
  { text: "The unexamined life is not worth living.", author: "Socrates", theme: "Self-Knowledge" },
  { text: "I think, therefore I am.", author: "René Descartes", theme: "Existence" },
  { text: "Man is condemned to be free.", author: "Jean-Paul Sartre", theme: "Freedom" },
  { text: "The only true wisdom is in knowing you know nothing.", author: "Socrates", theme: "Wisdom" },
  { text: "What does not destroy me, makes me stronger.", author: "Friedrich Nietzsche", theme: "Resilience" },
  { text: "To be is to do.", author: "Immanuel Kant", theme: "Action" }
];

const philosophicalTopics = [
  { icon: Brain, title: "Consciousness", description: "What makes us aware?", color: "bg-purple-600" },
  { icon: BookOpen, title: "Ethics", description: "What is right and wrong?", color: "bg-blue-600" },
  { icon: Lightbulb, title: "Knowledge", description: "How do we know truth?", color: "bg-yellow-600" },
  { icon: Sparkles, title: "Existence", description: "Why do we exist?", color: "bg-green-600" },
  { icon: Clock, title: "Time", description: "What is time's nature?", color: "bg-orange-600" },
  { icon: Zap, title: "Free Will", description: "Are we truly free?", color: "bg-red-600" }
];

const philosophicalQuestions = [
  "What is the meaning of life?",
  "Do we have free will?",
  "What is consciousness?",
  "Is there objective truth?",
  "What makes an action moral?",
  "Does God exist?",
  "What is the nature of time?",
  "Is reality an illusion?"
];

const PhilosopherPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const [currentQuote] = useState(() => 
    philosophicalQuotes[Math.floor(Math.random() * philosophicalQuotes.length)]
  );
  
  // Function to handle philosophical topic clicks
  const handlePhilosophicalTopicClick = (topic: { title: string; description: string }) => {
    const prompts = {
      "Consciousness": "What is consciousness? How does subjective experience arise from physical processes in the brain?",
      "Ethics": "What makes an action morally right or wrong? How should we determine what is ethical?",
      "Knowledge": "How do we know what we know? What is the difference between knowledge, belief, and truth?",
      "Existence": "Why does anything exist at all? What is the meaning and purpose of existence?",
      "Time": "What is the nature of time? Is time real or just an illusion of consciousness?",
      "Free Will": "Do we truly have free will, or are our actions determined by prior causes?"
    };
    
    const prompt = prompts[topic.title as keyof typeof prompts] || `I'd like to explore the philosophical concept of ${topic.title.toLowerCase()}.`;
    
    // Dispatch a custom event to set the philosopher chat input
    window.dispatchEvent(new CustomEvent('setPhilosopherInput', { detail: prompt }));
  };
  
  return (
    <ChatProvider>
      <div className="min-h-screen overflow-y-auto">
      {/* Header Section at Very Top */}
      <div className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
                <Brain className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Philosopher</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Personality</span>
              <div className="bg-card border border-border rounded-lg px-3 py-2 min-w-[120px]">
                <span className="text-sm font-medium">Default</span>
              </div>
            </div>
          </div>
        </div>
      </div>



      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-start gap-3 mb-6">
          <BackButton className="mt-1" />
        </div>

        {/* Main Chat Area */}
        <div className="mb-8">
          <PhilosopherChat />
        </div>

        {/* Philosophical Content Below Chat */}
        <div className="grid grid-cols-1 gap-6">
          {/* Philosophical Topics */}
          <Card className="p-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Explore Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {philosophicalTopics.map((topic, index) => {
                  const IconComponent = topic.icon;
                  return (
                    <div 
                      key={index} 
                      className="p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer hover:shadow-sm"
                      onClick={() => handlePhilosophicalTopicClick(topic)}
                    >
                      <div className={`w-10 h-10 ${topic.color} rounded-md flex items-center justify-center text-white mb-3`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <h4 className="font-medium text-sm">{topic.title}</h4>
                      <p className="text-xs text-muted-foreground">{topic.description}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>


        </div>
      </div>
    </div>
    </ChatProvider>
  );
};

export default PhilosopherPage;