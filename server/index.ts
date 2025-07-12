import dotenv from 'dotenv';
dotenv.config();

console.log("🔥 Lemon Squeezy API Key Loaded:", process.env.LEMONSQUEEZY_API_KEY);

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import crypto from "crypto";
import { registerRoutes } from "./routes.js";
import { setupVite, serveStatic, log } from "./vite.js";
import { securityHeadersMiddleware } from "./security.js";
// import checkoutRoutes from "./checkout"; // Removed - using routes.ts implementation instead
import { storage } from "./storage";
import { determinePlanFromVariantId } from "../utils/determinePlanFromVariantId.js";
import { requiresSubscription, getSubscriptionStatus } from "./subscriptionMiddleware.js"; // ✅ Middleware

const app = express();

// ✅ CORS middleware
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
  credentials: true,
}));

// ✅ Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ✅ Checkout routes now handled in routes.ts
// app.use(checkoutRoutes);

// ✅ Webhook endpoint
app.post("/api/webhook", express.raw({ type: "application/json" }), async (req: Request, res: Response) => {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) return res.status(500).send("Webhook secret not configured.");

  const rawBody = req.body.toString("utf8");
  const signature = req.headers["x-signature"] as string || "";

  const hmac = crypto.createHmac("sha256", secret);
  const digest = Buffer.from(hmac.update(rawBody).digest("hex"), "utf8");
  const signatureBuffer = Buffer.from(signature, "utf8");

  if (!crypto.timingSafeEqual(digest, signatureBuffer)) {
    return res.status(401).send("Invalid signature.");
  }

  const event = JSON.parse(rawBody);

  try {
    const email = event.data.attributes.user_email;
    const variantId = event.data.attributes.variant_id;
    const subscriptionId = event.data.id;
    const plan = determinePlanFromVariantId(variantId);

    if (!email) {
      console.warn("Webhook missing user email");
      return res.status(400).send("Missing email.");
    }

    switch (event.meta?.event_name) {
      case "subscription_created":
        if (!plan) {
          console.warn("Unknown plan for variant:", variantId);
          return res.status(400).send("Unknown plan.");
        }

        await storage.updateSubscriptionByEmail(email, {
          hasActiveSubscription: true,
          subscriptionPlan: plan,
          lemonsqueezySubscriptionId: subscriptionId,
        });

        console.log("✅ Subscription created for", email);
        break;

      case "subscription_updated":
        console.log("🔄 Subscription updated:", subscriptionId);
        break;

      case "subscription_cancelled":
      case "subscription_expired":
        await storage.updateSubscriptionByEmail(email, {
          hasActiveSubscription: false,
          subscriptionPlan: null,
          lemonsqueezySubscriptionId: null,
        });

        console.log("❌ Subscription cancelled/expired for", email);
        break;

      default:
        console.log("ℹ️ Unhandled webhook event:", event.meta?.event_name);
        break;
    }

    return res.status(200).send("OK");
  } catch (error) {
    console.error("Webhook handling error:", error);
    return res.status(500).send("Error processing webhook.");
  }
});

// ✅ Security headers
app.use(securityHeadersMiddleware);

// ✅ Logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: any = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });

  next();
});

// ✅ Subscription status API
app.get("/api/subscription-status", async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) return res.status(401).json({ error: "Not logged in" });
    const user = await storage.getUser(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    const status = getSubscriptionStatus(user);
    res.json(status);
  } catch (error) {
    console.error("Failed to fetch subscription status", error);
    res.status(500).json({ error: "Failed to fetch subscription status" });
  }
});

// ✅ Example protected route
app.get("/api/insights", requiresSubscription("ai-journal-insights"), (req, res) => {
  res.json({ message: "Welcome to premium insights!" });
});

// ✅ Server init
(async () => {
  const server = await registerRoutes(app);

  // Global error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  // Frontend assets
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Start server
  const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`🚀 Server running on port ${port}`);
    }
  );
})();
