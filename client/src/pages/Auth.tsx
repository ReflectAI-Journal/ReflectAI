import { useState, useEffect } from 'react';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logo from "@/assets/logo/reflectai-transparent.svg";

const Auth = () => {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const PUBLISHABLE_KEY = (import.meta as any).env.VITE_CLERK_PUBLISHABLE_KEY;

  const handleFallbackLogin = async () => {
    setIsLoading(true);
    
    // Create a mock user for the fallback system
    const mockUser = {
      id: 'fallback-user-1',
      emailAddress: email || 'demo@reflectai.app',
      firstName: name || 'Demo',
      lastName: 'User'
    };
    
    // Store in localStorage for the fallback auth system
    localStorage.setItem('fallback_user', JSON.stringify(mockUser));
    
    // Simulate loading time
    setTimeout(() => {
      setIsLoading(false);
      navigate('/app/counselor');
    }, 1000);
  };

  const handleFallbackSignup = async () => {
    setIsLoading(true);
    
    // Create a mock user for the fallback system
    const mockUser = {
      id: 'fallback-user-' + Date.now(),
      emailAddress: email || 'demo@reflectai.app',
      firstName: name || 'Demo',
      lastName: 'User'
    };
    
    // Store in localStorage for the fallback auth system
    localStorage.setItem('fallback_user', JSON.stringify(mockUser));
    
    // Simulate loading time
    setTimeout(() => {
      setIsLoading(false);
      navigate('/app/counselor');
    }, 1000);
  };

  // Use Clerk components if available, fallback forms if not
  const shouldUseFallback = !PUBLISHABLE_KEY || PUBLISHABLE_KEY === "pk_test_placeholder";

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
                {shouldUseFallback ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <Button 
                      onClick={handleFallbackLogin} 
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                    <div className="text-center text-sm text-slate-600 dark:text-slate-400">
                      Demo mode - Enter any credentials to continue
                    </div>
                  </div>
                ) : (
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
                )}
              </TabsContent>
              
              <TabsContent value="register" className="mt-6">
                {shouldUseFallback ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-signup">Email</Label>
                      <Input
                        id="email-signup"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-signup">Password</Label>
                      <Input
                        id="password-signup"
                        type="password"
                        placeholder="Create a password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <Button 
                      onClick={handleFallbackSignup} 
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating account..." : "Sign Up"}
                    </Button>
                    <div className="text-center text-sm text-slate-600 dark:text-slate-400">
                      Demo mode - Enter any credentials to continue
                    </div>
                  </div>
                ) : (
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
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;