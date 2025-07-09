import { useRef, useEffect, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface AutoResizeTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

const AutoResizeTextarea = forwardRef<HTMLTextAreaElement, AutoResizeTextareaProps>(
  ({ className, onChange, ...props }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const actualRef = ref || textareaRef;
    const userTypingRef = useRef(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const adjustHeight = (forceUserTyping = false) => {
      const textarea = actualRef && 'current' in actualRef ? actualRef.current : null;
      if (textarea) {
        // Get style values
        const computedStyle = window.getComputedStyle(textarea);
        const minHeight = parseInt(computedStyle.minHeight) || 24;
        const maxHeight = parseInt(computedStyle.maxHeight) || 200;
        const lineHeight = parseInt(computedStyle.lineHeight) || 20;
        
        // Reset height to auto to get the scroll height
        textarea.style.height = 'auto';
        const scrollHeight = textarea.scrollHeight;
        
        // If not user typing, always use minimum height regardless of content
        if (!forceUserTyping && !userTypingRef.current) {
          textarea.style.height = `${Math.max(minHeight, lineHeight + 8)}px`;
          return;
        }
        
        // Always use minimum height for empty content
        if (!textarea.value.trim()) {
          textarea.style.height = `${Math.max(minHeight, lineHeight + 8)}px`;
          return;
        }
        
        const isFocused = document.activeElement === textarea;
        
        if (isFocused && textarea.id.includes('focus')) {
          // Focus mode handling for fullscreen inputs
          const viewportMaxHeight = window.innerHeight * 0.7;
          const focusMinHeight = window.innerHeight * 0.4;
          textarea.style.height = `${Math.max(focusMinHeight, Math.min(scrollHeight, viewportMaxHeight))}px`;
        } else {
          // Normal mode: only expand when user is actively typing multi-line content
          if (userTypingRef.current || forceUserTyping) {
            const finalHeight = Math.max(minHeight, Math.min(scrollHeight, maxHeight));
            textarea.style.height = `${finalHeight}px`;
          } else {
            textarea.style.height = `${Math.max(minHeight, lineHeight + 8)}px`;
          }
        }
      }
    };

    useEffect(() => {
      // Reset user typing flag when value changes externally
      userTypingRef.current = false;
      adjustHeight();
    }, [props.value]);
    
    // Cleanup timeout on unmount
    useEffect(() => {
      return () => {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      };
    }, []);
    
    // Don't expand on focus at all - only expand when typing
    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      if (props.onFocus) {
        props.onFocus(e);
      }
      // Never auto-expand on focus - keep minimum height
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      userTypingRef.current = true;
      adjustHeight(true);
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to reset typing flag after user stops typing
      typingTimeoutRef.current = setTimeout(() => {
        userTypingRef.current = false;
        // Only collapse if content is single line
        const textarea = actualRef && 'current' in actualRef ? actualRef.current : null;
        if (textarea && textarea.value.split('\n').length === 1) {
          adjustHeight();
        }
      }, 1000);
      
      if (onChange) {
        onChange(e);
      }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      userTypingRef.current = true;
      if (props.onKeyDown) {
        props.onKeyDown(e);
      }
    };
    
    const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
      userTypingRef.current = true;
      if (props.onInput) {
        props.onInput(e);
      }
    };

    return (
      <textarea
        ref={actualRef}
        className={cn('auto-resize-textarea', className)}
        onChange={handleChange}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        {...props}
      />
    );
  }
);

AutoResizeTextarea.displayName = 'AutoResizeTextarea';

export { AutoResizeTextarea };