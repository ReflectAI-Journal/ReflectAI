import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

// Initialize the OpenAI client with the API key from environment variables
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "sk-your-api-key"
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

    const result = JSON.parse(response.choices[0].message.content);

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
