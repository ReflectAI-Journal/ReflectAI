export type Mood = string;

export interface JournalEntry {
  id: number;
  userId: number;
  title: string | null;
  content: string;
  date: string | Date;
  moods: Mood[];
  aiResponse: string | null;
  isFavorite: boolean;
}

export interface JournalStats {
  id: number;
  userId: number;
  entriesCount: number;
  currentStreak: number;
  longestStreak: number;
  topMoods: Record<string, number>;
  lastUpdated: string | Date;
}
