import type { Express, Request, Response } from "express";
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
  GoalActivity
} from "@shared/schema";
import { generateAIResponse, generateChatbotResponse, ChatMessage, analyzeSentiment } from "./openai";

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Journal entries routes
  app.get("/api/entries", async (req: Request, res: Response) => {
    try {
      // In a real app, this would get the user ID from the authenticated session
      const userId = 1; // Demo user
      
      const entries = await storage.getJournalEntriesByUserId(userId);
      res.json(entries);
    } catch (err) {
      console.error("Error fetching entries:", err);
      res.status(500).json({ message: "Failed to fetch journal entries" });
    }
  });

  app.get("/api/entries/date/:year/:month/:day?", async (req: Request, res: Response) => {
    try {
      // In a real app, this would get the user ID from the authenticated session
      const userId = 1; // Demo user
      
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

  app.get("/api/entries/:id", async (req: Request, res: Response) => {
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

  app.post("/api/entries", async (req: Request, res: Response) => {
    try {
      // In a real app, this would get the user ID from the authenticated session
      const userId = 1; // Demo user
      
      const data = insertJournalEntrySchema.parse({
        ...req.body,
        userId,
      });
      
      const newEntry = await storage.createJournalEntry(data);
      
      // Generate AI response if content is provided
      if (newEntry.content) {
        try {
          const aiResponse = await generateAIResponse(newEntry.content);
          await storage.updateJournalEntry(newEntry.id, { aiResponse });
          newEntry.aiResponse = aiResponse;
        } catch (aiError) {
          console.error("Error generating AI response:", aiError);
          // Continue with the entry creation even if AI response fails
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

  app.put("/api/entries/:id", async (req: Request, res: Response) => {
    try {
      const entryId = parseInt(req.params.id);
      const entry = await storage.getJournalEntry(entryId);
      
      if (!entry) {
        return res.status(404).json({ message: "Journal entry not found" });
      }
      
      const data = updateJournalEntrySchema.parse(req.body);
      
      // If content was changed, regenerate AI response
      if (data.content && data.content !== entry.content) {
        try {
          const aiResponse = await generateAIResponse(data.content);
          data.aiResponse = aiResponse;
        } catch (aiError) {
          console.error("Error generating AI response:", aiError);
          // Continue with the update even if AI response fails
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
  app.post("/api/entries/:id/regenerate-ai", async (req: Request, res: Response) => {
    try {
      const entryId = parseInt(req.params.id);
      const entry = await storage.getJournalEntry(entryId);
      
      if (!entry) {
        return res.status(404).json({ message: "Journal entry not found" });
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
        
        // Create a set of different possible fallback responses
        const fallbackResponses = [
          "I've reflected on your journal entry and noticed your thoughtful observations about your experiences. Writing regularly like this helps build self-awareness and emotional intelligence. What patterns might emerge if you continue this practice daily?",
          
          "Thank you for sharing your thoughts in this journal entry. I noticed your reflections on your personal journey. Journaling is a powerful tool for self-discovery and growth. Have you considered how these reflections might shape your approach to future situations?",
          
          "Your journal entry shows a commitment to self-reflection. This practice of recording your thoughts creates valuable space between experience and reaction, helping you make more intentional choices. What aspects of today's entry were most meaningful to you?",
          
          "I've analyzed your journal entry and can see you're taking time to process your experiences. This kind of reflection helps build perspective and emotional resilience. What new insights have you gained from writing this entry?",
          
          "Your journaling practice is a valuable tool for personal growth. By documenting your thoughts and experiences, you're creating a map of your inner world. What surprised you most as you were writing this entry today?"
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

  app.delete("/api/entries/:id", async (req: Request, res: Response) => {
    try {
      const entryId = parseInt(req.params.id);
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
  app.get("/api/stats", async (req: Request, res: Response) => {
    try {
      // In a real app, this would get the user ID from the authenticated session
      const userId = 1; // Demo user
      
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
  app.post("/api/chatbot/message", async (req: Request, res: Response) => {
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
          throw new Error("Invalid OpenAI API key format");
        }
        
        // Generate response using OpenAI with personality type and custom instructions
        const aiResponse = await generateChatbotResponse(
          messages, 
          validatedSupportType, 
          validatedPersonalityType,
          validatedCustomInstructions
        );
        
        // Return response
        res.json({
          role: "assistant",
          content: aiResponse
        });
      } catch (apiError) {
        console.log("Using fallback chatbot response due to API error");
        
        // Create a set of different possible fallback responses based on personality
        let fallbackResponses: string[];
        
        // Check if this is a custom personality
        if (typeof validatedPersonalityType === 'string' && validatedPersonalityType.startsWith('custom_')) {
          // For custom personalities, provide a generic fallback with a note about custom instructions
          fallbackResponses = [
            "I appreciate your message. While I'm currently operating with limited connectivity to AI services, I would normally respond using your custom personality instructions. Is there a specific aspect of this topic you'd like to discuss?",
            "Thank you for your question. I'm designed to respond using your custom personality instructions, but I'm temporarily operating in offline mode. I'd be happy to continue our conversation with this limitation in mind.",
            "That's an interesting point. I'd normally process this with your custom personality settings, but I'm currently operating with reduced capabilities. What aspects of this topic are most important to you?",
            "I'd like to engage with your message using your custom personality instructions, but I'm temporarily in offline mode. Would you like to explore this topic from a different angle given this limitation?",
            "While I can't access the full AI capabilities needed for your custom personality at the moment, I'm still here to engage with your thoughts. How would you like to proceed with our conversation?"
          ];
        }
        else if (validatedPersonalityType === 'socratic') {
          fallbackResponses = [
            "What are you truly seeking in your question? Have you considered examining the premises that led you to ask this?",
            "If we were to investigate this question together, what definitions would we need to establish first?",
            "This is an interesting inquiry. Before I offer my thoughts, what do you yourself believe about this matter?",
            "Your question invites us to examine our assumptions. What knowledge do you already have that might help us explore this topic?",
            "Rather than providing an answer outright, perhaps we should break this down into smaller questions. What aspect puzzles you most?"
          ];
        } else if (validatedPersonalityType === 'stoic') {
          fallbackResponses = [
            "Remember that we cannot control external events, only our responses to them. How might this perspective change your approach?",
            "Virtue is the only true good. How does your question relate to developing courage, justice, temperance, or wisdom?",
            "Consider whether your concern lies within your circle of control or merely your circle of concern. Focus on what you can influence.",
            "A Stoic approach would be to accept what cannot be changed while taking virtuous action where possible. What actions are within your power?",
            "The obstacle is the way. Perhaps what you perceive as a challenge is actually an opportunity for growth and practicing virtue."
          ];
        } else if (validatedPersonalityType === 'existentialist') {
          fallbackResponses = [
            "We are condemned to be free, forced to choose, and responsible for our choices. How might this lens of radical freedom apply to your question?",
            "In the face of life's inherent meaninglessness, we must create our own meaning. What meaning might you forge from this situation?",
            "Authenticity requires confronting anxiety and embracing the absurd nature of existence. How might an authentic response to your question look?",
            "We define ourselves through our choices and actions, not through predetermined essences. How does this perspective change your view of the situation?",
            "The only way to deal with an unfree world is to become so absolutely free that your very existence is an act of rebellion. What freedom can you exercise here?"
          ];
        } else if (validatedPersonalityType === 'analytical') {
          fallbackResponses = [
            "Let's examine this systematically. What are the core premises and logical connections in this question?",
            "To analyze this properly, we should clarify definitions and distinguish between conceptual categories. What precise meaning do you assign to the key terms?",
            "Your question contains several components that warrant separate analysis. Let's break this down into distinct logical parts.",
            "From an analytical perspective, I'd suggest examining both the necessary and sufficient conditions for addressing this question.",
            "This inquiry can be approached through multiple frameworks. What specific methodological approach would you prefer for analyzing it?"
          ];
        } else if (validatedPersonalityType === 'poetic') {
          fallbackResponses = [
            "Your question blooms like a flower at dawn, petals of curiosity unfurling toward the light of understanding.",
            "We stand at the shoreline of your inquiry, waves of meaning washing over ancient stones of knowledge, each polished by time and reflection.",
            "In the garden of thought where your question grows, roots seeking depth while branches reach skyward, what hidden beauty might we discover?",
            "Your words create a tapestry of wonder, threads of meaning interwoven with the patterns of human experience. What colors might we add to this living canvas?",
            "Like stars scattered across the night sky of contemplation, your thoughts illuminate the darkness of unknowing, creating constellations of possibility."
          ];
        } else if (validatedPersonalityType === 'humorous') {
          fallbackResponses = [
            "That's quite the philosophical pickle you've placed on the plate of ponderings! If Plato and a platypus walked into a bar to discuss this, they'd probably order a round of thought experiments.",
            "Your question is so deep I might need scuba gear to explore it properly! Nietzsche would probably say I'm in over my head, but Diogenes would just tell me to swim.",
            "If Descartes were here, he'd say 'I think about your question, therefore I am confused.' But that's just classic philosophical stand-up for you!",
            "Ah, the existential equivalent of asking 'does this toga make my philosophical outlook look big?' Socrates would be proud, though he'd probably follow up with twenty more questions.",
            "Your inquiry has more layers than Kant's categorical imperative wrapped in Hegel's dialectic with a side of Kierkegaard's existential angst! Mind if I take this philosophical buffet one bite at a time?"
          ];
        } else if (validatedPersonalityType === 'zen') {
          fallbackResponses = [
            "The answer you seek may be found in silence rather than words. What emerges when you sit with this question?",
            "Before thinking of mountain as mountain, water as water. What is the essence of your question before concepts divide it?",
            "The finger pointing at the moon is not the moon. Let's look beyond the words to what they're indicating.",
            "Your question contains its own answer, if we approach it with a beginner's mind. What do you notice when you let go of expectations?",
            "Sometimes the most profound truths are found in the simplest observations. What simple truth might address your concern?"
          ];
        } else {
          // Default personality
          fallbackResponses = [
            "That's an interesting question. I'd normally connect to AI services to provide a thoughtful response, but I'm currently in offline mode. Could you rephrase your question or try a different topic?",
            "I appreciate your thoughtful inquiry. At the moment, I'm operating with limited connectivity to external AI systems. Let me know if you'd like to explore this topic in a different way.",
            "Your question deserves a carefully considered response. While I'm currently unable to access my full capabilities, I'm still here to engage with your thoughts. Would you like to explore a related idea instead?",
            "I find your question fascinating and would normally provide a detailed analysis, but I'm temporarily working in a reduced capacity. Perhaps we could approach this from a different angle?",
            "Thank you for sharing your thoughts. I'm currently operating in a limited mode without full access to AI capabilities. Is there a specific aspect of this topic you'd like me to address with the resources available to me?"
          ];
        }
        
        // Choose a random fallback response
        const randomIndex = Math.floor(Math.random() * fallbackResponses.length);
        const fallbackResponse = fallbackResponses[randomIndex];
        
        // Return the fallback response
        res.json({
          role: "assistant",
          content: fallbackResponse
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
      
      try {
        // Check if OpenAI API key is valid
        const apiKey = process.env.OPENAI_API_KEY || '';
        if (apiKey.length < 10 || !apiKey.startsWith('sk-')) {
          throw new Error("Invalid OpenAI API key format");
        }
        
        // Analyze sentiment using OpenAI
        const analysis = await analyzeSentiment(text);
        
        // Return analysis
        res.json(analysis);
      } catch (apiError) {
        console.log("Using fallback sentiment analysis due to API error");
        
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
  app.get("/api/goals", async (req: Request, res: Response) => {
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

  app.get("/api/goals/summary", async (req: Request, res: Response) => {
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
  
  app.post("/api/goals", async (req: Request, res: Response) => {
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
  
  app.put("/api/goals/:id", async (req: Request, res: Response) => {
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

  // Stripe payment routes
  app.post("/api/create-payment-intent", async (req: Request, res: Response) => {
    try {
      const { amount } = req.body;
      
      // Create a PaymentIntent with the order amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        // In a real app, you'd associate this with the user
        metadata: {
          userId: 1 // Demo user
        }
      });

      // Send the client secret to the client
      res.json({ 
        clientSecret: paymentIntent.client_secret 
      });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ 
        message: "Error creating payment intent: " + error.message 
      });
    }
  });

  // Endpoint to fetch available subscription plans
  app.get("/api/subscription-plans", async (req: Request, res: Response) => {
    try {
      // Calculate yearly prices with 15% discount
      const proMonthlyPrice = 9.99;
      const mvpMonthlyPrice = 17.99;
      const discount = 0.15; // 15% discount for yearly plans
      
      const proYearlyPrice = proMonthlyPrice * 12 * (1 - discount);
      const mvpYearlyPrice = mvpMonthlyPrice * 12 * (1 - discount);
      
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
            "Custom AI personalities",
            "Goal tracking with visualization",
            "Enhanced mood tracking"
          ]
        },
        {
          id: "pro-yearly",
          name: "Pro (Yearly)",
          description: "Essential features with 15% yearly discount",
          price: parseFloat(proYearlyPrice.toFixed(2)),
          interval: "year",
          features: [
            "AI-powered journal insights",
            "Custom AI personalities",
            "Goal tracking with visualization",
            "Enhanced mood tracking"
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
            "Unlimited AI interactions",
            "Priority support",
            "Advanced analytics and reports",
            "Export in multiple formats",
            "Early access to new features"
          ]
        },
        {
          id: "unlimited-yearly",
          name: "Unlimited (Yearly)",
          description: "Advanced features with 15% yearly discount",
          price: parseFloat(mvpYearlyPrice.toFixed(2)),
          interval: "year",
          features: [
            "Everything in Pro plan",
            "Unlimited AI interactions",
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

  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}
