import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { MessageCircle, Brain, Heart, Shield, Clock, Star, ArrowRight, CheckCircle, Users, Zap } from 'lucide-react';
import logo from '@/assets/logo/reflectai-transparent.svg';

const Landing = () => {
  const [, navigate] = useLocation();

  const features = [
    {
      icon: <MessageCircle className="h-8 w-8" />,
      title: "24/7 AI Counselor",
      description: "Talk to your personal AI counselor anytime, anywhere. Get emotional support whenever you need it.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Brain className="h-8 w-8" />,
      title: "Personalized Guidance",
      description: "AI that learns your communication style and adapts to provide the most helpful support for you.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Emotional Intelligence",
      description: "Advanced AI trained in counseling techniques to provide empathetic, meaningful conversations.",
      color: "from-pink-500 to-rose-500"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Safe & Private",
      description: "Your conversations are completely private and secure. No judgment, just understanding.",
      color: "from-green-500 to-teal-500"
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "Instant Support",
      description: "No appointments needed. Get help the moment you need it, day or night.",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Crisis Support",
      description: "Specialized guidance for difficult moments when you need immediate emotional support.",
      color: "from-red-500 to-pink-500"
    }
  ];

  const testimonials = [
    {
      name: "Sarah M.",
      text: "ReflectAI helped me through my anxiety when I couldn't afford traditional therapy. It's like having a counselor in my pocket.",
      rating: 5
    },
    {
      name: "James R.",
      text: "The AI really understands me. It remembers our conversations and builds on them. I feel heard and supported.",
      rating: 5
    },
    {
      name: "Maria L.",
      text: "Perfect for late-night anxiety. Having someone to talk to at 3 AM when my mind is racing has been life-changing.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 container mx-auto px-6 py-20">
          {/* Header */}
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center mb-8">
              <img src={logo} alt="ReflectAI" className="h-16 w-auto mr-4" />
              <span className="text-3xl font-bold text-white">ReflectAI</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-300 bg-clip-text text-transparent">
              Talk Anywhere Anytime
            </h1>
            <h2 className="text-3xl md:text-4xl font-semibold mb-8 text-blue-200">
              with your AI counselor made just for you
            </h2>
            <p className="text-xl text-blue-200 max-w-3xl mx-auto leading-relaxed mb-12">
              Get personalized emotional support and guidance from an AI counselor that understands you. 
              No appointments, no waiting – just immediate, compassionate help whenever you need it.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={() => navigate('/auth?tab=register')}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-2xl border-2 border-blue-500 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Talk to AI Counselor <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate('/subscription')}
                className="border-2 border-blue-500 text-blue-300 hover:bg-blue-600/20 px-8 py-4 text-lg font-semibold rounded-2xl backdrop-blur-sm"
              >
                View Plans
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gradient-to-b from-slate-900/50 to-slate-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Your Personal AI Counselor
            </h2>
            <p className="text-xl text-blue-200 max-w-3xl mx-auto">
              Experience the future of mental health support with AI technology designed for genuine human connection
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-slate-800/50 border-blue-700/30 backdrop-blur-sm hover:bg-slate-700/50 transition-all duration-300 h-full">
                  <CardHeader>
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} p-4 mb-4 shadow-lg`}>
                      <div className="text-white">
                        {feature.icon}
                      </div>
                    </div>
                    <CardTitle className="text-xl font-semibold text-white">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-blue-200 text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-20 bg-gradient-to-b from-slate-800/50 to-slate-900/50">
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Trusted by Thousands
            </h2>
            <p className="text-xl text-blue-200 max-w-3xl mx-auto">
              Join the growing community of people finding support and healing with ReflectAI
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-slate-800/50 border-blue-700/30 backdrop-blur-sm h-full">
                  <CardContent className="p-6">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-blue-200 mb-4 italic">"{testimonial.text}"</p>
                    <p className="text-white font-semibold">- {testimonial.name}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-blue-200 mb-12 max-w-2xl mx-auto">
              Take the first step towards better mental health with your personal AI counselor. 
              Available 24/7, judgment-free, and designed just for you.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={() => navigate('/auth?tab=register')}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-6 text-xl font-semibold rounded-2xl border-2 border-blue-500 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Start Free Trial <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </div>

            <div className="mt-8 flex justify-center items-center space-x-8 text-blue-300">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span>3-day free trial</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900/80 backdrop-blur-sm border-t border-blue-700/30 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <img src={logo} alt="ReflectAI" className="h-8 w-auto mr-3" />
              <span className="text-xl font-bold text-white">ReflectAI</span>
            </div>
            
            <div className="flex space-x-6 text-blue-300">
              <button onClick={() => navigate('/terms-of-service')} className="hover:text-white transition-colors">
                Terms of Service
              </button>
              <button onClick={() => navigate('/privacy')} className="hover:text-white transition-colors">
                Privacy Policy
              </button>
              <button onClick={() => navigate('/auth')} className="hover:text-white transition-colors">
                Sign In
              </button>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-blue-700/30 text-center text-blue-400">
            <p>&copy; 2025 ReflectAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;