import express from 'express';
import { getAllRecipes, getRecipeById } from '../controllers/recipeController.js';

const router = express.Router();

//To get all recipes and search by filters
router.get('/', getAllRecipes);

//To get one specific recipe
router.get('/:id', getRecipeById);

export default router;