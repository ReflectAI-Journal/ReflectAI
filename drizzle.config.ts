import { defineConfig } from "drizzle-kit";

// Provide fallback for development and CI
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://user:password@localhost:5432/reflectai';

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: DATABASE_URL,
  },
});
