import React, { useState } from 'react';
import { FitnessButton } from '@/components/ui/FitnessButton';
import { FitnessInput } from '@/components/ui/FitnessInput';
import { FitnessCard } from '@/components/ui/FitnessCard';
import { useFitplanStore } from '@/store/fitplanStore';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Dumbbell, Sparkles, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { authAPI, profileAPI, loadUserPlanData } from '@/lib/api';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all required fields');
      return;
    }

    if (isSignUp) {
      if (!name) {
        setError('Please enter your name');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
    }

    setIsLoading(true);
    
    try {
      if (isSignUp) {
        // Register new user
        await authAPI.register(name, email, password);
        
        // After registration, auto-login
        await authAPI.login(email, password);
        
        useFitplanStore.getState().setAuthenticated(true);
        navigate('/onboarding'); // New users always go to onboarding
      } else {
        // Login existing user
        await authAPI.login(email, password);
        
        useFitplanStore.getState().setAuthenticated(true);
        
        // Fetch user profile to check if onboarded + load their data
        try {
          const userProfile = await profileAPI.getProfile();
          
          if (userProfile?.profile) {
            // User has completed onboarding
            useFitplanStore.getState().setProfile(userProfile.profile);
            useFitplanStore.getState().setOnboarded(true);
            
            // Load their existing plans
            await loadUserPlanData();
            
            navigate('/dashboard');
          } else {
            // User exists but hasn't completed onboarding
            navigate('/onboarding');
          }
        } catch (profileError) {
          // If profile fetch fails, default to onboarding
          console.error('Failed to fetch profile:', profileError);
          navigate('/onboarding');
        }
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError(err instanceof Error ? err.message : 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="video-background"
        poster="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920"
      >
        <source
          src="https://assets.mixkit.co/videos/preview/mixkit-man-doing-exercises-with-dumbbells-in-a-gym-42998-large.mp4"
          type="video/mp4"
        />
      </video>
      
      {/* Overlay */}
      <div className="video-overlay" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* Login/Signup Card */}
      <div className="relative z-10 w-full max-w-md animate-scale-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center glow-primary">
              <Dumbbell className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-display font-bold">
              <span className="text-gradient-primary">fitplan</span>
              <span className="text-foreground">.ai</span>
            </h1>
          </div>
          <p className="text-muted-foreground">
            {isSignUp ? 'Start your fitness transformation' : 'AI-powered personalized fitness & nutrition'}
          </p>
        </div>

        <FitnessCard className="p-8">
          {/* Toggle Tabs */}
          <div className="flex mb-6 p-1 bg-muted rounded-xl">
            <button
              onClick={() => toggleMode()}
              className={cn(
                'flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-200',
                !isSignUp 
                  ? 'bg-gradient-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Sign In
            </button>
            <button
              onClick={() => toggleMode()}
              className={cn(
                'flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-200',
                isSignUp 
                  ? 'bg-gradient-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              {isSignUp && (
                <div className="animate-fade-in">
                  <FitnessInput
                    type="text"
                    label="Full Name"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    icon={<User className="w-5 h-5" />}
                  />
                </div>
              )}
              
              <FitnessInput
                type="email"
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-5 h-5" />}
              />
              
              <FitnessInput
                type="password"
                label="Password"
                placeholder={isSignUp ? 'Create a password' : 'Enter your password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-5 h-5" />}
              />

              {isSignUp && (
                <div className="animate-fade-in">
                  <FitnessInput
                    type="password"
                    label="Confirm Password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    icon={<Lock className="w-5 h-5" />}
                  />
                </div>
              )}
            </div>

            {!isSignUp && (
              <div className="flex justify-end">
                <button type="button" className="text-sm text-primary hover:underline">
                  Forgot password?
                </button>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm animate-fade-in">
                {error}
              </div>
            )}

            <FitnessButton
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              <Sparkles className="w-5 h-5" />
              {isSignUp ? 'Create Account' : 'Sign In'}
            </FitnessButton>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-card text-muted-foreground">or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FitnessButton type="button" variant="outline">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </FitnessButton>
              <FitnessButton type="button" variant="outline">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>
                </svg>
                Facebook
              </FitnessButton>
            </div>
          </form>

          {isSignUp && (
            <p className="text-center text-muted-foreground text-xs mt-6 animate-fade-in">
              By signing up, you agree to our{' '}
              <button className="text-primary hover:underline">Terms of Service</button>
              {' '}and{' '}
              <button className="text-primary hover:underline">Privacy Policy</button>
            </p>
          )}
        </FitnessCard>
      </div>
    </div>
  );
};

export default Login;
