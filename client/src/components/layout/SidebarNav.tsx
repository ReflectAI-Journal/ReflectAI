import React from 'react';
import { Link, useLocation } from 'wouter';
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

const navItems = [
  {
    name: 'Home',
    path: '/',
    icon: <Home className="h-4 w-4 mr-2" />
  },
  {
    name: 'Archives',
    path: '/archives',
    icon: <BookOpen className="h-4 w-4 mr-2" />
  },
  {
    name: 'Stats',
    path: '/stats',
    icon: <BarChart2 className="h-4 w-4 mr-2" />
  },
  {
    name: 'Goals',
    path: '/goals',
    icon: <Target className="h-4 w-4 mr-2" />
  },
  {
    name: 'Memory Lane',
    path: '/memory-lane',
    icon: <Clock className="h-4 w-4 mr-2" />
  },
  {
    name: 'Chat',
    path: '/chat',
    icon: <MessageCircle className="h-4 w-4 mr-2" />
  },
  {
    name: 'Philosopher',
    path: '/philosopher',
    icon: <Brain className="h-4 w-4 mr-2" />
  }
];

const SidebarNav: React.FC = () => {
  const [location] = useLocation();
  
  return (
    <div className="mb-6">
      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = location === item.path;
          
          return (
            <Link key={item.path} href={item.path}>
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
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default SidebarNav;