import React from 'react';
import { cn } from '@/lib/utils';

interface AnimatedGlowingBorderProps {
  children: React.ReactNode;
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
  colors?: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export const AnimatedGlowingBorder: React.FC<AnimatedGlowingBorderProps> = ({
  children,
  className,
  intensity = 'medium',
  colors = {
    primary: '#402fb5',
    secondary: '#cf30aa',
    accent: '#18116a'
  }
}) => {
  const intensityConfig = {
    low: {
      blur: 'blur-[2px]',
      size: 'w-[400px] h-[400px]',
      duration: 'duration-3000'
    },
    medium: {
      blur: 'blur-[3px]',
      size: 'w-[600px] h-[600px]',
      duration: 'duration-2000'
    },
    high: {
      blur: 'blur-[4px]',
      size: 'w-[800px] h-[800px]',
      duration: 'duration-1500'
    }
  };

  const config = intensityConfig[intensity];

  return (
    <div className={cn("relative group", className)}>
      {/* Main outer glow layer */}
      <div className={cn(
        "absolute z-[-1] overflow-hidden h-full w-full rounded-xl",
        config.blur,
        "before:absolute before:content-[''] before:z-[-2] before:bg-no-repeat before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:rotate-[60deg]",
        config.size,
        "before:transition-all",
        config.duration,
        "group-hover:before:rotate-[-120deg] group-focus-within:before:rotate-[420deg] group-focus-within:before:duration-[4000ms]"
      )}
      style={{
        '--glow-primary': colors.primary,
        '--glow-secondary': colors.secondary,
        '--glow-accent': colors.accent,
      } as React.CSSProperties}
      >
        <div 
          className="absolute inset-0 before:absolute before:content-[''] before:z-[-2] before:w-full before:h-full before:bg-no-repeat before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:rotate-[60deg] before:transition-all before:duration-2000 group-hover:before:rotate-[-120deg] group-focus-within:before:rotate-[420deg] group-focus-within:before:duration-[4000ms]"
          style={{
            background: `conic-gradient(#000, ${colors.primary} 5%, #000 38%, #000 50%, ${colors.secondary} 60%, #000 87%)`
          }}
        />
      </div>

      {/* Secondary glow layer */}
      <div className={cn(
        "absolute z-[-1] overflow-hidden h-full w-full rounded-xl",
        config.blur,
        "before:absolute before:content-[''] before:z-[-2] before:bg-no-repeat before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:rotate-[82deg]",
        config.size,
        "before:transition-all",
        config.duration,
        "group-hover:before:rotate-[-98deg] group-focus-within:before:rotate-[442deg] group-focus-within:before:duration-[4000ms]"
      )}>
        <div 
          className="absolute inset-0 before:absolute before:content-[''] before:z-[-2] before:w-full before:h-full before:bg-no-repeat before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:rotate-[82deg] before:transition-all before:duration-2000 group-hover:before:rotate-[-98deg] group-focus-within:before:rotate-[442deg] group-focus-within:before:duration-[4000ms]"
          style={{
            background: `conic-gradient(rgba(0,0,0,0), ${colors.accent}, rgba(0,0,0,0) 10%, rgba(0,0,0,0) 50%, #6e1b60, rgba(0,0,0,0) 60%)`
          }}
        />
      </div>

      {/* Bright accent layer */}
      <div className={cn(
        "absolute z-[-1] overflow-hidden h-full w-full rounded-lg blur-[2px]",
        "before:absolute before:content-[''] before:z-[-2] before:bg-no-repeat before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:rotate-[83deg]",
        config.size,
        "before:brightness-140 before:transition-all",
        config.duration,
        "group-hover:before:rotate-[-97deg] group-focus-within:before:rotate-[443deg] group-focus-within:before:duration-[4000ms]"
      )}>
        <div 
          className="absolute inset-0 before:absolute before:content-[''] before:z-[-2] before:w-full before:h-full before:bg-no-repeat before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:rotate-[83deg] before:brightness-140 before:transition-all before:duration-2000 group-hover:before:rotate-[-97deg] group-focus-within:before:rotate-[443deg] group-focus-within:before:duration-[4000ms]"
          style={{
            background: `conic-gradient(rgba(0,0,0,0) 0%, #a099d8, rgba(0,0,0,0) 8%, rgba(0,0,0,0) 50%, #dfa2da, rgba(0,0,0,0) 58%)`
          }}
        />
      </div>

      {/* Inner sharp layer */}
      <div className={cn(
        "absolute z-[-1] overflow-hidden h-full w-full rounded-xl blur-[0.5px]",
        "before:absolute before:content-[''] before:z-[-2] before:bg-no-repeat before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:rotate-[70deg]",
        config.size,
        "before:brightness-130 before:transition-all",
        config.duration,
        "group-hover:before:rotate-[-110deg] group-focus-within:before:rotate-[430deg] group-focus-within:before:duration-[4000ms]"
      )}>
        <div 
          className="absolute inset-0 before:absolute before:content-[''] before:z-[-2] before:w-full before:h-full before:bg-no-repeat before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:rotate-[70deg] before:brightness-130 before:transition-all before:duration-2000 group-hover:before:rotate-[-110deg] group-focus-within:before:rotate-[430deg] group-focus-within:before:duration-[4000ms]"
          style={{
            background: `conic-gradient(#1c191c, ${colors.primary} 5%, #1c191c 14%, #1c191c 50%, ${colors.secondary} 60%, #1c191c 64%)`
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};