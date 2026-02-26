import Recipe from "../models/Recipe.js";
import SeasonalRecipe from "../models/SeasonalRecipe.js";

export const getAllRecipes = async (req, res) => {
  try {
    const { searchQuery, cuisine, meal, diet } = req.query;
    let query = {};

    // Search by name
    if (searchQuery) {
        query.name = {$regex: searchQuery, $options: 'i'};
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

    //Returns all recipes
    const recipes = await Recipe.find(query);
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRecipeById = async (req, res) => {
  try {
    // 1. Try to find in the main Recipe collection first
    let recipe = await Recipe.findOne({ id: req.params.id });

    // 2. If not found, search the SeasonalRecipe collection
    if (!recipe) {
      recipe = await SeasonalRecipe.findOne({ id: req.params.id });
    }

    // 3. If still not found, return 404
    if (!recipe) return res.status(404).json({ message: "Recipe not found in any collection" });

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