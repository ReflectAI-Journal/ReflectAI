import React, { useMemo } from 'react';
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

// Map mood to colors
const moodColors: Record<string, string> = {
  'Happy': '#4ade80', // green
  'Joyful': '#22c55e', // green-600  
  'Excited': '#f97316', // orange-500
  'Content': '#14b8a6', // teal-500
  'Peaceful': '#0ea5e9', // sky-500
  'Calm': '#3b82f6', // blue-500
  'Neutral': '#a1a1aa', // zinc-400
  'Bored': '#9ca3af', // gray-400
  'Tired': '#64748b', // slate-500
  'Sad': '#6366f1', // indigo-500
  'Anxious': '#a855f7', // purple-500
  'Stressed': '#d946ef', // fuchsia-500
  'Angry': '#ef4444', // red-500
  'Frustrated': '#f43f5e', // rose-500
  'Depressed': '#8b5cf6', // violet-500
};

// Default mood colors for any new/unmatched moods
const defaultMoodColor = '#94a3b8'; // slate-400
const moodColorArray = [
  '#4ade80', '#f97316', '#0ea5e9', '#6366f1', '#a855f7', 
  '#ef4444', '#14b8a6', '#64748b', '#d946ef', '#f43f5e'
];

interface MoodTrendsChartProps {
  entries: JournalEntry[];
  days?: number;
}

const MoodTrendsChart: React.FC<MoodTrendsChartProps> = ({ entries = [], days = 30 }) => {
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
      const weekMoods: Record<string, number> = { name: week.name };
      
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
          weekMoods[mood] = (weekMoods[mood] || 0) + 1;
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

  // Get dynamic line colors for each mood
  const getMoodColor = (mood: string) => {
    return moodColors[mood] || defaultMoodColor;
  };

  return (
    <Card className="w-full shadow-sm">
      <CardHeader>
        <CardTitle>Mood Trends</CardTitle>
        <CardDescription>Track your emotional patterns over time</CardDescription>
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
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => format(new Date(value), 'MMM d')} 
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  labelFormatter={(value) => format(new Date(value), 'MMM d, yyyy')}
                  contentStyle={{ borderRadius: '8px', backgroundColor: '#ffffff', borderColor: '#e2e8f0' }}
                />
                <Legend />
                {allMoods.map((mood, i) => (
                  <Line 
                    key={mood}
                    type="monotone" 
                    dataKey={mood} 
                    name={mood}
                    stroke={getMoodColor(mood)} 
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="pie" className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
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
                  labelLine={false}
                >
                  {totalMoodCounts.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getMoodColor(entry.name) || moodColorArray[index % moodColorArray.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [`${value} occurrences`, name]}
                  contentStyle={{ borderRadius: '8px', backgroundColor: '#ffffff', borderColor: '#e2e8f0' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="radar" className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" />
                <PolarRadiusAxis />
                {allMoods.map((mood, index) => (
                  <Radar 
                    key={mood}
                    name={mood} 
                    dataKey={mood} 
                    stroke={getMoodColor(mood)} 
                    fill={getMoodColor(mood)} 
                    fillOpacity={0.6} 
                  />
                ))}
                <Legend />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', backgroundColor: '#ffffff', borderColor: '#e2e8f0' }}
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