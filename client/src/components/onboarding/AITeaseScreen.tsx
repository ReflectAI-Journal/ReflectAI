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
    <Card className="w-full max-w-2xl mx-auto border-primary/20 bg-black/40 backdrop-blur-sm">
      <CardHeader className="text-center pb-8">
        <CardTitle className="text-4xl font-bold text-primary">AI Insight Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-gray-800/50 p-6 rounded-md">
          <h3 className="text-lg font-medium text-gray-400 mb-3">Your thought:</h3>
          <p className="text-gray-300 italic text-xl">{userThought}</p>
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-gray-400 mb-3">AI analysis:</h3>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-white">
                <p className="text-xl leading-relaxed">{aiResponse}</p>
              </div>
              
              <div className="relative mt-6 p-6 bg-gray-800/30 rounded-md border border-gray-700 overflow-hidden">
                <div className="absolute inset-0 backdrop-blur-lg bg-gray-800/30"></div>
                <p className="relative text-center text-gray-400 text-lg">
                  [Continue this reflection with AI →]
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-center pt-8">
        <Button 
          onClick={onNext}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-xl py-4"
        >
          Unlock Full AI Reflection
        </Button>
      </CardFooter>
    </Card>
  );
}