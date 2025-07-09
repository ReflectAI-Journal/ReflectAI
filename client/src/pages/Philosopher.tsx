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
  { icon: Brain, title: "Consciousness", description: "What makes us aware?", color: "bg-purple-500" },
  { icon: BookOpen, title: "Ethics", description: "What is right and wrong?", color: "bg-blue-500" },
  { icon: Lightbulb, title: "Knowledge", description: "How do we know truth?", color: "bg-yellow-500" },
  { icon: Sparkles, title: "Existence", description: "Why do we exist?", color: "bg-green-500" },
  { icon: Clock, title: "Time", description: "What is time's nature?", color: "bg-red-500" },
  { icon: Zap, title: "Free Will", description: "Are we truly free?", color: "bg-indigo-500" }
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
  
  return (
    <div className="min-h-screen overflow-y-auto">
      <div className="max-w-7xl mx-auto p-6 md:p-8 lg:p-12">
        <div className="flex items-start gap-3 mb-8">
          <BackButton className="mt-1" />
        </div>
        
        {/* Header and Text Input at Top */}
        <ChatProvider>
          <div className="max-w-6xl mx-auto mb-8">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-6 px-1">
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
            
            {/* Text Input */}
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl border border-gray-200/30 dark:border-gray-700/30 p-4 focus-within:border-purple-500/30 focus-within:shadow-lg">
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-sm">
                  <Brain className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  placeholder="Ask a profound philosophical question..."
                  className="flex-1 bg-transparent border-0 focus:outline-none text-lg placeholder:text-muted-foreground"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      const event = new CustomEvent('setPhilosopherInput', { detail: e.currentTarget.value });
                      window.dispatchEvent(event);
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </ChatProvider>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Philosophical Content */}
          <div className="lg:col-span-1 space-y-6">
            {/* Daily Quote */}
            <Card className="border-l-4 border-l-indigo-500">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Quote className="h-5 w-5 text-indigo-500" />
                  Philosophical Insight
                </CardTitle>
              </CardHeader>
              <CardContent>
                <blockquote className="text-sm italic text-muted-foreground mb-2">
                  "{currentQuote.text}"
                </blockquote>
                <div className="flex justify-between items-center">
                  <cite className="text-xs font-medium">— {currentQuote.author}</cite>
                  <span className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded">
                    {currentQuote.theme}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Philosophical Topics */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Explore Topics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {philosophicalTopics.map((topic, index) => {
                    const IconComponent = topic.icon;
                    return (
                      <div key={index} className="p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className={`w-8 h-8 ${topic.color} rounded-md flex items-center justify-center text-white mb-2`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <h4 className="font-medium text-sm">{topic.title}</h4>
                        <p className="text-xs text-muted-foreground">{topic.description}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Quick Questions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Deep Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {philosophicalQuestions.slice(0, 4).map((question, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full text-left justify-start text-sm h-auto p-2 hover:bg-muted/50"
                      onClick={() => {
                        // This would set the input in the chat component
                        const event = new CustomEvent('setPhilosopherInput', { detail: question });
                        window.dispatchEvent(event);
                      }}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Chat Area */}
          <div className="lg:col-span-2">
            <ChatProvider>
              <PhilosopherChat />
            </ChatProvider>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhilosopherPage;