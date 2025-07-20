import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { google } from 'googleapis';
import express, { Express, NextFunction } from "express";
import { Request, Response } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import jwt from "jsonwebtoken";
import { storage } from "./storage";
import { User } from "../shared/schema.js";
import connectPg from "connect-pg-simple";
import { sanitizeUser, securityHeadersMiddleware, logPrivacyEvent } from "./security";

declare global {
  namespace Express {
    // Define user properties that will be available in req.user
    interface User {
      id: number;
      username: string;
      password: string;
      email: string | null;
      trialStartedAt: Date | null;
      trialEndsAt: Date | null;
      hasActiveSubscription: boolean | null;
      subscriptionPlan: string | null;
      stripeCustomerId: string | null;
      stripeSubscriptionId: string | null;

    }
  }
}

const scryptAsync = promisify(scrypt);

// JWT Secret - use environment variable or fallback
const JWT_SECRET = process.env.JWT_SECRET || 'reflectai-jwt-secret-key';

export function generateToken(user: User): string {
  return jwt.sign(
    { 
      id: user.id, 
      username: user.username,
      email: user.email 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // Configure PostgreSQL session storage for persistent sessions
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: 7 * 24 * 60 * 60, // 1 week in seconds
    tableName: "sessions",
  });

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'reflectai-session-secret',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username or password" });
        }

        const passwordValid = await comparePasswords(password, user.password);
        if (!passwordValid) {
          return done(null, false, { message: "Incorrect username or password" });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }),
  );

  // Initialize Google OAuth2 client
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "https://reflectai-journal.site/auth/google/callback"
  );

  // Serialize user to session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Register route
  app.post("/api/register", async (req, res, next) => {
    try {
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).send("Username already exists");
      }

      // Verify that either email or phone number is provided
      if (!req.body.email && !req.body.phoneNumber) {
        return res.status(400).send("Either email or phone number is required");
      }

      // Hash password and create user without trial
      const hashedPassword = await hashPassword(req.body.password);

      // Create user with proper schema validation
      const userToCreate: any = {
        username: req.body.username,
        password: hashedPassword,
        email: req.body.email || null,
        phoneNumber: req.body.phoneNumber || null,
        trialStartedAt: null,
        trialEndsAt: null,
        subscriptionPlan: null,
      };

      const user = await storage.createUser(userToCreate);

      // Log user in automatically after registration
      req.login(user, (err) => {
        if (err) return next(err);

        // Generate JWT token
        const token = generateToken(user);

        // Remove sensitive information before sending to client
        const sanitizedUser = sanitizeUser(user);
        logPrivacyEvent("user_created", user.id, "New user registered");

        return res.status(201).json({
          ...sanitizedUser,
          token
        });
      });
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).send("An error occurred during registration");
    }
  });

  // Login route - returns JWT token and user data
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).send(info?.message || "Authentication failed");
      }
      req.login(user, (err) => {
        if (err) return next(err);

        // Generate JWT token
        const token = generateToken(user);

        // Remove sensitive information before sending to client
        const sanitizedUser = sanitizeUser(user);
        logPrivacyEvent("user_login", user.id, "User logged in");

        // Set session data
        req.session.userId = user.id;
        req.session.user = user;

        // Save session explicitly
        req.session.save((err) => {
          if (err) {
            console.error('Session save error:', err);
          }
        });

        return res.status(200).json({
          ...sanitizedUser,
          token
        });
      });
    })(req, res, next);
  });

  // Logout route
  app.post("/api/logout", (req, res, next) => {
    if (req.isAuthenticated()) {
      const userId = (req.user as User).id;
      logPrivacyEvent("user_logout", userId, "User logged out");
    }

    req.logout((err) => {
      if (err) return next(err);
      req.session.destroy((err) => {
        if (err) return next(err);
        res.sendStatus(200);
      });
    });
  });

  // Get current user route - supports both session and JWT authentication
  app.get("/api/user", async (req: Request, res: Response) => {
    let user: User | null = null;

    // Check for JWT token in Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);

      if (decoded && decoded.id) {
        try {
          user = await storage.getUserById(decoded.id);
        } catch (error) {
          console.error("Error fetching user by JWT token:", error);
        }
      }
    }

    // Fallback to session-based authentication
    if (!user && req.isAuthenticated()) {
      user = req.user as User;
    }

    if (!user) {
      console.log("Authentication failed - no valid session or JWT token");
      return res.status(401).send("Not authenticated");
    }

    // Remove sensitive information before sending to client
    const sanitizedUser = sanitizeUser(user);
    console.log("Authentication successful, returning user:", sanitizedUser);
    res.json(sanitizedUser);

    // Log access to user data
    logPrivacyEvent("user_data_access", user.id, "User data accessed");
  });

  // Check subscription status route
  app.get("/api/subscription/status", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;

      if (!user) {
        return res.sendStatus(401);
      }

      // Initialize Stripe
      const stripe = (await import('stripe')).default;
      const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY!);

      // Check Stripe subscription status if user has a subscription ID
      let stripeSubscription = null;
      let stripeTrialInfo = null;

      if (user.stripeSubscriptionId) {
        try {
          stripeSubscription = await stripeInstance.subscriptions.retrieve(user.stripeSubscriptionId);

          // Get trial information from Stripe
          if (stripeSubscription.trial_end) {
            stripeTrialInfo = {
              trialEnd: new Date(stripeSubscription.trial_end * 1000),
              isOnTrial: stripeSubscription.status === 'trialing'
            };

            // Update local trial info if different
            const storage = (await import('./storage.js')).storage;
            if (user.stripeTrialEnd?.getTime() !== stripeTrialInfo.trialEnd.getTime() || 
                user.isOnStripeTrial !== stripeTrialInfo.isOnTrial) {
              await storage.updateUserTrialInfo(user.id, stripeTrialInfo.trialEnd, stripeTrialInfo.isOnTrial);
            }
          }
        } catch (error) {
          console.log('Error fetching Stripe subscription:', error);
        }
      }

      // Check if user has an active subscription
      const hasActiveSubscription = user.hasActiveSubscription || false;
      const subscriptionPlan = user.subscriptionPlan || 'trial';

      // Calculate if trial is still active (prefer Stripe trial info if available)
      const now = new Date();
      let trialActive = false;
      let trialEndsAt = null;

      if (stripeTrialInfo) {
        trialActive = stripeTrialInfo.isOnTrial && now < stripeTrialInfo.trialEnd;
        trialEndsAt = stripeTrialInfo.trialEnd;
      } else if (user.trialEndsAt) {
        const trialEnd = new Date(user.trialEndsAt);
        trialActive = now < trialEnd;
        trialEndsAt = trialEnd;
      }

      const subscriptionStatus = {
        status: hasActiveSubscription ? 'active' : (trialActive ? 'trialing' : 'trial'),
        plan: hasActiveSubscription ? subscriptionPlan : 'trial',
        trialActive: trialActive,
        trialEndsAt: trialEndsAt,
        daysLeft: trialEndsAt ? Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0,
        requiresSubscription: !hasActiveSubscription && !trialActive,
        stripeTrialEnd: stripeTrialInfo?.trialEnd,
        isOnStripeTrial: stripeTrialInfo?.isOnTrial
      };

      res.json(subscriptionStatus);
    } catch (error: any) {
      console.error('Error getting subscription status:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Google OAuth routes
  app.get("/auth/google", (req, res) => {
    const scopes = ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'];
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
    });
    res.redirect(url);
  });

  app.get("/auth/google/callback", async (req, res) => {
    const { code } = req.query;

    if (!code) {
      return res.redirect('/auth?tab=login&error=oauth_failed');
    }

    try {
      const { tokens } = await oauth2Client.getToken(code as string);
      oauth2Client.setCredentials(tokens);

      // Get user info from Google
      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      const userInfoResponse = await oauth2.userinfo.get();
      const userInfo = userInfoResponse.data;

      if (!userInfo.email) {
        return res.redirect('/auth?tab=login&error=no_email');
      }

      // Check if user already exists by email
      let user = await storage.getUserByEmail(userInfo.email);
      
      if (!user) {
        // Create new user from Google profile
        const userToCreate: any = {
          username: userInfo.name || userInfo.email.split('@')[0] || `user_${userInfo.id}`,
          password: await hashPassword(Math.random().toString(36)), // Random password since they use OAuth
          email: userInfo.email,
          phoneNumber: null,
          trialStartedAt: null,
          trialEndsAt: null,
          subscriptionPlan: null,
          googleId: userInfo.id
        };

        user = await storage.createUser(userToCreate);
      }

      // Generate JWT token and set session
      const token = generateToken(user);
      
      // Set token as cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: 'lax'
      });

      // Set session data
      req.login(user, (err) => {
        if (err) {
          console.error('Session login error:', err);
        }
        res.redirect('/pricing');
      });

    } catch (err) {
      console.error('OAuth Error:', err);
      res.redirect('/auth?tab=login&error=oauth_failed');
    }
  });
}

// Middleware to check if user is authenticated
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).send("Not authenticated");
}

// Middleware to check subscription (disabled - all users have unlimited access)
export function checkSubscriptionStatus(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).send("Not authenticated");
  }

  // Subscription check is disabled - all users have unlimited access 
  // to premium features regardless of subscription status
  return next();
}