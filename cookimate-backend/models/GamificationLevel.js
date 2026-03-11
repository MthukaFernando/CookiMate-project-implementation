import mongoose from "mongoose";

// This is for your NEW gamification levels (Rookie Cook, etc.)
const gamificationLevelSchema = new mongoose.Schema({
  levelNumber: {
    type: Number,
    required: true,
    unique: true
  },
  levelName: {
    type: String,
    required: true
  },
  minPoints: {
    type: Number,
    required: true
  },
  maxPoints: {
    type: Number,
    required: true
  },
  requirements: {
    cookRecipes: { type: Number, default: 0 },
    saveFavorites: { type: Number, default: 0 },
    shareRecipes: { type: Number, default: 0 },
    getLikes: { type: Number, default: 0 },
    useAIGenerator: { type: Number, default: 0 },
    fixErrors: { type: Number, default: 0 },
    weeklyMealPlans: { type: Number, default: 0 },
    followers: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    dailyChallenges: { type: Number, default: 0 },
    recipePhotos: { type: Number, default: 0 },
    helpUsers: { type: Number, default: 0 }
  },
  badge: {
    imageUrl: { type: String, default: "" },
    description: { type: String, default: "" }
  }
}, { timestamps: true });

const GamificationLevel = mongoose.model("GamificationLevel", gamificationLevelSchema);
export default GamificationLevel;