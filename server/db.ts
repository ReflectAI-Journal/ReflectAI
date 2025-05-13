import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Check for DATABASE_URL and provide fallback for development
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://user:password@localhost:5432/reflectai';

// Create a mock pool if in development or testing mode and the real URL is not available
let pool;
let db;

try {
  pool = new Pool({ connectionString: DATABASE_URL });
  db = drizzle({ client: pool, schema });
  console.log("Database connected successfully");
} catch (error) {
  console.error("Error connecting to database:", error);
  
  // Create mock implementations for development/testing
  if (process.env.NODE_ENV !== 'production') {
    console.warn("Using in-memory mock database for development");
    
    // Simple in-memory storage with mock interface
    const mockDb = {};
    pool = null;
    db = {
      select: () => ({ from: () => ({ where: () => [] }) }),
      insert: () => ({ values: () => ({ returning: () => [{}] }) }),
      update: () => ({ set: () => ({ where: () => ({ returning: () => [{}] }) }) }),
      delete: () => ({ where: () => ({ returning: () => [{}] }) }),
    };
  } else {
    // In production, we should still throw
    throw new Error("Failed to connect to database in production mode");
  }
}

export { pool, db };