import React from 'react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className }) => {
  const handleHomeClick = () => {
    window.location.href = '/';
  };

  return (
    <header className={cn(
      "bg-background/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-50",
      "transition-all duration-300 ease-out",
      className
    )}>
      <div className="container max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-16 px-2">
          <button 
            onClick={handleHomeClick}
            className={cn(
              "group flex items-center gap-2 rounded-xl p-2 -m-2",
              "transition-all duration-200 ease-out",
              "hover:bg-accent/50 hover:scale-[1.02]",
              "active:scale-[0.98] active:bg-accent/70",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            )}
            aria-label="Go to homepage"
          >
            {/* Logo */}
            <div className={cn(
              "relative w-10 h-10 rounded-xl overflow-hidden",
              "ring-1 ring-border/20 shadow-sm",
              "transition-all duration-200",
              "group-hover:ring-border/40 group-hover:shadow-md",
              "group-active:scale-95"
            )}>
              <img 
                src="/logo.png" 
                alt="LookalikeCeleb" 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Brand Name */}
            <div className={cn(
              "text-2xl font-semibold",
              "bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent",
              "tracking-tight leading-none select-none",
              "transition-all duration-300 ease-out",
              "group-hover:from-foreground/80 group-hover:via-primary/90 group-hover:to-primary",
              "font-feature-settings: 'liga' 1, 'kern' 1"
            )}>
              <span className="font-medium">Lookalike</span>
              <span className="font-bold ml-0.5">Celeb</span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
