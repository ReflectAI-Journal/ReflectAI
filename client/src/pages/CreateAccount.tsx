import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation } from 'wouter';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, Eye, EyeOff, Lock, Mail, User, Shield, Crown, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/use-firebase-auth';

const createAccountSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string(),
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the Terms and Conditions"
  }),
  subscribeToNewsletter: z.boolean().optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type CreateAccountFormValues = z.infer<typeof createAccountSchema>;

export const CreateAccount = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { signUp } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [sessionData, setSessionData] = useState<any>(null);

  const form = useForm<CreateAccountFormValues>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      agreeToTerms: false,
      subscribeToNewsletter: true
    }
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    
    if (!sessionId) {
      toast({
        title: "Invalid Access",
        description: "No payment session found. Redirecting to pricing...",
        variant: "destructive",
      });
      navigate('/pricing');
      return;
    }

    const verifySession = async () => {
      try {
        const response = await fetch(`/api/stripe/verify-session/${sessionId}`, {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Session verification failed');
        }

        const data = await response.json();
        setSessionData(data);
        
        // Pre-fill email if available from Stripe
        if (data.customerEmail) {
          form.setValue('email', data.customerEmail);
        }
        
        setIsVerifying(false);
      } catch (error) {
        console.error('Session verification error:', error);
        toast({
          title: "Verification Failed",
          description: "Unable to verify your payment. Please contact support.",
          variant: "destructive",
        });
        navigate('/pricing');
      }
    };

    verifySession();
  }, [navigate, toast, form]);



  const onSubmit = async (data: CreateAccountFormValues) => {
    if (!sessionData) return;
    
    setIsCreating(true);
    
    try {
      // Create Firebase account
      const userCredential = await signUp(data.email, data.password);
      
      if (!userCredential || !userCredential.user) {
        throw new Error('Failed to create Firebase account');
      }

      // Create local account record with subscription
      const response = await fetch('/api/create-account-with-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          subscribeToNewsletter: data.subscribeToNewsletter,
          sessionId: new URLSearchParams(window.location.search).get('session_id'),
          firebaseUid: userCredential.user.uid
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create account');
      }

      await response.json();
      
      toast({
        title: "Welcome to ReflectAI! 🎉",
        description: `Your ${sessionData.planType} account is ready. Let's begin your journey!`,
      });

      // Redirect to app
      navigate('/app/counselor');
      
    } catch (error: any) {
      console.error('Account creation error:', error);
      toast({
        title: "Account Creation Failed",
        description: error.message || "Failed to create your account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const getPlanIcon = (planType: string) => {
    switch (planType?.toLowerCase()) {
      case 'basic': return <Shield className="h-5 w-5" />;
      case 'elite': return <Crown className="h-5 w-5" />;
      default: return <Sparkles className="h-5 w-5" />;
    }
  };

  const getPlanColor = (planType: string) => {
    switch (planType?.toLowerCase()) {
      case 'basic': return 'from-blue-500 to-cyan-500';
      case 'elite': return 'from-amber-500 to-orange-500';
      default: return 'from-purple-500 to-pink-500';
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
            </div>
            <CardTitle className="text-2xl">Verifying Payment</CardTitle>
            <CardDescription>
              Please wait while we confirm your payment details...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Success Banner */}
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <CardTitle className="text-xl text-green-800 dark:text-green-200">
                Payment Successful!
              </CardTitle>
              {sessionData && (
                <div className="flex items-center justify-center mt-3">
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r ${getPlanColor(sessionData.planType)} text-white text-sm font-medium`}>
                    {getPlanIcon(sessionData.planType)}
                    {sessionData.planType} Plan Activated
                  </div>
                </div>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Account Creation Form */}
        <Card>
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl">Create Your Account</CardTitle>
            <CardDescription>
              Complete your setup to start your ReflectAI journey
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Email/Password Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input {...field} className="pl-10" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input {...field} className="pl-10" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input {...field} type="email" className="pl-10" />
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
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            {...field} 
                            type={showPassword ? "text" : "password"} 
                            className="pl-10 pr-10" 
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
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
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            {...field} 
                            type={showConfirmPassword ? "text" : "password"} 
                            className="pl-10 pr-10" 
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-3">
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
                          <FormLabel className="text-sm">
                            I agree to the{" "}
                            <a
                              href="/terms-of-service"
                              target="_blank"
                              className="text-primary hover:underline"
                            >
                              Terms of Service
                            </a>{" "}
                            and{" "}
                            <a
                              href="/privacy-policy"
                              target="_blank"
                              className="text-primary hover:underline"
                            >
                              Privacy Policy
                            </a>
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subscribeToNewsletter"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm text-muted-foreground">
                          Subscribe to our newsletter for wellness tips and updates
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isCreating}
                  size="lg"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create My Account
                    </>
                  )}
                </Button>
              </form>
            </Form>

            {/* Security Notice */}
            <div className="text-center text-xs text-muted-foreground">
              Your information is protected with enterprise-grade security
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateAccount;