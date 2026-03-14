import React from 'react';
import { FitnessCard } from '@/components/ui/FitnessCard';
import { useFitplanStore } from '@/store/fitplanStore';
import { DietPanel } from '@/components/dashboard/DietPanel';
import { Utensils, Flame, Beef, Droplet } from 'lucide-react';

const DietPlanPage: React.FC = () => {
  const { dietPlans, currentDay, profile } = useFitplanStore();
  
  // Get the diet plan for the current day
  const dietPlan = dietPlans[currentDay];
  
  // Helper function to parse numeric values (handles "35g" or 35)
  const parseNumeric = (value: any): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value.replace(/[^\d.]/g, ''));
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };
  
  // Calculate macros from the dynamic plan
  const totalCalories = dietPlan?.meals?.reduce((acc, m) => acc + parseNumeric(m.calories), 0) || 0;
  const totalProtein = dietPlan?.meals?.reduce((acc, m) => acc + parseNumeric(m.protein), 0) || 0;
  const totalCarbs = dietPlan?.meals?.reduce((acc, m) => acc + parseNumeric(m.carbs), 0) || 0;
  const totalFats = dietPlan?.meals?.reduce((acc, m) => acc + parseNumeric(m.fats), 0) || 0;

  const goalLabels: Record<string, string> = {
    weight_loss: 'Calorie Deficit Plan',
    weight_gain: 'Calorie Surplus Plan',
    muscle_growth: 'High Protein Plan',
    strength: 'Balanced Macros Plan',
  };

  const foodPreferenceLabels: Record<string, string> = {
    'non-veg': 'Non-Vegetarian',
    'veg': 'Vegetarian',
    'pure-veg': 'Pure Vegan',
    'mixed': 'Mixed (Veg + Non-Veg)',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="mb-2">
        <h1 className="text-3xl font-bold">Diet Plan</h1>
        <p className="text-muted-foreground mt-1">
          {profile?.goal ? goalLabels[profile.goal] : 'Your personalized nutrition plan'}
        </p>
        
        {/* Location & Food Preference Info */}
        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
          {profile?.location && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-medium">
              📍 {profile.location}
            </span>
          )}
          {profile?.foodPreference && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/10 text-success font-medium">
              🥗 {foodPreferenceLabels[profile.foodPreference] || profile.foodPreference}
            </span>
          )}
        </div>
      </div>

      {/* Macros Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <FitnessCard className="text-center">
          <Flame className="w-8 h-8 mx-auto mb-2 text-primary" />
          <p className="text-2xl font-bold">{totalCalories}</p>
          <p className="text-sm text-muted-foreground">Total Calories</p>
        </FitnessCard>
        <FitnessCard className="text-center">
          <Beef className="w-8 h-8 mx-auto mb-2 text-destructive" />
          <p className="text-2xl font-bold">{Math.round(totalProtein)}g</p>
          <p className="text-sm text-muted-foreground">Protein</p>
        </FitnessCard>
        <FitnessCard className="text-center">
          <Utensils className="w-8 h-8 mx-auto mb-2 text-warning" />
          <p className="text-2xl font-bold">{Math.round(totalCarbs)}g</p>
          <p className="text-sm text-muted-foreground">Carbs</p>
        </FitnessCard>
        <FitnessCard className="text-center">
          <Droplet className="w-8 h-8 mx-auto mb-2 text-secondary" />
          <p className="text-2xl font-bold">{Math.round(totalFats)}g</p>
          <p className="text-sm text-muted-foreground">Fats</p>
        </FitnessCard>
      </div>

      <DietPanel variant="detailed" />

      {/* Tips */}
      <FitnessCard>
        <h3 className="text-lg font-bold mb-4">💡 Nutrition Tips</h3>
        <ul className="space-y-2 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-success">✓</span>
            Drink at least 8 glasses of water throughout the day
          </li>
          <li className="flex items-start gap-2">
            <span className="text-success">✓</span>
            Eat your meals at consistent times each day
          </li>
          <li className="flex items-start gap-2">
            <span className="text-success">✓</span>
            Avoid processed foods and added sugars
          </li>
          <li className="flex items-start gap-2">
            <span className="text-success">✓</span>
            Include vegetables in at least 2 meals
          </li>
        </ul>
      </FitnessCard>
    </div>
  );
};

export default DietPlanPage;
