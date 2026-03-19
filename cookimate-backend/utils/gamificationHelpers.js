import GamificationLevel from "../models/GamificationLevel.js";
import Level from "../models/levels.js"; // Simple levels
import UserProgress from "../models/UserProgress.js";

// Points for different actions
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

// Update both level types
export const updateUserStats = async (userId, action, increment = 1) => {
  try {
    const progress = await UserProgress.findOne({ user: userId });
    if (!progress) throw new Error("User progress not found");

    // Map action to stat field
    const statMap = {
      'COOK_RECIPE': 'recipesCooked',
      'SAVE_FAVORITE': 'favoritesSaved',
      'SHARE_POST': 'postsShared',
      'RECEIVE_LIKE': 'likesReceived',
      'USE_AI': 'aiGenerations',
      'PLAN_MEAL': 'mealsPlanned'
    };

    // Update the stat
    if (statMap[action]) {
      progress.stats[statMap[action]] += increment;
    }

    // Add points to BOTH systems
    const pointsEarned = getPointsForAction(action) * increment;
    progress.simpleLevelPoints += pointsEarned; // For simple levels (Novice Chef, etc.)
    progress.gamificationPoints += pointsEarned; // For gamification levels (Rookie Cook, etc.)
    progress.lastActivity = new Date();

    // Update streak if it's a daily login
    if (action === 'DAILY_LOGIN') {
      await updateStreak(progress);
    }

    // Check for level ups in BOTH systems
    await checkSimpleLevelUp(progress);
    await checkGamificationLevelUp(progress);

    await progress.save();
    return progress;
  } catch (error) {
    throw error;
  }
};

// Update streak
const updateStreak = async (progress) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastActivity = new Date(progress.lastActivity);
  lastActivity.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil((today - lastActivity) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    // Consecutive day
    progress.stats.currentStreak += 1;
    // Update longest streak if needed
    if (progress.stats.currentStreak > progress.stats.longestStreak) {
      progress.stats.longestStreak = progress.stats.currentStreak;
    }
  } else if (diffDays > 1) {
    // Streak broken
    progress.stats.currentStreak = 1;
  }
};

// Check if simple level (Novice Chef, etc.) should increase
const checkSimpleLevelUp = async (progress) => {
  const currentSimpleLevel = await Level.findById(progress.simpleLevel);
  
  // Find next simple level
  const nextSimpleLevel = await Level.findOne({ 
    level: currentSimpleLevel.level + 1 
  });

  if (nextSimpleLevel && progress.simpleLevelPoints >= nextSimpleLevel.pointsRequired) {
    progress.simpleLevel = nextSimpleLevel._id;
    
    // Add achievement
    progress.achievements.push({
      name: `Reached ${nextSimpleLevel.title}`,
      earnedAt: new Date(),
      description: nextSimpleLevel.description
    });
  }
};

// Check if gamification level (Rookie Cook, etc.) should increase
const checkGamificationLevelUp = async (progress) => {
  const currentGamificationLevel = await GamificationLevel.findOne({
    levelNumber: progress.gamificationLevel
  });
  
  const nextGamificationLevel = await GamificationLevel.findOne({
    levelNumber: progress.gamificationLevel + 1
  });

  if (!nextGamificationLevel) return;

  // Check points requirement
  if (progress.gamificationPoints >= nextGamificationLevel.minPoints) {
    // Check all other requirements
    const stats = progress.stats;
    const reqs = nextGamificationLevel.requirements;
    
    const meetsRequirements = 
      stats.recipesCooked >= reqs.cookRecipes &&
      stats.favoritesSaved >= reqs.saveFavorites &&
      stats.postsShared >= reqs.sharePosts &&
      stats.likesReceived >= reqs.getLikes &&
      stats.aiGenerations >= reqs.useAIGenerator &&
      stats.mealsPlanned >= (reqs.planMeals || 0);
      
    if (meetsRequirements) {
      progress.gamificationLevel = nextGamificationLevel.levelNumber;
      
      progress.achievements.push({
        name: `Became a ${nextGamificationLevel.levelName}`,
        earnedAt: new Date(),
        description: nextGamificationLevel.badge.description
      });
    }
  }
};