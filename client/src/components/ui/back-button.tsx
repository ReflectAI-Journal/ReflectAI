import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';

interface BackButtonProps {
  fallbackPath?: string;
  className?: string;
}

export default function BackButton({ fallbackPath = '/subscription', className = '' }: BackButtonProps) {
  const [, navigate] = useLocation();
  
  const handleBack = () => {
    // Try to go back in browser history, fallback to specified path
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate(fallbackPath);
    }
  };

  return (
    <Button
      onClick={handleBack}
      variant="ghost"
      className={`mb-8 flex items-center gap-2 text-muted-foreground hover:text-foreground ${className}`}
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </Button>
  );
}