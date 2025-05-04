import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title"),
  content: text("content").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  moods: text("moods").array(),
  aiResponse: text("ai_response"),
  isFavorite: boolean("is_favorite").default(false),
});

export const journalStats = pgTable("journal_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  entriesCount: integer("entries_count").default(0),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  topMoods: jsonb("top_moods"),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;

export type InsertJournalStats = z.infer<typeof insertJournalStatsSchema>;
export type JournalStats = typeof journalStats.$inferSelect;
