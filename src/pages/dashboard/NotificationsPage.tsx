import React from 'react';
import { FitnessCard } from '@/components/ui/FitnessCard';
import { Bell, Check, Trophy, Flame, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

const notifications = [
  { 
    id: 1, 
    title: 'Workout Reminder', 
    message: "Time for your afternoon workout! You're doing great.",
    time: '2 hours ago',
    icon: Flame,
    read: false,
    color: 'primary'
  },
  { 
    id: 2, 
    title: 'Achievement Unlocked', 
    message: 'You completed 7 consecutive workout days!',
    time: '1 day ago',
    icon: Trophy,
    read: false,
    color: 'warning'
  },
  { 
    id: 3, 
    title: 'Feedback Request', 
    message: "Don't forget to submit your Day 1 feedback",
    time: '2 days ago',
    icon: MessageSquare,
    read: true,
    color: 'secondary'
  },
];

const NotificationsPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            Stay updated on your fitness journey
          </p>
        </div>
        <button className="text-sm text-primary hover:underline">
          Mark all as read
        </button>
      </div>

      <div className="space-y-3">
        {notifications.map((notif) => (
          <FitnessCard 
            key={notif.id} 
            className={cn(
              'flex items-start gap-4',
              !notif.read && 'border-l-4 border-l-primary'
            )}
          >
            <div className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
              notif.color === 'primary' && 'bg-primary/10 text-primary',
              notif.color === 'warning' && 'bg-warning/10 text-warning',
              notif.color === 'secondary' && 'bg-secondary/10 text-secondary',
            )}>
              <notif.icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className={cn('font-semibold', !notif.read && 'text-foreground')}>
                  {notif.title}
                </h3>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {notif.time}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{notif.message}</p>
            </div>
            {!notif.read && (
              <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
            )}
          </FitnessCard>
        ))}
      </div>

      {notifications.length === 0 && (
        <FitnessCard className="text-center p-12">
          <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-bold mb-2">No Notifications</h3>
          <p className="text-muted-foreground">
            You're all caught up! Check back later for updates.
          </p>
        </FitnessCard>
      )}
    </div>
  );
};

export default NotificationsPage;
