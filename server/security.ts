import { Request, Response, NextFunction } from 'express';
import { User } from '../shared/schema';

/**
 * Sanitize user data before sending to client
 * Removes sensitive information like password hash
 */
export function sanitizeUser(user: User): Omit<User, 'password'> {
  // Create a new object without the password
  const { password, ...sanitizedUser } = user;
  return sanitizedUser;
}

/**
 * Sanitize content before sending to AI services
 * Removes potential PII that should not be sent to external services
 */
export function sanitizeContentForAI(content: string): string {
  // Remove common PII patterns
  const sanitized = content
    // Email pattern
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, '[EMAIL REDACTED]')
    // Phone number patterns (common formats)
    .replace(/\b(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/g, '[PHONE REDACTED]')
    // SSN pattern (US)
    .replace(/\b\d{3}[-]?\d{2}[-]?\d{4}\b/g, '[ID REDACTED]')
    // Credit card pattern
    .replace(/\b(?:\d{4}[ -]?){3}\d{4}\b/g, '[PAYMENT INFO REDACTED]');
  
  return sanitized;
}

/**
 * Middleware to add security headers to all responses
 */
export function securityHeadersMiddleware(req: Request, res: Response, next: NextFunction) {
  // Prevent browsers from MIME-sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Enable the XSS filter in browsers
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Use strict HTTPS
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  // Restrict permissions
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Content Security Policy
  if (process.env.NODE_ENV === 'production') {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; " +
      "script-src 'self' https://plausible.io https://replit.com; " +
      "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com https://cdn.jsdelivr.net; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "img-src 'self' data:; " +
      "connect-src 'self' https://plausible.io ws://localhost:* wss://localhost:*;"
    );
  } else {
    // More permissive CSP for development
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://plausible.io https://replit.com https://js.stripe.com; " +
      "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com https://maxcdn.bootstrapcdn.com; " +
      "font-src 'self' https://fonts.gstatic.com https://maxcdn.bootstrapcdn.com; " +
      "img-src 'self' data: blob:; " +
      "connect-src 'self' https://plausible.io https://api.stripe.com ws://localhost:* wss://localhost:*; " +
      "frame-src 'self' https://js.stripe.com;"
    );
  }
  
  next();
}

/**
 * Privacy log - logs access to sensitive information
 * Only for important security events, not regular API access
 */
export function logPrivacyEvent(eventType: string, userId: number, details: string) {
  const timestamp = new Date().toISOString();
  console.log(`[PRIVACY-LOG] ${timestamp} | User ${userId} | ${eventType} | ${details}`);
  
  // In a production environment, consider sending these logs to a secure logging service
  // or database for audit purposes
}