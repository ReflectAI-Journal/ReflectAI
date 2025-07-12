import express, { Request, Response } from 'express';
import axios from 'axios';
import crypto from 'crypto';
import { configureLemonSqueezy } from '../.config/lemonsqueezy.js';
import { buffer } from 'micro';
import { determinePlanFromVariantId } from '../utils/determinePlanFromVariantId.js';
import { storage } from './storage';

const router = express.Router();

// === ✅ Create Lemon Squeezy Checkout Link ===
router.post('/api/create-checkout', async (req, res) => {
  const { variantId, email } = req.body;

  if (!variantId || !email) {
    return res.status(400).json({ message: 'Missing variantId or email' });
  }

  try {
    configureLemonSqueezy();

    const response = await axios.post(
      'https://api.lemonsqueezy.com/v1/checkouts',
      {
        data: {
          type: 'checkouts',
          attributes: {
            checkout_data: { email },
            product_options: { enabled_variants: [variantId] },
            store_id: parseInt(process.env.LEMONSQUEEZY_STORE_ID!)
          }
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
          'Content-Type': 'application/vnd.api+json',
          Accept: 'application/vnd.api+json'
        }
      }
    );

    const checkoutUrl = response.data.data.attributes.url;
    res.status(200).json({ url: checkoutUrl });
  } catch (error: any) {
    console.error('Lemon Squeezy Checkout Error:', error.response?.data || error.message);
    res.status(500).json({
      message: 'Checkout failed',
      error: error.response?.data
    });
  }
});

// === ✅ Handle Lemon Squeezy Webhook Events ===
router.post('/api/webhook', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

  if (!secret) return res.status(500).send("Webhook secret not configured.");

  const rawBody = req.body.toString('utf8');
  const signature = req.headers['x-signature'] as string || '';

  const hmac = crypto.createHmac('sha256', secret);
  const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8');
  const signatureBuffer = Buffer.from(signature, 'utf8');

  if (!crypto.timingSafeEqual(digest, signatureBuffer)) {
    return res.status(401).send("Invalid signature.");
  }

  const event = JSON.parse(rawBody);
  const eventType = event.meta?.event_name;
  const variantId = event.data?.attributes?.variant_id;
  const userEmail = event.data?.attributes?.user_email;
  const plan = determinePlanFromVariantId(variantId);

  try {
    if ((eventType === 'subscription_created' || eventType === 'subscription_updated') && plan && userEmail) {
      await storage.updateSubscriptionByEmail(userEmail, {
        hasActiveSubscription: true,
        subscriptionPlan: plan,
        lemonsqueezySubscriptionId: event.data.id
      });
      console.log(`✅ ${eventType} - ${userEmail} now on ${plan} plan`);
    }
  } catch (err) {
    console.error('Webhook DB update failed:', err);
  }

  return res.status(200).send("OK");
});

export default router;
