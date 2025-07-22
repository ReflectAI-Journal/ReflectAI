import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Email service configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.resend.com',
  port: 587,
  secure: false,
  auth: {
    user: 'resend',
    pass: process.env.RESEND_API_KEY || ''
  }
});

// Generate confirmation token
export function generateConfirmationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Send confirmation email
export async function sendConfirmationEmail(email: string, token: string): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured, skipping email send');
    return;
  }

  const confirmUrl = `${process.env.CLIENT_ORIGIN || 'http://localhost:5000'}/api/confirm-email?token=${token}`;
  
  const mailOptions = {
    from: 'ReflectAI <noreply@reflectai-journal.site>',
    to: email,
    subject: 'Confirm Your Email - ReflectAI',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6366f1;">Welcome to ReflectAI!</h2>
        <p>Thank you for creating your account. Please confirm your email address to complete your registration.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${confirmUrl}" 
             style="background-color: #6366f1; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            Confirm Email Address
          </a>
        </div>
        
        <p>If the button above doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #6366f1;">${confirmUrl}</p>
        
        <p>This link will expire in 24 hours for security reasons.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e5e5;">
        <p style="font-size: 12px; color: #666;">
          If you didn't create an account with ReflectAI, please ignore this email.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Confirmation email sent to:', email);
  } catch (error) {
    console.error('Failed to send confirmation email:', error);
    throw new Error('Failed to send confirmation email');
  }
}

// Send resend confirmation email
export async function resendConfirmationEmail(email: string): Promise<string> {
  const newToken = generateConfirmationToken();
  await sendConfirmationEmail(email, newToken);
  return newToken;
}