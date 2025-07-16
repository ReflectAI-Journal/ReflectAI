import React, { useState } from 'react';
import { X, Mail, Sparkles, Heart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

interface EmailPopupProps {
  onClose: () => void;
}

const EmailPopup: React.FC<EmailPopupProps> = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // For now, we'll just simulate API call success
      // In production, you would call an API to store the email
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast({
        title: "Thank you!",
        description: "Your email has been successfully submitted.",
      });
      
      // Save to localStorage to prevent showing popup again
      localStorage.setItem('emailSubmitted', 'true');
      
      onClose();
    } catch (error) {
      toast({
        title: "Submission failed",
        description: "There was an error submitting your email. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-3/4 right-1/4 w-24 h-24 bg-gradient-to-br from-pink-400/20 to-violet-400/20 rounded-full blur-xl"
          animate={{
            x: [0, -20, 0],
            y: [0, 15, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div
          className="absolute top-1/2 right-1/3 w-16 h-16 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-lg"
          animate={{
            x: [0, 25, 0],
            y: [0, -30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      <motion.div 
        className="absolute inset-0" 
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      />
      
      <motion.div
        initial={{ scale: 0.8, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.8, y: 30, opacity: 0 }}
        transition={{ 
          type: "spring", 
          damping: 20, 
          stiffness: 300, 
          delay: 0.1 
        }}
        className="w-full max-w-lg z-10 relative"
      >
        {/* Main Modal Card */}
        <div className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl shadow-2xl overflow-hidden">
          
          {/* Animated Header Gradient */}
          <motion.div 
            className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
            initial={{ scaleX: 0, transformOrigin: "left" }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
          />

          {/* Floating Close Button */}
          <motion.div
            className="absolute top-4 right-4 z-20"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-10 w-10 rounded-full bg-gray-100/80 dark:bg-gray-800/80 hover:bg-gray-200/80 dark:hover:bg-gray-700/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50"
              onClick={onClose}
            >
              <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <span className="sr-only">Close</span>
            </Button>
          </motion.div>

          {/* Content Container */}
          <div className="px-8 py-10">
            
            {/* Header Section */}
            <motion.div
              className="text-center mb-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              {/* Icon with floating animation */}
              <motion.div
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-blue-200/50 dark:border-purple-300/20 mb-6"
                animate={{
                  y: [0, -8, 0],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  y: {
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  },
                  rotate: {
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
              >
                <Mail className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                <motion.div
                  className="absolute -top-1 -right-1"
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Sparkles className="h-5 w-5 text-pink-500" />
                </motion.div>
              </motion.div>

              {/* Title */}
              <h2 className="text-3xl font-bold mb-3">
                <motion.span 
                  className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  style={{
                    backgroundSize: "200% 200%"
                  }}
                >
                  Stay in the Loop!
                </motion.span>
              </h2>

              {/* Subtitle */}
              <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                Get the latest updates, exclusive content, and wellness tips delivered straight to your inbox
                <motion.span
                  className="inline-block ml-2"
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                  }}
                >
                  <Heart className="inline h-5 w-5 text-red-500" />
                </motion.span>
              </p>
            </motion.div>

            {/* Form Section */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-14 text-lg pl-6 pr-6 rounded-2xl border-2 border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm focus:border-blue-400 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-400/20 transition-all duration-300"
                    required
                  />
                  <motion.div
                    className="absolute right-4 top-1/2 transform -translate-y-1/2"
                    animate={{
                      x: [0, 3, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Mail className="h-5 w-5 text-gray-400" />
                  </motion.div>
                </div>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    type="submit" 
                    className="w-full h-14 text-lg font-semibold rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <motion.div
                        className="flex items-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <motion.div
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-3"
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear"
                          }}
                        />
                        Subscribing...
                      </motion.div>
                    ) : (
                      <motion.div
                        className="flex items-center justify-center"
                        whileHover={{
                          x: [0, 5, 0],
                        }}
                        transition={{
                          duration: 0.3
                        }}
                      >
                        Subscribe Now
                        <motion.div
                          className="ml-2"
                          animate={{
                            x: [0, 3, 0],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          <Sparkles className="h-5 w-5" />
                        </motion.div>
                      </motion.div>
                    )}
                  </Button>
                </motion.div>
              </motion.div>
            </form>

            {/* Footer Note */}
            <motion.p
              className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              No spam, ever. Unsubscribe anytime with just one click.
            </motion.p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EmailPopup;