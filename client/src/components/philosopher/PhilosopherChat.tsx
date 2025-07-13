import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AutoResizeTextarea } from '@/components/ui/auto-resize-textarea';
import { Button } from '@/components/ui/button';
import { Brain, SendIcon, AlertTriangle, RefreshCw, User, X, Trash2, Maximize2 } from 'lucide-react';
import { useChat, ChatMessage } from '@/contexts/ChatContext';
import { PersonalitySelector } from '@/components/chat/PersonalitySelector';
import DistractionFreeMode from '@/components/chat/DistractionFreeMode';

const PhilosopherChat: React.FC = () => {
  const { messages, isLoading, error, sendMessage, changeSupportType, clearChat, isDistractionFreeMode, toggleDistractionFreeMode } = useChat();
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

  // Auto-scroll to bottom on new messages (within container only)
  useEffect(() => {
    if (messagesEndRef.current) {
      const container = messagesEndRef.current.closest('.overflow-y-auto');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
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
    <div className="h-full flex flex-col min-h-[500px]">
      <div className="pb-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white mr-4 shadow-lg border-2 border-purple-400/30">
              <Brain className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-purple-300 to-indigo-300 bg-clip-text text-transparent">
                Philosophical AI
              </h3>
              <p className="text-purple-300/60 text-sm">Deep thoughts, meaningful conversations</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <PersonalitySelector />
            <Button
              variant="outline"
              size="sm"
              onClick={clearChat}
              className="h-9 px-3 bg-purple-800/20 border-purple-500/30 text-purple-300 hover:bg-purple-700/30 hover:text-purple-200"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFocusMode(true)}
              className="h-9 px-3 bg-purple-800/20 border-purple-500/30 text-purple-300 hover:bg-purple-700/30 hover:text-purple-200"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {error && (
          <Alert variant="destructive" className="mb-4 bg-red-900/20 border-red-500/30 text-red-300">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
      
      <div className="flex-grow pt-6 px-0 overflow-y-auto min-h-[350px] bg-gradient-to-b from-slate-800/20 to-purple-900/10 rounded-lg">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white mb-6 shadow-2xl border-2 border-purple-400/30">
              <Brain className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-bold text-purple-200 mb-3">Begin Your Philosophical Journey</h3>
            <p className="text-purple-300/70 max-w-md mb-8 leading-relaxed">
              Ask profound questions about existence, ethics, knowledge, or consciousness. Let wisdom guide our dialogue.
            </p>
            
            {/* Philosophical Input */}
            <form onSubmit={handleSubmit} className="w-full max-w-2xl">
              <div className="flex items-center gap-4 rounded-2xl border border-purple-500/30 bg-gradient-to-r from-slate-800/40 to-purple-900/20 p-5 shadow-xl backdrop-blur-sm transition-all hover:border-purple-400/50">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                  <Brain className="h-6 w-6" />
                </div>
                <input
                  type="text"
                  placeholder="What profound question weighs on your mind?"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                  className="flex-1 bg-transparent border-0 focus:outline-none text-lg placeholder:text-purple-300/50 text-purple-100"
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 h-11 w-11 rounded-full flex-shrink-0 shadow-lg"
                  disabled={isLoading || !input.trim()}
                >
                  {isLoading ? (
                    <RefreshCw className="h-5 w-5 animate-spin" />
                  ) : (
                    <SendIcon className="h-5 w-5" />
                  )}
                  <span className="sr-only">Send</span>
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <div className="space-y-6 p-6">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[85%] px-6 py-4 rounded-2xl shadow-lg backdrop-blur-sm ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-purple-600 to-indigo-700 text-white ml-4 border border-purple-500/30'
                      : 'bg-gradient-to-br from-slate-800/60 to-purple-900/30 text-purple-100 mr-4 border border-purple-500/20'
                  }`}
                >
                  <div className="flex items-center mb-2">
                    {message.role === 'user' ? (
                      <User className="h-5 w-5 mr-3" />
                    ) : (
                      <Brain className="h-5 w-5 mr-3" />
                    )}
                    <span className="text-sm font-semibold">
                      {message.role === 'user' ? 'You' : 'Philosopher'}
                    </span>
                  </div>
                  <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
                </div>
              </div>
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="px-6 py-4 rounded-2xl bg-gradient-to-br from-slate-800/60 to-purple-900/30 text-purple-100 mr-4 border border-purple-500/20 shadow-lg backdrop-blur-sm">
                  <div className="flex items-center mb-2">
                    <Brain className="h-5 w-5 mr-3" />
                    <span className="text-sm font-semibold">Philosopher</span>
                  </div>
                  <div className="flex items-center">
                    <RefreshCw className="h-5 w-5 mr-3 animate-spin" />
                    <span className="text-sm italic">Deep in contemplation...</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Auto-scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Bottom input for ongoing conversations */}
      {messages.length > 0 && (
        <div className="p-6 border-t border-purple-500/20 bg-gradient-to-r from-slate-800/30 to-purple-900/20">
          <form onSubmit={handleSubmit} className="w-full">
            <div className="flex items-center gap-4 rounded-2xl border border-purple-500/30 bg-gradient-to-r from-slate-800/40 to-purple-900/20 p-5 shadow-xl backdrop-blur-sm transition-all hover:border-purple-400/50">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                <Brain className="h-6 w-6" />
              </div>
              <input
                type="text"
                placeholder="Continue our philosophical dialogue..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="flex-1 bg-transparent border-0 focus:outline-none placeholder:text-purple-300/50 text-purple-100 text-base"
              />
              <Button 
                type="submit" 
                size="icon" 
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 h-11 w-11 rounded-full flex-shrink-0 shadow-lg"
                disabled={isLoading || !input.trim()}
              >
                {isLoading ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <SendIcon className="h-5 w-5" />
                )}
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </form>
        </div>
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
                  minHeight: '30vh',
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
      
      {/* Distraction-free mode overlay */}
      {isDistractionFreeMode && <DistractionFreeMode />}
    </div>
  );
};

export default PhilosopherChat;