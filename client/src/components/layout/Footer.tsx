import React from 'react';
import logo from '@/assets/logo/reflectai-neon-logo.png';

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  return (
    <footer className={`w-full py-3 px-4 border-t border-border/30 mt-auto bg-background/80 backdrop-blur-sm ${className}`}>
      <div className="container mx-auto flex flex-col items-center justify-center gap-3">
        <img src={logo} alt="ReflectAI Logo" className="h-8" />
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