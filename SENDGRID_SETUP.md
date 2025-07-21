# SendGrid Email Setup for Password Reset

## Issue: 403 Forbidden Error
The password reset emails are failing with a 403 error because the sender email address is not verified in SendGrid.

**Error message:** "The from address does not match a verified Sender Identity. Mail cannot be sent until this error is resolved."

## Solution: Verify Sender Identity in SendGrid

### Step 1: Access SendGrid Dashboard
1. Go to https://app.sendgrid.com/
2. Log in with your SendGrid account

### Step 2: Verify Sender Identity
1. Navigate to **Settings** → **Sender Authentication** → **Verify a Single Sender**
2. Click **"Create New Sender"**
3. Fill out the form with these details:
   - **From Name:** ReflectAI Support
   - **From Email Address:** loziercaleb@gmail.com (or your preferred email)
   - **Reply To:** loziercaleb@gmail.com
   - **Company Address:** Your company address
   - **City, State, ZIP, Country:** Your location details

### Step 3: Verify Email
1. SendGrid will send a verification email to loziercaleb@gmail.com
2. Check your Gmail inbox and click the verification link
3. Once verified, the sender identity will show as "Verified" in your SendGrid dashboard

### Step 4: Test Password Reset
Once the sender is verified, test the password reset:
1. Go to your password reset page
2. Enter loziercaleb@gmail.com
3. Check your Gmail inbox for the reset email

## Alternative: Use a Different Verified Email
If you prefer, you can use a different email address that's already verified in your SendGrid account. Just update the "from" field in `server/routes.ts`:

```typescript
from: 'your-verified-email@domain.com',
```

## Current Status
- ✅ SendGrid API key is properly configured
- ✅ Password reset functionality is working
- ❌ Sender email needs verification
- ✅ Email templates and styling are ready

Once you verify the sender identity, password reset emails will be delivered to Gmail successfully.