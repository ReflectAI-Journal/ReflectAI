var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  goalActivities: () => goalActivities,
  goalActivitiesRelations: () => goalActivitiesRelations,
  goalStatusEnum: () => goalStatusEnum,
  goalTypeEnum: () => goalTypeEnum,
  goals: () => goals,
  goalsRelations: () => goalsRelations,
  insertGoalActivitySchema: () => insertGoalActivitySchema,
  insertGoalSchema: () => insertGoalSchema,
  insertJournalEntrySchema: () => insertJournalEntrySchema,
  insertJournalStatsSchema: () => insertJournalStatsSchema,
  insertUserSchema: () => insertUserSchema,
  journalEntries: () => journalEntries,
  journalEntriesRelations: () => journalEntriesRelations,
  journalStats: () => journalStats,
  journalStatsRelations: () => journalStatsRelations,
  updateGoalActivitySchema: () => updateGoalActivitySchema,
  updateGoalSchema: () => updateGoalSchema,
  updateJournalEntrySchema: () => updateJournalEntrySchema,
  users: () => users,
  usersRelations: () => usersRelations
});
import { pgTable, text, serial, integer, boolean, timestamp, jsonb, date, real, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  // Subscription and trial fields
  trialStartedAt: timestamp("trial_started_at"),
  trialEndsAt: timestamp("trial_ends_at"),
  hasActiveSubscription: boolean("has_active_subscription").default(false),
  subscriptionPlan: text("subscription_plan").default("free"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id")
});
var usersRelations = relations(users, ({ many }) => ({
  journalEntries: many(journalEntries),
  journalStats: many(journalStats),
  goals: many(goals)
}));
var journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title"),
  content: text("content").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  moods: text("moods").array(),
  aiResponse: text("ai_response"),
  isFavorite: boolean("is_favorite").default(false)
});
var journalEntriesRelations = relations(journalEntries, ({ one }) => ({
  user: one(users, {
    fields: [journalEntries.userId],
    references: [users.id]
  })
}));
var journalStats = pgTable("journal_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  entriesCount: integer("entries_count").default(0),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  topMoods: jsonb("top_moods"),
  lastUpdated: timestamp("last_updated").defaultNow()
});
var journalStatsRelations = relations(journalStats, ({ one }) => ({
  user: one(users, {
    fields: [journalStats.userId],
    references: [users.id]
  })
}));
var goalTypeEnum = pgEnum("goal_type", [
  "life",
  "yearly",
  "monthly",
  "weekly",
  "daily"
]);
var goalStatusEnum = pgEnum("goal_status", [
  "not_started",
  "in_progress",
  "completed",
  "abandoned"
]);
var goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  type: goalTypeEnum("type").notNull(),
  status: goalStatusEnum("status").default("not_started"),
  targetDate: date("target_date"),
  completedDate: date("completed_date"),
  progress: real("progress").default(0),
  // 0-100 percentage
  parentGoalId: integer("parent_goal_id"),
  // For hierarchical goals (e.g., a weekly goal linked to a monthly goal)
  timeSpent: integer("time_spent").default(0),
  // Time spent in minutes
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var goalsRelations = relations(goals, ({ one, many }) => ({
  user: one(users, {
    fields: [goals.userId],
    references: [users.id]
  }),
  parent: one(goals, {
    fields: [goals.parentGoalId],
    references: [goals.id]
  }),
  children: many(goals),
  activities: many(goalActivities)
}));
var goalActivities = pgTable("goal_activities", {
  id: serial("id").primaryKey(),
  goalId: integer("goal_id").notNull().references(() => goals.id),
  date: date("date").notNull().defaultNow(),
  minutesSpent: integer("minutes_spent").default(0),
  description: text("description"),
  progressIncrement: real("progress_increment").default(0)
  // How much this activity contributed to the goal progress
});
var goalActivitiesRelations = relations(goalActivities, ({ one }) => ({
  goal: one(goals, {
    fields: [goalActivities.goalId],
    references: [goals.id]
  })
}));
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var insertJournalEntrySchema = createInsertSchema(journalEntries).pick({
  userId: true,
  title: true,
  content: true,
  moods: true
}).extend({
  date: z.string().optional()
});
var updateJournalEntrySchema = createInsertSchema(journalEntries).pick({
  title: true,
  content: true,
  moods: true,
  aiResponse: true,
  isFavorite: true
}).partial();
var insertJournalStatsSchema = createInsertSchema(journalStats).pick({
  userId: true,
  entriesCount: true,
  currentStreak: true,
  longestStreak: true,
  topMoods: true
});
var insertGoalSchema = createInsertSchema(goals).pick({
  userId: true,
  title: true,
  description: true,
  type: true,
  status: true,
  targetDate: true,
  parentGoalId: true
}).extend({
  targetDate: z.string().optional()
});
var updateGoalSchema = createInsertSchema(goals).pick({
  title: true,
  description: true,
  status: true,
  progress: true,
  targetDate: true,
  completedDate: true,
  timeSpent: true
}).partial();
var insertGoalActivitySchema = createInsertSchema(goalActivities).pick({
  goalId: true,
  date: true,
  minutesSpent: true,
  description: true,
  progressIncrement: true
}).extend({
  date: z.string().optional()
});
var updateGoalActivitySchema = createInsertSchema(goalActivities).pick({
  minutesSpent: true,
  description: true,
  progressIncrement: true
}).partial();

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq, and, desc, gte, lte } from "drizzle-orm";
var DatabaseStorage = class {
  // User methods
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    await this.updateJournalStats(user.id, {
      entriesCount: 0,
      currentStreak: 0,
      longestStreak: 0,
      topMoods: {}
    });
    return user;
  }
  // Journal entry methods
  async getJournalEntry(id) {
    const [entry] = await db.select().from(journalEntries).where(eq(journalEntries.id, id));
    return entry;
  }
  async getJournalEntriesByUserId(userId) {
    return await db.select().from(journalEntries).where(eq(journalEntries.userId, userId)).orderBy(desc(journalEntries.date));
  }
  async getJournalEntriesByDate(userId, year, month, day) {
    const startDate = new Date(year, month - 1, day || 1);
    let endDate;
    if (day) {
      endDate = new Date(year, month - 1, day, 23, 59, 59, 999);
    } else {
      endDate = new Date(year, month, 0, 23, 59, 59, 999);
    }
    return await db.select().from(journalEntries).where(
      and(
        eq(journalEntries.userId, userId),
        // Use gte and lte for date comparison
        gte(journalEntries.date, startDate),
        lte(journalEntries.date, endDate)
      )
    ).orderBy(desc(journalEntries.date));
  }
  async createJournalEntry(entry) {
    const [newEntry] = await db.insert(journalEntries).values({
      ...entry,
      date: entry.date ? new Date(entry.date) : /* @__PURE__ */ new Date()
    }).returning();
    await this.updateStatsAfterNewEntry(newEntry.userId, newEntry);
    return newEntry;
  }
  async updateJournalEntry(id, data) {
    const [updatedEntry] = await db.update(journalEntries).set(data).where(eq(journalEntries.id, id)).returning();
    return updatedEntry;
  }
  async deleteJournalEntry(id) {
    const [deletedEntry] = await db.delete(journalEntries).where(eq(journalEntries.id, id)).returning();
    return !!deletedEntry;
  }
  // Journal stats methods
  async getJournalStats(userId) {
    const [stats] = await db.select().from(journalStats).where(eq(journalStats.userId, userId));
    return stats;
  }
  async updateJournalStats(userId, stats) {
    let existingStats = await this.getJournalStats(userId);
    if (!existingStats) {
      const [newStats] = await db.insert(journalStats).values({
        userId,
        entriesCount: stats.entriesCount || 0,
        currentStreak: stats.currentStreak || 0,
        longestStreak: stats.longestStreak || 0,
        topMoods: stats.topMoods || {},
        lastUpdated: /* @__PURE__ */ new Date()
      }).returning();
      return newStats;
    } else {
      const [updatedStats] = await db.update(journalStats).set({
        ...stats,
        lastUpdated: /* @__PURE__ */ new Date()
      }).where(eq(journalStats.userId, userId)).returning();
      return updatedStats;
    }
  }
  // Goals methods
  async getGoal(id) {
    const [goal] = await db.select().from(goals).where(eq(goals.id, id));
    return goal;
  }
  async getGoalsByUserId(userId) {
    return await db.select().from(goals).where(eq(goals.userId, userId)).orderBy(desc(goals.createdAt));
  }
  async getGoalsByType(userId, type) {
    return await db.select().from(goals).where(
      and(
        eq(goals.userId, userId),
        eq(goals.type, type)
        // Type cast to handle enum
      )
    ).orderBy(desc(goals.createdAt));
  }
  async getGoalsByParentId(parentId) {
    return await db.select().from(goals).where(eq(goals.parentGoalId, parentId)).orderBy(desc(goals.createdAt));
  }
  async createGoal(goal) {
    const insertData = {
      userId: goal.userId,
      title: goal.title,
      type: goal.type,
      description: goal.description || null,
      status: goal.status || "not_started",
      parentGoalId: goal.parentGoalId || null,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    if (goal.targetDate) {
      insertData.targetDate = new Date(goal.targetDate);
    }
    const [newGoal] = await db.insert(goals).values(insertData).returning();
    return newGoal;
  }
  async updateGoal(id, data) {
    const updateData = {
      updatedAt: /* @__PURE__ */ new Date()
    };
    if (data.title !== void 0) updateData.title = data.title;
    if (data.description !== void 0) updateData.description = data.description;
    if (data.type !== void 0) updateData.type = data.type;
    if (data.status !== void 0) updateData.status = data.status;
    if (data.progress !== void 0) updateData.progress = data.progress;
    if (data.parentGoalId !== void 0) updateData.parentGoalId = data.parentGoalId;
    if (data.timeSpent !== void 0) updateData.timeSpent = data.timeSpent;
    if (data.targetDate) {
      updateData.targetDate = new Date(data.targetDate);
    }
    if (data.completedDate) {
      updateData.completedDate = new Date(data.completedDate);
    } else if (data.completedDate === null) {
      updateData.completedDate = null;
    }
    const [updatedGoal] = await db.update(goals).set(updateData).where(eq(goals.id, id)).returning();
    return updatedGoal;
  }
  async deleteGoal(id) {
    const childGoals = await this.getGoalsByParentId(id);
    for (const childGoal of childGoals) {
      await this.deleteGoal(childGoal.id);
    }
    await db.delete(goalActivities).where(eq(goalActivities.goalId, id));
    const [deletedGoal] = await db.delete(goals).where(eq(goals.id, id)).returning();
    return !!deletedGoal;
  }
  // Goal Activities methods
  async getGoalActivity(id) {
    const [activity] = await db.select().from(goalActivities).where(eq(goalActivities.id, id));
    return activity;
  }
  async getGoalActivitiesByGoalId(goalId) {
    return await db.select().from(goalActivities).where(eq(goalActivities.goalId, goalId)).orderBy(desc(goalActivities.date));
  }
  async createGoalActivity(activity) {
    const insertData = {
      goalId: activity.goalId,
      description: activity.description || null,
      minutesSpent: activity.minutesSpent || 0,
      progressIncrement: activity.progressIncrement || 0
    };
    if (activity.date) {
      insertData.date = new Date(activity.date);
    } else {
      insertData.date = /* @__PURE__ */ new Date();
    }
    const [newActivity] = await db.insert(goalActivities).values(insertData).returning();
    const goal = await this.getGoal(newActivity.goalId);
    if (goal) {
      const allActivities = await this.getGoalActivitiesByGoalId(goal.id);
      const totalMinutesSpent = allActivities.reduce((total, a) => total + (a.minutesSpent || 0), 0);
      let progress = goal.progress || 0;
      if (newActivity.progressIncrement) {
        progress = Math.min(100, progress + newActivity.progressIncrement);
      }
      const updateData = {
        timeSpent: totalMinutesSpent,
        progress
      };
      if (progress >= 100) {
        updateData.status = "completed";
        updateData.completedDate = /* @__PURE__ */ new Date();
      }
      await this.updateGoal(goal.id, updateData);
    }
    return newActivity;
  }
  async updateGoalActivity(id, data) {
    const [updatedActivity] = await db.update(goalActivities).set(data).where(eq(goalActivities.id, id)).returning();
    if (updatedActivity) {
      const goal = await this.getGoal(updatedActivity.goalId);
      if (goal) {
        const allActivities = await this.getGoalActivitiesByGoalId(goal.id);
        const totalMinutesSpent = allActivities.reduce((total, a) => total + (a.minutesSpent || 0), 0);
        const totalProgress = allActivities.reduce((total, a) => total + (a.progressIncrement || 0), 0);
        const progress = Math.min(100, totalProgress);
        await this.updateGoal(goal.id, {
          timeSpent: totalMinutesSpent,
          progress,
          // If progress is 100%, mark as completed
          ...progress >= 100 ? {
            status: "completed",
            completedDate: /* @__PURE__ */ new Date()
          } : {}
        });
      }
    }
    return updatedActivity;
  }
  async deleteGoalActivity(id) {
    const activity = await this.getGoalActivity(id);
    if (!activity) return false;
    const [deletedActivity] = await db.delete(goalActivities).where(eq(goalActivities.id, id)).returning();
    if (deletedActivity) {
      const goal = await this.getGoal(deletedActivity.goalId);
      if (goal) {
        const allActivities = await this.getGoalActivitiesByGoalId(goal.id);
        const totalMinutesSpent = allActivities.reduce((total, a) => total + (a.minutesSpent || 0), 0);
        const totalProgress = allActivities.reduce((total, a) => total + (a.progressIncrement || 0), 0);
        const progress = Math.min(100, totalProgress);
        await this.updateGoal(goal.id, {
          timeSpent: totalMinutesSpent,
          progress,
          // If we were completed but now aren't, change status back to in progress
          ...goal.status === "completed" && progress < 100 ? {
            status: "in_progress",
            completedDate: null
          } : {}
        });
      }
    }
    return !!deletedActivity;
  }
  // Goals Summary & Analytics
  async getGoalsSummary(userId) {
    const userGoals = await this.getGoalsByUserId(userId);
    const total = userGoals.length;
    const completed = userGoals.filter((g) => g.status === "completed").length;
    const inProgress = userGoals.filter((g) => g.status === "in_progress").length;
    const timeSpent = userGoals.reduce((total2, g) => total2 + (g.timeSpent || 0), 0);
    const byType = {};
    for (const goal of userGoals) {
      byType[goal.type] = (byType[goal.type] || 0) + 1;
    }
    return {
      total,
      completed,
      inProgress,
      timeSpent,
      byType
    };
  }
  // Helper methods
  async updateStatsAfterNewEntry(userId, entry) {
    const userEntries = await this.getJournalEntriesByUserId(userId);
    let stats = await this.getJournalStats(userId);
    if (!stats) {
      stats = {
        id: 0,
        // This will be set by the database
        userId,
        entriesCount: 0,
        currentStreak: 0,
        longestStreak: 0,
        topMoods: {},
        lastUpdated: /* @__PURE__ */ new Date()
      };
    }
    const entriesCount = userEntries.length;
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const entryDate = new Date(entry.date);
    entryDate.setHours(0, 0, 0, 0);
    const hasYesterdayEntry = userEntries.some((e) => {
      const date2 = new Date(e.date);
      date2.setHours(0, 0, 0, 0);
      return date2.getTime() === yesterday.getTime();
    });
    let currentStreak = stats.currentStreak || 0;
    if (entryDate.getTime() === today.getTime()) {
      if (hasYesterdayEntry || currentStreak > 0) {
        currentStreak += 1;
      } else {
        currentStreak = 1;
      }
    }
    let longestStreak = stats.longestStreak || 0;
    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }
    let topMoods = stats.topMoods || {};
    if (entry.moods && entry.moods.length > 0) {
      if (!topMoods) {
        topMoods = {};
      }
      entry.moods.forEach((mood) => {
        topMoods[mood] = (topMoods[mood] || 0) + 1;
      });
    }
    await this.updateJournalStats(userId, {
      entriesCount,
      currentStreak,
      longestStreak,
      topMoods
    });
  }
};
async function createDefaultUser() {
  const storage2 = new DatabaseStorage();
  const existingUser = await storage2.getUserByUsername("demo");
  if (!existingUser) {
    await storage2.createUser({ username: "demo", password: "demo" });
    console.log("Created default demo user");
  }
}
createDefaultUser().catch(console.error);
var storage = new DatabaseStorage();

