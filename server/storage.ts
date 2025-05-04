import { 
  User, 
  InsertUser, 
  JournalEntry, 
  InsertJournalEntry, 
  JournalStats,
  InsertJournalStats,
  updateJournalEntrySchema,
  users,
  journalEntries, 
  journalStats
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, lte } from "drizzle-orm";

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
