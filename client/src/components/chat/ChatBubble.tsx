import React from 'react';
import { format } from 'date-fns';
import { Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatMessage } from '@/contexts/ChatContext';

interface ChatBubbleProps {
  message: ChatMessage;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const formattedTime = format(new Date(message.timestamp), 'h:mm a');
  
  return (
    <div 
      className={cn(
        "flex w-full mb-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div 
        className={cn(
          "flex items-start max-w-[80%]",
          isUser ? "flex-row-reverse" : "flex-row"
        )}
      >
        {/* Avatar */}
        <div 
          className={cn(
            "flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center text-white -mt-1",
            isUser 
              ? "bg-gradient-to-r from-primary to-primary-light ml-2" 
              : "bg-gradient-to-r from-secondary to-accent mr-2"
          )}
        >
          {isUser ? (
            <User className="h-5 w-5" />
          ) : (
            <Bot className="h-5 w-5" />
          )}
        </div>
        
        {/* Message content */}
        <div>
          <div 
            className={cn(
              "rounded-2xl px-4 py-2 inline-block",
              isUser 
                ? "bg-primary text-white rounded-tr-none" 
                : "bg-card dark:bg-card/80 border border-border/50 rounded-tl-none shadow-sm"
            )}
          >
            {/* Format message with paragraphs */}
            {message.content.split('\n\n').map((paragraph, i) => (
              <p key={i} className={i > 0 ? 'mt-3' : ''}>
                {paragraph}
              </p>
            ))}
          </div>
          
          {/* Timestamp */}
          <div 
            className={cn(
              "text-xs text-muted-foreground mt-1",
              isUser ? "text-right" : "text-left"
            )}
          >
            {formattedTime}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;