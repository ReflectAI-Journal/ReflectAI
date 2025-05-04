import React from 'react';
import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { 
  Home, 
  BarChart2, 
  Calendar, 
  MessageCircle, 
  Book, 
  Brain,
  Target
} from 'lucide-react';
import { JournalStats } from '@/types/journal';

const BottomNav = () => {
  const [location, navigate] = useLocation();
  
  // Get stats for journal entry count
  const { data: stats } = useQuery<JournalStats>({
    queryKey: ["/api/stats"],
  });

  const navItems = [
    {
      label: 'Archives',
      icon: <Calendar className="h-5 w-5" />,
      path: '/app/archives'
    },
    {
      label: 'Philosopher',
      icon: <Brain className="h-5 w-5" />,
      path: '/app/philosopher'
    },
    {
      label: 'Home',
      icon: <Home className="h-6 w-6" />,
      path: '/app',
      highlight: true
    },
    {
      label: 'Chat',
      icon: <MessageCircle className="h-5 w-5" />,
      path: '/app/chat'
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
      label: 'Memory',
      icon: <Book className="h-5 w-5" />,
      path: '/app/memory-lane'
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-t border-border pb-safe">
      {/* Main navigation items */}
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={cn(
              "flex flex-col items-center justify-center",
              item.highlight && "relative -mt-5 p-3 rounded-full",
              location === item.path ? "text-primary" : "text-muted-foreground"
            )}
          >
            <div className={cn(
              "flex items-center justify-center",
              item.highlight && "h-12 w-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white"
            )}>
              {item.icon}
            </div>
            <span className={cn(
              "text-xs mt-1",
              item.highlight && "font-medium"
            )}>
              {item.label}
            </span>
            {/* Badge removed as requested */}
          </button>
        ))}
      </div>

      {/* Secondary items */}
      <div className="flex justify-center space-x-8 py-1 text-xs border-t border-border/50">
        {secondaryItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={cn(
              "flex items-center space-x-1 px-2 py-1 rounded-full",
              location === item.path 
                ? "text-primary bg-primary/10" 
                : "text-muted-foreground hover:bg-muted/60"
            )}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomNav;