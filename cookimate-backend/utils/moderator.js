import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

console.log("🔑 [MODERATOR] Checking API Key Status:", process.env.OPENAI_API_KEY ? "EXISTS" : "MISSING");

let openai;
try {
    openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY || "dummy_key", // Prevent crash if missing
        timeout: 3000
    });
} catch (e) {
    console.error("[MODERATOR] Initialization Crash:", e.message);
}

export const checkText = async (content) => {
    console.log("📡 [MODERATOR] Analyzing:", content);
    

    if (content.toLowerCase().includes("fuck")) {
        console.log("[MODERATOR] REJECTED (Local)");
        return true;
    }

    try {
        if (!process.env.OPENAI_API_KEY) {
            console.warn("⚠️ [MODERATOR] No API Key - Skipping AI check");
            return false;
        }

        const response = await openai.moderations.create({
            model: "omni-moderation-latest",
            input: content,
        });

        const flagged = response.results[0].flagged;
        console.log("🛡️ [MODERATOR] OpenAI Flagged:", flagged);
        return flagged;

    } catch (error) {
        console.error("❌ [MODERATOR] API Error:", error.message);
        return false; 
    }
};