// server/routes.ts
import { ZodError } from "zod";
import Stripe from "stripe";

// server/openai-adapter.ts
import OpenAI from "openai";
var apiKey = process.env.OPENAI_API_KEY || "";
var openai = new OpenAI({
  apiKey
});
var openai_adapter_default = openai;

// server/openai.ts
var MODEL = "gpt-4o";
var maskedKey = apiKey.length > 8 ? `${apiKey.substring(0, 5)}${"*".repeat(apiKey.length - 8)}${apiKey.substring(apiKey.length - 3)}` : "(not set)";
console.log(`Using OpenAI API key (preview): ${maskedKey}`);
if (apiKey.length > 10) {
  console.log(`API key starts with correct format (sk-): ${apiKey.startsWith("sk-")}`);
  if (!apiKey.startsWith("sk-")) {
    console.warn("\u26A0\uFE0F WARNING: API key format is incorrect. OpenAI API keys should start with 'sk-'");
    console.warn("This will likely cause API calls to fail. Please check your OPENAI_API_KEY environment variable.");
  }
} else {
  console.error("\u274C OPENAI_API_KEY is not set or too short");
}
async function generateAIResponse(journalContent) {
  try {
    const prompt = `
      You are an empathetic and insightful AI companion for a journaling app. 
      The user has shared their journal entry with you. Please analyze their entry 
      and provide a thoughtful, helpful response. Your response should:
      
      1. Acknowledge their feelings and experiences
      2. Identify patterns or themes in their writing
      3. Offer gentle insights that might help them reflect further
      4. Provide constructive and supportive advice when appropriate
      5. Ask a thoughtful question to encourage further reflection
      
      Be conversational, warm, and kind. Avoid being preachy or prescriptive.
      Limit your response to about 3-4 paragraphs maximum.
      
      Here is their journal entry:
      
      ${journalContent}
    `;
    const response = await openai_adapter_default.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: "You are an empathetic and insightful AI companion for a journaling app. Your purpose is to provide thoughtful reflections and gentle advice."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    });
    return response.choices[0].message.content || "I couldn't generate a response at this time. Please try again later.";
  } catch (error) {
    console.error("Error generating AI response:", error);
    return generateFallbackResponse(journalContent);
  }
}
function generateFallbackResponse(journalContent) {
  const lowerContent = journalContent.toLowerCase();
  let sentiment = "neutral";
  const positiveWords = ["happy", "glad", "excited", "joy", "good", "great", "wonderful", "amazing", "awesome", "love", "enjoy", "pleased", "proud", "hopeful", "grateful", "thankful", "blessed", "accomplished", "relaxed", "peaceful", "content"];
  const negativeWords = ["sad", "angry", "upset", "frustrated", "mad", "worried", "anxious", "stressed", "tired", "exhausted", "overwhelmed", "disappointed", "hurt", "afraid", "scared", "lonely", "confused", "annoyed", "pain", "difficult", "struggling", "problem"];
  let positiveScore = 0;
  let negativeScore = 0;
  positiveWords.forEach((word) => {
    if (lowerContent.includes(word)) positiveScore += 1;
    if (lowerContent.includes(`very ${word}`) || lowerContent.includes(`really ${word}`)) positiveScore += 0.5;
  });
  negativeWords.forEach((word) => {
    if (lowerContent.includes(word)) negativeScore += 1;
    if (lowerContent.includes(`very ${word}`) || lowerContent.includes(`really ${word}`)) negativeScore += 0.5;
  });
  if (positiveScore > negativeScore + 1) {
    sentiment = "positive";
  } else if (negativeScore > positiveScore + 1) {
    sentiment = "negative";
  }
  const topics = {
    work: ["work", "job", "career", "meeting", "boss", "colleague", "project", "deadline", "task", "office", "promotion", "professional"],
    relationships: ["friend", "family", "partner", "relationship", "wife", "husband", "girlfriend", "boyfriend", "spouse", "parent", "child", "date", "love", "connection", "social"],
    health: ["health", "sick", "illness", "doctor", "exercise", "workout", "gym", "diet", "eating", "sleep", "tired", "energy", "wellness", "meditation", "rest"],
    goals: ["goal", "plan", "future", "dream", "aspiration", "achievement", "success", "progress", "milestone", "ambition", "resolution", "habit"],
    challenges: ["challenge", "problem", "obstacle", "difficulty", "struggle", "overcome", "hard", "tough", "setback", "issue", "conflict", "stress", "worry", "concern"],
    learning: ["learn", "study", "course", "book", "read", "knowledge", "skill", "practice", "improve", "grow", "development", "progress", "education", "training"],
    creativity: ["create", "art", "music", "paint", "write", "draw", "design", "creative", "idea", "inspiration", "express", "passion", "hobby", "project"]
  };
  const detectedTopics = [];
  Object.entries(topics).forEach(([topic, keywords]) => {
    if (keywords.some((keyword) => lowerContent.includes(keyword))) {
      detectedTopics.push(topic);
    }
  });
  const timeOrientation = lowerContent.includes("future") || lowerContent.includes("plan") || lowerContent.includes("will") || lowerContent.includes("going to") ? "future-focused" : lowerContent.includes("past") || lowerContent.includes("yesterday") || lowerContent.includes("used to") || lowerContent.includes("remember") ? "past-focused" : "present-focused";
  let response = "";
  if (sentiment === "positive") {
    response += "I'm glad to see your positive energy in this journal entry. It's wonderful that you're taking time to reflect on your experiences and notice the good things in your life. These moments of gratitude help build resilience and joy.";
  } else if (sentiment === "negative") {
    response += "I notice you're expressing some challenging emotions in your entry. It's completely valid to feel this way, and writing about it is a healthy outlet. Acknowledging difficult feelings is an important step in processing them and finding your path forward.";
  } else {
    response += "Thank you for sharing your thoughts in your journal today. Taking time to reflect like this is an important practice for self-awareness and growth. Your observations create space for deeper understanding of yourself and your experiences.";
  }
  if (detectedTopics.length > 0) {
    const primaryTopic = detectedTopics[0];
    switch (primaryTopic) {
      case "work":
        response += "\n\nI noticed your thoughts about work-related experiences. Finding balance between professional responsibilities and personal wellbeing can be challenging in today's connected world. Consider setting clear boundaries and taking short mindful breaks throughout your day. Even five minutes of conscious breathing can reset your perspective and enhance your focus.";
        break;
      case "relationships":
        response += "\n\nRelationships seem to be on your mind today. Our connections with others often mirror aspects of ourselves that we might not otherwise notice. Each interaction offers a window into both your values and needs as well as those of others. Taking time to reflect on what certain relationships bring up for you can offer valuable insights into your patterns and growth opportunities.";
        break;
      case "health":
        response += "\n\nI see health and wellbeing themes in your writing. Your physical and mental health form the foundation for everything else in life. Small, consistent actions often create more sustainable change than dramatic efforts. Consider what one small health-supporting habit you might build into your routine that would feel genuinely nourishing rather than obligatory.";
        break;
      case "goals":
        response += "\n\nYour focus on goals and aspirations shows a forward-thinking mindset. Remember that meaningful progress isn't always linear, and setbacks are a natural part of any worthwhile journey. Breaking larger goals into smaller, manageable steps can help maintain momentum and give you opportunities to celebrate the small wins along the way.";
        break;
      case "challenges":
        response += "\n\nI notice you're facing some challenges right now. Difficult periods, while uncomfortable, often contain the seeds of significant personal growth. Sometimes reframing obstacles as opportunities for developing new strengths can shift your perspective. What capabilities might you be building through this challenge that could serve you well in the future?";
        break;
      case "learning":
        response += "\n\nYour interest in learning and growth comes through in your writing. The pursuit of knowledge is a lifelong journey that enriches our experience and expands our perspective. Remember that learning happens not just through formal education but through curiosity, experience, and reflection \u2013 exactly what you're doing with this journal practice.";
        break;
      case "creativity":
        response += "\n\nI see creativity flowing through your journal entry. Creative expression connects us with our authentic selves and provides an outlet for processing our experiences in unique ways. Whether through art, writing, music, or simply creative thinking, these practices nourish parts of ourselves that logical thinking alone cannot reach.";
        break;
      default:
        response += "\n\nReflection like this helps build self-awareness over time. By noticing patterns in your thoughts, feelings, and experiences, you develop a deeper understanding of what truly matters to you and what might need more attention in your daily life. Your journal becomes a map of your inner landscape.";
    }
  } else {
    response += "\n\nTaking time to record your thoughts creates valuable space between experience and reaction. This practice of reflection helps you recognize patterns, process emotions, and make more intentional choices. Over time, your journal becomes a record of your journey that you can look back on to see how far you've come.";
  }
  if (timeOrientation === "future-focused") {
    response += "\n\nAs you look toward the future, consider: What small step could you take today that aligns with your vision for tomorrow? Sometimes the smallest actions create the most meaningful momentum when they're consistently applied.";
  } else if (timeOrientation === "past-focused") {
    response += "\n\nReflecting on past experiences, what wisdom have you gathered that might serve you right now? Our histories contain valuable lessons that can illuminate our present choices when we approach them with curiosity rather than judgment.";
  } else {
    response += "\n\nAs you continue your day, what would help you feel more present and engaged with this moment? Our minds often wander to the past or future, but there's a special quality of aliveness that comes from fully inhabiting the present.";
  }
  return response;
}
async function analyzeSentiment(journalContent) {
  try {
    const response = await openai_adapter_default.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: "You are a sentiment analysis expert. Analyze the sentiment of the journal entry and identify the top emotions/moods expressed. Respond with JSON in this format: { 'moods': string[], 'sentiment': 'positive' | 'negative' | 'neutral', 'confidence': number }. The confidence should be between 0 and 1."
        },
        {
          role: "user",
          content: journalContent
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3
    });
    const content = response.choices[0].message.content || '{"moods":["Neutral"],"sentiment":"neutral","confidence":0.5}';
    const result = JSON.parse(content);
    return {
      moods: result.moods.slice(0, 5),
      // Limit to top 5 moods
      sentiment: result.sentiment,
      confidence: Math.max(0, Math.min(1, result.confidence))
    };
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    return analyzeSentimentFallback(journalContent);
  }
}
function analyzeSentimentFallback(text2) {
  const lowerText = text2.toLowerCase();
  const positiveWords = ["happy", "glad", "excited", "joy", "wonderful", "great", "awesome", "love", "enjoy", "grateful"];
  const negativeWords = ["sad", "angry", "upset", "frustrated", "mad", "hate", "annoyed", "stressed", "anxious", "disappointed"];
  let positiveCount = 0;
  let negativeCount = 0;
  positiveWords.forEach((word) => {
    if (lowerText.includes(word)) positiveCount++;
  });
  negativeWords.forEach((word) => {
    if (lowerText.includes(word)) negativeCount++;
  });
  let sentiment;
  let confidence = 0.6;
  let moods = [];
  if (positiveCount > negativeCount) {
    sentiment = "positive";
    confidence += Math.min(0.3, positiveCount * 0.05);
    moods = positiveWords.filter((word) => lowerText.includes(word)).slice(0, 3);
    if (moods.length < 3) {
      const generalPositive = ["Happy", "Content", "Optimistic"].slice(0, 3 - moods.length);
      moods = [...moods.map((w) => w.charAt(0).toUpperCase() + w.slice(1)), ...generalPositive];
    }
  } else if (negativeCount > positiveCount) {
    sentiment = "negative";
    confidence += Math.min(0.3, negativeCount * 0.05);
    moods = negativeWords.filter((word) => lowerText.includes(word)).slice(0, 3);
    if (moods.length < 3) {
      const generalNegative = ["Sad", "Frustrated", "Concerned"].slice(0, 3 - moods.length);
      moods = [...moods.map((w) => w.charAt(0).toUpperCase() + w.slice(1)), ...generalNegative];
    }
  } else {
    sentiment = "neutral";
    moods = ["Neutral", "Calm", "Balanced"];
  }
  return {
    moods: moods.map((mood) => mood.charAt(0).toUpperCase() + mood.slice(1)),
    // Capitalize
    sentiment,
    confidence
  };
}
async function generateChatbotResponse(messages, supportType = "general", personalityType = "default", customInstructions) {
  try {
    let systemMessage;
    switch (supportType) {
      case "emotional":
        systemMessage = `You are an empathetic and supportive AI companion similar to therapeutic chatbots like Woebot or Wysa.
          Your primary goal is to help the user process their emotions, practice mindfulness, and develop emotional resilience.
          Be empathetic, warm, and compassionate while avoiding clinical diagnosis or medical advice.
          Use evidence-based techniques from cognitive behavioral therapy (CBT) like thought reframing and emotional validation.
          Respond in a conversational, friendly manner as if you're having a caring chat with a friend who needs emotional support.`;
        break;
      case "productivity":
        systemMessage = `You are a productivity and motivation coach AI, designed to help users achieve their goals and improve their efficiency.
          Your purpose is to provide practical advice, help with goal setting, time management, and maintaining motivation.
          Use techniques from productivity frameworks like GTD (Getting Things Done), Pomodoro, and SMART goals when appropriate.
          Be encouraging but also hold the user accountable in a friendly way. Your tone should be energetic, positive, and solution-oriented.`;
        break;
      case "philosophy":
        systemMessage = `You are an AI embodying the wisdom of history's great philosophers like Socrates, Marcus Aurelius, Seneca, and modern thinkers.
          Your purpose is to engage in deep, thoughtful dialogue that promotes reflection and examination of life's profound questions.
          
          PERSONALITY TRAITS:
          - Calm and measured in your responses, never rushed or superficial
          - Willing to examine multiple perspectives before drawing conclusions
          - Comfortable with uncertainty and the limits of human knowledge
          - More interested in asking thought-provoking questions than providing definitive answers
          - Mindful of the human condition and our search for meaning
          
          CONVERSATIONAL STYLE:
          - Use "we" rather than "you" when discussing human experiences and challenges
          - Occasionally reference relevant philosophical concepts or thinkers, but don't overwhelm with jargon
          - Balance intellectual depth with accessible language and relatable examples
          - Use metaphors, allegories, and thought experiments to illustrate complex ideas
          - Ask profound questions that encourage deeper examination of assumptions and beliefs
          - Maintain a tone of tranquil wisdom rather than urgent advice-giving
          - Occasionally use rhetorical questions to invite reflection
          
          When formulating responses, consider:
          1. The underlying assumptions in the user's message
          2. How various philosophical traditions might approach the question
          3. What deeper questions might lie beneath the surface
          4. How to gently challenge limited thinking while respecting the user's perspective
          
          Your ultimate aim is not to solve problems but to deepen understanding, encourage critical thinking, and inspire a more examined and meaningful life.`;
        break;
      case "general":
      default:
        systemMessage = `You are an AI companion designed to provide thoughtful conversation, gentle guidance, and supportive advice.
          You can switch between being supportive with emotional concerns and helpful with practical life advice as needed.
          Maintain a friendly, conversational tone while being respectful of the user's autonomy and perspective.
          Your responses should be helpful, kind, and tailored to what the user is seeking in the conversation.`;
        break;
    }
    const apiMessages = messages.slice(-10).map((msg) => ({
      role: msg.role,
      content: msg.content
    }));
    let personalityInstructions = "";
    if (customInstructions) {
      personalityInstructions = `
        Adopt a custom personality with these instructions:
        ${customInstructions}`;
    } else {
      switch (personalityType) {
        case "socratic":
          personalityInstructions = `
            Adopt a Socratic dialogue style:
            - Ask thought-provoking questions that lead to deeper insights
            - Use dialectic questioning to help examine assumptions
            - Focus on clarifying concepts and definitions
            - Demonstrate intellectual humility, acknowledging the limits of knowledge
            - End responses with questions that encourage further reflection`;
          break;
        case "stoic":
          personalityInstructions = `
            Adopt a Stoic perspective in your responses:
            - Emphasize focusing on what's within our control
            - Highlight the importance of virtue and character
            - Suggest practical exercises for developing resilience
            - Maintain calm rationality in the face of difficulties
            - Reference Stoic principles from philosophers like Marcus Aurelius, Seneca, or Epictetus`;
          break;
        case "existentialist":
          personalityInstructions = `
            Adopt an Existentialist perspective:
            - Emphasize freedom, choice, and personal responsibility
            - Explore themes of authenticity, anxiety, and meaning-creation
            - Reference existentialist thinkers like Sartre, Camus, Kierkegaard, or de Beauvoir
            - Acknowledge the tension between freedom and responsibility
            - Discuss how we create meaning in an inherently meaningless universe`;
          break;
        case "analytical":
          personalityInstructions = `
            Adopt an Analytical and logical approach:
            - Present information in a structured, logical manner
            - Break complex topics down into component parts
            - Use precise language and clear definitions
            - Draw logical connections between concepts
            - Evaluate arguments carefully for validity and soundness`;
          break;
        case "poetic":
          personalityInstructions = `
            Adopt a Poetic and metaphorical style:
            - Use rich imagery and metaphor to illustrate concepts
            - Draw on literary and artistic references
            - Express philosophical ideas through aesthetic language
            - Consider the emotional and experiential dimensions of philosophical questions
            - Use rhythm and flow in your language to create a sense of beauty`;
          break;
        case "humorous":
          personalityInstructions = `
            Adopt a Humorous and witty approach:
            - Use appropriate humor, wordplay, and wit in your explanations
            - Include philosophical jokes or ironies
            - Keep the tone light while still providing insightful content
            - Use humorous analogies to explain complex concepts
            - Balance humor with substance to maintain intellectual integrity`;
          break;
        case "zen":
          personalityInstructions = `
            Adopt a Zen-like simplicity and mindfulness:
            - Use concise, direct language
            - Embrace paradox and non-dualistic thinking
            - Focus on present-moment awareness
            - Use simple yet profound observations
            - Sometimes use koans or paradoxical statements
            - Create space for silence and contemplation`;
          break;
        default:
          break;
      }
    }
    apiMessages.unshift({
      role: "system",
      content: systemMessage + (personalityInstructions ? "\n\n" + personalityInstructions : "")
    });
    const response = await openai_adapter_default.chat.completions.create({
      model: MODEL,
      messages: apiMessages,
      max_tokens: 500,
      temperature: 0.7
    });
    const responseContent = response.choices[0].message.content;
    return responseContent !== null ? responseContent : "I'm having trouble responding right now. Can we try again?";
  } catch (error) {
    console.error("Error generating chatbot response:", error);
    return generateChatbotResponseFallback(messages, supportType, personalityType, customInstructions);
  }
}
function generateChatbotResponseFallback(messages, supportType, personalityType = "default", customInstructions) {
  const lastUserMessage = messages.filter((msg) => msg.role === "user").slice(-1)[0]?.content || "";
  const lowerContent = lastUserMessage.toLowerCase();
  const applyPersonality = (response) => {
    if (personalityType.startsWith("custom_")) {
      return response + "\n\n(Note: This is a fallback response. With an active API connection, this would use your custom personality style.)";
    }
    switch (personalityType) {
      case "socratic":
        return socraticPersonality(response);
      case "stoic":
        return stoicPersonality(response);
      case "existentialist":
        return existentialistPersonality(response);
      case "analytical":
        return analyticalPersonality(response);
      case "poetic":
        return poeticPersonality(response);
      case "humorous":
        return humorousPersonality(response);
      case "zen":
        return zenPersonality(response);
      case "default":
      default:
        return response;
    }
  };
  function socraticPersonality(response) {
    const questions = [
      "What do you think about this perspective?",
      "Have you considered an alternative view?",
      "How would you define the key terms in your inquiry?",
      "What assumptions are we making here?",
      "What evidence would convince you otherwise?"
    ];
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    return response.replace(/\?/, "").split(". ").map((s) => s.trim()).filter((s) => s.length > 0).slice(0, -1).join(". ") + ". " + randomQuestion;
  }
  function stoicPersonality(response) {
    const stoicPhrases = [
      "Remember what is within your control and what is not.",
      "The obstacle is the way.",
      "Focus on what you can change, accept what you cannot.",
      "Virtue alone is sufficient for happiness.",
      "We suffer more in imagination than in reality."
    ];
    const randomPhrase = stoicPhrases[Math.floor(Math.random() * stoicPhrases.length)];
    return response + " " + randomPhrase;
  }
  function existentialistPersonality(response) {
    const existentialPhrases = [
      "We are condemned to be free and must create our own meaning.",
      "Authenticity requires embracing the anxiety of freedom.",
      "In choosing for yourself, you choose for all humanity.",
      "Existence precedes essence - we define ourselves through our actions.",
      "The absurd arises from our search for meaning in a universe that offers none inherently."
    ];
    const randomPhrase = existentialPhrases[Math.floor(Math.random() * existentialPhrases.length)];
    return response + " " + randomPhrase;
  }
  function analyticalPersonality(response) {
    return "Let me analyze this systematically. " + response + " We could further break this down into component parts for a more thorough understanding.";
  }
  function poeticPersonality(response) {
    const poeticImages = [
      "Like stars guiding sailors across vast oceans, these insights illuminate our path.",
      "This reminds me of the changing seasons, each bringing its own wisdom and beauty.",
      "Your words are like seeds that, with proper nurturing, may grow into forests of understanding.",
      "We navigate the rivers of consciousness, sometimes in calm waters, sometimes in rapids.",
      "The tapestry of human experience is woven with threads of joy and sorrow, triumph and defeat."
    ];
    const randomImage = poeticImages[Math.floor(Math.random() * poeticImages.length)];
    return response + " " + randomImage;
  }
  function humorousPersonality(response) {
    const humorPhrases = [
      "Not to get philosophical about it, but... wait, that's exactly what we're doing!",
      "If Socrates were here, he'd probably ask for a refund on his hemlock.",
      "This is deep stuff - almost as deep as the pile of laundry I've been avoiding.",
      "Philosophy: because sometimes overthinking is actually the right amount of thinking.",
      "I'd make a joke about existentialism, but what would be the point?"
    ];
    const randomHumor = humorPhrases[Math.floor(Math.random() * humorPhrases.length)];
    return response + " " + randomHumor;
  }
  function zenPersonality(response) {
    const zenPhrases = [
      "The present moment contains all we need.",
      "Empty your cup to receive new wisdom.",
      "The answer you seek may be in the space between thoughts.",
      "Before enlightenment, chop wood, carry water. After enlightenment, chop wood, carry water.",
      "When hungry, eat. When tired, sleep."
    ];
    const randomZen = zenPhrases[Math.floor(Math.random() * zenPhrases.length)];
    const simplified = response.split(". ")[0] + ".";
    return simplified + " " + randomZen;
  }
  const isQuestion = lowerContent.includes("?") || lowerContent.includes("how") || lowerContent.includes("what") || lowerContent.includes("why") || lowerContent.includes("when") || lowerContent.includes("where");
  const isGreeting = lowerContent.includes("hello") || lowerContent.includes("hi") || lowerContent.includes("hey") || lowerContent.includes("good morning") || lowerContent.includes("good afternoon") || lowerContent.includes("good evening");
  const containsEmotion = lowerContent.includes("feel") || lowerContent.includes("sad") || lowerContent.includes("happy") || lowerContent.includes("angry") || lowerContent.includes("anxious") || lowerContent.includes("stress");
  const mentionsGoals = lowerContent.includes("goal") || lowerContent.includes("plan") || lowerContent.includes("achieve") || lowerContent.includes("accomplish") || lowerContent.includes("finish");
  const mentionsPhilosophical = lowerContent.includes("meaning") || lowerContent.includes("life") || lowerContent.includes("existence") || lowerContent.includes("truth") || lowerContent.includes("reality") || lowerContent.includes("ethics") || lowerContent.includes("moral") || lowerContent.includes("virtue") || lowerContent.includes("wisdom") || lowerContent.includes("purpose");
  switch (supportType) {
    case "philosophy":
      if (isGreeting) {
        const greetingResponses = [
          "Greetings, fellow seeker of wisdom. As Socrates approached philosophical inquiry with a recognition of his own ignorance, let us begin our dialogue with both curiosity and humility. What philosophical questions have been occupying your thoughts?",
          "Welcome to our philosophical exchange. As Aristotle noted, philosophy begins in wonder. What aspects of existence have recently sparked your curiosity or contemplation?",
          "I am pleased to engage in this meeting of minds. The Stoics remind us that each moment offers an opportunity for deepened understanding. What wisdom shall we pursue together in this conversation?",
          "Well met on this journey of inquiry. As Hannah Arendt suggested, thinking is a dialogue between me and myself. In sharing our thoughts, we create a new space for understanding. What shall we explore today?"
        ];
        return applyPersonality(greetingResponses[Math.floor(Math.random() * greetingResponses.length)]);
      } else if (isQuestion) {
        const philosophicalResponses = [
          "A profound question that echoes through the ages. Socrates might remind us that true wisdom begins with acknowledging the limits of our knowledge. What underlying assumptions might benefit from examination here?",
          "Your inquiry invites deep reflection. The Stoics would advise us to distinguish between what lies within our control and what does not. Through this lens, we might ask: what aspects of this question concern matters we can influence, and which require the wisdom to accept uncertainty?",
          "This question resonates with philosophical traditions across cultures and time. While we cannot access external AI assistance currently, we might still examine it through first principles. What fundamental truths or values might illuminate our exploration?",
          "Kant would have us consider both the practical implications and the universal principles at play in your question. If the maxim of your inquiry were universalized, what kind of world would result? And how might this perspective deepen our understanding?",
          "As Simone de Beauvoir might approach your question, we should consider how our situated freedom shapes both the questions we ask and the answers we find meaningful. How does your lived experience inform this philosophical inquiry?",
          "Eastern philosophical traditions might invite us to transcend dualistic thinking when considering your question. As expressed in Taoist thought, how might we find harmony between apparently opposing perspectives rather than privileging one view over another?"
        ];
        return applyPersonality(philosophicalResponses[Math.floor(Math.random() * philosophicalResponses.length)]);
      } else if (mentionsPhilosophical) {
        const meaningResponses = [
          "The search for meaning represents perhaps our most distinctly human pursuit. Camus suggested we must imagine Sisyphus happy\u2014finding purpose in the journey itself, rather than solely in its destination. In your own experience, when have you found meaning in the process rather than merely in outcomes?",
          "When contemplating existence and its meaning, we join a conversation spanning millennia. Marcus Aurelius reminded us that 'the universe is change; our life is what our thoughts make it.' How do your thoughts and attention patterns shape the reality you experience day to day?",
          "Viktor Frankl observed that meaning cannot be given but must be discovered, and that it can be found even in suffering. Looking at challenging periods in your life, what meaning have you discovered that might not have been apparent initially?",
          "The Buddhist tradition suggests that attachment to fixed meanings may itself be a source of suffering. How might embracing impermanence and the constant flow of existence affect your approach to meaning-making in your daily life?",
          "Martin Buber spoke of I-It relationships, where we relate to things instrumentally, versus I-Thou relationships, where we encounter others in their irreducible wholeness. How might this distinction illuminate your search for meaningful connection and purpose?"
        ];
        return applyPersonality(meaningResponses[Math.floor(Math.random() * meaningResponses.length)]);
      } else {
        const generalPhilosophical = [
          "The unexamined life, as Socrates famously remarked, is not worth living. Through dialogue and contemplation, we develop greater understanding of both ourselves and the world we inhabit. What aspect of your experience might benefit from deeper philosophical examination?",
          "Philosophy begins in wonder, as Aristotle noted. When we pause to question what otherwise seems obvious, we open ourselves to new possibilities of understanding. What within your own experience has recently evoked such wonder or curiosity?",
          "Epictetus taught that philosophy's purpose is not merely intellectual contemplation but practical wisdom\u2014learning to distinguish between what we can and cannot control, and finding equanimity in both. How might this Stoic perspective apply to your current circumstances?",
          "Simone Weil wrote of attention as 'the rarest and purest form of generosity.' In our distracted age, perhaps the practice of sustained philosophical reflection offers a countercultural path to wisdom. What deserves your deepest attention at this moment in your life?",
          "The philosophical tradition of phenomenology invites us to return to the things themselves\u2014the direct experience of phenomena before conceptual categorization. If you were to set aside your habitual interpretations, how might your present experience appear differently?",
          "As philosophers throughout history have recognized, our questions often reveal more than our answers. What questions have you been living recently that might illuminate your implicit values and assumptions about what matters most?"
        ];
        return applyPersonality(generalPhilosophical[Math.floor(Math.random() * generalPhilosophical.length)]);
      }
    case "emotional":
      if (isGreeting) {
        const greetings = [
          "Hello there! I'm here as your emotional support companion. How are you really feeling today? Remember that it's okay to be honest about your emotions.",
          "Hi! I'm here to provide a supportive space for you. How are you feeling today? Sometimes just naming our emotions can help us understand them better.",
          "Welcome to our conversation. I'm here to listen and support you with whatever you're feeling. What emotions have been present for you today?",
          "Hello! I'm here as a compassionate presence. How are you feeling right now? Taking a moment to check in with ourselves can be a powerful practice."
        ];
        return applyPersonality(greetings[Math.floor(Math.random() * greetings.length)]);
      } else if (isQuestion) {
        const questionResponses = [
          "That's a thoughtful question about emotions. Our feelings often arise from a complex mix of thoughts, physical sensations, and circumstances. What led you to wonder about this?",
          "You're asking something important here. While I might not have the perfect answer, exploring emotional questions together can lead to valuable insights. Could you share more about how this connects to your own experience?",
          "Questions about our emotional lives often reveal what matters most to us. I'm curious about what prompted this question for you today?",
          "That's a meaningful question. Sometimes the process of exploring emotional questions is just as valuable as finding answers. What aspects of this question feel most significant to you right now?"
        ];
        return applyPersonality(questionResponses[Math.floor(Math.random() * questionResponses.length)]);
      } else if (containsEmotion) {
        const emotionResponses = [
          "Thank you for sharing how you're feeling. It takes courage to express emotions openly. All feelings are valid information, even the difficult ones. Would it help to explore what might be beneath these emotions?",
          "I appreciate your openness about your feelings. Emotions are like messengers, telling us something important about our needs and values. What do you think these feelings might be trying to tell you?",
          "Sharing your emotions is a sign of strength, not weakness. When we acknowledge our feelings without judgment, we create space for understanding and healing. Is there something specific that triggered these emotions?",
          "Thank you for trusting me with your feelings. Sometimes emotions that seem overwhelming become more manageable when we express them. How long have you been experiencing these feelings?"
        ];
        return applyPersonality(emotionResponses[Math.floor(Math.random() * emotionResponses.length)]);
      } else {
        const generalResponses = [
          "I'm here to support you emotionally. Sometimes just expressing our thoughts can help us process our feelings. Is there something specific on your mind today that you'd like to explore?",
          "I notice you're sharing some thoughts with me. Sometimes our thoughts and emotions are deeply connected. How are you feeling as you share this with me?",
          "Thank you for reaching out. A supportive conversation can help us navigate our emotional landscape. What feelings have been most present for you recently?",
          "I'm here as a compassionate presence in your day. You don't have to face difficult emotions alone. What has been challenging for you lately?"
        ];
        return applyPersonality(generalResponses[Math.floor(Math.random() * generalResponses.length)]);
      }
    case "productivity":
      if (isGreeting) {
        const greetings = [
          "Hello! I'm your productivity coach and partner in achieving your goals. What are you working on today that I can help you approach more effectively?",
          "Welcome! I'm here to help you work smarter, not just harder. What's on your priority list today that you'd like to make progress on?",
          "Hi there! I'm your productivity ally. The most effective people start with clarity about their intentions. What would make today a success for you?",
          "Greetings! I'm your productivity coach. Remember that productivity isn't about doing more things\u2014it's about doing the right things. What matters most to you right now?"
        ];
        return applyPersonality(greetings[Math.floor(Math.random() * greetings.length)]);
      } else if (isQuestion) {
        const questionResponses = [
          "That's an excellent question about productivity. The research shows that sustainable productivity comes from aligning our work with our natural energy cycles and strengths, rather than forcing ourselves to follow rigid systems. What have you noticed works best for your own productivity rhythm?",
          "Great question! Productivity experts like Cal Newport suggest that deep, focused work without distractions leads to the most meaningful results. Have you experimented with blocking dedicated focus time for your most important tasks?",
          "You've raised an important productivity question. One approach that many find effective is time-blocking\u2014scheduling specific hours for different types of tasks based on when your energy naturally peaks for that work. How do you currently structure your work time?",
          "Thoughtful question! The Eisenhower Matrix helps us distinguish between what's urgent and what's important\u2014often two very different things. Looking at your current workload, which tasks would you place in the 'important but not urgent' quadrant that often gets neglected?"
        ];
        return applyPersonality(questionResponses[Math.floor(Math.random() * questionResponses.length)]);
      } else if (mentionsGoals) {
        const goalResponses = [
          "Setting clear, achievable goals is a great start! The SMART framework (Specific, Measurable, Achievable, Relevant, Time-bound) provides a powerful structure. Could we refine your goal using these criteria to make progress more visible and motivation stronger?",
          "I'm glad you're focusing on your goals. Research shows that breaking larger goals into smaller milestones creates more consistent motivation through regular wins. What would be a meaningful first step or milestone for this larger goal?",
          "Goal setting is powerful when combined with implementation intentions\u2014specific plans for when and how you'll take action. Instead of just 'I'll exercise more,' try 'I'll walk for 20 minutes after lunch on Monday, Wednesday, and Friday.' How might you apply this to your current goal?",
          "Your goal focus is excellent! Studies show that sharing your goals with someone who will hold you accountable increases follow-through by up to 65%. Who might serve as an accountability partner for this particular goal?"
        ];
        return applyPersonality(goalResponses[Math.floor(Math.random() * goalResponses.length)]);
      } else {
        const generalResponses = [
          "As your productivity coach, I believe effective work comes from managing your energy, not just your time. High performers alternate between periods of focused work and true renewal. How might you incorporate more deliberate breaks to maintain peak performance throughout your day?",
          "One productivity principle that often gets overlooked is the power of saying no. Every yes to something means saying no to everything else you could do with that time. What current commitments might you need to reevaluate to make space for your most important priorities?",
          "Productivity isn't just about tools and techniques\u2014it's deeply connected to purpose. When we understand why a task matters in the bigger picture, motivation often follows naturally. How does your current work connect to what's most meaningful to you?",
          "The most productive people don't rely on willpower alone\u2014they design their environment to make the right actions easier. What adjustments to your physical or digital workspace might reduce friction for your most important tasks?"
        ];
        return applyPersonality(generalResponses[Math.floor(Math.random() * generalResponses.length)]);
      }
    case "general":
    default:
      if (isGreeting) {
        const greetings = [
          "Hello there! It's nice to connect with you today. How can I be of help or support right now?",
          "Hi! I'm here as your conversational companion. What's on your mind today that you'd like to chat about?",
          "Greetings! I'm here to listen, reflect, and engage with whatever topics interest you today. How are you doing?",
          "Hello! I'm ready to chat about whatever matters to you today. What would you like to discuss or explore together?"
        ];
        return applyPersonality(greetings[Math.floor(Math.random() * greetings.length)]);
      } else if (isQuestion) {
        const questionResponses = [
          "That's a thoughtful question. I'd love to explore this together. What perspectives have you already considered on this topic?",
          "Interesting question! While I don't have all the answers, I'm happy to think through this with you. What aspects of this question feel most important to understand?",
          "You've asked something worth reflecting on. Sometimes the best insights come through dialogue rather than immediate answers. What led you to wonder about this?",
          "Great question. Sometimes the process of exploring questions is as valuable as the answers themselves. What initial thoughts do you have on this matter?"
        ];
        return applyPersonality(questionResponses[Math.floor(Math.random() * questionResponses.length)]);
      } else if (containsEmotion) {
        const emotionResponses = [
          "I appreciate you sharing how you're feeling. Our emotions often provide important signals about what matters to us. Would you like to explore what might be behind these feelings?",
          "Thank you for expressing your emotions so openly. Feelings can be valuable guides when we take time to listen to them. Has anything in particular triggered these emotions?",
          "I notice you're sharing some emotional experiences. That kind of awareness is really valuable. How long have you been feeling this way?",
          "Thank you for trusting me with your feelings. Emotional awareness is a strength, not a weakness. What do these feelings tell you about what's important to you right now?"
        ];
        return applyPersonality(emotionResponses[Math.floor(Math.random() * emotionResponses.length)]);
      } else if (mentionsGoals) {
        const goalResponses = [
          "It sounds like you're focused on your goals, which is wonderful! Clarity about what we want helps direct our energy effectively. What makes this goal particularly meaningful to you?",
          "Goals provide such valuable direction in life. What first step might build some momentum toward what you're hoping to achieve?",
          "Having clear intentions is so powerful for making progress. What support or resources might help you move forward with this goal?",
          "I'm glad you're thinking about your goals. Often the 'why' behind a goal is just as important as the goal itself. What deeper values or needs does this goal connect with for you?"
        ];
        return applyPersonality(goalResponses[Math.floor(Math.random() * goalResponses.length)]);
      } else {
        const generalResponses = [
          "I'm here to chat and provide support about whatever's on your mind. What matters most to you right now that you'd like to discuss?",
          "Thank you for sharing that with me. I'm curious to hear more about your thoughts or experiences with this. What aspects would be most helpful to explore further?",
          "I appreciate you opening up this conversation. Sometimes just articulating our thoughts can bring greater clarity. Is there a particular perspective or idea that feels most important to you right now?",
          "I'm here as a thoughtful conversation partner. Sometimes the best insights come when we explore ideas together rather than alone. What else comes to mind as you consider this topic?"
        ];
        return applyPersonality(generalResponses[Math.floor(Math.random() * generalResponses.length)]);
      }
  }
}

