import React from 'react';
import { ProgressCharts } from '@/components/dashboard/ProgressCharts';
import { FitnessCard } from '@/components/ui/FitnessCard';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { useFitplanStore } from '@/store/fitplanStore';

const ProgressPage: React.FC = () => {
  const { fitnessScore } = useFitplanStore();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="mb-2">
        <h1 className="text-3xl font-bold">Progress Graphs</h1>
        <p className="text-muted-foreground mt-1">
          Track your fitness journey with detailed analytics
        </p>
      </div>

      {/* Fitness Score Overview */}
      <FitnessCard className="flex flex-col sm:flex-row items-center gap-6 p-8">
        <ProgressRing progress={fitnessScore} size={140} strokeWidth={10} color="success">
          <div className="text-center">
            <p className="text-3xl font-bold">{fitnessScore}</p>
            <p className="text-xs text-muted-foreground">Score</p>
          </div>
        </ProgressRing>
        <div className="text-center sm:text-left">
          <h3 className="text-xl font-bold mb-2">Your Fitness Score</h3>
          <p className="text-muted-foreground mb-4">
            Based on workout consistency, diet adherence, and overall progress.
            Keep pushing to increase your score!
          </p>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="px-3 py-1 rounded-full bg-success/10 text-success">
              +5% this week
            </div>
            <div className="px-3 py-1 rounded-full bg-primary/10 text-primary">
              Top 20% users
            </div>
          </div>
        </div>
      </FitnessCard>

      <ProgressCharts />
    </div>
  );
};

export default ProgressPage;
