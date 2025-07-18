import express from 'express';
import Stripe from 'stripe';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16',
});

router.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { planId } = req.body;

    if (!planId) {
      return res.status(400).json({ message: 'Missing planId' });
    }

    // 🧑 Create a new customer (you can customize this or reuse existing)
    const customer = await stripe.customers.create();

    // 📦 Create the subscription with a trial
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: planId }],
      trial_period_days: 3, // or 7, etc.
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });

    const clientSecret = subscription.latest_invoice?.payment_intent?.client_secret;

    return res.status(200).json({
      clientSecret,
      customerId: customer.id,
      subscriptionId: subscription.id,
    });
  } catch (err: any) {
    console.error('Stripe error:', err.message);
    return res.status(500).json({ message: 'Stripe subscription creation failed' });
  }
});

export default router;
