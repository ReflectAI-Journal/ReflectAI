import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiRequest } from '@/lib/queryClient';

// Define types for our chat
export type ChatSupportType = 'emotional' | 'productivity' | 'general' | 'philosophy';
export type BuiltInPersonalityType = 'default' | 'socratic' | 'stoic' | 'existentialist' | 'analytical' | 'poetic' | 'humorous' | 'zen';
export type PersonalityType = BuiltInPersonalityType | string; // String for custom personality IDs

export interface CustomPersonality {
  id: string;
  name: string;
  description: string;
  instructions: string;
  basePersonality?: BuiltInPersonalityType;
  isCustom: boolean;
}

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
  customPersonalities: CustomPersonality[];
  isLoading: boolean;
  error: string | null;
  isDistractionFreeMode: boolean;
  sendMessage: (content: string) => Promise<void>;
  changeSupportType: (type: ChatSupportType) => void;
  changePersonalityType: (type: PersonalityType) => void;
  addCustomPersonality: (personality: CustomPersonality) => void;
  deleteCustomPersonality: (personalityId: string) => void;
  getSelectedPersonality: () => CustomPersonality | undefined;
  clearChat: () => void;
  toggleDistractionFreeMode: () => void;
}

// Generate a unique ID for messages
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Get custom personalities from local storage
const getStoredPersonalities = (): CustomPersonality[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem('customPersonalities');
    return stored ? JSON.parse(stored) : [];
  } catch (err) {
    console.error('Failed to parse stored personalities:', err);
    return [];
  }
};

// Save custom personalities to local storage
const storePersonalities = (personalities: CustomPersonality[]): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('customPersonalities', JSON.stringify(personalities));
  } catch (err) {
    console.error('Failed to store personalities:', err);
  }
};

// Default context with missing functions
const defaultContext: ChatContextType = {
  messages: [],
  supportType: 'general',
  personalityType: 'default',
  customPersonalities: [],
  isLoading: false,
  error: null,
  isDistractionFreeMode: false,
  sendMessage: async () => {},
  changeSupportType: () => {},
  changePersonalityType: () => {},
  addCustomPersonality: () => {},
  deleteCustomPersonality: () => {},
  getSelectedPersonality: () => undefined,
  clearChat: () => {},
  toggleDistractionFreeMode: () => {},
};

// Create context with default values
const ChatContext = createContext<ChatContextType>(defaultContext);

// Custom hook for using the chat context
export const useChat = () => useContext(ChatContext);

// Context Provider component
export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [supportType, setSupportType] = useState<ChatSupportType>('general');
  const [personalityType, setPersonalityType] = useState<PersonalityType>('default');
  const [customPersonalities, setCustomPersonalities] = useState<CustomPersonality[]>(getStoredPersonalities);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDistractionFreeMode, setIsDistractionFreeMode] = useState(false);
  
  // Effect to save custom personalities to localStorage whenever they change
  useEffect(() => {
    storePersonalities(customPersonalities);
  }, [customPersonalities]);
  
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
          welcomeMessage = "Greetings! I'm your philosopher, ready to explore deep questions about existence, knowledge, ethics, and meaning. What philosophical topic would you like to discuss today?";
          break;
        case 'general':
        default:
          welcomeMessage = "Hello! I'm here to chat, provide advice, or just listen. How can I help you today?";
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
      
      // Get custom personality instructions if applicable
      let customInstructions = '';
      if (personalityType !== 'default' && !['socratic', 'stoic', 'existentialist', 'analytical', 'poetic', 'humorous', 'zen'].includes(personalityType)) {
        const customPersonality = customPersonalities.find(p => p.id === personalityType);
        if (customPersonality) {
          customInstructions = customPersonality.instructions;
        }
      }
      
      // Send request to the server
      const response = await apiRequest({
        url: '/api/chatbot/message',
        method: 'POST',
        body: JSON.stringify({
          messages: apiMessages,
          supportType,
          personalityType,
          customInstructions
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
  
  // Add a custom personality
  const addCustomPersonality = (personality: CustomPersonality) => {
    setCustomPersonalities(prev => [...prev, personality]);
  };
  
  // Delete a custom personality
  const deleteCustomPersonality = (personalityId: string) => {
    setCustomPersonalities(prev => prev.filter(p => p.id !== personalityId));
    
    // If the deleted personality was selected, switch to default
    if (personalityType === personalityId) {
      setPersonalityType('default');
    }
  };
  
  // Get the selected personality details
  const getSelectedPersonality = (): CustomPersonality | undefined => {
    return customPersonalities.find(p => p.id === personalityType);
  };
  
  // Clear the chat
  const clearChat = () => {
    setMessages([]);
  };
  
  // Toggle distraction-free mode
  const toggleDistractionFreeMode = () => {
    setIsDistractionFreeMode(prev => !prev);
  };
  
  return (
    <ChatContext.Provider
      value={{
        messages,
        supportType,
        personalityType,
        customPersonalities,
        isLoading,
        error,
        isDistractionFreeMode,
        sendMessage,
        changeSupportType,
        changePersonalityType,
        addCustomPersonality,
        deleteCustomPersonality,
        getSelectedPersonality,
        clearChat,
        toggleDistractionFreeMode
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};