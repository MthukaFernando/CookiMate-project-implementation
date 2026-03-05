import express from "express";
import {
  recordAction,
  getUserDashboard,
  getAllGamificationLevels
} from "../controllers/gamificationController.js";

const router = express.Router();

// Record user actions
router.post("/user/:userId/action", recordAction);

// Get user's complete dashboard
router.get("/user/:userId/dashboard", getUserDashboard);

// Get all gamification levels
router.get("/levels", getAllGamificationLevels);

export default router;