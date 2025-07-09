import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AutoResizeTextarea } from '@/components/ui/auto-resize-textarea';
import { Button } from '@/components/ui/button';
import { Brain, SendIcon, AlertTriangle, RefreshCw, User, X, Trash2 } from 'lucide-react';
import { useChat, ChatMessage } from '@/contexts/ChatContext';
import { PersonalitySelector } from '@/components/chat/PersonalitySelector';

const PhilosopherChat: React.FC = () => {
  const { messages, isLoading, error, sendMessage, changeSupportType, clearChat } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');
  const [isFocusMode, setIsFocusMode] = useState(false);

  // Set the chat type to philosophy
  useEffect(() => {
    changeSupportType('philosophy');
  }, []);

  // Listen for external input setting
  useEffect(() => {
    const handleSetInput = (event: CustomEvent) => {
      setInput(event.detail);
    };
    window.addEventListener('setPhilosopherInput', handleSetInput as EventListener);
    return () => window.removeEventListener('setPhilosopherInput', handleSetInput as EventListener);
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
      setIsFocusMode(false); // Exit focus mode after sending
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const exitFocusMode = () => {
    // Add exit animation class
    const focusModeElement = document.querySelector('.focus-mode-layout');
    if (focusModeElement) {
      focusModeElement.classList.add('focus-mode-exit');
      setTimeout(() => {
        setIsFocusMode(false);
      }, 300);
    } else {
      setIsFocusMode(false);
    }
  };

  return (
    <Card className="shadow-sm border-border/50 h-full flex flex-col min-h-[400px]">
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
      
      <CardContent className="flex-grow pt-6 px-6 overflow-y-auto min-h-[600px]">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <Brain className="h-16 w-16 text-purple-500 mb-4" />
            <h3 className="text-xl font-medium mb-2">Begin Your Philosophical Journey</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              Ask a profound question about existence, ethics, knowledge, or consciousness. Explore the topics and questions in the sidebar to get started.
            </p>
            
            {/* Text Input in Empty State */}
            <form onSubmit={handleSubmit} className="w-full max-w-2xl">
              <div className="flex items-center gap-3 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm focus-within:border-indigo-500 focus-within:shadow-md transition-all">
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-sm">
                  <Brain className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  placeholder="Ask a profound philosophical question..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                  className="flex-1 bg-transparent border-0 focus:outline-none text-lg placeholder:text-muted-foreground"
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  className="bg-indigo-600 hover:bg-indigo-700 h-9 w-9 rounded-full flex-shrink-0"
                  disabled={isLoading || !input.trim()}
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <SendIcon className="h-4 w-4" />
                  )}
                  <span className="sr-only">Send</span>
                </Button>
              </div>
            </form>
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
      
      {/* Bottom input for ongoing conversations */}
      {messages.length > 0 && (
        <CardFooter className="p-4 border-t border-border/50">
          <form onSubmit={handleSubmit} className="w-full">
            <div className="flex items-center gap-3 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-3 shadow-sm focus-within:border-indigo-500 focus-within:shadow-md transition-all">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-sm">
                <Brain className="h-4 w-4" />
              </div>
              <input
                type="text"
                placeholder="Continue the philosophical dialogue..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="flex-1 bg-transparent border-0 focus:outline-none placeholder:text-muted-foreground"
              />
              <Button 
                type="submit" 
                size="icon" 
                className="bg-indigo-600 hover:bg-indigo-700 h-8 w-8 rounded-full flex-shrink-0"
                disabled={isLoading || !input.trim()}
              >
                {isLoading ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  <SendIcon className="h-3 w-3" />
                )}
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </form>
        </CardFooter>
      )}
      
      {/* Focus mode overlay */}
      {isFocusMode && (
        <div className="fixed inset-0 z-50 bg-background focus-mode-layout">
          {/* Header with title and actions */}
          <div className="bg-background/95 backdrop-blur-sm border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-xl bg-purple-600 flex items-center justify-center text-white mr-3 shadow-lg">
                  <Brain className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold">Philosopher</h1>
                  <p className="text-sm text-muted-foreground">
                    Ask a profound philosophical question
                  </p>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearChat}
                  className="h-9"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={exitFocusMode}
                  className="h-9 w-9"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Full screen form */}
          <form onSubmit={handleSubmit} className="h-full flex flex-col pt-0">
            <div className="flex-1 p-6">
              <AutoResizeTextarea
                id="philosopher-chat-input-focus"
                placeholder="Ask a profound philosophical question... What aspects of existence, ethics, knowledge, or consciousness intrigue you today?"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="w-full h-full border-0 bg-transparent text-lg leading-relaxed resize-none focus:outline-none cursor-text auto-resize-textarea transition-all duration-300"
                style={{ 
                  minHeight: '60vh',
                  paddingBottom: '120px',
                  caretColor: 'currentColor'
                }}
              />
            </div>
            
            {/* Floating action buttons */}
            <div className="fixed bottom-6 left-4 right-4 flex justify-center gap-4 z-20">
              <Button 
                type="button"
                variant="outline"
                className="bg-background/90 hover:bg-background border-border shadow-lg px-6 py-3 rounded-full text-base transition-all duration-200 hover:scale-105"
                onClick={exitFocusMode}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg px-8 py-3 rounded-full text-base transition-all duration-200 hover:scale-105"
                disabled={isLoading || !input.trim()}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                    Contemplating...
                  </>
                ) : (
                  <>
                    <SendIcon className="h-5 w-5 mr-2" />
                    Send
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      )}


    </Card>
  );
};

export default PhilosopherChat;