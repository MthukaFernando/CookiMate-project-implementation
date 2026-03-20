import express from "express";
import {
  createUser,
  getUserByUid,
  getLevels,
  updateUser,
  addToFavorites,      // Matches Controller
  removeFromFavorites, // Matches Controller
  toggleFollow,
  searchUsers,
  incrementCookCount,
  getCommunityProfile,
  addToMealPlan,
  clearNotification,
  removeFromMealPlan
} from "../controllers/userController.js";

const router = express.Router();

router.post("/", createUser);
router.get("/levels", getLevels);
router.get("/search", searchUsers);
router.put("/follow", toggleFollow);
router.put("/favorites/:uid", addToFavorites); 
router.put("/favorites/remove/:uid", removeFromFavorites); 
router.get("/community/:uid", getCommunityProfile);
router.put("/complete-recipe/:uid", incrementCookCount);
router.get("/:uid", getUserByUid);
router.put("/update/:uid", updateUser);
router.post("/meal-plan/:uid", addToMealPlan);
router.put("/meal-plan/remove/:uid", removeFromMealPlan);
router.put("/:uid/clear-notification", clearNotification);
export default router;