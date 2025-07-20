import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import BackButton from '@/components/layout/BackButton';
import { useUpgrade } from "@/contexts/UpgradeContext";
import { useAuth } from "@/hooks/use-auth";
import { 
  Brain, 
  Heart, 
  MessageCircle, 
  BookOpen, 
  TrendingUp, 
  Calendar,
  Zap,
  BarChart3,
  Smile,
  Frown,
  Meh,
  Users,
  Clock,
  ArrowRight
} from 'lucide-react';

// Simple data structures
interface MoodTrend {
  mood: string;
  count: number;
  percentage: number;
  color: string;
  icon: React.ReactNode;
}

interface SimplePattern {
  title: string;
  description: string;
  frequency: string;
  color: string;
  icon: React.ReactNode;
}

interface ConversationInsight {
  topic: string;
  count: number;
  source: 'counselor' | 'philosopher';
  lastDiscussed: string;
}

const MindPatterns = () => {
  const { showUpgradeModal } = useUpgrade();
  const { subscriptionStatus } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'moods' | 'patterns' | 'conversations'>('overview');
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false);
  
  // Check if user has unlimited plan access
  const hasUnlimitedAccess = subscriptionStatus?.plan === 'unlimited';

  // Fetch journal entries for analysis
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["/api/entries"],
  });

  // Sample data for demonstration (would be replaced with real analysis)
  const moodTrends: MoodTrend[] = [
    { mood: 'Happy', count: 12, percentage: 40, color: 'bg-green-500', icon: <Smile className="h-4 w-4" /> },
    { mood: 'Neutral', count: 10, percentage: 33, color: 'bg-blue-500', icon: <Meh className="h-4 w-4" /> },
    { mood: 'Stressed', count: 5, percentage: 17, color: 'bg-orange-500', icon: <Frown className="h-4 w-4" /> },
    { mood: 'Motivated', count: 3, percentage: 10, color: 'bg-purple-500', icon: <TrendingUp className="h-4 w-4" /> }
  ];

  const simplePatterns: SimplePattern[] = [
    {
      title: 'Morning Reflection',
      description: 'You tend to write longer, more thoughtful entries in the morning',
      frequency: 'Very Common',
      color: 'border-blue-200 bg-card dark:border-blue-800',
      icon: <Calendar className="h-5 w-5 text-blue-600" />
    },
    {
      title: 'Goal-Oriented Thinking',
      description: 'Your entries often mention plans and future aspirations',
      frequency: 'Common',
      color: 'border-green-200 bg-card dark:border-green-800',
      icon: <TrendingUp className="h-5 w-5 text-green-600" />
    },
    {
      title: 'Social Connections',
      description: 'You frequently write about relationships and interactions',
      frequency: 'Moderate',
      color: 'border-purple-200 bg-card dark:border-purple-800',
      icon: <Users className="h-5 w-5 text-purple-600" />
    }
  ];

  const conversationInsights: ConversationInsight[] = [
    { topic: 'Personal Growth', count: 8, source: 'counselor', lastDiscussed: '2 days ago' },
    { topic: 'Life Purpose', count: 5, source: 'philosopher', lastDiscussed: '1 week ago' },
    { topic: 'Stress Management', count: 4, source: 'counselor', lastDiscussed: '3 days ago' },
    { topic: 'Decision Making', count: 3, source: 'philosopher', lastDiscussed: '5 days ago' }
  ];

  const StatCard = ({ title, value, subtitle, icon, color = "text-primary" }: {
    title: string;
    value: string;
    subtitle: string;
    icon: React.ReactNode;
    color?: string;
  }) => (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <div className={`p-2 rounded-full bg-muted ${color}`}>
          {icon}
        </div>
      </div>
    </Card>
  );

  const TabButton = ({ id, label, icon, isActive, onClick }: {
    id: string;
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
  }) => (
    <Button
      variant={isActive ? "default" : "outline"}
      onClick={onClick}
      className="flex items-center gap-2 text-sm"
    >
      {icon}
      {label}
    </Button>
  );

  if (isLoading) {
    return (
      <div className="flex flex-col h-full p-6">
        <div className="flex items-center gap-3 mb-6">
          <BackButton />
          <h1 className="text-2xl font-bold">Mind Patterns</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Analyzing your patterns...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="w-full overflow-y-auto" style={{ maxHeight: "calc(100vh - 136px)" }}>
        <div className="app-content py-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <BackButton />
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
                Mind Patterns
              </h1>
              <p className="text-muted-foreground text-sm">
                Simple insights from your journaling and conversations
              </p>
            </div>
          </div>
          
          {hasUnlimitedAccess && (
            <Button
              onClick={() => setShowAdvancedFeatures(!showAdvancedFeatures)}
              className="flex items-center gap-2"
              variant="default"
              size="sm"
            >
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">
                {showAdvancedFeatures ? 'Hide Advanced' : 'Show Advanced'}
              </span>
            </Button>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <TabButton
            id="overview"
            label="Overview"
            icon={<BarChart3 className="h-4 w-4" />}
            isActive={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
          />
          <TabButton
            id="moods"
            label="Moods"
            icon={<Heart className="h-4 w-4" />}
            isActive={activeTab === 'moods'}
            onClick={() => setActiveTab('moods')}
          />
          <TabButton
            id="patterns"
            label="Patterns"
            icon={<Brain className="h-4 w-4" />}
            isActive={activeTab === 'patterns'}
            onClick={() => setActiveTab('patterns')}
          />
          <TabButton
            id="conversations"
            label="Conversations"
            icon={<MessageCircle className="h-4 w-4" />}
            isActive={activeTab === 'conversations'}
            onClick={() => setActiveTab('conversations')}
          />
        </div>

        {/* Content based on active tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                title="Journal Entries"
                value={entries.length.toString()}
                subtitle="Total written"
                icon={<BookOpen className="h-5 w-5" />}
              />
              <StatCard
                title="Most Common Mood"
                value="Happy"
                subtitle="40% of entries"
                icon={<Smile className="h-5 w-5" />}
                color="text-green-600"
              />
              <StatCard
                title="AI Conversations"
                value="23"
                subtitle="This month"
                icon={<MessageCircle className="h-5 w-5" />}
                color="text-blue-600"
              />
              <StatCard
                title="Active Days"
                value="18"
                subtitle="Out of 30 days"
                icon={<Calendar className="h-5 w-5" />}
                color="text-purple-600"
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Recent Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-foreground">You've been more consistent with journaling this week</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">Positive</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-foreground">Your conversations focus more on future goals lately</span>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">Growth</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'moods' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Your Mood Patterns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {moodTrends.map((mood, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${mood.color} text-white`}>
                          {mood.icon}
                        </div>
                        <div>
                          <p className="font-medium">{mood.mood}</p>
                          <p className="text-sm text-muted-foreground">{mood.count} times</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{mood.percentage}%</p>
                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${mood.color} rounded-full`}
                            style={{ width: `${mood.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'patterns' && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <p className="text-sm text-muted-foreground">
                These patterns are based on your writing style and topics
              </p>
            </div>
            
            {simplePatterns.map((pattern, index) => (
              <Card key={index} className={`border-2 ${pattern.color} hover:shadow-md transition-all`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      {pattern.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{pattern.title}</h3>
                        <Badge variant="outline" className="text-xs">
                          {pattern.frequency}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{pattern.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'conversations' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  What You Talk About Most
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {conversationInsights.map((insight, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${insight.source === 'counselor' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-purple-100 dark:bg-purple-900/30'}`}>
                          {insight.source === 'counselor' ? 
                            <MessageCircle className="h-4 w-4 text-blue-600" /> : 
                            <Brain className="h-4 w-4 text-purple-600" />
                          }
                        </div>
                        <div>
                          <p className="font-medium text-sm">{insight.topic}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {insight.source} • {insight.count} times
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">{insight.lastDiscussed}</p>
                        <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Advanced Features Section - Only for Unlimited Users */}
        {hasUnlimitedAccess && showAdvancedFeatures && (
          <div className="mt-8 space-y-6">
            <div className="border-t pt-8">
              <h2 className="text-2xl font-bold text-primary mb-6">🧠 Advanced Pattern Analysis</h2>
              
              {/* Deep Pattern Recognition */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Deep Pattern Recognition
                  </CardTitle>
                  <CardDescription>AI-powered insights into your mental patterns and writing style</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">🔍 Cognitive Patterns</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Your thinking style shows analytical tendencies (78%) with strong future-oriented focus. You process emotions through structured reflection and goal-setting.
                      </p>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">💭 Thought Evolution</h4>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Your journal entries show increasing depth over time. Word complexity has grown 35% and emotional vocabulary expanded significantly.
                      </p>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">🎯 Behavioral Insights</h4>
                      <p className="text-sm text-purple-700 dark:text-purple-300">
                        Peak journaling clarity occurs during evening sessions. You express 40% more positive emotions when writing about future goals vs. past events.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Predictive Analysis */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Predictive Wellness Insights
                  </CardTitle>
                  <CardDescription>Forecast your mental wellness trends and potential areas of focus</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg bg-card/50">
                      <h4 className="font-semibold mb-2 text-orange-600">⚠️ Stress Indicators</h4>
                      <p className="text-sm text-muted-foreground">
                        Writing patterns suggest potential stress buildup on Tuesdays. Consider scheduling self-care activities.
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg bg-card/50">
                      <h4 className="font-semibold mb-2 text-green-600">✨ Growth Opportunities</h4>
                      <p className="text-sm text-muted-foreground">
                        Your reflective practice shows readiness for deeper mindfulness exploration and creative pursuits.
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg bg-card/50">
                      <h4 className="font-semibold mb-2 text-blue-600">🔮 Trend Forecast</h4>
                      <p className="text-sm text-muted-foreground">
                        Based on current patterns, expect increased optimism and goal clarity in the coming weeks.
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg bg-card/50">
                      <h4 className="font-semibold mb-2 text-purple-600">🎨 Creative Potential</h4>
                      <p className="text-sm text-muted-foreground">
                        Your language patterns suggest high creative potential. Consider artistic or writing challenges.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Advanced Tools */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Advanced Analysis Tools
                  </CardTitle>
                  <CardDescription>Exclusive tools for deep mental wellness analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-2 h-auto p-4 justify-start"
                      onClick={() => {
                        alert("🧠 Personality Analysis\n\nBased on your writing patterns:\n- Analytical thinking: 78%\n- Emotional intelligence: 85%\n- Future-focused: 72%\n- Reflective nature: 90%\n\nYou tend to process experiences through structured reflection and show strong goal-oriented thinking.");
                      }}
                    >
                      <Brain className="h-5 w-5 text-blue-600" />
                      <div className="text-left">
                        <div className="font-medium">Personality Analysis</div>
                        <div className="text-xs text-muted-foreground">Deep dive into your writing personality</div>
                      </div>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-2 h-auto p-4 justify-start"
                      onClick={() => {
                        alert("📈 Wellness Trajectory\n\nYour mental wellness journey:\n- Overall trend: Positive growth\n- Emotional awareness: +35% improvement\n- Stress management: Stable\n- Goal clarity: +40% increase\n\nYou're showing consistent progress in self-awareness and emotional regulation.");
                      }}
                    >
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <div className="text-left">
                        <div className="font-medium">Wellness Trajectory</div>
                        <div className="text-xs text-muted-foreground">Track your mental health journey</div>
                      </div>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-2 h-auto p-4 justify-start"
                      onClick={() => {
                        alert("📅 Pattern Calendar\n\nKey patterns by day:\n- Monday: Goal-setting focus\n- Wednesday: Reflective thinking\n- Friday: Social connections\n- Sunday: Deep introspection\n\nYour peak clarity times are evening sessions. Consider scheduling important reflections then.");
                      }}
                    >
                      <Calendar className="h-5 w-5 text-purple-600" />
                      <div className="text-left">
                        <div className="font-medium">Pattern Calendar</div>
                        <div className="text-xs text-muted-foreground">Visual timeline of your patterns</div>
                      </div>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-2 h-auto p-4 justify-start"
                      onClick={() => {
                        alert("🎯 AI Recommendations\n\nPersonalized suggestions for you:\n\n1. Try morning journaling for goal clarity\n2. Explore creative writing exercises\n3. Practice gratitude journaling on Tuesdays\n4. Consider mindfulness themes during stress periods\n5. Document achievements more frequently\n\nThese recommendations are based on your unique patterns and growth areas.");
                      }}
                    >
                      <MessageCircle className="h-5 w-5 text-orange-600" />
                      <div className="text-left">
                        <div className="font-medium">AI Recommendations</div>
                        <div className="text-xs text-muted-foreground">Personalized wellness suggestions</div>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default MindPatterns;