import User from "../models/user.js";
import Level from "../models/levels.js";
import Recipe from "../models/Recipe.js";
import Post from "../models/Post.js";
import UserProgress from "../models/UserProgress.js";
import { updateUserStats } from "../utils/gamificationHelpers.js";

// create a user
export const createUser = async (req, res) => {
  try {
    const { firebaseUid, username, name } = req.body;
    const existingUser = await User.findOne({ firebaseUid });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const newUser = await User.create({
      name: name,
      username: username,
      firebaseUid: firebaseUid,
    });

    const firstSimpleLevel = await Level.findOne({ level: 1 });

    await UserProgress.create({
      user: newUser._id,
      simpleLevel: firstSimpleLevel._id,
      simpleLevelPoints: 0,
      gamificationLevel: 1,
      gamificationPoints: 0,
      stats: {
        recipesCooked: 0,
        favoritesSaved: 0,
        postsShared: 0,
        likesReceived: 0,
        aiGenerations: 0,
        errorsFixed: 0,
        mealsPlanned: 0,
        followersCount: 0,
        currentStreak: 0,
        longestStreak: 0,
        dailyChallengesDone: 0,
        photosUploaded: 0,
        usersHelped: 0
      }
    });

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Clear warning notification
export const clearNotification = async (req, res) => {
  try {
    const { uid } = req.params;
    await User.findOneAndUpdate(
      { firebaseUid: uid },
      { $set: { lastMessage: "" } }
    );
    res.status(200).json({ message: "Notification cleared" });
  } catch (err) {
    res.status(500).json({ message: "Error clearing notification", error: err });
  }
};

// Get user by UID
export const getUserByUid = async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.params.uid })
      .populate("favorites")
      .populate("cookedHistory.recipeId");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getLevels = async (req, res) => {
  try {
    const levels = await Level.find().sort({ level: 1 });
    if (!levels || levels.length === 0) {
      return res.status(404).json({ message: "No levels found" });
    }
    res.status(200).json(levels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { username, name, profilePic, bio } = req.body;
    const updatedUser = await User.findOneAndUpdate(
      { firebaseUid: req.params.uid },
      {
        username,
        name,
        profilePic,
        ...(bio !== undefined && { bio }),
      },
      { returnDocument: "after", runValidators: true }
    );
    if (!updatedUser) return res.status(404).json({ message: "User not found" });
    res.status(200).json(updatedUser);
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ message: "Username already taken" });
    res.status(500).json({ message: error.message });
  }
};

