import { create } from 'zustand';

export interface UserProfile {
  age: number;
  height: number;
  weight: number;
  gender: 'male' | 'female' | 'other';
  isPregnant?: boolean;
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  goal: 'weight_loss' | 'weight_gain' | 'muscle_growth' | 'strength';
  location: string;
  healthIssues: string;
}

export interface WorkoutItem {
  id: string;
  name: string;
  duration: string;
  sets?: number;
  reps?: number;
  calories: number;
  completed: boolean;
  icon: string;
}

export interface MealItem {
  id: string;
  name: string;
  time: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  completed: boolean;
  icon: string;
}

export interface DayFeedback {
  workoutRating: number;
  workoutDifficulty: number;
  workoutEnergy: number;
  workoutComments: string;
  dietRating: number;
  dietSatisfaction: number;
  dietHunger: number;
  dietComments: string;
  submitted: boolean;
}

interface FitplanStore {
  // Auth state
  isAuthenticated: boolean;
  isOnboarded: boolean;
  
  // User profile
  profile: UserProfile | null;
  
  // Preferences
  mood: 'stressed' | 'exhausted' | 'energetic';
  workoutMode: 'home' | 'gym';
  
  // Plans
  workoutPlan: WorkoutItem[];
  dietPlan: MealItem[];
  
  // Feedback
  dayOneFeedback: DayFeedback | null;
  
  // Stats
  fitnessScore: number;
  totalCaloriesBurned: number;
  totalCaloriesConsumed: number;
  
  // Actions
  setAuthenticated: (value: boolean) => void;
  setOnboarded: (value: boolean) => void;
  setProfile: (profile: UserProfile) => void;
  setMood: (mood: 'stressed' | 'exhausted' | 'energetic') => void;
  setWorkoutMode: (mode: 'home' | 'gym') => void;
  toggleWorkoutComplete: (id: string) => void;
  toggleMealComplete: (id: string) => void;
  setDayFeedback: (feedback: DayFeedback) => void;
  generateWorkoutPlan: () => void;
  generateDietPlan: () => void;
  logout: () => void;
}

const getGymWorkouts = (mood: string, level: string): WorkoutItem[] => {
  const baseWorkouts: WorkoutItem[] = [
    { id: '1', name: 'Treadmill Warm-up', duration: '10 min', calories: 80, completed: false, icon: '🏃' },
    { id: '2', name: 'Bench Press', duration: '15 min', sets: 4, reps: 10, calories: 120, completed: false, icon: '🏋️' },
    { id: '3', name: 'Lat Pulldown', duration: '12 min', sets: 3, reps: 12, calories: 90, completed: false, icon: '💪' },
    { id: '4', name: 'Leg Press', duration: '15 min', sets: 4, reps: 10, calories: 150, completed: false, icon: '🦵' },
    { id: '5', name: 'Cable Rows', duration: '10 min', sets: 3, reps: 12, calories: 85, completed: false, icon: '🔥' },
    { id: '6', name: 'Core Circuit', duration: '10 min', calories: 70, completed: false, icon: '🎯' },
  ];

  if (mood === 'exhausted') {
    return baseWorkouts.slice(0, 3).map(w => ({ ...w, sets: w.sets ? w.sets - 1 : undefined }));
  }
  if (mood === 'stressed') {
    return [...baseWorkouts.slice(0, 4), { id: '7', name: 'Stress Relief Stretching', duration: '15 min', calories: 40, completed: false, icon: '🧘' }];
  }
  return baseWorkouts;
};

const getHomeWorkouts = (mood: string, level: string): WorkoutItem[] => {
  const baseWorkouts: WorkoutItem[] = [
    { id: '1', name: 'Dynamic Stretching', duration: '8 min', calories: 50, completed: false, icon: '🤸' },
    { id: '2', name: 'Push-ups', duration: '10 min', sets: 3, reps: 15, calories: 80, completed: false, icon: '💪' },
    { id: '3', name: 'Bodyweight Squats', duration: '12 min', sets: 4, reps: 20, calories: 100, completed: false, icon: '🦵' },
    { id: '4', name: 'Plank Hold', duration: '8 min', sets: 3, reps: 60, calories: 45, completed: false, icon: '🎯' },
    { id: '5', name: 'Burpees', duration: '10 min', sets: 3, reps: 10, calories: 120, completed: false, icon: '🔥' },
    { id: '6', name: 'Cool Down Yoga', duration: '10 min', calories: 35, completed: false, icon: '🧘' },
  ];

  if (mood === 'exhausted') {
    return [
      { id: '1', name: 'Gentle Stretching', duration: '15 min', calories: 40, completed: false, icon: '🧘' },
      { id: '2', name: 'Light Walking', duration: '20 min', calories: 80, completed: false, icon: '🚶' },
      { id: '3', name: 'Relaxation Breathing', duration: '10 min', calories: 20, completed: false, icon: '🌬️' },
    ];
  }
  if (mood === 'stressed') {
    return [
      ...baseWorkouts.slice(0, 3),
      { id: '7', name: 'Meditation', duration: '15 min', calories: 25, completed: false, icon: '🧘' },
      { id: '8', name: 'Deep Breathing', duration: '10 min', calories: 15, completed: false, icon: '🌬️' },
    ];
  }
  return baseWorkouts;
};

