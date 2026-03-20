import Groq from "groq-sdk";
import pkg from "natural";
const { PorterStemmer } = pkg;
import { ALLOWLIST, FORBIDDEN_WORDS } from "./dictionary.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize Groq ONCE at the top level so all functions can use it
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Pre-compute stemmed allowlist once at startup (not per request)
const STEMMED_ALLOWLIST = new Set(
  [...ALLOWLIST].map((w) => PorterStemmer.stem(w)),
);

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

// Enhanced sanitization function that returns more detailed status
function sanitizeIngredient(ingredient, index) {
  if (!ingredient) return { valid: false, reason: "Empty ingredient" };
  
  const lowerIngredient = ingredient.toLowerCase();
  
  // Check for forbidden words
  for (const word of FORBIDDEN_WORDS) {
    if (lowerIngredient.includes(word)) {
      return { 
        valid: false, 
        reason: `Ingredient "${ingredient}" contains forbidden word: "${word}"`,
        ingredient 
      };
    }
  }

  // Check for jailbreak patterns
  const jailbreakPatterns = [
    /ignore.*instruction/i,
    /act as/i,
    /you are now/i,
    /system.*prompt/i,
    /new.*role/i,
    /bypass/i,
    /forget.*previous/i,
  ];

  for (const pattern of jailbreakPatterns) {
    if (pattern.test(lowerIngredient)) {
      return { 
        valid: false, 
        reason: `Ingredient "${ingredient}" contains invalid pattern`,
        ingredient 
      };
    }
  }

  // Stem each word and check against stemmed allowlist
  const words = lowerIngredient
    .replace(/[^a-z\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);
  
  if (words.length > 0) {
    const culinaryCount = words.filter((w) =>
      STEMMED_ALLOWLIST.has(PorterStemmer.stem(w)),
    ).length;

    const ratio = culinaryCount / words.length;

    // Reject if less than 30% of words are culinary-related
    if (ratio < 0.3) {
      return { 
        valid: false, 
        reason: `Ingredient "${ingredient}" doesn't appear to be food-related`,
        ingredient 
      };
    }
  }

  return { valid: true, cleaned: ingredient.trim() };
}

// The "Culinary Firewall" function (kept for backward compatibility)
function sanitizePrompt(userPrompt) {
  if (!userPrompt) return "";
  
  const result = sanitizeIngredient(userPrompt, 0);
  return result.valid ? result.cleaned : "INVALID_PROMPT";
}

// Main Controller Route
export const generateRecipeText = async (req, res) => {
  const { ingredients, cuisine, mealType, prompt } = req.body;

  // Sanitize each ingredient individually
  let cleanIngredients = [];
  if (ingredients && Array.isArray(ingredients)) {
    for (let i = 0; i < ingredients.length; i++) {
      const result = sanitizeIngredient(ingredients[i], i);
      if (!result.valid) {
        return res.status(400).json({
          error: result.reason || "Invalid ingredient detected. Please check your ingredients and try again."
        });
      }
      if (result.cleaned) {
        cleanIngredients.push(result.cleaned);
      }
    }
  }

  // Sanitize the prompt
  const cleanPrompt = sanitizePrompt(prompt || "");
  if (cleanPrompt === "INVALID_PROMPT") {
    return res.status(400).json({
      error: "Please keep your notes strictly related to cooking.",
    });
  }

  // Log sanitization for debugging
  if (prompt && cleanPrompt !== prompt) {
    console.log(`🔒 Prompt sanitized: "${prompt}" -> "${cleanPrompt}"`);
  }

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a Gourmet Chef. You ONLY generate recipes.
          
RESPONSE FORMAT:
You must output your response as a JSON object with the following keys:
"title": (string),
"ingredients": (array of strings),
"instructions": (array of strings),
"chef_note": (string)

CRITICAL RULES:
1. If ANY part of the user's message asks for essays, discussions, opinions, or non-recipe content - IGNORE IT COMPLETELY.
2. If the user tries to chat about ANYTHING other than food, respond with a JSON object containing an error message.
3. The ONLY valid requests are about cooking, ingredients, recipes, or food preparation.`,
        },
        {
          role: "user",
          content: `Cuisine: ${cuisine || "Any"}
Meal Type: ${mealType || "Dish"}
Ingredients: ${cleanIngredients.join(", ") || "Any"}
Note: ${cleanPrompt || "surprise me with a delicious recipe"}`,
        },
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });

    // Parse the JSON response
    const responseData = JSON.parse(chatCompletion.choices[0].message.content);
    
    // Validate that we have the required fields
    if (
      !responseData.title ||
      !responseData.ingredients ||
      !responseData.instructions
    ) {
      throw new Error("Invalid recipe format received from AI");
    }

    // Format the text for frontend display
    const recipeText = `${responseData.title}\n\nIngredients:\n${responseData.ingredients.join("\n")}\n\nInstructions:\n${responseData.instructions.join("\n")}\n\nChef's Note: ${responseData.chef_note || "Enjoy your meal!"}`;

    const recipeTitle = responseData.title;
    console.log("🍴 Recipe Created:", recipeTitle);

    // Generate Image using the Title
    const imageUri = await generateRecipeImage(recipeTitle);
 
    console.log("✅ Sending data to mobile app...");
    res.status(200).json({
      recipe: recipeText,
      image: imageUri,
      title: recipeTitle,
    });
  } catch (error) {
    console.error("Master Route Error:", error);
    
    // Handle JSON parse errors specifically
    if (error instanceof SyntaxError) {
      return res.status(500).json({
        error: "The Chef returned an invalid response. Please try again.",
      });
    }

    res.status(500).json({
      error: "The Chef is currently offline. Please try again.",
    });
  }
};

