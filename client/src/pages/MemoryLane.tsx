import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import Sidebar from '@/components/layout/Sidebar';
import BackButton from '@/components/layout/BackButton';
import { JournalEntry } from '@shared/schema';
import { format, differenceInDays, differenceInMonths, differenceInYears, subYears, subMonths } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Calendar, ArrowRight, Sparkles } from 'lucide-react';
import { useLocation } from 'wouter';

const TIME_PERIODS = [
  { label: 'This day in the past', value: 'same-day', icon: '📅' },
  { label: 'One month ago', value: '1-month', icon: '🕰️' },
  { label: 'Three months ago', value: '3-months', icon: '⏳' },
  { label: 'Six months ago', value: '6-months', icon: '🗓️' },
  { label: 'One year ago', value: '1-year', icon: '🌟' },
  { label: 'All memories', value: 'all', icon: '✨' },
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
  
  // Choose random subtle texture/pattern for this memory's visual effect
  const patternClasses = [
    'memory-pattern-dots',
    'memory-pattern-lines',
    'memory-pattern-waves',
    'memory-pattern-gradient',
  ];
  
  const randomPatternClass = patternClasses[Math.floor(Math.random() * patternClasses.length)];
  
  // Determine if this is a favorite entry to add a special visual
  const isFavorite = entry.isFavorite;

  return (
    <Card className={`mb-8 border-accent/20 transition-all duration-500 hover:shadow-md hover:border-accent/50 relative overflow-hidden ${randomPatternClass} hover:scale-[1.01]`}
      style={{
        transformOrigin: 'center',
      }}
    >
      {/* Colorful top border */}
      <div className="h-1.5 w-full bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 rounded-t-lg opacity-70"></div>
      
      {/* Nostalgic paper-like texture */}
      <div className="absolute inset-0 bg-card/20 opacity-20 mix-blend-overlay pointer-events-none memory-texture"></div>
      
      {/* Favorite star */}
      {isFavorite && (
        <div className="absolute -top-3 -right-3 w-16 h-16 flex justify-center items-center rotate-12 opacity-80 pointer-events-none">
          <div className="absolute w-8 h-8 bg-yellow-500/40 rounded-full blur-md"></div>
          <Sparkles className="w-5 h-5 text-yellow-400 z-10 absolute" />
        </div>
      )}
      
      <CardContent className="p-6 relative z-10">
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
          <div className="px-3 py-1 rounded-full bg-accent/10 text-xs text-accent-foreground/80 flex items-center border border-accent/20">
            <Clock className="h-3 w-3 mr-1" />
            {timePeriod}
          </div>
        </div>
        
        {/* Content with a subtle sepia-like effect */}
        <div className="bg-accent/5 p-5 rounded-lg border border-accent/20 mb-4 shadow-inner relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent pointer-events-none"></div>
          <p className="italic text-foreground/90 leading-relaxed font-medium relative z-10">{contentPreview}</p>
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <div className="flex gap-2">
            {entry.moods && entry.moods.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {entry.moods.map((mood, index) => (
                  <span 
                    key={index} 
                    className="px-2 py-1 text-xs rounded-full bg-secondary/10 text-secondary-foreground border border-secondary/20 transform transition-transform hover:scale-110"
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
            className="text-sm bg-card/50 border-accent/30 hover:bg-accent/20 text-accent-foreground"
            onClick={() => {
              const entryDate = new Date(entry.date);
              // Navigate to home page with the proper date to load the entry
              navigate('/');
              // Use a small delay to ensure navigation happens before attempting to load
              setTimeout(() => {
                // Dispatch a custom event that JournalEditor can listen for
                window.dispatchEvent(new CustomEvent('load-journal-entry', {
                  detail: {
                    year: entryDate.getFullYear(),
                    month: entryDate.getMonth() + 1,
                    day: entryDate.getDate(),
                  }
                }));
              }, 100);
            }}
          >
            Revisit <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
        
        {/* Show AI response preview if available */}
        {entry.aiResponse && (
          <div className="mt-4 pt-4 border-t border-accent/10">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <Sparkles className="h-3 w-3" />
              <span>AI reflection from this memory</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {entry.aiResponse.length > 100 
                ? entry.aiResponse.substring(0, 100) + '...' 
                : entry.aiResponse
              }
            </p>
          </div>
        )}
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
    
    // Sort entries by date (newest first) to ensure consistent ordering
    const sortedEntries = [...allEntries].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    switch (selectedPeriod) {
      case 'same-day':
        // Entries from the same day in previous years or months
        return sortedEntries.filter(entry => {
          const entryDate = new Date(entry.date);
          const isSameDay = entryDate.getDate() === today.getDate();
          const isSameMonth = entryDate.getMonth() === today.getMonth();
          return isSameDay && isSameMonth && entryDate.getFullYear() < today.getFullYear();
        });
        
      case '1-month':
        // Entries from approximately 1 month ago (more flexible range)
        return sortedEntries.filter(entry => {
          const entryDate = new Date(entry.date);
          const diffDays = differenceInDays(today, entryDate);
          return diffDays >= 20 && diffDays <= 45; // Broader range around 1 month
        });
        
      case '3-months':
        // Entries from approximately 3 months ago (more flexible range)
        return sortedEntries.filter(entry => {
          const entryDate = new Date(entry.date);
          const diffDays = differenceInDays(today, entryDate);
          return diffDays >= 75 && diffDays <= 110; // Broader range around 3 months
        });
        
      case '6-months':
        // Entries from approximately 6 months ago (more flexible range)
        return sortedEntries.filter(entry => {
          const entryDate = new Date(entry.date);
          const diffDays = differenceInDays(today, entryDate);
          return diffDays >= 160 && diffDays <= 200; // Broader range around 6 months
        });
        
      case '1-year':
        // Entries from approximately 1 year ago (more flexible range)
        return sortedEntries.filter(entry => {
          const entryDate = new Date(entry.date);
          const diffDays = differenceInDays(today, entryDate);
          return diffDays >= 330 && diffDays <= 395; // Broader range around 1 year
        });
      
      case 'all':
        // All past entries, with a small buffer to exclude very recent entries (like today)
        return sortedEntries.filter(entry => {
          const entryDate = new Date(entry.date);
          const diffDays = differenceInDays(today, entryDate);
          return diffDays >= 7; // Entries at least a week old to qualify as "memories"
        });
        
      default:
        return [];
    }
  };
  
  const memories = memoriesForTimePeriod();
  
  // For demo purposes, we'll show hard-coded memories if there are no real ones
  const demoMemories = memories.length > 0 ? [] : [
    {
      id: 999,
      userId: 1,
      title: null,
      content: "Today I reflected on how far I've come in the past year. It's amazing to look back and see the growth in myself. I'm proud of the challenges I've overcome and the small daily victories. Looking forward to what the next year brings!",
      date: new Date(subYears(new Date(), 1)),
      moods: ["Grateful", "Reflective", "Peaceful"],
      aiResponse: "You're exhibiting wonderful self-awareness by taking time to acknowledge your personal growth. This kind of reflection is vital for continued development and emotional well-being. Keep celebrating those small victories!",
      isFavorite: true
    } as JournalEntry,
    {
      id: 998,
      userId: 1,
      title: null,
      content: "Had a moment of realization today while watching the sunset. Sometimes we get so caught up in planning for tomorrow that we forget to appreciate today. I'm making a conscious effort to be more present and grateful for the small moments of beauty in my everyday life.",
      date: new Date(subMonths(new Date(), 6)),
      moods: ["Inspired", "Calm", "Thoughtful"],
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
          <div className="flex items-center gap-3 mb-2">
            <BackButton />
            <h1 className="font-header text-3xl font-bold text-primary">Memory Lane</h1>
          </div>
          <p className="text-muted-foreground">Revisit your past journal entries and reflect on your journey</p>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-8">
          {TIME_PERIODS.map((period) => (
            <Button
              key={period.value}
              variant={selectedPeriod === period.value ? "default" : "outline"}
              className={`${selectedPeriod === period.value ? "bg-accent hover:bg-accent" : ""} gap-2`}
              onClick={() => setSelectedPeriod(period.value)}
            >
              <span role="img" aria-label={period.label}>{period.icon}</span>
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