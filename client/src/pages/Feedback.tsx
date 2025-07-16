import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageSquare, 
  Star, 
  Bug, 
  Lightbulb, 
  Heart,
  Send
} from 'lucide-react';

const Feedback = () => {
  const [feedbackType, setFeedbackType] = useState<'general' | 'bug' | 'feature' | 'compliment'>('general');
  const [rating, setRating] = useState<number>(0);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const feedbackTypes = [
    {
      type: 'general' as const,
      label: 'General Feedback',
      icon: <MessageSquare className="h-5 w-5" />,
      description: 'Share your thoughts about the app'
    },
    {
      type: 'bug' as const,
      label: 'Report Bug',
      icon: <Bug className="h-5 w-5" />,
      description: 'Found an issue? Let us know'
    },
    {
      type: 'feature' as const,
      label: 'Feature Request',
      icon: <Lightbulb className="h-5 w-5" />,
      description: 'Suggest a new feature'
    },
    {
      type: 'compliment' as const,
      label: 'Compliment',
      icon: <Heart className="h-5 w-5" />,
      description: 'Share what you love about the app'
    }
  ];

  const captureScreenshot = async (): Promise<string | null> => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(document.body, {
        height: window.innerHeight,
        width: window.innerWidth,
        scrollX: 0,
        scrollY: 0,
      });
      
      return canvas.toDataURL('image/png').split(',')[1];
    } catch (error) {
      console.error('Error capturing screenshot:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast({
        title: "Message required",
        description: "Please enter your feedback message.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Capture screenshot before submitting
      const screenshot = await captureScreenshot();

      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          feedbackType,
          rating,
          message,
          userEmail: email,
          screenshot,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast({
          title: "Feedback sent!",
          description: "Thank you for your feedback. We'll review it and get back to you if needed.",
        });

        // Reset form
        setMessage('');
        setEmail('');
        setRating(0);
        setFeedbackType('general');
      } else {
        throw new Error(result.message || 'Failed to submit feedback');
      }
      
    } catch (error) {
      toast({
        title: "Error sending feedback",
        description: "There was a problem sending your feedback. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background app-content pb-36">
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="font-header text-3xl font-bold text-primary mb-2">We'd Love Your Feedback</h1>
          <p className="text-muted-foreground">
            Help us improve ReflectAI by sharing your thoughts, reporting issues, or suggesting new features.
          </p>
        </div>

        <Card className="backdrop-blur-sm bg-card/50 border border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Send Feedback
            </CardTitle>
            <CardDescription>
              Your feedback helps us create a better experience for everyone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Feedback Type Selection */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Feedback Type</Label>
                <div className="grid grid-cols-2 gap-3">
                  {feedbackTypes.map((type) => (
                    <button
                      key={type.type}
                      type="button"
                      onClick={() => setFeedbackType(type.type)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        feedbackType === type.type
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {type.icon}
                        <span className="font-medium text-sm">{type.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{type.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating (for general feedback and compliments) */}
              {(feedbackType === 'general' || feedbackType === 'compliment') && (
                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    How would you rate your experience?
                  </Label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 transition-colors hover:scale-110 transform"
                      >
                        <Star
                          className={`h-8 w-8 ${
                            star <= rating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300 hover:text-yellow-400'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Message */}
              <div>
                <Label htmlFor="message" className="text-sm font-medium mb-2 block">
                  Your Message *
                </Label>
                <Textarea
                  id="message"
                  placeholder={
                    feedbackType === 'bug'
                      ? 'Please describe the issue you encountered, including any steps to reproduce it...'
                      : feedbackType === 'feature'
                      ? 'Describe the feature you\'d like to see and how it would help you...'
                      : feedbackType === 'compliment'
                      ? 'Tell us what you love about ReflectAI...'
                      : 'Share your thoughts about ReflectAI...'
                  }
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[120px] resize-none"
                  required
                />
              </div>

              {/* Email (optional) */}
              <div>
                <Label htmlFor="email" className="text-sm font-medium mb-2 block">
                  Email Address (optional)
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Provide your email if you'd like us to follow up with you.
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting || !message.trim()}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Send Feedback
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            You can also reach us directly at{' '}
            <a 
              href="mailto:support@reflectai.com" 
              className="text-primary hover:underline"
            >
              support@reflectai.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Feedback;