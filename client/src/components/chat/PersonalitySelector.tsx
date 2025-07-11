import React from 'react';
import { useChat, PersonalityType, CustomPersonality } from '@/contexts/ChatContext';
import { CustomPersonalityManager } from './CustomPersonalityManager';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
  SelectSeparator
} from "@/components/ui/select";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ChevronDown, Plus, Settings, User } from 'lucide-react';

interface PersonalitySelectorProps {
  className?: string;
}

export function PersonalitySelector({ className }: PersonalitySelectorProps) {
  const { 
    personalityType, 
    changePersonalityType,
    customPersonalities,
    addCustomPersonality,
    deleteCustomPersonality,
    getSelectedPersonality,
    supportType
  } = useChat();
  
  const [managerOpen, setManagerOpen] = React.useState(false);

  const builtInPersonalities: { value: PersonalityType; label: string; description: string }[] = [
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
    { 
      value: 'christian', 
      label: 'Christian', 
      description: 'Christian counselor perspective with wisdom from faith, grace, and divine love'
    },
  ];
  
  // Get built-in personalities in the format needed for the custom personality form
  const prebuiltPersonalitiesOptions = builtInPersonalities.map(p => ({
    value: p.value,
    label: p.label
  }));

  // Get selected personality info
  const selectedPersonality = getSelectedPersonality();
  const selectedBuiltIn = builtInPersonalities.find(p => p.value === personalityType);
  
  // Determine what to display in the trigger
  const displayName = selectedPersonality 
    ? selectedPersonality.name 
    : (selectedBuiltIn?.label || 'Default');

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <Label htmlFor="personality-select" className="text-sm font-medium text-gray-600 dark:text-gray-300">
          Personality
        </Label>
        <Popover open={managerOpen} onOpenChange={setManagerOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-gray-400 hover:text-gray-200">
              <Settings className="h-3.5 w-3.5 mr-1" />
              Manage
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[350px] p-0" align="end">
            <div className="p-4 pb-2">
              <h3 className="font-semibold">Manage AI Personalities</h3>
              <p className="text-sm text-muted-foreground">
                Create and manage your custom AI personalities.
              </p>
            </div>
            <div className="px-4 pb-4">
              <CustomPersonalityManager
                customPersonalities={customPersonalities}
                onPersonalityCreated={addCustomPersonality}
                onPersonalityDeleted={deleteCustomPersonality}
                onPersonalitySelected={(id) => {
                  changePersonalityType(id);
                  setManagerOpen(false);
                }}
                selectedPersonalityId={personalityType}
                prebuiltPersonalities={prebuiltPersonalitiesOptions}
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      <Select
        value={personalityType}
        onValueChange={(value) => changePersonalityType(value as PersonalityType)}
      >
        <SelectTrigger id="personality-select" className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <SelectValue>
            <div className="flex items-center">
              {selectedPersonality ? (
                <User className="h-4 w-4 mr-2 text-blue-600" />
              ) : null}
              {displayName}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200">
          {/* Built-in personalities */}
          <SelectGroup>
            <SelectLabel className="text-xs text-gray-500 dark:text-gray-400">Built-in Personalities</SelectLabel>
            {builtInPersonalities.map((personality) => (
              <SelectItem 
                key={personality.value} 
                value={personality.value}
                className="hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{personality.label}</span>
                  <span className="text-xs text-gray-400">{personality.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
          
          {/* Custom personalities */}
          {customPersonalities.length > 0 && (
            <>
              <SelectSeparator className="bg-gray-200 dark:bg-gray-700" />
              <SelectGroup>
                <SelectLabel className="text-xs text-gray-500 dark:text-gray-400">Custom Personalities</SelectLabel>
                {customPersonalities.map((personality) => {
                  // For personalized counselor, adjust description based on support type
                  let displayDescription = personality.description;
                  if (personality.id === 'personalized-counselor') {
                    const title = supportType === 'philosophy' ? 'philosopher' : 'counselor';
                    displayDescription = `Your personalized ${title}: ${personality.description.replace('Your personalized match: ', '')}`;
                  }
                  
                  return (
                    <SelectItem 
                      key={personality.id} 
                      value={personality.id}
                      className="hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700"
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center">
                          <User className="h-3.5 w-3.5 mr-1.5 text-primary" />
                          <span className="font-medium">{personality.name}</span>
                        </div>
                        <span className="text-xs text-gray-400">{displayDescription}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectGroup>
            </>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}