# Supabase Integration Setup Guide

This guide will help you set up Supabase as your database for the ReflectAI application.

## 1. Database Schema Setup

First, you need to create the necessary tables in your Supabase database:

1. Go to your Supabase project dashboard: https://bklzzkidhgnamjrsboif.supabase.co
2. Navigate to the SQL Editor in the left sidebar
3. Copy and paste the entire contents of `supabase-schema.sql` file into the SQL Editor
4. Click "Run" to execute the schema creation

This will create:
- `users` table with all subscription fields
- `journal_entries` table for user content
- `journal_stats` table for analytics
- `goals` table for goal tracking
- `chat_usage` table for usage analytics
- Proper indexes for performance
- Row Level Security (RLS) policies for data protection

## 2. Environment Configuration

Your environment variables are already configured in `.env`:

```env
SUPABASE_URL=https://bklzzkidhgnamjrsboif.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrbHp6a2lkaGduYW1qcnNib2lmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwNzQzNzQsImV4cCI6MjA2ODY1MDM3NH0.xE5_25Xw0JBkp7i0GjhEDVLHGJyQaAy8dxvDDSJpEJ0
VITE_USE_SUPABASE=false
```

## 3. Enable Supabase Integration

To switch from PostgreSQL to Supabase:

1. Set `VITE_USE_SUPABASE=true` in your `.env` file
2. Restart your application
3. The app will automatically use Supabase endpoints for user management

## 4. Available Supabase Endpoints

Once enabled, these new endpoints will be available:

### User Management
- `POST /api/supabase/create-account-with-subscription` - Create user after Stripe payment
- `GET /api/supabase/user/:id` - Get user information
- `POST /api/supabase/update-subscription` - Update user subscription

### Testing the Integration

You can test the Supabase integration with curl commands:

```bash
# Test user creation (requires valid Stripe session)
curl -X POST http://localhost:5000/api/supabase/create-account-with-subscription \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "stripeSessionId": "cs_test_...",
    "agreeToTerms": true
  }'

# Test user lookup
curl http://localhost:5000/api/supabase/user/UUID_HERE

# Test subscription update
curl -X POST http://localhost:5000/api/supabase/update-subscription \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "UUID_HERE",
    "subscriptionPlan": "pro",
    "hasActiveSubscription": true
  }'
```

## 5. Data Migration (Optional)

If you have existing data in PostgreSQL and want to migrate to Supabase:

1. Export your existing user data from PostgreSQL
2. Transform the data to match Supabase schema (convert numeric IDs to UUIDs)
3. Import into Supabase using the SQL Editor or API calls

## 6. Row Level Security (RLS)

The schema includes comprehensive RLS policies:

- **User Isolation**: Users can only access their own data
- **Server Access**: Server-side operations bypass RLS using the anon key
- **Authentication**: Currently using custom auth (not Supabase Auth)

## 7. Benefits of Supabase Integration

✅ **Managed Database**: No database maintenance required  
✅ **Automatic Backups**: Built-in backup and recovery  
✅ **Real-time Features**: WebSocket support for live updates  
✅ **Dashboard**: Visual database management interface  
✅ **API Auto-generation**: Automatic REST and GraphQL APIs  
✅ **Row Level Security**: Built-in data protection  

## 8. Hybrid Approach

Currently, the integration supports a hybrid approach:

- **User Management**: Can use either PostgreSQL or Supabase
- **Journal Entries**: Supabase storage class available
- **Other Features**: Continue using existing PostgreSQL setup

This allows for gradual migration and testing.

## 9. Security Considerations

- ✅ Using anon key with RLS policies for security
- ✅ Server-side session validation before user creation
- ✅ Stripe session verification prevents duplicate accounts
- ✅ Username and email uniqueness enforced
- ✅ No sensitive data (passwords) stored in Supabase currently

## 10. Next Steps

1. Run the schema SQL in your Supabase dashboard
2. Test with `VITE_USE_SUPABASE=false` first (current setup)
3. Switch to `VITE_USE_SUPABASE=true` when ready to test Supabase
4. Monitor the application logs for any Supabase connection issues
5. Gradually migrate other features to Supabase as needed

## Troubleshooting

**Connection Issues**: Verify SUPABASE_URL and SUPABASE_ANON_KEY in .env  
**RLS Errors**: Check that policies are created correctly in schema  
**UUID Issues**: Ensure you're using UUIDs instead of numeric IDs  
**Authentication**: Custom auth system works with both databases  

The integration is now ready! Switch the `VITE_USE_SUPABASE` flag when you want to test Supabase functionality.