import mongoose from "mongoose";

const userProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  // For the simple levels already in your DB (Novice Chef, etc.)
  simpleLevel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Level",  // This references your existing Level model
    required: true
  },
  simpleLevelPoints: {
    type: Number,
    default: 0
  },
  
  // For your new gamification levels (Rookie Cook, etc.)
  gamificationLevel: {
    type: Number,
    default: 1
  },
  gamificationPoints: {
    type: Number,
    default: 0
  },
  
  // Track all user stats
  stats: {
    recipesCooked: { type: Number, default: 0 },
    favoritesSaved: { type: Number, default: 0 },
    postsShared: { type: Number, default: 0 }, // Changed from recipesShared
    likesReceived: { type: Number, default: 0 },
    aiGenerations: { type: Number, default: 0 },
    errorsFixed: { type: Number, default: 0 },
    mealsPlanned: { type: Number, default: 0 }, // Changed from weeklyPlansCompleted
    followersCount: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    dailyChallengesDone: { type: Number, default: 0 },
    photosUploaded: { type: Number, default: 0 },
    usersHelped: { type: Number, default: 0 }
  },
  
  lastActivity: {
    type: Date,
    default: Date.now
  },
  
  achievements: [{
    name: String,
    earnedAt: Date,
    description: String
  }]
}, { timestamps: true });

const UserProgress = mongoose.model("UserProgress", userProgressSchema);
export default UserProgress;