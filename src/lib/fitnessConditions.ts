/**
 * Real-time Fitness Conditions & Validation System
 * Provides dynamic conditions based on user profile data
 */

export interface BMICategory {
  category: string;
  min: number;
  max: number;
  color: string;
  recommendations: string[];
  targetWeightMin?: number;
  targetWeightMax?: number;
  weightChange?: string;
  targetSuggestion?: string;
}

export interface FitnessCondition {
  warning: string;
  severity: 'info' | 'warning' | 'error';
  icon: string;
}

// BMI Categories
const BMI_CATEGORIES: BMICategory[] = [
  {
    category: 'Underweight',
    min: 0,
    max: 18.4,
    color: 'text-blue-500',
    recommendations: ['Focus on weight gain with proper nutrition', 'Gradual weight progression recommended'],
  },
  {
    category: 'Normal Weight',
    min: 18.5,
    max: 24.9,
    color: 'text-success',
    recommendations: ['Maintain current weight', 'Focus on fitness goals'],
  },
  {
    category: 'Overweight',
    min: 25,
    max: 29.9,
    color: 'text-warning',
    recommendations: ['Gradual weight loss recommended', 'Combine cardio with strength training'],
  },
  {
    category: 'Obese',
    min: 30,
    max: Infinity,
    color: 'text-destructive',
    recommendations: ['Consult healthcare provider before intense exercise', 'Start with low-impact workouts'],
  },
];

// Calculate BMI
export const calculateBMI = (height: number, weight: number): number => {
  if (!height || !weight) return 0;
  return parseFloat((weight / Math.pow(height / 100, 2)).toFixed(1));
};

// Calculate target weight range for healthy BMI (18.5 - 24.9)
export const calculateTargetWeightRange = (height: number): { min: number; max: number } => {
  const heightInMeters = height / 100;
  const minWeight = Math.round(18.5 * Math.pow(heightInMeters, 2));
  const maxWeight = Math.round(24.9 * Math.pow(heightInMeters, 2));
  return { min: minWeight, max: maxWeight };
};

// Get BMI category with personalized weight suggestions
export const getBMICategory = (bmi: number, height?: number, weight?: number): BMICategory | null => {
  const baseCategory = BMI_CATEGORIES.find((cat) => bmi >= cat.min && bmi <= cat.max);
  if (!baseCategory) return null;

  // If height and weight provided, calculate target weight suggestions
  if (height && weight) {
    const targetRange = calculateTargetWeightRange(height);
    const category = { ...baseCategory };

    if (category.category === 'Underweight') {
      const weightToGain = targetRange.min - weight;
      category.targetWeightMin = targetRange.min;
      category.targetWeightMax = targetRange.max;
      category.weightChange = `+${weightToGain.toFixed(1)} kg`;
      category.targetSuggestion = `You need to gain ${weightToGain.toFixed(1)} kg to reach a healthy weight. Target: ${targetRange.min}-${targetRange.max} kg for your height.`;
      category.recommendations = [
        `Increase calorie intake with nutritious foods`,
        `Focus on protein-rich meals and healthy fats`,
        `Strength training to build muscle mass`,
        `Target weight: ${targetRange.min}-${targetRange.max} kg`
      ];
    } else if (category.category === 'Overweight') {
      const weightToLose = weight - targetRange.max;
      category.targetWeightMin = targetRange.min;
      category.targetWeightMax = targetRange.max;
      category.weightChange = `-${weightToLose.toFixed(1)} kg`;
      category.targetSuggestion = `You should lose ${weightToLose.toFixed(1)} kg to reach a healthy weight. Target: ${targetRange.min}-${targetRange.max} kg for your height.`;
      category.recommendations = [
        `Gradual weight loss of 0.5-1 kg per week`,
        `Combine cardio with strength training`,
        `Focus on balanced, calorie-controlled diet`,
        `Target weight: ${targetRange.min}-${targetRange.max} kg`
      ];
    } else if (category.category === 'Obese') {
      const weightToLose = weight - targetRange.max;
      category.targetWeightMin = targetRange.min;
      category.targetWeightMax = targetRange.max;
      category.weightChange = `-${weightToLose.toFixed(1)} kg`;
      category.targetSuggestion = `You should lose ${weightToLose.toFixed(1)} kg to reach a healthy weight. Target: ${targetRange.min}-${targetRange.max} kg for your height.`;
      category.recommendations = [
        `Consult healthcare provider before starting`,
        `Start with low-impact activities (walking, swimming)`,
        `Focus on sustainable lifestyle changes`,
        `Initial goal: Lose 5-10% of current weight`,
        `Target weight: ${targetRange.min}-${targetRange.max} kg`
      ];
    } else if (category.category === 'Normal Weight') {
      category.targetWeightMin = targetRange.min;
      category.targetWeightMax = targetRange.max;
      category.targetSuggestion = `You're at a healthy weight! Maintain ${targetRange.min}-${targetRange.max} kg for your height.`;
      category.recommendations = [
        `Maintain current weight range`,
        `Focus on fitness and strength goals`,
        `Balanced diet with regular exercise`,
        `Healthy weight range: ${targetRange.min}-${targetRange.max} kg`
      ];
    }

    return category;
  }

  return baseCategory;
};

