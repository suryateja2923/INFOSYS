import React, { useEffect } from 'react';
import { useFitplanStore } from '@/store/fitplanStore';
import { StatCard } from '@/components/dashboard/StatCard';
import { MoodModeSelector } from '@/components/dashboard/MoodModeSelector';
import { WorkoutPanel } from '@/components/dashboard/WorkoutPanel';
import { DietPanel } from '@/components/dashboard/DietPanel';
import { ProgressCharts } from '@/components/dashboard/ProgressCharts';
import { Dumbbell, Utensils, Flame, Trophy } from 'lucide-react';

const DashboardHome: React.FC = () => {
  const { 
    workoutPlan, 
    dietPlan, 
    fitnessScore, 
    totalCaloriesBurned,
    generateWorkoutPlan,
    generateDietPlan,
  } = useFitplanStore();

  useEffect(() => {
    if (workoutPlan.length === 0) {
      generateWorkoutPlan();
    }
    if (dietPlan.length === 0) {
      generateDietPlan();
    }
  }, []);

  const workoutProgress = workoutPlan.length > 0 
    ? Math.round((workoutPlan.filter(w => w.completed).length / workoutPlan.length) * 100)
    : 0;

  const dietProgress = dietPlan.length > 0
    ? Math.round((dietPlan.filter(m => m.completed).length / dietPlan.length) * 100)
    : 0;

  const totalDietCalories = dietPlan.reduce((acc, m) => acc + m.calories, 0);
  const consumedCalories = dietPlan.filter(m => m.completed).reduce((acc, m) => acc + m.calories, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="mb-2">
        <h1 className="text-3xl font-bold">
          Welcome to <span className="text-gradient-primary">fitplan.ai</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Your AI-powered fitness journey starts here
        </p>
      </div>

      {/* Interactive Controls */}
      <MoodModeSelector />

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Workout"
          value={`${workoutPlan.filter(w => w.completed).length}/${workoutPlan.length}`}
          subtitle="Exercises completed"
          icon={<Dumbbell className="w-6 h-6" />}
          progress={workoutProgress}
          color="primary"
        />
        <StatCard
          title="Today's Diet"
          value={`${dietPlan.filter(m => m.completed).length}/${dietPlan.length}`}
          subtitle="Meals logged"
          icon={<Utensils className="w-6 h-6" />}
          progress={dietProgress}
          color="secondary"
        />
        <StatCard
          title="Calories"
          value={`${consumedCalories}`}
          subtitle={`of ${totalDietCalories} kcal target`}
          icon={<Flame className="w-6 h-6" />}
          trend={{ value: 12, isPositive: true }}
          color="primary"
        />
        <StatCard
          title="Fitness Score"
          value={fitnessScore}
          subtitle="Based on consistency"
          icon={<Trophy className="w-6 h-6" />}
          progress={fitnessScore}
          color="success"
        />
      </div>

      {/* Workout & Diet Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WorkoutPanel />
        <DietPanel />
      </div>

      {/* Progress Charts */}
      <ProgressCharts />
    </div>
  );
};

export default DashboardHome;
