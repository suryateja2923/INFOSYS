import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useFitplanStore } from '@/store/fitplanStore';
import {
  Home,
  Dumbbell,
  Video,
  Utensils,
  MessageSquare,
  BarChart3,
  FileText,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface DashboardSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { path: '/dashboard', label: 'Home', icon: Home },
  { path: '/dashboard/workout', label: 'Workout Plan', icon: Dumbbell },
  { path: '/dashboard/videos', label: 'Workout Videos', icon: Video },
  { path: '/dashboard/diet', label: 'Diet Plan', icon: Utensils },
  { path: '/dashboard/feedback', label: 'Day One Feedback', icon: MessageSquare },
  { path: '/dashboard/progress', label: 'Progress Graphs', icon: BarChart3 },
  { path: '/dashboard/reports', label: 'Reports', icon: FileText },
  { path: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  { path: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ collapsed, onToggle }) => {
  const location = useLocation();
  const { logout } = useFitplanStore();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 z-50 flex flex-col',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center flex-shrink-0">
            <Dumbbell className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <h1 className="text-xl font-display font-bold animate-fade-in">
              <span className="text-gradient-primary">fitplan</span>
              <span className="text-foreground">.ai</span>
            </h1>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <item.icon className={cn(
                'w-5 h-5 flex-shrink-0',
                isActive && 'text-primary'
              )} />
              {!collapsed && (
                <span className={cn(
                  'font-medium animate-fade-in',
                  isActive && 'font-semibold'
                )}>
                  {item.label}
                </span>
              )}
              {isActive && (
                <div className="absolute left-0 w-1 h-8 bg-gradient-primary rounded-r-full" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={logout}
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-xl w-full transition-all duration-200',
            'text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive'
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>
    </aside>
  );
};

export default DashboardSidebar;
