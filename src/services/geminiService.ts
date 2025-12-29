
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Level, LessonData } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

const lessonSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Title of the lesson" },
    emoji: { type: Type.STRING, description: "A single emoji representing the topic" },
    objective: { type: Type.STRING, description: "A short objective statement for the lesson." },
    explanation_es: { type: Type.STRING, description: "Detailed explanation in Spanish adapted to the CEFR level." },
    explanation_en: { type: Type.STRING, description: "Detailed explanation in English adapted to the CEFR level." },
    activeProduction: { type: Type.STRING, description: "A task for the user to write a sentence or paragraph using the learned concepts." },
    vocabulary: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          word: { type: Type.STRING },
          translation: { type: Type.STRING },
          example: { type: Type.STRING, description: "Example sentence using the word" }
        },
        required: ["word", "translation", "example"]
      },
      description: "List of 8-12 vocabulary items."
    },
    quiz: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          correctAnswer: { type: Type.STRING },
          explanation: { type: Type.STRING, description: "Brief explanation of why the answer is correct." }
        },
        required: ["question", "options", "correctAnswer", "explanation"]
      },
      description: "A quiz with 5-8 questions."
    }
  },
  required: ["title", "emoji", "objective", "explanation_es", "explanation_en", "activeProduction", "vocabulary", "quiz"]
};

export const generateLesson = async (level: Level, topic: string, age: number): Promise<LessonData> => {
  try {
    const isAdult = age >= 18;

    // Specific CEFR Guidelines
    const cefrGuidelines = `
    STRICTLY ADHERE TO THIS CEFR LEVEL: ${level}
    
    - If A1 (Beginner): Focus on introducing oneself, asking basic personal questions, everyday phrases. Speak slowly/simply.
    - If A2 (Pre-intermediate): Describe surroundings, family, routines. Simple terms.
    - If B1 (Intermediate): Travel topics, opinions, understanding main points of texts.
    - If B2 (Upper-intermediate): Fluent conversation, complex texts, wide range of subjects.
    - If C1 (Advanced): Social, academic, professional contexts. Fluent and spontaneous.
    - If C2 (Expert): Near-native command, complex structures, nuance.
    `;

    // --- ADULT PROMPT (Pro/SaaS Style) ---
    const adultSystemInstruction = `You are 'Pro English Coach', a sophisticated linguistics expert designed for career-focused adults.
    ${cefrGuidelines}
    
    Target Audience: Adult (Age ${age}).
    Tone: Professional, Concise, Encouraging, Practical.
    Style: Use a "SaaS Dashboard" or "Corporate Training" tone. Focus on real-world application (Business, Travel, Socializing).
    
    Structure:
    1. Concept Brief: Clear grammar rule or communication strategy.
    2. Key Vocabulary: 8-12 high-value words useful for professionals/travelers.
    3. Usage Scenarios: How to use this in a meeting, email, or trip.
    4. Assessment: A quiz checking for nuance and correctness.
    `;

    // --- KID PROMPT (Adventure/Gamified) ---
    const kidSystemInstruction = `You are 'Commander Nova' from the 'Inglés Genius Space Academy'.
    ${cefrGuidelines}
    
    Target Audience: Child (Age ${age}).
    Tone: Super energetic, Gamified, Emoji-rich 🚀🌟.
    Style: Use a "Space Adventure" theme. The user is a 'Cadet'. The lesson is a 'Mission'.
    
    Structure:
    1. Mission Briefing: Explain the concept using a space or adventure analogy.
    2. Gear (Vocabulary): 6-8 words. Keep definitions simple and fun.
    3. Fun Fact: A cool fact related to the topic or space.
    4. Flight Check (Quiz): Interactive questions to verify mission readiness.
    `;

    const prompt = `Create a complete English lesson about "${topic}".`;

    // Use gemini-2.0-flash for faster response and better quota limits
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: lessonSchema,
        systemInstruction: isAdult ? adultSystemInstruction : kidSystemInstruction,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No data returned from AI");

    return JSON.parse(text) as LessonData;
  } catch (error) {
    console.error("Error generating lesson:", error);
    throw error;
  }
};

export const getChatResponse = async (history: { role: string, parts: { text: string }[], image?: string }[], message: string, level: Level, attachment?: string): Promise<string> => {
  try {
    // Construct parts. If there is an attachment (base64), include it.
    const currentParts: any[] = [{ text: message }];

    if (attachment) {
      // Strip prefix if present (data:image/png;base64,)
      const base64Data = attachment.split(',')[1] || attachment;
      currentParts.unshift({
        inlineData: {
          mimeType: 'image/png',
          data: base64Data
        }
      });
    }

    // Map history for the API
    const formattedHistory = history.map(h => {
      const parts: any[] = h.parts; // Already {text: string}[]
      // If history items had images, we'd handle them here, but simplified for now
      return {
        role: h.role,
        parts: parts
      };
    });

    // Using gemini-2.0-flash for consistent experience
    const chat = ai.chats.create({
      model: 'gemini-2.0-flash',
      history: formattedHistory,
      config: {
        systemInstruction: `You are an English Tutor. User Level: ${level}.
        Adjust your vocabulary and grammar complexity strictly to this CEFR level.
        If A1/A2, use simple words. If C1/C2, use sophisticated language.
        If the user uploads an image, describe it in English suitable for their level and ask a question about it.`,
      }
    });

    const result = await chat.sendMessage({
      message: currentParts
    });
    return result.text || "Sorry, I didn't catch that.";
  } catch (error) {
    console.error("Chat error:", error);
    return "Connection error.";
  }
};

export const generateVeoVideo = async (imageBase64: string, prompt: string, aspectRatio: '16:9' | '9:16'): Promise<string> => {
  try {
    // Remove data URL prefix if present to get raw base64
    const cleanBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
    // Determine mime type from header if possible, default to PNG if only base64 provided without context, 
    // though in the app we usually have the full data URL.
    const mimeType = imageBase64.includes('image/jpeg') ? 'image/jpeg' : 'image/png';

    let operation = await ai.models.generateVideos({
      model: 'veo-2.0-generate-001', // Updated Model Name
      prompt: prompt || "Animate this image cinematically.",
      image: {
        imageBytes: cleanBase64,
        mimeType: mimeType,
      },
      config: {
        numberOfVideos: 1,
        // resolution: '720p', // Veo 2.0 might not need this explicitly
        // aspectRatio: aspectRatio // Check specific params for Veo 2.0
      }
    });

    // Poll until complete
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5 seconds
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) throw new Error("Video generation failed or returned no URI.");

    // Fetch the actual video bytes using the API key
    const videoResponse = await fetch(`${videoUri}&key=${import.meta.env.VITE_GEMINI_API_KEY}`);
    if (!videoResponse.ok) throw new Error("Failed to download video bytes.");

    const videoBlob = await videoResponse.blob();
    return URL.createObjectURL(videoBlob);

  } catch (error) {
    console.error("Veo generation error:", error);
    throw error;
  }
};
