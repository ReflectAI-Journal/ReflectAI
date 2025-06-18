import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import EmailPopup from '@/components/marketing/EmailPopup';

// Import logo and app screenshots for showcase section
import logo from '@/assets/logo/reflect-ai-logo-user.png';
import journalPreview from '@/assets/new-screenshots/journal.png';
import statsPreview from '@/assets/new-screenshots/stats.png';
import chatPreview from '@/assets/new-screenshots/chat.png';
import emotionTimeline from '@/assets/new-screenshots/emotion-timeline.png';

const Landing = () => {
  const [, navigate] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [showEmailPopup, setShowEmailPopup] = useState(false);

  // Check if we should show the email popup
  useEffect(() => {
    // Wait a bit before showing the popup for better UX
    const timer = setTimeout(() => {
      // Only show popup if user hasn't submitted their email before
      if (!localStorage.getItem('emailSubmitted')) {
        setShowEmailPopup(true);
      }
    }, 3000); // Show popup after 3 seconds

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
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Email Popup - with AnimatePresence for smooth animations */}
      <AnimatePresence>
        {showEmailPopup && (
          <EmailPopup onClose={() => setShowEmailPopup(false)} />
        )}
      </AnimatePresence>
      
      {/* Header */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-black/80 backdrop-blur-md shadow-md' : ''
        }`}
      >
        <div className="container mx-auto flex items-center justify-between p-4">
          <div className="flex items-center">
            <img src={logo} alt="ReflectAI Logo" className="h-10 mr-3 filter drop-shadow-[0_0_15px_rgba(0,123,255,0.9)]" />
            <span className="text-xl font-bold text-white">
              ReflectAI
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
            <a href="#about" className="text-gray-300 hover:text-white transition-colors">About</a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => navigate('/auth?tab=login')} 
              variant="ghost"
              className="text-white hover:text-white hover:bg-white/10"
            >
              Login
            </Button>
            <Button 
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              View Plans
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-32">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-white">
                  Transform your thoughts with
                  <span className="block text-blue-400">
                    AI-powered journaling
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
                  A full year of mental clarity - for less than a single therapy session.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    onClick={() => navigate('/auth?tab=login')} 
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Login
                  </Button>
                  <Button 
                    onClick={() => navigate('/onboarding')}
                    variant="outline" 
                    size="lg"
                    className="border-white text-white hover:bg-white/10"
                  >
                    Try AI Reflection
                  </Button>
                </div>
              </motion.div>
            </div>
            <div className="md:w-1/2">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative"
              >
                <div className="w-full h-[400px] rounded-xl bg-gradient-to-br from-blue-500/10 to-violet-500/10 border border-border/40 shadow-2xl backdrop-blur-sm flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                  <div className="relative z-10 w-full h-full flex items-center justify-center">
                    <div className="w-[85%] h-[85%] rounded-lg bg-card border border-border/60 shadow-lg overflow-hidden">
                      <div className="h-8 w-full bg-muted flex items-center px-4">
                        <div className="flex space-x-2">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                      </div>
                      <div className="p-6 flex flex-col h-[calc(100%-2rem)]">
                        <div className="mb-4">
                          <div className="h-6 w-1/3 bg-muted/50 rounded"></div>
                        </div>
                        <div className="space-y-2 flex-grow">
                          <div className="h-4 w-full bg-muted/50 rounded"></div>
                          <div className="h-4 w-5/6 bg-muted/50 rounded"></div>
                          <div className="h-4 w-full bg-muted/50 rounded"></div>
                          <div className="h-4 w-4/6 bg-muted/50 rounded"></div>
                        </div>
                        <div className="mt-4 flex justify-between">
                          <div className="h-10 w-32 bg-primary/20 rounded-md"></div>
                          <div className="h-10 w-10 bg-primary/20 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Decorative elements */}
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/30 rounded-full blur-3xl"></div>
                  <div className="absolute -top-10 -left-10 w-40 h-40 bg-violet-500/30 rounded-full blur-3xl"></div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Discover how ReflectAI helps you transform your journaling practice
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <path d="M8 13h2"/>
                  <path d="M8 17h2"/>
                  <path d="M14 13h2"/>
                  <path d="M14 17h2"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">AI Journal Reflection</h3>
              <p className="text-gray-300">
                Get personalized insights, patterns, and reflections on your journal entries powered by advanced AI analysis.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-violet-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-400">
                  <path d="M20 5a2 2 0 0 0-2-2h-1V2a1 1 0 0 0-2 0v1h-2V2a1 1 0 0 0-2 0v1H9V2a1 1 0 0 0-2 0v1H6a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V5Z"/>
                  <path d="M8 10h8"/>
                  <path d="M8 14h4"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Mood Tracking</h3>
              <p className="text-gray-300">
                Track your emotional state over time with beautiful visualizations and analytics to understand your patterns.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                  <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.85.99 6.63 2.63"/>
                  <path d="M22 7v6h-6"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Memory Lane</h3>
              <p className="text-gray-300">
                Take a nostalgic journey through your past journal entries to revisit memories and see your growth over time.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                  <path d="M5 22h14"/>
                  <path d="M5 2h14"/>
                  <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/>
                  <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Goal Tracking</h3>
              <p className="text-gray-300">
                Set, track, and achieve your personal goals with templates, time tracking, and progress visualization.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
                  <path d="M12 3v4"/>
                  <path d="M10 5h4"/>
                  <ellipse cx="12" cy="14" rx="3" ry="5"/>
                  <path d="M9 14a3 3 0 0 0 3 3"/>
                  <path d="M18 8s.9 1.1.9 2.5c0 1.2-.9 2.5-3 2.5"/>
                  <path d="M6 8s-.9 1.1-.9 2.5c0 1.2.9 2.5 3 2.5"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Philosopher</h3>
              <p className="text-gray-300">
                Engage in meaningful conversations with AI personalities inspired by renowned philosophical traditions.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-amber-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400">
                  <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/>
                  <path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/>
                  <path d="M12 12v4h8"/>
                  <path d="M12 12h8"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Adaptive AI Support</h3>
              <p className="text-gray-300">
                Get emotional support, productivity coaching, and personalized advice from AI that adapts to your needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <div className="relative">
                <div className="w-full h-[400px] rounded-xl bg-gradient-to-br from-indigo-500/10 to-amber-500/10 border border-border/40 shadow-2xl backdrop-blur-sm overflow-hidden">
                  <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                  
                  {/* Chart mockup */}
                  <div className="absolute inset-0 flex items-center justify-center p-8">
                    <div className="w-full h-full bg-card/80 backdrop-blur-sm rounded-lg border border-border/60 shadow-lg p-4">
                      <div className="h-8 mb-4 flex justify-between items-center">
                        <div className="h-4 w-20 bg-muted/50 rounded"></div>
                        <div className="flex space-x-2">
                          <div className="h-6 w-6 bg-blue-500/20 rounded"></div>
                          <div className="h-6 w-6 bg-violet-500/20 rounded"></div>
                        </div>
                      </div>
                      
                      {/* Mood chart bars */}
                      <div className="flex items-end h-48 gap-3 mb-4">
                        <div className="w-1/7 h-[60%] bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-md"></div>
                        <div className="w-1/7 h-[85%] bg-gradient-to-t from-green-500 to-green-400 rounded-t-md"></div>
                        <div className="w-1/7 h-[40%] bg-gradient-to-t from-amber-500 to-amber-400 rounded-t-md"></div>
                        <div className="w-1/7 h-[70%] bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-md"></div>
                        <div className="w-1/7 h-[90%] bg-gradient-to-t from-purple-500 to-purple-400 rounded-t-md"></div>
                        <div className="w-1/7 h-[55%] bg-gradient-to-t from-green-500 to-green-400 rounded-t-md"></div>
                        <div className="w-1/7 h-[75%] bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-md"></div>
                      </div>
                      
                      <div className="flex justify-between">
                        <div className="h-4 w-full bg-muted/30 rounded"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Decorative elements */}
                  <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/30 rounded-full blur-3xl"></div>
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/30 rounded-full blur-3xl"></div>
                </div>
              </div>
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                The Science Behind ReflectAI
              </h2>
              <p className="text-xl text-gray-300 mb-6">
                Combining the power of artificial intelligence with proven psychological practices for emotional well-being.
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
                    <h3 className="text-lg font-medium text-white">Emotional Intelligence</h3>
                    <p className="text-gray-300">
                      Our AI is trained to recognize emotional patterns and provide meaningful insights that help you understand your feelings better.
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
                    <h3 className="text-lg font-medium text-white">Personal Growth</h3>
                    <p className="text-gray-300">
                      Regular reflection through journaling has been proven to boost self-awareness, reduce stress, and enhance problem-solving abilities.
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
                    <h3 className="text-lg font-medium text-white">Privacy-Focused</h3>
                    <p className="text-gray-300">
                      Your personal data is encrypted and secure. We prioritize your privacy while providing personalized insights.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Trusted Customer Reviews
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
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
              className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative"
            >
              <div className="flex items-center mb-6">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-violet-500/20 flex items-center justify-center">
                    <span className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-500">MJ</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-background"></div>
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-white">Michael Johnson</h4>
                  <p className="text-sm text-gray-400">Product Designer</p>
                </div>
              </div>
              <div className="mb-4 flex">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#FFD700" className="mr-1">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-300">
                "ReflectAI has transformed my journaling practice. The AI insights help me understand patterns in my thinking I never noticed before. Highly recommended!"
              </p>
            </motion.div>

            {/* Testimonial 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative"
            >
              <div className="flex items-center mb-6">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-emerald-500/20 flex items-center justify-center">
                    <span className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-emerald-500">SR</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-background"></div>
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-white">Sarah Robinson</h4>
                  <p className="text-sm text-gray-400">Wellness Coach</p>
                </div>
              </div>
              <div className="mb-4 flex">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#FFD700" className="mr-1">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-300">
                "I recommend ReflectAI to all my clients. The goal tracking and mood analysis features have been invaluable for maintaining mental wellness and tracking progress."
              </p>
            </motion.div>

            {/* Testimonial 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative"
            >
              <div className="flex items-center mb-6">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500/20 to-pink-500/20 flex items-center justify-center">
                    <span className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-pink-500">DL</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-background"></div>
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-white">David Lee</h4>
                  <p className="text-sm text-gray-400">Software Engineer</p>
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
              <p className="text-gray-300">
                "The Philosopher AI feature is mind-blowing. Having deep conversations with different philosophical perspectives has broadened my thinking and helped me solve complex problems."
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* App Showcase Section */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Inside the Experience
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
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
          
          <div className="text-center mt-12">
            <Button 
              onClick={() => navigate('/auth?tab=login')} 
              size="lg"
              className="bg-gradient-to-r from-primary to-violet-600 hover:from-primary-dark hover:to-violet-700 text-white"
            >
              Login to ReflectAI
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Choose Your Plan
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Select the perfect plan to enhance your journaling and self-reflection journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Pro Plan */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-l from-primary to-violet-600 text-white text-xs font-bold px-4 py-1 uppercase">
                Popular
              </div>
              <div className="p-6">
                <h3 className="text-lg font-medium mb-1 text-white">Pro</h3>
                <p className="text-3xl font-bold mb-1 text-white">$9.99<span className="text-gray-400 text-base font-normal">/month</span></p>
                <p className="text-gray-400 text-sm mb-4">or $101.90/year (save 15%)</p>
                <p className="text-gray-300 mb-6">Perfect for regular journaling enthusiasts</p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mr-2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span className="text-white">Unlimited journal entries</span>
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mr-2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span className="text-white">Advanced AI reflections</span>
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mr-2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span className="text-white">Calendar integration</span>
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mr-2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span className="text-white">Enhanced goal tracking</span>
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
              <div className="p-6 bg-gradient-to-r from-primary/10 to-violet-500/10">
                <Button 
                  onClick={() => navigate('/checkout/pro-monthly')}
                  className="w-full bg-gradient-to-r from-primary to-violet-600 hover:from-primary-dark hover:to-violet-700 text-white"
                >
                  Get Pro Plan
                </Button>
              </div>
            </div>

            {/* Unlimited Plan */}
            <div className="bg-card border border-border/60 rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-medium mb-1">Unlimited</h3>
                <p className="text-3xl font-bold mb-1">$17.99<span className="text-muted-foreground text-base font-normal">/month</span></p>
                <p className="text-muted-foreground text-sm mb-4">or $183.50/year (save 15%)</p>
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
                    Unlimited AI chat interactions
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
              <div className="p-6 bg-gradient-to-r from-primary/5 to-violet-500/5">
                <Button 
                  onClick={() => navigate('/checkout/unlimited-monthly')}
                  className="w-full bg-gradient-to-r from-primary to-violet-600 hover:from-primary-dark hover:to-violet-700 text-white"
                >
                  Get Unlimited Plan
                </Button>
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
                <img src={logo} alt="ReflectAI Logo" className="h-10 mr-2 filter drop-shadow-[0_0_15px_rgba(0,123,255,0.9)]" />
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