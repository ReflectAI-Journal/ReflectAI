# Free Access for Friends & Family - VIP System Guide

## Overview
Your ReflectAI app now has a VIP system that allows you to give friends and family completely free access to all premium features, bypassing all subscription requirements.

## How It Works
When a user has VIP status (`isVipUser: true`), they get:
- ✅ Access to all Pro and Elite features (including Blueprint PDFs)
- ✅ Unlimited AI conversations
- ✅ Advanced analytics and exports
- ✅ All premium functionality without any subscription checks
- ✅ Treated as "unlimited" plan user in the system

## Option 1: Direct Database Update (Simplest)
Use your database management tool (like Neon's web interface) to directly update users:

```sql
-- Grant VIP access to a user by email
UPDATE users SET is_vip_user = true WHERE email = 'friend@example.com';

-- Grant VIP access to a user by username
UPDATE users SET is_vip_user = true WHERE username = 'friendusername';

-- Remove VIP access if needed
UPDATE users SET is_vip_user = false WHERE email = 'friend@example.com';

-- Check all VIP users
SELECT id, username, email, is_vip_user, subscription_plan FROM users WHERE is_vip_user = true;
```

## Option 2: Admin API Routes
I've added admin API routes for managing VIP users. First, update the admin email in the code:

1. In `server/routes.ts`, change `'your-admin@email.com'` to your actual admin email
2. Make API calls to manage VIP status:

### Grant VIP Access
```bash
# POST request to grant VIP status
curl -X POST https://your-domain.com/api/admin/vip/123 \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{"isVip": true}'
```

### List All Users (for finding user IDs)
```bash
# GET request to list all users
curl -X GET https://your-domain.com/api/admin/users \
  -H "Cookie: your-session-cookie"
```

## Option 3: Special Registration Codes
Create special registration codes that automatically grant VIP status:

```javascript
// Add this to your registration route
const vipCodes = ['FAMILY2025', 'FRIENDS_FREE', 'YOUR_CUSTOM_CODE'];

// In registration logic:
if (vipCodes.includes(req.body.inviteCode)) {
  userData.isVipUser = true;
}
```

## Option 4: Email Domain Whitelist
Automatically grant VIP access to specific email domains:

```javascript
// Add this logic to your registration/user creation
const vipDomains = ['yourfamily.com', 'yourcompany.com'];
const emailDomain = email.split('@')[1];

if (vipDomains.includes(emailDomain)) {
  userData.isVipUser = true;
}
```

## Step-by-Step Process for Friends & Family

### For You (Admin):
1. Get your friend/family member's email or username after they register
2. Use Option 1 (database) or Option 2 (API) to grant VIP status
3. Let them know they now have full access

### For Your Friends/Family:
1. They register normally at your website
2. You grant them VIP status (takes 30 seconds)
3. They refresh the page and have full premium access forever
4. No payment required, no trials, no restrictions

## Important Notes
- VIP users completely bypass ALL subscription checks
- They get unlimited access to AI conversations
- They can download Blueprint PDFs
- They have access to all analytics and export features
- VIP status persists forever (unless you revoke it)
- They'll see "unlimited" plan in their account

## Recommended Approach
**Use Option 1 (Direct Database)** - it's the simplest:

1. Friend/family registers account
2. You log into your database (Neon console)
3. Run: `UPDATE users SET is_vip_user = true WHERE email = 'their-email@example.com';`
4. Done! They have full premium access

## Security Notes
- Only you (user ID 1) or the admin email can manage VIP status
- VIP users don't appear as paying customers in Stripe
- Consider keeping a list of VIP users for your records
- You can revoke VIP access anytime by setting `is_vip_user = false`

## Questions?
The system is now live and ready to use. Your friends and family can have completely free access to all premium features with just a simple database update!