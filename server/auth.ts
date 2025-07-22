import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { google } from 'googleapis';
import appleAuth from './apple-config';
import express, { Express, NextFunction } from "express";
import { Request, Response } from "express";
import session from "express-session";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { storage } from "./storage";
import { User } from "../shared/schema.js";
import connectPg from "connect-pg-simple";
import { sanitizeUser, securityHeadersMiddleware, logPrivacyEvent } from "./security";
import { generateConfirmationToken, sendConfirmationEmail } from "./emailService.js";

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

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

export async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  return await bcrypt.compare(supplied, stored);
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

      // Generate email confirmation token and send confirmation email
      try {
        if (req.body.email) {
          const confirmationToken = generateConfirmationToken();
          await storage.updateUserEmailConfirmation(user.id, confirmationToken);
          await sendConfirmationEmail(req.body.email, confirmationToken);
          console.log(`📧 Confirmation email sent to: ${req.body.email}`);
        }
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // Continue with registration even if email fails
      }

      // Don't automatically log in - require email confirmation first
      const sanitizedUser = sanitizeUser(user);
      logPrivacyEvent("user_created", user.id, "New user registered");

      return res.status(201).json({
        message: "📬 Confirmation email sent! Please check your inbox (and spam folder) to activate your account.",
        emailSent: true,
        email: req.body.email
      });
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).send("An error occurred during registration");
    }
  });

  // Login route - Handle both custom database and Supabase authentication
  app.post("/api/login", async (req, res, next) => {
    console.log("=== /api/login Debug Info (auth.ts) ===");
    console.log("Request body:", req.body);
    console.log("Body type:", typeof req.body);
    console.log("Body keys:", req.body ? Object.keys(req.body) : "no body");
    
    const { email, password } = req.body;

    // Validate credentials are provided
    if (!email || !password) {
      console.error("❌ Missing credentials: email =", !!email, "password =", !!password);
      return res.status(401).json({ message: "Missing credentials" });
    }

    try {
      // First, try to find user in our custom database
      const user = await storage.getUserByEmail(email);
      
      if (user && user.password) {
        // Custom database user - check password with bcrypt
        console.log("✅ Found custom database user for:", email);
        
        // Check if email is confirmed
        if (!user.emailConfirmedAt) {
          console.log("❌ Email not confirmed for user:", email);
          return res.status(401).json({ 
            message: "Please confirm your email before logging in.", 
            emailNotConfirmed: true,
            email: email 
          });
        }
        
        // Verify password
        const bcrypt = await import('bcrypt');
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
          console.error("❌ Invalid password for custom user:", email);
          return res.status(401).json({ message: "Invalid login credentials" });
        }
        
        // Generate JWT token
        const token = generateToken(user);

        // Remove sensitive information before sending to client
        const sanitizedUser = sanitizeUser(user);
        logPrivacyEvent("user_login", user.id, "User logged in via custom auth");

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
          user: sanitizedUser,
          token
        });
        
      } else {
        // Try Supabase authentication for users without custom password
        console.log("✅ Attempting Supabase login for:", email);
        
        // Import supabase client
        const { supabase } = await import("./supabase.js");
        
        if (!supabase) {
          console.error("❌ Supabase not configured");
          return res.status(401).json({ message: "Invalid login credentials" });
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          console.error("❌ Supabase login error:", error.message);
          return res.status(401).json({ message: "Invalid login credentials" });
        }

        console.log("✅ Supabase login successful for user:", data.user?.email);

        // Get or create user in our database
        let dbUser = user;
        if (!dbUser) {
          // User exists in Supabase but not in our database - create them
          console.log("User not in database but exists in Supabase - creating user");
          dbUser = await storage.createUser({
            username: email.split('@')[0],
            password: '',  // Supabase handles password
            email: email,
            emailConfirmedAt: new Date(),  // Supabase handles email confirmation
            phoneNumber: null,
            trialStartedAt: null,
            trialEndsAt: null,
            subscriptionPlan: null,
          });
        }

        // Generate JWT token
        const token = generateToken(dbUser);

        // Remove sensitive information before sending to client
        const sanitizedUser = sanitizeUser(dbUser);
        logPrivacyEvent("user_login", dbUser.id, "User logged in via Supabase");

        // Set session data
        req.session.userId = dbUser.id;
        req.session.user = dbUser;

        // Save session explicitly
        req.session.save((err) => {
          if (err) {
            console.error('Session save error:', err);
          }
        });

        return res.status(200).json({
          user: sanitizedUser,
          token
        });
      }

      // Generate JWT token
      const token = generateToken(user);

      // Remove sensitive information before sending to client
      const sanitizedUser = sanitizeUser(user);
      logPrivacyEvent("user_login", user.id, "User logged in via Supabase");

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
        user: sanitizedUser,
        token
      });
    } catch (error) {
      console.error("❌ Login error:", error);
      return res.status(500).json({ message: "Login failed" });
    }
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
    const sessionId = req.query.session_id as string;
    const plan = req.query.plan as string;
    
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state: JSON.stringify({ sessionId, plan }) // Pass session data through state parameter
    });
    res.redirect(url);
  });

  app.get("/auth/google/callback", async (req, res) => {
    const { code, state } = req.query;

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

      // Parse state to get session info
      let sessionData = null;
      if (state) {
        try {
          sessionData = JSON.parse(state as string);
        } catch (e) {
          console.log('Could not parse OAuth state:', e);
        }
      }

      // Check if this is a post-payment account creation
      if (sessionData?.sessionId) {
        // Handle account creation with Stripe session verification
        try {
          // Import the create account with subscription logic
          const { storage: activeStorage } = require('./storage');
          
          // Check if user already exists by email
          let existingUser = await activeStorage.getUserByEmail(userInfo.email);
          
          if (existingUser) {
            // User exists, redirect to app
            const token = generateToken(existingUser);
            res.cookie('token', token, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              maxAge: 7 * 24 * 60 * 60 * 1000,
              sameSite: 'lax'
            });

            req.login(existingUser, (err) => {
              if (err) console.error('Session login error:', err);
              res.redirect('/app/counselor');
            });
            return;
          }

          // Create new user with Google OAuth data and Stripe subscription
          const userToCreate = {
            username: userInfo.name || userInfo.email.split('@')[0] || `user_${userInfo.id}`,
            password: await hashPassword(Math.random().toString(36)),
            email: userInfo.email,
            phoneNumber: null,
            sessionId: sessionData.sessionId,
            agreeToTerms: true,
            googleId: userInfo.id
          };

          // Use the same account creation logic as the regular endpoint
          const response = await fetch(`${req.protocol}://${req.get('host')}/api/create-account-with-subscription`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userToCreate)
          });

          if (response.ok) {
            const result = await response.json();
            
            // Set authentication
            const token = generateToken(result.user);
            res.cookie('token', token, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              maxAge: 7 * 24 * 60 * 60 * 1000,
              sameSite: 'lax'
            });

            req.login(result.user, (err) => {
              if (err) console.error('Session login error:', err);
              res.redirect('/app/counselor');
            });
            return;
          } else {
            throw new Error('Account creation failed');
          }
          
        } catch (error) {
          console.error('Post-payment Google OAuth account creation error:', error);
          return res.redirect('/create-account?session_id=' + sessionData.sessionId + '&plan=' + (sessionData.plan || '') + '&error=oauth_failed');
        }
      }

      // Regular OAuth flow (no session ID)
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
        res.redirect('/app/counselor');
      });

    } catch (err) {
      console.error('OAuth Error:', err);
      res.redirect('/auth?tab=login&error=oauth_failed');
    }
  });

  // Apple OAuth routes
  app.get("/auth/apple", (req, res) => {
    const sessionId = req.query.session_id as string;
    const plan = req.query.plan as string;
    
    // Apple OAuth doesn't support custom state, so we'll use the redirect_uri to pass session data
    let redirectUri = 'https://reflectai-journal.site/auth/apple/callback';
    if (sessionId) {
      redirectUri += `?session_id=${sessionId}&plan=${plan || ''}`;
    }
    
    const url = appleAuth.loginURL({
      redirect_uri: redirectUri
    });
    res.redirect(url);
  });

  app.post("/auth/apple/callback", async (req, res) => {
    try {
      const { id_token, code } = await appleAuth.accessToken(req.body.code);
      const jwt = require('jsonwebtoken');
      const user_claims = jwt.decode(id_token); // includes email, sub (user id), etc.

      if (!user_claims || !user_claims.email) {
        return res.status(400).json({ error: 'No email provided' });
      }

      // Check for session data in query params (passed from Apple OAuth initiation)
      const sessionId = req.query.session_id as string;
      const plan = req.query.plan as string;

      // Check if this is a post-payment account creation
      if (sessionId) {
        // Handle account creation with Stripe session verification
        try {
          // Check if user already exists by email
          let existingUser = await storage.getUserByEmail(user_claims.email);
          
          if (existingUser) {
            // User exists, redirect to app
            const token = generateToken(existingUser);
            res.cookie('token', token, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              maxAge: 7 * 24 * 60 * 60 * 1000,
              sameSite: 'lax'
            });

            req.login(existingUser, (err) => {
              if (err) console.error('Session login error:', err);
              res.redirect('/app/counselor');
            });
            return;
          }

          // Create new user with Apple OAuth data and Stripe subscription
          const userToCreate = {
            username: user_claims.email.split('@')[0] || `user_${user_claims.sub}`,
            password: await hashPassword(Math.random().toString(36)),
            email: user_claims.email,
            phoneNumber: null,
            sessionId: sessionId,
            agreeToTerms: true,
            appleId: user_claims.sub
          };

          // Use the same account creation logic as the regular endpoint
          const response = await fetch(`${req.protocol}://${req.get('host')}/api/create-account-with-subscription`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userToCreate)
          });

          if (response.ok) {
            const result = await response.json();
            
            // Set authentication
            const token = generateToken(result.user);
            res.cookie('token', token, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              maxAge: 7 * 24 * 60 * 60 * 1000,
              sameSite: 'lax'
            });

            req.login(result.user, (err) => {
              if (err) console.error('Session login error:', err);
              res.redirect('/app/counselor');
            });
            return;
          } else {
            throw new Error('Account creation failed');
          }
          
        } catch (error) {
          console.error('Post-payment Apple OAuth account creation error:', error);
          return res.redirect('/create-account?session_id=' + sessionId + '&plan=' + (plan || '') + '&error=oauth_failed');
        }
      }

      // Regular OAuth flow (no session ID)
      let user = await storage.getUserByEmail(user_claims.email);
      
      if (!user) {
        // Create new user from Apple profile
        const userToCreate: any = {
          username: user_claims.email.split('@')[0] || `user_${user_claims.sub}`,
          password: await hashPassword(Math.random().toString(36)), // Random password since they use OAuth
          email: user_claims.email,
          phoneNumber: null,
          trialStartedAt: null,
          trialEndsAt: null,
          subscriptionPlan: null,
          appleId: user_claims.sub
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

      // Set session data and redirect
      req.login(user, (err) => {
        if (err) {
          console.error('Session login error:', err);
          return res.status(500).json({ error: 'Session creation failed' });
        }
        res.json({ success: true, redirect: '/pricing' });
      });

    } catch (err) {
      console.error('Apple OAuth Error:', err);
      res.status(500).json({ error: 'Authentication failed' });
    }
  });

  // Keep GET callback for fallback/redirect scenarios
  app.get("/auth/apple/callback", async (req, res) => {
    const { code, state } = req.query;

    if (!code) {
      return res.redirect('/auth?tab=login&error=oauth_failed');
    }

    try {
      const response = await appleAuth.accessToken(code as string);
      const claims = response.id_token;

      if (!claims || !claims.email) {
        return res.redirect('/auth?tab=login&error=no_email');
      }

      // Check if user already exists by email
      let user = await storage.getUserByEmail(claims.email);
      
      if (!user) {
        // Create new user from Apple profile
        const userToCreate: any = {
          username: claims.email.split('@')[0] || `user_${claims.sub}`,
          password: await hashPassword(Math.random().toString(36)), // Random password since they use OAuth
          email: claims.email,
          phoneNumber: null,
          trialStartedAt: null,
          trialEndsAt: null,
          subscriptionPlan: null,
          appleId: claims.sub
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
        res.redirect('/app/counselor');
      });

    } catch (err) {
      console.error('Apple OAuth Error:', err);
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