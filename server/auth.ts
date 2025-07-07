import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import express, { Express, NextFunction } from "express";
import { Request, Response } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User } from "@shared/schema";
import createMemoryStore from "memorystore";
import { sanitizeUser, securityHeadersMiddleware, logPrivacyEvent } from "./security";

const MemoryStore = createMemoryStore(session);

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
      lemonsqueezyCustomerId: string | null;
      lemonsqueezySubscriptionId: string | null;
    }
  }
}

const scryptAsync = promisify(scrypt);

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
  // Configure session storage
  const sessionStore = new MemoryStore({
    checkPeriod: 86400000 // prune expired entries every 24h
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

      // Hash password and create user with 7-day trial
      const hashedPassword = await hashPassword(req.body.password);
      
      // Calculate trial start and end dates (7 days)
      const trialStartedAt = new Date();
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialStartedAt.getDate() + 7);
      
      // Create user with proper schema validation
      const userToCreate: any = {
        username: req.body.username,
        password: hashedPassword,
        email: req.body.email || null,
        phoneNumber: req.body.phoneNumber || null,
        trialStartedAt,
        trialEndsAt,
        subscriptionPlan: 'trial',
      };
      
      const user = await storage.createUser(userToCreate);

      // Log user in automatically after registration
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Remove sensitive information before sending to client
        const sanitizedUser = sanitizeUser(user);
        logPrivacyEvent("user_created", user.id, "New user registered");
        
        return res.status(201).json(sanitizedUser);
      });
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).send("An error occurred during registration");
    }
  });

  // Login route
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).send(info?.message || "Authentication failed");
      }
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Remove sensitive information before sending to client
        const sanitizedUser = sanitizeUser(user);
        logPrivacyEvent("user_login", user.id, "User logged in");
        
        return res.status(200).json(sanitizedUser);
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

  // Get current user route
  app.get("/api/user", (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }
    // Remove sensitive information before sending to client
    const sanitizedUser = sanitizeUser(req.user as User);
    res.json(sanitizedUser);
    
    // Log access to user data
    logPrivacyEvent("user_data_access", req.user!.id, "User data accessed");
  });
  
  // Check subscription status route (always returns active status)
  app.get("/api/subscription/status", isAuthenticated, (req: Request, res: Response) => {
    const user = req.user as Express.User;
    
    // All users now have unlimited access with active status
    // regardless of their actual subscription status
    return res.json({
      status: "active", 
      plan: "unlimited",
      trialActive: false,
      trialEndsAt: null,
      requiresSubscription: false
    });
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