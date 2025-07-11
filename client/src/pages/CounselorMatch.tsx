import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Star, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';

interface CounselorProfile {
  name: string;
  specialty: string;
  description: string;
  personality: string;
  approach: string;
  experience: string;
  avatar: string;
}

const CounselorMatch = () => {
  const [, navigate] = useLocation();
  const [counselorProfile, setCounselorProfile] = useState<CounselorProfile | null>(null);
  const [showMatch, setShowMatch] = useState(false);

  useEffect(() => {
    // Get the personalized counselor from localStorage
    const storedCounselor = localStorage.getItem('personalizedCounselor');
    if (storedCounselor) {
      setCounselorProfile(JSON.parse(storedCounselor));
      // Animate the match reveal after a short delay
      setTimeout(() => setShowMatch(true), 500);
    } else {
      // If no counselor found, redirect to questionnaire
      navigate('/');
    }
  }, [navigate]);

  const handleContinue = () => {
    // Always go to account creation first, then to subscription
    navigate('/auth?tab=register&source=questionnaire');
  };

  if (!counselorProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-violet-500/10 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="h-8 w-8 text-primary mr-2" />
            <h1 className="text-3xl md:text-4xl font-bold">Perfect Match Found!</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Based on your responses, we've found your ideal counselor
          </p>
        </motion.div>

        {/* Counselor Match Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: showMatch ? 1 : 0, scale: showMatch ? 1 : 0.8 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-violet-600/5 shadow-2xl">
            <CardHeader className="text-center pb-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-primary to-violet-600 flex items-center justify-center text-white shadow-lg mx-auto mb-4">
                <Heart className="h-12 w-12" />
              </div>
              
              <CardTitle className="text-3xl text-foreground flex items-center justify-center gap-2">
                {counselorProfile.name}
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </CardTitle>
              
              <CardDescription className="text-xl font-semibold text-primary">
                {counselorProfile.specialty}
              </CardDescription>
              
              <div className="flex items-center justify-center gap-2 mt-2">
                <div className="px-4 py-2 bg-green-500/20 text-green-600 text-sm font-medium rounded-full flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  98% Compatibility Match
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Description */}
              <div className="text-center">
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {counselorProfile.description}
                </p>
              </div>

              {/* Approach & Experience */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-card/50 rounded-lg p-4 border border-border/40">
                  <h4 className="font-semibold text-primary mb-2">Counseling Approach</h4>
                  <p className="text-sm text-muted-foreground">{counselorProfile.approach}</p>
                </div>
                
                <div className="bg-card/50 rounded-lg p-4 border border-border/40">
                  <h4 className="font-semibold text-primary mb-2">Experience</h4>
                  <p className="text-sm text-muted-foreground">{counselorProfile.experience}</p>
                </div>
              </div>

              {/* Personality Style */}
              <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                <h4 className="font-semibold text-primary mb-2">Communication Style</h4>
                <p className="text-sm text-muted-foreground">
                  Your counselor uses a <strong>{counselorProfile.personality}</strong> approach, 
                  perfectly tailored to your preferences and needs.
                </p>
              </div>

              {/* Action Button */}
              <div className="text-center pt-4">
                <Button 
                  onClick={handleContinue}
                  size="lg"
                  className="bg-gradient-to-r from-primary to-violet-600 hover:from-primary-dark hover:to-violet-700 text-white px-8 py-3 text-lg font-semibold"
                >
                  Start Your Journey with {counselorProfile.name}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                
                <p className="text-sm text-muted-foreground mt-3">
                  Ready to begin your personalized counseling experience?
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="text-center mt-8"
        >
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Licensed Professional</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Secure & Private</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Available 24/7</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CounselorMatch;