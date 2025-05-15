import { models, isConnected } from './mongodb';
import { IStorage } from './storage'; // Import the interface from the existing storage
import mongoose from 'mongoose';

// Type definitions for our MongoDB models
type User = {
  id?: string;
  _id?: any;
  username: string;
  password: string;
  email?: string;
  phoneNumber?: string;
  trialStartedAt?: Date;
  trialEndsAt?: Date;
  hasActiveSubscription?: boolean;
  subscriptionPlan?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
};

type JournalEntry = {
  id?: string;
  _id?: any;
  userId: string | number | mongoose.Types.ObjectId;
  title?: string;
  content?: string;
  moods?: string[];
  aiResponse?: string;
  date: Date;
  isFavorite?: boolean;
};

type JournalStats = {
  id?: string;
  _id?: any;
  userId: string | number;
  entriesCount: number;
  currentStreak: number;
  longestStreak: number;
  topMoods: Record<string, number>;
  lastUpdated: Date;
};

type Goal = {
  id?: string;
  _id?: any;
  userId: string | number;
  title: string;
  description?: string;
  type: string;
  status?: string;
  progress?: number;
  timeSpent?: number;
  targetDate?: Date;
  completedDate?: Date;
  parentGoalId?: string | number;
  createdAt?: Date;
  updatedAt?: Date;
};

type GoalActivity = {
  id?: string;
  _id?: any;
  goalId: string | number;
  description?: string;
  minutesSpent?: number;
  progressIncrement?: number;
  date: Date;
};

type ChatUsage = {
  id?: string;
  _id?: any;
  userId: string | number;
  weekStartDate: Date;
  chatCount: number;
  lastUpdated: Date;
};

// Helper function to transform MongoDB documents to app objects
function transformDoc(doc: any) {
  if (!doc) return undefined;
  
  // If it's already transformed or not a Mongoose document, return as is
  if (!doc._doc && !doc.toObject) return doc;
  
  const transformed = doc.toObject ? doc.toObject() : { ...doc._doc };
  transformed.id = transformed._id.toString();
  delete transformed.__v;
  
  return transformed;
}