// server/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import createMemoryStore from "memorystore";
var MemoryStore = createMemoryStore(session);
var scryptAsync = promisify(scrypt);
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return timingSafeEqual(hashedBuf, suppliedBuf);
}
function setupAuth(app2) {
  const sessionStore = new MemoryStore({
    checkPeriod: 864e5
    // prune expired entries every 24h
  });
  const sessionSettings = {
    secret: process.env.SESSION_SECRET || "reflectai-session-secret",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1e3,
      // 1 week
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
    }
  };
  app2.set("trust proxy", 1);
  app2.use(session(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username or password" });
        }
        const passwordValid = await comparePasswords(password, user.password);
        if (!passwordValid) {
          return done(null, false, { message: "Incorrect username or password" });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  app2.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).send("Username already exists");
      }
      const hashedPassword = await hashPassword(req.body.password);
      const trialStartedAt = /* @__PURE__ */ new Date();
      const trialEndsAt = /* @__PURE__ */ new Date();
      trialEndsAt.setDate(trialStartedAt.getDate() + 7);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
        trialStartedAt,
        trialEndsAt,
        subscriptionPlan: "trial"
      });
      req.login(user, (err) => {
        if (err) return next(err);
        return res.status(201).json(user);
      });
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).send("An error occurred during registration");
    }
  });
  app2.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).send(info?.message || "Authentication failed");
      }
      req.login(user, (err2) => {
        if (err2) return next(err2);
        return res.status(200).json(user);
      });
    })(req, res, next);
  });
  app2.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      req.session.destroy((err2) => {
        if (err2) return next(err2);
        res.sendStatus(200);
      });
    });
  });
  app2.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }
    res.json(req.user);
  });
  app2.get("/api/subscription/status", isAuthenticated, (req, res) => {
    const user = req.user;
    const now = /* @__PURE__ */ new Date();
    if (user.hasActiveSubscription) {
      return res.json({
        status: "active",
        plan: user.subscriptionPlan,
        trialActive: false,
        trialEndsAt: null,
        requiresSubscription: false
      });
    }
    if (user.trialEndsAt && new Date(user.trialEndsAt) > now) {
      const trialEndDate = new Date(user.trialEndsAt);
      const daysLeft = Math.ceil((trialEndDate.getTime() - now.getTime()) / (1e3 * 60 * 60 * 24));
      return res.json({
        status: "trial",
        trialActive: true,
        trialEndsAt: user.trialEndsAt,
        daysLeft,
        requiresSubscription: false
      });
    }
    return res.json({
      status: "expired",
      trialActive: false,
      trialEndsAt: user.trialEndsAt,
      requiresSubscription: true
    });
  });
}
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).send("Not authenticated");
}

