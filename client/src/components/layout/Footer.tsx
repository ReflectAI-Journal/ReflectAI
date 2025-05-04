import { Link } from 'wouter';
import { BookOpen } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-card/80 backdrop-blur-md border-t border-border/50 py-4 px-6 md:px-12">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-primary/80 flex items-center justify-center text-white">
            <BookOpen className="h-3 w-3" />
          </div>
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Journal AI. Your thoughts, securely stored.</p>
        </div>
        
        <div className="flex space-x-6 mt-4 md:mt-0">
          <Link href="/privacy">
            <div className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">Privacy</div>
          </Link>
          <Link href="/terms">
            <div className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">Terms</div>
          </Link>
          <Link href="/help">
            <div className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">Help</div>
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
