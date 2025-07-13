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
    <header className="bg-card/80 backdrop-blur-md border-b border-border/50 py-2 px-6 md:px-12 sticky top-0 z-50">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/app" className="flex items-center">
              <img src={logo} alt="ReflectAI" className="h-12" />
            </Link>
          </div>
          
          {/* Subscription Badge, Free Usage Timer, and Profile Menu */}
          <div className="flex items-center gap-3">
            <SubscriptionBadge />
            <FreeUsageTimer />
            <ProfileMenu />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;