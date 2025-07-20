import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import EmailPopup from '@/components/marketing/EmailPopup';
import CounselorQuestionnaire from '@/components/marketing/CounselorQuestionnaire';

// Animated Chat Demo Component
const AnimatedChatDemo = () => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const messages = [
    {
      type: 'ai',
      text: "Hi there! I'm here to listen and support you. How are you feeling today, and what's on your mind?",
      delay: 1000
    },
    {
      type: 'user', 
      text: "I've been struggling with loneliness lately. I feel like I don't have anyone I can really open up to about my feelings.",
      delay: 3000
    },
    {
      type: 'ai',
      text: "Thank you for sharing something so personal with me. Loneliness can be incredibly difficult, and it takes courage to acknowledge these feelings. What does connection mean to you, and what would feel most supportive right now?",
      delay: 5000
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % (messages.length + 1));
    }, messages[currentStep]?.delay || 2000);

    return () => clearInterval(timer);
  }, [currentStep, messages]);

  return (
    <div className="space-y-4">
      {messages.slice(0, currentStep).map((message, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div className={`flex items-start space-x-3 max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${
              message.type === 'ai' 
                ? 'bg-gradient-to-r from-primary to-violet-600' 
                : 'bg-gray-400'
            }`}>
              {message.type === 'ai' ? 'AI' : 'You'}
            </div>
            <div className={`rounded-lg px-4 py-3 ${
              message.type === 'ai' 
                ? 'bg-muted/70 text-foreground' 
                : 'bg-primary/20 text-foreground'
            }`}>
              <TypewriterText text={message.text} />
            </div>
          </div>
        </motion.div>
      ))}
      
      {currentStep < messages.length && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center space-x-2 text-muted-foreground"
        >
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
          </div>
          <span className="text-sm">AI is typing...</span>
        </motion.div>
      )}
    </div>
  );
};

