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
    points: {
      type: Number,
      default: 0,
    },
    level: {
      type: Number,
      default: 1,
    },
    followers: {
      type: Number,
      default: 0,
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
  },
  {
    timestamps: true, 
     versionKey: false
  },
);

const User = mongoose.model("User", userSchema);
export default User;
