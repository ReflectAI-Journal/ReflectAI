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

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        const errorText = await response.text();
        throw new Error(errorText || 'Login failed');
      }
      
      // Handle email not confirmed case
      if (errorData.emailNotConfirmed) {
        const error = new Error(errorData.message || 'Please confirm your email before logging in.');
        (error as any).emailNotConfirmed = true;
        (error as any).email = errorData.email;
        throw error;
      }
      
      throw new Error(errorData.message || 'Login failed');
    }

    const authData: AuthResponse = await response.json();
    this.setAuth(authData.token, authData.user);
    storeToken(authData.token); // Store token after successful login

    return authData;
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

    let responseData;
    try {
      responseData = await response.json();
    } catch {
      const errorText = await response.text();
      console.error('Registration failed:', errorText);
      throw new Error(errorText || 'Registration failed');
    }

    if (!response.ok) {
      console.error('Registration failed:', responseData);
      throw new Error(responseData.message || 'Registration failed');
    }

    console.log('Registration successful, response data:', responseData);
    
    // For email confirmation flow, we don't get a token/user back immediately
    if (responseData.emailSent && !responseData.token) {
      return responseData; // Return the email confirmation message
    }

    // For immediate login flow (OAuth), we get token/user back
    if (responseData.token && responseData.user) {
      this.setAuth(responseData.token, responseData.user);
      storeToken(responseData.token);
    }

    return responseData;
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

    if (!this.token) {
      console.log('No JWT token, falling back to session auth');
    }

    const response = await fetch('/api/user', {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
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