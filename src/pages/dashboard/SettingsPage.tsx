import React from 'react';
import { FitnessCard } from '@/components/ui/FitnessCard';
import { FitnessButton } from '@/components/ui/FitnessButton';
import { FitnessInput } from '@/components/ui/FitnessInput';
import { useFitplanStore } from '@/store/fitplanStore';
import { useNavigate } from 'react-router-dom';
import { User, Bell, Shield, Palette, LogOut, Trash2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile, logout } = useFitplanStore();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div className="mb-2">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile Section */}
      <FitnessCard>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-lg font-bold">Profile</h3>
        </div>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <FitnessInput label="Age" value={profile?.age || ''} readOnly />
            <FitnessInput label="Gender" value={profile?.gender || ''} readOnly />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FitnessInput label="Height (cm)" value={profile?.height || ''} readOnly />
            <FitnessInput label="Weight (kg)" value={profile?.weight || ''} readOnly />
          </div>
          <FitnessInput label="Location" value={profile?.location || ''} readOnly />
          <FitnessButton variant="outline" className="w-fit">
            Edit Profile
          </FitnessButton>
        </div>
      </FitnessCard>

      {/* Notifications */}
      <FitnessCard>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
            <Bell className="w-5 h-5 text-secondary" />
          </div>
          <h3 className="text-lg font-bold">Notifications</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Workout Reminders</p>
              <p className="text-sm text-muted-foreground">Get notified about your workouts</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Meal Reminders</p>
              <p className="text-sm text-muted-foreground">Receive meal time notifications</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Weekly Reports</p>
              <p className="text-sm text-muted-foreground">Get weekly progress summaries</p>
            </div>
            <Switch />
          </div>
        </div>
      </FitnessCard>

      {/* Privacy */}
      <FitnessCard>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-success" />
          </div>
          <h3 className="text-lg font-bold">Privacy & Security</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Data Sharing</p>
              <p className="text-sm text-muted-foreground">Share anonymized data for AI improvements</p>
            </div>
            <Switch defaultChecked />
          </div>
          <FitnessButton variant="outline" className="w-fit">
            Download My Data
          </FitnessButton>
        </div>
      </FitnessCard>

      {/* Danger Zone */}
      <FitnessCard className="border-destructive/30">
        <h3 className="text-lg font-bold text-destructive mb-4">Danger Zone</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <FitnessButton 
            variant="outline" 
            onClick={handleLogout}
            className="border-muted-foreground text-muted-foreground hover:bg-muted"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </FitnessButton>
          <FitnessButton 
            variant="outline"
            className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash2 className="w-4 h-4" />
            Delete Account
          </FitnessButton>
        </div>
      </FitnessCard>
    </div>
  );
};

export default SettingsPage;
