import React, { useRef, useEffect } from 'react';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bot, AlertTriangle, Smile, Brain, Lightbulb } from 'lucide-react';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';
import { PersonalitySelector } from './PersonalitySelector';
import { useChat, ChatSupportType } from '@/contexts/ChatContext';

const ChatContainer: React.FC = () => {
  const { messages, supportType, changeSupportType, error } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
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
      <div className="px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Select
            value={supportType}
            onValueChange={(value: string) => changeSupportType(value as ChatSupportType)}
          >
            <SelectTrigger className="w-[240px] h-11 bg-background border-0 rounded-xl shadow-none hover:bg-background/80 transition-colors">
              <div className="flex items-center">
                {selectedType.icon}
                <SelectValue className="font-medium">{selectedType.label}</SelectValue>
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-0 shadow-lg">
              {supportTypes.map(type => (
                <SelectItem key={type.value} value={type.value} className="rounded-lg">
                  <div className="flex items-center">
                    {type.icon}
                    {type.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <PersonalitySelector className="w-[240px]" />
        </div>
      </div>
      
      <div className="flex-grow px-6 py-6 overflow-y-auto bg-background">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map(message => (
            <ChatBubble key={message.id} message={message} />
          ))}
          
          {error && (
            <Alert variant="destructive" className="my-4 rounded-xl border-destructive/20 bg-destructive/5">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <div className="bg-background/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6">
          <ChatInput />
        </div>
      </div>
    </div>
  );
};

export default ChatContainer;