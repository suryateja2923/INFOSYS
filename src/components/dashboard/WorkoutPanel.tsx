import React from 'react';
import { FitnessCard } from '@/components/ui/FitnessCard';
import { useFitplanStore, WorkoutItem } from '@/store/fitplanStore';
import { Check, Clock, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

export const WorkoutPanel: React.FC = () => {
  const { workoutPlan, toggleWorkoutComplete, workoutMode, mood } = useFitplanStore();
  
  const completedCount = workoutPlan.filter(w => w.completed).length;
  const totalCalories = workoutPlan.reduce((acc, w) => acc + w.calories, 0);
  const burnedCalories = workoutPlan.filter(w => w.completed).reduce((acc, w) => acc + w.calories, 0);
  const progress = workoutPlan.length > 0 ? Math.round((completedCount / workoutPlan.length) * 100) : 0;

  return (
    <FitnessCard className="h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold">Today's Workout</h3>
          <p className="text-sm text-muted-foreground">
            {workoutMode === 'gym' ? '🏋️ Gym Mode' : '🏠 Home Mode'} • {mood === 'energetic' ? '⚡' : mood === 'stressed' ? '😤' : '😴'} {mood}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Progress</p>
          <p className="text-lg font-bold text-gradient-primary">{progress}%</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-muted mb-6 overflow-hidden">
        <div 
          className="h-full bg-gradient-primary rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Workout list */}
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
        {workoutPlan.map((workout) => (
          <WorkoutItemCard
            key={workout.id}
            workout={workout}
            onToggle={() => toggleWorkoutComplete(workout.id)}
          />
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-primary" />
          <span className="font-medium">{burnedCalories} / {totalCalories} kcal</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {completedCount} of {workoutPlan.length} exercises
        </span>
      </div>
    </FitnessCard>
  );
};

const WorkoutItemCard: React.FC<{
  workout: WorkoutItem;
  onToggle: () => void;
}> = ({ workout, onToggle }) => {
  return (
    <div
      onClick={onToggle}
      className={cn(
        'flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-200',
        workout.completed
          ? 'bg-success/10 border-success/30'
          : 'bg-muted/30 border-border hover:border-primary/30 hover:bg-muted/50'
      )}
    >
      <span className="text-2xl">{workout.icon}</span>
      
      <div className="flex-1 min-w-0">
        <p className={cn(
          'font-medium truncate',
          workout.completed && 'line-through text-muted-foreground'
        )}>
          {workout.name}
        </p>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {workout.duration}
          </span>
          {workout.sets && (
            <span>{workout.sets}x{workout.reps}</span>
          )}
          <span className="flex items-center gap-1">
            <Flame className="w-3 h-3" />
            {workout.calories} kcal
          </span>
        </div>
      </div>

      <div className={cn(
        'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200',
        workout.completed
          ? 'bg-success border-success text-success-foreground'
          : 'border-muted-foreground'
      )}>
        {workout.completed && <Check className="w-4 h-4" />}
      </div>
    </div>
  );
};

export default WorkoutPanel;
