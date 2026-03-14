/**
 * Fitplan.ai API Client
 * Connects React frontend to FastAPI backend
 * Handles all HTTP requests, authentication, and error handling
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ==================== TYPES ====================
export interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  error?: string;
  [key: string]: any;
}

export interface AuthTokens {
  access_token: string;
  token_type: string;
  user_id: string;
}

export interface UserProfile {
  age: number;
  height: number;
  weight: number;
  gender: 'male' | 'female' | 'other';
  pregnant?: boolean;
  level: 'beginner' | 'intermediate' | 'advanced';
  goal: 'weight_loss' | 'weight_gain' | 'muscle_growth' | 'strength';
  health_issues?: string;
  location: string;
}

// ==================== TOKEN MANAGEMENT ====================
const TOKEN_KEY = 'fitplan_token';
const USER_ID_KEY = 'fitplan_user_id';

export const tokenManager = {
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },
  
  setToken: (token: string, userId: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_ID_KEY, userId);
  },
  
  clearToken: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_ID_KEY);
  },
  
  getUserId: (): string | null => {
    return localStorage.getItem(USER_ID_KEY);
  },
  
  isAuthenticated: (): boolean => {
    return !!tokenManager.getToken();
  }
};

// ==================== HTTP CLIENT ====================
async function fetchAPI<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = tokenManager.getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      // Handle authentication errors
      if (response.status === 401) {
        tokenManager.clearToken();
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }
      
      throw new Error(data.message || data.detail || 'Request failed');
    }
    
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error. Please check your connection.');
  }
}

// ==================== AUTHENTICATION ====================
export const authAPI = {
  /**
   * Register a new user
   */
  register: async (name: string, email: string, password: string) => {
    return fetchAPI<{ message: string; user_id: string }>('/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },
  
  /**
   * Login user and store token
   */
  login: async (email: string, password: string): Promise<AuthTokens> => {
    const data = await fetchAPI<AuthTokens>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    // Store token
    tokenManager.setToken(data.access_token, data.user_id);
    
    return data;
  },
  
  /**
   * Logout user
   */
  logout: () => {
    tokenManager.clearToken();
    window.location.href = '/login';
  },
};

// ==================== USER PROFILE ====================
export const profileAPI = {
  /**
   * Save/Update user profile
   */
  saveProfile: async (profile: UserProfile) => {
    return fetchAPI<{
      message: string;
      bmi: number;
      bmi_category: string;
      health_risk: string;
      warnings: string[];
    }>('/user/profile', {
      method: 'POST',
      body: JSON.stringify(profile),
    });
  },
  
  /**
   * Get user profile
   */
  getProfile: async () => {
    return fetchAPI<{ message: string; profile: UserProfile & any }>('/user/profile');
  },
  
  /**
   * Clear all workout and diet plans (when profile changes)
   */
  clearAllPlans: async () => {
    return fetchAPI<{ message: string; workouts_deleted: number; diets_deleted: number }>('/plans/clear', {
      method: 'DELETE',
    });
  },
};

// ==================== WORKOUT PLANS ====================
export const workoutAPI = {
  /**
   * Save workout plan manually
   */
  saveWorkout: async (workout: {
    day: number;
    place: string;
    difficulty: string;
    exercises: any[];
  }) => {
    return fetchAPI('/workout', {
      method: 'POST',
      body: JSON.stringify(workout),
    });
  },
  
  /**
   * Get today's workout plan
   */
  getTodayWorkout: async () => {
    return fetchAPI('/workout/today');
  },
  
  /**
   * Get workout plan for a specific day
   */
  getWorkoutByDay: async (day: number) => {
    return fetchAPI(`/workout/day/${day}`);
  },
  
  /**
   * Generate AI-powered workout plan
   */
  generateAIWorkout: async (
    mode: 'gym' | 'home',
    mood: 'stressed' | 'exhausted' | 'energetic',
    profile?: any
  ) => {
    return fetchAPI<{ message: string; workout: any }>('/ai/workout', {
      method: 'POST',
      body: JSON.stringify({ mode, mood, ...profile }),
    });
  },
};

// ==================== DIET PLANS ====================
export const dietAPI = {
  /**
   * Save diet plan manually
   */
  saveDiet: async (diet: {
    day: number;
    calories: number;
    meals: any;
  }) => {
    return fetchAPI('/diet', {
      method: 'POST',
      body: JSON.stringify(diet),
    });
  },
  
  /**
   * Get today's diet plan
   */
  getTodayDiet: async () => {
    return fetchAPI('/diet/today');
  },
  
  /**
   * Get diet plan for a specific day
   */
  getDietByDay: async (day: number) => {
    return fetchAPI(`/diet/day/${day}`);
  },
  
  /**
   * Generate AI-powered diet plan
   */
  generateAIDiet: async (
    daily_calories?: number,
    restrictions?: string,
    profile?: any
  ) => {
    return fetchAPI<{ message: string; diet: any }>('/ai/diet', {
      method: 'POST',
      body: JSON.stringify({ daily_calories, restrictions, ...profile }),
    });
  },
};

// ==================== FEEDBACK ====================
export const feedbackAPI = {
  /**
   * Submit day one feedback
   */
  submitFeedback: async (feedback: {
    day: number;
    mood: string;
    energy: number;
    difficulty: number;
    comment: string;
  }) => {
    return fetchAPI('/feedback', {
      method: 'POST',
      body: JSON.stringify(feedback),
    });
  },
};

// ==================== AI ENDPOINTS ====================
export const aiAPI = {
  /**
   * Get health risk assessment
   */
  getHealthAssessment: async () => {
    return fetchAPI<{ message: string; assessment: any }>('/ai/health-assessment', {
      method: 'POST',
    });
  },
  
  /**
   * Get recovery recommendations
   */
  getRecoveryPlan: async (recoveryData: {
    last_workout?: string;
    intensity?: string;
    duration?: number;
    fatigue?: number;
    sleep_hours?: number;
    stress?: number;
  }) => {
    return fetchAPI<{ message: string; recovery: any }>('/ai/recovery', {
      method: 'POST',
      body: JSON.stringify(recoveryData),
    });
  },
  
  /**
   * Get personalized recommendations
   */
  getRecommendations: async () => {
    return fetchAPI<{
      message: string;
      recommendations: any;
      progress_metrics: {
        workouts_completed: number;
        adherence_rate: number;
        average_mood: string;
        days_active: number;
      };
    }>('/ai/recommendations', {
      method: 'POST',
    });
  },
};

// ==================== HEALTH CHECK ====================
export const healthAPI = {
  /**
   * Check backend health status
   */
  checkHealth: async () => {
    return fetchAPI<{ status: string; timestamp: string; version: string }>('/health');
  },
};

// ==================== VIDEO API ====================
export const videoAPI = {
  /**
   * Get workout videos for a specific day
   */
  getWorkoutVideos: async (day: number) => {
    return fetchAPI(`/videos/workout/${day}`);
  },
  
  /**
   * Get today's workout videos
   */
  getTodayVideos: async () => {
    return fetchAPI('/videos/today');
  },
  
  /**
   * Search for workout videos
   */
  searchVideos: async (query: string, maxResults: number = 5) => {
    return fetchAPI(`/videos/search?query=${encodeURIComponent(query)}&max_results=${maxResults}`);
  },
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Generate complete fitness plan (workout + diet)
 */
export async function generateCompletePlan(
  mode: 'gym' | 'home',
  mood: 'stressed' | 'exhausted' | 'energetic',
  dailyCalories?: number,
  profile?: any
) {
  const normalizeError = (error: unknown) =>
    error instanceof Error ? error.message : 'Unknown error';

  // Generate workout and diet in parallel, but keep partial successes
  const [workoutResult, dietResult] = await Promise.allSettled([
    workoutAPI.generateAIWorkout(mode, mood, profile),
    dietAPI.generateAIDiet(dailyCalories, undefined, profile),
  ]);

  const workout =
    workoutResult.status === 'fulfilled'
      ? workoutResult.value.workout
      : { error: normalizeError(workoutResult.reason) };

  const diet =
    dietResult.status === 'fulfilled'
      ? dietResult.value.diet
      : { error: normalizeError(dietResult.reason) };

  const success = !workout?.error && !diet?.error;

  if (!success) {
    console.error('Failed to generate complete plan:', { workout, diet });
  }

  return {
    success,
    workout,
    diet,
  };
}

/**
 * Complete Day 1 and generate Day 2 based on feedback
 */
export async function completeDayAndGenerateNext(
  currentDay: number,
  feedback: {
    mood: string;
    energy: number;
    difficulty: number;
    comment: string;
  },
  mode: 'gym' | 'home'
) {
  try {
    // Submit feedback first
    await feedbackAPI.submitFeedback({
      day: currentDay,
      ...feedback,
    });
    
    // Determine next day's mood based on feedback
    let nextMood: 'stressed' | 'exhausted' | 'energetic' = 'energetic';
    
    if (feedback.energy <= 3 || feedback.difficulty >= 8) {
      nextMood = 'exhausted';
    } else if (feedback.energy <= 6 && feedback.mood === 'stressed') {
      nextMood = 'stressed';
    }
    
    // Fetch user profile for Gemini AI
    let profileData: any = {};
    try {
      const profileResponse = await profileAPI.getProfile();
      if (profileResponse?.profile) {
        const p = profileResponse.profile;
        profileData = {
          age: p.age,
          gender: p.gender,
          level: p.level,
          goal: p.goal,
          location: p.location,
          health_issues: p.health_issues,
          is_pregnant: p.pregnant,
        };
      }
    } catch (e) {
      console.log('Could not fetch profile for plan generation:', e);
    }
    
    // Generate next day's plan with profile
    const nextPlan = await generateCompletePlan(mode, nextMood, undefined, profileData);
    if (nextPlan.workout?.error || nextPlan.diet?.error) {
      throw new Error(nextPlan.workout?.error || nextPlan.diet?.error);
    }
    
    return {
      success: true,
      nextDay: currentDay + 1,
      mood: nextMood,
      ...nextPlan,
    };
  } catch (error) {
    console.error('Failed to generate next day plan:', error);
    throw error;
  }
}

/**
 * Load existing user plans after login
 */
export async function loadUserPlanData() {
  try {
    const store = (await import('@/store/fitplanStore')).useFitplanStore.getState();
    let latestDay = 0;
    
    // Attempt to load today's workout and diet
    try {
      const todayWorkout = await workoutAPI.getTodayWorkout();
      if (todayWorkout?.workout) {
        const day = todayWorkout.workout.day || 1;
        store.setWorkoutPlan(day, todayWorkout.workout);
        latestDay = Math.max(latestDay, day);
      }
    } catch (e) {
      console.log('No existing workout found');
    }
    
    try {
      const todayDiet = await dietAPI.getTodayDiet();
      if (todayDiet?.diet) {
        const day = todayDiet.diet.day || 1;
        store.setDietPlan(day, todayDiet.diet);
        latestDay = Math.max(latestDay, day);
      }
    } catch (e) {
      console.log('No existing diet found');
    }

    if (latestDay > 0 && store.currentDay !== latestDay) {
      store.setCurrentDay(latestDay);
    }
  } catch (error) {
    console.log('Could not load existing plans:', error);
    // This is not critical - plans will be generated on demand
  }
}

/**
 * Initialize user after onboarding
 */
export async function initializeUserPlan(
  profile: any,
  mode: 'gym' | 'home'
) {
  try {
    // Save profile
    const profileResult = await profileAPI.saveProfile(profile);
    
    // Profile data is already in backend format, just ensure required fields
    const profileForAI = {
      age: profile.age,
      gender: profile.gender,
      level: profile.level,
      goal: profile.goal,
      location: profile.location,
      health_issues: profile.health_issues,
      is_pregnant: profile.pregnant,
    };
    
    // Generate Day 1 plan with profile data for Gemini
    const plan = await generateCompletePlan(mode, 'energetic', 2000, profileForAI);
    if (plan.workout?.error || plan.diet?.error) {
      throw new Error(plan.workout?.error || plan.diet?.error);
    }
    
    return {
      success: true,
      profile: profileResult,
      day: 1,
      ...plan,
    };
  } catch (error) {
    console.error('Failed to initialize user plan:', error);
    throw error;
  }
}

export default {
  auth: authAPI,
  profile: profileAPI,
  workout: workoutAPI,
  diet: dietAPI,
  feedback: feedbackAPI,
  ai: aiAPI,
  health: healthAPI,
  video: videoAPI,
  tokenManager,
  generateCompletePlan,
  completeDayAndGenerateNext,
  initializeUserPlan,
  loadUserPlanData,
};
