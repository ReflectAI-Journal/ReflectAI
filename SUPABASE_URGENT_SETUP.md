# 🚨 URGENT: Supabase Setup Required

## Current Issues
- ✅ Supabase connection working
- ❌ Database schema missing (profiles table doesn't exist)
- ❌ Service role key needed for server operations
- ❌ Strict email validation requirements

## Immediate Steps Needed

### 1. Create Database Schema (CRITICAL)
Go to your Supabase project: https://bklzzkidghnamjrsboif.supabase.co
1. Click "SQL Editor" in sidebar
2. Copy and paste the entire content from `supabase-schema.sql`
3. Click "Run" to create all tables and policies

### 2. Get Service Role Key (CRITICAL)
1. In your Supabase project dashboard
2. Go to Settings → API
3. Copy the "service_role" key (starts with eyJ...)
4. Add it to your Replit secrets as `SUPABASE_SERVICE_ROLE_KEY`

### 3. Email Requirements
Supabase requires realistic email formats. These work:
- ✅ user@gmail.com
- ✅ test@outlook.com
- ✅ name@company.com
- ❌ test@example.com (rejected)
- ❌ debug@test.local (rejected)

## Testing After Setup
Once you complete steps 1 and 2, the signup should work perfectly:
```bash
curl -X POST http://localhost:5000/api/supabase/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"myemail@gmail.com","username":"myusername","password":"password123"}'
```

## Current Status
- Auth users ARE being created in Supabase (confirmed working)
- Profile creation fails because table doesn't exist
- Once schema is created, everything should work seamlessly

The fundamental architecture is correct - we just need the database schema deployed.