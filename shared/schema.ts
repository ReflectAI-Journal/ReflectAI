import { pgTable, text, serial, integer, boolean, timestamp, jsonb, date, real, pgEnum, varchar, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Sessions table for persistent login sessions
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  phoneNumber: text("phone_number"),
  // Subscription and trial fields
  trialStartedAt: timestamp("trial_started_at"),
  trialEndsAt: timestamp("trial_ends_at"),
  hasActiveSubscription: boolean("has_active_subscription").default(false),
  subscriptionPlan: text("subscription_plan").default('free'),
  // Stripe fields
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  // Free trial from Stripe
  stripeTrialEnd: timestamp("stripe_trial_end"),
  isOnStripeTrial: boolean("is_on_stripe_trial").default(false),
  // Questionnaire completion tracking
  completedCounselorQuestionnaire: boolean("completed_counselor_questionnaire").default(false),
  // VIP access for friends/family (bypasses all subscription checks)
  isVipUser: boolean("is_vip_user").default(false),
  // Google OAuth ID
  googleId: text("google_id"),
  // Apple OAuth ID
  appleId: text("apple_id"),

});

export const usersRelations = relations(users, ({ many }) => ({
  journalEntries: many(journalEntries),
  journalStats: many(journalStats),
  goals: many(goals),
  chatUsage: many(chatUsage),
  checkIns: many(checkIns),
  userChallenges: many(userChallenges),
  userBadges: many(userBadges),
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
  email: true,
  phoneNumber: true,
  trialStartedAt: true,
  trialEndsAt: true,
  subscriptionPlan: true,
}).refine(
  data => data.email || data.phoneNumber, 
  { message: "Either email or phone number is required", path: ["root"] }
);

export const insertJournalEntrySchema = createInsertSchema(journalEntries).pick({
  userId: true,
  title: true,
  content: true,
  moods: true,
}).extend({
  date: z.string().optional(),
}).refine(data => data.content && data.content.trim().length > 0, {
  message: "Content cannot be empty",
  path: ["content"]
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

// Chat usage tracking
export const chatUsage = pgTable("chat_usage", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  weekStartDate: timestamp("week_start_date").notNull(),
  chatCount: integer("chat_count").default(0).notNull(),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const chatUsageRelations = relations(chatUsage, ({ one }) => ({
  user: one(users, {
    fields: [chatUsage.userId],
    references: [users.id],
  }),
}));

export const insertChatUsageSchema = createInsertSchema(chatUsage).pick({
  userId: true,
  weekStartDate: true,
  chatCount: true,
});

export const updateChatUsageSchema = createInsertSchema(chatUsage).pick({
  chatCount: true,
  lastUpdated: true,
}).partial();

export type InsertChatUsage = z.infer<typeof insertChatUsageSchema>;
export type ChatUsage = typeof chatUsage.$inferSelect;

// Wellness Challenge System
export const challengeTypeEnum = pgEnum("challenge_type", [
  "daily_journal", 
  "streak_keeper", 
  "mood_tracker", 
  "goal_achiever", 
  "chat_explorer", 
  "reflection_master"
]);

export const challengeStatusEnum = pgEnum("challenge_status", [
  "not_started",
  "in_progress", 
  "completed",
  "expired"
]);

export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: challengeTypeEnum("type").notNull(),
  targetValue: integer("target_value").notNull(), // e.g., 7 for "7 days of journaling"
  duration: integer("duration").default(7), // Duration in days
  points: integer("points").default(100), // Points awarded for completion
  badgeIcon: text("badge_icon").default("🏆"), // Emoji or icon identifier
  badgeColor: text("badge_color").default("#FFD700"), // Hex color for badge
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userChallenges = pgTable("user_challenges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  challengeId: integer("challenge_id").notNull().references(() => challenges.id),
  status: challengeStatusEnum("status").default("not_started"),
  currentProgress: integer("current_progress").default(0),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userBadges = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  challengeId: integer("challenge_id").notNull().references(() => challenges.id),
  earnedAt: timestamp("earned_at").defaultNow(),
  points: integer("points").notNull(),
});

export const challengesRelations = relations(challenges, ({ many }) => ({
  userChallenges: many(userChallenges),
  userBadges: many(userBadges),
}));

export const userChallengesRelations = relations(userChallenges, ({ one }) => ({
  user: one(users, {
    fields: [userChallenges.userId],
    references: [users.id],
  }),
  challenge: one(challenges, {
    fields: [userChallenges.challengeId],
    references: [challenges.id],
  }),
}));

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
  user: one(users, {
    fields: [userBadges.userId],
    references: [users.id],
  }),
  challenge: one(challenges, {
    fields: [userBadges.challengeId],
    references: [challenges.id],
  }),
}));

