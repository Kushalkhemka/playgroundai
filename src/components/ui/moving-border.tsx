"use client";
import React, { useState } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionTemplate,
  useMotionValue,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

export function Button({
  borderRadius = "1.75rem",
  children,
  as: Component = "button",
  containerClassName,
  borderClassName,
  duration,
  className,
  buttonClassName,
  ...otherProps
}: {
  borderRadius?: string;
  children: React.ReactNode;
  as?: any;
  containerClassName?: string;
  borderClassName?: string;
  duration?: number;
  className?: string;
  buttonClassName?: string;
  [key: string]: any;
}) {
  return (
    <Component
      className={cn(
        "bg-transparent relative overflow-visible",
        containerClassName
      )}
      style={{
        borderRadius: borderRadius,
      }}
      {...otherProps}
    >
      <MovingBorder duration={duration} rx={borderRadius} ry={borderRadius}>
        {/* No inner div, just the border animation */}
      </MovingBorder>
      <div
        className={cn(
          "relative flex items-center justify-center w-full h-full",
          buttonClassName,
          className
        )}
        style={{
          borderRadius: `calc(${borderRadius} * 0.96)`,
        }}
      >
        {children}
      </div>
    </Component>
  );
}

export const MovingBorder = ({
  duration = 3000,
  rx,
  ry,
  ...otherProps
}: {
  duration?: number;
  rx?: string;
  ry?: string;
  [key: string]: any;
}) => {
  const pathRef = useRef<any>();
  const progress = useMotionValue<number>(0);
  const [angleValue, setAngleValue] = useState(0);

  useAnimationFrame((time) => {
    // Animate from 0 to 1 over the duration
    progress.set((time % duration) / duration);
  });

  // Animate the gradient angle
  const angle = useTransform(progress, (val) => 360 * val);
  // Update local state for SVG attribute
  useMotionValueEvent(angle, "change", (latest) => {
    setAngleValue(latest);
  });
  const gradientId = "animated-gradient";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
      width="100%"
      height="100%"
      style={{ borderRadius: rx }}
      {...otherProps}
    >
      <defs>
        <linearGradient id={gradientId} gradientTransform={`rotate(${angleValue} 0.5 0.5)`}>
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="50%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <rect
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="2.5"
        width="100%"
        height="100%"
        rx={rx}
        ry={ry}
        ref={pathRef}
        filter="url(#glow)"
      />
    </svg>
  );
};

// Enhanced version for chat messages
export function MovingBorderCard({
  children,
  className,
  borderClassName,
  duration = 6000,
  borderRadius = "1rem",
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  borderClassName?: string;
  duration?: number;
  borderRadius?: string;
  [key: string]: any;
}) {
  return (
    <div
      className={cn(
        "relative p-[2px] overflow-hidden",
        className
      )}
      style={{ borderRadius }}
      {...props}
    >
      <div
        className="absolute inset-0"
        style={{ borderRadius: `calc(${borderRadius} * 0.96)` }}
      >
        <MovingBorder duration={duration} rx="8%" ry="8%">
          <div
            className={cn(
              "h-32 w-32 opacity-95 bg-[radial-gradient(var(--violet-400)_30%,var(--violet-500)_50%,transparent_80%)]",
              borderClassName
            )}
          />
        </MovingBorder>
      </div>

      <div
        className={cn(
          "relative bg-dark-800/95 border border-violet-500/20 backdrop-blur-xl h-full w-full shadow-lg shadow-violet-500/10",
        )}
        style={{
          borderRadius: `calc(${borderRadius} * 0.96)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}