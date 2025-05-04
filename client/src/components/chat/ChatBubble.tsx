import React from 'react';
import { format } from 'date-fns';
import { Bot, User, Sparkles, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatMessage } from '@/contexts/ChatContext';

interface ChatBubbleProps {
  message: ChatMessage;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const formattedTime = format(new Date(message.timestamp), 'h:mm a');
  
  // Function to parse and style code blocks in the message
  const renderMessageWithCodeBlocks = (content: string) => {
    // First split by paragraphs
    return content.split('\n\n').map((paragraph, paragraphIndex) => {
      // Check if paragraph is a code block
      if (paragraph.startsWith('```') && paragraph.endsWith('```')) {
        const code = paragraph.slice(3, -3);
        return (
          <div key={paragraphIndex} className="my-3 bg-black/10 dark:bg-white/5 rounded-md p-3 overflow-x-auto font-mono text-sm">
            <code>{code}</code>
          </div>
        );
      }
      
      // Handle inline code (text between backticks)
      let parts = [];
      let textParts = paragraph.split('`');
      
      if (textParts.length > 1) {
        for (let i = 0; i < textParts.length; i++) {
          if (i % 2 === 0) {
            // Regular text
            parts.push(<span key={`text-${paragraphIndex}-${i}`}>{textParts[i]}</span>);
          } else {
            // Inline code
            parts.push(
              <code 
                key={`code-${paragraphIndex}-${i}`}
                className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono text-sm"
              >
                {textParts[i]}
              </code>
            );
          }
        }
        return <p key={paragraphIndex} className={paragraphIndex > 0 ? 'mt-3' : ''}>{parts}</p>;
      }
      
      // Regular paragraph
      return (
        <p key={paragraphIndex} className={paragraphIndex > 0 ? 'mt-3' : ''}>
          {paragraph}
        </p>
      );
    });
  };
  
  return (
    <div 
      className={cn(
        "flex w-full mb-5", // Increased bottom margin for better spacing
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div 
        className={cn(
          "flex items-start max-w-[85%]", // Increased width for better readability
          isUser ? "flex-row-reverse" : "flex-row"
        )}
      >
        {/* Avatar with enhanced styling */}
        <div 
          className={cn(
            "flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-white -mt-1",
            isUser 
              ? "bg-gradient-to-r from-blue-500 to-violet-600 ml-2.5 shadow-glow-blue" 
              : "bg-gradient-to-r from-violet-600 to-fuchsia-600 mr-2.5 shadow-glow-purple"
          )}
        >
          {isUser ? (
            <User className="h-5 w-5" />
          ) : (
            <div className="relative">
              <Bot className="h-5 w-5" />
              <Sparkles className="h-3 w-3 absolute -top-0.5 -right-1 text-yellow-300" />
            </div>
          )}
        </div>
        
        {/* Message content with enhanced styling */}
        <div>
          <div 
            className={cn(
              "rounded-2xl px-5 py-3 inline-block backdrop-blur-sm", // Enhanced padding
              isUser 
                ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-tr-none shadow-md" 
                : "bg-card/90 dark:bg-card/80 border border-border/50 rounded-tl-none shadow-lg"
            )}
            style={{
              boxShadow: isUser 
                ? '0 4px 14px rgba(59, 130, 246, 0.2)' 
                : '0 4px 14px rgba(0, 0, 0, 0.1)'
            }}
          >
            {/* Enhanced message formatting with code block support */}
            {renderMessageWithCodeBlocks(message.content)}
          </div>
          
          {/* Timestamp with enhanced styling */}
          <div 
            className={cn(
              "text-xs text-muted-foreground mt-1.5 flex items-center gap-1",
              isUser ? "justify-end" : "justify-start"
            )}
          >
            {!isUser && <Zap className="h-3 w-3 text-violet-400" />}
            {formattedTime}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;