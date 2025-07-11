import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Bot, User, Calendar, Sparkles } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface JournalEntry {
  id: number;
  title: string;
  content: string;
  date: string;
  moods: string[];
  aiResponse: string;
  isFavorite: boolean;
}

interface CheckIn {
  id: number;
  type: string;
  question: string;
  originalDate: string;
  scheduledDate: string;
  isAnswered: boolean;
  userResponse: string | null;
  aiFollowUp: string | null;
}

export default function ConversationHistory() {
  const { data: journalEntries = [], isLoading: entriesLoading } = useQuery<JournalEntry[]>({
    queryKey: ["/api/entries"],
  });

  const { data: checkIns = [], isLoading: checkInsLoading } = useQuery<CheckIn[]>({
    queryKey: ["/api/check-ins"],
  });

  if (entriesLoading || checkInsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading conversation history...</p>
          </div>
        </div>
      </div>
    );
  }

  const getTypeIcon = (type: string) => {
    return type === 'philosopher' ? <Sparkles className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />;
  };

  const getTypeColor = (type: string) => {
    return type === 'philosopher' 
      ? "bg-purple-100 text-purple-800 border-purple-200"
      : "bg-blue-100 text-blue-800 border-blue-200";
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Conversation History</h1>
        <p className="text-muted-foreground">
          Review your past conversations with your AI counselor and philosopher, and see how topics are followed up through check-ins.
        </p>
      </div>

      <Tabs defaultValue="journal" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="journal">Journal Conversations</TabsTrigger>
          <TabsTrigger value="checkins">Follow-up Check-ins</TabsTrigger>
        </TabsList>

        <TabsContent value="journal" className="space-y-6">
          <div className="space-y-4">
            {journalEntries.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Journal Conversations Yet</h3>
                  <p className="text-muted-foreground">
                    Start journaling to begin conversations with your AI counselor.
                  </p>
                </CardContent>
              </Card>
            ) : (
              journalEntries.map((entry) => (
                <Card key={entry.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="h-5 w-5" />
                          {format(parseISO(entry.date), 'MMMM d, yyyy')}
                        </CardTitle>
                        {entry.title && (
                          <CardDescription className="mt-1">
                            {entry.title}
                          </CardDescription>
                        )}
                      </div>
                      <Badge variant="outline">
                        Journal Entry
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* User's journal entry */}
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 bg-muted/50 rounded-lg p-3">
                        <p className="text-sm font-medium mb-1">You wrote:</p>
                        <p className="text-sm">{entry.content}</p>
                      </div>
                    </div>

                    {/* AI response */}
                    {entry.aiResponse && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <Bot className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1 bg-blue-50 rounded-lg p-3">
                          <p className="text-sm font-medium mb-1 text-blue-800">AI Counselor responded:</p>
                          <p className="text-sm text-blue-700">{entry.aiResponse}</p>
                        </div>
                      </div>
                    )}

                    {/* Moods if available */}
                    {entry.moods && entry.moods.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {entry.moods.map((mood, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {mood}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="checkins" className="space-y-6">
          <div className="space-y-4">
            {checkIns.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Check-ins Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Check-ins are created when the AI asks you specific questions during conversations.
                    They help continue important topics after a few days.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Try having a conversation with the Counselor or Philosopher to see how check-ins work!
                  </p>
                </CardContent>
              </Card>
            ) : (
              checkIns.map((checkIn) => (
                <Card key={checkIn.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {getTypeIcon(checkIn.type)}
                          Follow-up from {format(parseISO(checkIn.originalDate), 'MMM d')}
                        </CardTitle>
                        <CardDescription>
                          Scheduled for {format(parseISO(checkIn.scheduledDate), 'MMMM d, yyyy')}
                        </CardDescription>
                      </div>
                      <Badge className={getTypeColor(checkIn.type)}>
                        {checkIn.type === 'philosopher' ? 'Philosopher' : 'Counselor'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* AI Check-in Question */}
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1 bg-blue-50 rounded-lg p-3">
                        <p className="text-sm font-medium mb-1 text-blue-800">AI asked:</p>
                        <p className="text-sm text-blue-700">{checkIn.question}</p>
                      </div>
                    </div>

                    {/* User Response if answered */}
                    {checkIn.isAnswered && checkIn.userResponse && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 bg-muted/50 rounded-lg p-3">
                          <p className="text-sm font-medium mb-1">You responded:</p>
                          <p className="text-sm">{checkIn.userResponse}</p>
                        </div>
                      </div>
                    )}

                    {/* AI Follow-up if available */}
                    {checkIn.aiFollowUp && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <Bot className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1 bg-green-50 rounded-lg p-3">
                          <p className="text-sm font-medium mb-1 text-green-800">AI follow-up:</p>
                          <p className="text-sm text-green-700">{checkIn.aiFollowUp}</p>
                        </div>
                      </div>
                    )}

                    {/* Status */}
                    <div className="flex justify-between items-center">
                      <Badge variant={checkIn.isAnswered ? "default" : "secondary"}>
                        {checkIn.isAnswered ? "Answered" : "Pending Response"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}