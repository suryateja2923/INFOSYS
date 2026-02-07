import React from 'react';
import { cn } from '@/lib/utils';

interface ModeChipProps {
  label: string;
  icon?: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

export const ModeChip: React.FC<ModeChipProps> = ({
  label,
  icon,
  active = false,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 flex items-center gap-2 border',
        active
          ? 'bg-gradient-primary text-primary-foreground border-transparent glow-primary'
          : 'bg-muted/50 border-border text-muted-foreground hover:bg-muted hover:border-primary/50 hover:text-foreground'
      )}
    >
      {icon}
      {label}
    </button>
  );
};

export default ModeChip;
