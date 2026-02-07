import React from 'react';
import { FitnessCard } from '@/components/ui/FitnessCard';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const weeklyWorkoutData = [
  { day: 'Mon', planned: 5, completed: 4 },
  { day: 'Tue', planned: 6, completed: 6 },
  { day: 'Wed', planned: 4, completed: 3 },
  { day: 'Thu', planned: 7, completed: 5 },
  { day: 'Fri', planned: 5, completed: 5 },
  { day: 'Sat', planned: 8, completed: 7 },
  { day: 'Sun', planned: 3, completed: 2 },
];

const dailyCaloriesData = [
  { day: 'Mon', calories: 320 },
  { day: 'Tue', calories: 450 },
  { day: 'Wed', calories: 280 },
  { day: 'Thu', calories: 520 },
  { day: 'Fri', calories: 380 },
  { day: 'Sat', calories: 600 },
  { day: 'Sun', calories: 200 },
];

const dietAdherenceData = [
  { day: 'Mon', adherence: 85, target: 100 },
  { day: 'Tue', adherence: 92, target: 100 },
  { day: 'Wed', adherence: 78, target: 100 },
  { day: 'Thu', adherence: 88, target: 100 },
  { day: 'Fri', adherence: 95, target: 100 },
  { day: 'Sat', adherence: 72, target: 100 },
  { day: 'Sun', adherence: 80, target: 100 },
];

const workoutDurationData = [
  { day: 'Mon', duration: 45 },
  { day: 'Tue', duration: 60 },
  { day: 'Wed', duration: 35 },
  { day: 'Thu', duration: 75 },
  { day: 'Fri', duration: 50 },
  { day: 'Sat', duration: 90 },
  { day: 'Sun', duration: 30 },
];

const fitnessGoalData = [
  { name: 'Completed', value: 72, color: 'hsl(142 71% 45%)' },
  { name: 'Remaining', value: 28, color: 'hsl(222 30% 25%)' },
];

const feedbackData = [
  { name: 'Workout Rating', value: 4.2, fill: 'hsl(16 100% 60%)' },
  { name: 'Diet Rating', value: 3.8, fill: 'hsl(172 66% 50%)' },
  { name: 'Energy Level', value: 4.0, fill: 'hsl(47 96% 53%)' },
  { name: 'Satisfaction', value: 4.5, fill: 'hsl(142 71% 45%)' },
];

const chartTooltipStyle = {
  backgroundColor: 'hsl(222 47% 9%)',
  border: '1px solid hsl(222 30% 18%)',
  borderRadius: '8px',
  color: 'hsl(210 40% 98%)',
};

export const ProgressCharts: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Row 1: Bar Chart + Line Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Workout Progress - Bar Chart */}
        <FitnessCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Weekly Workout Progress</h3>
            <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
              Planned vs Completed
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyWorkoutData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 18%)" vertical={false} />
                <XAxis dataKey="day" stroke="hsl(215 20% 55%)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(215 20% 55%)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: 'hsl(222 30% 15%)' }} />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Bar dataKey="planned" fill="hsl(222 30% 35%)" radius={[4, 4, 0, 0]} name="Planned" />
                <Bar dataKey="completed" fill="hsl(16 100% 60%)" radius={[4, 4, 0, 0]} name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </FitnessCard>

        {/* Daily Calories Burned - Line Chart */}
        <FitnessCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Daily Calories Burned</h3>
            <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
              Last 7 days
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyCaloriesData}>
                <defs>
                  <linearGradient id="caloriesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(16 100% 60%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(16 100% 60%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 18%)" vertical={false} />
                <XAxis dataKey="day" stroke="hsl(215 20% 55%)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(215 20% 55%)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="calories"
                  stroke="hsl(16 100% 60%)"
                  strokeWidth={3}
                  dot={{ fill: 'hsl(16 100% 60%)', strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, stroke: 'hsl(16 100% 60%)', strokeWidth: 2, fill: 'hsl(222 47% 9%)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </FitnessCard>
      </div>

      {/* Row 2: Area Chart + Line Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Diet Plan Adherence - Area Chart */}
        <FitnessCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Diet Plan Adherence</h3>
            <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
              Target: 100%
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dietAdherenceData}>
                <defs>
                  <linearGradient id="adherenceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(172 66% 50%)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(172 66% 50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 18%)" vertical={false} />
                <XAxis dataKey="day" stroke="hsl(215 20% 55%)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(215 20% 55%)" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="target"
                  stroke="hsl(215 20% 45%)"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  fill="none"
                />
                <Area
                  type="monotone"
                  dataKey="adherence"
                  stroke="hsl(172 66% 50%)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#adherenceGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </FitnessCard>

        {/* Workout Duration Trend - Line Chart */}
        <FitnessCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Workout Duration Trend</h3>
            <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
              Minutes per day
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={workoutDurationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 18%)" vertical={false} />
                <XAxis dataKey="day" stroke="hsl(215 20% 55%)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(215 20% 55%)" fontSize={12} tickLine={false} axisLine={false} unit=" min" />
                <Tooltip contentStyle={chartTooltipStyle} formatter={(value) => [`${value} min`, 'Duration']} />
                <Line
                  type="monotone"
                  dataKey="duration"
                  stroke="hsl(47 96% 53%)"
                  strokeWidth={3}
                  dot={{ fill: 'hsl(47 96% 53%)', strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, stroke: 'hsl(47 96% 53%)', strokeWidth: 2, fill: 'hsl(222 47% 9%)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </FitnessCard>
      </div>

      {/* Row 3: Donut Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fitness Goal Completion - Donut Chart */}
        <FitnessCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Fitness Goal Completion</h3>
            <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
              Overall Progress
            </span>
          </div>
          <div className="h-64 flex items-center justify-center">
            <div className="relative">
              <ResponsiveContainer width={200} height={200}>
                <PieChart>
                  <Pie
                    data={fitnessGoalData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={2}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {fitnessGoalData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-foreground">72%</span>
                <span className="text-xs text-muted-foreground">Complete</span>
              </div>
            </div>
            <div className="ml-6 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-success" />
                <span className="text-sm text-muted-foreground">Completed (72%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-muted" />
                <span className="text-sm text-muted-foreground">Remaining (28%)</span>
              </div>
            </div>
          </div>
        </FitnessCard>

        {/* Day One Feedback Summary - Rating Chart */}
        <FitnessCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Day One Feedback Summary</h3>
            <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
              User Ratings
            </span>
          </div>
          <div className="h-64">
            <div className="space-y-4 py-4">
              {feedbackData.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{item.name}</span>
                    <span className="text-sm font-bold" style={{ color: item.fill }}>
                      {item.value}/5
                    </span>
                  </div>
                  <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(item.value / 5) * 100}%`,
                        backgroundColor: item.fill,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center pt-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-5 h-5 ${star <= 4 ? 'text-yellow-400' : 'text-muted'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="ml-2 text-sm text-muted-foreground">4.1 avg</span>
              </div>
            </div>
          </div>
        </FitnessCard>
      </div>
    </div>
  );
};

export default ProgressCharts;
