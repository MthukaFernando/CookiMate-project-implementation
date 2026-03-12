import express from "express";
import {
  createPost,
  getFeed,
  likePost,
  addComment,
  deletePost,
} from "../controllers/socialController.js";

const router = express.Router();

// Create a post with image upload
router.post("/", createPost);

// Get the community feed
router.get("/feed", getFeed);

// Like/unlike a post
router.put("/:id/like", likePost);

// Add a comment to a post
router.post("/:postId/comment", addComment);

// Delete a post
router.delete("/:postId", deletePost);

export default router;
