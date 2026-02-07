import React from 'react';
import { cn } from '@/lib/utils';

interface FitnessCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  onClick?: () => void;
}

export const FitnessCard: React.FC<FitnessCardProps> = ({
  children,
  className,
  hover = true,
  glow = false,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-xl bg-gradient-card border border-border/50 p-6 transition-all duration-300',
        hover && 'hover:border-primary/30 hover:-translate-y-0.5',
        glow && 'glow-primary',
        onClick && 'cursor-pointer',
        className
      )}
      style={{
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {children}
    </div>
  );
};

export default FitnessCard;
