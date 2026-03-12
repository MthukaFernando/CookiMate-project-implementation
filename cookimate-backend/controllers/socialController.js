import Post from "../models/Post.js";
import User from "../models/user.js";
import { cloudinary } from "../config/cloudinary.js";
import dotenv from "dotenv";

dotenv.config();

// 1. Create Post: Author gets 10 points
// UPDATED: Now uses req.file.path (Multer) instead of Base64 strings
export const createPost = async (req, res) => {
  try {
    const { user, caption } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    const imageUrl = req.file.path;

    // Save Post to MongoDB
    const newPost = new Post({
      user: user, // This is the Firebase UID string
      caption: caption,
      imageUrl: imageUrl,
    });

    const savedPost = await newPost.save();

    // Reward the Author with 10 points
    await User.findOneAndUpdate(
      { firebaseUid: user },
      { $inc: { points: 10 } },
    );

    res.status(201).json(savedPost);
  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
};

// 2. Get Feed: Populate user info correctly
export const getFeed = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  try {
    const posts = await Post.find()
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