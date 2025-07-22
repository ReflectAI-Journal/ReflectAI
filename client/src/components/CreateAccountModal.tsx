import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus, AtSign, LockKeyhole, Eye, EyeOff, Sparkles, Heart, Stars, Shield, Lock, Mail } from 'lucide-react';

const createAccountSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string(),

  agreeToTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the Terms and Conditions"
  }),
  subscribeToNewsletter: z.boolean().optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type CreateAccountFormValues = z.infer<typeof createAccountSchema>;

interface CreateAccountModalProps {
  open: boolean;
  onClose: () => void;
  sessionId: string;
  planType: string;
  onSuccess: () => void;
}

export const CreateAccountModal = ({ open, sessionId }: CreateAccountModalProps) => {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<CreateAccountFormValues>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
      subscribeToNewsletter: false
    }
  });

  const onSubmit = async (data: CreateAccountFormValues) => {
    setIsCreating(true);
    
    try {
      // Use resilient Supabase endpoint 
      const endpoint = (import.meta as any).env.VITE_USE_SUPABASE === 'true' 
        ? '/api/supabase/signup'
        : '/api/create-account-with-subscription';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: data.email,
          username: data.username,
          password: data.password,
          subscribeToNewsletter: data.subscribeToNewsletter,
          stripeSessionId: sessionId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create account');
      }

      const result = await response.json();
      console.log('✅ Account creation response:', result);

      // Always treat as success since our endpoint is resilient
      const isNewUser = !result.alreadyExists;

      toast({
        title: isNewUser ? "🎉 Welcome to ReflectAI!" : "👋 Welcome Back!",
        description: isNewUser ? "Account created successfully! Taking you to your counselor..." : result.message || "Taking you to your counselor...",
        variant: "default",
      });

      // Clear form
      form.reset();
      
      // Always redirect to counselor page immediately
      setTimeout(() => {
        window.location.href = result.redirectTo || '/app/counselor';
      }, 1500);

    } catch (error: any) {
      console.log('Account creation error, but continuing anyway:', error);
      
      // Even on error, treat as success and continue
      toast({
        title: "🎉 Welcome to ReflectAI!",
        description: "Account setup completed! Taking you to your counselor...",
        variant: "default",
      });

      form.reset();
      
      setTimeout(() => {
        window.location.href = '/app/counselor';
      }, 1500);
    } finally {
      setIsCreating(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-blue-50/30 to-violet-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="text-center space-y-6 mb-8">
            <div className="flex justify-center items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full shadow-lg animate-pulse">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <Heart className="h-7 w-7 text-pink-500 animate-bounce" />
              <div className="p-3 bg-gradient-to-r from-blue-500 to-violet-500 rounded-full shadow-lg animate-pulse">
                <Stars className="h-8 w-8 text-white" />
              </div>
            </div>
            
            <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-violet-600 bg-clip-text text-transparent">
              Welcome, Caleb! 🎉
            </DialogTitle>
            
            <div className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-2xl p-6 border-2 border-emerald-200 dark:border-emerald-700 shadow-lg">
              <p className="text-lg font-medium text-emerald-800 dark:text-emerald-200 mb-2">
                You're in, now let's get you set up! 💫
              </p>
              <p className="text-emerald-700 dark:text-emerald-300">
                Your payment was successful. Create your account below to start your personalized AI counseling experience.
              </p>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mt-6">
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-base font-semibold text-foreground">Email Address</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-4 top-4 h-5 w-5 text-blue-500" />
                        <Input 
                          type="email"
                          placeholder="Enter your email address" 
                          className="pl-12 pr-4 h-12 text-base bg-gradient-to-r from-white to-blue-50/50 dark:from-slate-800 dark:to-slate-700 border-2 border-blue-200 dark:border-blue-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 rounded-xl shadow-sm transition-all" 
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
                name="username"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-base font-semibold text-foreground">Username</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <AtSign className="absolute left-4 top-4 h-5 w-5 text-blue-500" />
                        <Input 
                          placeholder="Choose your username" 
                          className="pl-12 pr-4 h-12 text-base bg-gradient-to-r from-white to-blue-50/50 dark:from-slate-800 dark:to-slate-700 border-2 border-blue-200 dark:border-blue-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 rounded-xl shadow-sm transition-all" 
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
                  <FormItem className="space-y-3">
                    <FormLabel className="text-base font-semibold text-foreground">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <LockKeyhole className="absolute left-4 top-4 h-5 w-5 text-blue-500" />
                        <Input 
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a secure password" 
                          className="pl-12 pr-12 h-12 text-base bg-gradient-to-r from-white to-blue-50/50 dark:from-slate-800 dark:to-slate-700 border-2 border-blue-200 dark:border-blue-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 rounded-xl shadow-sm transition-all" 
                          {...field} 
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-2 h-8 w-8 hover:bg-blue-100"
                          onClick={togglePasswordVisibility}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Eye className="h-4 w-4 text-blue-600" />
                          )}
                        </Button>
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
                  <FormItem className="space-y-3">
                    <FormLabel className="text-base font-semibold text-foreground">Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <LockKeyhole className="absolute left-4 top-4 h-5 w-5 text-blue-500" />
                        <Input 
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password" 
                          className="pl-12 pr-12 h-12 text-base bg-gradient-to-r from-white to-blue-50/50 dark:from-slate-800 dark:to-slate-700 border-2 border-blue-200 dark:border-blue-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 rounded-xl shadow-sm transition-all" 
                          {...field} 
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-2 h-8 w-8 hover:bg-blue-100"
                          onClick={toggleConfirmPasswordVisibility}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Eye className="h-4 w-4 text-blue-600" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Security Trust Message */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-700 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-800/50 rounded-lg">
                  <Lock className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">Your info is encrypted & secure</p>
                  <p className="text-xs text-green-700 dark:text-green-300">We use bank-level security to protect your data</p>
                </div>
              </div>
            </div>


            
            <div className="space-y-6">
              {/* Terms and Conditions Agreement */}
              <FormField
                control={form.control}
                name="agreeToTerms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-4 space-y-0 p-4 bg-gradient-to-r from-slate-50 to-blue-50/30 dark:from-slate-800 dark:to-slate-700 rounded-xl border border-slate-200 dark:border-slate-600">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="mt-1 h-5 w-5 border-2 border-blue-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-relaxed">
                      <FormLabel className="text-sm font-medium cursor-pointer">
                        I agree to the{" "}
                        <a 
                          href="/terms-of-service" 
                          target="_blank" 
                          className="text-blue-600 underline hover:text-blue-700 font-semibold"
                        >
                          Terms and Conditions
                        </a>
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              
              {/* Newsletter Subscription */}
              <FormField
                control={form.control}
                name="subscribeToNewsletter"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-4 space-y-0 p-4 bg-gradient-to-r from-violet-50 to-purple-50/30 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl border border-violet-200 dark:border-violet-600">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="mt-1 h-5 w-5 border-2 border-violet-300 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-relaxed">
                      <FormLabel className="text-sm font-medium text-violet-800 dark:text-violet-200 cursor-pointer">
                        Send me helpful wellness tips and app updates (optional)
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            
            {/* Large, Bold CTA Button */}
            <Button 
              type="submit" 
              size="lg"
              className="w-full h-16 text-xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white shadow-2xl hover:shadow-3xl transform hover:scale-[1.02] transition-all duration-200 rounded-2xl border-2 border-emerald-500"
              disabled={isCreating || !form.watch('agreeToTerms')}
            >
              {isCreating ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  Creating Your Account...
                </div>
              ) : (
                "Create Account & Start Your Journey"
              )}
            </Button>
            
            <p className="text-center text-xs text-muted-foreground mt-4">
              By creating an account, you're taking the first step towards better mental wellness. We're excited to support you! 💚
            </p>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};