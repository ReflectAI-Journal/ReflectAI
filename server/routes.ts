import type { Express, Request, Response, NextFunction } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ZodError } from "zod";
import Stripe from "stripe";

import { 
  insertJournalEntrySchema, 
  updateJournalEntrySchema,
  insertGoalSchema,
  updateGoalSchema,
  insertGoalActivitySchema,
  updateGoalActivitySchema,
  GoalActivity,
  Challenge,
  UserChallenge,
  UserBadge,
  insertChallengeSchema
} from "../shared/schema.js";
import { 
  generateAIResponse, 
  generateChatbotResponse, 
  generateCounselorResponse,
  generatePhilosopherResponse,
  ChatMessage, 
  analyzeSentiment 
} from "./openai";
import { setupAuth, isAuthenticated, checkSubscriptionStatus, verifyToken } from "./auth";
import { sanitizeContentForAI, logPrivacyEvent } from "./security";
import { requiresSubscription, getSubscriptionStatus, enforceTrialExpiration } from "./subscriptionMiddleware";
import { saveFeedback, getAllFeedback } from "./feedback-storage";
import { sendFeedbackEmail } from "./resend";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2024-06-20",
});

// Authentication middleware that checks for JWT token in cookies or Authorization header
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// Setup Stripe webhook BEFORE express.json() middleware
export function setupStripeWebhook(app: Express): void {
  app.post('/webhook', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'] as string;
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err: any) {
      console.log(`⚠️  Webhook signature verification failed.`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    try {
      switch (event.type) {
        case 'setup_intent.succeeded':
          const setupIntent = event.data.object;
          console.log('🎉 Setup intent succeeded:', setupIntent.id);

          // Log successful payment method validation
          if (setupIntent.metadata?.userId) {
            const userId = parseInt(setupIntent.metadata.userId);
            console.log(`💳 Payment method validated for user ${userId} via setup intent ${setupIntent.id}`);
          }
          break;

        case 'payment_intent.created':
          const paymentIntent = event.data.object;
          console.log('Payment intent created:', paymentIntent.id);
          break;

        case 'payment_intent.succeeded':
          const succeededPaymentIntent = event.data.object;
          console.log('🎉 Payment intent succeeded:', succeededPaymentIntent.id);

          // Update user subscription in database when payment succeeds
          if (succeededPaymentIntent.metadata?.userId) {
            const userId = parseInt(succeededPaymentIntent.metadata.userId);
            const planId = succeededPaymentIntent.metadata.planId;
            const subscriptionPlan = planId?.includes('unlimited') ? 'unlimited' : 'pro';
            await storage.updateUserSubscription(userId, true, subscriptionPlan);

            console.log(`Payment succeeded - updated user ${userId} subscription to ${subscriptionPlan}`);
          }
          break;

        case 'checkout.session.completed':
          const session = event.data.object;
          console.log('🎉 Checkout session completed:', session.id);

          // Update user subscription in database
          if (session.subscription && session.metadata?.userId) {
            const userId = parseInt(session.metadata.userId);
            const planId = session.metadata.planId;
            const subscriptionPlan = planId?.includes('unlimited') ? 'unlimited' : 'pro';

            await storage.updateUserStripeInfo(userId, session.customer as string, session.subscription as string);
            await storage.updateUserSubscription(userId, true, subscriptionPlan);

            console.log(`✅ Updated user ${userId} subscription to ${subscriptionPlan} via checkout session`);
          }
          break;

        case 'invoice.payment_succeeded':
          const invoice = event.data.object;
          console.log('💰 Invoice payment succeeded:', invoice.id);

          // Mark subscription as active when payment succeeds
          if (invoice.subscription) {
            try {
              const subscriptionData = await stripe.subscriptions.retrieve(invoice.subscription as string);
              const customer = await stripe.customers.retrieve(subscriptionData.customer as string);

              if (customer && !customer.deleted && customer.email) {
                const user = await storage.getUserByEmail(customer.email);
                if (user) {
                  const planName = subscriptionData.items.data[0]?.price?.nickname?.includes('unlimited') ? 'unlimited' : 'pro';
                  await storage.updateUserSubscription(user.id, true, planName);
                  console.log(`✅ Invoice payment - updated user ${user.id} subscription to ${planName}`);
                }
              }
            } catch (err) {
              console.error('Error handling invoice payment:', err);
            }
          }
          break;

        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          const subscription = event.data.object;

          // Find user by Stripe customer ID
          const customer = await stripe.customers.retrieve(subscription.customer as string);
          if (customer && !customer.deleted && customer.email) {
            const user = await storage.getUserByEmail(customer.email);
            if (user) {
              const isActive = subscription.status === 'active';
              const planName = subscription.status === 'active' ? 
                (subscription.items.data[0]?.price?.nickname?.includes('unlimited') ? 'unlimited' : 'pro') : 
                null;

              await storage.updateUserSubscription(user.id, isActive, planName);
              console.log(`Updated user ${user.id} subscription status: ${isActive ? 'active' : 'inactive'}`);
            }
          }
          break;

        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      return res.status(200).send("Received");
    } catch (error: any) {
      console.error('Webhook handler error:', error);
      res.status(500).json({ error: error.message });
    }
  });
}

// Helper function to get Stripe Price ID for a plan
function getPriceIdForPlan(planId: string): string | null {
  // Return null to force creation of inline pricing until we set up proper price IDs
  return null;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes and middleware
  setupAuth(app);

  // Journal Entries Endpoints
  app.get("/api/entries", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const entries = await storage.getJournalEntriesByUserId(user.id);
      res.json(entries);
    } catch (err) {
      console.error("Error fetching entries:", err);
      res.status(500).json({ message: "Failed to fetch journal entries" });
    }
  });

  app.get("/api/entries/date/:year/:month/:day?", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const year = parseInt(req.params.year);
      const month = parseInt(req.params.month);
      const day = req.params.day ? parseInt(req.params.day) : undefined;

      const entries = await storage.getJournalEntriesByDate(user.id, year, month, day);
      res.json(entries);
    } catch (err) {
      console.error("Error fetching entries by date:", err);
      res.status(500).json({ message: "Failed to fetch journal entries" });
    }
  });

  app.get("/api/entries/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const entryId = parseInt(req.params.id);
      const entry = await storage.getJournalEntry(entryId);

      if (!entry) {
        return res.status(404).json({ message: "Journal entry not found" });
      }

      res.json(entry);
    } catch (err) {
      console.error("Error fetching entry:", err);
      res.status(500).json({ message: "Failed to fetch journal entry" });
    }
  });

  app.post("/api/entries", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const entryData = insertJournalEntrySchema.parse({
        ...req.body,
        userId: user.id
      });

      const entry = await storage.createJournalEntry(entryData);
      res.json(entry);
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({ message: "Invalid entry data", errors: err.errors });
      }
      console.error("Error creating entry:", err);
      res.status(500).json({ message: "Failed to create journal entry" });
    }
  });

  app.put("/api/entries/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const entryId = parseInt(req.params.id);
      const updateData = updateJournalEntrySchema.parse(req.body);

      const entry = await storage.updateJournalEntry(entryId, updateData);
      if (!entry) {
        return res.status(404).json({ message: "Journal entry not found" });
      }

      res.json(entry);
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({ message: "Invalid entry data", errors: err.errors });
      }
      console.error("Error updating entry:", err);
      res.status(500).json({ message: "Failed to update journal entry" });
    }
  });

  app.delete("/api/entries/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const entryId = parseInt(req.params.id);
      await storage.deleteJournalEntry(entryId);
      res.json({ message: "Entry deleted successfully" });
    } catch (err) {
      console.error("Error deleting entry:", err);
      res.status(500).json({ message: "Failed to delete journal entry" });
    }
  });

  app.post("/api/entries/:id/regenerate-ai", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const entryId = parseInt(req.params.id);
      const entry = await storage.getJournalEntry(entryId);

      if (!entry) {
        return res.status(404).json({ message: "Journal entry not found" });
      }

      // Generate new AI response
      const aiResponse = await generateAIResponse(entry.content || "");
      const updatedEntry = await storage.updateJournalEntry(entryId, { aiResponse });

      res.json(updatedEntry);
    } catch (err) {
      console.error("Error regenerating AI response:", err);
      res.status(500).json({ message: "Failed to regenerate AI response" });
    }
  });

  // Stats endpoint
  app.get("/api/stats", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const stats = await storage.getJournalStats(user.id);
      res.json(stats);
    } catch (err) {
      console.error("Error fetching stats:", err);
      res.status(500).json({ message: "Failed to fetch journal statistics" });
    }
  });

  // Stripe subscribe endpoint
  app.post('/api/stripe/subscribe', async (req: Request, res: Response) => {
    const { plan } = req.body;

    if (!plan) {
      return res.status(400).json({ error: 'Missing plan ID' });
    }

    const priceIdMap: Record<string, string> = {
      'pro-monthly': process.env.STRIPE_PRO_MONTHLY_PRICE_ID || '',
      'pro-annually': process.env.STRIPE_PRO_ANNUAL_PRICE_ID || '',
      'unlimited-monthly': process.env.STRIPE_UNLIMITED_MONTHLY_PRICE_ID || '',
      'unlimited-annually': process.env.STRIPE_UNLIMITED_ANNUAL_PRICE_ID || ''
    };

    const priceId = priceIdMap[plan];

    if (!priceId) {
      return res.status(400).json({ error: 'Invalid plan ID or missing price ID in environment' });
    }

    try {
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{
          price: priceId,
          quantity: 1,
        }],
        subscription_data: {
          trial_period_days: 3
        },
        success_url: `https://${process.env.REPLIT_DOMAINS || 'localhost:5000'}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `https://${process.env.REPLIT_DOMAINS || 'localhost:5000'}/subscription`,
        metadata: {
          plan: plan,
          checkoutFlow: 'stripe_subscribe_minimal'
        }
      });

      console.log(`✅ Created minimal checkout session ${session.id} for plan ${plan}`);
      return res.json({ sessionId: session.id, url: session.url });
    } catch (error: any) {
      console.error('🔥 Error creating minimal checkout session:', error);
      return res.status(500).json({ error: error.message });
    }
  });

  // Create Stripe checkout session (original endpoint)
  app.post('/api/create-checkout-session', async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    const user = req.user as any;
    const { planId, subscribeToNewsletter, personalInfo, agreeToTerms } = req.body;

    if (!user.email) {
      return res.status(400).json({ error: 'Email is required for subscription' });
    }

    // If personal info is provided, validate terms agreement
    if (personalInfo && !agreeToTerms) {
      return res.status(400).json({ error: 'Terms and conditions must be agreed to' });
    }

    try {
      // Create or get customer with comprehensive data for Stripe database
      let customer;
      const customerData = {
        email: personalInfo?.email || user.email,
        name: personalInfo ? `${personalInfo.firstName} ${personalInfo.lastName}` : user.username,
        address: personalInfo ? {
          line1: personalInfo.address,
          city: personalInfo.city,
          state: personalInfo.state,
          postal_code: personalInfo.zipCode,
          country: 'US'
        } : undefined,
        metadata: {
          userId: user.id.toString(),
          subscribeToNewsletter: subscribeToNewsletter ? 'true' : 'false',
          lastUpdated: new Date().toISOString(),
          planRequested: planId,
          source: personalInfo ? 'multi_step_checkout' : 'hosted_checkout'
        }
      };

      if (user.stripeCustomerId) {
        customer = await stripe.customers.retrieve(user.stripeCustomerId);

        // Update customer with latest information
        customer = await stripe.customers.update(user.stripeCustomerId, customerData);
        console.log(`Updated Stripe customer ${customer.id} for hosted checkout`);
      } else {
        customer = await stripe.customers.create(customerData);
        await storage.updateStripeCustomerId(user.id, customer.id);
        console.log(`Created Stripe customer ${customer.id} for user ${user.id} via hosted checkout`);
      }

      // Map plan IDs to pricing details
      const priceMap: Record<string, { amount: number; interval: 'month' | 'year'; planName: string; description: string }> = {
        'pro-monthly': { amount: 1499, interval: 'month', planName: 'ReflectAI Pro', description: 'Essential AI journaling features' },
        'pro-annually': { amount: 15290, interval: 'year', planName: 'ReflectAI Pro (Annual)', description: 'Essential AI journaling features - yearly billing' },
        'unlimited-monthly': { amount: 2499, interval: 'month', planName: 'ReflectAI Unlimited', description: 'Complete mental wellness toolkit' },
        'unlimited-annually': { amount: 25490, interval: 'year', planName: 'ReflectAI Unlimited (Annual)', description: 'Complete mental wellness toolkit - yearly billing' }
      };

      const selectedPlan = priceMap[planId];
      if (!selectedPlan) {
        return res.status(400).json({ error: 'Invalid plan selected' });
      }

      // Map plan IDs to Stripe price IDs (using working price ID for development)
      const priceIdMap: Record<string, string> = {
        'pro-monthly': process.env.STRIPE_PRO_MONTHLY_PRICE_ID || 'price_1RhVjMDBTFagn9VwUCHg8O50',
        'pro-annually': process.env.STRIPE_PRO_ANNUALLY_PRICE_ID || 'price_1RhVjMDBTFagn9VwUCHg8O50',
        'unlimited-monthly': process.env.STRIPE_UNLIMITED_MONTHLY_PRICE_ID || 'price_1RhVjMDBTFagn9VwUCHg8O50',
        'unlimited-annually': process.env.STRIPE_UNLIMITED_ANNUALLY_PRICE_ID || 'price_1RhVjMDBTFagn9VwUCHg8O50'
      };

      const priceId = priceIdMap[planId];
      if (!priceId) {
        return res.status(400).json({ error: 'Invalid plan - price ID not found' });
      }

      // Create checkout session with 3-day free trial using price ID
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        line_items: [{ 
          price: priceId, 
          quantity: 1 
        }],
        subscription_data: {
          trial_period_days: 3
        },
        customer: customer.id,
        success_url: `https://${process.env.REPLIT_DOMAINS}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `https://${process.env.REPLIT_DOMAINS}/subscription`,
        metadata: {
          userId: user.id.toString(),
          planId: planId,
          subscribeToNewsletter: subscribeToNewsletter ? 'true' : 'false',
          personalInfo: personalInfo ? JSON.stringify(personalInfo) : '',
          agreeToTerms: agreeToTerms ? 'true' : 'false',
          checkoutFlow: personalInfo ? 'multi_step' : 'direct'
        }
      });

      res.json({ sessionId: session.id, url: session.url });
    } catch (error: any) {
      console.error('Stripe checkout error:', error);
      return res.status(400).json({ error: error.message });
    }
  });

  // Create checkout session for unauthenticated users (no login required)
  app.post('/api/create-subscription-checkout', async (req: Request, res: Response) => {
    console.log("REQ BODY:", req.body);

    const { planId, personalInfo, agreeToTerms, subscribeToNewsletter } = req.body;

    // Check if user is authenticated (optional for this endpoint)
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    let user = null;
    let userId = null;
    
    if (token) {
      try {
        user = verifyToken(token);
        userId = user.id;
        req.user = user;
        console.log(`✅ Authenticated user ${userId} proceeding with checkout`);
      } catch (err) {
        console.log("Token verification failed, proceeding as unauthenticated user");
        // Continue as unauthenticated user
      }
    } else {
      console.log("✅ Unauthenticated user proceeding with checkout");
    }

    console.log("✅ Price ID:", process.env.STRIPE_PRICE_ID); // or the plan ID you're using

    // Validate required fields
    if (!planId) {
      return res.status(400).json({ error: 'Plan ID is required' });
    }

    if (!personalInfo || !agreeToTerms) {
      return res.status(400).json({ error: 'Personal information and terms agreement are required' });
    }

    if (!personalInfo.email || !personalInfo.firstName || !personalInfo.lastName) {
      return res.status(400).json({ error: 'Email, first name, and last name are required' });
    }

    try {
      // Create customer with comprehensive data for Stripe database
      const customer = await stripe.customers.create({
        email: personalInfo.email,
        name: `${personalInfo.firstName} ${personalInfo.lastName}`,
        address: personalInfo.address ? {
          line1: personalInfo.address,
          city: personalInfo.city,
          state: personalInfo.state,
          postal_code: personalInfo.zipCode,
          country: 'US'
        } : undefined,
        metadata: {
          userId: userId ? userId.toString() : 'unauthenticated',
          subscribeToNewsletter: subscribeToNewsletter ? 'true' : 'false',
          lastUpdated: new Date().toISOString(),
          planRequested: planId,
          source: userId ? 'authenticated_checkout' : 'unauthenticated_checkout',
          firstName: personalInfo.firstName,
          lastName: personalInfo.lastName
        }
      });
      console.log(`Created Stripe customer ${customer.id} for ${userId ? 'authenticated' : 'unauthenticated'} checkout`);

      // Map plan IDs to Stripe price IDs
      const priceIdMap: Record<string, string> = {
        'pro-monthly': process.env.STRIPE_PRO_MONTHLY_PRICE_ID || '',
        'pro-annually': process.env.STRIPE_PRO_ANNUAL_PRICE_ID || '',
        'unlimited-monthly': process.env.STRIPE_UNLIMITED_MONTHLY_PRICE_ID || '',
        'unlimited-annually': process.env.STRIPE_UNLIMITED_ANNUAL_PRICE_ID || ''
      };

      const priceId = priceIdMap[planId];

      // Create line items with inline pricing if price ID is not available
      let lineItems;
      if (priceId) {
        lineItems = [{ price: priceId, quantity: 1 }];
      } else {
        // Create inline pricing for the plan
        const planPricing = {
          'pro-monthly': { amount: 1499, interval: 'month', name: 'ReflectAI Pro' },
          'pro-annually': { amount: 15290, interval: 'year', name: 'ReflectAI Pro (Annual)' },
          'unlimited-monthly': { amount: 2499, interval: 'month', name: 'ReflectAI Unlimited' },
          'unlimited-annually': { amount: 25490, interval: 'year', name: 'ReflectAI Unlimited (Annual)' }
        };

        const pricing = planPricing[planId as keyof typeof planPricing];
        if (!pricing) {
          return res.status(400).json({ error: 'Invalid plan selected' });
        }

        lineItems = [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: pricing.name,
              description: `${pricing.name} subscription with 3-day free trial`,
            },
            unit_amount: pricing.amount,
            recurring: {
              interval: pricing.interval as 'month' | 'year',
            },
          },
          quantity: 1,
        }];
      }

      // Create checkout session - immediate payment required
      try {
        const session = await stripe.checkout.sessions.create({
          mode: 'subscription',
          payment_method_types: ["card"],
          line_items: lineItems,

          customer: customer.id,
          success_url: `https://${process.env.REPLIT_DOMAINS || 'localhost:5000'}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `https://${process.env.REPLIT_DOMAINS || 'localhost:5000'}/subscription`,
          metadata: {
            planId: planId,
            subscribeToNewsletter: subscribeToNewsletter ? 'true' : 'false',
            personalInfo: JSON.stringify(personalInfo),
            agreeToTerms: 'true',
            checkoutFlow: userId ? 'authenticated_multi_step' : 'unauthenticated_multi_step',
            customerId: customer.id,
            userId: userId ? userId.toString() : 'unauthenticated'
          }
        });

        console.log(`Created checkout session ${session.id} for ${userId ? 'authenticated' : 'unauthenticated'} user`);
        res.status(200).json({ sessionId: session.id, url: session.url });
      } catch (err) {
        console.error("🔥 Stripe session creation failed:", err);
        res.status(500).json({ error: "Stripe checkout failed", details: err.message });
      }
    } catch (error: any) {
      console.error('Stripe checkout error:', error);
      return res.status(400).json({ error: error.message });
    }
  });

  // Simple checkout session endpoint for direct Stripe redirect
  app.post('/api/checkout-session', async (req: Request, res: Response) => {
    const { planId } = req.body;

    if (!planId) {
      return res.status(400).json({ error: 'Plan ID is required' });
    }

    try {
      // Map plan IDs to Stripe price IDs
      const priceIdMap: Record<string, string> = {
        'pro-monthly': process.env.STRIPE_PRO_MONTHLY_PRICE_ID || 'price_1RlExqDBTFagn9VwAaEgnIKt',
        'pro-annually': process.env.STRIPE_PRO_ANNUAL_PRICE_ID || 'price_1Rl3P8DBTFagn9Vw8tyqKkaq',
        'unlimited-monthly': process.env.STRIPE_UNLIMITED_MONTHLY_PRICE_ID || 'price_1Rl3OWDBTFagn9Vw1ElGMTMJ',
        'unlimited-annually': process.env.STRIPE_UNLIMITED_ANNUAL_PRICE_ID || 'price_1Rl3Q3DBTFagn9VwMv0zw3G9'
      };

      const priceId = priceIdMap[planId];
      if (!priceId) {
        return res.status(400).json({ error: 'Invalid plan - price ID not found' });
      }

      // Create checkout session - immediate payment required
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        line_items: [{ 
          price: priceId, 
          quantity: 1 
        }],
        success_url: `https://${process.env.REPLIT_DOMAINS || 'localhost:5000'}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `https://${process.env.REPLIT_DOMAINS || 'localhost:5000'}/subscription`,
        metadata: {
          planId: planId,
          checkoutFlow: 'direct_stripe',
          source: 'subscription_page'
        }
      });

      console.log(`Created direct checkout session ${session.id} for plan ${planId}`);
      res.json({ url: session.url });
    } catch (error: any) {
      console.error('Direct Stripe checkout error:', error);
      return res.status(400).json({ error: error.message });
    }
  });

  // Create server
  const server = createServer(app);
  return server;
}

// Export storage for other modules to use
export { storage };
