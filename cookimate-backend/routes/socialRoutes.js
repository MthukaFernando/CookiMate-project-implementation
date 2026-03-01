import express from "express";
import { createPost, getFeed, likePost, addComment } from "../controllers/socialController.js";

const router = express.Router();

router.post("/", createPost);         // Create a post
router.get("/feed", getFeed);         // Get the community feed
router.put("/:id/like", likePost);    // Like a post
router.post("/:postId/comment", addComment); // Add a comment

export default router;