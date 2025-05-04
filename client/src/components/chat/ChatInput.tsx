import React, { useState, useRef, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SendHorizonal, RefreshCw } from 'lucide-react';
import { useChat } from '@/contexts/ChatContext';

const ChatInput: React.FC = () => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage, isLoading, clearChat } = useChat();
  
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
  
  return (
    <div className="border-t border-border bg-card/80 backdrop-blur-sm p-3 rounded-b-lg">
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={clearChat}
          title="New conversation"
          className="shrink-0"
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
          placeholder="Type your message..."
          className="min-h-[40px] resize-none bg-background border-border"
          disabled={isLoading}
        />
        
        <Button 
          className="btn-glow shrink-0"
          size="icon" 
          onClick={handleSubmit}
          disabled={!message.trim() || isLoading}
        >
          {isLoading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <SendHorizonal className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;