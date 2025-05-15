import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { securityHeadersMiddleware } from "./security";
import { isConnected, getConnectionStatus } from './mongodb';

const app = express();

// Set up CORS for API requests from your iOS app
const corsOptions = {
  origin: [
    'capacitor://localhost', 
    'ionic://localhost', 
    'http://localhost', 
    'http://localhost:5173',
    'https://reflectai-n3f0.onrender.com',
    'capacitor://com.reflectai.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Force HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https' && !req.hostname.includes('localhost')) {
      // Redirect to HTTPS
      res.redirect(`https://${req.hostname}${req.url}`);
    } else {
      next();
    }
  });
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Apply security headers to all responses
app.use(securityHeadersMiddleware);

// Add request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

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

// Health check endpoint
app.get('/api/health', (req, res) => {
  // Basic health check
  const health = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    database: { 
      connected: isConnected,
      status: isConnected ? 'connected' : 'disconnected'
    }
  };
  
  res.status(isConnected ? 200 : 503).json(health);
});

// Database status endpoint for debugging
app.get('/api/debug/db-status', (req, res) => {
  const status = getConnectionStatus();
  
  const dbStatus = {
    connected: status.isConnected,
    mongooseStatus: status.mongoose,
    clientStatus: status.client,
    mongodbUri: process.env.MONGODB_URI ? 
      `${process.env.MONGODB_URI.includes('@') ? 
        process.env.MONGODB_URI.split('@')[0].split('://')[0] + '://*****:****@' + process.env.MONGODB_URI.split('@')[1] : 
        process.env.MONGODB_URI.split('://')[0] + '://*****'}` : 
      'Not configured'
  };
  
  res.json(dbStatus);
});

(async () => {
  try {
    const server = await registerRoutes(app);

    // Global error handler
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      console.error('Server error:', err);
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      
      // Don't throw the error here as it will crash the server
      // Instead, log it and continue
      console.error('Error in request:', err);
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    const port = process.env.PORT || 8080;
    
    server.listen({
      port: Number(port),
      host: "0.0.0.0"  // Listen on all interfaces instead of just localhost
    }, () => {
      log(`Server started and serving on port ${port}`);
      log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      log(`MongoDB URI: ${process.env.MONGODB_URI ? 'Configured' : 'Using fallback/local'}`);
    });
  } catch (error) {
    console.error("Critical error starting server:", error);
    process.exit(1); // Exit with error code
  }
})();