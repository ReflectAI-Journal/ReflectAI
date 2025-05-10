import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";

interface AITeaseScreenProps {
  userThought: string;
  onNext: () => void;
}

export default function AITeaseScreen({ userThought, onNext }: AITeaseScreenProps) {
  const [aiResponse, setAiResponse] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
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
        setAiResponse("I notice your thoughts about this topic. Our AI can provide deeper insights with a subscription...");
      } finally {
        setIsLoading(false);
      }
    }
    
    getAITease();
  }, [userThought]);
  
  return (
    <Card className="w-full max-w-md mx-auto border-primary/20 bg-black/40 backdrop-blur-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-primary">AI Insight Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-gray-800/50 p-4 rounded-md">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Your thought:</h3>
          <p className="text-gray-300 italic">{userThought}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-2">AI analysis:</h3>
          {isLoading ? (
            <div className="flex justify-center py-6">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-white">
                <p>{aiResponse}</p>
              </div>
              
              <div className="relative mt-4 p-4 bg-gray-800/30 rounded-md border border-gray-700 overflow-hidden">
                <div className="absolute inset-0 backdrop-blur-lg bg-gray-800/30"></div>
                <p className="relative text-center text-gray-400">
                  [Continue this reflection with AI →]
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button 
          onClick={onNext}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
        >
          Unlock Full AI Reflection
        </Button>
      </CardFooter>
    </Card>
  );
}