const getDietPlan = (goal: string): MealItem[] => {
  const basePlan: MealItem[] = [
    { id: '1', name: 'Protein Oatmeal Bowl', time: '7:00 AM', calories: 350, protein: 20, carbs: 45, fats: 10, completed: false, icon: '🥣' },
    { id: '2', name: 'Green Smoothie', time: '10:00 AM', calories: 180, protein: 8, carbs: 30, fats: 4, completed: false, icon: '🥤' },
    { id: '3', name: 'Grilled Chicken Salad', time: '1:00 PM', calories: 450, protein: 40, carbs: 25, fats: 20, completed: false, icon: '🥗' },
    { id: '4', name: 'Greek Yogurt + Nuts', time: '4:00 PM', calories: 200, protein: 15, carbs: 12, fats: 10, completed: false, icon: '🥜' },
    { id: '5', name: 'Salmon with Quinoa', time: '7:00 PM', calories: 520, protein: 38, carbs: 40, fats: 22, completed: false, icon: '🐟' },
    { id: '6', name: 'Casein Protein Shake', time: '9:00 PM', calories: 150, protein: 25, carbs: 5, fats: 2, completed: false, icon: '🥛' },
  ];

  if (goal === 'weight_loss') {
    return basePlan.map(m => ({ ...m, calories: Math.round(m.calories * 0.85) }));
  }
  if (goal === 'muscle_growth' || goal === 'weight_gain') {
    return basePlan.map(m => ({ ...m, calories: Math.round(m.calories * 1.2), protein: Math.round(m.protein * 1.3) }));
  }
  return basePlan;
};

export const useFitplanStore = create<FitplanStore>((set, get) => ({
  isAuthenticated: false,
  isOnboarded: false,
  profile: null,
  mood: 'energetic',
  workoutMode: 'gym',
  workoutPlan: [],
  dietPlan: [],
  dayOneFeedback: null,
  fitnessScore: 72,
  totalCaloriesBurned: 0,
  totalCaloriesConsumed: 0,

  setAuthenticated: (value) => set({ isAuthenticated: value }),
  setOnboarded: (value) => set({ isOnboarded: value }),
  setProfile: (profile) => set({ profile }),
  
  setMood: (mood) => {
    set({ mood });
    get().generateWorkoutPlan();
  },
  
  setWorkoutMode: (mode) => {
    set({ workoutMode: mode });
    get().generateWorkoutPlan();
  },

  toggleWorkoutComplete: (id) => set((state) => ({
    workoutPlan: state.workoutPlan.map(w => 
      w.id === id ? { ...w, completed: !w.completed } : w
    ),
    totalCaloriesBurned: state.workoutPlan.find(w => w.id === id)?.completed 
      ? state.totalCaloriesBurned - (state.workoutPlan.find(w => w.id === id)?.calories || 0)
      : state.totalCaloriesBurned + (state.workoutPlan.find(w => w.id === id)?.calories || 0)
  })),

  toggleMealComplete: (id) => set((state) => ({
    dietPlan: state.dietPlan.map(m => 
      m.id === id ? { ...m, completed: !m.completed } : m
    ),
    totalCaloriesConsumed: state.dietPlan.find(m => m.id === id)?.completed
      ? state.totalCaloriesConsumed - (state.dietPlan.find(m => m.id === id)?.calories || 0)
      : state.totalCaloriesConsumed + (state.dietPlan.find(m => m.id === id)?.calories || 0)
  })),

  setDayFeedback: (feedback) => set({ dayOneFeedback: feedback }),

  generateWorkoutPlan: () => {
    const { mood, workoutMode, profile } = get();
    const level = profile?.fitnessLevel || 'beginner';
    const workouts = workoutMode === 'gym' 
      ? getGymWorkouts(mood, level)
      : getHomeWorkouts(mood, level);
    set({ workoutPlan: workouts, totalCaloriesBurned: 0 });
  },

  generateDietPlan: () => {
    const { profile } = get();
    const goal = profile?.goal || 'strength';
    const meals = getDietPlan(goal);
    set({ dietPlan: meals, totalCaloriesConsumed: 0 });
  },

  logout: () => set({
    isAuthenticated: false,
    isOnboarded: false,
    profile: null,
    workoutPlan: [],
    dietPlan: [],
    dayOneFeedback: null,
  }),
}));