// Age-based conditions
export const getAgeConditions = (age: number): FitnessCondition[] => {
  const conditions: FitnessCondition[] = [];

  if (age < 18) {
    conditions.push({
      warning: 'Users under 18 should consult healthcare provider before intense training',
      severity: 'warning',
      icon: '⚠️',
    });
  }

  if (age > 65) {
    conditions.push({
      warning: 'Low-impact exercises recommended for better joint health',
      severity: 'info',
      icon: 'ℹ️',
    });
  }

  if (age > 75) {
    conditions.push({
      warning: 'Medical clearance recommended before starting exercise program',
      severity: 'warning',
      icon: '⚠️',
    });
  }

  return conditions;
};

// Pregnancy conditions
export const getPregnancyConditions = (isPregnant: boolean, age: number): FitnessCondition[] => {
  const conditions: FitnessCondition[] = [];

  if (isPregnant) {
    if (age < 18 || age > 50) {
      conditions.push({
        warning: 'Pregnancy typically occurs between ages 18-50',
        severity: 'warning',
        icon: '⚠️',
      });
    }

    conditions.push({
      warning: 'Modified exercises will be provided for safe pregnancy fitness',
      severity: 'info',
      icon: '🤰',
    });

    conditions.push({
      warning: 'Always consult your OBGYN before starting new exercises',
      severity: 'warning',
      icon: '⚠️',
    });
  }

  return conditions;
};

// BMI-based goal recommendations
export const getRecommendedGoals = (bmi: number): string[] => {
  const category = getBMICategory(bmi);
  if (!category) return [];

  const recommendedGoals: Record<string, string[]> = {
    'Underweight': ['weight_gain', 'muscle_growth', 'strength'],
    'Normal Weight': ['muscle_growth', 'strength', 'weight_loss'],
    'Overweight': ['weight_loss', 'strength'],
    'Obese': ['weight_loss', 'strength'],
  };

  return recommendedGoals[category.category] || [];
};

// Fitness level based on age and experience
export const validateFitnessLevel = (age: number, level: string): FitnessCondition[] => {
  const conditions: FitnessCondition[] = [];

  if (age > 60 && level === 'advanced') {
    conditions.push({
      warning: 'Consider consulting trainer for age-appropriate intensity',
      severity: 'info',
      icon: 'ℹ️',
    });
  }

  return conditions;
};

// Overall profile validation
export const validateProfile = (formData: {
  age: number;
  height: number;
  weight: number;
  gender: string;
  isPregnant: boolean;
  fitnessLevel: string;
}): FitnessCondition[] => {
  const bmi = calculateBMI(formData.height, formData.weight);
  const conditions: FitnessCondition[] = [];

  // Add BMI conditions
  const bmiCategory = getBMICategory(bmi);
  if (bmiCategory && bmiCategory.category !== 'Normal Weight') {
    conditions.push({
      warning: `BMI Category: ${bmiCategory.category} (${bmi})`,
      severity: bmiCategory.category === 'Obese' ? 'warning' : 'info',
      icon: '📊',
    });
  }

  // Add age conditions
  conditions.push(...getAgeConditions(formData.age));

  // Add pregnancy conditions
  if (formData.gender === 'female') {
    conditions.push(...getPregnancyConditions(formData.isPregnant, formData.age));
  }

  // Add fitness level validation
  conditions.push(...validateFitnessLevel(formData.age, formData.fitnessLevel));

  return conditions;
};

// Get personalized recommendations
export const getPersonalizedRecommendations = (formData: {
  age: number;
  height: number;
  weight: number;
  gender: string;
  isPregnant: boolean;
  fitnessLevel: string;
}): string[] => {
  const recommendations: string[] = [];
  const bmi = calculateBMI(formData.height, formData.weight);
  const category = getBMICategory(bmi);

  if (category) {
    recommendations.push(...category.recommendations);
  }

  if (formData.isPregnant) {
    recommendations.push('Prenatal exercises focus on flexibility and endurance');
    recommendations.push('Stay hydrated and listen to your body');
  }

  if (formData.age > 40) {
    recommendations.push('Regular check-ups recommended');
    recommendations.push('Focus on recovery and flexibility');
  }

  if (formData.fitnessLevel === 'beginner') {
    recommendations.push('Start slow and build gradually');
    recommendations.push('Consistency matters more than intensity');
  }

  return recommendations;
};

// Health risk assessment
export const assessHealthRisks = (formData: {
  age: number;
  height: number;
  weight: number;
  isPregnant: boolean;
  healthIssues: string;
}): { riskLevel: 'low' | 'moderate' | 'high'; warnings: string[] } => {
  const warnings: string[] = [];
  const bmi = calculateBMI(formData.height, formData.weight);

  if (bmi > 30) {
    warnings.push('Obesity-related health concerns');
  }

  if (bmi < 18.5) {
    warnings.push('Underweight - nutritional support recommended');
  }

  if (formData.age > 50 && bmi > 25) {
    warnings.push('Age and weight combination requires monitoring');
  }

  if (formData.healthIssues.toLowerCase().includes('heart') ||
      formData.healthIssues.toLowerCase().includes('surgery')) {
    warnings.push('Medical clearance advised for exercise program');
  }

  let riskLevel: 'low' | 'moderate' | 'high' = 'low';
  if (warnings.length > 2) riskLevel = 'moderate';
  if (warnings.length > 4 || (bmi > 35 && formData.age > 50)) riskLevel = 'high';

  return { riskLevel, warnings };
};
