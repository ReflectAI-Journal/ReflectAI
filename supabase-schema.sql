-- Supabase Schema for ReflectAI
-- Run this in your Supabase SQL Editor to create the necessary tables

-- Enable Row Level Security
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- Profiles table linked to Supabase auth.users
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone_number TEXT,
  
  -- Subscription fields
  subscription_plan TEXT DEFAULT 'free' NOT NULL,
  has_active_subscription BOOLEAN DEFAULT false NOT NULL,
  trial_started_at TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  
  -- Stripe integration
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_session_id TEXT UNIQUE,
  stripe_trial_end TIMESTAMPTZ,
  is_on_stripe_trial BOOLEAN DEFAULT false NOT NULL,
  
  -- Counselor questionnaire
  completed_counselor_questionnaire BOOLEAN DEFAULT false NOT NULL,
  matched_counselor_personality TEXT,
  
  -- VIP access
  is_vip_user BOOLEAN DEFAULT false NOT NULL,
  
  -- OAuth IDs
  google_id TEXT UNIQUE,
  apple_id TEXT UNIQUE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Journal entries table
CREATE TABLE journal_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  moods TEXT[] DEFAULT '{}',
  ai_response TEXT,
  is_favorite BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Journal stats table
CREATE TABLE journal_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  entries_count INTEGER DEFAULT 0 NOT NULL,
  current_streak INTEGER DEFAULT 0 NOT NULL,
  longest_streak INTEGER DEFAULT 0 NOT NULL,
  top_moods JSONB DEFAULT '{}' NOT NULL,
  last_updated TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Goals table (simplified for core functionality)
CREATE TABLE goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('life', 'yearly', 'monthly', 'weekly', 'daily')),
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'abandoned')),
  target_date TIMESTAMPTZ,
  completed_date TIMESTAMPTZ,
  parent_goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Chat usage tracking
CREATE TABLE chat_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  conversation_type TEXT NOT NULL,
  message_count INTEGER DEFAULT 1 NOT NULL,
  date DATE DEFAULT CURRENT_DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_stripe_customer ON profiles(stripe_customer_id);
CREATE INDEX idx_profiles_stripe_session ON profiles(stripe_session_id);

CREATE INDEX idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX idx_journal_entries_date ON journal_entries(date DESC);
CREATE INDEX idx_journal_entries_user_date ON journal_entries(user_id, date DESC);

CREATE INDEX idx_journal_stats_user_id ON journal_stats(user_id);

CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_parent ON goals(parent_goal_id);
CREATE INDEX idx_goals_type ON goals(goal_type);

CREATE INDEX idx_chat_usage_user_date ON chat_usage(user_id, date DESC);

-- Row Level Security (RLS) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_usage ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON profiles
  FOR ALL USING (auth.uid()::text = id::text);

CREATE POLICY "Journal entries are private" ON journal_entries
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Journal stats are private" ON journal_stats
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Goals are private" ON goals
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Chat usage is private" ON chat_usage
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Server-side access (bypasses RLS when using service role key)
-- Your server will use the anon key with custom auth, so we need permissive policies for server operations

-- Allow server to create users (for registration)
CREATE POLICY "Allow server user creation" ON profiles
  FOR INSERT WITH CHECK (true);

-- Allow server to read/update users (for authentication)
CREATE POLICY "Allow server user management" ON profiles
  FOR ALL USING (true);

-- Allow server to manage all user data
CREATE POLICY "Allow server journal management" ON journal_entries
  FOR ALL USING (true);

CREATE POLICY "Allow server stats management" ON journal_stats
  FOR ALL USING (true);

CREATE POLICY "Allow server goals management" ON goals
  FOR ALL USING (true);

CREATE POLICY "Allow server chat management" ON chat_usage
  FOR ALL USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Optional: Create a function to get user subscription status
CREATE OR REPLACE FUNCTION get_user_subscription_status(user_uuid UUID)
RETURNS TABLE (
  has_subscription BOOLEAN,
  plan_name TEXT,
  is_trial BOOLEAN,
  trial_ends TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.has_active_subscription,
    u.subscription_plan,
    u.is_on_stripe_trial,
    u.trial_ends_at
  FROM users u
  WHERE u.id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;