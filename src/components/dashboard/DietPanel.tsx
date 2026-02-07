import React from 'react';
import { FitnessCard } from '@/components/ui/FitnessCard';
import { useFitplanStore, MealItem } from '@/store/fitplanStore';
import { Check, Clock, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

export const DietPanel: React.FC = () => {
  const { dietPlan, toggleMealComplete, profile } = useFitplanStore();
  
  const completedCount = dietPlan.filter(m => m.completed).length;
  const totalCalories = dietPlan.reduce((acc, m) => acc + m.calories, 0);
  const consumedCalories = dietPlan.filter(m => m.completed).reduce((acc, m) => acc + m.calories, 0);
  const totalProtein = dietPlan.reduce((acc, m) => acc + m.protein, 0);
  const progress = dietPlan.length > 0 ? Math.round((completedCount / dietPlan.length) * 100) : 0;

  const goalLabels: Record<string, string> = {
    weight_loss: 'Calorie Deficit',
    weight_gain: 'Calorie Surplus',
    muscle_growth: 'High Protein',
    strength: 'Balanced Macros',
  };

  return (
    <FitnessCard className="h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold">Today's Nutrition</h3>
          <p className="text-sm text-muted-foreground">
            🥗 {profile?.goal ? goalLabels[profile.goal] : 'Balanced'} Diet
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Progress</p>
          <p className="text-lg font-bold text-gradient-secondary">{progress}%</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-muted mb-6 overflow-hidden">
        <div 
          className="h-full bg-gradient-secondary rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Meal list */}
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
        {dietPlan.map((meal) => (
          <MealItemCard
            key={meal.id}
            meal={meal}
            onToggle={() => toggleMealComplete(meal.id)}
          />
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-muted-foreground">Calories</p>
            <p className="font-bold">{consumedCalories}/{totalCalories}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Protein</p>
            <p className="font-bold">{totalProtein}g</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Meals</p>
            <p className="font-bold">{completedCount}/{dietPlan.length}</p>
          </div>
        </div>
      </div>
    </FitnessCard>
  );
};

const MealItemCard: React.FC<{
  meal: MealItem;
  onToggle: () => void;
}> = ({ meal, onToggle }) => {
  return (
    <div
      onClick={onToggle}
      className={cn(
        'flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-200',
        meal.completed
          ? 'bg-secondary/10 border-secondary/30'
          : 'bg-muted/30 border-border hover:border-secondary/30 hover:bg-muted/50'
      )}
    >
      <span className="text-2xl">{meal.icon}</span>
      
      <div className="flex-1 min-w-0">
        <p className={cn(
          'font-medium truncate',
          meal.completed && 'line-through text-muted-foreground'
        )}>
          {meal.name}
        </p>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {meal.time}
          </span>
          <span className="flex items-center gap-1">
            <Flame className="w-3 h-3" />
            {meal.calories} kcal
          </span>
          <span>{meal.protein}g protein</span>
        </div>
      </div>

      <div className={cn(
        'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200',
        meal.completed
          ? 'bg-secondary border-secondary text-secondary-foreground'
          : 'border-muted-foreground'
      )}>
        {meal.completed && <Check className="w-4 h-4" />}
      </div>
    </div>
  );
};

export default DietPanel;
