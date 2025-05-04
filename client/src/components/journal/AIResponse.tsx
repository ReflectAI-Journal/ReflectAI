import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThumbsUp, RefreshCw, Save, Sparkles, Bot, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AIResponseProps {
  response: string;
  onRegenerateClick: () => void;
}

const AIResponse = ({ response, onRegenerateClick }: AIResponseProps) => {
  const [isHelpful, setIsHelpful] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast();
  
  const handleHelpfulClick = () => {
    setIsHelpful(true);
    toast({
      title: "Feedback received",
      description: "Thank you for your feedback on the AI response.",
    });
  };
  
  const handleSaveClick = () => {
    setIsSaved(true);
    toast({
      title: "Insight saved",
      description: "The AI insight has been saved to your collection.",
    });
  };
  
  const handleRegenerateClick = () => {
    setIsHelpful(false);
    onRegenerateClick();
  };
  
  const formatResponse = (text: string) => {
    // Convert markdown-like content to paragraphs and lists
    const paragraphs = text.split('\n\n');
    
    return paragraphs.map((paragraph, index) => {
      // Check if it's a list
      if (paragraph.includes('\n- ')) {
        const [listTitle, ...listItems] = paragraph.split('\n- ');
        return (
          <div key={index} className="mb-4">
            <p className="text-foreground font-medium">{listTitle}</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              {listItems.map((item, itemIndex) => (
                <li key={itemIndex} className="text-muted-foreground">{item}</li>
              ))}
            </ul>
          </div>
        );
      }
      
      // Regular paragraph
      return <p key={index} className="mb-4 text-foreground leading-relaxed">{paragraph}</p>;
    });
  };
  
  return (
    <div className="mb-8">
      <h2 className="font-header text-xl font-semibold mb-4 flex items-center">
        <Sparkles className="h-5 w-5 mr-2 text-secondary" />
        AI Reflection & Advice
      </h2>
      
      <Card className="paper overflow-hidden shadow-journal border-border/50">
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-secondary to-accent"></div>
        <CardContent className="p-6">
          <div className="flex items-start mb-5">
            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white mr-3 shadow-sm">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium font-header">Journal AI</p>
              <p className="text-sm text-muted-foreground">Here's my reflection on your entry</p>
            </div>
          </div>
          
          <div className="prose prose-sm max-w-none dark:prose-invert px-1">
            {response ? (
              formatResponse(response)
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <Lightbulb className="h-6 w-6 text-primary-light" />
                </div>
                <p className="text-muted-foreground">Write and save a journal entry to receive AI-powered insights</p>
              </div>
            )}
          </div>
          
          {response && (
            <div className="mt-6 flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 border-t border-border/40 pt-4">
              <div className="flex gap-2">
                <Button
                  variant={isHelpful ? "default" : "outline"}
                  className={isHelpful ? "bg-primary hover:bg-primary-dark" : "border-border/50 text-muted-foreground"}
                  size="sm"
                  onClick={handleHelpfulClick}
                >
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  {isHelpful ? "Helpful" : "Mark as Helpful"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border/50"
                  onClick={handleRegenerateClick}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Regenerate
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className={isSaved ? "text-primary" : "text-muted-foreground hover:text-primary"}
                onClick={handleSaveClick}
                disabled={isSaved}
              >
                <Save className="h-4 w-4 mr-1" />
                {isSaved ? "Saved to insights" : "Save to insights"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AIResponse;
