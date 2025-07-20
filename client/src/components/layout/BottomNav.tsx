import React from 'react';
import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart2, 
  Calendar, 
  PenTool, 
  Brain,
  Target,
  Network,
  Sparkles,
  Heart,
  MessageSquare
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
      icon: <Brain className="h-5 w-5" />,
      path: '/app/counselor'
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
      label: 'Archives',
      icon: <Calendar className="h-5 w-5" />,
      path: '/app/archives'
    },
    {
      label: 'Check-ins',
      icon: <Heart className="h-5 w-5" />,
      path: '/app/memory-lane'
    },
    {
      label: 'Feedback',
      icon: <MessageSquare className="h-5 w-5" />,
      path: '/app/feedback'
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/50 safe-area-bottom">
      {/* Unified navigation with floating elements */}
      <div className="px-4 py-3 safe-area-left safe-area-right">
        {/* Main navigation items in a cleaner grid */}
        <div className="grid grid-cols-5 gap-2 mb-3">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 group",
                (item.path === '/app' ? location === '/app' : location.startsWith(item.path))
                  ? "bg-gradient-to-br from-purple-500/20 to-blue-500/20 text-primary scale-105" 
                  : "text-muted-foreground hover:bg-muted/40 hover:scale-105"
              )}
            >
              <div className="flex items-center justify-center mb-1 transition-all duration-200 h-6 w-6">
                {item.icon}
              </div>
              <span className="text-[10px] font-medium text-center leading-tight">
                {item.label}
              </span>
            </button>
          ))}
        </div>

        {/* Secondary items as floating pills */}
        <div className="flex justify-center items-center space-x-2">
          {secondaryItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
                location.startsWith(item.path) 
                  ? "bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-md" 
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {React.cloneElement(item.icon, { className: "h-3.5 w-3.5" })}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BottomNav;