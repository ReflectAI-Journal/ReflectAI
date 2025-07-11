import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { differenceInDays, format, subMonths, subYears, subWeeks, startOfWeek, endOfWeek } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import BackButton from '@/components/layout/BackButton';
import { JournalEntry } from '@shared/schema';
import { 
  BarChart, Bar, 
  PieChart, Pie, Cell, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, 
  Tooltip,
  Legend,
  XAxis,
  YAxis,
  LineChart,
  Line,
  Area,
  AreaChart,
  CartesianGrid
} from 'recharts';
import { 
  Brain, 
  BookOpen, 
  MessageCircle, 
  LineChart as LineChartIcon, 
  ArrowRight,
  User,
  Users,
  Repeat,
  BarChart2,
  Heart,
  Calendar,
  Clock,
  Lightbulb,
  Pencil,
  Sparkles,
  MoveRight,
  CheckCircle2,
  TrendingUp,
  Activity
} from 'lucide-react';

// Types for patterns and analysis
interface ThoughtPattern {
  id: string;
  category: string;
  title: string;
  frequency: number; // 1-10 scale
  examples: string[];
  icon: React.ReactNode;
  analysis: string;
  source: 'journal' | 'philosopher' | 'counselor';
}

// Types for emotion tracking
interface EmotionDataPoint {
  date: string;
  emotion: string;
  intensity: number;
  context: string;
  source: 'journal' | 'counselor' | 'philosopher';
}

interface EmotionTrend {
  emotion: string;
  frequency: number;
  consistency: number;
  color: string;
  trend: 'increasing' | 'decreasing' | 'stable';
}

interface ConversationTopic {
  id: string;
  topic: string;
  frequency: number; // 1-10 scale
  examples: string[];
  dates: string[];
  source: 'philosopher' | 'counselor';
}

interface JournalTheme {
  id: string;
  theme: string;
  frequency: number; // 1-10 scale
  context: string;
  examples: string[];
  emotional_tone: 'positive' | 'negative' | 'neutral' | 'mixed';
}

