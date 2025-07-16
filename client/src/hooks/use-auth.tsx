import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
// Temporarily disable mixpanel to fix React errors
// import mixpanel from "mixpanel-browser";
import { useMutation, useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type SubscriptionStatus = {
  status: 'active' | 'trial' | 'expired';
  trialActive: boolean;
  trialEndsAt: string | null;
  daysLeft?: number;
  requiresSubscription: boolean;
  plan?: string;
};

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  subscriptionStatus: SubscriptionStatus | null;
  isSubscriptionLoading: boolean;
  login: (username: string, password: string) => Promise<User>;
  register: (username: string, password: string, email?: string, phoneNumber?: string) => Promise<User>;
  logout: () => Promise<void>;
  getInitials: () => string;
  checkSubscriptionStatus: () => Promise<SubscriptionStatus>;
  cancelSubscription: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [initials, setInitials] = useState<string>("JA");

  // JWT Token management
  const getToken = () => localStorage.getItem('auth_token');
  const setToken = (token: string) => localStorage.setItem('auth_token', token);
  const removeToken = () => localStorage.removeItem('auth_token');

  const {
    data: user,
    error,
    isLoading,
    refetch,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/user"],
    queryFn: async () => {
      try {
        console.log("=== Frontend /api/user Debug Info ===");
        console.log("Making request to /api/user");
        
        const token = getToken();
        console.log("JWT Token found:", !!token);
        
        const headers: HeadersInit = {};
        
        if (token) {
          headers.Authorization = `Bearer ${token}`;
          console.log("Using JWT token for authentication");
        } else {
          console.log("No JWT token, falling back to session auth");
        }
        
        const res = await fetch("/api/user", {
          credentials: "include", // Keep for backward compatibility
          method: "GET",
          headers,
        });
        
        console.log("Response status:", res.status);
        
        if (res.status === 401) {
          console.log("User not authenticated, clearing token");
          removeToken();
          return null;
        }
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        const userData = await res.json();
        console.log("User data fetched successfully:", userData);
        console.log("=====================================");
        
        if (userData?.username && typeof userData.username === 'string') {
          setInitials(getInitialsFromUsername(userData.username));
        }
        return userData;
      } catch (error) {
        console.error("Error fetching user data:", error);
        removeToken();
        return null;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  const {
    data: subscriptionStatus,
    isLoading: isSubscriptionLoading,
    refetch: refetchSubscription
  } = useQuery<SubscriptionStatus | null>({
    queryKey: ["/api/subscription/status"],
    queryFn: async () => {
      try {
        if (!user || !user.id) return null;
        const res = await apiRequest("GET", "/api/subscription/status");
        if (!res.ok) return null;
        const data = await res.json();
        return data;
      } catch (error) {
        console.error("Error fetching subscription status:", error);
        return null;
      }
    },
    enabled: !!user,
  });

  const getInitialsFromUsername = (username: string): string => {
    if (!username || typeof username !== 'string') return "JA";
    try {
      if (username.includes(" ")) {
        return username
          .split(" ")
          .filter(part => part && part.length > 0)
          .map(part => part.charAt(0).toUpperCase())
          .slice(0, 2)
          .join("");
      }
      return username.slice(0, 2).toUpperCase();
    } catch (error) {
      console.error("Error generating initials:", error);
      return "JA";
    }
  };

  const login = async (username: string, password: string): Promise<User> => {
    try {
      console.log("=== Frontend Login Debug Info ===");
      console.log("Attempting login for user:", username);
      console.log("Document.cookie before login:", document.cookie);
      
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });
      
      console.log("Login response status:", res.status);
      console.log("Login response headers:", Object.fromEntries(res.headers.entries()));
      console.log("Document.cookie after login:", document.cookie);
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Login failed. Please check your credentials.');
      }
      
      const userData = await res.json();
      console.log("Login successful, user data:", userData);
      
      // Store JWT token if provided
      if (userData.token) {
        console.log("Storing JWT token");
        setToken(userData.token);
      }
      
      console.log("==================================");
      
      // Force refetch of user data to ensure consistency
      await refetch();
      setInitials(getInitialsFromUsername(userData.username));

      // ✅ Mixpanel tracking for login (temporarily disabled)
      // mixpanel.identify(userData.id || userData.username);
      // mixpanel.people.set({
      //   $name: userData.username,
      //   $email: userData.email,
      //   plan: "Free",
      // });
      // mixpanel.track("User Logged In");

      toast({
        title: "Login successful!",
        description: "Welcome back to ReflectAI.",
      });

      return userData;
    } catch (err: any) {
      toast({
        title: "Login failed",
        description: err.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
      throw err;
    }
  };

  const register = async (username: string, password: string, email?: string, phoneNumber?: string): Promise<User> => {
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          username, 
          password, 
          email: email || undefined,
          phoneNumber: phoneNumber || undefined 
        }),
        credentials: "include",
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Registration failed. Please try different credentials.');
      }

      const userData = await res.json();
      console.log("Registration successful, user data:", userData);
      
      // Store JWT token if provided
      if (userData.token) {
        console.log("Storing JWT token");
        setToken(userData.token);
      }
      
      // Force refetch of user data to ensure consistency
      await refetch();
      setInitials(getInitialsFromUsername(userData.username));

      // ✅ Mixpanel tracking for registration (temporarily disabled)
      // mixpanel.identify(userData.id || userData.username);
      // mixpanel.people.set({
      //   $name: userData.username,
      //   $email: userData.email,
      //   plan: "Trial",
      // });
      // mixpanel.track("User Registered", {
      //   source: "ReflectAI Web",
      //   plan: "Trial",
      // });

      toast({
        title: "Registration successful!",
        description: "Welcome to ReflectAI. Your 7-day free trial has started!",
      });

      return userData;
    } catch (err: any) {
      toast({
        title: "Registration failed",
        description: err.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
      throw err;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await apiRequest("POST", "/api/logout");
      removeToken(); // Clear JWT token
      queryClient.setQueryData(["/api/user"], null);
      setInitials("JA");
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (err: any) {
      removeToken(); // Clear JWT token even if logout request fails
      queryClient.setQueryData(["/api/user"], null);
      setInitials("JA");
      toast({
        title: "Logged out",
        description: "You have been logged out.",
      });
    }
  };

  const getInitials = () => initials;

  const checkSubscriptionStatus = async (): Promise<SubscriptionStatus> => {
    try {
      if (!user) {
        throw new Error("User is not authenticated");
      }

      const res = await apiRequest("GET", "/api/subscription/status");
      if (!res.ok) {
        throw new Error("Failed to check subscription status");
      }

      const status = await res.json();
      queryClient.setQueryData(["/api/subscription/status"], status);
      return status;
    } catch (err: any) {
      toast({
        title: "Subscription Status Check Failed",
        description: err.message || "Something went wrong checking your subscription status.",
        variant: "destructive",
      });
      throw err;
    }
  };

  const cancelSubscription = async (): Promise<void> => {
    try {
      if (!user) {
        throw new Error("User is not authenticated");
      }

      const res = await apiRequest("POST", "/api/subscription/cancel");

      let data;
      try {
        data = await res.json();
      } catch (e) {
        data = {};
      }

      if (!res.ok) {
        throw new Error(data.message || "Failed to cancel subscription");
      }

      if (data.user) {
        queryClient.setQueryData(["/api/user"], data.user);
      }

      refetch();
      refetchSubscription();

      toast({
        title: "Subscription Canceled",
        description: "Your subscription has been successfully canceled.",
      });
    } catch (err: any) {
      toast({
        title: "Subscription Cancellation Failed",
        description: err.message || "Something went wrong canceling your subscription.",
        variant: "destructive",
      });
      throw err;
    }
  };

  useEffect(() => {
    if (user) {
      refetchSubscription();
    }
  }, [user, refetchSubscription]);

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        error: error || null,
        subscriptionStatus: subscriptionStatus || null,
        isSubscriptionLoading,
        login,
        register,
        logout,
        getInitials,
        checkSubscriptionStatus,
        cancelSubscription,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
