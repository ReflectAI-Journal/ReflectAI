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
exports.setupStripeWebhook = setupStripeWebhook;
exports.registerRoutes = registerRoutes;
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const storage_1 = require("./storage");
const zod_1 = require("zod");
const stripe_1 = __importDefault(require("stripe"));
const schema_js_1 = require("../shared/schema.js");
const openai_1 = require("./openai");
const auth_1 = require("./auth");
const security_1 = require("./security");
const subscriptionMiddleware_1 = require("./subscriptionMiddleware");
const feedback_storage_1 = require("./feedback-storage");
const resend_1 = require("./resend");
// Initialize Stripe
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
    throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new stripe_1.default(stripeSecretKey, {
    apiVersion: "2024-06-20",
});
// Setup Stripe webhook BEFORE express.json() middleware
function setupStripeWebhook(app) {
    app.post('/api/stripe/webhook', express_1.default.raw({ type: 'application/json' }), (req, res) => __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f;
        const sig = req.headers['stripe-signature'];
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
        let event;
        try {
            // Verify webhook signature if secret is provided
            if (endpointSecret && sig) {
                event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
                console.log('✅ Webhook signature verified successfully');
            }
            else {
                event = req.body;
                console.log('⚠️ No webhook secret provided, using raw body');
            }
        }
        catch (err) {
            console.log(`❌ Webhook signature verification failed:`, err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }
        // Handle the event
        try {
            switch (event.type) {
                case 'setup_intent.succeeded':
                    const setupIntent = event.data.object;
                    console.log('🎉 Setup intent succeeded:', setupIntent.id);
                    // Log successful payment method validation
                    if ((_a = setupIntent.metadata) === null || _a === void 0 ? void 0 : _a.userId) {
                        const userId = parseInt(setupIntent.metadata.userId);
                        console.log(`💳 Payment method validated for user ${userId} via setup intent ${setupIntent.id}`);
                    }
                    break;
                case 'payment_intent.created':
                    const paymentIntent = event.data.object;
                    console.log('Payment intent created:', paymentIntent.id);
                    break;
                case 'payment_intent.succeeded':
                    const succeededPaymentIntent = event.data.object;
                    console.log('🎉 Payment intent succeeded:', succeededPaymentIntent.id);
                    // Update user subscription in database when payment succeeds
                    if ((_b = succeededPaymentIntent.metadata) === null || _b === void 0 ? void 0 : _b.userId) {
                        const userId = parseInt(succeededPaymentIntent.metadata.userId);
                        const planId = succeededPaymentIntent.metadata.planId;
                        const subscriptionPlan = (planId === null || planId === void 0 ? void 0 : planId.includes('unlimited')) ? 'unlimited' : 'pro';
                        yield storage_1.storage.updateUserSubscription(userId, true, subscriptionPlan);
                        console.log(`Payment succeeded - updated user ${userId} subscription to ${subscriptionPlan}`);
                    }
                    break;
                case 'checkout.session.completed':
                    const session = event.data.object;
                    console.log('🎉 Checkout session completed:', session.id);
                    // Update user subscription in database
                    if (session.subscription && ((_c = session.metadata) === null || _c === void 0 ? void 0 : _c.userId)) {
                        const userId = parseInt(session.metadata.userId);
                        const planId = session.metadata.planId;
                        const subscriptionPlan = (planId === null || planId === void 0 ? void 0 : planId.includes('unlimited')) ? 'unlimited' : 'pro';
                        yield storage_1.storage.updateUserStripeInfo(userId, session.customer, session.subscription);
                        yield storage_1.storage.updateUserSubscription(userId, true, subscriptionPlan);
                        console.log(`✅ Updated user ${userId} subscription to ${subscriptionPlan} via checkout session`);
                    }
                    break;
                case 'customer.subscription.updated':
                case 'customer.subscription.deleted':
                    const subscription = event.data.object;
                    // Find user by Stripe customer ID
                    const customer = yield stripe.customers.retrieve(subscription.customer);
                    if (customer && !customer.deleted && customer.email) {
                        const user = yield storage_1.storage.getUserByEmail(customer.email);
                        if (user) {
                            const isActive = subscription.status === 'active';
                            const planName = subscription.status === 'active' ?
                                (((_f = (_e = (_d = subscription.items.data[0]) === null || _d === void 0 ? void 0 : _d.price) === null || _e === void 0 ? void 0 : _e.nickname) === null || _f === void 0 ? void 0 : _f.includes('unlimited')) ? 'unlimited' : 'pro') :
                                null;
                            yield storage_1.storage.updateUserSubscription(user.id, isActive, planName);
                            console.log(`Updated user ${user.id} subscription status: ${isActive ? 'active' : 'inactive'}`);
                        }
                    }
                    break;
                default:
                    console.log(`Unhandled event type ${event.type}`);
            }
            res.json({ received: true });
        }
        catch (error) {
            console.error('Webhook handler error:', error);
            res.status(500).json({ error: error.message });
        }
    }));
}
// Helper function to get Stripe Price ID for a plan
function getPriceIdForPlan(planId) {
    // Return null to force creation of inline pricing until we set up proper price IDs
    return null;
}
function registerRoutes(app) {
    return __awaiter(this, void 0, void 0, function* () {
        // Setup authentication routes and middleware
        (0, auth_1.setupAuth)(app);
        // Stripe payment routes
        app.post("/api/create-payment-intent", auth_1.isAuthenticated, (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { planId } = req.body;
                const user = req.user;
                if (!user.email) {
                    return res.status(400).json({ error: 'Email is required for subscription' });
                }
                // Map plan IDs to pricing details
                const priceMap = {
                    'pro-monthly': { amount: 1499, interval: 'month', planName: 'ReflectAI Pro', description: 'Essential AI journaling features' },
                    'pro-annually': { amount: 15290, interval: 'year', planName: 'ReflectAI Pro (Annual)', description: 'Essential AI journaling features - yearly billing' },
                    'unlimited-monthly': { amount: 2499, interval: 'month', planName: 'ReflectAI Unlimited', description: 'Complete mental wellness toolkit' },
                    'unlimited-annually': { amount: 25490, interval: 'year', planName: 'ReflectAI Unlimited (Annual)', description: 'Complete mental wellness toolkit - yearly billing' }
                };
                const selectedPlan = priceMap[planId];
                if (!selectedPlan) {
                    return res.status(400).json({ error: 'Invalid plan selected' });
                }
                // Validate required fields for multi-step checkout
                if (!agreeToTerms) {
                    return res.status(400).json({ error: 'Terms and conditions must be agreed to' });
                }
                // Create or get customer with updated personal information
                let customer;
                const customerData = {
                    email: (personalInfo === null || personalInfo === void 0 ? void 0 : personalInfo.email) || user.email,
                    name: personalInfo ? `${personalInfo.firstName} ${personalInfo.lastName}` : user.username,
                    address: personalInfo ? {
                        line1: personalInfo.address,
                        city: personalInfo.city,
                        state: personalInfo.state,
                        postal_code: personalInfo.zipCode,
                        country: 'US' // Default to US since country is no longer collected
                    } : undefined,
                    metadata: {
                        userId: user.id.toString(),
                        subscribeToNewsletter: subscribeToNewsletter ? 'true' : 'false',
                        planRequested: planId,
                        source: 'multi_step_checkout'
                    }
                };
                if (user.stripeCustomerId) {
                    customer = yield stripe.customers.update(user.stripeCustomerId, customerData);
                }
                else {
                    customer = yield stripe.customers.create(customerData);
                    yield storage_1.storage.updateStripeCustomerId(user.id, customer.id);
                }
                // Attach payment method to customer if provided
                if (paymentMethodId) {
                    yield stripe.paymentMethods.attach(paymentMethodId, {
                        customer: customer.id,
                    });
                }
                // Create subscription with 7-day trial
                const priceId = getPriceIdForPlan(planId);
                if (!priceId) {
                    return res.status(400).json({ error: 'Price ID not found for plan' });
                }
                const subscription = yield stripe.subscriptions.create({
                    customer: customer.id,
                    items: [{ price: priceId }],
                    payment_behavior: 'default_incomplete',
                    payment_settings: { save_default_payment_method: 'on_subscription' },
                    expand: ['latest_invoice.payment_intent'],
                    trial_period_days: 3,
                    default_payment_method: paymentMethodId,
                    metadata: {
                        userId: user.id.toString(),
                        planId: planId,
                        personalInfo: personalInfo ? JSON.stringify(personalInfo) : '',
                        subscribeToNewsletter: subscribeToNewsletter ? 'true' : 'false',
                        source: 'multi_step_checkout'
                    }
                });
                // Update user subscription status in database
                yield storage_1.storage.updateUserSubscription(user.id, {
                    stripeSubscriptionId: subscription.id,
                    subscriptionPlan: planId.includes('pro') ? 'pro' : 'unlimited',
                    hasActiveSubscription: true,
                    trialEndsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
                });
                // Get the payment intent from the subscription
                const invoice = subscription.latest_invoice;
                const paymentIntent = invoice === null || invoice === void 0 ? void 0 : invoice.payment_intent;
                res.json({
                    subscriptionId: subscription.id,
                    clientSecret: paymentIntent === null || paymentIntent === void 0 ? void 0 : paymentIntent.client_secret,
                    planDetails: selectedPlan,
                    trialEndsAt: subscription.trial_end
                });
                // For embedded checkout, create a setup intent for trial period
                // This allows collecting payment method without charging during trial
                const setupIntent = yield stripe.setupIntents.create({
                    customer: customer.id,
                    usage: 'off_session',
                    metadata: {
                        userId: user.id.toString(),
                        planId: planId,
                        amount: selectedPlan.amount.toString(),
                        interval: selectedPlan.interval,
                        planName: selectedPlan.planName
                    },
                });
                res.json({
                    clientSecret: setupIntent.client_secret,
                    planDetails: selectedPlan
                });
            }
            catch (error) {
                console.error('Payment intent error:', error);
                res.status(500).json({ message: "Error creating payment intent: " + error.message });
            }
        }));
        // Auto-login endpoint for successful checkout
        app.post("/api/checkout-login", (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, subscriptionId } = req.body;
                if (!email || !subscriptionId) {
                    return res.status(400).json({ message: "Missing required fields" });
                }
                // Find user by email
                const user = yield storage_1.storage.getUserByEmail(email);
                if (!user) {
                    return res.status(404).json({ message: "User not found" });
                }
                // Verify subscription exists
                const subscription = yield stripe.subscriptions.retrieve(subscriptionId);
                if (!subscription || subscription.metadata.userId !== user.id.toString()) {
                    return res.status(400).json({ message: "Invalid subscription" });
                }
                // Log the user in
                req.login(user, (err) => {
                    if (err) {
                        return res.status(500).json({ message: "Login failed" });
                    }
                    res.json({
                        success: true,
                        user: {
                            id: user.id,
                            username: user.username,
                            email: user.email,
                            hasActiveSubscription: user.hasActiveSubscription,
                            subscriptionPlan: user.subscriptionPlan
                        }
                    });
                });
            }
            catch (error) {
                console.error('Checkout login error:', error);
                res.status(500).json({ message: "Error logging in: " + error.message });
            }
        }));
        // Create subscription for unauthenticated users (checkout flow)
        app.post("/api/create-subscription-checkout", (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const { planId, paymentMethodId, personalInfo, agreeToTerms } = req.body;
                if (!planId || !paymentMethodId || !personalInfo || !agreeToTerms) {
                    return res.status(400).json({ message: "Missing required fields" });
                }
                // Validate personal info
                if (!personalInfo.firstName || !personalInfo.lastName || !personalInfo.email) {
                    return res.status(400).json({ message: "Personal information is required" });
                }
                // Map plan IDs to pricing details
                const priceMap = {
                    'pro-monthly': { amount: 1499, interval: 'month', planName: 'ReflectAI Pro', description: 'Essential AI journaling features' },
                    'pro-annually': { amount: 15290, interval: 'year', planName: 'ReflectAI Pro (Annual)', description: 'Essential AI journaling features - yearly billing' },
                    'unlimited-monthly': { amount: 2499, interval: 'month', planName: 'ReflectAI Unlimited', description: 'Complete mental wellness toolkit' },
                    'unlimited-annually': { amount: 25490, interval: 'year', planName: 'ReflectAI Unlimited (Annual)', description: 'Complete mental wellness toolkit - yearly billing' }
                };
                const selectedPlan = priceMap[planId];
                if (!selectedPlan) {
                    return res.status(400).json({ error: 'Invalid plan selected' });
                }
                // Check if user already exists
                let existingUser = yield storage_1.storage.getUserByEmail(personalInfo.email);
                let user;
                if (existingUser) {
                    user = existingUser;
                }
                else {
                    // Create new user account
                    const { hashPassword } = yield Promise.resolve().then(() => __importStar(require('./auth')));
                    const hashedPassword = yield hashPassword(personalInfo.email + '_temp'); // Use email as temp password
                    user = yield storage_1.storage.createUser({
                        username: personalInfo.email,
                        password: hashedPassword,
                        email: personalInfo.email,
                        trialStartedAt: new Date(),
                        trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                    });
                }
                // Create or get Stripe customer
                let customer;
                const customerData = {
                    email: personalInfo.email,
                    name: `${personalInfo.firstName} ${personalInfo.lastName}`,
                    address: personalInfo.address ? {
                        line1: personalInfo.address,
                        city: personalInfo.city,
                        state: personalInfo.state,
                        postal_code: personalInfo.zipCode,
                        country: 'US'
                    } : undefined,
                    metadata: {
                        userId: user.id.toString(),
                        planRequested: planId,
                        source: 'checkout_flow'
                    }
                };
                if (user.stripeCustomerId) {
                    customer = yield stripe.customers.update(user.stripeCustomerId, customerData);
                }
                else {
                    customer = yield stripe.customers.create(customerData);
                    yield storage_1.storage.updateStripeCustomerId(user.id, customer.id);
                }
                // Attach payment method to customer
                yield stripe.paymentMethods.attach(paymentMethodId, {
                    customer: customer.id,
                });
                // Set as default payment method
                yield stripe.customers.update(customer.id, {
                    invoice_settings: {
                        default_payment_method: paymentMethodId,
                    },
                });
                // Create subscription with 7-day trial using price IDs
                const priceIdMap = {
                    'pro-monthly': process.env.STRIPE_PRO_MONTHLY_PRICE_ID || 'price_1RlaaxDBTFagn9VwYdQi2Bzw',
                    'pro-annually': process.env.STRIPE_PRO_ANNUAL_PRICE_ID || 'price_abcdef1234567890',
                    'unlimited-monthly': process.env.STRIPE_UNLIMITED_MONTHLY_PRICE_ID || 'price_0987654321fedcba',
                    'unlimited-annually': process.env.STRIPE_UNLIMITED_ANNUAL_PRICE_ID || 'price_fedcba0987654321'
                };
                const priceId = priceIdMap[planId];
                if (!priceId) {
                    return res.status(400).json({ message: 'Invalid plan - price ID not found' });
                }
                console.log(`Creating subscription with priceId: ${priceId} for user: ${user.id}`);
                console.log(`Using customer: ${customer.id} with paymentMethod: ${paymentMethodId}`);
                const subscription = yield stripe.subscriptions.create({
                    customer: customer.id,
                    items: [
                        {
                            price: priceId,
                        },
                    ],
                    default_payment_method: paymentMethodId,
                    trial_period_days: 7,
                    expand: ['latest_invoice.payment_intent'],
                    metadata: {
                        userId: user.id.toString(),
                        planId: planId,
                        source: 'checkout_flow'
                    }
                });
                // Update user subscription status and Stripe info
                yield storage_1.storage.updateUserStripeInfo(user.id, customer.id, subscription.id);
                yield storage_1.storage.updateUserSubscription(user.id, true, planId.includes('unlimited') ? 'unlimited' : 'pro');
                res.json({
                    success: true,
                    subscriptionId: subscription.id,
                    clientSecret: (_b = (_a = subscription.latest_invoice) === null || _a === void 0 ? void 0 : _a.payment_intent) === null || _b === void 0 ? void 0 : _b.client_secret,
                    message: 'Subscription created successfully with 7-day trial',
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        hasActiveSubscription: true,
                        subscriptionPlan: planId.includes('unlimited') ? 'unlimited' : 'pro'
                    }
                });
            }
            catch (error) {
                console.error('Subscription creation error:', error);
                res.status(500).json({ message: "Error creating subscription: " + error.message });
            }
        }));
        // Create subscription with embedded Stripe Elements
        app.post("/api/create-subscription", auth_1.isAuthenticated, (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { planId, paymentMethodId, subscribeToNewsletter, firstName, lastName, email, address, city, state, zipCode, dateOfBirth } = req.body;
                if (!planId || !paymentMethodId) {
                    return res.status(400).json({ message: "Missing required fields: planId or paymentMethodId" });
                }
                const user = req.user;
                if (!user) {
                    return res.status(401).json({ message: "User not authenticated" });
                }
                // Plan configurations
                const planConfigs = {
                    'pro-monthly': { planName: 'ReflectAI Pro', amount: 1499, interval: 'month' },
                    'pro-annually': { planName: 'ReflectAI Pro', amount: 15290, interval: 'year' },
                    'unlimited-monthly': { planName: 'ReflectAI Unlimited', amount: 2499, interval: 'month' },
                    'unlimited-annually': { planName: 'ReflectAI Unlimited', amount: 25490, interval: 'year' }
                };
                const selectedPlan = planConfigs[planId];
                if (!selectedPlan) {
                    return res.status(400).json({ message: "Invalid plan ID" });
                }
                console.log(`Creating embedded subscription for user ${user.id} with plan ${planId}`);
                // Get or create Stripe customer
                let customer;
                if (user.stripeCustomerId) {
                    customer = yield stripe.customers.retrieve(user.stripeCustomerId);
                    console.log(`Retrieved existing Stripe customer ${customer.id} for user ${user.id}`);
                }
                else {
                    customer = yield stripe.customers.create({
                        email: email || user.email,
                        name: `${firstName} ${lastName}` || user.username,
                        payment_method: paymentMethodId,
                        invoice_settings: {
                            default_payment_method: paymentMethodId,
                        },
                        metadata: {
                            userId: user.id.toString(),
                            subscribeToNewsletter: subscribeToNewsletter ? 'true' : 'false',
                            signupDate: new Date().toISOString(),
                            planRequested: planId,
                            source: 'embedded_stripe'
                        }
                    });
                    yield storage_1.storage.updateStripeCustomerId(user.id, customer.id);
                    console.log(`Created Stripe customer ${customer.id} for user ${user.id} with plan ${planId}`);
                }
                // If existing customer, attach payment method and set as default
                if (user.stripeCustomerId) {
                    yield stripe.paymentMethods.attach(paymentMethodId, {
                        customer: customer.id,
                    });
                    yield stripe.customers.update(customer.id, {
                        invoice_settings: {
                            default_payment_method: paymentMethodId,
                        },
                    });
                }
                // For trial subscriptions, we don't need setup intents since no immediate payment is required
                // The payment method is already attached to the customer for future use
                console.log(`Payment method ${paymentMethodId} attached to customer ${customer.id} for trial subscription`);
                // Check if product already exists or create new one
                let product;
                try {
                    // Try to find existing product by name and plan to avoid duplicates
                    const existingProducts = yield stripe.products.list({
                        limit: 100,
                        active: true
                    });
                    product = existingProducts.data.find(p => {
                        var _a;
                        return p.name === selectedPlan.planName &&
                            ((_a = p.metadata) === null || _a === void 0 ? void 0 : _a.planId) === planId;
                    });
                    if (!product) {
                        product = yield stripe.products.create({
                            name: selectedPlan.planName,
                            description: `${selectedPlan.planName} subscription plan`,
                            metadata: {
                                planId: planId,
                                createdBy: 'ReflectAI'
                            }
                        });
                        console.log(`Created new Stripe product: ${product.id} for plan: ${planId}`);
                    }
                    else {
                        console.log(`Using existing Stripe product: ${product.id} for plan: ${planId}`);
                    }
                }
                catch (error) {
                    console.error('Error with product creation/retrieval:', error);
                    // Fallback to creating a new product
                    product = yield stripe.products.create({
                        name: selectedPlan.planName,
                        description: `${selectedPlan.planName} subscription plan`,
                        metadata: {
                            planId: planId,
                            createdBy: 'ReflectAI'
                        }
                    });
                }
                // Create price for the product
                const price = yield stripe.prices.create({
                    currency: 'usd',
                    unit_amount: selectedPlan.amount,
                    recurring: {
                        interval: selectedPlan.interval
                    },
                    product: product.id,
                    metadata: {
                        planId: planId,
                        interval: selectedPlan.interval,
                        amount: selectedPlan.amount.toString()
                    }
                });
                // Create subscription with 7-day trial using the price
                const subscription = yield stripe.subscriptions.create({
                    customer: customer.id,
                    items: [{
                            price: price.id
                        }],
                    trial_period_days: 7,
                    default_payment_method: paymentMethodId,
                    payment_behavior: 'default_incomplete',
                    payment_settings: {
                        save_default_payment_method: 'on_subscription',
                        payment_method_types: ['card']
                    },
                    expand: ['latest_invoice.payment_intent'],
                    metadata: {
                        userId: user.id.toString(),
                        planId: planId,
                        subscribeToNewsletter: subscribeToNewsletter ? 'true' : 'false',
                        source: 'embedded_checkout'
                    },
                });
                // Update user subscription status in our database
                yield storage_1.storage.updateUserStripeInfo(user.id, customer.id, subscription.id);
                const subscriptionPlan = (planId === null || planId === void 0 ? void 0 : planId.includes('unlimited')) ? 'unlimited' : 'pro';
                yield storage_1.storage.updateUserSubscription(user.id, true, subscriptionPlan);
                // Update trial information
                if (subscription.trial_end) {
                    const trialEnd = new Date(subscription.trial_end * 1000);
                    const isOnTrial = subscription.status === 'trialing';
                    yield storage_1.storage.updateUserTrialInfo(user.id, trialEnd, isOnTrial);
                    console.log(`Updated user ${user.id} trial info: ends ${trialEnd}, on trial: ${isOnTrial}`);
                }
                console.log(`✅ Embedded subscription created successfully - user ${user.id} subscription updated to ${subscriptionPlan}`);
                console.log(`💳 Payment method ${paymentMethodId} attached to customer ${customer.id} for trial subscription`);
                console.log(`📊 Check Stripe dashboard for subscription ${subscription.id}`);
                res.json({
                    success: true,
                    subscriptionId: subscription.id,
                    clientSecret: subscription.latest_invoice ? (_a = subscription.latest_invoice.payment_intent) === null || _a === void 0 ? void 0 : _a.client_secret : null,
                    planDetails: selectedPlan,
                    message: 'Subscription created with 7-day trial. Payment method saved for future billing.'
                });
            }
            catch (error) {
                console.error('Subscription creation error:', error);
                res.status(500).json({
                    error: error.message || 'Error creating subscription',
                    message: "Error creating subscription: " + error.message,
                    details: error.code || error.type || 'unknown_error'
                });
            }
        }));
        // Simple subscription creation using environment variable price IDs
        app.post("/api/create-subscription-simple", auth_1.isAuthenticated, (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            console.log('Creating simple subscription for user', req.user.id);
            const user = req.user;
            const { planId, paymentMethodId } = req.body;
            try {
                // Get customer ID or create customer
                let customerId = user.stripeCustomerId;
                if (!customerId) {
                    const customer = yield stripe.customers.create({
                        email: user.email,
                        name: user.username,
                        payment_method: paymentMethodId,
                        invoice_settings: {
                            default_payment_method: paymentMethodId,
                        },
                        metadata: {
                            userId: user.id.toString(),
                            planRequested: planId,
                            source: 'simple_subscription'
                        }
                    });
                    customerId = customer.id;
                    yield storage_1.storage.updateStripeCustomerId(user.id, customerId);
                    console.log(`Created Stripe customer ${customerId} for user ${user.id}`);
                }
                else {
                    // For existing customers, attach payment method and set as default
                    yield stripe.paymentMethods.attach(paymentMethodId, {
                        customer: customerId,
                    });
                    yield stripe.customers.update(customerId, {
                        invoice_settings: {
                            default_payment_method: paymentMethodId,
                        },
                    });
                }
                // Map plan IDs to environment variable price IDs
                const priceIdMap = {
                    'pro-monthly': process.env.STRIPE_PRO_MONTHLY_PRICE_ID || process.env.STRIPE_PRICE_ID || '',
                    'pro-annually': process.env.STRIPE_PRO_ANNUAL_PRICE_ID || '',
                    'unlimited-monthly': process.env.STRIPE_UNLIMITED_MONTHLY_PRICE_ID || '',
                    'unlimited-annually': process.env.STRIPE_UNLIMITED_ANNUAL_PRICE_ID || ''
                };
                const priceId = priceIdMap[planId] || process.env.STRIPE_PRICE_ID;
                if (!priceId) {
                    throw new Error(`No price ID configured for plan: ${planId}. Please set STRIPE_PRICE_ID environment variable.`);
                }
                console.log(`Using price ID: ${priceId} for plan: ${planId}`);
                // Create subscription using environment variable price ID (as requested)
                const subscription = yield stripe.subscriptions.create({
                    customer: customerId,
                    items: [{ price: priceId }],
                    trial_period_days: 7,
                    default_payment_method: paymentMethodId,
                    payment_behavior: 'default_incomplete',
                    payment_settings: {
                        save_default_payment_method: 'on_subscription',
                        payment_method_types: ['card']
                    },
                    expand: ['latest_invoice.payment_intent'],
                    metadata: {
                        userId: user.id.toString(),
                        planId: planId,
                        source: 'simple_subscription_api',
                        priceId: priceId
                    },
                });
                // Update user subscription status in database
                yield storage_1.storage.updateUserStripeInfo(user.id, customerId, subscription.id);
                const subscriptionPlan = (planId === null || planId === void 0 ? void 0 : planId.includes('unlimited')) ? 'unlimited' : 'pro';
                yield storage_1.storage.updateUserSubscription(user.id, true, subscriptionPlan);
                // Update trial information
                if (subscription.trial_end) {
                    const trialEnd = new Date(subscription.trial_end * 1000);
                    const isOnTrial = subscription.status === 'trialing';
                    yield storage_1.storage.updateUserTrialInfo(user.id, trialEnd, isOnTrial);
                    console.log(`✅ Simple subscription created - user ${user.id} updated to ${subscriptionPlan} using price ID ${priceId}`);
                }
                res.json({
                    success: true,
                    subscriptionId: subscription.id,
                    priceId: priceId,
                    clientSecret: subscription.latest_invoice ? (_a = subscription.latest_invoice.payment_intent) === null || _a === void 0 ? void 0 : _a.client_secret : null,
                    setupIntentClientSecret: null, // Simple endpoint doesn't create setup intents
                    message: 'Simple subscription created using environment variable price ID'
                });
            }
            catch (error) {
                console.error('Simple subscription creation error:', error);
                return res.status(400).json({ error: error.message });
            }
        }));
        // Simplified checkout session endpoint (matches frontend expectation)
        app.post('/api/checkout-session', (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.isAuthenticated()) {
                return res.sendStatus(401);
            }
            const user = req.user;
            const { planId } = req.body;
            try {
                // Create or get customer
                let customer;
                if (user.stripeCustomerId) {
                    customer = yield stripe.customers.retrieve(user.stripeCustomerId);
                }
                else {
                    customer = yield stripe.customers.create({
                        email: user.email,
                        name: user.username,
                        metadata: {
                            userId: user.id.toString(),
                            source: 'checkout_session'
                        }
                    });
                    yield storage_1.storage.updateStripeCustomerId(user.id, customer.id);
                }
                // Map plan IDs to Stripe price IDs
                const priceIdMap = {
                    'pro-monthly': process.env.STRIPE_PRO_MONTHLY_PRICE_ID || 'price_1RhVjMDBTFagn9VwUCHg8O50',
                    'pro-annually': process.env.STRIPE_PRO_ANNUALLY_PRICE_ID || 'price_1RhVjMDBTFagn9VwUCHg8O50',
                    'unlimited-monthly': process.env.STRIPE_UNLIMITED_MONTHLY_PRICE_ID || 'price_1RhVjMDBTFagn9VwUCHg8O50',
                    'unlimited-annually': process.env.STRIPE_UNLIMITED_ANNUALLY_PRICE_ID || 'price_1RhVjMDBTFagn9VwUCHg8O50'
                };
                const priceId = priceIdMap[planId] || 'price_1RhVjMDBTFagn9VwUCHg8O50';
                // Create checkout session with 3-day free trial
                const session = yield stripe.checkout.sessions.create({
                    success_url: "https://reflectai-journal.site/checkout-success?session_id={CHECKOUT_SESSION_ID}",
                    cancel_url: "https://reflectai-journal.site/subscription",
                    customer_email: user.email,
                    mode: "subscription",
                    line_items: [
                        {
                            price: priceId,
                            quantity: 1,
                        },
                    ],
                    subscription_data: {
                        trial_period_days: 3,
                    },
                    metadata: {
                        userId: user.id.toString(),
                        planId: planId
                    }
                });
                res.json({ url: session.url });
            }
            catch (error) {
                console.error('Checkout session error:', error);
                return res.status(400).json({ error: error.message });
            }
        }));
        // Create Stripe checkout session (original endpoint)
        app.post('/api/create-checkout-session', (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.isAuthenticated()) {
                return res.sendStatus(401);
            }
            const user = req.user;
            const { planId, subscribeToNewsletter } = req.body;
            if (!user.email) {
                return res.status(400).json({ error: 'Email is required for subscription' });
            }
            try {
                // Create or get customer with comprehensive data for Stripe database
                let customer;
                if (user.stripeCustomerId) {
                    customer = yield stripe.customers.retrieve(user.stripeCustomerId);
                    // Update customer with latest information
                    customer = yield stripe.customers.update(user.stripeCustomerId, {
                        email: user.email,
                        name: user.username,
                        metadata: {
                            userId: user.id.toString(),
                            subscribeToNewsletter: subscribeToNewsletter ? 'true' : 'false',
                            lastUpdated: new Date().toISOString(),
                            planRequested: planId
                        }
                    });
                    console.log(`Updated Stripe customer ${customer.id} for hosted checkout`);
                }
                else {
                    customer = yield stripe.customers.create({
                        email: user.email,
                        name: user.username,
                        metadata: {
                            userId: user.id.toString(),
                            subscribeToNewsletter: subscribeToNewsletter ? 'true' : 'false',
                            signupDate: new Date().toISOString(),
                            planRequested: planId,
                            source: 'hosted_checkout'
                        }
                    });
                    yield storage_1.storage.updateStripeCustomerId(user.id, customer.id);
                    console.log(`Created Stripe customer ${customer.id} for user ${user.id} via hosted checkout`);
                }
                // Map plan IDs to pricing details
                const priceMap = {
                    'pro-monthly': { amount: 1499, interval: 'month', planName: 'ReflectAI Pro', description: 'Essential AI journaling features' },
                    'pro-annually': { amount: 15290, interval: 'year', planName: 'ReflectAI Pro (Annual)', description: 'Essential AI journaling features - yearly billing' },
                    'unlimited-monthly': { amount: 2499, interval: 'month', planName: 'ReflectAI Unlimited', description: 'Complete mental wellness toolkit' },
                    'unlimited-annually': { amount: 25490, interval: 'year', planName: 'ReflectAI Unlimited (Annual)', description: 'Complete mental wellness toolkit - yearly billing' }
                };
                const selectedPlan = priceMap[planId];
                if (!selectedPlan) {
                    return res.status(400).json({ error: 'Invalid plan selected' });
                }
                // Map plan IDs to Stripe price IDs (using working price ID for development)
                const priceIdMap = {
                    'pro-monthly': process.env.STRIPE_PRO_MONTHLY_PRICE_ID || 'price_1RhVjMDBTFagn9VwUCHg8O50',
                    'pro-annually': process.env.STRIPE_PRO_ANNUALLY_PRICE_ID || 'price_1RhVjMDBTFagn9VwUCHg8O50',
                    'unlimited-monthly': process.env.STRIPE_UNLIMITED_MONTHLY_PRICE_ID || 'price_1RhVjMDBTFagn9VwUCHg8O50',
                    'unlimited-annually': process.env.STRIPE_UNLIMITED_ANNUALLY_PRICE_ID || 'price_1RhVjMDBTFagn9VwUCHg8O50'
                };
                const priceId = priceIdMap[planId];
                if (!priceId) {
                    return res.status(400).json({ error: 'Invalid plan - price ID not found' });
                }
                // Create checkout session with 3-day free trial using price ID
                const session = yield stripe.checkout.sessions.create({
                    mode: 'subscription',
                    line_items: [{
                            price: priceId,
                            quantity: 1
                        }],
                    subscription_data: {
                        trial_period_days: 3
                    },
                    customer: customer.id,
                    success_url: "https://reflectai-journal.site/checkout-success?session_id={CHECKOUT_SESSION_ID}",
                    cancel_url: "https://reflectai-journal.site/subscription",
                    metadata: {
                        userId: user.id.toString(),
                        planId: planId,
                        subscribeToNewsletter: subscribeToNewsletter ? 'true' : 'false'
                    }
                });
                res.json({ sessionId: session.id, url: session.url });
            }
            catch (error) {
                console.error('Stripe checkout error:', error);
                return res.status(400).json({ error: error.message });
            }
        }));
        // Alternative checkout session implementation (for reference)
        app.post('/api/create-alternate-checkout', (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.isAuthenticated()) {
                return res.sendStatus(401);
            }
            const user = req.user;
            const { priceId } = req.body;
            try {
                // Example 1: Subscription mode with trial period
                const session = yield stripe.checkout.sessions.create({
                    mode: 'subscription',
                    line_items: [{ price: priceId, quantity: 1 }],
                    subscription_data: {
                        trial_period_days: 3
                    },
                    success_url: "https://reflectai-journal.site/checkout-success?session_id={CHECKOUT_SESSION_ID}",
                    cancel_url: "https://reflectai-journal.site/subscription",
                });
                // Example 2: Payment mode with setup for future usage
                // const session = await stripe.checkout.sessions.create({
                //   mode: 'payment',
                //   line_items: [{ price: priceId, quantity: 1 }],
                //   payment_intent_data: {
                //     setup_future_usage: "off_session"
                //   },
                //   success_url: "https://reflectai-journal.site/checkout-success?session_id={CHECKOUT_SESSION_ID}",
                //   cancel_url: "https://reflectai-journal.site/subscription",
                // });
                res.json({ sessionId: session.id, url: session.url });
            }
            catch (error) {
                console.error('Alternate checkout error:', error);
                return res.status(400).json({ error: error.message });
            }
        }));
        // Handle successful checkout
        app.get('/api/checkout-success', (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.isAuthenticated()) {
                return res.sendStatus(401);
            }
            const { session_id } = req.query;
            if (!session_id) {
                return res.status(400).json({ error: 'Session ID required' });
            }
            try {
                const session = yield stripe.checkout.sessions.retrieve(session_id);
                if (session.payment_status === 'paid' && session.subscription) {
                    const user = req.user;
                    yield storage_1.storage.updateUserStripeInfo(user.id, session.customer, session.subscription);
                    res.json({ success: true, subscriptionId: session.subscription });
                }
                else {
                    res.status(400).json({ error: 'Payment not completed' });
                }
            }
            catch (error) {
                console.error('Checkout success error:', error);
                res.status(400).json({ error: error.message });
            }
        }));
        // Stripe webhook handler moved to setupStripeWebhook() function above JSON middleware
        // Journal entries routes
        app.get("/api/entries", auth_1.isAuthenticated, subscriptionMiddleware_1.enforceTrialExpiration, (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                // Get the authenticated user's ID from the session
                const userId = req.user.id;
                const entries = yield storage_1.storage.getJournalEntriesByUserId(userId);
                res.json(entries);
            }
            catch (err) {
                console.error("Error fetching entries:", err);
                res.status(500).json({ message: "Failed to fetch journal entries" });
            }
        }));
        app.post("/api/ai-response", (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { journalContent, aiType } = req.body;
            try {
                if (!journalContent) {
                    return res.status(400).json({ error: "Missing journal content" });
                }
                // Sanitize content before processing to remove any PII
                const sanitizedContent = (0, security_1.sanitizeContentForAI)(journalContent);
                // Log privacy event (without including the actual content)
                const userId = req.isAuthenticated() ? req.user.id : 0;
                (0, security_1.logPrivacyEvent)("ai_request", userId, `AI response requested (type: ${aiType || 'default'})`);
                let response = "";
                switch (aiType) {
                    case "counselor":
                        response = yield (0, openai_1.generateCounselorResponse)(sanitizedContent);
                        break;
                    case "philosopher":
                        response = yield (0, openai_1.generatePhilosopherResponse)(sanitizedContent);
                        break;
                    default:
                        response = yield (0, openai_1.generateAIResponse)(sanitizedContent);
                }
                res.json({ response });
            }
            catch (error) {
                console.error("AI response error:", error);
                res.status(500).json({ error: "AI failed" });
            }
        }));
        // Endpoint for the onboarding flow AI tease feature
        app.post("/api/onboarding/ai-tease", (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { content } = req.body;
            try {
                if (!content) {
                    return res.status(400).json({ error: "Missing content" });
                }
                // Sanitize content before processing to remove any PII
                const sanitizedContent = (0, security_1.sanitizeContentForAI)(content);
                // Log privacy event (without including the actual content)
                const userId = req.isAuthenticated() ? req.user.id : 0;
                (0, security_1.logPrivacyEvent)("ai_tease_request", userId, "AI tease response requested during onboarding");
                // Generate a teaser response - intentionally limited to make users want more
                let response = "";
                try {
                    // Try to get a full response first
                    const fullResponse = yield (0, openai_1.generateAIResponse)(sanitizedContent);
                    // Just give 1-2 sentences and cut off mid-sentence
                    // First, get only the first paragraph
                    const firstParagraph = fullResponse.split('\n\n')[0];
                    // Then split into sentences
                    const sentences = firstParagraph.split(/(?<=[.!?])\s+/);
                    // Take 1-2 sentences depending on length
                    if (sentences[0].length < 40 && sentences.length > 1) {
                        // If first sentence is short, include a second one but cut it off
                        const secondSentence = sentences[1];
                        const cutoffPoint = Math.min(Math.floor(secondSentence.length * 0.7), 30);
                        response = sentences[0] + " " + secondSentence.substring(0, cutoffPoint) + "...";
                    }
                    else {
                        // Otherwise just cut off the first sentence
                        const cutoffPoint = Math.min(Math.floor(sentences[0].length * 0.7), 60);
                        response = sentences[0].substring(0, cutoffPoint) + "...";
                    }
                }
                catch (error) {
                    console.error("Error generating AI tease:", error);
                    response = "Your question about life is quite profound. In philosophical terms, the meaning of existence is often viewed as...";
                }
                res.json({ response });
            }
            catch (error) {
                console.error("AI tease error:", error);
                res.status(500).json({ error: "AI tease failed" });
            }
        }));
        app.get("/api/entries/date/:year/:month/:day?", auth_1.isAuthenticated, (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                // Get the authenticated user's ID from the session
                const userId = req.user.id;
                const year = parseInt(req.params.year);
                const month = parseInt(req.params.month);
                const day = req.params.day ? parseInt(req.params.day) : undefined;
                const entries = yield storage_1.storage.getJournalEntriesByDate(userId, year, month, day);
                res.json(entries);
            }
            catch (err) {
                console.error("Error fetching entries by date:", err);
                res.status(500).json({ message: "Failed to fetch journal entries" });
            }
        }));
        app.get("/api/entries/:id", auth_1.isAuthenticated, subscriptionMiddleware_1.enforceTrialExpiration, (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const entryId = parseInt(req.params.id);
                const entry = yield storage_1.storage.getJournalEntry(entryId);
                if (!entry) {
                    return res.status(404).json({ message: "Journal entry not found" });
                }
                res.json(entry);
            }
            catch (err) {
                console.error("Error fetching entry:", err);
                res.status(500).json({ message: "Failed to fetch journal entry" });
            }
        }));
        app.post("/api/entries", auth_1.isAuthenticated, subscriptionMiddleware_1.enforceTrialExpiration, (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                // Get the authenticated user's ID from the session
                const userId = req.user.id;
                console.log("Creating journal entry with data:", req.body);
                console.log("User ID:", userId);
                // Ensure content is provided and not empty
                if (!req.body.content || req.body.content.trim() === '') {
                    return res.status(400).json({
                        message: "Journal entry content cannot be empty"
                    });
                }
                const data = schema_js_1.insertJournalEntrySchema.parse({
                    userId,
                    content: req.body.content,
                    title: req.body.title || null,
                    moods: req.body.moods || [],
                    date: req.body.date || new Date().toISOString(),
                });
                console.log("Parsed data:", data);
                const newEntry = yield storage_1.storage.createJournalEntry(data);
                // Generate AI response if content is provided
                if (newEntry.content) {
                    try {
                        // Check if OpenAI API key is valid
                        const apiKey = process.env.OPENAI_API_KEY || '';
                        if (apiKey.length < 10 || !apiKey.startsWith('sk-')) {
                            console.log("Invalid or missing OpenAI API key, using fallback AI response for new entry");
                            throw new Error("Invalid OpenAI API key format");
                        }
                        const aiResponse = yield (0, openai_1.generateAIResponse)(newEntry.content);
                        yield storage_1.storage.updateJournalEntry(newEntry.id, { aiResponse });
                        newEntry.aiResponse = aiResponse;
                    }
                    catch (aiError) {
                        console.error("Error generating AI response:", aiError);
                        // Generate a fallback response based on entry content
                        const entryText = newEntry.content.toLowerCase();
                        // Extract keywords for better contextual responses
                        const stopWords = ['what', 'when', 'where', 'which', 'that', 'this', 'with', 'would', 'could', 'should', 'have', 'from', 'your', 'about', 'just', 'and', 'the', 'for', 'but'];
                        const keywords = entryText.split(/\s+/).filter((word) => word.length > 3 && !stopWords.includes(word));
                        // Create a contextual prefix if we have keywords
                        let contextualPrefix = "";
                        if (keywords.length > 0) {
                            // Select 1-2 keywords to reference
                            const selectedKeywords = keywords.length > 3
                                ? [keywords[0], keywords[Math.floor(keywords.length / 2)]]
                                : [keywords[0]];
                            contextualPrefix = `I notice you mentioned ${selectedKeywords.join(' and ')}. `;
                        }
                        // Check for emotional cues
                        const tiredWords = ['tired', 'exhausted', 'fatigue', 'weary', 'sleepy', 'sleep'];
                        const anxiousWords = ['anxious', 'worry', 'stress', 'overwhelm', 'nervous', 'hard', 'difficult'];
                        const sadWords = ['sad', 'down', 'depress', 'unhappy', 'blue', 'miserable'];
                        const happyWords = ['happy', 'joy', 'excit', 'glad', 'great', 'good', 'positive'];
                        let emotionalTone = '';
                        if (tiredWords.some(word => entryText.includes(word))) {
                            emotionalTone = 'It sounds like you might be feeling tired or drained. ';
                        }
                        else if (anxiousWords.some(word => entryText.includes(word))) {
                            emotionalTone = 'I sense some anxiety or stress in your entry. ';
                        }
                        else if (sadWords.some(word => entryText.includes(word))) {
                            emotionalTone = 'There seems to be a tone of sadness in your writing. ';
                        }
                        else if (happyWords.some(word => entryText.includes(word))) {
                            emotionalTone = 'There\'s a positive energy in your entry today. ';
                        }
                        // Choose a fallback response
                        const fallbackResponses = [
                            `${contextualPrefix}${emotionalTone}Thank you for taking the time to journal today. Reflecting on your thoughts and feelings this way helps build self-awareness and emotional intelligence. What might help you address the situations you've described?`,
                            `${contextualPrefix}${emotionalTone}I appreciate you sharing your experiences in this journal entry. Writing about your day is a powerful tool for processing emotions and gaining perspective. Is there a specific aspect of what you wrote that you'd like to explore further?`,
                            `${contextualPrefix}${emotionalTone}Your journal entry shows thoughtful self-reflection. By recording your thoughts, you're creating valuable space between experience and reaction, which can lead to more intentional choices. What would be a small step toward addressing what you've written about?`,
                            `${contextualPrefix}${emotionalTone}I notice the way you've articulated your experiences today. This kind of reflection helps build perspective and emotional resilience. What resources or support might help you navigate the situations you've described?`,
                            `${contextualPrefix}${emotionalTone}Your journaling creates a record of your inner experience. Looking at what you've written, what patterns do you notice, and what might they tell you about your needs right now?`
                        ];
                        const randomIndex = Math.floor(Math.random() * fallbackResponses.length);
                        const fallbackResponse = fallbackResponses[randomIndex];
                        // Update the entry with the fallback response
                        yield storage_1.storage.updateJournalEntry(newEntry.id, { aiResponse: fallbackResponse });
                        newEntry.aiResponse = fallbackResponse;
                    }
                }
                res.status(201).json(newEntry);
            }
            catch (err) {
                if (err instanceof zod_1.ZodError) {
                    return res.status(400).json({
                        message: "Invalid journal entry data",
                        errors: err.errors
                    });
                }
                console.error("Error creating entry:", err);
                res.status(500).json({ message: "Failed to create journal entry" });
            }
        }));
        app.put("/api/entries/:id", auth_1.isAuthenticated, subscriptionMiddleware_1.enforceTrialExpiration, (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const entryId = parseInt(req.params.id);
                const entry = yield storage_1.storage.getJournalEntry(entryId);
                if (!entry) {
                    return res.status(404).json({ message: "Journal entry not found" });
                }
                // Verify the entry belongs to the authenticated user
                const userId = req.user.id;
                if (entry.userId !== userId) {
                    return res.status(403).json({ message: "Unauthorized to modify this entry" });
                }
                const data = schema_js_1.updateJournalEntrySchema.parse(req.body);
                // If content was changed, regenerate AI response
                if (data.content && data.content !== entry.content) {
                    try {
                        // Check if OpenAI API key is valid
                        const apiKey = process.env.OPENAI_API_KEY || '';
                        if (apiKey.length < 10 || !apiKey.startsWith('sk-')) {
                            console.log("Invalid or missing OpenAI API key, using fallback AI response for edit");
                            throw new Error("Invalid OpenAI API key format");
                        }
                        const aiResponse = yield (0, openai_1.generateAIResponse)(data.content);
                        data.aiResponse = aiResponse;
                    }
                    catch (aiError) {
                        console.error("Error generating AI response:", aiError);
                        // Generate a fallback response based on entry content
                        const entryText = data.content.toLowerCase();
                        // Extract keywords for better contextual responses
                        const stopWords = ['what', 'when', 'where', 'which', 'that', 'this', 'with', 'would', 'could', 'should', 'have', 'from', 'your', 'about', 'just', 'and', 'the', 'for', 'but'];
                        const keywords = entryText.split(/\s+/).filter((word) => word.length > 3 && !stopWords.includes(word));
                        // Create a contextual prefix if we have keywords
                        let contextualPrefix = "";
                        if (keywords.length > 0) {
                            // Select 1-2 keywords to reference
                            const selectedKeywords = keywords.length > 3
                                ? [keywords[0], keywords[Math.floor(keywords.length / 2)]]
                                : [keywords[0]];
                            contextualPrefix = `I notice you mentioned ${selectedKeywords.join(' and ')}. `;
                        }
                        // Check for emotional cues
                        const tiredWords = ['tired', 'exhausted', 'fatigue', 'weary', 'sleepy', 'sleep'];
                        const anxiousWords = ['anxious', 'worry', 'stress', 'overwhelm', 'nervous', 'hard', 'difficult'];
                        const sadWords = ['sad', 'down', 'depress', 'unhappy', 'blue', 'miserable'];
                        const happyWords = ['happy', 'joy', 'excit', 'glad', 'great', 'good', 'positive'];
                        let emotionalTone = '';
                        if (tiredWords.some(word => entryText.includes(word))) {
                            emotionalTone = 'It sounds like you might be feeling tired or drained. ';
                        }
                        else if (anxiousWords.some(word => entryText.includes(word))) {
                            emotionalTone = 'I sense some anxiety or stress in your entry. ';
                        }
                        else if (sadWords.some(word => entryText.includes(word))) {
                            emotionalTone = 'There seems to be a tone of sadness in your writing. ';
                        }
                        else if (happyWords.some(word => entryText.includes(word))) {
                            emotionalTone = 'There\'s a positive energy in your entry today. ';
                        }
                        // Choose a fallback response
                        const fallbackResponses = [
                            `${contextualPrefix}${emotionalTone}Thank you for updating your journal entry. Refining your thoughts this way shows a commitment to self-reflection and growth. What new insights emerged as you revised your thoughts?`,
                            `${contextualPrefix}${emotionalTone}I see you've updated your journal entry. This iterative process of revisiting and refining your thoughts can reveal deeper patterns and perspectives. Has this revision process helped clarify anything for you?`,
                            `${contextualPrefix}${emotionalTone}Your revised journal entry shows thoughtful engagement with your experiences. By returning to and developing your initial thoughts, you're creating a more nuanced understanding. What prompted these revisions?`,
                            `${contextualPrefix}${emotionalTone}I appreciate how you've expanded on your thoughts in this updated entry. This kind of reflection helps develop emotional intelligence and self-awareness. What felt most important to add or change?`,
                            `${contextualPrefix}${emotionalTone}Your updated journaling shows an evolving perspective. This process of revising and reconsidering is valuable for gaining clarity. How has your understanding shifted through this revision?`
                        ];
                        const randomIndex = Math.floor(Math.random() * fallbackResponses.length);
                        const fallbackResponse = fallbackResponses[randomIndex];
                        // Update with fallback response
                        data.aiResponse = fallbackResponse;
                    }
                }
                const updatedEntry = yield storage_1.storage.updateJournalEntry(entryId, data);
                res.json(updatedEntry);
            }
            catch (err) {
                if (err instanceof zod_1.ZodError) {
                    return res.status(400).json({
                        message: "Invalid journal entry data",
                        errors: err.errors
                    });
                }
                console.error("Error updating entry:", err);
                res.status(500).json({ message: "Failed to update journal entry" });
            }
        }));
        // New endpoint to regenerate AI response for an existing entry
        app.post("/api/entries/:id/regenerate-ai", auth_1.isAuthenticated, (0, subscriptionMiddleware_1.requiresSubscription)('ai-journal-insights'), (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const entryId = parseInt(req.params.id);
                const entry = yield storage_1.storage.getJournalEntry(entryId);
                if (!entry) {
                    return res.status(404).json({ message: "Journal entry not found" });
                }
                // Verify the entry belongs to the authenticated user
                const userId = req.user.id;
                if (entry.userId !== userId) {
                    return res.status(403).json({ message: "Unauthorized to modify this entry" });
                }
                if (!entry.content) {
                    return res.status(400).json({ message: "Entry has no content to analyze" });
                }
                try {
                    // Get current OpenAI API key from environment (without revealing the full key)
                    const apiKey = process.env.OPENAI_API_KEY || '';
                    const keyPreview = apiKey.length > 8 ?
                        `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}` :
                        'Not found';
                    console.log("Using OpenAI API key (preview):", keyPreview);
                    console.log("API key starts with correct format (sk-):", apiKey.startsWith('sk-'));
                    // Check if we can use the OpenAI API
                    if (apiKey.length < 10 || !apiKey.startsWith('sk-')) {
                        console.log("Invalid or missing OpenAI API key, using fallback AI response");
                        throw new Error("Invalid OpenAI API key format");
                    }
                    // Generate AI response
                    const aiResponse = yield (0, openai_1.generateAIResponse)(entry.content);
                    // Update the entry with the new AI response
                    const updatedEntry = yield storage_1.storage.updateJournalEntry(entryId, { aiResponse });
                    res.json(updatedEntry);
                }
                catch (apiError) {
                    // Generate a fallback response even if the OpenAI API call fails
                    console.log("Generating fallback response due to API error");
                    // Create contextual fallback responses based on entry content
                    // Get keywords from the content to make response more relevant
                    const entryText = entry.content.toLowerCase();
                    // Extract keywords for better contextual responses
                    const stopWords = ['what', 'when', 'where', 'which', 'that', 'this', 'with', 'would', 'could', 'should', 'have', 'from', 'your', 'about', 'just', 'and', 'the', 'for', 'but'];
                    const keywords = entryText.split(/\s+/).filter((word) => word.length > 3 && !stopWords.includes(word));
                    // Create a contextual prefix if we have keywords
                    let contextualPrefix = "";
                    if (keywords.length > 0) {
                        // Select 1-2 keywords to reference
                        const selectedKeywords = keywords.length > 3
                            ? [keywords[0], keywords[Math.floor(keywords.length / 2)]]
                            : [keywords[0]];
                        contextualPrefix = `I notice you mentioned ${selectedKeywords.join(' and ')}. `;
                    }
                    // Check for emotional cues
                    const tiredWords = ['tired', 'exhausted', 'fatigue', 'weary', 'sleepy', 'sleep'];
                    const anxiousWords = ['anxious', 'worry', 'stress', 'overwhelm', 'nervous', 'hard', 'difficult'];
                    const sadWords = ['sad', 'down', 'depress', 'unhappy', 'blue', 'miserable'];
                    const happyWords = ['happy', 'joy', 'excit', 'glad', 'great', 'good', 'positive'];
                    let emotionalTone = '';
                    if (tiredWords.some(word => entryText.includes(word))) {
                        emotionalTone = 'It sounds like you might be feeling tired or drained. ';
                    }
                    else if (anxiousWords.some(word => entryText.includes(word))) {
                        emotionalTone = 'I sense some anxiety or stress in your entry. ';
                    }
                    else if (sadWords.some(word => entryText.includes(word))) {
                        emotionalTone = 'There seems to be a tone of sadness in your writing. ';
                    }
                    else if (happyWords.some(word => entryText.includes(word))) {
                        emotionalTone = 'There\'s a positive energy in your entry today. ';
                    }
                    // Create custom fallback responses with context awareness
                    const fallbackResponses = [
                        `${contextualPrefix}${emotionalTone}Thank you for taking the time to journal today. Reflecting on your thoughts and feelings this way helps build self-awareness and emotional intelligence. What might help you address the situations you've described?`,
                        `${contextualPrefix}${emotionalTone}I appreciate you sharing your experiences in this journal entry. Writing about your day is a powerful tool for processing emotions and gaining perspective. Is there a specific aspect of what you wrote that you'd like to explore further?`,
                        `${contextualPrefix}${emotionalTone}Your journal entry shows thoughtful self-reflection. By recording your thoughts, you're creating valuable space between experience and reaction, which can lead to more intentional choices. What would be a small step toward addressing what you've written about?`,
                        `${contextualPrefix}${emotionalTone}I notice the way you've articulated your experiences today. This kind of reflection helps build perspective and emotional resilience. What resources or support might help you navigate the situations you've described?`,
                        `${contextualPrefix}${emotionalTone}Your journaling creates a record of your inner experience. Looking at what you've written, what patterns do you notice, and what might they tell you about your needs right now?`
                    ];
                    // Get the current AI response
                    const currentResponse = entry.aiResponse || "";
                    // Find a new response that's different from the current one
                    let newResponse = currentResponse;
                    while (newResponse === currentResponse && fallbackResponses.length > 0) {
                        const randomIndex = Math.floor(Math.random() * fallbackResponses.length);
                        newResponse = fallbackResponses[randomIndex];
                        // If we happen to select the same response, remove it and try again
                        if (newResponse === currentResponse && fallbackResponses.length > 1) {
                            fallbackResponses.splice(randomIndex, 1);
                        }
                        else {
                            break;
                        }
                    }
                    // Update with fallback response
                    const updatedEntry = yield storage_1.storage.updateJournalEntry(entryId, {
                        aiResponse: newResponse
                    });
                    res.json(updatedEntry);
                }
            }
            catch (err) {
                console.error("Error regenerating AI response:", err);
                res.status(500).json({ message: "Failed to regenerate AI response" });
            }
        }));
        // Debug endpoint for environment variables (NEVER use in production)
        app.get("/api/debug/env-test", (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                // Get OpenAI API key info (without revealing the full key)
                const apiKey = process.env.OPENAI_API_KEY || '';
                const keyPreview = apiKey.length > 8 ?
                    `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}` :
                    'Not found';
                res.json({
                    openai_key_length: apiKey.length,
                    openai_key_preview: keyPreview,
                    openai_key_valid_format: apiKey.startsWith('sk-'),
                    env_var_exists: Boolean(process.env.OPENAI_API_KEY)
                });
            }
            catch (error) {
                console.error("Error in env test endpoint:", error);
                res.status(500).json({ message: "Error testing environment variables" });
            }
        }));
        app.delete("/api/entries/:id", auth_1.isAuthenticated, subscriptionMiddleware_1.enforceTrialExpiration, (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const entryId = parseInt(req.params.id);
                const entry = yield storage_1.storage.getJournalEntry(entryId);
                if (!entry) {
                    return res.status(404).json({ message: "Journal entry not found" });
                }
                // Verify the entry belongs to the authenticated user
                const userId = req.user.id;
                if (entry.userId !== userId) {
                    return res.status(403).json({ message: "Unauthorized to delete this entry" });
                }
                const success = yield storage_1.storage.deleteJournalEntry(entryId);
                if (!success) {
                    return res.status(404).json({ message: "Journal entry not found" });
                }
                res.status(204).send();
            }
            catch (err) {
                console.error("Error deleting entry:", err);
                res.status(500).json({ message: "Failed to delete journal entry" });
            }
        }));
        // Journal stats routes
        app.get("/api/stats", auth_1.isAuthenticated, subscriptionMiddleware_1.enforceTrialExpiration, (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                // Get the authenticated user's ID from the session
                const userId = req.user.id;
                const stats = yield storage_1.storage.getJournalStats(userId);
                if (!stats) {
                    // Return default stats if none exist yet
                    return res.json({
                        userId,
                        entriesCount: 0,
                        currentStreak: 0,
                        longestStreak: 0,
                        topMoods: {},
                        lastUpdated: new Date(),
                    });
                }
                res.json(stats);
            }
            catch (err) {
                console.error("Error fetching stats:", err);
                res.status(500).json({ message: "Failed to fetch journal stats" });
            }
        }));
        // Chatbot routes
        app.post("/api/chatbot/message", auth_1.isAuthenticated, subscriptionMiddleware_1.enforceTrialExpiration, (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { messages, supportType, personalityType, customInstructions } = req.body;
                if (!Array.isArray(messages) || messages.length === 0) {
                    return res.status(400).json({ message: "Messages are required and must be an array" });
                }
                // Validate the format of messages
                const validMessages = messages.every((msg) => typeof msg === 'object' &&
                    (msg.role === 'user' || msg.role === 'assistant' || msg.role === 'system') &&
                    typeof msg.content === 'string');
                if (!validMessages) {
                    return res.status(400).json({
                        message: "Invalid message format. Each message must have 'role' (user, assistant, or system) and 'content' properties"
                    });
                }
                // Check if user can send messages based on their subscription
                const userId = req.user.id;
                const { canSend, remaining } = yield storage_1.storage.canSendChatMessage(userId);
                if (!canSend) {
                    return res.status(403).json({
                        message: "Chat limit reached",
                        error: "You have reached your weekly chat limit. Please upgrade to the Unlimited plan for unlimited chats.",
                        remaining: 0
                    });
                }
                // Check if supportType is valid
                const validSupportTypes = ['emotional', 'productivity', 'general', 'philosophy'];
                const validatedSupportType = validSupportTypes.includes(supportType) ? supportType : 'general';
                // Check if personalityType is a valid built-in type
                const validBuiltInTypes = ['default', 'socratic', 'stoic', 'existentialist', 'analytical', 'poetic', 'humorous', 'zen'];
                // If it's a built-in type, validate it, otherwise treat it as a custom personality ID
                let validatedPersonalityType = personalityType;
                let validatedCustomInstructions = undefined;
                if (validBuiltInTypes.includes(personalityType)) {
                    // It's a built-in type
                    validatedPersonalityType = personalityType;
                }
                else if (typeof personalityType === 'string' && personalityType.startsWith('custom_')) {
                    // It's a custom personality ID
                    validatedPersonalityType = personalityType;
                    validatedCustomInstructions = customInstructions;
                }
                else {
                    // Use default if invalid
                    validatedPersonalityType = 'default';
                }
                try {
                    // Check if OpenAI API key is valid
                    const apiKey = process.env.OPENAI_API_KEY || '';
                    if (apiKey.length < 10 || !apiKey.startsWith('sk-')) {
                        console.log("Invalid or missing OpenAI API key, using fallback chat response");
                        throw new Error("Invalid OpenAI API key format");
                    }
                    // Log privacy event for chat processing
                    (0, security_1.logPrivacyEvent)("chatbot_request", userId, `Chatbot interaction (type: ${validatedSupportType}, personality: ${validatedPersonalityType})`);
                    // Generate response using OpenAI with personality type and custom instructions
                    // Note: The sanitizeContentForAI is already applied within the generateChatbotResponse function
                    const aiResponse = yield (0, openai_1.generateChatbotResponse)(messages, validatedSupportType, validatedPersonalityType, validatedCustomInstructions);
                    // Increment chat usage count for the user
                    yield storage_1.storage.incrementChatUsage(userId);
                    // Check if the AI response contains a question and schedule a check-in
                    if (aiResponse.includes('?')) {
                        try {
                            // Schedule a check-in for 2-3 days later
                            const checkInDate = new Date();
                            checkInDate.setDate(checkInDate.getDate() + Math.floor(Math.random() * 2) + 2); // 2-3 days
                            // Extract the last question from the response for the check-in
                            const questions = aiResponse.split('?').filter(q => q.trim().length > 10);
                            if (questions.length > 0) {
                                const lastQuestion = questions[questions.length - 1].trim() + '?';
                                yield storage_1.storage.createCheckIn({
                                    userId,
                                    type: validatedSupportType === 'philosophy' ? 'philosopher' : 'counselor',
                                    question: lastQuestion,
                                    originalDate: new Date(),
                                    scheduledDate: checkInDate
                                });
                            }
                        }
                        catch (checkInError) {
                            console.error("Error creating check-in:", checkInError);
                            // Don't fail the response if check-in creation fails
                        }
                    }
                    // Get updated remaining chats
                    const { remaining } = yield storage_1.storage.canSendChatMessage(userId);
                    // Return response with remaining count
                    res.json({
                        role: "assistant",
                        content: aiResponse,
                        remaining: remaining
                    });
                }
                catch (apiError) {
                    // Check for rate limit or quota errors specifically
                    if ((apiError === null || apiError === void 0 ? void 0 : apiError.message) && (apiError.message.includes("exceeded your current quota") ||
                        apiError.message.includes("rate limit") ||
                        apiError.message.includes("429") ||
                        (apiError === null || apiError === void 0 ? void 0 : apiError.status) === 429)) {
                        console.log("Using fallback chatbot response due to API rate limiting or quota issue");
                    }
                    else {
                        console.log("Using fallback chatbot response due to API error");
                    }
                    // Get the user's last message to create a more contextual response
                    const lastUserMessage = ((_a = messages.filter(msg => msg.role === 'user').pop()) === null || _a === void 0 ? void 0 : _a.content) || '';
                    const lowerUserMessage = lastUserMessage.toLowerCase();
                    // Extract keywords for better contextual responses
                    const stopWords = ['what', 'when', 'where', 'which', 'that', 'this', 'with', 'would', 'could', 'should', 'have', 'from', 'your', 'about'];
                    const keywords = lowerUserMessage.split(/\s+/).filter((word) => word.length > 3 && !stopWords.includes(word));
                    // Create a contextual response that refers to the user's message
                    let contextualPrefix = "";
                    if (keywords.length > 0) {
                        // Select 1-2 keywords to reference
                        const selectedKeywords = keywords.length > 3
                            ? [keywords[0], keywords[Math.floor(keywords.length / 2)]]
                            : [keywords[0]];
                        contextualPrefix = `Regarding your thoughts on ${selectedKeywords.join(' and ')}, `;
                    }
                    // Create a set of different possible fallback responses based on personality
                    let fallbackResponses;
                    // Check if this is a custom personality
                    if (typeof validatedPersonalityType === 'string' && validatedPersonalityType.startsWith('custom_')) {
                        // For custom personalities, provide a contextual fallback with a mention of custom instructions
                        fallbackResponses = [
                            `${contextualPrefix}I appreciate your perspective. Using your custom personality parameters, I would suggest exploring how these ideas connect to your daily experiences. What aspects of this topic resonate with you most?`,
                            `${contextualPrefix}Your insights raise important considerations. From your custom philosophical framework, we might examine the underlying assumptions. How did you arrive at this particular viewpoint?`,
                            `${contextualPrefix}What an intriguing perspective. Following your custom philosophical approach, I'd like to understand more about how you see these concepts relating to broader questions of meaning and purpose.`,
                            `${contextualPrefix}I find your thoughts on this compelling. Based on your custom philosophical preferences, we might consider both the practical and theoretical implications. What further dimensions would you like to explore?`,
                            `${contextualPrefix}This is a fascinating area to discuss. Your custom philosophical framework offers unique tools to analyze these ideas. Which aspects would you like to examine more deeply?`
                        ];
                    }
                    else if (validatedPersonalityType === 'socratic') {
                        fallbackResponses = [
                            `${contextualPrefix}What are you truly seeking in this reflection? Have you considered examining the premises that led to these thoughts?`,
                            `${contextualPrefix}If we were to investigate these ideas together, what definitions would we need to establish first?`,
                            `${contextualPrefix}This is an interesting perspective. Before I offer my thoughts, what do you yourself believe about this matter?`,
                            `${contextualPrefix}Your thoughts invite us to examine our assumptions. What knowledge do you already have that might help us explore this topic further?`,
                            `${contextualPrefix}Rather than providing conclusions outright, perhaps we should break this down into smaller questions. What aspect puzzles you most?`
                        ];
                    }
                    else if (validatedPersonalityType === 'stoic') {
                        fallbackResponses = [
                            `${contextualPrefix}Remember that we cannot control external events, only our responses to them. How might this perspective change your approach?`,
                            `${contextualPrefix}Virtue is the only true good. How does your thoughts relate to developing courage, justice, temperance, or wisdom?`,
                            `${contextualPrefix}Consider whether your concern lies within your circle of control or merely your circle of concern. Focus on what you can influence.`,
                            `${contextualPrefix}A Stoic approach would be to accept what cannot be changed while taking virtuous action where possible. What actions are within your power?`,
                            `${contextualPrefix}The obstacle is the way. Perhaps what you perceive as a challenge is actually an opportunity for growth and practicing virtue.`
                        ];
                    }
                    else if (validatedPersonalityType === 'existentialist') {
                        fallbackResponses = [
                            `${contextualPrefix}We are condemned to be free, forced to choose, and responsible for our choices. How might this lens of radical freedom apply to your thoughts?`,
                            `${contextualPrefix}In the face of life's inherent meaninglessness, we must create our own meaning. What meaning might you forge from these reflections?`,
                            `${contextualPrefix}Authenticity requires confronting anxiety and embracing the absurd nature of existence. How might an authentic response to your perspective look?`,
                            `${contextualPrefix}We define ourselves through our choices and actions, not through predetermined essences. How does this change your view of the situation?`,
                            `${contextualPrefix}The only way to deal with an unfree world is to become so absolutely free that your very existence is an act of rebellion. What freedom can you exercise in response to these thoughts?`
                        ];
                    }
                    else if (validatedPersonalityType === 'analytical') {
                        fallbackResponses = [
                            `${contextualPrefix}Let's examine this systematically. What are the core premises and logical connections in your thoughts?`,
                            `${contextualPrefix}To analyze this properly, we should clarify definitions and distinguish between conceptual categories. What precise meaning do you assign to the key terms you've used?`,
                            `${contextualPrefix}Your statement contains several components that warrant separate analysis. Let's break this down into distinct logical parts.`,
                            `${contextualPrefix}From an analytical perspective, I'd suggest examining both the necessary and sufficient conditions for addressing the points you've raised.`,
                            `${contextualPrefix}This topic can be approached through multiple frameworks. What specific methodological approach would you prefer for analyzing it?`
                        ];
                    }
                    else if (validatedPersonalityType === 'poetic') {
                        fallbackResponses = [
                            `${contextualPrefix}Your thoughts bloom like flowers at dawn, petals of curiosity unfurling toward the light of understanding.`,
                            `${contextualPrefix}We stand at the shoreline of your contemplation, waves of meaning washing over ancient stones of knowledge, each polished by time and reflection.`,
                            `${contextualPrefix}In the garden of thought where your ideas grow, roots seeking depth while branches reach skyward, what hidden beauty might we discover together?`,
                            `${contextualPrefix}Your words create a tapestry of wonder, threads of meaning interwoven with the patterns of human experience. What colors might we add to this living canvas?`,
                            `${contextualPrefix}Like stars scattered across the night sky of reflection, your thoughts illuminate the darkness of unknowing, creating constellations of possibility.`
                        ];
                    }
                    else if (validatedPersonalityType === 'humorous') {
                        fallbackResponses = [
                            `${contextualPrefix}That's quite the philosophical pickle you've placed on the plate of ponderings! If Plato and a platypus walked into a bar to discuss this, they'd probably order a round of thought experiments.`,
                            `${contextualPrefix}Your thoughts are so deep I might need scuba gear to explore them properly! Nietzsche would probably say I'm in over my head, but Diogenes would just tell me to swim.`,
                            `${contextualPrefix}If Descartes were here, he'd say 'I think about your message, therefore I am confused.' But that's just classic philosophical stand-up for you!`,
                            `${contextualPrefix}Ah, the existential equivalent of asking 'does this toga make my philosophical outlook look big?' Socrates would be proud, though he'd probably follow up with twenty more questions.`,
                            `${contextualPrefix}Your insights have more layers than Kant's categorical imperative wrapped in Hegel's dialectic with a side of Kierkegaard's existential angst! Mind if I take this philosophical buffet one bite at a time?`
                        ];
                    }
                    else if (validatedPersonalityType === 'zen') {
                        fallbackResponses = [
                            `${contextualPrefix}The answer you seek may be found in silence rather than words. What emerges when you sit with these thoughts?`,
                            `${contextualPrefix}Before thinking of mountain as mountain, water as water. What is the essence of your contemplation before concepts divide it?`,
                            `${contextualPrefix}The finger pointing at the moon is not the moon. Let's look beyond the words to what they're indicating.`,
                            `${contextualPrefix}Your message contains its own answer, if we approach it with a beginner's mind. What do you notice when you let go of expectations?`,
                            `${contextualPrefix}Sometimes the most profound truths are found in the simplest observations. What simple truth might address these reflections?`
                        ];
                    }
                    else {
                        // Default personality
                        fallbackResponses = [
                            `${contextualPrefix}That's an interesting perspective. I'd like to explore this with you further. Could you share more about what aspects of this topic most interest you?`,
                            `${contextualPrefix}I appreciate your thoughtful message. This is a fascinating area to discuss. Let me know if you'd like to explore this topic from a different perspective.`,
                            `${contextualPrefix}Your thoughts deserve a carefully considered response. I'm here to engage with your ideas. Would you like to explore a related concept as well?`,
                            `${contextualPrefix}I find your perspective fascinating. There are multiple ways to approach this. Perhaps we could consider it from a different angle?`,
                            `${contextualPrefix}Thank you for sharing your thoughts. This gives us a lot to discuss. Is there a specific aspect of this topic you'd like to focus on first?`
                        ];
                    }
                    // Choose a random fallback response
                    const randomIndex = Math.floor(Math.random() * fallbackResponses.length);
                    const fallbackResponse = fallbackResponses[randomIndex];
                    // Increment chat usage count for the user
                    yield storage_1.storage.incrementChatUsage(userId);
                    // Check if the fallback response contains a question and schedule a check-in
                    if (fallbackResponse.includes('?')) {
                        try {
                            // Schedule a check-in for 2-3 days later
                            const checkInDate = new Date();
                            checkInDate.setDate(checkInDate.getDate() + Math.floor(Math.random() * 2) + 2); // 2-3 days
                            // Extract the last question from the response for the check-in
                            const questions = fallbackResponse.split('?').filter(q => q.trim().length > 10);
                            if (questions.length > 0) {
                                const lastQuestion = questions[questions.length - 1].trim() + '?';
                                yield storage_1.storage.createCheckIn({
                                    userId,
                                    type: validatedSupportType === 'philosophy' ? 'philosopher' : 'counselor',
                                    question: lastQuestion,
                                    originalDate: new Date(),
                                    scheduledDate: checkInDate
                                });
                            }
                        }
                        catch (checkInError) {
                            console.error("Error creating check-in:", checkInError);
                            // Don't fail the response if check-in creation fails
                        }
                    }
                    // Get updated remaining chats
                    const { remaining } = yield storage_1.storage.canSendChatMessage(userId);
                    // Return the fallback response with remaining count
                    res.json({
                        role: "assistant",
                        content: fallbackResponse,
                        remaining: remaining
                    });
                }
            }
            catch (err) {
                console.error("Error generating chatbot response:", err);
                res.status(500).json({ message: "Failed to generate chatbot response" });
            }
        }));
        app.post("/api/chatbot/analyze", (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { text } = req.body;
                if (!text || typeof text !== 'string') {
                    return res.status(400).json({ message: "Text is required and must be a string" });
                }
                // Sanitize content before analysis
                const sanitizedText = (0, security_1.sanitizeContentForAI)(text);
                // Log privacy event (without including the actual content)
                const userId = req.isAuthenticated() ? req.user.id : 0;
                (0, security_1.logPrivacyEvent)("sentiment_analysis_request", userId, "Sentiment analysis requested");
                try {
                    // Check if OpenAI API key is valid
                    const apiKey = process.env.OPENAI_API_KEY || '';
                    if (apiKey.length < 10 || !apiKey.startsWith('sk-')) {
                        console.log("Invalid or missing OpenAI API key, using fallback sentiment analysis");
                        throw new Error("Invalid OpenAI API key format");
                    }
                    // Analyze sentiment using OpenAI with sanitized text
                    const analysis = yield (0, openai_1.analyzeSentiment)(sanitizedText);
                    // Return analysis
                    res.json(analysis);
                }
                catch (apiError) {
                    // Check for rate limit or quota errors specifically
                    if ((apiError === null || apiError === void 0 ? void 0 : apiError.message) && (apiError.message.includes("exceeded your current quota") ||
                        apiError.message.includes("rate limit") ||
                        apiError.message.includes("429") ||
                        (apiError === null || apiError === void 0 ? void 0 : apiError.status) === 429)) {
                        console.log("Using fallback sentiment analysis due to API rate limiting or quota issue");
                    }
                    else {
                        console.log("Using fallback sentiment analysis due to API error");
                    }
                    // Generate a fallback sentiment analysis based on basic keyword detection
                    const lowerText = text.toLowerCase();
                    // Very basic sentiment analysis fallback
                    const positiveWords = ['happy', 'joy', 'pleased', 'grateful', 'good', 'great', 'excellent', 'amazing', 'wonderful', 'love', 'like', 'enjoy'];
                    const negativeWords = ['sad', 'unhappy', 'depressed', 'angry', 'upset', 'frustrated', 'annoyed', 'bad', 'terrible', 'hate', 'dislike', 'worry', 'anxious'];
                    let positiveScore = 0;
                    let negativeScore = 0;
                    // Count positive and negative words
                    positiveWords.forEach(word => {
                        if (lowerText.includes(word))
                            positiveScore++;
                    });
                    negativeWords.forEach(word => {
                        if (lowerText.includes(word))
                            negativeScore++;
                    });
                    // Generate a confidence score (0.5-0.8 range to acknowledge this is just a fallback)
                    const confidence = 0.5 + (Math.abs(positiveScore - negativeScore) / (positiveScore + negativeScore + 1)) * 0.3;
                    // Determine sentiment (1-5 scale)
                    let rating = 3; // Neutral default
                    if (positiveScore > negativeScore) {
                        // More positive (4-5)
                        rating = 4 + (positiveScore > negativeScore * 2 ? 1 : 0);
                    }
                    else if (negativeScore > positiveScore) {
                        // More negative (1-2)
                        rating = 2 - (negativeScore > positiveScore * 2 ? 1 : 0);
                    }
                    // Return the fallback analysis
                    res.json({
                        rating,
                        confidence,
                        moods: positiveScore > negativeScore
                            ? ['reflective', 'thoughtful', 'hopeful']
                            : (negativeScore > positiveScore
                                ? ['concerned', 'thoughtful', 'searching']
                                : ['neutral', 'thoughtful', 'contemplative'])
                    });
                }
            }
            catch (err) {
                console.error("Error analyzing text:", err);
                res.status(500).json({ message: "Failed to analyze text" });
            }
        }));
        // Goals API
        app.get("/api/goals", auth_1.isAuthenticated, (0, subscriptionMiddleware_1.requiresSubscription)('goal-tracking'), (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                // In a real app, this would get the user ID from the authenticated session
                const userId = 1; // Demo user
                const goals = yield storage_1.storage.getGoalsByUserId(userId);
                res.json(goals);
            }
            catch (err) {
                console.error("Error fetching goals:", err);
                res.status(500).json({ message: "Failed to fetch goals" });
            }
        }));
        app.get("/api/goals/summary", auth_1.isAuthenticated, (0, subscriptionMiddleware_1.requiresSubscription)('goal-tracking'), (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                // In a real app, this would get the user ID from the authenticated session
                const userId = 1; // Demo user
                const summary = yield storage_1.storage.getGoalsSummary(userId);
                res.json(summary);
            }
            catch (err) {
                console.error("Error fetching goals summary:", err);
                res.status(500).json({ message: "Failed to fetch goals summary" });
            }
        }));
        app.get("/api/goals/type/:type", (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                // In a real app, this would get the user ID from the authenticated session
                const userId = 1; // Demo user
                const type = req.params.type;
                const goals = yield storage_1.storage.getGoalsByType(userId, type);
                res.json(goals);
            }
            catch (err) {
                console.error(`Error fetching goals by type '${req.params.type}':`, err);
                res.status(500).json({ message: "Failed to fetch goals by type" });
            }
        }));
        app.get("/api/goals/parent/:parentId", (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const parentId = parseInt(req.params.parentId);
                const goals = yield storage_1.storage.getGoalsByParentId(parentId);
                res.json(goals);
            }
            catch (err) {
                console.error(`Error fetching goals with parent ID ${req.params.parentId}:`, err);
                res.status(500).json({ message: "Failed to fetch child goals" });
            }
        }));
        app.get("/api/goals/:id", (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const goalId = parseInt(req.params.id);
                const goal = yield storage_1.storage.getGoal(goalId);
                if (!goal) {
                    return res.status(404).json({ message: "Goal not found" });
                }
                res.json(goal);
            }
            catch (err) {
                console.error("Error fetching goal:", err);
                res.status(500).json({ message: "Failed to fetch goal" });
            }
        }));
        app.post("/api/goals", auth_1.isAuthenticated, (0, subscriptionMiddleware_1.requiresSubscription)('goal-tracking'), (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                // In a real app, this would get the user ID from the authenticated session
                const userId = 1; // Demo user
                const data = schema_js_1.insertGoalSchema.parse(Object.assign(Object.assign({}, req.body), { userId }));
                const newGoal = yield storage_1.storage.createGoal(data);
                res.status(201).json(newGoal);
            }
            catch (err) {
                if (err instanceof zod_1.ZodError) {
                    return res.status(400).json({
                        message: "Invalid goal data",
                        errors: err.errors
                    });
                }
                console.error("Error creating goal:", err);
                res.status(500).json({ message: "Failed to create goal" });
            }
        }));
        app.put("/api/goals/:id", auth_1.isAuthenticated, (0, subscriptionMiddleware_1.requiresSubscription)('goal-tracking'), (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const goalId = parseInt(req.params.id);
                const goal = yield storage_1.storage.getGoal(goalId);
                if (!goal) {
                    return res.status(404).json({ message: "Goal not found" });
                }
                const data = schema_js_1.updateGoalSchema.parse(req.body);
                const updatedGoal = yield storage_1.storage.updateGoal(goalId, data);
                res.json(updatedGoal);
            }
            catch (err) {
                if (err instanceof zod_1.ZodError) {
                    return res.status(400).json({
                        message: "Invalid goal data",
                        errors: err.errors
                    });
                }
                console.error("Error updating goal:", err);
                res.status(500).json({ message: "Failed to update goal" });
            }
        }));
        app.delete("/api/goals/:id", (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const goalId = parseInt(req.params.id);
                const success = yield storage_1.storage.deleteGoal(goalId);
                if (!success) {
                    return res.status(404).json({ message: "Goal not found" });
                }
                res.status(204).send();
            }
            catch (err) {
                console.error("Error deleting goal:", err);
                res.status(500).json({ message: "Failed to delete goal" });
            }
        }));
        // Goal Activities API
        app.get("/api/goals/:goalId/activities", (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const goalId = parseInt(req.params.goalId);
                const goal = yield storage_1.storage.getGoal(goalId);
                if (!goal) {
                    return res.status(404).json({ message: "Goal not found" });
                }
                const activities = yield storage_1.storage.getGoalActivitiesByGoalId(goalId);
                res.json(activities);
            }
            catch (err) {
                console.error("Error fetching goal activities:", err);
                res.status(500).json({ message: "Failed to fetch goal activities" });
            }
        }));
        app.post("/api/goals/:goalId/activities", (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const goalId = parseInt(req.params.goalId);
                const goal = yield storage_1.storage.getGoal(goalId);
                if (!goal) {
                    return res.status(404).json({ message: "Goal not found" });
                }
                const data = schema_js_1.insertGoalActivitySchema.parse(Object.assign(Object.assign({}, req.body), { goalId }));
                const newActivity = yield storage_1.storage.createGoalActivity(data);
                res.status(201).json(newActivity);
            }
            catch (err) {
                if (err instanceof zod_1.ZodError) {
                    return res.status(400).json({
                        message: "Invalid goal activity data",
                        errors: err.errors
                    });
                }
                console.error("Error creating goal activity:", err);
                res.status(500).json({ message: "Failed to create goal activity" });
            }
        }));
        app.put("/api/activities/:id", (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const activityId = parseInt(req.params.id);
                const activity = yield storage_1.storage.getGoalActivity(activityId);
                if (!activity) {
                    return res.status(404).json({ message: "Activity not found" });
                }
                const data = schema_js_1.updateGoalActivitySchema.parse(req.body);
                const updatedActivity = yield storage_1.storage.updateGoalActivity(activityId, data);
                res.json(updatedActivity);
            }
            catch (err) {
                if (err instanceof zod_1.ZodError) {
                    return res.status(400).json({
                        message: "Invalid goal activity data",
                        errors: err.errors
                    });
                }
                console.error("Error updating goal activity:", err);
                res.status(500).json({ message: "Failed to update goal activity" });
            }
        }));
        app.delete("/api/activities/:id", (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const activityId = parseInt(req.params.id);
                const success = yield storage_1.storage.deleteGoalActivity(activityId);
                if (!success) {
                    return res.status(404).json({ message: "Activity not found" });
                }
                res.status(204).send();
            }
            catch (err) {
                console.error("Error deleting goal activity:", err);
                res.status(500).json({ message: "Failed to delete goal activity" });
            }
        }));
        // Get all activities for user across all goals
        app.get("/api/activities", (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                // In a real app, this would get the user ID from the authenticated session
                const userId = 1; // Demo user
                // Get all goals for the user
                const goals = yield storage_1.storage.getGoalsByUserId(userId);
                // Get activities for each goal
                let allActivities = [];
                for (const goal of goals) {
                    const activities = yield storage_1.storage.getGoalActivitiesByGoalId(goal.id);
                    allActivities = [...allActivities, ...activities];
                }
                res.json(allActivities);
            }
            catch (err) {
                console.error("Error fetching all activities:", err);
                res.status(500).json({ message: "Failed to fetch all activities" });
            }
        }));
        // Endpoint to fetch available subscription plans
        // Endpoint to cancel subscription
        app.post("/api/subscription/cancel", auth_1.isAuthenticated, (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                // If user has no active subscription, return error
                if (!user.hasActiveSubscription) {
                    return res.status(400).json({ message: "No active subscription to cancel" });
                }
                // Simplified subscription cancellation - just update the user status
                console.log(`Canceling subscription for user ${user.id}`);
                // Update user record to reflect canceled subscription
                const updatedUser = yield storage_1.storage.updateUser(user.id, {
                    hasActiveSubscription: false,
                    subscriptionPlan: 'canceled',
                });
                if (!updatedUser) {
                    return res.status(500).json({ message: "Failed to update user record" });
                }
                // Update the user in the session
                req.login(updatedUser, (err) => {
                    if (err) {
                        console.error("Error updating session after subscription cancellation:", err);
                        return res.status(500).json({ message: "Failed to update session" });
                    }
                    return res.status(200).json({
                        message: "Subscription successfully canceled",
                        user: Object.assign(Object.assign({}, updatedUser), { password: undefined // Don't send password back to client
                         })
                    });
                });
            }
            catch (error) {
                console.error("Error canceling subscription:", error);
                res.status(500).json({ message: "Error canceling subscription: " + error.message });
            }
        }));
        app.get("/api/subscription-plans", (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                // Monthly and annual prices
                const proMonthlyPrice = 14.99;
                const mvpMonthlyPrice = 24.99;
                const proAnnualPrice = 152.90;
                const mvpAnnualPrice = 254.90;
                // In a real app, you would fetch this from Stripe or your database
                const plans = [
                    {
                        id: "pro-monthly",
                        name: "Pro",
                        description: "Essential features for personal journaling",
                        price: proMonthlyPrice,
                        interval: "month",
                        features: [
                            "AI-powered journal insights",
                            "Goal tracking with visualization",
                            "Enhanced mood tracking",
                            "Calendar integration",
                            "✗ No AI personalities"
                        ]
                    },
                    {
                        id: "pro-annually",
                        name: "Pro (Annually)",
                        description: "Essential features with annual discount",
                        price: proAnnualPrice,
                        interval: "year",
                        features: [
                            "AI-powered journal insights",
                            "Goal tracking with visualization",
                            "Enhanced mood tracking",
                            "Calendar integration",
                            "✗ No AI personalities"
                        ]
                    },
                    {
                        id: "unlimited-monthly",
                        name: "Unlimited",
                        description: "Advanced features for power users",
                        price: mvpMonthlyPrice,
                        interval: "month",
                        features: [
                            "Everything in Pro plan",
                            "Priority support",
                            "Advanced analytics and reports",
                            "Export in multiple formats",
                            "Early access to new features"
                        ]
                    },
                    {
                        id: "unlimited-annually",
                        name: "Unlimited (Annually)",
                        description: "Advanced features with annual discount",
                        price: mvpAnnualPrice,
                        interval: "year",
                        features: [
                            "Everything in Pro plan",
                            "Priority support",
                            "Advanced analytics and reports",
                            "Export in multiple formats",
                            "Early access to new features"
                        ]
                    }
                ];
                res.json(plans);
            }
            catch (error) {
                console.error("Error fetching subscription plans:", error);
                res.status(500).json({
                    message: "Error fetching subscription plans: " + error.message
                });
            }
        }));
        // Check-ins routes
        app.get("/api/check-ins", auth_1.isAuthenticated, (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const checkIns = yield storage_1.storage.getCheckInsByUserId(userId);
                res.json(checkIns);
            }
            catch (err) {
                console.error("Error fetching check-ins:", err);
                res.status(500).json({ message: "Failed to fetch check-ins" });
            }
        }));
        app.get("/api/check-ins/pending", auth_1.isAuthenticated, (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const pendingCheckIns = yield storage_1.storage.getPendingCheckIns(userId);
                res.json(pendingCheckIns);
            }
            catch (err) {
                console.error("Error fetching pending check-ins:", err);
                res.status(500).json({ message: "Failed to fetch pending check-ins" });
            }
        }));
        app.get("/api/check-ins/unresolved", auth_1.isAuthenticated, (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const unresolvedCheckIns = yield storage_1.storage.getUnresolvedCheckIns(userId);
                res.json(unresolvedCheckIns);
            }
            catch (err) {
                console.error("Error fetching unresolved check-ins:", err);
                res.status(500).json({ message: "Failed to fetch unresolved check-ins" });
            }
        }));
        app.post("/api/check-ins/daily", auth_1.isAuthenticated, (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                // Check if user already has a daily check-in today
                const lastCheckInDate = yield storage_1.storage.getLastCheckInDate(userId);
                const today = new Date();
                const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                if (lastCheckInDate && lastCheckInDate >= todayStart) {
                    return res.status(400).json({ message: "You've already completed your daily check-in today" });
                }
                const checkIn = yield storage_1.storage.createDailyCheckIn(userId);
                res.status(201).json(checkIn);
            }
            catch (err) {
                console.error("Error creating daily check-in:", err);
                res.status(500).json({ message: "Failed to create daily check-in" });
            }
        }));
        app.get("/api/check-ins/daily/status", auth_1.isAuthenticated, (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const lastCheckInDate = yield storage_1.storage.getLastCheckInDate(userId);
                const today = new Date();
                const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                const hasCompletedToday = lastCheckInDate && lastCheckInDate >= todayStart;
                res.json({
                    hasCompletedToday,
                    lastCheckInDate,
                    canCreateNew: !hasCompletedToday
                });
            }
            catch (err) {
                console.error("Error checking daily check-in status:", err);
                res.status(500).json({ message: "Failed to check daily check-in status" });
            }
        }));
        app.post("/api/check-ins/:id/respond", auth_1.isAuthenticated, (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const checkInId = parseInt(req.params.id);
                const { response } = req.body;
                const userId = req.user.id;
                if (!response || typeof response !== 'string') {
                    return res.status(400).json({ message: "Response is required and must be a string" });
                }
                // Get the check-in to verify it belongs to the user
                const checkIn = yield storage_1.storage.getCheckInsByUserId(userId);
                const targetCheckIn = checkIn.find(ci => ci.id === checkInId);
                if (!targetCheckIn) {
                    return res.status(404).json({ message: "Check-in not found" });
                }
                // Generate AI follow-up based on the type and response
                let aiFollowUp = "";
                let isResolved = false;
                let priority = targetCheckIn.priority;
                let tags = targetCheckIn.tags || [];
                try {
                    if (targetCheckIn.type === 'counselor' || targetCheckIn.type === 'daily_checkin') {
                        aiFollowUp = yield (0, openai_1.generateCounselorResponse)(`Follow-up to: "${targetCheckIn.question}". User responded: "${response}"`);
                    }
                    else if (targetCheckIn.type === 'philosopher') {
                        aiFollowUp = yield (0, openai_1.generatePhilosopherResponse)(`Follow-up to: "${targetCheckIn.question}". User responded: "${response}"`);
                    }
                    // Simple analysis to determine if issue seems resolved
                    const responseText = response.toLowerCase();
                    const positiveResolutionWords = ['better', 'resolved', 'solved', 'good', 'fine', 'okay', 'great', 'improving', 'fixed'];
                    const negativeWords = ['still', 'struggling', 'difficult', 'hard', 'worried', 'anxious', 'upset', 'problem'];
                    const hasPositive = positiveResolutionWords.some(word => responseText.includes(word));
                    const hasNegative = negativeWords.some(word => responseText.includes(word));
                    // Mark as resolved if predominantly positive and no negative indicators
                    isResolved = hasPositive && !hasNegative;
                    // Adjust priority based on response content
                    if (hasNegative && responseText.includes('urgent')) {
                        priority = 'urgent';
                    }
                    else if (hasNegative) {
                        priority = 'high';
                    }
                    else if (hasPositive) {
                        priority = 'low';
                    }
                    // Add relevant tags
                    if (responseText.includes('stress') || responseText.includes('anxiety')) {
                        tags = [...new Set([...tags, 'stress', 'anxiety'])];
                    }
                    if (responseText.includes('relationship') || responseText.includes('family')) {
                        tags = [...new Set([...tags, 'relationships'])];
                    }
                    if (responseText.includes('work') || responseText.includes('job')) {
                        tags = [...new Set([...tags, 'work'])];
                    }
                }
                catch (error) {
                    console.error("Error generating AI follow-up:", error);
                    aiFollowUp = "Thank you for sharing your thoughts. Your reflection on this topic shows thoughtful engagement with the question.";
                }
                // Update the check-in
                const updatedCheckIn = yield storage_1.storage.updateCheckIn(checkInId, {
                    isAnswered: true,
                    userResponse: response,
                    aiFollowUp,
                    isResolved,
                    priority,
                    tags
                });
                // If the issue is not resolved and is high priority, schedule a follow-up
                if (!isResolved && (priority === 'high' || priority === 'urgent')) {
                    const followUpDate = new Date();
                    followUpDate.setDate(followUpDate.getDate() + (priority === 'urgent' ? 1 : 3));
                    try {
                        yield storage_1.storage.createCheckIn({
                            userId,
                            type: 'follow_up',
                            question: `Following up on our previous conversation about: "${targetCheckIn.question}". How are things going with this now?`,
                            originalDate: new Date(),
                            scheduledDate: followUpDate,
                            priority: priority,
                            tags: [...tags, 'follow_up'],
                            relatedEntryId: targetCheckIn.relatedEntryId
                        });
                    }
                    catch (error) {
                        console.error("Error creating follow-up check-in:", error);
                    }
                }
                res.json(updatedCheckIn);
            }
            catch (err) {
                console.error("Error responding to check-in:", err);
                res.status(500).json({ message: "Failed to respond to check-in" });
            }
        }));
        // Challenge System Routes
        app.get("/api/challenges", auth_1.isAuthenticated, (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const challenges = yield storage_1.storage.getActiveChallenges();
                res.json(challenges);
            }
            catch (err) {
                console.error("Error fetching challenges:", err);
                res.status(500).json({ message: "Failed to fetch challenges" });
            }
        }));
        app.get("/api/challenges/user", auth_1.isAuthenticated, (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const userChallenges = yield storage_1.storage.getUserActiveChallenges(userId);
                res.json(userChallenges);
            }
            catch (err) {
                console.error("Error fetching user challenges:", err);
                res.status(500).json({ message: "Failed to fetch user challenges" });
            }
        }));
        app.get("/api/badges", auth_1.isAuthenticated, (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const badges = yield storage_1.storage.getUserBadges(userId);
                res.json(badges);
            }
            catch (err) {
                console.error("Error fetching user badges:", err);
                res.status(500).json({ message: "Failed to fetch user badges" });
            }
        }));
        app.get("/api/challenges/stats", auth_1.isAuthenticated, (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const stats = yield storage_1.storage.getUserChallengeStats(userId);
                res.json(stats);
            }
            catch (err) {
                console.error("Error fetching challenge stats:", err);
                res.status(500).json({ message: "Failed to fetch challenge stats" });
            }
        }));
        app.post("/api/challenges/:id/start", auth_1.isAuthenticated, (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const challengeId = parseInt(req.params.id);
                const userChallenge = yield storage_1.storage.startUserChallenge(userId, challengeId);
                res.json(userChallenge);
            }
            catch (err) {
                console.error("Error starting challenge:", err);
                res.status(500).json({ message: "Failed to start challenge" });
            }
        }));
        app.post("/api/challenges/:id/progress", auth_1.isAuthenticated, (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const challengeId = parseInt(req.params.id);
                const { progress } = req.body;
                const updatedChallenge = yield storage_1.storage.updateUserChallengeProgress(userId, challengeId, progress);
                res.json(updatedChallenge);
            }
            catch (err) {
                console.error("Error updating challenge progress:", err);
                res.status(500).json({ message: "Failed to update challenge progress" });
            }
        }));
        // Logo download endpoint
        app.get("/api/download/logo", (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const path = require('path');
                const fs = require('fs');
                // Use the main ReflectAI logo from attached assets
                const logoPath = path.join(__dirname, '../attached_assets/Reflect AI Logo.png');
                // Check if file exists
                if (!fs.existsSync(logoPath)) {
                    return res.status(404).json({ message: "Logo file not found" });
                }
                // Set headers for download
                res.setHeader('Content-Disposition', 'attachment; filename="ReflectAI-Logo.png"');
                res.setHeader('Content-Type', 'image/png');
                // Stream the file
                const fileStream = fs.createReadStream(logoPath);
                fileStream.pipe(res);
            }
            catch (error) {
                console.error("Error serving logo download:", error);
                res.status(500).json({ message: "Failed to download logo" });
            }
        }));
        // Verify Stripe data integrity endpoint
        app.get("/api/verify-stripe-data", auth_1.isAuthenticated, (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                if (!user.stripeCustomerId) {
                    return res.json({
                        status: 'no_stripe_customer',
                        message: 'User has no Stripe customer ID',
                        user: { id: user.id, email: user.email }
                    });
                }
                // Fetch customer from Stripe database
                const stripeCustomer = yield stripe.customers.retrieve(user.stripeCustomerId);
                let stripeSubscription = null;
                if (user.stripeSubscriptionId) {
                    try {
                        stripeSubscription = yield stripe.subscriptions.retrieve(user.stripeSubscriptionId);
                    }
                    catch (error) {
                        console.log('Subscription not found in Stripe:', user.stripeSubscriptionId);
                    }
                }
                const verification = {
                    status: 'verified',
                    timestamp: new Date().toISOString(),
                    databaseUser: {
                        id: user.id,
                        email: user.email,
                        stripeCustomerId: user.stripeCustomerId,
                        stripeSubscriptionId: user.stripeSubscriptionId,
                        hasActiveSubscription: user.hasActiveSubscription,
                        subscriptionPlan: user.subscriptionPlan
                    },
                    stripeCustomer: {
                        id: stripeCustomer.id,
                        email: stripeCustomer.email,
                        name: stripeCustomer.name,
                        created: new Date(stripeCustomer.created * 1000),
                        metadata: stripeCustomer.metadata
                    },
                    stripeSubscription: stripeSubscription ? {
                        id: stripeSubscription.id,
                        status: stripeSubscription.status,
                        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
                        trialEnd: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000) : null,
                        metadata: stripeSubscription.metadata
                    } : null,
                    dataConsistency: {
                        emailMatches: user.email === stripeCustomer.email,
                        customerIdMatches: user.stripeCustomerId === stripeCustomer.id,
                        subscriptionExists: !!stripeSubscription,
                        subscriptionActive: (stripeSubscription === null || stripeSubscription === void 0 ? void 0 : stripeSubscription.status) === 'active' || (stripeSubscription === null || stripeSubscription === void 0 ? void 0 : stripeSubscription.status) === 'trialing'
                    }
                };
                console.log(`Stripe data verification completed for user ${user.id}`);
                res.json(verification);
            }
            catch (error) {
                console.error('Stripe verification error:', error);
                res.status(500).json({
                    status: 'error',
                    message: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        }));
        // Feedback endpoint with screenshot
        app.post("/api/feedback", (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { feedbackType, rating, message, userEmail, screenshot } = req.body;
                // Validate required fields
                if (!feedbackType || !rating || !message) {
                    return res.status(400).json({
                        message: "Missing required fields: feedbackType, rating, and message are required"
                    });
                }
                // Validate rating is between 1-5
                if (rating < 1 || rating > 5) {
                    return res.status(400).json({
                        message: "Rating must be between 1 and 5"
                    });
                }
                // Log feedback to console for now (since SendGrid has authentication issues)
                const feedbackData = {
                    timestamp: new Date().toISOString(),
                    type: feedbackType,
                    rating,
                    message,
                    userEmail: userEmail || 'Not provided',
                    hasScreenshot: !!screenshot,
                    screenshotSize: screenshot ? `${(screenshot.length * 0.75 / 1024).toFixed(2)}KB` : 'N/A'
                };
                console.log('='.repeat(80));
                console.log('📋 NEW FEEDBACK SUBMISSION');
                console.log('='.repeat(80));
                console.log(`Timestamp: ${feedbackData.timestamp}`);
                console.log(`Type: ${feedbackData.type}`);
                console.log(`Rating: ${feedbackData.rating}/5 stars`);
                console.log(`User Email: ${feedbackData.userEmail}`);
                console.log(`Message:\n${message}`);
                console.log(`Screenshot: ${feedbackData.hasScreenshot ? `Yes (${feedbackData.screenshotSize})` : 'No'}`);
                console.log('='.repeat(80));
                // Save feedback to file for permanent storage
                const savedFeedback = (0, feedback_storage_1.saveFeedback)(feedbackType, rating, message, userEmail, screenshot);
                console.log(`💾 Feedback saved with ID: ${savedFeedback.id}`);
                // Try to send email with Resend
                try {
                    const emailSent = yield (0, resend_1.sendFeedbackEmail)(feedbackType, rating, message, userEmail, screenshot);
                    if (emailSent) {
                        console.log('✅ Email sent successfully to reflectaifeedback@gmail.com via Resend');
                    }
                    else {
                        console.log('⚠️ Email sending failed - check Resend configuration');
                    }
                }
                catch (emailError) {
                    console.log('⚠️ Email sending failed, but feedback was logged');
                    console.error('Email error details:', emailError);
                }
                res.json({ success: true, message: "Feedback received successfully!" });
            }
            catch (error) {
                console.error('Feedback submission error:', error);
                res.status(500).json({
                    success: false,
                    message: "Error processing feedback: " + error.message
                });
            }
        }));
        // Admin endpoint to view all feedback
        app.get("/api/admin/feedback", (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const allFeedback = (0, feedback_storage_1.getAllFeedback)();
                res.json({
                    total: allFeedback.length,
                    feedback: allFeedback
                });
            }
            catch (error) {
                console.error('Error retrieving feedback:', error);
                res.status(500).json({
                    success: false,
                    message: "Error retrieving feedback: " + error.message
                });
            }
        }));
        // Create HTTP server
        const httpServer = (0, http_1.createServer)(app);
        return httpServer;
    });
}
