import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Bot, Sparkles, Zap } from 'lucide-react';

interface AILoaderProps {
  variant?: 'dots' | 'pulse' | 'brain' | 'typing' | 'sparkle';
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

const iconSizes = {
  sm: 16,
  md: 20,
  lg: 24,
};

const DotsLoader = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => (
  <div className="flex items-center space-x-1">
    {[0, 1, 2].map((index) => (
      <motion.div
        key={index}
        className="w-2 h-2 bg-foreground rounded-full"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          delay: index * 0.2,
          ease: "easeInOut",
        }}
      />
    ))}
  </div>
);

const PulseLoader = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => (
  <motion.div
    className="w-8 h-8 border-2 border-foreground rounded-full"
    animate={{
      scale: [1, 1.2, 1],
      opacity: [0.3, 1, 0.3],
    }}
    transition={{
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
);

const BrainLoader = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => (
  <motion.div
    className="relative"
    animate={{ rotate: 360 }}
    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
  >
    <Bot size={iconSizes[size]} className="text-foreground" />
    <motion.div
      className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"
      animate={{
        scale: [0, 1, 0],
        opacity: [0, 1, 0],
      }}
      transition={{
        duration: 1,
        repeat: Infinity,
        delay: 0.5,
      }}
    />
  </motion.div>
);

const TypingLoader = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => (
  <svg
    width={iconSizes[size]}
    height={iconSizes[size]}
    viewBox="0 0 24 24"
    className="text-foreground"
  >
    <circle cx="4" cy="12" r="2" fill="currentColor">
      <animate
        attributeName="cy"
        calcMode="spline"
        dur="0.8s"
        values="12;8;12"
        keySplines=".33,.66,.66,1;.33,0,.66,.33"
        repeatCount="indefinite"
      />
    </circle>
    <circle cx="12" cy="12" r="2" fill="currentColor">
      <animate
        attributeName="cy"
        calcMode="spline"
        dur="0.8s"
        values="12;8;12"
        keySplines=".33,.66,.66,1;.33,0,.66,.33"
        repeatCount="indefinite"
        begin="0.2s"
      />
    </circle>
    <circle cx="20" cy="12" r="2" fill="currentColor">
      <animate
        attributeName="cy"
        calcMode="spline"
        dur="0.8s"
        values="12;8;12"
        keySplines=".33,.66,.66,1;.33,0,.66,.33"
        repeatCount="indefinite"
        begin="0.4s"
      />
    </circle>
  </svg>
);

const SparkleLoader = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => (
  <div className="relative">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
    >
      <Sparkles size={iconSizes[size]} className="text-foreground" />
    </motion.div>
    {[0, 1, 2].map((index) => (
      <motion.div
        key={index}
        className="absolute top-0 left-0 w-1 h-1 bg-yellow-400 rounded-full"
        animate={{
          x: [0, 20, -20, 0],
          y: [0, -20, 20, 0],
          opacity: [0, 1, 1, 0],
          scale: [0, 1, 1, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          delay: index * 0.3,
          ease: "easeInOut",
        }}
      />
    ))}
  </div>
);

const AILoader: React.FC<AILoaderProps> = ({
  variant = 'typing',
  size = 'md',
  message = 'AI is thinking...',
  className,
}) => {
  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return <DotsLoader size={size} />;
      case 'pulse':
        return <PulseLoader size={size} />;
      case 'brain':
        return <BrainLoader size={size} />;
      case 'sparkle':
        return <SparkleLoader size={size} />;
      case 'typing':
      default:
        return <TypingLoader size={size} />;
    }
  };

  return (
    <div className={cn('flex items-center space-x-3 p-4 rounded-lg bg-muted/50', className)}>
      <div className="flex-shrink-0">
        {renderLoader()}
      </div>
      <motion.div
        className={cn('text-muted-foreground', sizeClasses[size])}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        {message}
      </motion.div>
    </div>
  );
};

export default AILoader; 