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
          content: `You are a moderator for a cooking app. 

REJECT any text that:
- Contains sexual content, innuendos, or suggestive language.                 
- Expresses racism, sexism, or hate speech.
- Encourages or glorifies war or violence.
- Is a personal insult to another user or uses profanity.

ALLOW/APPROVE:
- Enthusiasm and internet slang (e.g., "omg", "looovvveee", "yesss", "yummm!!").
- Positive feedback about food.
- Negative opinions about recipes (e.g., "this tasted bad").

Respond with ONLY 'REJECTED' or 'APPROVED'.`,
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
