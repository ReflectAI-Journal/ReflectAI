"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveFeedback = saveFeedback;
exports.getAllFeedback = getAllFeedback;
const fs_1 = require("fs");
const path_1 = require("path");
const FEEDBACK_FILE = (0, path_1.join)(process.cwd(), 'feedback.json');
function saveFeedback(feedbackType, rating, message, userEmail, screenshot) {
    const feedbackEntry = {
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
    let existingFeedback = [];
    if ((0, fs_1.existsSync)(FEEDBACK_FILE)) {
        try {
            const fileContent = (0, fs_1.readFileSync)(FEEDBACK_FILE, 'utf-8');
            existingFeedback = JSON.parse(fileContent);
        }
        catch (error) {
            console.error('Error reading feedback file:', error);
        }
    }
    existingFeedback.unshift(feedbackEntry); // Add new feedback at the beginning
    // Keep only the last 100 feedback entries
    if (existingFeedback.length > 100) {
        existingFeedback = existingFeedback.slice(0, 100);
    }
    try {
        (0, fs_1.writeFileSync)(FEEDBACK_FILE, JSON.stringify(existingFeedback, null, 2));
        console.log(`💾 Feedback saved to ${FEEDBACK_FILE}`);
    }
    catch (error) {
        console.error('Error saving feedback file:', error);
    }
    return feedbackEntry;
}
function getAllFeedback() {
    if (!(0, fs_1.existsSync)(FEEDBACK_FILE)) {
        return [];
    }
    try {
        const fileContent = (0, fs_1.readFileSync)(FEEDBACK_FILE, 'utf-8');
        return JSON.parse(fileContent);
    }
    catch (error) {
        console.error('Error reading feedback file:', error);
        return [];
    }
}
