import { Request, Response, NextFunction } from 'express';
import { User } from '../shared/schema.js';

/**
 * Sanitize user data before sending to client
 * Removes sensitive information like password hash
 */
function sanitizeUser(user: User): Omit<User, 'password'> {
  const { password, ...sanitizedUser } = user;
  return sanitizedUser;
}

/**
 * Sanitize content before sending to AI services
 */
function sanitizeContentForAI(content: string): string {
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
function securityHeadersMiddleware(req: Request, res: Response, next: NextFunction) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; " +
      "script-src 'self' https://js.stripe.com https://replit.com https://challenges.cloudflare.com https://*.clerk.accounts.dev; " +
      "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com https://cdn.jsdelivr.net; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "img-src 'self' data: https://*.clerk.accounts.dev https://*.clerk.com; " +
      "connect-src 'self' https://api.stripe.com https://*.clerk.accounts.dev https://*.clerk.com ws://localhost:* wss://localhost:*; " +
      "frame-src 'self' https://js.stripe.com https://*.clerk.accounts.dev;"
    );
  } else {
    // More permissive CSP for development with Clerk
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https: data:; " +
      "style-src 'self' 'unsafe-inline' https: data:; " +
      "font-src 'self' https: data:; " +
      "img-src 'self' data: blob: https:; " +
      "connect-src 'self' https: wss: ws:; " +
      "frame-src 'self' https:; " +
      "worker-src 'self' blob:;"
    );
  }

  next();
}

/**
 * Privacy log
 */
function logPrivacyEvent(eventType: string, userId: number, details: string) {
  const timestamp = new Date().toISOString();
  console.log(`[PRIVACY-LOG] ${timestamp} | User ${userId} | ${eventType} | ${details}`);
}

export {
  sanitizeUser,
  sanitizeContentForAI,
  securityHeadersMiddleware,
  logPrivacyEvent,
};
