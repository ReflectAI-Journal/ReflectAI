import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import Sidebar from '@/components/layout/Sidebar';
import { JournalEntry } from '@shared/schema';
import { format, differenceInDays, differenceInMonths, differenceInYears, subYears, subMonths } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Calendar, ArrowRight, Sparkles } from 'lucide-react';
import { useLocation } from 'wouter';

const TIME_PERIODS = [
  { label: 'This day in the past', value: 'same-day' },
  { label: 'One month ago', value: '1-month' },
  { label: 'Three months ago', value: '3-months' },
  { label: 'Six months ago', value: '6-months' },
  { label: 'One year ago', value: '1-year' },
] as const;

type TimePeriod = typeof TIME_PERIODS[number]['value'];

interface MemoryEntryProps {
  entry: JournalEntry;
  timePeriod: string;
}

const MemoryEntry = ({ entry, timePeriod }: MemoryEntryProps) => {
  const [, navigate] = useLocation();
  const date = new Date(entry.date);
  const formattedDate = format(date, 'MMMM d, yyyy');
  const dayOfWeek = format(date, 'EEEE');
  
  const entryAgeText = () => {
    const today = new Date();
    const years = differenceInYears(today, date);
    const months = differenceInMonths(today, date);
    const days = differenceInDays(today, date);
    
    if (years > 0) return `${years} ${years === 1 ? 'year' : 'years'} ago`;
    if (months > 0) return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  };
  
  // Extract a preview of the content
  const contentPreview = entry.content.length > 150 
    ? entry.content.substring(0, 150) + '...' 
    : entry.content;
  
  return (
    <Card className="mb-8 border-accent/20 transition-all duration-300 hover:shadow-md hover:border-accent/40">
      <div className="h-1.5 w-full bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 rounded-t-lg opacity-70"></div>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent-foreground/80" />
              <span>Memory from {entryAgeText()}</span>
            </h3>
            <div className="flex items-center text-sm text-muted-foreground gap-2 mt-1">
              <Calendar className="h-4 w-4" />
              <span>{dayOfWeek}, {formattedDate}</span>
            </div>
          </div>
          <div className="px-2 py-1 rounded-full bg-accent/10 text-xs text-accent-foreground/80 flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            {timePeriod}
          </div>
        </div>
        
        <div className="bg-accent/5 p-4 rounded-lg border border-accent/10 mb-4">
          <p className="italic text-secondary-foreground leading-relaxed">{contentPreview}</p>
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <div className="flex gap-2">
            {entry.moods && entry.moods.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {entry.moods.map((mood, index) => (
                  <span 
                    key={index} 
                    className="px-2 py-1 text-xs rounded-full bg-secondary/10 text-secondary-foreground"
                  >
                    {mood}
                  </span>
                ))}
              </div>
            )}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-sm"
            onClick={() => {
              const entryDate = new Date(entry.date);
              navigate(`/journal/${entryDate.getFullYear()}/${entryDate.getMonth() + 1}/${entryDate.getDate()}`);
            }}
          >
            Revisit <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const MemoryLane = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('same-day');
  const { toast } = useToast();
  
  // Fetch all journal entries
  const { data: allEntries = [], isLoading } = useQuery<JournalEntry[]>({
    queryKey: ['/api/entries'], 
  });
  
  // Filter entries based on selected time period
  const memoriesForTimePeriod = () => {
    const today = new Date();
    
    switch (selectedPeriod) {
      case 'same-day':
        // Entries from the same day in previous years or months
        return allEntries.filter(entry => {
          const entryDate = new Date(entry.date);
          const isSameDay = entryDate.getDate() === today.getDate();
          const isSameMonth = entryDate.getMonth() === today.getMonth();
          return isSameDay && isSameMonth && entryDate.getFullYear() < today.getFullYear();
        });
        
      case '1-month':
        // Entries from approximately 1 month ago
        const oneMonthAgo = subMonths(today, 1);
        return allEntries.filter(entry => {
          const entryDate = new Date(entry.date);
          const diffDays = differenceInDays(today, entryDate);
          return diffDays >= 25 && diffDays <= 35; // About a month
        });
        
      case '3-months':
        // Entries from approximately 3 months ago
        const threeMonthsAgo = subMonths(today, 3);
        return allEntries.filter(entry => {
          const entryDate = new Date(entry.date);
          const diffDays = differenceInDays(today, entryDate);
          return diffDays >= 85 && diffDays <= 95; // About 3 months
        });
        
      case '6-months':
        // Entries from approximately 6 months ago
        const sixMonthsAgo = subMonths(today, 6);
        return allEntries.filter(entry => {
          const entryDate = new Date(entry.date);
          const diffDays = differenceInDays(today, entryDate);
          return diffDays >= 175 && diffDays <= 190; // About 6 months
        });
        
      case '1-year':
        // Entries from approximately 1 year ago
        const oneYearAgo = subYears(today, 1);
        return allEntries.filter(entry => {
          const entryDate = new Date(entry.date);
          const diffDays = differenceInDays(today, entryDate);
          return diffDays >= 360 && diffDays <= 370; // About a year
        });
        
      default:
        return [];
    }
  };
  
  const memories = memoriesForTimePeriod();
  
  // For demo purposes, we'll also show a hard-coded memory if there are no real ones
  const demoMemories = memories.length > 0 ? [] : [
    {
      id: 999,
      userId: 1,
      title: null,
      content: "Demo memory: This is a sample memory entry to show how the Memory Lane feature works. Once you've been journaling for some time, real memories from your past will appear here.",
      date: new Date(subYears(new Date(), 1)),
      moods: ["Nostalgic", "Reflective"],
      aiResponse: null,
      isFavorite: false
    } as JournalEntry
  ];
  
  const allMemories = [...memories, ...demoMemories];
  
  return (
    <div className="flex flex-col md:flex-row">
      <Sidebar />
      
      <div className="w-full md:w-3/4 lg:w-4/5 p-6 md:p-8 lg:p-12 overflow-y-auto" style={{ maxHeight: "calc(100vh - 136px)" }}>
        <div className="mb-8">
          <h1 className="font-header text-3xl font-bold text-primary">Memory Lane</h1>
          <p className="text-muted-foreground">Revisit your past journal entries and reflect on your journey</p>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-8">
          {TIME_PERIODS.map((period) => (
            <Button
              key={period.value}
              variant={selectedPeriod === period.value ? "default" : "outline"}
              className={selectedPeriod === period.value ? "bg-accent hover:bg-accent" : ""}
              onClick={() => setSelectedPeriod(period.value)}
            >
              {period.label}
            </Button>
          ))}
        </div>
        
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading your memories...</p>
          </div>
        ) : allMemories.length > 0 ? (
          <div>
            {allMemories.map((entry) => (
              <MemoryEntry 
                key={entry.id} 
                entry={entry} 
                timePeriod={TIME_PERIODS.find(p => p.value === selectedPeriod)?.label || ''} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-accent/5 rounded-lg border border-accent/10">
            <h3 className="text-xl font-semibold mb-2">No memories found for this time period</h3>
            <p className="text-muted-foreground mb-6">
              As you continue your journaling journey, this space will fill with meaningful memories from your past.
            </p>
            <Button 
              variant="outline" 
              onClick={() => setSelectedPeriod('same-day')}
              className="mx-auto"
            >
              Try another time period
            </Button>
          </div>
        )}
        
        {allMemories.length > 0 && (
          <div className="mt-8 p-6 bg-accent/5 rounded-lg border border-accent/10">
            <h3 className="text-lg font-semibold mb-2">Reflection Prompts</h3>
            <p className="text-muted-foreground mb-4">
              As you revisit these memories, consider:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2 items-start">
                <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center text-accent-foreground shrink-0 mt-0.5">1</div>
                <span>How have your perspectives changed since you wrote this entry?</span>
              </li>
              <li className="flex gap-2 items-start">
                <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center text-accent-foreground shrink-0 mt-0.5">2</div>
                <span>What would you tell your past self now, knowing what you know today?</span>
              </li>
              <li className="flex gap-2 items-start">
                <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center text-accent-foreground shrink-0 mt-0.5">3</div>
                <span>What patterns do you notice in your thoughts or feelings over time?</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoryLane;