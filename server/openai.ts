import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

// Initialize the OpenAI client with the API key from environment variables
// Check that the API key is properly loaded from env
console.log("Using OPENAI_API_KEY from env, length:", process.env.OPENAI_API_KEY?.length || 0);

// For this demo app, we'll accept any API key format 
// Normally you would validate the key starts with 'sk-' for OpenAI
const apiKey = process.env.OPENAI_API_KEY || '';
if (apiKey.length > 10) {
  console.log("✅ OPENAI_API_KEY is present");
  const keyFormat = apiKey.startsWith('sk-') ? 'standard OpenAI format' : 'custom format';
  console.log(`API key format: ${keyFormat}`);
} else {
  console.log("❌ OPENAI_API_KEY is not set or too short");
}

// Override any existing configuration to ensure we're using the correct key
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY
});

export async function generateAIResponse(journalContent: string): Promise<string> {
  try {
    const apiKey = process.env.OPENAI_API_KEY || '';
    
    // Check if we have an API key with sufficient length
    if (apiKey.length < 10) {
      console.log("Using fallback AI response due to missing/invalid OpenAI API key");
      // Provide a fallback response for development purposes
      return generateFallbackResponse(journalContent);
    }
    
    console.log("Using OpenAI API key (preview):", `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`);
    console.log("API key starts with correct format (sk-):", apiKey.startsWith('sk-'));
    
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
    return generateFallbackResponse(journalContent);
  }
}

// Generate a fallback response when OpenAI API is not available
function generateFallbackResponse(journalContent: string): string {
  // Extract some basic sentiment and keywords from the content
  const lowerContent = journalContent.toLowerCase();
  
  let sentiment = "neutral";
  if (lowerContent.includes("happy") || lowerContent.includes("glad") || lowerContent.includes("excited") || lowerContent.includes("joy")) {
    sentiment = "positive";
  } else if (lowerContent.includes("sad") || lowerContent.includes("angry") || lowerContent.includes("upset") || lowerContent.includes("frustrated") || lowerContent.includes("mad")) {
    sentiment = "negative";
  }
  
  // Simple word extraction (very basic approach)
  const significantWords = ["work", "friend", "family", "goal", "stress", "relax", "tired", "excited", "challenge", "opportunity"];
  const foundWords = significantWords.filter(word => lowerContent.includes(word));
  
  // Generate appropriate response based on sentiment and found words
  let response = "";
  
  // First paragraph - acknowledgment
  if (sentiment === "positive") {
    response += "I'm glad to see you're feeling positive in your journal entry today. It's wonderful that you're taking time to reflect on your experiences. ";
  } else if (sentiment === "negative") {
    response += "I notice you're expressing some challenging emotions in your entry. It's completely valid to feel this way, and writing about it is a healthy outlet. ";
  } else {
    response += "Thank you for sharing your thoughts in your journal today. Taking time to reflect like this is an important practice for self-awareness and growth. ";
  }
  
  // Second paragraph - insight based on found words
  if (foundWords.includes("work") || foundWords.includes("stress")) {
    response += "\n\nI notice you mentioned work-related experiences. Finding balance between professional responsibilities and personal wellbeing can be challenging. Consider setting clear boundaries and taking short breaks throughout your day to reset your mind. Even five minutes of mindful breathing can make a difference in how you approach your tasks.";
  } else if (foundWords.includes("friend") || foundWords.includes("family")) {
    response += "\n\nRelationships seem to be on your mind today. Our connections with others often mirror aspects of ourselves that we might not otherwise notice. Reflecting on what certain interactions bring up for you can offer valuable insights into your own needs and values.";
  } else if (foundWords.includes("goal") || foundWords.includes("challenge")) {
    response += "\n\nI see you're focused on personal goals or challenges. Remember that progress isn't always linear, and setbacks are a natural part of any meaningful journey. Breaking larger goals into smaller, manageable steps can help maintain momentum and celebrate small wins along the way.";
  } else {
    response += "\n\nReflection like this helps build self-awareness over time. By noticing patterns in your thoughts and feelings, you develop a better understanding of what truly matters to you and what might need more attention or adjustment in your daily life.";
  }
  
  // Third paragraph - reflective question
  response += "\n\nAs you continue your day, perhaps consider: What small action could you take today that would align with what matters most to you right now? Sometimes even the smallest steps can create meaningful momentum.";
  
  return response;
}

export async function analyzeSentiment(journalContent: string): Promise<{
  moods: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
}> {
  try {
    const apiKey = process.env.OPENAI_API_KEY || '';
    
    // Check if we have an API key with sufficient length
    if (apiKey.length < 10) {
      console.log("Using fallback sentiment analysis due to missing/invalid OpenAI API key");
      // Provide a fallback sentiment analysis for development purposes
      return analyzeSentimentFallback(journalContent);
    }
    
    console.log("Using OpenAI API key (preview):", `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`);
    console.log("API key starts with correct format (sk-):", apiKey.startsWith('sk-'));
    
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
    return analyzeSentimentFallback(journalContent);
  }
}

// Fallback sentiment analysis for when OpenAI API is unavailable
function analyzeSentimentFallback(text: string): {
  moods: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
} {
  const lowerText = text.toLowerCase();
  
  // Simple keyword-based approach
  const positiveWords = ["happy", "glad", "excited", "joy", "wonderful", "great", "awesome", "love", "enjoy", "grateful"];
  const negativeWords = ["sad", "angry", "upset", "frustrated", "mad", "hate", "annoyed", "stressed", "anxious", "disappointed"];
  
  // Count occurrences
  let positiveCount = 0;
  let negativeCount = 0;
  
  positiveWords.forEach(word => {
    if (lowerText.includes(word)) positiveCount++;
  });
  
  negativeWords.forEach(word => {
    if (lowerText.includes(word)) negativeCount++;
  });
  
  // Determine sentiment
  let sentiment: 'positive' | 'negative' | 'neutral';
  let confidence = 0.6; // Base confidence
  let moods: string[] = [];
  
  if (positiveCount > negativeCount) {
    sentiment = 'positive';
    confidence += Math.min(0.3, positiveCount * 0.05);
    moods = positiveWords.filter(word => lowerText.includes(word)).slice(0, 3);
    // Add some general positive moods if needed
    if (moods.length < 3) {
      const generalPositive = ["Happy", "Content", "Optimistic"].slice(0, 3 - moods.length);
      moods = [...moods.map(w => w.charAt(0).toUpperCase() + w.slice(1)), ...generalPositive];
    }
  } else if (negativeCount > positiveCount) {
    sentiment = 'negative';
    confidence += Math.min(0.3, negativeCount * 0.05);
    moods = negativeWords.filter(word => lowerText.includes(word)).slice(0, 3);
    // Add some general negative moods if needed
    if (moods.length < 3) {
      const generalNegative = ["Sad", "Frustrated", "Concerned"].slice(0, 3 - moods.length);
      moods = [...moods.map(w => w.charAt(0).toUpperCase() + w.slice(1)), ...generalNegative];
    }
  } else {
    sentiment = 'neutral';
    moods = ["Neutral", "Calm", "Balanced"];
  }
  
  return {
    moods: moods.map(mood => mood.charAt(0).toUpperCase() + mood.slice(1)), // Capitalize
    sentiment,
    confidence
  };
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
    const apiKey = process.env.OPENAI_API_KEY || '';
    
    // Check if we have an API key with sufficient length
    if (apiKey.length < 10) {
      console.log("Using fallback chatbot response due to missing/invalid OpenAI API key");
      return generateChatbotResponseFallback(messages, supportType);
    }
    
    console.log("Using OpenAI API key (preview):", `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`);
    console.log("API key starts with correct format (sk-):", apiKey.startsWith('sk-'));
    
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
    return generateChatbotResponseFallback(messages, supportType);
  }
}

