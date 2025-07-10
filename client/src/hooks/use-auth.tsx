import { createContext, ReactNode, useContext, useEffect, useState } from "react";
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

type AuthContextType = {
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
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [initials, setInitials] = useState<string>("JA");
  
  const {
    data: user,
    error,
    isLoading,
    refetch,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/user"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/user");
        if (res.status === 401) return null;
        const userData = await res.json();
        // Calculate initials when user data changes
        if (userData?.username) {
          setInitials(getInitialsFromUsername(userData.username));
        }
        return userData;
      } catch (error) {
        return null;
      }
    },
  });
  
  // Query for subscription status
  const {
    data: subscriptionStatus,
    isLoading: isSubscriptionLoading,
    refetch: refetchSubscription
  } = useQuery<SubscriptionStatus | null>({
    queryKey: ["/api/subscription/status"],
    queryFn: async () => {
      try {
        if (!user) return null;
        const res = await apiRequest("GET", "/api/subscription/status");
        if (!res.ok) return null;
        return await res.json();
      } catch (error) {
        console.error("Error fetching subscription status:", error);
        return null;
      }
    },
    // Only run this query if the user is logged in
    enabled: !!user,
  });

  // Helper function to get initials from username
  const getInitialsFromUsername = (username: string): string => {
    if (!username) return "JA"; // Default fallback
    
    // If username has spaces (like a full name), use first letter of each word
    if (username.includes(" ")) {
      return username
        .split(" ")
        .map(part => part.charAt(0).toUpperCase())
        .slice(0, 2)
        .join("");
    }
    
    // If it's a single word, use first 2 characters
    return username.slice(0, 2).toUpperCase();
  };

  const login = async (username: string, password: string): Promise<User> => {
    try {
      const res = await apiRequest("POST", "/api/login", { username, password });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Login failed. Please check your credentials.');
      }
      
      const userData = await res.json();
      
      // Update the user data in the query cache
      queryClient.setQueryData(["/api/user"], userData);
      
      // Update initials
      setInitials(getInitialsFromUsername(userData.username));
      
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
      const res = await apiRequest("POST", "/api/register", { 
        username, 
        password,
        email: email || undefined,
        phoneNumber: phoneNumber || undefined
      });
      
      if (!res.ok) {
        let errorMessage = 'Registration failed. Please try different credentials.';
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If JSON parsing fails, try to get text
          const errorText = await res.text();
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      const userData = await res.json();
      
      // Update the user data in the query cache
      queryClient.setQueryData(["/api/user"], userData);
      
      // Update initials
      setInitials(getInitialsFromUsername(userData.username));
      
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
      
      // Clear user data from the query cache
      queryClient.setQueryData(["/api/user"], null);
      
      // Reset initials
      setInitials("JA");
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (err: any) {
      toast({
        title: "Logout failed",
        description: err.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
      throw err;
    }
  };

  const getInitials = () => initials;
  
  // Function to manually check subscription status
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
      // Update the subscription status in the query cache
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
  
  // Function to cancel subscription
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
      
      // Update the user data in the query cache with the updated user info
      if (data.user) {
        queryClient.setQueryData(["/api/user"], data.user);
      }
      
      // Refresh user data and subscription status
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

  // Refresh subscription status after login and registration
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