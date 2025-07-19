import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import EmailPopup from '@/components/marketing/EmailPopup';
import CounselorQuestionnaire from '@/components/marketing/CounselorQuestionnaire';

// Import logo and app screenshots for showcase section
import logo from '@/assets/logo/reflectai-transparent.svg';
import journalPreview from '@/assets/new-screenshots/journal.png';
import statsPreview from '@/assets/new-screenshots/stats.png';
import chatPreview from '@/assets/new-screenshots/chat.png';
import emotionTimeline from '@/assets/new-screenshots/emotion-timeline.png';

const Landing = () => {
  const [, navigate] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);

  // Check if we should show the email popup
  useEffect(() => {
    // Wait 15 seconds before showing the popup
    const timer = setTimeout(() => {
      // Only show popup if user hasn't submitted their email before
      if (!localStorage.getItem('emailSubmitted')) {
        setShowEmailPopup(true);
      }
    }, 15000); // Show popup after 15 seconds

    return () => clearTimeout(timer);
  }, []);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 text-foreground overflow-hidden">
      {/* Email Popup - with AnimatePresence for smooth animations */}
      <AnimatePresence>
        {showEmailPopup && (
          <EmailPopup onClose={() => setShowEmailPopup(false)} />
        )}
      </AnimatePresence>

      {/* Counselor Questionnaire */}
      <AnimatePresence>
        {showQuestionnaire && (
          <CounselorQuestionnaire onClose={() => setShowQuestionnaire(false)} />
        )}
      </AnimatePresence>
      
      {/* Header */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-background/80 backdrop-blur-md shadow-md' : ''
        }`}
      >
        <div className="container mx-auto flex items-center justify-between p-4">
          <div className="flex items-center">
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-violet-600 bg-clip-text text-transparent">
              ReflectAI
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-muted-foreground hover:text-primary transition-colors">Features</a>
            <a href="#about" className="text-muted-foreground hover:text-primary transition-colors">About</a>
            <button onClick={() => navigate('/pricing')} className="text-muted-foreground hover:text-primary transition-colors">Pricing</button>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => navigate('/auth?tab=login')} 
              variant="ghost"
              className="hover:text-primary hover:bg-primary/10"
            >
              Login
            </Button>
            <Button 
              onClick={() => navigate('/pricing')}
              className="bg-gradient-to-r from-primary to-violet-600 hover:from-primary-dark hover:to-violet-700 text-white"
            >
              View Plans
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-32">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-500">
                    HEAL YOUR ANXIETY IN JUST SECONDS
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
                  Real emotional support without the $300 therapy bill
                </p>
                <div className="flex flex-col sm:flex-row gap-4 max-w-lg">
                  <Button 
                    onClick={() => setShowQuestionnaire(true)} 
                    size="lg"
                    className="bg-gradient-to-r from-primary to-violet-600 hover:from-primary-dark hover:to-violet-700 text-white btn-hover-lift btn-hover-glow"
                  >
                    Find My Personalized Counselor
                  </Button>
                  <Button 
                    onClick={() => navigate('/auth?tab=login')}
                    variant="outline" 
                    size="lg"
                    className="border-primary text-primary hover:bg-primary/10 btn-hover-lift"
                  >
                    I Already Have An Account
                  </Button>
                </div>
              </motion.div>
            </div>
            <div className="md:w-1/2 relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative max-w-md mx-auto"
              >
                <div className="w-full h-[400px] rounded-xl bg-gradient-to-br from-blue-500/10 to-violet-500/10 border border-border/40 shadow-2xl backdrop-blur-sm flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                  <div className="relative z-10 w-full h-full flex items-center justify-center p-6">
                    
                    {/* Chat Interface Mockup */}
                    <div className="w-full h-full rounded-lg bg-card border border-border/60 shadow-lg overflow-hidden flex flex-col">
                      {/* Chat Header */}
                      <div className="h-14 w-full bg-gradient-to-r from-primary/10 to-violet-500/10 flex items-center px-4 border-b border-border/50">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-violet-600 flex items-center justify-center text-white mr-3">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium text-sm">Dr. Sarah Chen</div>
                          <div className="text-xs text-green-500 flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                            Online
                          </div>
                        </div>
                      </div>
                      
                      {/* Chat Messages */}
                      <div className="flex-1 p-4 space-y-3 bg-muted/5">
                        {/* AI Message */}
                        <div className="flex items-start space-x-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-violet-600 flex items-center justify-center text-white text-xs">
                            AI
                          </div>
                          <div className="bg-muted/70 rounded-lg p-3 max-w-[80%] text-xs">
                            Hello! I'm here to support you. How are you feeling today?
                          </div>
                        </div>
                        
                        {/* User Message */}
                        <div className="flex items-start space-x-2 justify-end">
                          <div className="bg-primary/20 rounded-lg p-3 max-w-[80%] text-xs">
                            I've been feeling anxious about work lately
                          </div>
                          <div className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs">
                            U
                          </div>
                        </div>
                        
                        {/* AI Response */}
                        <div className="flex items-start space-x-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-violet-600 flex items-center justify-center text-white text-xs">
                            AI
                          </div>
                          <div className="bg-muted/70 rounded-lg p-3 max-w-[80%] text-xs">
                            That sounds challenging. Let's explore some strategies to help manage that anxiety. What specific aspects of work worry you most?
                          </div>
                        </div>
                      </div>
                      
                      {/* Chat Input */}
                      <div className="p-3 border-t border-border/50 bg-background/50">
                        <div className="flex items-center space-x-2 bg-muted/30 rounded-full px-3 py-2">
                          <div className="flex-1 h-4 bg-muted/50 rounded"></div>
                          <div className="w-6 h-6 bg-primary/30 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Floating elements for visual appeal */}
                  <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl"></div>
                  <div className="absolute -top-6 -left-6 w-24 h-24 bg-violet-500/20 rounded-full blur-2xl"></div>
                  
                  {/* Floating icons */}
                  <div className="absolute top-8 right-8 w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  
                  <div className="absolute bottom-8 left-8 w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                    </svg>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-500">
                Your AI Counselor Features
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience personalized mental health support with AI counseling that's available 24/7
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-card border border-border/40 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
                  <path d="M9 12l2 2 4-4"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">24/7 Emotional Support</h3>
              <p className="text-muted-foreground">
                Access your personal AI counselor anytime, anywhere. Get immediate emotional support and guidance whenever you need it most.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-card border border-border/40 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-violet-500/10 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-500">
                  <path d="M8 10a6 6 0 0 1 12 0v1a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-1z"/>
                  <path d="M2 10h4"/>
                  <path d="M18 10h4"/>
                  <path d="M12 2v4"/>
                  <path d="M12 18v4"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Personalized Guidance</h3>
              <p className="text-muted-foreground">
                Receive tailored advice and coping strategies based on your unique situation, emotions, and mental health needs.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-card border border-border/40 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Safe & Confidential</h3>
              <p className="text-muted-foreground">
                Share your thoughts in a completely private, judgment-free space. Your conversations are secure and confidential.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-card border border-border/40 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                  <path d="M21.5 2l-1.5 1.5"/>
                  <path d="M19 4l-1 1"/>
                  <path d="M6 12a6 6 0 0 0 12 0"/>
                  <path d="M12 2v4"/>
                  <path d="M12 18v4"/>
                  <path d="M7.5 4.2l-.8.8"/>
                  <path d="M16.5 4.2l.8.8"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Crisis Support</h3>
              <p className="text-muted-foreground">
                Get immediate help during difficult moments. Our AI provides compassionate support and resources when you need them most.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-card border border-border/40 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500">
                  <path d="M12 3v4"/>
                  <path d="M10 5h4"/>
                  <ellipse cx="12" cy="14" rx="3" ry="5"/>
                  <path d="M9 14a3 3 0 0 0 3 3"/>
                  <path d="M18 8s.9 1.1.9 2.5c0 1.2-.9 2.5-3 2.5"/>
                  <path d="M6 8s-.9 1.1-.9 2.5c0 1.2.9 2.5 3 2.5"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Multiple Personalities</h3>
              <p className="text-muted-foreground">
                Choose from different AI personalities - from philosophical guides to practical counselors - each designed for different needs.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-card border border-border/40 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-amber-500/10 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
                  <path d="M9 12l2 2 4-4"/>
                  <path d="M21 12c.552 0 1-.448 1-1V8a2 2 0 0 0-2-2h-5L9.414 0H4a2 2 0 0 0-2 2v9c0 .552.448 1 1 1h3m0 0l2 2 4-4"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Progress Tracking</h3>
              <p className="text-muted-foreground">
                Monitor your mental health journey with mood tracking, conversation insights, and progress visualization over time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Free Trial CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary/5 to-violet-500/5">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Start Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-500">Free Trial</span> Today
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Experience the power of AI-powered emotional support with a 3-day free trial. No commitment required.
            </p>
            <Button 
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              size="lg"
              className="bg-gradient-to-r from-primary to-violet-600 hover:from-primary-dark hover:to-violet-700 text-white btn-hover-lift btn-hover-glow"
            >
              Choose Your Plan
            </Button>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-violet-500/20 rounded-2xl blur-3xl transform rotate-6"></div>
                <div className="relative bg-background border border-border/40 rounded-2xl p-6 shadow-2xl">
                  
                  {/* Chat Interface Mockup */}
                  <div className="bg-card rounded-lg border border-border/60 overflow-hidden">
                    {/* Header */}
                    <div className="bg-primary/10 px-4 py-3 border-b border-border/40">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-medium text-sm">AI Counselor</h3>
                            <p className="text-xs text-muted-foreground">Online • Ready to help</p>
                          </div>
                        </div>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                    </div>
                    
                    {/* Chat Messages */}
                    <div className="p-4 space-y-4 max-h-[320px] overflow-y-auto">
                      {/* AI Message */}
                      <div className="flex justify-start">
                        <div className="bg-muted/50 rounded-xl px-4 py-3 max-w-[85%]">
                          <p className="text-sm text-foreground">
                            Hi there! I'm here to listen and support you. How are you feeling today, and what's on your mind?
                          </p>
                          <span className="text-xs text-muted-foreground mt-1 block">2:14 PM</span>
                        </div>
                      </div>
                      
                      {/* User Message */}
                      <div className="flex justify-end">
                        <div className="bg-primary text-primary-foreground rounded-xl px-4 py-3 max-w-[85%]">
                          <p className="text-sm">
                            I've been struggling with loneliness lately. I feel like I don't have anyone I can really open up to about my feelings.
                          </p>
                          <span className="text-xs text-primary-foreground/70 mt-1 block">2:15 PM</span>
                        </div>
                      </div>
                      
                      {/* AI Response */}
                      <div className="flex justify-start">
                        <div className="bg-muted/50 rounded-xl px-4 py-3 max-w-[85%]">
                          <p className="text-sm text-foreground">
                            Thank you for sharing something so personal with me. Loneliness can be incredibly difficult, and it takes courage to acknowledge these feelings. What does connection mean to you, and what would feel most supportive right now?
                          </p>
                          <span className="text-xs text-muted-foreground mt-1 block">2:16 PM</span>
                        </div>
                      </div>
                      
                      {/* User typing indicator */}
                      <div className="flex justify-start">
                        <div className="bg-muted/30 rounded-xl px-4 py-3">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Input Area */}
                    <div className="p-4 border-t border-border/40">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-muted/30 rounded-lg px-3 py-2">
                          <p className="text-sm text-muted-foreground">Share your thoughts...</p>
                        </div>
                        <button className="bg-primary text-primary-foreground p-2 rounded-lg">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m22 2-7 20-4-9-9-4Z"/>
                            <path d="M22 2 11 13"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                </div>
              </div>
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-500">
                  Your Personal AI Counselor
                </span>
              </h2>
              <p className="text-xl text-muted-foreground mb-6">
                Experience compassionate, evidence-based mental health support powered by advanced AI technology, available whenever you need it.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="bg-blue-500/20 p-1 rounded">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium">Professional Counseling</h3>
                    <p className="text-muted-foreground">
                      Our AI counselor is trained on evidence-based therapeutic approaches to provide professional-grade emotional support and guidance.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="bg-green-500/20 p-1 rounded">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium">24/7 Availability</h3>
                    <p className="text-muted-foreground">
                      Unlike traditional therapy, your AI counselor is available around the clock, providing support exactly when you need it most.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="bg-purple-500/20 p-1 rounded">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium">Complete Confidentiality</h3>
                    <p className="text-muted-foreground">
                      Share your deepest thoughts in a safe, private space. All conversations are encrypted and completely confidential.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-b from-background via-background/90 to-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-500">
                Trusted Customer Reviews
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See what our users are saying about their ReflectAI experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-card border border-border/40 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative"
            >
              <div className="flex items-center mb-6">
                <div className="relative">
                  <img 
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face&auto=format&q=80"
                    alt="Michael Johnson"
                    className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-background"></div>
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold">Michael Johnson</h4>
                  <p className="text-sm text-muted-foreground">Product Designer</p>
                </div>
              </div>
              <div className="mb-4 flex">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#FFD700" className="mr-1">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
              </div>
              <p className="text-muted-foreground">
                "ReflectAI has transformed my journaling practice. The AI insights help me understand patterns in my thinking I never noticed before. Highly recommended!"
              </p>
            </motion.div>

            {/* Testimonial 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-card border border-border/40 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative"
            >
              <div className="flex items-center mb-6">
                <div className="relative">
                  <img 
                    src="https://images.unsplash.com/photo-1494790108755-2616b612b913?w=80&h=80&fit=crop&crop=face&auto=format&q=80"
                    alt="Sarah Robinson"
                    className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-background"></div>
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold">Sarah Robinson</h4>
                  <p className="text-sm text-muted-foreground">Wellness Coach</p>
                </div>
              </div>
              <div className="mb-4 flex">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#FFD700" className="mr-1">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
              </div>
              <p className="text-muted-foreground">
                "I recommend ReflectAI to all my clients. The goal tracking and mood analysis features have been invaluable for maintaining mental wellness and tracking progress."
              </p>
            </motion.div>

            {/* Testimonial 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-card border border-border/40 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative"
            >
              <div className="flex items-center mb-6">
                <div className="relative">
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face&auto=format&q=80"
                    alt="David Lee"
                    className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-background"></div>
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold">David Lee</h4>
                  <p className="text-sm text-muted-foreground">Software Engineer</p>
                </div>
              </div>
              <div className="mb-4 flex">
                {[...Array(4)].map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#FFD700" className="mr-1">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#E5E5E5" className="mr-1">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              </div>
              <p className="text-muted-foreground">
                "The Philosopher AI feature is mind-blowing. Having deep conversations with different philosophical perspectives has broadened my thinking and helped me solve complex problems."
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* App Showcase Section */}
      <section className="py-20 bg-gradient-to-b from-background to-background/90">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-500">
                Inside the Experience
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get a sneak peek at the powerful features and beautiful interface of ReflectAI
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            {/* Journal Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="group"
            >
              <div className="relative overflow-hidden rounded-xl border border-border/60 shadow-xl bg-card">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="h-8 w-full bg-muted flex items-center px-4">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="mx-auto text-xs font-medium text-muted-foreground">Journal Entry</div>
                </div>
                <div className="relative group-hover:scale-[1.02] transition-transform duration-500">
                  <img 
                    src={journalPreview} 
                    alt="Journal interface" 
                    className="w-full object-cover shadow-md"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                    <div className="p-6 text-white">
                      <h3 className="text-xl font-bold mb-2">AI-Powered Journaling</h3>
                      <p className="text-sm">Get personalized insights and reflections on your daily thoughts and feelings.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stats Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="group"
            >
              <div className="relative overflow-hidden rounded-xl border border-border/60 shadow-xl bg-card">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="h-8 w-full bg-muted flex items-center px-4">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="mx-auto text-xs font-medium text-muted-foreground">Analytics Dashboard</div>
                </div>
                <div className="relative group-hover:scale-[1.02] transition-transform duration-500">
                  <img 
                    src={statsPreview} 
                    alt="Statistics dashboard" 
                    className="w-full object-cover shadow-md"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                    <div className="p-6 text-white">
                      <h3 className="text-xl font-bold mb-2">Advanced Analytics</h3>
                      <p className="text-sm">Track your moods, common themes, and emotional patterns with beautiful visualizations.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Chat Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="group"
            >
              <div className="relative overflow-hidden rounded-xl border border-border/60 shadow-xl bg-card">
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="h-8 w-full bg-muted flex items-center px-4">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="mx-auto text-xs font-medium text-muted-foreground">AI Counselor</div>
                </div>
                <div className="relative group-hover:scale-[1.02] transition-transform duration-500">
                  <img 
                    src={chatPreview} 
                    alt="AI chat interface" 
                    className="w-full object-cover shadow-md"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                    <div className="p-6 text-white">
                      <h3 className="text-xl font-bold mb-2">AI Counselor</h3>
                      <p className="text-sm">Get personalized emotional support, productivity coaching, and advice from your AI counselor companion.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Goals Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="group"
            >
              <div className="relative overflow-hidden rounded-xl border border-border/60 shadow-xl bg-card">
                <div className="absolute inset-0 bg-gradient-to-tr from-green-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="h-8 w-full bg-muted flex items-center px-4">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="mx-auto text-xs font-medium text-muted-foreground">Mood Tracker</div>
                </div>
                <div className="relative group-hover:scale-[1.02] transition-transform duration-500">
                  <img 
                    src={emotionTimeline} 
                    alt="Emotion growth timeline" 
                    className="w-full object-cover shadow-md"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                    <div className="p-6 text-white">
                      <h3 className="text-xl font-bold mb-2">Mood Tracker</h3>
                      <p className="text-sm">Track your emotional patterns over time with beautiful visualizations and gain insights into your emotional well-being.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          

        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-500">
                Choose Your Plan
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Select the perfect plan to enhance your journaling and self-reflection journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Pro Plan */}
            <div className="bg-card border border-border/40 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6 bg-gradient-to-r from-primary/10 to-violet-500/10 space-y-3">
                <Button 
                  onClick={() => navigate('/checkout-step1?plan=pro-monthly')}
                  className="w-full bg-gradient-to-r from-primary to-violet-600 hover:from-primary-dark hover:to-violet-700 text-white"
                >
                  Free Trial
                </Button>
                <Button 
                  onClick={() => navigate('/checkout/pro-annually')}
                  variant="outline"
                  className="w-full"
                >
                  Get Pro Annually – Save 15%
                </Button>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-medium mb-1">Pro</h3>
                <p className="text-3xl font-bold mb-1">$14.99<span className="text-muted-foreground text-base font-normal">/month</span></p>
                <p className="text-muted-foreground text-sm mb-4">or $152.90/year (save 15%)</p>
                <p className="text-muted-foreground mb-6">Perfect for every day regular use</p>
                <ul className="space-y-3 mb-6">

                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mr-2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Advanced AI reflections
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mr-2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Calendar integration
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mr-2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Enhanced goal tracking
                  </li>
                  <li className="flex items-center text-muted-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground mr-2">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                    Limited to 15 AI chat interactions per week
                  </li>
                </ul>
              </div>
            </div>

            {/* Unlimited Plan */}
            <div className="bg-card border border-border/40 rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-l from-primary to-violet-600 text-white px-3 py-1 rounded-bl-lg text-sm font-medium">
                Popular
              </div>
              <div className="p-6 bg-gradient-to-r from-primary/5 to-violet-500/5 space-y-3">
                  <Button 
                    onClick={() => navigate('/checkout-step1?plan=unlimited-monthly')}
                    className="w-full bg-gradient-to-r from-primary to-violet-600 hover:from-primary-dark hover:to-violet-700 text-white"
                  >
                    Free Trial
                  </Button>
                  <Button 
                    onClick={() => navigate('/checkout/unlimited-annually')}
                    variant="outline"
                    className="w-full"
                  >
                    Get Unlimited Annually - Save 15%
                  </Button>
                </div>
              <div className="p-6">
                <h3 className="text-lg font-medium mb-1">Unlimited</h3>
                <p className="text-3xl font-bold mb-1">$24.99<span className="text-muted-foreground text-base font-normal">/month</span></p>
                <p className="text-muted-foreground text-sm mb-4">or $254.90/year (save 15%)</p>
                <p className="text-muted-foreground mb-6">For those who want the complete experience</p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mr-2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Everything in Pro plan
                  </li>

                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mr-2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Advanced analytics
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mr-2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Custom AI personalities
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mr-2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Priority support
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto p-8 md:p-12 rounded-2xl bg-gradient-to-r from-blue-900/20 to-violet-900/20 border border-border/40 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to transform your journaling experience?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of users who have enhanced their self-reflection journey with ReflectAI
            </p>
            <Button 
              size="lg"
              className="bg-gradient-to-r from-primary to-violet-600 hover:from-primary-dark hover:to-violet-700 text-white"
              onClick={() => navigate('/auth?tab=login')}
            >
              Login to ReflectAI
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card/40 border-t border-border/40">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center">
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-500">
                  ReflectAI
                </span>
              </div>
              <p className="text-muted-foreground mt-2">Transforming reflection into growth</p>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
              <a href="#features" className="text-muted-foreground hover:text-primary transition-colors">Features</a>
              <a href="#about" className="text-muted-foreground hover:text-primary transition-colors">About</a>
              <a href="#pricing" className="text-muted-foreground hover:text-primary transition-colors">Pricing</a>
              <a href="mailto:reflectaifeedback@gmail.com" className="text-muted-foreground hover:text-primary transition-colors">Contact</a>
            </div>
            <div className="mt-8 md:mt-0">
              <p className="text-muted-foreground text-sm">&copy; 2025 ReflectAI. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;