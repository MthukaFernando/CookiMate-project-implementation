import Post from "../models/Post.js";
import User from "../models/user.js";
import { cloudinary } from "../config/cloudinary.js";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

// 1. Create Post: Author gets 10 points + AI Vision Moderation
export const createPost = async (req, res) => {
  try {
    const { user, caption } = req.body;
    if (!req.file) return res.status(400).json({ message: "No image file provided" });

    const imageUrl = req.file.path;
    const publicId = req.file.filename;

    // A. Save the Post immediately as 'pending'
    const newPost = new Post({
      user: user,
      caption: caption,
      imageUrl: imageUrl,
      moderationStatus: "pending", 
    });
    const savedPost = await newPost.save();

    // Reward immediately (provisional)
    await User.findOneAndUpdate(
      { firebaseUid: user },
      { $inc: { points: 10 } }
    );

    // Respond to mobile app immediately
    res.status(201).json(savedPost);

    // B. THE AI VISION CHECK (Direct API call to bypass SDK version issues)
    try {
      console.log("🛡️ AI Vision: Requesting analysis...");

      // Construct Basic Auth for Cloudinary API
      const auth = Buffer.from(
        `${process.env.CLOUDINARY_API_KEY}:${process.env.CLOUDINARY_API_SECRET}`
      ).toString('base64');
      
      const response = await axios.post(
        `https://api.cloudinary.com/v2/analysis/${process.env.CLOUDINARY_CLOUD_NAME}/analyze/ai_vision_moderation`,
        {
          source: { uri: imageUrl },
          rejection_questions: [
            "Does the image contain nudity?",
            "Does the image contain graphic violence?",
            "Is this image completely unrelated to food or cooking?"
          ]
        },
        {
          headers: { Authorization: `Basic ${auth}` }
        }
      );

      const aiResponses = response.data.data.analysis.responses;
      console.log("🤖 AI Analysis Results:", aiResponses);

      // Check if any answer is "yes"
      const failedChecks = aiResponses.filter(r => r.value.toLowerCase() === "yes");

      if (failedChecks.length > 0) {
        console.log(`❌ REJECTED: ${failedChecks[0].prompt}`);
        
        // Remove from DB
        await Post.findByIdAndDelete(savedPost._id);
        
        // Remove from Cloudinary
        await cloudinary.uploader.destroy(publicId);
        
        // Revoke points and set warning message
        await User.findOneAndUpdate(
          { firebaseUid: user },
          { 
            $inc: { points: -10 },
            $set: { lastMessage: "Your post violated safety guidelines and was removed." }
          }
        );
      } else {
        console.log("✅ AI Vision: Content Approved.");
        await Post.findByIdAndUpdate(savedPost._id, { moderationStatus: "approved" });
      }

    } catch (aiError) {
      console.error("AI Vision API Error:", aiError.response?.data || aiError.message);
      // In case of API failure, we leave it as pending for manual review
    }

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
    // Only show approved posts in the feed
    const posts = await Post.find({ moderationStatus: "approved" })
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

// 3. Like Post
export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const { userId } = req.body;
    if (!post) return res.status(404).json("Post not found");

    if (!post.likes.includes(userId)) {
      await post.updateOne({ $push: { likes: userId } });
      await User.findOneAndUpdate({ firebaseUid: post.user }, { $inc: { points: 5 } });
      res.status(200).json("Post liked!");
    } else {
      await post.updateOne({ $pull: { likes: userId } });
      res.status(200).json("Post unliked.");
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

// 4. Add Comment
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
    await User.findOneAndUpdate({ firebaseUid: updatedPost.user.firebaseUid }, { $inc: { points: 5 } });

    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(500).json(err);
  }
};

// 5. Delete Post
export const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json("Post not found");
    if (post.user !== userId) return res.status(403).json("Unauthorized");

    await Post.findByIdAndDelete(postId);
    res.status(200).json("Post deleted successfully");
  } catch (err) {
    res.status(500).json(err);
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { userId } = req.body; // This is the logged-in user's UID

    const updatedPost = await Post.findOneAndUpdate(
      { 
        _id: postId, 
        "comments._id": commentId, // Target the specific comment ID
        "comments.user": userId    // Safety: Ensure the UID matches the commenter
      },
      { $pull: { comments: { _id: commentId } } }, // Remove that specific comment object
      { new: true }
    ).populate({
      path: "comments.user",
      model: "User",
      foreignField: "firebaseUid",
      select: "username profilePic",
    });

    if (!updatedPost) {
      return res.status(403).json({ message: "Not authorized or comment missing" });
    }

    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(500).json(err);
  }
};