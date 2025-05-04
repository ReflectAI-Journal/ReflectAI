import { startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, format, getDay } from 'date-fns';
import { JournalEntry } from '@/types/journal';

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
  
  return (
    <div className="mb-10">
      <div className="grid grid-cols-7 gap-4 mb-4">
        {weekdays.map(day => (
          <div key={day} className="text-center font-medium text-muted-foreground">
            {day}
          </div>
        ))}
        
        {/* Empty cells for days before start of month */}
        {emptyStartCells.map((_, index) => (
          <div key={`empty-start-${index}`} className="h-24 border rounded-md bg-muted/20"></div>
        ))}
        
        {/* Calendar days */}
        {daysInMonth.map(day => {
          const isToday = isSameDay(day, new Date());
          const dayEntries = getEntriesForDate(day);
          const hasEntry = dayEntries.length > 0;
          
          return (
            <div 
              key={day.toISOString()} 
              className={`h-24 border rounded-md p-2 transition-all hover:shadow-md cursor-pointer
                ${isToday ? 'border-primary-light border-2' : 'border-border'}
                ${hasEntry ? 'bg-accent/10' : ''}
              `}
              onClick={() => onDayClick(year, month, day.getDate())}
            >
              <div className="flex justify-between items-start">
                <span className={`text-sm font-medium ${isToday ? 'bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center' : ''}`}>
                  {day.getDate()}
                </span>
                {hasEntry && (
                  <span className="bg-primary/80 text-white text-xs rounded-full px-1.5 py-0.5">
                    {dayEntries.length}
                  </span>
                )}
              </div>
              
              {/* Preview of entry if exists */}
              {hasEntry && (
                <div className="mt-2 text-xs">
                  <p className="line-clamp-2 text-muted-foreground">
                    {dayEntries[0].content.substring(0, 40)}...
                  </p>
                  {dayEntries[0].moods && dayEntries[0].moods.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {dayEntries[0].moods.slice(0, 2).map((mood, i) => (
                        <span key={i} className="inline-block bg-accent text-white text-[10px] px-1 py-0.5 rounded-full">
                          {mood}
                        </span>
                      ))}
                      {dayEntries[0].moods.length > 2 && (
                        <span className="inline-block bg-muted text-muted-foreground text-[10px] px-1 py-0.5 rounded-full">
                          +{dayEntries[0].moods.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
