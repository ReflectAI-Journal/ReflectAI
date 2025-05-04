import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ZodError } from "zod";
import { 
  insertJournalEntrySchema, 
  updateJournalEntrySchema 
} from "@shared/schema";
import { generateAIResponse } from "./openai";

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

  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}
