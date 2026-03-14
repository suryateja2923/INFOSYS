import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FitnessCard } from '@/components/ui/FitnessCard';
import { FitnessButton } from '@/components/ui/FitnessButton';
import { useFitplanStore } from '@/store/fitplanStore';
import { Slider } from '@/components/ui/slider';
import { Star, MessageSquare, Dumbbell, Utensils, Send, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { completeDayAndGenerateNext, workoutAPI, dietAPI } from '@/lib/api';

const DayOneFeedback: React.FC = () => {
  const navigate = useNavigate();
  const { dayOneFeedback, setDayFeedback, currentDay, workoutMode, unlockNextDay } = useFitplanStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [feedback, setFeedback] = useState({
    workoutRating: dayOneFeedback?.workoutRating ?? 4,
    workoutDifficulty: dayOneFeedback?.workoutDifficulty ?? 50,
    workoutEnergy: dayOneFeedback?.workoutEnergy ?? 70,
    workoutComments: dayOneFeedback?.workoutComments ?? '',
    dietRating: dayOneFeedback?.dietRating ?? 4,
    dietSatisfaction: dayOneFeedback?.dietSatisfaction ?? 60,
    dietHunger: dayOneFeedback?.dietHunger ?? 30,
    dietComments: dayOneFeedback?.dietComments ?? '',
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');
    
    try {
      // Convert ratings to numeric scale
      const moodMap: { [key: string]: string } = {
        '1': 'exhausted',
        '2': 'stressed',
        '3': 'energetic',
        '4': 'energetic',
        '5': 'energetic',
      };
      
      const mood = moodMap[feedback.workoutRating.toString()] || 'energetic';
      
      // Submit feedback and generate Day 2
      const result = await completeDayAndGenerateNext(
        currentDay,
        {
          mood: mood,
          energy: Math.round(feedback.workoutEnergy / 10), // Convert 0-100 to 0-10
          difficulty: Math.round(feedback.workoutDifficulty / 10), // Convert 0-100 to 0-10
          comment: `Workout: ${feedback.workoutComments}. Diet: ${feedback.dietComments}`,
        },
        workoutMode
      );
      
      // Save feedback locally
      setDayFeedback({ ...feedback, submitted: true });
      
      // Store Day 2 plans in dynamic store structure
      if (result.workout) {
        useFitplanStore.getState().setWorkoutPlan(currentDay + 1, result.workout);
        
        // 💾 Save Day 2 workout to database
        try {
          await workoutAPI.saveWorkout({
            day: currentDay + 1,
            place: result.workout.place || workoutMode,
            difficulty: result.workout.difficulty || 'beginner',
            exercises: result.workout.exercises || [],
          });
        } catch (saveErr) {
          console.log('Day 2 Workout saved to store but not database:', saveErr);
        }
      }
      
      if (result.diet) {
        useFitplanStore.getState().setDietPlan(currentDay + 1, result.diet);
        
        // 💾 Save Day 2 diet to database
        try {
          await dietAPI.saveDiet({
            day: currentDay + 1,
            calories: result.diet.total_calories || 2000,
            meals: result.diet.meals || [],
          });
        } catch (saveErr) {
          console.log('Day 2 Diet saved to store but not database:', saveErr);
        }
      }
      
      // Unlock Day 2
      unlockNextDay();
      
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to submit feedback:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (dayOneFeedback?.submitted) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <FitnessCard className="text-center p-12">
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-success" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Feedback Submitted!</h2>
          <p className="text-muted-foreground mb-6">
            Thank you for your Day One feedback. Our AI will use this to improve your future plans.
          </p>
          <FitnessButton onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </FitnessButton>
        </FitnessCard>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Day One Feedback</h1>
        <p className="text-muted-foreground">
          Help us improve your experience with structured feedback
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workout Feedback */}
        <FitnessCard>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Workout Feedback</h3>
              <p className="text-sm text-muted-foreground">Rate your Day 1 workout</p>
            </div>
          </div>

          {/* Star Rating */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3">Overall Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setFeedback(prev => ({ ...prev, workoutRating: star }))}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      'w-8 h-8 transition-colors',
                      star <= feedback.workoutRating
                        ? 'fill-primary text-primary'
                        : 'text-muted-foreground'
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Slider */}
          <div className="mb-6">
            <div className="flex justify-between mb-3">
              <label className="text-sm font-medium">Difficulty Level</label>
              <span className="text-sm text-muted-foreground">{feedback.workoutDifficulty}%</span>
            </div>
            <Slider
              value={[feedback.workoutDifficulty]}
              onValueChange={(value) => setFeedback(prev => ({ ...prev, workoutDifficulty: value[0] }))}
              max={100}
              step={1}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Too Easy</span>
              <span>Perfect</span>
              <span>Too Hard</span>
            </div>
          </div>

          {/* Energy Slider */}
          <div className="mb-6">
            <div className="flex justify-between mb-3">
              <label className="text-sm font-medium">Energy After Workout</label>
              <span className="text-sm text-muted-foreground">{feedback.workoutEnergy}%</span>
            </div>
            <Slider
              value={[feedback.workoutEnergy]}
              onValueChange={(value) => setFeedback(prev => ({ ...prev, workoutEnergy: value[0] }))}
              max={100}
              step={1}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Exhausted</span>
              <span>Refreshed</span>
              <span>Energized</span>
            </div>
          </div>

          {/* Comments */}
          <div>
            <label className="block text-sm font-medium mb-2">Additional Comments</label>
            <textarea
              value={feedback.workoutComments}
              onChange={(e) => setFeedback(prev => ({ ...prev, workoutComments: e.target.value }))}
              placeholder="Any specific feedback about exercises, duration, etc..."
              className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 min-h-[80px] resize-none"
            />
          </div>
        </FitnessCard>

        {/* Diet Feedback */}
        <FitnessCard>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
              <Utensils className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Diet Feedback</h3>
              <p className="text-sm text-muted-foreground">Rate your Day 1 nutrition</p>
            </div>
          </div>

          {/* Star Rating */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3">Overall Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setFeedback(prev => ({ ...prev, dietRating: star }))}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      'w-8 h-8 transition-colors',
                      star <= feedback.dietRating
                        ? 'fill-secondary text-secondary'
                        : 'text-muted-foreground'
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Satisfaction Slider */}
          <div className="mb-6">
            <div className="flex justify-between mb-3">
              <label className="text-sm font-medium">Meal Satisfaction</label>
              <span className="text-sm text-muted-foreground">{feedback.dietSatisfaction}%</span>
            </div>
            <Slider
              value={[feedback.dietSatisfaction]}
              onValueChange={(value) => setFeedback(prev => ({ ...prev, dietSatisfaction: value[0] }))}
              max={100}
              step={1}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Not Satisfied</span>
              <span>Okay</span>
              <span>Very Satisfied</span>
            </div>
          </div>

          {/* Hunger Slider */}
          <div className="mb-6">
            <div className="flex justify-between mb-3">
              <label className="text-sm font-medium">Hunger Level</label>
              <span className="text-sm text-muted-foreground">{feedback.dietHunger}%</span>
            </div>
            <Slider
              value={[feedback.dietHunger]}
              onValueChange={(value) => setFeedback(prev => ({ ...prev, dietHunger: value[0] }))}
              max={100}
              step={1}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Too Full</span>
              <span>Perfect</span>
              <span>Still Hungry</span>
            </div>
          </div>

          {/* Comments */}
          <div>
            <label className="block text-sm font-medium mb-2">Additional Comments</label>
            <textarea
              value={feedback.dietComments}
              onChange={(e) => setFeedback(prev => ({ ...prev, dietComments: e.target.value }))}
              placeholder="Any specific feedback about meals, portions, taste..."
              className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 min-h-[80px] resize-none"
            />
          </div>
        </FitnessCard>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center pt-4">
        <FitnessButton
          size="lg"
          onClick={handleSubmit}
          isLoading={isSubmitting}
          className="min-w-[200px]"
        >
          <Send className="w-5 h-5" />
          Submit Feedback
        </FitnessButton>
      </div>
    </div>
  );
};

export default DayOneFeedback;
