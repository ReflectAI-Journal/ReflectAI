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

  const getCheckInTypeColor = (type: string) => {
    return type === 'philosopher' 
      ? "bg-purple-100 text-purple-800 border-purple-200"
      : "bg-blue-100 text-blue-800 border-blue-200";
  };

  const getCheckInTypeIcon = (type: string) => {
    return type === 'philosopher' ? '🤔' : '💭';
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
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Check-ins</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Your AI counselor and philosopher check in with follow-up questions based on your conversations. 
          Continue the dialogue and deepen your reflections.
        </p>
      </div>

      {/* Pending Check-ins */}
      {pendingCheckIns.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-orange-500" />
            <h2 className="text-xl font-semibold text-gray-900">Pending Check-ins</h2>
            <Badge variant="destructive">{pendingCheckIns.length}</Badge>
          </div>
          <div className="grid gap-4">
            {pendingCheckIns.map((checkIn) => (
              <motion.div
                key={checkIn.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="hover:shadow-md transition-shadow cursor-pointer border-orange-200 bg-orange-50" 
                      onClick={() => setSelectedCheckIn({ ...checkIn, isOverdue: true })}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getCheckInTypeIcon(checkIn.type)}</span>
                        <Badge variant="outline" className={getCheckInTypeColor(checkIn.type)}>
                          {checkIn.type === 'philosopher' ? 'Philosopher' : 'Counselor'}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {formatDistanceToNow(parseISO(checkIn.scheduledDate), { addSuffix: true })}
                        </span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                    <p className="text-gray-700 font-medium mb-2">
                      {checkIn.question}
                    </p>
                    <p className="text-sm text-orange-600">
                      Ready for your response
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* All Check-ins */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <MessageCircle className="h-5 w-5 text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-900">All Check-ins</h2>
        </div>
        <div className="grid gap-4">
          {enhancedCheckIns.map((checkIn) => (
            <motion.div
              key={checkIn.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className={`hover:shadow-md transition-shadow cursor-pointer ${
                checkIn.isOverdue ? 'border-orange-200 bg-orange-50' : 
                checkIn.isAnswered ? 'border-green-200 bg-green-50' : 'border-gray-200'
              }`} 
                    onClick={() => setSelectedCheckIn(checkIn)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getCheckInTypeIcon(checkIn.type)}</span>
                      <Badge variant="outline" className={getCheckInTypeColor(checkIn.type)}>
                        {checkIn.type === 'philosopher' ? 'Philosopher' : 'Counselor'}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {format(parseISO(checkIn.scheduledDate), "MMM d, yyyy")}
                      </span>
                      {checkIn.isAnswered && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                  <p className="text-gray-700 font-medium mb-2">
                    {checkIn.question}
                  </p>
                  <p className="text-sm text-gray-500">
                    {checkIn.isAnswered ? (
                      `Answered ${formatDistanceToNow(parseISO(checkIn.scheduledDate), { addSuffix: true })}`
                    ) : checkIn.isOverdue ? (
                      `Overdue by ${checkIn.daysSince} day${checkIn.daysSince !== 1 ? 's' : ''}`
                    ) : (
                      `Scheduled for ${format(parseISO(checkIn.scheduledDate), "MMM d")}`
                    )}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Check-in Detail Modal */}
      {selectedCheckIn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden"
          >
            <div className="p-6 border-b">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{getCheckInTypeIcon(selectedCheckIn.type)}</span>
                    <Badge variant="outline" className={getCheckInTypeColor(selectedCheckIn.type)}>
                      {selectedCheckIn.type === 'philosopher' ? 'Philosopher' : 'Counselor'}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold">
                    {format(parseISO(selectedCheckIn.scheduledDate), "EEEE, MMMM d, yyyy")}
                  </h3>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedCheckIn(null)}
                >
                  ✕
                </Button>
              </div>
            </div>
            <ScrollArea className="max-h-96 p-6">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Bot className="h-4 w-4 text-blue-500" />
                    <h4 className="font-medium text-gray-900">Question</h4>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap bg-blue-50 p-3 rounded-lg">
                    {selectedCheckIn.question}
                  </p>
                </div>
                
                {selectedCheckIn.isAnswered && selectedCheckIn.userResponse && (
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="h-4 w-4 text-green-500" />
                      <h4 className="font-medium text-gray-900">Your Response</h4>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap bg-green-50 p-3 rounded-lg">
                      {selectedCheckIn.userResponse}
                    </p>
                  </div>
                )}
                
                {selectedCheckIn.isAnswered && selectedCheckIn.aiFollowUp && (
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Bot className="h-4 w-4 text-purple-500" />
                      <h4 className="font-medium text-gray-900">AI Follow-up</h4>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap bg-purple-50 p-3 rounded-lg">
                      {selectedCheckIn.aiFollowUp}
                    </p>
                  </div>
                )}
                
                {!selectedCheckIn.isAnswered && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Your Response</h4>
                      <Textarea
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                        placeholder="Share your thoughts on this question..."
                        className="min-h-[120px]"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setSelectedCheckIn(null)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSubmitResponse}
                        disabled={!response.trim() || respondMutation.isPending}
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
        <Card className="text-center py-12">
          <CardContent>
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Check-ins Yet</h3>
            <p className="text-gray-600 mb-6">
              Start chatting with your AI counselor or philosopher. When they ask questions, 
              they'll follow up with you in a few days to continue the conversation.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default MemoryLane;