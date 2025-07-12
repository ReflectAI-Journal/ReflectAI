import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useTheme } from '@/components/ui/theme-provider';
import { Sparkles, Crown, Star, Calendar, AlertTriangle } from 'lucide-react';
import ProfileMenu from './ProfileMenu';
import FreeUsageTimer from './FreeUsageTimer';
import { useSubscription } from '@/hooks/useSubscription';

import logo from '@/assets/logo/reflectai-transparent.svg';

const Header = () => {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const { subscriptionStatus } = useSubscription();
  

  
  return (
    <header className="bg-card/80 backdrop-blur-md border-b border-border/50 py-2 px-6 md:px-12 sticky top-0 z-50">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/app" className="flex items-center">
              <img src={logo} alt="ReflectAI" className="h-12" />
            </Link>
          </div>
          
          {/* Subscription Status, Free Usage Timer, Premium Button, and Profile Menu */}
          <div className="flex items-center gap-3">
            {/* Subscription Status Badge */}
            {subscriptionStatus && (
              <div className="flex items-center">
                {subscriptionStatus.plan === 'unlimited' && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full text-xs font-medium text-white shadow-md">
                    <Crown className="h-3 w-3" />
                    <span>Unlimited</span>
                  </div>
                )}
                {subscriptionStatus.plan === 'pro' && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full text-xs font-medium text-white shadow-md">
                    <Star className="h-3 w-3" />
                    <span>Pro</span>
                  </div>
                )}
                {subscriptionStatus.plan === 'trial' && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full text-xs font-medium text-white shadow-md">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Trial</span>
                  </div>
                )}
                {(!subscriptionStatus.plan || subscriptionStatus.plan === null) && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-red-500 to-red-600 rounded-full text-xs font-medium text-white shadow-md">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Free</span>
                  </div>
                )}
              </div>
            )}
            
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