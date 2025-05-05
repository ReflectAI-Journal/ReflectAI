import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface EmailPopupProps {
  onClose: () => void;
}

const EmailPopup: React.FC<EmailPopupProps> = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // For now, we'll just simulate API call success
      // In production, you would call an API to store the email
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast({
        title: "Thank you!",
        description: "Your email has been successfully submitted.",
      });
      
      // Save to localStorage to prevent showing popup again
      localStorage.setItem('emailSubmitted', 'true');
      
      onClose();
    } catch (error) {
      toast({
        title: "Submission failed",
        description: "There was an error submitting your email. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0" onClick={onClose}></div>
      <Card className="w-full max-w-md relative z-10 border border-border/50 shadow-xl">
        <div className="absolute top-3 right-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full hover:bg-muted"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-500">
              Stay Updated
            </span>
          </CardTitle>
          <CardDescription className="text-center">
            Join our newsletter to receive the latest updates and exclusive offers.
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="space-y-4">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
                required
              />
            </div>
          </CardContent>
          
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Subscribe'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default EmailPopup;