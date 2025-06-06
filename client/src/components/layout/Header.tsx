import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useTheme } from '@/components/ui/theme-provider';
import { Sparkles } from 'lucide-react';
import ProfileMenu from './ProfileMenu';
import FreeUsageTimer from './FreeUsageTimer';
import { useQuery } from '@tanstack/react-query';
import { JournalEntry } from '@/types/journal';
import { useIsiOS } from '@/hooks/use-ios-detection.ts';
import logo from '@/assets/logo/reflect-ai-logo-user.png';

const Header = () => {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const isiOS = useIsiOS();
  
  // Fetch journal entries count
  const { data: entries = [] } = useQuery<JournalEntry[]>({
    queryKey: ["/api/entries"],
  });

  const entriesCount = entries.length || 0;
  
  return (
    <header className={`bg-card/80 backdrop-blur-md border-b border-border/50 py-4 px-6 md:px-12 sticky top-0 z-50 ${isiOS ? 'pt-[45px]' : ''}`}>
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/app" className="flex items-center">
              <img src={logo} alt="ReflectAI Logo" className="h-14 mr-3 filter drop-shadow-[0_0_15px_rgba(0,123,255,0.9)]" />
              <h1 className="font-header text-2xl font-bold gradient-text">ReflectAI</h1>
            </Link>
          </div>
          
          {/* Entry Count, Free Usage Timer, Premium Button, and Profile Menu */}
          <div className="flex items-center gap-3">
            {/* {
              !isiOS && (
                <div className="border border-border flex items-center py-1 px-2 rounded">
                  <span className="text-xs text-muted-foreground mr-1.5">Entries:</span>
                  <span className="text-foreground font-semibold text-sm">{entriesCount}</span>
                </div>
              )
            } */}
            <FreeUsageTimer />
            <Link to="/subscription">
              <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1.5 rounded text-sm font-medium shadow-sm flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
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