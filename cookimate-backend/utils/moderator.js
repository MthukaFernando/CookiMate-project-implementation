import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

console.log(
  "🔑 [MODERATOR] Checking API Key Status:",
  process.env.OPENAI_API_KEY ? "EXISTS" : "MISSING",
);

let openai;
try {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "dummy_key", // Prevent crash if missing
    timeout: 3000,
  });
} catch (e) {
  console.error("[MODERATOR] Initialization Crash:", e.message);
}

export const checkText = async (content) => {
  console.log("📡 [MODERATOR] Analyzing with Strict Rules:", content);

  // 1. Keep your local check for speed
  if (content.toLowerCase().includes("fuck")) return true;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a strict content moderator for a family-friendly cooking app. 

REJECT any text that:
- Contains sexual content, innuendos, or suggestive language.                 
- Expresses racism or sexism.
- Encourages/glorifies war or violence.
- Is a PERSONAL insult or uses profanity.

ALLOW/APPROVE:
- Honest opinions about food or recipes, even if negative (e.g., "This recipe is bad," "I hate this dish," "This tastes gross").

Respond with ONLY the word 'REJECTED' or 'APPROVED'.`,
        },
        { role: "user", content: content },
      ],
      max_tokens: 5,
      temperature: 0, // Makes it consistent
    });

    const result = response.choices[0].message.content.trim();
    console.log(`🛡️ [MODERATOR] AI Decision: ${result}`);

    return result === "REJECTED";
  } catch (error) {
    console.error("❌ [MODERATOR] AI Error:", error.message);
    return false;
  }
};
