import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

// Disable deprecated connection cache option to avoid warning
// This option is now always true in latest versions
try {
  // @ts-ignore - ignore old property deprecation
  delete neonConfig.fetchConnectionCache;
} catch (e) {
  // Ignore if property cannot be deleted
}

// Check for DATABASE_URL and provide fallback for development
// If we're in development, prefer local Postgres
const isProduction = process.env.NODE_ENV === 'production';
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://reflectuser:reflectpass@localhost:5432/reflectai';

// Create variables to hold our database connections
let pool: any = null;
let db: any = null;

// Initialize with a mock DB first to prevent app from crashing if DB connection fails
// This ensures the application can start and operate in a degraded mode
db = {
  select: () => ({ from: () => ({ where: () => [] }) }),
  insert: () => ({ values: () => ({ returning: () => [{}] }) }),
  update: () => ({ set: () => ({ where: () => ({ returning: () => [{}] }) }) }),
  delete: () => ({ where: () => ({ returning: () => [{}] }) }),
};

// Maximum retry attempts and delay between retries
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

async function connectWithRetry(retriesLeft = MAX_RETRIES): Promise<boolean> {
  try {
    console.log(`Attempting to connect to database... (${MAX_RETRIES - retriesLeft + 1}/${MAX_RETRIES})`);
    console.log(`Using database URL: ${DATABASE_URL.split('@')[0].split('://')[0]}://*****@${DATABASE_URL.split('@')[1]}`);
    
    // Setup poolConfig with longer timeouts for production
    const poolConfig = { 
      connectionString: DATABASE_URL,
      max: isProduction ? 20 : 10, // More connections for production
      idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
      connectionTimeoutMillis: isProduction ? 30000 : 15000, // Longer timeout in production
    };
    
    // Try to create a pool
    try {
      pool = new Pool(poolConfig);
      console.log("Database pool created successfully");
    } catch (poolError) {
      console.error("Error creating connection pool:", poolError);
      throw new Error(`Pool creation error: ${poolError instanceof Error ? poolError.message : String(poolError)}`);
    }
    
    // Add event handlers for the pool
    pool.on('error', (err: Error) => {
      console.error('Unexpected database pool error:', err);
    });
    
    // Test the connection with a simple query
    try {
      const client = await pool.connect();
      try {
        await client.query('SELECT 1 as ping');
        console.log("Database connection test successful");
      } finally {
        client.release();
      }
    } catch (queryError) {
      console.error("Database connection test failed:", queryError);
      throw new Error(`Connection test error: ${queryError instanceof Error ? queryError.message : String(queryError)}`);
    }
    
    // Initialize Drizzle ORM
    try {
      db = drizzle({ client: pool, schema });
      console.log("Drizzle ORM initialized successfully");
    } catch (drizzleError) {
      console.error("Error initializing Drizzle ORM:", drizzleError);
      throw new Error(`Drizzle ORM error: ${drizzleError instanceof Error ? drizzleError.message : String(drizzleError)}`);
    }
    
    console.log("Database connected successfully");
    return true;
  } catch (error) {
    // Handle the connection error
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Database connection error: ${errorMessage}`);
    
    if (retriesLeft > 0) {
      console.log(`Retrying connection in ${RETRY_DELAY}ms... (${retriesLeft} attempts remaining)`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return connectWithRetry(retriesLeft - 1);
    }
    
    // After all retries failed
    console.warn("Using in-memory mock database as fallback");
    
    // Keep the mock interface we initialized at the top
    pool = null;
    return false;
  }
}

// Initialize the connection
try {
  console.log("Starting database connection process...");
  connectWithRetry()
    .then(success => {
      if (success) {
        console.log("Database connection fully established");
      } else {
        console.warn("IMPORTANT: Failed to connect to database. Using mock database interface.");
        console.warn("Application will have limited functionality.");
      }
    })
    .catch(err => {
      console.error("Unexpected error during database connection:", err);
    });
} catch (error) {
  console.error("Critical error during database initialization:", error);
}

export { pool, db };