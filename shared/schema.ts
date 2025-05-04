import { pgTable, text, serial, integer, boolean, timestamp, jsonb, date, real, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  journalEntries: many(journalEntries),
  journalStats: many(journalStats),
  goals: many(goals),
}));

export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title"),
  content: text("content").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  moods: text("moods").array(),
  aiResponse: text("ai_response"),
  isFavorite: boolean("is_favorite").default(false),
});

export const journalEntriesRelations = relations(journalEntries, ({ one }) => ({
  user: one(users, {
    fields: [journalEntries.userId],
    references: [users.id],
  }),
}));

export const journalStats = pgTable("journal_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  entriesCount: integer("entries_count").default(0),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  topMoods: jsonb("top_moods"),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const journalStatsRelations = relations(journalStats, ({ one }) => ({
  user: one(users, {
    fields: [journalStats.userId],
    references: [users.id],
  }),
}));

// Goal Types Enum
export const goalTypeEnum = pgEnum('goal_type', [
  'life', 
  'yearly', 
  'monthly', 
  'weekly', 
  'daily'
]);

// Goal Status Enum
export const goalStatusEnum = pgEnum('goal_status', [
  'not_started',
  'in_progress',
  'completed',
  'abandoned'
]);

// Main Goals Table
export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  type: goalTypeEnum("type").notNull(),
  status: goalStatusEnum("status").default('not_started'),
  targetDate: date("target_date"),
  completedDate: date("completed_date"),
  progress: real("progress").default(0), // 0-100 percentage
  parentGoalId: integer("parent_goal_id"), // For hierarchical goals (e.g., a weekly goal linked to a monthly goal)
  timeSpent: integer("time_spent").default(0), // Time spent in minutes
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Goals Relations
export const goalsRelations = relations(goals, ({ one, many }) => ({
  user: one(users, {
    fields: [goals.userId],
    references: [users.id],
  }),
  parent: one(goals, {
    fields: [goals.parentGoalId],
    references: [goals.id],
  }),
  children: many(goals),
  activities: many(goalActivities),
}));

// Goal Activities (for tracking time spent and progress)
export const goalActivities = pgTable("goal_activities", {
  id: serial("id").primaryKey(),
  goalId: integer("goal_id").notNull().references(() => goals.id),
  date: date("date").notNull().defaultNow(),
  minutesSpent: integer("minutes_spent").default(0),
  description: text("description"),
  progressIncrement: real("progress_increment").default(0), // How much this activity contributed to the goal progress
});

// Goal Activities Relations
export const goalActivitiesRelations = relations(goalActivities, ({ one }) => ({
  goal: one(goals, {
    fields: [goalActivities.goalId],
    references: [goals.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).pick({
  userId: true,
  title: true,
  content: true,
  moods: true,
}).extend({
  date: z.string().optional(),
});

export const updateJournalEntrySchema = createInsertSchema(journalEntries).pick({
  title: true,
  content: true,
  moods: true,
  aiResponse: true,
  isFavorite: true,
}).partial();

export const insertJournalStatsSchema = createInsertSchema(journalStats).pick({
  userId: true,
  entriesCount: true,
  currentStreak: true,
  longestStreak: true,
  topMoods: true,
});

// Goal schema
export const insertGoalSchema = createInsertSchema(goals).pick({
  userId: true,
  title: true,
  description: true,
  type: true,
  status: true,
  targetDate: true,
  parentGoalId: true,
}).extend({
  targetDate: z.string().optional(),
});

export const updateGoalSchema = createInsertSchema(goals).pick({
  title: true,
  description: true,
  status: true,
  progress: true,
  targetDate: true,
  completedDate: true,
  timeSpent: true,
}).partial();

// Goal Activity schema
export const insertGoalActivitySchema = createInsertSchema(goalActivities).pick({
  goalId: true,
  date: true,
  minutesSpent: true,
  description: true,
  progressIncrement: true,
}).extend({
  date: z.string().optional(),
});

export const updateGoalActivitySchema = createInsertSchema(goalActivities).pick({
  minutesSpent: true,
  description: true,
  progressIncrement: true,
}).partial();

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;

export type InsertJournalStats = z.infer<typeof insertJournalStatsSchema>;
export type JournalStats = typeof journalStats.$inferSelect;

export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goals.$inferSelect;

export type InsertGoalActivity = z.infer<typeof insertGoalActivitySchema>;
export type GoalActivity = typeof goalActivities.$inferSelect;
