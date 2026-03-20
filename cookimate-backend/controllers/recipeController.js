import Recipe from "../models/Recipe.js";
import SeasonalRecipe from "../models/SeasonalRecipe.js";
import User from "../models/user.js"; // Add this import

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
    let recipe = await Recipe.findOne({ id: req.params.id });
    if (!recipe) recipe = await SeasonalRecipe.findOne({ id: req.params.id });
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

export const deleteGeneratedRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body; // Firebase UID of the user making the request

    if (!userId) {
      return res.status(400).json({ 
        message: "User ID is required" 
      });
    }

    // Find the recipe using the custom 'id' field (not MongoDB _id)
    const recipe = await Recipe.findOne({ id: id });
    
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    // Check if it's a generated recipe
    if (!recipe.isGenerated) {
      return res.status(403).json({ 
        message: "Only generated recipes can be deleted" 
      });
    }

    // Check if the user is the one who generated this recipe
    if (recipe.generatedBy !== userId) {
      return res.status(403).json({ 
        message: "You can only delete recipes you generated" 
      });
    }

    // Find the user by their Firebase UID
    const user = await User.findOne({ firebaseUid: userId });
    
    if (user) {
      // Remove the recipe from user's favorites using the custom 'id' field
      // Assuming favorites array contains objects with an 'id' property
      user.favorites = user.favorites.filter(fav => fav.id !== id);
      await user.save();
    }

    // Delete the recipe using the custom 'id' field
    await Recipe.deleteOne({ id: id });

    res.status(200).json({ 
      success: true, 
      message: "Recipe deleted successfully" 
    });
  } catch (error) {
    console.error("Delete Recipe Error:", error);
    res.status(500).json({ 
      message: error.message,
      success: false 
    });
  }
};