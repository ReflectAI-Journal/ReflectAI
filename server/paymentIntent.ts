// paymentIntent.ts

import { Router, type Request, type Response } from 'express';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16',
});


const router = Router();

async function handler(req: Request, res: Response) {
  const { amount, planId } = req.body;

  if (!amount) {
    return res.status(400).send({ error: 'Amount is required' });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert dollars to cents
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: {
        planId: planId || 'unknown',
      },
    });

    return res.send({ clientSecret: paymentIntent.client_secret });
  } catch (err: any) {
    console.error('Stripe error:', err);
    return res.status(500).send({ error: 'Failed to create payment intent' });
  }
}

// Register the payment intent route
router.post('/create-payment-intent', handler);

export default router;
