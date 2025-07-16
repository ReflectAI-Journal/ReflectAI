import React from 'react';
import { Link } from 'wouter';

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  return (
    <footer className={`w-full py-2 px-2 border-t border-border/20 mt-auto bg-background/80 backdrop-blur-sm ${className}`}>
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} ReflectAI
          </span>
        </div>

      </div>
    </footer>
  );
};

export default Footer;