import React, { useState, useEffect } from 'react';
import { useFitplanStore } from '@/store/fitplanStore';
import { StatCard } from '@/components/dashboard/StatCard';
import { MoodModeSelector } from '@/components/dashboard/MoodModeSelector';
import { WorkoutPanel } from '@/components/dashboard/WorkoutPanel';
import { DietPanel } from '@/components/dashboard/DietPanel';
import { ProgressCharts } from '@/components/dashboard/ProgressCharts';
import { Dumbbell, Utensils, Flame, Trophy, RefreshCw } from 'lucide-react';
import { FitnessButton } from '@/components/ui/FitnessButton';
import { generateCompletePlan, workoutAPI, dietAPI } from '@/lib/api';

const DashboardHome: React.FC = () => {
  const { 
    workoutPlans,
    dietPlans,
    currentDay,
    fitnessScore,
    workoutMode,
    mood,
    profile,
    setWorkoutPlan,
    setDietPlan,
    setCurrentDay,
  } = useFitplanStore();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load plans from database on mount
  useEffect(() => {
    const loadPlansFromDatabase = async () => {
      try {
        setIsLoading(true);
        let latestDay = currentDay;
        
        console.log('📥 Loading plans from database for day', currentDay);
        
        // Try to load workout plan for current day
        try {
          const workoutResponse = await workoutAPI.getWorkoutByDay(currentDay);
          console.log('💪 Workout response:', workoutResponse);
          if (workoutResponse.workout && workoutResponse.workout.exercises) {
            setWorkoutPlan(currentDay, {
              exercises: workoutResponse.workout.exercises,
            });
            console.log('✅ Workout loaded from database');
          } else {
            const latestWorkout = await workoutAPI.getTodayWorkout();
            if (latestWorkout?.workout?.exercises) {
              const workoutDay = latestWorkout.workout.day || currentDay;
              setWorkoutPlan(workoutDay, {
                exercises: latestWorkout.workout.exercises,
              });
              latestDay = Math.max(latestDay, workoutDay);
              console.log('✅ Latest workout loaded from database');
            }
          }
        } catch (err) {
          console.log('⚠️ No workout plan in database for day', currentDay);
        }
        
        // Try to load diet plan for current day
        try {
          const dietResponse = await dietAPI.getDietByDay(currentDay);
          console.log('🍽️ Diet response:', dietResponse);
          if (dietResponse.diet && dietResponse.diet.meals) {
            setDietPlan(currentDay, {
              meals: dietResponse.diet.meals,
              total_calories: dietResponse.diet.calories,
            });
            console.log('✅ Diet loaded from database');
          } else {
            const latestDiet = await dietAPI.getTodayDiet();
            if (latestDiet?.diet?.meals) {
              const dietDay = latestDiet.diet.day || currentDay;
              setDietPlan(dietDay, {
                meals: latestDiet.diet.meals,
                total_calories: latestDiet.diet.calories,
              });
              latestDay = Math.max(latestDay, dietDay);
              console.log('✅ Latest diet loaded from database');
            }
          }
        } catch (err) {
          console.log('⚠️ No diet plan in database for day', currentDay);
        }

        if (latestDay > currentDay) {
          setCurrentDay(latestDay);
        }
      } catch (error) {
        console.error('❌ Failed to load plans:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPlansFromDatabase();
  }, [currentDay, setWorkoutPlan, setDietPlan, setCurrentDay]);

  // Get plans for current day
  const workoutPlan = workoutPlans[currentDay];
  const dietPlan = dietPlans[currentDay];
  
  console.log('📊 Current day:', currentDay);
  console.log('💪 Current workout plan:', workoutPlan);
  console.log('🍽️ Current diet plan:', dietPlan);
  
  const exercises = workoutPlan?.exercises || [];
  const meals = dietPlan?.meals || [];

  console.log('💪 Exercises:', exercises.length);
  console.log('🍽️ Meals:', meals.length);

  const totalWorkoutCalories = exercises.reduce((acc, w) => acc + (w.calories || 0), 0);
  const totalDietCalories = meals.reduce((acc, m) => acc + (m.calories || 0), 0);
  
  const hasNoPlans = exercises.length === 0 && meals.length === 0;
  
  // Generate plans if missing
  const handleGeneratePlans = async () => {
    if (!profile) {
      alert('Profile not found. Please complete onboarding first.');
      return;
    }
    
    setIsGenerating(true);
    try {
      // Prepare profile for Gemini
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
      
      console.log('🔄 Generating plans with profile:', profileForAI);
      
      // Generate complete plan
      const result = await generateCompletePlan(workoutMode, mood, 2000, profileForAI);
      
      console.log('✅ Generation result:', result);
      
      // Store in Zustand
      if (result.workout && !result.workout.error) {
        console.log('💪 Workout data:', result.workout);
        console.log('💪 Exercises count:', result.workout.exercises?.length || 0);
        
        setWorkoutPlan(currentDay, result.workout);
        
        // Save to database
        try {
          await workoutAPI.saveWorkout({
            day: currentDay,
            place: workoutMode,
            difficulty: result.workout.difficulty || 'beginner',
            exercises: result.workout.exercises || [],
          });
          console.log('✅ Workout saved to database');
        } catch (err) {
          console.error('❌ Workout database save failed:', err);
        }
      } else if (result.workout?.error) {
        console.error('❌ Workout error:', result.workout.error);
        if (result.workout.error.includes('429')) {
          throw new Error('⚠️ Gemini API rate limit exceeded. Please wait a few seconds and try again.');
        }
        throw new Error(result.workout.error);
      } else {
        console.warn('⚠️ No workout in result');
      }
      
      if (result.diet && !result.diet.error) {
        console.log('🍽️ Diet data:', result.diet);
        console.log('🍽️ Meals count:', result.diet.meals?.length || 0);
        
        setDietPlan(currentDay, result.diet);
        
        // Save to database
        try {
          await dietAPI.saveDiet({
            day: currentDay,
            calories: result.diet.total_calories || 2000,
            meals: result.diet.meals || [],
          });
          console.log('✅ Diet saved to database');
        } catch (err) {
          console.error('❌ Diet database save failed:', err);
        }
      } else if (result.diet?.error) {
        console.error('❌ Diet error:', result.diet.error);
        if (result.diet.error.includes('429')) {
          throw new Error('⚠️ Gemini API rate limit exceeded. Please wait a few seconds and try again.');
        }
        throw new Error(result.diet.error);
      } else {
        console.warn('⚠️ No diet in result');
      }
      
      console.log('📊 Final store state - Workout Plans:', useFitplanStore.getState().workoutPlans);
      console.log('📊 Final store state - Diet Plans:', useFitplanStore.getState().dietPlans);
      
      alert('✅ Plans generated successfully!');
    } catch (error) {
      console.error('❌ Failed to generate plans:', error);
      alert('❌ Failed to generate plans: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsGenerating(false);
    }
  };

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
          value={`${exercises.length}`}
          subtitle="Exercises"
          icon={<Dumbbell className="w-6 h-6" />}
          progress={exercises.length > 0 ? 100 : 0}
          color="primary"
        />
        <StatCard
          title="Today's Diet"
          value={`${meals.length}`}
          subtitle="Meals planned"
          icon={<Utensils className="w-6 h-6" />}
          progress={meals.length > 0 ? 100 : 0}
          color="secondary"
        />
        <StatCard
          title="Calories Burned"
          value={`${totalWorkoutCalories}`}
          subtitle="kcal target"
          icon={<Flame className="w-6 h-6" />}
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
      
      {/* Generate Plans Button (shown if no plans and not loading) */}
      {hasNoPlans && !isLoading && (
        <div className="p-6 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 text-center animate-fade-in">
          <h3 className="text-lg font-bold mb-2">No Plans Generated Yet</h3>
          <p className="text-muted-foreground mb-4">
            Generate your personalized workout and diet plans based on your profile
          </p>
          <FitnessButton
            onClick={handleGeneratePlans}
            disabled={isGenerating}
            className="mx-auto"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Generating Plans...
              </>
            ) : (
              <>
                <Dumbbell className="w-4 h-4" />
                Generate Day {currentDay} Plans
              </>
            )}
          </FitnessButton>
        </div>
      )}
      
      {/* Loading state */}
      {isLoading && (
        <div className="p-12 text-center animate-fade-in">
          <RefreshCw className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">Loading your plans from database...</p>
        </div>
      )}

      {/* Workout & Diet Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WorkoutPanel />
        <DietPanel variant="compact" />
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
