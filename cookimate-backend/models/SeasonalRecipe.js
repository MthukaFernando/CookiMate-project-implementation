import mongoose from 'mongoose';

const RecipeSchema = new mongoose.Schema({
  id: {type: String, unique: true},
  name: {type: String, required: true},
  description: String,
  image: String,
  season: String,
  start_month: Number,
  start_day: Number,
  end_month: Number,
  end_day: Number
}, { strict: false }); // strict: false helps if your Atlas data has extra fields

// FORCE the collection name here
const SeasonalRecipe = mongoose.model('SeasonalRecipe', RecipeSchema, 'seasonal_recipes');

export default SeasonalRecipe;