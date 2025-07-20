import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus, LogIn, AtSign, LockKeyhole, Eye, EyeOff, Mail, Phone } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { apiRequest } from '@/lib/queryClient';
import { insertUserSchema } from '@shared/schema';
import { useAuth } from '@/hooks/use-auth';
import logo from '@/assets/logo/reflectai-transparent.svg';

const loginSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const registerSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters" }),
  email: z.string().email({ message: "Invalid email format" }).optional(),
  phoneNumber: z.string().optional(),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the Terms and Conditions to create an account"
  }),
  subscribeToNewsletter: z.boolean().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine(
  data => !!data.email || !!data.phoneNumber, 
  { message: "Either email or phone number is required", path: ["root"] }
);

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

const Auth = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user, login, register: registerUser } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  
  // Get tab from URL query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab === 'login' || tab === 'register') {
      setActiveTab(tab);
    }
  }, []);
  
  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      // Check if user came from questionnaire
      const params = new URLSearchParams(window.location.search);
      const source = params.get('source');
      
      if (source === 'questionnaire') {
        // Check if user already has an active subscription
        const checkSubscriptionAndRedirect = async () => {
          try {
            const response = await apiRequest('GET', '/api/subscription/status');
            const subscriptionData = await response.json();
            
            // If user has active subscription, go to counselor instead of app home
            if (subscriptionData.status === 'active' || subscriptionData.trialActive) {
              navigate('/app/counselor');
            } else {
              // If no active subscription, go to subscription page
              navigate('/subscription');
            }
          } catch (error) {
            console.error('Error checking subscription status:', error);
            // On error, default to subscription page
            navigate('/subscription');
          }
        };
        
        checkSubscriptionAndRedirect();
      } else {
        // Otherwise, go directly to counselor
        navigate('/app/counselor');
      }
    }
  }, [user, navigate]);
  
  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });
  
  // Registration form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
      email: '',
      phoneNumber: '',
      agreeToTerms: false,
      subscribeToNewsletter: false,
    },
  });
  
  // Login submission
  const onLoginSubmit = async (values: LoginFormValues) => {
    setIsLoggingIn(true);
    try {
      await login(values.username, values.password);
      
      // Check if user came from questionnaire
      const params = new URLSearchParams(window.location.search);
      const source = params.get('source');
      
      if (source === 'questionnaire') {
        // Check if user already has an active subscription
        try {
          const response = await apiRequest('GET', '/api/subscription/status');
          const subscriptionData = await response.json();
          
          // If user has active subscription, go to counselor instead of app home
          if (subscriptionData.status === 'active' || subscriptionData.trialActive) {
            navigate('/app/counselor');
          } else {
            // If no active subscription, go to subscription page
            navigate('/subscription');
          }
        } catch (error) {
          console.error('Error checking subscription status:', error);
          // On error, default to subscription page
          navigate('/subscription');
        }
      } else {
        // Otherwise, go directly to counselor
        navigate('/app/counselor');
      }
    } catch (error: any) {
      // Error handling is done in the auth hook
      console.error('Login error:', error);
    } finally {
      setIsLoggingIn(false);
    }
  };
  
  // Registration submission
  const onRegisterSubmit = async (values: RegisterFormValues) => {
    setIsRegistering(true);
    try {
      // Remove confirmPassword and agreeToTerms as they're not in our API schema
      const { confirmPassword, agreeToTerms, subscribeToNewsletter, ...registerData } = values;
      
      // Log newsletter subscription preference
      if (subscribeToNewsletter) {
        console.log('User opted in for newsletter subscription');
      }
      
      await registerUser(registerData.username, registerData.password, registerData.email, registerData.phoneNumber);
      
      // Check if user came from pricing page
      const params = new URLSearchParams(window.location.search);
      const source = params.get('source');
      const selectedPlan = sessionStorage.getItem('selectedPlan');
      
      if (source === 'pricing' && selectedPlan) {
        // User came from pricing page - redirect to Stripe checkout with selected plan
        try {
          const plan = JSON.parse(selectedPlan);
          const response = await fetch("/api/checkout-session", { 
            method: "POST",
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ 
              planId: plan.stripePriceId
            })
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.url) {
              // Clear the stored plan and redirect to Stripe
              sessionStorage.removeItem('selectedPlan');
              window.location.href = data.url;
              return;
            }
          }
        } catch (error) {
          console.error('Error creating checkout session:', error);
        }
        // Fallback to subscription page if checkout fails
        navigate('/subscription');
      } else if (source === 'questionnaire') {
        // New users from questionnaire should go to subscription page
        navigate('/subscription');
      } else {
        // Otherwise, go to main app
        navigate('/app');
      }
    } catch (error: any) {
      // Error handling is done in the auth hook
      console.error('Registration error:', error);
    } finally {
      setIsRegistering(false);
    }
  };
  
  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/90">
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row min-h-screen">
          {/* Authentication forms section */}
          <div className="lg:w-1/2 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
            <div className="mx-auto w-full max-w-md">
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex flex-col items-center mb-8">
                  <img src={logo} alt="ReflectAI" className="h-12" />
                </div>
                <h2 className="text-2xl font-semibold mb-6">Welcome to your personal reflection space</h2>
                <p className="text-muted-foreground mb-8">
                  Sign in or create an account to begin your journaling journey with AI-powered insights.
                </p>
              </motion.div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Create Account</TabsTrigger>
                </TabsList>
                
                {/* Login Tab */}
                <TabsContent value="login">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <AtSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input 
                                  placeholder="Enter your username" 
                                  className="pl-10" 
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input 
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Enter your password" 
                                  className="pl-10" 
                                  {...field} 
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-1 top-1 h-8 w-8"
                                  onClick={togglePasswordVisibility}
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-primary to-violet-600 hover:from-primary-dark hover:to-violet-700"
                        disabled={isLoggingIn}
                      >
                        {isLoggingIn ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                            Logging in...
                          </>
                        ) : (
                          <>
                            <LogIn className="mr-2 h-4 w-4" /> 
                            Login
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
                
                {/* Register Tab */}
                <TabsContent value="register">
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <AtSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input 
                                  placeholder="Choose a username" 
                                  className="pl-10" 
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input 
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Create a password" 
                                  className="pl-10" 
                                  {...field} 
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-1 top-1 h-8 w-8"
                                  onClick={togglePasswordVisibility}
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input 
                                  type={showConfirmPassword ? "text" : "password"}
                                  placeholder="Confirm your password" 
                                  className="pl-10" 
                                  {...field} 
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-1 top-1 h-8 w-8"
                                  onClick={toggleConfirmPasswordVisibility}
                                >
                                  {showConfirmPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Please provide at least one contact method:</p>
                        
                        <FormField
                          control={registerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input 
                                    type="email"
                                    placeholder="Enter your email" 
                                    className="pl-10" 
                                    {...field} 
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="phoneNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input 
                                    type="tel"
                                    placeholder="Enter your phone number" 
                                    className="pl-10" 
                                    {...field} 
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormMessage>
                          {registerForm.formState.errors.root?.message && 
                            <p className="text-sm font-medium text-destructive mt-1">
                              {registerForm.formState.errors.root.message}
                            </p>
                          }
                        </FormMessage>
                      </div>
                      
                      {/* Terms and Conditions Agreement */}
                      <FormField
                        control={registerForm.control}
                        name="agreeToTerms"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm">
                                I agree to the{" "}
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="link" className="p-0 h-auto text-primary underline">
                                      Terms and Conditions
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-4xl max-h-[80vh]">
                                    <DialogHeader>
                                      <DialogTitle>Terms and Conditions</DialogTitle>
                                    </DialogHeader>
                                    <ScrollArea className="h-full max-h-[60vh] pr-4">
                                      <div className="space-y-4 text-sm">
                                        <section>
                                          <h3 className="font-semibold mb-2">1. Acceptance of Terms</h3>
                                          <p>By creating an account and using ReflectAI, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our service.</p>
                                        </section>
                                        
                                        <section>
                                          <h3 className="font-semibold mb-2">2. Service Description</h3>
                                          <p>ReflectAI is an AI-powered journaling and mental wellness platform that provides personalized insights, emotional support, and philosophical conversations to help users with personal reflection and growth.</p>
                                        </section>
                                        
                                        <section>
                                          <h3 className="font-semibold mb-2">3. Privacy and Data Protection</h3>
                                          <p>We take your privacy seriously. Your journal entries and personal information are protected and will never be shared with third parties without your explicit consent. We use industry-standard encryption to protect your data.</p>
                                          <p className="mt-2">AI processing is done with privacy safeguards, and personal identifiable information is sanitized before any AI analysis.</p>
                                        </section>
                                        
                                        <section>
                                          <h3 className="font-semibold mb-2">4. User Responsibilities</h3>
                                          <p>You are responsible for:</p>
                                          <ul className="list-disc list-inside mt-2 space-y-1">
                                            <li>Maintaining the confidentiality of your account credentials</li>
                                            <li>All activities that occur under your account</li>
                                            <li>Using the service in compliance with applicable laws</li>
                                            <li>Not sharing harmful, illegal, or inappropriate content</li>
                                          </ul>
                                        </section>
                                        
                                        <section>
                                          <h3 className="font-semibold mb-2">5. AI Services Disclaimer</h3>
                                          <p>ReflectAI's AI responses are for informational and supportive purposes only. They do not constitute professional medical, psychological, or therapeutic advice. If you are experiencing mental health issues, please consult with qualified healthcare professionals.</p>
                                        </section>
                                        
                                        <section>
                                          <h3 className="font-semibold mb-2">6. Subscription and Payments</h3>
                                          <p>Subscription fees are billed according to your selected plan. You may cancel your subscription at any time. Refunds are processed according to our refund policy.</p>
                                        </section>
                                        
                                        <section>
                                          <h3 className="font-semibold mb-2">7. Limitation of Liability</h3>
                                          <p>ReflectAI is provided "as is" without warranties. We are not liable for any indirect, incidental, or consequential damages arising from your use of the service.</p>
                                        </section>
                                        
                                        <section>
                                          <h3 className="font-semibold mb-2">8. Termination</h3>
                                          <p>We may terminate or suspend your account if you violate these terms. You may also delete your account at any time through your account settings.</p>
                                        </section>
                                        
                                        <section>
                                          <h3 className="font-semibold mb-2">9. Changes to Terms</h3>
                                          <p>We may update these terms from time to time. We will notify you of significant changes via email or through the application.</p>
                                        </section>
                                        
                                        <section>
                                          <h3 className="font-semibold mb-2">10. Contact Information</h3>
                                          <p>If you have questions about these terms, please contact us through our support channels within the application.</p>
                                        </section>
                                        
                                        <p className="text-xs text-muted-foreground mt-6">Last updated: {new Date().toLocaleDateString()}</p>
                                      </div>
                                    </ScrollArea>
                                  </DialogContent>
                                </Dialog>
                              </FormLabel>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      {/* Newsletter Subscription */}
                      <FormField
                        control={registerForm.control}
                        name="subscribeToNewsletter"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm">
                                Sign up for newsletter and new releases
                              </FormLabel>
                              <p className="text-xs text-muted-foreground">
                                Get updates about new features, tips, and mental wellness content
                              </p>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-primary to-violet-600 hover:from-primary-dark hover:to-violet-700"
                        disabled={isRegistering || !registerForm.watch('agreeToTerms')}
                      >
                        {isRegistering ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                            Creating account...
                          </>
                        ) : (
                          <>
                            <UserPlus className="mr-2 h-4 w-4" /> 
                            Create Account
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          {/* App showcase section */}
          <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-r from-primary/10 to-violet-500/10 items-center justify-center">
            <div className="max-w-md p-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-center mb-8"
              >
                <h2 className="text-3xl font-bold mb-4">Transform your journaling experience</h2>
                <p className="text-lg text-muted-foreground">
                  Experience the power of AI-enhanced reflection and personal growth
                </p>
              </motion.div>
              
              <div className="relative">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} 
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="rounded-2xl overflow-hidden shadow-2xl border border-border/50 bg-card"
                >
                  <div className="h-8 w-full bg-muted flex items-center px-4">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                            <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"></path>
                            <polygon points="18 2 22 6 12 16 8 16 8 12 18 2"></polygon>
                          </svg>
                        </div>
                        <div className="font-medium">Today's Entry</div>
                      </div>
                      <div className="text-xs text-muted-foreground">May 3, 2025</div>
                    </div>
                    
                    <div className="h-24 w-full bg-muted/30 rounded-md p-3 mb-4 text-left text-sm text-muted-foreground">
                      I'm feeling excited about starting my journaling journey with ReflectAI. Looking forward to gaining deeper insights into my thoughts and feelings...
                    </div>
                    
                    <div className="rounded-md bg-primary/5 border border-primary/10 p-3 text-left">
                      <div className="text-xs font-medium text-primary mb-2">AI Reflection</div>
                      <div className="text-xs leading-relaxed text-muted-foreground">
                        Your excitement about starting a new journaling practice shows your commitment to self-growth. This curiosity and openness will serve you well as you explore your thoughts and feelings more deeply.
                      </div>
                    </div>
                  </div>
                </motion.div>
                
                {/* Decorative elements */}
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
                <div className="absolute -top-6 -left-6 w-32 h-32 bg-violet-500/10 rounded-full blur-2xl"></div>
              </div>
              
              <div className="mt-8 space-y-4">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }} 
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                  className="flex items-start"
                >
                  <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 dark:text-green-400">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">AI-Powered Insights</h3>
                    <p className="text-sm text-muted-foreground">Receive personalized reflections on your journal entries</p>
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, x: -20 }} 
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.8 }}
                  className="flex items-start"
                >
                  <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Track Your Progress</h3>
                    <p className="text-sm text-muted-foreground">Monitor your mood patterns and journaling streak</p>
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, x: -20 }} 
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 1.0 }}
                  className="flex items-start"
                >
                  <div className="bg-purple-100 dark:bg-purple-900/20 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600 dark:text-purple-400">
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                      <path d="m9 12 2 2 4-4"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Achieve Your Goals</h3>
                    <p className="text-sm text-muted-foreground">Set personal goals and track your progress</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;