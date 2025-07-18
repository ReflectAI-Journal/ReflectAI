
import dotenv from 'dotenv';
dotenv.config();



import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes.js";
import { setupVite, serveStatic, log } from "./vite.js";
import { securityHeadersMiddleware } from "./security.js";


const app = express();

// ✅ Enable CORS to allow cookies across frontend/backend
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'https://reflectai-n3f0.onrender.com', 
    'https://reflectai-journal.site',
    'https://9e1459c4-1d21-4a14-b6f7-7c0f10dd2180-00-34tqqfoxiv2td.picard.replit.dev'
  ],
  credentials: true
}));

// Apply security headers to all responses
app.use(securityHeadersMiddleware);

// ⚠️ IMPORTANT: Stripe webhook route MUST be defined BEFORE express.json() middleware
// to preserve raw body for signature verification
import { setupStripeWebhook } from "./routes.js";
setupStripeWebhook(app);

// Add cookie parser for session handling
import cookieParser from 'cookie-parser';
app.use(cookieParser());

// Increase payload size limit for screenshots
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Logger for /api responses
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

(async () => {
  const server = await registerRoutes(app);

  // Global error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  // Serve frontend assets
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Start server on env-defined port or default 5000
  const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();
