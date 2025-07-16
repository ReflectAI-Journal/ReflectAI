import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

const FEEDBACK_FILE = join(process.cwd(), 'feedback.json');

interface FeedbackEntry {
  id: string;
  timestamp: string;
  type: string;
  rating: number;
  message: string;
  userEmail?: string;
  hasScreenshot: boolean;
  screenshotSize?: string;
  screenshot?: string; // base64 encoded
}

export function saveFeedback(
  feedbackType: string,
  rating: number,
  message: string,
  userEmail?: string,
  screenshot?: string
): FeedbackEntry {
  const feedbackEntry: FeedbackEntry = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    type: feedbackType,
    rating,
    message,
    userEmail: userEmail || undefined,
    hasScreenshot: !!screenshot,
    screenshotSize: screenshot ? `${(screenshot.length * 0.75 / 1024).toFixed(2)}KB` : undefined,
    screenshot: screenshot || undefined
  };

  let existingFeedback: FeedbackEntry[] = [];
  
  if (existsSync(FEEDBACK_FILE)) {
    try {
      const fileContent = readFileSync(FEEDBACK_FILE, 'utf-8');
      existingFeedback = JSON.parse(fileContent);
    } catch (error) {
      console.error('Error reading feedback file:', error);
    }
  }

  existingFeedback.unshift(feedbackEntry); // Add new feedback at the beginning
  
  // Keep only the last 100 feedback entries
  if (existingFeedback.length > 100) {
    existingFeedback = existingFeedback.slice(0, 100);
  }

  try {
    writeFileSync(FEEDBACK_FILE, JSON.stringify(existingFeedback, null, 2));
    console.log(`💾 Feedback saved to ${FEEDBACK_FILE}`);
  } catch (error) {
    console.error('Error saving feedback file:', error);
  }

  return feedbackEntry;
}

export function getAllFeedback(): FeedbackEntry[] {
  if (!existsSync(FEEDBACK_FILE)) {
    return [];
  }

  try {
    const fileContent = readFileSync(FEEDBACK_FILE, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Error reading feedback file:', error);
    return [];
  }
}