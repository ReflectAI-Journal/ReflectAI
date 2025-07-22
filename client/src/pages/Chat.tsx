import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ChatProvider, useChat } from '@/contexts/ChatContext';
import ChatContainer from '@/components/chat/ChatContainer';
import { Bot, Brain, Heart, Users, Target, Clock, Smile, Shield, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

import BackButton from '@/components/layout/BackButton';

const supportTopics = [
  { icon: Heart, title: "Emotional Support", description: "Process feelings & emotions", color: "bg-red-500" },
  { icon: Target, title: "Goal Setting", description: "Achieve your aspirations", color: "bg-blue-500" },
  { icon: Users, title: "Relationships", description: "Navigate social connections", color: "bg-green-500" },
  { icon: Clock, title: "Time Management", description: "Organize your schedule", color: "bg-yellow-500" },
  { icon: Smile, title: "Self-Care", description: "Prioritize your wellbeing", color: "bg-purple-500" },
  { icon: Shield, title: "Stress Relief", description: "Manage anxiety & pressure", color: "bg-indigo-500" }
];

// Wrapper component to handle chat type from URL and initialize
const ChatWrapper = () => {
  const { changeSupportType } = useChat();
  const [location] = useLocation();
  
  // No access restrictions - all plans have counselor access
  
  useEffect(() => {
    // Check if the URL has a type parameter
    const searchParams = new URLSearchParams(location.split('?')[1] || '');
    const chatType = searchParams.get('type');
    const mode = searchParams.get('mode');
    
    if (chatType === 'philosophy') {
      changeSupportType('philosophy');
    }
    
    // Handle check-up mode
    if (mode === 'checkup') {
      const checkUpPrompt = `Hi! I'm here for a check-up session to review my progress with our previous counseling conversations. I'd like to discuss:

1. How I've been implementing the guidance from our past sessions
2. What challenges I've faced in applying your advice
3. Any new insights or developments in my emotional wellbeing
4. Areas where I feel I've made progress
5. Topics or strategies that need revisiting

Could you help me reflect on my journey and identify next steps for continued growth?`;
      
      // Dispatch event to set the initial check-up message
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('setChatInput', { detail: checkUpPrompt }));
      }, 500);
    }
  }, [location, changeSupportType]);
  
  return <ChatContainer />;
};

const ChatPage: React.FC = () => {
  const [location, navigate] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const chatType = searchParams.get('type');
  const mode = searchParams.get('mode');
  
  // Fetch user data to check questionnaire completion status
  const { data: user } = useQuery({
    queryKey: ['/api/user'],
    enabled: true
  });
  
  // Determine if we're in philosophy mode or check-up mode
  const isPhilosophyMode = chatType === 'philosophy';
  const isCheckUpMode = mode === 'checkup';
  
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
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-background to-muted/10">
      
      {/* Header - Compact and clean */}
      <div className="flex-shrink-0 border-b bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <BackButton className="flex-shrink-0" />
          <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${isPhilosophyMode ? 'bg-purple-600' : 'bg-gradient-to-r from-primary to-violet-600'} text-white shadow-sm`}>
            {isPhilosophyMode ? <Brain className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-violet-600 bg-clip-text text-transparent">
              {isPhilosophyMode ? 'Philosopher' : isCheckUpMode ? 'Check-Up Session' : 'AI Counselor'}
            </h1>
            <p className="text-sm text-muted-foreground truncate">
              {isPhilosophyMode 
                ? 'Deep philosophical discussions and insights'
                : isCheckUpMode
                ? 'Review your progress and growth'
                : 'Personal support and guidance'
              }
            </p>
          </div>
          
          {/* Questionnaire reminder - compact */}
          {!isPhilosophyMode && !isCheckUpMode && !(user as any)?.completedCounselorQuestionnaire && (
            <Button 
              onClick={() => navigate('/counselor-questionnaire')}
              variant="outline"
              size="sm"
              className="flex-shrink-0 text-xs"
            >
              <UserCheck className="h-4 w-4 mr-1" />
              Find Match
            </Button>
          )}
        </div>
        
        {/* Check-up mode indicator */}
        {isCheckUpMode && (
          <div className="px-4 pb-3">
            <div className="bg-primary/10 rounded-lg px-3 py-2 border border-primary/20">
              <p className="text-xs text-primary font-medium">
                🔄 Ready to review your counseling journey and identify next steps
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area - Full height chat */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Support Topics Sidebar - Desktop only */}
        {!isCheckUpMode && (
          <div className="hidden lg:flex flex-col w-72 border-r bg-background/50 backdrop-blur-sm">
            <div className="p-4 border-b">
              <div className="flex items-center gap-2 mb-3">
                <Heart className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm">Quick Start Topics</h3>
              </div>
              <p className="text-xs text-muted-foreground">Click any topic to begin your conversation</p>
            </div>
            
            <div className="flex-1 p-4 space-y-2 overflow-y-auto">
              {supportTopics.map((topic, index) => {
                const IconComponent = topic.icon;
                return (
                  <button 
                    key={index} 
                    onClick={() => handleSupportTopicClick(topic)}
                    className="w-full p-3 rounded-lg border hover:bg-muted/50 transition-all duration-200 cursor-pointer hover:shadow-sm hover:border-primary/30 group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 ${topic.color} rounded-lg flex items-center justify-center text-white group-hover:scale-105 transition-transform`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{topic.title}</h4>
                        <p className="text-xs text-muted-foreground">{topic.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Chat Area - Takes remaining space */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <ChatProvider>
            <ChatWrapper />
          </ChatProvider>
        </div>
      </div>

      {/* Mobile Support Topics - Bottom sheet style */}
      {!isCheckUpMode && (
        <div className="lg:hidden border-t bg-background/80 backdrop-blur-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm">Quick Topics</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {supportTopics.map((topic, index) => {
              const IconComponent = topic.icon;
              return (
                <button 
                  key={index} 
                  onClick={() => handleSupportTopicClick(topic)}
                  className="p-2 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer hover:border-primary/30 group text-center"
                >
                  <div className={`w-6 h-6 ${topic.color} rounded-md flex items-center justify-center text-white group-hover:scale-105 transition-transform mx-auto mb-1`}>
                    <IconComponent className="h-3 w-3" />
                  </div>
                  <h4 className="font-medium text-xs">{topic.title}</h4>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;