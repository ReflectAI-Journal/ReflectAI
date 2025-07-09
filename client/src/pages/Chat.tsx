import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { ChatProvider, useChat } from '@/contexts/ChatContext';
import ChatContainer from '@/components/chat/ChatContainer';
import { Bot, MessageSquare, Lightbulb, Brain, Heart, Users, Target, Clock, Smile, Shield, BarChart3, Network, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import BackButton from '@/components/layout/BackButton';

const counselingTips = [
  { text: "Take deep breaths when feeling overwhelmed. Your mental health matters.", category: "Wellness", icon: Heart },
  { text: "Set small, achievable goals daily. Progress is progress, no matter how small.", category: "Growth", icon: Target },
  { text: "It's okay to ask for help. Seeking support shows strength, not weakness.", category: "Support", icon: Users },
  { text: "Practice self-compassion. Treat yourself with the kindness you'd show a friend.", category: "Self-Care", icon: Smile },
  { text: "Remember that difficult emotions are temporary. This too shall pass.", category: "Resilience", icon: Shield },
];

const supportTopics = [
  { icon: Heart, title: "Emotional Support", description: "Process feelings & emotions", color: "bg-red-500" },
  { icon: Target, title: "Goal Setting", description: "Achieve your aspirations", color: "bg-blue-500" },
  { icon: Users, title: "Relationships", description: "Navigate social connections", color: "bg-green-500" },
  { icon: Clock, title: "Time Management", description: "Organize your schedule", color: "bg-yellow-500" },
  { icon: Smile, title: "Self-Care", description: "Prioritize your wellbeing", color: "bg-purple-500" },
  { icon: Shield, title: "Stress Relief", description: "Manage anxiety & pressure", color: "bg-indigo-500" }
];

const quickPrompts = [
  "I'm feeling overwhelmed with work and need guidance",
  "How can I improve my daily productivity?",
  "I'm struggling with a difficult decision",
  "Help me manage stress and anxiety",
  "I need motivation to reach my goals",
  "How can I build better relationships?"
];

// Wrapper component to handle chat type from URL and initialize
const ChatWrapper = () => {
  const { changeSupportType } = useChat();
  const [location] = useLocation();
  
  useEffect(() => {
    // Check if the URL has a type parameter
    const searchParams = new URLSearchParams(location.split('?')[1] || '');
    const chatType = searchParams.get('type');
    
    if (chatType === 'philosophy') {
      changeSupportType('philosophy');
    }
  }, [location, changeSupportType]);
  
  return <ChatContainer />;
};

const ChatPage: React.FC = () => {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const chatType = searchParams.get('type');
  const [currentTip] = useState(() => 
    counselingTips[Math.floor(Math.random() * counselingTips.length)]
  );
  
  // Determine if we're in philosophy mode
  const isPhilosophyMode = chatType === 'philosophy';
  
  // Function to handle support topic clicks
  const handleSupportTopicClick = (topic: { title: string; description: string }) => {
    const prompts = {
      "Emotional Support": "I'm going through some difficult emotions and could use support processing my feelings.",
      "Goal Setting": "I want to set some meaningful goals and create a plan to achieve them.",
      "Relationships": "I'm having challenges in my relationships and need guidance on how to improve them.",
      "Time Management": "I'm struggling with managing my time effectively and staying organized.",
      "Self-Care": "I need help developing better self-care practices and prioritizing my wellbeing.",
      "Stress Relief": "I'm feeling overwhelmed with stress and anxiety and need coping strategies."
    };
    
    const prompt = prompts[topic.title as keyof typeof prompts] || `I'd like guidance with ${topic.title.toLowerCase()}.`;
    
    // Dispatch a custom event to set the chat input
    window.dispatchEvent(new CustomEvent('setChatInput', { detail: prompt }));
  };
  
  return (
    <div className="min-h-screen overflow-y-auto">
      <div className="max-w-7xl mx-auto p-6 md:p-8 lg:p-12">
        <div className="flex items-start gap-3 mb-8">
          <BackButton className="mt-1" />
          <div className="flex items-center">
            <div className={`h-12 w-12 rounded-lg ${isPhilosophyMode ? 'bg-purple-600' : 'bg-gradient-to-r from-primary to-violet-600'} flex items-center justify-center text-white mr-4 shadow-sm`}>
              {isPhilosophyMode ? <Brain className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
            </div>
            <div>
              <h1 className="text-3xl font-header font-bold mb-2 text-primary">
                {isPhilosophyMode ? 'Philosopher' : 'Counselor'}
              </h1>
              <p className="text-muted-foreground">
                {isPhilosophyMode 
                  ? 'Engage in deep philosophical discussions about existence, knowledge, ethics, and meaning'
                  : 'Your personal AI counselor for emotional support, guidance, and personal growth'
                }
              </p>
            </div>
          </div>
        </div>
        
        {/* Main Chat Area */}
        <div className="mb-8">
          <ChatProvider>
            <ChatWrapper />
          </ChatProvider>
        </div>
        
        {/* Counseling Content Below Chat */}
        <div className="grid grid-cols-1 gap-6">
          {/* Support Topics */}
          <Card className="p-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Support Areas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {supportTopics.map((topic, index) => {
                  const IconComponent = topic.icon;
                  return (
                    <div 
                      key={index} 
                      className="p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer hover:shadow-sm"
                      onClick={() => handleSupportTopicClick(topic)}
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
          
          {/* Session Reviews Navigation */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <Link href="/app/mind-patterns">
              <Button 
                className="flex-1 h-16 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <Network className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-base">Mind Patterns</div>
                      <div className="text-sm text-white/80">Review your counseling insights</div>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </Button>
            </Link>
            
            <Link href="/app/stats">
              <Button 
                className="flex-1 h-16 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-base">Session Stats</div>
                      <div className="text-sm text-white/80">Track your progress & growth</div>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;