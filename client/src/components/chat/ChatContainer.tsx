import React, { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bot, AlertTriangle, Smile, Brain, Lightbulb, BadgeDollarSign } from 'lucide-react';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';
import { PersonalitySelector } from './PersonalitySelector';
import { useChat, ChatSupportType } from '@/contexts/ChatContext';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

const ChatContainer: React.FC = () => {
  const { messages, supportType, changeSupportType, error } = useChat();
  const { user, subscriptionStatus } = useAuth();
  const [, navigate] = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

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

  const supportTypes = [
    { value: 'general', label: 'General Advice', icon: <Lightbulb className="h-4 w-4 mr-2" /> },
    { value: 'emotional', label: 'Emotional Support', icon: <Smile className="h-4 w-4 mr-2" /> },
    { value: 'productivity', label: 'Productivity Coach', icon: <Brain className="h-4 w-4 mr-2" /> },
    { value: 'philosophy', label: 'Philosophical Insight', icon: <Brain className="h-4 w-4 mr-2 text-purple-500" /> },
  ];

  const selectedType = supportTypes.find(type => type.value === supportType) || supportTypes[0];
  
  const handleNavigateToSubscription = () => {
    navigate('/subscription');
  };

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
        {/* Subscription banner for users without subscription */}
        {!hasActiveSubscription() && (
          <Alert className="mb-4 border border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
            <div className="flex flex-col sm:flex-row items-center justify-between w-full">
              <div className="flex items-start mb-2 sm:mb-0">
                <BadgeDollarSign className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300">Premium Feature</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-200">
                    Subscribe to unlock unlimited AI chat conversations.
                  </p>
                </div>
              </div>
              <Button 
                onClick={handleNavigateToSubscription}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-1 px-3"
                size="sm"
              >
                Subscribe Now
              </Button>
            </div>
          </Alert>
        )}
        
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