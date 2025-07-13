import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Calendar, CheckCircle, ChevronRight, Clock, Lightbulb, Send, User, Bot } from "lucide-react";
import { format, parseISO, formatDistanceToNow } from "date-fns";
import { CheckIn } from "@shared/schema";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface CheckInWithContext extends CheckIn {
  isOverdue?: boolean;
  daysSince?: number;
}

function MemoryLane() {
  const [selectedCheckIn, setSelectedCheckIn] = useState<CheckInWithContext | null>(null);
  const [response, setResponse] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: checkIns = [], isLoading } = useQuery<CheckIn[]>({
    queryKey: ["/api/check-ins"],
  });

  const { data: pendingCheckIns = [] } = useQuery<CheckIn[]>({
    queryKey: ["/api/check-ins/pending"],
  });

  const { data: dailyStatus } = useQuery({
    queryKey: ["/api/check-ins/daily/status"],
  });

  const createDailyCheckInMutation = useMutation({
    mutationFn: async () => {
      const result = await fetch('/api/check-ins/daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!result.ok) throw new Error('Failed to create daily check-in');
      return result.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/check-ins"] });
      queryClient.invalidateQueries({ queryKey: ["/api/check-ins/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/check-ins/daily/status"] });
      toast({
        title: "Daily check-in created",
        description: "Your daily wellness check-in is ready for you.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create daily check-in. Please try again.",
        variant: "destructive",
      });
    }
  });

  const respondMutation = useMutation({
    mutationFn: async ({ checkInId, response }: { checkInId: number; response: string }) => {
      const result = await fetch(`/api/check-ins/${checkInId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response })
      });
      if (!result.ok) throw new Error('Failed to respond to check-in');
      return result.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/check-ins"] });
      queryClient.invalidateQueries({ queryKey: ["/api/check-ins/pending"] });
      setSelectedCheckIn(null);
      setResponse("");
      toast({
        title: "Response submitted",
        description: "Your check-in response has been recorded.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit response. Please try again.",
        variant: "destructive",
      });
    }
  });



  const getCheckInTypeIcon = (type: string) => {
    switch (type) {
      case 'philosopher': return '🤔';
      case 'daily_checkin': return '🌅';
      case 'follow_up': return '🔄';
      default: return '💭';
    }
  };

  const getCheckInTypeColor = (type: string) => {
    switch (type) {
      case 'philosopher': 
        return "bg-purple-100 text-purple-800 border-purple-200";
      case 'daily_checkin':
        return "bg-orange-100 text-orange-800 border-orange-200";
      case 'follow_up':
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const enhancedCheckIns: CheckInWithContext[] = checkIns.map(checkIn => {
    const scheduledDate = new Date(checkIn.scheduledDate);
    const now = new Date();
    const isOverdue = !checkIn.isAnswered && scheduledDate < now;
    const daysSince = Math.floor((now.getTime() - scheduledDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      ...checkIn,
      isOverdue,
      daysSince
    };
  });

  const handleSubmitResponse = () => {
    if (!selectedCheckIn || !response.trim()) return;
    
    respondMutation.mutate({
      checkInId: selectedCheckIn.id,
      response: response.trim()
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-10">
      {/* Header */}
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="font-header text-4xl font-bold text-foreground tracking-tight">Daily Check-ins</h1>
          <div className="w-16 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full"></div>
        </div>
        <p className="text-muted-foreground text-lg max-w-3xl mx-auto leading-relaxed">
          Stay connected with your mental wellness journey through daily check-ins and continue meaningful conversations with your AI counselor.
        </p>
      </div>

      {/* Daily Check-in Section */}
      <div className="space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-orange-50 to-yellow-50 px-6 py-3 rounded-full border border-orange-200/50">
            <span className="text-2xl">🌅</span>
            <h2 className="font-header text-xl font-semibold text-orange-800">Today's Wellness Check-in</h2>
          </div>
        </div>
        
        {dailyStatus?.canCreateNew ? (
          <Card className="border-2 border-dashed border-orange-300/60 bg-gradient-to-br from-orange-50/50 to-yellow-50/50 max-w-lg mx-auto hover-lift transition-all duration-300">
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="bg-gradient-to-br from-orange-100 to-yellow-100 p-4 rounded-full shadow-sm">
                    <span className="text-3xl">🌟</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-header text-xl font-semibold text-foreground">Ready for your daily reflection?</h3>
                  <p className="text-muted-foreground text-base leading-relaxed">
                    Take a moment to connect with yourself. Share how you're feeling today with your AI counselor, who's here to listen and provide personalized support.
                  </p>
                  <Button 
                    onClick={() => createDailyCheckInMutation.mutate()}
                    disabled={createDailyCheckInMutation.isPending}
                    className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-medium px-8 py-3 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg"
                  >
                    {createDailyCheckInMutation.isPending ? "Creating..." : "Begin Daily Check-in"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : dailyStatus?.hasCompletedToday ? (
          <Card className="border-green-300/60 bg-gradient-to-br from-green-50/70 to-emerald-50/70 max-w-lg mx-auto">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="space-y-1">
                  <p className="text-green-800 font-semibold text-lg">Daily check-in completed!</p>
                  <p className="text-green-700 text-sm leading-relaxed">
                    You've completed your wellness check-in for today. Keep up the excellent self-care routine!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>

      {/* Pending Check-ins */}
      {pendingCheckIns.length > 0 && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-orange-50 to-red-50 px-6 py-3 rounded-full border border-orange-200/50">
              <Clock className="h-5 w-5 text-orange-500" />
              <h2 className="font-header text-xl font-semibold text-orange-800">Awaiting Your Response</h2>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-300">
                {pendingCheckIns.length}
              </Badge>
            </div>
          </div>
          <div className="grid gap-6 max-w-4xl mx-auto">
            {pendingCheckIns.map((checkIn) => (
              <motion.div
                key={checkIn.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-orange-200/60 bg-gradient-to-br from-orange-50/40 to-yellow-50/40 hover:border-orange-300 hover-lift" 
                      onClick={() => setSelectedCheckIn({ ...checkIn, isOverdue: true })}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getCheckInTypeIcon(checkIn.type)}</span>
                        <div className="space-y-1">
                          <Badge variant="outline" className={`${getCheckInTypeColor(checkIn.type)} font-medium`}>
                            {checkIn.type === 'philosopher' ? 'Philosopher' : 
                             checkIn.type === 'daily_checkin' ? 'Daily Check-in' :
                             checkIn.type === 'follow_up' ? 'Follow-up' : 'Counselor'}
                          </Badge>
                          <p className="text-sm text-muted-foreground">
                            {formatDistanceToNow(parseISO(checkIn.scheduledDate), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground opacity-60" />
                    </div>
                    <div className="space-y-3">
                      <p className="text-foreground font-medium text-base leading-relaxed">
                        {checkIn.question}
                      </p>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                        <p className="text-orange-600 font-medium text-sm">
                          Tap to respond
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* All Check-ins */}
      <div className="space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-3 rounded-full border border-blue-200/50">
            <MessageCircle className="h-5 w-5 text-blue-500" />
            <h2 className="font-header text-xl font-semibold text-blue-800">Conversation History</h2>
          </div>
        </div>
        <div className="grid gap-5 max-w-4xl mx-auto">
          {enhancedCheckIns.map((checkIn) => (
            <motion.div
              key={checkIn.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className={`hover:shadow-lg transition-all duration-300 cursor-pointer hover-lift ${
                checkIn.isOverdue ? 'border-orange-200/60 bg-gradient-to-br from-orange-50/40 to-yellow-50/40' : 
                checkIn.isAnswered ? 'border-green-200/60 bg-gradient-to-br from-green-50/40 to-emerald-50/40' : 'border-muted bg-card/50'
              }`} 
                    onClick={() => setSelectedCheckIn(checkIn)}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getCheckInTypeIcon(checkIn.type)}</span>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className={`${getCheckInTypeColor(checkIn.type)} font-medium`}>
                            {checkIn.type === 'philosopher' ? 'Philosopher' : 
                             checkIn.type === 'daily_checkin' ? 'Daily Check-in' :
                             checkIn.type === 'follow_up' ? 'Follow-up' : 'Counselor'}
                          </Badge>
                          {checkIn.isAnswered && (
                            <div className="flex items-center space-x-1">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-green-600 text-sm font-medium">Completed</span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {format(parseISO(checkIn.scheduledDate), "EEEE, MMMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground opacity-60" />
                  </div>
                  <div className="space-y-3">
                    <p className="text-foreground font-medium text-base leading-relaxed line-clamp-2">
                      {checkIn.question}
                    </p>
                    <p className="text-sm font-medium">
                      {checkIn.isAnswered ? (
                        <span className="text-green-600">
                          Answered {formatDistanceToNow(parseISO(checkIn.scheduledDate), { addSuffix: true })}
                        </span>
                      ) : checkIn.isOverdue ? (
                        <span className="text-orange-600">
                          Overdue by {checkIn.daysSince} day{checkIn.daysSince !== 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          Scheduled for {format(parseISO(checkIn.scheduledDate), "MMM d")}
                        </span>
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Check-in Detail Modal */}
      {selectedCheckIn && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 modal-overlay">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-background rounded-xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden modal-content border border-border/50"
          >
            <div className="p-8 border-b border-border/50 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getCheckInTypeIcon(selectedCheckIn.type)}</span>
                    <Badge variant="outline" className={`${getCheckInTypeColor(selectedCheckIn.type)} font-medium px-3 py-1`}>
                      {selectedCheckIn.type === 'philosopher' ? 'Philosopher' : 
                       selectedCheckIn.type === 'daily_checkin' ? 'Daily Check-in' :
                       selectedCheckIn.type === 'follow_up' ? 'Follow-up' : 'Counselor'}
                    </Badge>
                  </div>
                  <h3 className="font-header text-xl font-semibold text-foreground">
                    {format(parseISO(selectedCheckIn.scheduledDate), "EEEE, MMMM d, yyyy")}
                  </h3>
                </div>
                <Button 
                  variant="ghost" 
                  size="lg"
                  onClick={() => setSelectedCheckIn(null)}
                  className="text-muted-foreground hover:text-foreground transition-colors -mt-2 -mr-2"
                >
                  ✕
                </Button>
              </div>
            </div>
            <ScrollArea className="max-h-[60vh] p-8">
              <div className="space-y-8">
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Bot className="h-5 w-5 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-foreground text-lg">Question from your AI counselor</h4>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 p-6 rounded-xl border border-blue-200/50">
                    <p className="text-foreground whitespace-pre-wrap leading-relaxed text-base">
                      {selectedCheckIn.question}
                    </p>
                  </div>
                </div>
                
                {selectedCheckIn.isAnswered && selectedCheckIn.userResponse && (
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-green-100 rounded-full">
                        <User className="h-5 w-5 text-green-600" />
                      </div>
                      <h4 className="font-semibold text-foreground text-lg">Your Response</h4>
                    </div>
                    <div className="bg-gradient-to-br from-green-50/80 to-emerald-50/80 p-6 rounded-xl border border-green-200/50">
                      <p className="text-foreground whitespace-pre-wrap leading-relaxed text-base">
                        {selectedCheckIn.userResponse}
                      </p>
                    </div>
                  </div>
                )}
                
                {selectedCheckIn.isAnswered && selectedCheckIn.aiFollowUp && (
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-purple-100 rounded-full">
                        <Bot className="h-5 w-5 text-purple-600" />
                      </div>
                      <h4 className="font-semibold text-foreground text-lg">AI Follow-up</h4>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50/80 to-indigo-50/80 p-6 rounded-xl border border-purple-200/50">
                      <p className="text-foreground whitespace-pre-wrap leading-relaxed text-base">
                        {selectedCheckIn.aiFollowUp}
                      </p>
                    </div>
                  </div>
                )}
                
                {!selectedCheckIn.isAnswered && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-foreground text-lg mb-4">Share your thoughts</h4>
                      <Textarea
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                        placeholder="Take your time to reflect and share what's on your mind..."
                        className="min-h-[150px] text-base leading-relaxed p-4 border-2 focus:border-primary/50 transition-colors"
                      />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4 border-t border-border/50">
                      <Button 
                        variant="outline" 
                        onClick={() => setSelectedCheckIn(null)}
                        className="px-6 py-3"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSubmitResponse}
                        disabled={!response.trim() || respondMutation.isPending}
                        className="px-8 py-3 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-medium transition-all duration-200"
                      >
                        {respondMutation.isPending ? (
                          <>Submitting...</>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Submit Response
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </motion.div>
        </div>
      )}

      {/* Empty State */}
      {checkIns.length === 0 && (
        <Card className="text-center py-16 max-w-2xl mx-auto bg-gradient-to-br from-muted/30 to-accent/10 border-dashed border-2 border-muted-foreground/20">
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <div className="p-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full">
                <MessageCircle className="h-12 w-12 text-blue-500" />
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="font-header text-xl font-semibold text-foreground">Your conversation history will appear here</h3>
              <p className="text-muted-foreground text-base leading-relaxed max-w-lg mx-auto">
                Start chatting with your AI counselor or philosopher. When they ask meaningful questions, 
                they'll follow up with you in a few days to continue the conversation and deepen your reflections.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default MemoryLane;