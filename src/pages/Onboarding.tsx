import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FitnessButton } from '@/components/ui/FitnessButton';
import { FitnessInput } from '@/components/ui/FitnessInput';
import { FitnessCard } from '@/components/ui/FitnessCard';
import { StepIndicator } from '@/components/ui/StepIndicator';
import { useFitplanStore, UserProfile } from '@/store/fitplanStore';
import { 
  User, Scale, Ruler, MapPin, Heart, Target, 
  Dumbbell, TrendingUp, Flame, Sparkles, Database, 
  Brain, ArrowRight, ArrowLeft 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const steps = ['Personal', 'Body', 'Fitness', 'Health', 'Generate'];

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { setProfile, setOnboarded, generateWorkoutPlan, generateDietPlan } = useFitplanStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  
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
  });

  const updateField = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
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
    setIsGenerating(true);
    
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setProfile(formData as UserProfile);
    generateWorkoutPlan();
    generateDietPlan();
    setOnboarded(true);
    setIsGenerating(false);
    navigate('/dashboard');
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

            {formData.gender === 'female' && (
              <div className="space-y-2 animate-fade-in">
                <label className="block text-sm font-medium">Are you pregnant?</label>
                <div className="grid grid-cols-2 gap-4">
                  {[false, true].map((val) => (
                    <button
                      key={String(val)}
                      onClick={() => updateField('isPregnant', val)}
                      className={cn(
                        'py-3 px-4 rounded-lg border font-medium transition-all duration-200',
                        formData.isPregnant === val
                          ? 'bg-gradient-primary text-primary-foreground border-transparent'
                          : 'bg-muted border-border text-muted-foreground hover:border-primary/50'
                      )}
                    >
                      {val ? 'Yes' : 'No'}
                    </button>
                  ))}
                </div>
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
              <div className="p-4 rounded-xl bg-muted/50 border border-border animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Your BMI</span>
                  <span className="text-2xl font-bold text-gradient-primary">
                    {(formData.weight! / Math.pow(formData.height! / 100, 2)).toFixed(1)}
                  </span>
                </div>
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

            <div className="space-y-3">
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
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Health Information</h2>
              <p className="text-muted-foreground">Any conditions we should know about?</p>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium">Health Issues (Optional)</label>
              <textarea
                value={formData.healthIssues}
                onChange={(e) => updateField('healthIssues', e.target.value)}
                placeholder="List any health conditions: surgeries, fractures, diabetes, allergies, injuries..."
                className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 min-h-[120px] resize-none"
              />
            </div>

            <FitnessCard className="bg-muted/30">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Heart className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Your data is secure</p>
                  <p className="text-muted-foreground text-sm">
                    All health information is encrypted and used only to personalize your fitness plan.
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
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-3 rounded-lg bg-muted/50">
                  <span className="text-muted-foreground">Age:</span> {formData.age}
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <span className="text-muted-foreground">Goal:</span> {formData.goal?.replace('_', ' ')}
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <span className="text-muted-foreground">Level:</span> {formData.fitnessLevel}
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <span className="text-muted-foreground">BMI:</span> {(formData.weight! / Math.pow(formData.height! / 100, 2)).toFixed(1)}
                </div>
              </div>
            </div>
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
              <FitnessButton onClick={nextStep}>
                Continue
                <ArrowRight className="w-4 h-4" />
              </FitnessButton>
            ) : (
              <FitnessButton onClick={handleGenerate} isLoading={isGenerating}>
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
