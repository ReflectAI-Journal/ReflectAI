"use strict";
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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const routes_js_1 = require("./routes.js");
const vite_js_1 = require("./vite.js");
const security_js_1 = require("./security.js");
const app = (0, express_1.default)();
// ✅ Enable CORS to allow cookies across frontend/backend
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
    credentials: true
}));
// Apply security headers to all responses
app.use(security_js_1.securityHeadersMiddleware);
// ⚠️ IMPORTANT: Stripe webhook route MUST be defined BEFORE express.json() middleware
// to preserve raw body for signature verification
const routes_js_2 = require("./routes.js");
(0, routes_js_2.setupStripeWebhook)(app);
// Increase payload size limit for screenshots
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ extended: false, limit: '50mb' }));
// Logger for /api responses
app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse = undefined;
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
            (0, vite_js_1.log)(logLine);
        }
    });
    next();
});
(() => __awaiter(void 0, void 0, void 0, function* () {
    const server = yield (0, routes_js_1.registerRoutes)(app);
    // Global error handler
    app.use((err, _req, res, _next) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";
        res.status(status).json({ message });
        throw err;
    });
    // Serve frontend assets
    if (app.get("env") === "development") {
        yield (0, vite_js_1.setupVite)(app, server);
    }
    else {
        (0, vite_js_1.serveStatic)(app);
    }
    // Start server on env-defined port or default 5000
    const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
    server.listen({
        port,
        host: "0.0.0.0",
        reusePort: true,
    }, () => {
        (0, vite_js_1.log)(`serving on port ${port}`);
    });
}))();
