import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';
import { useTheme } from 'next-themes';
import { format, subDays, startOfDay, eachDayOfInterval, addDays } from 'date-fns';
import { GoalActivity } from '@shared/schema';

interface StreakChartProps {
  activities: GoalActivity[];
  days?: number;
}

export const StreakChart: React.FC<StreakChartProps> = ({ activities, days = 30 }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const textColor = isDark ? '#e2e8f0' : '#1e293b';
  const gridColor = isDark ? '#334155' : '#e2e8f0';
  
  // Convert activities to a set of dates with activity
  const activityDates = useMemo(() => {
    return new Set(
      activities.map(activity => 
        startOfDay(new Date(activity.date)).toISOString()
      )
    );
  }, [activities]);
  
  // Generate daily streak data
  const streakData = useMemo(() => {
    const today = startOfDay(new Date());
    const startDate = subDays(today, days - 1);
    
    // Create date intervals
    const dateInterval = eachDayOfInterval({
      start: startDate,
      end: today
    });
    
    // Current streak
    let currentStreak = 0;
    let longestStreak = 0;
    let currentStreakStart = null;
    let longestStreakStart = null;
    let longestStreakEnd = null;
    
    // Process streaks
    const streaks = dateInterval.map((date, index) => {
      const dateString = format(date, 'MMM dd');
      const hasActivity = activityDates.has(startOfDay(date).toISOString());
      
      if (hasActivity) {
        currentStreak++;
        
        if (currentStreakStart === null) {
          currentStreakStart = index;
        }
        
        if (currentStreak > longestStreak) {
          longestStreak = currentStreak;
          longestStreakStart = currentStreakStart;
          longestStreakEnd = index;
        }
      } else {
        currentStreak = 0;
        currentStreakStart = null;
      }
      
      return {
        date: dateString,
        active: hasActivity ? 1 : 0,
        isLongestStreak: false
      };
    });
    
    // Mark longest streak
    if (longestStreakStart !== null && longestStreakEnd !== null) {
      for (let i = longestStreakStart; i <= longestStreakEnd; i++) {
        streaks[i].isLongestStreak = true;
      }
    }
    
    return {
      data: streaks,
      currentStreak: currentStreak,
      longestStreak: longestStreak
    };
  }, [activityDates, days]);
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-primary/10 p-4 rounded-lg flex flex-col items-center justify-center">
          <div className="text-4xl font-bold text-primary">{streakData.currentStreak}</div>
          <div className="text-sm text-muted-foreground">Current Streak</div>
        </div>
        <div className="bg-primary/10 p-4 rounded-lg flex flex-col items-center justify-center">
          <div className="text-4xl font-bold text-primary">{streakData.longestStreak}</div>
          <div className="text-sm text-muted-foreground">Longest Streak</div>
        </div>
      </div>
      
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={streakData.data}
            margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
            barSize={12}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis 
              dataKey="date" 
              tick={{ fill: textColor }}
              tickLine={{ stroke: gridColor }}
              axisLine={{ stroke: gridColor }}
              interval={Math.ceil(days / 10)}
            />
            <YAxis 
              domain={[0, 1]} 
              tick={{ fill: textColor }}
              tickLine={{ stroke: gridColor }}
              axisLine={{ stroke: gridColor }}
              tickFormatter={() => ''}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                borderColor: isDark ? '#334155' : '#e2e8f0',
                color: textColor,
              }}
              formatter={(value, name) => [value ? 'Active' : 'No Activity', 'Status']}
            />
            <Legend />
            <Bar 
              dataKey="active" 
              name="Activity Streak" 
              radius={[4, 4, 0, 0]}
            >
              {streakData.data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.isLongestStreak ? '#f97316' : (entry.active ? '#4ade80' : '#d1d5db')}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex gap-4 justify-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
          <span>Active Day</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
          <span>Longest Streak</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-300"></div>
          <span>Inactive Day</span>
        </div>
      </div>
    </div>
  );
};