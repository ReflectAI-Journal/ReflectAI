import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AutoResizeTextarea } from '@/components/ui/auto-resize-textarea';
import { SendHorizonal, RefreshCw, Sparkles, Mic, Image, X, Brain, Bot, Trash2, Lock, Crown } from 'lucide-react';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';

const ChatInput: React.FC = () => {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  
  // Disable focus mode for counselor
  const shouldShowFocusMode = false;
  const textareaRef = useRef<HTMLInputElement>(null);
  const { sendMessage, isLoading, clearChat, supportType } = useChat();
  const { user, subscriptionStatus } = useAuth();
  const [, navigate] = useLocation();
  
  // Determine if we're in philosophy mode
  const isPhilosophyMode = supportType === 'philosophy';
  
  // Check if user has an active subscription
  const hasActiveSubscription = subscriptionStatus?.hasActiveSubscription || subscriptionStatus?.status === 'active';
  const isLocked = user && !hasActiveSubscription;
  
  // Navigate to subscription page
  const handleUpgradeClick = () => {
    navigate('/subscription');
  };
  
  const handleSubmit = async () => {
    if (isLocked) {
      // Don't send message if user is locked (no subscription)
      return;
    }
    
    if (message.trim() && !isLoading) {
      await sendMessage(message);
      setMessage('');
      setIsFocusMode(false); // Exit focus mode after sending
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
  
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };
  
  const adjustTextareaHeight = () => {
    // Remove auto height adjustment - let AutoResizeTextarea handle it
    // This prevents expansion on focus/click
  };

  // Auto-focus the textarea when focus mode activates
  useEffect(() => {
    if (isFocusMode && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [isFocusMode]);
  
  // Listen for external input setting
  useEffect(() => {
    const handleSetInput = (event: CustomEvent) => {
      setMessage(event.detail);
      // Focus the textarea after setting the message
      if (textareaRef.current) {
        setTimeout(() => {
          textareaRef.current?.focus();
        }, 100);
      }
    };
    window.addEventListener('setChatInput', handleSetInput as EventListener);
    return () => window.removeEventListener('setChatInput', handleSetInput as EventListener);
  }, []);
  
  return (
    <>
      {/* Focus mode overlay */}
      {shouldShowFocusMode && isFocusMode && (
        <div className="fixed inset-0 z-50 bg-background focus-mode-layout">
          {/* Header with title and actions */}
          <div className="bg-background/95 backdrop-blur-sm border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`h-10 w-10 rounded-xl ${isPhilosophyMode ? 'bg-purple-600' : 'bg-gradient-to-r from-primary to-violet-600'} flex items-center justify-center text-white mr-3 shadow-lg`}>
                  {isPhilosophyMode ? <Brain className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                </div>
                <div>
                  <h1 className="text-xl font-semibold">
                    {isPhilosophyMode ? 'Philosopher' : 'Counselor'}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {isPhilosophyMode 
                      ? 'Ask a profound philosophical question'
                      : 'Share what\'s on your mind'
                    }
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
          
          {/* Full screen chat input */}
          <div className="h-full flex flex-col pt-0 relative">
            {/* Lock overlay for fullscreen mode */}
            {isLocked && (
              <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center z-30">
                <div className="text-center p-8">
                  <div className="flex items-center justify-center mb-4">
                    <Lock className="h-12 w-12 text-red-500 mr-3" />
                    <Crown className="h-12 w-12 text-amber-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Upgrade to unlock AI chat</h2>
                  <p className="text-muted-foreground mb-4">Get instant access to your AI counselor</p>
                  <div className="flex gap-4 justify-center">
                    <Button 
                      variant="outline"
                      className="bg-background/90 hover:bg-background border-border shadow-lg px-6 py-3 rounded-full text-base transition-all duration-200 hover:scale-105"
                      onClick={exitFocusMode}
                    >
                      Go Back
                    </Button>
                    <Button 
                      className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg px-6 py-3 rounded-full text-base transition-all duration-200 hover:scale-105"
                      onClick={handleUpgradeClick}
                    >
                      Upgrade Now
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex-1 p-6">
              <AutoResizeTextarea
                ref={textareaRef}
                value={message}
                onChange={(e) => {
                  if (!isLocked) {
                    setMessage(e.target.value);
                  }
                }}
                onKeyDown={handleKeyDown}
                placeholder={isLocked 
                  ? "Upgrade to unlock AI chat..."
                  : isPhilosophyMode 
                    ? "Ask a profound philosophical question... What aspects of existence, ethics, knowledge, or consciousness intrigue you today?"
                    : "Share what's on your mind... Ask for advice, emotional support, or help organizing your thoughts."
                }
                className={cn(
                  "w-full h-full border-0 bg-transparent text-lg leading-relaxed resize-none focus:outline-none auto-resize-textarea transition-all duration-300",
                  isLocked ? "cursor-not-allowed text-muted-foreground" : "cursor-text"
                )}
                style={{ 
                  minHeight: '60vh',
                  paddingBottom: '120px',
                  caretColor: 'currentColor'
                }}
                disabled={isLoading || isLocked}
              />
            </div>
            
            {/* Floating action buttons */}
            <div className="fixed bottom-6 left-4 right-4 flex justify-center gap-4 z-20">
              <Button 
                variant="outline"
                className="bg-background/90 hover:bg-background border-border shadow-lg px-6 py-3 rounded-full text-base transition-all duration-200 hover:scale-105"
                onClick={exitFocusMode}
              >
                Cancel
              </Button>
              <Button 
                className={cn(
                  "shadow-lg px-8 py-3 rounded-full text-base transition-all duration-200 hover:scale-105",
                  isLocked
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : isPhilosophyMode 
                      ? "bg-purple-600 hover:bg-purple-700 text-white"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                )}
                onClick={handleSubmit}
                disabled={!message.trim() || isLoading || isLocked}
              >
                {isLocked ? (
                  <>
                    <Lock className="h-5 w-5 mr-2" />
                    Locked
                  </>
                ) : isLoading ? (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                    Thinking...
                  </>
                ) : (
                  <>
                    <SendHorizonal className="h-5 w-5 mr-2" />
                    Send
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Clean input area spanning full width */}
      <div className={cn(
        "flex gap-3 items-center relative rounded-2xl p-3 m-4 message-input-container border",
        isLocked ? "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20" :
        isFocused 
          ? "border-blue-500/40 shadow-lg bg-white dark:bg-gray-900" 
          : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
      )}>
        {/* Lock overlay for users without subscription */}
        {isLocked && (
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10 cursor-pointer hover:bg-background/85 transition-colors"
            onClick={handleUpgradeClick}
          >
            <div className="text-center p-4">
              <div className="flex items-center justify-center mb-2">
                <Lock className="h-6 w-6 text-red-500 mr-2" />
                <Crown className="h-6 w-6 text-amber-500" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">Upgrade to unlock AI chat</p>
              <p className="text-xs text-muted-foreground">Get instant access to your AI counselor</p>
              <p className="text-xs text-blue-500 mt-1 font-medium">Click to upgrade</p>
            </div>
          </div>
        )}
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={clearChat}
          title="Clear conversation"
          className="shrink-0 h-9 w-9 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors btn-hover-scale"
          disabled={isLocked}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
        
        <input
          ref={textareaRef}
          type="text"
          value={message}
          onChange={(e) => {
            if (!isLocked) {
              setMessage(e.target.value);
            }
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (!isLocked) {
              setIsFocused(true);
            }
          }}
          onBlur={() => {
            setIsFocused(false);
          }}
          placeholder={isLocked ? "Upgrade to unlock AI chat..." : "Type your message here..."}
          className={cn(
            "flex-1 bg-transparent border-0 focus-visible:ring-0 p-2 shadow-none cursor-text rounded-xl leading-tight outline-none",
            isLocked 
              ? "text-muted-foreground placeholder:text-muted-foreground cursor-not-allowed" 
              : "text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
          )}
          disabled={isLoading || isLocked}
        />
        
        <Button 
          className={cn(
            "shrink-0 h-9 w-9 rounded-full send-button",
            isLocked 
              ? "bg-gray-400 text-white cursor-not-allowed" 
              : "bg-blue-600 hover:bg-blue-700 text-white",
            !message.trim() && "opacity-50 cursor-not-allowed"
          )}
          onClick={handleSubmit}
          disabled={!message.trim() || isLoading || isLocked}
        >
          {isLocked ? (
            <Lock className="h-4 w-4" />
          ) : isLoading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <SendHorizonal className="h-4 w-4" />
          )}
        </Button>
      </div>
    </>
  );
};

export default ChatInput;