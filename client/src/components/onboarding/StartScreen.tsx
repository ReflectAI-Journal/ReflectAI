import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface StartScreenProps {
  onNext: (thought: string) => void;
}

export default function StartScreen({ onNext }: StartScreenProps) {
  const [thought, setThought] = useState("");
  const { toast } = useToast();
  
  const handleSubmit = () => {
    if (thought.trim().length < 20) {
      toast({
        title: "Please share more",
        description: "Tell us a bit more about your thoughts to get a meaningful AI response.",
        variant: "destructive",
      });
      return;
    }
    
    onNext(thought);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <Card className="border-primary/20 bg-black/40 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">Welcome to Reflect AI</CardTitle>
          <CardDescription className="text-gray-300">
            Experience the power of AI-guided reflection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-300">
              Share a current thought, challenge, or philosophical question you've been pondering:
            </p>
            <Textarea
              placeholder="I've been thinking about..."
              className="min-h-[120px] bg-gray-900 border-primary/30 placeholder:text-gray-500"
              value={thought}
              onChange={(e) => setThought(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
          >
            Get AI Insight
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}