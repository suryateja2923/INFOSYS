import React from 'react';
import { cn } from '@/lib/utils';

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  onStepClick,
}) => {
  return (
    <div className="flex items-center justify-center gap-2 w-full">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;
        const isPending = index > currentStep;

        return (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => onStepClick?.(index)}
                disabled={isPending}
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300',
                  isCompleted && 'bg-gradient-success text-success-foreground',
                  isActive && 'bg-gradient-primary text-primary-foreground animate-pulse-glow',
                  isPending && 'bg-muted text-muted-foreground',
                  !isPending && 'cursor-pointer hover:scale-110'
                )}
              >
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </button>
              <span className={cn(
                'text-xs font-medium hidden sm:block',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}>
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'h-0.5 w-12 sm:w-20 rounded-full transition-all duration-500',
                  isCompleted ? 'bg-gradient-success' : 'bg-muted'
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StepIndicator;