// Challenge schema definitions
export const insertChallengeSchema = createInsertSchema(challenges).pick({
  title: true,
  description: true,
  type: true,
  targetValue: true,
  duration: true,
  points: true,
  badgeIcon: true,
  badgeColor: true,
  isActive: true,
});

export const updateChallengeSchema = createInsertSchema(challenges).pick({
  title: true,
  description: true,
  targetValue: true,
  duration: true,
  points: true,
  badgeIcon: true,
  badgeColor: true,
  isActive: true,
}).partial();

export const insertUserChallengeSchema = createInsertSchema(userChallenges).pick({
  userId: true,
  challengeId: true,
  status: true,
  currentProgress: true,
  startedAt: true,
  expiresAt: true,
});

export const updateUserChallengeSchema = createInsertSchema(userChallenges).pick({
  status: true,
  currentProgress: true,
  completedAt: true,
}).partial();

export const insertUserBadgeSchema = createInsertSchema(userBadges).pick({
  userId: true,
  challengeId: true,
  points: true,
});

export type InsertChallenge = z.infer<typeof insertChallengeSchema>;
export type Challenge = typeof challenges.$inferSelect;

export type InsertUserChallenge = z.infer<typeof insertUserChallengeSchema>;
export type UserChallenge = typeof userChallenges.$inferSelect;

export type InsertUserBadge = z.infer<typeof insertUserBadgeSchema>;
export type UserBadge = typeof userBadges.$inferSelect;

// Check-ins system
export const checkIns = pgTable("check_ins", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // 'counselor', 'philosopher', 'daily_checkin', 'follow_up'
  question: text("question").notNull(),
  originalDate: timestamp("original_date").notNull(), // When the conversation happened
  scheduledDate: timestamp("scheduled_date").notNull(), // When to follow up
  isAnswered: boolean("is_answered").default(false),
  userResponse: text("user_response"),
  aiFollowUp: text("ai_follow_up"),
  priority: text("priority").default("normal"), // 'low', 'normal', 'high', 'urgent'
  tags: text("tags").array(), // Tags for categorizing issues
  relatedEntryId: integer("related_entry_id").references(() => journalEntries.id), // Link to journal entry
  isResolved: boolean("is_resolved").default(false), // Whether the issue was resolved
  createdAt: timestamp("created_at").defaultNow(),
});

export const checkInsRelations = relations(checkIns, ({ one }) => ({
  user: one(users, {
    fields: [checkIns.userId],
    references: [users.id],
  }),
}));

export const insertCheckInSchema = createInsertSchema(checkIns).pick({
  userId: true,
  type: true,
  question: true,
  originalDate: true,
  scheduledDate: true,
  priority: true,
  tags: true,
  relatedEntryId: true,
});

export const updateCheckInSchema = createInsertSchema(checkIns).pick({
  isAnswered: true,
  userResponse: true,
  aiFollowUp: true,
  priority: true,
  tags: true,
  isResolved: true,
}).partial();

export type InsertCheckIn = z.infer<typeof insertCheckInSchema>;
export type CheckIn = typeof checkIns.$inferSelect;

// Blueprint downloads tracking for Pro users
export const blueprintDownloads = pgTable("blueprint_downloads", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  blueprintType: text("blueprint_type").notNull(), // 'anxiety-overthinking', 'depression', etc.
  downloadedAt: timestamp("downloaded_at").defaultNow(),
  customizationData: jsonb("customization_data"), // Store user's personalized answers
});

export const blueprintDownloadsRelations = relations(blueprintDownloads, ({ one }) => ({
  user: one(users, {
    fields: [blueprintDownloads.userId],
    references: [users.id],
  }),
}));

export const insertBlueprintDownloadSchema = createInsertSchema(blueprintDownloads).pick({
  userId: true,
  blueprintType: true,
  customizationData: true,
});

export type InsertBlueprintDownload = z.infer<typeof insertBlueprintDownloadSchema>;
export type BlueprintDownload = typeof blueprintDownloads.$inferSelect;
