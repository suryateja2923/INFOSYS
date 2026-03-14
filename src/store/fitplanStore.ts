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
  foodPreference?: 'veg' | 'mixed';
}

// Backend response types
export interface WorkoutPlan {
  exercises: Array<{
    name: string;
    duration: string;
    sets?: number;
    reps?: number;
    calories: number;
    instructions?: string;
  }>;
  total_duration?: string;
  total_calories?: number;
  mood?: string;
  day?: number;
}

export interface DietPlan {
  meals: Array<{
    name: string;
    time: string;
    calories: number;
    protein?: number;
    carbs?: number;
    fats?: number;
    ingredients?: string[];
    quantity?: string;
    foodType?: 'non-veg' | 'veg' | 'pure-veg';
  }>;
  total_calories?: number;
  total_protein?: number;
  total_carbs?: number;
  total_fats?: number;
  day?: number;
  location?: string;
  cuisine_type?: string;
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
  
  // Day tracking
  currentDay: number;
  maxDayUnlocked: number;
  
  // Preferences
  mood: 'stressed' | 'exhausted' | 'energetic';
  workoutMode: 'home' | 'gym';
  
  // Backend data (DYNAMIC - from Gemini AI)
  workoutPlans: { [day: number]: WorkoutPlan };
  dietPlans: { [day: number]: DietPlan };
  
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
  setCurrentDay: (day: number) => void;
  unlockNextDay: () => void;
  setMood: (mood: 'stressed' | 'exhausted' | 'energetic') => void;
  setWorkoutMode: (mode: 'home' | 'gym') => void;
  setWorkoutPlan: (day: number, plan: WorkoutPlan) => void;
  setDietPlan: (day: number, plan: DietPlan) => void;
  setDayFeedback: (feedback: DayFeedback) => void;
  logout: () => void;
}

export const useFitplanStore = create<FitplanStore>((set) => ({
  isAuthenticated: false,
  isOnboarded: false,
  profile: null,
  currentDay: 1,
  maxDayUnlocked: 1,
  mood: 'energetic',
  workoutMode: 'gym',
  workoutPlans: {}, // ← Empty, will be filled from backend
  dietPlans: {}, // ← Empty, will be filled from backend
  dayOneFeedback: null,
  fitnessScore: 72,
  totalCaloriesBurned: 0,
  totalCaloriesConsumed: 0,

  setAuthenticated: (value) => set({ isAuthenticated: value }),
  setOnboarded: (value) => set({ isOnboarded: value }),
  setProfile: (profile) => set({ profile }),
  
  setCurrentDay: (day) => set({ currentDay: day }),
  
  unlockNextDay: () => set((state) => ({
    currentDay: state.currentDay + 1,
    maxDayUnlocked: Math.max(state.maxDayUnlocked, state.currentDay + 1),
  })),
  
  setMood: (mood) => set({ mood }),
  
  setWorkoutMode: (mode) => set({ workoutMode: mode }),

  // Store workout plan from backend (from Gemini AI)
  setWorkoutPlan: (day, plan) => set((state) => ({
    workoutPlans: {
      ...state.workoutPlans,
      [day]: plan
    }
  })),

  // Store diet plan from backend (from Gemini AI)
  setDietPlan: (day, plan) => set((state) => ({
    dietPlans: {
      ...state.dietPlans,
      [day]: plan
    }
  })),

  setDayFeedback: (feedback) => set({ dayOneFeedback: feedback }),

  logout: () => set({
    isAuthenticated: false,
    isOnboarded: false,
    profile: null,
    workoutPlans: {},
    dietPlans: {},
    dayOneFeedback: null,
  }),
}));
