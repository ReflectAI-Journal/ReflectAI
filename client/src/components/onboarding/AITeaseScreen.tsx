import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";

interface AITeaseScreenProps {
  userThought: string;
  onNext: () => void;
}

export function AITeaseScreen({ userThought, onNext }: AITeaseScreenProps) {
  const [aiResponse, setAiResponse] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showFullResponse, setShowFullResponse] = useState<boolean>(false);
  const { toast } = useToast();
  
  useEffect(() => {
    async function getAITease() {
      try {
        setIsLoading(true);
        
        const response = await apiRequest("POST", "/api/onboarding/ai-tease", { 
          content: userThought 
        });
        
        if (!response.ok) {
          throw new Error("Failed to get AI response");
        }
        
        const data = await response.json();
        setAiResponse(data.response);
      } catch (error) {
        console.error("Error getting AI tease:", error);
        toast({
          title: "Error",
          description: "We couldn't generate an AI response. Please try again.",
          variant: "destructive",
        });
        setAiResponse("I'm sorry, I couldn't analyze your thought properly. Our premium AI can provide much deeper insights with a subscription.");
      } finally {
        setIsLoading(false);
      }
    }
    
    getAITease();
  }, [userThought, toast]);
  
  // Get only the first paragraph for the preview
  const previewResponse = aiResponse.split('\n\n')[0] || aiResponse;
  const hasMoreContent = aiResponse.length > previewResponse.length;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <Card className="border-primary/20 bg-black/40 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">AI Insight Preview</CardTitle>
          <CardDescription className="text-gray-300">
            See how our AI can transform your thinking
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-800/50 p-4 rounded-md">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Your thought:</h3>
            <p className="text-gray-300 italic">{userThought}</p>
          </div>
          
          <Separator className="bg-gray-700" />
          
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">AI analysis:</h3>
            {isLoading ? (
              <div className="flex justify-center py-6">
                <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="text-white">
                <p>{showFullResponse ? aiResponse : previewResponse}</p>
                
                {hasMoreContent && !showFullResponse && (
                  <div className="relative mt-2">
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black to-transparent"></div>
                    <p className="text-center text-primary underline cursor-pointer mt-4" onClick={() => setShowFullResponse(true)}>
                      Show more
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <Button 
            onClick={onNext}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
          >
            Unlock Full AI Experience
          </Button>
          <p className="text-sm text-gray-400 text-center">
            Get deeper insights with our premium subscription
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}