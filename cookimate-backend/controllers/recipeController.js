import Recipe from "../models/Recipe.js";
import SeasonalRecipe from "../models/SeasonalRecipe.js";

export const getAllRecipes = async (req, res) => {
  try {
    const { searchQuery, cuisine, meal, diet, time } = req.query;
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

    //Filter by Time
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
          const firstNum = timeStr.match(/\d+/);
          if (firstNum) totalMinutes = parseInt(firstNum[0]);
        }

        // Logical comparisons
        let isMatch = false;
        if (timeLimit === 15) isMatch = totalMinutes <= 15;
        else if (timeLimit === 30) isMatch = totalMinutes > 15 && totalMinutes <= 30;
        else if (timeLimit === 60) isMatch = totalMinutes > 30 && totalMinutes <= 60;
        else isMatch = true;

        return isMatch;
      });
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

    const recipes = await SeasonalRecipe.find({
      $or: [
        {  //Checks if the current month is between the start month and end month
          start_month: { $lt: currentMonth }, 
          end_month: { $gt: currentMonth } 
        },
        { // If the current month is the start month, it verifies if the current day is less than or equal to the start day and verifiex if the end date is in the current month or different month
          start_month: currentMonth, 
          start_day: { $lte: currentDay },
          $or: [
            { end_month: { $gt: currentMonth } },
            { end_month: currentMonth, end_day: { $gte: currentDay } }
          ]
        },
        { //If the current month is the end month, verifies if the current date end date is greater than the current day
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
    // get 3 random recipes from Recipe collection
    const recipes = await Recipe.aggregate([
      { $sample: { size: 5 } }
    ]);

    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};