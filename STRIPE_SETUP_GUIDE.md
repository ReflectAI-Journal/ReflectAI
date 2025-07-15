# Stripe Setup Guide for ReflectAI

## Step 1: Get Your Stripe API Keys

1. **Go to Stripe Dashboard**: Visit [https://dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys)

2. **Get Public Key**: 
   - Copy your "Publishable key" (starts with `pk_test_` for test mode)
   - This will be your `VITE_STRIPE_PUBLIC_KEY`

3. **Get Secret Key**:
   - Copy your "Secret key" (starts with `sk_test_` for test mode)
   - This will be your `STRIPE_SECRET_KEY`

## Step 2: Set Up Webhook Endpoint

1. **Go to Webhooks**: Visit [https://dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)

2. **Add Endpoint**:
   - Click "Add endpoint"
   - Enter your endpoint URL: `https://your-replit-url.replit.dev/api/webhooks/stripe`
   - Replace `your-replit-url` with your actual Replit app URL

3. **Select Events**:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`

4. **Get Webhook Secret**:
   - After creating the webhook, click on it
   - Go to "Signing secret" section
   - Copy the webhook signing secret (starts with `whsec_`)
   - This will be your `STRIPE_WEBHOOK_SECRET`

## Step 3: Test the Integration

The app is configured to use inline pricing, so you don't need to create products in Stripe dashboard. The checkout will automatically create products with these prices:

- **Pro Monthly**: $14.99/month
- **Pro Annual**: $152.90/year (15% discount)
- **Unlimited Monthly**: $24.99/month  
- **Unlimited Annual**: $254.90/year (15% discount)

## Step 4: Testing Flow

1. **Log into your app**
2. **Go to `/subscription`**
3. **Click on any plan**
4. **You'll be redirected to Stripe checkout**
5. **Use test card**: `4242 4242 4242 4242`
6. **Any future expiry date and any 3-digit CVC**
7. **Complete the payment**
8. **You'll be redirected back with success confirmation**

## Step 5: Webhook Testing

Once webhooks are set up, they will automatically:
- Update user subscription status when payments complete
- Handle subscription cancellations
- Process subscription updates
- Log failed payments

## Test Cards

For testing in Stripe test mode:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Insufficient funds**: `4000 0000 0000 9995`

## Current Configuration

The app is ready to handle:
✅ Customer creation
✅ Subscription checkout sessions  
✅ Payment verification
✅ Webhook processing
✅ User account updates
✅ Subscription status tracking

All you need to do is add your actual Stripe API keys and webhook endpoint!