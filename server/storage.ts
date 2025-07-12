import { 
  User, 
  InsertUser, 
  JournalEntry, 
  InsertJournalEntry, 
  JournalStats,
  InsertJournalStats,
  updateJournalEntrySchema,
  Goal,
  InsertGoal,
  GoalActivity,
  InsertGoalActivity,
  ChatUsage,
  InsertChatUsage,
  CheckIn,
  InsertCheckIn,
  Challenge,
  InsertChallenge,
  UserChallenge,
  InsertUserChallenge,
  UserBadge,
  InsertUserBadge,
  users,
  journalEntries, 
  journalStats,
  goals,
  goalActivities,
  chatUsage,
  checkIns,
  challenges,
  userChallenges,
  userBadges
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, lte, isNull, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;

  // Journal entries
  getJournalEntry(id: number): Promise<JournalEntry | undefined>;
  getJournalEntriesByUserId(userId: number): Promise<JournalEntry[]>;
  getJournalEntriesByDate(userId: number, year: number, month: number, day?: number): Promise<JournalEntry[]>;
  createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;
  updateJournalEntry(id: number, data: Partial<JournalEntry>): Promise<JournalEntry | undefined>;
  deleteJournalEntry(id: number): Promise<boolean>;

  // Journal stats
  getJournalStats(userId: number): Promise<JournalStats | undefined>;
  updateJournalStats(userId: number, stats: Partial<JournalStats>): Promise<JournalStats>;
  
  // Goals
  getGoal(id: number): Promise<Goal | undefined>;
  getGoalsByUserId(userId: number): Promise<Goal[]>;
  getGoalsByType(userId: number, type: string): Promise<Goal[]>;
  getGoalsByParentId(parentId: number): Promise<Goal[]>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: number, data: Partial<Goal>): Promise<Goal | undefined>;
  deleteGoal(id: number): Promise<boolean>;
  
  // Goal Activities
  getGoalActivity(id: number): Promise<GoalActivity | undefined>;
  getGoalActivitiesByGoalId(goalId: number): Promise<GoalActivity[]>;
  createGoalActivity(activity: InsertGoalActivity): Promise<GoalActivity>;
  updateGoalActivity(id: number, data: Partial<GoalActivity>): Promise<GoalActivity | undefined>;
  deleteGoalActivity(id: number): Promise<boolean>;
  
  // Goals Summary & Analytics
  getGoalsSummary(userId: number): Promise<{
    total: number;
    completed: number;
    inProgress: number;
    timeSpent: number;
    byType: Record<string, number>;
  }>;
  
  // Chat Usage Tracking
  getCurrentWeekChatUsage(userId: number): Promise<ChatUsage | undefined>;
  incrementChatUsage(userId: number): Promise<ChatUsage>;
  canSendChatMessage(userId: number): Promise<{canSend: boolean; remaining: number}>;
  
  // Check-ins
  getCheckInsByUserId(userId: number): Promise<CheckIn[]>;
  getPendingCheckIns(userId: number): Promise<CheckIn[]>;
  getUnresolvedCheckIns(userId: number): Promise<CheckIn[]>;
  createCheckIn(checkIn: InsertCheckIn): Promise<CheckIn>;
  createDailyCheckIn(userId: number): Promise<CheckIn>;
  updateCheckIn(id: number, data: Partial<CheckIn>): Promise<CheckIn | undefined>;
  deleteCheckIn(id: number): Promise<boolean>;
  getLastCheckInDate(userId: number): Promise<Date | null>;
  
  // Challenges
  getAllChallenges(): Promise<Challenge[]>;
  getActiveChallenges(): Promise<Challenge[]>;
  getUserChallenges(userId: number): Promise<UserChallenge[]>;
  getUserActiveChallenges(userId: number): Promise<UserChallenge[]>;
  getUserBadges(userId: number): Promise<UserBadge[]>;
  createChallenge(challenge: InsertChallenge): Promise<Challenge>;
  startUserChallenge(userId: number, challengeId: number): Promise<UserChallenge>;
  updateUserChallengeProgress(userId: number, challengeId: number, progress: number): Promise<UserChallenge | undefined>;
  completeUserChallenge(userId: number, challengeId: number): Promise<UserBadge>;
  getUserChallengeStats(userId: number): Promise<{
    totalBadges: number;
    totalPoints: number;
    activeChallenges: number;
    completedChallenges: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    
    // Create initial stats for the user
    await this.updateJournalStats(user.id, {
      entriesCount: 0,
      currentStreak: 0,
      longestStreak: 0,
      topMoods: {}
    });
    
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    
    return updatedUser;
  }

  // Journal entry methods
  async getJournalEntry(id: number): Promise<JournalEntry | undefined> {
    const [entry] = await db.select().from(journalEntries).where(eq(journalEntries.id, id));
    return entry;
  }

  async getJournalEntriesByUserId(userId: number): Promise<JournalEntry[]> {
    return await db.select()
      .from(journalEntries)
      .where(eq(journalEntries.userId, userId))
      .orderBy(desc(journalEntries.date));
  }

  async getJournalEntriesByDate(userId: number, year: number, month: number, day?: number): Promise<JournalEntry[]> {
    const startDate = new Date(year, month - 1, day || 1);
    let endDate: Date;
    
    if (day) {
      // If day is provided, get entries for that specific day
      endDate = new Date(year, month - 1, day, 23, 59, 59, 999);
    } else {
      // If only month is provided, get entries for the whole month
      endDate = new Date(year, month, 0, 23, 59, 59, 999);
    }
    
    return await db.select()
      .from(journalEntries)
      .where(
        and(
          eq(journalEntries.userId, userId),
          // Use gte and lte for date comparison
          gte(journalEntries.date, startDate),
          lte(journalEntries.date, endDate)
        )
      )
      .orderBy(desc(journalEntries.date));
  }

  async createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry> {
    const [newEntry] = await db.insert(journalEntries)
      .values({
        ...entry,
        date: entry.date ? new Date(entry.date) : new Date(),
      })
      .returning();
    async updateSubscriptionByEmail(email: string, updates: Partial<User>): Promise<User | undefined> {
      const [updatedUser] = await db.update(users)
        .set(updates)
        .where(eq(users.email, email))
        .returning();

      return updatedUser;
    }

    
    // Update stats
    await this.updateStatsAfterNewEntry(newEntry.userId, newEntry);
    
    return newEntry;
  }

  async updateJournalEntry(id: number, data: Partial<JournalEntry>): Promise<JournalEntry | undefined> {
    const [updatedEntry] = await db.update(journalEntries)
      .set(data)
      .where(eq(journalEntries.id, id))
      .returning();
    
    return updatedEntry;
  }

  async deleteJournalEntry(id: number): Promise<boolean> {
    const [deletedEntry] = await db.delete(journalEntries)
      .where(eq(journalEntries.id, id))
      .returning();
    
    return !!deletedEntry;
  }

  // Journal stats methods
  async getJournalStats(userId: number): Promise<JournalStats | undefined> {
    const [stats] = await db.select()
      .from(journalStats)
      .where(eq(journalStats.userId, userId));
    
    return stats;
  }

  async updateJournalStats(userId: number, stats: Partial<JournalStats>): Promise<JournalStats> {
    let existingStats = await this.getJournalStats(userId);
    
    if (!existingStats) {
      // Create initial stats for the user
      const [newStats] = await db.insert(journalStats)
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
    } else {
      // Update existing stats
      const [updatedStats] = await db.update(journalStats)
        .set({
          ...stats,
          lastUpdated: new Date()
        })
        .where(eq(journalStats.userId, userId))
        .returning();
      
      return updatedStats;
    }
  }
  
  // Goals methods
  async getGoal(id: number): Promise<Goal | undefined> {
    const [goal] = await db.select().from(goals).where(eq(goals.id, id));
    return goal;
  }
  
  async getGoalsByUserId(userId: number): Promise<Goal[]> {
    return await db.select()
      .from(goals)
      .where(eq(goals.userId, userId))
      .orderBy(desc(goals.createdAt));
  }
  
  async getGoalsByType(userId: number, type: string): Promise<Goal[]> {
    return await db.select()
      .from(goals)
      .where(
        and(
          eq(goals.userId, userId),
          eq(goals.type, type as any) // Type cast to handle enum
        )
      )
      .orderBy(desc(goals.createdAt));
  }
  
  async getGoalsByParentId(parentId: number): Promise<Goal[]> {
    return await db.select()
      .from(goals)
      .where(eq(goals.parentGoalId, parentId))
      .orderBy(desc(goals.createdAt));
  }
  
  async createGoal(goal: InsertGoal): Promise<Goal> {
    // Create a new object with the correct properties from the schema
    const insertData: any = {
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
    
    const [newGoal] = await db.insert(goals)
      .values(insertData)
      .returning();
    
    return newGoal;
  }
  
  async updateGoal(id: number, data: Partial<Goal> | any): Promise<Goal | undefined> {
    // Create a new update object with only the valid fields
    const updateData: any = {
      updatedAt: new Date()
    };
    
    // Copy over valid properties
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.progress !== undefined) updateData.progress = data.progress;
    if (data.parentGoalId !== undefined) updateData.parentGoalId = data.parentGoalId;
    if (data.timeSpent !== undefined) updateData.timeSpent = data.timeSpent;
    
    // Handle date fields correctly
    if (data.targetDate) {
      updateData.targetDate = new Date(data.targetDate);
    }
    if (data.completedDate) {
      updateData.completedDate = new Date(data.completedDate);
    } else if (data.completedDate === null) {
      updateData.completedDate = null;
    }
    
    const [updatedGoal] = await db.update(goals)
      .set(updateData)
      .where(eq(goals.id, id))
      .returning();
    
    return updatedGoal;
  }
  
  async deleteGoal(id: number): Promise<boolean> {
    // First, delete all child goals
    const childGoals = await this.getGoalsByParentId(id);
    for (const childGoal of childGoals) {
      await this.deleteGoal(childGoal.id);
    }
    
    // Then delete all activities associated with this goal
    await db.delete(goalActivities)
      .where(eq(goalActivities.goalId, id));
    
    // Finally delete the goal itself
    const [deletedGoal] = await db.delete(goals)
      .where(eq(goals.id, id))
      .returning();
    
    return !!deletedGoal;
  }
  
  // Goal Activities methods
  async getGoalActivity(id: number): Promise<GoalActivity | undefined> {
    const [activity] = await db.select()
      .from(goalActivities)
      .where(eq(goalActivities.id, id));
    
    return activity;
  }
  
  async getGoalActivitiesByGoalId(goalId: number): Promise<GoalActivity[]> {
    return await db.select()
      .from(goalActivities)
      .where(eq(goalActivities.goalId, goalId))
      .orderBy(desc(goalActivities.date));
  }
  
  async createGoalActivity(activity: InsertGoalActivity): Promise<GoalActivity> {
    // Create a new object with only the properties from the schema
    const insertData: any = {
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
    } else {
      insertData.date = new Date();
    }
    
    const [newActivity] = await db.insert(goalActivities)
      .values(insertData)
      .returning();
    
    // Update the parent goal's progress and time spent
    const goal = await this.getGoal(newActivity.goalId);
    if (goal) {
      let totalMinutesSpent;
      
      // Check if this was a "subtract time" operation
      if ((activity.minutesSpent || 0) < 0) {
        // This is a time reduction operation
        // Calculate the new total (current minus the absolute value)
        totalMinutesSpent = Math.max(0, (goal.timeSpent || 0) - Math.abs(activity.minutesSpent || 0));
      } else {
        // Regular time addition - calculate from all activities
        const allActivities = await this.getGoalActivitiesByGoalId(goal.id);
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
      const updateData: any = {
        timeSpent: totalMinutesSpent,
        progress: progress
      };
      
      // If progress is 100%, mark as completed
      if (progress >= 100) {
        updateData.status = 'completed';
        updateData.completedDate = new Date();
      } else if (goal.status === 'completed' && progress < 100) {
        // If we reduced time and the goal was completed, mark it back as in progress
        updateData.status = 'in_progress';
        updateData.completedDate = null;
      }
      
      // Update the goal
      await this.updateGoal(goal.id, updateData);
    }
    
    return newActivity;
  }
  
  async updateGoalActivity(id: number, data: Partial<GoalActivity>): Promise<GoalActivity | undefined> {
    const [updatedActivity] = await db.update(goalActivities)
      .set(data)
      .where(eq(goalActivities.id, id))
      .returning();
    
    if (updatedActivity) {
      // Update the parent goal's progress and time spent
      const goal = await this.getGoal(updatedActivity.goalId);
      if (goal) {
        const allActivities = await this.getGoalActivitiesByGoalId(goal.id);
        
        // Calculate total time spent
        const totalMinutesSpent = allActivities.reduce((total, a) => total + (a.minutesSpent || 0), 0);
        
        // Calculate progress based on all activities
        const totalProgress = allActivities.reduce((total, a) => total + (a.progressIncrement || 0), 0);
        const progress = Math.min(100, totalProgress);
        
        // Update the goal
        await this.updateGoal(goal.id, {
          timeSpent: totalMinutesSpent,
          progress,
          // If progress is 100%, mark as completed
          ...(progress >= 100 ? { 
            status: 'completed',
            completedDate: new Date()
          } : {})
        });
      }
    }
    
    return updatedActivity;
  }
  
  async deleteGoalActivity(id: number): Promise<boolean> {
    const activity = await this.getGoalActivity(id);
    if (!activity) return false;
    
    const [deletedActivity] = await db.delete(goalActivities)
      .where(eq(goalActivities.id, id))
      .returning();
    
    if (deletedActivity) {
      // Update the parent goal's progress and time spent
      const goal = await this.getGoal(deletedActivity.goalId);
      if (goal) {
        const allActivities = await this.getGoalActivitiesByGoalId(goal.id);
        
        // Calculate total time spent
        const totalMinutesSpent = allActivities.reduce((total, a) => total + (a.minutesSpent || 0), 0);
        
        // Calculate progress based on all activities
        const totalProgress = allActivities.reduce((total, a) => total + (a.progressIncrement || 0), 0);
        const progress = Math.min(100, totalProgress);
        
        // Update the goal
        await this.updateGoal(goal.id, {
          timeSpent: totalMinutesSpent,
          progress,
          // If we were completed but now aren't, change status back to in progress
          ...(goal.status === 'completed' && progress < 100 ? { 
            status: 'in_progress',
            completedDate: null
          } : {})
        });
      }
    }
    
    return !!deletedActivity;
  }
  
  // Goals Summary & Analytics
  async getGoalsSummary(userId: number): Promise<{
    total: number;
    completed: number;
    inProgress: number;
    timeSpent: number;
    byType: Record<string, number>;
  }> {
    const userGoals = await this.getGoalsByUserId(userId);
    
    // Calculate summary statistics
    const total = userGoals.length;
    const completed = userGoals.filter(g => g.status === 'completed').length;
    const inProgress = userGoals.filter(g => g.status === 'in_progress').length;
    const timeSpent = userGoals.reduce((total, g) => total + (g.timeSpent || 0), 0);
    
    // Calculate goals by type
    const byType: Record<string, number> = {};
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
  private async updateStatsAfterNewEntry(userId: number, entry: JournalEntry): Promise<void> {
    const userEntries = await this.getJournalEntriesByUserId(userId);
    let stats = await this.getJournalStats(userId);
    
    if (!stats) {
      stats = {
        id: 0, // This will be set by the database
        userId,
        entriesCount: 0,
        currentStreak: 0,
        longestStreak: 0,
        topMoods: {} as Record<string, number>,
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
      } else {
        currentStreak = 1;
      }
    }
    
    // Update longest streak if needed
    let longestStreak = stats.longestStreak || 0;
    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }
    
    // Update top moods
    let topMoods = stats.topMoods as Record<string, number> || {};
    
    // Update top moods
    if (entry.moods && entry.moods.length > 0) {
      if (!topMoods) {
        topMoods = {} as Record<string, number>;
      }
      
      entry.moods.forEach(mood => {
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
  
  // Chat Usage Tracking Methods
  async getCurrentWeekChatUsage(userId: number): Promise<ChatUsage | undefined> {
    // Get the start of the current week (Sunday)
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday, etc.
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek); // Go back to Sunday
    startOfWeek.setHours(0, 0, 0, 0); // Start of the day
    
    // Find usage record for this week
    const [usage] = await db.select()
      .from(chatUsage)
      .where(
        and(
          eq(chatUsage.userId, userId),
          gte(chatUsage.weekStartDate, startOfWeek)
        )
      );
    
    return usage;
  }
  
  async incrementChatUsage(userId: number): Promise<ChatUsage> {
    // Get the start of the current week (Sunday)
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday, etc.
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek); // Go back to Sunday
    startOfWeek.setHours(0, 0, 0, 0); // Start of the day
    
    // Get or create usage record for this week
    let currentUsage = await this.getCurrentWeekChatUsage(userId);
    
    if (!currentUsage) {
      // Create new usage record for this week
      const [newUsage] = await db.insert(chatUsage)
        .values({
          userId,
          weekStartDate: startOfWeek,
          chatCount: 1,
          lastUpdated: now
        })
        .returning();
      
      return newUsage;
    } else {
      // Update existing usage record
      const [updatedUsage] = await db.update(chatUsage)
        .set({
          chatCount: currentUsage.chatCount + 1,
          lastUpdated: now
        })
        .where(eq(chatUsage.id, currentUsage.id))
        .returning();
      
      return updatedUsage;
    }
  }
  
  async canSendChatMessage(userId: number): Promise<{ canSend: boolean; remaining: number }> {
    // Get user to check subscription status
    const user = await this.getUser(userId);
    
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
      const currentUsage = await this.getCurrentWeekChatUsage(userId);
      
      if (!currentUsage) {
        // No usage yet this week
        return { canSend: true, remaining: weeklyLimit };
      }
      
      const remaining = Math.max(0, weeklyLimit - currentUsage.chatCount);
      return { canSend: remaining > 0, remaining };
    }
    
    // For now, allow all users unlimited access for testing
    console.log('Allowing unlimited access for testing purposes');
    return { canSend: true, remaining: -1 };
  }

  // Check-ins methods
  async getCheckInsByUserId(userId: number): Promise<CheckIn[]> {
    const checkInsList = await db.select()
      .from(checkIns)
      .where(eq(checkIns.userId, userId))
      .orderBy(desc(checkIns.scheduledDate));
    
    return checkInsList;
  }

  async getPendingCheckIns(userId: number): Promise<CheckIn[]> {
    const now = new Date();
    const pendingCheckIns = await db.select()
      .from(checkIns)
      .where(
        and(
          eq(checkIns.userId, userId),
          eq(checkIns.isAnswered, false),
          lte(checkIns.scheduledDate, now)
        )
      )
      .orderBy(desc(checkIns.scheduledDate));
    
    return pendingCheckIns;
  }

  async createCheckIn(checkIn: InsertCheckIn): Promise<CheckIn> {
    const [newCheckIn] = await db.insert(checkIns)
      .values(checkIn)
      .returning();
    
    return newCheckIn;
  }

  async updateCheckIn(id: number, data: Partial<CheckIn>): Promise<CheckIn | undefined> {
    const [updatedCheckIn] = await db.update(checkIns)
      .set(data)
      .where(eq(checkIns.id, id))
      .returning();
    
    return updatedCheckIn;
  }

  async deleteCheckIn(id: number): Promise<boolean> {
    const [deletedCheckIn] = await db.delete(checkIns)
      .where(eq(checkIns.id, id))
      .returning();
    
    return !!deletedCheckIn;
  }

  async getUnresolvedCheckIns(userId: number): Promise<CheckIn[]> {
    const unresolvedCheckIns = await db.select()
      .from(checkIns)
      .where(
        and(
          eq(checkIns.userId, userId),
          eq(checkIns.isAnswered, true),
          eq(checkIns.isResolved, false)
        )
      )
      .orderBy(desc(checkIns.originalDate));
    
    return unresolvedCheckIns;
  }

  async createDailyCheckIn(userId: number): Promise<CheckIn> {
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

    const checkIn: InsertCheckIn = {
      userId,
      type: 'daily_checkin',
      question: randomQuestion,
      originalDate: now,
      scheduledDate: now,
      priority: 'normal',
      tags: ['daily', 'wellness'],
      relatedEntryId: null
    };

    return await this.createCheckIn(checkIn);
  }

  async getLastCheckInDate(userId: number): Promise<Date | null> {
    const [lastCheckIn] = await db.select({
      createdAt: checkIns.createdAt
    })
      .from(checkIns)
      .where(
        and(
          eq(checkIns.userId, userId),
          eq(checkIns.type, 'daily_checkin')
        )
      )
      .orderBy(desc(checkIns.createdAt))
      .limit(1);
    
    return lastCheckIn ? lastCheckIn.createdAt : null;
  }

  // Challenge System Methods
  async getAllChallenges(): Promise<Challenge[]> {
    return await db.select().from(challenges).orderBy(challenges.id);
  }

  async getActiveChallenges(): Promise<Challenge[]> {
    return await db.select()
      .from(challenges)
      .where(eq(challenges.isActive, true))
      .orderBy(challenges.points);
  }

  async getUserChallenges(userId: number): Promise<UserChallenge[]> {
    return await db.select()
      .from(userChallenges)
      .where(eq(userChallenges.userId, userId))
      .orderBy(desc(userChallenges.createdAt));
  }

  async getUserActiveChallenges(userId: number): Promise<UserChallenge[]> {
    return await db.select()
      .from(userChallenges)
      .where(
        and(
          eq(userChallenges.userId, userId),
          sql`${userChallenges.status} IN ('not_started', 'in_progress')`
        )
      )
      .orderBy(desc(userChallenges.createdAt));
  }

  async getUserBadges(userId: number): Promise<UserBadge[]> {
    return await db.select()
      .from(userBadges)
      .where(eq(userBadges.userId, userId))
      .orderBy(desc(userBadges.earnedAt));
  }

  async createChallenge(challenge: InsertChallenge): Promise<Challenge> {
    const [newChallenge] = await db.insert(challenges)
      .values(challenge)
      .returning();
    return newChallenge;
  }

  async startUserChallenge(userId: number, challengeId: number): Promise<UserChallenge> {
    const challenge = await db.select().from(challenges).where(eq(challenges.id, challengeId)).limit(1);
    if (!challenge[0]) throw new Error('Challenge not found');

    const now = new Date();
    const expiresAt = new Date(now.getTime() + (challenge[0].duration * 24 * 60 * 60 * 1000));

    const [userChallenge] = await db.insert(userChallenges)
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
  }

  async updateUserChallengeProgress(userId: number, challengeId: number, progress: number): Promise<UserChallenge | undefined> {
    const challenge = await db.select().from(challenges).where(eq(challenges.id, challengeId)).limit(1);
    if (!challenge[0]) return undefined;

    const [updated] = await db.update(userChallenges)
      .set({ 
        currentProgress: progress,
        status: progress >= challenge[0].targetValue ? 'completed' : 'in_progress',
        completedAt: progress >= challenge[0].targetValue ? new Date() : null,
      })
      .where(
        and(
          eq(userChallenges.userId, userId),
          eq(userChallenges.challengeId, challengeId)
        )
      )
      .returning();

    // If challenge is completed, award badge
    if (updated && progress >= challenge[0].targetValue) {
      await this.completeUserChallenge(userId, challengeId);
    }

    return updated;
  }

  async completeUserChallenge(userId: number, challengeId: number): Promise<UserBadge> {
    const challenge = await db.select().from(challenges).where(eq(challenges.id, challengeId)).limit(1);
    if (!challenge[0]) throw new Error('Challenge not found');

    // Check if badge already exists
    const existingBadge = await db.select()
      .from(userBadges)
      .where(
        and(
          eq(userBadges.userId, userId),
          eq(userBadges.challengeId, challengeId)
        )
      )
      .limit(1);

    if (existingBadge[0]) return existingBadge[0];

    const [badge] = await db.insert(userBadges)
      .values({
        userId,
        challengeId,
        points: challenge[0].points,
      })
      .returning();

    return badge;
  }

  async getUserChallengeStats(userId: number): Promise<{
    totalBadges: number;
    totalPoints: number;
    activeChallenges: number;
    completedChallenges: number;
  }> {
    const badges = await this.getUserBadges(userId);
    const userChallengesList = await this.getUserChallenges(userId);

    const totalBadges = badges.length;
    const totalPoints = badges.reduce((sum, badge) => sum + badge.points, 0);
    const activeChallenges = userChallengesList.filter(uc => 
      uc.status === 'in_progress' || uc.status === 'not_started'
    ).length;
    const completedChallenges = userChallengesList.filter(uc => 
      uc.status === 'completed'
    ).length;

    return {
      totalBadges,
      totalPoints,
      activeChallenges,
      completedChallenges,
    };
  }
}

// Create a default user
async function createDefaultUser() {
  const storage = new DatabaseStorage();
  const existingUser = await storage.getUserByUsername("demo");
  
  if (!existingUser) {
    await storage.createUser({ username: "demo", password: "demo" });
    console.log("Created default demo user");
  }
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private journalEntries: Map<number, JournalEntry> = new Map();
  private journalStats: Map<number, JournalStats> = new Map();
  private goals: Map<number, Goal> = new Map();
  private goalActivities: Map<number, GoalActivity> = new Map();
  private chatUsage: Map<number, ChatUsage> = new Map();
  private checkIns: Map<number, CheckIn> = new Map();
  private nextUserId = 1;
  private nextEntryId = 1;
  private nextGoalId = 1;
  private nextActivityId = 1;
  private nextChatUsageId = 1;
  private nextCheckInId = 1;

  constructor() {
    // Create a default user for testing
    const user: User = {
      id: this.nextUserId++,
      username: "demo",
      password: "$2b$10$K7L/8Y1t85jzrKyqd4Wn8OXhDxmK9XzjGkOqHZxqHZxqHZxqHZxqH", // password: "demo"
      email: "demo@example.com",
      phoneNumber: null,
      trialStartedAt: new Date(),
      trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      hasActiveSubscription: false,
      subscriptionPlan: 'trial',
      lemonsqueezyCustomerId: null,
      lemonsqueezySubscriptionId: null,
    };
    this.users.set(user.id, user);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: this.nextUserId++,
      username: insertUser.username,
      password: insertUser.password,
      email: insertUser.email || null,
      phoneNumber: insertUser.phoneNumber || null,
      trialStartedAt: new Date(),
      trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      hasActiveSubscription: false,
      subscriptionPlan: 'trial',
      lemonsqueezyCustomerId: null,
      lemonsqueezySubscriptionId: null,
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Journal entry methods
  async getJournalEntry(id: number): Promise<JournalEntry | undefined> {
    return this.journalEntries.get(id);
  }

  async getJournalEntriesByUserId(userId: number): Promise<JournalEntry[]> {
    return Array.from(this.journalEntries.values())
      .filter(entry => entry.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getJournalEntriesByDate(userId: number, year: number, month: number, day?: number): Promise<JournalEntry[]> {
    const entries = Array.from(this.journalEntries.values())
      .filter(entry => entry.userId === userId);
    
    return entries.filter(entry => {
      const entryDate = new Date(entry.date);
      const entryYear = entryDate.getFullYear();
      const entryMonth = entryDate.getMonth() + 1;
      const entryDay = entryDate.getDate();
      
      if (day) {
        return entryYear === year && entryMonth === month && entryDay === day;
      } else {
        return entryYear === year && entryMonth === month;
      }
    });
  }

  async createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry> {
    const journalEntry: JournalEntry = {
      id: this.nextEntryId++,
      ...entry,
      title: entry.title || null,
      moods: entry.moods || null,
      aiResponse: null,
      isFavorite: false,
      date: entry.date ? new Date(entry.date) : new Date(),
    };
    this.journalEntries.set(journalEntry.id, journalEntry);
    return journalEntry;
  }

  async updateJournalEntry(id: number, data: Partial<JournalEntry>): Promise<JournalEntry | undefined> {
    const entry = this.journalEntries.get(id);
    if (!entry) return undefined;
    
    const updatedEntry = { ...entry, ...data };
    this.journalEntries.set(id, updatedEntry);
    return updatedEntry;
  }

  async deleteJournalEntry(id: number): Promise<boolean> {
    return this.journalEntries.delete(id);
  }

  // Journal stats methods
  async getJournalStats(userId: number): Promise<JournalStats | undefined> {
    return this.journalStats.get(userId);
  }

  async updateJournalStats(userId: number, stats: Partial<JournalStats>): Promise<JournalStats> {
    const existing = this.journalStats.get(userId);
    const updated: JournalStats = {
      id: existing?.id || userId,
      userId,
      entriesCount: 0,
      currentStreak: 0,
      longestStreak: 0,
      topMoods: {},
      lastUpdated: new Date(),
      ...existing,
      ...stats,
    };
    this.journalStats.set(userId, updated);
    return updated;
  }

  // Goal methods
  async getGoal(id: number): Promise<Goal | undefined> {
    return this.goals.get(id);
  }

  async getGoalsByUserId(userId: number): Promise<Goal[]> {
    return Array.from(this.goals.values()).filter(goal => goal.userId === userId);
  }

  async getGoalsByType(userId: number, type: string): Promise<Goal[]> {
    return Array.from(this.goals.values())
      .filter(goal => goal.userId === userId && goal.type === type);
  }

  async getGoalsByParentId(parentId: number): Promise<Goal[]> {
    return Array.from(this.goals.values())
      .filter(goal => goal.parentGoalId === parentId);
  }

  async createGoal(goal: InsertGoal): Promise<Goal> {
    const newGoal: Goal = {
      id: this.nextGoalId++,
      ...goal,
      description: goal.description || null,
      status: goal.status || 'not_started',
      progress: 0,
      timeSpent: 0,
      completedDate: null,
      parentGoalId: goal.parentGoalId || null,
      targetDate: goal.targetDate || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.goals.set(newGoal.id, newGoal);
    return newGoal;
  }

  async updateGoal(id: number, data: Partial<Goal>): Promise<Goal | undefined> {
    const goal = this.goals.get(id);
    if (!goal) return undefined;
    
    const updatedGoal = { ...goal, ...data, updatedAt: new Date() };
    this.goals.set(id, updatedGoal);
    return updatedGoal;
  }

  async deleteGoal(id: number): Promise<boolean> {
    return this.goals.delete(id);
  }

  // Goal activity methods
  async getGoalActivity(id: number): Promise<GoalActivity | undefined> {
    return this.goalActivities.get(id);
  }

  async getGoalActivitiesByGoalId(goalId: number): Promise<GoalActivity[]> {
    return Array.from(this.goalActivities.values())
      .filter(activity => activity.goalId === goalId);
  }

  async createGoalActivity(activity: InsertGoalActivity): Promise<GoalActivity> {
    const newActivity: GoalActivity = {
      id: this.nextActivityId++,
      goalId: activity.goalId,
      date: activity.date || new Date().toISOString().split('T')[0],
      description: activity.description || null,
      minutesSpent: activity.minutesSpent || null,
      progressIncrement: activity.progressIncrement || null,
    };
    this.goalActivities.set(newActivity.id, newActivity);
    return newActivity;
  }

  async updateGoalActivity(id: number, data: Partial<GoalActivity>): Promise<GoalActivity | undefined> {
    const activity = this.goalActivities.get(id);
    if (!activity) return undefined;
    
    const updatedActivity = { ...activity, ...data };
    this.goalActivities.set(id, updatedActivity);
    return updatedActivity;
  }

  async deleteGoalActivity(id: number): Promise<boolean> {
    return this.goalActivities.delete(id);
  }

  async getGoalsSummary(userId: number): Promise<{
    total: number;
    completed: number;
    inProgress: number;
    timeSpent: number;
    byType: Record<string, number>;
  }> {
    const userGoals = Array.from(this.goals.values()).filter(goal => goal.userId === userId);
    
    const summary = {
      total: userGoals.length,
      completed: userGoals.filter(goal => goal.status === 'completed').length,
      inProgress: userGoals.filter(goal => goal.status === 'in_progress').length,
      timeSpent: 0,
      byType: {} as Record<string, number>
    };

    // Calculate time spent and group by type
    for (const goal of userGoals) {
      summary.timeSpent += goal.timeSpent || 0;
      summary.byType[goal.type] = (summary.byType[goal.type] || 0) + 1;
    }

    return summary;
  }

  // Chat usage methods
  async getCurrentWeekChatUsage(userId: number): Promise<ChatUsage | undefined> {
    return this.chatUsage.get(userId);
  }

  async incrementChatUsage(userId: number): Promise<ChatUsage> {
    const existing = this.chatUsage.get(userId);
    const updated: ChatUsage = {
      id: existing?.id || this.nextChatUsageId++,
      userId,
      weekStartDate: new Date(),
      chatCount: (existing?.chatCount || 0) + 1,
      lastUpdated: new Date(),
    };
    this.chatUsage.set(userId, updated);
    return updated;
  }

  async canSendChatMessage(userId: number): Promise<{ canSend: boolean; remaining: number }> {
    const usage = this.chatUsage.get(userId);
    const messageCount = usage?.chatCount || 0;
    const remaining = Math.max(0, 50 - messageCount);
    return {
      canSend: remaining > 0,
      remaining
    };
  }

  // Check-ins methods
  async getCheckInsByUserId(userId: number): Promise<CheckIn[]> {
    return Array.from(this.checkIns.values())
      .filter(checkIn => checkIn.userId === userId)
      .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());
  }

  async getPendingCheckIns(userId: number): Promise<CheckIn[]> {
    const now = new Date();
    return Array.from(this.checkIns.values())
      .filter(checkIn => 
        checkIn.userId === userId && 
        !checkIn.isAnswered && 
        new Date(checkIn.scheduledDate) <= now
      )
      .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());
  }

  async createCheckIn(checkIn: InsertCheckIn): Promise<CheckIn> {
    const newCheckIn: CheckIn = {
      id: this.nextCheckInId++,
      ...checkIn,
      isAnswered: false,
      userResponse: null,
      aiFollowUp: null,
      createdAt: new Date(),
    };
    this.checkIns.set(newCheckIn.id, newCheckIn);
    return newCheckIn;
  }

  async updateCheckIn(id: number, data: Partial<CheckIn>): Promise<CheckIn | undefined> {
    const existing = this.checkIns.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...data };
    this.checkIns.set(id, updated);
    return updated;
  }

  async deleteCheckIn(id: number): Promise<boolean> {
    return this.checkIns.delete(id);
  }

  async getUnresolvedCheckIns(userId: number): Promise<CheckIn[]> {
    return Array.from(this.checkIns.values())
      .filter(checkIn => 
        checkIn.userId === userId && 
        checkIn.isAnswered === true && 
        checkIn.isResolved === false
      )
      .sort((a, b) => new Date(b.originalDate).getTime() - new Date(a.originalDate).getTime());
  }

  async createDailyCheckIn(userId: number): Promise<CheckIn> {
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

    const checkIn: CheckIn = {
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
  }

  async getLastCheckInDate(userId: number): Promise<Date | null> {
    const userCheckIns = Array.from(this.checkIns.values())
      .filter(checkIn => checkIn.userId === userId && checkIn.type === 'daily_checkin')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return userCheckIns.length > 0 ? userCheckIns[0].createdAt : null;
  }

  // Challenge methods (stub implementations for MemStorage)
  async getAllChallenges(): Promise<Challenge[]> {
    return [];
  }

  async getActiveChallenges(): Promise<Challenge[]> {
    return [];
  }

  async getUserChallenges(userId: number): Promise<UserChallenge[]> {
    return [];
  }

  async getUserActiveChallenges(userId: number): Promise<UserChallenge[]> {
    return [];
  }

  async getUserBadges(userId: number): Promise<UserBadge[]> {
    return [];
  }

  async createChallenge(challenge: InsertChallenge): Promise<Challenge> {
    throw new Error('MemStorage does not support challenge creation');
  }

  async startUserChallenge(userId: number, challengeId: number): Promise<UserChallenge> {
    throw new Error('MemStorage does not support challenges');
  }

  async updateUserChallengeProgress(userId: number, challengeId: number, progress: number): Promise<UserChallenge | undefined> {
    return undefined;
  }

  async completeUserChallenge(userId: number, challengeId: number): Promise<UserBadge> {
    throw new Error('MemStorage does not support challenges');
  }

  async getUserChallengeStats(userId: number): Promise<{
    totalBadges: number;
    totalPoints: number;
    activeChallenges: number;
    completedChallenges: number;
  }> {
    return {
      totalBadges: 0,
      totalPoints: 0,
      activeChallenges: 0,
      completedChallenges: 0,
    };
  }
}

export const storage = new DatabaseStorage();