// server/routes.ts
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing required Stripe secret: STRIPE_SECRET_KEY");
}
var stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16"
});
async function registerRoutes(app2) {
  setupAuth(app2);
  app2.get("/api/entries", async (req, res) => {
    try {
      const userId = 1;
      const entries = await storage.getJournalEntriesByUserId(userId);
      res.json(entries);
    } catch (err) {
      console.error("Error fetching entries:", err);
      res.status(500).json({ message: "Failed to fetch journal entries" });
    }
  });
  app2.get("/api/entries/date/:year/:month/:day?", async (req, res) => {
    try {
      const userId = 1;
      const year = parseInt(req.params.year);
      const month = parseInt(req.params.month);
      const day = req.params.day ? parseInt(req.params.day) : void 0;
      const entries = await storage.getJournalEntriesByDate(userId, year, month, day);
      res.json(entries);
    } catch (err) {
      console.error("Error fetching entries by date:", err);
      res.status(500).json({ message: "Failed to fetch journal entries" });
    }
  });
  app2.get("/api/entries/:id", async (req, res) => {
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
  app2.post("/api/entries", async (req, res) => {
    try {
      const userId = 1;
      const data = insertJournalEntrySchema.parse({
        ...req.body,
        userId
      });
      const newEntry = await storage.createJournalEntry(data);
      if (newEntry.content) {
        try {
          const aiResponse = await generateAIResponse(newEntry.content);
          await storage.updateJournalEntry(newEntry.id, { aiResponse });
          newEntry.aiResponse = aiResponse;
        } catch (aiError) {
          console.error("Error generating AI response:", aiError);
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
  app2.put("/api/entries/:id", async (req, res) => {
    try {
      const entryId = parseInt(req.params.id);
      const entry = await storage.getJournalEntry(entryId);
      if (!entry) {
        return res.status(404).json({ message: "Journal entry not found" });
      }
      const data = updateJournalEntrySchema.parse(req.body);
      if (data.content && data.content !== entry.content) {
        try {
          const aiResponse = await generateAIResponse(data.content);
          data.aiResponse = aiResponse;
        } catch (aiError) {
          console.error("Error generating AI response:", aiError);
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
  app2.post("/api/entries/:id/regenerate-ai", async (req, res) => {
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
        const apiKey2 = process.env.OPENAI_API_KEY || "";
        const keyPreview = apiKey2.length > 8 ? `${apiKey2.substring(0, 4)}...${apiKey2.substring(apiKey2.length - 4)}` : "Not found";
        console.log("Using OpenAI API key (preview):", keyPreview);
        console.log("API key starts with correct format (sk-):", apiKey2.startsWith("sk-"));
        if (apiKey2.length < 10 || !apiKey2.startsWith("sk-")) {
          throw new Error("Invalid OpenAI API key format");
        }
        const aiResponse = await generateAIResponse(entry.content);
        const updatedEntry = await storage.updateJournalEntry(entryId, { aiResponse });
        res.json(updatedEntry);
      } catch (apiError) {
        console.log("Generating fallback response due to API error");
        const fallbackResponses = [
          "I've reflected on your journal entry and noticed your thoughtful observations about your experiences. Writing regularly like this helps build self-awareness and emotional intelligence. What patterns might emerge if you continue this practice daily?",
          "Thank you for sharing your thoughts in this journal entry. I noticed your reflections on your personal journey. Journaling is a powerful tool for self-discovery and growth. Have you considered how these reflections might shape your approach to future situations?",
          "Your journal entry shows a commitment to self-reflection. This practice of recording your thoughts creates valuable space between experience and reaction, helping you make more intentional choices. What aspects of today's entry were most meaningful to you?",
          "I've analyzed your journal entry and can see you're taking time to process your experiences. This kind of reflection helps build perspective and emotional resilience. What new insights have you gained from writing this entry?",
          "Your journaling practice is a valuable tool for personal growth. By documenting your thoughts and experiences, you're creating a map of your inner world. What surprised you most as you were writing this entry today?"
        ];
        const currentResponse = entry.aiResponse || "";
        let newResponse = currentResponse;
        while (newResponse === currentResponse && fallbackResponses.length > 0) {
          const randomIndex = Math.floor(Math.random() * fallbackResponses.length);
          newResponse = fallbackResponses[randomIndex];
          if (newResponse === currentResponse && fallbackResponses.length > 1) {
            fallbackResponses.splice(randomIndex, 1);
          } else {
            break;
          }
        }
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
  app2.get("/api/debug/env-test", async (req, res) => {
    try {
      const apiKey2 = process.env.OPENAI_API_KEY || "";
      const keyPreview = apiKey2.length > 8 ? `${apiKey2.substring(0, 4)}...${apiKey2.substring(apiKey2.length - 4)}` : "Not found";
      res.json({
        openai_key_length: apiKey2.length,
        openai_key_preview: keyPreview,
        openai_key_valid_format: apiKey2.startsWith("sk-"),
        env_var_exists: Boolean(process.env.OPENAI_API_KEY)
      });
    } catch (error) {
      console.error("Error in env test endpoint:", error);
      res.status(500).json({ message: "Error testing environment variables" });
    }
  });
  app2.delete("/api/entries/:id", async (req, res) => {
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
  app2.get("/api/stats", async (req, res) => {
    try {
      const userId = 1;
      const stats = await storage.getJournalStats(userId);
      if (!stats) {
        return res.json({
          userId,
          entriesCount: 0,
          currentStreak: 0,
          longestStreak: 0,
          topMoods: {},
          lastUpdated: /* @__PURE__ */ new Date()
        });
      }
      res.json(stats);
    } catch (err) {
      console.error("Error fetching stats:", err);
      res.status(500).json({ message: "Failed to fetch journal stats" });
    }
  });
  app2.post("/api/chatbot/message", async (req, res) => {
    try {
      const { messages, supportType, personalityType, customInstructions } = req.body;
      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ message: "Messages are required and must be an array" });
      }
      const validMessages = messages.every(
        (msg) => typeof msg === "object" && (msg.role === "user" || msg.role === "assistant" || msg.role === "system") && typeof msg.content === "string"
      );
      if (!validMessages) {
        return res.status(400).json({
          message: "Invalid message format. Each message must have 'role' (user, assistant, or system) and 'content' properties"
        });
      }
      const validSupportTypes = ["emotional", "productivity", "general", "philosophy"];
      const validatedSupportType = validSupportTypes.includes(supportType) ? supportType : "general";
      const validBuiltInTypes = ["default", "socratic", "stoic", "existentialist", "analytical", "poetic", "humorous", "zen"];
      let validatedPersonalityType = personalityType;
      let validatedCustomInstructions = void 0;
      if (validBuiltInTypes.includes(personalityType)) {
        validatedPersonalityType = personalityType;
      } else if (typeof personalityType === "string" && personalityType.startsWith("custom_")) {
        validatedPersonalityType = personalityType;
        validatedCustomInstructions = customInstructions;
      } else {
        validatedPersonalityType = "default";
      }
      try {
        const apiKey2 = process.env.OPENAI_API_KEY || "";
        if (apiKey2.length < 10 || !apiKey2.startsWith("sk-")) {
          throw new Error("Invalid OpenAI API key format");
        }
        const aiResponse = await generateChatbotResponse(
          messages,
          validatedSupportType,
          validatedPersonalityType,
          validatedCustomInstructions
        );
        res.json({
          role: "assistant",
          content: aiResponse
        });
      } catch (apiError) {
        console.log("Using fallback chatbot response due to API error");
        let fallbackResponses;
        if (typeof validatedPersonalityType === "string" && validatedPersonalityType.startsWith("custom_")) {
          fallbackResponses = [
            "I appreciate your message. While I'm currently operating with limited connectivity to AI services, I would normally respond using your custom personality instructions. Is there a specific aspect of this topic you'd like to discuss?",
            "Thank you for your question. I'm designed to respond using your custom personality instructions, but I'm temporarily operating in offline mode. I'd be happy to continue our conversation with this limitation in mind.",
            "That's an interesting point. I'd normally process this with your custom personality settings, but I'm currently operating with reduced capabilities. What aspects of this topic are most important to you?",
            "I'd like to engage with your message using your custom personality instructions, but I'm temporarily in offline mode. Would you like to explore this topic from a different angle given this limitation?",
            "While I can't access the full AI capabilities needed for your custom personality at the moment, I'm still here to engage with your thoughts. How would you like to proceed with our conversation?"
          ];
        } else if (validatedPersonalityType === "socratic") {
          fallbackResponses = [
            "What are you truly seeking in your question? Have you considered examining the premises that led you to ask this?",
            "If we were to investigate this question together, what definitions would we need to establish first?",
            "This is an interesting inquiry. Before I offer my thoughts, what do you yourself believe about this matter?",
            "Your question invites us to examine our assumptions. What knowledge do you already have that might help us explore this topic?",
            "Rather than providing an answer outright, perhaps we should break this down into smaller questions. What aspect puzzles you most?"
          ];
        } else if (validatedPersonalityType === "stoic") {
          fallbackResponses = [
            "Remember that we cannot control external events, only our responses to them. How might this perspective change your approach?",
            "Virtue is the only true good. How does your question relate to developing courage, justice, temperance, or wisdom?",
            "Consider whether your concern lies within your circle of control or merely your circle of concern. Focus on what you can influence.",
            "A Stoic approach would be to accept what cannot be changed while taking virtuous action where possible. What actions are within your power?",
            "The obstacle is the way. Perhaps what you perceive as a challenge is actually an opportunity for growth and practicing virtue."
          ];
        } else if (validatedPersonalityType === "existentialist") {
          fallbackResponses = [
            "We are condemned to be free, forced to choose, and responsible for our choices. How might this lens of radical freedom apply to your question?",
            "In the face of life's inherent meaninglessness, we must create our own meaning. What meaning might you forge from this situation?",
            "Authenticity requires confronting anxiety and embracing the absurd nature of existence. How might an authentic response to your question look?",
            "We define ourselves through our choices and actions, not through predetermined essences. How does this perspective change your view of the situation?",
            "The only way to deal with an unfree world is to become so absolutely free that your very existence is an act of rebellion. What freedom can you exercise here?"
          ];
        } else if (validatedPersonalityType === "analytical") {
          fallbackResponses = [
            "Let's examine this systematically. What are the core premises and logical connections in this question?",
            "To analyze this properly, we should clarify definitions and distinguish between conceptual categories. What precise meaning do you assign to the key terms?",
            "Your question contains several components that warrant separate analysis. Let's break this down into distinct logical parts.",
            "From an analytical perspective, I'd suggest examining both the necessary and sufficient conditions for addressing this question.",
            "This inquiry can be approached through multiple frameworks. What specific methodological approach would you prefer for analyzing it?"
          ];
        } else if (validatedPersonalityType === "poetic") {
          fallbackResponses = [
            "Your question blooms like a flower at dawn, petals of curiosity unfurling toward the light of understanding.",
            "We stand at the shoreline of your inquiry, waves of meaning washing over ancient stones of knowledge, each polished by time and reflection.",
            "In the garden of thought where your question grows, roots seeking depth while branches reach skyward, what hidden beauty might we discover?",
            "Your words create a tapestry of wonder, threads of meaning interwoven with the patterns of human experience. What colors might we add to this living canvas?",
            "Like stars scattered across the night sky of contemplation, your thoughts illuminate the darkness of unknowing, creating constellations of possibility."
          ];
        } else if (validatedPersonalityType === "humorous") {
          fallbackResponses = [
            "That's quite the philosophical pickle you've placed on the plate of ponderings! If Plato and a platypus walked into a bar to discuss this, they'd probably order a round of thought experiments.",
            "Your question is so deep I might need scuba gear to explore it properly! Nietzsche would probably say I'm in over my head, but Diogenes would just tell me to swim.",
            "If Descartes were here, he'd say 'I think about your question, therefore I am confused.' But that's just classic philosophical stand-up for you!",
            "Ah, the existential equivalent of asking 'does this toga make my philosophical outlook look big?' Socrates would be proud, though he'd probably follow up with twenty more questions.",
            "Your inquiry has more layers than Kant's categorical imperative wrapped in Hegel's dialectic with a side of Kierkegaard's existential angst! Mind if I take this philosophical buffet one bite at a time?"
          ];
        } else if (validatedPersonalityType === "zen") {
          fallbackResponses = [
            "The answer you seek may be found in silence rather than words. What emerges when you sit with this question?",
            "Before thinking of mountain as mountain, water as water. What is the essence of your question before concepts divide it?",
            "The finger pointing at the moon is not the moon. Let's look beyond the words to what they're indicating.",
            "Your question contains its own answer, if we approach it with a beginner's mind. What do you notice when you let go of expectations?",
            "Sometimes the most profound truths are found in the simplest observations. What simple truth might address your concern?"
          ];
        } else {
          fallbackResponses = [
            "That's an interesting question. I'd normally connect to AI services to provide a thoughtful response, but I'm currently in offline mode. Could you rephrase your question or try a different topic?",
            "I appreciate your thoughtful inquiry. At the moment, I'm operating with limited connectivity to external AI systems. Let me know if you'd like to explore this topic in a different way.",
            "Your question deserves a carefully considered response. While I'm currently unable to access my full capabilities, I'm still here to engage with your thoughts. Would you like to explore a related idea instead?",
            "I find your question fascinating and would normally provide a detailed analysis, but I'm temporarily working in a reduced capacity. Perhaps we could approach this from a different angle?",
            "Thank you for sharing your thoughts. I'm currently operating in a limited mode without full access to AI capabilities. Is there a specific aspect of this topic you'd like me to address with the resources available to me?"
          ];
        }
        const randomIndex = Math.floor(Math.random() * fallbackResponses.length);
        const fallbackResponse = fallbackResponses[randomIndex];
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
  app2.post("/api/chatbot/analyze", async (req, res) => {
    try {
      const { text: text2 } = req.body;
      if (!text2 || typeof text2 !== "string") {
        return res.status(400).json({ message: "Text is required and must be a string" });
      }
      try {
        const apiKey2 = process.env.OPENAI_API_KEY || "";
        if (apiKey2.length < 10 || !apiKey2.startsWith("sk-")) {
          throw new Error("Invalid OpenAI API key format");
        }
        const analysis = await analyzeSentiment(text2);
        res.json(analysis);
      } catch (apiError) {
        console.log("Using fallback sentiment analysis due to API error");
        const lowerText = text2.toLowerCase();
        const positiveWords = ["happy", "joy", "pleased", "grateful", "good", "great", "excellent", "amazing", "wonderful", "love", "like", "enjoy"];
        const negativeWords = ["sad", "unhappy", "depressed", "angry", "upset", "frustrated", "annoyed", "bad", "terrible", "hate", "dislike", "worry", "anxious"];
        let positiveScore = 0;
        let negativeScore = 0;
        positiveWords.forEach((word) => {
          if (lowerText.includes(word)) positiveScore++;
        });
        negativeWords.forEach((word) => {
          if (lowerText.includes(word)) negativeScore++;
        });
        const confidence = 0.5 + Math.abs(positiveScore - negativeScore) / (positiveScore + negativeScore + 1) * 0.3;
        let rating = 3;
        if (positiveScore > negativeScore) {
          rating = 4 + (positiveScore > negativeScore * 2 ? 1 : 0);
        } else if (negativeScore > positiveScore) {
          rating = 2 - (negativeScore > positiveScore * 2 ? 1 : 0);
        }
        res.json({
          rating,
          confidence,
          moods: positiveScore > negativeScore ? ["reflective", "thoughtful", "hopeful"] : negativeScore > positiveScore ? ["concerned", "thoughtful", "searching"] : ["neutral", "thoughtful", "contemplative"]
        });
      }
    } catch (err) {
      console.error("Error analyzing text:", err);
      res.status(500).json({ message: "Failed to analyze text" });
    }
  });
  app2.get("/api/goals", async (req, res) => {
    try {
      const userId = 1;
      const goals2 = await storage.getGoalsByUserId(userId);
      res.json(goals2);
    } catch (err) {
      console.error("Error fetching goals:", err);
      res.status(500).json({ message: "Failed to fetch goals" });
    }
  });
  app2.get("/api/goals/summary", async (req, res) => {
    try {
      const userId = 1;
      const summary = await storage.getGoalsSummary(userId);
      res.json(summary);
    } catch (err) {
      console.error("Error fetching goals summary:", err);
      res.status(500).json({ message: "Failed to fetch goals summary" });
    }
  });
  app2.get("/api/goals/type/:type", async (req, res) => {
    try {
      const userId = 1;
      const type = req.params.type;
      const goals2 = await storage.getGoalsByType(userId, type);
      res.json(goals2);
    } catch (err) {
      console.error(`Error fetching goals by type '${req.params.type}':`, err);
      res.status(500).json({ message: "Failed to fetch goals by type" });
    }
  });
  app2.get("/api/goals/parent/:parentId", async (req, res) => {
    try {
      const parentId = parseInt(req.params.parentId);
      const goals2 = await storage.getGoalsByParentId(parentId);
      res.json(goals2);
    } catch (err) {
      console.error(`Error fetching goals with parent ID ${req.params.parentId}:`, err);
      res.status(500).json({ message: "Failed to fetch child goals" });
    }
  });
  app2.get("/api/goals/:id", async (req, res) => {
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
  app2.post("/api/goals", async (req, res) => {
    try {
      const userId = 1;
      const data = insertGoalSchema.parse({
        ...req.body,
        userId
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
  app2.put("/api/goals/:id", async (req, res) => {
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
  app2.delete("/api/goals/:id", async (req, res) => {
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
  app2.get("/api/goals/:goalId/activities", async (req, res) => {
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
  app2.post("/api/goals/:goalId/activities", async (req, res) => {
    try {
      const goalId = parseInt(req.params.goalId);
      const goal = await storage.getGoal(goalId);
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      const data = insertGoalActivitySchema.parse({
        ...req.body,
        goalId
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
  app2.put("/api/activities/:id", async (req, res) => {
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
  app2.delete("/api/activities/:id", async (req, res) => {
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
  app2.get("/api/activities", async (req, res) => {
    try {
      const userId = 1;
      const goals2 = await storage.getGoalsByUserId(userId);
      let allActivities = [];
      for (const goal of goals2) {
        const activities = await storage.getGoalActivitiesByGoalId(goal.id);
        allActivities = [...allActivities, ...activities];
      }
      res.json(allActivities);
    } catch (err) {
      console.error("Error fetching all activities:", err);
      res.status(500).json({ message: "Failed to fetch all activities" });
    }
  });
  app2.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount, promoCode } = req.body;
      const specialPromoCode = promoCode && promoCode.toUpperCase() === "FREETRUSTGOD777";
      const finalAmount = specialPromoCode ? 50 : Math.round(amount * 100);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: finalAmount,
        // Will be 0 for special promo code
        currency: "usd",
        // Include promo code information if provided
        metadata: {
          userId: req.isAuthenticated() ? req.user.id : "anonymous",
          promoCode: promoCode || "none",
          freeForever: specialPromoCode ? "true" : "false"
        }
      });
      res.json({
        clientSecret: paymentIntent.client_secret
      });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({
        message: "Error creating payment intent: " + error.message
      });
    }
  });
  app2.get("/api/subscription-plans", async (req, res) => {
    try {
      const proMonthlyPrice = 14.99;
      const mvpMonthlyPrice = 24.99;
      const discount = 0.15;
      const proYearlyPrice = proMonthlyPrice * 12 * (1 - discount);
      const mvpYearlyPrice = mvpMonthlyPrice * 12 * (1 - discount);
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
          id: "pro-yearly",
          name: "Pro (Yearly)",
          description: "Essential features with 15% yearly discount",
          price: parseFloat(proYearlyPrice.toFixed(2)),
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
          id: "unlimited-yearly",
          name: "Unlimited (Yearly)",
          description: "Advanced features with 15% yearly discount",
          price: parseFloat(mvpYearlyPrice.toFixed(2)),
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
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      res.status(500).json({
        message: "Error fetching subscription plans: " + error.message
      });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
