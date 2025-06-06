import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Brain, SendIcon, AlertTriangle, RefreshCw, User } from 'lucide-react';
import { useChat, ChatMessage } from '@/contexts/ChatContext';
import { PersonalitySelector } from '@/components/chat/PersonalitySelector';

const PhilosopherChat: React.FC = () => {
  const { messages, isLoading, error, sendMessage, changeSupportType } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');

  // Set the chat type to philosophy
  useEffect(() => {
    changeSupportType('philosophy');
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    try {
      await sendMessage(input);
      setInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <Card className="shadow-sm border-border/50 h-full flex flex-col">
      <CardHeader className="pb-3 border-b border-border/50 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white mr-3 shadow-sm">
              <Brain className="h-5 w-5" />
            </div>
            <CardTitle className="font-header">Philosopher</CardTitle>
          </div>
        </div>
        
        <div className="flex justify-end">
          <PersonalitySelector className="w-[250px]" />
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow pt-6 px-6 overflow-y-auto max-h-[500px]">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <Brain className="h-16 w-16 text-purple-500 mb-4" />
            <h3 className="text-xl font-medium mb-2">Begin Your Philosophical Journey</h3>
            <p className="text-muted-foreground max-w-md">
              Ask a profound question about existence, ethics, knowledge, or consciousness. Or select from the suggested inquiries on the left.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground ml-4'
                      : 'bg-muted text-foreground mr-4'
                  }`}
                >
                  <div className="flex items-center mb-1">
                    {message.role === 'user' ? (
                      <User className="h-4 w-4 mr-2" />
                    ) : (
                      <Brain className="h-4 w-4 mr-2" />
                    )}
                    <span className="text-xs font-medium">
                      {message.role === 'user' ? 'You' : 'Philosopher'}
                    </span>
                  </div>
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
              </div>
            ))}
            
            {/* Error message */}
            {error && (
              <Alert variant="destructive" className="my-4">
                <AlertTriangle className="h-4 w-4 mr-2" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="px-4 py-3 rounded-lg bg-muted text-foreground mr-4">
                  <div className="flex items-center mb-1">
                    <Brain className="h-4 w-4 mr-2" />
                    <span className="text-xs font-medium">Philosopher</span>
                  </div>
                  <div className="flex items-center">
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    <span className="text-sm">Contemplating...</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Auto-scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-4 border-t border-border/50 flex-shrink-0">
        <form onSubmit={handleSubmit} className="w-full">
          <div className="flex items-end gap-2">
            <Textarea
              id="philosopher-chat-input"
              placeholder="Ask a philosophical question..."
              className="min-h-[80px] resize-none border-border/50"
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              size="icon" 
              className="bg-purple-600 hover:bg-purple-700 h-10 w-10 rounded-full flex-shrink-0"
              disabled={isLoading || !input.trim()}
            >
              <SendIcon className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </form>
      </CardFooter>
    </Card>
  );
};

export default PhilosopherChat;