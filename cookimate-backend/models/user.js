import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
    },
    profilePic: {
      type: String,
      default:
        "https://res.cloudinary.com/cookimate-images/image/upload/v1770965637/profile_pic3_jgp0tk.png",
    },
    bio: {
      type: String,
      default: "Welcome to my kitchen! 🍳",
      maxLength: 150,
    },
    points: {
      type: Number,
      default: 0,
    },
    level: {
      type: Number,
      default: 1,
    },
    followers: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
    following: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
    unlockedAchievements: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Achievement",
      },
    ],
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Recipe",
      },
    ],
    recipesCookedCount: {
      type: Number,
      default: 0,
    },
    //cooked history
    cookedHistory: [
      {
        recipeId: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: "Recipe" 
        },
        dateCooked: { 
          type: Date, 
          default: Date.now 
        },
      }
    ],
    lastMessage: {
      type: String,
      default: "",
    },
    mealPlan: [
      {
        uniqueId: { type: String, required: true }, 
        recipeId: { type: String, required: true }, 
        name: { type: String, required: true },
        image: { type: String },
        category: { type: String },
        date: { type: String, required: true },
      }
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

userSchema.index({ username: 'text' });
userSchema.index({ followers: 1 });
userSchema.index({ following: 1 });

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;