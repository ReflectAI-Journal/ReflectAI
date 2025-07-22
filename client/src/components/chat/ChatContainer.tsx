import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bot, AlertTriangle, Smile, Brain, Lightbulb, Maximize2, UserCheck, ArrowRight } from 'lucide-react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';
import { PersonalitySelector } from './PersonalitySelector';
import DistractionFreeMode from './DistractionFreeMode';
import { SessionUsageDisplay } from './SessionUsageDisplay';
import { VoiceControls, useTextToSpeech } from './VoiceControls';
import { useChat, ChatSupportType } from '@/contexts/ChatContext';

const ChatContainer: React.FC = () => {
  const { messages, supportType, changeSupportType, error, isDistractionFreeMode, toggleDistractionFreeMode, sendMessage } = useChat();
  const [, navigate] = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const { speakText } = useTextToSpeech();
  
  // Fetch user data to check questionnaire completion status
  const { data: user } = useQuery({
    queryKey: ['/api/user'],
    enabled: true
  });

  // Auto-speak AI responses when voice is enabled
  useEffect(() => {
    if (isVoiceEnabled && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant') {
        // Delay speech slightly to allow UI to update
        setTimeout(() => {
          speakText(lastMessage.content);
        }, 500);
      }
    }
  }, [messages, isVoiceEnabled, speakText]);

  // Auto-scroll to bottom on new messages (within container only)
  useEffect(() => {
    if (messagesEndRef.current) {
      const container = messagesEndRef.current.closest('.overflow-y-auto');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }, [messages]);

  const supportTypes = [
    { value: 'general', label: 'General Advice', icon: <Lightbulb className="h-4 w-4 mr-2" /> },
    { value: 'emotional', label: 'Emotional Support', icon: <Smile className="h-4 w-4 mr-2" /> },
    { value: 'productivity', label: 'Productivity Coach', icon: <Brain className="h-4 w-4 mr-2" /> },
    { value: 'philosophy', label: 'Philosophical Insight', icon: <Brain className="h-4 w-4 mr-2 text-purple-500" /> },
  ];

  const selectedType = supportTypes.find(type => type.value === supportType) || supportTypes[0];

  return (
    <div className="w-full flex flex-col bg-background rounded-lg border border-border/30 shadow-sm" style={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}>
      
      {/* Header with personality selector and distraction-free mode toggle */}
      <div className="flex items-center justify-between px-3 sm:px-6 py-2 sm:py-3 border-b border-border/30 bg-card/50 rounded-t-lg flex-shrink-0">
        <div className="flex items-center flex-1 min-w-0">
          <PersonalitySelector className="w-full max-w-[200px] sm:max-w-[250px]" />
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDistractionFreeMode}
          className="h-8 w-8 text-muted-foreground hover:text-foreground flex-shrink-0 ml-2"
          title="Enter distraction-free mode"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Messages area with proper overflow and padding */}
      <div className="flex-1 overflow-y-auto bg-background" style={{ minHeight: 0 }}>
        <div className="px-3 sm:px-6 py-4 sm:py-6">
          <div className="w-full max-w-4xl mx-auto space-y-4 sm:space-y-6">
            {messages.map(message => (
              <ChatBubble key={message.id} message={message} />
            ))}
            
            {error && (
              <Alert variant="destructive" className="my-4 rounded-xl border-0 bg-red-50 dark:bg-red-950/20 w-full max-w-2xl mx-auto">
                <AlertTriangle className="h-4 w-4 mr-2" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>
      
      {/* Session usage and voice controls */}
      <div className="px-3 sm:px-6 py-2 border-t border-border/30 bg-card/20">
        <div className="w-full max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <SessionUsageDisplay className="flex-1" />
            <VoiceControls
              onVoiceMessage={(text) => sendMessage(text)}
              onVoiceToggle={setIsVoiceEnabled}
              isVoiceEnabled={isVoiceEnabled}
              isLoading={false}
            />
          </div>
        </div>
      </div>

      {/* Input area fixed at bottom */}
      <div className="p-3 sm:p-4 border-t border-border/30 bg-card/30 rounded-b-lg flex-shrink-0">
        <div className="w-full max-w-4xl mx-auto">
          <ChatInput />
        </div>
      </div>
      
      {/* Distraction-free mode overlay */}
      {isDistractionFreeMode && <DistractionFreeMode />}
      
      {/* Find Your Counselor Button - Show below chat container if questionnaire not completed */}
      {!(user as any)?.completedCounselorQuestionnaire && (
        <div className="mt-4 flex justify-center">
          <Button 
            variant="outline"
            onClick={() => navigate('/counselor-questionnaire')}
            className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-2 border-blue-200 dark:border-blue-800 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30 text-primary font-medium group px-6 py-2"
          >
            <UserCheck className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
            Find the right counselor for you
            <ArrowRight className="h-3 w-3 ml-2 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ChatContainer;