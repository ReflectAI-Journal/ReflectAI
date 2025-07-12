import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThumbsUp, RefreshCw, Save, Sparkles, Bot, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { InlineFeatureGuard } from '@/components/subscription/FeatureGuard';

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
    <div className="mb-6 md:mb-8">
      <h2 className="font-header text-lg md:text-xl font-semibold mb-3 md:mb-4 flex items-center">
        <Sparkles className="h-4 w-4 md:h-5 md:w-5 mr-2 text-secondary" />
        AI Reflection & Advice
      </h2>
      
      <Card className="paper overflow-hidden shadow-journal border-border/50 bg-card" data-ai-section>
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-secondary to-accent"></div>
        <CardContent className="p-3 md:p-6">
          <div className="flex items-start mb-3 md:mb-5">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-md bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white mr-2 md:mr-3 shadow-sm">
              <Bot className="h-4 w-4 md:h-5 md:w-5" />
            </div>
            <div>
              <p className="font-medium font-header text-sm md:text-base">Journal AI</p>
              <p className="text-xs md:text-sm text-muted-foreground">Here's my reflection on your entry</p>
            </div>
          </div>
          
          <div className="prose prose-xs md:prose-sm max-w-none dark:prose-invert px-1">
            {response ? (
              formatResponse(response)
            ) : (
              <div className="flex flex-col items-center justify-center py-6 md:py-8 text-center">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2 md:mb-3">
                  <Lightbulb className="h-5 w-5 md:h-6 md:w-6 text-primary-light" />
                </div>
                <p className="text-xs md:text-sm text-muted-foreground mb-2">Write and save a journal entry to receive AI-powered insights</p>
                <button 
                  onClick={onRegenerateClick}
                  className="text-xs md:text-sm text-primary hover:text-primary/80 underline underline-offset-2 mt-1 md:mt-2"
                >
                  Try generating AI insights
                </button>
              </div>
            )}
          </div>
          
          {response && (
            <div className="mt-4 md:mt-6 flex flex-col sm:flex-row justify-between gap-2 sm:gap-0 border-t border-border/40 pt-3 md:pt-4">
              <div className="flex gap-2">
                <Button
                  variant={isHelpful ? "default" : "outline"}
                  className={isHelpful ? "bg-primary hover:bg-primary-dark" : "border-border/50 text-muted-foreground"}
                  size="sm"
                  onClick={handleHelpfulClick}
                >
                  <ThumbsUp className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  <span className="text-xs md:text-sm">{isHelpful ? "Helpful" : "Mark as Helpful"}</span>
                </Button>
                <InlineFeatureGuard feature="aiJournalInsights">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border/50"
                    onClick={handleRegenerateClick}
                  >
                    <RefreshCw className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                    <span className="text-xs md:text-sm">Regenerate</span>
                  </Button>
                </InlineFeatureGuard>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className={isSaved ? "text-primary" : "text-muted-foreground hover:text-primary"}
                onClick={handleSaveClick}
                disabled={isSaved}
              >
                <Save className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                <span className="text-xs md:text-sm">{isSaved ? "Saved to insights" : "Save to insights"}</span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AIResponse;
