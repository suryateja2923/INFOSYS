import React from 'react';
import { FitnessCard } from '@/components/ui/FitnessCard';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const weeklyWorkoutData = [
  { day: 'Mon', calories: 320, duration: 45, workouts: 1 },
  { day: 'Tue', calories: 450, duration: 60, workouts: 1 },
  { day: 'Wed', calories: 280, duration: 35, workouts: 1 },
  { day: 'Thu', calories: 520, duration: 75, workouts: 2 },
  { day: 'Fri', calories: 380, duration: 50, workouts: 1 },
  { day: 'Sat', calories: 600, duration: 90, workouts: 2 },
  { day: 'Sun', calories: 200, duration: 30, workouts: 1 },
];

const calorieData = [
  { day: 'Mon', consumed: 1800, burned: 320, target: 2000 },
  { day: 'Tue', consumed: 2100, burned: 450, target: 2000 },
  { day: 'Wed', consumed: 1900, burned: 280, target: 2000 },
  { day: 'Thu', consumed: 1750, burned: 520, target: 2000 },
  { day: 'Fri', consumed: 2200, burned: 380, target: 2000 },
  { day: 'Sat', consumed: 2400, burned: 600, target: 2000 },
  { day: 'Sun', consumed: 1600, burned: 200, target: 2000 },
];

const dietAdherenceData = [
  { week: 'Week 1', adherence: 75 },
  { week: 'Week 2', adherence: 82 },
  { week: 'Week 3', adherence: 78 },
  { week: 'Week 4', adherence: 91 },
];

export const ProgressCharts: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Workout Progress Chart */}
      <FitnessCard>
        <h3 className="text-lg font-bold mb-4">Weekly Workout Progress</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyWorkoutData}>
              <defs>
                <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(16 100% 60%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(16 100% 60%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 18%)" />
              <XAxis dataKey="day" stroke="hsl(215 20% 55%)" fontSize={12} />
              <YAxis stroke="hsl(215 20% 55%)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(222 47% 9%)',
                  border: '1px solid hsl(222 30% 18%)',
                  borderRadius: '8px',
                  color: 'hsl(210 40% 98%)',
                }}
              />
              <Area
                type="monotone"
                dataKey="calories"
                stroke="hsl(16 100% 60%)"
                fillOpacity={1}
                fill="url(#colorCalories)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </FitnessCard>

      {/* Calorie Trends Chart */}
      <FitnessCard>
        <h3 className="text-lg font-bold mb-4">Calorie Trends</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={calorieData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 18%)" />
              <XAxis dataKey="day" stroke="hsl(215 20% 55%)" fontSize={12} />
              <YAxis stroke="hsl(215 20% 55%)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(222 47% 9%)',
                  border: '1px solid hsl(222 30% 18%)',
                  borderRadius: '8px',
                  color: 'hsl(210 40% 98%)',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="consumed"
                stroke="hsl(172 66% 50%)"
                strokeWidth={2}
                dot={{ fill: 'hsl(172 66% 50%)' }}
              />
              <Line
                type="monotone"
                dataKey="burned"
                stroke="hsl(16 100% 60%)"
                strokeWidth={2}
                dot={{ fill: 'hsl(16 100% 60%)' }}
              />
              <Line
                type="monotone"
                dataKey="target"
                stroke="hsl(215 20% 55%)"
                strokeWidth={1}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </FitnessCard>

      {/* Diet Adherence Chart */}
      <FitnessCard className="lg:col-span-2">
        <h3 className="text-lg font-bold mb-4">Diet Adherence</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dietAdherenceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 18%)" />
              <XAxis dataKey="week" stroke="hsl(215 20% 55%)" fontSize={12} />
              <YAxis stroke="hsl(215 20% 55%)" fontSize={12} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(222 47% 9%)',
                  border: '1px solid hsl(222 30% 18%)',
                  borderRadius: '8px',
                  color: 'hsl(210 40% 98%)',
                }}
              />
              <Bar
                dataKey="adherence"
                fill="hsl(142 71% 45%)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </FitnessCard>
    </div>
  );
};

export default ProgressCharts;
