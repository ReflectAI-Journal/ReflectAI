import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { ChatProvider, useChat } from '@/contexts/ChatContext';
import ChatContainer from '@/components/chat/ChatContainer';
import { Bot, MessageSquare, Lightbulb, Brain, Heart, Users, Target, Clock, Smile, Shield, BarChart3, Network, ArrowRight, PenTool, UserCheck, ClipboardCheck } from 'lucide-react';
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

// Wrapper component to handle chat type from URL and initialize
const ChatWrapper = () => {
  const { changeSupportType } = useChat();
  const [location] = useLocation();
  
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
  const [currentTip] = useState(() => 
    counselingTips[Math.floor(Math.random() * counselingTips.length)]
  );
  
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="app-container py-6">
        
        {/* Header Section */}
        <div className="flex items-start gap-4 mb-8">
          <BackButton className="mt-1" />
          <div className="flex-1">
            <div className="flex items-center mb-4">
              <div className={`h-14 w-14 rounded-xl ${isPhilosophyMode ? 'bg-purple-600' : 'bg-gradient-to-r from-primary to-violet-600'} flex items-center justify-center text-white mr-4 shadow-lg`}>
                {isPhilosophyMode ? <Brain className="h-7 w-7" /> : <Bot className="h-7 w-7" />}
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-violet-600 bg-clip-text text-transparent">
                  {isPhilosophyMode ? 'Philosopher' : isCheckUpMode ? 'Counselor Check-Up' : 'Counselor'}
                </h1>
                <p className="text-lg text-muted-foreground">
                  {isPhilosophyMode 
                    ? 'Engage in deep philosophical discussions about existence, knowledge, ethics, and meaning'
                    : isCheckUpMode
                    ? 'Review your progress and discuss how you\'ve been implementing guidance from previous sessions'
                    : 'Your personal AI counselor for emotional support, guidance, and personal growth'
                  }
                </p>
              </div>
            </div>
            
            {/* Daily Tip Card */}
            {!isPhilosophyMode && !isCheckUpMode && (
              <Card className="mb-6 bg-gradient-to-r from-primary/5 to-violet-500/5 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <currentTip.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-primary px-2 py-1 bg-primary/10 rounded-full">
                          {currentTip.category}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{currentTip.text}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {isCheckUpMode && (
              <div className="mb-6 p-3 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-sm text-primary font-medium">
                  🔄 Check-Up Session: Ready to review your counseling journey and identify next steps for growth
                </p>
              </div>
            )}
            
            {/* Questionnaire Call-to-Action */}
            {!isPhilosophyMode && !isCheckUpMode && (
              <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-2 border-blue-200 dark:border-blue-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600 rounded-xl">
                      <ClipboardCheck className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                        Get Your Perfect Counselor Match
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        Take our detailed questionnaire to create an AI counselor specifically tailored to your needs, communication style, and mental health goals.
                      </p>
                      <div className="flex gap-3">
                        <Button 
                          onClick={() => navigate('/counselor-questionnaire')}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                        >
                          <UserCheck className="h-4 w-4 mr-2" />
                          Find My Counselor
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            const prompt = "I'd like to start a counseling session. Please help me identify what I need support with today.";
                            window.dispatchEvent(new CustomEvent('setChatInput', { detail: prompt }));
                          }}
                          className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-950/30"
                        >
                          Start General Session
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        
        {/* Layout: Mobile-first with Chat at top, Desktop with sidebar */}
        <div className="section-spacing">
          
          {/* Mobile Chat Area - Show first on mobile */}
          <div className="lg:hidden">
            <ChatProvider>
              <ChatWrapper />
            </ChatProvider>
          </div>
          
          {/* Desktop: Two Column Layout */}
          <div className="hidden lg:grid lg:grid-cols-3 gap-8">
            
            {/* Left Column - Support Topics & Quick Actions */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Support Topics - Hide in check-up mode */}
              {!isCheckUpMode && (
                <Card className="border-border/40 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Heart className="h-5 w-5 text-primary" />
                      Support Areas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {supportTopics.map((topic, index) => {
                      const IconComponent = topic.icon;
                      return (
                        <div 
                          key={index} 
                          className="p-3 rounded-lg border hover:bg-muted/30 transition-colors cursor-pointer hover:shadow-sm hover:border-primary/30 group"
                          onClick={() => handleSupportTopicClick(topic)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 ${topic.color} rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                              <IconComponent className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{topic.title}</h4>
                              <p className="text-xs text-muted-foreground">{topic.description}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              )}
              

            </div>
            
            {/* Right Column - Main Chat Area (Desktop only) */}
            <div className="lg:col-span-2">
              <ChatProvider>
                <ChatWrapper />
              </ChatProvider>
            </div>
          </div>
          
          {/* Mobile Support Topics - Show after chat on mobile */}
          {!isCheckUpMode && (
            <div className="lg:hidden">
              <Card className="border-border/40 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Heart className="h-5 w-5 text-primary" />
                    Support Areas
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3">
                  {supportTopics.map((topic, index) => {
                    const IconComponent = topic.icon;
                    return (
                      <div 
                        key={index} 
                        className="p-3 rounded-lg border hover:bg-muted/30 transition-colors cursor-pointer hover:shadow-sm hover:border-primary/30 group"
                        onClick={() => handleSupportTopicClick(topic)}
                      >
                        <div className="text-center">
                          <div className={`w-8 h-8 ${topic.color} rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform mx-auto mb-2`}>
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <h4 className="font-medium text-xs">{topic.title}</h4>
                          <p className="text-xs text-muted-foreground hidden">{topic.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          )}
          

        </div>
      </div>
    </div>
  );
};

export default ChatPage;