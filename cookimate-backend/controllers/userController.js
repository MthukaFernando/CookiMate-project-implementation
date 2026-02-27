import User from "../models/user.js";
import Level from "../models/levels.js";
import Recipe from "../models/recipe.js"; 

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
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get the logged in user info using the UID from the frontend (UID will be given from the firebase)
export const getUserByUid = async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.params.uid });
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
        returnDocument: "after", // ✅ updated way
        runValidators: true,
      }
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

// TOGGLE FAVORITE - Add/remove recipe from favorites (works like a toggle)
export const toggleFavorite = async (req, res) => {
  try {
    const { recipeId } = req.body;
    const { uid } = req.params;

    // Check if the recipe exists
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    const user = await User.findOne({ firebaseUid: uid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if it's already a favorite
    const isFavorited = user.favorites.includes(recipeId);

    if (isFavorited) {
      // REMOVE logic
      await User.findOneAndUpdate(
        { firebaseUid: uid },
        { $pull: { favorites: recipeId } }
      );
      res.status(200).json({ 
        message: "Removed from favorites", 
        isFavorite: false 
      });
    } else {
      // ADD logic
      await User.findOneAndUpdate(
        { firebaseUid: uid },
        { $push: { favorites: recipeId } }
      );
      res.status(200).json({ 
        message: "Added to favorites", 
        isFavorite: true 
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// FOLLOW / UNFOLLOW USER
export const toggleFollow = async (req, res) => {
  try {
    const { targetUserId, currentUserId } = req.body; // IDs from MongoDB (_id)

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!currentUser.following.includes(targetUserId)) {
      // FOLLOW LOGIC
      await currentUser.updateOne({ $push: { following: targetUserId } });
      await targetUser.updateOne({ $push: { followers: currentUserId } });
      res.status(200).json({ message: "Followed successfully" });
    } else {
      // UNFOLLOW LOGIC
      await currentUser.updateOne({ $pull: { following: targetUserId } });
      await targetUser.updateOne({ $pull: { followers: currentUserId } });
      res.status(200).json({ message: "Unfollowed successfully" });
    }
  } catch (err) {
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
    }).select("username profilePic name"); // Only return necessary info
    
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};