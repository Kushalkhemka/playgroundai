"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImageIcon, Loader2, Sparkles, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnimatedImageLoaderProps {
  isGenerating: boolean;
  progress?: number;
  children: React.ReactNode;
  className?: string;
}

export const AnimatedImageLoader: React.FC<AnimatedImageLoaderProps> = ({
  isGenerating,
  progress = 0,
  children,
  className
}) => {
  const [loadingState, setLoadingState] = React.useState<
    "idle" | "starting" | "generating" | "completed"
  >("idle");

  React.useEffect(() => {
    if (isGenerating) {
      setLoadingState("starting");
      const timer = setTimeout(() => {
        setLoadingState("generating");
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      if (loadingState === "generating") {
        setLoadingState("completed");
        const timer = setTimeout(() => {
          setLoadingState("idle");
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [isGenerating, loadingState]);

  const getStatusText = () => {
    switch (loadingState) {
      case "starting":
        return "Initializing AI model...";
      case "generating":
        return "Creating your image...";
      case "completed":
        return "Image generated successfully!";
      default:
        return "";
    }
  };

  const getStatusIcon = () => {
    switch (loadingState) {
      case "starting":
        return <Sparkles className="w-4 h-4 text-blue-400" />;
      case "generating":
        return <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />;
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      default:
        return <ImageIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className={cn("relative", className)}>
      {/* Status Text */}
      <AnimatePresence>
        {loadingState !== "idle" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 mb-3"
          >
            {getStatusIcon()}
            <motion.span
              className="text-sm font-medium bg-gradient-to-r from-white/90 to-white/60 bg-clip-text text-transparent"
              key={loadingState}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {getStatusText()}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Container */}
      <div className="relative rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-sm overflow-hidden">
        {children}
        
        {/* Loading Overlay */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center"
            >
              <div className="text-center space-y-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 border-2 border-purple-500/30 border-t-purple-500 rounded-full mx-auto"
                />
                <div className="space-y-2">
                  <div className="text-white/90 font-medium">Generating Image</div>
                  <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      initial={{ width: "0%" }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <div className="text-xs text-white/60">{Math.round(progress)}% complete</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reveal Animation */}
        <AnimatePresence>
          {loadingState === "generating" && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black/80 pointer-events-none"
              initial={{ y: "100%" }}
              animate={{ y: `${100 - progress}%` }}
              transition={{ duration: 0.3 }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Progress Bar */}
      {isGenerating && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="mt-3 space-y-2"
        >
          <div className="flex justify-between text-xs text-white/60">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
};