// Fallback chatbot response when OpenAI API is unavailable
function generateChatbotResponseFallback(messages: ChatMessage[], supportType: 'emotional' | 'productivity' | 'general' = 'general'): string {
  // Get the last user message
  const lastUserMessage = messages
    .filter(msg => msg.role === 'user')
    .slice(-1)[0]?.content || '';
    
  const lowerContent = lastUserMessage.toLowerCase();
  
  // Check for common message types
  const isQuestion = lowerContent.includes('?') || 
    lowerContent.includes('how') || 
    lowerContent.includes('what') || 
    lowerContent.includes('why') || 
    lowerContent.includes('when') || 
    lowerContent.includes('where');
  
  const isGreeting = lowerContent.includes('hello') || 
    lowerContent.includes('hi') || 
    lowerContent.includes('hey') || 
    lowerContent.includes('good morning') || 
    lowerContent.includes('good afternoon') || 
    lowerContent.includes('good evening');
  
  const containsEmotion = lowerContent.includes('feel') || 
    lowerContent.includes('sad') || 
    lowerContent.includes('happy') || 
    lowerContent.includes('angry') || 
    lowerContent.includes('anxious') || 
    lowerContent.includes('stress');
  
  const mentionsGoals = lowerContent.includes('goal') || 
    lowerContent.includes('plan') || 
    lowerContent.includes('achieve') || 
    lowerContent.includes('accomplish') || 
    lowerContent.includes('finish');
  
  // Generate appropriate response based on message type and support type
  switch(supportType) {
    case 'emotional':
      if (isGreeting) {
        return "Hello! I'm here to provide emotional support. How are you feeling today?";
      } else if (isQuestion) {
        return "That's a thoughtful question. While I don't have access to OpenAI right now, I'm here to listen and support you. Could you tell me more about how this relates to what you're feeling?";
      } else if (containsEmotion) {
        return "Thank you for sharing how you're feeling. It takes courage to express emotions. Remember that all feelings are valid, even the difficult ones. Would it help to explore what might be triggering these emotions?";
      } else {
        return "I'm here to support you emotionally. Sometimes just expressing our thoughts can help us process our feelings. Is there something specific you'd like to talk about today?";
      }
      
    case 'productivity':
      if (isGreeting) {
        return "Hello! I'm your productivity coach. What would you like to accomplish today?";
      } else if (isQuestion) {
        return "That's a great question about productivity. While I don't have access to OpenAI right now, I believe breaking down tasks into smaller steps and prioritizing your most important work can help. What specific area are you trying to improve?";
      } else if (mentionsGoals) {
        return "Setting clear, achievable goals is a great start! Remember to make them specific, measurable, and time-bound. Have you broken this goal down into smaller actionable steps?";
      } else {
        return "As your productivity coach, I'm here to help you work more effectively. The key is often finding the right balance between planning and action. What's one small step you could take today toward your goals?";
      }
      
    case 'general':
    default:
      if (isGreeting) {
        return "Hello there! It's nice to chat with you. How can I help you today?";
      } else if (isQuestion) {
        return "That's an interesting question. While I don't have access to OpenAI right now, I'd still like to hear more about your thoughts on this topic.";
      } else if (containsEmotion) {
        return "I appreciate you sharing how you're feeling. Our emotions can tell us a lot about what matters to us. Would you like to talk more about what's behind these feelings?";
      } else if (mentionsGoals) {
        return "It sounds like you're focused on your goals, which is wonderful! Setting clear intentions can help us navigate life's challenges. What steps are you considering to move forward?";
      } else {
        return "I'm here to chat and provide support. While I don't currently have access to OpenAI, I'm happy to discuss whatever's on your mind. Is there something specific you'd like to explore today?";
      }
  }
}
