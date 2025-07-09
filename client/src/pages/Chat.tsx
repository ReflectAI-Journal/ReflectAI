import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { ChatProvider, useChat } from '@/contexts/ChatContext';
import ChatContainer from '@/components/chat/ChatContainer';
import { Bot, MessageSquare, Lightbulb, Brain, Heart, Users, Target, Clock, Smile, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Support Areas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {supportTopics.map((topic, index) => {
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
        </div>
      </div>
    </div>
  );
};

export default ChatPage;