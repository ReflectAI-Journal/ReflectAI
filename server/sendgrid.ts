import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY);

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    content: string;
    filename: string;
    type: string;
    disposition: string;
  }>;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text,
      html: params.html,
      attachments: params.attachments,
    });
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
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
    <h2>New Feedback Submission</h2>
    <p><strong>Type:</strong> ${feedbackType}</p>
    <p><strong>Rating:</strong> ${rating}/5 stars</p>
    <p><strong>User Email:</strong> ${userEmail || 'Not provided'}</p>
    <p><strong>Message:</strong></p>
    <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
      ${message.replace(/\n/g, '<br>')}
    </div>
    <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
  `;

  const attachments = screenshotBase64 ? [{
    content: screenshotBase64,
    filename: `feedback-screenshot-${Date.now()}.png`,
    type: 'image/png',
    disposition: 'attachment'
  }] : [];

  return await sendEmail({
    to: 'reflectaifeedback@gmail.com',
    from: 'noreply@reflectai-journal.repl.co', // Use your domain
    subject,
    html,
    attachments
  });
}