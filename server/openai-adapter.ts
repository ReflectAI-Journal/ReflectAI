import os from 'os';
import OpenAI from 'openai';

// This is the code the user wanted to implement
// Implementing exactly as provided, adapting to TypeScript
export const apiKey = process.env.OPENAI_API_KEY || '';

// Create the OpenAI client with the API key
const openai = new OpenAI({ 
  apiKey: apiKey
});

export default openai;