// Typewriter effect component
const TypewriterText = ({ text }: { text: string }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 30);
      
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text]);

  useEffect(() => {
    setDisplayText('');
    setCurrentIndex(0);
  }, [text]);

  return <span>{displayText}</span>;
};

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
              onClick={() => setShowQuestionnaire(true)}
              className="bg-gradient-to-r from-primary to-violet-600 hover:from-primary-dark hover:to-violet-700 text-white"
            >
              Find Your Counselor
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-500">
                  From Racing Thoughts to Calm Decisions — In One Minute
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
                Real emotional support without the $300 therapy bill
              </p>
            </motion.div>
          </div>

          {/* Chat Interface Demo */}
          <div className="max-w-4xl mx-auto mb-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-card border border-border/40 rounded-2xl shadow-2xl overflow-hidden">
                {/* Chat Header */}
                <div className="bg-gradient-to-r from-primary/10 to-violet-500/10 px-6 py-4 border-b border-border/40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-primary to-violet-600 rounded-full flex items-center justify-center text-white">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-primary">Your Personal AI Counselor</h3>
                        <div className="flex items-center text-sm text-green-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          Online • Ready to help
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">Available 24/7</div>
                  </div>
                </div>

                {/* Chat Messages with Animation */}
                <div className="p-6 space-y-4 min-h-[400px] bg-gradient-to-b from-background to-muted/20">
                  <AnimatedChatDemo />
                </div>

                {/* Chat Input */}
                <div className="p-4 border-t border-border/40 bg-muted/20">
                  <div className="flex items-center space-x-3 bg-background rounded-full px-4 py-3 border border-border/40">
                    <div className="flex-1 text-muted-foreground">Share your thoughts...</div>
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>


            </motion.div>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Button 
                onClick={() => setShowQuestionnaire(true)} 
                size="lg"
                className="bg-gradient-to-r from-primary to-violet-600 hover:from-primary-dark hover:to-violet-700 text-white btn-hover-lift btn-hover-glow text-lg px-8 py-4"
              >
                Find Your Counselor
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Insights Section with App Preview */}
      <section id="features" className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            
            {/* Problem Statement Cards with Visual Appeal */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16"
            >
              {/* Anxiety Card */}
              <div className="group relative overflow-hidden">
                {/* Glow Effect Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-orange-500/15 to-pink-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 group-hover:scale-110"></div>
                
                {/* Main Card */}
                <div className="relative bg-card/95 backdrop-blur-sm border border-red-200/30 dark:border-red-800/30 rounded-2xl p-8 shadow-2xl text-center hover:shadow-red-500/10 hover:shadow-3xl transition-all duration-500 group-hover:scale-105">
                  <div className="mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/30 group-hover:shadow-red-500/50 transition-all duration-500">
                      <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                  </div>
                  
                  <p className="text-xl md:text-2xl font-bold text-foreground leading-relaxed mb-6 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300">
                    "Anxiety doesn't wait. It shows up at 2AM, at work, or before big moments."
                  </p>
                  
                  <div className="space-y-3">
                    <p className="text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
                      When you need help most, traditional support isn't available
                    </p>
                    
                    {/* Visual Elements */}
                    <div className="flex justify-center space-x-2 mt-4">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse delay-150"></div>
                      <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse delay-300"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Therapy Wait Card */}
              <div className="group relative overflow-hidden">
                {/* Glow Effect Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-yellow-500/15 to-orange-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 group-hover:scale-110"></div>
                
                {/* Main Card */}
                <div className="relative bg-card/95 backdrop-blur-sm border border-amber-200/30 dark:border-amber-800/30 rounded-2xl p-8 shadow-2xl text-center hover:shadow-amber-500/10 hover:shadow-3xl transition-all duration-500 group-hover:scale-105">
                  <div className="mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/30 group-hover:shadow-amber-500/50 transition-all duration-500">
                      <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                      </svg>
                    </div>
                  </div>
                  
                  <p className="text-xl md:text-2xl font-bold text-foreground leading-relaxed mb-6 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-300">
                    "Therapy takes weeks. Apps give tips. You need help now."
                  </p>
                  
                  <div className="space-y-3">
                    <p className="text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
                      Immediate support when you can't wait for appointments
                    </p>
                    
                    {/* Visual Elements */}
                    <div className="flex justify-center space-x-2 mt-4">
                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse delay-150"></div>
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse delay-300"></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Solution Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center mb-12"
            >
              <h3 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-violet-600 bg-clip-text text-transparent">
                Your AI Counselor, Available Instantly
              </h3>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                See real conversations and personalized support in action
              </p>
            </motion.div>

            {/* App Insights Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              
              {/* Instant Support */}
              <div className="group relative overflow-hidden">
                {/* Glow Effect Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-cyan-500/15 to-indigo-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 group-hover:scale-110"></div>
                
                {/* Main Card */}
                <div className="relative bg-card/95 backdrop-blur-sm border border-blue-200/30 dark:border-blue-800/30 rounded-2xl p-6 shadow-2xl hover:shadow-blue-500/10 hover:shadow-3xl transition-all duration-500 group-hover:scale-105">
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all duration-500">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                    <h4 className="text-xl font-bold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">Instant Support</h4>
                    <p className="text-muted-foreground mb-4 group-hover:text-foreground/80 transition-colors duration-300">Get help within seconds, not weeks</p>
                  </div>
                  
                  {/* Mock Chat Interface */}
                  <div className="bg-muted/30 rounded-xl p-4 border border-blue-200/20 dark:border-blue-800/20">
                    <div className="space-y-3">
                      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg px-3 py-2 max-w-[80%] text-sm shadow-lg">
                        I'm having a panic attack at work. Help!
                      </div>
                      <div className="bg-card rounded-lg px-3 py-2 max-w-[85%] text-sm border shadow-sm">
                        I'm here with you. Let's try the 5-4-3-2-1 grounding technique right now...
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400 text-center font-medium">
                        Response in 2 seconds
                      </div>
                    </div>
                  </div>
                  
                  {/* Animated dots */}
                  <div className="flex justify-center space-x-2 mt-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse delay-150"></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse delay-300"></div>
                  </div>
                </div>
              </div>

              {/* Personalized Guidance */}
              <div className="group relative overflow-hidden">
                {/* Glow Effect Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/15 to-violet-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 group-hover:scale-110"></div>
                
                {/* Main Card */}
                <div className="relative bg-card/95 backdrop-blur-sm border border-purple-200/30 dark:border-purple-800/30 rounded-2xl p-6 shadow-2xl hover:shadow-purple-500/10 hover:shadow-3xl transition-all duration-500 group-hover:scale-105">
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-all duration-500">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                    <h4 className="text-xl font-bold mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">Personal Match</h4>
                    <p className="text-muted-foreground mb-4 group-hover:text-foreground/80 transition-colors duration-300">Counselor designed just for you</p>
                  </div>

                  {/* Mock Profile Card */}
                  <div className="bg-muted/30 rounded-xl p-4 border border-purple-200/20 dark:border-purple-800/20">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                        SC
                      </div>
                      <div>
                        <h5 className="font-semibold text-sm">Dr. Sarah Chen</h5>
                        <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">95% Match</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs px-2 py-1 rounded-full inline-block shadow-sm">
                        Anxiety Specialist
                      </div>
                      <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs px-2 py-1 rounded-full inline-block ml-1 shadow-sm">
                        Gentle Communication
                      </div>
                    </div>
                  </div>
                  
                  {/* Animated dots */}
                  <div className="flex justify-center space-x-2 mt-4">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse delay-150"></div>
                    <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse delay-300"></div>
                  </div>
                </div>
              </div>

              {/* 24/7 Availability */}
              <div className="group relative overflow-hidden">
                {/* Glow Effect Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-emerald-500/15 to-teal-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 group-hover:scale-110"></div>
                
                {/* Main Card */}
                <div className="relative bg-card/95 backdrop-blur-sm border border-green-200/30 dark:border-green-800/30 rounded-2xl p-6 shadow-2xl hover:shadow-green-500/10 hover:shadow-3xl transition-all duration-500 group-hover:scale-105">
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/30 group-hover:shadow-green-500/50 transition-all duration-500">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                      </svg>
                    </div>
                    <h4 className="text-xl font-bold mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">Always Available</h4>
                    <p className="text-muted-foreground mb-4 group-hover:text-foreground/80 transition-colors duration-300">2AM, work stress, before presentations</p>
                  </div>

                  {/* Mock Availability Status */}
                  <div className="bg-muted/30 rounded-xl p-4 border border-green-200/20 dark:border-green-800/20">
                    <div className="text-center space-y-3">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                        <span className="text-sm font-bold text-green-600 dark:text-green-400">Online Now</span>
                      </div>
                      <div className="text-xs text-muted-foreground font-medium">
                        Tuesday, 2:47 AM
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                        Average response: &lt; 3 seconds
                      </div>
                    </div>
                  </div>
                  
                  {/* Animated dots */}
                  <div className="flex justify-center space-x-2 mt-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse delay-150"></div>
                    <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse delay-300"></div>
                  </div>
                </div>
              </div>

            </motion.div>

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center mt-16"
            >
              <Button 
                onClick={() => setShowQuestionnaire(true)}
                size="lg"
                className="bg-gradient-to-r from-primary to-violet-600 hover:from-primary-dark hover:to-violet-700 text-white btn-hover-lift btn-hover-glow text-lg px-12 py-6 shadow-2xl"
              >
                Experience It Now - Find Your Counselor
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                No waiting. No appointments. Just immediate support.
              </p>
            </motion.div>

          </div>
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
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold border-2 border-primary/20">
                    MJ
                  </div>
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
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-semibold border-2 border-primary/20">
                    SR
                  </div>
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
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-semibold border-2 border-primary/20">
                    DL
                  </div>
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