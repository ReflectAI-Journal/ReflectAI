// This file serves as a bridge to use MongoDB storage in place of the PostgreSQL storage
// We're using a separate file to avoid circular dependencies

import { mongoStorage } from './mongo-storage';

// Export MongoDB storage as the default storage implementation
export const storage = mongoStorage; 