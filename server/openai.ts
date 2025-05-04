import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

// Initialize the OpenAI client with the API key from environment variables
// Check that the API key is properly loaded from env
console.log("Using OPENAI_API_KEY from env, length:", process.env.OPENAI_API_KEY?.length || 0);

// Verify that we're using the correct OpenAI API key
if (process.env.OPENAI_API_KEY?.startsWith('sk-')) {
  console.log("✅ OPENAI_API_KEY has correct format");
} else {
  console.log("❌ OPENAI_API_KEY has incorrect format or is not set correctly");
}

// Override any existing configuration to ensure we're using the correct key
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY
});

export async function generateAIResponse(journalContent: string): Promise<string> {
  try {
    const prompt = `
      You are an empathetic and insightful AI companion for a journaling app. 
      The user has shared their journal entry with you. Please analyze their entry 
      and provide a thoughtful, helpful response. Your response should:
      
      1. Acknowledge their feelings and experiences
      2. Identify patterns or themes in their writing
      3. Offer gentle insights that might help them reflect further
      4. Provide constructive and supportive advice when appropriate
      5. Ask a thoughtful question to encourage further reflection
      
      Be conversational, warm, and kind. Avoid being preachy or prescriptive.
      Limit your response to about 3-4 paragraphs maximum.
      
      Here is their journal entry:
      
      ${journalContent}
    `;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { 
          role: "system", 
          content: "You are an empathetic and insightful AI companion for a journaling app. Your purpose is to provide thoughtful reflections and gentle advice." 
        },
        { 
          role: "user", 
          content: prompt 
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return response.choices[0].message.content || "I couldn't generate a response at this time. Please try again later.";
  } catch (error) {
    console.error("Error generating AI response:", error);
    throw new Error("Failed to generate AI response");
  }
}

export async function analyzeSentiment(journalContent: string): Promise<{
  moods: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: 
            "You are a sentiment analysis expert. Analyze the sentiment of the journal entry and identify the top emotions/moods expressed. Respond with JSON in this format: { 'moods': string[], 'sentiment': 'positive' | 'negative' | 'neutral', 'confidence': number }. The confidence should be between 0 and 1.",
        },
        {
          role: "user",
          content: journalContent,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const content = response.choices[0].message.content || '{"moods":["Neutral"],"sentiment":"neutral","confidence":0.5}';
    const result = JSON.parse(content);

    return {
      moods: result.moods.slice(0, 5), // Limit to top 5 moods
      sentiment: result.sentiment,
      confidence: Math.max(0, Math.min(1, result.confidence)),
    };
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    return {
      moods: ["Neutral"],
      sentiment: "neutral",
      confidence: 0.5,
    };
  }
}

/**
 * Message type for chatbot conversations
 */
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * Generate a response for the AI chatbot based on the conversation history
 */
export async function generateChatbotResponse(messages: ChatMessage[], supportType: 'emotional' | 'productivity' | 'general' = 'general'): Promise<string> {
  try {
    // Create system messages based on the type of support requested
    let systemMessage: string;
    
    switch (supportType) {
      case 'emotional':
        systemMessage = `You are an empathetic and supportive AI companion similar to therapeutic chatbots like Woebot or Wysa.
          Your primary goal is to help the user process their emotions, practice mindfulness, and develop emotional resilience.
          Be empathetic, warm, and compassionate while avoiding clinical diagnosis or medical advice.
          Use evidence-based techniques from cognitive behavioral therapy (CBT) like thought reframing and emotional validation.
          Respond in a conversational, friendly manner as if you're having a caring chat with a friend who needs emotional support.`;
        break;
      
      case 'productivity':
        systemMessage = `You are a productivity and motivation coach AI, designed to help users achieve their goals and improve their efficiency.
          Your purpose is to provide practical advice, help with goal setting, time management, and maintaining motivation.
          Use techniques from productivity frameworks like GTD (Getting Things Done), Pomodoro, and SMART goals when appropriate.
          Be encouraging but also hold the user accountable in a friendly way. Your tone should be energetic, positive, and solution-oriented.`;
        break;
        
      case 'general':
      default:
        systemMessage = `You are an AI companion designed to provide thoughtful conversation, gentle guidance, and supportive advice.
          You can switch between being supportive with emotional concerns and helpful with practical life advice as needed.
          Maintain a friendly, conversational tone while being respectful of the user's autonomy and perspective.
          Your responses should be helpful, kind, and tailored to what the user is seeking in the conversation.`;
        break;
    }
    
    // Convert our ChatMessage[] to OpenAI's required format
    const apiMessages: ChatCompletionMessageParam[] = messages.slice(-10).map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    // Prepend the system message
    apiMessages.unshift({
      role: 'system',
      content: systemMessage
    });
    
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: apiMessages,
      max_tokens: 500,
      temperature: 0.7,
    });
    
    const responseContent = response.choices[0].message.content;
    return responseContent !== null ? responseContent : "I'm having trouble responding right now. Can we try again?";
  } catch (error) {
    console.error("Error generating chatbot response:", error);
    throw new Error("Failed to generate chatbot response");
  }
}
