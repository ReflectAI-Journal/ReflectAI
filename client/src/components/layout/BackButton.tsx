import { ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';

interface BackButtonProps {
  className?: string;
}

const BackButton = ({ className = '' }: BackButtonProps) => {
  const [, navigate] = useLocation();

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`p-1 h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary ${className}`}
      onClick={() => navigate('/app/counselor')}
      aria-label="Back to counselor"
    >
      <ArrowLeft className="h-5 w-5" />
    </Button>
  );
};

export default BackButton;