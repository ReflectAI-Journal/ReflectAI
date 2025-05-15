import { MongoClient, ServerApiVersion, Db } from 'mongodb';
import mongoose from 'mongoose';

// MongoDB connection string - use environment variable or fallback to localhost
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/reflectai';

// Mongoose models will be added here
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String },
  phoneNumber: { type: String },
  trialStartedAt: { type: Date },
  trialEndsAt: { type: Date },
  hasActiveSubscription: { type: Boolean, default: false },
  subscriptionPlan: { type: String, default: 'free' },
  stripeCustomerId: { type: String },
  stripeSubscriptionId: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const journalEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String },
  content: { type: String },
  moods: [{ type: String }],
  aiResponse: { type: String },
  date: { type: Date, default: Date.now },
  isFavorite: { type: Boolean, default: false }
});

const journalStatsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  entriesCount: { type: Number, default: 0 },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  topMoods: { type: Map, of: Number, default: {} },
  lastUpdated: { type: Date, default: Date.now }
});

const goalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  type: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['not_started', 'in_progress', 'completed', 'abandoned'],
    default: 'not_started'
  },
  progress: { type: Number, default: 0 },
  timeSpent: { type: Number, default: 0 },
  targetDate: { type: Date },
  completedDate: { type: Date },
  parentGoalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const goalActivitySchema = new mongoose.Schema({
  goalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal', required: true },
  description: { type: String },
  minutesSpent: { type: Number, default: 0 },
  progressIncrement: { type: Number, default: 0 },
  date: { type: Date, default: Date.now }
});

const chatUsageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  weekStartDate: { type: Date, required: true },
  chatCount: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
});

// Create models
let UserModel: mongoose.Model<any>;
let JournalEntryModel: mongoose.Model<any>;
let JournalStatsModel: mongoose.Model<any>;
let GoalModel: mongoose.Model<any>;
let GoalActivityModel: mongoose.Model<any>;
let ChatUsageModel: mongoose.Model<any>;

// MongoDB client instance
let client: MongoClient | null = null;
let db: Db | null = null;
let isConnected = false;

// Initialize with mocks
let models = {
  User: null as any,
  JournalEntry: null as any,
  JournalStats: null as any,
  Goal: null as any,
  GoalActivity: null as any,
  ChatUsage: null as any
};

// Connection retry parameters
const MAX_RETRIES = 5;
const RETRY_DELAY = 3000;

// Connect to MongoDB
async function connectToMongoDB(retriesLeft = MAX_RETRIES): Promise<boolean> {
  try {
    console.log(`Attempting to connect to MongoDB... (${MAX_RETRIES - retriesLeft + 1}/${MAX_RETRIES})`);
    console.log(`Using MongoDB URI: ${MONGODB_URI.split('@')[0].includes('://') ? 
      MONGODB_URI.split('@')[0].split('://')[0] + '://*****:****@' + MONGODB_URI.split('@')[1] : 
      MONGODB_URI}`);

    // Connect using mongoose
    await mongoose.connect(MONGODB_URI);
    
    // Initialize models
    UserModel = mongoose.model('User', userSchema);
    JournalEntryModel = mongoose.model('JournalEntry', journalEntrySchema);
    JournalStatsModel = mongoose.model('JournalStats', journalStatsSchema);
    GoalModel = mongoose.model('Goal', goalSchema);
    GoalActivityModel = mongoose.model('GoalActivity', goalActivitySchema);
    ChatUsageModel = mongoose.model('ChatUsage', chatUsageSchema);

    // Export models
    models = {
      User: UserModel,
      JournalEntry: JournalEntryModel,
      JournalStats: JournalStatsModel,
      Goal: GoalModel,
      GoalActivity: GoalActivityModel,
      ChatUsage: ChatUsageModel
    };

    // Also connect using the MongoDB driver for more flexibility
    client = new MongoClient(MONGODB_URI, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });
    
    await client.connect();
    db = client.db();
    
    // Verify connectivity
    await db.command({ ping: 1 });
    
    console.log("MongoDB connection successful");
    isConnected = true;
    
    // Setup connection error handlers
    mongoose.connection.on('error', (err) => {
      console.error('Mongoose connection error:', err);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('Mongoose disconnected');
      isConnected = false;
      // Try to reconnect
      setTimeout(() => {
        if (!isConnected) {
          console.log('Attempting to reconnect to MongoDB...');
          connectToMongoDB().catch(console.error);
        }
      }, RETRY_DELAY);
    });
    
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`MongoDB connection error: ${errorMessage}`);
    
    if (retriesLeft > 0) {
      console.log(`Retrying connection in ${RETRY_DELAY}ms... (${retriesLeft} attempts remaining)`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return connectToMongoDB(retriesLeft - 1);
    }
    
    console.warn("CRITICAL: Failed to connect to MongoDB. Application functionality will be limited.");
    return false;
  }
}

// Initialize MongoDB connection
try {
  console.log("Starting MongoDB connection process...");
  connectToMongoDB().then(success => {
    if (success) {
      console.log("MongoDB connection fully established");
    } else {
      console.warn("Failed to connect to MongoDB. Some features may not work correctly.");
    }
  }).catch(err => {
    console.error("Unexpected error during MongoDB connection:", err);
  });
} catch (error) {
  console.error("Critical error initializing MongoDB:", error);
}

// Get connection status
function getConnectionStatus() {
  return {
    isConnected,
    client: client ? 'Connected' : 'Not connected',
    mongoose: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  };
}

export { db, models, isConnected, getConnectionStatus }; 