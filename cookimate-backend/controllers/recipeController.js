import Recipe from "../models/Recipe.js";

export const getAllRecipes = async (req, res) => {
  try {
    //Filtering based on cuisine and meal type
    const { cuisine, meal } = req.query;
    let query = {};

    if (cuisine) query.cuisine = cuisine;
    if (meal) query.meal_type = meal;

    //Returns all recipes
    const recipes = await Recipe.find();
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
