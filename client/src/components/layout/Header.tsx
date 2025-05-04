import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useTheme } from '@/components/ui/theme-provider';
import { BookOpen, Sparkles } from 'lucide-react';
import ProfileMenu from './ProfileMenu';
import { useQuery } from '@tanstack/react-query';
import { JournalEntry } from '@/types/journal';

const Header = () => {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  
  // Fetch journal entries count
  const { data: entries = [] } = useQuery<JournalEntry[]>({
    queryKey: ["/api/entries"],
  });

  const entriesCount = entries.length || 0;
  
  return (
    <header className="bg-card/80 backdrop-blur-md border-b border-border/50 py-4 px-6 md:px-12 sticky top-0 z-50">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-primary/90 flex items-center justify-center text-white">
              <BookOpen className="h-5 w-5" />
            </div>
            <h1 className="font-header text-2xl font-bold gradient-text">ReflectAI</h1>
          </div>
          
          {/* Entry Count, Premium Button, and Profile Menu */}
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 px-3 py-1.5 rounded-full flex items-center shadow-sm border border-primary/20">
              <span className="text-xs text-primary font-medium mr-1.5">Journal Entries:</span>
              <span className="gradient-text font-bold text-base">{entriesCount}</span>
            </div>
            <Link to="/subscription">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-1.5 rounded-full text-sm font-medium shadow-lg shadow-purple-500/20 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" />
                Premium
              </button>
            </Link>
            <ProfileMenu />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;