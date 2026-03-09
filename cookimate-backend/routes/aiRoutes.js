import express from 'express';
import cookingModel from '../chef.js';

const router = express.Router();

router.post('/ask', async (req, res) => {
  try {
    const { message, diet, ingredients } = req.body;

    // Construct the prompt
    const prompt = `
      Dietary Restrictions: ${diet || "None"}
      Leftover Ingredients: ${ingredients || "None"}
      User Request: ${message || "Please suggest a recipe."}
    `;

    
    const result = await cookingModel.generateContent(prompt);
    const chefReply = result.response.text();

    res.json({ reply: chefReply });

  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ 
      reply: "The kitchen is a bit overwhelmed! Try again in a second.",
      error: error.message 
    });
  }
});

export default router;