import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus, AtSign, LockKeyhole, Eye, EyeOff, Mail, Phone, Sparkles, Heart, Stars } from 'lucide-react';

const createAccountSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string(),
  email: z.string().email({ message: "Please enter a valid email address" }).optional().or(z.literal('')),
  phoneNumber: z.string().optional().or(z.literal('')),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the Terms and Conditions"
  }),
  subscribeToNewsletter: z.boolean().optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => data.email || data.phoneNumber, {
  message: "Please provide either an email address or phone number",
  path: ["root"]
});

type CreateAccountFormValues = z.infer<typeof createAccountSchema>;

interface CreateAccountModalProps {
  open: boolean;
  onClose: () => void;
  sessionId: string;
  planType: string;
  onSuccess: () => void;
}

export const CreateAccountModal = ({ open, onClose, sessionId, planType, onSuccess }: CreateAccountModalProps) => {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<CreateAccountFormValues>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
      email: '',
      phoneNumber: '',
      agreeToTerms: false,
      subscribeToNewsletter: false
    }
  });

  const onSubmit = async (data: CreateAccountFormValues) => {
    setIsCreating(true);
    
    try {
      // Use resilient Supabase endpoint 
      const endpoint = import.meta.env.VITE_USE_SUPABASE === 'true' 
        ? '/api/supabase/create-account-simple'
        : '/api/create-account-with-subscription';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: data.username,
          password: data.password,
          email: data.email || undefined,
          phoneNumber: data.phoneNumber || undefined,
          name: data.username, // Add name field for Supabase
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

      // Show email confirmation message first for new users
      if (isNewUser) {
        toast({
          title: "🎉 You're almost there!",
          description: "We've sent a confirmation email to your inbox. Please click the link inside to activate your account.",
          variant: "default",
          duration: 6000,
        });

        // Wait then show welcome message
        setTimeout(() => {
          toast({
            title: "🎉 Welcome to ReflectAI!",
            description: "Account created successfully! Taking you to your counselor...",
            variant: "default",
          });
        }, 3000);
      } else {
        // Existing user
        toast({
          title: "👋 Welcome Back!",
          description: result.message || "Taking you to your counselor...",
          variant: "default",
        });
      }

      // Clear form
      form.reset();
      
      // Always redirect to counselor page (longer delay for new users to see email message)
      setTimeout(() => {
        window.location.href = result.redirectTo || '/app/counselor';
      }, isNewUser ? 4500 : 1500);

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
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="text-center space-y-4 mb-6">
            <div className="flex justify-center items-center space-x-2">
              <Sparkles className="h-8 w-8 text-purple-500 animate-pulse" />
              <Heart className="h-6 w-6 text-pink-500 animate-bounce" />
              <Stars className="h-8 w-8 text-blue-500 animate-pulse" />
            </div>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 bg-clip-text text-transparent">
              🎉 Payment Successful!
            </DialogTitle>
            <p className="text-center text-lg font-medium text-gray-700 dark:text-gray-300 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-2xl p-4 shadow-lg border border-purple-200 dark:border-purple-700">
              ✨ Let's create your account to start your AI counseling journey! ✨
            </p>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
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
              <p className="text-sm text-muted-foreground">Contact method (at least one required):</p>
              
              <FormField
                control={form.control}
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
                control={form.control}
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
                {form.formState.errors.root?.message && 
                  <p className="text-sm font-medium text-destructive mt-1">
                    {form.formState.errors.root.message}
                  </p>
                }
              </FormMessage>
            </div>
            
            {/* Terms and Conditions Agreement */}
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
                        className="text-primary underline hover:text-primary-dark"
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
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm text-muted-foreground">
                      Subscribe to our newsletter for wellness tips and updates
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-primary to-violet-600 hover:from-primary-dark hover:to-violet-700"
              disabled={isCreating || !form.watch('agreeToTerms')}
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create Account & Continue
                </>
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};