import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. Initialize the AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const cookingModel = genAI.getGenerativeModel({
  model: "gemini-3-flash-preview",
  systemInstruction:
    "You are a professional chef assistant. You only answer questions about cooking, recipes, and food. You can generate recipes based on leftover ingredients. You must also respect any dietary restrictions the user gives you. If the user asks about anything else, politely tell them you only know about the kitchen.",
});

export default cookingModel;
