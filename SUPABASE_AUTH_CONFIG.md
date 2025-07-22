# Disable Email Confirmation in Supabase

This guide shows how to disable email confirmation requirements in Supabase so users can sign up and log in immediately with just email + password.

## 1. Supabase Dashboard Configuration

### Step 1: Access Auth Settings
1. Go to your Supabase project dashboard: https://bklzzkidhgnamjrsboif.supabase.co
2. Navigate to **Authentication** in the left sidebar
3. Click on **Settings** tab

### Step 2: Disable Email Confirmation
1. Scroll down to **User Signups** section
2. Find "Enable email confirmations" toggle
3. **Turn OFF** the "Enable email confirmations" toggle
4. Click **Save** to apply changes

### Step 3: Verify Settings
- Email confirmations should now be disabled
- Users will be able to sign up and log in immediately
- No confirmation emails will be sent

## 2. Code Changes Applied

### Updated Supabase signUp calls:
- Added `emailRedirectTo: undefined` to disable confirmation redirects
- Removed email confirmation checks from user flows
- Updated both signup endpoints to skip confirmation

### Authentication Flow:
1. User submits signup form
2. Account created immediately in Supabase Auth
3. User is logged in and redirected to app immediately
4. No email confirmation step required

## 3. Updated User Experience

### Before (with email confirmation):
1. User submits signup form
2. "Check your email" message shown
3. User must click email link to activate
4. Only then can user log in

### After (no email confirmation):
1. User submits signup form
2. Account created immediately
3. User redirected to app right away
4. Can log in anytime with email/password

## 4. Environment Configuration

No changes needed to environment variables. The app will work with both confirmation enabled/disabled based on your Supabase dashboard settings.

## 5. Testing

You can test the signup flow:

1. Go to the create account page
2. Enter email and password
3. Submit form
4. Should be redirected to counselor page immediately
5. No email confirmation required

The authentication flow now matches the user's request for simple email/password login without confirmation steps.