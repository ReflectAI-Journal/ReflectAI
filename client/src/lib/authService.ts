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
}

export interface AuthResponse {
  user: User;
  token: string;
}

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
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
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
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Login failed');
    }

    const authData: AuthResponse = await response.json();
    this.setAuth(authData.token, authData.user);
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
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Registration failed');
    }

    const authData: AuthResponse = await response.json();
    this.setAuth(authData.token, authData.user);
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