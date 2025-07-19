import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  fallbackPath?: string;
  className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ fallbackPath = '/', className = '' }) => {
  const [, navigate] = useLocation();

  const handleBack = () => {
    // Always use navigation for consistent behavior
    navigate(fallbackPath);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleBack}
      className={`mb-4 ${className}`}
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      Back
    </Button>
  );
};

export default BackButton;