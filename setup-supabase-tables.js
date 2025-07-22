// Direct Supabase table creation script
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('❌ SUPABASE_URL not found in environment');
  process.exit(1);
}

if (!supabaseServiceKey) {
  console.log('⚠️  SUPABASE_SERVICE_ROLE_KEY not provided');
  console.log('💡 Get it from: https://bklzzkidghnamjrsboif.supabase.co');
  console.log('   → Settings → API → service_role key');
  console.log('   → Add to Replit Secrets as SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

console.log('🔧 Creating Supabase admin client...');
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// SQL to create profiles table
const createProfilesTableSQL = `
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone_number TEXT,
  
  -- Subscription fields
  subscription_plan TEXT DEFAULT 'basic' NOT NULL,
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- Enable RLS and add policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow server operations (using service role key bypasses RLS anyway)
CREATE POLICY IF NOT EXISTS "Allow server user management" ON profiles FOR ALL USING (true);
`;

async function setupTables() {
  try {
    console.log('🚀 Creating profiles table...');
    
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: createProfilesTableSQL
    });
    
    if (error) {
      console.error('❌ Failed to create table via RPC:', error.message);
      console.log('📋 Manual setup required - copy SQL from supabase-schema.sql');
    } else {
      console.log('✅ Profiles table created successfully!');
      console.log('🎉 Supabase setup complete - authentication ready!');
    }
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('📋 Please run the SQL manually in Supabase dashboard');
    console.log('   → SQL Editor → paste content from supabase-schema.sql → Run');
  }
}

setupTables();