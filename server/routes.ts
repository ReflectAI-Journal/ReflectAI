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
  insertChallengeSchema,
  users
} from "../shared/schema.js";
import { db } from "./db.js";
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
import { 
  checkAuth, 
  requireAuth, 
  requireSubscription, 
  protectAppRoutes, 
  handlePostRegistration, 
  handlePostLogin, 
  storePlanSelection 
} from "./middleware/authFlow.js";
import { saveFeedback, getAllFeedback } from "./feedback-storage";
import { sendFeedbackEmail } from "./resend";
import { BlueprintPDFService } from "./services/blueprintPDF.js";

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
            let subscriptionPlan = 'pro';
            if (planId?.includes('elite')) {
              subscriptionPlan = 'elite';
            } else if (planId?.includes('unlimited')) {
              subscriptionPlan = 'unlimited';
            } else if (planId?.includes('premium')) {
              subscriptionPlan = 'premium';
            }
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
            let subscriptionPlan = 'pro';
            if (planId?.includes('elite')) {
              subscriptionPlan = 'elite';
            } else if (planId?.includes('unlimited')) {
              subscriptionPlan = 'unlimited';
            } else if (planId?.includes('premium')) {
              subscriptionPlan = 'premium';
            }

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
      'basic-monthly': process.env.STRIPE_BASIC_MONTHLY_PRICE_ID || 'price_1RlExqDBTFagn9VwAaEgnIKt',
      'basic-annually': process.env.STRIPE_BASIC_ANNUAL_PRICE_ID || 'price_1Rl3P8DBTFagn9Vw8tyqKkaq',
      'pro-monthly': process.env.STRIPE_PRO_MONTHLY_PRICE_ID || 'price_1Rl3OWDBTFagn9Vw1ElGMTMJ',
      'pro-annually': process.env.STRIPE_PRO_ANNUAL_PRICE_ID || 'price_1Rl3Q3DBTFagn9VwMv0zw3G9',
      'elite-monthly': process.env.STRIPE_ELITE_MONTHLY_PRICE_ID || 'price_1Rmq1DDBTFagn9VwzZ40JBVM',
      'elite-annually': process.env.STRIPE_ELITE_ANNUAL_PRICE_ID || 'price_1RmrgcDBTFagn9Vwpjg1Lhvf'
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

        success_url: `https://reflectai-journal.site/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `https://reflectai-journal.site/subscription`,
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
        'basic-monthly': { amount: 1499, interval: 'month', planName: 'ReflectAI Basic', description: 'Essential AI journaling features' },
        'basic-annually': { amount: 15290, interval: 'year', planName: 'ReflectAI Basic (Annual)', description: 'Essential AI journaling features - yearly billing' },
        'pro-monthly': { amount: 2499, interval: 'month', planName: 'ReflectAI Pro', description: 'Complete mental wellness toolkit' },
        'pro-annually': { amount: 25490, interval: 'year', planName: 'ReflectAI Pro (Annual)', description: 'Complete mental wellness toolkit - yearly billing' },
        'elite-monthly': { amount: 5000, interval: 'month', planName: 'ReflectAI Elite', description: 'Ultimate experience for serious growth' },
        'elite-annually': { amount: 45000, interval: 'year', planName: 'ReflectAI Elite (Annual)', description: 'Ultimate experience for serious growth - yearly billing' }
      };

      const selectedPlan = priceMap[planId];
      if (!selectedPlan) {
        return res.status(400).json({ error: 'Invalid plan selected' });
      }

      // Map plan IDs to Stripe price IDs
      const priceIdMap: Record<string, string> = {
        'basic-monthly': process.env.STRIPE_BASIC_MONTHLY_PRICE_ID || 'price_1RlExqDBTFagn9VwAaEgnIKt',
        'basic-annually': process.env.STRIPE_BASIC_ANNUAL_PRICE_ID || 'price_1Rl3P8DBTFagn9Vw8tyqKkaq',
        'pro-monthly': process.env.STRIPE_PRO_MONTHLY_PRICE_ID || 'price_1Rl3OWDBTFagn9Vw1ElGMTMJ',
        'pro-annually': process.env.STRIPE_PRO_ANNUAL_PRICE_ID || 'price_1Rl3Q3DBTFagn9VwMv0zw3G9',
        'elite-monthly': process.env.STRIPE_ELITE_MONTHLY_PRICE_ID || 'price_1Rmq1DDBTFagn9VwzZ40JBVM',
        'elite-annually': process.env.STRIPE_ELITE_ANNUAL_PRICE_ID || 'price_1RmrgcDBTFagn9Vwpjg1Lhvf'
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
        customer: customer.id,
        success_url: `https://reflectai-journal.site/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `https://reflectai-journal.site/subscription`,
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
        'unlimited-annually': process.env.STRIPE_UNLIMITED_ANNUAL_PRICE_ID || '',
        'elite-monthly': process.env.STRIPE_ELITE_MONTHLY_PRICE_ID || '',
        'elite-annually': process.env.STRIPE_ELITE_ANNUAL_PRICE_ID || ''
      };

      const priceId = priceIdMap[planId];

      // Create line items with inline pricing if price ID is not available
      let lineItems;
      if (priceId) {
        lineItems = [{ price: priceId, quantity: 1 }];
      } else {
        // Create inline pricing for the plan
        const planPricing = {
          'basic-monthly': { amount: 1499, interval: 'month', name: 'ReflectAI Basic' },
          'basic-annually': { amount: 15290, interval: 'year', name: 'ReflectAI Basic (Annual)' },
          'pro-monthly': { amount: 2499, interval: 'month', name: 'ReflectAI Pro' },
          'pro-annually': { amount: 25490, interval: 'year', name: 'ReflectAI Pro (Annual)' },
          'unlimited-monthly': { amount: 2499, interval: 'month', name: 'ReflectAI Unlimited' },
          'unlimited-annually': { amount: 25490, interval: 'year', name: 'ReflectAI Unlimited (Annual)' },
          'elite-monthly': { amount: 5000, interval: 'month', name: 'ReflectAI Elite' },
          'elite-annually': { amount: 45000, interval: 'year', name: 'ReflectAI Elite (Annual)' }
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
          success_url: `https://reflectai-journal.site/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `https://reflectai-journal.site/subscription`,
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
        'basic-monthly': process.env.STRIPE_BASIC_MONTHLY_PRICE_ID || 'price_1RlExqDBTFagn9VwAaEgnIKt',
        'basic-annually': process.env.STRIPE_BASIC_ANNUAL_PRICE_ID || 'price_1Rl3P8DBTFagn9Vw8tyqKkaq',
        'pro-monthly': process.env.STRIPE_PRO_MONTHLY_PRICE_ID || 'price_1Rl3OWDBTFagn9Vw1ElGMTMJ',
        'pro-annually': process.env.STRIPE_PRO_ANNUAL_PRICE_ID || 'price_1Rl3Q3DBTFagn9VwMv0zw3G9',
        'elite-monthly': process.env.STRIPE_ELITE_MONTHLY_PRICE_ID || 'price_1Rmq1DDBTFagn9VwzZ40JBVM',
        'elite-annually': process.env.STRIPE_ELITE_ANNUAL_PRICE_ID || 'price_1RmrgcDBTFagn9Vwpjg1Lhvf'
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
        success_url: `https://reflectai-journal.site/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `https://reflectai-journal.site/subscription`,
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

  // Handle checkout success and payment verification
  app.get('/api/checkout-success', async (req: Request, res: Response) => {
    const { session_id } = req.query;

    if (!session_id) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    try {
      // Retrieve the checkout session from Stripe
      const session = await stripe.checkout.sessions.retrieve(session_id as string);
      
      if (session.payment_status !== 'paid') {
        return res.status(400).json({ error: 'Payment not completed' });
      }

      // Handle user creation for unauthenticated checkouts
      if (!req.isAuthenticated() && session.customer_email) {
        try {
          // Create user account with the email from Stripe session
          const newUser = await storage.createUser({
            username: session.customer_email.split('@')[0],
            email: session.customer_email,
            password: '', // Will prompt user to set password later
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string
          });

          // Update subscription status based on plan
          let subscriptionPlan = 'pro';
          const planId = session.metadata?.planId;
          if (planId?.includes('elite')) {
            subscriptionPlan = 'elite';
          } else if (planId?.includes('basic')) {
            subscriptionPlan = 'basic';
          }

          await storage.updateUserSubscription(newUser.id, true, subscriptionPlan);
          console.log(`✅ Created user ${newUser.id} with ${subscriptionPlan} subscription from checkout session ${session.id}`);
          
          return res.json({ 
            success: true, 
            newUser: true,
            userId: newUser.id,
            email: session.customer_email 
          });
        } catch (userCreationError) {
          console.error('Error creating user from checkout:', userCreationError);
          // Continue with verification even if user creation fails
        }
      }

      // For authenticated users, just confirm payment
      if (req.isAuthenticated()) {
        const user = (req as any).user;
        console.log(`✅ Payment verified for authenticated user ${user.id}, session ${session.id}`);
      }

      res.json({ 
        success: true, 
        sessionId: session.id,
        paymentStatus: session.payment_status 
      });
    } catch (error: any) {
      console.error('Checkout success verification error:', error);
      return res.status(500).json({ error: 'Payment verification failed' });
    }
  });

  // Mark counselor questionnaire as completed
  app.post('/api/user/complete-questionnaire', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { matchedPersonality } = req.body;
      
      // Update user's questionnaire completion status and matched personality
      await storage.updateUserQuestionnaireStatus(user.id, true, matchedPersonality);
      
      res.json({ 
        message: "Questionnaire completion recorded", 
        completed: true,
        matchedPersonality 
      });
    } catch (error) {
      console.error('Error marking questionnaire as completed:', error);
      res.status(500).json({ message: "Failed to update questionnaire status" });
    }
  });

  // Reset questionnaire status for retaking
  app.post('/api/user/reset-questionnaire', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      
      // Reset user's questionnaire completion status and matched personality
      await storage.updateUserQuestionnaireStatus(user.id, false, null);
      
      res.json({ 
        message: "Questionnaire reset successfully", 
        completed: false,
        matchedPersonality: null 
      });
    } catch (error) {
      console.error('Error resetting questionnaire:', error);
      res.status(500).json({ message: "Failed to reset questionnaire" });
    }
  });

  // Blueprint Downloads (Pro Feature Only)
  app.get('/api/blueprints/downloads', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const downloads = await storage.getBlueprintDownloads(user.id);
      res.json(downloads);
    } catch (error) {
      console.error('Error fetching blueprint downloads:', error);
      res.status(500).json({ message: "Failed to fetch downloads" });
    }
  });

  // Download Anxiety & Overthinking Blueprint (Pro Feature)
  app.post('/api/blueprints/download/anxiety-overthinking', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      
      // Check if user has Pro or Elite subscription
      if (user.subscriptionPlan !== 'pro' && user.subscriptionPlan !== 'elite') {
        return res.status(403).json({ 
          message: "Blueprint downloads are available for Pro and Elite subscribers only",
          requiresPro: true 
        });
      }

      // Get personalization data from request body
      const { name, mainTriggers, currentCopingMethods, preferredTimeframe, severity } = req.body;
      
      const personalizationData = {
        name: name || user.username,
        mainTriggers: mainTriggers || [],
        currentCopingMethods: currentCopingMethods || [],
        preferredTimeframe: preferredTimeframe || 'immediate',
        severity: severity || 'moderate'
      };

      // Generate the PDF
      const pdfBuffer = BlueprintPDFService.generateAnxietyOverthinkingBlueprint(personalizationData);
      
      // Track the download
      await storage.createBlueprintDownload({
        userId: user.id,
        blueprintType: 'anxiety-overthinking',
        customizationData: personalizationData
      });

      // Set headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="anxiety-overthinking-blueprint-${new Date().toISOString().split('T')[0]}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Error generating blueprint PDF:', error);
      res.status(500).json({ message: "Failed to generate blueprint" });
    }
  });

  // Password Reset Routes  
  app.post("/api/auth/forgot-password", async (req: Request, res: Response) => {
    console.log("=== FORGOT PASSWORD ROUTE HIT ===");
    console.log("Request body:", req.body);
    try {
      const { email } = req.body;
      
      if (!email) {
        console.log("No email provided");
        return res.status(400).json({ message: "Email is required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Return success even if user not found for security
        return res.json({ message: "If an account with this email exists, a reset link has been sent." });
      }

      // Generate secure token
      const crypto = await import('crypto');
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

      await storage.createPasswordResetToken({
        userId: user.id,
        token,
        expiresAt
      });

      // Send email with reset link using SendGrid
      const resetLink = `${req.protocol}://${req.get('host')}/password-reset?token=${token}`;
      console.log(`Password reset token for ${email}: ${token}`);
      console.log(`Reset link: ${resetLink}`);

      try {
        if (!process.env.SENDGRID_API_KEY) {
          throw new Error('SENDGRID_API_KEY environment variable is not set');
        }

        const sgMail = await import('@sendgrid/mail');
        sgMail.default.setApiKey(process.env.SENDGRID_API_KEY);
        
        console.log('SendGrid API key configured, attempting to send email...');

        const emailContent = {
          to: email,
          from: 'loziercaleb@gmail.com', // Use your own verified email for testing
          subject: 'Reset Your ReflectAI Password',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #1d4ed8; text-align: center;">Reset Your Password</h2>
              <p>Hi there,</p>
              <p>You requested to reset your password for your ReflectAI account. Click the button below to create a new password:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" style="background-color: #1d4ed8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #6b7280;">${resetLink}</p>
              <p style="color: #ef4444; font-size: 14px;"><strong>This link will expire in 1 hour.</strong></p>
              <p>If you didn't request this password reset, you can safely ignore this email.</p>
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
              <p style="font-size: 12px; color: #6b7280; text-align: center;">
                This email was sent by ReflectAI. If you have any questions, please contact our support team.
              </p>
            </div>
          `,
          text: `
Reset Your ReflectAI Password

You requested to reset your password for your ReflectAI account. 

Click this link to create a new password: ${resetLink}

This link will expire in 1 hour.

If you didn't request this password reset, you can safely ignore this email.
          `
        };

        await sgMail.default.send(emailContent);
        console.log(`Password reset email sent successfully to ${email}`);
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
        console.error('SendGrid error details:', JSON.stringify(emailError, null, 2));
        // Don't return an error to avoid revealing if the email exists
      }

      res.json({ message: "If an account with this email exists, a reset link has been sent." });
    } catch (err) {
      console.error("Error in forgot password:", err);
      res.status(500).json({ message: "Failed to process password reset request" });
    }
  });

  app.post("/api/auth/reset-password", async (req: Request, res: Response) => {
    try {
      const { token, password } = req.body;
      
      if (!token || !password) {
        return res.status(400).json({ message: "Token and password are required" });
      }

      if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters" });
      }

      const resetToken = await storage.getPasswordResetToken(token);
      console.log("Reset token lookup result:", resetToken);
      if (!resetToken) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }

      // Hash new password
      const bcrypt = await import('bcrypt');
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update user password
      await storage.updateUserPassword(resetToken.userId, hashedPassword);
      
      // Mark token as used
      await storage.markTokenAsUsed(token);

      res.json({ message: "Password reset successfully" });
    } catch (err) {
      console.error("Error in reset password:", err);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  // Admin VIP Management Routes
  app.post("/api/admin/vip/:userId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const userId = parseInt(req.params.userId);
      const { isVip } = req.body;

      // Admin check: first user (ID 1) gets admin access automatically
      if (user.id !== 1) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const updatedUser = await storage.updateUserVipStatus(userId, isVip);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ 
        message: `User ${userId} VIP status ${isVip ? 'granted' : 'revoked'}`,
        user: updatedUser 
      });
    } catch (err) {
      console.error("Error updating VIP status:", err);
      res.status(500).json({ message: "Failed to update VIP status" });
    }
  });

  app.get("/api/admin/users", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      
      // Admin check: first user (ID 1) gets admin access automatically  
      if (user.id !== 1) {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Get all users with minimal info for admin management
      const allUsers = await db.select({
        id: users.id,
        username: users.username,
        email: users.email,
        isVipUser: users.isVipUser,
        hasActiveSubscription: users.hasActiveSubscription,
        subscriptionPlan: users.subscriptionPlan
      }).from(users);

      res.json(allUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // ========================
  // NEW CLEAN ROUTING LOGIC
  // ========================
  
  // Store plan selection (used when user selects plan before authentication)
  app.post('/api/flow/store-plan', storePlanSelection, (req, res) => {
    res.json({ 
      message: 'Plan selection stored', 
      planId: req.session?.selectedPlan,
      source: req.session?.source 
    });
  });

  // Handle post-registration routing logic
  app.post('/api/flow/post-registration', checkAuth, handlePostRegistration, (req, res) => {
    const { redirectAfterAuth } = (req as any).flowData || {};
    
    res.json({
      success: true,
      redirectTo: redirectAfterAuth || '/pricing',
      flow: 'post_registration',
      selectedPlan: req.session?.selectedPlan,
      source: req.session?.source
    });
  });

  // Handle post-login routing logic
  app.post('/api/flow/post-login', checkAuth, handlePostLogin, (req, res) => {
    const { redirectAfterAuth } = (req as any).flowData || {};
    
    res.json({
      success: true,
      redirectTo: redirectAfterAuth || '/app/counselor',
      flow: 'post_login',
      hasAccess: redirectAfterAuth === '/app/counselor'
    });
  });

  // Check access to app routes
  app.get('/api/flow/app-access', protectAppRoutes, (req, res) => {
    res.json({
      hasAccess: true,
      user: {
        id: (req as any).user.id,
        subscriptionPlan: (req as any).user.subscriptionPlan,
        hasActiveSubscription: (req as any).user.hasActiveSubscription,
        isVipUser: (req as any).user.isVipUser
      }
    });
  });

  // Route protection middleware for all /api/app/* routes
  app.use('/api/app/*', protectAppRoutes);

  // ========================
  // FRONTEND ROUTE HANDLERS
  // ========================

  // Handle frontend routing with clean redirects
  app.get('/app/*', checkAuth, async (req, res, next) => {
    if (!req.user) {
      return res.redirect('/auth?tab=login&redirect=' + encodeURIComponent(req.path));
    }

    try {
      const user = await storage.getUserById((req as any).user.id);
      
      if (!user) {
        return res.redirect('/auth?tab=login');
      }

      // Check subscription status
      const hasActiveSubscription = user.hasActiveSubscription;
      const hasActiveTrial = user.trialEndsAt && new Date(user.trialEndsAt) > new Date();
      const isVipUser = user.isVipUser;

      if (!hasActiveSubscription && !hasActiveTrial && !isVipUser) {
        return res.redirect('/subscription?from=' + encodeURIComponent(req.path));
      }

      // User has access, continue to serve the app
      next();
    } catch (error) {
      console.error('Error checking app access:', error);
      res.redirect('/auth?tab=login');
    }
  });

  // Pricing page route (publicly accessible)
  app.get('/pricing', (req, res, next) => {
    next(); // Let frontend handle this
  });

  // Auth page route (publicly accessible)  
  app.get('/auth', (req, res, next) => {
    next(); // Let frontend handle this
  });

  // Subscription page route (requires authentication)
  app.get('/subscription', checkAuth, (req, res, next) => {
    if (!req.user) {
      return res.redirect('/auth?tab=login&redirect=/subscription');
    }
    next(); // Let frontend handle this
  });

  // Create server
  const server = createServer(app);
  return server;
}

// Export storage for other modules to use
export { storage };
