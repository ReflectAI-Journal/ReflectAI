import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThumbsUp, RefreshCw, Save } from 'lucide-react';
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
            <p>{listTitle}</p>
            <ul className="list-disc pl-6 mt-2">
              {listItems.map((item, itemIndex) => (
                <li key={itemIndex} className="mb-1">{item}</li>
              ))}
            </ul>
          </div>
        );
      }
      
      // Regular paragraph
      return <p key={index} className="mb-4">{paragraph}</p>;
    });
  };
  
  return (
    <div className="mb-8">
      <h2 className="font-header text-xl font-semibold mb-4">AI Reflection & Advice</h2>
      
      <Card className="paper">
        <CardContent className="p-6">
          <div className="flex items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-white mr-3">
              <i className="fas fa-robot"></i>
            </div>
            <div>
              <p className="font-medium">Journal AI</p>
              <p className="text-sm text-muted-foreground">Here's my reflection on your entry</p>
            </div>
          </div>
          
          <div className="prose prose-sm max-w-none">
            {formatResponse(response)}
          </div>
          
          <div className="mt-6 flex justify-between">
            <div className="flex gap-2">
              <Button
                variant={isHelpful ? "default" : "secondary"}
                className={isHelpful ? "bg-primary-light" : ""}
                size="sm"
                onClick={handleHelpfulClick}
              >
                <ThumbsUp className="h-4 w-4 mr-1" />
                {isHelpful ? "Helpful" : "Mark as Helpful"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRegenerateClick}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Regenerate
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary hover:text-primary-dark"
              onClick={handleSaveClick}
              disabled={isSaved}
            >
              <Save className="h-4 w-4 mr-1" />
              {isSaved ? "Saved to insights" : "Save to insights"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIResponse;
