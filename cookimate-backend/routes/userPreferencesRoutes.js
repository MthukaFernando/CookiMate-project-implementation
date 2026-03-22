import express from "express";
import {
  getUserPreferences,
  updateUserPreferences,
  getPreferencesSummary,
  clearUserPreferences,
} from "../controllers/userPreferencesController.js";

const router = express.Router();

// Get user preferences
router.get("/preferences/:userId", getUserPreferences);

// Update user preferences
router.put("/preferences/:userId", updateUserPreferences);

// Get preferences summary
router.get("/preferences/:userId/summary", getPreferencesSummary);

// Clear all preferences
router.delete("/preferences/:userId", clearUserPreferences);

export default router;
