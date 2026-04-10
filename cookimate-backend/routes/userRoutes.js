import express from "express";
import {
  createUser,
  deleteUser,
  getUserByUid,
  getLevels,
  updateUser,
  addToFavorites,     
  removeFromFavorites, 
  toggleFollow,
  searchUsers,
  incrementCookCount,
  getCommunityProfile,
  addToMealPlan,
  clearNotification,
  removeFromMealPlan,
  deleteFromHistory,
  toggleBlockUser,
  getFans
} from "../controllers/userController.js";

const router = express.Router();

router.post("/", createUser);
router.get("/levels", getLevels);
router.put("/block", toggleBlockUser);
router.get("/fans/:uid", getFans);
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
router.delete("/:uid", deleteUser);
router.delete("/history/:uid/:recipeId", deleteFromHistory);
export default router;