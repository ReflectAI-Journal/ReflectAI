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
  users,
  journalEntries, 
  journalStats,
  goals,
  goalActivities
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, lte, isNull, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

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
      if (activity.minutesSpent < 0) {
        // This is a time reduction operation
        // Calculate the new total (current minus the absolute value)
        totalMinutesSpent = Math.max(0, (goal.timeSpent || 0) - Math.abs(activity.minutesSpent));
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
        if (activity.minutesSpent < 0) {
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

// Initialize the database with a default user
createDefaultUser().catch(console.error);

export const storage = new DatabaseStorage();
