import React from 'react';
import { FitnessCard } from '@/components/ui/FitnessCard';
import { useFitplanStore } from '@/store/fitplanStore';
import { WorkoutPanel } from '@/components/dashboard/WorkoutPanel';
import { MoodModeSelector } from '@/components/dashboard/MoodModeSelector';
import { Calendar, Clock, Flame, Trophy } from 'lucide-react';

const WorkoutPlanPage: React.FC = () => {
  const { workoutPlan, workoutMode, mood } = useFitplanStore();
  
  const totalCalories = workoutPlan.reduce((acc, w) => acc + w.calories, 0);
  const totalDuration = workoutPlan.reduce((acc, w) => {
    const mins = parseInt(w.duration);
    return acc + (isNaN(mins) ? 0 : mins);
  }, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="mb-2">
        <h1 className="text-3xl font-bold">Workout Plan</h1>
        <p className="text-muted-foreground mt-1">
          Your AI-generated personalized workout routine
        </p>
      </div>

      <MoodModeSelector />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <FitnessCard className="text-center">
          <Calendar className="w-8 h-8 mx-auto mb-2 text-primary" />
          <p className="text-2xl font-bold">Day 1</p>
          <p className="text-sm text-muted-foreground">Current Day</p>
        </FitnessCard>
        <FitnessCard className="text-center">
          <Clock className="w-8 h-8 mx-auto mb-2 text-secondary" />
          <p className="text-2xl font-bold">{totalDuration} min</p>
          <p className="text-sm text-muted-foreground">Total Duration</p>
        </FitnessCard>
        <FitnessCard className="text-center">
          <Flame className="w-8 h-8 mx-auto mb-2 text-primary" />
          <p className="text-2xl font-bold">{totalCalories}</p>
          <p className="text-sm text-muted-foreground">Calories to Burn</p>
        </FitnessCard>
        <FitnessCard className="text-center">
          <Trophy className="w-8 h-8 mx-auto mb-2 text-warning" />
          <p className="text-2xl font-bold">{workoutPlan.length}</p>
          <p className="text-sm text-muted-foreground">Exercises</p>
        </FitnessCard>
      </div>

      <WorkoutPanel />
    </div>
  );
};

export default WorkoutPlanPage;
