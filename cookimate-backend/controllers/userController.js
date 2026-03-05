import User from "../models/user.js";
import Level from "../models/levels.js";
import Recipe from "../models/Recipe.js";
import UserProgress from "../models/UserProgress.js";  // ONLY THIS LINE ADDED

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

// Remove favorites from the favorites array

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
      { $pull: { favorites: recipe._id  } }, 
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

// Edit user with , (username, name , profilepic)
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

//the api that will let the user add recips to the fav (the id of the recips will be stored in the user collection under favorites array )
export const addToFavorites = async (req, res) => {
  try {
    const { recipeId } = req.body;
    const { uid } = req.params;

    //check if the fronend had sent a valid id that is in the recips collection
    const recipe = await Recipe.findOne({ id: recipeId });
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    //get the logged in user object from the user collection
    // Find user
    const user = await User.findOne({ firebaseUid: uid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    //check if the recips id is already there this is importat as we can give the user a feedbcak msg

   if (user.favorites.includes(recipe._id)) {
      return res.status(400).json({ message: "Recipe already in favorites" });
    }

    //this will add the recipe _id (built in mongodb) end of the faverecipe array
    user.favorites.push(recipe._id);
    await user.save();
    res.status(200).json({
      message: "Recipe added to favorites",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};