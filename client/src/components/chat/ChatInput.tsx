import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SendHorizonal, RefreshCw, Sparkles, CreditCard, BadgeDollarSign } from 'lucide-react';
import { useChat } from '@/contexts/ChatContext';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';

const ChatInput: React.FC = () => {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage, isLoading, clearChat } = useChat();
  const { user, subscriptionStatus } = useAuth();
  const [, navigate] = useLocation();
  
  // Check if user has an active subscription
  const hasActiveSubscription = (): boolean => {
    // If user is in trial period or has active subscription
    return !!(
      user && (
        (subscriptionStatus?.trialActive && subscriptionStatus?.status === 'trial') ||
        (subscriptionStatus?.status === 'active') ||
        (user.isGuest) // Allow guests limited usage for demo
      )
    );
  };
  
  const handleNavigateToSubscription = () => {
    navigate('/subscription');
  };
  
  const handleSubmit = async () => {
    if (message.trim() && !isLoading) {
      await sendMessage(message);
      setMessage('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };
  
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };
  
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  // Auto-focus the textarea when the component mounts
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);
  
  // If user doesn't have subscription, show subscription CTA instead of normal input
  if (!hasActiveSubscription()) {
    return (
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 rounded-b-lg">
        <div className="flex flex-col items-center justify-center gap-3 py-3">
          <div className="text-center max-w-md">
            <h3 className="text-lg font-semibold mb-2">Subscribe to Continue</h3>
            <p className="text-sm text-muted-foreground mb-4">
              The AI chat feature requires an active subscription. Upgrade your plan to unlock unlimited access to AI conversations.
            </p>
            <Button 
              onClick={handleNavigateToSubscription}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2 px-6"
            >
              <BadgeDollarSign className="h-4 w-4 mr-2" />
              View Subscription Plans
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 rounded-b-lg">
      <div className="flex flex-col gap-3">
        {/* Simple suggestion chips */}
        <div className="flex flex-wrap gap-1.5 items-center justify-center mb-1">
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2.5 text-xs bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700"
            onClick={() => setMessage(prev => prev + (prev ? ' ' : '') + "How can I improve my morning routine?")}
          >
            Morning routine
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2.5 text-xs bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700"
            onClick={() => setMessage(prev => prev + (prev ? ' ' : '') + "What are some ways to reduce stress and anxiety?")}
          >
            Stress reduction
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2.5 text-xs bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700"
            onClick={() => setMessage(prev => prev + (prev ? ' ' : '') + "Help me organize my thoughts about a decision I need to make.")}
          >
            Decision helper
          </Button>
        </div>
        
        {/* Input area with clean, simple styling */}
        <div className={cn(
          "flex gap-2 relative rounded-lg border p-1",
          isFocused 
            ? "border-blue-400 shadow-sm bg-white dark:bg-gray-800" 
            : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800"
        )}>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={clearChat}
            title="Clear conversation"
            className="shrink-0 h-9 w-9 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              adjustTextareaHeight();
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Type your message here..."
            className="min-h-[40px] max-h-[120px] resize-none bg-transparent border-0 focus-visible:ring-0 p-2 shadow-none text-gray-800 dark:text-gray-200"
            disabled={isLoading}
          />
          
          {/* Send button with clean style */}
          <Button 
            className={cn(
              "shrink-0 h-9 px-4 rounded-md bg-blue-600 hover:bg-blue-700 text-white",
              !message.trim() && "opacity-70"
            )}
            onClick={handleSubmit}
            disabled={!message.trim() || isLoading}
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <SendHorizonal className="h-4 w-4 mr-1" />
            )}
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;