import React from 'react';
import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { 
  MessageCircle, 
  BarChart2, 
  Calendar, 
  PenTool, 
  Book, 
  Brain,
  Target,
  Network,
  Sparkles,
  Heart,
  Trophy
} from 'lucide-react';
import { JournalStats } from '@/types/journal';

const BottomNav = () => {
  const [location, navigate] = useLocation();
  
  // Get stats for journal entry count
  const { data: stats } = useQuery<JournalStats>({
    queryKey: ["/api/stats"],
  });
  
  // Debug logs to see the current route
  console.log("Current location:", location);

  const navItems = [
    {
      label: 'Journal',
      icon: <PenTool className="h-5 w-5" />,
      path: '/app/journal'
    },
    {
      label: 'Philosopher',
      icon: <Sparkles className="h-5 w-5" />,
      path: '/app/philosopher'
    },
    {
      label: 'Counselor',
      icon: <MessageCircle className="h-6 w-6" />,
      path: '/app',
      highlight: true
    },
    {
      label: 'Patterns',
      icon: <Network className="h-5 w-5" />,
      path: '/app/mind-patterns'
    },
    {
      label: 'Goals',
      icon: <Target className="h-5 w-5" />,
      path: '/app/goals'
    }
  ];

  const secondaryItems = [
    {
      label: 'Stats',
      icon: <BarChart2 className="h-5 w-5" />,
      path: '/app/stats'
    },
    {
      label: 'Challenges',
      icon: <Trophy className="h-5 w-5" />,
      path: '/app/challenges'
    },
    {
      label: 'Check-ins',
      icon: <Book className="h-5 w-5" />,
      path: '/app/check-ins'
    },
    {
      label: 'Archives',
      icon: <Calendar className="h-5 w-5" />,
      path: '/app/archives'
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-t border-border pb-safe">
      {/* Main navigation items */}
      <div className="grid grid-cols-5 items-end h-14 pt-1">
        {navItems.map((item) => (
          <div key={item.path} className="flex justify-center">
            <button
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center nav-btn-hover",
                item.highlight ? "relative -mt-5" : "",
                location.startsWith(item.path) ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div className={cn(
                "flex items-center justify-center",
                item.highlight 
                  ? "h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md" 
                  : "h-6 w-6 flex items-center justify-center"
              )}>
                {item.icon}
              </div>
              <span className={cn(
                "text-[10px] mt-0.5 text-center",
                item.highlight ? "font-medium mt-1" : ""
              )}>
                {item.label}
              </span>
            </button>
          </div>
        ))}
      </div>

      {/* Secondary items in a more compact layout */}
      <div className="flex justify-center space-x-6 py-1 text-[10px] border-t border-border/30">
        {secondaryItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={cn(
              "flex items-center space-x-1 px-2 py-0.5 rounded-full nav-btn-hover",
              location.startsWith(item.path) 
                ? "text-primary bg-primary/10" 
                : "text-muted-foreground hover:bg-muted/60"
            )}
          >
            {React.cloneElement(item.icon, { className: "h-3.5 w-3.5 mr-1" })}
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomNav;