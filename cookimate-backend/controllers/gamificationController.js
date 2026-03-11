import UserProgress from "../models/UserProgress.js";
import GamificationLevel from "../models/GamificationLevel.js";
import Level from "../models/levels.js";
import { updateUserStats } from "../utils/gamificationHelpers.js";

// Record a user action
export const recordAction = async (req, res) => {
  try {
    const { userId } = req.params;
    const { action } = req.body;

    const validActions = [
      'COOK_RECIPE', 'SAVE_FAVORITE', 'SHARE_RECIPE', 'RECEIVE_LIKE',
      'USE_AI', 'FIX_ERROR', 'COMPLETE_MEAL_PLAN', 'DAILY_LOGIN',
      'COMPLETE_CHALLENGE', 'UPLOAD_PHOTO', 'HELP_USER', 'GAIN_FOLLOWER'
    ];

    if (!validActions.includes(action)) {
      return res.status(400).json({ message: "Invalid action" });
    }

    const updatedProgress = await updateUserStats(userId, action);
    
    // Get current level details for both systems
    const simpleLevel = await Level.findById(updatedProgress.simpleLevel);
    const gamificationLevel = await GamificationLevel.findOne({
      levelNumber: updatedProgress.gamificationLevel
    });
    
    res.status(200).json({
      message: "Action recorded successfully",
      points: {
        simpleLevelPoints: updatedProgress.simpleLevelPoints,
        gamificationPoints: updatedProgress.gamificationPoints
      },
      currentLevels: {
        simple: {
          level: simpleLevel.title,
          pointsRequired: simpleLevel.pointsRequired
        },
        gamification: {
          level: gamificationLevel.levelName,
          minPoints: gamificationLevel.minPoints,
          maxPoints: gamificationLevel.maxPoints
        }
      },
      stats: updatedProgress.stats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's complete progress dashboard
export const getUserDashboard = async (req, res) => {
  try {
    const { userId } = req.params;
    const progress = await UserProgress.findOne({ user: userId })
      .populate('simpleLevel');
    
    if (!progress) {
      return res.status(404).json({ message: "Progress not found" });
    }

    // Get current gamification level details
    const currentGamificationLevel = await GamificationLevel.findOne({
      levelNumber: progress.gamificationLevel
    });

    // Get next gamification level
    const nextGamificationLevel = await GamificationLevel.findOne({
      levelNumber: progress.gamificationLevel + 1
    });

    // Get next simple level
    const nextSimpleLevel = await Level.findOne({
      level: progress.simpleLevel.level + 1
    });

    // Calculate progress to next simple level
    const simpleLevelProgress = {
      current: progress.simpleLevelPoints,
      next: nextSimpleLevel ? nextSimpleLevel.pointsRequired : null,
      percentage: nextSimpleLevel 
        ? (progress.simpleLevelPoints / nextSimpleLevel.pointsRequired) * 100 
        : 100
    };

    // Calculate progress to next gamification level
    let gamificationProgress = null;
    if (nextGamificationLevel) {
      const stats = progress.stats;
      const reqs = nextGamificationLevel.requirements;
      
      gamificationProgress = {
        points: {
          current: progress.gamificationPoints,
          required: nextGamificationLevel.minPoints,
          percentage: (progress.gamificationPoints / nextGamificationLevel.minPoints) * 100
        },
        requirements: {
          cookRecipes: {
            current: stats.recipesCooked,
            required: reqs.cookRecipes,
            percentage: (stats.recipesCooked / reqs.cookRecipes) * 100
          },
          saveFavorites: {
            current: stats.favoritesSaved,
            required: reqs.saveFavorites,
            percentage: (stats.favoritesSaved / reqs.saveFavorites) * 100
          },
          shareRecipes: {
            current: stats.recipesShared,
            required: reqs.shareRecipes,
            percentage: (stats.recipesShared / reqs.shareRecipes) * 100
          },
          getLikes: {
            current: stats.likesReceived,
            required: reqs.getLikes,
            percentage: (stats.likesReceived / reqs.getLikes) * 100
          },
          useAIGenerator: {
            current: stats.aiGenerations,
            required: reqs.useAIGenerator,
            percentage: (stats.aiGenerations / reqs.useAIGenerator) * 100
          }
        }
      };
    }

    res.status(200).json({
      currentLevels: {
        simple: progress.simpleLevel,
        gamification: currentGamificationLevel
      },
      points: {
        simple: progress.simpleLevelPoints,
        gamification: progress.gamificationPoints
      },
      stats: progress.stats,
      nextLevels: {
        simple: nextSimpleLevel,
        gamification: nextGamificationLevel
      },
      progress: {
        simple: simpleLevelProgress,
        gamification: gamificationProgress
      },
      achievements: progress.achievements,
      streak: {
        current: progress.stats.currentStreak,
        longest: progress.stats.longestStreak
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all gamification levels
export const getAllGamificationLevels = async (req, res) => {
  try {
    const levels = await GamificationLevel.find().sort({ levelNumber: 1 });
    res.status(200).json(levels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};