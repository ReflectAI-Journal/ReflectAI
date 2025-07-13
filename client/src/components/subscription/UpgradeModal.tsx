import { useLocation } from 'wouter';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Crown, Zap } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
  requiredPlan: string;
  description?: string;
}

export default function UpgradeModal({ 
  isOpen, 
  onClose, 
  featureName, 
  requiredPlan,
  description 
}: UpgradeModalProps) {
  const [, setLocation] = useLocation();

  const handleUpgrade = () => {
    onClose();
    setLocation('/subscription');
  };

  const getIcon = () => {
    return requiredPlan.toLowerCase() === 'unlimited' ? 
      <Crown className="h-6 w-6 text-yellow-500" /> : 
      <Zap className="h-6 w-6 text-blue-500" />;
  };

  const getPlanColor = () => {
    return requiredPlan.toLowerCase() === 'unlimited' ? 
      'text-yellow-600' : 'text-blue-600';
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 mb-2">
            {getIcon()}
            <AlertDialogTitle className="text-xl">
              Upgrade Required
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base space-y-2">
            <div>
              <strong>{featureName}</strong> requires the{' '}
              <span className={`font-semibold ${getPlanColor()}`}>
                {requiredPlan} plan
              </span>{' '}
              to access.
            </div>
            {description && (
              <div className="text-sm text-muted-foreground">
                {description}
              </div>
            )}
            <div>
              Upgrade now to unlock this feature and enjoy enhanced functionality.
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel onClick={onClose}>
            Maybe Later
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleUpgrade}
            className="bg-primary hover:bg-primary/90"
          >
            Upgrade to {requiredPlan}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}