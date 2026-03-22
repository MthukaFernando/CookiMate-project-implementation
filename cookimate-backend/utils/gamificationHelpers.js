import User from "../models/user.js";
import GamificationLevel from "../models/GamificationLevel.js";

// Points for different actions (If you want to store these on the User model)
export const getPointsForAction = (action) => {
  const pointsMap = {
    'COOK_RECIPE': 10,
    'SAVE_FAVORITE': 5,
    'SHARE_POST': 15,
    'RECEIVE_LIKE': 2,
    'USE_AI': 20,
    'PLAN_MEAL': 30,
    'DAILY_LOGIN': 5
  };
  return pointsMap[action] || 0;
};

export const updateUserStats = async (userId, action, increment = 1) => {
  try {
    // 1. Find the USER directly
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    // 2. Get requirements for the user's CURRENT level
    const currentLevelData = await GamificationLevel.findOne({
      levelNumber: user.level 
    });

    // Map actions to the fields in your User.js
    const statMap = {
      'COOK_RECIPE': 'recipesCookedCount', 
      'SAVE_FAVORITE': 'favorites',       
      'SHARE_POST': 'postsShared',        
      'RECEIVE_LIKE': 'likesReceived',    
      'USE_AI': 'aiGenerations',
      'PLAN_MEAL': 'mealPlan'             
    };

    const statField = statMap[action];
    
    // 3. Increment logic
    if (statField) {
      // If it's a number field (like recipesCookedCount), increment it
      if (typeof user[statField] === 'number') {
        user[statField] += increment;
      }
      // Note: Arrays like 'favorites' and 'mealPlan' update their length automatically 
      // when you add items elsewhere in your app, so we don't 'increment' them here.
    }

    // 4. Update points (optional, since you have a 'points' field in User.js)
    user.points += getPointsForAction(action) * increment;

    // 5. Run the Level Up check
    await checkGamificationLevelUp(user);

    await user.save();
    return user;
  } catch (error) {
    console.error("Gamification Error:", error);
    throw error;
  }
};

const checkGamificationLevelUp = async (user) => {
  const nextLevelNumber = user.level + 1;
  const nextLevel = await GamificationLevel.findOne({ levelNumber: nextLevelNumber });

  if (!nextLevel) return; // Already at Max Level

  const previousLevels = await GamificationLevel.find({ 
    levelNumber: { $lte: user.level } 
  }).sort({ levelNumber: 1 });

  const offset = {
    cookRecipes: 0, saveFavorites: 0, sharePosts: 0,
    getLikes: 0, useAIGenerator: 0, planMeals: 0
  };

  previousLevels.forEach(lvl => {
    offset.cookRecipes += lvl.requirements.cookRecipes || 0;
    offset.saveFavorites += lvl.requirements.saveFavorites || 0;
    offset.sharePosts += lvl.requirements.sharePosts || 0;
    offset.getLikes += lvl.requirements.getLikes || 0;
    offset.useAIGenerator += lvl.requirements.useAIGenerator || 0;
    offset.planMeals += lvl.requirements.planMeals || 0;
  });

  const currentLevelData = previousLevels.find(l => l.levelNumber === user.level);
  if (!currentLevelData) return;
  
  const reqs = currentLevelData.requirements;

  // Check if current stage requirements are met
  const isLevelComplete = 
    ((user.recipesCookedCount || 0) - (offset.cookRecipes - reqs.cookRecipes)) >= reqs.cookRecipes &&
    ((user.favorites?.length || 0) - (offset.saveFavorites - reqs.saveFavorites)) >= reqs.saveFavorites &&
    ((user.postsShared || 0) - (offset.sharePosts - reqs.sharePosts)) >= reqs.sharePosts &&
    ((user.likesReceived || 0) - (offset.getLikes - reqs.getLikes)) >= reqs.getLikes &&
    ((user.aiGenerations || 0) - (offset.useAIGenerator - reqs.useAIGenerator)) >= reqs.useAIGenerator &&
    ((user.mealPlan?.length || 0) - (offset.planMeals - (reqs.planMeals || 0))) >= (reqs.planMeals || 0);
      
  if (isLevelComplete) {
    user.level += 1;
    console.log(`🏆 Level Up! User is now Level ${user.level}`);
    
    // Recursive call to check if they meet the NEXT level's requirements too
    await checkGamificationLevelUp(user); 
  }
};