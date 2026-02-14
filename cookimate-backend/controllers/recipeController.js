import Recipe from "../models/Recipe.js";

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

    // Find all recipes where the current date falls between the start and end ranges
    const recipes = await Recipe.find({
      $and: [
        { start_month: { $lte: currentMonth } },
        { end_month: { $gte: currentMonth } },
        { start_day: { $lte: currentDay } },
        { end_day: { $gte: currentDay } }
      ]
    });

    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: "Seasonal Fetch Error: " + error.message });
  }
};