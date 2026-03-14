import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FitnessButton } from '@/components/ui/FitnessButton';
import { FitnessInput } from '@/components/ui/FitnessInput';
import { FitnessCard } from '@/components/ui/FitnessCard';
import { StepIndicator } from '@/components/ui/StepIndicator';
import { useFitplanStore, UserProfile } from '@/store/fitplanStore';
import { 
  User, Scale, Ruler, MapPin, Heart, Target, 
  Dumbbell, TrendingUp, Flame, Sparkles, Database, 
  Brain, ArrowRight, ArrowLeft, AlertCircle, CheckCircle, Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  calculateBMI, 
  getBMICategory, 
  validateProfile, 
  getPersonalizedRecommendations, 
  assessHealthRisks, 
  getRecommendedGoals 
} from '@/lib/fitnessConditions';
import { initializeUserPlan, workoutAPI, dietAPI } from '@/lib/api';

const steps = ['Personal', 'Body', 'Fitness', 'Health', 'Generate'];

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { setProfile, setOnboarded } = useFitplanStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pregnancyAlert, setPregnancyAlert] = useState('');
  
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    age: 25,
    height: 170,
    weight: 70,
    gender: 'male',
    isPregnant: false,
    fitnessLevel: 'beginner',
    goal: 'muscle_growth',
    location: '',
    healthIssues: '',
    foodPreference: undefined,
  });

  const updateField = (field: keyof UserProfile, value: any) => {
    // Clear pregnancy alert if age changes or gender changes away from female
    if (field === 'age' || field === 'gender') {
      setPregnancyAlert('');
      // Reset pregnancy to false if changing to non-female gender
      if (field === 'gender' && value !== 'female') {
        setFormData(prev => ({ ...prev, [field]: value, isPregnant: false }));
        return;
      }
      // Reset pregnancy to false if age becomes invalid
      if (field === 'age' && formData.isPregnant && (value < 18 || value > 50)) {
        setFormData(prev => ({ ...prev, [field]: value, isPregnant: false }));
        setPregnancyAlert('⚠️ Pregnancy status reset due to age change.');
        return;
      }
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePregnancyChange = (value: boolean) => {
    // Validate age for pregnancy (18-50 years old)
    const MIN_PREGNANCY_AGE = 18;
    const MAX_PREGNANCY_AGE = 50;
    
    if (value && (formData.age! < MIN_PREGNANCY_AGE || formData.age! > MAX_PREGNANCY_AGE)) {
      if (formData.age! < MIN_PREGNANCY_AGE) {
        setPregnancyAlert(`⚠️ CRITICAL: Pregnancy is not biologically possible at age ${formData.age}. This selection cannot be made. Valid pregnancy age range is ${MIN_PREGNANCY_AGE}-${MAX_PREGNANCY_AGE} years.`);
      } else {
        setPregnancyAlert(`⚠️ WARNING: Pregnancy typically occurs between ages ${MIN_PREGNANCY_AGE}-${MAX_PREGNANCY_AGE}. Your age (${formData.age}) is outside this range.`);
      }
      return; // Don't update the field - keep it false
    }
    
    setPregnancyAlert('');
    updateField('isPregnant', value);
  };

  // Real-time conditions computation
  const conditions = useMemo(() => validateProfile({
    age: formData.age || 0,
    height: formData.height || 0,
    weight: formData.weight || 0,
    gender: formData.gender || 'male',
    isPregnant: formData.isPregnant || false,
    fitnessLevel: formData.fitnessLevel || 'beginner',
  }), [formData]);

  const healthRisks = useMemo(() => assessHealthRisks({
    age: formData.age || 0,
    height: formData.height || 0,
    weight: formData.weight || 0,
    isPregnant: formData.isPregnant || false,
    healthIssues: formData.healthIssues || '',
  }), [formData]);

  const recommendations = useMemo(() => getPersonalizedRecommendations({
    age: formData.age || 0,
    height: formData.height || 0,
    weight: formData.weight || 0,
    gender: formData.gender || 'male',
    isPregnant: formData.isPregnant || false,
    fitnessLevel: formData.fitnessLevel || 'beginner',
  }), [formData]);

  const bmi = useMemo(() => calculateBMI(formData.height || 0, formData.weight || 0), [formData.height, formData.weight]);
  const bmiCategory = useMemo(() => getBMICategory(bmi, formData.height, formData.weight), [bmi, formData.height, formData.weight]);

  // Comprehensive validation for each step
  const isStepValid = useMemo(() => {
    switch (currentStep) {
      case 0: // Personal Information
        // Age must be valid
        if (!formData.age || formData.age < 1 || formData.age > 120) return false;
        // Gender must be selected
        if (!formData.gender) return false;
        // Pregnancy status must be valid for age
        if (formData.isPregnant && (formData.age < 18 || formData.age > 50)) return false;
        // Location is recommended (warn but don't block)
        if (!formData.location || formData.location.trim().length < 2) return false;
        return true;

      case 1: // Body Measurements
        // Height validation (100-250 cm)
        if (!formData.height || formData.height < 100 || formData.height > 250) return false;
        // Weight validation (20-300 kg)
        if (!formData.weight || formData.weight < 20 || formData.weight > 300) return false;
        // BMI should not be critically high
        const currentBMI = calculateBMI(formData.height, formData.weight);
        if (currentBMI > 50) return false; // Critically obese
        return true;

      case 2: // Fitness Profile
        // Fitness level must be selected
        if (!formData.fitnessLevel) return false;
        // Goal must be selected (unless pregnant)
        if (!formData.isPregnant && !formData.goal) return false;
        return true;

      case 3: // Health Information
        // Optional step - always valid
        return true;

      case 4: // Generate
        // All previous validations must pass
        // Check for any critical health risks
        if (healthRisks.riskLevel === 'high' && !formData.healthIssues) {
          // High risk without health issues documented
          return false;
        }
        return true;

      default:
        return true;
    }
  }, [currentStep, formData, healthRisks, formData.age, formData.gender, formData.isPregnant, formData.location, formData.height, formData.weight, formData.fitnessLevel, formData.goal]);

  // Check if Continue button should be disabled
  const isContinueDisabled = useMemo(() => {
    // Always disable if pregnancy alert is active
    if (pregnancyAlert !== '') return true;
    // Disable if current step is invalid
    if (!isStepValid) return true;
    return false;
  }, [pregnancyAlert, isStepValid]);

  const nextStep = () => {
    // Safety validation before proceeding
    if (currentStep === 0) {
      // Validate age
      if (!formData.age || formData.age < 1 || formData.age > 120) {
        alert('⚠️ Please enter a valid age (1-120 years)');
        return;
      }
      // Ensure pregnancy is not set for invalid ages
      if (formData.isPregnant && (formData.age < 18 || formData.age > 50)) {
        alert('⚠️ Invalid pregnancy status for this age. Please correct before continuing.');
        return;
      }
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleGenerate = async () => {
    // Final safety validation
    if (formData.isPregnant && formData.age && (formData.age < 18 || formData.age > 50)) {
      alert('⚠️ CRITICAL: Invalid pregnancy data detected. Cannot generate plan. Please go back and correct your information.');
      return;
    }
    
    if (!formData.age || formData.age < 1 || formData.age > 120) {
      alert('⚠️ Invalid age. Please go back and correct your information.');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Prepare profile data for backend
      const profileData = {
        age: formData.age!,
        height: formData.height!,
        weight: formData.weight!,
        gender: formData.gender!,
        pregnant: formData.isPregnant,
        level: formData.fitnessLevel!,
        goal: formData.goal!,
        health_issues: formData.healthIssues || undefined,
        location: formData.location!,
        food_preference: formData.foodPreference || 'mixed',
      };

      // Determine mode (for now, default to 'home', can be enhanced later)
      const mode = 'home' as 'gym' | 'home';

      // Initialize user plan (saves profile + generates Day 1 from Gemini AI)
      const result = await initializeUserPlan(profileData, mode);
      
      // Update local store with backend response
      setProfile(formData as UserProfile);
      
      // 🔥 Store the Gemini AI generated workout and diet plans from backend
      if (result.workout) {
        useFitplanStore.getState().setWorkoutPlan(1, result.workout);
        
        // 💾 Save workout to database so old users can access it on login
        try {
          await workoutAPI.saveWorkout({
            day: 1,
            place: result.workout.place || mode,
            difficulty: result.workout.difficulty || 'beginner',
            exercises: result.workout.exercises || [],
          });
        } catch (saveErr) {
          console.log('Workout saved to store but not database:', saveErr);
        }
      }
      
      if (result.diet) {
        useFitplanStore.getState().setDietPlan(1, result.diet);
        
        // 💾 Save diet to database so old users can access it on login
        try {
          await dietAPI.saveDiet({
            day: 1,
            calories: result.diet.total_calories || 2000,
            meals: result.diet.meals || [],
          });
        } catch (saveErr) {
          console.log('Diet saved to store but not database:', saveErr);
        }
      }
      
      setOnboarded(true);
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to generate plan:', error);
      alert('Failed to generate your personalized plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Personal Information</h2>
              <p className="text-muted-foreground">Tell us about yourself</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FitnessInput
                type="number"
                label="Age"
                value={formData.age}
                onChange={(e) => updateField('age', parseInt(e.target.value))}
                icon={<User className="w-5 h-5" />}
                min={1}
                max={120}
              />
              <div className="space-y-2">
                <label className="block text-sm font-medium">Gender</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['male', 'female', 'other'] as const).map((g) => (
                    <button
                      key={g}
                      onClick={() => updateField('gender', g)}
                      className={cn(
                        'py-2 px-3 rounded-lg border text-sm font-medium transition-all duration-200',
                        formData.gender === g
                          ? 'bg-gradient-primary text-primary-foreground border-transparent'
                          : 'bg-muted border-border text-muted-foreground hover:border-primary/50'
                      )}
                    >
                      {g.charAt(0).toUpperCase() + g.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Age Validation Warnings */}
            {formData.age && formData.age < 18 && (
              <FitnessCard className="bg-warning/10 border border-warning/30 animate-fade-in">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-warning/10">
                    <AlertCircle className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-warning">Minor Safety Notice</p>
                    <p className="text-muted-foreground text-sm mt-1">
                      Users under 18 should have parental/guardian supervision and medical clearance before starting any fitness program.
                    </p>
                  </div>
                </div>
              </FitnessCard>
            )}

            {formData.age && formData.age > 75 && (
              <FitnessCard className="bg-destructive/10 border border-destructive/30 animate-fade-in">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-destructive/10">
                    <AlertCircle className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-destructive">Senior Health Advisory</p>
                    <p className="text-muted-foreground text-sm mt-1">
                      Medical clearance is strongly recommended before starting any exercise program at age 75+.
                    </p>
                  </div>
                </div>
              </FitnessCard>
            )}

            {formData.gender === 'female' && (
              <div className="space-y-2 animate-fade-in">
                <label className="block text-sm font-medium">Are you pregnant?</label>
                
                {/* Proactive Age Warning */}
                {formData.age && (formData.age < 18 || formData.age > 50) && (
                  <div className="p-3 rounded-lg bg-warning/10 border border-warning/30 text-warning text-sm mb-2 animate-fade-in">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold mb-1">Age Notice</p>
                        {formData.age < 18 && (
                          <p>Users under 18 cannot select pregnancy status. Valid range: 18-50 years.</p>
                        )}
                        {formData.age > 50 && (
                          <p>Users over 50 may have different health considerations. Valid pregnancy range: 18-50 years.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {[false, true].map((val) => (
                    <button
                      key={String(val)}
                      onClick={() => handlePregnancyChange(val)}
                      disabled={val && formData.age && (formData.age < 18 || formData.age > 50)}
                      className={cn(
                        'py-3 px-4 rounded-lg border font-medium transition-all duration-200',
                        formData.isPregnant === val
                          ? 'bg-gradient-primary text-primary-foreground border-transparent'
                          : 'bg-muted border-border text-muted-foreground hover:border-primary/50',
                        val && formData.age && (formData.age < 18 || formData.age > 50) && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      {val ? 'Yes' : 'No'}
                    </button>
                  ))}
                </div>
                {pregnancyAlert && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm font-medium animate-fade-in">
                    {pregnancyAlert}
                  </div>
                )}
              </div>
            )}

            <FitnessInput
              type="text"
              label="Location"
              placeholder="City, Country"
              value={formData.location}
              onChange={(e) => updateField('location', e.target.value)}
              icon={<MapPin className="w-5 h-5" />}
            />
          </div>
        );

      case 1:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Body Measurements</h2>
              <p className="text-muted-foreground">Help us calculate your metrics</p>
            </div>

            <FitnessInput
              type="number"
              label="Height (cm)"
              value={formData.height}
              onChange={(e) => updateField('height', parseInt(e.target.value))}
              icon={<Ruler className="w-5 h-5" />}
            />

            <FitnessInput
              type="number"
              label="Weight (kg)"
              value={formData.weight}
              onChange={(e) => updateField('weight', parseInt(e.target.value))}
              icon={<Scale className="w-5 h-5" />}
            />

            {formData.height && formData.weight && (
              <div className="space-y-4 animate-fade-in">
                <div className="p-4 rounded-xl bg-muted/50 border border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Your BMI</span>
                    <span className={cn('text-2xl font-bold', bmiCategory?.color || 'text-primary')}>
                      {bmi}
                    </span>
                  </div>
                  {bmiCategory && (
                    <p className={cn('text-sm mt-2', bmiCategory.color)}>
                      Category: {bmiCategory.category}
                    </p>
                  )}
                </div>

                {/* Target Weight Suggestion - Always Show */}
                {bmiCategory?.targetSuggestion && (
                  <FitnessCard className={cn(
                    'border-l-4',
                    bmiCategory.category === 'Normal Weight' ? 'border-l-success' :
                    bmiCategory.category === 'Underweight' ? 'border-l-blue-500' :
                    bmiCategory.category === 'Obese' ? 'border-l-destructive' : 
                    'border-l-warning'
                  )}>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        {bmiCategory.category === 'Normal Weight' ? (
                          <CheckCircle className="w-5 h-5 text-success" />
                        ) : (
                          <Target className="w-5 h-5 text-primary" />
                        )}
                        <p className="font-semibold">Weight Recommendation</p>
                      </div>
                      <p className={cn(
                        'text-sm font-medium',
                        bmiCategory.category === 'Normal Weight' ? 'text-success' : 'text-foreground'
                      )}>
                        {bmiCategory.targetSuggestion}
                      </p>
                      {bmiCategory.weightChange && bmiCategory.category !== 'Normal Weight' && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-background/50">
                          <Info className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Recommended change: <span className="font-semibold text-foreground">{bmiCategory.weightChange}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </FitnessCard>
                )}

                {/* Health Recommendations */}
                {bmiCategory && bmiCategory.recommendations && (
                  <FitnessCard className={cn(
                    'border-l-4',
                    bmiCategory.category === 'Obese' ? 'border-l-destructive' : 
                    bmiCategory.category === 'Underweight' ? 'border-l-blue-500' :
                    bmiCategory.category === 'Normal Weight' ? 'border-l-success' :
                    'border-l-warning'
                  )}>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Heart className={cn(
                          'w-5 h-5',
                          bmiCategory.category === 'Obese' ? 'text-destructive' : 
                          bmiCategory.category === 'Underweight' ? 'text-blue-500' :
                          bmiCategory.category === 'Normal Weight' ? 'text-success' :
                          'text-warning'
                        )} />
                        <p className="font-semibold text-sm">Health Recommendations</p>
                      </div>
                      <ul className="text-sm text-muted-foreground space-y-1 pl-7">
                        {bmiCategory.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span>•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </FitnessCard>
                )}
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Fitness Profile</h2>
              <p className="text-muted-foreground">Set your fitness level and goals</p>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium">Fitness Level</label>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { value: 'beginner', label: 'Beginner', desc: 'New to fitness', icon: '🌱' },
                  { value: 'intermediate', label: 'Intermediate', desc: '1-2 years experience', icon: '💪' },
                  { value: 'advanced', label: 'Advanced', desc: '3+ years experience', icon: '🏆' },
                ].map((level) => (
                  <button
                    key={level.value}
                    onClick={() => updateField('fitnessLevel', level.value as any)}
                    className={cn(
                      'p-4 rounded-xl border text-left transition-all duration-200 flex items-center gap-4',
                      formData.fitnessLevel === level.value
                        ? 'bg-gradient-primary text-primary-foreground border-transparent glow-primary'
                        : 'bg-muted border-border hover:border-primary/50'
                    )}
                  >
                    <span className="text-2xl">{level.icon}</span>
                    <div>
                      <p className="font-semibold">{level.label}</p>
                      <p className={cn(
                        'text-sm',
                        formData.fitnessLevel === level.value ? 'text-primary-foreground/80' : 'text-muted-foreground'
                      )}>{level.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {!formData.isPregnant && (
              <div className="space-y-3 animate-fade-in">
                <label className="block text-sm font-medium">Primary Goal</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'weight_loss', label: 'Weight Loss', icon: <Flame className="w-5 h-5" /> },
                    { value: 'weight_gain', label: 'Weight Gain', icon: <TrendingUp className="w-5 h-5" /> },
                    { value: 'muscle_growth', label: 'Muscle Growth', icon: <Dumbbell className="w-5 h-5" /> },
                    { value: 'strength', label: 'Strength', icon: <Target className="w-5 h-5" /> },
                  ].map((goal) => (
                    <button
                      key={goal.value}
                      onClick={() => updateField('goal', goal.value as any)}
                      className={cn(
                        'p-4 rounded-xl border transition-all duration-200 flex flex-col items-center gap-2',
                        formData.goal === goal.value
                          ? 'bg-gradient-primary text-primary-foreground border-transparent glow-primary'
                          : 'bg-muted border-border hover:border-primary/50'
                      )}
                    >
                      {goal.icon}
                      <span className="font-medium text-sm">{goal.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {formData.isPregnant && (
              <FitnessCard className="bg-warning/10 border border-warning/30">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-warning/10">
                    <Heart className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-warning">Pregnancy-Safe Plan</p>
                    <p className="text-muted-foreground text-sm">
                      Your fitness goals are optimized for a healthy pregnancy. Focus on staying active with exercises approved for expecting mothers.
                    </p>
                  </div>
                </div>
              </FitnessCard>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Health & Preferences</h2>
              <p className="text-muted-foreground">Tell us about your health and dietary preferences</p>
            </div>

            {/* Health Issues */}
            <div className="space-y-3">
              <label className="block text-sm font-medium">Health Issues (Optional)</label>
              <textarea
                value={formData.healthIssues}
                onChange={(e) => updateField('healthIssues', e.target.value)}
                placeholder="List any health conditions: surgeries, fractures, diabetes, allergies, injuries..."
                className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 min-h-[100px] resize-none"
              />
            </div>

            {/* Food Preference - Optional */}
            <div className="space-y-3">
              <label className="block text-sm font-medium">Food Preference (Optional)</label>
              <p className="text-xs text-muted-foreground mb-3">
                ℹ️ By default, your meals will include both vegetarian and non-vegetarian options. Choose below if you prefer only vegetarian meals.
              </p>
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => updateField('foodPreference', 'veg')}
                  className={cn(
                    'p-4 rounded-xl border text-left transition-all duration-200 flex items-center gap-4',
                    formData.foodPreference === 'veg'
                      ? 'bg-gradient-primary text-primary-foreground border-transparent glow-primary'
                      : 'bg-muted hover:bg-muted/80 border-border hover:border-secondary'
                  )}
                >
                  <span className="text-2xl">🥗</span>
                  <div>
                    <p className="font-semibold">Vegetarian Only</p>
                    <p className="text-xs opacity-75">Vegetables, dairy, legumes (no meat/fish)</p>
                  </div>
                </button>
              </div>
            </div>

            <FitnessCard className="bg-muted/30">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Heart className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Your data is secure</p>
                  <p className="text-muted-foreground text-sm">
                    All health and preference information is encrypted and used only to personalize your fitness and diet plans.
                  </p>
                </div>
              </div>
            </FitnessCard>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 animate-fade-in text-center">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Ready to Generate Your Plan!</h2>
              <p className="text-muted-foreground">Our AI will create a personalized Day 1 workout & diet plan</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <FitnessCard className="text-center">
                <Database className="w-8 h-8 mx-auto mb-3 text-primary" />
                <p className="text-sm font-medium">Stored Securely</p>
                <p className="text-xs text-muted-foreground">Your profile is saved</p>
              </FitnessCard>
              <FitnessCard className="text-center">
                <Brain className="w-8 h-8 mx-auto mb-3 text-secondary" />
                <p className="text-sm font-medium">AI-Powered</p>
                <p className="text-xs text-muted-foreground">Smart recommendations</p>
              </FitnessCard>
            </div>

            <div className="space-y-3 text-left">
              <p className="text-sm font-medium">Your Profile Summary:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                <div className="p-3 rounded-lg bg-muted/50">
                  <span className="text-muted-foreground">Age:</span> {formData.age}
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <span className="text-muted-foreground">Gender:</span> {formData.gender?.charAt(0).toUpperCase() + formData.gender?.slice(1)}
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <span className="text-muted-foreground">Location:</span> {formData.location || 'Not specified'}
                </div>
                {!formData.isPregnant && (
                  <div className="p-3 rounded-lg bg-muted/50">
                    <span className="text-muted-foreground">Goal:</span> {formData.goal?.replace('_', ' ')}
                  </div>
                )}
                {formData.isPregnant && (
                  <div className="p-3 rounded-lg bg-warning/10 border border-warning/30">
                    <span className="text-warning font-medium">Pregnant:</span> <span className="text-warning">Yes</span>
                  </div>
                )}
                <div className="p-3 rounded-lg bg-muted/50">
                  <span className="text-muted-foreground">Level:</span> {formData.fitnessLevel?.charAt(0).toUpperCase() + formData.fitnessLevel?.slice(1)}
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <span className="text-muted-foreground">BMI:</span> {(formData.weight! / Math.pow(formData.height! / 100, 2)).toFixed(1)}
                </div>
              </div>
            </div>

            {/* Real-time Conditions & Recommendations */}
            {conditions.length > 0 && (
              <div className="space-y-3 animate-fade-in">
                <p className="text-sm font-medium">Health Conditions & Alerts:</p>
                <div className="space-y-2">
                  {conditions.map((condition, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        'p-3 rounded-lg border-l-4 flex items-start gap-3',
                        condition.severity === 'warning' && 'bg-warning/10 border-l-warning',
                        condition.severity === 'error' && 'bg-destructive/10 border-l-destructive',
                        condition.severity === 'info' && 'bg-primary/10 border-l-primary'
                      )}
                    >
                      <span className="text-lg mt-0.5">{condition.icon}</span>
                      <span className="text-sm text-muted-foreground">{condition.warning}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Health Risk Assessment */}
            {healthRisks.riskLevel !== 'low' && (
              <FitnessCard className={cn(
                'border-l-4',
                healthRisks.riskLevel === 'high' ? 'border-l-destructive bg-destructive/5' : 'border-l-warning bg-warning/5'
              )}>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className={cn(
                      'w-5 h-5',
                      healthRisks.riskLevel === 'high' ? 'text-destructive' : 'text-warning'
                    )} />
                    <p className="font-semibold text-sm">
                      {healthRisks.riskLevel === 'high' ? 'High Risk Assessment' : 'Moderate Risk Assessment'}
                    </p>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1 pl-7">
                    {healthRisks.warnings.map((warning, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span>⚠️</span>
                        <span>{warning}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </FitnessCard>
            )}

            {/* Personalized Recommendations */}
            {recommendations.length > 0 && (
              <FitnessCard className="bg-success/5 border border-success/30">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <p className="font-semibold text-sm">Personalized Recommendations</p>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1 pl-7">
                    {recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span>✓</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </FitnessCard>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-display font-bold">
              <span className="text-gradient-primary">fitplan</span>
              <span className="text-foreground">.ai</span>
            </h1>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="mb-8">
          <StepIndicator steps={steps} currentStep={currentStep} />
        </div>

        {/* Form Card */}
        <FitnessCard className="p-8">
          {renderStep()}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            {currentStep > 0 ? (
              <FitnessButton variant="ghost" onClick={prevStep}>
                <ArrowLeft className="w-4 h-4" />
                Back
              </FitnessButton>
            ) : (
              <div />
            )}

            {currentStep < steps.length - 1 ? (
              <FitnessButton 
                onClick={nextStep}
                disabled={isContinueDisabled}
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </FitnessButton>
            ) : (
              <FitnessButton 
                onClick={handleGenerate} 
                isLoading={isGenerating}
                disabled={isContinueDisabled || isGenerating}
              >
                <Sparkles className="w-5 h-5" />
                {isGenerating ? 'Generating...' : 'Generate My Plan'}
              </FitnessButton>
            )}
          </div>
        </FitnessCard>
      </div>
    </div>
  );
};

export default Onboarding;
