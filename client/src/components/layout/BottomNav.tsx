import React from 'react';
import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { 
  MessageCircle, 
  BarChart2, 
  Calendar, 
  PenTool, 
  Brain,
  Target,
  Network,
  Sparkles,
  Heart
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
      label: 'Archives',
      icon: <Calendar className="h-5 w-5" />,
      path: '/app/archives'
    },
    {
      label: 'Check-ins',
      icon: <Heart className="h-5 w-5" />,
      path: '/app/memory-lane'
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 nav-premium border-t border-white/10 pb-safe">
      {/* Premium background effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 via-blue-900/10 to-transparent pointer-events-none" />
      
      {/* Main navigation items */}
      <div className="relative grid grid-cols-5 items-end h-16 pt-2 px-2">
        {navItems.map((item, index) => {
          const isActive = location.startsWith(item.path) || 
                          (item.path === '/app' && location === '/app') ||
                          (item.path === '/app' && location === '/app/counselor');
          
          return (
            <div key={item.path} className="flex justify-center">
              <button
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex flex-col items-center justify-center transition-all duration-300 ease-out group relative",
                  item.highlight ? "relative -mt-3" : "",
                  isActive ? "scale-110" : "hover:scale-105"
                )}
              >
                {/* Subtle highlight effect for active item */}
                {isActive && (
                  <div className="absolute -top-1 -bottom-1 -left-3 -right-3 bg-gradient-to-r from-purple-500/10 via-blue-500/15 to-purple-500/10 rounded-2xl" />
                )}
                
                <div className={cn(
                  "relative flex items-center justify-center transition-all duration-300 group-hover:scale-110",
                  item.highlight 
                    ? "h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white shadow-lg counselor-gradient-slow" 
                    : cn(
                        "h-8 w-8 rounded-xl transition-all duration-300",
                        isActive 
                          ? "bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-400/30 shadow-lg" 
                          : "hover:bg-white/5"
                      )
                )}>

                  
                  <div className={cn(
                    "transition-all duration-300",
                    isActive ? "text-blue-400 drop-shadow-lg" : "text-gray-400 group-hover:text-gray-200"
                  )}>
                    {item.icon}
                  </div>
                </div>
                
                <span className={cn(
                  "text-[10px] mt-1.5 text-center font-medium transition-all duration-300",
                  item.highlight ? "text-white text-glow" : "",
                  isActive ? "text-blue-400 font-semibold" : "text-gray-400 group-hover:text-gray-200"
                )}>
                  {item.label}
                </span>
                
                {/* Active indicator dot */}
                {isActive && !item.highlight && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full animate-pulse" />
                )}
              </button>
            </div>
          );
        })}
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