import React, { useMemo, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { JournalEntry } from '@/types/journal';
import { format, subDays, isAfter, parseISO } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Enhanced mood color mapping with gradients and dark mode compatibility
const moodColors: Record<string, { color: string, gradient: string, darkGradient: string }> = {
  'Happy': {
    color: '#4ade80', // green
    gradient: 'linear-gradient(135deg, #4ade80, #22c55e)',
    darkGradient: 'linear-gradient(135deg, #4ade80, #16a34a)'
  },
  'Joyful': {
    color: '#22c55e', // green-600
    gradient: 'linear-gradient(135deg, #22c55e, #16a34a)',
    darkGradient: 'linear-gradient(135deg, #22c55e, #15803d)'
  },
  'Excited': {
    color: '#f97316', // orange-500
    gradient: 'linear-gradient(135deg, #fb923c, #f97316)',
    darkGradient: 'linear-gradient(135deg, #f97316, #ea580c)'
  },
  'Content': {
    color: '#14b8a6', // teal-500
    gradient: 'linear-gradient(135deg, #2dd4bf, #14b8a6)',
    darkGradient: 'linear-gradient(135deg, #14b8a6, #0f766e)'
  },
  'Peaceful': {
    color: '#0ea5e9', // sky-500
    gradient: 'linear-gradient(135deg, #38bdf8, #0ea5e9)',
    darkGradient: 'linear-gradient(135deg, #0ea5e9, #0284c7)'
  },
  'Calm': {
    color: '#3b82f6', // blue-500
    gradient: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
    darkGradient: 'linear-gradient(135deg, #3b82f6, #2563eb)'
  },
  'Neutral': {
    color: '#a1a1aa', // zinc-400
    gradient: 'linear-gradient(135deg, #d4d4d8, #a1a1aa)',
    darkGradient: 'linear-gradient(135deg, #a1a1aa, #71717a)'
  },
  'Bored': {
    color: '#9ca3af', // gray-400
    gradient: 'linear-gradient(135deg, #d1d5db, #9ca3af)',
    darkGradient: 'linear-gradient(135deg, #9ca3af, #6b7280)'
  },
  'Tired': {
    color: '#64748b', // slate-500
    gradient: 'linear-gradient(135deg, #94a3b8, #64748b)',
    darkGradient: 'linear-gradient(135deg, #64748b, #475569)'
  },
  'Sad': {
    color: '#6366f1', // indigo-500
    gradient: 'linear-gradient(135deg, #818cf8, #6366f1)',
    darkGradient: 'linear-gradient(135deg, #6366f1, #4f46e5)'
  },
  'Anxious': {
    color: '#a855f7', // purple-500
    gradient: 'linear-gradient(135deg, #c084fc, #a855f7)',
    darkGradient: 'linear-gradient(135deg, #a855f7, #9333ea)'
  },
  'Stressed': {
    color: '#d946ef', // fuchsia-500
    gradient: 'linear-gradient(135deg, #e879f9, #d946ef)',
    darkGradient: 'linear-gradient(135deg, #d946ef, #c026d3)'
  },
  'Angry': {
    color: '#ef4444', // red-500
    gradient: 'linear-gradient(135deg, #f87171, #ef4444)',
    darkGradient: 'linear-gradient(135deg, #ef4444, #dc2626)'
  },
  'Frustrated': {
    color: '#f43f5e', // rose-500
    gradient: 'linear-gradient(135deg, #fb7185, #f43f5e)',
    darkGradient: 'linear-gradient(135deg, #f43f5e, #e11d48)'
  },
  'Depressed': {
    color: '#8b5cf6', // violet-500
    gradient: 'linear-gradient(135deg, #a78bfa, #8b5cf6)',
    darkGradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
  },
  // Added more positive moods
  'Grateful': {
    color: '#10b981', // emerald-500
    gradient: 'linear-gradient(135deg, #34d399, #10b981)',
    darkGradient: 'linear-gradient(135deg, #10b981, #059669)'
  },
  'Inspired': {
    color: '#8b5cf6', // violet-500
    gradient: 'linear-gradient(135deg, #c4b5fd, #8b5cf6)',
    darkGradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
  },
  'Motivated': {
    color: '#f59e0b', // amber-500
    gradient: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
    darkGradient: 'linear-gradient(135deg, #f59e0b, #d97706)'
  },
  'Confident': {
    color: '#ec4899', // pink-500
    gradient: 'linear-gradient(135deg, #f472b6, #ec4899)',
    darkGradient: 'linear-gradient(135deg, #ec4899, #db2777)'
  },
  'Hopeful': {
    color: '#06b6d4', // cyan-500
    gradient: 'linear-gradient(135deg, #22d3ee, #06b6d4)',
    darkGradient: 'linear-gradient(135deg, #06b6d4, #0891b2)'
  }
};

// Default mood colors for any new/unmatched moods
const defaultMoodColor = '#94a3b8'; // slate-400
const defaultGradient = 'linear-gradient(135deg, #cbd5e1, #94a3b8)';
const defaultDarkGradient = 'linear-gradient(135deg, #94a3b8, #64748b)';

// Color array for moods not in the predefined list
const moodColorArray = [
  '#4ade80', '#f97316', '#0ea5e9', '#6366f1', '#a855f7', 
  '#ef4444', '#14b8a6', '#64748b', '#d946ef', '#f43f5e', 
  '#f59e0b', '#10b981', '#06b6d4', '#ec4899', '#8b5cf6'
];

interface MoodTrendsChartProps {
  entries: JournalEntry[];
  days?: number;
}

const TIME_RANGES = [
  { label: '7 Days', value: 7 },
  { label: '30 Days', value: 30 },
  { label: '90 Days', value: 90 },
  { label: '180 Days', value: 180 },
  { label: '365 Days', value: 365 },
];

const MoodTrendsChart: React.FC<MoodTrendsChartProps> = ({ entries = [], days: initialDays = 30 }) => {
  const [days, setDays] = useState(initialDays);
  const filteredEntries = useMemo(() => {
    const cutoffDate = subDays(new Date(), days);
    return entries.filter(entry => {
      const entryDate = typeof entry.date === 'string' ? parseISO(entry.date) : entry.date;
      return isAfter(entryDate, cutoffDate);
    }).sort((a, b) => {
      const dateA = typeof a.date === 'string' ? new Date(a.date).getTime() : a.date.getTime();
      const dateB = typeof b.date === 'string' ? new Date(b.date).getTime() : b.date.getTime();
      return dateA - dateB;
    });
  }, [entries, days]);

  // Count moods over time (for Line and Bar charts)
  const moodTrendsData = useMemo(() => {
    const moodCounts: Record<string, Record<string, number>> = {};
    
    // Initialize with dates for the past X days
    for (let i = 0; i < days; i++) {
      const date = subDays(new Date(), days - i - 1);
      const formattedDate = format(date, 'yyyy-MM-dd');
      moodCounts[formattedDate] = {};
    }
    
    // Count moods by date
    filteredEntries.forEach(entry => {
      const entryDate = typeof entry.date === 'string' ? entry.date : format(entry.date, 'yyyy-MM-dd');
      const formattedDate = entryDate.split('T')[0]; // Handle ISO format
      
      if (!moodCounts[formattedDate]) {
        moodCounts[formattedDate] = {};
      }
      
      (entry.moods || []).forEach(mood => {
        moodCounts[formattedDate][mood] = (moodCounts[formattedDate][mood] || 0) + 1;
      });
    });
    
    // Convert to array format for recharts
    const result = Object.keys(moodCounts).map(date => {
      return {
        date,
        ...moodCounts[date]
      };
    });
    
    return result;
  }, [filteredEntries, days]);

  // Aggregate mood totals (for Pie chart)
  const totalMoodCounts = useMemo(() => {
    const moodTotals: Record<string, number> = {};
    
    filteredEntries.forEach(entry => {
      (entry.moods || []).forEach(mood => {
        moodTotals[mood] = (moodTotals[mood] || 0) + 1;
      });
    });
    
    return Object.keys(moodTotals)
      .map(mood => ({ name: mood, value: moodTotals[mood] }))
      .sort((a, b) => b.value - a.value);
  }, [filteredEntries]);
  
  // Get all unique moods for radar chart
  const allMoods = useMemo(() => {
    const moods = new Set<string>();
    filteredEntries.forEach(entry => {
      (entry.moods || []).forEach(mood => moods.add(mood));
    });
    return Array.from(moods);
  }, [filteredEntries]);
  
  // Prepare radar chart data
  const radarData = useMemo(() => {
    // Group entries by week (last 4 weeks)
    const weeks: { name: string, startDate: Date, endDate: Date }[] = [];
    
    // Calculate the starting points for the last 4 weeks
    for (let i = 0; i < 4; i++) {
      const endDate = subDays(new Date(), i * 7);
      const startDate = subDays(endDate, 6);
      weeks.push({
        name: `Week ${4 - i}`,
        startDate,
        endDate
      });
    }
    
    // Count moods by week
    const weeklyMoods = weeks.map(week => {
      // Initialize with week name as a string (not a number)
      const weekMoods: Record<string, string | number> = { name: week.name };
      
      // Filter entries for this week
      const weekEntries = filteredEntries.filter(entry => {
        const entryDate = typeof entry.date === 'string' ? new Date(entry.date) : entry.date;
        return isAfter(entryDate, week.startDate) && !isAfter(entryDate, week.endDate);
      });
      
      // Initialize all moods with 0
      allMoods.forEach(mood => {
        weekMoods[mood] = 0;
      });
      
      // Count moods
      weekEntries.forEach(entry => {
        (entry.moods || []).forEach(mood => {
          const currentCount = weekMoods[mood] as number;
          weekMoods[mood] = currentCount + 1;
        });
      });
      
      return weekMoods;
    });
    
    return weeklyMoods;
  }, [filteredEntries, allMoods]);

  // No data message
  if (filteredEntries.length === 0) {
    return (
      <Card className="w-full shadow-sm">
        <CardHeader>
          <CardTitle>Mood Trends</CardTitle>
          <CardDescription>Track your emotional patterns over time</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[300px]">
          <p className="text-muted-foreground text-center">
            No journal entries found in the past {days} days.<br />
            Write regularly to see your mood patterns!
          </p>
        </CardContent>
      </Card>
    );
  }

  // Get dynamic line colors and gradients for each mood with dark mode support
  const getMoodColor = (mood: string) => {
    return moodColors[mood]?.color || defaultMoodColor;
  };
  
  // Get mood gradient background for chart components
  const getMoodGradient = (mood: string, isDark = false) => {
    if (moodColors[mood]) {
      return isDark ? moodColors[mood].darkGradient : moodColors[mood].gradient;
    }
    return isDark ? defaultDarkGradient : defaultGradient;
  };

  return (
    <Card className="w-full shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Mood Trends</CardTitle>
            <CardDescription>Track your emotional patterns over time</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Time range:</span>
            <select 
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              className="text-sm rounded-md border border-input bg-background px-3 py-1 shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {TIME_RANGES.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="line">
          <TabsList className="mb-6">
            <TabsTrigger value="line">Timeline</TabsTrigger>
            <TabsTrigger value="pie">Distribution</TabsTrigger>
            <TabsTrigger value="radar">Weekly Patterns</TabsTrigger>
          </TabsList>
          
          <TabsContent value="line" className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={moodTrendsData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <defs>
                  {/* Create gradient definitions for each mood */}
                  {allMoods.map((mood) => (
                    <linearGradient key={`gradient-${mood}`} id={`color-${mood}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={getMoodColor(mood)} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={getMoodColor(mood)} stopOpacity={0.2}/>
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => format(new Date(value), 'MMM d')} 
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  labelFormatter={(value) => format(new Date(value), 'MMM d, yyyy')}
                  contentStyle={{ 
                    borderRadius: '8px', 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    borderColor: 'rgba(226, 232, 240, 0.6)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }}
                  wrapperStyle={{ zIndex: 10 }}
                  cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '3 3' }}
                />
                <Legend 
                  verticalAlign="bottom"
                  wrapperStyle={{ paddingTop: 20 }}
                  iconType="circle"
                  iconSize={10}
                />
                {allMoods.map((mood, i) => (
                  <Line 
                    key={mood}
                    type="monotone" 
                    dataKey={mood} 
                    name={mood}
                    stroke={getMoodColor(mood)} 
                    strokeWidth={2.5}
                    dot={{ 
                      r: 3, 
                      fill: getMoodColor(mood), 
                      strokeWidth: 1, 
                      stroke: '#fff' 
                    }}
                    activeDot={{ 
                      r: 7,
                      fill: getMoodColor(mood),
                      stroke: '#fff',
                      strokeWidth: 2
                    }}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="pie" className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  {totalMoodCounts.map((entry, index) => (
                    <linearGradient key={`grad-${index}`} id={`pieGrad-${entry.name}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={getMoodColor(entry.name)} stopOpacity={1}/>
                      <stop offset="100%" stopColor={getMoodColor(entry.name)} stopOpacity={0.7}/>
                    </linearGradient>
                  ))}
                </defs>
                <Pie
                  data={totalMoodCounts}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  fill="#8884d8"
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={{ stroke: 'rgba(160, 160, 160, 0.5)', strokeWidth: 1 }}
                >
                  {totalMoodCounts.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={`url(#pieGrad-${entry.name})`}
                      stroke="rgba(255, 255, 255, 0.3)"
                      strokeWidth={1}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [`${value} occurrences`, name]}
                  contentStyle={{ 
                    borderRadius: '8px', 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    borderColor: 'rgba(226, 232, 240, 0.6)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }}
                  wrapperStyle={{ zIndex: 10 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="radar" className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart 
                cx="50%" 
                cy="50%" 
                outerRadius="80%" 
                data={radarData}
              >
                <defs>
                  {allMoods.map((mood) => (
                    <linearGradient key={`grad-radar-${mood}`} id={`radarGrad-${mood}`} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor={getMoodColor(mood)} stopOpacity={0.7}/>
                      <stop offset="100%" stopColor={getMoodColor(mood)} stopOpacity={0.3}/>
                    </linearGradient>
                  ))}
                </defs>
                <PolarGrid stroke="rgba(160, 160, 160, 0.3)" />
                <PolarAngleAxis dataKey="name" tick={{ fill: '#A0AEC0', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{ fill: '#A0AEC0' }} />
                {allMoods.map((mood) => (
                  <Radar 
                    key={mood}
                    name={mood} 
                    dataKey={mood} 
                    stroke={getMoodColor(mood)} 
                    fill={`url(#radarGrad-${mood})`}
                    fillOpacity={0.7}
                  />
                ))}
                <Legend
                  verticalAlign="bottom"
                  wrapperStyle={{ paddingTop: 20 }}
                  iconType="circle"
                  iconSize={10}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '8px', 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    borderColor: 'rgba(226, 232, 240, 0.6)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }}
                  wrapperStyle={{ zIndex: 10 }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default MoodTrendsChart;