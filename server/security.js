"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeUser = sanitizeUser;
exports.sanitizeContentForAI = sanitizeContentForAI;
exports.securityHeadersMiddleware = securityHeadersMiddleware;
exports.logPrivacyEvent = logPrivacyEvent;
/**
 * Sanitize user data before sending to client
 * Removes sensitive information like password hash
 */
function sanitizeUser(user) {
    const { password } = user, sanitizedUser = __rest(user, ["password"]);
    return sanitizedUser;
}
/**
 * Sanitize content before sending to AI services
 */
function sanitizeContentForAI(content) {
    const sanitized = content
        .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, '[EMAIL REDACTED]')
        .replace(/\b(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/g, '[PHONE REDACTED]')
        .replace(/\b\d{3}[-]?\d{2}[-]?\d{4}\b/g, '[ID REDACTED]')
        .replace(/\b(?:\d{4}[ -]?){3}\d{4}\b/g, '[PAYMENT INFO REDACTED]');
    return sanitized;
}
/**
 * Middleware to add security headers to all responses
 */
function securityHeadersMiddleware(req, res, next) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    if (process.env.NODE_ENV === 'production') {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        res.setHeader('Content-Security-Policy', "default-src 'self'; " +
            "script-src 'self' https://js.stripe.com https://replit.com; " +
            "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com https://cdn.jsdelivr.net; " +
            "font-src 'self' https://fonts.gstatic.com; " +
            "img-src 'self' data:; " +
            "connect-src 'self' https://api.stripe.com ws://localhost:* wss://localhost:*; " +
            "frame-src 'self' https://js.stripe.com;");
    }
    else {
        res.setHeader('Content-Security-Policy', "default-src 'self'; " +
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://replit.com https://js.stripe.com; " +
            "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com https://maxcdn.bootstrapcdn.com; " +
            "font-src 'self' https://fonts.gstatic.com https://maxcdn.bootstrapcdn.com; " +
            "img-src 'self' data: blob:; " +
            "connect-src 'self' https://api.stripe.com ws://localhost:* wss://localhost:*; " +
            "frame-src 'self' https://js.stripe.com;");
    }
    next();
}
/**
 * Privacy log
 */
function logPrivacyEvent(eventType, userId, details) {
    const timestamp = new Date().toISOString();
    console.log(`[PRIVACY-LOG] ${timestamp} | User ${userId} | ${eventType} | ${details}`);
}
