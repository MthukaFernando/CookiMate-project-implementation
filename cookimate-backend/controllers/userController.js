import User from "../models/user.js";
import Level from "../models/levels.js";
import Recipe from "../models/Recipe.js";
import Post from "../models/Post.js"; 
import UserProgress from "../models/UserProgress.js";  

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
    
    // START: ONLY THIS BLOCK ADDED (8 lines)
    // Find the first simple level (Novice Chef - level 1)
    const firstSimpleLevel = await Level.findOne({ level: 1 });
    
    // Create progress tracking for the user
    const userProgress = await UserProgress.create({
      user: newUser._id,
      simpleLevel: firstSimpleLevel._id,
      simpleLevelPoints: 0,
      gamificationLevel: 1,
      gamificationPoints: 0,
      stats: {
        recipesCooked: 0,
        favoritesSaved: 0,
        recipesShared: 0,
        likesReceived: 0,
        aiGenerations: 0,
        errorsFixed: 0,
        weeklyPlansCompleted: 0,
        followersCount: 0,
        currentStreak: 0,
        longestStreak: 0,
        dailyChallengesDone: 0,
        photosUploaded: 0,
        usersHelped: 0
      }
    });
    // END: ONLY THIS BLOCK ADDED

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

// get the logged in user info using the UID from the frontend (UID will be given from the firebase)
export const getUserByUid = async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.params.uid }).populate("favorites");
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
    // Fetch all levels from the database and sort by 'level' ascending
    const levels = await Level.find().sort({ level: 1 });

    if (!levels || levels.length === 0) {
      return res.status(404).json({ message: "No levels found" });
    }

    // Return the levels as JSON
    res.status(200).json(levels);
  } catch (error) {
    console.error("Error fetching levels:", error);
    res.status(500).json({ message: error.message });
  }
};

// Edit user with (username, name, profilepic)
export const updateUser = async (req, res) => {
  try {
    const { username, name, profilePic } = req.body;

    const updatedUser = await User.findOneAndUpdate(
      { firebaseUid: req.params.uid },
      {
        username,
        name,
        profilePic,
      },
      {
        returnDocument: "after", 
        runValidators: true,
      },
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Username already taken" });
    }

    res.status(500).json({ message: error.message });
  }
};

// Add recipe to favorites
export const addToFavorites = async (req, res) => {
  try {
    const { recipeId } = req.body;
    const { uid } = req.params;

    // Check if the recipe exists in the recipes collection
    const recipe = await Recipe.findOne({ id: recipeId });
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    const user = await User.findOne({ firebaseUid: uid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if already favorited using the MongoDB _id
    if (user.favorites.includes(recipe._id)) {
      return res.status(400).json({ message: "Recipe already in favorites" });
    }

    user.favorites.push(recipe._id);
    await user.save();
    res.status(200).json({ message: "Recipe added to favorites" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove recipe from favorites
export const removeFromFavorites = async (req, res) => {
  try {
    const { recipeId } = req.body;
    const { uid } = req.params;

    const recipe = await Recipe.findOne({ id: recipeId });
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    const user = await User.findOneAndUpdate(
      { firebaseUid: uid },
      { $pull: { favorites: recipe._id } }, 
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Recipe removed from favorites" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// FOLLOW / UNFOLLOW USER (Updated to use Firebase UIDs)
export const toggleFollow = async (req, res) => {
  try {
    const { targetUserId, currentUserId } = req.body; // Firebase UIDs

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
    console.error("TOGGLE_FOLLOW_ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// SEARCH USERS
export const searchUsers = async (req, res) => {
  const query = req.query.username;
  
  if (!query) {
    return res.status(400).json({ message: "Username query parameter is required" });
  }
  
  try {
    const users = await User.find({
      username: { $regex: query, $options: "i" }, // Case-insensitive search
    }).select("username profilePic name firebaseUid"); 
    
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Call this when the "Complete Recipe" confetti happens
export const incrementCookCount = async (req, res) => {
  try {
    const { uid } = req.params; // Using firebaseUid for consistency
    const { recipeId } = req.body; // Expecting the MongoDB _id of the recipe

    const updatedUser = await User.findOneAndUpdate(
      { firebaseUid: uid },
      { $inc: { recipesCookedCount: 1 }, // Directly increments the number by 1
      $push: {
        cookedHistory: {
          recipeId: recipeId,
          dateCooked: new Date()
        }
      }
    },
      { new: true }
    ).populate("cookedHistory.recipeId");

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    const validHistory = updatedUser.cookedHistory.filter(item => item.recipeId);

    res.status(200).json({ count: updatedUser.recipesCookedCount, cookedHistory: validHistory
     });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Viewing another user's profile
export const getCommunityProfile = async (req, res) => {
  try {
    const { uid } = req.params; 
    const { viewerId } = req.query;

    const user = await User.findOne({ firebaseUid: uid });
    if (!user) return res.status(404).json({ message: "User not found" });

    let isFollowing = false;
    if (viewerId) {
      const viewer = await User.findOne({ firebaseUid: viewerId });
      if (viewer) {
        isFollowing = (user.followers || []).some(fId => fId.equals(viewer._id));
      }
    }

    // Fetch from Post model and populate comment authors
    const userPosts = await Post.find({ user: uid }) 
      .sort({ createdAt: -1 })
      .populate({
        path: "comments.user",
        model: "User",
        foreignField: "firebaseUid",
        select: "username profilePic"
      });

    res.status(200).json({
      _id: user._id,
      name: user.name,
      username: user.username,
      profilePic: user.profilePic,
      bio: user.bio,
      isFollowing,
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

// Save the meals the user has planner
export const addToMealPlan = async (req, res) => {
  try {
    const { uid } = req.params; // Firebase UID
    const { uniqueId, id, name, image, category, date } = req.body;

    const updatedUser = await User.findOneAndUpdate(
      { firebaseUid: uid },
      { 
        $push: { 
          mealPlan: { 
            uniqueId, 
            recipeId: id, 
            name, 
            image, 
            category, 
            date 
          } 
        } 
      },
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.status(200).json(updatedUser.mealPlan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove a meal from the user's planner
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