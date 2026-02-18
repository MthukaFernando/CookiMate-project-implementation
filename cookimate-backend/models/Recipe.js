import mongoose from 'mongoose';

const RecipeSchema = new mongoose.Schema({
  id: {type: String, unique: true},
  name: {type: String, required: true},
  description: String,
  ingredients_raw_str: [String],
  serving_size: String,
  servings: Number,
  cuisine: [String],
  totalTime: String,
  meal_type: [String],
  steps: [String],
  search_terms: [String],
  image: String,
  //The following fields are specific for the seasonal recipes
  season: String,
  start_month: Number,
  start_day: Number,
  end_month: Number,
  end_day: Number

}, {collection: 'recipes'});

export default mongoose.model('Recipe', RecipeSchema);