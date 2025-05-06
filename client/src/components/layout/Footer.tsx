import React from 'react';
import logo from '@assets/Untitled_design__3_-removebg-preview.png';

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  return (
    <footer className={`w-full py-6 px-4 border-t border-border/30 mt-auto bg-background/80 backdrop-blur-sm ${className}`}>
      <div className="container mx-auto flex flex-col items-center justify-center gap-4">
        <div className="flex justify-center">
          <img src={logo} alt="ReflectAI Logo" className="h-10 filter drop-shadow-[0_0_8px_rgba(0,123,255,0.7)]" />
        </div>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} ReflectAI. If you have any feedback, please contact us at{' '}
          <a 
            href="mailto:reflectaifeedback@gmail.com" 
            className="text-primary hover:underline transition-colors"
          >
            reflectaifeedback@gmail.com
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;