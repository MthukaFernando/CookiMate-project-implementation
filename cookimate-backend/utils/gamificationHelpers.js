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
  // 1. Get ALL levels up to the current one to calculate what was required previously
  const allLevels = await GamificationLevel.find({ 
    levelNumber: { $lte: user.level } 
  }).sort({ levelNumber: 1 });

  const currentLevel = allLevels.find(l => l.levelNumber === user.level);
  if (!currentLevel) return;

  // 2. Calculate the Offset (Total requirements of all levels BEFORE the current one)
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

  // 3. Check if CURRENT stage progress meets the requirements
  // Logic: (Lifetime Total) - (Past Requirements) >= (Current Level Requirement)
  const isLevelComplete = 
    ((user.recipesCookedCount || 0) - offset.cookRecipes) >= reqs.cookRecipes &&
    ((user.favorites?.length || 0) - offset.saveFavorites) >= reqs.saveFavorites &&
    ((user.postsShared || 0) - offset.sharePosts) >= reqs.sharePosts &&
    ((user.likesReceived || 0) - offset.getLikes) >= reqs.getLikes &&
    ((user.aiGenerations || 0) - offset.useAIGenerator) >= reqs.useAIGenerator &&
    ((user.mealPlan?.length || 0) - offset.planMeals) >= (reqs.planMeals || 0);
      
  if (isLevelComplete) {
    user.level += 1;
    console.log(`🏆 SUCCESS: User promoted to Level ${user.level}`);
    
    // Recursive check: In case the user did enough to skip two levels at once
    await checkGamificationLevelUp(user); 
  }
};