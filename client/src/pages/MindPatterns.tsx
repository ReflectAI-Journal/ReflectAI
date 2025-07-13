import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import BackButton from '@/components/layout/BackButton';
import { useUpgrade } from "@/contexts/UpgradeContext";
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
  const [activeTab, setActiveTab] = useState<'overview' | 'moods' | 'patterns' | 'conversations'>('overview');

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
      color: 'bg-blue-100 border-blue-300',
      icon: <Calendar className="h-5 w-5 text-blue-600" />
    },
    {
      title: 'Goal-Oriented Thinking',
      description: 'Your entries often mention plans and future aspirations',
      frequency: 'Common',
      color: 'bg-green-100 border-green-300',
      icon: <TrendingUp className="h-5 w-5 text-green-600" />
    },
    {
      title: 'Social Connections',
      description: 'You frequently write about relationships and interactions',
      frequency: 'Moderate',
      color: 'bg-purple-100 border-purple-300',
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
      <div className="w-full p-6 overflow-y-auto" style={{ maxHeight: "calc(100vh - 136px)" }}>
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
          
          <Button
            onClick={() => showUpgradeModal({
              featureName: 'Advanced Pattern Analysis',
              requiredPlan: 'Unlimited',
              description: 'Unlock AI-powered deep pattern recognition, predictive insights, and personalized mental wellness recommendations.'
            })}
            className="flex items-center gap-2"
            variant="outline"
            size="sm"
          >
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Advanced</span>
          </Button>
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
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">You've been more consistent with journaling this week</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">Positive</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Your conversations focus more on future goals lately</span>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">Growth</Badge>
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
                        <div className={`p-2 rounded-full ${insight.source === 'counselor' ? 'bg-blue-100' : 'bg-purple-100'}`}>
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
      </div>
    </div>
  );
};

export default MindPatterns;