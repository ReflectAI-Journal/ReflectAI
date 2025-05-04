import React, { useMemo, useState } from 'react';
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
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Scatter,
  ScatterChart,
  ZAxis
} from 'recharts';
import { useTheme } from 'next-themes';
import { format, subDays, startOfDay, differenceInDays, addDays, isBefore } from 'date-fns';
import { Goal, GoalActivity } from '@shared/schema';
import { Clock, BarChart2, Calendar, PieChart as PieChartIcon, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TimeTrackingChartProps {
  activities: GoalActivity[];
  goal?: Goal;
  days?: number;
}

// Time range options for filtering
const TIME_RANGES = [
  { label: '7 Days', value: 7 },
  { label: '14 Days', value: 14 },
  { label: '30 Days', value: 30 },
  { label: 'All Time', value: 90 }
];

// Day of week mapping
const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Color constants
const COLORS = ['#0062ff', '#8c5aff', '#00c8c8', '#ff6b6b', '#ffa502', '#2ed573'];

export const TimeTrackingChart: React.FC<TimeTrackingChartProps> = ({ 
  activities, 
  goal,
  days: initialDays = 14 
}) => {
  const [selectedRange, setSelectedRange] = useState<number>(initialDays);
  const [chartType, setChartType] = useState<string>('area');
  
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const textColor = isDark ? '#e2e8f0' : '#1e293b';
  const gridColor = isDark ? '#334155' : '#e2e8f0';
  
  // Generate daily data points for the past N days
  const chartData = useMemo(() => {
    const today = startOfDay(new Date());
    const data = [];
    
    // Create an array of the last N days
    for (let i = selectedRange - 1; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(date, 'MMM dd');
      const dayOfWeek = DAYS_OF_WEEK[date.getDay()];
      
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
        day: dayOfWeek,
        minutes: minutesSpent,
        hours: parseFloat((minutesSpent / 60).toFixed(1)),
        progress: progressIncrement,
        count: dayActivities.length,
        timestamp: date.getTime()
      });
    }
    
    return data;
  }, [activities, selectedRange]);
  
  // Get weekly aggregated data for radar chart
  const weeklyData = useMemo(() => {
    const dayTotals = [0, 0, 0, 0, 0, 0, 0]; // Sun to Sat
    
    activities.forEach(activity => {
      const date = new Date(activity.date);
      const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
      dayTotals[dayOfWeek] += activity.minutesSpent || 0;
    });
    
    return DAYS_OF_WEEK.map((day, index) => ({
      day,
      hours: parseFloat((dayTotals[index] / 60).toFixed(1))
    }));
  }, [activities]);
  
  // Get distribution data for pie chart
  const distributionData = useMemo(() => {
    // Group by activity description (first word as category)
    const categories: Record<string, number> = {};
    
    activities.forEach(activity => {
      if (!activity.description) return;
      
      // Get first word or use "Other"
      const firstWord = activity.description.split(' ')[0] || 'Other';
      const category = firstWord.length > 3 ? firstWord : 'Other';
      
      if (!categories[category]) {
        categories[category] = 0;
      }
      
      categories[category] += activity.minutesSpent || 0;
    });
    
    // Convert to array of {name, value} for recharts
    return Object.entries(categories).map(([name, minutes]) => ({
      name,
      value: parseFloat((minutes / 60).toFixed(1)) // Convert to hours
    }));
  }, [activities]);
  
  const hasData = chartData.some(day => day.minutes > 0);
  
  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] bg-muted/20 rounded-md text-muted-foreground space-y-4">
        <div className="text-5xl opacity-20">📊</div>
        <div>No activity data recorded yet</div>
        <div className="text-sm">Log your first activity to see your progress over time</div>
      </div>
    );
  }
  
  // Get maximum value for better scale
  const maxHours = Math.max(...chartData.map(day => day.hours));
  
  // Calculate total stats
  const totalHours = parseFloat(activities.reduce((total, activity) => 
    total + ((activity.minutesSpent || 0) / 60), 0).toFixed(1));
  
  const totalActivities = activities.length;
  
  const averageTimePerDay = parseFloat((totalHours / (selectedRange === 90 ? 
    differenceInDays(new Date(), new Date(Math.min(...activities.map(a => new Date(a.date).getTime())))) + 1 : 
    selectedRange)).toFixed(1));
  
  // Custom tooltip for charts
  const customTooltip = (style: any = {}) => ({
    contentStyle: {
      backgroundColor: isDark ? '#1e293b' : '#ffffff',
      borderColor: isDark ? '#334155' : '#e2e8f0',
      color: textColor,
      ...style
    }
  });

  return (
    <div className="space-y-6">
      {/* Key Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-primary/5 border-primary/10">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Clock className="h-5 w-5 text-primary mb-1 mt-1" />
            <div className="text-2xl font-bold gradient-text mt-1">{totalHours}</div>
            <div className="text-xs text-muted-foreground">Total Hours</div>
          </CardContent>
        </Card>
        
        <Card className="bg-secondary/5 border-secondary/10">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Activity className="h-5 w-5 text-secondary mb-1 mt-1" />
            <div className="text-2xl font-bold" style={{
              background: 'linear-gradient(to right, #8c5aff, #00c8c8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>{totalActivities}</div>
            <div className="text-xs text-muted-foreground">Activities</div>
          </CardContent>
        </Card>
        
        <Card className="bg-primary/5 border-primary/10">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Calendar className="h-5 w-5 text-primary mb-1 mt-1" />
            <div className="text-2xl font-bold gradient-text mt-1">{averageTimePerDay || 0}</div>
            <div className="text-xs text-muted-foreground">Avg Hours/Day</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Time range selector */}
      <div className="flex justify-between items-center">
        <div className="text-sm font-medium">Time Range</div>
        <div className="flex space-x-2">
          {TIME_RANGES.map(range => (
            <Button 
              key={range.value} 
              size="sm"
              variant={selectedRange === range.value ? "default" : "outline"}
              onClick={() => setSelectedRange(range.value)}
              className={selectedRange === range.value ? "bg-primary hover:bg-primary/90" : ""}
            >
              {range.label}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Charts */}
      <Card className="overflow-hidden border-primary/10">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-medium">Time Tracking Visualization</CardTitle>
            <div className="flex items-center space-x-1">
              <Button
                size="sm"
                variant={chartType === 'area' ? "default" : "outline"}
                onClick={() => setChartType('area')}
                className="h-8 px-2 flex items-center gap-1"
              >
                <Activity className="h-3.5 w-3.5" />
                <span className="text-xs">Trend</span>
              </Button>
              <Button
                size="sm"
                variant={chartType === 'radar' ? "default" : "outline"}
                onClick={() => setChartType('radar')}
                className="h-8 px-2 flex items-center gap-1"
              >
                <Activity className="h-3.5 w-3.5" />
                <span className="text-xs">Weekly</span>
              </Button>
              <Button
                size="sm"
                variant={chartType === 'pie' ? "default" : "outline"}
                onClick={() => setChartType('pie')}
                className="h-8 px-2 flex items-center gap-1"
              >
                <PieChartIcon className="h-3.5 w-3.5" />
                <span className="text-xs">Distribution</span>
              </Button>
            </div>
          </div>
          <CardDescription className="text-xs">
            {chartType === 'area' && 'View your time investment trend over the selected period'}
            {chartType === 'radar' && 'See which days of the week you are most active'}
            {chartType === 'pie' && 'Analyze how your time is distributed across activities'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="h-[350px] w-full">
            {chartType === 'area' && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
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
                      value: 'Hours', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { fill: textColor, textAnchor: 'middle' }
                    }}
                    domain={[0, Math.max(Math.ceil(maxHours) + 0.5, 1)]}
                  />
                  <Tooltip
                    {...customTooltip()}
                    formatter={(value, name) => [
                      name === 'Hours' ? `${value} hours` : value,
                      name
                    ]}
                  />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="hours"
                    name="Hours"
                    stroke="#0062ff"
                    fill="url(#colorHours)"
                    activeDot={{ r: 8, strokeWidth: 1, stroke: '#fff' }}
                  />
                  <defs>
                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0062ff" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#0062ff" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            )}
            
            {chartType === 'radar' && (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius="70%" data={weeklyData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                  <PolarGrid stroke={gridColor} />
                  <PolarAngleAxis 
                    dataKey="day" 
                    tick={{ fill: textColor }}
                  />
                  <PolarRadiusAxis angle={90} domain={[0, 'auto']} tick={{ fill: textColor }} />
                  <Radar
                    name="Hours per Day of Week"
                    dataKey="hours"
                    stroke="#0062ff"
                    fill="#0062ff"
                    fillOpacity={0.5}
                  />
                  <Tooltip 
                    {...customTooltip()}
                    formatter={(value) => [`${value} hours`, 'Time Spent']}
                  />
                </RadarChart>
              </ResponsiveContainer>
            )}
            
            {chartType === 'pie' && distributionData.length > 0 && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    label={({name, value, percent}) => `${name}: ${value}h (${(percent * 100).toFixed(0)}%)`}
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    {...customTooltip()}
                    formatter={(value) => [`${value} hours`, 'Time Spent']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
            
            {chartType === 'pie' && distributionData.length === 0 && (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No category data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};