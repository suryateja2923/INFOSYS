import React from 'react';
import { FitnessCard } from '@/components/ui/FitnessCard';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
  progress?: number;
  color?: 'primary' | 'secondary' | 'success';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  progress,
  color = 'primary',
}) => {
  return (
    <FitnessCard className="relative overflow-hidden group">
      {/* Glow effect on hover */}
      <div className={cn(
        'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500',
        color === 'primary' && 'bg-gradient-to-br from-primary/5 to-transparent',
        color === 'secondary' && 'bg-gradient-to-br from-secondary/5 to-transparent',
        color === 'success' && 'bg-gradient-to-br from-success/5 to-transparent',
      )} />
      
      <div className="relative flex items-start justify-between">
        <div className="space-y-3">
          <div className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center',
            color === 'primary' && 'bg-primary/10 text-primary',
            color === 'secondary' && 'bg-secondary/10 text-secondary',
            color === 'success' && 'bg-success/10 text-success',
          )}>
            {icon}
          </div>
          
          <div>
            <p className="text-muted-foreground text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {subtitle && (
              <p className="text-muted-foreground text-xs mt-1">{subtitle}</p>
            )}
          </div>

          {trend && (
            <div className={cn(
              'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
              trend.isPositive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
            )}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>

        {progress !== undefined && (
          <ProgressRing progress={progress} size={80} strokeWidth={6} color={color}>
            <span className="text-lg font-bold">{progress}%</span>
          </ProgressRing>
        )}
      </div>
    </FitnessCard>
  );
};

export default StatCard;
