import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Database types for Supabase
export interface SupabaseUser {
  id: string;
  username: string;
  email?: string;
  phone_number?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  stripe_session_id?: string;
  subscription_plan: string;
  has_active_subscription: boolean;
  trial_started_at?: string;
  trial_ends_at?: string;
  stripe_trial_end?: string;
  is_on_stripe_trial: boolean;
  completed_counselor_questionnaire: boolean;
  matched_counselor_personality?: string;
  is_vip_user: boolean;
  google_id?: string;
  apple_id?: string;
  created_at: string;
  updated_at: string;
}

export interface SupabaseJournalEntry {
  id: string;
  user_id: string;
  title?: string;
  content: string;
  date: string;
  moods?: string[];
  ai_response?: string;
  is_favorite: boolean;
  created_at: string;
}

export interface SupabaseJournalStats {
  id: string;
  user_id: string;
  entries_count: number;
  current_streak: number;
  longest_streak: number;
  top_moods: Record<string, any>;
  last_updated: string;
}

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

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

  // User Methods
  async createUser(userData: {
    username: string;
    email?: string;
    phoneNumber?: string;
    password?: string;
    subscriptionPlan?: string;
    hasActiveSubscription?: boolean;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    stripeSessionId?: string;
    trialStartedAt?: Date;
    trialEndsAt?: Date;
    isVipUser?: boolean;
    googleId?: string;
    appleId?: string;
  }): Promise<SupabaseUser> {
    const { data, error } = await this.ensureClient()
      .from('users')
      .insert({
        username: userData.username,
        email: userData.email || null,
        phone_number: userData.phoneNumber || null,
        subscription_plan: userData.subscriptionPlan || 'free',
        has_active_subscription: userData.hasActiveSubscription || false,
        stripe_customer_id: userData.stripeCustomerId || null,
        stripe_subscription_id: userData.stripeSubscriptionId || null,
        stripe_session_id: userData.stripeSessionId || null,
        trial_started_at: userData.trialStartedAt?.toISOString() || null,
        trial_ends_at: userData.trialEndsAt?.toISOString() || null,
        is_on_stripe_trial: false,
        completed_counselor_questionnaire: false,
        is_vip_user: userData.isVipUser || false,
        google_id: userData.googleId || null,
        apple_id: userData.appleId || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase user creation error:', error);
      throw new Error(`Failed to create user: ${error.message}`);
    }

    return data;
  }

  async getUserByUsername(username: string): Promise<SupabaseUser | null> {
    const { data, error } = await this.ensureClient()
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Supabase getUserByUsername error:', error);
      throw new Error(`Failed to get user: ${error.message}`);
    }

    return data || null;
  }

  async getUserByEmail(email: string): Promise<SupabaseUser | null> {
    const { data, error } = await this.ensureClient()
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') {
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

  async getUserByStripeSessionId(sessionId: string): Promise<SupabaseUser | null> {
    const { data, error } = await this.ensureClient()
      .from('users')
      .select('*')
      .eq('stripe_session_id', sessionId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Supabase getUserByStripeSessionId error:', error);
      throw new Error(`Failed to get user: ${error.message}`);
    }

    return data || null;
  }

  async updateUser(id: string, updates: Partial<SupabaseUser>): Promise<SupabaseUser> {
    // Convert field names to snake_case for Supabase
    const updateData: any = {};
    
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.phone_number !== undefined) updateData.phone_number = updates.phone_number;
    if (updates.subscription_plan !== undefined) updateData.subscription_plan = updates.subscription_plan;
    if (updates.has_active_subscription !== undefined) updateData.has_active_subscription = updates.has_active_subscription;
    if (updates.stripe_customer_id !== undefined) updateData.stripe_customer_id = updates.stripe_customer_id;
    if (updates.stripe_subscription_id !== undefined) updateData.stripe_subscription_id = updates.stripe_subscription_id;
    if (updates.completed_counselor_questionnaire !== undefined) updateData.completed_counselor_questionnaire = updates.completed_counselor_questionnaire;
    if (updates.matched_counselor_personality !== undefined) updateData.matched_counselor_personality = updates.matched_counselor_personality;
    if (updates.is_vip_user !== undefined) updateData.is_vip_user = updates.is_vip_user;

    updateData.updated_at = new Date().toISOString();

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

  // Journal Entry Methods
  async createJournalEntry(entryData: {
    userId: string;
    title?: string;
    content: string;
    date?: Date;
    moods?: string[];
    aiResponse?: string;
  }): Promise<SupabaseJournalEntry> {
    const { data, error } = await this.ensureClient()
      .from('journal_entries')
      .insert({
        user_id: entryData.userId,
        title: entryData.title || null,
        content: entryData.content,
        date: entryData.date?.toISOString() || new Date().toISOString(),
        moods: entryData.moods || [],
        ai_response: entryData.aiResponse || null,
        is_favorite: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase journal entry creation error:', error);
      throw new Error(`Failed to create journal entry: ${error.message}`);
    }

    return data;
  }

  async getJournalEntriesByUserId(userId: string): Promise<SupabaseJournalEntry[]> {
    const { data, error } = await this.ensureClient()
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Supabase getJournalEntriesByUserId error:', error);
      throw new Error(`Failed to get journal entries: ${error.message}`);
    }

    return data || [];
  }

  // Journal Stats Methods
  async getJournalStats(userId: string): Promise<SupabaseJournalStats | null> {
    const { data, error } = await this.ensureClient()
      .from('journal_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Supabase getJournalStats error:', error);
      throw new Error(`Failed to get journal stats: ${error.message}`);
    }

    return data || null;
  }

  async createOrUpdateJournalStats(userId: string, stats: {
    entriesCount?: number;
    currentStreak?: number;
    longestStreak?: number;
    topMoods?: Record<string, any>;
  }): Promise<SupabaseJournalStats> {
    // Try to update first
    const { data: updateData, error: updateError } = await this.ensureClient()
      .from('journal_stats')
      .update({
        entries_count: stats.entriesCount,
        current_streak: stats.currentStreak,
        longest_streak: stats.longestStreak,
        top_moods: stats.topMoods,
        last_updated: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (!updateError) {
      return updateData;
    }

    // If update failed (no existing record), create new one
    const { data: insertData, error: insertError } = await this.ensureClient()
      .from('journal_stats')
      .insert({
        user_id: userId,
        entries_count: stats.entriesCount || 0,
        current_streak: stats.currentStreak || 0,
        longest_streak: stats.longestStreak || 0,
        top_moods: stats.topMoods || {},
        last_updated: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Supabase createJournalStats error:', insertError);
      throw new Error(`Failed to create journal stats: ${insertError.message}`);
    }

    return insertData;
  }
}

// Export singleton instance
export const supabaseStorage = new SupabaseStorage();