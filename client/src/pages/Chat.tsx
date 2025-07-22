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
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-blue-50/30 via-background to-violet-50/20 dark:from-slate-900 dark:via-background dark:to-slate-800">
      
      {/* Header with enhanced visual hierarchy */}
      <div className="flex-shrink-0 border-b border-border/50 bg-background/95 backdrop-blur-md shadow-sm">
        {/* Main header row */}
        <div className="flex items-center gap-4 px-6 py-4">
          <BackButton className="flex-shrink-0" />
          
          {/* Enhanced icon with glow */}
          <div className={`flex items-center justify-center w-12 h-12 rounded-2xl ${isPhilosophyMode ? 'bg-gradient-to-br from-purple-600 to-purple-700' : 'bg-gradient-to-br from-primary to-violet-600'} text-white shadow-lg ring-4 ring-primary/10`}>
            {isPhilosophyMode ? <Brain className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
          </div>
          
          <div className="flex-1 min-w-0">
            {/* Larger heading with better typography */}
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-violet-600 bg-clip-text text-transparent mb-1">
              {isPhilosophyMode ? 'Philosopher' : isCheckUpMode ? 'Check-Up Session' : 'AI Counselor'}
            </h1>
            
            {/* Personalized greeting */}
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">
                {user ? `Hi ${(user as any)?.name || 'there'} 👋 ` : ''}
                {isPhilosophyMode 
                  ? 'Ready for deep philosophical exploration?'
                  : isCheckUpMode
                  ? 'Time to review your journey and growth'
                  : 'What\'s on your mind today?'
                }
              </p>
            </div>
          </div>
          
          {/* Enhanced questionnaire CTA */}
          {!isPhilosophyMode && !isCheckUpMode && !(user as any)?.completedCounselorQuestionnaire && (
            <Button 
              onClick={() => navigate('/counselor-questionnaire')}
              className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white shadow-md"
              size="sm"
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Get Matched
            </Button>
          )}
        </div>
        
        {/* Warm welcome banner */}
        {!isCheckUpMode && (
          <div className="px-6 pb-4">
            <div className="bg-gradient-to-r from-primary/5 to-violet-500/5 rounded-xl px-4 py-3 border border-primary/10">
              <p className="text-sm text-muted-foreground">
                💭 <span className="font-medium">Safe space:</span> Share what's on your mind - I'm here to listen and support you.
              </p>
            </div>
          </div>
        )}
        
        {/* Check-up mode indicator with enhanced styling */}
        {isCheckUpMode && (
          <div className="px-6 pb-4">
            <div className="bg-gradient-to-r from-primary/10 to-violet-500/10 rounded-xl px-4 py-3 border border-primary/20 shadow-sm">
              <p className="text-sm text-primary font-medium">
                🔄 Ready to review your counseling journey and identify next steps for growth
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area - Full height chat */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Enhanced Support Topics Sidebar - Desktop only */}
        {!isCheckUpMode && (
          <div className="hidden lg:flex flex-col w-80 border-r border-border/50 bg-gradient-to-b from-background/80 to-muted/20 backdrop-blur-sm">
            {/* Sidebar header with better visual hierarchy */}
            <div className="p-6 border-b border-border/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Heart className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Quick Start</h2>
                  <p className="text-sm text-muted-foreground">Choose a topic to begin</p>
                </div>
              </div>
              
              {/* Primary CTA button */}
              <Button 
                onClick={() => window.dispatchEvent(new CustomEvent('setChatInput', { detail: 'Hi, I\'d like to talk about what\'s been on my mind lately.' }))}
                className="w-full bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90 text-white shadow-md mb-4"
                size="lg"
              >
                <Bot className="h-4 w-4 mr-2" />
                Start Talking
              </Button>
              
              <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
                💡 <span className="font-medium">Tip:</span> The more you share, the better I can support you
              </div>
            </div>
            
            {/* Enhanced topic buttons */}
            <div className="flex-1 p-6 space-y-3 overflow-y-auto">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Popular Topics</h3>
              {supportTopics.map((topic, index) => {
                const IconComponent = topic.icon;
                return (
                  <button 
                    key={index} 
                    onClick={() => handleSupportTopicClick(topic)}
                    className="w-full p-4 rounded-xl border border-border/50 bg-gradient-to-r from-background to-muted/20 hover:from-primary/5 hover:to-violet-500/5 hover:border-primary/30 transition-all duration-300 cursor-pointer hover:shadow-md group text-left transform hover:-translate-y-0.5"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 ${topic.color} rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-sm`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm mb-1">{topic.title}</h4>
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

      {/* Enhanced Mobile Support Topics with CTA */}
      {!isCheckUpMode && (
        <div className="lg:hidden border-t border-border/50 bg-gradient-to-r from-background/95 to-muted/10 backdrop-blur-md p-4 shadow-lg">
          {/* Mobile CTA Button */}
          <div className="mb-4">
            <Button 
              onClick={() => window.dispatchEvent(new CustomEvent('setChatInput', { detail: 'Hi, I\'d like to talk about what\'s been on my mind lately.' }))}
              className="w-full bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90 text-white shadow-md"
              size="lg"
            >
              <Bot className="h-4 w-4 mr-2" />
              Start Talking
            </Button>
          </div>
          
          <div className="flex items-center gap-2 mb-3">
            <Heart className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">Quick Topics</span>
            <div className="flex-1 h-px bg-border/50"></div>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {supportTopics.map((topic, index) => {
              const IconComponent = topic.icon;
              return (
                <button 
                  key={index} 
                  onClick={() => handleSupportTopicClick(topic)}
                  className="p-3 rounded-xl border border-border/50 bg-gradient-to-br from-background to-muted/20 hover:from-primary/5 hover:to-violet-500/5 hover:border-primary/30 transition-all duration-200 cursor-pointer hover:shadow-sm group text-center transform hover:scale-105"
                >
                  <div className={`w-8 h-8 ${topic.color} rounded-lg flex items-center justify-center text-white group-hover:scale-105 transition-transform mx-auto mb-2 shadow-sm`}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <h4 className="font-medium text-xs">{topic.title}</h4>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating Navigation Bar */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-background/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl px-6 py-3">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/app')}
              className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
            >
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <Heart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Home</span>
            </button>
            
            <button 
              onClick={() => navigate('/app/journal')}
              className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
            >
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Journal</span>
            </button>
            
            <button 
              className="flex flex-col items-center gap-1 p-2 rounded-lg bg-primary/10 border-2 border-primary/20"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-violet-600 rounded-lg flex items-center justify-center scale-110 shadow-md">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <span className="text-xs font-bold text-primary">Counselor</span>
            </button>
            
            <button 
              onClick={() => navigate('/app/patterns')}
              className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
            >
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Patterns</span>
            </button>
            
            <button 
              onClick={() => navigate('/app/profile')}
              className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
            >
              <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <UserCheck className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;