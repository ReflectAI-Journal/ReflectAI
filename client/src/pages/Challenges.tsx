import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Target, Clock, Star, Play, CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Challenge {
  id: number;
  title: string;
  description: string;
  type: string;
  targetValue: number;
  duration: number;
  points: number;
  badgeIcon: string;
  badgeColor: string;
  isActive: boolean;
}

interface UserChallenge {
  id: number;
  userId: number;
  challengeId: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'expired';
  currentProgress: number;
  startedAt: Date | null;
  completedAt: Date | null;
  expiresAt: Date | null;
}

interface UserBadge {
  id: number;
  userId: number;
  challengeId: number;
  points: number;
  earnedAt: Date;
}

interface ChallengeStats {
  totalBadges: number;
  totalPoints: number;
  activeChallenges: number;
  completedChallenges: number;
}

export default function Challenges() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("available");

  // Fetch available challenges
  const { data: challenges = [], isLoading: challengesLoading } = useQuery<Challenge[]>({
    queryKey: ["/api/challenges"],
  });

  // Fetch user's active challenges
  const { data: userChallenges = [], isLoading: userChallengesLoading } = useQuery<UserChallenge[]>({
    queryKey: ["/api/challenges/user"],
  });

  // Fetch user's badges
  const { data: badges = [], isLoading: badgesLoading } = useQuery<UserBadge[]>({
    queryKey: ["/api/badges"],
  });

  // Fetch challenge stats
  const { data: stats, isLoading: statsLoading } = useQuery<ChallengeStats>({
    queryKey: ["/api/challenges/stats"],
  });

  // Start challenge mutation
  const startChallengeMutation = useMutation({
    mutationFn: (challengeId: number) => 
      apiRequest(`/api/challenges/${challengeId}/start`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/challenges/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/challenges/stats"] });
      toast({
        title: "Challenge Started!",
        description: "You've successfully started a new challenge. Good luck!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start challenge. Please try again.",
        variant: "destructive",
      });
    },
  });

  const formatChallengeType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getChallengeProgress = (challengeId: number) => {
    const userChallenge = userChallenges.find(uc => uc.challengeId === challengeId);
    return userChallenge || null;
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min(100, (current / target) * 100);
  };

  if (challengesLoading || userChallengesLoading || badgesLoading || statsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading challenges...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header with Stats */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="h-8 w-8 text-yellow-500" />
          <div>
            <h1 className="text-3xl font-bold">Wellness Challenges</h1>
            <p className="text-muted-foreground">Complete challenges to earn badges and track your progress</p>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <Trophy className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{stats.totalBadges}</div>
                <p className="text-sm text-muted-foreground">Badges Earned</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Star className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{stats.totalPoints}</div>
                <p className="text-sm text-muted-foreground">Total Points</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Target className="h-6 w-6 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{stats.activeChallenges}</div>
                <p className="text-sm text-muted-foreground">Active</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <CheckCircle className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{stats.completedChallenges}</div>
                <p className="text-sm text-muted-foreground">Completed</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="available">Available Challenges</TabsTrigger>
          <TabsTrigger value="active">My Challenges</TabsTrigger>
          <TabsTrigger value="badges">My Badges</TabsTrigger>
        </TabsList>

        {/* Available Challenges */}
        <TabsContent value="available" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map((challenge) => {
              const userProgress = getChallengeProgress(challenge.id);
              const isStarted = !!userProgress;
              const isCompleted = userProgress?.status === 'completed';

              return (
                <Card key={challenge.id} className="relative overflow-hidden">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{challenge.badgeIcon}</span>
                        <div>
                          <CardTitle className="text-lg">{challenge.title}</CardTitle>
                          <Badge variant="outline" className="mt-1">
                            {formatChallengeType(challenge.type)}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">{challenge.points}pts</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">
                      {challenge.description}
                    </CardDescription>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Target className="h-4 w-4" />
                        Goal: {challenge.targetValue} {challenge.type.includes('journal') ? 'entries' : 'actions'}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        Duration: {challenge.duration} days
                      </div>
                    </div>

                    {isStarted && userProgress ? (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{userProgress.currentProgress} / {challenge.targetValue}</span>
                        </div>
                        <Progress value={getProgressPercentage(userProgress.currentProgress, challenge.targetValue)} />
                        {isCompleted && (
                          <Badge className="w-full justify-center bg-green-500">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Completed!
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <Button 
                        onClick={() => startChallengeMutation.mutate(challenge.id)}
                        disabled={startChallengeMutation.isPending}
                        className="w-full"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Start Challenge
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Active Challenges */}
        <TabsContent value="active" className="space-y-4">
          {userChallenges.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Active Challenges</h3>
                <p className="text-muted-foreground mb-4">
                  Start some challenges from the Available tab to begin your wellness journey!
                </p>
                <Button onClick={() => setActiveTab("available")}>
                  Browse Challenges
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userChallenges.map((userChallenge) => {
                const challenge = challenges.find(c => c.id === userChallenge.challengeId);
                if (!challenge) return null;

                const progressPercentage = getProgressPercentage(userChallenge.currentProgress, challenge.targetValue);
                const daysLeft = userChallenge.expiresAt ? 
                  Math.max(0, Math.ceil((new Date(userChallenge.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0;

                return (
                  <Card key={userChallenge.id} className="relative">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{challenge.badgeIcon}</span>
                          <div>
                            <CardTitle className="text-lg">{challenge.title}</CardTitle>
                            <Badge 
                              variant={userChallenge.status === 'completed' ? 'default' : 'secondary'}
                              className="mt-1"
                            >
                              {userChallenge.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">{challenge.points}pts</div>
                          {daysLeft > 0 && (
                            <div className="text-sm text-muted-foreground">{daysLeft} days left</div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{userChallenge.currentProgress} / {challenge.targetValue}</span>
                        </div>
                        <Progress value={progressPercentage} />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Badges */}
        <TabsContent value="badges" className="space-y-4">
          {badges.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Badges Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Complete challenges to earn your first badge!
                </p>
                <Button onClick={() => setActiveTab("available")}>
                  Start a Challenge
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {badges.map((badge) => {
                const challenge = challenges.find(c => c.id === badge.challengeId);
                if (!challenge) return null;

                return (
                  <Card key={badge.id} className="text-center">
                    <CardContent className="p-6">
                      <div 
                        className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl"
                        style={{ backgroundColor: challenge.badgeColor + '20', color: challenge.badgeColor }}
                      >
                        {challenge.badgeIcon}
                      </div>
                      <h3 className="font-semibold mb-1">{challenge.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Earned {new Date(badge.earnedAt).toLocaleDateString()}
                      </p>
                      <Badge variant="outline">
                        {badge.points} points
                      </Badge>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}