import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ZodError } from "zod";
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
      const { messages, supportType } = req.body;
      
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
      const validSupportTypes = ['emotional', 'productivity', 'general'];
      const validatedSupportType = validSupportTypes.includes(supportType) ? supportType : 'general';
      
      // Generate response using OpenAI
      const aiResponse = await generateChatbotResponse(messages, validatedSupportType as any);
      
      // Return response
      res.json({
        role: "assistant",
        content: aiResponse
      });
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
      
      // Analyze sentiment using OpenAI
      const analysis = await analyzeSentiment(text);
      
      // Return analysis
      res.json(analysis);
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

  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}
