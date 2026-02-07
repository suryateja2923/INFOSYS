import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FitnessButton } from '@/components/ui/FitnessButton';
import { 
  Dumbbell, 
  Sparkles, 
  Brain, 
  Target, 
  TrendingUp, 
  Utensils,
  ChevronRight,
  Play
} from 'lucide-react';

const Index: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: 'AI-Powered Plans',
      description: 'Personalized workouts and diets crafted by advanced AI',
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Goal-Focused',
      description: 'Whether weight loss, muscle gain, or strength - we adapt',
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Track Progress',
      description: 'Detailed analytics and insights on your fitness journey',
    },
    {
      icon: <Utensils className="w-6 h-6" />,
      title: 'Nutrition Plans',
      description: 'Custom meal plans with macros tailored to your goals',
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
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
          src="https://assets.mixkit.co/videos/preview/mixkit-woman-running-on-a-treadmill-in-a-gym-17817-large.mp4"
          type="video/mp4"
        />
      </video>
      
      {/* Overlay */}
      <div className="video-overlay" />

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center glow-primary">
              <Dumbbell className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-display font-bold">
              <span className="text-gradient-primary">fitplan</span>
              <span className="text-foreground">.ai</span>
            </h1>
          </div>
          <FitnessButton variant="outline" onClick={() => navigate('/login')}>
            Sign In
          </FitnessButton>
        </header>

        {/* Hero Section */}
        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">AI-Powered Fitness Platform</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-tight mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Transform Your Body with{' '}
              <span className="text-gradient-primary">Intelligent</span>{' '}
              Fitness
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Get personalized workout and diet plans powered by AI. 
              Track your progress, adapt to your mood, and achieve your fitness goals faster than ever.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <FitnessButton size="lg" onClick={() => navigate('/login')}>
                <Sparkles className="w-5 h-5" />
                Start Your Journey
                <ChevronRight className="w-5 h-5" />
              </FitnessButton>
              <FitnessButton variant="outline" size="lg">
                <Play className="w-5 h-5" />
                Watch Demo
              </FitnessButton>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group p-6 rounded-2xl bg-card/50 backdrop-blur-xl border border-border/50 transition-all duration-300 hover:border-primary/30 hover:bg-card/80 hover:-translate-y-1"
                  style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="p-6 text-center text-muted-foreground text-sm">
          <p>© 2026 fitplan.ai - AI-Powered Fitness & Nutrition Platform</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
