import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  console.warn("RESEND_API_KEY environment variable not set - email functionality disabled");
}

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
  }>;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  if (!resend) {
    console.log('Resend not configured - skipping email');
    return false;
  }

  try {
    const emailData: any = {
      from: params.from,
      to: [params.to],
      subject: params.subject,
      html: params.html,
    };

    // Add attachments if provided
    if (params.attachments && params.attachments.length > 0) {
      emailData.attachments = params.attachments;
    }

    const { data, error } = await resend.emails.send(emailData);

    if (error) {
      console.error('Resend email error:', error);
      return false;
    }

    console.log('Resend email sent successfully:', data?.id);
    return true;
  } catch (error: any) {
    console.error('Resend email error:', error);
    return false;
  }
}

export async function sendFeedbackEmail(
  feedbackType: string,
  rating: number,
  message: string,
  userEmail?: string,
  screenshotBase64?: string
): Promise<boolean> {
  const subject = `New ${feedbackType} Feedback - ${rating} stars`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Feedback Submission</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
          📋 New Feedback Submission
        </h2>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Type:</strong> <span style="color: #059669;">${feedbackType}</span></p>
          <p><strong>Rating:</strong> <span style="color: #dc2626;">${rating}/5 stars</span></p>
          <p><strong>User Email:</strong> ${userEmail || 'Not provided'}</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        </div>
        
        <div style="background: #ffffff; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px;">
          <h3 style="margin-top: 0; color: #374151;">Message:</h3>
          <div style="background: #f9fafb; padding: 15px; border-radius: 6px; white-space: pre-wrap; font-family: 'Courier New', monospace;">
${message}
          </div>
        </div>
        
        ${screenshotBase64 ? '<p style="color: #6b7280; margin-top: 20px;">📸 Screenshot attached</p>' : ''}
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px;">
          This feedback was automatically generated from ReflectAI feedback system.
        </p>
      </div>
    </body>
    </html>
  `;

  const attachments = screenshotBase64 ? [{
    filename: `feedback-screenshot-${Date.now()}.jpg`,
    content: Buffer.from(screenshotBase64, 'base64')
  }] : [];

  return await sendEmail({
    to: 'reflectaifeedback@gmail.com',
    from: 'onboarding@resend.dev', // Use Resend's verified domain
    subject,
    html,
    attachments
  });
}