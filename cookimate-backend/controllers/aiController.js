import Groq from "groq-sdk";
import { ALLOWLIST, FORBIDDEN_WORDS } from "./dictionary.js"; 

// Helper function to generate the image
async function generateRecipeImage(recipeTitle) {
  //Using hugging face key from .env
  const HF_TOKEN = process.env.HF_TOKEN;

  console.log("Generating AI Image for:", recipeTitle);
  const seed = Math.floor(Math.random() * 1000000);

  try {
    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0",
      {
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: `Gourmet food photography of ${recipeTitle}, 4k`,
          parameters: { seed: seed },
          options: { wait_for_model: true, use_cache: false },
        }),
      },
    );

    // Check for quota limits
    if (response.status === 402 || response.status === 429) {
      console.warn("⚠️ AI Quota reached for this month.");
      return "QUOTA_EXCEEDED";
    }

    if (!response.ok) {
      throw new Error(`HF Error: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return `data:image/jpeg;base64,${buffer.toString("base64")}`;
  } catch (error) {
    console.error("AI Generation Failed:", error.message);
    return "ERROR";
  }
}

// The "Culinary Firewall" function
function sanitizePrompt(userPrompt) {
  if (!userPrompt) return "";
  
  const lowerPrompt = userPrompt.toLowerCase();
  if (FORBIDDEN_WORDS.some(word => lowerPrompt.includes(word))) {
    return "INVALID_PROMPT";
  }

  // Check for jailbreak patterns
  const jailbreakPatterns = [
    /ignore.*instruction/i,
    /act as/i,
    /you are now/i,
    /system.*prompt/i,
    /new.*role/i,
    /bypass/i,
    /forget.*previous/i
  ];
  
  if (jailbreakPatterns.some(pattern => pattern.test(lowerPrompt))) {
    return "INVALID_PROMPT";
  }
    return filteredWords.join(" ");
}

// Main Controller Route
export const generateRecipeText = async (req, res) => {
  const { ingredients, cuisine, mealType, prompt } = req.body;

  try {
    // Using groq kwy from .env
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is missing from .env");
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    // A. Generate Recipe Text via Groq
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a Master Chef. Provide a recipe. The first line MUST be just the recipe title without any symbols.",
        },
        {
          role: "user",
          content: `Create a ${cuisine || ""} ${mealType || "dish"} using: ${ingredients?.join(", ")}. ${prompt || ""}`,
        },
      ],
      model: "llama-3.3-70b-versatile",
    });

    const recipeText = chatCompletion.choices[0].message.content;

    //Extract the title of the generated recipe
    const recipeTitle = recipeText.split("\n")[0].replace(/[#*]/g, "").trim();
    console.log("🍴 Recipe Created:", recipeTitle);

    //Generate Image using the Title
    const imageUri = await generateRecipeImage(recipeTitle);

    console.log("✅ Sending data to mobile app...");
    res.status(200).json({
      recipe: recipeText,
      image: imageUri,
    });
  } catch (error) {
    console.error("Master Route Error:", error);
    res
      .status(500)
      .json({ error: "The Chef is currently offline. Please try again." });
  }
};
