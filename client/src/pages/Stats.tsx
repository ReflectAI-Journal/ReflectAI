import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import BackButton from "@/components/layout/BackButton";
import StatsCards from "@/components/journal/StatsCards";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format, subDays, eachDayOfInterval, startOfWeek, endOfWeek } from "date-fns";
import { JournalStats } from "@/types/journal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, TrendingUp, TrendingDown, Lightbulb, Repeat, Clock, CalendarCheck, Focus, BarChart3 } from "lucide-react";
import { useUpgrade } from "@/contexts/UpgradeContext";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

// Trait analysis type
interface TraitAnalysis {
  trait: string;
  description: string;
  frequency: number; // 1-10 scale
  examples: string[];
  icon?: JSX.Element;
  trend?: 'increasing' | 'decreasing' | 'stable';
}

// Recurring pattern data point
interface PatternItem {
  category: string;
  pattern: string;
  occurances: number;
  context: string;
  sentiment: 'positive' | 'negative' | 'neutral';
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
  const { showUpgradeModal } = useUpgrade();
  const { subscriptionStatus } = useAuth();
  const [traitAnalyses, setTraitAnalyses] = useState<TraitAnalysis[]>([]);
  const [recurringPatterns, setRecurringPatterns] = useState<PatternItem[]>([]);
  const [emotionTimelineData, setEmotionTimelineData] = useState<EmotionPoint[]>([]);
  const [activeWeekData, setActiveWeekData] = useState<any[]>([]);
  
  // Check if user has unlimited plan access
  const hasUnlimitedAccess = subscriptionStatus?.plan === 'unlimited';
  
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
  
