import { useState } from "react";
import { Mail, ArrowLeft, CheckCircle, Lock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Validation schemas
const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address")
});

const resetSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type EmailForm = z.infer<typeof emailSchema>;
type ResetForm = z.infer<typeof resetSchema>;

type ResetStep = "email" | "sent" | "reset" | "success";

export default function PasswordReset() {
  const [step, setStep] = useState<ResetStep>("email");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Get token from URL params if we're on reset step
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  
  // Initialize step based on URL
  useState(() => {
    if (token) {
      setStep("reset");
    }
  });

  const emailForm = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" }
  });

  const resetForm = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "", confirmPassword: "" }
  });

  const handleSendEmail = async (data: EmailForm) => {
    setLoading(true);
    try {
      await apiRequest("POST", "/api/auth/forgot-password", { email: data.email });
      setEmail(data.email);
      setStep("sent");
      toast({
        title: "Reset email sent",
        description: "Check your email for the reset link."
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send reset email",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (data: ResetForm) => {
    if (!token) {
      toast({
        title: "Error", 
        description: "Invalid reset token",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await apiRequest("POST", "/api/auth/reset-password", {
        token,
        password: data.password
      });
      setStep("success");
      toast({
        title: "Password reset successful",
        description: "You can now log in with your new password."
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reset password",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const ProgressIndicator = ({ currentStep }: { currentStep: ResetStep }) => {
    const steps = [
      { key: "email", label: "Request", icon: Mail },
      { key: "sent", label: "Email Sent", icon: RefreshCw },
      { key: "reset", label: "New Password", icon: Lock },
      { key: "success", label: "Complete", icon: CheckCircle }
    ];

    const currentIndex = steps.findIndex(s => s.key === currentStep);

    return (
      <div className="flex items-center justify-between w-full max-w-md mx-auto mb-8">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index <= currentIndex;
          const isCurrent = index === currentIndex;
          
          return (
            <div key={step.key} className="flex flex-col items-center flex-1">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center border-2 mb-2
                ${isActive 
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : 'border-gray-300 text-gray-400'
                }
                ${isCurrent ? 'ring-4 ring-blue-200' : ''}
              `}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-xs font-medium ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                {step.label}
              </span>
              {index < steps.length - 1 && (
                <div className={`
                  absolute top-5 w-full h-0.5 -z-10
                  ${index < currentIndex ? 'bg-blue-600' : 'bg-gray-300'}
                `} style={{ left: '50%', width: 'calc(100% - 40px)' }} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h1>
          <p className="text-gray-600">
            {step === "email" && "Enter your email to receive a reset link"}
            {step === "sent" && "Check your email for the reset link"}
            {step === "reset" && "Create your new password"}
            {step === "success" && "Your password has been reset successfully"}
          </p>
        </div>

        <ProgressIndicator currentStep={step} />

        {/* Email Request Step */}
        {step === "email" && (
          <Form {...emailForm}>
            <form onSubmit={emailForm.handleSubmit(handleSendEmail)} className="space-y-6">
              <FormField
                control={emailForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="Enter your email"
                        {...field}
                        className="h-12"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Mail className="w-4 h-4 mr-2" />
                )}
                Send Reset Link
              </Button>
            </form>
          </Form>
        )}

        {/* Email Sent Step */}
        {step === "sent" && (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Check your email</h3>
              <p className="text-gray-600 mb-4">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <p className="text-sm text-gray-500">
                Didn't receive the email? Check your spam folder or{" "}
                <button 
                  onClick={() => setStep("email")}
                  className="text-blue-600 hover:underline"
                >
                  try again
                </button>
              </p>
            </div>
          </div>
        )}

        {/* Reset Password Step */}
        {step === "reset" && (
          <Form {...resetForm}>
            <form onSubmit={resetForm.handleSubmit(handleResetPassword)} className="space-y-6">
              <FormField
                control={resetForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Enter new password"
                        {...field}
                        className="h-12"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={resetForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Confirm new password"
                        {...field}
                        className="h-12"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Lock className="w-4 h-4 mr-2" />
                )}
                Reset Password
              </Button>
            </form>
          </Form>
        )}

        {/* Success Step */}
        {step === "success" && (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Password Reset Complete</h3>
              <p className="text-gray-600 mb-6">
                Your password has been successfully reset. You can now log in with your new password.
              </p>
              <Button 
                onClick={() => setLocation("/auth?tab=login")}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Continue to Login
              </Button>
            </div>
          </div>
        )}

        {/* Back to Login Link */}
        {(step === "email" || step === "sent") && (
          <div className="mt-8 text-center">
            <Link href="/auth?tab=login">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-800">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}