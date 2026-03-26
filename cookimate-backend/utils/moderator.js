import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * @param {string} content
 * @returns {Promise<boolean>} //JSDoc comments
 */

export const checkText = async (content) => {
    console.log("Testing text for moderation:", content);
    try {
        if(!content || content.trim().length === 0) return false; //If the doesn't write anything, it's safe.

        const response = await openai.moderations.create ({
            model: "omni-moderation-latest",
            input: content,
        });

        return response.results[0].flagged; //Returns 'flagged' if safety guidelines are violated
    } catch (error) {
        console.error("Open AI Moderation Error:", error.message);
        return false; //If the api is down return safe
    }
};