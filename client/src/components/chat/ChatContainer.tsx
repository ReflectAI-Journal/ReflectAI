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
    <div className="w-full h-[700px] flex flex-col bg-background">
      <div className="pb-3 border-b border-border px-4 py-4 bg-background">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Select
            value={supportType}
            onValueChange={(value: string) => changeSupportType(value as ChatSupportType)}
          >
            <SelectTrigger className="w-[200px]">
              <div className="flex items-center">
                {selectedType.icon}
                <SelectValue>{selectedType.label}</SelectValue>
              </div>
            </SelectTrigger>
            <SelectContent>
              {supportTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center">
                    {type.icon}
                    {type.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <PersonalitySelector className="w-[200px]" />
        </div>
      </div>
      
      <div className="flex-grow px-4 py-4 overflow-y-auto bg-background">
        {/* Messages */}
        <div className="space-y-4">
          {messages.map(message => (
            <ChatBubble key={message.id} message={message} />
          ))}
          
          {/* Error message */}
          {error && (
            <Alert variant="destructive" className="my-4">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {/* Auto-scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <div className="border-t border-border">
        <ChatInput />
      </div>
    </div>
  );
};

export default ChatContainer;