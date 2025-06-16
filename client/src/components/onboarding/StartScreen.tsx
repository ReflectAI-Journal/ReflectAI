import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
    <Card className="w-full max-w-2xl mx-auto border-primary/20 bg-black/40 backdrop-blur-sm">
      <CardHeader className="text-center pb-8">
        <CardTitle className="text-4xl font-bold text-primary">What's been on your mind today?</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="I've been thinking about..."
          className="min-h-[200px] bg-gray-900 border-primary/30 placeholder:text-gray-500 text-xl p-6"
          value={thought}
          onChange={(e) => setThought(e.target.value)}
        />
      </CardContent>
      <CardFooter className="flex justify-center pt-8">
        <Button 
          onClick={handleSubmit}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-xl py-4"
        >
          Let AI Reflect With You
        </Button>
      </CardFooter>
    </Card>
  );
}