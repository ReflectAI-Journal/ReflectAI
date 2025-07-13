import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Star } from 'lucide-react';

interface SubscriptionCardProps {
  plan: {
    id: string;
    name: string;
    description: string;
    price: number;
    interval: string;
    features?: string[];
  };
  onSubscribe: (planId: string) => void;
}

export default function SubscriptionCard({ plan, onSubscribe }: SubscriptionCardProps) {
  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-violet-600/5 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">${plan.price.toFixed(2)}/${plan.interval}</span>
          </div>
          {plan.features && (
            <ul className="space-y-2">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full"
          onClick={() => onSubscribe(plan.id)}
        >
          Subscribe Now
        </Button>
      </CardFooter>
    </Card>
  );
}