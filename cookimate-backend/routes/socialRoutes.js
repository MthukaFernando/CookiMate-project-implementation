import express from "express";
import { 
  createPost, 
  getFeed, 
  likePost, 
  addComment, 
  deletePost 
} from "../controllers/socialController.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

// Create a post with image upload
router.post("/", upload.single("image"), (req, res, next) => {
  // Log upload status
  if (req.file) {
    console.log('Image uploaded to Cloudinary:', req.file.path);
  } else {
    console.log('No image file received');
  }
  next();
}, createPost);

// Get the community feed
router.get("/feed", getFeed);

// Like/unlike a post
router.put("/:id/like", likePost);

// Add a comment to a post
router.post("/:postId/comment", addComment);

// Delete a post
router.delete("/:postId", deletePost);

// Error handling middleware for multer/cloudinary errors
router.use((error, req, res, next) => {
  if (error) {
    console.error('oute error:', error);
    
    if (error.message.includes('File too large')) {
      return res.status(413).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.'
      });
    }
    
    if (error.message.includes('Invalid file type')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Upload error',
      error: error.message
    });
  }
  next();
});

export default router;