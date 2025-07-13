import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useTheme } from '@/components/ui/theme-provider';

import ProfileMenu from './ProfileMenu';
import FreeUsageTimer from './FreeUsageTimer';
import SubscriptionBadge from '../subscription/SubscriptionBadge';

import logo from '@/assets/logo/reflectai-transparent.svg';

const Header = () => {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  

  
  return (
    <header className="glass-card border-0 border-b border-white/10 py-3 px-6 md:px-12 sticky top-0 z-50 bg-premium-gradient">
      {/* Premium background overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 via-purple-900/20 to-blue-900/10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
      
      <div className="container mx-auto relative">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/app" className="flex items-center group transition-all duration-300 hover:scale-105">
              <div className="relative">
                <img 
                  src={logo} 
                  alt="ReflectAI" 
                  className="h-12 transition-all duration-300 group-hover:drop-shadow-lg" 
                />
                {/* Subtle glow effect behind logo */}
                <div className="absolute inset-0 blur-md bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </Link>
          </div>
          
          {/* Enhanced badge and menu section */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="transform transition-all duration-300 hover:scale-105">
                <SubscriptionBadge />
              </div>
              <div className="transform transition-all duration-300 hover:scale-105">
                <FreeUsageTimer />
              </div>
            </div>
            <div className="transform transition-all duration-300 hover:scale-105">
              <ProfileMenu />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;