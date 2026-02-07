import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: 'primary' | 'secondary' | 'success';
  children?: React.ReactNode;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 120,
  strokeWidth = 8,
  color = 'primary',
  children,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const colors = {
    primary: 'stroke-primary',
    secondary: 'stroke-secondary',
    success: 'stroke-success',
  };

  const gradientId = `gradient-${color}-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            {color === 'primary' && (
              <>
                <stop offset="0%" stopColor="hsl(16 100% 60%)" />
                <stop offset="100%" stopColor="hsl(30 100% 55%)" />
              </>
            )}
            {color === 'secondary' && (
              <>
                <stop offset="0%" stopColor="hsl(172 66% 50%)" />
                <stop offset="100%" stopColor="hsl(190 80% 45%)" />
              </>
            )}
            {color === 'success' && (
              <>
                <stop offset="0%" stopColor="hsl(142 71% 45%)" />
                <stop offset="100%" stopColor="hsl(160 75% 40%)" />
              </>
            )}
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default ProgressRing;