export class MongoDBStorage implements IStorage {
  // User methods
  async getUser(id: number | string): Promise<User | undefined> {
    if (!isConnected || !models.User) return undefined;
    
    try {
      const user = await models.User.findById(id);
      return transformDoc(user);
    } catch (error) {
      console.error("Error getting user:", error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    if (!isConnected || !models.User) return undefined;
    
    try {
      const user = await models.User.findOne({ username });
      return transformDoc(user);
    } catch (error) {
      console.error("Error getting user by username:", error);
      return undefined;
    }
  }

  async createUser(user: User): Promise<User> {
    if (!isConnected || !models.User) {
      throw new Error("MongoDB connection not available");
    }
    
    try {
      const newUser = await models.User.create(user);
      
      // Create initial stats for the user
      await this.updateJournalStats(newUser._id.toString(), {
        entriesCount: 0,
        currentStreak: 0,
        longestStreak: 0,
        topMoods: {}
      });
      
      return transformDoc(newUser);
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  async updateUser(id: number | string, data: Partial<User>): Promise<User | undefined> {
    if (!isConnected || !models.User) return undefined;
    
    try {
      const updatedUser = await models.User.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true }
      );
      
      return transformDoc(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      return undefined;
    }
  }

  // Journal entry methods
  async getJournalEntry(id: number | string): Promise<JournalEntry | undefined> {
    if (!isConnected || !models.JournalEntry) return undefined;
    
    try {
      const entry = await models.JournalEntry.findById(id);
      return transformDoc(entry);
    } catch (error) {
      console.error("Error getting journal entry:", error);
      return undefined;
    }
  }

  async getJournalEntriesByUserId(userId: number | string): Promise<JournalEntry[]> {
    if (!isConnected || !models.JournalEntry) return [];
    
    try {
      const entries = await models.JournalEntry
        .find({ userId })
        .sort({ date: -1 });
      
      return entries.map(transformDoc);
    } catch (error) {
      console.error("Error getting journal entries by user:", error);
      return [];
    }
  }

  async getJournalEntriesByDate(userId: number | string, year: number, month: number, day?: number): Promise<JournalEntry[]> {
    if (!isConnected || !models.JournalEntry) return [];
    
    try {
      const startDate = new Date(year, month - 1, day || 1);
      let endDate: Date;
      
      if (day) {
        // If day is provided, get entries for that specific day
        endDate = new Date(year, month - 1, day, 23, 59, 59, 999);
      } else {
        // If only month is provided, get entries for the whole month
        endDate = new Date(year, month, 0, 23, 59, 59, 999);
      }
      
      const entries = await models.JournalEntry
        .find({
          userId,
          date: { $gte: startDate, $lte: endDate }
        })
        .sort({ date: -1 });
      
      return entries.map(transformDoc);
    } catch (error) {
      console.error("Error getting journal entries by date:", error);
      return [];
    }
  }

  async createJournalEntry(entry: JournalEntry): Promise<JournalEntry> {
    if (!isConnected || !models.JournalEntry) {
      throw new Error("MongoDB connection not available");
    }
    
    try {
      // Convert userId to ObjectId if it's not already one
      if (typeof entry.userId === 'string' || typeof entry.userId === 'number') {
        try {
          // If it's a valid ObjectId string, convert it
          // Otherwise, keep it as is (for backward compatibility)
          if (mongoose.Types.ObjectId.isValid(entry.userId.toString())) {
            entry.userId = new mongoose.Types.ObjectId(entry.userId.toString());
          }
        } catch (e) {
          console.log("Warning: Could not convert userId to ObjectId:", e);
        }
      }
      
      const newEntry = await models.JournalEntry.create({
        ...entry,
        date: entry.date || new Date()
      });
      
      // Update stats
      await this.updateStatsAfterNewEntry(
        newEntry.userId.toString(),
        transformDoc(newEntry)
      );
      
      return transformDoc(newEntry);
    } catch (error) {
      console.error("Error creating journal entry:", error);
      throw error;
    }
  }

  async updateJournalEntry(id: number | string, data: Partial<JournalEntry>): Promise<JournalEntry | undefined> {
    if (!isConnected || !models.JournalEntry) return undefined;
    
    try {
      const updatedEntry = await models.JournalEntry.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true }
      );
      
      return transformDoc(updatedEntry);
    } catch (error) {
      console.error("Error updating journal entry:", error);
      return undefined;
    }
  }

  async deleteJournalEntry(id: number | string): Promise<boolean> {
    if (!isConnected || !models.JournalEntry) return false;
    
    try {
      const result = await models.JournalEntry.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error("Error deleting journal entry:", error);
      return false;
    }
  }

  // Journal stats methods
  async getJournalStats(userId: number | string): Promise<JournalStats | undefined> {
    if (!isConnected || !models.JournalStats) return undefined;
    
    try {
      const stats = await models.JournalStats.findOne({ userId });
      return transformDoc(stats);
    } catch (error) {
      console.error("Error getting journal stats:", error);
      return undefined;
    }
  }

  async updateJournalStats(userId: number | string, stats: Partial<JournalStats>): Promise<JournalStats> {
    if (!isConnected || !models.JournalStats) {
      throw new Error("MongoDB connection not available");
    }
    
    try {
      let existingStats = await this.getJournalStats(userId);
      
      if (!existingStats) {
        // Create initial stats for the user
        const newStats = await models.JournalStats.create({
          userId,
          entriesCount: stats.entriesCount || 0,
          currentStreak: stats.currentStreak || 0,
          longestStreak: stats.longestStreak || 0,
          topMoods: stats.topMoods || {},
          lastUpdated: new Date()
        });
        
        return transformDoc(newStats);
      } else {
        // Update existing stats
        const updatedStats = await models.JournalStats.findOneAndUpdate(
          { userId },
          {
            $set: {
              ...stats,
              lastUpdated: new Date()
            }
          },
          { new: true }
        );
        
        return transformDoc(updatedStats);
      }
    } catch (error) {
      console.error("Error updating journal stats:", error);
      throw error;
    }
  }

  // Goals methods
  async getGoal(id: number | string): Promise<Goal | undefined> {
    if (!isConnected || !models.Goal) return undefined;
    
    try {
      const goal = await models.Goal.findById(id);
      return transformDoc(goal);
    } catch (error) {
      console.error("Error getting goal:", error);
      return undefined;
    }
  }

  async getGoalsByUserId(userId: number | string): Promise<Goal[]> {
    if (!isConnected || !models.Goal) return [];
    
    try {
      const goals = await models.Goal
        .find({ userId })
        .sort({ createdAt: -1 });
      
      return goals.map(transformDoc);
    } catch (error) {
      console.error("Error getting goals by user:", error);
      return [];
    }
  }

  async getGoalsByType(userId: number | string, type: string): Promise<Goal[]> {
    if (!isConnected || !models.Goal) return [];
    
    try {
      const goals = await models.Goal
        .find({ userId, type })
        .sort({ createdAt: -1 });
      
      return goals.map(transformDoc);
    } catch (error) {
      console.error("Error getting goals by type:", error);
      return [];
    }
  }

  async getGoalsByParentId(parentId: number | string): Promise<Goal[]> {
    if (!isConnected || !models.Goal) return [];
    
    try {
      const goals = await models.Goal
        .find({ parentGoalId: parentId })
        .sort({ createdAt: -1 });
      
      return goals.map(transformDoc);
    } catch (error) {
      console.error("Error getting goals by parent:", error);
      return [];
    }
  }

  async createGoal(goal: Goal): Promise<Goal> {
    if (!isConnected || !models.Goal) {
      throw new Error("MongoDB connection not available");
    }
    
    try {
      const newGoal = await models.Goal.create({
        ...goal,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      return transformDoc(newGoal);
    } catch (error) {
      console.error("Error creating goal:", error);
      throw error;
    }
  }

  async updateGoal(id: number | string, data: Partial<Goal>): Promise<Goal | undefined> {
    if (!isConnected || !models.Goal) return undefined;
    
    try {
      // Add updatedAt timestamp
      const updatedGoal = await models.Goal.findByIdAndUpdate(
        id,
        {
          $set: {
            ...data,
            updatedAt: new Date()
          }
        },
        { new: true }
      );
      
      return transformDoc(updatedGoal);
    } catch (error) {
      console.error("Error updating goal:", error);
      return undefined;
    }
  }

  async deleteGoal(id: number | string): Promise<boolean> {
    if (!isConnected || !models.Goal) return false;
    
    try {
      // First, delete all child goals
      const childGoals = await this.getGoalsByParentId(id);
      for (const childGoal of childGoals) {
        await this.deleteGoal(childGoal.id as string);
      }
      
      // Then delete all activities associated with this goal
      await models.GoalActivity.deleteMany({ goalId: id });
      
      // Finally delete the goal itself
      const result = await models.Goal.findByIdAndDelete(id);
      
      return !!result;
    } catch (error) {
      console.error("Error deleting goal:", error);
      return false;
    }
  }

  // Goal Activities methods
  async getGoalActivity(id: number | string): Promise<GoalActivity | undefined> {
    if (!isConnected || !models.GoalActivity) return undefined;
    
    try {
      const activity = await models.GoalActivity.findById(id);
      return transformDoc(activity);
    } catch (error) {
      console.error("Error getting goal activity:", error);
      return undefined;
    }
  }

  async getGoalActivitiesByGoalId(goalId: number | string): Promise<GoalActivity[]> {
    if (!isConnected || !models.GoalActivity) return [];
    
    try {
      const activities = await models.GoalActivity
        .find({ goalId })
        .sort({ date: -1 });
      
      return activities.map(transformDoc);
    } catch (error) {
      console.error("Error getting goal activities:", error);
      return [];
    }
  }

  async createGoalActivity(activity: GoalActivity): Promise<GoalActivity> {
    if (!isConnected || !models.GoalActivity) {
      throw new Error("MongoDB connection not available");
    }
    
    try {
      const newActivity = await models.GoalActivity.create({
        ...activity,
        date: activity.date || new Date()
      });
      
      // Update the parent goal's progress and time spent
      const goal = await this.getGoal(newActivity.goalId.toString());
      if (goal) {
        let totalMinutesSpent;
        
        // Check if this was a "subtract time" operation
        if ((activity.minutesSpent || 0) < 0) {
          // This is a time reduction operation
          // Calculate the new total (current minus the absolute value)
          totalMinutesSpent = Math.max(0, (goal.timeSpent || 0) - Math.abs(activity.minutesSpent || 0));
        } else {
          // Regular time addition - calculate from all activities
          const allActivities = await this.getGoalActivitiesByGoalId(goal.id as string);
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
        const updateData: Partial<Goal> = {
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
          updateData.completedDate = undefined;
        }
        
        // Update the goal
        await this.updateGoal(goal.id as string, updateData);
      }
      
      return transformDoc(newActivity);
    } catch (error) {
      console.error("Error creating goal activity:", error);
      throw error;
    }
  }

  async updateGoalActivity(id: number | string, data: Partial<GoalActivity>): Promise<GoalActivity | undefined> {
    if (!isConnected || !models.GoalActivity) return undefined;
    
    try {
      const updatedActivity = await models.GoalActivity.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true }
      );
      
      if (updatedActivity) {
        // Update the parent goal's progress and time spent
        const goal = await this.getGoal(updatedActivity.goalId.toString());
        if (goal) {
          const allActivities = await this.getGoalActivitiesByGoalId(goal.id as string);
          
          // Calculate total time spent
          const totalMinutesSpent = allActivities.reduce((total, a) => total + (a.minutesSpent || 0), 0);
          
          // Calculate progress based on all activities
          const totalProgress = allActivities.reduce((total, a) => total + (a.progressIncrement || 0), 0);
          const progress = Math.min(100, totalProgress);
          
          // Update the goal
          await this.updateGoal(goal.id as string, {
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
      
      return transformDoc(updatedActivity);
    } catch (error) {
      console.error("Error updating goal activity:", error);
      return undefined;
    }
  }

  async deleteGoalActivity(id: number | string): Promise<boolean> {
    if (!isConnected || !models.GoalActivity) return false;
    
    try {
      const activity = await this.getGoalActivity(id);
      if (!activity) return false;
      
      const result = await models.GoalActivity.findByIdAndDelete(id);
      
      if (result) {
        // Update the parent goal's progress and time spent
        const goal = await this.getGoal(activity.goalId.toString());
        if (goal) {
          const allActivities = await this.getGoalActivitiesByGoalId(goal.id as string);
          
          // Calculate total time spent
          const totalMinutesSpent = allActivities.reduce((total, a) => total + (a.minutesSpent || 0), 0);
          
          // Calculate progress based on all activities
          const totalProgress = allActivities.reduce((total, a) => total + (a.progressIncrement || 0), 0);
          const progress = Math.min(100, totalProgress);
          
          // Update the goal
          await this.updateGoal(goal.id as string, {
            timeSpent: totalMinutesSpent,
            progress,
            // If we were completed but now aren't, change status back to in progress
            ...(goal.status === 'completed' && progress < 100 ? { 
              status: 'in_progress',
              completedDate: undefined
            } : {})
          });
        }
      }
      
      return !!result;
    } catch (error) {
      console.error("Error deleting goal activity:", error);
      return false;
    }
  }

  // Goals Summary & Analytics
  async getGoalsSummary(userId: number | string): Promise<{
    total: number;
    completed: number;
    inProgress: number;
    timeSpent: number;
    byType: Record<string, number>;
  }> {
    if (!isConnected || !models.Goal) {
      return {
        total: 0,
        completed: 0,
        inProgress: 0,
        timeSpent: 0,
        byType: {}
      };
    }
    
    try {
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
    } catch (error) {
      console.error("Error getting goals summary:", error);
      return {
        total: 0,
        completed: 0,
        inProgress: 0,
        timeSpent: 0,
        byType: {}
      };
    }
  }

  // Chat Usage Tracking Methods
  async getCurrentWeekChatUsage(userId: number | string): Promise<ChatUsage | undefined> {
    if (!isConnected || !models.ChatUsage) return undefined;
    
    try {
      // Get the start of the current week (Sunday)
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday, etc.
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - dayOfWeek); // Go back to Sunday
      startOfWeek.setHours(0, 0, 0, 0); // Start of the day
      
      // Find usage record for this week
      const usage = await models.ChatUsage.findOne({
        userId,
        weekStartDate: { $gte: startOfWeek }
      });
      
      return transformDoc(usage);
    } catch (error) {
      console.error("Error getting chat usage:", error);
      return undefined;
    }
  }

  async incrementChatUsage(userId: number | string): Promise<ChatUsage> {
    if (!isConnected || !models.ChatUsage) {
      throw new Error("MongoDB connection not available");
    }
    
    try {
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
        const newUsage = await models.ChatUsage.create({
          userId,
          weekStartDate: startOfWeek,
          chatCount: 1,
          lastUpdated: now
        });
        
        return transformDoc(newUsage);
      } else {
        // Update existing usage record
        const updatedUsage = await models.ChatUsage.findByIdAndUpdate(
          currentUsage.id,
          {
            $set: {
              chatCount: currentUsage.chatCount + 1,
              lastUpdated: now
            }
          },
          { new: true }
        );
        
        return transformDoc(updatedUsage);
      }
    } catch (error) {
      console.error("Error incrementing chat usage:", error);
      throw error;
    }
  }

  async canSendChatMessage(userId: number | string): Promise<{ canSend: boolean; remaining: number }> {
    if (!isConnected || !models.User) {
      return { canSend: false, remaining: 0 };
    }
    
    try {
      // Get user to check subscription status
      const user = await this.getUser(userId);
      
      if (!user) {
        return { canSend: false, remaining: 0 };
      }
      
      // If user has unlimited subscription, they can always send messages
      if (user.subscriptionPlan === 'unlimited' && user.hasActiveSubscription) {
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
      
      // Free users or invalid subscription
      return { canSend: false, remaining: 0 };
    } catch (error) {
      console.error("Error checking chat message permission:", error);
      return { canSend: false, remaining: 0 };
    }
  }

  // Helper methods
  private async updateStatsAfterNewEntry(userId: number | string, entry: JournalEntry): Promise<void> {
    try {
      const userEntries = await this.getJournalEntriesByUserId(userId);
      let stats = await this.getJournalStats(userId);
      
      if (!stats) {
        stats = {
          id: "",
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
    } catch (error) {
      console.error("Error updating stats after new entry:", error);
    }
  }
}

// Initialize storage
const mongoStorage = new MongoDBStorage();

// Create a default user
async function createDefaultUser() {
  try {
    console.log("Attempting to create default user in MongoDB...");
    
    // Check if the database is ready by testing a simple query
    try {
      const existingUser = await mongoStorage.getUserByUsername("demo");
      
      if (!existingUser) {
        console.log("Creating demo user in MongoDB...");
        await mongoStorage.createUser({ 
          username: "demo", 
          password: "demo" 
        });
        console.log("Created default demo user in MongoDB successfully");
      } else {
        console.log("Default demo user already exists in MongoDB");
      }
    } catch (error) {
      console.error("Error checking/creating default user in MongoDB:", error);
      // Schedule another attempt in 5 seconds
      console.log("Will retry creating default user in 5 seconds...");
      setTimeout(() => {
        createDefaultUser().catch(err => {
          console.error("Failed to create default user on retry:", err);
        });
      }, 5000);
    }
  } catch (err) {
    console.error("Unexpected error in createDefaultUser:", err);
  }
}

// Try to create default user with a delay to allow DB connection to be established
setTimeout(() => {
  createDefaultUser().catch(err => {
    console.error("Initial attempt to create default user failed:", err);
  });
}, 5000);

export { mongoStorage }; 