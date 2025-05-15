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
  InsertChatUsage
} from "@shared/schema";

// Define storage interface - we're keeping the same interface for consistency
export interface IStorage {
  // Users
  getUser(id: number | string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number | string, data: Partial<User>): Promise<User | undefined>;

  // Journal entries
  getJournalEntry(id: number | string): Promise<JournalEntry | undefined>;
  getJournalEntriesByUserId(userId: number | string): Promise<JournalEntry[]>;
  getJournalEntriesByDate(userId: number | string, year: number, month: number, day?: number): Promise<JournalEntry[]>;
  createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;
  updateJournalEntry(id: number | string, data: Partial<JournalEntry>): Promise<JournalEntry | undefined>;
  deleteJournalEntry(id: number | string): Promise<boolean>;

  // Journal stats
  getJournalStats(userId: number | string): Promise<JournalStats | undefined>;
  updateJournalStats(userId: number | string, stats: Partial<JournalStats>): Promise<JournalStats>;
  
  // Goals
  getGoal(id: number | string): Promise<Goal | undefined>;
  getGoalsByUserId(userId: number | string): Promise<Goal[]>;
  getGoalsByType(userId: number | string, type: string): Promise<Goal[]>;
  getGoalsByParentId(parentId: number | string): Promise<Goal[]>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: number | string, data: Partial<Goal>): Promise<Goal | undefined>;
  deleteGoal(id: number | string): Promise<boolean>;
  
  // Goal Activities
  getGoalActivity(id: number | string): Promise<GoalActivity | undefined>;
  getGoalActivitiesByGoalId(goalId: number | string): Promise<GoalActivity[]>;
  createGoalActivity(activity: InsertGoalActivity): Promise<GoalActivity>;
  updateGoalActivity(id: number | string, data: Partial<GoalActivity>): Promise<GoalActivity | undefined>;
  deleteGoalActivity(id: number | string): Promise<boolean>;
  
  // Goals Summary & Analytics
  getGoalsSummary(userId: number | string): Promise<{
    total: number;
    completed: number;
    inProgress: number;
    timeSpent: number;
    byType: Record<string, number>;
  }>;
  
  // Chat Usage Tracking
  getCurrentWeekChatUsage(userId: number | string): Promise<ChatUsage | undefined>;
  incrementChatUsage(userId: number | string): Promise<ChatUsage>;
  canSendChatMessage(userId: number | string): Promise<{canSend: boolean; remaining: number}>;
}

// Import MongoDB storage implementation
import { mongoStorage } from './mongo-storage';

// Export MongoDB storage as the default storage implementation
export const storage = mongoStorage;
