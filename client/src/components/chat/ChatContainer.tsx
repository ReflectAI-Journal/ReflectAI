import React, { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bot, AlertTriangle, Smile, Brain, Lightbulb, Maximize2 } from 'lucide-react';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';
import { PersonalitySelector } from './PersonalitySelector';
import DistractionFreeMode from './DistractionFreeMode';
import { useChat, ChatSupportType } from '@/contexts/ChatContext';

const ChatContainer: React.FC = () => {
  const { messages, supportType, changeSupportType, error, isDistractionFreeMode, toggleDistractionFreeMode } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    <div className="w-full h-full flex flex-col bg-background">
      
      {/* Header with distraction-free mode toggle */}
      <div className="flex items-center justify-end px-4 py-2 border-b border-border/30">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDistractionFreeMode}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          title="Enter distraction-free mode"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex-grow px-4 py-4 overflow-y-auto bg-background">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map(message => (
            <ChatBubble key={message.id} message={message} />
          ))}
          
          {error && (
            <Alert variant="destructive" className="my-4 rounded-xl border-0 bg-red-50 dark:bg-red-950/20">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <div className="p-0">
        <ChatInput />
      </div>
      
      {/* Distraction-free mode overlay */}
      {isDistractionFreeMode && <DistractionFreeMode />}
    </div>
  );
};

export default ChatContainer;