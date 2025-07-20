import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Search, FileText, HelpCircle, MessageSquare, AlertTriangle } from 'lucide-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

const Help = () => {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      id: 'faq-1',
      question: 'How do I start journaling?',
      answer: 'Navigate to the Home screen where you\'ll find the journal editor. Simply start typing your thoughts in the text area provided. You can save your entry by clicking the "Save Journal Entry" button. The AI will provide a reflection once your entry is saved.'
    },
    {
      id: 'faq-2',
      question: 'How does the AI analyze my journal entries?',
      answer: 'ReflectAI uses advanced natural language processing to understand the content and sentiment of your entries. It then generates thoughtful reflections to help you gain insight into your thoughts and feelings. Your data is processed securely and kept private.'
    },
    {
      id: 'faq-3',
      question: 'Can I export my journal entries?',
      answer: 'Yes, you can export your journal entries by clicking the "Export Journal" button in the journal editor. This will download all your entries as a text file that you can keep as a backup or print.'
    },
    {
      id: 'faq-4',
      question: 'What are Check-ins?',
      answer: 'Check-ins are follow-up questions from your AI counselor and philosopher based on your conversations. When they ask you questions during chats, they schedule check-ins a few days later to continue the dialogue and deepen your reflections.'
    },
    {
      id: 'faq-5',
      question: 'How do I set and track goals?',
      answer: 'Go to the Goals section by clicking on "Goals" in the navigation menu. There you can create new goals, set timeframes, and log activities related to your goals. The app will visualize your progress and time spent on each goal.'
    },
    {
      id: 'faq-6',
      question: 'What\'s the difference between Chat and Philosopher?',
      answer: 'The Chat feature provides general advice, emotional support, and productivity coaching in a conversational format. The Philosopher feature offers deeper reflections and insights in the style of various philosophical traditions.'
    },
    {
      id: 'faq-7',
      question: 'Can I customize the AI personalities?',
      answer: 'Yes, you can select from several built-in personality types like Stoic, Socratic, Zen, etc. You can also create custom personalities with specific instructions on how you\'d like the AI to respond to you.'
    },
    {
      id: 'faq-8',
      question: 'How secure is my journal data?',
      answer: 'Your data is stored securely and encrypted. We do not share your journal entries with third parties, and all AI processing is done with privacy in mind. You can export and delete your data at any time.'
    }
  ];

  const guides = [
    {
      id: 'guide-1',
      title: 'Getting Started with ReflectAI',
      content: 'Welcome to ReflectAI, your personal journaling companion. This guide will help you navigate the essential features of the application.\n\n1. **Home Screen**: This is where you write your daily journal entries. The AI will provide reflections on your writing.\n\n2. **Stats**: View analytics about your journaling habits, including streaks and mood trends.\n\n3. **Archives**: Access past journal entries organized by month and year.\n\n4. **Check-ins**: Receive follow-up questions from your AI counselor and philosopher to continue conversations and deepen reflections.\n\n5. **Goals**: Set and track personal goals with visual progress indicators.\n\n6. **Chat**: Have conversations with the AI for emotional support or productivity advice.\n\n7. **Philosopher**: Engage in deeper philosophical discussions with AI personalities.'
    },
    {
      id: 'guide-2',
      title: 'Effective Journaling Techniques',
      content: 'Make the most of your journaling practice with these proven techniques:\n\n1. **Stream of Consciousness**: Write without censoring, letting thoughts flow freely.\n\n2. **Gratitude Journaling**: List things you\'re thankful for each day.\n\n3. **Prompted Reflection**: Use the suggested prompts to inspire deeper reflection.\n\n4. **Goal Setting**: Document your aspirations and track progress over time.\n\n5. **Emotional Awareness**: Label and explore your feelings in your entries.\n\n6. **Challenge Examination**: Analyze difficulties and brainstorm solutions.\n\n7. **Achievement Celebration**: Record and celebrate your wins, no matter how small.'
    }
  ];

  // Filter FAQs and guides based on search query
  const filteredFAQs = searchQuery
    ? faqs.filter(faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqs;

  const filteredGuides = searchQuery
    ? guides.filter(guide => 
        guide.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        guide.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : guides;

  return (
    <div className="container max-w-4xl mx-auto p-6 md:p-8 lg:p-10">
      <div className="flex items-center mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/app/counselor')}
          className="mr-4"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold text-primary">Help & Documentation</h1>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search for help topics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-card"
        />
      </div>

      <Tabs defaultValue="faq">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="faq" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            <span>FAQ</span>
          </TabsTrigger>
          <TabsTrigger value="guides" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>Guides</span>
          </TabsTrigger>
          <TabsTrigger value="terms" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Terms & Policies</span>
          </TabsTrigger>
        </TabsList>
        
        {/* FAQ Tab */}
        <TabsContent value="faq" className="space-y-4">
          {filteredFAQs.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {filteredFAQs.map((faq) => (
                <AccordionItem value={faq.id} key={faq.id}>
                  <AccordionTrigger className="text-left font-medium hover:text-primary">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="h-8 w-8 mx-auto text-amber-500 mb-2" />
              <h3 className="text-lg font-medium">No results found</h3>
              <p className="text-muted-foreground">Try a different search term or browse our guides</p>
            </div>
          )}
        </TabsContent>
        
        {/* Guides Tab */}
        <TabsContent value="guides" className="space-y-6">
          {filteredGuides.length > 0 ? (
            filteredGuides.map((guide) => (
              <div key={guide.id} className="bg-card rounded-xl p-6 border border-border/40">
                <h3 className="text-xl font-semibold mb-3">{guide.title}</h3>
                <div className="text-muted-foreground whitespace-pre-line">
                  {guide.content}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="h-8 w-8 mx-auto text-amber-500 mb-2" />
              <h3 className="text-lg font-medium">No guides found</h3>
              <p className="text-muted-foreground">Try a different search term or check our FAQ section</p>
            </div>
          )}
        </TabsContent>
        
        {/* Terms Tab */}
        <TabsContent value="terms" className="space-y-6">
          <div className="bg-card rounded-xl p-6 border border-border/40">
            <h3 className="text-xl font-semibold mb-4">Terms of Service</h3>
            <div className="prose prose-sm dark:prose-invert">
              <h4>Last Updated: May 4, 2025</h4>
              
              <p>Welcome to ReflectAI. By accessing or using our service, you agree to be bound by these Terms of Service.</p>
              
              <h5 className="mt-4">1. Acceptance of Terms</h5>
              <p>By accessing or using ReflectAI, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.</p>
              
              <h5 className="mt-4">2. Description of Service</h5>
              <p>ReflectAI provides an AI-powered journaling platform that allows users to record thoughts, receive AI-generated reflections, track goals, and engage in AI conversations.</p>
              
              <h5 className="mt-4">3. User Accounts</h5>
              <p>To use certain features of ReflectAI, you may be required to create an account. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.</p>
              
              <h5 className="mt-4">4. User Content</h5>
              <p>You retain ownership of the content you create, including journal entries, goals, and chat messages. By using ReflectAI, you grant us a license to store, process, and analyze your content solely for the purpose of providing and improving our services.</p>
              
              <h5 className="mt-4">5. Prohibited Uses</h5>
              <p>You may not use ReflectAI for any illegal or unauthorized purpose. You must not attempt to breach or circumvent any security features of the service.</p>
              
              <h5 className="mt-4">6. Termination</h5>
              <p>We reserve the right to terminate or suspend your account and access to ReflectAI at our sole discretion, without notice, for conduct that we believe violates these Terms of Service or is harmful to other users, us, or third parties, or for any other reason.</p>
              
              <h5 className="mt-4">7. Changes to Terms</h5>
              <p>We reserve the right to modify these terms at any time. We will provide notice of significant changes to these terms by posting the new Terms of Service on our website or through the application.</p>
              
              <h5 className="mt-4">8. Contact</h5>
              <p>If you have any questions about these Terms, please contact us at: reflectaifeedback@gmail.com</p>
            </div>
          </div>
          
          <div className="bg-card rounded-xl p-6 border border-border/40">
            <h3 className="text-xl font-semibold mb-4">Privacy Policy</h3>
            <div className="prose prose-sm dark:prose-invert">
              <h4>Last Updated: May 4, 2025</h4>
              
              <p>Your privacy is important to us. This Privacy Policy explains how we collect, use, and safeguard your information when you use ReflectAI.</p>
              
              <h5 className="mt-4">1. Information We Collect</h5>
              <p>We collect information you provide directly to us, including account information, journal entries, goals, and chat messages. We also collect usage data and device information.</p>
              
              <h5 className="mt-4">2. How We Use Your Information</h5>
              <p>We use your information to provide, maintain, and improve ReflectAI, including generating AI responses to your journal entries and chat messages. We may use aggregated, anonymized data for research and analytics purposes.</p>
              
              <h5 className="mt-4">3. Data Security</h5>
              <p>We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure.</p>
              
              <h5 className="mt-4">4. Data Retention</h5>
              <p>We retain your personal information for as long as your account is active or as needed to provide you with our services. You can request the deletion of your data at any time.</p>
              
              <h5 className="mt-4">5. Your Rights</h5>
              <p>Depending on your location, you may have rights to access, correct, delete, or restrict the processing of your personal information. You can export your journal data at any time using the export feature.</p>
              
              <h5 className="mt-4">6. Changes to Privacy Policy</h5>
              <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.</p>
              
              <h5 className="mt-4">7. Contact</h5>
              <p>If you have any questions about this Privacy Policy, please contact us at: reflectaifeedback@gmail.com</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Contact Support */}
      <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl p-6 border border-blue-100 dark:border-blue-900">
        <div className="flex items-center gap-4">
          <div className="bg-blue-100 dark:bg-blue-900/50 rounded-full p-3">
            <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium">Need more help?</h3>
            <p className="text-muted-foreground">Contact our support team for assistance</p>
          </div>
          <Button 
            className="ml-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            onClick={() => window.open('mailto:reflectaifeedback@gmail.com', '_blank')}
          >
            Contact Support
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Help;