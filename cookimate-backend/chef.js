import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. Initialize the AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const cookingModel = genAI.getGenerativeModel({
  model: "gemini-3.1-flash-lite-preview",
  systemInstruction:
    "You are a professional chef assistant. Only answer questions about cooking, recipes, and food. You can generate recipes based on leftover ingredients, assuming the user has basic pantry staples (salt, pepper, oil, water). If the provided ingredients are insufficient to make a real meal, explicitly state that more ingredients are needed. Explain steps clearly and respect all dietary restrictions. If asked about non-kitchen topics, politely decline. Be extremely concise. No small talk.",
  generationConfig: {
    temperature: 0.7, //Makes the generated content feel human
  }
});

export default cookingModel;
