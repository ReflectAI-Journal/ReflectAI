// Quick Supabase debug script
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log('URL:', supabaseUrl?.substring(0, 30) + '...');
console.log('Key:', supabaseKey?.substring(0, 20) + '...');

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Test 1: Try to create a test user
console.log('\n🧪 Testing Supabase auth signup...');
const { data, error } = await supabase.auth.signUp({
  email: 'debug.test@example.com',
  password: 'testpass123',
  options: {
    data: {
      username: 'debugtest'
    }
  }
});

console.log('Auth signup result:');
console.log('Data:', JSON.stringify(data, null, 2));
console.log('Error:', JSON.stringify(error, null, 2));

// Test 2: Check if profiles table exists
console.log('\n📋 Testing profiles table access...');
const { data: profileData, error: profileError } = await supabase
  .from('profiles')
  .select('*')
  .limit(1);

console.log('Profiles table query result:');
console.log('Data:', profileData);
console.log('Error:', JSON.stringify(profileError, null, 2));