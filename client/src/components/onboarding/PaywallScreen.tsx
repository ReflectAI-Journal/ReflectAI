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
    <Card className="w-full max-w-2xl mx-auto border-primary/20 bg-black/40 backdrop-blur-sm">
      <CardHeader className="text-center pb-8">
        <CardTitle className="text-4xl font-bold text-primary">Unlock Full Access</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <ul className="space-y-4">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <div className="mr-4 mt-1 text-green-400">
                <Check size={24} />
              </div>
              <span className="text-gray-300 text-xl">{feature}</span>
            </li>
          ))}
        </ul>
        
        <div className="mt-6 p-6 bg-blue-900/20 border border-blue-500/30 rounded-md">
          <p className="text-center text-blue-300 text-lg">Start with a 7-day free trial, cancel anytime</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center pt-8">
        <Button 
          onClick={() => onSelectPlan("pro-monthly")}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-xl py-4"
        >
          Start Free Trial
        </Button>
      </CardFooter>
    </Card>
  );
}