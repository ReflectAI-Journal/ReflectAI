import os from 'os';
import OpenAI from 'openai';

// The code you provided to use os.getenv - adapted to TypeScript/Node.js environment
// In Node.js, we use process.env instead of os.getenv
export const apiKey = process.env.OPENAI_API_KEY || '';

// Create the OpenAI client
const openai = new OpenAI({ 
  apiKey: apiKey 
});

export default openai;