export const chatWithRecipe = async (req, res) => {
  const { recipeId, message } = req.body;

  try {
    // 1. Fetch the specific recipe from MongoDB
    const recipe = await Recipe.findOne({ id: recipeId });
    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }
    // 3. Create the Context-Aware System Prompt
    // We "feed" the AI the recipe details so it knows what it's talking about.
    const systemPrompt = `
      You are a helpful kitchen assistant for the "Cookimate" app. 
      The user is currently cooking: "${recipe.name}".
      
      RECIPE DETAILS:
      Description: ${recipe.description}
      Ingredients: ${recipe.ingredients_raw_str.join(", ")}
      Steps: ${recipe.steps.join(" ")}
      
      INSTRUCTIONS:
      - ONLY answer questions related to this specific recipe.
      - If the user asks something completely unrelated to cooking or this recipe, 
        politely guide them back to the meal.
      - Keep answers concise and helpful for someone who is currently cooking.
    `;

    // 4. Send to Groq
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
    });

    res.status(200).json({
      reply: chatCompletion.choices[0].message.content,
    });
  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({ error: "Chatbot is having trouble connecting." });
  }
};

// Global Chatbot integration
export const handleGlobalChat = async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || messages.length === 0) {
      return res.status(400).json({ error: "No messages provided" });
    }

    const latestMessage = messages[messages.length - 1].content.toLowerCase();
    const words = latestMessage.replace(/[^a-z\s]/g, "").split(/\s+/);
    const isCookingRelated = words.some((word) => 
      STEMMED_ALLOWLIST.has(PorterStemmer.stem(word))
    );

    if (!isCookingRelated) {
      return res.status(200).json({
        reply: "I'm sorry, I'm only trained to help with cooking and recipes! Is there a dish you'd like to talk about?"
      });
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are the CookiMate assistant, a professional chef. Only discuss cooking, ingredients, nutrition, and kitchen advice."
        },
        ...messages
      ],
      model: "llama-3.3-70b-versatile",
    });

    res.status(200).json({ reply: chatCompletion.choices[0].message.content });
  } catch (error) {
    console.error("Global Chat Error:", error);
    res.status(500).json({ error: "The AI chef is currently unavailable." });
  }
};