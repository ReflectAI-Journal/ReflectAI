import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { AutoResizeTextarea } from "@/components/ui/auto-resize-textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface StartScreenProps {
  onNext: (thought: string) => void;
}

export default function StartScreen({ onNext }: StartScreenProps) {
  const [thought, setThought] = useState("");
  
  const handleSubmit = () => {
    if (thought.trim().length < 10) {
      alert("Please share a bit more about what's on your mind.");
      return;
    }
    
    onNext(thought);
  };
  
  return (
    <Card className="w-full max-w-md mx-auto border-primary/20 bg-black/40 backdrop-blur-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-primary">What's been on your mind today?</CardTitle>
      </CardHeader>
      <CardContent>
        <AutoResizeTextarea
          placeholder="I've been thinking about..."
          className="min-h-[120px] bg-gray-900 border-primary/30 placeholder:text-gray-500"
          value={thought}
          onChange={(e) => setThought(e.target.value)}
        />
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button 
          onClick={handleSubmit}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
        >
          Let AI Reflect With You
        </Button>
      </CardFooter>
    </Card>
  );
}