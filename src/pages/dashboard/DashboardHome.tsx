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
  const burnedCalories = workoutPlan.filter(w => w.completed).reduce((acc, w) => acc + w.calories, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="mb-2">
        <h1 className="text-3xl font-bold">
          Welcome to <span className="text-gradient-primary">fitplan.ai</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Your AI-powered fitness analytics dashboard
        </p>
      </div>

      {/* Stats Row - Summary Metric Cards */}
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
          title="Calories Burned"
          value={`${burnedCalories}`}
          subtitle={`of ${workoutPlan.reduce((acc, w) => acc + w.calories, 0)} kcal target`}
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

      {/* Interactive Controls - Mood & Workout Mode */}
      <MoodModeSelector />

      {/* Workout & Diet Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WorkoutPanel />
        <DietPanel />
      </div>

      {/* Analytics Section - All Charts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Analytics & Progress</h2>
          <span className="text-sm text-muted-foreground">Last 7 days</span>
        </div>
        <ProgressCharts />
      </div>
    </div>
  );
};

export default DashboardHome;
