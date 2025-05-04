import { useState } from 'react';
import { useLocation } from 'wouter';
import { useTheme } from '@/components/ui/theme-provider';
import { BookOpen } from 'lucide-react';
import ProfileMenu from './ProfileMenu';
import { GoalTimeTracker } from '@/components/goals/GoalTimeTracker';

const Header = () => {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  
  return (
    <header className="bg-card/80 backdrop-blur-md border-b border-border/50 py-4 px-6 md:px-12 sticky top-0 z-50">
      <div className="container mx-auto">
        {/* Top row: Logo and Profile Menu */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-primary/90 flex items-center justify-center text-white">
              <BookOpen className="h-5 w-5" />
            </div>
            <h1 className="font-header text-2xl font-bold gradient-text">ReflectAI</h1>
          </div>
          
          {/* Profile Menu */}
          <ProfileMenu />
        </div>
        
        {/* Bottom row: Goal Time Tracker */}
        <div className="w-full">
          <GoalTimeTracker />
        </div>
      </div>
    </header>
  );
};

export default Header;