import express from 'express';
import { getAllRecipes, getRecipeById, getSeasonalRecipes } from '../controllers/recipeController.js';

const router = express.Router();

// To get all recipes and search by filters
router.get('/', getAllRecipes);

//To get all the seasonal recipes
router.get('/seasonal', getSeasonalRecipes);

// To get one specific recipe
router.get('/:id', getRecipeById);

export default router;