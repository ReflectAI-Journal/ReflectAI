import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus, AtSign, LockKeyhole, Eye, EyeOff, Mail, Phone, CheckCircle, ArrowLeft } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';

const createAccountSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters" }),
  email: z.string().email({ message: "Invalid email format" }).optional(),
  phoneNumber: z.string().optional(),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the Terms and Conditions to create an account"
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine(
  data => !!data.email || !!data.phoneNumber, 
  { message: "Either email or phone number is required", path: ["root"] }
);

type CreateAccountFormValues = z.infer<typeof createAccountSchema>;

const CreateAccount = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { refetch } = useAuth();
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [planInfo, setPlanInfo] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string>('');
  
  // Extract session ID and plan from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const session = params.get('session_id');
    const plan = params.get('plan');
    
    if (!session) {
      toast({
        title: "Invalid Access",
        description: "Please start by selecting a plan on the pricing page.",
        variant: "destructive",
      });
      navigate('/pricing');
      return;
    }
    
    setSessionId(session);
    setPlanInfo({ plan: plan || 'unknown' });
  }, [navigate, toast]);

  const form = useForm<CreateAccountFormValues>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
      email: '',
      phoneNumber: '',
      agreeToTerms: false,
    },
  });

  const onSubmit = async (values: CreateAccountFormValues) => {
    if (!sessionId) {
      toast({
        title: "Error",
        description: "Invalid session. Please start from the pricing page.",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingAccount(true);
    try {
      // Remove confirmPassword and agreeToTerms from the data sent to backend
      const { confirmPassword, agreeToTerms, ...accountData } = values;
      
      // Create account with Stripe session verification
      const response = await apiRequest('/api/create-account-with-subscription', {
        method: 'POST',
        body: JSON.stringify({
          ...accountData,
          sessionId,
          agreeToTerms: true
        })
      });

      const result = await response.json();

      // Store token if provided and refresh auth state
      if (result.token) {
        localStorage.setItem('authToken', result.token);
      }
      
      // Refresh authentication state
      await refetch();

      toast({
        title: "Account Created Successfully!",
        description: `Welcome to ReflectAI! Your ${planInfo?.plan || ''} subscription is now active.`,
        variant: "default",
      });

      // Redirect to the app
      navigate('/app/counselor');
      
    } catch (error: any) {
      console.error('Account creation error:', error);
      
      toast({
        title: "Account Creation Failed",
        description: error.message || "Failed to create account. Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingAccount(false);
    }
  };

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/90 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/90">
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row min-h-screen">
          {/* Account creation form section */}
          <div className="lg:w-1/2 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
            <div className="mx-auto w-full max-w-md">
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex flex-col items-center mb-8">
                  <div className="text-2xl font-bold text-primary">ReflectAI</div>
                </div>
                
                {/* Back button */}
                <Button
                  variant="ghost"
                  onClick={() => navigate('/pricing')}
                  className="mb-6 self-start"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Pricing
                </Button>
                
                {/* Success indicator */}
                <div className="flex items-center justify-center mb-6">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                  <span className="text-green-600 font-medium">Payment Successful!</span>
                </div>
                
                <h2 className="text-2xl font-semibold mb-4">Create Your Account</h2>
                <p className="text-muted-foreground mb-8">
                  Your {planInfo?.plan || ''} subscription is ready. Create your account to start your AI-powered wellness journey.
                </p>

                {/* OAuth Options */}
                <div className="space-y-4 mb-6">
                  <div className="text-center text-sm text-muted-foreground">
                    Continue with your existing account
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        const googleUrl = `/auth/google?session_id=${sessionId}&plan=${planInfo?.plan || ''}`;
                        window.location.href = googleUrl;
                      }}
                    >
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Google
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        const appleUrl = `/auth/apple?session_id=${sessionId}&plan=${planInfo?.plan || ''}`;
                        window.location.href = appleUrl;
                      }}
                    >
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                      </svg>
                      Apple
                    </Button>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or create new account
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
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
                    control={form.control}
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
                              className="pl-10 pr-10" 
                              {...field} 
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                            >
                              {showPassword ? <EyeOff /> : <Eye />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
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
                              className="pl-10 pr-10" 
                              {...field} 
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                            >
                              {showConfirmPassword ? <EyeOff /> : <Eye />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">Please provide at least one contact method:</p>
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email (Optional)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input 
                                type="email"
                                placeholder="your.email@example.com" 
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
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number (Optional)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input 
                                type="tel"
                                placeholder="(555) 123-4567" 
                                className="pl-10" 
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
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
                          <FormLabel className="text-sm font-normal">
                            I agree to the{' '}
                            <a href="/terms-of-service" target="_blank" className="text-primary underline">
                              Terms and Conditions
                            </a>
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isCreatingAccount}
                  >
                    {isCreatingAccount ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Create Account & Start Journey
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          </div>

          {/* Right side - Success confirmation */}
          <div className="lg:w-1/2 bg-gradient-to-br from-primary/10 to-violet-500/10 flex items-center justify-center p-8">
            <motion.div 
              className="text-center max-w-md"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="bg-green-100 dark:bg-green-900/20 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              
              <h3 className="text-2xl font-bold mb-4">Payment Complete!</h3>
              <p className="text-muted-foreground mb-6">
                Your subscription has been successfully activated. Complete your account setup to start your personalized AI counseling experience.
              </p>
              
              <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border">
                <h4 className="font-semibold mb-2">What's Next?</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Complete your account creation</li>
                  <li>• Meet your AI counselor</li>
                  <li>• Start your wellness journey</li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAccount;