import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FeaturesSectionProps {
  title: string;
  features: string[];
  variant?: 'blue' | 'purple';
}

export default function FeaturesSection({ title, features, variant = 'blue' }: FeaturesSectionProps) {
  return (
    <Card className={`border border-slate-700 rounded-lg p-6 ${
      variant === 'blue' 
        ? 'bg-gradient-to-br from-slate-800/60 to-slate-900/60'
        : 'bg-gradient-to-br from-slate-800/60 to-slate-900/60'
    } backdrop-blur-sm`}>
      <CardHeader>
        <CardTitle className={`text-xl font-semibold text-center ${
          variant === 'blue' ? 'text-blue-400' : 'text-purple-400'
        }`}>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
          <ul className="space-y-2">
            {features.map((feature, idx) => (
              <li key={idx} className="flex items-start">
                <Check className="h-5 w-5 text-emerald-500 mr-2 shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}