import React, { useState } from 'react';
import { FitnessCard } from '@/components/ui/FitnessCard';
import { FitnessButton } from '@/components/ui/FitnessButton';
import { FitnessInput } from '@/components/ui/FitnessInput';
import { useFitplanStore } from '@/store/fitplanStore';
import { useNavigate } from 'react-router-dom';
import { User, Bell, Shield, Palette, LogOut, Trash2, Edit, Save, X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { profileAPI } from '@/lib/api';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile, setProfile, logout } = useFitplanStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    age: profile?.age || 25,
    height: profile?.height || 170,
    weight: profile?.weight || 70,
    gender: profile?.gender || 'male',
    isPregnant: profile?.isPregnant || false,
    fitnessLevel: profile?.fitnessLevel || 'beginner',
    goal: profile?.goal || 'muscle_growth',
    location: profile?.location || '',
    healthIssues: profile?.healthIssues || '',
    foodPreference: profile?.foodPreference || 'mixed',
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel - reset to original values
      setEditedProfile({
        age: profile?.age || 25,
        height: profile?.height || 170,
        weight: profile?.weight || 70,
        gender: profile?.gender || 'male',
        isPregnant: profile?.isPregnant || false,
        fitnessLevel: profile?.fitnessLevel || 'beginner',
        goal: profile?.goal || 'muscle_growth',
        location: profile?.location || '',
        healthIssues: profile?.healthIssues || '',
        foodPreference: profile?.foodPreference || 'mixed',
      });
    }
    setIsEditing(!isEditing);
  };
  
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Check if critical profile fields changed (age, weight, height, goal, fitness level)
      const criticalFieldsChanged = 
        editedProfile.age !== profile?.age ||
        editedProfile.weight !== profile?.weight ||
        editedProfile.height !== profile?.height ||
        editedProfile.goal !== profile?.goal ||
        editedProfile.fitnessLevel !== profile?.fitnessLevel;
      
      // Prepare data for backend (convert field names)
      const profileData = {
        age: editedProfile.age,
        height: editedProfile.height,
        weight: editedProfile.weight,
        gender: editedProfile.gender,
        pregnant: editedProfile.isPregnant,
        level: editedProfile.fitnessLevel,
        goal: editedProfile.goal,
        location: editedProfile.location,
        health_issues: editedProfile.healthIssues || undefined,
        food_preference: editedProfile.foodPreference || 'mixed',
      };
      
      // Save to backend
      const response = await profileAPI.saveProfile(profileData);
      
      // If critical fields changed, clear all plans
      if (criticalFieldsChanged) {
        try {
          await profileAPI.clearAllPlans();
          // Clear from store
          useFitplanStore.setState({ workoutPlans: {}, dietPlans: {} });
          alert(`✅ Profile updated successfully!\n\nBMI: ${response.bmi.toFixed(1)} (${response.bmi_category})\n\n⚠️ Your workout and diet plans have been cleared because your profile changed significantly. Please generate new plans.`);
        } catch (err) {
          console.error('Failed to clear plans:', err);
          alert(`✅ Profile updated successfully!\n\nBMI: ${response.bmi.toFixed(1)} (${response.bmi_category})\n\n⚠️ Please regenerate your plans to match your updated profile.`);
        }
      } else {
        alert(`✅ Profile updated successfully!\n\nBMI: ${response.bmi.toFixed(1)} (${response.bmi_category})`);
      }
      
      // Update local store
      setProfile(editedProfile as any);
      
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('❌ Failed to update profile: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };
  
  const updateField = (field: string, value: any) => {
    setEditedProfile(prev => ({ ...prev, [field]: value }));
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
            <FitnessInput 
              label="Age" 
              type="number"
              value={isEditing ? editedProfile.age : (profile?.age || '')} 
              readOnly={!isEditing}
              onChange={(e) => updateField('age', parseInt(e.target.value))}
            />
            <div>
              <label className="block text-sm font-medium mb-2">Gender</label>
              {isEditing ? (
                <select 
                  value={editedProfile.gender}
                  onChange={(e) => updateField('gender', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              ) : (
                <FitnessInput value={profile?.gender || ''} readOnly />
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FitnessInput 
              label="Height (cm)" 
              type="number"
              value={isEditing ? editedProfile.height : (profile?.height || '')} 
              readOnly={!isEditing}
              onChange={(e) => updateField('height', parseInt(e.target.value))}
            />
            <FitnessInput 
              label="Weight (kg)" 
              type="number"
              value={isEditing ? editedProfile.weight : (profile?.weight || '')} 
              readOnly={!isEditing}
              onChange={(e) => updateField('weight', parseInt(e.target.value))}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Fitness Level</label>
            {isEditing ? (
              <select 
                value={editedProfile.fitnessLevel}
                onChange={(e) => updateField('fitnessLevel', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            ) : (
              <FitnessInput value={profile?.fitnessLevel || ''} readOnly />
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Goal</label>
            {isEditing ? (
              <select 
                value={editedProfile.goal}
                onChange={(e) => updateField('goal', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="weight_loss">Weight Loss</option>
                <option value="weight_gain">Weight Gain</option>
                <option value="muscle_growth">Muscle Growth</option>
                <option value="strength">Strength Training</option>
              </select>
            ) : (
              <FitnessInput value={profile?.goal || ''} readOnly />
            )}
          </div>
          
          <FitnessInput 
            label="Location" 
            value={isEditing ? editedProfile.location : (profile?.location || '')} 
            readOnly={!isEditing}
            onChange={(e) => updateField('location', e.target.value)}
          />
          
          <div>
            <label className="block text-sm font-medium mb-2">Food Preference</label>
            {isEditing ? (
              <select 
                value={editedProfile.foodPreference}
                onChange={(e) => updateField('foodPreference', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="mixed">Mixed (Veg + Non-Veg)</option>
                <option value="veg">Vegetarian Only</option>
              </select>
            ) : (
              <FitnessInput value={profile?.foodPreference === 'veg' ? 'Vegetarian Only' : 'Mixed (Veg + Non-Veg)'} readOnly />
            )}
          </div>
          
          <FitnessInput 
            label="Health Issues (optional)" 
            value={isEditing ? editedProfile.healthIssues : (profile?.healthIssues || '')} 
            readOnly={!isEditing}
            onChange={(e) => updateField('healthIssues', e.target.value)}
            placeholder="Any health conditions..."
          />
          
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <FitnessButton 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-fit"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </FitnessButton>
                <FitnessButton 
                  variant="outline" 
                  onClick={handleEditToggle}
                  disabled={isSaving}
                  className="w-fit"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </FitnessButton>
              </>
            ) : (
              <FitnessButton 
                variant="outline" 
                onClick={handleEditToggle}
                className="w-fit"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </FitnessButton>
            )}
          </div>
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
