"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
exports.hashPassword = hashPassword;
exports.comparePasswords = comparePasswords;
exports.setupAuth = setupAuth;
exports.isAuthenticated = isAuthenticated;
exports.checkSubscriptionStatus = checkSubscriptionStatus;
const passport_1 = __importDefault(require("passport"));
const passport_local_1 = require("passport-local");
const express_session_1 = __importDefault(require("express-session"));
const crypto_1 = require("crypto");
const util_1 = require("util");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const storage_1 = require("./storage");
const connect_pg_simple_1 = __importDefault(require("connect-pg-simple"));
const security_1 = require("./security");
const scryptAsync = (0, util_1.promisify)(crypto_1.scrypt);
// JWT Secret - use environment variable or fallback
const JWT_SECRET = process.env.JWT_SECRET || 'reflectai-jwt-secret-key';
function generateToken(user) {
    return jsonwebtoken_1.default.sign({
        id: user.id,
        username: user.username,
        email: user.email
    }, JWT_SECRET, { expiresIn: '7d' });
}
function verifyToken(token) {
    try {
        return jsonwebtoken_1.default.verify(token, JWT_SECRET);
    }
    catch (error) {
        return null;
    }
}
function hashPassword(password) {
    return __awaiter(this, void 0, void 0, function* () {
        const salt = (0, crypto_1.randomBytes)(16).toString("hex");
        const buf = (yield scryptAsync(password, salt, 64));
        return `${buf.toString("hex")}.${salt}`;
    });
}
function comparePasswords(supplied, stored) {
    return __awaiter(this, void 0, void 0, function* () {
        const [hashed, salt] = stored.split(".");
        const hashedBuf = Buffer.from(hashed, "hex");
        const suppliedBuf = (yield scryptAsync(supplied, salt, 64));
        return (0, crypto_1.timingSafeEqual)(hashedBuf, suppliedBuf);
    });
}
function setupAuth(app) {
    // Configure PostgreSQL session storage for persistent sessions
    const pgStore = (0, connect_pg_simple_1.default)(express_session_1.default);
    const sessionStore = new pgStore({
        conString: process.env.DATABASE_URL,
        createTableIfMissing: true,
        ttl: 7 * 24 * 60 * 60, // 1 week in seconds
        tableName: "sessions",
    });
    const sessionSettings = {
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
    app.use((0, express_session_1.default)(sessionSettings));
    app.use(passport_1.default.initialize());
    app.use(passport_1.default.session());
    // Configure passport local strategy
    passport_1.default.use(new passport_local_1.Strategy((username, password, done) => __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield storage_1.storage.getUserByUsername(username);
            if (!user) {
                return done(null, false, { message: "Incorrect username or password" });
            }
            const passwordValid = yield comparePasswords(password, user.password);
            if (!passwordValid) {
                return done(null, false, { message: "Incorrect username or password" });
            }
            return done(null, user);
        }
        catch (error) {
            return done(error);
        }
    })));
    // Serialize user to session
    passport_1.default.serializeUser((user, done) => {
        done(null, user.id);
    });
    // Deserialize user from session
    passport_1.default.deserializeUser((id, done) => __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield storage_1.storage.getUser(id);
            done(null, user);
        }
        catch (error) {
            done(error);
        }
    }));
    // Register route
    app.post("/api/register", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            // Check if username already exists
            const existingUser = yield storage_1.storage.getUserByUsername(req.body.username);
            if (existingUser) {
                return res.status(400).send("Username already exists");
            }
            // Verify that either email or phone number is provided
            if (!req.body.email && !req.body.phoneNumber) {
                return res.status(400).send("Either email or phone number is required");
            }
            // Hash password and create user without trial
            const hashedPassword = yield hashPassword(req.body.password);
            // Create user with proper schema validation
            const userToCreate = {
                username: req.body.username,
                password: hashedPassword,
                email: req.body.email || null,
                phoneNumber: req.body.phoneNumber || null,
                trialStartedAt: null,
                trialEndsAt: null,
                subscriptionPlan: null,
            };
            const user = yield storage_1.storage.createUser(userToCreate);
            // Log user in automatically after registration
            req.login(user, (err) => {
                if (err)
                    return next(err);
                // Generate JWT token
                const token = generateToken(user);
                // Remove sensitive information before sending to client
                const sanitizedUser = (0, security_1.sanitizeUser)(user);
                (0, security_1.logPrivacyEvent)("user_created", user.id, "New user registered");
                return res.status(201).json(Object.assign(Object.assign({}, sanitizedUser), { token }));
            });
        }
        catch (error) {
            console.error("Registration error:", error);
            return res.status(500).send("An error occurred during registration");
        }
    }));
    // Login route - returns JWT token and user data
    app.post("/api/login", (req, res, next) => {
        passport_1.default.authenticate("local", (err, user, info) => {
            if (err)
                return next(err);
            if (!user) {
                return res.status(401).send((info === null || info === void 0 ? void 0 : info.message) || "Authentication failed");
            }
            req.login(user, (err) => {
                if (err)
                    return next(err);
                // Generate JWT token
                const token = generateToken(user);
                // Remove sensitive information before sending to client
                const sanitizedUser = (0, security_1.sanitizeUser)(user);
                (0, security_1.logPrivacyEvent)("user_login", user.id, "User logged in");
                return res.status(200).json(Object.assign(Object.assign({}, sanitizedUser), { token }));
            });
        })(req, res, next);
    });
    // Logout route
    app.post("/api/logout", (req, res, next) => {
        if (req.isAuthenticated()) {
            const userId = req.user.id;
            (0, security_1.logPrivacyEvent)("user_logout", userId, "User logged out");
        }
        req.logout((err) => {
            if (err)
                return next(err);
            req.session.destroy((err) => {
                if (err)
                    return next(err);
                res.sendStatus(200);
            });
        });
    });
    // Get current user route - supports both session and JWT authentication
    app.get("/api/user", (req, res) => __awaiter(this, void 0, void 0, function* () {
        let user = null;
        // Check for JWT token in Authorization header
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const decoded = verifyToken(token);
            if (decoded && decoded.id) {
                try {
                    user = yield storage_1.storage.getUserById(decoded.id);
                }
                catch (error) {
                    console.error("Error fetching user by JWT token:", error);
                }
            }
        }
        // Fallback to session-based authentication
        if (!user && req.isAuthenticated()) {
            user = req.user;
        }
        if (!user) {
            console.log("Authentication failed - no valid session or JWT token");
            return res.status(401).send("Not authenticated");
        }
        // Remove sensitive information before sending to client
        const sanitizedUser = (0, security_1.sanitizeUser)(user);
        console.log("Authentication successful, returning user:", sanitizedUser);
        res.json(sanitizedUser);
        // Log access to user data
        (0, security_1.logPrivacyEvent)("user_data_access", user.id, "User data accessed");
    }));
    // Check subscription status route
    app.get("/api/subscription/status", isAuthenticated, (req, res) => __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const user = req.user;
            if (!user) {
                return res.sendStatus(401);
            }
            // Initialize Stripe
            const stripe = (yield Promise.resolve().then(() => __importStar(require('stripe')))).default;
            const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
            // Check Stripe subscription status if user has a subscription ID
            let stripeSubscription = null;
            let stripeTrialInfo = null;
            if (user.stripeSubscriptionId) {
                try {
                    stripeSubscription = yield stripeInstance.subscriptions.retrieve(user.stripeSubscriptionId);
                    // Get trial information from Stripe
                    if (stripeSubscription.trial_end) {
                        stripeTrialInfo = {
                            trialEnd: new Date(stripeSubscription.trial_end * 1000),
                            isOnTrial: stripeSubscription.status === 'trialing'
                        };
                        // Update local trial info if different
                        const storage = (yield Promise.resolve().then(() => __importStar(require('./storage.js')))).storage;
                        if (((_a = user.stripeTrialEnd) === null || _a === void 0 ? void 0 : _a.getTime()) !== stripeTrialInfo.trialEnd.getTime() ||
                            user.isOnStripeTrial !== stripeTrialInfo.isOnTrial) {
                            yield storage.updateUserTrialInfo(user.id, stripeTrialInfo.trialEnd, stripeTrialInfo.isOnTrial);
                        }
                    }
                }
                catch (error) {
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
            }
            else if (user.trialEndsAt) {
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
                stripeTrialEnd: stripeTrialInfo === null || stripeTrialInfo === void 0 ? void 0 : stripeTrialInfo.trialEnd,
                isOnStripeTrial: stripeTrialInfo === null || stripeTrialInfo === void 0 ? void 0 : stripeTrialInfo.isOnTrial
            };
            res.json(subscriptionStatus);
        }
        catch (error) {
            console.error('Error getting subscription status:', error);
            res.status(500).json({ error: error.message });
        }
    }));
}
// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).send("Not authenticated");
}
// Middleware to check subscription (disabled - all users have unlimited access)
function checkSubscriptionStatus(req, res, next) {
    if (!req.isAuthenticated()) {
        return res.status(401).send("Not authenticated");
    }
    // Subscription check is disabled - all users have unlimited access 
    // to premium features regardless of subscription status
    return next();
}
