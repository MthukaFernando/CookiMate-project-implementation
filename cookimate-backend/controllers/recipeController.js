import Recipe from "../models/Recipe.js";
import SeasonalRecipe from "../models/SeasonalRecipe.js";

export const getAllRecipes = async (req, res) => {
  try {
    const { searchQuery, cuisine, meal, diet, time } = req.query;
    let query = {};

    // 1. Search Query Logic
    if (searchQuery && searchQuery.trim() !== "") {
      query.name = { $regex: searchQuery, $options: 'i' };
    }

    // 2. Meal Filter
    if (meal && meal !== 'All') {
      query.meal_type = meal.toLowerCase();
    }

    // 3. Cuisine Filter
    if (cuisine && cuisine !== 'All') {
      query.cuisine = cuisine; 
    }

    // 4. Diet Filter
    if (diet && diet !== 'All') {
      query.search_terms = diet.toLowerCase();
    }

    // 5. Time Filter Logic
    if (time && time !== 'All') {
      if (time === "15") {
        // Strict range: 1 to 15
        query.totalTime = { $regex: /^([1-9]|1[0-4]|15)\s*minutes/i };
      } 
      else if (time === "30") {
        // Strict range: 15 to 30
        query.totalTime = { $regex: /^(1[5-9]|2[0-9]|30)\s*minutes/i };
      } 
      else if (time === "60") {
        // Strict range: 30 to 60
        query.totalTime = { $regex: /^(3[1-9]|[4-5][0-9]|60)\s*minutes/i };
      }
    }

    const recipes = await Recipe.find(query);
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findOne({ id: req.params.id });

    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    res.json(recipe);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSeasonalRecipes = async (req, res) => {
  try {
    const today = new Date();
    const currentMonth = today.getUTCMonth() + 1; 
    const currentDay = today.getUTCDate();

    console.log(`Filtering for: Month ${currentMonth}, Day ${currentDay}`);

    // This looks for recipes where today's date falls within the start/end range
    const recipes = await SeasonalRecipe.find({
      $and: [
        { start_month: { $lte: currentMonth } },
        { end_month: { $gte: currentMonth } },
        { start_day: { $lte: currentDay } },
        { end_day: { $gte: currentDay } }
      ]
    });

    console.log("Filtered Seasonal Recipes found:", recipes.length);
    res.json(recipes);
  } catch (error) {
    console.error("Seasonal Fetch Error:", error.message);
    res.status(500).json({ message: "Seasonal Fetch Error: " + error.message });
  }
};