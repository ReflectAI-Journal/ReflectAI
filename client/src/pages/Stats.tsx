import { useQuery } from "@tanstack/react-query";
// Sidebar removed as requested
import BackButton from "@/components/layout/BackButton";
import StatsCards from "@/components/journal/StatsCards";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { JournalStats } from "@/types/journal";

const Stats = () => {
  // Fetch journal stats
  const { data: stats, isLoading: statsLoading } = useQuery<JournalStats>({
    queryKey: ["/api/stats"],
  });
  
  // Fetch all journal entries
  const { data: entries = [], isLoading: entriesLoading } = useQuery({
    queryKey: ["/api/entries"],
  });
  
  // Process mood data for pie chart
  const moodData = !statsLoading && stats?.topMoods 
    ? Object.entries(stats.topMoods)
        .map(([name, count]) => ({ name, value: count }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5)
    : [];
  
  // Custom colors for mood chart
  const MOOD_COLORS = ['#546e7a', '#78909c', '#a7c0cd', '#4db6ac', '#80cbc4'];
  
  // Process daily entries for last 14 days
  const last14Days = eachDayOfInterval({
    start: subDays(new Date(), 13),
    end: new Date()
  });
  
  const activityData = last14Days.map(date => {
    const dateString = format(date, 'yyyy-MM-dd');
    const count = entries.filter(entry => 
      format(new Date(entry.date), 'yyyy-MM-dd') === dateString
    ).length;
    
    return {
      date: format(date, 'MMM d'),
      count
    };
  });
  
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
        
        {/* Additional Stats Info */}
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
