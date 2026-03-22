import User from "../models/user.js";

// Get user preferences
export const getUserPreferences = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findOne({ firebaseUid: userId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      dietaryPreferences: user.dietaryPreferences || [],
      allergies: user.allergies || [],
      customPreferences: user.customPreferences || [],
    });
  } catch (error) {
    console.error("Failed to get user preferences:", error);
    res.status(500).json({ error: "Failed to get preferences" });
  }
};

// Update user preferences
export const updateUserPreferences = async (req, res) => {
  const { userId } = req.params;
  const { dietaryPreferences, allergies, customPreferences } = req.body;

  // Validate input
  if (
    !Array.isArray(dietaryPreferences) ||
    !Array.isArray(allergies) ||
    !Array.isArray(customPreferences)
  ) {
    return res.status(400).json({
      error: "Invalid preferences format. All fields must be arrays.",
    });
  }

  try {
    const user = await User.findOneAndUpdate(
      { firebaseUid: userId },
      {
        dietaryPreferences: dietaryPreferences || [],
        allergies: allergies || [],
        customPreferences: customPreferences || [],
      },
      { new: true, upsert: true, runValidators: true },
    );

    res.status(200).json({
      success: true,
      message: "Preferences updated successfully",
      preferences: {
        dietaryPreferences: user.dietaryPreferences,
        allergies: user.allergies,
        customPreferences: user.customPreferences,
      },
    });
  } catch (error) {
    console.error("Failed to update user preferences:", error);
    res
      .status(500)
      .json({ error: "Failed to update preferences: " + error.message });
  }
};

// Get preferences summary
export const getPreferencesSummary = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findOne({ firebaseUid: userId }).select(
      "dietaryPreferences allergies customPreferences username name",
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      username: user.username,
      name: user.name,
      preferences: {
        dietaryCount: user.dietaryPreferences?.length || 0,
        allergiesCount: user.allergies?.length || 0,
        customCount: user.customPreferences?.length || 0,
        dietaryPreferences: user.dietaryPreferences || [],
        allergies: user.allergies || [],
        customPreferences: user.customPreferences || [],
      },
    });
  } catch (error) {
    console.error("Failed to get preferences summary:", error);
    res.status(500).json({ error: "Failed to get preferences summary" });
  }
};

// Clear all preferences
export const clearUserPreferences = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findOneAndUpdate(
      { firebaseUid: userId },
      {
        dietaryPreferences: [],
        allergies: [],
        customPreferences: [],
      },
      { new: true },
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "All preferences cleared successfully",
      preferences: {
        dietaryPreferences: [],
        allergies: [],
        customPreferences: [],
      },
    });
  } catch (error) {
    console.error("Failed to clear user preferences:", error);
    res.status(500).json({ error: "Failed to clear preferences" });
  }
};
