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
  isGenerated: {type: Boolean, default: false}, 
  generatedBy: {type: String, ref: "User"}
}, {collection: 'recipes'});

// Check if model exists before creating
const Recipe = mongoose.models.Recipe || mongoose.model("Recipe", RecipeSchema);

export default Recipe;