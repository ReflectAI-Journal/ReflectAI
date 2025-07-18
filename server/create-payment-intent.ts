import { Request, Response } from 'express';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function createPaymentIntent(req: Request, res: Response) {
  try {
    const { amount, planId } = req.body;

    if (!planId || !amount) {
      return res.status(400).json({ error: 'Missing planId or amount' });
    }

    // Allow guest user creation
    const customer = await stripe.customers.create({
      description: 'Guest user checkout',
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // convert dollars to cents
      currency: 'usd',
      customer: customer.id,
      metadata: {
        planId,
        userType: 'guest',
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (err: any) {
    console.error('Payment Intent Error:', err);
    return res.status(500).json({
      error: err.message || 'Failed to create payment intent',
    });
  }
}
