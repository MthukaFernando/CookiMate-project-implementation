import Groq from "groq-sdk";
import pkg from "natural";
const { PorterStemmer } = pkg;
import {
  getDictionary,
  isDictionaryLoaded,
} from "../utils/dictionaryService.js";
import Recipe from "../models/Recipe.js";
import User from "../models/user.js";

// Cache for stemmed allowlist
let STEMMED_ALLOWLIST = null;
let ALLOWLIST = null;
let FORBIDDEN_WORDS = null;

export async function initDictionaryForController() {
  try {
    if (!isDictionaryLoaded()) {
      console.warn("⚠️ Dictionary not loaded yet, waiting...");
      return false;
    }

    const dict = getDictionary();
    ALLOWLIST = dict.allowlist;
    FORBIDDEN_WORDS = dict.forbiddenWords;
    STEMMED_ALLOWLIST = dict.stemmedAllowlist;
    console.log("✅ Dictionary loaded in aiController");
    return true;
  } catch (error) {
    console.error("Failed to load dictionary in aiController:", error);
    return false;
  }
}

// Helper function to generate the image
async function generateRecipeImage(recipeTitle) {
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

// Enhanced sanitization function
function sanitizeIngredient(ingredient, index) {
  // Wait for dictionary to load
  if (!ALLOWLIST || !FORBIDDEN_WORDS || !STEMMED_ALLOWLIST) {
    console.warn("Dictionary not loaded yet, using fallback sanitization");
    // Fallback: basic sanitization
    if (!ingredient || ingredient.length < 2) {
      return { valid: false, reason: "Invalid ingredient" };
    }
    return { valid: true, cleaned: ingredient.trim() };
  }

  if (!ingredient) return { valid: false, reason: "Empty ingredient" };

  const lowerIngredient = ingredient.toLowerCase();

  // Check for forbidden words
  for (const word of FORBIDDEN_WORDS) {
    if (lowerIngredient.includes(word)) {
      return {
        valid: false,
        reason: `Ingredient "${ingredient}" contains forbidden word: "${word}"`,
        ingredient,
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
        ingredient,
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
        ingredient,
      };
    }
  }

  return { valid: true, cleaned: ingredient.trim() };
}

// The "Culinary Firewall" function
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
          error:
            result.reason ||
            "Invalid ingredient detected. Please check your ingredients and try again.",
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
    // Check for API key
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is missing from .env");
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    // Generate Recipe Text via Groq
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

    const responseData = JSON.parse(chatCompletion.choices[0].message.content);

    if (
      !responseData.title ||
      !responseData.ingredients ||
      !responseData.instructions
    ) {
      throw new Error("Invalid recipe format received from AI");
    }

    const recipeText = `${responseData.title}\n\nIngredients:\n${responseData.ingredients.join("\n")}\n\nInstructions:\n${responseData.instructions.join("\n")}\n\nChef's Note: ${responseData.chef_note || "Enjoy your meal!"}`;

    const recipeTitle = responseData.title;
    console.log("🍴 Recipe Created:", recipeTitle);

    const imageUri = await generateRecipeImage(recipeTitle);

    console.log("✅ Sending data to mobile app...");
    res.status(200).json({
      recipe: recipeText,
      image: imageUri,
      title: recipeTitle,
    });
  } catch (error) {
    console.error("Master Route Error:", error);

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

// Save Generated Recipe (Updated with limit checking)
export const saveGeneratedRecipe = async (req, res) => {
  const { recipe, image, title, userId, cuisine, mealType, servings } =
    req.body;

  try {
    if (!recipe || !title) {
      return res.status(400).json({ error: "Missing required recipe data" });
    }

    if (!userId) {
      return res
        .status(401)
        .json({ error: "You must be logged in to save recipes" });
    }

    // Find the user first
    const user = await User.findOne({ firebaseUid: userId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check how many user-generated recipes this user already has
    const userGeneratedCount = await Recipe.countDocuments({
      generatedBy: user._id,
      isGenerated: true,
    });

    if (userGeneratedCount >= 5) {
      return res.status(400).json({
        error: "LIMIT_REACHED",
        message:
          "You have reached the limit of 5 generated recipes. Please delete one of your saved recipes to free up space and try again.",
      });
    }

    const lines = recipe.split("\n");
    let ingredients = [];
    let instructions = [];
    let chefNote = "";
    let currentSection = null;

    for (const line of lines) {
      if (line.toLowerCase().includes("ingredients:")) {
        currentSection = "ingredients";
        continue;
      } else if (line.toLowerCase().includes("instructions:")) {
        currentSection = "instructions";
        continue;
      } else if (line.toLowerCase().includes("chef's note:")) {
        currentSection = "note";
        continue;
      }

      if (
        currentSection === "ingredients" &&
        line.trim() &&
        !line.includes("Ingredients:")
      ) {
        ingredients.push(line.trim());
      } else if (
        currentSection === "instructions" &&
        line.trim() &&
        !line.includes("Instructions:")
      ) {
        instructions.push(line.trim());
      } else if (currentSection === "note" && line.trim()) {
        chefNote = line.trim();
      }
    }

    const recipeId = `generated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const searchTerms = [
      title.toLowerCase(),
      ...ingredients.map((ing) => ing.toLowerCase()),
      cuisine ? cuisine.toLowerCase() : null,
      mealType ? mealType.toLowerCase() : null,
    ].filter(Boolean);

    const newRecipe = {
      id: recipeId,
      name: title,
      description:
        chefNote || `A delicious ${title} recipe created just for you!`,
      image:
        image && image !== "QUOTA_EXCEEDED" && image !== "ERROR" ? image : null,
      ingredients_raw_str: ingredients,
      steps: instructions,
      cuisine: cuisine ? [cuisine] : ["Various"],
      meal_type: mealType ? [mealType.toLowerCase()] : ["dish"],
      totalTime: "Varies",
      servings: servings ? parseInt(servings) : 4,
      serving_size: "serving",
      search_terms: searchTerms,
      isGenerated: true,
      generatedBy: user._id, // Store MongoDB _id
    };

    // Check if recipe with same name already exists for this user
    const existingRecipe = await Recipe.findOne({
      name: title,
      isGenerated: true,
      generatedBy: user._id,
    });

    if (existingRecipe) {
      return res
        .status(400)
        .json({ error: "You already have a recipe with this name" });
    }

    const savedRecipe = await Recipe.create(newRecipe);

    // Add to user's favorites
    await User.findByIdAndUpdate(user._id, {
      $addToSet: { favorites: savedRecipe._id },
    });

    console.log(
      `✅ Recipe "${title}" saved and added to user ${userId}'s favorites (${userGeneratedCount + 1}/5 generated recipes)`,
    );

    res.status(201).json({
      success: true,
      message: "Recipe saved to your collection!",
      recipe: savedRecipe,
    });
  } catch (error) {
    console.error("Save Recipe Error:", error);
    res.status(500).json({ error: "Failed to save recipe. Please try again." });
  }
};

// Delete user-generated recipe
export const deleteUserGeneratedRecipe = async (req, res) => {
  const { recipeId, userId } = req.params;

  try {
    // Find the user
    const user = await User.findOne({ firebaseUid: userId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find the recipe and verify it belongs to this user
    const recipe = await Recipe.findOne({ id: recipeId });
    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    // Check if it's a user-generated recipe and belongs to this user
    if (
      !recipe.isGenerated ||
      recipe.generatedBy.toString() !== user._id.toString()
    ) {
      return res
        .status(403)
        .json({ error: "You can only delete your own generated recipes" });
    }

    // Remove from user's favorites if present
    await User.findByIdAndUpdate(user._id, {
      $pull: { favorites: recipe._id },
    });

    // Delete the recipe
    await Recipe.deleteOne({ _id: recipe._id });

    res.status(200).json({
      success: true,
      message: "Recipe deleted successfully",
    });
  } catch (error) {
    console.error("Delete Recipe Error:", error);
    res.status(500).json({ error: "Failed to delete recipe" });
  }
};

// Get user's generated recipes count
export const getUserGeneratedRecipesCount = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findOne({ firebaseUid: userId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const count = await Recipe.countDocuments({
      generatedBy: user._id,
      isGenerated: true,
    });

    res.status(200).json({ count });
  } catch (error) {
    console.error("Failed to get count:", error);
    res.status(500).json({ error: "Failed to get count" });
  }
};
