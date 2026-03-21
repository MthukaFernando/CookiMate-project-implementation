import express from "express";
import {
  createPost,
  getFeed,
  likePost,
  addComment,
  deletePost,
  handleDeleteComment,
} from "../controllers/socialController.js";
import { upload } from "../config/cloudinary.js"; // 1. Import the upload engine

const router = express.Router();

// 2. Add 'upload.single("image")' here
// This looks for a field named "image" in the incoming request
router.post("/", upload.single("image"), createPost);

// ... (rest of your routes stay the same)
router.get("/feed", getFeed);
router.put("/:id/like", likePost);
router.post("/:postId/comment", addComment);
router.delete("/:postId", deletePost);
router.delete("/:postId/comment/:commentId", handleDeleteComment);

export default router;