import React from 'react';
import { FitnessCard } from '@/components/ui/FitnessCard';
import { ModeChip } from '@/components/ui/ModeChip';
import { useFitplanStore } from '@/store/fitplanStore';
import { Smile, Frown, Zap, Home, Dumbbell } from 'lucide-react';

export const MoodModeSelector: React.FC = () => {
  const { mood, setMood, workoutMode, setWorkoutMode } = useFitplanStore();

  const moods = [
    { value: 'stressed' as const, label: 'Stressed', icon: <Frown className="w-4 h-4" /> },
    { value: 'exhausted' as const, label: 'Exhausted', icon: <Smile className="w-4 h-4" /> },
    { value: 'energetic' as const, label: 'Energetic', icon: <Zap className="w-4 h-4" /> },
  ];

  const modes = [
    { value: 'home' as const, label: 'Home', icon: <Home className="w-4 h-4" /> },
    { value: 'gym' as const, label: 'Gym', icon: <Dumbbell className="w-4 h-4" /> },
  ];

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
              onClick={() => setMood(m.value)}
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Your workout will adapt based on your energy level
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
              onClick={() => setWorkoutMode(m.value)}
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Exercise selection will change based on available equipment
        </p>
      </FitnessCard>
    </div>
  );
};

export default MoodModeSelector;
