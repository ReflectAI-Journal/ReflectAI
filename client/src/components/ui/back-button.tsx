import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  to?: string;
  className?: string;
}

export default function BackButton({ to, className = '' }: BackButtonProps) {
  const [, navigate] = useLocation();

  const handleClick = () => {
    if (to) {
      navigate(to);
    } else {
      // If no specific path is provided, go back to the previous page
      window.history.back();
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={`mr-2 ${className}`}
      onClick={handleClick}
      aria-label="Go back"
    >
      <ArrowLeft className="h-5 w-5" />
    </Button>
  );
}