"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCheckInSchema = exports.insertCheckInSchema = exports.checkInsRelations = exports.checkIns = exports.insertUserBadgeSchema = exports.updateUserChallengeSchema = exports.insertUserChallengeSchema = exports.updateChallengeSchema = exports.insertChallengeSchema = exports.userBadgesRelations = exports.userChallengesRelations = exports.challengesRelations = exports.userBadges = exports.userChallenges = exports.challenges = exports.challengeStatusEnum = exports.challengeTypeEnum = exports.updateChatUsageSchema = exports.insertChatUsageSchema = exports.chatUsageRelations = exports.chatUsage = exports.updateGoalActivitySchema = exports.insertGoalActivitySchema = exports.updateGoalSchema = exports.insertGoalSchema = exports.insertJournalStatsSchema = exports.updateJournalEntrySchema = exports.insertJournalEntrySchema = exports.insertUserSchema = exports.goalActivitiesRelations = exports.goalActivities = exports.goalsRelations = exports.goals = exports.goalStatusEnum = exports.goalTypeEnum = exports.journalStatsRelations = exports.journalStats = exports.journalEntriesRelations = exports.journalEntries = exports.usersRelations = exports.users = exports.sessions = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
const drizzle_orm_1 = require("drizzle-orm");
// Sessions table for persistent login sessions
exports.sessions = (0, pg_core_1.pgTable)("sessions", {
    sid: (0, pg_core_1.varchar)("sid").primaryKey(),
    sess: (0, pg_core_1.jsonb)("sess").notNull(),
    expire: (0, pg_core_1.timestamp)("expire").notNull(),
}, (table) => [(0, pg_core_1.index)("IDX_session_expire").on(table.expire)]);
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    username: (0, pg_core_1.text)("username").notNull().unique(),
    password: (0, pg_core_1.text)("password").notNull(),
    email: (0, pg_core_1.text)("email"),
    phoneNumber: (0, pg_core_1.text)("phone_number"),
    // Subscription and trial fields
    trialStartedAt: (0, pg_core_1.timestamp)("trial_started_at"),
    trialEndsAt: (0, pg_core_1.timestamp)("trial_ends_at"),
    hasActiveSubscription: (0, pg_core_1.boolean)("has_active_subscription").default(false),
    subscriptionPlan: (0, pg_core_1.text)("subscription_plan").default('free'),
    // Stripe fields
    stripeCustomerId: (0, pg_core_1.text)("stripe_customer_id"),
    stripeSubscriptionId: (0, pg_core_1.text)("stripe_subscription_id"),
    // Free trial from Stripe
    stripeTrialEnd: (0, pg_core_1.timestamp)("stripe_trial_end"),
    isOnStripeTrial: (0, pg_core_1.boolean)("is_on_stripe_trial").default(false),
});
exports.usersRelations = (0, drizzle_orm_1.relations)(exports.users, ({ many }) => ({
    journalEntries: many(exports.journalEntries),
    journalStats: many(exports.journalStats),
    goals: many(exports.goals),
    chatUsage: many(exports.chatUsage),
    checkIns: many(exports.checkIns),
    userChallenges: many(exports.userChallenges),
    userBadges: many(exports.userBadges),
}));
exports.journalEntries = (0, pg_core_1.pgTable)("journal_entries", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull().references(() => exports.users.id),
    title: (0, pg_core_1.text)("title"),
    content: (0, pg_core_1.text)("content").notNull(),
    date: (0, pg_core_1.timestamp)("date").notNull().defaultNow(),
    moods: (0, pg_core_1.text)("moods").array(),
    aiResponse: (0, pg_core_1.text)("ai_response"),
    isFavorite: (0, pg_core_1.boolean)("is_favorite").default(false),
});
exports.journalEntriesRelations = (0, drizzle_orm_1.relations)(exports.journalEntries, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.journalEntries.userId],
        references: [exports.users.id],
    }),
}));
exports.journalStats = (0, pg_core_1.pgTable)("journal_stats", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull().references(() => exports.users.id),
    entriesCount: (0, pg_core_1.integer)("entries_count").default(0),
    currentStreak: (0, pg_core_1.integer)("current_streak").default(0),
    longestStreak: (0, pg_core_1.integer)("longest_streak").default(0),
    topMoods: (0, pg_core_1.jsonb)("top_moods"),
    lastUpdated: (0, pg_core_1.timestamp)("last_updated").defaultNow(),
});
exports.journalStatsRelations = (0, drizzle_orm_1.relations)(exports.journalStats, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.journalStats.userId],
        references: [exports.users.id],
    }),
}));
// Goal Types Enum
exports.goalTypeEnum = (0, pg_core_1.pgEnum)('goal_type', [
    'life',
    'yearly',
    'monthly',
    'weekly',
    'daily'
]);
// Goal Status Enum
exports.goalStatusEnum = (0, pg_core_1.pgEnum)('goal_status', [
    'not_started',
    'in_progress',
    'completed',
    'abandoned'
]);
// Main Goals Table
exports.goals = (0, pg_core_1.pgTable)("goals", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull().references(() => exports.users.id),
    title: (0, pg_core_1.text)("title").notNull(),
    description: (0, pg_core_1.text)("description"),
    type: (0, exports.goalTypeEnum)("type").notNull(),
    status: (0, exports.goalStatusEnum)("status").default('not_started'),
    targetDate: (0, pg_core_1.date)("target_date"),
    completedDate: (0, pg_core_1.date)("completed_date"),
    progress: (0, pg_core_1.real)("progress").default(0), // 0-100 percentage
    parentGoalId: (0, pg_core_1.integer)("parent_goal_id"), // For hierarchical goals (e.g., a weekly goal linked to a monthly goal)
    timeSpent: (0, pg_core_1.integer)("time_spent").default(0), // Time spent in minutes
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Goals Relations
exports.goalsRelations = (0, drizzle_orm_1.relations)(exports.goals, ({ one, many }) => ({
    user: one(exports.users, {
        fields: [exports.goals.userId],
        references: [exports.users.id],
    }),
    parent: one(exports.goals, {
        fields: [exports.goals.parentGoalId],
        references: [exports.goals.id],
    }),
    children: many(exports.goals),
    activities: many(exports.goalActivities),
}));
// Goal Activities (for tracking time spent and progress)
exports.goalActivities = (0, pg_core_1.pgTable)("goal_activities", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    goalId: (0, pg_core_1.integer)("goal_id").notNull().references(() => exports.goals.id),
    date: (0, pg_core_1.date)("date").notNull().defaultNow(),
    minutesSpent: (0, pg_core_1.integer)("minutes_spent").default(0),
    description: (0, pg_core_1.text)("description"),
    progressIncrement: (0, pg_core_1.real)("progress_increment").default(0), // How much this activity contributed to the goal progress
});
// Goal Activities Relations
exports.goalActivitiesRelations = (0, drizzle_orm_1.relations)(exports.goalActivities, ({ one }) => ({
    goal: one(exports.goals, {
        fields: [exports.goalActivities.goalId],
        references: [exports.goals.id],
    }),
}));
exports.insertUserSchema = (0, drizzle_zod_1.createInsertSchema)(exports.users).pick({
    username: true,
    password: true,
    email: true,
    phoneNumber: true,
    trialStartedAt: true,
    trialEndsAt: true,
    subscriptionPlan: true,
}).refine(data => data.email || data.phoneNumber, { message: "Either email or phone number is required", path: ["root"] });
exports.insertJournalEntrySchema = (0, drizzle_zod_1.createInsertSchema)(exports.journalEntries).pick({
    userId: true,
    title: true,
    content: true,
    moods: true,
}).extend({
    date: zod_1.z.string().optional(),
}).refine(data => data.content && data.content.trim().length > 0, {
    message: "Content cannot be empty",
    path: ["content"]
});
exports.updateJournalEntrySchema = (0, drizzle_zod_1.createInsertSchema)(exports.journalEntries).pick({
    title: true,
    content: true,
    moods: true,
    aiResponse: true,
    isFavorite: true,
}).partial();
exports.insertJournalStatsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.journalStats).pick({
    userId: true,
    entriesCount: true,
    currentStreak: true,
    longestStreak: true,
    topMoods: true,
});
// Goal schema
exports.insertGoalSchema = (0, drizzle_zod_1.createInsertSchema)(exports.goals).pick({
    userId: true,
    title: true,
    description: true,
    type: true,
    status: true,
    targetDate: true,
    parentGoalId: true,
}).extend({
    targetDate: zod_1.z.string().optional(),
});
exports.updateGoalSchema = (0, drizzle_zod_1.createInsertSchema)(exports.goals).pick({
    title: true,
    description: true,
    status: true,
    progress: true,
    targetDate: true,
    completedDate: true,
    timeSpent: true,
}).partial();
// Goal Activity schema
exports.insertGoalActivitySchema = (0, drizzle_zod_1.createInsertSchema)(exports.goalActivities).pick({
    goalId: true,
    date: true,
    minutesSpent: true,
    description: true,
    progressIncrement: true,
}).extend({
    date: zod_1.z.string().optional(),
});
exports.updateGoalActivitySchema = (0, drizzle_zod_1.createInsertSchema)(exports.goalActivities).pick({
    minutesSpent: true,
    description: true,
    progressIncrement: true,
}).partial();
// Chat usage tracking
exports.chatUsage = (0, pg_core_1.pgTable)("chat_usage", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull().references(() => exports.users.id),
    weekStartDate: (0, pg_core_1.timestamp)("week_start_date").notNull(),
    chatCount: (0, pg_core_1.integer)("chat_count").default(0).notNull(),
    lastUpdated: (0, pg_core_1.timestamp)("last_updated").defaultNow(),
});
exports.chatUsageRelations = (0, drizzle_orm_1.relations)(exports.chatUsage, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.chatUsage.userId],
        references: [exports.users.id],
    }),
}));
exports.insertChatUsageSchema = (0, drizzle_zod_1.createInsertSchema)(exports.chatUsage).pick({
    userId: true,
    weekStartDate: true,
    chatCount: true,
});
exports.updateChatUsageSchema = (0, drizzle_zod_1.createInsertSchema)(exports.chatUsage).pick({
    chatCount: true,
    lastUpdated: true,
}).partial();
// Wellness Challenge System
exports.challengeTypeEnum = (0, pg_core_1.pgEnum)("challenge_type", [
    "daily_journal",
    "streak_keeper",
    "mood_tracker",
    "goal_achiever",
    "chat_explorer",
    "reflection_master"
]);
exports.challengeStatusEnum = (0, pg_core_1.pgEnum)("challenge_status", [
    "not_started",
    "in_progress",
    "completed",
    "expired"
]);
exports.challenges = (0, pg_core_1.pgTable)("challenges", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    title: (0, pg_core_1.text)("title").notNull(),
    description: (0, pg_core_1.text)("description").notNull(),
    type: (0, exports.challengeTypeEnum)("type").notNull(),
    targetValue: (0, pg_core_1.integer)("target_value").notNull(), // e.g., 7 for "7 days of journaling"
    duration: (0, pg_core_1.integer)("duration").default(7), // Duration in days
    points: (0, pg_core_1.integer)("points").default(100), // Points awarded for completion
    badgeIcon: (0, pg_core_1.text)("badge_icon").default("🏆"), // Emoji or icon identifier
    badgeColor: (0, pg_core_1.text)("badge_color").default("#FFD700"), // Hex color for badge
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.userChallenges = (0, pg_core_1.pgTable)("user_challenges", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull().references(() => exports.users.id),
    challengeId: (0, pg_core_1.integer)("challenge_id").notNull().references(() => exports.challenges.id),
    status: (0, exports.challengeStatusEnum)("status").default("not_started"),
    currentProgress: (0, pg_core_1.integer)("current_progress").default(0),
    startedAt: (0, pg_core_1.timestamp)("started_at"),
    completedAt: (0, pg_core_1.timestamp)("completed_at"),
    expiresAt: (0, pg_core_1.timestamp)("expires_at"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.userBadges = (0, pg_core_1.pgTable)("user_badges", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull().references(() => exports.users.id),
    challengeId: (0, pg_core_1.integer)("challenge_id").notNull().references(() => exports.challenges.id),
    earnedAt: (0, pg_core_1.timestamp)("earned_at").defaultNow(),
    points: (0, pg_core_1.integer)("points").notNull(),
});
exports.challengesRelations = (0, drizzle_orm_1.relations)(exports.challenges, ({ many }) => ({
    userChallenges: many(exports.userChallenges),
    userBadges: many(exports.userBadges),
}));
exports.userChallengesRelations = (0, drizzle_orm_1.relations)(exports.userChallenges, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.userChallenges.userId],
        references: [exports.users.id],
    }),
    challenge: one(exports.challenges, {
        fields: [exports.userChallenges.challengeId],
        references: [exports.challenges.id],
    }),
}));
exports.userBadgesRelations = (0, drizzle_orm_1.relations)(exports.userBadges, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.userBadges.userId],
        references: [exports.users.id],
    }),
    challenge: one(exports.challenges, {
        fields: [exports.userBadges.challengeId],
        references: [exports.challenges.id],
    }),
}));
// Challenge schema definitions
exports.insertChallengeSchema = (0, drizzle_zod_1.createInsertSchema)(exports.challenges).pick({
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
exports.updateChallengeSchema = (0, drizzle_zod_1.createInsertSchema)(exports.challenges).pick({
    title: true,
    description: true,
    targetValue: true,
    duration: true,
    points: true,
    badgeIcon: true,
    badgeColor: true,
    isActive: true,
}).partial();
exports.insertUserChallengeSchema = (0, drizzle_zod_1.createInsertSchema)(exports.userChallenges).pick({
    userId: true,
    challengeId: true,
    status: true,
    currentProgress: true,
    startedAt: true,
    expiresAt: true,
});
exports.updateUserChallengeSchema = (0, drizzle_zod_1.createInsertSchema)(exports.userChallenges).pick({
    status: true,
    currentProgress: true,
    completedAt: true,
}).partial();
exports.insertUserBadgeSchema = (0, drizzle_zod_1.createInsertSchema)(exports.userBadges).pick({
    userId: true,
    challengeId: true,
    points: true,
});
// Check-ins system
exports.checkIns = (0, pg_core_1.pgTable)("check_ins", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull().references(() => exports.users.id),
    type: (0, pg_core_1.text)("type").notNull(), // 'counselor', 'philosopher', 'daily_checkin', 'follow_up'
    question: (0, pg_core_1.text)("question").notNull(),
    originalDate: (0, pg_core_1.timestamp)("original_date").notNull(), // When the conversation happened
    scheduledDate: (0, pg_core_1.timestamp)("scheduled_date").notNull(), // When to follow up
    isAnswered: (0, pg_core_1.boolean)("is_answered").default(false),
    userResponse: (0, pg_core_1.text)("user_response"),
    aiFollowUp: (0, pg_core_1.text)("ai_follow_up"),
    priority: (0, pg_core_1.text)("priority").default("normal"), // 'low', 'normal', 'high', 'urgent'
    tags: (0, pg_core_1.text)("tags").array(), // Tags for categorizing issues
    relatedEntryId: (0, pg_core_1.integer)("related_entry_id").references(() => exports.journalEntries.id), // Link to journal entry
    isResolved: (0, pg_core_1.boolean)("is_resolved").default(false), // Whether the issue was resolved
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.checkInsRelations = (0, drizzle_orm_1.relations)(exports.checkIns, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.checkIns.userId],
        references: [exports.users.id],
    }),
}));
exports.insertCheckInSchema = (0, drizzle_zod_1.createInsertSchema)(exports.checkIns).pick({
    userId: true,
    type: true,
    question: true,
    originalDate: true,
    scheduledDate: true,
    priority: true,
    tags: true,
    relatedEntryId: true,
});
exports.updateCheckInSchema = (0, drizzle_zod_1.createInsertSchema)(exports.checkIns).pick({
    isAnswered: true,
    userResponse: true,
    aiFollowUp: true,
    priority: true,
    tags: true,
    isResolved: true,
}).partial();
