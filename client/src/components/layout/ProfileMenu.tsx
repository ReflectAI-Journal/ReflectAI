import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { 
  User, 
  Clock, 
  LogOut, 
  Settings, 
  HelpCircle,
  MessageSquare,
  FileText,
  Sparkles,
  Zap
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface ProfileMenuProps {
  className?: string;
}

const ProfileMenu = ({ className }: ProfileMenuProps) => {
  const [, navigate] = useLocation();
  const { user, logout, getInitials } = useAuth();
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Get user initials or fallback
  const userInitials = user?.username ? getInitials() : 'RU';

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-accent/50 transition-colors duration-200">
            <Avatar className="h-10 w-10 border-2 border-primary/20 shadow-lg">
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-semibold text-sm">
                {userInitials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64" align="end" forceMount>
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <p className="text-base font-medium">{user?.username || 'ReflectAI User'}</p>
              <p className="text-xs text-muted-foreground">Your personal reflection space</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => navigate('/app/check-ins')}>
              <Clock className="mr-2 h-4 w-4" />
              <span>Check-ins</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/app/stats')}>
              <User className="mr-2 h-4 w-4" />
              <span>My Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/subscription')}>
              <Sparkles className="mr-2 h-4 w-4" />
              <span>Plans & Billing</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/subscription')} className="text-orange-600 dark:text-orange-400 font-medium">
              <Zap className="mr-2 h-4 w-4" />
              <span>Upgrade</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/app/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>

          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => navigate('/app/help')}>
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>Help & Documentation</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/terms-of-service')}>
              <FileText className="mr-2 h-4 w-4" />
              <span>Terms & Conditions</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/app/feedback')}>
              <MessageSquare className="mr-2 h-4 w-4" />
              <span>Feedback</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default ProfileMenu;