import React, { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
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
    <Card className="w-full max-w-4xl mx-auto border border-gray-200 dark:border-gray-700 flex flex-col h-[700px] shadow-md">
      <CardHeader className="pb-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Select
            value={supportType}
            onValueChange={(value: string) => changeSupportType(value as ChatSupportType)}
          >
            <SelectTrigger className="w-[200px] bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center">
                {selectedType.icon}
                <SelectValue>{selectedType.label}</SelectValue>
              </div>
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
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
      </CardHeader>
      
      <CardContent className="flex-grow pt-6 px-6 overflow-y-auto bg-gray-50 dark:bg-gray-950">
        {/* Messages */}
        <div className="space-y-4">
          {messages.map(message => (
            <ChatBubble key={message.id} message={message} />
          ))}
          
          {/* Error message */}
          {error && (
            <Alert variant="destructive" className="my-4 border border-red-200 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {/* Auto-scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      
      <CardFooter className="p-0">
        <ChatInput />
      </CardFooter>
    </Card>
  );
};

export default ChatContainer;