import React from 'react';
import { FitnessCard } from '@/components/ui/FitnessCard';
import { useFitplanStore } from '@/store/fitplanStore';
import { Clock, Flame } from 'lucide-react';

export const WorkoutPanel: React.FC = () => {
  const { workoutPlans, currentDay, workoutMode, mood } = useFitplanStore();
  
  const workoutPlan = workoutPlans[currentDay];
  const exercises = workoutPlan?.exercises || [];
  
  const totalCalories = exercises.reduce((acc, w) => acc + (w.calories || 0), 0);

  return (
    <FitnessCard className="h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold">Today's Workout</h3>
          <p className="text-sm text-muted-foreground">
            {workoutMode === 'gym' ? '🏋️ Gym Mode' : '🏠 Home Mode'} • {mood === 'energetic' ? '⚡' : mood === 'stressed' ? '😤' : '😴'} {mood}
          </p>
        </div>
      </div>

      {/* Workout list */}
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
        {exercises.length > 0 ? (
          exercises.map((exercise, index) => (
            <WorkoutItemCard
              key={index}
              exercise={exercise}
            />
          ))
        ) : (
          <p className="text-muted-foreground text-center py-8">No workouts loaded yet</p>
        )}
      </div>

      {/* Summary */}
      {exercises.length > 0 && (
        <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-primary" />
            <span className="font-medium">{totalCalories} kcal</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {exercises.length} exercises
          </span>
        </div>
      )}
    </FitnessCard>
  );
};

interface Exercise {
  name: string;
  duration: string;
  sets?: number;
  reps?: number;
  calories: number;
  instructions?: string;
}

const WorkoutItemCard: React.FC<{
  exercise: Exercise;
}> = ({ exercise }) => {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl border bg-muted/30 border-border hover:border-primary/30 hover:bg-muted/50 transition-all duration-200">
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">
          {exercise.name}
        </p>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-2">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {exercise.duration}
          </span>
          {exercise.sets && exercise.reps && (
            <span>{exercise.sets}x{exercise.reps}</span>
          )}
          <span className="flex items-center gap-1">
            <Flame className="w-3 h-3" />
            {exercise.calories} kcal
          </span>
        </div>
        {exercise.instructions && (
          <p className="text-xs text-muted-foreground mt-2 italic">{exercise.instructions}</p>
        )}
      </div>
    </div>
  );
};

export default WorkoutPanel;
