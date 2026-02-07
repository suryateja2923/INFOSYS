import React from 'react';
import { cn } from '@/lib/utils';

interface FitnessInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const FitnessInput: React.FC<FitnessInputProps> = ({
  label,
  error,
  icon,
  className,
  ...props
}) => {
  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="block text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}
        <input
          className={cn(
            'w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground transition-all duration-200',
            'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
            icon && 'pl-12',
            error && 'border-destructive focus:border-destructive focus:ring-destructive/20',
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
};

export default FitnessInput;
