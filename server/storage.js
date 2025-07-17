"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.MemStorage = exports.DatabaseStorage = void 0;
const schema_js_1 = require("../shared/schema.js");
const db_1 = require("./db");
const drizzle_orm_1 = require("drizzle-orm");
class DatabaseStorage {
    // User methods
    getUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const [user] = yield db_1.db.select().from(schema_js_1.users).where((0, drizzle_orm_1.eq)(schema_js_1.users.id, id));
            return user;
        });
    }
    getUserByUsername(username) {
        return __awaiter(this, void 0, void 0, function* () {
            const [user] = yield db_1.db.select().from(schema_js_1.users).where((0, drizzle_orm_1.eq)(schema_js_1.users.username, username));
            return user;
        });
    }
    createUser(insertUser) {
        return __awaiter(this, void 0, void 0, function* () {
            const [user] = yield db_1.db.insert(schema_js_1.users).values(insertUser).returning();
            // Create initial stats for the user
            yield this.updateJournalStats(user.id, {
                entriesCount: 0,
                currentStreak: 0,
                longestStreak: 0,
                topMoods: {}
            });
            return user;
        });
    }
    updateUser(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const [updatedUser] = yield db_1.db.update(schema_js_1.users)
                .set(data)
                .where((0, drizzle_orm_1.eq)(schema_js_1.users.id, id))
                .returning();
            return updatedUser;
        });
    }
    updateStripeCustomerId(userId, stripeCustomerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const [updatedUser] = yield db_1.db.update(schema_js_1.users)
                .set({ stripeCustomerId })
                .where((0, drizzle_orm_1.eq)(schema_js_1.users.id, userId))
                .returning();
            return updatedUser;
        });
    }
    updateUserStripeInfo(userId, stripeCustomerId, stripeSubscriptionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const [updatedUser] = yield db_1.db.update(schema_js_1.users)
                .set({
                stripeCustomerId,
                stripeSubscriptionId,
                hasActiveSubscription: true,
                subscriptionPlan: 'pro' // Default to pro, can be updated later
            })
                .where((0, drizzle_orm_1.eq)(schema_js_1.users.id, userId))
                .returning();
            return updatedUser;
        });
    }
    updateUserTrialInfo(userId, trialEnd, isOnTrial) {
        return __awaiter(this, void 0, void 0, function* () {
            const [updatedUser] = yield db_1.db.update(schema_js_1.users)
                .set({
                stripeTrialEnd: trialEnd,
                isOnStripeTrial: isOnTrial
            })
                .where((0, drizzle_orm_1.eq)(schema_js_1.users.id, userId))
                .returning();
            return updatedUser;
        });
    }
    getUserByStripeCustomerId(customerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const [user] = yield db_1.db.select()
                .from(schema_js_1.users)
                .where((0, drizzle_orm_1.eq)(schema_js_1.users.stripeCustomerId, customerId))
                .limit(1);
            return user || null;
        });
    }
    updateUserSubscriptionStatus(userId, isActive) {
        return __awaiter(this, void 0, void 0, function* () {
            const [updatedUser] = yield db_1.db.update(schema_js_1.users)
                .set({
                hasActiveSubscription: isActive,
                subscriptionPlan: isActive ? 'pro' : null
            })
                .where((0, drizzle_orm_1.eq)(schema_js_1.users.id, userId))
                .returning();
            if (!updatedUser) {
                throw new Error('User not found');
            }
            return updatedUser;
        });
    }
    getUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const [user] = yield db_1.db.select()
                .from(schema_js_1.users)
                .where((0, drizzle_orm_1.eq)(schema_js_1.users.email, email))
                .limit(1);
            return user || null;
        });
    }
    updateUserSubscription(userId, isActive, planName) {
        return __awaiter(this, void 0, void 0, function* () {
            const [updatedUser] = yield db_1.db.update(schema_js_1.users)
                .set({
                hasActiveSubscription: isActive,
                subscriptionPlan: planName
            })
                .where((0, drizzle_orm_1.eq)(schema_js_1.users.id, userId))
                .returning();
            return updatedUser;
        });
    }
    // Journal entry methods
    getJournalEntry(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const [entry] = yield db_1.db.select().from(schema_js_1.journalEntries).where((0, drizzle_orm_1.eq)(schema_js_1.journalEntries.id, id));
            return entry;
        });
    }
    getJournalEntriesByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.db.select()
                .from(schema_js_1.journalEntries)
                .where((0, drizzle_orm_1.eq)(schema_js_1.journalEntries.userId, userId))
                .orderBy((0, drizzle_orm_1.desc)(schema_js_1.journalEntries.date));
        });
    }
    getJournalEntriesByDate(userId, year, month, day) {
        return __awaiter(this, void 0, void 0, function* () {
            const startDate = new Date(year, month - 1, day || 1);
            let endDate;
            if (day) {
                // If day is provided, get entries for that specific day
                endDate = new Date(year, month - 1, day, 23, 59, 59, 999);
            }
            else {
                // If only month is provided, get entries for the whole month
                endDate = new Date(year, month, 0, 23, 59, 59, 999);
            }
            return yield db_1.db.select()
                .from(schema_js_1.journalEntries)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.journalEntries.userId, userId), 
            // Use gte and lte for date comparison
            (0, drizzle_orm_1.gte)(schema_js_1.journalEntries.date, startDate), (0, drizzle_orm_1.lte)(schema_js_1.journalEntries.date, endDate)))
                .orderBy((0, drizzle_orm_1.desc)(schema_js_1.journalEntries.date));
        });
    }
    createJournalEntry(entry) {
        return __awaiter(this, void 0, void 0, function* () {
            const [newEntry] = yield db_1.db.insert(schema_js_1.journalEntries)
                .values(Object.assign(Object.assign({}, entry), { date: entry.date ? new Date(entry.date) : new Date() }))
                .returning();
            // Update stats
            yield this.updateStatsAfterNewEntry(newEntry.userId, newEntry);
            return newEntry;
        });
    }
    updateJournalEntry(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const [updatedEntry] = yield db_1.db.update(schema_js_1.journalEntries)
                .set(data)
                .where((0, drizzle_orm_1.eq)(schema_js_1.journalEntries.id, id))
                .returning();
            return updatedEntry;
        });
    }
    deleteJournalEntry(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const [deletedEntry] = yield db_1.db.delete(schema_js_1.journalEntries)
                .where((0, drizzle_orm_1.eq)(schema_js_1.journalEntries.id, id))
                .returning();
            return !!deletedEntry;
        });
    }
    // Journal stats methods
    getJournalStats(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const [stats] = yield db_1.db.select()
                .from(schema_js_1.journalStats)
                .where((0, drizzle_orm_1.eq)(schema_js_1.journalStats.userId, userId));
            return stats;
        });
    }
    updateJournalStats(userId, stats) {
        return __awaiter(this, void 0, void 0, function* () {
            let existingStats = yield this.getJournalStats(userId);
            if (!existingStats) {
                // Create initial stats for the user
                const [newStats] = yield db_1.db.insert(schema_js_1.journalStats)
                    .values({
                    userId,
                    entriesCount: stats.entriesCount || 0,
                    currentStreak: stats.currentStreak || 0,
                    longestStreak: stats.longestStreak || 0,
                    topMoods: stats.topMoods || {},
                    lastUpdated: new Date()
                })
                    .returning();
                return newStats;
            }
            else {
                // Update existing stats
                const [updatedStats] = yield db_1.db.update(schema_js_1.journalStats)
                    .set(Object.assign(Object.assign({}, stats), { lastUpdated: new Date() }))
                    .where((0, drizzle_orm_1.eq)(schema_js_1.journalStats.userId, userId))
                    .returning();
                return updatedStats;
            }
        });
    }
    // Goals methods
    getGoal(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const [goal] = yield db_1.db.select().from(schema_js_1.goals).where((0, drizzle_orm_1.eq)(schema_js_1.goals.id, id));
            return goal;
        });
    }
    getGoalsByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.db.select()
                .from(schema_js_1.goals)
                .where((0, drizzle_orm_1.eq)(schema_js_1.goals.userId, userId))
                .orderBy((0, drizzle_orm_1.desc)(schema_js_1.goals.createdAt));
        });
    }
    getGoalsByType(userId, type) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.db.select()
                .from(schema_js_1.goals)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.goals.userId, userId), (0, drizzle_orm_1.eq)(schema_js_1.goals.type, type) // Type cast to handle enum
            ))
                .orderBy((0, drizzle_orm_1.desc)(schema_js_1.goals.createdAt));
        });
    }
    getGoalsByParentId(parentId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.db.select()
                .from(schema_js_1.goals)
                .where((0, drizzle_orm_1.eq)(schema_js_1.goals.parentGoalId, parentId))
                .orderBy((0, drizzle_orm_1.desc)(schema_js_1.goals.createdAt));
        });
    }
    createGoal(goal) {
        return __awaiter(this, void 0, void 0, function* () {
            // Create a new object with the correct properties from the schema
            const insertData = {
                userId: goal.userId,
                title: goal.title,
                type: goal.type,
                description: goal.description || null,
                status: goal.status || 'not_started',
                parentGoalId: goal.parentGoalId || null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            // Only add targetDate if it exists
            if (goal.targetDate) {
                insertData.targetDate = new Date(goal.targetDate);
            }
            const [newGoal] = yield db_1.db.insert(schema_js_1.goals)
                .values(insertData)
                .returning();
            return newGoal;
        });
    }
    updateGoal(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            // Create a new update object with only the valid fields
            const updateData = {
                updatedAt: new Date()
            };
            // Copy over valid properties
            if (data.title !== undefined)
                updateData.title = data.title;
            if (data.description !== undefined)
                updateData.description = data.description;
            if (data.type !== undefined)
                updateData.type = data.type;
            if (data.status !== undefined)
                updateData.status = data.status;
            if (data.progress !== undefined)
                updateData.progress = data.progress;
            if (data.parentGoalId !== undefined)
                updateData.parentGoalId = data.parentGoalId;
            if (data.timeSpent !== undefined)
                updateData.timeSpent = data.timeSpent;
            // Handle date fields correctly
            if (data.targetDate) {
                updateData.targetDate = new Date(data.targetDate);
            }
            if (data.completedDate) {
                updateData.completedDate = new Date(data.completedDate);
            }
            else if (data.completedDate === null) {
                updateData.completedDate = null;
            }
            const [updatedGoal] = yield db_1.db.update(schema_js_1.goals)
                .set(updateData)
                .where((0, drizzle_orm_1.eq)(schema_js_1.goals.id, id))
                .returning();
            return updatedGoal;
        });
    }
    deleteGoal(id) {
        return __awaiter(this, void 0, void 0, function* () {
            // First, delete all child goals
            const childGoals = yield this.getGoalsByParentId(id);
            for (const childGoal of childGoals) {
                yield this.deleteGoal(childGoal.id);
            }
            // Then delete all activities associated with this goal
            yield db_1.db.delete(schema_js_1.goalActivities)
                .where((0, drizzle_orm_1.eq)(schema_js_1.goalActivities.goalId, id));
            // Finally delete the goal itself
            const [deletedGoal] = yield db_1.db.delete(schema_js_1.goals)
                .where((0, drizzle_orm_1.eq)(schema_js_1.goals.id, id))
                .returning();
            return !!deletedGoal;
        });
    }
    // Goal Activities methods
    getGoalActivity(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const [activity] = yield db_1.db.select()
                .from(schema_js_1.goalActivities)
                .where((0, drizzle_orm_1.eq)(schema_js_1.goalActivities.id, id));
            return activity;
        });
    }
    getGoalActivitiesByGoalId(goalId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.db.select()
                .from(schema_js_1.goalActivities)
                .where((0, drizzle_orm_1.eq)(schema_js_1.goalActivities.goalId, goalId))
                .orderBy((0, drizzle_orm_1.desc)(schema_js_1.goalActivities.date));
        });
    }
    createGoalActivity(activity) {
        return __awaiter(this, void 0, void 0, function* () {
            // Create a new object with only the properties from the schema
            const insertData = {
                goalId: activity.goalId,
                description: activity.description || null,
                // Ensure minutes spent is always a positive value in the database
                // Negative values are only used as an indication to subtract time
                minutesSpent: Math.abs(activity.minutesSpent || 0),
                progressIncrement: activity.progressIncrement || 0
            };
            // Handle date conversion properly
            if (activity.date) {
                insertData.date = new Date(activity.date);
            }
            else {
                insertData.date = new Date();
            }
            const [newActivity] = yield db_1.db.insert(schema_js_1.goalActivities)
                .values(insertData)
                .returning();
            // Update the parent goal's progress and time spent
            const goal = yield this.getGoal(newActivity.goalId);
            if (goal) {
                let totalMinutesSpent;
                // Check if this was a "subtract time" operation
                if ((activity.minutesSpent || 0) < 0) {
                    // This is a time reduction operation
                    // Calculate the new total (current minus the absolute value)
                    totalMinutesSpent = Math.max(0, (goal.timeSpent || 0) - Math.abs(activity.minutesSpent || 0));
                }
                else {
                    // Regular time addition - calculate from all activities
                    const allActivities = yield this.getGoalActivitiesByGoalId(goal.id);
                    totalMinutesSpent = allActivities.reduce((total, a) => total + (a.minutesSpent || 0), 0);
                }
                // Calculate progress based on the increment provided
                let progress = goal.progress || 0;
                if (newActivity.progressIncrement) {
                    progress = Math.min(100, progress + newActivity.progressIncrement);
                    // If we're subtracting time, ensure progress doesn't go below zero
                    if ((activity.minutesSpent || 0) < 0) {
                        progress = Math.max(0, progress);
                    }
                }
                // Create an update object with the correct properties
                const updateData = {
                    timeSpent: totalMinutesSpent,
                    progress: progress
                };
                // If progress is 100%, mark as completed
                if (progress >= 100) {
                    updateData.status = 'completed';
                    updateData.completedDate = new Date();
                }
                else if (goal.status === 'completed' && progress < 100) {
                    // If we reduced time and the goal was completed, mark it back as in progress
                    updateData.status = 'in_progress';
                    updateData.completedDate = null;
                }
                // Update the goal
                yield this.updateGoal(goal.id, updateData);
            }
            return newActivity;
        });
    }
    updateGoalActivity(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const [updatedActivity] = yield db_1.db.update(schema_js_1.goalActivities)
                .set(data)
                .where((0, drizzle_orm_1.eq)(schema_js_1.goalActivities.id, id))
                .returning();
            if (updatedActivity) {
                // Update the parent goal's progress and time spent
                const goal = yield this.getGoal(updatedActivity.goalId);
                if (goal) {
                    const allActivities = yield this.getGoalActivitiesByGoalId(goal.id);
                    // Calculate total time spent
                    const totalMinutesSpent = allActivities.reduce((total, a) => total + (a.minutesSpent || 0), 0);
                    // Calculate progress based on all activities
                    const totalProgress = allActivities.reduce((total, a) => total + (a.progressIncrement || 0), 0);
                    const progress = Math.min(100, totalProgress);
                    // Update the goal
                    yield this.updateGoal(goal.id, Object.assign({ timeSpent: totalMinutesSpent, progress }, (progress >= 100 ? {
                        status: 'completed',
                        completedDate: new Date()
                    } : {})));
                }
            }
            return updatedActivity;
        });
    }
    deleteGoalActivity(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const activity = yield this.getGoalActivity(id);
            if (!activity)
                return false;
            const [deletedActivity] = yield db_1.db.delete(schema_js_1.goalActivities)
                .where((0, drizzle_orm_1.eq)(schema_js_1.goalActivities.id, id))
                .returning();
            if (deletedActivity) {
                // Update the parent goal's progress and time spent
                const goal = yield this.getGoal(deletedActivity.goalId);
                if (goal) {
                    const allActivities = yield this.getGoalActivitiesByGoalId(goal.id);
                    // Calculate total time spent
                    const totalMinutesSpent = allActivities.reduce((total, a) => total + (a.minutesSpent || 0), 0);
                    // Calculate progress based on all activities
                    const totalProgress = allActivities.reduce((total, a) => total + (a.progressIncrement || 0), 0);
                    const progress = Math.min(100, totalProgress);
                    // Update the goal
                    yield this.updateGoal(goal.id, Object.assign({ timeSpent: totalMinutesSpent, progress }, (goal.status === 'completed' && progress < 100 ? {
                        status: 'in_progress',
                        completedDate: null
                    } : {})));
                }
            }
            return !!deletedActivity;
        });
    }
    // Goals Summary & Analytics
    getGoalsSummary(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const userGoals = yield this.getGoalsByUserId(userId);
            // Calculate summary statistics
            const total = userGoals.length;
            const completed = userGoals.filter(g => g.status === 'completed').length;
            const inProgress = userGoals.filter(g => g.status === 'in_progress').length;
            const timeSpent = userGoals.reduce((total, g) => total + (g.timeSpent || 0), 0);
            // Calculate goals by type
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
        });
    }
    // Helper methods
    updateStatsAfterNewEntry(userId, entry) {
        return __awaiter(this, void 0, void 0, function* () {
            const userEntries = yield this.getJournalEntriesByUserId(userId);
            let stats = yield this.getJournalStats(userId);
            if (!stats) {
                stats = {
                    id: 0, // This will be set by the database
                    userId,
                    entriesCount: 0,
                    currentStreak: 0,
                    longestStreak: 0,
                    topMoods: {},
                    lastUpdated: new Date(),
                };
            }
            // Update entries count
            const entriesCount = userEntries.length;
            // Update streak
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const entryDate = new Date(entry.date);
            entryDate.setHours(0, 0, 0, 0);
            // Check if there was an entry yesterday
            const hasYesterdayEntry = userEntries.some(e => {
                const date = new Date(e.date);
                date.setHours(0, 0, 0, 0);
                return date.getTime() === yesterday.getTime();
            });
            let currentStreak = stats.currentStreak || 0;
            if (entryDate.getTime() === today.getTime()) {
                if (hasYesterdayEntry || currentStreak > 0) {
                    currentStreak += 1;
                }
                else {
                    currentStreak = 1;
                }
            }
            // Update longest streak if needed
            let longestStreak = stats.longestStreak || 0;
            if (currentStreak > longestStreak) {
                longestStreak = currentStreak;
            }
            // Update top moods
            let topMoods = stats.topMoods || {};
            // Update top moods
            if (entry.moods && entry.moods.length > 0) {
                if (!topMoods) {
                    topMoods = {};
                }
                entry.moods.forEach(mood => {
                    topMoods[mood] = (topMoods[mood] || 0) + 1;
                });
            }
            yield this.updateJournalStats(userId, {
                entriesCount,
                currentStreak,
                longestStreak,
                topMoods
            });
        });
    }
    // Chat Usage Tracking Methods
    getCurrentWeekChatUsage(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Get the start of the current week (Sunday)
            const now = new Date();
            const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday, etc.
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - dayOfWeek); // Go back to Sunday
            startOfWeek.setHours(0, 0, 0, 0); // Start of the day
            // Find usage record for this week
            const [usage] = yield db_1.db.select()
                .from(schema_js_1.chatUsage)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.chatUsage.userId, userId), (0, drizzle_orm_1.gte)(schema_js_1.chatUsage.weekStartDate, startOfWeek)));
            return usage;
        });
    }
    incrementChatUsage(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Get the start of the current week (Sunday)
            const now = new Date();
            const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday, etc.
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - dayOfWeek); // Go back to Sunday
            startOfWeek.setHours(0, 0, 0, 0); // Start of the day
            // Get or create usage record for this week
            let currentUsage = yield this.getCurrentWeekChatUsage(userId);
            if (!currentUsage) {
                // Create new usage record for this week
                const [newUsage] = yield db_1.db.insert(schema_js_1.chatUsage)
                    .values({
                    userId,
                    weekStartDate: startOfWeek,
                    chatCount: 1,
                    lastUpdated: now
                })
                    .returning();
                return newUsage;
            }
            else {
                // Update existing usage record
                const [updatedUsage] = yield db_1.db.update(schema_js_1.chatUsage)
                    .set({
                    chatCount: currentUsage.chatCount + 1,
                    lastUpdated: now
                })
                    .where((0, drizzle_orm_1.eq)(schema_js_1.chatUsage.id, currentUsage.id))
                    .returning();
                return updatedUsage;
            }
        });
    }
    canSendChatMessage(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Get user to check subscription status
            const user = yield this.getUser(userId);
            console.log('Chat limit check for user:', userId, {
                user: user ? {
                    id: user.id,
                    subscriptionPlan: user.subscriptionPlan,
                    hasActiveSubscription: user.hasActiveSubscription
                } : null
            });
            if (!user) {
                return { canSend: false, remaining: 0 };
            }
            // If user has unlimited subscription, they can always send messages
            if (user.subscriptionPlan === 'unlimited' && user.hasActiveSubscription) {
                console.log('User has unlimited subscription, allowing message');
                return { canSend: true, remaining: -1 }; // -1 indicates unlimited
            }
            // For pro users, check weekly limit (15 messages)
            if (user.subscriptionPlan === 'pro' && user.hasActiveSubscription) {
                const weeklyLimit = 15;
                const currentUsage = yield this.getCurrentWeekChatUsage(userId);
                if (!currentUsage) {
                    // No usage yet this week
                    return { canSend: true, remaining: weeklyLimit };
                }
                const remaining = Math.max(0, weeklyLimit - currentUsage.chatCount);
                return { canSend: remaining > 0, remaining };
            }
            // Free users get no chat messages
            return { canSend: false, remaining: 0 };
        });
    }
    // Check-ins methods
    getCheckInsByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const checkInsList = yield db_1.db.select()
                .from(schema_js_1.checkIns)
                .where((0, drizzle_orm_1.eq)(schema_js_1.checkIns.userId, userId))
                .orderBy((0, drizzle_orm_1.desc)(schema_js_1.checkIns.scheduledDate));
            return checkInsList;
        });
    }
    getPendingCheckIns(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const now = new Date();
            const pendingCheckIns = yield db_1.db.select()
                .from(schema_js_1.checkIns)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.checkIns.userId, userId), (0, drizzle_orm_1.eq)(schema_js_1.checkIns.isAnswered, false), (0, drizzle_orm_1.lte)(schema_js_1.checkIns.scheduledDate, now)))
                .orderBy((0, drizzle_orm_1.desc)(schema_js_1.checkIns.scheduledDate));
            return pendingCheckIns;
        });
    }
    createCheckIn(checkIn) {
        return __awaiter(this, void 0, void 0, function* () {
            const [newCheckIn] = yield db_1.db.insert(schema_js_1.checkIns)
                .values(checkIn)
                .returning();
            return newCheckIn;
        });
    }
    updateCheckIn(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const [updatedCheckIn] = yield db_1.db.update(schema_js_1.checkIns)
                .set(data)
                .where((0, drizzle_orm_1.eq)(schema_js_1.checkIns.id, id))
                .returning();
            return updatedCheckIn;
        });
    }
    deleteCheckIn(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const [deletedCheckIn] = yield db_1.db.delete(schema_js_1.checkIns)
                .where((0, drizzle_orm_1.eq)(schema_js_1.checkIns.id, id))
                .returning();
            return !!deletedCheckIn;
        });
    }
    getUnresolvedCheckIns(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const unresolvedCheckIns = yield db_1.db.select()
                .from(schema_js_1.checkIns)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.checkIns.userId, userId), (0, drizzle_orm_1.eq)(schema_js_1.checkIns.isAnswered, true), (0, drizzle_orm_1.eq)(schema_js_1.checkIns.isResolved, false)))
                .orderBy((0, drizzle_orm_1.desc)(schema_js_1.checkIns.originalDate));
            return unresolvedCheckIns;
        });
    }
    createDailyCheckIn(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const now = new Date();
            const dailyQuestions = [
                "How are you feeling today? What's on your mind?",
                "What emotions have you experienced today, and what triggered them?",
                "What's one thing that's challenging you right now?",
                "How has your energy level been today?",
                "What's something you're grateful for today?",
                "What patterns in your thoughts or feelings have you noticed lately?",
                "How are you taking care of yourself today?",
                "What's weighing on your heart today?",
                "How connected do you feel to the people around you?",
                "What would you like to work on or improve about yourself?"
            ];
            const randomQuestion = dailyQuestions[Math.floor(Math.random() * dailyQuestions.length)];
            const checkIn = {
                userId,
                type: 'daily_checkin',
                question: randomQuestion,
                originalDate: now,
                scheduledDate: now,
                priority: 'normal',
                tags: ['daily', 'wellness'],
                relatedEntryId: null
            };
            return yield this.createCheckIn(checkIn);
        });
    }
    getLastCheckInDate(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const [lastCheckIn] = yield db_1.db.select({
                createdAt: schema_js_1.checkIns.createdAt
            })
                .from(schema_js_1.checkIns)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.checkIns.userId, userId), (0, drizzle_orm_1.eq)(schema_js_1.checkIns.type, 'daily_checkin')))
                .orderBy((0, drizzle_orm_1.desc)(schema_js_1.checkIns.createdAt))
                .limit(1);
            return lastCheckIn ? lastCheckIn.createdAt : null;
        });
    }
    // Challenge System Methods
    getAllChallenges() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.db.select().from(schema_js_1.challenges).orderBy(schema_js_1.challenges.id);
        });
    }
    getActiveChallenges() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.db.select()
                .from(schema_js_1.challenges)
                .where((0, drizzle_orm_1.eq)(schema_js_1.challenges.isActive, true))
                .orderBy(schema_js_1.challenges.points);
        });
    }
    getUserChallenges(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.db.select()
                .from(schema_js_1.userChallenges)
                .where((0, drizzle_orm_1.eq)(schema_js_1.userChallenges.userId, userId))
                .orderBy((0, drizzle_orm_1.desc)(schema_js_1.userChallenges.createdAt));
        });
    }
    getUserActiveChallenges(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.db.select()
                .from(schema_js_1.userChallenges)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.userChallenges.userId, userId), (0, drizzle_orm_1.sql) `${schema_js_1.userChallenges.status} IN ('not_started', 'in_progress')`))
                .orderBy((0, drizzle_orm_1.desc)(schema_js_1.userChallenges.createdAt));
        });
    }
    getUserBadges(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.db.select()
                .from(schema_js_1.userBadges)
                .where((0, drizzle_orm_1.eq)(schema_js_1.userBadges.userId, userId))
                .orderBy((0, drizzle_orm_1.desc)(schema_js_1.userBadges.earnedAt));
        });
    }
    createChallenge(challenge) {
        return __awaiter(this, void 0, void 0, function* () {
            const [newChallenge] = yield db_1.db.insert(schema_js_1.challenges)
                .values(challenge)
                .returning();
            return newChallenge;
        });
    }
    startUserChallenge(userId, challengeId) {
        return __awaiter(this, void 0, void 0, function* () {
            const challenge = yield db_1.db.select().from(schema_js_1.challenges).where((0, drizzle_orm_1.eq)(schema_js_1.challenges.id, challengeId)).limit(1);
            if (!challenge[0])
                throw new Error('Challenge not found');
            const now = new Date();
            const expiresAt = new Date(now.getTime() + (challenge[0].duration * 24 * 60 * 60 * 1000));
            const [userChallenge] = yield db_1.db.insert(schema_js_1.userChallenges)
                .values({
                userId,
                challengeId,
                status: 'in_progress',
                currentProgress: 0,
                startedAt: now,
                expiresAt,
            })
                .returning();
            return userChallenge;
        });
    }
    updateUserChallengeProgress(userId, challengeId, progress) {
        return __awaiter(this, void 0, void 0, function* () {
            const challenge = yield db_1.db.select().from(schema_js_1.challenges).where((0, drizzle_orm_1.eq)(schema_js_1.challenges.id, challengeId)).limit(1);
            if (!challenge[0])
                return undefined;
            const [updated] = yield db_1.db.update(schema_js_1.userChallenges)
                .set({
                currentProgress: progress,
                status: progress >= challenge[0].targetValue ? 'completed' : 'in_progress',
                completedAt: progress >= challenge[0].targetValue ? new Date() : null,
            })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.userChallenges.userId, userId), (0, drizzle_orm_1.eq)(schema_js_1.userChallenges.challengeId, challengeId)))
                .returning();
            // If challenge is completed, award badge
            if (updated && progress >= challenge[0].targetValue) {
                yield this.completeUserChallenge(userId, challengeId);
            }
            return updated;
        });
    }
    completeUserChallenge(userId, challengeId) {
        return __awaiter(this, void 0, void 0, function* () {
            const challenge = yield db_1.db.select().from(schema_js_1.challenges).where((0, drizzle_orm_1.eq)(schema_js_1.challenges.id, challengeId)).limit(1);
            if (!challenge[0])
                throw new Error('Challenge not found');
            // Check if badge already exists
            const existingBadge = yield db_1.db.select()
                .from(schema_js_1.userBadges)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.userBadges.userId, userId), (0, drizzle_orm_1.eq)(schema_js_1.userBadges.challengeId, challengeId)))
                .limit(1);
            if (existingBadge[0])
                return existingBadge[0];
            const [badge] = yield db_1.db.insert(schema_js_1.userBadges)
                .values({
                userId,
                challengeId,
                points: challenge[0].points,
            })
                .returning();
            return badge;
        });
    }
    getUserChallengeStats(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const badges = yield this.getUserBadges(userId);
            const userChallengesList = yield this.getUserChallenges(userId);
            const totalBadges = badges.length;
            const totalPoints = badges.reduce((sum, badge) => sum + badge.points, 0);
            const activeChallenges = userChallengesList.filter(uc => uc.status === 'in_progress' || uc.status === 'not_started').length;
            const completedChallenges = userChallengesList.filter(uc => uc.status === 'completed').length;
            return {
                totalBadges,
                totalPoints,
                activeChallenges,
                completedChallenges,
            };
        });
    }
}
exports.DatabaseStorage = DatabaseStorage;
// Create a default user
function createDefaultUser() {
    return __awaiter(this, void 0, void 0, function* () {
        const storage = new DatabaseStorage();
        const existingUser = yield storage.getUserByUsername("demo");
        if (!existingUser) {
            yield storage.createUser({ username: "demo", password: "demo" });
            console.log("Created default demo user");
        }
    });
}
class MemStorage {
    constructor() {
        this.users = new Map();
        this.journalEntries = new Map();
        this.journalStats = new Map();
        this.goals = new Map();
        this.goalActivities = new Map();
        this.chatUsage = new Map();
        this.checkIns = new Map();
        this.nextUserId = 1;
        this.nextEntryId = 1;
        this.nextGoalId = 1;
        this.nextActivityId = 1;
        this.nextChatUsageId = 1;
        this.nextCheckInId = 1;
        // Create a default user for testing
        const user = {
            id: this.nextUserId++,
            username: "demo",
            password: "$2b$10$K7L/8Y1t85jzrKyqd4Wn8OXhDxmK9XzjGkOqHZxqHZxqHZxqHZxqH", // password: "demo"
            email: "demo@example.com",
            phoneNumber: null,
            trialStartedAt: new Date(),
            trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            hasActiveSubscription: false,
            subscriptionPlan: 'trial',
            stripeCustomerId: null,
            stripeSubscriptionId: null,
        };
        this.users.set(user.id, user);
    }
    // User methods
    getUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.users.get(id);
        });
    }
    getUserByUsername(username) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const user of this.users.values()) {
                if (user.username === username) {
                    return user;
                }
            }
            return undefined;
        });
    }
    createUser(insertUser) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = {
                id: this.nextUserId++,
                username: insertUser.username,
                password: insertUser.password,
                email: insertUser.email || null,
                phoneNumber: insertUser.phoneNumber || null,
                trialStartedAt: new Date(),
                trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                hasActiveSubscription: false,
                subscriptionPlan: 'trial',
                stripeCustomerId: null,
                stripeSubscriptionId: null,
            };
            this.users.set(user.id, user);
            return user;
        });
    }
    updateUser(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = this.users.get(id);
            if (!user)
                return undefined;
            const updatedUser = Object.assign(Object.assign({}, user), data);
            this.users.set(id, updatedUser);
            return updatedUser;
        });
    }
    updateStripeCustomerId(userId, stripeCustomerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = this.users.get(userId);
            if (!user)
                return undefined;
            const updatedUser = Object.assign(Object.assign({}, user), { stripeCustomerId });
            this.users.set(userId, updatedUser);
            return updatedUser;
        });
    }
    updateUserStripeInfo(userId, stripeCustomerId, stripeSubscriptionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = this.users.get(userId);
            if (!user)
                return undefined;
            const updatedUser = Object.assign(Object.assign({}, user), { stripeCustomerId,
                stripeSubscriptionId, hasActiveSubscription: true, subscriptionPlan: 'pro' });
            this.users.set(userId, updatedUser);
            return updatedUser;
        });
    }
    // Journal entry methods
    getJournalEntry(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.journalEntries.get(id);
        });
    }
    getJournalEntriesByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return Array.from(this.journalEntries.values())
                .filter(entry => entry.userId === userId)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        });
    }
    getJournalEntriesByDate(userId, year, month, day) {
        return __awaiter(this, void 0, void 0, function* () {
            const entries = Array.from(this.journalEntries.values())
                .filter(entry => entry.userId === userId);
            return entries.filter(entry => {
                const entryDate = new Date(entry.date);
                const entryYear = entryDate.getFullYear();
                const entryMonth = entryDate.getMonth() + 1;
                const entryDay = entryDate.getDate();
                if (day) {
                    return entryYear === year && entryMonth === month && entryDay === day;
                }
                else {
                    return entryYear === year && entryMonth === month;
                }
            });
        });
    }
    createJournalEntry(entry) {
        return __awaiter(this, void 0, void 0, function* () {
            const journalEntry = Object.assign(Object.assign({ id: this.nextEntryId++ }, entry), { title: entry.title || null, moods: entry.moods || null, aiResponse: null, isFavorite: false, date: entry.date ? new Date(entry.date) : new Date() });
            this.journalEntries.set(journalEntry.id, journalEntry);
            return journalEntry;
        });
    }
    updateJournalEntry(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const entry = this.journalEntries.get(id);
            if (!entry)
                return undefined;
            const updatedEntry = Object.assign(Object.assign({}, entry), data);
            this.journalEntries.set(id, updatedEntry);
            return updatedEntry;
        });
    }
    deleteJournalEntry(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.journalEntries.delete(id);
        });
    }
    // Journal stats methods
    getJournalStats(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.journalStats.get(userId);
        });
    }
    updateJournalStats(userId, stats) {
        return __awaiter(this, void 0, void 0, function* () {
            const existing = this.journalStats.get(userId);
            const updated = Object.assign(Object.assign({ id: (existing === null || existing === void 0 ? void 0 : existing.id) || userId, userId, entriesCount: 0, currentStreak: 0, longestStreak: 0, topMoods: {}, lastUpdated: new Date() }, existing), stats);
            this.journalStats.set(userId, updated);
            return updated;
        });
    }
    // Goal methods
    getGoal(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.goals.get(id);
        });
    }
    getGoalsByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return Array.from(this.goals.values()).filter(goal => goal.userId === userId);
        });
    }
    getGoalsByType(userId, type) {
        return __awaiter(this, void 0, void 0, function* () {
            return Array.from(this.goals.values())
                .filter(goal => goal.userId === userId && goal.type === type);
        });
    }
    getGoalsByParentId(parentId) {
        return __awaiter(this, void 0, void 0, function* () {
            return Array.from(this.goals.values())
                .filter(goal => goal.parentGoalId === parentId);
        });
    }
    createGoal(goal) {
        return __awaiter(this, void 0, void 0, function* () {
            const newGoal = Object.assign(Object.assign({ id: this.nextGoalId++ }, goal), { description: goal.description || null, status: goal.status || 'not_started', progress: 0, timeSpent: 0, completedDate: null, parentGoalId: goal.parentGoalId || null, targetDate: goal.targetDate || null, createdAt: new Date(), updatedAt: new Date() });
            this.goals.set(newGoal.id, newGoal);
            return newGoal;
        });
    }
    updateGoal(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const goal = this.goals.get(id);
            if (!goal)
                return undefined;
            const updatedGoal = Object.assign(Object.assign(Object.assign({}, goal), data), { updatedAt: new Date() });
            this.goals.set(id, updatedGoal);
            return updatedGoal;
        });
    }
    deleteGoal(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.goals.delete(id);
        });
    }
    // Goal activity methods
    getGoalActivity(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.goalActivities.get(id);
        });
    }
    getGoalActivitiesByGoalId(goalId) {
        return __awaiter(this, void 0, void 0, function* () {
            return Array.from(this.goalActivities.values())
                .filter(activity => activity.goalId === goalId);
        });
    }
    createGoalActivity(activity) {
        return __awaiter(this, void 0, void 0, function* () {
            const newActivity = {
                id: this.nextActivityId++,
                goalId: activity.goalId,
                date: activity.date || new Date().toISOString().split('T')[0],
                description: activity.description || null,
                minutesSpent: activity.minutesSpent || null,
                progressIncrement: activity.progressIncrement || null,
            };
            this.goalActivities.set(newActivity.id, newActivity);
            return newActivity;
        });
    }
    updateGoalActivity(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const activity = this.goalActivities.get(id);
            if (!activity)
                return undefined;
            const updatedActivity = Object.assign(Object.assign({}, activity), data);
            this.goalActivities.set(id, updatedActivity);
            return updatedActivity;
        });
    }
    deleteGoalActivity(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.goalActivities.delete(id);
        });
    }
    getGoalsSummary(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const userGoals = Array.from(this.goals.values()).filter(goal => goal.userId === userId);
            const summary = {
                total: userGoals.length,
                completed: userGoals.filter(goal => goal.status === 'completed').length,
                inProgress: userGoals.filter(goal => goal.status === 'in_progress').length,
                timeSpent: 0,
                byType: {}
            };
            // Calculate time spent and group by type
            for (const goal of userGoals) {
                summary.timeSpent += goal.timeSpent || 0;
                summary.byType[goal.type] = (summary.byType[goal.type] || 0) + 1;
            }
            return summary;
        });
    }
    // Chat usage methods
    getCurrentWeekChatUsage(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.chatUsage.get(userId);
        });
    }
    incrementChatUsage(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const existing = this.chatUsage.get(userId);
            const updated = {
                id: (existing === null || existing === void 0 ? void 0 : existing.id) || this.nextChatUsageId++,
                userId,
                weekStartDate: new Date(),
                chatCount: ((existing === null || existing === void 0 ? void 0 : existing.chatCount) || 0) + 1,
                lastUpdated: new Date(),
            };
            this.chatUsage.set(userId, updated);
            return updated;
        });
    }
    canSendChatMessage(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const usage = this.chatUsage.get(userId);
            const messageCount = (usage === null || usage === void 0 ? void 0 : usage.chatCount) || 0;
            const remaining = Math.max(0, 50 - messageCount);
            return {
                canSend: remaining > 0,
                remaining
            };
        });
    }
    // Check-ins methods
    getCheckInsByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return Array.from(this.checkIns.values())
                .filter(checkIn => checkIn.userId === userId)
                .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());
        });
    }
    getPendingCheckIns(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const now = new Date();
            return Array.from(this.checkIns.values())
                .filter(checkIn => checkIn.userId === userId &&
                !checkIn.isAnswered &&
                new Date(checkIn.scheduledDate) <= now)
                .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());
        });
    }
    createCheckIn(checkIn) {
        return __awaiter(this, void 0, void 0, function* () {
            const newCheckIn = Object.assign(Object.assign({ id: this.nextCheckInId++ }, checkIn), { isAnswered: false, userResponse: null, aiFollowUp: null, createdAt: new Date() });
            this.checkIns.set(newCheckIn.id, newCheckIn);
            return newCheckIn;
        });
    }
    updateCheckIn(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const existing = this.checkIns.get(id);
            if (!existing)
                return undefined;
            const updated = Object.assign(Object.assign({}, existing), data);
            this.checkIns.set(id, updated);
            return updated;
        });
    }
    deleteCheckIn(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.checkIns.delete(id);
        });
    }
    getUnresolvedCheckIns(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return Array.from(this.checkIns.values())
                .filter(checkIn => checkIn.userId === userId &&
                checkIn.isAnswered === true &&
                checkIn.isResolved === false)
                .sort((a, b) => new Date(b.originalDate).getTime() - new Date(a.originalDate).getTime());
        });
    }
    createDailyCheckIn(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const now = new Date();
            const dailyQuestions = [
                "How are you feeling today? What's on your mind?",
                "What emotions have you experienced today, and what triggered them?",
                "What's one thing that's challenging you right now?",
                "How has your energy level been today?",
                "What's something you're grateful for today?",
                "What patterns in your thoughts or feelings have you noticed lately?",
                "How are you taking care of yourself today?",
                "What's weighing on your heart today?",
                "How connected do you feel to the people around you?",
                "What would you like to work on or improve about yourself?"
            ];
            const randomQuestion = dailyQuestions[Math.floor(Math.random() * dailyQuestions.length)];
            const checkIn = {
                id: this.nextCheckInId++,
                userId,
                type: 'daily_checkin',
                question: randomQuestion,
                originalDate: now,
                scheduledDate: now,
                isAnswered: false,
                userResponse: null,
                aiFollowUp: null,
                priority: 'normal',
                tags: ['daily', 'wellness'],
                relatedEntryId: null,
                isResolved: false,
                createdAt: now,
            };
            this.checkIns.set(checkIn.id, checkIn);
            return checkIn;
        });
    }
    getLastCheckInDate(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const userCheckIns = Array.from(this.checkIns.values())
                .filter(checkIn => checkIn.userId === userId && checkIn.type === 'daily_checkin')
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            return userCheckIns.length > 0 ? userCheckIns[0].createdAt : null;
        });
    }
    // Challenge methods (stub implementations for MemStorage)
    getAllChallenges() {
        return __awaiter(this, void 0, void 0, function* () {
            return [];
        });
    }
    getActiveChallenges() {
        return __awaiter(this, void 0, void 0, function* () {
            return [];
        });
    }
    getUserChallenges(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return [];
        });
    }
    getUserActiveChallenges(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return [];
        });
    }
    getUserBadges(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return [];
        });
    }
    createChallenge(challenge) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('MemStorage does not support challenge creation');
        });
    }
    startUserChallenge(userId, challengeId) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('MemStorage does not support challenges');
        });
    }
    updateUserChallengeProgress(userId, challengeId, progress) {
        return __awaiter(this, void 0, void 0, function* () {
            return undefined;
        });
    }
    completeUserChallenge(userId, challengeId) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('MemStorage does not support challenges');
        });
    }
    getUserChallengeStats(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                totalBadges: 0,
                totalPoints: 0,
                activeChallenges: 0,
                completedChallenges: 0,
            };
        });
    }
}
exports.MemStorage = MemStorage;
exports.storage = new DatabaseStorage();
