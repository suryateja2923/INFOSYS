import React from 'react';
import { useFitplanStore } from '@/store/fitplanStore';
import { Bell, Calendar, Target, User, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardHeaderProps {
  sidebarCollapsed: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ sidebarCollapsed }) => {
  const { profile } = useFitplanStore();
  
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const goalLabels: Record<string, string> = {
    weight_loss: '🔥 Weight Loss',
    weight_gain: '📈 Weight Gain',
    muscle_growth: '💪 Muscle Growth',
    strength: '🎯 Strength Training',
  };

  return (
    <header
      className={cn(
        'fixed top-0 right-0 h-16 bg-background/80 backdrop-blur-xl border-b border-border z-40 transition-all duration-300',
        sidebarCollapsed ? 'left-20' : 'left-64'
      )}
    >
      <div className="flex items-center justify-between h-full px-6">
        {/* Left side */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">{today}</span>
          </div>
          
          {profile?.goal && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary">
              <Target className="w-4 h-4" />
              <span className="text-sm font-medium">{goalLabels[profile.goal]}</span>
            </div>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
          </button>

          {/* Profile dropdown */}
          <button className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
              <User className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium">Welcome back!</p>
              <p className="text-xs text-muted-foreground">{profile?.fitnessLevel || 'Athlete'}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
