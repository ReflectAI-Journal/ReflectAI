import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { JournalEntry } from '@/types/journal';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface CalendarSelectorProps {
  onSelectDate: (year: number, month: number, day: number) => void;
}

const CalendarSelector = ({ onSelectDate }: CalendarSelectorProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { user } = useAuth();
  
  // Format the month for display
  const currentMonthLabel = format(currentDate, 'MMMM yyyy');
  
  // Get all entries
  const { data: entries = [] } = useQuery<JournalEntry[]>({
    queryKey: ['/api/entries'],
    queryFn: async () => {
      // For guest users, create mock calendar data with entries on specific days
      if (user?.isGuest) {
        const mockEntries: JournalEntry[] = [];
        const today = new Date();
        
        // Create entries for the past 30 days at regular intervals
        for (let i = 0; i < 30; i += 2) { // Every other day
          const entryDate = new Date(today);
          entryDate.setDate(today.getDate() - i);
          
          mockEntries.push({
            id: 9000 - i,
            userId: 0,
            date: entryDate.toISOString(),
            title: `Sample Entry ${i}`,
            content: 'This is a sample journal entry for the calendar view.',
            moods: ['Neutral'],
            aiResponse: null,
            isFavorite: false
          });
        }
        
        return mockEntries;
      }
      
      // Regular data fetching for non-guest users
      const res = await fetch('/api/entries');
      return res.json();
    }
  });
  
  // Generate days for the calendar
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Get day of week of first day (0 = Sunday, 6 = Saturday)
  const startDay = monthStart.getDay();
  
  // Days from previous month to display at start
  const prevMonthDays = Array.from({ length: startDay }, (_, i) => {
    const prevMonth = subMonths(monthStart, 1);
    const daysInPrevMonth = endOfMonth(prevMonth).getDate();
    return new Date(prevMonth.getFullYear(), prevMonth.getMonth(), daysInPrevMonth - startDay + i + 1);
  });
  
  // Days from next month to display at end (to fill a 6-row calendar)
  const totalCells = 42; // 6 rows of 7 days
  const nextMonthDaysCount = totalCells - daysInMonth.length - prevMonthDays.length;
  const nextMonthDays = Array.from({ length: nextMonthDaysCount }, (_, i) => {
    return new Date(monthEnd.getFullYear(), monthEnd.getMonth() + 1, i + 1);
  });
  
  // Combine all days
  const calendarDays = [...prevMonthDays, ...daysInMonth, ...nextMonthDays];
  
  // Function to check if a day has entries
  const hasEntries = (day: Date) => {
    return entries.some(entry => {
      const entryDate = new Date(entry.date);
      return isSameDay(day, entryDate);
    });
  };
  
  // Navigate to previous/next month
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(direction === 'prev' 
      ? subMonths(currentDate, 1)
      : addMonths(currentDate, 1)
    );
  };
  
  // Handle clicking on a calendar day
  const handleDayClick = (day: Date) => {
    if (!isSameMonth(day, currentDate)) {
      setCurrentDate(new Date(day.getFullYear(), day.getMonth(), 1));
    }
    
    onSelectDate(day.getFullYear(), day.getMonth() + 1, day.getDate());
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-header text-base md:text-lg font-semibold">{currentMonthLabel}</h2>
        <div className="flex space-x-1 md:space-x-2">
          <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => navigateMonth('prev')}>
            <ChevronLeft className="h-3 w-3 md:h-4 md:w-4" />
          </Button>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => navigateMonth('next')}>
            <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-0.5 md:gap-1 text-center text-xs md:text-sm mb-1 md:mb-2">
        <div className="text-muted-foreground">S</div>
        <div className="text-muted-foreground">M</div>
        <div className="text-muted-foreground">T</div>
        <div className="text-muted-foreground">W</div>
        <div className="text-muted-foreground">T</div>
        <div className="text-muted-foreground">F</div>
        <div className="text-muted-foreground">S</div>
      </div>
      
      <div className="grid grid-cols-7 gap-0.5 md:gap-1 text-xs md:text-sm">
        {calendarDays.map((day, index) => {
          const isToday = isSameDay(day, new Date());
          const inCurrentMonth = isSameMonth(day, currentDate);
          const hasEntry = hasEntries(day);
          
          return (
            <button 
              key={index}
              className={`
                h-7 w-7 md:h-10 md:w-10 rounded-full flex items-center justify-center transition-all
                ${!inCurrentMonth ? 'text-muted-foreground/60 hover:bg-muted/50' : 'hover:bg-muted/70'}
                ${hasEntry ? 'before:absolute before:w-1 before:h-1 before:bg-primary before:rounded-full before:bottom-1 md:before:bottom-1.5 hover:before:bg-primary-light' : ''}
                ${isToday ? 'bg-primary/10 text-primary font-medium ring-1 ring-primary/40' : ''}
              `}
              onClick={() => handleDayClick(day)}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarSelector;