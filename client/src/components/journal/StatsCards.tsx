import { Card, CardContent } from "@/components/ui/card";
import { JournalStats } from "@/types/journal";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsCardsProps {
  stats?: JournalStats;
  isLoading: boolean;
}

const StatsCards = ({ stats, isLoading }: StatsCardsProps) => {
  const statsItems = [
    {
      title: "Total Entries",
      value: stats?.entriesCount || 0,
      icon: "fas fa-book",
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Current Streak",
      value: `${stats?.currentStreak || 0} days`,
      icon: "fas fa-fire",
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    },
    {
      title: "Longest Streak",
      value: `${stats?.longestStreak || 0} days`,
      icon: "fas fa-trophy",
      color: "text-amber-600",
      bgColor: "bg-amber-100"
    },
    {
      title: "Top Mood",
      value: stats?.topMoods && Object.keys(stats.topMoods).length > 0
        ? Object.entries(stats.topMoods).sort((a, b) => b[1] - a[1])[0][0]
        : "None yet",
      icon: "fas fa-smile",
      color: "text-green-600",
      bgColor: "bg-green-100"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {isLoading ? (
        // Skeleton loading state
        Array(4).fill(0).map((_, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-6 w-[80px]" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        // Actual stats cards
        statsItems.map((item, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className={`w-12 h-12 rounded-full ${item.bgColor} flex items-center justify-center ${item.color} mr-4`}>
                  <i className={`${item.icon} text-xl`}></i>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{item.title}</p>
                  <p className="text-2xl font-semibold">{item.value}</p>
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
