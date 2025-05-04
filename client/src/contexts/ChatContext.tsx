import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiRequest } from '@/lib/queryClient';

// Define types for our chat
export type ChatSupportType = 'emotional' | 'productivity' | 'general' | 'philosophy';
export type PersonalityType = 'default' | 'socratic' | 'stoic' | 'existentialist' | 'analytical' | 'poetic' | 'humorous' | 'zen';

export interface ChatMessage {
  id: string; // Unique ID for the message
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface ChatContextType {
  messages: ChatMessage[];
  supportType: ChatSupportType;
  personalityType: PersonalityType;
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  changeSupportType: (type: ChatSupportType) => void;
  changePersonalityType: (type: PersonalityType) => void;
  clearChat: () => void;
}

// Create context with default values
const ChatContext = createContext<ChatContextType>({
  messages: [],
  supportType: 'general',
  personalityType: 'default',
  isLoading: false,
  error: null,
  sendMessage: async () => {},
  changeSupportType: () => {},
  changePersonalityType: () => {},
  clearChat: () => {},
});

// Generate a unique ID for messages
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Custom hook for using the chat context
export const useChat = () => useContext(ChatContext);

// Context Provider component
export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [supportType, setSupportType] = useState<ChatSupportType>('general');
  const [personalityType, setPersonalityType] = useState<PersonalityType>('default');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize with a welcome message
  useEffect(() => {
    if (messages.length === 0) {
      // Add a welcome message based on the support type
      let welcomeMessage = '';
      
      switch (supportType) {
        case 'emotional':
          welcomeMessage = "Hi there! I'm here to provide emotional support and help you process your feelings. How are you feeling today?";
          break;
        case 'productivity':
          welcomeMessage = "Hello! I'm your productivity coach. I can help you set goals, manage your time, and stay motivated. What would you like to work on today?";
          break;
        case 'philosophy':
          welcomeMessage = "Greetings! I'm your AI philosopher, ready to explore deep questions about existence, knowledge, ethics, and meaning. What philosophical topic would you like to discuss today?";
          break;
        case 'general':
        default:
          welcomeMessage = "Hello! I'm your AI companion. I'm here to chat, provide advice, or just listen. How can I help you today?";
          break;
      }
      
      setMessages([
        {
          id: generateId(),
          role: 'assistant',
          content: welcomeMessage,
          timestamp: new Date()
        }
      ]);
    }
  }, [supportType, messages.length]);
  
  // Send a message to the chatbot
  const sendMessage = async (content: string) => {
    if (!content.trim()) return;
    
    // Create a new user message
    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date()
    };
    
    // Update messages state
    setMessages(prev => [...prev, userMessage]);
    
    // Set loading state
    setIsLoading(true);
    setError(null);
    
    try {
      // Prepare messages for the API (excluding timestamp and id)
      const apiMessages = messages
        .concat(userMessage)
        .map(({ role, content }) => ({ role, content }));
      
      // Send request to the server
      const response = await apiRequest({
        url: '/api/chatbot/message',
        method: 'POST',
        body: JSON.stringify({
          messages: apiMessages,
          supportType
        })
      });
      
      // Parse the response
      const responseData = await response.json();
      
      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: responseData.content,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to get a response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Change the support type
  const changeSupportType = (type: ChatSupportType) => {
    setSupportType(type);
    setMessages([]); // Clear chat when changing support type
  };
  
  // Change the personality type
  const changePersonalityType = (type: PersonalityType) => {
    setPersonalityType(type);
    // Don't clear messages when changing personality
  };
  
  // Clear the chat
  const clearChat = () => {
    setMessages([]);
  };
  
  return (
    <ChatContext.Provider
      value={{
        messages,
        supportType,
        isLoading,
        error,
        sendMessage,
        changeSupportType,
        clearChat
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};