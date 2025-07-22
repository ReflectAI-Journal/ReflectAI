import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Database types for Supabase - matching the users table structure
export interface SupabaseUser {
  id: string;
  username: string;
  email: string;
  subscription_plan: string;
  created_at: string;
  stripe_session_id?: string; // Track session IDs for reuse prevention
}

// Simplified interfaces to match your actual table structure

// Ensure dotenv is loaded
import dotenv from 'dotenv';
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

console.log('Supabase URL found:', supabaseUrl ? 'YES' : 'NO');
console.log('Supabase Key found:', supabaseAnonKey ? 'YES' : 'NO');

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not found. Supabase features will be disabled.');
  console.warn('To enable Supabase, set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file');
}

export const supabase: SupabaseClient | null = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    })
  : null;

// Supabase Storage Implementation
export class SupabaseStorage {
  private client: SupabaseClient | null;

  constructor() {
    this.client = supabase;
    if (!this.client) {
      console.warn('Supabase client not initialized. Check environment variables.');
    }
  }

  private ensureClient(): SupabaseClient {
    if (!this.client) {
      throw new Error('Supabase client not initialized. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
    }
    return this.client;
  }

  // User Methods - matching the users table structure
  async createUser(userData: {
    email: string;
    name: string;
    plan: string;
    stripeSessionId?: string;
  }): Promise<SupabaseUser> {
    console.log('Creating user in Supabase:', userData);
    
    const insertData: any = {
      email: userData.email,
      username: userData.name,
      subscription_plan: userData.plan
    };
    
    // Add stripe_session_id if your table has this column
    if (userData.stripeSessionId) {
      insertData.stripe_session_id = userData.stripeSessionId;
    }
    
    const { data, error } = await this.ensureClient()
      .from('users')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('Supabase user creation error:', error);
      throw new Error(`Failed to create user: ${error.message}`);
    }

    console.log('User created successfully in Supabase:', data);
    return data;
  }

  async getUserByEmail(email: string): Promise<SupabaseUser | null> {
    const { data, error } = await this.ensureClient()
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Supabase getUserByEmail error:', error);
      throw new Error(`Failed to get user: ${error.message}`);
    }

    return data || null;
  }

  async getUserById(id: string): Promise<SupabaseUser | null> {
    const { data, error } = await this.ensureClient()
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Supabase getUserById error:', error);
      throw new Error(`Failed to get user: ${error.message}`);
    }

    return data || null;
  }

  async updateUser(id: string, updates: Partial<SupabaseUser>): Promise<SupabaseUser> {
    const updateData: any = {};
    
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.username !== undefined) updateData.username = updates.username;
    if (updates.subscription_plan !== undefined) updateData.subscription_plan = updates.subscription_plan;

    const { data, error } = await this.ensureClient()
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase updateUser error:', error);
      throw new Error(`Failed to update user: ${error.message}`);
    }

    return data;
  }

  // Check if a Stripe session ID has already been used
  async getUserByStripeSessionId(sessionId: string): Promise<SupabaseUser | null> {
    // First check if your table has stripe_session_id column
    const { data, error } = await this.ensureClient()
      .from('users')
      .select('*')
      .eq('stripe_session_id', sessionId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      // If column doesn't exist, that's fine - we'll return null
      if (error.message?.includes('column') && error.message?.includes('does not exist')) {
        console.log('Note: stripe_session_id column not found in table - session reuse check skipped');
        return null;
      }
      console.error('Supabase getUserByStripeSessionId error:', error);
      throw new Error(`Failed to check session: ${error.message}`);
    }

    return data || null;
  }

  // Check if Supabase is properly initialized
  isInitialized(): boolean {
    return this.client !== null;
  }

  // Additional methods can be added here as needed for journal entries, etc.
}

// Export singleton instance
export const supabaseStorage = new SupabaseStorage();