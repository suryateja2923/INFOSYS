import React from 'react';
import { FitnessCard } from '@/components/ui/FitnessCard';
import { useFitplanStore } from '@/store/fitplanStore';
import { Clock, Flame, Leaf, Drumstick, Info } from 'lucide-react';

interface DietPanelProps {
  variant?: 'compact' | 'detailed';
}

export const DietPanel: React.FC<DietPanelProps> = ({ variant = 'detailed' }) => {
  const { dietPlans, currentDay, profile } = useFitplanStore();
  
  const dietPlan = dietPlans[currentDay];
  const meals = dietPlan?.meals || [];
  
  // Helper function to parse numeric values (handles "35g" or 35)
  const parseNumeric = (value: any): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value.replace(/[^\d.]/g, ''));
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };
  
  const totalCalories = meals.reduce((acc, m) => acc + parseNumeric(m.calories), 0);
  const totalProtein = meals.reduce((acc, m) => acc + parseNumeric(m.protein), 0);

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
          {profile?.location && (
            <p className="text-xs text-primary mt-2 font-medium">
              📍 Tailored for {profile.location}
            </p>
          )}
        </div>
      </div>

      {/* Meal list */}
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
        {meals.length > 0 ? (
          meals.map((meal, index) => (
            <MealItemCard
              key={index}
              meal={meal}
              variant={variant}
            />
          ))
        ) : (
          <p className="text-muted-foreground text-center py-8">No meals loaded yet</p>
        )}
      </div>

      {/* Summary */}
      {meals.length > 0 && (
        <div className="mt-6 pt-4 border-t border-border">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Calories</p>
              <p className="font-bold">{Math.round(totalCalories)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Protein</p>
              <p className="font-bold">{Math.round(totalProtein)}g</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Meals</p>
              <p className="font-bold">{meals.length}</p>
            </div>
          </div>
        </div>
      )}
    </FitnessCard>
  );
};

interface Meal {
  name: string;
  time: string;
  meal?: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  ingredients?: string[];
  quantity?: string;
  foodType?: 'non-veg' | 'veg' | 'pure-veg';
}

const MealItemCard: React.FC<{
  meal: Meal;
  variant: 'compact' | 'detailed';
}> = ({ meal, variant }) => {
  // Helper to parse and display numeric values
  const parseNumeric = (value: any): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value.replace(/[^\d.]/g, ''));
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  const getFoodTypeIcon = (type?: string) => {
    switch (type) {
      case 'non-veg':
        return <Drumstick className="w-3.5 h-3.5 text-destructive" />;
      case 'veg':
        return <Leaf className="w-3.5 h-3.5 text-success" />;
      case 'pure-veg':
        return <Leaf className="w-3.5 h-3.5 text-primary" />;
      default:
        return null;
    }
  };

  const getFoodTypeLabel = (type?: string) => {
    switch (type) {
      case 'non-veg':
        return 'Non-Veg';
      case 'veg':
        return 'Veg';
      case 'pure-veg':
        return 'Pure Veg';
      default:
        return '';
    }
  };
  
  const displayMealName = meal.meal || (meal.ingredients && meal.ingredients.length > 0
    ? meal.ingredients.join(', ')
    : meal.name);

  if (variant === 'compact') {
    return (
      <div className="flex items-start gap-4 p-4 rounded-xl border bg-muted/30 border-border hover:border-secondary/30 hover:bg-muted/50 transition-all duration-200">
        <div className="flex-1 min-w-0">
          <p className="font-semibold">
            {meal.name}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Clock className="w-3 h-3" />
              {meal.time}
            </span>
            <span className="flex items-center gap-2">
              <Flame className="w-3 h-3" />
              {Math.round(parseNumeric(meal.calories))} kcal
            </span>
            {meal.protein && (
              <span>{Math.round(parseNumeric(meal.protein))}g protein</span>
            )}
            {meal.foodType && (
              <span className="flex items-center gap-2">
                {getFoodTypeIcon(meal.foodType)}
                {getFoodTypeLabel(meal.foodType)}
              </span>
            )}
          </div>
          <p className="text-sm text-foreground mt-3">
            {displayMealName}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-4 p-4 rounded-xl border bg-muted/30 border-border hover:border-secondary/30 hover:bg-muted/50 transition-all duration-200">
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">
          {meal.name}
        </p>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-2">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {meal.time}
          </span>
          <span className="flex items-center gap-1">
            <Flame className="w-3 h-3" />
            {Math.round(parseNumeric(meal.calories))} kcal
          </span>
          {meal.protein && <span>{Math.round(parseNumeric(meal.protein))}g protein</span>}
          {meal.foodType && (
            <span className="flex items-center gap-1">
              {getFoodTypeIcon(meal.foodType)}
              {getFoodTypeLabel(meal.foodType)}
            </span>
          )}
        </div>

        {meal.meal && (
          <p className="text-sm text-muted-foreground mt-2">
            {meal.meal}
          </p>
        )}

        {/* Quantity Section */}
        {meal.quantity && (
          <div className="mt-3 rounded-lg border border-success/30 bg-success/10">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-success/20">
              <Info className="w-4 h-4 text-success" />
              <p className="text-xs font-semibold text-success uppercase tracking-wide">Quantity</p>
            </div>
            <div className="px-3 py-2">
              <p className="text-sm text-foreground">{meal.quantity}</p>
            </div>
          </div>
        )}

        {meal.ingredients && meal.ingredients.length > 0 && (
          <p className="text-xs text-muted-foreground mt-2 italic">
            {meal.ingredients.join(', ')}
          </p>
        )}
      </div>
    </div>
  );
};

export default DietPanel;
