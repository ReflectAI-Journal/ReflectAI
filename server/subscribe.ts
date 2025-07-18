import { Request, Response } from 'express';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function createCheckoutSession(req: Request, res: Response) {
  try {
    const { plan } = req.body;

    const priceId = (() => {
      switch (plan) {
        case 'pro_monthly':
          return process.env.STRIPE_PRO_MONTHLY_PRICE_ID;
        case 'pro_annual':
          return process.env.STRIPE_PRO_ANNUAL_PRICE_ID;
        case 'unlimited_monthly':
          return process.env.STRIPE_UNLIMITED_MONTHLY_PRICE_ID;
        case 'unlimited_annual':
          return process.env.STRIPE_UNLIMITED_ANNUAL_PRICE_ID;
        default:
          return null;
      }
    })();

    if (!priceId) {
      return res.status(400).json({ error: 'Invalid plan selected.' });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: 'https://reflectai-journal.site/success',
      cancel_url: 'https://reflectai-journal.site/cancel',
    });

    return res.status(200).json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe checkout error:', err);
    return res.status(500).json({ error: err.message || 'Failed to create Stripe session' });
  }
}
