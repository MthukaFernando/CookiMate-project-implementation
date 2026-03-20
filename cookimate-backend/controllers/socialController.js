import Post from "../models/Post.js";
import User from "../models/user.js";
import { cloudinary } from "../config/cloudinary.js";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

// 1. Create Post: Author gets 10 points
export const createPost = async (req, res) => {
  try {
    const { user, caption } = req.body;
    if (!req.file) return res.status(400).json({ message: "No image file provided" });

    const imageUrl = req.file.path;

    // 1. Save the Post immediately as 'pending'
    const newPost = new Post({
      user: user,
      caption: caption,
      imageUrl: imageUrl,
      moderationStatus: "pending", 
    });
    const savedPost = await newPost.save();

    // Reward immediately
    await User.findOneAndUpdate(
      { firebaseUid: user },
      { $inc: { points: 10 } }
    );

    // Respond to the mobile app immediately so the user isn't stuck loading
    res.status(201).json(savedPost);

    // 2. THE GHOST CHECK (Wait 8 seconds)
    setTimeout(async () => {
      try {
        console.log(`🔍 Checking if image still exists: ${imageUrl}`);
        
        // We use axios.head to check if the URL is "Live" without downloading the whole image
        await axios.head(imageUrl); 

        // IF THE IMAGE EXISTS: Update status to approved and give points
        console.log("✅ Image is safe. Rewarding user with 10 points.");
        await Post.findByIdAndUpdate(savedPost._id, { moderationStatus: "approved" });

      } catch (error) {
        // IF THE IMAGE IS GONE (404/403): Cloudinary AI killed it.
        console.log("❌ 404/403 Detected! Cloudinary removed the image. Deleting post from DB...");
        
        // This removes the post from your MongoDB entirely
        await Post.findByIdAndDelete(savedPost._id);
        
        // Revoke points and set message
        await User.findOneAndUpdate(
          { firebaseUid: user },
          { 
            $inc: { points: -10 },
            $set: { lastMessage: "Your post violated our safety policies and was removed. 10 points have been revoked." }
          }
        );
      }
    }, 8000); 

  } catch (err) {
    console.error("Upload Error:", err);
    if (!res.headersSent) {
      res.status(500).json({ message: "Upload failed", error: err.message });
    }
  }
};
// 2. Get Feed: Populate user info correctly
export const getFeed = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  try {
    //added { moderationStatus: { $ne: "rejected" } } so it skips bad images!
    const posts = await Post.find({ moderationStatus: { $ne: "rejected" } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "user",
        model: "User",
        foreignField: "firebaseUid",
        select: "username profilePic firebaseUid",
      })
      .populate({
        path: "comments.user",
        model: "User",
        foreignField: "firebaseUid",
        select: "username profilePic",
      });

    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
};

// 3. Like Post: Author gets 5 points
export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const { userId } = req.body;

    if (!post) return res.status(404).json("Post not found");

    if (!post.likes.includes(userId)) {
      await post.updateOne({ $push: { likes: userId } });

      await User.findOneAndUpdate(
        { firebaseUid: post.user },
        { $inc: { points: 5 } },
      );
      res.status(200).json("Post liked!");
    } else {
      await post.updateOne({ $pull: { likes: userId } });
      res.status(200).json("Post unliked.");
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

// 4. Add Comment: Author gets 5 points
export const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId, text } = req.body;

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $push: { comments: { user: userId, text } } },
      { new: true },
    )
      .populate({
        path: "comments.user",
        model: "User",
        foreignField: "firebaseUid",
        select: "username profilePic",
      })
      .populate({
        path: "user",
        model: "User",
        foreignField: "firebaseUid",
        select: "username firebaseUid",
      });

    if (!updatedPost) return res.status(404).json("Post not found");

    await User.findOneAndUpdate(
      { firebaseUid: updatedPost.user.firebaseUid },
      { $inc: { points: 5 } },
    );

    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(500).json(err);
  }
};

// 5. Delete Post: Only author can delete
export const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json("Post not found");

    if (post.user !== userId) {
      return res.status(403).json("You can only delete your own posts!");
    }

    await Post.findByIdAndDelete(postId);
    res.status(200).json("Post deleted successfully");
  } catch (err) {
    res.status(500).json(err);
  }
};