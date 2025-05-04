import React, { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bot, AlertTriangle, Smile, Brain, Lightbulb } from 'lucide-react';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';
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
    <Card className="paper w-full max-w-4xl mx-auto shadow-journal border-border/50 flex flex-col h-[700px]">
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {supportType === 'philosophy' ? (
              <>
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-purple-700 flex items-center justify-center text-white mr-3 shadow-sm">
                  <Brain className="h-5 w-5" />
                </div>
                <CardTitle className="font-header">AI Philosopher</CardTitle>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-secondary to-accent flex items-center justify-center text-white mr-3 shadow-sm">
                  <Bot className="h-5 w-5" />
                </div>
                <CardTitle className="font-header">AI Companion</CardTitle>
              </>
            )}
          </div>
          
          <Select
            value={supportType}
            onValueChange={(value: string) => changeSupportType(value as ChatSupportType)}
          >
            <SelectTrigger className="w-[220px] bg-card border-border/50">
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
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow pt-6 px-6 overflow-y-auto">
        {/* Messages */}
        <div className="space-y-1">
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
      </CardContent>
      
      <CardFooter className="p-0">
        <ChatInput />
      </CardFooter>
    </Card>
  );
};

export default ChatContainer;