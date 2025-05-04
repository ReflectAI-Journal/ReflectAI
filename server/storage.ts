import { 
  User, 
  InsertUser, 
  JournalEntry, 
  InsertJournalEntry, 
  JournalStats,
  InsertJournalStats,
  updateJournalEntrySchema
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private journalEntries: Map<number, JournalEntry>;
  private journalStats: Map<number, JournalStats>;
  private userIdCounter: number;
  private entryIdCounter: number;
  private statsIdCounter: number;

  constructor() {
    this.users = new Map();
    this.journalEntries = new Map();
    this.journalStats = new Map();
    this.userIdCounter = 1;
    this.entryIdCounter = 1;
    this.statsIdCounter = 1;

    // Create a default user for demo purposes
    this.createUser({ username: "demo", password: "demo" });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
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
    return Array.from(this.journalEntries.values())
      .filter(entry => {
        const entryDate = new Date(entry.date);
        const matchesYear = entryDate.getFullYear() === year;
        const matchesMonth = entryDate.getMonth() + 1 === month; // JavaScript months are 0-indexed
        
        if (day) {
          return entry.userId === userId && matchesYear && matchesMonth && entryDate.getDate() === day;
        }
        
        return entry.userId === userId && matchesYear && matchesMonth;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry> {
    const id = this.entryIdCounter++;
    const newEntry: JournalEntry = {
      ...entry,
      id,
      date: entry.date ? new Date(entry.date) : new Date(),
      aiResponse: null,
      isFavorite: false,
    };
    
    this.journalEntries.set(id, newEntry);
    
    // Update stats
    await this.updateStatsAfterNewEntry(newEntry.userId, newEntry);
    
    return newEntry;
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
    return Array.from(this.journalStats.values()).find(
      stats => stats.userId === userId
    );
  }

  async updateJournalStats(userId: number, stats: Partial<JournalStats>): Promise<JournalStats> {
    let userStats = await this.getJournalStats(userId);
    
    if (!userStats) {
      const id = this.statsIdCounter++;
      userStats = {
        id,
        userId,
        entriesCount: 0,
        currentStreak: 0,
        longestStreak: 0,
        topMoods: {},
        lastUpdated: new Date(),
      };
      this.journalStats.set(id, userStats);
    }
    
    const updatedStats = { ...userStats, ...stats, lastUpdated: new Date() };
    this.journalStats.set(userStats.id, updatedStats);
    
    return updatedStats;
  }

  // Helper methods
  private async updateStatsAfterNewEntry(userId: number, entry: JournalEntry): Promise<void> {
    const userEntries = await this.getJournalEntriesByUserId(userId);
    let stats = await this.getJournalStats(userId) || {
      id: this.statsIdCounter++,
      userId,
      entriesCount: 0,
      currentStreak: 0,
      longestStreak: 0,
      topMoods: {},
      lastUpdated: new Date(),
    };
    
    // Update entries count
    stats.entriesCount = userEntries.length;
    
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
    
    if (entryDate.getTime() === today.getTime()) {
      if (hasYesterdayEntry || stats.currentStreak > 0) {
        stats.currentStreak += 1;
      } else {
        stats.currentStreak = 1;
      }
    }
    
    // Update longest streak if needed
    if (stats.currentStreak > stats.longestStreak) {
      stats.longestStreak = stats.currentStreak;
    }
    
    // Update top moods
    if (entry.moods && entry.moods.length > 0) {
      const topMoods = stats.topMoods || {};
      
      entry.moods.forEach(mood => {
        topMoods[mood] = (topMoods[mood] || 0) + 1;
      });
      
      stats.topMoods = topMoods;
    }
    
    await this.updateJournalStats(userId, stats);
  }
}

export const storage = new MemStorage();
