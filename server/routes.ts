
import type { Express, Request, Response, NextFunction } from "express";
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
import { setupAuth, isAuthenticated, checkSubscriptionStatus } from "./auth";
import { sanitizeContentForAI, logPrivacyEvent } from "./security";
import { requiresSubscription, getSubscriptionStatus, enforceTrialExpiration } from "./subscriptionMiddleware";

// Initialize Stripe
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2023-10-16",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes and middleware
  setupAuth(app);

  // Stripe payment routes
  app.post("/api/create-payment-intent", async (req: Request, res: Response) => {
    try {
      const { amount } = req.body;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Create Stripe checkout session
  app.post('/api/create-checkout-session', async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    const user = req.user as any;
    const { planId } = req.body;

    if (!user.email) {
      return res.status(400).json({ error: 'Email is required for subscription' });
    }

    try {
      // Create or get customer
      let customer;
      if (user.stripeCustomerId) {
        customer = await stripe.customers.retrieve(user.stripeCustomerId);
      } else {
        customer = await stripe.customers.create({
          email: user.email,
          name: user.username,
        });
        await storage.updateStripeCustomerId(user.id, customer.id);
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

      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        customer: customer.id,
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: selectedPlan.planName,
              description: selectedPlan.description
            },
            unit_amount: selectedPlan.amount,
            recurring: {
              interval: selectedPlan.interval
            }
          },
          quantity: 1,
        }],
        mode: 'subscription',
        success_url: `${req.headers.origin}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/subscription`,
        metadata: {
          userId: user.id.toString(),
          planId: planId
        }
      });

      res.json({ sessionId: session.id, url: session.url });
    } catch (error: any) {
      console.error('Stripe checkout error:', error);
      return res.status(400).json({ error: error.message });
    }
  });

  // Handle successful checkout
  app.get('/api/checkout-success', async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    const { session_id } = req.query;
    
    if (!session_id) {
      return res.status(400).json({ error: 'Session ID required' });
    }

    try {
      const session = await stripe.checkout.sessions.retrieve(session_id as string);
      
      if (session.payment_status === 'paid' && session.subscription) {
        const user = req.user as any;
        await storage.updateUserStripeInfo(user.id, session.customer as string, session.subscription as string);
        
        res.json({ success: true, subscriptionId: session.subscription });
      } else {
        res.status(400).json({ error: 'Payment not completed' });
      }
    } catch (error: any) {
      console.error('Checkout success error:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Stripe webhook handler - simplified version for now
  app.post('/api/webhooks/stripe', async (req: Request, res: Response) => {
    try {
      console.log('Stripe webhook received:', req.body);
      // TODO: Add proper webhook signature verification in production
      res.json({ received: true });
    } catch (error: any) {
      console.error('Webhook handler error:', error);
      res.status(400).json({ error: error.message });
    }
  });
  // Journal entries routes
  app.get("/api/entries", isAuthenticated, enforceTrialExpiration, async (req: Request, res: Response) => {
    try {
      // Get the authenticated user's ID from the session
      const userId = (req.user as any).id;
      
      const entries = await storage.getJournalEntriesByUserId(userId);
      res.json(entries);
    } catch (err) {
      console.error("Error fetching entries:", err);
      res.status(500).json({ message: "Failed to fetch journal entries" });
    }
  });
  app.post("/api/ai-response", async (req: Request, res: Response) => {
    const { journalContent, aiType } = req.body;

    try {
      if (!journalContent) {
        return res.status(400).json({ error: "Missing journal content" });
      }
      
      // Sanitize content before processing to remove any PII
      const sanitizedContent = sanitizeContentForAI(journalContent);
      
      // Log privacy event (without including the actual content)
      const userId = req.isAuthenticated() ? (req.user as any).id : 0;
      logPrivacyEvent("ai_request", userId, `AI response requested (type: ${aiType || 'default'})`);

      let response = "";

      switch (aiType) {
        case "counselor":
          response = await generateCounselorResponse(sanitizedContent);
          break;
        case "philosopher":
          response = await generatePhilosopherResponse(sanitizedContent);
          break;
        default:
          response = await generateAIResponse(sanitizedContent);
      }

      res.json({ response });

    } catch (error) {
      console.error("AI response error:", error);
      res.status(500).json({ error: "AI failed" });
    }
  });

  // Endpoint for the onboarding flow AI tease feature
  app.post("/api/onboarding/ai-tease", async (req: Request, res: Response) => {
    const { content } = req.body;

    try {
      if (!content) {
        return res.status(400).json({ error: "Missing content" });
      }
      
      // Sanitize content before processing to remove any PII
      const sanitizedContent = sanitizeContentForAI(content);
      
      // Log privacy event (without including the actual content)
      const userId = req.isAuthenticated() ? (req.user as any).id : 0;
      logPrivacyEvent("ai_tease_request", userId, "AI tease response requested during onboarding");

      // Generate a teaser response - intentionally limited to make users want more
      let response = "";
      try {
        // Try to get a full response first
        const fullResponse = await generateAIResponse(sanitizedContent);
        
        // Just give 1-2 sentences and cut off mid-sentence
        // First, get only the first paragraph
        const firstParagraph = fullResponse.split('\n\n')[0];
        
        // Then split into sentences
        const sentences = firstParagraph.split(/(?<=[.!?])\s+/);
        
        // Take 1-2 sentences depending on length
        if (sentences[0].length < 40 && sentences.length > 1) {
          // If first sentence is short, include a second one but cut it off
          const secondSentence = sentences[1];
          const cutoffPoint = Math.min(Math.floor(secondSentence.length * 0.7), 30);
          response = sentences[0] + " " + secondSentence.substring(0, cutoffPoint) + "...";
        } else {
          // Otherwise just cut off the first sentence
          const cutoffPoint = Math.min(Math.floor(sentences[0].length * 0.7), 60);
          response = sentences[0].substring(0, cutoffPoint) + "...";
        }
      } catch (error) {
        console.error("Error generating AI tease:", error);
        response = "Your question about life is quite profound. In philosophical terms, the meaning of existence is often viewed as...";
      }

      res.json({ response });

    } catch (error) {
      console.error("AI tease error:", error);
      res.status(500).json({ error: "AI tease failed" });
    }
  });

  app.get("/api/entries/date/:year/:month/:day?", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Get the authenticated user's ID from the session
      const userId = (req.user as any).id;
      
      const year = parseInt(req.params.year);
      const month = parseInt(req.params.month);
      const day = req.params.day ? parseInt(req.params.day) : undefined;
      
      const entries = await storage.getJournalEntriesByDate(userId, year, month, day);
      res.json(entries);
    } catch (err) {
      console.error("Error fetching entries by date:", err);
      res.status(500).json({ message: "Failed to fetch journal entries" });
    }
  });

  app.get("/api/entries/:id", isAuthenticated, enforceTrialExpiration, async (req: Request, res: Response) => {
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

  app.post("/api/entries", isAuthenticated, enforceTrialExpiration, async (req: Request, res: Response) => {
    try {
      // Get the authenticated user's ID from the session
      const userId = (req.user as any).id;
      
      console.log("Creating journal entry with data:", req.body);
      console.log("User ID:", userId);
      
      // Ensure content is provided and not empty
      if (!req.body.content || req.body.content.trim() === '') {
        return res.status(400).json({ 
          message: "Journal entry content cannot be empty" 
        });
      }
      
      const data = insertJournalEntrySchema.parse({
        userId,
        content: req.body.content,
        title: req.body.title || null,
        moods: req.body.moods || [],
        date: req.body.date || new Date().toISOString(),
      });
      
      console.log("Parsed data:", data);
      
      const newEntry = await storage.createJournalEntry(data);
      
      // Generate AI response if content is provided
      if (newEntry.content) {
        try {
          // Check if OpenAI API key is valid
          const apiKey = process.env.OPENAI_API_KEY || '';
          if (apiKey.length < 10 || !apiKey.startsWith('sk-')) {
            console.log("Invalid or missing OpenAI API key, using fallback AI response for new entry");
            throw new Error("Invalid OpenAI API key format");
          }
          
          const aiResponse = await generateAIResponse(newEntry.content);
          await storage.updateJournalEntry(newEntry.id, { aiResponse });
          newEntry.aiResponse = aiResponse;
        } catch (aiError) {
          console.error("Error generating AI response:", aiError);
          
          // Generate a fallback response based on entry content
          const entryText = newEntry.content.toLowerCase();
          
          // Extract keywords for better contextual responses
          const stopWords = ['what', 'when', 'where', 'which', 'that', 'this', 'with', 'would', 'could', 'should', 'have', 'from', 'your', 'about', 'just', 'and', 'the', 'for', 'but'];
          const keywords = entryText.split(/\s+/).filter((word: string) => 
            word.length > 3 && !stopWords.includes(word)
          );
          
          // Create a contextual prefix if we have keywords
          let contextualPrefix = "";
          if (keywords.length > 0) {
            // Select 1-2 keywords to reference
            const selectedKeywords = keywords.length > 3 
              ? [keywords[0], keywords[Math.floor(keywords.length / 2)]] 
              : [keywords[0]];
            
            contextualPrefix = `I notice you mentioned ${selectedKeywords.join(' and ')}. `;
          }
          
          // Check for emotional cues
          const tiredWords = ['tired', 'exhausted', 'fatigue', 'weary', 'sleepy', 'sleep'];
          const anxiousWords = ['anxious', 'worry', 'stress', 'overwhelm', 'nervous', 'hard', 'difficult'];
          const sadWords = ['sad', 'down', 'depress', 'unhappy', 'blue', 'miserable'];
          const happyWords = ['happy', 'joy', 'excit', 'glad', 'great', 'good', 'positive'];
          
          let emotionalTone = '';
          
          if (tiredWords.some(word => entryText.includes(word))) {
            emotionalTone = 'It sounds like you might be feeling tired or drained. ';
          } else if (anxiousWords.some(word => entryText.includes(word))) {
            emotionalTone = 'I sense some anxiety or stress in your entry. ';
          } else if (sadWords.some(word => entryText.includes(word))) {
            emotionalTone = 'There seems to be a tone of sadness in your writing. ';
          } else if (happyWords.some(word => entryText.includes(word))) {
            emotionalTone = 'There\'s a positive energy in your entry today. ';
          }
          
          // Choose a fallback response
          const fallbackResponses = [
            `${contextualPrefix}${emotionalTone}Thank you for taking the time to journal today. Reflecting on your thoughts and feelings this way helps build self-awareness and emotional intelligence. What might help you address the situations you've described?`,
            
            `${contextualPrefix}${emotionalTone}I appreciate you sharing your experiences in this journal entry. Writing about your day is a powerful tool for processing emotions and gaining perspective. Is there a specific aspect of what you wrote that you'd like to explore further?`,
            
            `${contextualPrefix}${emotionalTone}Your journal entry shows thoughtful self-reflection. By recording your thoughts, you're creating valuable space between experience and reaction, which can lead to more intentional choices. What would be a small step toward addressing what you've written about?`,
            
            `${contextualPrefix}${emotionalTone}I notice the way you've articulated your experiences today. This kind of reflection helps build perspective and emotional resilience. What resources or support might help you navigate the situations you've described?`,
            
            `${contextualPrefix}${emotionalTone}Your journaling creates a record of your inner experience. Looking at what you've written, what patterns do you notice, and what might they tell you about your needs right now?`
          ];
          
          const randomIndex = Math.floor(Math.random() * fallbackResponses.length);
          const fallbackResponse = fallbackResponses[randomIndex];
          
          // Update the entry with the fallback response
          await storage.updateJournalEntry(newEntry.id, { aiResponse: fallbackResponse });
          newEntry.aiResponse = fallbackResponse;
        }
      }
      
      res.status(201).json(newEntry);
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid journal entry data", 
          errors: err.errors 
        });
      }
      
      console.error("Error creating entry:", err);
      res.status(500).json({ message: "Failed to create journal entry" });
    }
  });

  app.put("/api/entries/:id", isAuthenticated, enforceTrialExpiration, async (req: Request, res: Response) => {
    try {
      const entryId = parseInt(req.params.id);
      const entry = await storage.getJournalEntry(entryId);
      
      if (!entry) {
        return res.status(404).json({ message: "Journal entry not found" });
      }
      
      // Verify the entry belongs to the authenticated user
      const userId = (req.user as any).id;
      if (entry.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized to modify this entry" });
      }
      
      const data = updateJournalEntrySchema.parse(req.body);
      
      // If content was changed, regenerate AI response
      if (data.content && data.content !== entry.content) {
        try {
          // Check if OpenAI API key is valid
          const apiKey = process.env.OPENAI_API_KEY || '';
          if (apiKey.length < 10 || !apiKey.startsWith('sk-')) {
            console.log("Invalid or missing OpenAI API key, using fallback AI response for edit");
            throw new Error("Invalid OpenAI API key format");
          }
          
          const aiResponse = await generateAIResponse(data.content);
          data.aiResponse = aiResponse;
        } catch (aiError) {
          console.error("Error generating AI response:", aiError);
          
          // Generate a fallback response based on entry content
          const entryText = data.content.toLowerCase();
          
          // Extract keywords for better contextual responses
          const stopWords = ['what', 'when', 'where', 'which', 'that', 'this', 'with', 'would', 'could', 'should', 'have', 'from', 'your', 'about', 'just', 'and', 'the', 'for', 'but'];
          const keywords = entryText.split(/\s+/).filter((word: string) => 
            word.length > 3 && !stopWords.includes(word)
          );
          
          // Create a contextual prefix if we have keywords
          let contextualPrefix = "";
          if (keywords.length > 0) {
            // Select 1-2 keywords to reference
            const selectedKeywords = keywords.length > 3 
              ? [keywords[0], keywords[Math.floor(keywords.length / 2)]] 
              : [keywords[0]];
            
            contextualPrefix = `I notice you mentioned ${selectedKeywords.join(' and ')}. `;
          }
          
          // Check for emotional cues
          const tiredWords = ['tired', 'exhausted', 'fatigue', 'weary', 'sleepy', 'sleep'];
          const anxiousWords = ['anxious', 'worry', 'stress', 'overwhelm', 'nervous', 'hard', 'difficult'];
          const sadWords = ['sad', 'down', 'depress', 'unhappy', 'blue', 'miserable'];
          const happyWords = ['happy', 'joy', 'excit', 'glad', 'great', 'good', 'positive'];
          
          let emotionalTone = '';
          
          if (tiredWords.some(word => entryText.includes(word))) {
            emotionalTone = 'It sounds like you might be feeling tired or drained. ';
          } else if (anxiousWords.some(word => entryText.includes(word))) {
            emotionalTone = 'I sense some anxiety or stress in your entry. ';
          } else if (sadWords.some(word => entryText.includes(word))) {
            emotionalTone = 'There seems to be a tone of sadness in your writing. ';
          } else if (happyWords.some(word => entryText.includes(word))) {
            emotionalTone = 'There\'s a positive energy in your entry today. ';
          }
          
          // Choose a fallback response
          const fallbackResponses = [
            `${contextualPrefix}${emotionalTone}Thank you for updating your journal entry. Refining your thoughts this way shows a commitment to self-reflection and growth. What new insights emerged as you revised your thoughts?`,
            
            `${contextualPrefix}${emotionalTone}I see you've updated your journal entry. This iterative process of revisiting and refining your thoughts can reveal deeper patterns and perspectives. Has this revision process helped clarify anything for you?`,
            
            `${contextualPrefix}${emotionalTone}Your revised journal entry shows thoughtful engagement with your experiences. By returning to and developing your initial thoughts, you're creating a more nuanced understanding. What prompted these revisions?`,
            
            `${contextualPrefix}${emotionalTone}I appreciate how you've expanded on your thoughts in this updated entry. This kind of reflection helps develop emotional intelligence and self-awareness. What felt most important to add or change?`,
            
            `${contextualPrefix}${emotionalTone}Your updated journaling shows an evolving perspective. This process of revising and reconsidering is valuable for gaining clarity. How has your understanding shifted through this revision?`
          ];
          
          const randomIndex = Math.floor(Math.random() * fallbackResponses.length);
          const fallbackResponse = fallbackResponses[randomIndex];
          
          // Update with fallback response
          data.aiResponse = fallbackResponse;
        }
      }
      
      const updatedEntry = await storage.updateJournalEntry(entryId, data);
      res.json(updatedEntry);
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid journal entry data", 
          errors: err.errors 
        });
      }
      
      console.error("Error updating entry:", err);
      res.status(500).json({ message: "Failed to update journal entry" });
    }
  });
  
  // New endpoint to regenerate AI response for an existing entry
  app.post("/api/entries/:id/regenerate-ai", isAuthenticated, requiresSubscription('ai-journal-insights'), async (req: Request, res: Response) => {
    try {
      const entryId = parseInt(req.params.id);
      const entry = await storage.getJournalEntry(entryId);
      
      if (!entry) {
        return res.status(404).json({ message: "Journal entry not found" });
      }
      
      // Verify the entry belongs to the authenticated user
      const userId = (req.user as any).id;
      if (entry.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized to modify this entry" });
      }
      
      if (!entry.content) {
        return res.status(400).json({ message: "Entry has no content to analyze" });
      }
      
      try {
        // Get current OpenAI API key from environment (without revealing the full key)
        const apiKey = process.env.OPENAI_API_KEY || '';
        const keyPreview = apiKey.length > 8 ? 
          `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}` : 
          'Not found';
        
        console.log("Using OpenAI API key (preview):", keyPreview);
        console.log("API key starts with correct format (sk-):", apiKey.startsWith('sk-'));
        
        // Check if we can use the OpenAI API
        if (apiKey.length < 10 || !apiKey.startsWith('sk-')) {
          console.log("Invalid or missing OpenAI API key, using fallback AI response");
          throw new Error("Invalid OpenAI API key format");
        }
        
        // Generate AI response
        const aiResponse = await generateAIResponse(entry.content);
        
        // Update the entry with the new AI response
        const updatedEntry = await storage.updateJournalEntry(entryId, { aiResponse });
        
        res.json(updatedEntry);
      } catch (apiError) {
        // Generate a fallback response even if the OpenAI API call fails
        console.log("Generating fallback response due to API error");
        
        // Create contextual fallback responses based on entry content
        // Get keywords from the content to make response more relevant
        const entryText = entry.content.toLowerCase();
        
        // Extract keywords for better contextual responses
        const stopWords = ['what', 'when', 'where', 'which', 'that', 'this', 'with', 'would', 'could', 'should', 'have', 'from', 'your', 'about', 'just', 'and', 'the', 'for', 'but'];
        const keywords = entryText.split(/\s+/).filter((word: string) => 
          word.length > 3 && !stopWords.includes(word)
        );
        
        // Create a contextual prefix if we have keywords
        let contextualPrefix = "";
        if (keywords.length > 0) {
          // Select 1-2 keywords to reference
          const selectedKeywords = keywords.length > 3 
            ? [keywords[0], keywords[Math.floor(keywords.length / 2)]] 
            : [keywords[0]];
          
          contextualPrefix = `I notice you mentioned ${selectedKeywords.join(' and ')}. `;
        }
        
        // Check for emotional cues
        const tiredWords = ['tired', 'exhausted', 'fatigue', 'weary', 'sleepy', 'sleep'];
        const anxiousWords = ['anxious', 'worry', 'stress', 'overwhelm', 'nervous', 'hard', 'difficult'];
        const sadWords = ['sad', 'down', 'depress', 'unhappy', 'blue', 'miserable'];
        const happyWords = ['happy', 'joy', 'excit', 'glad', 'great', 'good', 'positive'];
        
        let emotionalTone = '';
        
        if (tiredWords.some(word => entryText.includes(word))) {
          emotionalTone = 'It sounds like you might be feeling tired or drained. ';
        } else if (anxiousWords.some(word => entryText.includes(word))) {
          emotionalTone = 'I sense some anxiety or stress in your entry. ';
        } else if (sadWords.some(word => entryText.includes(word))) {
          emotionalTone = 'There seems to be a tone of sadness in your writing. ';
        } else if (happyWords.some(word => entryText.includes(word))) {
          emotionalTone = 'There\'s a positive energy in your entry today. ';
        }
        
        // Create custom fallback responses with context awareness
        const fallbackResponses = [
          `${contextualPrefix}${emotionalTone}Thank you for taking the time to journal today. Reflecting on your thoughts and feelings this way helps build self-awareness and emotional intelligence. What might help you address the situations you've described?`,
          
          `${contextualPrefix}${emotionalTone}I appreciate you sharing your experiences in this journal entry. Writing about your day is a powerful tool for processing emotions and gaining perspective. Is there a specific aspect of what you wrote that you'd like to explore further?`,
          
          `${contextualPrefix}${emotionalTone}Your journal entry shows thoughtful self-reflection. By recording your thoughts, you're creating valuable space between experience and reaction, which can lead to more intentional choices. What would be a small step toward addressing what you've written about?`,
          
          `${contextualPrefix}${emotionalTone}I notice the way you've articulated your experiences today. This kind of reflection helps build perspective and emotional resilience. What resources or support might help you navigate the situations you've described?`,
          
          `${contextualPrefix}${emotionalTone}Your journaling creates a record of your inner experience. Looking at what you've written, what patterns do you notice, and what might they tell you about your needs right now?`
        ];
        
        // Get the current AI response
        const currentResponse = entry.aiResponse || "";
        
        // Find a new response that's different from the current one
        let newResponse = currentResponse;
        while (newResponse === currentResponse && fallbackResponses.length > 0) {
          const randomIndex = Math.floor(Math.random() * fallbackResponses.length);
          newResponse = fallbackResponses[randomIndex];
          
          // If we happen to select the same response, remove it and try again
          if (newResponse === currentResponse && fallbackResponses.length > 1) {
            fallbackResponses.splice(randomIndex, 1);
          } else {
            break;
          }
        }
        
        // Update with fallback response
        const updatedEntry = await storage.updateJournalEntry(entryId, { 
          aiResponse: newResponse 
        });
        
        res.json(updatedEntry);
      }
    } catch (err) {
      console.error("Error regenerating AI response:", err);
      res.status(500).json({ message: "Failed to regenerate AI response" });
    }
  });
  
  // Debug endpoint for environment variables (NEVER use in production)
  app.get("/api/debug/env-test", async (req: Request, res: Response) => {
    try {
      // Get OpenAI API key info (without revealing the full key)
      const apiKey = process.env.OPENAI_API_KEY || '';
      const keyPreview = apiKey.length > 8 ? 
        `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}` : 
        'Not found';
      
      res.json({
        openai_key_length: apiKey.length,
        openai_key_preview: keyPreview,
        openai_key_valid_format: apiKey.startsWith('sk-'),
        env_var_exists: Boolean(process.env.OPENAI_API_KEY)
      });
    } catch (error) {
      console.error("Error in env test endpoint:", error);
      res.status(500).json({ message: "Error testing environment variables" });
    }
  });

  app.delete("/api/entries/:id", isAuthenticated, enforceTrialExpiration, async (req: Request, res: Response) => {
    try {
      const entryId = parseInt(req.params.id);
      const entry = await storage.getJournalEntry(entryId);
      
      if (!entry) {
        return res.status(404).json({ message: "Journal entry not found" });
      }
      
      // Verify the entry belongs to the authenticated user
      const userId = (req.user as any).id;
      if (entry.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized to delete this entry" });
      }
      
      const success = await storage.deleteJournalEntry(entryId);
      
      if (!success) {
        return res.status(404).json({ message: "Journal entry not found" });
      }
      
      res.status(204).send();
    } catch (err) {
      console.error("Error deleting entry:", err);
      res.status(500).json({ message: "Failed to delete journal entry" });
    }
  });

  // Journal stats routes
  app.get("/api/stats", isAuthenticated, enforceTrialExpiration, async (req: Request, res: Response) => {
    try {
      // Get the authenticated user's ID from the session
      const userId = (req.user as any).id;
      
      const stats = await storage.getJournalStats(userId);
      
      if (!stats) {
        // Return default stats if none exist yet
        return res.json({
          userId,
          entriesCount: 0,
          currentStreak: 0,
          longestStreak: 0,
          topMoods: {},
          lastUpdated: new Date(),
        });
      }
      
      res.json(stats);
    } catch (err) {
      console.error("Error fetching stats:", err);
      res.status(500).json({ message: "Failed to fetch journal stats" });
    }
  });
  
  // Chatbot routes
  app.post("/api/chatbot/message", isAuthenticated, enforceTrialExpiration, async (req: Request, res: Response) => {
    try {
      const { messages, supportType, personalityType, customInstructions } = req.body;
      
      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ message: "Messages are required and must be an array" });
      }
      
      // Validate the format of messages
      const validMessages = messages.every((msg: any) => 
        typeof msg === 'object' && 
        (msg.role === 'user' || msg.role === 'assistant' || msg.role === 'system') && 
        typeof msg.content === 'string'
      );
      
      if (!validMessages) {
        return res.status(400).json({ 
          message: "Invalid message format. Each message must have 'role' (user, assistant, or system) and 'content' properties" 
        });
      }
      
      // Check if user can send messages based on their subscription
      const userId = (req.user as any).id;
      const { canSend, remaining } = await storage.canSendChatMessage(userId);
      
      if (!canSend) {
        return res.status(403).json({ 
          message: "Chat limit reached",
          error: "You have reached your weekly chat limit. Please upgrade to the Unlimited plan for unlimited chats.",
          remaining: 0
        });
      }
      
      // Check if supportType is valid
      const validSupportTypes = ['emotional', 'productivity', 'general', 'philosophy'];
      const validatedSupportType = validSupportTypes.includes(supportType) ? supportType : 'general';
      
      // Check if personalityType is a valid built-in type
      const validBuiltInTypes = ['default', 'socratic', 'stoic', 'existentialist', 'analytical', 'poetic', 'humorous', 'zen'];
      
      // If it's a built-in type, validate it, otherwise treat it as a custom personality ID
      let validatedPersonalityType = personalityType;
      let validatedCustomInstructions = undefined;
      
      if (validBuiltInTypes.includes(personalityType)) {
        // It's a built-in type
        validatedPersonalityType = personalityType;
      } else if (typeof personalityType === 'string' && personalityType.startsWith('custom_')) {
        // It's a custom personality ID
        validatedPersonalityType = personalityType;
        validatedCustomInstructions = customInstructions;
      } else {
        // Use default if invalid
        validatedPersonalityType = 'default';
      }
      
      try {
        // Check if OpenAI API key is valid
        const apiKey = process.env.OPENAI_API_KEY || '';
        if (apiKey.length < 10 || !apiKey.startsWith('sk-')) {
          console.log("Invalid or missing OpenAI API key, using fallback chat response");
          throw new Error("Invalid OpenAI API key format");
        }
        
        // Log privacy event for chat processing
        logPrivacyEvent("chatbot_request", userId, `Chatbot interaction (type: ${validatedSupportType}, personality: ${validatedPersonalityType})`);
        
        // Generate response using OpenAI with personality type and custom instructions
        // Note: The sanitizeContentForAI is already applied within the generateChatbotResponse function
        const aiResponse = await generateChatbotResponse(
          messages, 
          validatedSupportType, 
          validatedPersonalityType,
          validatedCustomInstructions
        );
        
        // Increment chat usage count for the user
        await storage.incrementChatUsage(userId);
        
        // Check if the AI response contains a question and schedule a check-in
        if (aiResponse.includes('?')) {
          try {
            // Schedule a check-in for 2-3 days later
            const checkInDate = new Date();
            checkInDate.setDate(checkInDate.getDate() + Math.floor(Math.random() * 2) + 2); // 2-3 days
            
            // Extract the last question from the response for the check-in
            const questions = aiResponse.split('?').filter(q => q.trim().length > 10);
            if (questions.length > 0) {
              const lastQuestion = questions[questions.length - 1].trim() + '?';
              
              await storage.createCheckIn({
                userId,
                type: validatedSupportType === 'philosophy' ? 'philosopher' : 'counselor',
                question: lastQuestion,
                originalDate: new Date(),
                scheduledDate: checkInDate
              });
            }
          } catch (checkInError) {
            console.error("Error creating check-in:", checkInError);
            // Don't fail the response if check-in creation fails
          }
        }
        
        // Get updated remaining chats
        const { remaining } = await storage.canSendChatMessage(userId);
        
        // Return response with remaining count
        res.json({
          role: "assistant",
          content: aiResponse,
          remaining: remaining
        });
      } catch (apiError: any) {
        // Check for rate limit or quota errors specifically
        if (apiError?.message && (
            apiError.message.includes("exceeded your current quota") || 
            apiError.message.includes("rate limit") || 
            apiError.message.includes("429") ||
            apiError?.status === 429)) {
          console.log("Using fallback chatbot response due to API rate limiting or quota issue");
        } else {
          console.log("Using fallback chatbot response due to API error");
        }
        
        // Get the user's last message to create a more contextual response
        const lastUserMessage = messages.filter(msg => msg.role === 'user').pop()?.content || '';
        const lowerUserMessage = lastUserMessage.toLowerCase();
        
        // Extract keywords for better contextual responses
        const stopWords = ['what', 'when', 'where', 'which', 'that', 'this', 'with', 'would', 'could', 'should', 'have', 'from', 'your', 'about'];
        const keywords = lowerUserMessage.split(/\s+/).filter((word: string) => 
          word.length > 3 && !stopWords.includes(word)
        );
        
        // Create a contextual response that refers to the user's message
        let contextualPrefix = "";
        
        if (keywords.length > 0) {
          // Select 1-2 keywords to reference
          const selectedKeywords = keywords.length > 3 
            ? [keywords[0], keywords[Math.floor(keywords.length / 2)]] 
            : [keywords[0]];
          
          contextualPrefix = `Regarding your thoughts on ${selectedKeywords.join(' and ')}, `;
        }
        
        // Create a set of different possible fallback responses based on personality
        let fallbackResponses: string[];
        
        // Check if this is a custom personality
        if (typeof validatedPersonalityType === 'string' && validatedPersonalityType.startsWith('custom_')) {
          // For custom personalities, provide a contextual fallback with a mention of custom instructions
          fallbackResponses = [
            `${contextualPrefix}I appreciate your perspective. Using your custom personality parameters, I would suggest exploring how these ideas connect to your daily experiences. What aspects of this topic resonate with you most?`,
            `${contextualPrefix}Your insights raise important considerations. From your custom philosophical framework, we might examine the underlying assumptions. How did you arrive at this particular viewpoint?`,
            `${contextualPrefix}What an intriguing perspective. Following your custom philosophical approach, I'd like to understand more about how you see these concepts relating to broader questions of meaning and purpose.`,
            `${contextualPrefix}I find your thoughts on this compelling. Based on your custom philosophical preferences, we might consider both the practical and theoretical implications. What further dimensions would you like to explore?`,
            `${contextualPrefix}This is a fascinating area to discuss. Your custom philosophical framework offers unique tools to analyze these ideas. Which aspects would you like to examine more deeply?`
          ];
        }
        else if (validatedPersonalityType === 'socratic') {
          fallbackResponses = [
            `${contextualPrefix}What are you truly seeking in this reflection? Have you considered examining the premises that led to these thoughts?`,
            `${contextualPrefix}If we were to investigate these ideas together, what definitions would we need to establish first?`,
            `${contextualPrefix}This is an interesting perspective. Before I offer my thoughts, what do you yourself believe about this matter?`,
            `${contextualPrefix}Your thoughts invite us to examine our assumptions. What knowledge do you already have that might help us explore this topic further?`,
            `${contextualPrefix}Rather than providing conclusions outright, perhaps we should break this down into smaller questions. What aspect puzzles you most?`
          ];
        } else if (validatedPersonalityType === 'stoic') {
          fallbackResponses = [
            `${contextualPrefix}Remember that we cannot control external events, only our responses to them. How might this perspective change your approach?`,
            `${contextualPrefix}Virtue is the only true good. How does your thoughts relate to developing courage, justice, temperance, or wisdom?`,
            `${contextualPrefix}Consider whether your concern lies within your circle of control or merely your circle of concern. Focus on what you can influence.`,
            `${contextualPrefix}A Stoic approach would be to accept what cannot be changed while taking virtuous action where possible. What actions are within your power?`,
            `${contextualPrefix}The obstacle is the way. Perhaps what you perceive as a challenge is actually an opportunity for growth and practicing virtue.`
          ];
        } else if (validatedPersonalityType === 'existentialist') {
          fallbackResponses = [
            `${contextualPrefix}We are condemned to be free, forced to choose, and responsible for our choices. How might this lens of radical freedom apply to your thoughts?`,
            `${contextualPrefix}In the face of life's inherent meaninglessness, we must create our own meaning. What meaning might you forge from these reflections?`,
            `${contextualPrefix}Authenticity requires confronting anxiety and embracing the absurd nature of existence. How might an authentic response to your perspective look?`,
            `${contextualPrefix}We define ourselves through our choices and actions, not through predetermined essences. How does this change your view of the situation?`,
            `${contextualPrefix}The only way to deal with an unfree world is to become so absolutely free that your very existence is an act of rebellion. What freedom can you exercise in response to these thoughts?`
          ];
        } else if (validatedPersonalityType === 'analytical') {
          fallbackResponses = [
            `${contextualPrefix}Let's examine this systematically. What are the core premises and logical connections in your thoughts?`,
            `${contextualPrefix}To analyze this properly, we should clarify definitions and distinguish between conceptual categories. What precise meaning do you assign to the key terms you've used?`,
            `${contextualPrefix}Your statement contains several components that warrant separate analysis. Let's break this down into distinct logical parts.`,
            `${contextualPrefix}From an analytical perspective, I'd suggest examining both the necessary and sufficient conditions for addressing the points you've raised.`,
            `${contextualPrefix}This topic can be approached through multiple frameworks. What specific methodological approach would you prefer for analyzing it?`
          ];
        } else if (validatedPersonalityType === 'poetic') {
          fallbackResponses = [
            `${contextualPrefix}Your thoughts bloom like flowers at dawn, petals of curiosity unfurling toward the light of understanding.`,
            `${contextualPrefix}We stand at the shoreline of your contemplation, waves of meaning washing over ancient stones of knowledge, each polished by time and reflection.`,
            `${contextualPrefix}In the garden of thought where your ideas grow, roots seeking depth while branches reach skyward, what hidden beauty might we discover together?`,
            `${contextualPrefix}Your words create a tapestry of wonder, threads of meaning interwoven with the patterns of human experience. What colors might we add to this living canvas?`,
            `${contextualPrefix}Like stars scattered across the night sky of reflection, your thoughts illuminate the darkness of unknowing, creating constellations of possibility.`
          ];
        } else if (validatedPersonalityType === 'humorous') {
          fallbackResponses = [
            `${contextualPrefix}That's quite the philosophical pickle you've placed on the plate of ponderings! If Plato and a platypus walked into a bar to discuss this, they'd probably order a round of thought experiments.`,
            `${contextualPrefix}Your thoughts are so deep I might need scuba gear to explore them properly! Nietzsche would probably say I'm in over my head, but Diogenes would just tell me to swim.`,
            `${contextualPrefix}If Descartes were here, he'd say 'I think about your message, therefore I am confused.' But that's just classic philosophical stand-up for you!`,
            `${contextualPrefix}Ah, the existential equivalent of asking 'does this toga make my philosophical outlook look big?' Socrates would be proud, though he'd probably follow up with twenty more questions.`,
            `${contextualPrefix}Your insights have more layers than Kant's categorical imperative wrapped in Hegel's dialectic with a side of Kierkegaard's existential angst! Mind if I take this philosophical buffet one bite at a time?`
          ];
        } else if (validatedPersonalityType === 'zen') {
          fallbackResponses = [
            `${contextualPrefix}The answer you seek may be found in silence rather than words. What emerges when you sit with these thoughts?`,
            `${contextualPrefix}Before thinking of mountain as mountain, water as water. What is the essence of your contemplation before concepts divide it?`,
            `${contextualPrefix}The finger pointing at the moon is not the moon. Let's look beyond the words to what they're indicating.`,
            `${contextualPrefix}Your message contains its own answer, if we approach it with a beginner's mind. What do you notice when you let go of expectations?`,
            `${contextualPrefix}Sometimes the most profound truths are found in the simplest observations. What simple truth might address these reflections?`
          ];
        } else {
          // Default personality
          fallbackResponses = [
            `${contextualPrefix}That's an interesting perspective. I'd like to explore this with you further. Could you share more about what aspects of this topic most interest you?`,
            `${contextualPrefix}I appreciate your thoughtful message. This is a fascinating area to discuss. Let me know if you'd like to explore this topic from a different perspective.`,
            `${contextualPrefix}Your thoughts deserve a carefully considered response. I'm here to engage with your ideas. Would you like to explore a related concept as well?`,
            `${contextualPrefix}I find your perspective fascinating. There are multiple ways to approach this. Perhaps we could consider it from a different angle?`,
            `${contextualPrefix}Thank you for sharing your thoughts. This gives us a lot to discuss. Is there a specific aspect of this topic you'd like to focus on first?`
          ];
        }
        
        // Choose a random fallback response
        const randomIndex = Math.floor(Math.random() * fallbackResponses.length);
        const fallbackResponse = fallbackResponses[randomIndex];
        
        // Increment chat usage count for the user
        await storage.incrementChatUsage(userId);
        
        // Check if the fallback response contains a question and schedule a check-in
        if (fallbackResponse.includes('?')) {
          try {
            // Schedule a check-in for 2-3 days later
            const checkInDate = new Date();
            checkInDate.setDate(checkInDate.getDate() + Math.floor(Math.random() * 2) + 2); // 2-3 days
            
            // Extract the last question from the response for the check-in
            const questions = fallbackResponse.split('?').filter(q => q.trim().length > 10);
            if (questions.length > 0) {
              const lastQuestion = questions[questions.length - 1].trim() + '?';
              
              await storage.createCheckIn({
                userId,
                type: validatedSupportType === 'philosophy' ? 'philosopher' : 'counselor',
                question: lastQuestion,
                originalDate: new Date(),
                scheduledDate: checkInDate
              });
            }
          } catch (checkInError) {
            console.error("Error creating check-in:", checkInError);
            // Don't fail the response if check-in creation fails
          }
        }
        
        // Get updated remaining chats
        const { remaining } = await storage.canSendChatMessage(userId);
        
        // Return the fallback response with remaining count
        res.json({
          role: "assistant",
          content: fallbackResponse,
          remaining: remaining
        });
      }
    } catch (err) {
      console.error("Error generating chatbot response:", err);
      res.status(500).json({ message: "Failed to generate chatbot response" });
    }
  });
  
  app.post("/api/chatbot/analyze", async (req: Request, res: Response) => {
    try {
      const { text } = req.body;
      
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ message: "Text is required and must be a string" });
      }
      
      // Sanitize content before analysis
      const sanitizedText = sanitizeContentForAI(text);
      
      // Log privacy event (without including the actual content)
      const userId = req.isAuthenticated() ? (req.user as any).id : 0;
      logPrivacyEvent("sentiment_analysis_request", userId, "Sentiment analysis requested");
      
      try {
        // Check if OpenAI API key is valid
        const apiKey = process.env.OPENAI_API_KEY || '';
        if (apiKey.length < 10 || !apiKey.startsWith('sk-')) {
          console.log("Invalid or missing OpenAI API key, using fallback sentiment analysis");
          throw new Error("Invalid OpenAI API key format");
        }
        
        // Analyze sentiment using OpenAI with sanitized text
        const analysis = await analyzeSentiment(sanitizedText);
        
        // Return analysis
        res.json(analysis);
      } catch (apiError: any) {
        // Check for rate limit or quota errors specifically
        if (apiError?.message && (
            apiError.message.includes("exceeded your current quota") || 
            apiError.message.includes("rate limit") || 
            apiError.message.includes("429") ||
            apiError?.status === 429)) {
          console.log("Using fallback sentiment analysis due to API rate limiting or quota issue");
        } else {
          console.log("Using fallback sentiment analysis due to API error");
        }
        
        // Generate a fallback sentiment analysis based on basic keyword detection
        const lowerText = text.toLowerCase();
        
        // Very basic sentiment analysis fallback
        const positiveWords = ['happy', 'joy', 'pleased', 'grateful', 'good', 'great', 'excellent', 'amazing', 'wonderful', 'love', 'like', 'enjoy'];
        const negativeWords = ['sad', 'unhappy', 'depressed', 'angry', 'upset', 'frustrated', 'annoyed', 'bad', 'terrible', 'hate', 'dislike', 'worry', 'anxious'];
        
        let positiveScore = 0;
        let negativeScore = 0;
        
        // Count positive and negative words
        positiveWords.forEach(word => {
          if (lowerText.includes(word)) positiveScore++;
        });
        
        negativeWords.forEach(word => {
          if (lowerText.includes(word)) negativeScore++;
        });
        
        // Generate a confidence score (0.5-0.8 range to acknowledge this is just a fallback)
        const confidence = 0.5 + (Math.abs(positiveScore - negativeScore) / (positiveScore + negativeScore + 1)) * 0.3;
        
        // Determine sentiment (1-5 scale)
        let rating = 3; // Neutral default
        
        if (positiveScore > negativeScore) {
          // More positive (4-5)
          rating = 4 + (positiveScore > negativeScore * 2 ? 1 : 0);
        } else if (negativeScore > positiveScore) {
          // More negative (1-2)
          rating = 2 - (negativeScore > positiveScore * 2 ? 1 : 0);
        }
        
        // Return the fallback analysis
        res.json({
          rating,
          confidence,
          moods: positiveScore > negativeScore 
            ? ['reflective', 'thoughtful', 'hopeful'] 
            : (negativeScore > positiveScore 
                ? ['concerned', 'thoughtful', 'searching'] 
                : ['neutral', 'thoughtful', 'contemplative'])
        });
      }
    } catch (err) {
      console.error("Error analyzing text:", err);
      res.status(500).json({ message: "Failed to analyze text" });
    }
  });

  // Goals API
  app.get("/api/goals", isAuthenticated, requiresSubscription('goal-tracking'), async (req: Request, res: Response) => {
    try {
      // In a real app, this would get the user ID from the authenticated session
      const userId = 1; // Demo user
      
      const goals = await storage.getGoalsByUserId(userId);
      res.json(goals);
    } catch (err) {
      console.error("Error fetching goals:", err);
      res.status(500).json({ message: "Failed to fetch goals" });
    }
  });

  app.get("/api/goals/summary", isAuthenticated, requiresSubscription('goal-tracking'), async (req: Request, res: Response) => {
    try {
      // In a real app, this would get the user ID from the authenticated session
      const userId = 1; // Demo user
      
      const summary = await storage.getGoalsSummary(userId);
      res.json(summary);
    } catch (err) {
      console.error("Error fetching goals summary:", err);
      res.status(500).json({ message: "Failed to fetch goals summary" });
    }
  });
  
  app.get("/api/goals/type/:type", async (req: Request, res: Response) => {
    try {
      // In a real app, this would get the user ID from the authenticated session
      const userId = 1; // Demo user
      const type = req.params.type;
      
      const goals = await storage.getGoalsByType(userId, type);
      res.json(goals);
    } catch (err) {
      console.error(`Error fetching goals by type '${req.params.type}':`, err);
      res.status(500).json({ message: "Failed to fetch goals by type" });
    }
  });
  
  app.get("/api/goals/parent/:parentId", async (req: Request, res: Response) => {
    try {
      const parentId = parseInt(req.params.parentId);
      
      const goals = await storage.getGoalsByParentId(parentId);
      res.json(goals);
    } catch (err) {
      console.error(`Error fetching goals with parent ID ${req.params.parentId}:`, err);
      res.status(500).json({ message: "Failed to fetch child goals" });
    }
  });
  
  app.get("/api/goals/:id", async (req: Request, res: Response) => {
    try {
      const goalId = parseInt(req.params.id);
      const goal = await storage.getGoal(goalId);
      
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      
      res.json(goal);
    } catch (err) {
      console.error("Error fetching goal:", err);
      res.status(500).json({ message: "Failed to fetch goal" });
    }
  });
  
  app.post("/api/goals", isAuthenticated, requiresSubscription('goal-tracking'), async (req: Request, res: Response) => {
    try {
      // In a real app, this would get the user ID from the authenticated session
      const userId = 1; // Demo user
      
      const data = insertGoalSchema.parse({
        ...req.body,
        userId,
      });
      
      const newGoal = await storage.createGoal(data);
      res.status(201).json(newGoal);
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid goal data", 
          errors: err.errors 
        });
      }
      
      console.error("Error creating goal:", err);
      res.status(500).json({ message: "Failed to create goal" });
    }
  });
  
  app.put("/api/goals/:id", isAuthenticated, requiresSubscription('goal-tracking'), async (req: Request, res: Response) => {
    try {
      const goalId = parseInt(req.params.id);
      const goal = await storage.getGoal(goalId);
      
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      
      const data = updateGoalSchema.parse(req.body);
      const updatedGoal = await storage.updateGoal(goalId, data);
      res.json(updatedGoal);
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid goal data", 
          errors: err.errors 
        });
      }
      
      console.error("Error updating goal:", err);
      res.status(500).json({ message: "Failed to update goal" });
    }
  });
  
  app.delete("/api/goals/:id", async (req: Request, res: Response) => {
    try {
      const goalId = parseInt(req.params.id);
      const success = await storage.deleteGoal(goalId);
      
      if (!success) {
        return res.status(404).json({ message: "Goal not found" });
      }
      
      res.status(204).send();
    } catch (err) {
      console.error("Error deleting goal:", err);
      res.status(500).json({ message: "Failed to delete goal" });
    }
  });
  
  // Goal Activities API
  app.get("/api/goals/:goalId/activities", async (req: Request, res: Response) => {
    try {
      const goalId = parseInt(req.params.goalId);
      const goal = await storage.getGoal(goalId);
      
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      
      const activities = await storage.getGoalActivitiesByGoalId(goalId);
      res.json(activities);
    } catch (err) {
      console.error("Error fetching goal activities:", err);
      res.status(500).json({ message: "Failed to fetch goal activities" });
    }
  });
  
  app.post("/api/goals/:goalId/activities", async (req: Request, res: Response) => {
    try {
      const goalId = parseInt(req.params.goalId);
      const goal = await storage.getGoal(goalId);
      
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      
      const data = insertGoalActivitySchema.parse({
        ...req.body,
        goalId,
      });
      
      const newActivity = await storage.createGoalActivity(data);
      res.status(201).json(newActivity);
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid goal activity data", 
          errors: err.errors 
        });
      }
      
      console.error("Error creating goal activity:", err);
      res.status(500).json({ message: "Failed to create goal activity" });
    }
  });
  
  app.put("/api/activities/:id", async (req: Request, res: Response) => {
    try {
      const activityId = parseInt(req.params.id);
      const activity = await storage.getGoalActivity(activityId);
      
      if (!activity) {
        return res.status(404).json({ message: "Activity not found" });
      }
      
      const data = updateGoalActivitySchema.parse(req.body);
      const updatedActivity = await storage.updateGoalActivity(activityId, data);
      res.json(updatedActivity);
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid goal activity data", 
          errors: err.errors 
        });
      }
      
      console.error("Error updating goal activity:", err);
      res.status(500).json({ message: "Failed to update goal activity" });
    }
  });
  
  app.delete("/api/activities/:id", async (req: Request, res: Response) => {
    try {
      const activityId = parseInt(req.params.id);
      const success = await storage.deleteGoalActivity(activityId);
      
      if (!success) {
        return res.status(404).json({ message: "Activity not found" });
      }
      
      res.status(204).send();
    } catch (err) {
      console.error("Error deleting goal activity:", err);
      res.status(500).json({ message: "Failed to delete goal activity" });
    }
  });
  
  // Get all activities for user across all goals
  app.get("/api/activities", async (req: Request, res: Response) => {
    try {
      // In a real app, this would get the user ID from the authenticated session
      const userId = 1; // Demo user
      
      // Get all goals for the user
      const goals = await storage.getGoalsByUserId(userId);
      
      // Get activities for each goal
      let allActivities: GoalActivity[] = [];
      for (const goal of goals) {
        const activities = await storage.getGoalActivitiesByGoalId(goal.id);
        allActivities = [...allActivities, ...activities];
      }
      
      res.json(allActivities);
    } catch (err) {
      console.error("Error fetching all activities:", err);
      res.status(500).json({ message: "Failed to fetch all activities" });
    }
  });





  // Endpoint to fetch available subscription plans
  // Endpoint to cancel subscription
  app.post("/api/subscription/cancel", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as Express.User;
      
      // If user has no active subscription, return error
      if (!user.hasActiveSubscription) {
        return res.status(400).json({ message: "No active subscription to cancel" });
      }
      
      // Simplified subscription cancellation - just update the user status
      console.log(`Canceling subscription for user ${user.id}`);
      
      // Update user record to reflect canceled subscription
      const updatedUser = await storage.updateUser(user.id, {
        hasActiveSubscription: false,
        subscriptionPlan: 'canceled',

      });
      
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update user record" });
      }
      
      // Update the user in the session
      req.login(updatedUser, (err) => {
        if (err) {
          console.error("Error updating session after subscription cancellation:", err);
          return res.status(500).json({ message: "Failed to update session" });
        }
        
        return res.status(200).json({ 
          message: "Subscription successfully canceled",
          user: {
            ...updatedUser,
            password: undefined // Don't send password back to client
          }
        });
      });
    } catch (error: any) {
      console.error("Error canceling subscription:", error);
      res.status(500).json({ message: "Error canceling subscription: " + error.message });
    }
  });

  app.get("/api/subscription-plans", async (req: Request, res: Response) => {
    try {
      // Monthly and annual prices
      const proMonthlyPrice = 14.99;
      const mvpMonthlyPrice = 24.99;
      
      const proAnnualPrice = 152.90;
      const mvpAnnualPrice = 254.90;
      
      // In a real app, you would fetch this from Stripe or your database
      const plans = [
        {
          id: "pro-monthly",
          name: "Pro",
          description: "Essential features for personal journaling",
          price: proMonthlyPrice,
          interval: "month",
          features: [
            "AI-powered journal insights",
            "Goal tracking with visualization",
            "Enhanced mood tracking",
            "Calendar integration",
            "✗ No AI personalities"
          ]
        },
        {
          id: "pro-annually",
          name: "Pro (Annually)",
          description: "Essential features with annual discount",
          price: proAnnualPrice,
          interval: "year",
          features: [
            "AI-powered journal insights",
            "Goal tracking with visualization",
            "Enhanced mood tracking",
            "Calendar integration",
            "✗ No AI personalities"
          ]
        },
        {
          id: "unlimited-monthly",
          name: "Unlimited",
          description: "Advanced features for power users",
          price: mvpMonthlyPrice,
          interval: "month",
          features: [
            "Everything in Pro plan",
            "Priority support",
            "Advanced analytics and reports",
            "Export in multiple formats",
            "Early access to new features"
          ]
        },
        {
          id: "unlimited-annually",
          name: "Unlimited (Annually)",
          description: "Advanced features with annual discount",
          price: mvpAnnualPrice,
          interval: "year",
          features: [
            "Everything in Pro plan",
            "Priority support",
            "Advanced analytics and reports",
            "Export in multiple formats",
            "Early access to new features"
          ]
        }
      ];
      
      res.json(plans);
    } catch (error: any) {
      console.error("Error fetching subscription plans:", error);
      res.status(500).json({ 
        message: "Error fetching subscription plans: " + error.message 
      });
    }
  });

  // Check-ins routes
  app.get("/api/check-ins", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const checkIns = await storage.getCheckInsByUserId(userId);
      res.json(checkIns);
    } catch (err) {
      console.error("Error fetching check-ins:", err);
      res.status(500).json({ message: "Failed to fetch check-ins" });
    }
  });

  app.get("/api/check-ins/pending", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const pendingCheckIns = await storage.getPendingCheckIns(userId);
      res.json(pendingCheckIns);
    } catch (err) {
      console.error("Error fetching pending check-ins:", err);
      res.status(500).json({ message: "Failed to fetch pending check-ins" });
    }
  });

  app.get("/api/check-ins/unresolved", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const unresolvedCheckIns = await storage.getUnresolvedCheckIns(userId);
      res.json(unresolvedCheckIns);
    } catch (err) {
      console.error("Error fetching unresolved check-ins:", err);
      res.status(500).json({ message: "Failed to fetch unresolved check-ins" });
    }
  });

  app.post("/api/check-ins/daily", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      
      // Check if user already has a daily check-in today
      const lastCheckInDate = await storage.getLastCheckInDate(userId);
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      if (lastCheckInDate && lastCheckInDate >= todayStart) {
        return res.status(400).json({ message: "You've already completed your daily check-in today" });
      }
      
      const checkIn = await storage.createDailyCheckIn(userId);
      res.status(201).json(checkIn);
    } catch (err) {
      console.error("Error creating daily check-in:", err);
      res.status(500).json({ message: "Failed to create daily check-in" });
    }
  });

  app.get("/api/check-ins/daily/status", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const lastCheckInDate = await storage.getLastCheckInDate(userId);
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      const hasCompletedToday = lastCheckInDate && lastCheckInDate >= todayStart;
      
      res.json({
        hasCompletedToday,
        lastCheckInDate,
        canCreateNew: !hasCompletedToday
      });
    } catch (err) {
      console.error("Error checking daily check-in status:", err);
      res.status(500).json({ message: "Failed to check daily check-in status" });
    }
  });

  app.post("/api/check-ins/:id/respond", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const checkInId = parseInt(req.params.id);
      const { response } = req.body;
      const userId = (req.user as any).id;

      if (!response || typeof response !== 'string') {
        return res.status(400).json({ message: "Response is required and must be a string" });
      }

      // Get the check-in to verify it belongs to the user
      const checkIn = await storage.getCheckInsByUserId(userId);
      const targetCheckIn = checkIn.find(ci => ci.id === checkInId);

      if (!targetCheckIn) {
        return res.status(404).json({ message: "Check-in not found" });
      }

      // Generate AI follow-up based on the type and response
      let aiFollowUp = "";
      let isResolved = false;
      let priority = targetCheckIn.priority;
      let tags = targetCheckIn.tags || [];

      try {
        if (targetCheckIn.type === 'counselor' || targetCheckIn.type === 'daily_checkin') {
          aiFollowUp = await generateCounselorResponse(`Follow-up to: "${targetCheckIn.question}". User responded: "${response}"`);
        } else if (targetCheckIn.type === 'philosopher') {
          aiFollowUp = await generatePhilosopherResponse(`Follow-up to: "${targetCheckIn.question}". User responded: "${response}"`);
        }

        // Simple analysis to determine if issue seems resolved
        const responseText = response.toLowerCase();
        const positiveResolutionWords = ['better', 'resolved', 'solved', 'good', 'fine', 'okay', 'great', 'improving', 'fixed'];
        const negativeWords = ['still', 'struggling', 'difficult', 'hard', 'worried', 'anxious', 'upset', 'problem'];
        
        const hasPositive = positiveResolutionWords.some(word => responseText.includes(word));
        const hasNegative = negativeWords.some(word => responseText.includes(word));
        
        // Mark as resolved if predominantly positive and no negative indicators
        isResolved = hasPositive && !hasNegative;
        
        // Adjust priority based on response content
        if (hasNegative && responseText.includes('urgent')) {
          priority = 'urgent';
        } else if (hasNegative) {
          priority = 'high';
        } else if (hasPositive) {
          priority = 'low';
        }

        // Add relevant tags
        if (responseText.includes('stress') || responseText.includes('anxiety')) {
          tags = [...new Set([...tags, 'stress', 'anxiety'])];
        }
        if (responseText.includes('relationship') || responseText.includes('family')) {
          tags = [...new Set([...tags, 'relationships'])];
        }
        if (responseText.includes('work') || responseText.includes('job')) {
          tags = [...new Set([...tags, 'work'])];
        }

      } catch (error) {
        console.error("Error generating AI follow-up:", error);
        aiFollowUp = "Thank you for sharing your thoughts. Your reflection on this topic shows thoughtful engagement with the question.";
      }

      // Update the check-in
      const updatedCheckIn = await storage.updateCheckIn(checkInId, {
        isAnswered: true,
        userResponse: response,
        aiFollowUp,
        isResolved,
        priority,
        tags
      });

      // If the issue is not resolved and is high priority, schedule a follow-up
      if (!isResolved && (priority === 'high' || priority === 'urgent')) {
        const followUpDate = new Date();
        followUpDate.setDate(followUpDate.getDate() + (priority === 'urgent' ? 1 : 3));
        
        try {
          await storage.createCheckIn({
            userId,
            type: 'follow_up',
            question: `Following up on our previous conversation about: "${targetCheckIn.question}". How are things going with this now?`,
            originalDate: new Date(),
            scheduledDate: followUpDate,
            priority: priority,
            tags: [...tags, 'follow_up'],
            relatedEntryId: targetCheckIn.relatedEntryId
          });
        } catch (error) {
          console.error("Error creating follow-up check-in:", error);
        }
      }

      res.json(updatedCheckIn);
    } catch (err) {
      console.error("Error responding to check-in:", err);
      res.status(500).json({ message: "Failed to respond to check-in" });
    }
  });

  // Challenge System Routes
  app.get("/api/challenges", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const challenges = await storage.getActiveChallenges();
      res.json(challenges);
    } catch (err) {
      console.error("Error fetching challenges:", err);
      res.status(500).json({ message: "Failed to fetch challenges" });
    }
  });

  app.get("/api/challenges/user", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const userChallenges = await storage.getUserActiveChallenges(userId);
      res.json(userChallenges);
    } catch (err) {
      console.error("Error fetching user challenges:", err);
      res.status(500).json({ message: "Failed to fetch user challenges" });
    }
  });

  app.get("/api/badges", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const badges = await storage.getUserBadges(userId);
      res.json(badges);
    } catch (err) {
      console.error("Error fetching user badges:", err);
      res.status(500).json({ message: "Failed to fetch user badges" });
    }
  });

  app.get("/api/challenges/stats", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const stats = await storage.getUserChallengeStats(userId);
      res.json(stats);
    } catch (err) {
      console.error("Error fetching challenge stats:", err);
      res.status(500).json({ message: "Failed to fetch challenge stats" });
    }
  });

  app.post("/api/challenges/:id/start", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const challengeId = parseInt(req.params.id);
      
      const userChallenge = await storage.startUserChallenge(userId, challengeId);
      res.json(userChallenge);
    } catch (err) {
      console.error("Error starting challenge:", err);
      res.status(500).json({ message: "Failed to start challenge" });
    }
  });

  app.post("/api/challenges/:id/progress", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const challengeId = parseInt(req.params.id);
      const { progress } = req.body;
      
      const updatedChallenge = await storage.updateUserChallengeProgress(userId, challengeId, progress);
      res.json(updatedChallenge);
    } catch (err) {
      console.error("Error updating challenge progress:", err);
      res.status(500).json({ message: "Failed to update challenge progress" });
    }
  });

  // Logo download endpoint
  app.get("/api/download/logo", async (req: Request, res: Response) => {
    try {
      const path = require('path');
      const fs = require('fs');
      
      // Use the main ReflectAI logo from attached assets
      const logoPath = path.join(__dirname, '../attached_assets/Reflect AI Logo.png');
      
      // Check if file exists
      if (!fs.existsSync(logoPath)) {
        return res.status(404).json({ message: "Logo file not found" });
      }
      
      // Set headers for download
      res.setHeader('Content-Disposition', 'attachment; filename="ReflectAI-Logo.png"');
      res.setHeader('Content-Type', 'image/png');
      
      // Stream the file
      const fileStream = fs.createReadStream(logoPath);
      fileStream.pipe(res);
      
    } catch (error) {
      console.error("Error serving logo download:", error);
      res.status(500).json({ message: "Failed to download logo" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}