// Component for detailed pattern insight
const PatternInsight = ({ pattern }: { pattern: ThoughtPattern }) => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <Card className="mb-4 overflow-hidden border-border/50 hover:shadow-md transition-all duration-300">
      <div className="p-4 pb-3 flex items-start justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
            {pattern.icon}
          </div>
          <div>
            <h3 className="text-base font-medium">{pattern.title}</h3>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <span className="capitalize">{pattern.source}</span>
              <span className="mx-2">•</span>
              <div className="flex items-center">
                <span>Frequency:</span>
                <div className="ml-1 w-20 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full" 
                    style={{ width: `${(pattern.frequency / 10) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <ArrowRight className={`h-4 w-4 transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </Button>
      </div>
      
      {expanded && (
        <div className="px-4 pb-4 pt-1">
          <p className="text-sm text-muted-foreground mb-3">{pattern.analysis}</p>
          
          <div className="space-y-2">
            <h4 className="text-xs font-medium uppercase text-muted-foreground">Examples</h4>
            <ul className="space-y-2">
              {pattern.examples.map((example, idx) => (
                <li key={idx} className="text-sm p-2 bg-muted/20 rounded-md">
                  "{example}"
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Card>
  );
};

// Component for conversation topics
const ConversationTopicCard = ({ topic }: { topic: ConversationTopic }) => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <Card className="mb-4 overflow-hidden border-border/50 hover:shadow-md transition-all duration-300">
      <div className="p-4 pb-3 flex items-start justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
            {topic.source === 'philosopher' ? <Brain className="h-5 w-5 text-primary" /> : <MessageCircle className="h-5 w-5 text-primary" />}
          </div>
          <div>
            <h3 className="text-base font-medium">{topic.topic}</h3>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <Badge variant="outline" className="text-xs mr-2 px-1.5 py-0 capitalize">
                {topic.source}
              </Badge>
              <span>Discussed {topic.dates.length} times</span>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <ArrowRight className={`h-4 w-4 transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </Button>
      </div>
      
      {expanded && (
        <div className="px-4 pb-4 pt-1">
          <div className="space-y-3">
            <div>
              <h4 className="text-xs font-medium uppercase text-muted-foreground mb-2">Recent examples</h4>
              <ul className="space-y-2">
                {topic.examples.map((example, idx) => (
                  <li key={idx} className="text-sm p-2 bg-muted/20 rounded-md">
                    "{example}"
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-xs font-medium uppercase text-muted-foreground mb-2">Discussed on</h4>
              <div className="flex flex-wrap gap-1.5">
                {topic.dates.map((date, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {date}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

// Component for journal themes
const JournalThemeCard = ({ theme }: { theme: JournalTheme }) => {
  const [expanded, setExpanded] = useState(false);
  
  const emotionColor = {
    positive: 'text-green-500',
    negative: 'text-red-500',
    neutral: 'text-blue-500',
    mixed: 'text-violet-500'
  }[theme.emotional_tone];
  
  return (
    <Card className="mb-4 overflow-hidden border-border/50 hover:shadow-md transition-all duration-300">
      <div className="p-4 pb-3 flex items-start justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-base font-medium">{theme.theme}</h3>
            <div className="flex items-center text-xs mt-1">
              <span className={`${emotionColor} capitalize`}>{theme.emotional_tone} tone</span>
              <span className="mx-2 text-muted-foreground">•</span>
              <div className="flex items-center text-muted-foreground">
                <span>Frequency:</span>
                <div className="ml-1 w-20 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full" 
                    style={{ width: `${(theme.frequency / 10) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <ArrowRight className={`h-4 w-4 transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </Button>
      </div>
      
      {expanded && (
        <div className="px-4 pb-4 pt-1">
          <p className="text-sm text-muted-foreground mb-3">{theme.context}</p>
          
          <div className="space-y-2">
            <h4 className="text-xs font-medium uppercase text-muted-foreground">Journal excerpts</h4>
            <ul className="space-y-2">
              {theme.examples.map((example, idx) => (
                <li key={idx} className="text-sm p-2 bg-muted/20 rounded-md">
                  "{example}"
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Card>
  );
};

// Emotion Tracking Graph Component
const EmotionTrackingGraph = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'week' | 'month' | 'quarter'>('month');
  const [selectedView, setSelectedView] = useState<'line' | 'bar' | 'area'>('line');
  
  // Sample emotion data - in real implementation this would come from API
  const emotionData = [
    { date: '2025-07-01', anxious: 7, hopeful: 4, stressed: 6, calm: 3, motivated: 5 },
    { date: '2025-07-02', anxious: 5, hopeful: 6, stressed: 4, calm: 5, motivated: 7 },
    { date: '2025-07-03', anxious: 6, hopeful: 5, stressed: 5, calm: 4, motivated: 6 },
    { date: '2025-07-04', anxious: 4, hopeful: 7, stressed: 3, calm: 6, motivated: 8 },
    { date: '2025-07-05', anxious: 3, hopeful: 8, stressed: 2, calm: 7, motivated: 9 },
    { date: '2025-07-06', anxious: 4, hopeful: 7, stressed: 3, calm: 6, motivated: 8 },
    { date: '2025-07-07', anxious: 6, hopeful: 5, stressed: 5, calm: 4, motivated: 6 },
    { date: '2025-07-08', anxious: 5, hopeful: 6, stressed: 4, calm: 5, motivated: 7 },
    { date: '2025-07-09', anxious: 3, hopeful: 8, stressed: 2, calm: 7, motivated: 9 },
    { date: '2025-07-10', anxious: 4, hopeful: 7, stressed: 3, calm: 6, motivated: 8 },
  ];
  
  const emotionColors = {
    anxious: '#ef4444',
    hopeful: '#22c55e',
    stressed: '#f97316',
    calm: '#3b82f6',
    motivated: '#8b5cf6'
  };
  
  const emotionTrends: EmotionTrend[] = [
    { emotion: 'Anxious', frequency: 85, consistency: 7, color: '#ef4444', trend: 'decreasing' },
    { emotion: 'Hopeful', frequency: 92, consistency: 8, color: '#22c55e', trend: 'increasing' },
    { emotion: 'Stressed', frequency: 78, consistency: 6, color: '#f97316', trend: 'stable' },
    { emotion: 'Calm', frequency: 88, consistency: 7, color: '#3b82f6', trend: 'increasing' },
    { emotion: 'Motivated', frequency: 95, consistency: 9, color: '#8b5cf6', trend: 'increasing' }
  ];
  
  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), 'MMM dd');
  };
  
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'decreasing': return <TrendingUp className="h-3 w-3 text-red-500 transform rotate-180" />;
      default: return <Activity className="h-3 w-3 text-blue-500" />;
    }
  };
  
  return (
    <Card className="mb-6 border-primary/20">
      <div className="p-4 pb-3 border-b border-border/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-medium">Emotion Consistency Tracking</h3>
              <p className="text-sm text-muted-foreground">Track your emotional patterns over time</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
              <Button
                variant={selectedView === 'line' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedView('line')}
                className="px-2 py-1 h-7"
              >
                Line
              </Button>
              <Button
                variant={selectedView === 'area' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedView('area')}
                className="px-2 py-1 h-7"
              >
                Area
              </Button>
              <Button
                variant={selectedView === 'bar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedView('bar')}
                className="px-2 py-1 h-7"
              >
                Bar
              </Button>
            </div>
            
            <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
              <Button
                variant={selectedTimeRange === 'week' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedTimeRange('week')}
                className="px-2 py-1 h-7"
              >
                Week
              </Button>
              <Button
                variant={selectedTimeRange === 'month' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedTimeRange('month')}
                className="px-2 py-1 h-7"
              >
                Month
              </Button>
              <Button
                variant={selectedTimeRange === 'quarter' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedTimeRange('quarter')}
                className="px-2 py-1 h-7"
              >
                Quarter
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <div className="lg:col-span-2">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                {selectedView === 'line' ? (
                  <LineChart data={emotionData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      domain={[0, 10]}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      labelFormatter={(label) => format(new Date(label), 'MMM dd, yyyy')}
                      formatter={(value, name) => [value, name.charAt(0).toUpperCase() + name.slice(1)]}
                    />
                    <Legend />
                    {Object.entries(emotionColors).map(([emotion, color]) => (
                      <Line
                        key={emotion}
                        type="monotone"
                        dataKey={emotion}
                        stroke={color}
                        strokeWidth={2}
                        dot={{ fill: color, strokeWidth: 2, r: 3 }}
                        name={emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                      />
                    ))}
                  </LineChart>
                ) : selectedView === 'area' ? (
                  <AreaChart data={emotionData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      domain={[0, 10]}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      labelFormatter={(label) => format(new Date(label), 'MMM dd, yyyy')}
                      formatter={(value, name) => [value, name.charAt(0).toUpperCase() + name.slice(1)]}
                    />
                    <Legend />
                    {Object.entries(emotionColors).map(([emotion, color]) => (
                      <Area
                        key={emotion}
                        type="monotone"
                        dataKey={emotion}
                        stackId="1"
                        stroke={color}
                        fill={color}
                        fillOpacity={0.3}
                        name={emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                      />
                    ))}
                  </AreaChart>
                ) : (
                  <BarChart data={emotionData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      domain={[0, 10]}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      labelFormatter={(label) => format(new Date(label), 'MMM dd, yyyy')}
                      formatter={(value, name) => [value, name.charAt(0).toUpperCase() + name.slice(1)]}
                    />
                    <Legend />
                    {Object.entries(emotionColors).map(([emotion, color]) => (
                      <Bar
                        key={emotion}
                        dataKey={emotion}
                        fill={color}
                        name={emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                      />
                    ))}
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Emotion Trends Sidebar */}
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Heart className="h-4 w-4 text-primary" />
                Emotion Trends
              </h4>
              <div className="space-y-3">
                {emotionTrends.map((trend, index) => (
                  <div key={index} className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{trend.emotion}</span>
                      {getTrendIcon(trend.trend)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Frequency</span>
                        <span>{trend.frequency}%</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full" 
                          style={{ 
                            width: `${trend.frequency}%`,
                            backgroundColor: trend.color
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Consistency</span>
                        <span>{trend.consistency}/10</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-lg border border-primary/20">
              <h4 className="text-sm font-medium mb-2">Key Insights</h4>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• Motivation levels trending upward</li>
                <li>• Anxiety decreasing over time</li>
                <li>• Stress levels stabilizing</li>
                <li>• Calm feelings increasing</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Patterns and recurring themes data
const thoughtPatterns: ThoughtPattern[] = [
  {
    id: '1',
    category: 'Self-Reflection',
    title: 'Seeking deeper meaning in everyday experiences',
    frequency: 8,
    examples: [
      "I find myself constantly analyzing seemingly ordinary moments for deeper significance.",
      "Today I wondered if my daily routine is aligned with my true purpose.",
      "What does it mean to truly live authentically versus simply existing?"
    ],
    icon: <Brain className="h-5 w-5 text-primary" />,
    analysis: "You frequently contemplate the deeper meaning behind everyday experiences, showing a philosophical mindset that seeks to understand life beyond surface-level interactions. This pattern appears consistently across conversations with the Philosopher AI and in your journal entries.",
    source: 'philosopher'
  },
  {
    id: '2',
    category: 'Emotional Processing',
    title: 'Concern about balancing personal growth with relationships',
    frequency: 7,
    examples: [
      "How do I grow as an individual while maintaining meaningful connections?",
      "I worry that my personal journey might create distance between me and others.",
      "Finding it hard to explain my evolving perspectives to friends who've known me for years."
    ],
    icon: <Heart className="h-5 w-5 text-primary" />,
    analysis: "There's a recurring theme in your conversations with the Counselor AI about finding harmony between personal development and maintaining relationships. You seem to value both individual growth and meaningful connections, but experience tension when these areas compete for attention.",
    source: 'counselor'
  },
  {
    id: '3',
    category: 'Decision Making',
    title: 'Analyzing multiple perspectives before making decisions',
    frequency: 9,
    examples: [
      "I always try to consider at least three different viewpoints before forming an opinion.",
      "Found myself weighing the pros and cons from different angles again today.",
      "Sometimes I overthink decisions by considering too many possibilities."
    ],
    icon: <LineChart className="h-5 w-5 text-primary" />,
    analysis: "Across your journal entries, there's strong evidence that you carefully consider multiple perspectives before making decisions. This analytical approach helps you make well-informed choices but occasionally leads to analysis paralysis when the options seem equally valid.",
    source: 'journal'
  },
  {
    id: '4',
    category: 'Time Management',
    title: 'Reflection on the passage of time',
    frequency: 6,
    examples: [
      "Another month gone by so quickly - am I making the most of my time?",
      "I often wonder if I'm allocating my hours according to what truly matters.",
      "The concept of time feels both limiting and liberating depending on my mindset."
    ],
    icon: <Clock className="h-5 w-5 text-primary" />,
    analysis: "You frequently contemplate the nature of time, its passage, and whether you're utilizing it meaningfully. This reflection appears in philosophical discussions and journal entries, suggesting a deep awareness of life's finite nature and desire to live purposefully.",
    source: 'philosopher'
  },
  {
    id: '5',
    category: 'Personal Growth',
    title: 'Tracking incremental progress toward goals',
    frequency: 8,
    examples: [
      "Made small progress on my meditation practice today - 5 minutes longer than yesterday.",
      "Noticed I'm less reactive to criticism than I was last month.",
      "Celebrating the tiny improvements that add up over time."
    ],
    icon: <BarChart2 className="h-5 w-5 text-primary" />,
    analysis: "Your journal entries consistently show attention to small, incremental improvements rather than just focusing on end goals. This suggests a growth mindset and appreciation for the process of development rather than just outcomes.",
    source: 'journal'
  }
];

const conversationTopics: ConversationTopic[] = [
  {
    id: '1',
    topic: 'Existentialism and finding personal meaning',
    frequency: 9,
    examples: [
      "How do I create meaning in a seemingly meaningless universe?",
      "Is authenticity always the best approach or are there times when conformity serves a purpose?",
      "Can we truly know ourselves or are we constantly evolving beings?"
    ],
    dates: ['April 12, 2025', 'March 23, 2025', 'February 5, 2025'],
    source: 'philosopher'
  },
  {
    id: '2',
    topic: 'Work-life balance and purpose',
    frequency: 7,
    examples: [
      "I'm struggling to find meaning in my professional work while maintaining personal well-being.",
      "How do I determine when to prioritize career advancement versus personal fulfillment?",
      "What constitutes 'success' beyond societal definitions?"
    ],
    dates: ['May 2, 2025', 'April 18, 2025', 'March 30, 2025'],
    source: 'counselor'
  },
  {
    id: '3',
    topic: 'Impermanence and embracing change',
    frequency: 8,
    examples: [
      "How can I better embrace life's constant changes rather than resisting them?",
      "The Buddhist concept of impermanence resonates with me, but applying it is difficult.",
      "I find myself attached to outcomes despite knowing that change is inevitable."
    ],
    dates: ['April 29, 2025', 'March 15, 2025', 'February 22, 2025'],
    source: 'philosopher'
  },
  {
    id: '4',
    topic: 'Social connection in an increasingly digital world',
    frequency: 6,
    examples: [
      "I'm finding it harder to form meaningful connections in an age of digital relationships.",
      "How do I determine which relationships to prioritize and nurture?",
      "Sometimes I feel more isolated despite being more 'connected' than ever."
    ],
    dates: ['May 3, 2025', 'April 10, 2025'],
    source: 'counselor'
  }
];

const journalThemes: JournalTheme[] = [
  {
    id: '1',
    theme: 'Growth through discomfort',
    frequency: 8,
    context: "You frequently write about situations that pushed you outside your comfort zone and the subsequent personal growth that resulted from these experiences.",
    examples: [
      "Today's presentation was terrifying but I learned so much about myself by pushing through it.",
      "The conversation was uncomfortable but necessary - I'm growing by facing these difficult moments.",
      "Realizing that the periods of greatest discomfort in my life have led to the most significant growth."
    ],
    emotional_tone: 'mixed'
  },
  {
    id: '2',
    theme: 'Appreciation for small moments',
    frequency: 9,
    context: "Your journal entries often highlight an appreciation for ordinary, everyday moments that might otherwise go unnoticed.",
    examples: [
      "The way the light came through the window this morning made me pause and feel grateful.",
      "A simple conversation with a stranger today reminded me of our shared humanity.",
      "Finding joy in my morning coffee ritual - these small pleasures are what make life rich."
    ],
    emotional_tone: 'positive'
  },
  {
    id: '3',
    theme: 'Balancing self-criticism with compassion',
    frequency: 7,
    context: "There's a recurring pattern of noticing negative self-talk followed by conscious efforts to introduce self-compassion.",
    examples: [
      "Caught myself being overly critical again today - trying to speak to myself as I would to a friend.",
      "Reflecting on how harsh my internal dialogue can be and working to soften it.",
      "The balance between holding myself accountable and being kind to myself is a daily practice."
    ],
    emotional_tone: 'mixed'
  },
  {
    id: '4',
    theme: 'Desire for deeper connections',
    frequency: 6,
    context: "You regularly express a desire for more meaningful interactions and genuine relationships.",
    examples: [
      "Had a conversation that went beyond surface level today - felt more alive afterward.",
      "Wondering if others also crave the depth of connection that seems increasingly rare.",
      "Feeling disappointed by interactions that remain at a superficial level."
    ],
    emotional_tone: 'mixed'
  }
];

// Pattern category distribution data for charts
const patternCategoryData = [
  { name: 'Self-Reflection', value: 35, color: '#8884d8' },
  { name: 'Emotional Processing', value: 25, color: '#FF8042' },
  { name: 'Decision Making', value: 20, color: '#0088FE' },
  { name: 'Time Management', value: 10, color: '#00C49F' },
  { name: 'Personal Growth', value: 10, color: '#FFBB28' },
];

// Source distribution data for charts
const patternSourceData = [
  { name: 'Journal', value: 40, color: '#0088FE' },
  { name: 'Philosopher', value: 35, color: '#8884d8' },
  { name: 'Counselor', value: 25, color: '#00C49F' },
];

// Pattern frequency radar data
const radarData = [
  {
    subject: 'Self-Reflection',
    value: 8,
    fullMark: 10,
  },
  {
    subject: 'Emotions',
    value: 7, 
    fullMark: 10,
  },
  {
    subject: 'Decision Making',
    value: 9,
    fullMark: 10,
  },
  {
    subject: 'Time',
    value: 6,
    fullMark: 10,
  },
  {
    subject: 'Growth',
    value: 8,
    fullMark: 10,
  },
];

// Pattern visualizations component
const PatternVisualizations = () => {
  return (
    <div className="mb-8">
      <Card className="border-primary/10 overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
          <h3 className="font-medium text-lg mb-2">Pattern Visualizations</h3>
          <p className="text-sm text-muted-foreground">Visual insights into your thinking patterns and their distribution</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
          {/* Pie Chart */}
          <Card className="p-2 border-border/50 hover:shadow-sm">
            <h4 className="text-sm font-medium text-center mb-2">Pattern Categories</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={patternCategoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {patternCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    wrapperStyle={{ fontSize: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
          
          {/* Bar Chart */}
          <Card className="p-2 border-border/50 hover:shadow-sm">
            <h4 className="text-sm font-medium text-center mb-2">Pattern Sources</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={patternSourceData}
                  margin={{ top: 20, right: 5, left: 5, bottom: 20 }}
                >
                  <Bar dataKey="value" name="Percentage">
                    {patternSourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ fontSize: '9px', paddingTop: '10px' }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          
          {/* Radar Chart */}
          <Card className="p-2 border-border/50 hover:shadow-sm">
            <h4 className="text-sm font-medium text-center mb-2">Pattern Frequency</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fontSize: 8 }} />
                  <Radar
                    name="Frequency"
                    dataKey="value"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                  />
                  <Tooltip />
                  <Legend 
                    wrapperStyle={{ fontSize: '9px', paddingTop: '10px' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </Card>
    </div>
  );
};

// AI Advisor component for actionable advice
interface ActionStep {
  id: string;
  title: string; 
  description: string;
  benefit: string;
  icon: React.ReactNode;
  timeRequired: 'minutes' | 'hours' | 'daily' | 'weekly';
}

interface PatternAdvice {
  patternId: string;
  advice: string;
  actionSteps: ActionStep[];
}

// Component for AI pattern advisor
const AIPatternAdvisor = () => {
  const [expanded, setExpanded] = useState(true);
  const [activeAdvice, setActiveAdvice] = useState<PatternAdvice | null>(null);
  const [userMessage, setUserMessage] = useState('');
  const [conversation, setConversation] = useState<{type: 'ai' | 'user', message: string}[]>([
    {type: 'ai', message: "Hi there! I've been analyzing your thought patterns and notice some interesting trends. Would you like me to give you some personalized advice on how to use these insights for your personal growth?"}
  ]);

  // Simulated loading state
  const [isLoading, setIsLoading] = useState(false);
  
  // Function to handle user input
  const handleSendMessage = () => {
    if (!userMessage.trim()) return;
    
    // Add user message to conversation
    setConversation(prev => [...prev, {type: 'user', message: userMessage}]);
    setIsLoading(true);
    
    // Clear input
    setUserMessage('');
    
    // Simulate API response
    setTimeout(() => {
      const patterns = thoughtPatterns.map(p => p.title.toLowerCase());
      const lowercase = userMessage.toLowerCase();
      
      let responseMessage = '';
      let adviceToShow: PatternAdvice | null = null;
      
      // Check if the message contains keywords related to patterns
      const matchedPattern = thoughtPatterns.find(pattern => 
        lowercase.includes(pattern.title.toLowerCase()) || 
        lowercase.includes(pattern.category.toLowerCase())
      );
      
      if (matchedPattern) {
        // Show specific pattern advice
        adviceToShow = patternAdvice.find(a => a.patternId === matchedPattern.id) || null;
        responseMessage = `I see you're interested in your "${matchedPattern.title}" pattern. This is a great area to focus on! Here's some personalized advice that might help you leverage this pattern effectively.`;
      } 
      else if (lowercase.includes('help') || lowercase.includes('advice') || lowercase.includes('suggest')) {
        // General help request
        responseMessage = "I'd be happy to give you some advice! I've analyzed your patterns across your journal entries and conversations. Which area would you like to focus on? For example, I could help with your decision-making approach, balancing relationships and personal growth, or making the most of your time.";
      }
      else if (lowercase.includes('time') || lowercase.includes('manage') || lowercase.includes('busy')) {
        // Time management focus
        adviceToShow = patternAdvice.find(a => a.patternId === '4') || null;
        responseMessage = "Time management seems to be on your mind. I've noticed you often reflect on the passage of time and how you're using it. Let me share some strategies tailored to your thinking pattern.";
      }
      else if (lowercase.includes('decision') || lowercase.includes('choice') || lowercase.includes('options')) {
        // Decision making focus
        adviceToShow = patternAdvice.find(a => a.patternId === '3') || null;
        responseMessage = "Decision-making is an interesting area in your thought patterns. You tend to thoroughly analyze multiple perspectives, which has strengths and challenges. Here are some tailored suggestions.";
      }
      else if (lowercase.includes('relationship') || lowercase.includes('people') || lowercase.includes('friends') || lowercase.includes('connection')) {
        // Relationships focus
        adviceToShow = patternAdvice.find(a => a.patternId === '2') || null;
        responseMessage = "Balancing personal growth with relationships is something you've thought about often. I've noticed this pattern in your conversations with the Counselor. Here's some advice that might help.";
      }
      else {
        // Default response for other queries
        responseMessage = "That's an interesting question! Based on the patterns I've observed in your thinking, you tend to be reflective and analytical. Would you like me to show you specific advice related to your self-reflection, emotional processing, decision making, time management, or personal growth patterns?";
      }
      
      // Add AI response to conversation
      setConversation(prev => [...prev, {type: 'ai', message: responseMessage}]);
      setActiveAdvice(adviceToShow);
      setIsLoading(false);
    }, 1000);
  };

  // Function to get advice for a specific pattern
  const getAdviceForPattern = (patternId: string) => {
    setIsLoading(true);
    
    const pattern = thoughtPatterns.find(p => p.id === patternId);
    
    // Add message about this pattern
    setConversation(prev => [...prev, {
      type: 'ai', 
      message: `Let me analyze your "${pattern?.title}" pattern and provide some tailored advice...`
    }]);
    
    // Simulate API call with timeout
    setTimeout(() => {
      const advice = patternAdvice.find(a => a.patternId === patternId) || patternAdvice[0];
      setActiveAdvice(advice);
      
      // Add the detailed advice
      setConversation(prev => [...prev, {
        type: 'ai', 
        message: advice.advice
      }]);
      
      setIsLoading(false);
    }, 800);
  };

  return (
    <Card className="mb-8 border-primary/20 overflow-hidden">
      <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 p-4 flex items-center justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="font-medium text-lg">Pattern Advisor</h2>
            <p className="text-sm text-muted-foreground">Chat with your AI advisor for personalized insights and actionable steps</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <ArrowRight className={`h-4 w-4 transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </Button>
      </div>
      
      {expanded && (
        <div className="p-4">
          <div className="bg-muted/30 rounded-lg p-4 mb-4 max-h-[300px] overflow-y-auto space-y-3">
            {conversation.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg ${
                  msg.type === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted border border-border'
                }`}>
                  <p className="text-sm">{msg.message}</p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] p-3 rounded-lg bg-muted border border-border">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-primary rounded-full animate-pulse"></div>
                    <div className="h-2 w-2 bg-primary rounded-full animate-pulse delay-150"></div>
                    <div className="h-2 w-2 bg-primary rounded-full animate-pulse delay-300"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex flex-col space-y-2">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-2">
              {thoughtPatterns.map(pattern => (
                <Button 
                  key={pattern.id}
                  variant="outline" 
                  size="sm"
                  className="text-xs px-2 py-1 h-auto"
                  onClick={() => getAdviceForPattern(pattern.id)}
                >
                  {pattern.category}
                </Button>
              ))}
            </div>
            
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Ask for advice based on your patterns..."
                className="flex-1 p-2 text-sm border border-border rounded-md bg-background"
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button onClick={handleSendMessage} size="sm" className="shrink-0">
                <MessageCircle className="h-4 w-4 mr-1" />
                Send
              </Button>
            </div>
          </div>
          
          {activeAdvice && (
            <div className="mt-4 space-y-4">
              <div>
                <h3 className="text-base font-medium mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Actionable Steps
                </h3>
                
                <div className="space-y-3">
                  {activeAdvice.actionSteps.map(step => (
                    <Card key={step.id} className="p-3 border-primary/10">
                      <div className="flex gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                          {step.icon}
                        </div>
                        <div>
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm">{step.title}</h4>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {step.timeRequired}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {step.description}
                          </p>
                          <div className="mt-2 p-2 bg-muted/30 rounded-md text-xs">
                            <span className="font-medium">Benefit:</span> {step.benefit}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

// Actionable advice data for each pattern
const patternAdvice: PatternAdvice[] = [
  {
    patternId: '1',
    advice: "Your quest for deeper meaning is a powerful philosophical drive. While this mindset offers rich insights, it can sometimes lead to overthinking everyday experiences. Consider balancing philosophical inquiry with mindful presence.",
    actionSteps: [
      {
        id: 'a1',
        title: "Five-minute mindfulness practice",
        description: "Set aside five minutes today to experience something ordinary without analysis - simply observe a sunset, enjoy a meal, or listen to music with full presence.",
        benefit: "Creates balance between meaning-seeking and direct experience",
        icon: <Clock className="h-4 w-4 text-primary" />,
        timeRequired: 'minutes'
      },
      {
        id: 'a2',
        title: "Meaning journal with boundaries",
        description: "When philosophizing, set a timer for 15 minutes. Write freely, but when the timer ends, make one concrete action point based on your insights.",
        benefit: "Transforms abstract thoughts into practical applications",
        icon: <Pencil className="h-4 w-4 text-primary" />,
        timeRequired: 'minutes'
      },
      {
        id: 'a3',
        title: "Shared meaning conversation",
        description: "Have a deeper conversation with someone today, but focus on listening to their perspective without immediately analyzing it.",
        benefit: "Enriches your meaning-making through diverse viewpoints",
        icon: <MessageCircle className="h-4 w-4 text-primary" />,
        timeRequired: 'hours'
      }
    ]
  },
  {
    patternId: '2',
    advice: "The tension you feel between personal growth and maintaining relationships is common among thoughtful individuals. Rather than seeing these as competing priorities, there are ways to integrate them so they become mutually reinforcing.",
    actionSteps: [
      {
        id: 'b1',
        title: "Growth-sharing practice",
        description: "Select one personal insight you've gained recently and share it with a close friend or family member in a conversational way, not as a lecture.",
        benefit: "Transforms personal growth into connection points",
        icon: <Heart className="h-4 w-4 text-primary" />,
        timeRequired: 'hours'
      },
      {
        id: 'b2',
        title: "Relationship-as-growth reframing",
        description: "Identify one challenging relationship and write down three ways this relationship is actually contributing to your personal development.",
        benefit: "Helps see relationships as growth catalysts rather than obstacles",
        icon: <Brain className="h-4 w-4 text-primary" />,
        timeRequired: 'minutes'
      },
      {
        id: 'b3',
        title: "Collaborative learning",
        description: "Invite someone to learn something new with you - whether it's a skill, hobby, or book discussion.",
        benefit: "Creates shared growth experiences that deepen connection",
        icon: <User className="h-4 w-4 text-primary" />,
        timeRequired: 'weekly'
      }
    ]
  },
  {
    patternId: '3',
    advice: "Your careful consideration of multiple perspectives leads to well-rounded decisions, but may sometimes delay action. Finding ways to maintain this thoughtful approach while implementing decisiveness strategies can help you avoid analysis paralysis.",
    actionSteps: [
      {
        id: 'c1',
        title: "Decision timeboxing",
        description: "For your next decision, set a specific deadline. Allocate 80% of the time for gathering perspectives and 20% for making the final choice.",
        benefit: "Maintains analytical depth while ensuring forward movement",
        icon: <Clock className="h-4 w-4 text-primary" />,
        timeRequired: 'hours'
      },
      {
        id: 'c2',
        title: "Perspective-action balance",
        description: "After considering a new viewpoint today, immediately identify one small action you can take based on this perspective.",
        benefit: "Builds a habit of converting insights into concrete steps",
        icon: <MoveRight className="h-4 w-4 text-primary" />,
        timeRequired: 'daily'
      },
      {
        id: 'c3',
        title: "Decision journal practice",
        description: "Start tracking decisions: what perspectives you considered, what you chose, and the outcome. Review after 30 days to calibrate your decision-making approach.",
        benefit: "Provides data to optimize your analytical process over time",
        icon: <LineChart className="h-4 w-4 text-primary" />,
        timeRequired: 'minutes'
      }
    ]
  },
  {
    patternId: '4',
    advice: "Your contemplation of time's passage reveals a deep awareness of life's finite nature. This existential mindfulness can be channeled into intentional living practices that help you feel both purposeful and present.",
    actionSteps: [
      {
        id: 'd1',
        title: "Time alignment check",
        description: "Review yesterday's activities and categorize them as 'energy-giving' or 'energy-depleting'. Then check if your time allocation matches your stated priorities.",
        benefit: "Creates awareness of the gap between time values and time use",
        icon: <BarChart2 className="h-4 w-4 text-primary" />,
        timeRequired: 'minutes'
      },
      {
        id: 'd2',
        title: "Future self visualization",
        description: "Spend 10 minutes writing a letter from your future self (5 years ahead), expressing gratitude for specific actions you're taking now.",
        benefit: "Connects present moments to long-term meaning",
        icon: <Pencil className="h-4 w-4 text-primary" />,
        timeRequired: 'minutes'
      },
      {
        id: 'd3',
        title: "Timeless moment practice",
        description: "Schedule one 30-minute block this week for an activity where you typically lose track of time (art, nature, flow state activities).",
        benefit: "Balances time awareness with timeless experiences",
        icon: <Sparkles className="h-4 w-4 text-primary" />,
        timeRequired: 'hours'
      }
    ]
  },
  {
    patternId: '5',
    advice: "Your attentiveness to incremental progress shows a growth mindset that serves you well. To maximize this strength, consider implementing structured ways to celebrate small wins while maintaining focus on your larger developmental journey.",
    actionSteps: [
      {
        id: 'e1',
        title: "Progress visualization",
        description: "Create a simple visual tracker for one habit or skill you're developing. Update it daily, even for minimal progress.",
        benefit: "Makes incremental growth visible and motivating",
        icon: <LineChart className="h-4 w-4 text-primary" />,
        timeRequired: 'minutes'
      },
      {
        id: 'e2',
        title: "Micro-celebration ritual",
        description: "Establish a specific, meaningful way to acknowledge small wins (a special tea, a moment of reflection, sharing with a supporter).",
        benefit: "Reinforces progress through emotional connection",
        icon: <Sparkles className="h-4 w-4 text-primary" />,
        timeRequired: 'daily'
      },
      {
        id: 'e3',
        title: "Compound effect reflection",
        description: "Choose one area of growth and calculate or visualize how your small daily actions will compound over one year.",
        benefit: "Strengthens motivation by connecting small actions to significant outcomes",
        icon: <BarChart2 className="h-4 w-4 text-primary" />,
        timeRequired: 'hours'
      }
    ]
  }
];

// Main component
const MindPatterns = () => {
  const [selectedTab, setSelectedTab] = useState('patterns');
  const { toast } = useToast();
  
  return (
    <div className="flex flex-col h-full">
      <div className="memory-pattern-dots absolute inset-0 pointer-events-none opacity-20"></div>
      
      <div className="w-full p-6 md:p-8 overflow-y-auto" style={{ maxHeight: "calc(100vh - 136px)" }}>
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <BackButton />
            <h1 className="font-header text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
              Mind Patterns
            </h1>
          </div>
          <p className="text-muted-foreground">
            Discover deeper insights into your thinking patterns across your journal entries and AI conversations
          </p>
        </div>
        
        <Tabs 
          defaultValue="patterns" 
          value={selectedTab} 
          onValueChange={setSelectedTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="patterns" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Thought Patterns</span>
              <span className="inline sm:hidden">Patterns</span>
            </TabsTrigger>
            <TabsTrigger value="philosopher" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Philosopher</span>
              <span className="inline sm:hidden">Philosophy</span>
            </TabsTrigger>
            <TabsTrigger value="counselor" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Counselor</span>
              <span className="inline sm:hidden">Counsel</span>
            </TabsTrigger>
            <TabsTrigger value="journal" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Journal Themes</span>
              <span className="inline sm:hidden">Journal</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="patterns" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Card className="p-4 bg-muted/30">
                <div className="flex items-center gap-2 mb-2">
                  <Repeat className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">Recurring Thought Patterns</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Patterns that emerge across your philosophical conversations,
                  counseling sessions, and journal entries.
                </p>
              </Card>
              
              <Card className="p-4 bg-muted/30">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">Insight Opportunities</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Explore connections between different areas of reflection to gain
                  deeper understanding of your thought processes.
                </p>
              </Card>
            </div>
            
            <PatternVisualizations />
            
            <AIPatternAdvisor />
            
            <div className="space-y-6">
              {thoughtPatterns.map(pattern => (
                <PatternInsight key={pattern.id} pattern={pattern} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="philosopher">
            <Card className="p-4 mb-6 border border-primary/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-medium">Philosophical Inquiries</h2>
                  <p className="text-sm text-muted-foreground">Common themes in your conversations with the Philosopher</p>
                </div>
              </div>
            </Card>
            
            <div className="space-y-2 mb-6">
              <h3 className="text-base font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Recent Topics
              </h3>
              
              <div className="space-y-4">
                {conversationTopics
                  .filter(topic => topic.source === 'philosopher')
                  .map(topic => (
                    <ConversationTopicCard key={topic.id} topic={topic} />
                  ))}
              </div>
            </div>
            
            <Card className="p-4 border border-primary/10 bg-muted/10">
              <h3 className="text-sm font-medium mb-2">Philosophical Tendencies</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between items-center">
                  <span>Existentialist perspectives</span>
                  <div className="w-24 h-2 bg-muted rounded-full">
                    <div className="h-full w-3/4 bg-blue-500 rounded-full"></div>
                  </div>
                </li>
                <li className="flex justify-between items-center">
                  <span>Stoic principles</span>
                  <div className="w-24 h-2 bg-muted rounded-full">
                    <div className="h-full w-1/2 bg-blue-500 rounded-full"></div>
                  </div>
                </li>
                <li className="flex justify-between items-center">
                  <span>Eastern philosophy concepts</span>
                  <div className="w-24 h-2 bg-muted rounded-full">
                    <div className="h-full w-2/3 bg-blue-500 rounded-full"></div>
                  </div>
                </li>
                <li className="flex justify-between items-center">
                  <span>Phenomenology</span>
                  <div className="w-24 h-2 bg-muted rounded-full">
                    <div className="h-full w-1/4 bg-blue-500 rounded-full"></div>
                  </div>
                </li>
              </ul>
            </Card>
          </TabsContent>
          
          <TabsContent value="counselor">
            <Card className="p-4 mb-6 border border-primary/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-medium">Counseling Patterns</h2>
                  <p className="text-sm text-muted-foreground">Recurring themes in your conversations with the Counselor</p>
                </div>
              </div>
            </Card>
            
            {/* Emotion Tracking Graph */}
            <EmotionTrackingGraph />
            
            <div className="space-y-2 mb-6">
              <h3 className="text-base font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Frequent Discussion Topics
              </h3>
              
              <div className="space-y-4">
                {conversationTopics
                  .filter(topic => topic.source === 'counselor')
                  .map(topic => (
                    <ConversationTopicCard key={topic.id} topic={topic} />
                  ))}
              </div>
            </div>
            
            <Card className="p-4 border border-primary/10 bg-muted/10">
              <h3 className="text-sm font-medium mb-2">Emotional Patterns</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Most discussed feelings</p>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                      <span>Uncertainty about future</span>
                    </li>
                    <li className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-green-400"></div>
                      <span>Growth mindset</span>
                    </li>
                    <li className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-violet-400"></div>
                      <span>Balance seeking</span>
                    </li>
                  </ul>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Common approaches</p>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                      <span>Self-reflection</span>
                    </li>
                    <li className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-pink-400"></div>
                      <span>Seeking balance</span>
                    </li>
                    <li className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                      <span>Practicing gratitude</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="journal">
            <Card className="p-4 mb-6 border border-primary/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Pencil className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-medium">Journal Patterns</h2>
                  <p className="text-sm text-muted-foreground">Recurring themes and patterns in your journal entries</p>
                </div>
              </div>
            </Card>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              <Card className="p-3 border border-primary/10 flex flex-col items-center justify-center text-center">
                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-2">
                  <Lightbulb className="h-5 w-5 text-blue-500" />
                </div>
                <h3 className="text-sm font-medium">Insight-Focused</h3>
                <p className="text-xs text-muted-foreground mt-1">You often reflect on lessons learned from experiences</p>
              </Card>
              
              <Card className="p-3 border border-primary/10 flex flex-col items-center justify-center text-center">
                <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-2">
                  <Heart className="h-5 w-5 text-green-500" />
                </div>
                <h3 className="text-sm font-medium">Emotionally Aware</h3>
                <p className="text-xs text-muted-foreground mt-1">Your entries show nuanced emotional intelligence</p>
              </Card>
              
              <Card className="p-3 border border-primary/10 flex flex-col items-center justify-center text-center">
                <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                </div>
                <h3 className="text-sm font-medium">Meaning-Seeking</h3>
                <p className="text-xs text-muted-foreground mt-1">You regularly question purpose and search for deeper meaning</p>
              </Card>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-base font-medium flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                Recurring Journal Themes
              </h3>
              
              {journalThemes.map(theme => (
                <JournalThemeCard key={theme.id} theme={theme} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MindPatterns;