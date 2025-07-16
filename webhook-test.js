// Webhook and API Key Test Script
import crypto from 'crypto';

// Display current configuration
console.log('=== STRIPE CONFIGURATION STATUS ===');
console.log('✅ Stripe Publishable Key:', process.env.VITE_STRIPE_PUBLISHABLE_KEY ? 'Set' : 'Missing');
console.log('✅ Stripe Secret Key:', process.env.STRIPE_SECRET_KEY ? `Set (${process.env.STRIPE_SECRET_KEY.substring(0, 12)}...)` : 'Missing');
console.log('✅ Stripe Webhook Secret:', process.env.STRIPE_WEBHOOK_SECRET ? `Set (${process.env.STRIPE_WEBHOOK_SECRET.substring(0, 15)}...)` : 'Missing');

console.log('\n=== WEBHOOK ENDPOINTS AVAILABLE ===');
console.log('1. /webhook - Simple webhook endpoint (as requested)');
console.log('2. /api/webhooks/stripe - Comprehensive webhook endpoint');

console.log('\n=== TESTING WEBHOOK SIGNATURE GENERATION ===');

// Create a test webhook payload
const testPayload = JSON.stringify({
  id: 'evt_test_webhook',
  object: 'event',
  api_version: '2024-06-20',
  created: Math.floor(Date.now() / 1000),
  data: {
    object: {
      id: 'cs_test_123',
      object: 'checkout.session',
      customer: 'cus_test_123',
      payment_status: 'paid'
    }
  },
  livemode: false,
  pending_webhooks: 1,
  request: {
    id: 'req_test_123',
    idempotency_key: null
  },
  type: 'checkout.session.completed'
});

// Generate test signature if webhook secret is available
if (process.env.STRIPE_WEBHOOK_SECRET) {
  const timestamp = Math.floor(Date.now() / 1000);
  const payload = timestamp + '.' + testPayload;
  const signature = crypto
    .createHmac('sha256', process.env.STRIPE_WEBHOOK_SECRET)
    .update(payload, 'utf8')
    .digest('hex');
  
  const stripeSignature = `t=${timestamp},v1=${signature}`;
  
  console.log('✅ Generated test Stripe signature:', stripeSignature.substring(0, 50) + '...');
  console.log('✅ Test payload ready for webhook testing');
} else {
  console.log('❌ Cannot generate test signature - STRIPE_WEBHOOK_SECRET missing');
}

console.log('\n=== WEBHOOK TESTING COMMANDS ===');
console.log('Test both webhook endpoints with:');
console.log('curl -X POST http://localhost:5000/webhook -H "Content-Type: application/json" -d \'{"test": "webhook"}\'');
console.log('curl -X POST http://localhost:5000/api/webhooks/stripe -H "Content-Type: application/json" -d \'{"test": "webhook"}\'');