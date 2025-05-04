import React from 'react';
import { useChat, PersonalityType } from '@/contexts/ChatContext';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';

interface PersonalitySelectorProps {
  className?: string;
}

export function PersonalitySelector({ className }: PersonalitySelectorProps) {
  const { personalityType, changePersonalityType } = useChat();

  const personalities: { value: PersonalityType; label: string; description: string }[] = [
    { 
      value: 'default', 
      label: 'Default', 
      description: 'Balanced, friendly, and straightforward responses'
    },
    { 
      value: 'socratic', 
      label: 'Socratic', 
      description: 'Question-oriented, encouraging critical thinking through dialectic'
    },
    { 
      value: 'stoic', 
      label: 'Stoic', 
      description: 'Focused on what you can control, emotional resilience, and virtue'
    },
    { 
      value: 'existentialist', 
      label: 'Existentialist', 
      description: 'Emphasis on freedom, authenticity, and creating personal meaning'
    },
    { 
      value: 'analytical', 
      label: 'Analytical', 
      description: 'Precise, logical, structured approach to ideas and problems'
    },
    { 
      value: 'poetic', 
      label: 'Poetic', 
      description: 'Metaphorical, imagery-rich language with aesthetic qualities'
    },
    { 
      value: 'humorous', 
      label: 'Humorous', 
      description: 'Lighthearted, witty responses with philosophical jokes'
    },
    { 
      value: 'zen', 
      label: 'Zen', 
      description: 'Minimalist, paradoxical, focused on present-moment awareness'
    },
  ];

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex flex-col space-y-1.5">
        <Label htmlFor="personality-select" className="text-sm font-medium text-gray-300">
          AI Personality
        </Label>
        <Select
          value={personalityType}
          onValueChange={(value) => changePersonalityType(value as PersonalityType)}
        >
          <SelectTrigger id="personality-select" className="w-full bg-gray-800 border-gray-700">
            <SelectValue placeholder="Select a personality" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
            {personalities.map((personality) => (
              <SelectItem 
                key={personality.value} 
                value={personality.value}
                className="hover:bg-gray-700 focus:bg-gray-700"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{personality.label}</span>
                  <span className="text-xs text-gray-400">{personality.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}