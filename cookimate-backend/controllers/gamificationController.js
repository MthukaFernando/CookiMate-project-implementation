import User from "../models/user.js"; // CRITICAL: This was missing
import GamificationLevel from "../models/GamificationLevel.js";
import { updateUserStats } from "../utils/gamificationHelpers.js";

// Record a user action
export const recordAction = async (req, res) => {
  try {
    const { userId } = req.params;
    const { action } = req.body;

    const validActions = [
      'COOK_RECIPE', 'SAVE_FAVORITE', 'SHARE_POST', 'RECEIVE_LIKE',
      'USE_AI', 'PLAN_MEAL', 'DAILY_LOGIN'
    ];

    if (!validActions.includes(action)) {
      return res.status(400).json({ message: "Invalid action" });
    }

    // This now returns the updated USER object
    const user = await updateUserStats(userId, action);
    
    // Get current level details
    const gamificationLevel = await GamificationLevel.findOne({
      levelNumber: user.level
    });
    
    res.status(200).json({
      message: "Action recorded successfully",
      currentLevel: user.level,
      levelName: gamificationLevel?.levelName || "Rookie",
      stats: {
        recipesCooked: user.recipesCookedCount,
        favoritesSaved: user.favorites?.length || 0,
        postsShared: user.postsShared || 0,
        likesReceived: user.likesReceived || 0,
        aiGenerations: user.aiGenerations || 0,
        mealsPlanned: user.mealPlan?.length || 0
      }
    });
  } catch (error) {
    console.error("Record Action Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get user's complete progress dashboard
export const getUserDashboard = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    //Get ALL levels up to the user's current level
    const allLevels = await GamificationLevel.find({ 
      levelNumber: { $lte: user.level } 
    }).sort({ levelNumber: 1 });

    const currentLevel = allLevels.find(l => l.levelNumber === user.level);
    
    //Ensure level 2 starts at 0
    const offset = {
      cookRecipes: 0,
      saveFavorites: 0,
      sharePosts: 0,
      getLikes: 0,
      useAIGenerator: 0,
      planMeals: 0
    };

    allLevels.forEach(lvl => {
      if (lvl.levelNumber < user.level) {
        offset.cookRecipes += lvl.requirements.cookRecipes || 0;
        offset.saveFavorites += lvl.requirements.saveFavorites || 0;
        offset.sharePosts += lvl.requirements.sharePosts || 0;
        offset.getLikes += lvl.requirements.getLikes || 0;
        offset.useAIGenerator += lvl.requirements.useAIGenerator || 0;
        offset.planMeals += lvl.requirements.planMeals || 0;
      }
    });

    const reqs = currentLevel.requirements;
    const stats = {
      recipesCooked: Math.max(0, (user.recipesCookedCount || 0) - offset.cookRecipes),
      favoritesSaved: Math.max(0, (user.favorites?.length || 0) - offset.saveFavorites),
      postsShared: Math.max(0, (user.postsShared || 0) - offset.sharePosts),
      likesReceived: Math.max(0, (user.likesReceived || 0) - offset.getLikes),
      aiGenerations: Math.max(0, (user.aiGenerations || 0) - offset.useAIGenerator),
      mealsPlanned: Math.max(0, (user.mealPlan?.length || 0) - offset.planMeals)
    };

    // Capping the stats requirements
    stats.recipesCooked = Math.min(stats.recipesCooked, reqs.cookRecipes || Infinity);
    stats.favoritesSaved = Math.min(stats.favoritesSaved, reqs.saveFavorites || Infinity);


    res.status(200).json({
      currentLevels: { gamification: currentLevel },
      stats: stats,
      userLevel: user.level 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all available levels
export const getAllGamificationLevels = async (req, res) => {
  try {
    const levels = await GamificationLevel.find().sort({ levelNumber: 1 });
    res.status(200).json(levels);
  } catch (error) {
    console.error("Error fetching all levels:", error);
    res.status(500).json({ message: error.message });
  }
};