import React from 'react';
import { cn } from '@/lib/utils';

interface CardCanvasProps {
  children: React.ReactNode;
  className?: string;
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const CardCanvas: React.FC<CardCanvasProps> = ({ children, className = "" }) => {
  return (
    <div className={cn("card-canvas", className)}>
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <filter width="3000%" x="-1000%" height="3000%" y="-1000%" id="unopaq">
          <feColorMatrix values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 3 0"></feColorMatrix>
        </filter>
      </svg>
      <div className="card-backdrop"></div>
      {children}
    </div>
  );
};

const Card: React.FC<CardProps> = ({ children, className = "" }) => {
  return (
    <div className={cn("glow-card", className)}>
      <div className="border-element border-left"></div>
      <div className="border-element border-right"></div>
      <div className="border-element border-top"></div>
      <div className="border-element border-bottom"></div>
      <div className="card-content">
        {children}
      </div>
    </div>
  );
};

export { CardCanvas, Card };