// Add to favorites
export const addToFavorites = async (req, res) => {
  try {
    const { recipeId } = req.body;
    const { uid } = req.params;

    const recipe = await Recipe.findOne({ id: recipeId });
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    const user = await User.findOne({ firebaseUid: uid });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.favorites.includes(recipe._id)) {
      return res.status(400).json({ message: "Recipe already in favorites" });
    }

    user.favorites.push(recipe._id);
    await user.save();

    // Trigger Gamification
    try {
      await updateUserStats(user._id, 'SAVE_FAVORITE');
    } catch (gError) {
      console.error("Gamification error:", gError.message);
    }

    res.status(200).json({ message: "Recipe added to favorites" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove from favorites
export const removeFromFavorites = async (req, res) => {
  try {
    const { recipeId } = req.body;
    const { uid } = req.params;
    const recipe = await Recipe.findOne({ id: recipeId });
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    const user = await User.findOneAndUpdate(
      { firebaseUid: uid },
      { $pull: { favorites: recipe._id } },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "Recipe removed from favorites" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Toggle follow
export const toggleFollow = async (req, res) => {
  try {
    const { targetUserId, currentUserId } = req.body;
    const targetUser = await User.findOne({ firebaseUid: targetUserId });
    const currentUser = await User.findOne({ firebaseUid: currentUserId });

    if (!targetUser || !currentUser) return res.status(404).json({ message: "User not found" });
    if (targetUserId === currentUserId) return res.status(400).json({ message: "Cannot follow yourself" });

    const isAlreadyFollowing = currentUser.following.some(id => id.equals(targetUser._id));

    if (!isAlreadyFollowing) {
      await currentUser.updateOne({ $push: { following: targetUser._id } });
      await targetUser.updateOne({ $push: { followers: currentUser._id } });
      res.status(200).json({ isFollowing: true });
    } else {
      await currentUser.updateOne({ $pull: { following: targetUser._id } });
      await targetUser.updateOne({ $pull: { followers: currentUser._id } });
      res.status(200).json({ isFollowing: false });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Search users
export const searchUsers = async (req, res) => {
  const query = req.query.username;
  if (!query) return res.status(400).json({ message: "Username required" });
  try {
    const users = await User.find({
      username: { $regex: query, $options: "i" },
    }).select("username profilePic name firebaseUid");
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Increment Cook Count
export const incrementCookCount = async (req, res) => {
  try {
    const { uid } = req.params;
    const { recipeId } = req.body;

    const user = await User.findOne({ firebaseUid: uid });
    if (!user) return res.status(404).json({ message: "User not found" });

    const historyIndex = user.cookedHistory.findIndex(
      (item) => item.recipeId.toString() === recipeId
    );

    let isNewRecipe = false;
    let shouldTriggerGamification = false;

    if (historyIndex === -1) {
      // This is a NEW recipe being cooked for the first time
      user.cookedHistory.push({
        recipeId: recipeId,
        timesCooked: 1,
        dateCooked: new Date(),
      });
      
      // Update the unique recipe count
      user.recipesCookedCount = user.cookedHistory.length;
      isNewRecipe = true;
      shouldTriggerGamification = true;
      
      await user.save();
      console.log(`New recipe cooked! Total unique recipes: ${user.recipesCookedCount}`);
    } else {
      // This is a REPEAT recipe
      user.cookedHistory[historyIndex].timesCooked += 1;
      user.cookedHistory[historyIndex].dateCooked = new Date();
      // DO NOT update recipesCookedCount for repeat recipes
      await user.save();
      console.log(`Repeat recipe cooked! Times cooked: ${user.cookedHistory[historyIndex].timesCooked}`);
    }

    // Trigger Gamification ONLY for truly new recipes
    if (shouldTriggerGamification) {
      try {
        // Pass the user object directly to avoid another DB read
        await updateUserStats(user._id, 'COOK_RECIPE');
        console.log("Gamification: New recipe recorded!");
      } catch (gError) {
        console.error("Gamification error:", gError.message);
      }
    }

    const populatedUser = await user.populate("cookedHistory.recipeId");
    const validHistory = populatedUser.cookedHistory.filter(item => item.recipeId);
    
    res.status(200).json({ 
      count: populatedUser.recipesCookedCount, 
      cookedHistory: validHistory 
    });
  } catch (error) {
    console.error("Error in incrementCookCount:", error);
    res.status(500).json({ message: error.message });
  }
};

// Delete from history
export const deleteFromHistory = async (req, res) => {
  try {
    const { uid, recipeId } = req.params;
    const updatedUser = await User.findOneAndUpdate(
      { firebaseUid: uid },
      { $pull: { cookedHistory: { recipeId: recipeId } } },
      { new: true }
    );
    if (updatedUser) {
      updatedUser.recipesCookedCount = updatedUser.cookedHistory.length;
      await updatedUser.save();
    }
    const populatedUser = await updatedUser.populate("cookedHistory.recipeId");
    res.status(200).json({ 
      count: populatedUser.recipesCookedCount, 
      cookedHistory: populatedUser.cookedHistory.filter(item => item.recipeId) 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Community Profile
export const getCommunityProfile = async (req, res) => {
  try {
    const { uid } = req.params; 
    const { viewerId } = req.query;
    const user = await User.findOne({ firebaseUid: uid });
    if (!user) return res.status(404).json({ message: "User not found" });

    let viewer = null;
    let blockedByCurrentUser = false;
    if (viewerId) {
      viewer = await User.findOne({ firebaseUid: viewerId });
      blockedByCurrentUser = viewer?.blockedUsers?.includes(uid) || false;
    }

    const userPosts = await Post.find({ user: uid })
      .sort({ createdAt: -1 })
      .populate({ path: "comments.user", model: "User", foreignField: "firebaseUid", select: "username profilePic" });

    res.status(200).json({
      _id: user._id,
      name: user.name,
      username: user.username,
      profilePic: user.profilePic,
      bio: user.bio,
      isFollowing: viewer?.following?.includes(user._id) || false,
      blockedByCurrentUser,
      stats: {
        recipes: user.recipesCookedCount || 0,
        followers: user.followers?.length || 0,
        following: user.following?.length || 0,
      },
      posts: userPosts.map(p => ({
        id: p._id.toString(),
        uri: p.imageUrl,
        caption: p.caption,
        likes: p.likes || [],
        comments: p.comments || [],
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add to meal plan
export const addToMealPlan = async (req, res) => {
  try {
    const { uid } = req.params;
    const { uniqueId, id, name, image, category, date } = req.body;

    const updatedUser = await User.findOneAndUpdate(
      { firebaseUid: uid },
      { 
        $push: { 
          mealPlan: { uniqueId, recipeId: id, name, image, category, date } 
        } 
      },
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    // Trigger Gamification
    try {
      await updateUserStats(updatedUser._id, 'PLAN_MEAL');
    } catch (gamificationError) {
      console.error("Gamification error:", gamificationError.message);
    }

    res.status(200).json(updatedUser.mealPlan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove from meal plan
export const removeFromMealPlan = async (req, res) => {
  try {
    const { uid } = req.params;
    const { uniqueId } = req.body; 
    const updatedUser = await User.findOneAndUpdate(
      { firebaseUid: uid },
      { $pull: { mealPlan: { uniqueId: uniqueId } } },
      { new: true }
    );
    if (!updatedUser) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "Meal removed from planner" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete User
export const deleteUser = async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await User.findOne({ firebaseUid: uid });
    if (!user) return res.status(404).json({ message: "User not found" });

    await User.updateMany(
      { $or: [{ followers: user._id }, { following: user._id }] },
      { $pull: { followers: user._id, following: user._id } }
    );

    // Delete all posts created by this user
    await Post.deleteMany({ user: uid });

    await User.findByIdAndDelete(user._id);
    res.status(200).json({ message: "User account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Toggle Block
export const toggleBlockUser = async (req, res) => {
  try {
    const { currentUserUid, targetUserUid } = req.body;
    if (currentUserUid === targetUserUid) return res.status(400).json({ message: "Cannot block yourself" });

    const currentUser = await User.findOne({ firebaseUid: currentUserUid });
    if (!currentUser) return res.status(404).json({ message: "User not found" });

    const isBlocked = currentUser.blockedUsers.includes(targetUserUid);
    if (!isBlocked) {
      await currentUser.updateOne({ $addToSet: { blockedUsers: targetUserUid } });
      return res.status(200).json({ blocked: true });
    } else {
      await currentUser.updateOne({ $pull: { blockedUsers: targetUserUid } });
      return res.status(200).json({ blocked: false });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};