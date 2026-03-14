import React, { useState } from 'react';
import { FitnessCard } from '@/components/ui/FitnessCard';
import { ModeChip } from '@/components/ui/ModeChip';
import { useFitplanStore } from '@/store/fitplanStore';
import { Smile, Frown, Zap, Home, Dumbbell, RefreshCw } from 'lucide-react';
import { generateCompletePlan, workoutAPI, dietAPI } from '@/lib/api';
import { FitnessButton } from '@/components/ui/FitnessButton';

export const MoodModeSelector: React.FC = () => {
  const { mood, setMood, workoutMode, setWorkoutMode, profile, currentDay } = useFitplanStore();
  const [isRegenerating, setIsRegenerating] = useState(false);

  const moods = [
    { value: 'stressed' as const, label: 'Stressed', icon: <Frown className="w-4 h-4" /> },
    { value: 'exhausted' as const, label: 'Exhausted', icon: <Smile className="w-4 h-4" /> },
    { value: 'energetic' as const, label: 'Energetic', icon: <Zap className="w-4 h-4" /> },
  ];

  const modes = [
    { value: 'home' as const, label: 'Home', icon: <Home className="w-4 h-4" /> },
    { value: 'gym' as const, label: 'Gym', icon: <Dumbbell className="w-4 h-4" /> },
  ];

  const handleMoodChange = async (newMood: 'stressed' | 'exhausted' | 'energetic') => {
    setMood(newMood);
    await regeneratePlans(newMood, workoutMode);
  };

  const handleModeChange = async (newMode: 'home' | 'gym') => {
    setWorkoutMode(newMode);
    await regeneratePlans(mood, newMode);
  };

  const regeneratePlans = async (currentMood: string, currentMode: string) => {
    if (!profile) return;
    
    setIsRegenerating(true);
    try {
      const profileForAI = {
        age: profile.age,
        gender: profile.gender,
        level: profile.fitnessLevel || profile.level || 'beginner',
        goal: profile.goal,
        location: profile.location,
        health_issues: profile.healthIssues,
        is_pregnant: profile.isPregnant,
        height: profile.height,
        weight: profile.weight,
      };

      const result = await generateCompletePlan(currentMode, currentMood, 2000, profileForAI);
      
      if (result.workout && !result.workout.error) {
        useFitplanStore.getState().setWorkoutPlan(currentDay, result.workout);
        try {
          await workoutAPI.saveWorkout({
            day: currentDay,
            place: currentMode,
            difficulty: result.workout.difficulty || 'beginner',
            exercises: result.workout.exercises || [],
          });
        } catch (err) {
          console.log('Workout saved to store:', err);
        }
      } else if (result.workout?.error) {
        if (result.workout.error.includes('429')) {
          alert('⚠️ Gemini API rate limit reached. Please wait 30 seconds and try again.');
          return;
        }
        alert(`⚠️ Workout generation failed: ${result.workout.error}`);
        return;
      }
      
      if (result.diet && !result.diet.error) {
        useFitplanStore.getState().setDietPlan(currentDay, result.diet);
        try {
          await dietAPI.saveDiet({
            day: currentDay,
            calories: result.diet.total_calories || 2000,
            meals: result.diet.meals || [],
          });
        } catch (err) {
          console.log('Diet saved to store:', err);
        }
      } else if (result.diet?.error) {
        if (result.diet.error.includes('429')) {
          alert('⚠️ Gemini API rate limit reached. Please wait 30 seconds and try again.');
          return;
        }
        alert(`⚠️ Diet generation failed: ${result.diet.error}`);
        return;
      }
    } catch (error) {
      console.error('Failed to regenerate plans:', error);
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Mood Selector */}
      <FitnessCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">How are you feeling?</h3>
          <span className="text-2xl">
            {mood === 'energetic' ? '⚡' : mood === 'stressed' ? '😤' : '😴'}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {moods.map((m) => (
            <ModeChip
              key={m.value}
              label={m.label}
              icon={m.icon}
              active={mood === m.value}
              onClick={() => handleMoodChange(m.value)}
              disabled={isRegenerating}
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          {isRegenerating ? (
            <span className="flex items-center gap-1">
              <RefreshCw className="w-3 h-3 animate-spin" />
              Generating new plan...
            </span>
          ) : (
            'Your workout will adapt based on your energy level'
          )}
        </p>
      </FitnessCard>

      {/* Workout Mode Selector */}
      <FitnessCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Where are you working out?</h3>
          <span className="text-2xl">
            {workoutMode === 'gym' ? '🏋️' : '🏠'}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {modes.map((m) => (
            <ModeChip
              key={m.value}
              label={m.value === 'gym' ? 'Gym (Recommended)' : m.label}
              icon={m.icon}
              active={workoutMode === m.value}
              onClick={() => handleModeChange(m.value)}
              disabled={isRegenerating}
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          {isRegenerating ? (
            <span className="flex items-center gap-1">
              <RefreshCw className="w-3 h-3 animate-spin" />
              Generating new plan...
            </span>
          ) : (
            'Exercise selection will change based on available equipment'
          )}
        </p>
      </FitnessCard>
    </div>
  );
};

export default MoodModeSelector;
