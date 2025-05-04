import React from 'react';
import { useLocation } from 'wouter';
import { ChatProvider } from '@/contexts/ChatContext';
import { Brain, BookOpen, Lightbulb, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Sidebar from '@/components/layout/Sidebar';
import PhilosopherChat from '@/components/philosopher/PhilosopherChat';

const philosophicalTopics = [
  {
    category: "Existence",
    icon: <Brain className="h-5 w-5" />,
    questions: [
      "What is the meaning of life?",
      "How do we find purpose in a seemingly random universe?",
      "Is there an objective reality, or is everything subjective?",
      "How do we reconcile our mortality with our desire for significance?"
    ]
  },
  {
    category: "Ethics",
    icon: <BookOpen className="h-5 w-5" />,
    questions: [
      "What makes an action morally good or bad?",
      "Do moral truths exist independently of culture and time?",
      "How do we balance personal happiness with moral duty?",
      "Is it better to be just or to appear just?"
    ]
  },
  {
    category: "Knowledge",
    icon: <Lightbulb className="h-5 w-5" />,
    questions: [
      "How do we know what we claim to know?",
      "What are the limits of human understanding?",
      "Is certainty possible, or are all beliefs tentative?",
      "How should we respond to the unknown?"
    ]
  },
  {
    category: "Consciousness",
    icon: <MessageCircle className="h-5 w-5" />,
    questions: [
      "What is the nature of consciousness?",
      "How does the mind relate to the physical world?",
      "Could artificial intelligence ever be truly conscious?",
      "Are we more than our thoughts and memories?"
    ]
  }
];

const PhilosopherPage: React.FC = () => {
  const [, setLocation] = useLocation();
  
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Sidebar />
      
      <div className="flex-1 p-6 md:p-8 lg:p-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center mb-8">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-purple-500 to-purple-700 flex items-center justify-center text-white mr-4 shadow-md">
              <Brain className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-header font-bold mb-2">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-purple-700">
                  Philosopher AI
                </span>
              </h1>
              <p className="text-muted-foreground">
                Engage in deep philosophical discourse and explore life's profound questions
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column with philosophical topics */}
            <div className="lg:col-span-1">
              <Card className="shadow-sm h-full">
                <CardHeader>
                  <CardTitle>Philosophical Inquiry</CardTitle>
                  <CardDescription>
                    Explore these thought-provoking questions or ask your own
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Tabs defaultValue="Existence">
                    <TabsList className="grid grid-cols-4 mb-4">
                      {philosophicalTopics.map(topic => (
                        <TabsTrigger key={topic.category} value={topic.category}>
                          {topic.icon}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    
                    {philosophicalTopics.map(topic => (
                      <TabsContent key={topic.category} value={topic.category} className="space-y-4">
                        <h3 className="text-lg font-medium mb-3 flex items-center">
                          {topic.icon}
                          <span className="ml-2">{topic.category}</span>
                        </h3>
                        <ul className="space-y-3">
                          {topic.questions.map((question, idx) => (
                            <li key={idx}>
                              <button
                                className="w-full text-left p-3 rounded-md hover:bg-accent/50 transition-colors text-sm"
                                onClick={() => {
                                  // This would be handled by the ChatContext in the real app
                                  // Here we just simulate the behavior
                                  const chatArea = document.getElementById('philosopher-chat-input');
                                  if (chatArea instanceof HTMLTextAreaElement) {
                                    chatArea.value = question;
                                    chatArea.focus();
                                  }
                                }}
                              >
                                {question}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>
            </div>
            
            {/* Right column with chat */}
            <div className="lg:col-span-2">
              <ChatProvider>
                <PhilosopherChat />
              </ChatProvider>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhilosopherPage;