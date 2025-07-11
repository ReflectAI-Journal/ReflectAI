import React from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  BarChart2, 
  Target, 
  Clock, 
  Home,
  Brain, 
  MessageCircle
} from 'lucide-react';
import { JournalStats } from '@/types/journal';

const SidebarNav: React.FC = () => {
  const [location] = useLocation();
  
  // Get stats for journal entry count
  const { data: stats } = useQuery<JournalStats>({
    queryKey: ["/api/stats"],
  });
  
  const navItems = [
    {
      name: 'Journal',
      path: '/app/journal',
      icon: <Home className="h-4 w-4 mr-2" />
    },
    {
      name: 'Archives',
      path: '/app/archives',
      icon: <BookOpen className="h-4 w-4 mr-2" />,
      badge: stats?.entriesCount
    },
    {
      name: 'Stats',
      path: '/app/stats',
      icon: <BarChart2 className="h-4 w-4 mr-2" />
    },
    {
      name: 'Goals',
      path: '/app/goals',
      icon: <Target className="h-4 w-4 mr-2" />
    },
    {
      name: 'Check-ins',
      path: '/app/check-ins',
      icon: <Clock className="h-4 w-4 mr-2" />
    },
    {
      name: 'Counselor',
      path: '/app',
      icon: <MessageCircle className="h-4 w-4 mr-2" />
    },
    {
      name: 'Philosopher',
      path: '/app/philosopher',
      icon: <Brain className="h-4 w-4 mr-2" />
    }
  ];

  return (
    <div className="mb-6">
      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = location === item.path;
          
          return (
            <Link key={item.path} href={item.path}>
              <div className="relative">
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start text-left ${
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {item.icon}
                  {item.name}
                </Button>
                {item.badge && item.badge > 0 && (
                  <span className="absolute top-0 right-1 bg-primary text-white text-xs rounded-full h-5 min-w-5 px-1 flex items-center justify-center">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default SidebarNav;