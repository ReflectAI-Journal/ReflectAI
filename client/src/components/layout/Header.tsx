import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useTheme } from '@/components/ui/theme-provider';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Moon, Sun, Menu, BookOpen, Archive, BarChart3, Target } from 'lucide-react';

const Header = () => {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const navItems = [
    { href: "/", label: "Home", icon: <BookOpen className="h-4 w-4" /> },
    { href: "/archives", label: "Archives", icon: <Archive className="h-4 w-4" /> },
    { href: "/stats", label: "Stats", icon: <BarChart3 className="h-4 w-4" /> },
    { href: "/goals", label: "Goals", icon: <Target className="h-4 w-4" /> },
  ];
  
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };
  
  return (
    <header className="bg-card/80 backdrop-blur-md border-b border-border/50 py-4 px-6 md:px-12 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md bg-primary/90 flex items-center justify-center text-white">
            <BookOpen className="h-5 w-5" />
          </div>
          <h1 className="font-header text-2xl font-bold gradient-text">ReflectAI</h1>
        </div>
        
        <nav>
          <ul className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>
                  <div className={`flex items-center px-3 py-2 rounded-md transition-all hover:bg-muted cursor-pointer ${location === item.href ? 'bg-primary/10 text-primary font-medium' : ''}`}>
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </div>
                </Link>
              </li>
            ))}
            
            <li>
              <Button 
                variant={theme === 'dark' ? "secondary" : "outline"} 
                size="icon" 
                onClick={toggleTheme}
                className="rounded-full ml-2 w-9 h-9"
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'light' ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
              </Button>
            </li>
          </ul>
          
          {/* Mobile menu */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="dark:border-muted">
              <nav className="flex flex-col h-full py-6">
                <div className="flex items-center mb-8 gap-3">
                  <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-white">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <h2 className="font-header text-xl font-bold gradient-text">ReflectAI</h2>
                </div>
                
                <ul className="space-y-3">
                  {navItems.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href}>
                        <div 
                          className={`flex items-center py-2 px-4 rounded-md transition-all cursor-pointer
                            ${location === item.href 
                              ? 'bg-primary/10 text-primary font-medium' 
                              : 'hover:bg-muted'
                            }`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <span className="mr-3 opacity-80">{item.icon}</span>
                          {item.label}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-auto pt-6 border-t border-border">
                  <Button 
                    variant={theme === 'dark' ? "secondary" : "outline"} 
                    onClick={toggleTheme}
                    className="w-full justify-start"
                  >
                    {theme === 'light' ? (
                      <>
                        <Moon className="h-4 w-4 mr-2" />
                        Dark Mode
                      </>
                    ) : (
                      <>
                        <Sun className="h-4 w-4 mr-2" />
                        Light Mode
                      </>
                    )}
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </header>
  );
};

export default Header;
