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
        
        // If not user typing and content is single line, always use minimum height
        if (!forceUserTyping && !userTypingRef.current && textarea.value.split('\n').length === 1) {
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
    
    // Only adjust height on focus if there's content
    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      if (props.onFocus) {
        props.onFocus(e);
      }
      // Don't auto-expand on focus unless there's content
      if (e.target.value.trim()) {
        adjustHeight();
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      userTypingRef.current = true;
      adjustHeight(true);
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