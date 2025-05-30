import React from 'react';
import logo from '@assets/Untitled_design__3_-removebg-preview.png';

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  return (
    <footer className={`w-full py-2 px-2 border-t border-border/20 mt-auto bg-background/80 backdrop-blur-sm ${className}`}>
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={logo} alt="ReflectAI Logo" className="h-6 filter drop-shadow-[0_0_8px_rgba(0,123,255,0.6)]" />
          <span className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} ReflectAI
          </span>
        </div>
        <a 
          href="mailto:reflectaifeedback@gmail.com" 
          className="text-xs text-primary hover:underline transition-colors"
        >
          Feedback
        </a>
      </div>
    </footer>
  );
};

export default Footer;