import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
  BarChart,
  Bar
} from 'recharts';
import { useTheme } from 'next-themes';
import { format, subDays, startOfDay } from 'date-fns';
import { Goal, GoalActivity } from '@shared/schema';

interface TimeTrackingChartProps {
  activities: GoalActivity[];
  goal?: Goal;
  days?: number;
}

export const TimeTrackingChart: React.FC<TimeTrackingChartProps> = ({ 
  activities, 
  goal,
  days = 14 
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const textColor = isDark ? '#e2e8f0' : '#1e293b';
  const gridColor = isDark ? '#334155' : '#e2e8f0';
  
  // Generate daily data points for the past N days
  const chartData = useMemo(() => {
    const today = startOfDay(new Date());
    const data = [];
    
    // Create an array of the last N days
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(date, 'MMM dd');
      
      // Find activities for this day
      const dayActivities = activities.filter(activity => {
        const activityDate = startOfDay(new Date(activity.date));
        return activityDate.getTime() === date.getTime();
      });
      
      // Calculate total minutes for this day
      const minutesSpent = dayActivities.reduce((total, activity) => 
        total + (activity.minutesSpent || 0), 0);
      
      // Calculate progress increments for this day
      const progressIncrement = dayActivities.reduce((total, activity) => 
        total + (activity.progressIncrement || 0), 0);
      
      data.push({
        date: dateStr,
        minutes: minutesSpent,
        hours: parseFloat((minutesSpent / 60).toFixed(1)),
        progress: progressIncrement,
        count: dayActivities.length
      });
    }
    
    return data;
  }, [activities, days]);
  
  const hasData = chartData.some(day => day.minutes > 0);
  
  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-[300px] bg-muted/20 rounded-md text-muted-foreground">
        No activity data recorded yet
      </div>
    );
  }
  
  // Get maximum value for better scale
  const maxHours = Math.max(...chartData.map(day => day.hours));
  
  return (
    <div className="space-y-6">
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{
              top: 10,
              right: 30,
              left: 10,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis 
              dataKey="date" 
              tick={{ fill: textColor }}
              tickLine={{ stroke: gridColor }}
              axisLine={{ stroke: gridColor }}
            />
            <YAxis 
              yAxisId="left"
              tick={{ fill: textColor }}
              tickLine={{ stroke: gridColor }}
              axisLine={{ stroke: gridColor }}
              label={{ 
                value: 'Hours Spent', 
                angle: -90, 
                position: 'insideLeft',
                style: { fill: textColor, textAnchor: 'middle' }
              }}
              domain={[0, Math.ceil(maxHours) + 0.5]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                borderColor: isDark ? '#334155' : '#e2e8f0',
                color: textColor,
              }}
            />
            <Legend />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="hours"
              name="Hours Spent"
              stroke="#8884d8"
              fill="url(#colorHours)"
              activeDot={{ r: 6 }}
            />
            <defs>
              <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1} />
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 10,
              right: 30,
              left: 10,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis 
              dataKey="date" 
              tick={{ fill: textColor }}
              tickLine={{ stroke: gridColor }}
              axisLine={{ stroke: gridColor }}
            />
            <YAxis 
              tick={{ fill: textColor }}
              tickLine={{ stroke: gridColor }}
              axisLine={{ stroke: gridColor }}
              label={{ 
                value: 'Daily Activity Count', 
                angle: -90, 
                position: 'insideLeft',
                style: { fill: textColor, textAnchor: 'middle' }
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                borderColor: isDark ? '#334155' : '#e2e8f0',
                color: textColor,
              }}
            />
            <Legend />
            <Bar 
              dataKey="count" 
              name="Activity Count" 
              fill="#82ca9d"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};