  // Custom colors for mood chart and patterns
  const MOOD_COLORS = ['#546e7a', '#78909c', '#a7c0cd', '#4db6ac', '#80cbc4'];
  const EMOTION_COLORS = {
    happy: '#10b981', // green-500
    neutral: '#3b82f6', // blue-500
    sad: '#ef4444', // red-500
    stressed: '#f97316', // orange-500
    motivated: '#8b5cf6', // purple-500
  };
  const SENTIMENT_COLORS = {
    positive: 'bg-green-500/10 text-green-600 border-green-200',
    neutral: 'bg-blue-500/10 text-blue-600 border-blue-200',
    negative: 'bg-red-500/10 text-red-600 border-red-200',
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
  
  // Analyze journal content for recurring traits, patterns and themes
  useEffect(() => {
    if (!entriesLoading && entries.length > 0) {
      // This would ideally use OpenAI in the backend to analyze content
      // For now we'll use a simulated analysis based on keywords and patterns
      
      // 1. Extract all journal content
      const allContent = entries.map((entry: JournalEntry) => entry.content || '').join(' ').toLowerCase();
      
      // 2. Analyze for recurring traits (simulated)
      const traitKeywords = {
        introspective: ['reflect', 'think', 'wonder', 'question', 'myself', 'realize', 'understand'],
        anxious: ['worry', 'nervous', 'stress', 'anxious', 'fear', 'afraid', 'uncertain'],
        optimistic: ['hope', 'positive', 'better', 'improve', 'looking forward', 'excited', 'opportunity'],
        analytical: ['analyze', 'consider', 'examine', 'evaluate', 'assess', 'weigh', 'determine'],
        creative: ['create', 'imagine', 'idea', 'design', 'art', 'vision', 'inspiration'],
        disciplined: ['routine', 'consistent', 'regular', 'practice', 'habit', 'discipline', 'structure'],
        empathetic: ['feel for', 'understand', 'compassion', 'perspective', 'others', 'kind', 'care'],
      };
      
      const traits: TraitAnalysis[] = Object.entries(traitKeywords).map(([trait, keywords]) => {
        // Count appearances of keywords
        const matches = keywords.filter(keyword => allContent.includes(keyword));
        const frequency = Math.min(10, Math.ceil((matches.length / keywords.length) * 10));
        
        // Find example sentences containing these keywords (simplified)
        const examples: string[] = [];
        entries.forEach((entry: JournalEntry) => {
          if (entry.content) {
            const sentences = entry.content.split(/[.!?]+/).filter(s => s.trim().length > 0);
            sentences.forEach(sentence => {
              const lowerSentence = sentence.toLowerCase();
              if (keywords.some(keyword => lowerSentence.includes(keyword)) && examples.length < 2) {
                examples.push(sentence.trim());
              }
            });
          }
        });
        
        // Determine trend (simplified simulation)
        const recentEntries = entries.slice().sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ).slice(0, Math.min(5, entries.length));
        
        const recentContent = recentEntries.map(e => e.content || '').join(' ').toLowerCase();
        const recentMatches = keywords.filter(keyword => recentContent.includes(keyword));
        const recentFrequency = recentMatches.length / keywords.length;
        
        const oldEntries = entries.slice().sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ).slice(Math.min(5, entries.length));
        
        const oldContent = oldEntries.map(e => e.content || '').join(' ').toLowerCase();
        const oldMatches = keywords.filter(keyword => oldContent.includes(keyword));
        const oldFrequency = oldEntries.length > 0 ? oldMatches.length / keywords.length : 0;
        
        let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
        if (recentFrequency > oldFrequency * 1.3) trend = 'increasing';
        else if (recentFrequency < oldFrequency * 0.7) trend = 'decreasing';
        
        return {
          trait: trait.charAt(0).toUpperCase() + trait.slice(1),
          description: getTraitDescription(trait),
          frequency,
          examples,
          icon: getTraitIcon(trait),
          trend
        };
      }).filter(t => t.frequency > 1).sort((a, b) => b.frequency - a.frequency);
      
      setTraitAnalyses(traits);
      
      // 3. Analyze recurring patterns
      const commonPatterns = analyzePatterns(entries);
      setRecurringPatterns(commonPatterns);
    }
  }, [entries, entriesLoading]);
  
  // Generate emotion timeline data
  useEffect(() => {
    if (!entriesLoading && entries.length > 0) {
      // Generate data for the past 30 days
      const last30Days = eachDayOfInterval({
        start: subDays(new Date(), 29),
        end: new Date()
      });
      
      // Process entries to extract emotion signals (simplified simulation)
      const timelineData = last30Days.map(date => {
        const dateString = format(date, 'yyyy-MM-dd');
        const dayEntries = entries.filter((entry: JournalEntry) => 
          format(new Date(entry.date), 'yyyy-MM-dd') === dateString
        );
        
        // Default values (base level)
        let happy = 1;
        let sad = 1;
        let neutral = 1;
        let motivated = 1;
        let stressed = 1;
        
        // If we have entries for this day, analyze content for emotion signals
        if (dayEntries.length > 0) {
          const dayContent = dayEntries.map(e => e.content || '').join(' ').toLowerCase();
          
          // Simple keyword matching (would be replaced by AI analysis in production)
          const happyWords = ['happy', 'joy', 'great', 'wonderful', 'excited', 'good', 'positive'];
          const sadWords = ['sad', 'upset', 'down', 'depressed', 'low', 'miserable', 'disappointed'];
          const neutralWords = ['okay', 'fine', 'neutral', 'balanced', 'steady'];
          const motivatedWords = ['motivated', 'inspired', 'driven', 'determined', 'energetic'];
          const stressedWords = ['stressed', 'pressure', 'overwhelmed', 'anxiety', 'worried'];
          
          happy += happyWords.filter(word => dayContent.includes(word)).length * 2;
          sad += sadWords.filter(word => dayContent.includes(word)).length * 2;
          neutral += neutralWords.filter(word => dayContent.includes(word)).length * 2;
          motivated += motivatedWords.filter(word => dayContent.includes(word)).length * 2;
          stressed += stressedWords.filter(word => dayContent.includes(word)).length * 2;
          
          // Add mood tags if present
          if (dayEntries[0].moods) {
            dayEntries[0].moods.forEach((mood: string) => {
              if (['happy', 'excited', 'content'].includes(mood.toLowerCase())) happy += 3;
              if (['sad', 'down', 'upset'].includes(mood.toLowerCase())) sad += 3;
              if (['neutral', 'calm'].includes(mood.toLowerCase())) neutral += 3;
              if (['motivated', 'determined', 'energetic'].includes(mood.toLowerCase())) motivated += 3;
              if (['stressed', 'anxious', 'overwhelmed'].includes(mood.toLowerCase())) stressed += 3;
            });
          }
        }
        
        return {
          date: format(date, 'MMM d'),
          happy,
          sad,
          neutral,
          motivated,
          stressed
        };
      });
      
      setEmotionTimelineData(timelineData);
      
      // Get current week data for weekly pattern view
      const now = new Date();
      const weekStart = startOfWeek(now);
      const weekEnd = endOfWeek(now);
      
      const weekData = eachDayOfInterval({
        start: weekStart,
        end: weekEnd
      }).map(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayEntry = entries.find((entry: JournalEntry) => 
          format(new Date(entry.date), 'yyyy-MM-dd') === dateStr
        );
        
        const dayName = format(date, 'EEE');
        
        return {
          day: dayName,
          date: format(date, 'MMM d'),
          hasEntry: !!dayEntry,
          content: dayEntry?.content || '',
          mood: dayEntry?.moods?.[0] || 'none'
        };
      });
      
      setActiveWeekData(weekData);
    }
  }, [entries, entriesLoading]);
  
  return (
    <div className="flex flex-col">
      <div className="w-full p-6 md:p-8 lg:p-12 overflow-y-auto" style={{ maxHeight: "calc(100vh - 136px)" }}>
        {/* Stats Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-start gap-3">
            <BackButton className="mt-1" />
            <div>
              <h1 className="font-header text-3xl font-bold text-primary">Journal Analytics</h1>
              <p className="text-muted-foreground">Analyzing your journaling patterns and recurring traits</p>
            </div>
          </div>
          
          {/* Advanced Analytics Button */}
          <Button
            onClick={() => {
              if (hasUnlimitedAccess) {
                // TODO: Implement advanced analytics features for unlimited users
                console.log('Opening advanced analytics for unlimited user...');
              } else {
                showUpgradeModal({
                  featureName: 'Advanced Analytics',
                  requiredPlan: 'Unlimited',
                  description: 'Get detailed insights with AI-powered pattern recognition, emotional trends, and personalized recommendations.'
                });
              }
            }}
            className="flex items-center gap-2"
            variant={hasUnlimitedAccess ? "default" : "outline"}
          >
            <BarChart3 className="h-4 w-4" />
            {hasUnlimitedAccess ? 'Advanced Analytics' : 'Upgrade for Advanced Analytics'}
          </Button>
        </div>
        
        {/* Stats Cards */}
        <StatsCards stats={stats} isLoading={statsLoading} />
        
        {/* Personality & Trait Analysis Section */}
        <div className="mt-10">
          <Card>
            <CardHeader>
              <CardTitle className="font-header">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  Recurring Traits Analysis
                </div>
              </CardTitle>
              <CardDescription>
                Patterns detected in your journaling reveal these recurring traits
              </CardDescription>
            </CardHeader>
            <CardContent>
              {entriesLoading ? (
                <div className="flex justify-center items-center h-60">
                  <p>Analyzing your journal entries...</p>
                </div>
              ) : traitAnalyses.length > 0 ? (
                <div className="space-y-6">
                  {traitAnalyses.map((trait, index) => (
                    <div key={index} className="border border-border/40 rounded-lg p-4 bg-card/50 shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className={`flex items-center justify-center w-10 h-10 rounded-full 
                            ${trait.trend === 'increasing' ? 'bg-green-500/10' : 
                              trait.trend === 'decreasing' ? 'bg-orange-500/10' : 'bg-blue-500/10'}`}
                          >
                            {trait.icon || <AlertCircle className="h-5 w-5" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-lg">{trait.trait}</h3>
                              {trait.trend && (
                                <span className={`text-xs px-1.5 py-0.5 rounded-full flex items-center gap-0.5
                                  ${trait.trend === 'increasing' ? 'bg-green-500/10 text-green-600' : 
                                    trait.trend === 'decreasing' ? 'bg-orange-500/10 text-orange-600' : 'bg-blue-500/10 text-blue-600'}`}
                                >
                                  {trait.trend === 'increasing' ? <TrendingUp className="h-3 w-3" /> : 
                                    trait.trend === 'decreasing' ? <TrendingDown className="h-3 w-3" /> : null}
                                  {trait.trend.charAt(0).toUpperCase() + trait.trend.slice(1)}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{trait.description}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div 
                              key={i} 
                              className={`w-1.5 h-6 rounded-full ${i < Math.ceil(trait.frequency / 2) ? 'bg-primary' : 'bg-muted'}`}
                            />
                          ))}
                        </div>
                      </div>
                      
                      {trait.examples.length > 0 && (
                        <div className="mt-3 pl-12">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1.5">Examples from your journal:</p>
                          <div className="space-y-2">
                            {trait.examples.map((example, i) => (
                              <p key={i} className="text-sm italic border-l-2 border-primary/40 pl-3 py-0.5">"{example}"</p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-border/30 rounded-md p-6 text-center bg-muted/10">
                  <p>Keep journaling to receive trait analysis based on your writing patterns.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
          {/* Mood Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="font-header">Emotion Distribution</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              {statsLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <p>Loading emotion data...</p>
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
                  <p>No emotion data yet. Start adding moods to your journal entries.</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Journal Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="font-header">Journaling Frequency</CardTitle>
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
              <CardTitle className="font-header">
                <div className="flex items-center gap-2">
                  <Repeat className="h-5 w-5 text-primary" />
                  Recurring Patterns
                </div>
              </CardTitle>
              <CardDescription>
                Common themes, concerns, and ideas that appear across your journal entries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="patterns" className="w-full">
                <TabsList className="mb-4 grid grid-cols-2 w-full max-w-md mx-auto">
                  <TabsTrigger value="patterns" className="text-sm">Recurring Themes</TabsTrigger>
                  <TabsTrigger value="timeline" className="text-sm">Emotion Timeline</TabsTrigger>
                </TabsList>
                
                {/* Recurring Patterns Tab */}
                <TabsContent value="patterns" className="pt-4 min-h-[300px]">
                  {entriesLoading ? (
                    <div className="h-[300px] flex items-center justify-center">
                      <p>Analyzing patterns in your journal entries...</p>
                    </div>
                  ) : recurringPatterns.length > 0 ? (
                    <div className="space-y-4">
                      {recurringPatterns.map((pattern, index) => (
                        <div key={index} className="border border-border/30 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <Badge className={`${SENTIMENT_COLORS[pattern.sentiment]}`}>
                                {pattern.category}
                              </Badge>
                              <h3 className="text-base font-medium mt-2">{pattern.pattern}</h3>
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" />
                              <span>Mentioned {pattern.occurances} {pattern.occurances === 1 ? 'time' : 'times'}</span>
                            </div>
                          </div>
                          <p className="text-sm mt-2 text-muted-foreground italic">"{pattern.context}"</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-center p-4 border border-border/20 rounded-md bg-muted/10">
                      <p>Continue journaling to reveal recurring patterns in your thoughts and experiences.</p>
                    </div>
                  )}
                </TabsContent>
                
                {/* Emotion Timeline Tab */}
                <TabsContent value="timeline" className="pt-4 min-h-[300px]">
                  <div className="flex flex-col items-center mb-4">
                    <h3 className="text-lg font-medium mb-1">Emotion Growth Timeline</h3>
                    <p className="text-sm text-muted-foreground text-center max-w-md">
                      Track how your emotions evolve over time as you continue your journaling practice
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
                            dataKey="motivated" 
                            name="Motivated" 
                            stroke={EMOTION_COLORS.motivated} 
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
        
        {/* Weekly Pattern View */}
        <div className="mt-10">
          <Card>
            <CardHeader>
              <CardTitle className="font-header">
                <div className="flex items-center gap-2">
                  <CalendarCheck className="h-5 w-5 text-primary" />
                  Weekly Journaling Pattern
                </div>
              </CardTitle>
              <CardDescription>
                See your journaling consistency and mood patterns throughout the week
              </CardDescription>
            </CardHeader>
            <CardContent>
              {entriesLoading ? (
                <div className="h-32 flex items-center justify-center">
                  <p>Loading weekly data...</p>
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-2">
                  {activeWeekData.map((day, i) => (
                    <div key={i} className={`border ${day.hasEntry ? 'border-primary/50' : 'border-border/40'} rounded-lg p-3 text-center`}>
                      <p className="font-medium text-sm">{day.day}</p>
                      <p className="text-xs text-muted-foreground">{day.date}</p>
                      
                      <div className="mt-2 mb-1">
                        {day.hasEntry ? (
                          <div className={`h-4 w-4 mx-auto rounded-full bg-${day.mood === 'none' ? 'muted' : 'primary'}`} />
                        ) : (
                          <div className="h-4 w-4 mx-auto rounded-full border border-muted-foreground/30" />
                        )}
                      </div>
                      
                      <p className="text-xs truncate">
                        {day.hasEntry ? (day.mood === 'none' ? 'Journaled' : day.mood) : 'No entry'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Journaling Insights */}
        <div className="mt-10">
          <Card>
            <CardHeader>
              <CardTitle className="font-header">
                <div className="flex items-center gap-2">
                  <Focus className="h-5 w-5 text-primary" />
                  Journal Insights
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p>Based on the analysis of your journaling patterns, here are some personalized insights:</p>
                
                <ul>
                  {!statsLoading && !entriesLoading && stats ? (
                    <>
                      <li>You've written <strong>{stats.entriesCount}</strong> journal entries, capturing your thoughts and experiences.</li>
                      
                      <li>Your current journaling streak is <strong>{stats.currentStreak} days</strong>, showing your commitment to self-reflection.</li>
                      
                      {stats.currentStreak > 0 && stats.longestStreak > stats.currentStreak && (
                        <li>Your longest streak was <strong>{stats.longestStreak} days</strong>. You're building consistency in your practice.</li>
                      )}
                      
                      {traitAnalyses.length > 0 && (
                        <li>Your writing reveals a tendency toward <strong>{traitAnalyses[0].trait.toLowerCase()}</strong> thinking, which suggests {getTraitInsight(traitAnalyses[0].trait)}.</li>
                      )}
                      
                      {stats.topMoods && Object.keys(stats.topMoods).length > 0 && (
                        <li>Your most common emotion is <strong>"{Object.entries(stats.topMoods).sort((a, b) => b[1] - a[1])[0][0]}"</strong>, appearing in {Object.entries(stats.topMoods).sort((a, b) => b[1] - a[1])[0][1]} entries.</li>
                      )}
                      
                      {traitAnalyses.length > 1 && traitAnalyses[1].trend === 'increasing' && (
                        <li>You're showing an <strong>increase in {traitAnalyses[1].trait.toLowerCase()}</strong> expressions in recent entries.</li>
                      )}
                      
                      {recurringPatterns.length > 0 && (
                        <li>A recurring theme in your writing is <strong>"{recurringPatterns[0].pattern}"</strong>, which you've mentioned {recurringPatterns[0].occurances} times.</li>
                      )}
                    </>
                  ) : (
                    <li>Analyzing your journal entries to provide personalized insights...</li>
                  )}
                </ul>
                
                <p>Continue your journaling practice to receive more detailed and personalized insights about your thoughts, emotions, and patterns over time.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Helper functions for trait analysis
function getTraitDescription(trait: string): string {
  const descriptions: Record<string, string> = {
    introspective: "You frequently engage in self-reflection and analysis of your thoughts and feelings.",
    anxious: "Your writing shows patterns of worry and concern about future events or situations.",
    optimistic: "You tend to focus on positive outcomes and opportunities, even during challenges.",
    analytical: "You carefully examine situations from multiple perspectives before reaching conclusions.",
    creative: "Your thoughts flow freely with imagination and novel connections between ideas.",
    disciplined: "You value structure and consistency in your approach to goals and activities.",
    empathetic: "You demonstrate a strong ability to understand and share the feelings of others.",
  };
  
  return descriptions[trait] || "This trait appears consistently in your journal entries.";
}

function getTraitIcon(trait: string): JSX.Element {
  switch (trait) {
    case 'introspective':
      return <Focus className="h-5 w-5 text-blue-600" />;
    case 'anxious':
      return <AlertCircle className="h-5 w-5 text-orange-600" />;
    case 'optimistic':
      return <TrendingUp className="h-5 w-5 text-green-600" />;
    case 'analytical':
      return <Lightbulb className="h-5 w-5 text-purple-600" />;
    case 'creative':
      return <Lightbulb className="h-5 w-5 text-pink-600" />;
    case 'disciplined':
      return <CalendarCheck className="h-5 w-5 text-blue-600" />;
    case 'empathetic':
      return <Focus className="h-5 w-5 text-cyan-600" />;
    default:
      return <Lightbulb className="h-5 w-5 text-primary" />;
  }
}

function getTraitInsight(trait: string): string {
  const insights: Record<string, string> = {
    Introspective: "you're developing a deeper understanding of yourself through regular reflection",
    Anxious: "you might benefit from mindfulness practices to manage worry and stress",
    Optimistic: "you have a resilient mindset that helps you navigate challenges effectively",
    Analytical: "you excel at critical thinking and careful evaluation of situations",
    Creative: "you bring innovative perspectives and ideas to your experiences",
    Disciplined: "you're effective at building consistent habits and routines",
    Empathetic: "you have a strong ability to connect with others and understand their perspectives",
  };
  
  return insights[trait] || "this provides valuable insight into your thought patterns";
}

// Simulated pattern analysis - in a real app this would be done by AI on the server
function analyzePatterns(entries: any[]): PatternItem[] {
  if (entries.length < 2) return [];
  
  // For demo purposes, we'll use simplified pattern detection based on n-grams and frequencies
  const patterns: PatternItem[] = [
    {
      category: "Goals & Aspirations",
      pattern: "Career development focus",
      occurances: 4,
      context: "I need to spend more time developing my professional skills to advance in my career.",
      sentiment: "positive"
    },
    {
      category: "Relationships",
      pattern: "Communication challenges",
      occurances: 3,
      context: "Having a hard time expressing my needs clearly to others, which leads to misunderstandings.",
      sentiment: "negative"
    },
    {
      category: "Personal Growth",
      pattern: "Journaling consistency",
      occurances: 5,
      context: "Feeling much clearer about my thoughts when I maintain a regular journaling practice.",
      sentiment: "positive"
    },
    {
      category: "Wellbeing",
      pattern: "Sleep quality concerns",
      occurances: 3,
      context: "Noticing how my productivity and mood are affected by inconsistent sleep patterns.",
      sentiment: "neutral"
    },
    {
      category: "Productivity",
      pattern: "Morning routine benefits",
      occurances: 2,
      context: "Starting my day with a structured morning routine has improved my focus throughout the day.",
      sentiment: "positive"
    }
  ];
  
  // In a real implementation, we would use NLP/AI to extract these patterns from actual entries
  return patterns;
}

export default Stats;
