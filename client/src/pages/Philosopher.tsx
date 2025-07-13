import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { ChatProvider } from '@/contexts/ChatContext';
import { Brain, BookOpen, Lightbulb, Quote, Sparkles, Clock, Zap } from 'lucide-react';
import BackButton from '@/components/layout/BackButton';
import PhilosopherChat from '@/components/philosopher/PhilosopherChat';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const dailyPhilosophicalQuestions = [
  "If you could know the exact moment of your death, would you want to know?",
  "Is it possible to live a meaningful life without suffering?",
  "Do we have a moral obligation to help others, even at personal cost?",
  "What makes you 'you' if every cell in your body replaces itself over time?",
  "Is free will an illusion, or do we truly control our choices?",
  "Can something be morally right for one person but wrong for another?",
  "If we could eliminate all negative emotions, should we?",
  "What is the difference between existing and truly living?",
  "Is knowledge always good, or are some truths better left unknown?",
  "Do we love people for who they are, or for how they make us feel?",
  "If artificial intelligence becomes conscious, would it have rights?",
  "Is the pursuit of happiness a worthy life goal, or a distraction?",
  "What would you do if you discovered free will doesn't exist?",
  "Can we ever truly know another person's inner experience?",
  "Is it better to be a happy fool or a miserable genius?"
];

// Get daily question based on current date
const getDailyQuestion = () => {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
  return dailyPhilosophicalQuestions[dayOfYear % dailyPhilosophicalQuestions.length];
};

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
  const [dailyQuestion] = useState(() => getDailyQuestion());
  
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
      <div className="min-h-screen overflow-y-auto bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      {/* Philosophical Header Section */}
      <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border-b border-purple-500/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white shadow-2xl border-2 border-purple-400/30">
                <Brain className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-300 to-indigo-300 bg-clip-text text-transparent">
                  Philosopher
                </h1>
                <p className="text-purple-300/70 text-sm italic">Explore the depths of thought</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-purple-300/60">Mode</span>
              <div className="bg-purple-900/40 border border-purple-400/30 rounded-lg px-4 py-2 min-w-[120px] backdrop-blur-sm">
                <span className="text-sm font-medium text-purple-200">Contemplative</span>
              </div>
            </div>
          </div>
        </div>
      </div>



      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-start gap-3 mb-6">
          <BackButton className="mt-1" />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Main Chat Area - Takes 3 columns */}
          <div className="lg:col-span-3">
            <div className="bg-gradient-to-br from-slate-800/50 to-purple-900/20 rounded-2xl border border-purple-500/20 backdrop-blur-sm shadow-2xl">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                    <Brain className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold text-purple-200">Philosophical Dialogue</h2>
                </div>
                <PhilosopherChat />
              </div>
            </div>
          </div>

          {/* Daily Question Sidebar - Takes 1 column */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-slate-800/40 to-purple-900/10 rounded-xl border border-purple-500/20 backdrop-blur-sm p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Lightbulb className="h-5 w-5 text-purple-400" />
                <h3 className="text-lg font-bold text-purple-200">Today's Question</h3>
              </div>
              <div className="space-y-4">
                <p className="text-sm text-purple-300/80 leading-relaxed italic">
                  "{dailyQuestion}"
                </p>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-left p-3 h-auto bg-gradient-to-r from-slate-700/20 to-purple-800/20 border border-purple-500/10 hover:from-purple-700/30 hover:to-indigo-700/30 text-purple-200 hover:text-purple-100 transition-all duration-300"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('setPhilosopherInput', { detail: dailyQuestion }));
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 flex-shrink-0" />
                    <span className="text-xs">Explore this question</span>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Philosophical Exploration Section - Below chat */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Philosophical Topics */}
          <div className="bg-gradient-to-br from-slate-800/40 to-purple-900/10 rounded-xl border border-purple-500/20 backdrop-blur-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <Lightbulb className="h-6 w-6 text-purple-400" />
              <h3 className="text-xl font-bold text-purple-200">Explore Philosophical Realms</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {philosophicalTopics.map((topic, index) => {
                const IconComponent = topic.icon;
                return (
                  <div 
                    key={index} 
                    className="group p-4 rounded-lg border border-purple-500/20 bg-gradient-to-br from-slate-700/30 to-purple-800/20 hover:from-purple-700/30 hover:to-indigo-800/30 transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-105"
                    onClick={() => handlePhilosophicalTopicClick(topic)}
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform">
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <h4 className="font-semibold text-sm text-purple-200 mb-1">{topic.title}</h4>
                    <p className="text-xs text-purple-300/70">{topic.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Philosophical Questions */}
          <div className="bg-gradient-to-br from-slate-800/40 to-indigo-900/10 rounded-xl border border-purple-500/20 backdrop-blur-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="h-6 w-6 text-indigo-400" />
              <h3 className="text-xl font-bold text-purple-200">Eternal Questions</h3>
            </div>
            <div className="space-y-3">
              {philosophicalQuestions.slice(0, 6).map((question, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start text-left p-4 h-auto bg-gradient-to-r from-slate-700/20 to-indigo-800/20 border border-purple-500/10 hover:from-purple-700/30 hover:to-indigo-700/30 text-purple-200 hover:text-purple-100 transition-all duration-300"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('setPhilosopherInput', { detail: question }));
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-purple-400 mt-2 flex-shrink-0" />
                    <span className="text-sm leading-relaxed">{question}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Philosophical Wisdom Footer */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 text-purple-400/60 text-sm">
            <Sparkles className="h-4 w-4" />
            <span className="italic">Think deeply, question boldly, live wisely</span>
            <Sparkles className="h-4 w-4" />
          </div>
        </div>
      </div>
    </div>
    </ChatProvider>
  );
};

export default PhilosopherPage;