import { useQuery } from "@tanstack/react-query";
import { useRef, useEffect, useState } from "react";
import BackButton from "@/components/layout/BackButton";
import StatsCards from "@/components/journal/StatsCards";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format, subDays, eachDayOfInterval, subMonths } from "date-fns";
import { JournalStats } from "@/types/journal";
import * as d3 from "d3-cloud";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Word cloud word type definition
interface WordCloudWord {
  text: string;
  value: number;
  color?: string;
}

// Emotion timeline data point
interface EmotionPoint {
  date: string;
  happy: number;
  sad: number;
  neutral: number;
  motivated: number;
  stressed: number;
}

const Stats = () => {
  const wordCloudRef = useRef<HTMLDivElement>(null);
  const [wordCloudWords, setWordCloudWords] = useState<WordCloudWord[]>([]);
  const [emotionTimelineData, setEmotionTimelineData] = useState<EmotionPoint[]>([]);
  
  // Fetch journal stats
  const { data: stats, isLoading: statsLoading } = useQuery<JournalStats>({
    queryKey: ["/api/stats"],
  });
  
  // Fetch all journal entries
  interface JournalEntry {
    id: number;
    content: string;
    date: string;
    moods: string[];
    [key: string]: any;
  }
  
  const { data: entries = [], isLoading: entriesLoading } = useQuery<JournalEntry[]>({
    queryKey: ["/api/entries"],
  });
  
  // Process mood data for pie chart
  const moodData = !statsLoading && stats?.topMoods 
    ? Object.entries(stats.topMoods)
        .map(([name, count]) => ({ name, value: count }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5)
    : [];
  
  // Custom colors for mood chart and word cloud
  const MOOD_COLORS = ['#546e7a', '#78909c', '#a7c0cd', '#4db6ac', '#80cbc4'];
  const EMOTION_COLORS = {
    happy: '#10b981', // green-500
    neutral: '#3b82f6', // blue-500
    sad: '#ef4444', // red-500
    stressed: '#f97316', // orange-500
    motivated: '#8b5cf6', // purple-500
  };
  
  // Process daily entries for last 14 days
  const last14Days = eachDayOfInterval({
    start: subDays(new Date(), 13),
    end: new Date()
  });
  
  const activityData = last14Days.map(date => {
    const dateString = format(date, 'yyyy-MM-dd');
    const count = entries.filter((entry: JournalEntry) => 
      format(new Date(entry.date), 'yyyy-MM-dd') === dateString
    ).length;
    
    return {
      date: format(date, 'MMM d'),
      count
    };
  });
  
  // Process content to generate word cloud data
  useEffect(() => {
    if (!entriesLoading && entries.length > 0) {
      // Combine all journal content
      let allContent = entries.map((entry: JournalEntry) => entry.content || '').join(' ');
      
      // Process content to get word frequencies
      const words = allContent.toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .split(/\s+/)
        .filter((word: string) => 
          word.length > 3 && 
          !['this', 'that', 'then', 'than', 'with', 'would', 'could', 'should', 'there', 'their', 'they', 'about', 'from'].includes(word)
        );
      
      const wordCounts: Record<string, number> = {};
      words.forEach((word: string) => {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      });
      
      // Convert to word cloud format
      const cloudWords = Object.entries(wordCounts)
        .filter(([_, count]) => count > 1) // Only include words that appear more than once
        .map(([text, value]) => ({
          text,
          value,
          color: MOOD_COLORS[Math.floor(Math.random() * MOOD_COLORS.length)]
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 40); // Limit to top 40 words
      
      setWordCloudWords(cloudWords);
    }
  }, [entries, entriesLoading]);
  
  // Generate emotion timeline data (simulated for now)
  useEffect(() => {
    // Generate sample data for the past 30 days
    const last30Days = eachDayOfInterval({
      start: subDays(new Date(), 29),
      end: new Date()
    });
    
    // Sample data - in a real app this would come from actual entries
    const timelineData = last30Days.map((date, index) => {
      // Create sample emotions with some patterns
      // In reality this would be calculated from real user data
      return {
        date: format(date, 'MMM d'),
        happy: Math.max(0, Math.round(2 + Math.sin(index / 3) * 2 + Math.random() * 2)),
        sad: Math.max(0, Math.round(1 + Math.cos(index / 4) * 1.5 + Math.random() * 1.5)),
        neutral: Math.max(0, Math.round(3 + Math.sin(index / 5 + 2) * 2 + Math.random())),
        motivated: Math.max(0, Math.round(1 + Math.sin(index / 3.5) * 2.5 + Math.random() * 1.5)),
        stressed: Math.max(0, Math.round(2 + Math.cos(index / 4.5 + 1) * 2 + Math.random() * 1.5)),
      };
    });
    
    setEmotionTimelineData(timelineData);
  }, []);
  
  return (
    <div className="flex flex-col">
      <div className="w-full p-6 md:p-8 lg:p-12 overflow-y-auto" style={{ maxHeight: "calc(100vh - 136px)" }}>
        {/* Stats Header */}
        <div className="flex items-start gap-3 mb-8">
          <BackButton className="mt-1" />
          <div>
            <h1 className="font-header text-3xl font-bold text-primary">Journal Statistics</h1>
            <p className="text-muted-foreground">Track your journaling progress and patterns</p>
          </div>
        </div>
        
        {/* Stats Cards */}
        <StatsCards stats={stats} isLoading={statsLoading} />
        
        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
          {/* Mood Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="font-header">Mood Distribution</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              {statsLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <p>Loading mood data...</p>
                </div>
              ) : moodData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={moodData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {moodData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={MOOD_COLORS[index % MOOD_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${value} entries`, 'Count']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-center">
                  <p>No mood data yet. Start adding moods to your journal entries!</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Journal Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="font-header">Journal Activity (Last 14 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              {entriesLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <p>Loading activity data...</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={activityData}
                    margin={{
                      top: 5,
                      right: 20,
                      left: 0,
                      bottom: 25,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      angle={-45} 
                      textAnchor="end"
                      height={60}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis allowDecimals={false} />
                    <Tooltip
                      formatter={(value) => [`${value} entries`, 'Count']}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Bar 
                      dataKey="count" 
                      fill="#546e7a" 
                      name="Entries"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Advanced Analytics Section */}
        <div className="mt-10">
          <Card>
            <CardHeader>
              <CardTitle className="font-header">Advanced Analytics</CardTitle>
              <CardDescription>Discover deeper patterns in your journaling data</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="wordcloud" className="w-full">
                <TabsList className="mb-4 grid grid-cols-2 w-full max-w-md mx-auto">
                  <TabsTrigger value="wordcloud" className="text-sm">Word Cloud</TabsTrigger>
                  <TabsTrigger value="timeline" className="text-sm">Emotion Timeline</TabsTrigger>
                </TabsList>
                
                {/* Word Cloud Tab */}
                <TabsContent value="wordcloud" className="pt-4 min-h-[300px]">
                  <div className="flex flex-col items-center mb-4">
                    <h3 className="text-lg font-medium mb-1">Your Most Common Words</h3>
                    <p className="text-sm text-muted-foreground text-center max-w-md">
                      This visualization shows the words you use most frequently in your journal entries.
                    </p>
                  </div>
                  
                  {entriesLoading ? (
                    <div className="h-[300px] flex items-center justify-center">
                      <p>Loading word data...</p>
                    </div>
                  ) : wordCloudWords.length > 0 ? (
                    <div className="border border-border/30 rounded-md p-4 min-h-[300px] relative bg-card/50 flex flex-wrap justify-center gap-4 content-center">
                      {wordCloudWords.map((word, i) => {
                        // Calculate font size based on value (frequency)
                        const minSize = 12;
                        const maxSize = 38;
                        const fontSize = minSize + ((word.value / Math.max(...wordCloudWords.map(w => w.value))) * (maxSize - minSize));
                        
                        return (
                          <div 
                            key={i}
                            className="inline-block px-1 py-0.5 transition-transform hover:scale-110"
                            style={{ 
                              fontSize: `${fontSize}px`,
                              color: word.color,
                              fontWeight: fontSize > 22 ? 'bold' : 'normal'
                            }}
                          >
                            {word.text}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-center p-4 border border-border/20 rounded-md bg-muted/10">
                      <p>No word data available yet. Continue writing in your journal to see what words you use most frequently.</p>
                    </div>
                  )}
                </TabsContent>
                
                {/* Emotion Timeline Tab */}
                <TabsContent value="timeline" className="pt-4 min-h-[300px]">
                  <div className="flex flex-col items-center mb-4">
                    <h3 className="text-lg font-medium mb-1">Emotion Growth Timeline</h3>
                    <p className="text-sm text-muted-foreground text-center max-w-md">
                      Track how your emotions evolve over time as you continue your journaling practice.
                    </p>
                  </div>
                  
                  {emotionTimelineData.length > 0 ? (
                    <div className="h-[350px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={emotionTimelineData}
                          margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                          <XAxis 
                            dataKey="date" 
                            height={60}
                            tick={{ fontSize: 11 }}
                            tickFormatter={(value, index) => index % 3 === 0 ? value : ''}
                          />
                          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                          <Tooltip 
                            contentStyle={{ 
                              background: 'var(--background)', 
                              border: '1px solid var(--border)',
                              borderRadius: '6px',
                              fontSize: '12px'
                            }}
                          />
                          <Legend verticalAlign="top" height={36} />
                          <Line 
                            type="monotone" 
                            dataKey="happy" 
                            name="Happy" 
                            stroke={EMOTION_COLORS.happy} 
                            activeDot={{ r: 6 }} 
                            strokeWidth={2}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="neutral" 
                            name="Neutral" 
                            stroke={EMOTION_COLORS.neutral} 
                            activeDot={{ r: 6 }} 
                            strokeWidth={2}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="sad" 
                            name="Sad" 
                            stroke={EMOTION_COLORS.sad} 
                            activeDot={{ r: 6 }} 
                            strokeWidth={2}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="motivated" 
                            name="Motivated" 
                            stroke={EMOTION_COLORS.motivated} 
                            activeDot={{ r: 6 }} 
                            strokeWidth={2}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="stressed" 
                            name="Stressed" 
                            stroke={EMOTION_COLORS.stressed} 
                            activeDot={{ r: 6 }} 
                            strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center">
                      <p>Loading emotion timeline data...</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        {/* Journaling Insights */}
        <div className="mt-10">
          <Card>
            <CardHeader>
              <CardTitle className="font-header">Journaling Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p>Regular journaling has been shown to improve mental health, reduce stress, and increase self-awareness. Here are some insights from your journaling practice:</p>
                
                <ul>
                  {!statsLoading && stats ? (
                    <>
                      <li>You've written {stats.entriesCount} journal entries so far.</li>
                      <li>Your current journaling streak is {stats.currentStreak} days.</li>
                      <li>Your longest streak was {stats.longestStreak} days.</li>
                      {stats.topMoods && Object.keys(stats.topMoods).length > 0 && (
                        <li>Your most frequent mood is "{Object.entries(stats.topMoods).sort((a, b) => b[1] - a[1])[0][0]}".</li>
                      )}
                    </>
                  ) : (
                    <li>Loading your personalized insights...</li>
                  )}
                </ul>
                
                <p>To get more insights, continue your journaling practice and add moods to your entries.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Stats;
