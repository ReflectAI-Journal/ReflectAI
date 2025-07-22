import { useState, useEffect } from 'react';
import { SignIn, SignUp, SignedIn, SignedOut } from '@clerk/clerk-react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo/reflectai-transparent.svg";

const Auth = () => {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("login");
  const PUBLISHABLE_KEY = (import.meta as any).env.VITE_CLERK_PUBLISHABLE_KEY;

  // Show setup message when Clerk keys aren't configured
  if (!PUBLISHABLE_KEY || PUBLISHABLE_KEY === "pk_test_placeholder") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img 
              src={logo} 
              alt="ReflectAI Logo" 
              className="h-16 mx-auto mb-4" 
            />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Welcome to ReflectAI
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Your AI counselor for mental wellness
            </p>
          </div>

          <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-slate-200/50 dark:border-slate-800/50">
            <CardContent className="p-6 text-center">
              <h2 className="text-lg font-semibold mb-4">Authentication Setup Required</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                To enable user authentication, please configure your Clerk API keys in the environment variables.
              </p>
              <div className="space-y-3 text-sm text-left bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <p><strong>Required Keys:</strong></p>
                <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                  <li>VITE_CLERK_PUBLISHABLE_KEY</li>
                  <li>CLERK_SECRET_KEY</li>
                </ul>
              </div>
              <Button 
                onClick={() => navigate('/')} 
                variant="outline" 
                className="mt-6 w-full"
              >
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img 
            src={logo} 
            alt="ReflectAI Logo" 
            className="h-16 mx-auto mb-4" 
          />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Welcome to ReflectAI
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Your AI counselor for mental wellness
          </p>
        </div>

        <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-slate-200/50 dark:border-slate-800/50">
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="mt-6">
                <div className="flex justify-center">
                  <SignIn 
                    routing="hash"
                    redirectUrl="/app/counselor"
                    appearance={{
                      elements: {
                        rootBox: "mx-auto",
                        card: "shadow-none border-0 bg-transparent"
                      }
                    }}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="register" className="mt-6">
                <div className="flex justify-center">
                  <SignUp 
                    routing="hash"
                    redirectUrl="/app/counselor"
                    appearance={{
                      elements: {
                        rootBox: "mx-auto",
                        card: "shadow-none border-0 bg-transparent"
                      }
                    }}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <SignedIn>
          <div className="text-center mt-4">
            <p className="text-slate-600 dark:text-slate-400">
              Redirecting to your counselor...
            </p>
          </div>
        </SignedIn>
      </div>
    </div>
  );
};

export default Auth;