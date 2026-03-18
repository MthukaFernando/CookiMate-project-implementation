import express from 'express';
import { getAllRecipes, getRecipeById, getSeasonalRecipes } from '../controllers/recipeController.js';
import { getRandomRecipes } from "../controllers/recipeController.js";
import { generateRecipeText } from '../controllers/aiController.js';

const router = express.Router();
//To get recomandded recips in the home page
router.get('/random', getRandomRecipes);

// To get all recipes and search by filters
router.get('/', getAllRecipes);

//To get all the seasonal recipes
router.get('/seasonal', getSeasonalRecipes);

// To get one specific recipe
router.get('/:id', getRecipeById);

router.post('/generate-text', generateRecipeText);

export default router;