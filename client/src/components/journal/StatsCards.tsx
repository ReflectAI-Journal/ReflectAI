import { Card, CardContent } from "@/components/ui/card";
import { JournalStats } from "@/types/journal";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Flame, Trophy, Smile } from "lucide-react";

interface StatsCardsProps {
  stats?: JournalStats;
  isLoading: boolean;
}

const StatsCards = ({ stats, isLoading }: StatsCardsProps) => {
  const statsItems = [
    {
      title: "Total Entries",
      value: stats?.entriesCount || 0,
      icon: <BookOpen className="h-5 w-5" />,
      gradient: "from-primary/90 to-primary-dark",
      textGradient: "from-primary to-primary-light"
    },
    {
      title: "Current Streak",
      value: `${stats?.currentStreak || 0} days`,
      icon: <Flame className="h-5 w-5" />,
      gradient: "from-orange-500 to-amber-600",
      textGradient: "from-orange-500 to-amber-500"
    },
    {
      title: "Longest Streak",
      value: `${stats?.longestStreak || 0} days`,
      icon: <Trophy className="h-5 w-5" />,
      gradient: "from-amber-500 to-yellow-600",
      textGradient: "from-amber-500 to-yellow-500"
    },
    {
      title: "Top Mood",
      value: stats?.topMoods && Object.keys(stats.topMoods).length > 0
        ? Object.entries(stats.topMoods).sort((a, b) => b[1] - a[1])[0][0]
        : "None yet",
      icon: <Smile className="h-5 w-5" />,
      gradient: "from-secondary to-secondary/70",
      textGradient: "from-secondary to-purple-400"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {isLoading ? (
        // Skeleton loading state
        Array(4).fill(0).map((_, index) => (
          <Card key={index} className="border border-border/50 overflow-hidden rounded-lg shadow-journal">
            <div className="h-1 w-full bg-muted"></div>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-7 w-[80px]" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        // Actual stats cards
        statsItems.map((item, index) => (
          <Card key={index} className="border border-border/50 overflow-hidden rounded-lg shadow-journal">
            <div className={`h-1 w-full bg-gradient-to-r ${item.gradient}`}></div>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white mr-4 shadow-sm`}>
                  {item.icon}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">{item.title}</p>
                  <p className={`text-2xl font-semibold font-header bg-gradient-to-r ${item.textGradient} bg-clip-text text-transparent`}>
                    {item.value}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default StatsCards;
