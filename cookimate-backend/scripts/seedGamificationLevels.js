import mongoose from "mongoose";
import dotenv from "dotenv";
import GamificationLevel from "../models/GamificationLevel.js";

dotenv.config();

// Your gamification levels from the project
const gamificationLevels = [
  {
    levelNumber: 1,
    levelName: "Rookie Cook",
    minPoints: 0,
    maxPoints: 100,
    requirements: {
      cookRecipes: 1,
      saveFavorites: 3,
      useAIGenerator: 1,
      shareRecipes: 2,
      getLikes: 2,
      streak: 3
    },
    badge: {
      imageUrl: "https://img.icons8.com/color/96/000000/chef-hat.png",
      description: "Started your cooking journey!"
    }
  },
  {
    levelNumber: 2,
    levelName: "Apprentice Chef",
    minPoints: 101,
    maxPoints: 250,
    requirements: {
      cookRecipes: 5,
      saveFavorites: 5,
      shareRecipes: 3,
      getLikes: 5,
      useAIGenerator: 3,
      fixErrors: 1,
      streak: 5
    },
    badge: {
      imageUrl: "https://img.icons8.com/color/96/000000/cooking-book.png",
      description: "Learning the basics of cooking!"
    }
  },
  {
    levelNumber: 3,
    levelName: "Kitchen Master",
    minPoints: 251,
    maxPoints: 450,
    requirements: {
      cookRecipes: 15,
      saveFavorites: 10,
      shareRecipes: 5,
      getLikes: 10,
      useAIGenerator: 7,
      fixErrors: 3,
      weeklyMealPlans: 1,
      streak: 7,
      dailyChallenges: 3
    },
    badge: {
      imageUrl: "https://img.icons8.com/color/96/000000/kitchen.png",
      description: "Master of the kitchen!"
    }
  },
  {
    levelNumber: 4,
    levelName: "Culinary Expert",
    minPoints: 451,
    maxPoints: 700,
    requirements: {
      cookRecipes: 30,
      saveFavorites: 15,
      shareRecipes: 8,
      getLikes: 20,
      useAIGenerator: 15,
      fixErrors: 5,
      weeklyMealPlans: 3,
      followers: 5,
      streak: 14,
      dailyChallenges: 7
    },
    badge: {
      imageUrl: "https://img.icons8.com/color/96/000000/spoon-and-fork.png",
      description: "Expert in culinary arts!"
    }
  },
  {
    levelNumber: 5,
    levelName: "Master Chef",
    minPoints: 701,
    maxPoints: 999999,
    requirements: {
      cookRecipes: 50,
      saveFavorites: 25,
      shareRecipes: 12,
      getLikes: 35,
      useAIGenerator: 25,
      fixErrors: 8,
      weeklyMealPlans: 6,
      followers: 15,
      streak: 30,
      dailyChallenges: 15,
      recipePhotos: 5,
      helpUsers: 5
    },
    badge: {
      imageUrl: "https://res.cloudinary.com/cookimate-images/image/upload/v1770965637/profile_pic3_jgp0tk.png",
      description: "The ultimate chef!"
    }
  }
];

const seedGamificationLevels = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");
    
    // Clear existing gamification levels
    await GamificationLevel.deleteMany({});
    console.log("🗑️ Cleared existing gamification levels");
    
    // Insert new levels
    await GamificationLevel.insertMany(gamificationLevels);
    console.log("✅ Gamification levels seeded successfully!");
    console.log("📊 Added 5 gamification levels: Rookie Cook → Master Chef");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding levels:", error);
    process.exit(1);
  }
};

seedGamificationLevels();