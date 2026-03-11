import Post from "../models/Post.js";
import User from "../models/user.js";
import { cloudinary } from "../config/cloudinary.js";
import dotenv from "dotenv";

dotenv.config();

// 1. Create Post: Author gets 10 points
export const createPost = async (req, res) => {
  try {
    const { image, user, caption } = req.body;

    if (!image) {
      return res.status(400).json({ message: "No image string provided" });
    }

    // 1. Upload Base64 to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: "posts",
    });

    // 2. Save Post to MongoDB
    const newPost = new Post({
      user: user, // This is the Firebase UID string
      caption: caption,
      imageUrl: uploadResponse.secure_url,
    });

    const savedPost = await newPost.save();

    // 3. Reward the Author with 10 points
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
        path: "comments.user", // ADDED THIS: Populates comment usernames on refresh
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
    const { userId } = req.body; // Liker's UID

    if (!post) return res.status(404).json("Post not found");

    if (!post.likes.includes(userId)) {
      await post.updateOne({ $push: { likes: userId } });

      // Points to Author using the string UID stored in post.user
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
    const { userId, text } = req.body; // userId is the Firebase UID of the commenter

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $push: { comments: { user: userId, text } } },
      { new: true },
    )
      .populate({
        path: "comments.user", // Populate the user inside the comments array
        model: "User",
        foreignField: "firebaseUid", // Match the string UID
        select: "username profilePic",
      })
      .populate({
        path: "user", // Also populate the post author
        model: "User",
        foreignField: "firebaseUid",
        select: "username firebaseUid",
      });

    if (!updatedPost) return res.status(404).json("Post not found");

    // Reward the POST AUTHOR
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
    const { userId } = req.body; // Pass the current user's UID for security

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json("Post not found");

    // Security Check: Ensure the person deleting is the owner
    if (post.user !== userId) {
      return res.status(403).json("You can only delete your own posts!");
    }

    await Post.findByIdAndDelete(postId);
    res.status(200).json("Post deleted successfully");
  } catch (err) {
    res.status(500).json(err);
  }
};
