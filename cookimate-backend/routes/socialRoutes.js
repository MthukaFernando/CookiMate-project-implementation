import express from "express";
import {
  createPost,
  getFeed,
  likePost,
  addComment,
  deletePost,
  deleteComment,
} from "../controllers/socialController.js";
import { upload } from "../config/cloudinary.js"; // 1. Import the upload engine
import { createReport } from "../controllers/reportController.js";

const router = express.Router();

// 2. Add 'upload.single("image")' here
// This looks for a field named "image" in the incoming request
router.post("/", upload.single("image"), createPost);

// ... (rest of your routes stay the same)
router.get("/feed", getFeed);
router.put("/:id/like", likePost);
router.post("/:postId/comment", addComment);
router.delete("/:postId", deletePost);
router.delete("/:postId/comment/:commentId", deleteComment);
router.post("/report", createReport);

export default router;