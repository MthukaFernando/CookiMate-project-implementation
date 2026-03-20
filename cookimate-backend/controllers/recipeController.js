import mongoose from "mongoose";
import Recipe from "../models/Recipe.js";
import SeasonalRecipe from "../models/SeasonalRecipe.js";

export const getAllRecipes = async (req, res) => {
  try {
    const { searchQuery, cuisine, meal, diet, time } = req.query;
    let query = {};

    // Search by name
    if (searchQuery) {
      query.name = { $regex: searchQuery, $options: 'i' };
    }

    // Filter by Meal Type
    if (meal && meal !== 'All') {
      query.meal_type = meal.toLowerCase();
    }

    // Filter by Cuisine
    if (cuisine && cuisine !== 'All') {
      query.cuisine = cuisine;
    }

    // Filter by Diet
    if (diet && diet !== 'All') {
      query.search_terms = diet.toLowerCase();
    }

    //Filter by Time
    let recipes = await Recipe.find(query);

    if (time && time !== 'All') {
      const timeLimit = parseInt(time);

      recipes = recipes.filter((recipe) => {
        if (!recipe.totalTime) return false;

        const timeStr = recipe.totalTime.toLowerCase();
        let totalMinutes = 0;

        // Parse Hours
        const hourMatch = timeStr.match(/(\d+)\s*h/);
        if (hourMatch) totalMinutes += parseInt(hourMatch[1]) * 60;

        // Parse Minutes
        const minMatch = timeStr.match(/(\d+)\s*m/);
        if (minMatch) {
          totalMinutes += parseInt(minMatch[1]);
        } else if (!hourMatch) {
          const fallbackMatch = timeStr.match(/\d+/);
          if (fallbackMatch) totalMinutes = parseInt(fallbackMatch[0]);
        }

        // Apply Range Buckets
        if (timeLimit === 15) return totalMinutes <= 15;
        if (timeLimit === 30) return totalMinutes > 15 && totalMinutes <= 30;
        if (timeLimit === 60) return totalMinutes > 30 && totalMinutes <= 60;
        
        return true; 
      });
    }

    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRecipeById = async (req, res) => {
  try {
    const { id } = req.params;
    let recipe = null;

    // Check 1: valid MongoDB ObjectId? (Used by Completed History)
    if (mongoose.Types.ObjectId.isValid(id)) {
      recipe = await Recipe.findById(id);
      if (!recipe) recipe = await SeasonalRecipe.findById(id);
    }

    // Check 2: If not found, search the custom "id" field (Used by Home/Search page)
    if (!recipe) {
      recipe = await Recipe.findOne({ id: id });
      if (!recipe) recipe = await SeasonalRecipe.findOne({ id: id });
    }

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    res.json(recipe);
  } catch (error) {
    console.error("Error fetching recipe:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getSeasonalRecipes = async (req, res) => {
  try {
    const today = new Date();
    const currentMonth = today.getUTCMonth() + 1; 
    const currentDay = today.getUTCDate();

    const recipes = await SeasonalRecipe.find({
      $or: [
        { start_month: { $lt: currentMonth }, end_month: { $gt: currentMonth } },
        { 
          start_month: currentMonth, 
          start_day: { $lte: currentDay },
          $or: [
            { end_month: { $gt: currentMonth } },
            { end_month: currentMonth, end_day: { $gte: currentDay } }
          ]
        },
        { 
          end_month: currentMonth, 
          end_day: { $gte: currentDay },
          start_month: { $lt: currentMonth }
        }
      ]
    });
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: "Seasonal Fetch Error: " + error.message });
  }
};

export const getRandomRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.aggregate([{ $sample: { size: 5 } }]);
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};