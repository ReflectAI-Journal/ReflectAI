import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

interface PaywallScreenProps {
  onSelectPlan: (planId: string) => void;
}

export default function PaywallScreen({ onSelectPlan }: PaywallScreenProps) {
  const features = [
    "Unlimited AI reflections",
    "Mood & growth tracking",
    "Private journal entries",
    "Weekly insight reports",
    "Goal tracking",
    "Philosophical chat"
  ];
  
  return (
    <Card className="w-full max-w-md mx-auto border-primary/20 bg-black/40 backdrop-blur-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-primary">Unlock Full Access</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <div className="mr-2 mt-1 text-green-400">
                <Check size={16} />
              </div>
              <span className="text-gray-300">{feature}</span>
            </li>
          ))}
        </ul>
        
        <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-md">
          <p className="text-center text-blue-300 text-sm">Start with a 7-day free trial, cancel anytime</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button 
          onClick={() => onSelectPlan("pro-monthly")}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
        >
          Start Free Trial
        </Button>
      </CardFooter>
    </Card>
  );
}