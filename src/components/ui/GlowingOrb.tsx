import React from 'react';
import { cn } from '@/lib/utils';

interface GlowingOrbProps {
  className?: string;
  color?: 'primary' | 'accent' | 'violet' | 'cyan' | 'pink' | 'orange';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const colorMap = {
  primary: 'bg-primary/30',
  accent: 'bg-accent/30',
  violet: 'bg-violet-500/30',
  cyan: 'bg-cyan-500/30',
  pink: 'bg-pink-500/30',
  orange: 'bg-orange-500/30',
};

const sizeMap = {
  sm: 'w-32 h-32',
  md: 'w-48 h-48',
  lg: 'w-64 h-64',
  xl: 'w-96 h-96',
};

const GlowingOrb: React.FC<GlowingOrbProps> = ({
  className,
  color = 'accent',
  size = 'lg',
}) => {
  return (
    <div
      className={cn(
        'absolute rounded-full blur-3xl animate-pulse-slow pointer-events-none',
        colorMap[color],
        sizeMap[size],
        className
      )}
    />
  );
};

export default GlowingOrb;