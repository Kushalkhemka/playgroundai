"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, CheckCircle, ImageIcon, Zap, Palette, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageLoadingAnimationProps {
  isGenerating: boolean;
  progress?: number;
  prompt?: string;
  className?: string;
}

const loadingMessages = [
  "Initializing AI model...",
  "Processing your prompt...",
  "Creating your image...",
  "Adding final touches...",
  "Almost ready...",
];

const CreativeIcon = ({ className }: { className?: string }) => (
  <motion.div
    className={cn("relative", className)}
    animate={{ rotate: 360 }}
    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
  >
    <div className="relative w-8 h-8">
      <Palette className="absolute inset-0 w-8 h-8 text-purple-400" />
      <motion.div
        className="absolute inset-0 w-8 h-8"
        animate={{ rotate: -360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      >
        <Wand2 className="w-4 h-4 text-pink-400 absolute top-0 right-0" />
      </motion.div>
    </div>
  </motion.div>
);

export const ImageLoadingAnimation: React.FC<ImageLoadingAnimationProps> = ({
  isGenerating,
  progress = 0,
  prompt,
  className
}) => {
  const [currentMessageIndex, setCurrentMessageIndex] = React.useState(0);
  const [loadingState, setLoadingState] = React.useState<
    "idle" | "starting" | "generating" | "completed"
  >("idle");

  // Calculate actual progress based on time and state
  const [internalProgress, setInternalProgress] = React.useState(0);

  React.useEffect(() => {
    if (isGenerating) {
      setLoadingState("starting");
      setInternalProgress(0);
      
      const startTimer = setTimeout(() => {
        setLoadingState("generating");
      }, 800);

      return () => clearTimeout(startTimer);
    } else {
      if (loadingState === "generating") {
        setLoadingState("completed");
        setInternalProgress(100);
        
        const completeTimer = setTimeout(() => {
          setLoadingState("idle");
          setInternalProgress(0);
        }, 2500);
        
        return () => clearTimeout(completeTimer);
      }
    }
  }, [isGenerating, loadingState]);

  // Progress simulation
  React.useEffect(() => {
    if (loadingState === "generating") {
      let progressValue = 0;
      const interval = setInterval(() => {
        setInternalProgress(prev => {
          // More realistic progress simulation
          const increment = Math.random() * 2 + 0.5; // 0.5-2.5% increments
          const newProgress = Math.min(prev + increment, 92); // Cap at 92% until completion
          return newProgress;
        });
      }, 150); // Faster updates for smoother animation

      return () => clearInterval(interval);
    }
  }, [loadingState]);

  // Handle external progress updates
  React.useEffect(() => {
    if (progress > 0 && progress !== internalProgress) {
      setInternalProgress(progress);
    }
  }, [loadingState]);

  // Message cycling
  React.useEffect(() => {
    if (loadingState === "generating") {
      const interval = setInterval(() => {
        setCurrentMessageIndex(prev => (prev + 1) % loadingMessages.length);
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [loadingState]);

  const displayProgress = progress > 0 ? progress : internalProgress;

  if (loadingState === "idle") {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn("w-full max-w-md mx-auto", className)}
    >
      {/* Header with Icon and Status */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative">
          <AnimatePresence mode="wait">
            {loadingState === "starting" && (
              <motion.div
                key="starting"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center"
              >
                <Sparkles className="w-5 h-5 text-white" />
              </motion.div>
            )}
            
            {loadingState === "generating" && (
              <motion.div
                key="generating"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center"
              >
                <CreativeIcon />
              </motion.div>
            )}
            
            {loadingState === "completed" && (
              <motion.div
                key="completed"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center"
              >
                <CheckCircle className="w-5 h-5 text-white" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={loadingState}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-1"
            >
              <h3 className="text-white font-medium">
                {loadingState === "starting" && "Getting Started"}
                {loadingState === "generating" && "Creating Image"}
                {loadingState === "completed" && "Image Generated!"}
              </h3>
              
              <AnimatePresence mode="wait">
                <motion.p
                  key={loadingState === "generating" ? currentMessageIndex : loadingState}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-sm text-white/60"
                >
                  {loadingState === "starting" && "Initializing AI model..."}
                  {loadingState === "generating" && loadingMessages[currentMessageIndex]}
                  {loadingState === "completed" && "Your image is ready!"}
                </motion.p>
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-xs text-white/50">
          <span>Progress</span>
          <span>{Math.round(displayProgress)}%</span>
        </div>
        
        <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${displayProgress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
          
          {/* Shimmer effect */}
          {loadingState === "generating" && (
            <motion.div
              className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: [-80, 320] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          )}
        </div>
      </div>

      {/* Prompt Display */}
      {prompt && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3"
        >
          <div className="flex items-start gap-2">
            <ImageIcon className="w-4 h-4 text-white/60 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-white/80 leading-relaxed">
              "{prompt}"
            </p>
          </div>
        </motion.div>
      )}

      {/* Floating Particles */}
      {loadingState === "generating" && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-purple-400/60 rounded-full"
              initial={{
                x: Math.random() * 300,
                y: Math.random() * 200,
                opacity: 0,
              }}
              animate={{
                x: Math.random() * 300,
                y: Math.random() * 200,
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};