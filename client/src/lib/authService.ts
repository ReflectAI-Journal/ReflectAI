export interface User {
  id: number;
  username: string;
  email: string | null;
  trialStartedAt: Date | null;
  trialEndsAt: Date | null;
  hasActiveSubscription: boolean | null;
  subscriptionPlan: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  matchedCounselorPersonality: string | null;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Helper function to store token in localStorage
const storeToken = (token: string | null) => {
  if (token) {
    localStorage.setItem("auth_token", token); // Changed key to 'auth_token' to match AuthService
    console.log("✅ Token stored in localStorage:", token.substring(0, 20) + "...");
  } else {
    console.error("❌ No token received, cannot store.");
  }
};

class AuthService {
  private static instance: AuthService;
  private token: string | null = null;
  private user: User | null = null;

  constructor() {
    // Load token from localStorage on initialization
    this.token = localStorage.getItem('auth_token');
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  setAuth(token: string, user: User) {
    this.token = token;
    this.user = user;
    localStorage.setItem('auth_token', token);
  }

  clearAuth() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('auth_token');
  }

  getToken(): string | null {
    return this.token;
  }

  getUser(): User | null {
    return this.user;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  // Helper method to make authenticated API requests
  async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return fetch(url, {
      ...options,
      credentials: 'include',
      headers,
    });
  }

  async login(username: string, password: string): Promise<AuthResponse> {
    // Check if we should use Supabase authentication
    const useSupabase = (import.meta as any).env.VITE_USE_SUPABASE === 'true';
    const endpoint = useSupabase ? '/api/supabase/login' : '/api/login';
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    const responseData = await response.json();
    
    if (useSupabase) {
      // For Supabase, adapt the response format to match AuthResponse interface
      const authData: AuthResponse = {
        user: {
          id: responseData.user.id,
          username: responseData.user.username,
          email: responseData.user.email,
          trialStartedAt: null,
          trialEndsAt: null,
          hasActiveSubscription: false,
          subscriptionPlan: 'basic',
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          matchedCounselorPersonality: null
        },
        token: responseData.session || 'supabase-auth-token'
      };
      
      this.setAuth(authData.token, authData.user);
      storeToken(authData.token);
      return authData;
    } else {
      // Standard authentication flow
      const authData: AuthResponse = responseData;
      this.setAuth(authData.token, authData.user);
      storeToken(authData.token);
      return authData;
    }
  }

  async register(userData: {
    username: string;
    password: string;
    email?: string;
    phoneNumber?: string;
    agreeToTerms: boolean;
    subscribeToNewsletter?: boolean;
  }): Promise<AuthResponse> {
    console.log('AuthService.register called with:', userData);
    
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(userData),
    });

    console.log('Registration response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Registration failed:', errorText);
      throw new Error(errorText || 'Registration failed');
    }

    const authData: AuthResponse = await response.json();
    console.log('Registration successful, auth data:', authData);
    this.setAuth(authData.token, authData.user);
    storeToken(authData.token); // Store token after successful registration

    return authData;
  }

  async logout(): Promise<void> {
    try {
      await this.authenticatedFetch('/api/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      this.clearAuth();
    }
  }

  async getCurrentUser(): Promise<User> {
    console.log('=== Frontend /api/user Debug Info ===');
    console.log('Making request to /api/user');
    console.log('JWT Token found:', !!this.token);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    // Include JWT token in Authorization header if available
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
      console.log('Including JWT token in Authorization header');
    } else {
      console.log('No JWT token, using session auth only');
    }

    const response = await fetch('/api/user', {
      credentials: 'include',
      headers
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      if (response.status === 401) {
        console.log('User not authenticated, clearing token');
        this.clearAuth();
        throw new Error('Not authenticated');
      }
      throw new Error('Failed to get current user');
    }

    const user: User = await response.json();
    this.user = user;
    return user;
  }
}

export const authService = AuthService.getInstance();