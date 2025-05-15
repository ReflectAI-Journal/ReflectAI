import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Extend the User type to include isGuest property
type ExtendedUser = Omit<User, 'createdAt' | 'updatedAt'> & {
  isGuest?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type SubscriptionStatus = {
  status: 'active' | 'trial' | 'expired';
  trialActive: boolean;
  trialEndsAt: string | null;
  daysLeft?: number;
  requiresSubscription: boolean;
  plan?: string;
};

type AuthContextType = {
  user: ExtendedUser | null;
  isLoading: boolean;
  error: Error | null;
  subscriptionStatus: SubscriptionStatus | null;
  isSubscriptionLoading: boolean;
  login: (username: string, password: string) => Promise<ExtendedUser>;
  register: (username: string, password: string, email?: string, phoneNumber?: string) => Promise<ExtendedUser>;
  logout: () => Promise<void>;
  getInitials: () => string;
  checkSubscriptionStatus: () => Promise<SubscriptionStatus>;
  cancelSubscription: () => Promise<void>;
  loginAsGuest: () => void;
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
  } = useQuery<ExtendedUser | null, Error>({
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
        
        // For guest users, return a default subscription status
        if (user.isGuest) {
          return {
            status: 'trial',
            trialActive: true,
            trialEndsAt: null,
            requiresSubscription: false,
            plan: 'guest',
          };
        }
        
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

  const login = async (username: string, password: string): Promise<ExtendedUser> => {
    try {
      // Clear any existing authentication first
      try {
        await apiRequest("POST", "/api/logout");
      } catch (logoutErr) {
        console.log("Pre-login logout failed, continuing with login");
      }
      
      console.log("Attempting login for user:", username);
      
      try {
        const res = await apiRequest("POST", "/api/login", { username, password });
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error("Login response not OK:", res.status, errorText);
          throw new Error(errorText || "Login failed");
        }
        
        // Force a response parse as text first to detect any JSON parsing issues
        const responseText = await res.text();
        console.log("Login response received, length:", responseText.length);
        
        let userData;
        
        try {
          userData = JSON.parse(responseText);
          console.log("Login response parsed successfully");
        } catch (parseError) {
          console.error("Failed to parse login response:", responseText);
          throw new Error("Invalid response format from server");
        }
        
        // Update the user data in the query cache
        queryClient.setQueryData(["/api/user"], userData);
        
        // Update initials based on the returned user data
        if (userData.username) {
          setInitials(getInitialsFromUsername(userData.username));
        }
        
        // Verify authentication immediately to confirm session was created
        const authVerified = await verifyAuthentication();
        
        if (!authVerified) {
          console.warn("Login succeeded but session verification failed. Trying to fix the session...");
          // Try a second verification after a short delay
          setTimeout(async () => {
            const secondVerification = await verifyAuthentication();
            if (!secondVerification) {
              console.error("Second verification attempt also failed");
            } else {
              console.log("Second verification succeeded");
            }
          }, 1000);
        } else {
          console.log("Login and session verification successful");
        }
        
        toast({
          title: "Logged in",
          description: `Welcome back, ${userData.username}!`,
        });
        
        return userData;
      } catch (fetchError: any) {
        console.error("Login fetch error details:", fetchError);
        
        // Check for specific error types
        if (fetchError.message?.includes("Failed to fetch") || 
            fetchError.message?.includes("Network request failed")) {
          throw new Error("Network connection error. Please check your internet connection.");
        }
        
        throw fetchError;
      }
    } catch (err: any) {
      const errorMsg = err.message || "Something went wrong. Please try again.";
      console.error("Login error:", err);
      
      toast({
        title: "Login failed",
        description: errorMsg,
        variant: "destructive",
      });
      throw err;
    }
  };

  // Function to verify authentication status
  const verifyAuthentication = async (): Promise<boolean> => {
    try {
      console.log("Verifying authentication status...");
      const verifyRes = await apiRequest("GET", "/api/user");
      
      if (!verifyRes.ok) {
        console.warn("Session verification failed - authentication issues may occur");
        return false;
      }
      
      const userData = await verifyRes.json();
      console.log("Session verification successful", userData);
      
      // Update user data in cache
      queryClient.setQueryData(["/api/user"], userData);
      
      // Refresh subscription data
      refetchSubscription();
      
      return true;
    } catch (err) {
      console.error("Authentication verification error:", err);
      return false;
    }
  };

  const register = async (username: string, password: string, email?: string, phoneNumber?: string): Promise<ExtendedUser> => {
    try {
      const res = await apiRequest("POST", "/api/register", { 
        username, 
        password,
        email: email || undefined,
        phoneNumber: phoneNumber || undefined
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Registration failed. Please try different credentials.');
      }
      
      const userData = await res.json();
      
      // Update the user data in the query cache
      queryClient.setQueryData(["/api/user"], userData);
      
      // Update initials
      setInitials(getInitialsFromUsername(userData.username));
      
      // Verify authentication immediately
      await verifyAuthentication();
      
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
      
      // For guest users, return a default subscription status
      if (user.isGuest) {
        const guestStatus: SubscriptionStatus = {
          status: 'trial',
          trialActive: true,
          trialEndsAt: null,
          requiresSubscription: false,
          plan: 'guest',
        };
        
        // Update the subscription status in the query cache
        queryClient.setQueryData(["/api/subscription/status"], guestStatus);
        return guestStatus;
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

  // Guest login function
  const loginAsGuest = () => {
    // Create a temporary guest user object with proper typing
    const guestUser: ExtendedUser = {
      id: 0,
      username: "Guest User",
      password: "", // Not used for guest
      email: null,
      phoneNumber: null,
      trialStartedAt: null,
      trialEndsAt: null,
      hasActiveSubscription: false,
      subscriptionPlan: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      isGuest: true, // Special flag to identify guest users
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Update the user data in the query cache
    queryClient.setQueryData(["/api/user"], guestUser);
    
    // Also set a default subscription status for the guest user
    const guestStatus: SubscriptionStatus = {
      status: 'trial',
      trialActive: true,
      trialEndsAt: null,
      requiresSubscription: false,
      plan: 'guest',
    };
    
    // Update the subscription status in the query cache
    queryClient.setQueryData(["/api/subscription/status"], guestStatus);
    
    // Update initials
    setInitials("GU");
    
    toast({
      title: "Guest Mode Activated",
      description: "You're using ReflectAI as a guest. Some features may be limited.",
    });
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
        loginAsGuest,
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