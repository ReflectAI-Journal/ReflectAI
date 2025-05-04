import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { Link, useLocation } from 'wouter';
import EntryCard from '@/components/journal/EntryCard';
import { Button } from '@/components/ui/button';
import { useJournal } from '@/hooks/useJournal';
import { JournalEntry } from '@/types/journal';
import SidebarNav from './SidebarNav';

const Sidebar = () => {
  const [location] = useLocation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [recentEntries, setRecentEntries] = useState<JournalEntry[]>([]);
  const { loadEntry } = useJournal();
  
  // Format the month for display
  const currentMonthLabel = format(currentDate, 'MMMM yyyy');
  
  // Get all entries
  const { data: entries = [], isLoading: entriesLoading } = useQuery<JournalEntry[]>({
    queryKey: ['/api/entries'],
  });
  
  // Get journal stats
  const { data: stats } = useQuery({
    queryKey: ['/api/stats'],
  });
  
  // Update recent entries when entries data changes
  useEffect(() => {
    if (entries && entries.length > 0) {
      // Sort entries by date (newest first) and get the 4 most recent
      const sorted = [...entries].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setRecentEntries(sorted.slice(0, 4));
    }
  }, [entries]);
  
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
      return;
    }
    
    loadEntry(day.getFullYear(), day.getMonth() + 1, day.getDate());
    
    // Navigate to home to view/edit this entry
    if (location !== '/') {
      window.location.href = '/';
    }
  };
  
  return (
    <aside className="w-full md:w-1/4 lg:w-1/5 bg-white border-r border-gray-200 p-6 overflow-y-auto h-[calc(100vh-136px)]">
      {/* User Info */}
      <div className="flex items-center mb-8">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
          <span className="font-semibold">JA</span>
        </div>
        <div className="ml-3">
          <p className="font-medium">Journal AI</p>
          <p className="text-sm text-muted-foreground">Your reflection companion</p>
        </div>
      </div>
      
      {/* Calendar Navigation */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-header text-lg font-semibold">{currentMonthLabel}</h2>
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon" onClick={() => navigateMonth('prev')}>
              <i className="fas fa-chevron-left"></i>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigateMonth('next')}>
              <i className="fas fa-chevron-right"></i>
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2">
          <div className="text-muted-foreground">S</div>
          <div className="text-muted-foreground">M</div>
          <div className="text-muted-foreground">T</div>
          <div className="text-muted-foreground">W</div>
          <div className="text-muted-foreground">T</div>
          <div className="text-muted-foreground">F</div>
          <div className="text-muted-foreground">S</div>
        </div>
        
        <div className="grid grid-cols-7 gap-1 text-sm">
          {calendarDays.map((day, index) => {
            const isToday = isSameDay(day, new Date());
            const inCurrentMonth = isSameMonth(day, currentDate);
            const hasEntry = hasEntries(day);
            
            return (
              <div 
                key={index}
                className={`
                  calendar-day h-8 w-8 rounded-full flex items-center justify-center cursor-pointer
                  ${!inCurrentMonth ? 'inactive text-muted-foreground' : ''}
                  ${hasEntry ? 'has-entry' : ''}
                  ${isToday ? 'today' : ''}
                `}
                onClick={() => handleDayClick(day)}
              >
                {day.getDate()}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Recent Entries */}
      <div className="mb-8">
        <h2 className="font-header text-lg font-semibold mb-4">Recent Entries</h2>
        {entriesLoading ? (
          <p className="text-sm text-muted-foreground">Loading entries...</p>
        ) : recentEntries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No journal entries yet. Start writing today!</p>
        ) : (
          <div className="space-y-4">
            {recentEntries.map(entry => (
              <EntryCard 
                key={entry.id} 
                entry={entry} 
                onClick={() => loadEntry(
                  new Date(entry.date).getFullYear(),
                  new Date(entry.date).getMonth() + 1,
                  new Date(entry.date).getDate()
                )}
              />
            ))}
          </div>
        )}
        
        <div className="flex flex-wrap gap-2 mt-4">
          <Link href="/archives" className="inline-block text-sm font-medium text-primary hover:text-primary-dark transition-colors">
            View all entries <i className="fas fa-arrow-right ml-1"></i>
          </Link>
          <Link href="/memory-lane" className="inline-block text-sm font-medium text-accent hover:text-accent-dark transition-colors">
            Memory Lane <i className="fas fa-clock ml-1"></i>
          </Link>
        </div>
      </div>
      
      {/* Journal Stats */}
      <div>
        <h2 className="font-header text-lg font-semibold mb-4">Journal Stats</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-3 rounded-md shadow-journal">
            <p className="text-muted-foreground text-sm">Entries this month</p>
            <p className="font-semibold text-xl">{stats?.entriesCount || 0}</p>
          </div>
          <div className="bg-white p-3 rounded-md shadow-journal">
            <p className="text-muted-foreground text-sm">Journaling streak</p>
            <p className="font-semibold text-xl">{stats?.currentStreak || 0} days</p>
          </div>
          <div className="bg-white p-3 rounded-md shadow-journal">
            <p className="text-muted-foreground text-sm">Top mood</p>
            <p className="font-semibold">
              {stats?.topMoods && Object.keys(stats.topMoods).length > 0
                ? Object.entries(stats.topMoods).sort((a, b) => b[1] - a[1])[0][0]
                : 'None yet'
              }
            </p>
          </div>
          <div className="bg-white p-3 rounded-md shadow-journal">
            <p className="text-muted-foreground text-sm">Total entries</p>
            <p className="font-semibold text-xl">{entries?.length || 0}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
