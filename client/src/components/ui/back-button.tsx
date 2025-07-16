import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  fallbackPath?: string;
  className?: string;
}

export default function BackButton({ fallbackPath = '/', className }: BackButtonProps) {
  const [, navigate] = useLocation();

  const handleBack = () => {
    // Try to go back in history first
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // Fallback to specified path
      navigate(fallbackPath);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleBack}
      className={`flex items-center gap-2 text-muted-foreground hover:text-foreground ${className}`}
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </Button>
  );
}