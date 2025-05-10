import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

interface PaywallScreenProps {
  onSelectPlan: (planId: string) => void;
}

export function PaywallScreen({ onSelectPlan }: PaywallScreenProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>("monthly");
  
  const plans = [
    {
      id: "pro-monthly",
      name: "Monthly",
      price: "$14.99",
      interval: "per month",
      features: [
        "Unlimited AI journal responses",
        "Personalized insights dashboard",
        "Goal tracking with AI guidance",
        "Advanced sentiment analysis",
        "Memory lane & pattern recognition",
        "Philosophy chat with 8 personalities"
      ],
      savings: "",
      trialDays: 7
    },
    {
      id: "pro-yearly",
      name: "Yearly",
      price: "$149.99",
      interval: "per year",
      features: [
        "All monthly features",
        "Priority support",
        "Early access to new features",
        "Downloadable insights reports",
        "Exclusive monthly webinars",
        "Advanced journaling templates"
      ],
      savings: "Save 17%",
      trialDays: 7
    }
  ];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <Card className="border-primary/20 bg-black/40 backdrop-blur-sm overflow-hidden">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold text-primary">Unlock the Full Experience</CardTitle>
          <CardDescription className="text-gray-300">
            Choose a plan that works for you
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex justify-center mb-6">
            <div className="inline-flex bg-gray-800 rounded-lg p-1">
              <Button
                variant={selectedPlan === "monthly" ? "default" : "ghost"}
                onClick={() => setSelectedPlan("monthly")}
                className={`rounded-md text-sm ${selectedPlan === "monthly" ? "bg-primary text-white" : "text-gray-400"}`}
              >
                Monthly
              </Button>
              <Button
                variant={selectedPlan === "yearly" ? "default" : "ghost"}
                onClick={() => setSelectedPlan("yearly")}
                className={`rounded-md text-sm ${selectedPlan === "yearly" ? "bg-primary text-white" : "text-gray-400"}`}
              >
                Yearly
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            {plans.map((plan) => (
              <div 
                key={plan.id}
                className={`
                  border rounded-lg p-4 transition-all 
                  ${plan.id.includes(selectedPlan) 
                    ? "border-primary bg-gradient-to-br from-blue-900/30 to-indigo-900/30" 
                    : "border-gray-800 bg-gray-900/30"
                  }
                `}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-white">{plan.name}</h3>
                    <div className="flex items-baseline mt-1">
                      <span className="text-2xl font-bold text-white">{plan.price}</span>
                      <span className="ml-1 text-gray-400 text-sm">{plan.interval}</span>
                    </div>
                    {plan.savings && (
                      <Badge variant="outline" className="mt-1 bg-green-900/30 text-green-400 border-green-500/30">
                        {plan.savings}
                      </Badge>
                    )}
                  </div>
                  
                  <Button 
                    onClick={() => onSelectPlan(plan.id)}
                    className={`
                      ${plan.id.includes(selectedPlan) 
                        ? "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white" 
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      }
                    `}
                    size="sm"
                  >
                    Start Free Trial
                  </Button>
                </div>
                
                <p className="text-sm text-blue-300 mb-3">
                  {plan.trialDays}-day free trial, cancel anytime
                </p>
                
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <div className="mr-2 mt-1 text-green-400">
                        <Check size={16} />
                      </div>
                      <span className="text-sm text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex-col space-y-2">
          <p className="text-sm text-gray-400 text-center">
            Secure payment processing through Stripe
          </p>
          <p className="text-xs text-gray-500 text-center">
            You won't be charged until after your free trial ends
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}