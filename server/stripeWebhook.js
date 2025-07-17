const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const bodyParser = require('body-parser');
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

router.post(
  '/',
  bodyParser.raw({ type: 'application/json' }),
  async (req, res) => {
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        req.headers['stripe-signature'],
        endpointSecret
      );
    } catch (err) {
      console.error('⚠️ Webhook signature error:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const customerId = session.customer;
      const subscriptionId = session.subscription;

      console.log('✅ Checkout complete:', customerId, subscriptionId);

      // TODO: Save customerId and subscriptionId to your database here
    }

    res.status(200).json({ received: true });
  }
);

module.exports = router;
