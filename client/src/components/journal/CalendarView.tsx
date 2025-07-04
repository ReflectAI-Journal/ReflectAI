import { startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, format, getDay } from 'date-fns';
import { JournalEntry } from '@/types/journal';
import { FileText } from 'lucide-react';

interface CalendarViewProps {
  year: number;
  month: number;
  entries: JournalEntry[];
  onDayClick: (year: number, month: number, day: number) => void;
}

const CalendarView = ({ year, month, entries, onDayClick }: CalendarViewProps) => {
  // Create date objects for first and last day of month
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const lastDayOfMonth = endOfMonth(firstDayOfMonth);
  
  // Get all days in month
  const daysInMonth = eachDayOfInterval({ start: firstDayOfMonth, end: lastDayOfMonth });
  
  // Get day of week for first day (0 = Sunday, 6 = Saturday)
  const startingDayOfWeek = getDay(firstDayOfMonth);
  
  // Create array for empty cells before first day
  const emptyStartCells = Array(startingDayOfWeek).fill(null);
  
  // Function to check if a date has entries
  const hasEntryForDate = (date: Date) => {
    return entries.some(entry => {
      const entryDate = new Date(entry.date);
      return isSameDay(date, entryDate);
    });
  };
  
  // Function to get entries for a date
  const getEntriesForDate = (date: Date) => {
    return entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return isSameDay(date, entryDate);
    });
  };
  
  // Days of week headers
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Get mood colors for tags
  const getMoodColor = (mood: string) => {
    const moodColors: Record<string, { bg: string, text: string }> = {
      Happy: { bg: 'bg-amber-100', text: 'text-amber-700' },
      Sad: { bg: 'bg-blue-100', text: 'text-blue-700' },
      Anxious: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
      Excited: { bg: 'bg-fuchsia-100', text: 'text-fuchsia-700' },
      Calm: { bg: 'bg-teal-100', text: 'text-teal-700' },
      Frustrated: { bg: 'bg-red-100', text: 'text-red-700' },
      Grateful: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
      Tired: { bg: 'bg-slate-100', text: 'text-slate-700' },
    };
    
    return moodColors[mood] || { bg: 'bg-gray-100', text: 'text-gray-700' };
  };
  
  return (
    <div className="mb-10">
      <div className="grid grid-cols-7 gap-2 md:gap-3 mb-4">
        {weekdays.map(day => (
          <div key={day} className="text-center font-medium text-muted-foreground text-sm py-2">
            {day}
          </div>
        ))}
        
        {/* Empty cells for days before start of month */}
        {emptyStartCells.map((_, index) => (
          <div key={`empty-start-${index}`} className="h-24 md:h-28 border border-border/30 rounded-lg bg-card/30"></div>
        ))}
        
        {/* Calendar days */}
        {daysInMonth.map(day => {
          const isToday = isSameDay(day, new Date());
          const dayEntries = getEntriesForDate(day);
          const hasEntry = dayEntries.length > 0;
          
          return (
            <div 
              key={day.toISOString()} 
              className={`
                calendar-day h-24 md:h-28 border rounded-lg p-2 transition-all 
                hover:shadow-md cursor-pointer relative overflow-hidden
                ${isToday ? 'border-primary border-2' : 'border-border/30'}
                ${hasEntry ? 'bg-primary/5' : 'bg-card/30 hover:bg-muted/30'}
              `}
              onClick={() => onDayClick(year, month, day.getDate())}
            >
              <div className="flex justify-between items-start">
                <span className={`
                  text-sm font-medium relative
                  ${isToday ? 'bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center z-10' : 
                    hasEntry ? 'bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-sm' : ''}
                `}>
                  {day.getDate()}
                  {hasEntry && !isToday && (
                    <div className="absolute inset-0 bg-green-500/20 rounded-full animate-pulse"></div>
                  )}
                </span>
                {hasEntry && (
                  <span className="bg-gradient-to-r from-primary to-secondary text-white text-xs rounded-full px-1.5 py-0.5 flex items-center shadow-sm">
                    <FileText className="h-3 w-3 mr-0.5" />
                    {dayEntries.length}
                  </span>
                )}
              </div>
              
              {/* Preview of entry if exists */}
              {hasEntry && (
                <div className="mt-2 text-xs">
                  <p className="line-clamp-2 text-foreground opacity-80">
                    {dayEntries[0].content.substring(0, 40)}...
                  </p>
                  {dayEntries[0].moods && dayEntries[0].moods.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {dayEntries[0].moods.slice(0, 2).map((mood, i) => {
                        const { bg, text } = getMoodColor(mood);
                        return (
                          <span key={i} className={`inline-block ${bg} ${text} text-[9px] px-1.5 rounded-full border border-border/30`}>
                            {mood}
                          </span>
                        );
                      })}
                      {dayEntries[0].moods.length > 2 && (
                        <span className="inline-block bg-muted/50 text-muted-foreground text-[9px] px-1.5 rounded-full border border-border/30">
                          +{dayEntries[0].moods.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {/* Subtle gradient indicator for days with entries */}
              {hasEntry && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/40 to-secondary/40"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
