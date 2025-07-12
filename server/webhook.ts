// server/webhook.ts
import crypto from 'crypto';
import { Request, Response } from 'express';

const webhookHandler = async (req: Request, res: Response) => {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  const rawBody = JSON.stringify(req.body);

  if (!secret) {
    return res.status(500).send('Webhook secret not configured.');
  }

  const hmac = crypto.createHmac('sha256', secret);
  const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8');
  const signature = Buffer.from(req.headers['x-signature'] as string || '', 'utf8');

  if (!crypto.timingSafeEqual(digest, signature)) {
    return res.status(401).send('Invalid signature.');
  }

  const event = req.body;

  // Example: handle subscription_created
  if (event.meta.event_name === 'subscription_created') {
    const customerEmail = event.data.attributes.user_email;
    const subscriptionId = event.data.id;

    console.log('✅ Subscription created:', customerEmail, subscriptionId);
    // You can update DB here if needed
  }

  if (event.meta.event_name === 'subscription_updated') {
    console.log('🔄 Subscription updated:', event.data.id);
    // Handle subscription update logic
  }

  return res.status(200).send('OK');
};

export default webhookHandler;
