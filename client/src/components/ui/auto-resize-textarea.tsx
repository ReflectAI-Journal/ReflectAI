import { useRef, useEffect, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface AutoResizeTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

const AutoResizeTextarea = forwardRef<HTMLTextAreaElement, AutoResizeTextareaProps>(
  ({ className, onChange, ...props }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const actualRef = ref || textareaRef;

    const adjustHeight = () => {
      const textarea = actualRef && 'current' in actualRef ? actualRef.current : null;
      if (textarea) {
        textarea.style.height = 'auto';
        const scrollHeight = textarea.scrollHeight;
        const isFocused = document.activeElement === textarea;
        
        if (isFocused) {
          // When focused, expand to larger size smoothly
          const maxHeight = window.innerHeight * 0.7; // 70% of viewport height
          const minHeight = window.innerHeight * 0.4; // 40% minimum when focused
          textarea.style.height = `${Math.max(minHeight, Math.min(scrollHeight, maxHeight))}px`;
        } else {
          // When not focused, use content-based sizing
          const maxHeight = 200; // Smaller max height when not focused
          textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
        }
      }
    };

    useEffect(() => {
      adjustHeight();
    }, [props.value]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      adjustHeight();
      if (onChange) {
        onChange(e);
      }
    };

    return (
      <textarea
        ref={actualRef}
        className={cn('auto-resize-textarea', className)}
        onChange={handleChange}
        {...props}
      />
    );
  }
);

AutoResizeTextarea.displayName = 'AutoResizeTextarea';

export { AutoResizeTextarea };