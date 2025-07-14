import { ChatCompletionMessageParam } from "openai/resources";
import openai, { apiKey } from "./openai-adapter";
import { sanitizeContentForAI, logPrivacyEvent } from "./security";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

// Sanitize logging to prevent key exposure in logs (only show first 5 chars)
const maskedKey = apiKey.length > 8 ? 
  `${apiKey.substring(0, 5)}${'*'.repeat(apiKey.length - 8)}${apiKey.substring(apiKey.length - 3)}` : 
  '(not set)';

console.log(`Using OpenAI API key (preview): ${maskedKey}`);

// Validate the API key format
if (apiKey.length > 10) {
  console.log(`API key starts with correct format (sk-): ${apiKey.startsWith('sk-')}`);
  
  if (!apiKey.startsWith('sk-')) {
    console.warn("⚠️ WARNING: API key format is incorrect. OpenAI API keys should start with 'sk-'");
    console.warn("This will likely cause API calls to fail. Please check your OPENAI_API_KEY environment variable.");
  }
} else {
  console.error("❌ OPENAI_API_KEY is not set or too short");
}

export async function generateAIResponse(journalContent: string): Promise<string> {
  try {
    // Validate and sanitize the content before sending to OpenAI
    // This removes potential PII like emails, phone numbers, etc.
    const sanitizedContent = sanitizeContentForAI(journalContent);
    
    // Log that content was processed (without including the actual content)
    logPrivacyEvent("ai_content_processed", 0, "Journal content processed for AI analysis");
    
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
      
      Important: Never reference or include any specific personal details like names, locations, 
      contact information, or specific events that could identify the user.
      
      Here is their journal entry:
      
      ${sanitizedContent}
    `;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { 
          role: "system", 
          content: "You are an empathetic and insightful AI companion for a journaling app. Your purpose is to provide thoughtful reflections and gentle advice. Never repeat or reference specific personal details like names, contact information, or specific events that could identify someone." 
        },
        { 
          role: "user", 
          content: sanitizedContent 
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
  
  // Analyze sentiment with more keywords
  let sentiment = "neutral";
  const positiveWords = ["happy", "glad", "excited", "joy", "good", "great", "wonderful", "amazing", "awesome", "love", "enjoy", "pleased", "proud", "hopeful", "grateful", "thankful", "blessed", "accomplished", "relaxed", "peaceful", "content"];
  const negativeWords = ["sad", "angry", "upset", "frustrated", "mad", "worried", "anxious", "stressed", "tired", "exhausted", "overwhelmed", "disappointed", "hurt", "afraid", "scared", "lonely", "confused", "annoyed", "pain", "difficult", "struggling", "problem"];
  
  let positiveScore = 0;
  let negativeScore = 0;
  
  // Count occurrences with weighted scoring
  positiveWords.forEach(word => {
    if (lowerContent.includes(word)) positiveScore += 1;
    // Check for intensifiers
    if (lowerContent.includes(`very ${word}`) || lowerContent.includes(`really ${word}`)) positiveScore += 0.5;
  });
  
  negativeWords.forEach(word => {
    if (lowerContent.includes(word)) negativeScore += 1;
    // Check for intensifiers
    if (lowerContent.includes(`very ${word}`) || lowerContent.includes(`really ${word}`)) negativeScore += 0.5;
  });
  
  if (positiveScore > negativeScore + 1) {
    sentiment = "positive";
  } else if (negativeScore > positiveScore + 1) {
    sentiment = "negative";
  }
  
  // Topic detection - expanded categories
  const topics = {
    work: ["work", "job", "career", "meeting", "boss", "colleague", "project", "deadline", "task", "office", "promotion", "professional"],
    relationships: ["friend", "family", "partner", "relationship", "wife", "husband", "girlfriend", "boyfriend", "spouse", "parent", "child", "date", "love", "connection", "social"],
    health: ["health", "sick", "illness", "doctor", "exercise", "workout", "gym", "diet", "eating", "sleep", "tired", "energy", "wellness", "meditation", "rest"],
    goals: ["goal", "plan", "future", "dream", "aspiration", "achievement", "success", "progress", "milestone", "ambition", "resolution", "habit"],
    challenges: ["challenge", "problem", "obstacle", "difficulty", "struggle", "overcome", "hard", "tough", "setback", "issue", "conflict", "stress", "worry", "concern"],
    learning: ["learn", "study", "course", "book", "read", "knowledge", "skill", "practice", "improve", "grow", "development", "progress", "education", "training"],
    creativity: ["create", "art", "music", "paint", "write", "draw", "design", "creative", "idea", "inspiration", "express", "passion", "hobby", "project"]
  };
  
  // Find detected topics
  const detectedTopics: string[] = [];
  Object.entries(topics).forEach(([topic, keywords]) => {
    if (keywords.some(keyword => lowerContent.includes(keyword))) {
      detectedTopics.push(topic);
    }
  });
  
  // Check for time references
  const timeOrientation = lowerContent.includes("future") || lowerContent.includes("plan") || lowerContent.includes("will") || lowerContent.includes("going to") ? 
    "future-focused" : 
    (lowerContent.includes("past") || lowerContent.includes("yesterday") || lowerContent.includes("used to") || lowerContent.includes("remember") ? 
      "past-focused" : "present-focused");
  
  // Generate appropriate response based on sentiment and topics
  let response = "";
  
  // First paragraph - acknowledgment with more personalization
  if (sentiment === "positive") {
    response += "I'm glad to see your positive energy in this journal entry. It's wonderful that you're taking time to reflect on your experiences and notice the good things in your life. These moments of gratitude help build resilience and joy.";
  } else if (sentiment === "negative") {
    response += "I notice you're expressing some challenging emotions in your entry. It's completely valid to feel this way, and writing about it is a healthy outlet. Acknowledging difficult feelings is an important step in processing them and finding your path forward.";
  } else {
    response += "Thank you for sharing your thoughts in your journal today. Taking time to reflect like this is an important practice for self-awareness and growth. Your observations create space for deeper understanding of yourself and your experiences.";
  }
  
  // Second paragraph - insight based on detected topics
  if (detectedTopics.length > 0) {
    const primaryTopic = detectedTopics[0];
    
    switch(primaryTopic) {
      case "work":
        response += "\n\nI noticed your thoughts about work-related experiences. Finding balance between professional responsibilities and personal wellbeing can be challenging in today's connected world. Consider setting clear boundaries and taking short mindful breaks throughout your day. Even five minutes of conscious breathing can reset your perspective and enhance your focus.";
        break;
      case "relationships":
        response += "\n\nRelationships seem to be on your mind today. Our connections with others often mirror aspects of ourselves that we might not otherwise notice. Each interaction offers a window into both your values and needs as well as those of others. Taking time to reflect on what certain relationships bring up for you can offer valuable insights into your patterns and growth opportunities.";
        break;
      case "health":
        response += "\n\nI see health and wellbeing themes in your writing. Your physical and mental health form the foundation for everything else in life. Small, consistent actions often create more sustainable change than dramatic efforts. Consider what one small health-supporting habit you might build into your routine that would feel genuinely nourishing rather than obligatory.";
        break;
      case "goals":
        response += "\n\nYour focus on goals and aspirations shows a forward-thinking mindset. Remember that meaningful progress isn't always linear, and setbacks are a natural part of any worthwhile journey. Breaking larger goals into smaller, manageable steps can help maintain momentum and give you opportunities to celebrate the small wins along the way.";
        break;
      case "challenges":
        response += "\n\nI notice you're facing some challenges right now. Difficult periods, while uncomfortable, often contain the seeds of significant personal growth. Sometimes reframing obstacles as opportunities for developing new strengths can shift your perspective. What capabilities might you be building through this challenge that could serve you well in the future?";
        break;
      case "learning":
        response += "\n\nYour interest in learning and growth comes through in your writing. The pursuit of knowledge is a lifelong journey that enriches our experience and expands our perspective. Remember that learning happens not just through formal education but through curiosity, experience, and reflection – exactly what you're doing with this journal practice.";
        break;
      case "creativity":
        response += "\n\nI see creativity flowing through your journal entry. Creative expression connects us with our authentic selves and provides an outlet for processing our experiences in unique ways. Whether through art, writing, music, or simply creative thinking, these practices nourish parts of ourselves that logical thinking alone cannot reach.";
        break;
      default:
        response += "\n\nReflection like this helps build self-awareness over time. By noticing patterns in your thoughts, feelings, and experiences, you develop a deeper understanding of what truly matters to you and what might need more attention in your daily life. Your journal becomes a map of your inner landscape.";
    }
  } else {
    response += "\n\nTaking time to record your thoughts creates valuable space between experience and reaction. This practice of reflection helps you recognize patterns, process emotions, and make more intentional choices. Over time, your journal becomes a record of your journey that you can look back on to see how far you've come.";
  }
  
  // Third paragraph - reflective question based on time orientation
  if (timeOrientation === "future-focused") {
    response += "\n\nAs you look toward the future, consider: What small step could you take today that aligns with your vision for tomorrow? Sometimes the smallest actions create the most meaningful momentum when they're consistently applied.";
  } else if (timeOrientation === "past-focused") {
    response += "\n\nReflecting on past experiences, what wisdom have you gathered that might serve you right now? Our histories contain valuable lessons that can illuminate our present choices when we approach them with curiosity rather than judgment.";
  } else {
    response += "\n\nAs you continue your day, what would help you feel more present and engaged with this moment? Our minds often wander to the past or future, but there's a special quality of aliveness that comes from fully inhabiting the present.";
  }
  
  return response;
}

export async function analyzeSentiment(journalContent: string): Promise<{
  moods: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
}> {
  try {
    // Sanitize content before analysis to remove PII
    const sanitizedContent = sanitizeContentForAI(journalContent);
    
    // Log that content was processed for sentiment analysis
    logPrivacyEvent("sentiment_analysis", 0, "Journal content processed for sentiment analysis");
    
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: 
            "You are a sentiment analysis expert. Analyze the sentiment of the journal entry and identify the top emotions/moods expressed. Respond with JSON in this format: { 'moods': string[], 'sentiment': 'positive' | 'negative' | 'neutral', 'confidence': number }. The confidence should be between 0 and 1. Do not include or reference any personal identifiable information in your analysis.",
        },
        {
          role: "user",
          content: sanitizedContent,
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
 * Built-in AI Personality types available in the application
 */
export type BuiltInPersonalityType = 
  'default' | 
  'socratic' | 
  'stoic' | 
  'existentialist' | 
  'analytical' | 
  'poetic' | 
  'humorous' | 
  'zen' | 
  'christian' |
  'empathetic-listener' |
  'solution-focused' |
  'trauma-informed' |
  'mindfulness-based' |
  'cognitive-behavioral' |
  'strength-based' |
  'holistic-wellness';

/**
 * Personality type can be either a built-in type or a custom ID
 */
export type PersonalityType = string;

/**
 * Generate a response for the AI chatbot based on the conversation history
 */
export async function generateChatbotResponse(
  messages: ChatMessage[], 
  supportType: 'emotional' | 'productivity' | 'general' | 'philosophy' = 'general',
  personalityType: string = 'default',
  customInstructions?: string
): Promise<string> {
  try {
    // Validation is already done at the top level
    
    // Create system messages based on the type of support requested
    let systemMessage: string;
    
    switch (supportType) {
      case 'emotional':
        systemMessage = `You are a supportive AI companion focused on emotional wellness.
          Keep responses short (2-3 sentences max). Always end with a question to keep the conversation going.
          Be warm and empathetic. Use simple CBT techniques when helpful.
          Ask follow-up questions about feelings, coping strategies, or what the user needs right now.`;
        break;
      
      case 'productivity':
        systemMessage = `You are an energetic productivity coach who gives quick, actionable advice.
          Keep responses short (2-3 sentences max). Always end with a question to keep the conversation going.
          Be encouraging and solution-focused. Ask about their current challenges, what's working, or next steps.
          Use frameworks like SMART goals or Pomodoro when relevant.`;
        break;
        
      case 'philosophy':
        systemMessage = `You are a philosophical companion inspired by great thinkers like Socrates and Marcus Aurelius.
          Keep responses short (2-3 sentences max). Always end with a thought-provoking question.
          Focus on asking questions that help examine assumptions and deepen understanding.
          Use simple wisdom rather than complex explanations. Help users think more deeply about life.`;
        break;
        
      case 'general':
      default:
        systemMessage = `You are a supportive AI companion for personal growth and mental wellness.
          Keep responses short (2-3 sentences max). Always end with a question to keep the conversation going.
          Be empathetic and encouraging. Ask about their thoughts, feelings, goals, or what they'd like to explore.
          Focus on helping them reflect rather than giving long advice.`;
        break;
    }
    
    // Convert our ChatMessage[] to OpenAI's required format and sanitize user content
    const apiMessages: ChatCompletionMessageParam[] = messages.slice(-10).map(msg => {
      // Only sanitize user messages to remove PII, leave system and assistant messages as they are
      if (msg.role === 'user') {
        return {
          role: msg.role,
          content: sanitizeContentForAI(msg.content)
        };
      }
      return {
        role: msg.role,
        content: msg.content
      };
    });
    
    // Log that chat content was processed for AI
    logPrivacyEvent("chatbot_message_processed", 0, "Chat messages processed for AI response");
    
    // Create personality-specific additional instructions
    let personalityInstructions = "";
    
    // Check if custom instructions are provided
    if (customInstructions) {
      personalityInstructions = `
        Adopt a custom personality with these instructions:
        ${customInstructions}`;
    } else {
      // Use built-in personalities if no custom instructions
      switch (personalityType) {
        case 'socratic':
          personalityInstructions = `
            Adopt a Socratic dialogue style:
            - Ask thought-provoking questions that lead to deeper insights
            - Use dialectic questioning to help examine assumptions
            - Focus on clarifying concepts and definitions
            - Demonstrate intellectual humility, acknowledging the limits of knowledge
            - End responses with questions that encourage further reflection`;
          break;
        case 'stoic':
          personalityInstructions = `
            Adopt a Stoic perspective in your responses:
            - Emphasize focusing on what's within our control
            - Highlight the importance of virtue and character
            - Suggest practical exercises for developing resilience
            - Maintain calm rationality in the face of difficulties
            - Reference Stoic principles from philosophers like Marcus Aurelius, Seneca, or Epictetus`;
          break;
        case 'existentialist':
          personalityInstructions = `
            Adopt an Existentialist perspective:
            - Emphasize freedom, choice, and personal responsibility
            - Explore themes of authenticity, anxiety, and meaning-creation
            - Reference existentialist thinkers like Sartre, Camus, Kierkegaard, or de Beauvoir
            - Acknowledge the tension between freedom and responsibility
            - Discuss how we create meaning in an inherently meaningless universe`;
          break;
        case 'analytical':
          personalityInstructions = `
            Adopt an Analytical and logical approach:
            - Present information in a structured, logical manner
            - Break complex topics down into component parts
            - Use precise language and clear definitions
            - Draw logical connections between concepts
            - Evaluate arguments carefully for validity and soundness`;
          break;
        case 'poetic':
          personalityInstructions = `
            Adopt a Poetic and metaphorical style:
            - Use rich imagery and metaphor to illustrate concepts
            - Draw on literary and artistic references
            - Express philosophical ideas through aesthetic language
            - Consider the emotional and experiential dimensions of philosophical questions
            - Use rhythm and flow in your language to create a sense of beauty`;
          break;
        case 'humorous':
          personalityInstructions = `
            Adopt a Humorous and witty approach:
            - Use appropriate humor, wordplay, and wit in your explanations
            - Include philosophical jokes or ironies
            - Keep the tone light while still providing insightful content
            - Use humorous analogies to explain complex concepts
            - Balance humor with substance to maintain intellectual integrity`;
          break;
        case 'zen':
          personalityInstructions = `
            Adopt a Zen-like simplicity and mindfulness:
            - Use concise, direct language
            - Embrace paradox and non-dualistic thinking
            - Focus on present-moment awareness
            - Use simple yet profound observations
            - Sometimes use koans or paradoxical statements
            - Create space for silence and contemplation`;
          break;
        case 'christian':
          personalityInstructions = `
            Adopt a Christian counselor perspective:
            - Draw wisdom from Christian counseling, theology, and scripture
            - Emphasize themes of love, grace, forgiveness, and redemption
            - Reference insights from Christian thinkers like Augustine, Aquinas, C.S. Lewis, or Kierkegaard
            - Consider the spiritual dimensions of human existence and purpose
            - Discuss how faith, hope, and love can provide guidance in life's challenges
            - Maintain respect for different beliefs while sharing Christian wisdom
            - Focus on virtues like compassion, humility, service to others, and trust in divine providence`;
          break;
        case 'empathetic-listener':
          personalityInstructions = `
            Adopt an Empathetic Listener approach:
            - Focus primarily on validating emotions and creating a safe space
            - Use reflective listening techniques to mirror back what you hear
            - Acknowledge feelings before offering any suggestions
            - Ask gentle questions to help the person explore their emotions deeper
            - Avoid rushing to solutions - prioritize understanding and connection
            - Use warm, compassionate language that makes people feel truly heard
            - Validate experiences without judgment, especially during difficult times`;
          break;
        case 'solution-focused':
          personalityInstructions = `
            Adopt a Solution-Focused approach:
            - Concentrate on identifying strengths and resources the person already has
            - Ask about times when the problem was less severe or absent
            - Focus on small, achievable steps toward positive change
            - Help identify what's already working and how to do more of it
            - Use scaling questions to measure progress and motivation
            - Emphasize the person's capability and resilience
            - Keep conversations oriented toward future possibilities rather than past problems`;
          break;
        case 'trauma-informed':
          personalityInstructions = `
            Adopt a Trauma-Informed approach:
            - Prioritize safety, trustworthiness, and choice in all interactions
            - Recognize signs of trauma responses and validate them as normal
            - Emphasize that healing happens at the person's own pace
            - Focus on building resilience and coping strategies
            - Avoid re-traumatization by not pushing for details about traumatic events
            - Highlight the person's survival strengths and adaptive responses
            - Use grounding techniques and present-moment awareness when appropriate`;
          break;
        case 'mindfulness-based':
          personalityInstructions = `
            Adopt a Mindfulness-Based approach:
            - Encourage present-moment awareness and non-judgmental observation
            - Teach acceptance of thoughts and feelings without trying to change them immediately
            - Guide toward noticing patterns in thinking and emotional reactions
            - Suggest simple mindfulness practices like breathing exercises or body awareness
            - Emphasize the impermanent nature of difficult emotions and situations
            - Help cultivate self-compassion and loving-kindness toward oneself
            - Use mindful inquiry to explore experiences with curiosity rather than criticism`;
          break;
        case 'cognitive-behavioral':
          personalityInstructions = `
            Adopt a Cognitive-Behavioral approach:
            - Help identify connections between thoughts, feelings, and behaviors
            - Examine thinking patterns that might be contributing to distress
            - Suggest practical strategies for challenging unhelpful thought patterns
            - Focus on behavioral experiments and homework to test new approaches
            - Use structured problem-solving techniques
            - Emphasize the person's ability to influence their experience through changing thoughts and actions
            - Provide concrete tools and techniques that can be practiced between sessions`;
          break;
        case 'strength-based':
          personalityInstructions = `
            Adopt a Strength-Based approach:
            - Actively identify and highlight the person's existing strengths and capabilities
            - Reframe challenges as opportunities to develop or utilize strengths
            - Ask about past successes and how those skills apply to current situations
            - Focus on what's going right rather than what's going wrong
            - Help build confidence by recognizing patterns of resilience
            - Encourage using natural talents and interests as resources for healing
            - View the person as the expert on their own life and experiences`;
          break;
        case 'holistic-wellness':
          personalityInstructions = `
            Adopt a Holistic Wellness approach:
            - Consider the whole person: mind, body, spirit, and environment
            - Explore how physical health, relationships, work, and spirituality interconnect
            - Suggest lifestyle factors that support overall wellbeing
            - Acknowledge cultural, social, and systemic influences on mental health
            - Encourage balance and integration across all life domains
            - Consider alternative and complementary approaches alongside traditional methods
            - Help create sustainable practices that nourish all aspects of wellbeing`;
          break;
        default:
          // No additional instructions for default personality
          break;
      }
    }
    
    // Prepend the system message with personality instructions
    apiMessages.unshift({
      role: 'system',
      content: systemMessage + (personalityInstructions ? "\n\n" + personalityInstructions : "")
    });
    
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: apiMessages,
      max_tokens: 150,
      temperature: 0.7,
    });
    
    const responseContent = response.choices[0].message.content;
    return responseContent !== null ? responseContent : "I'm having trouble responding right now. Can we try again?";
  } catch (error: any) {
    // Log detailed error information
    console.error("Error generating chatbot response:", error);
    
    // Check for rate limit or quota errors specifically
    if (error?.message && (
        error.message.includes("exceeded your current quota") || 
        error.message.includes("rate limit") || 
        error.message.includes("429") ||
        error?.status === 429)) {
      console.log("Using fallback chatbot response due to API rate limiting or quota issue");
    } else {
      console.log("Using fallback chatbot response due to API error");
    }
    
    // Use the fallback response generator with appropriate personality
    return generateChatbotResponseFallback(messages, supportType, personalityType, customInstructions);
  }
}

// Fallback chatbot response when OpenAI API is unavailable
function generateChatbotResponseFallback(
  messages: ChatMessage[], 
  supportType: 'emotional' | 'productivity' | 'general' | 'philosophy',
  personalityType: string = 'default',
  customInstructions?: string
): string {
  // Get the last user message
  const lastUserMessage = messages
    .filter(msg => msg.role === 'user')
    .slice(-1)[0]?.content || '';
    
  const lowerContent = lastUserMessage.toLowerCase();
  
  // Helper function to apply personality to responses
  const applyPersonality = (response: string): string => {
    // If we have a custom personality (starts with "custom_"), apply default style
    // In a real implementation, we would use the customInstructions to guide GPT
    // in how to format the response, but for the fallback, we'll use the default style
    if (personalityType.startsWith('custom_')) {
      // For custom personalities in fallback mode, we just add a note about custom style
      return response + "\n\n(Note: This is a fallback response. With an active API connection, this would use your custom personality style.)";
    }
    
    // Otherwise, apply built-in personality styles
    switch (personalityType) {
      case 'socratic':
        return socraticPersonality(response);
      case 'stoic':
        return stoicPersonality(response);
      case 'existentialist':
        return existentialistPersonality(response);
      case 'analytical':
        return analyticalPersonality(response);
      case 'poetic':
        return poeticPersonality(response);
      case 'humorous':
        return humorousPersonality(response);
      case 'zen':
        return zenPersonality(response);
      case 'christian':
        return christianPersonality(response);
      case 'empathetic-listener':
        return empatheticListenerPersonality(response);
      case 'solution-focused':
        return solutionFocusedPersonality(response);
      case 'trauma-informed':
        return traumaInformedPersonality(response);
      case 'mindfulness-based':
        return mindfulnessBasedPersonality(response);
      case 'cognitive-behavioral':
        return cognitiveBehavioralPersonality(response);
      case 'strength-based':
        return strengthBasedPersonality(response);
      case 'holistic-wellness':
        return holisticWellnessPersonality(response);
      case 'default':
      default:
        return response;
    }
  };
  
  // Personality modifier functions
  function socraticPersonality(response: string): string {
    // Add question-focused, dialectic approach
    const questions = [
      "What do you think about this perspective?",
      "Have you considered an alternative view?",
      "How would you define the key terms in your inquiry?",
      "What assumptions are we making here?",
      "What evidence would convince you otherwise?"
    ];
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    
    // Make response more question-oriented
    return response.replace(/\?/, "").split(". ")
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .slice(0, -1)
      .join(". ") + ". " + randomQuestion;
  }
  
  function stoicPersonality(response: string): string {
    // Add stoic wisdom references and focus on what's in our control
    const stoicPhrases = [
      "Remember what is within your control and what is not.",
      "The obstacle is the way.",
      "Focus on what you can change, accept what you cannot.",
      "Virtue alone is sufficient for happiness.",
      "We suffer more in imagination than in reality."
    ];
    const randomPhrase = stoicPhrases[Math.floor(Math.random() * stoicPhrases.length)];
    
    return response + " " + randomPhrase;
  }
  
  function existentialistPersonality(response: string): string {
    // Add existentialist themes of freedom, authenticity, and meaning-making
    const existentialPhrases = [
      "We are condemned to be free and must create our own meaning.",
      "Authenticity requires embracing the anxiety of freedom.",
      "In choosing for yourself, you choose for all humanity.",
      "Existence precedes essence - we define ourselves through our actions.",
      "The absurd arises from our search for meaning in a universe that offers none inherently."
    ];
    const randomPhrase = existentialPhrases[Math.floor(Math.random() * existentialPhrases.length)];
    
    return response + " " + randomPhrase;
  }
  
  function analyticalPersonality(response: string): string {
    // Add logical structure and clarity
    return "Let me analyze this systematically. " + response + " We could further break this down into component parts for a more thorough understanding.";
  }
  
  function poeticPersonality(response: string): string {
    // Add metaphorical language and imagery
    const poeticImages = [
      "Like stars guiding sailors across vast oceans, these insights illuminate our path.",
      "This reminds me of the changing seasons, each bringing its own wisdom and beauty.",
      "Your words are like seeds that, with proper nurturing, may grow into forests of understanding.",
      "We navigate the rivers of consciousness, sometimes in calm waters, sometimes in rapids.",
      "The tapestry of human experience is woven with threads of joy and sorrow, triumph and defeat."
    ];
    const randomImage = poeticImages[Math.floor(Math.random() * poeticImages.length)];
    
    return response + " " + randomImage;
  }
  
  function humorousPersonality(response: string): string {
    // Add light humor and wit
    const humorPhrases = [
      "Not to get philosophical about it, but... wait, that's exactly what we're doing!",
      "If Socrates were here, he'd probably ask for a refund on his hemlock.",
      "This is deep stuff - almost as deep as the pile of laundry I've been avoiding.",
      "Philosophy: because sometimes overthinking is actually the right amount of thinking.",
      "I'd make a joke about existentialism, but what would be the point?"
    ];
    const randomHumor = humorPhrases[Math.floor(Math.random() * humorPhrases.length)];
    
    return response + " " + randomHumor;
  }
  
  function zenPersonality(response: string): string {
    // Add zen-like simplicity and mindfulness
    const zenPhrases = [
      "The present moment contains all we need.",
      "Empty your cup to receive new wisdom.",
      "The answer you seek may be in the space between thoughts.",
      "Before enlightenment, chop wood, carry water. After enlightenment, chop wood, carry water.",
      "When hungry, eat. When tired, sleep."
    ];
    const randomZen = zenPhrases[Math.floor(Math.random() * zenPhrases.length)];
    
    // Simplify response
    const simplified = response.split(". ")[0] + ".";
    return simplified + " " + randomZen;
  }

  function christianPersonality(response: string): string {
    // Add Christian philosophical wisdom and perspective
    const christianPhrases = [
      "Consider this through the lens of divine love and grace.",
      "As Scripture reminds us, God works all things for good.",
      "In faith, we find strength for life's journey.",
      "Christ's teachings illuminate this path of wisdom.",
      "Let us seek God's guidance in this matter.",
      "Through prayer and reflection, understanding deepens."
    ];
    const randomPhrase = christianPhrases[Math.floor(Math.random() * christianPhrases.length)];
    
    return response + " " + randomPhrase;
  }

  function empatheticListenerPersonality(response: string): string {
    const validatingPhrases = [
      "I hear you and what you're experiencing sounds really difficult.",
      "Your feelings are completely valid and understandable.",
      "Thank you for trusting me with these important thoughts.",
      "It takes courage to share something so personal.",
      "I can sense how much this means to you."
    ];
    const randomValidation = validatingPhrases[Math.floor(Math.random() * validatingPhrases.length)];
    return randomValidation + " " + response;
  }

  function solutionFocusedPersonality(response: string): string {
    const strengthPhrases = [
      "What strengths have helped you handle similar situations before?",
      "When was a time you felt more confident about this?",
      "What small step could you take today toward improvement?",
      "You've overcome challenges before - what worked then?",
      "What resources do you have available right now?"
    ];
    const randomStrength = strengthPhrases[Math.floor(Math.random() * strengthPhrases.length)];
    return response + " " + randomStrength;
  }

  function traumaInformedPersonality(response: string): string {
    const safetyPhrases = [
      "You're in control of how much you share and at what pace.",
      "Your responses are completely normal given what you've experienced.",
      "Healing isn't linear, and that's perfectly okay.",
      "You've shown incredible strength just by being here.",
      "Trust yourself to know what feels right for you."
    ];
    const randomSafety = safetyPhrases[Math.floor(Math.random() * safetyPhrases.length)];
    return response + " " + randomSafety;
  }

  function mindfulnessBasedPersonality(response: string): string {
    const mindfulPhrases = [
      "Notice what's happening in this moment without judgment.",
      "Can you feel your breath as you consider this?",
      "What sensations do you notice in your body right now?",
      "This feeling, like all feelings, is temporary.",
      "What would happen if you approached this with gentle curiosity?"
    ];
    const randomMindful = mindfulPhrases[Math.floor(Math.random() * mindfulPhrases.length)];
    return response + " " + randomMindful;
  }

  function cognitiveBehavioralPersonality(response: string): string {
    const cbtPhrases = [
      "What thoughts are going through your mind about this?",
      "How might your thoughts be influencing how you feel?",
      "What evidence supports or challenges this thinking?",
      "What would you tell a friend in this same situation?",
      "What's one specific action you could try this week?"
    ];
    const randomCbt = cbtPhrases[Math.floor(Math.random() * cbtPhrases.length)];
    return response + " " + randomCbt;
  }

  function strengthBasedPersonality(response: string): string {
    const strengthPhrases = [
      "What personal qualities helped you get through this?",
      "I notice your resilience in how you're handling this.",
      "What would your best friend say are your greatest strengths?",
      "How have you grown from facing difficult situations before?",
      "What are you most proud of about how you've handled this?"
    ];
    const randomStrength = strengthPhrases[Math.floor(Math.random() * strengthPhrases.length)];
    return response + " " + randomStrength;
  }

  function holisticWellnessPersonality(response: string): string {
    const holisticPhrases = [
      "How are you caring for your mind, body, and spirit through this?",
      "What connections between your physical and emotional health do you notice?",
      "Consider how your environment and relationships might support your wellbeing.",
      "What practices bring you a sense of balance and wholeness?",
      "How might you honor all aspects of yourself in addressing this?"
    ];
    const randomHolistic = holisticPhrases[Math.floor(Math.random() * holisticPhrases.length)];
    return response + " " + randomHolistic;
  }
  
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
    
  const mentionsPhilosophical = lowerContent.includes('meaning') ||
    lowerContent.includes('life') ||
    lowerContent.includes('existence') ||
    lowerContent.includes('truth') ||
    lowerContent.includes('reality') ||
    lowerContent.includes('ethics') ||
    lowerContent.includes('moral') ||
    lowerContent.includes('virtue') ||
    lowerContent.includes('wisdom') ||
    lowerContent.includes('purpose');
  
  // Generate appropriate response based on message type and support type
  switch(supportType) {
    case 'philosophy':
      if (isGreeting) {
        const greetingResponses = [
          "Greetings, fellow seeker of wisdom. As Socrates approached philosophical inquiry with a recognition of his own ignorance, let us begin our dialogue with both curiosity and humility. What philosophical questions have been occupying your thoughts?",
          "Welcome to our philosophical exchange. As Aristotle noted, philosophy begins in wonder. What aspects of existence have recently sparked your curiosity or contemplation?",
          "I am pleased to engage in this meeting of minds. The Stoics remind us that each moment offers an opportunity for deepened understanding. What wisdom shall we pursue together in this conversation?",
          "Well met on this journey of inquiry. As Hannah Arendt suggested, thinking is a dialogue between me and myself. In sharing our thoughts, we create a new space for understanding. What shall we explore today?"
        ];
        return applyPersonality(greetingResponses[Math.floor(Math.random() * greetingResponses.length)]);
      } else if (isQuestion) {
        const philosophicalResponses = [
          "A profound question that echoes through the ages. Socrates might remind us that true wisdom begins with acknowledging the limits of our knowledge. What underlying assumptions might benefit from examination here?",
          
          "Your inquiry invites deep reflection. The Stoics would advise us to distinguish between what lies within our control and what does not. Through this lens, we might ask: what aspects of this question concern matters we can influence, and which require the wisdom to accept uncertainty?",
          
          "This question resonates with philosophical traditions across cultures and time. Let's examine it through first principles. What fundamental truths or values might illuminate our exploration?",
          
          "Kant would have us consider both the practical implications and the universal principles at play in your question. If the maxim of your inquiry were universalized, what kind of world would result? And how might this perspective deepen our understanding?",
          
          "As Simone de Beauvoir might approach your question, we should consider how our situated freedom shapes both the questions we ask and the answers we find meaningful. How does your lived experience inform this philosophical inquiry?",
          
          "Eastern philosophical traditions might invite us to transcend dualistic thinking when considering your question. As expressed in Taoist thought, how might we find harmony between apparently opposing perspectives rather than privileging one view over another?"
        ];
        return applyPersonality(philosophicalResponses[Math.floor(Math.random() * philosophicalResponses.length)]);
      } else if (mentionsPhilosophical) {
        const meaningResponses = [
          "The search for meaning represents perhaps our most distinctly human pursuit. Camus suggested we must imagine Sisyphus happy—finding purpose in the journey itself, rather than solely in its destination. In your own experience, when have you found meaning in the process rather than merely in outcomes?",
          
          "When contemplating existence and its meaning, we join a conversation spanning millennia. Marcus Aurelius reminded us that 'the universe is change; our life is what our thoughts make it.' How do your thoughts and attention patterns shape the reality you experience day to day?",
          
          "Viktor Frankl observed that meaning cannot be given but must be discovered, and that it can be found even in suffering. Looking at challenging periods in your life, what meaning have you discovered that might not have been apparent initially?",
          
          "The Buddhist tradition suggests that attachment to fixed meanings may itself be a source of suffering. How might embracing impermanence and the constant flow of existence affect your approach to meaning-making in your daily life?",
          
          "Martin Buber spoke of I-It relationships, where we relate to things instrumentally, versus I-Thou relationships, where we encounter others in their irreducible wholeness. How might this distinction illuminate your search for meaningful connection and purpose?"
        ];
        return applyPersonality(meaningResponses[Math.floor(Math.random() * meaningResponses.length)]);
      } else {
        const generalPhilosophical = [
          "The unexamined life, as Socrates famously remarked, is not worth living. Through dialogue and contemplation, we develop greater understanding of both ourselves and the world we inhabit. What aspect of your experience might benefit from deeper philosophical examination?",
          
          "Philosophy begins in wonder, as Aristotle noted. When we pause to question what otherwise seems obvious, we open ourselves to new possibilities of understanding. What within your own experience has recently evoked such wonder or curiosity?",
          
          "Epictetus taught that philosophy's purpose is not merely intellectual contemplation but practical wisdom—learning to distinguish between what we can and cannot control, and finding equanimity in both. How might this Stoic perspective apply to your current circumstances?",
          
          "Simone Weil wrote of attention as 'the rarest and purest form of generosity.' In our distracted age, perhaps the practice of sustained philosophical reflection offers a countercultural path to wisdom. What deserves your deepest attention at this moment in your life?",
          
          "The philosophical tradition of phenomenology invites us to return to the things themselves—the direct experience of phenomena before conceptual categorization. If you were to set aside your habitual interpretations, how might your present experience appear differently?",
          
          "As philosophers throughout history have recognized, our questions often reveal more than our answers. What questions have you been living recently that might illuminate your implicit values and assumptions about what matters most?"
        ];
        return applyPersonality(generalPhilosophical[Math.floor(Math.random() * generalPhilosophical.length)]);
      }
    
    case 'emotional':
      if (isGreeting) {
        const greetings = [
          "Hello there! I'm here as your emotional support companion. How are you really feeling today? Remember that it's okay to be honest about your emotions.",
          "Hi! I'm here to provide a supportive space for you. How are you feeling today? Sometimes just naming our emotions can help us understand them better.",
          "Welcome to our conversation. I'm here to listen and support you with whatever you're feeling. What emotions have been present for you today?",
          "Hello! I'm here as a compassionate presence. How are you feeling right now? Taking a moment to check in with ourselves can be a powerful practice."
        ];
        return applyPersonality(greetings[Math.floor(Math.random() * greetings.length)]);
      } else if (isQuestion) {
        const questionResponses = [
          "That's a thoughtful question about emotions. Our feelings often arise from a complex mix of thoughts, physical sensations, and circumstances. What led you to wonder about this?",
          "You're asking something important here. While I might not have the perfect answer, exploring emotional questions together can lead to valuable insights. Could you share more about how this connects to your own experience?",
          "Questions about our emotional lives often reveal what matters most to us. I'm curious about what prompted this question for you today?",
          "That's a meaningful question. Sometimes the process of exploring emotional questions is just as valuable as finding answers. What aspects of this question feel most significant to you right now?"
        ];
        return applyPersonality(questionResponses[Math.floor(Math.random() * questionResponses.length)]);
      } else if (containsEmotion) {
        const emotionResponses = [
          "Thank you for sharing how you're feeling. It takes courage to express emotions openly. All feelings are valid information, even the difficult ones. Would it help to explore what might be beneath these emotions?",
          "I appreciate your openness about your feelings. Emotions are like messengers, telling us something important about our needs and values. What do you think these feelings might be trying to tell you?",
          "Sharing your emotions is a sign of strength, not weakness. When we acknowledge our feelings without judgment, we create space for understanding and healing. Is there something specific that triggered these emotions?",
          "Thank you for trusting me with your feelings. Sometimes emotions that seem overwhelming become more manageable when we express them. How long have you been experiencing these feelings?"
        ];
        return applyPersonality(emotionResponses[Math.floor(Math.random() * emotionResponses.length)]);
      } else {
        const generalResponses = [
          "I'm here to support you emotionally. Sometimes just expressing our thoughts can help us process our feelings. Is there something specific on your mind today that you'd like to explore?",
          "I notice you're sharing some thoughts with me. Sometimes our thoughts and emotions are deeply connected. How are you feeling as you share this with me?",
          "Thank you for reaching out. A supportive conversation can help us navigate our emotional landscape. What feelings have been most present for you recently?",
          "I'm here as a compassionate presence in your day. You don't have to face difficult emotions alone. What has been challenging for you lately?"
        ];
        return applyPersonality(generalResponses[Math.floor(Math.random() * generalResponses.length)]);
      }
      
    case 'productivity':
      if (isGreeting) {
        const greetings = [
          "Hello! I'm your productivity coach and partner in achieving your goals. What are you working on today that I can help you approach more effectively?",
          "Welcome! I'm here to help you work smarter, not just harder. What's on your priority list today that you'd like to make progress on?",
          "Hi there! I'm your productivity ally. The most effective people start with clarity about their intentions. What would make today a success for you?",
          "Greetings! I'm your productivity coach. Remember that productivity isn't about doing more things—it's about doing the right things. What matters most to you right now?"
        ];
        return applyPersonality(greetings[Math.floor(Math.random() * greetings.length)]);
      } else if (isQuestion) {
        const questionResponses = [
          "That's an excellent question about productivity. The research shows that sustainable productivity comes from aligning our work with our natural energy cycles and strengths, rather than forcing ourselves to follow rigid systems. What have you noticed works best for your own productivity rhythm?",
          "Great question! Productivity experts like Cal Newport suggest that deep, focused work without distractions leads to the most meaningful results. Have you experimented with blocking dedicated focus time for your most important tasks?",
          "You've raised an important productivity question. One approach that many find effective is time-blocking—scheduling specific hours for different types of tasks based on when your energy naturally peaks for that work. How do you currently structure your work time?",
          "Thoughtful question! The Eisenhower Matrix helps us distinguish between what's urgent and what's important—often two very different things. Looking at your current workload, which tasks would you place in the 'important but not urgent' quadrant that often gets neglected?"
        ];
        return applyPersonality(questionResponses[Math.floor(Math.random() * questionResponses.length)]);
      } else if (mentionsGoals) {
        const goalResponses = [
          "Setting clear, achievable goals is a great start! The SMART framework (Specific, Measurable, Achievable, Relevant, Time-bound) provides a powerful structure. Could we refine your goal using these criteria to make progress more visible and motivation stronger?",
          "I'm glad you're focusing on your goals. Research shows that breaking larger goals into smaller milestones creates more consistent motivation through regular wins. What would be a meaningful first step or milestone for this larger goal?",
          "Goal setting is powerful when combined with implementation intentions—specific plans for when and how you'll take action. Instead of just 'I'll exercise more,' try 'I'll walk for 20 minutes after lunch on Monday, Wednesday, and Friday.' How might you apply this to your current goal?",
          "Your goal focus is excellent! Studies show that sharing your goals with someone who will hold you accountable increases follow-through by up to 65%. Who might serve as an accountability partner for this particular goal?"
        ];
        return applyPersonality(goalResponses[Math.floor(Math.random() * goalResponses.length)]);
      } else {
        const generalResponses = [
          "As your productivity coach, I believe effective work comes from managing your energy, not just your time. High performers alternate between periods of focused work and true renewal. How might you incorporate more deliberate breaks to maintain peak performance throughout your day?",
          "One productivity principle that often gets overlooked is the power of saying no. Every yes to something means saying no to everything else you could do with that time. What current commitments might you need to reevaluate to make space for your most important priorities?",
          "Productivity isn't just about tools and techniques—it's deeply connected to purpose. When we understand why a task matters in the bigger picture, motivation often follows naturally. How does your current work connect to what's most meaningful to you?",
          "The most productive people don't rely on willpower alone—they design their environment to make the right actions easier. What adjustments to your physical or digital workspace might reduce friction for your most important tasks?"
        ];
        return applyPersonality(generalResponses[Math.floor(Math.random() * generalResponses.length)]);
      }
      
    case 'general':
    default:
      if (isGreeting) {
        const greetings = [
          "Hello there! It's nice to connect with you today. How can I be of help or support right now?",
          "Hi! I'm here as your conversational companion. What's on your mind today that you'd like to chat about?",
          "Greetings! I'm here to listen, reflect, and engage with whatever topics interest you today. How are you doing?",
          "Hello! I'm ready to chat about whatever matters to you today. What would you like to discuss or explore together?"
        ];
        return applyPersonality(greetings[Math.floor(Math.random() * greetings.length)]);
      } else if (isQuestion) {
        const questionResponses = [
          "That's a thoughtful question. I'd love to explore this together. What perspectives have you already considered on this topic?",
          "Interesting question! While I don't have all the answers, I'm happy to think through this with you. What aspects of this question feel most important to understand?",
          "You've asked something worth reflecting on. Sometimes the best insights come through dialogue rather than immediate answers. What led you to wonder about this?",
          "Great question. Sometimes the process of exploring questions is as valuable as the answers themselves. What initial thoughts do you have on this matter?"
        ];
        return applyPersonality(questionResponses[Math.floor(Math.random() * questionResponses.length)]);
      } else if (containsEmotion) {
        const emotionResponses = [
          "I appreciate you sharing how you're feeling. Our emotions often provide important signals about what matters to us. Would you like to explore what might be behind these feelings?",
          "Thank you for expressing your emotions so openly. Feelings can be valuable guides when we take time to listen to them. Has anything in particular triggered these emotions?",
          "I notice you're sharing some emotional experiences. That kind of awareness is really valuable. How long have you been feeling this way?",
          "Thank you for trusting me with your feelings. Emotional awareness is a strength, not a weakness. What do these feelings tell you about what's important to you right now?"
        ];
        return applyPersonality(emotionResponses[Math.floor(Math.random() * emotionResponses.length)]);
      } else if (mentionsGoals) {
        const goalResponses = [
          "It sounds like you're focused on your goals, which is wonderful! Clarity about what we want helps direct our energy effectively. What makes this goal particularly meaningful to you?",
          "Goals provide such valuable direction in life. What first step might build some momentum toward what you're hoping to achieve?",
          "Having clear intentions is so powerful for making progress. What support or resources might help you move forward with this goal?",
          "I'm glad you're thinking about your goals. Often the 'why' behind a goal is just as important as the goal itself. What deeper values or needs does this goal connect with for you?"
        ];
        return applyPersonality(goalResponses[Math.floor(Math.random() * goalResponses.length)]);
      } else {
        const generalResponses = [
          "I'm here to chat and provide support about whatever's on your mind. What matters most to you right now that you'd like to discuss?",
          "Thank you for sharing that with me. I'm curious to hear more about your thoughts or experiences with this. What aspects would be most helpful to explore further?",
          "I appreciate you opening up this conversation. Sometimes just articulating our thoughts can bring greater clarity. Is there a particular perspective or idea that feels most important to you right now?",
          "I'm here as a thoughtful conversation partner. Sometimes the best insights come when we explore ideas together rather than alone. What else comes to mind as you consider this topic?"
        ];
        return applyPersonality(generalResponses[Math.floor(Math.random() * generalResponses.length)]);
      }
  }
}
export async function generateCounselorResponse(content: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content: "You are a supportive, licensed counselor. Help the user process their emotions and offer caring advice.",
      },
      { role: "user", content },
    ],
    max_tokens: 500,
    temperature: 0.7,
  });

  return response.choices[0].message.content || "I'm here for you.";
}

export async function generatePhilosopherResponse(content: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content: "You are a wise philosopher. Help the user think deeply about life, meaning, and truth.",
      },
      { role: "user", content },
    ],
    max_tokens: 500,
    temperature: 0.75,
  });

  return response.choices[0].message.content || "Let us reflect on this together.";
}
