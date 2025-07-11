import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useTheme } from '@/components/ui/theme-provider';
import { Sparkles } from 'lucide-react';
import ProfileMenu from './ProfileMenu';
import FreeUsageTimer from './FreeUsageTimer';

import logo from '@/assets/logo/new-reflectai-logo.png';

const Header = () => {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  

  
  return (
    <header className="bg-card/80 backdrop-blur-md border-b border-border/50 py-2 px-6 md:px-12 sticky top-0 z-50">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/app" className="flex items-center">
              <img src={logo} alt="ReflectAI" className="h-12" />
            </Link>
          </div>
          
          {/* Free Usage Timer, Premium Button, and Profile Menu */}
          <div className="flex items-center gap-3">
            <FreeUsageTimer />
            <Link to="/subscription">
              <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1.5 rounded text-sm font-medium shadow-sm flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Plans
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