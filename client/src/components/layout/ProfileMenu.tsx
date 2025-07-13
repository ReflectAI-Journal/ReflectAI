import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { 
  User, 
  Clock, 
  LogOut, 
  Settings, 
  HelpCircle,
  Moon,
  Sun,
  MessageSquare,
  FileText,
  Sparkles
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
import FeedbackModal from './FeedbackModal';

interface ProfileMenuProps {
  className?: string;
}

const ProfileMenu = ({ className }: ProfileMenuProps) => {
  const [, navigate] = useLocation();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const { user, logout, getInitials } = useAuth();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
    // Here you would update the actual theme
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10 border-2 border-primary/20">
              <AvatarFallback className="bg-gradient-to-br from-purple-400 to-indigo-600 text-white">
                {getInitials()}
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
            <DropdownMenuItem onClick={() => navigate('/app/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={toggleTheme}>
              {theme === 'dark' ? (
                <Sun className="mr-2 h-4 w-4" />
              ) : (
                <Moon className="mr-2 h-4 w-4" />
              )}
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
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
            <DropdownMenuItem onClick={() => setFeedbackModalOpen(true)}>
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
      
      {/* Feedback Modal */}
      <FeedbackModal 
        open={feedbackModalOpen} 
        onOpenChange={setFeedbackModalOpen} 
      />
    </>
  );
};

export default ProfileMenu;