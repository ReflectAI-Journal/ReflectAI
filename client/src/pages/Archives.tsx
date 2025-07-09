import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import Sidebar from "@/components/layout/Sidebar";
import EntryCard from "@/components/journal/EntryCard";
import CalendarView from "@/components/journal/CalendarView";
import BackButton from "@/components/layout/BackButton";
import { format, parse, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { useJournal } from "@/hooks/useJournal";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Calendar, List } from "lucide-react";
import { JournalEntry } from "@/types/journal";

const Archives = () => {
  const [location, setLocation] = useLocation();
  const params = useParams();
  const { loadEntry } = useJournal();
  
  // Extract the year and month from params, or use current date
  const today = new Date();
  const currentYear = params?.year ? parseInt(params.year) : today.getFullYear();
  const currentMonth = params?.month ? parseInt(params.month) : today.getMonth() + 1;
  
  // Format the date for display
  const monthYearString = format(new Date(currentYear, currentMonth - 1), "MMMM yyyy");
  
  // State for view mode (calendar or list)
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  
  // Fetch entries for the current month
  const { data: entries = [], isLoading } = useQuery<JournalEntry[]>({
    queryKey: [`/api/entries/date/${currentYear}/${currentMonth}`],
  });
  
  // Generate days of the month
  const monthStart = startOfMonth(new Date(currentYear, currentMonth - 1));
  const monthEnd = endOfMonth(monthStart);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Navigate to previous/next month
  const navigateMonth = (direction: "prev" | "next") => {
    let year = currentYear;
    let month = currentMonth;
    
    if (direction === "prev") {
      if (month === 1) {
        year -= 1;
        month = 12;
      } else {
        month -= 1;
      }
    } else {
      if (month === 12) {
        year += 1;
        month = 1;
      } else {
        month += 1;
      }
    }
    
    setLocation(`/app/archives/${year}/${month}`);
  };
  
  // Open an entry when clicked
  const handleEntryClick = (entry: JournalEntry) => {
    const date = new Date(entry.date);
    loadEntry(date.getFullYear(), date.getMonth() + 1, date.getDate());
    setLocation("/app/journal");
  };
  
  return (
    <div className="flex flex-col md:flex-row">
      <Sidebar />
      
      <div className="w-full md:w-3/4 lg:w-4/5 p-6 md:p-8 lg:p-12 overflow-y-auto" style={{ maxHeight: "calc(100vh - 136px)" }}>
        {/* Archives Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <BackButton />
              <h1 className="font-header text-3xl font-bold text-primary">Journal Archives</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                onClick={() => setViewMode("calendar")}
                className={viewMode === "calendar" ? "bg-muted" : ""}
              >
                <Calendar className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "bg-muted" : ""}
              >
                <List className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {/* Month navigation */}
          <div className="flex justify-between items-center mt-4">
            <Button 
              variant="outline" 
              onClick={() => navigateMonth("prev")}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <h2 className="font-header text-xl font-semibold">{monthYearString}</h2>
            
            <Button 
              variant="outline" 
              onClick={() => navigateMonth("next")}
              className="flex items-center"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-primary">Loading entries...</div>
          </div>
        ) : (
          <>
            {viewMode === "calendar" ? (
              <CalendarView 
                year={currentYear}
                month={currentMonth}
                entries={entries}
                onDayClick={(year, month, day) => {
                  loadEntry(year, month, day);
                  setLocation("/app/journal");
                }}
              />
            ) : (
              <div className="space-y-4">
                {entries.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-lg text-muted-foreground">No journal entries for this month.</p>
                    <p className="text-sm mt-2">Start writing today to build your reflection practice.</p>
                  </div>
                ) : (
                  entries.map((entry) => (
                    <EntryCard 
                      key={entry.id} 
                      entry={entry} 
                      onClick={() => handleEntryClick(entry)} 
                    />
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Archives;
