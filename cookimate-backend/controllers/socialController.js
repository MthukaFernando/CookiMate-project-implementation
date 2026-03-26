import Post from "../models/Post.js";
import User from "../models/user.js";
import { cloudinary } from "../config/cloudinary.js";
import dotenv from "dotenv";
import axios from "axios";
import { updateUserStats } from "../utils/gamificationHelpers.js";

dotenv.config();

// 1. Create Post: Author gets 10 points + AI Vision Moderation
export const createPost = async (req, res) => {
  try {
    const { user: firebaseUid, caption } = req.body;
    
    // Check if Multer actually caught the file
    if (!req.file) {
      console.error("❌ Multer Error: No file found in request.");
      return res.status(400).json({ message: "No image file provided" });
    }

    // 1. EXTRACT CLOUDINARY DATA (Handling different library versions)
    // We check .path, then .secure_url, then .url to ensure we don't get 'undefined'
    const imageUrl = req.file.path || req.file.secure_url || req.file.url;
    const publicId = req.file.filename || req.file.public_id;

    console.log("📸 Attempting to save post. Image URL:", imageUrl);

    if (!imageUrl) {
      return res.status(500).json({ message: "Cloudinary upload succeeded but returned no URL." });
    }

    // 2. FIND THE MONGODB USER
    const userDoc = await User.findOne({ firebaseUid: firebaseUid });
    if (!userDoc) {
      console.error("❌ User Lookup Error: Firebase UID not found in MongoDB.");
      return res.status(404).json({ message: "User not found in database." });
    }

    // 3. SAVE THE POST TO MONGODB
    const newPost = new Post({
      user: firebaseUid, // Using the string UID as per your Post schema
      caption: caption,
      imageUrl: imageUrl,
      moderationStatus: "pending", 
    });

    const savedPost = await newPost.save();
    console.log("✅ Post saved to DB successfully:", savedPost._id);

    // 4. UPDATE USER PROGRESS (Gamification)
    await updateUserStats(userDoc._id, 'SHARE_POST', 1);
    console.log(`🏆 Gamification: Progress added for ${userDoc.username}`);

    // 5. RESPOND TO MOBILE APP IMMEDIATELY (So the user doesn't wait for AI)
    res.status(201).json(savedPost);

    // 6. ASYNCHRONOUS AI VISION CHECK
    try {
      console.log("🛡️ AI Vision: Starting analysis for post:", savedPost._id);

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
            "Is this image completely unrelated to food or cooking?",
            "Does the food in the image look rotten, moldy, or infested with insects?",
            "Does the image contain unhygienic items mixed with food, like hair, trash, or pests?",
            "Is the food presented in a way that is intentionally gross, slimy, or visually repulsive?"
          ]
        },
        {
          headers: { Authorization: `Basic ${auth}` }
        }
      );

      const aiResponses = response.data.data.analysis.responses;
      const failedChecks = aiResponses.filter(r => r.value.toLowerCase() === "yes");

      if (failedChecks.length > 0) {
        console.log(`❌ AI REJECTED: ${failedChecks[0].prompt}`);
        
        // Cleanup: Remove from DB and Cloudinary
        await Post.findByIdAndDelete(savedPost._id);
        await cloudinary.uploader.destroy(publicId);
        
        // Revoke progress
        await updateUserStats(userDoc._id, 'SHARE_POST', -1);
        
        await User.findByIdAndUpdate(userDoc._id, { 
          $set: { lastMessage: "Your post violated safety guidelines. Progress has been revoked." }
        });
      } else {
        console.log("✅ AI Vision: Approved.");
        await Post.findByIdAndUpdate(savedPost._id, { moderationStatus: "approved" });
      }

    } catch (aiError) {
      console.error("⚠️ AI Vision API Error (Non-Fatal):", aiError.response?.data || aiError.message);
      // We don't delete the post here; it stays 'pending' for safety
    }

  } catch (err) {
    console.error("🔥 Final Catch Error:", err);
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
  const { uid } = req.query; // ✅ current logged-in user's firebaseUid
 
  try {
    let blockedUids = [];
 
    if (uid) {
      const currentUser = await User.findOne({ firebaseUid: uid });
      if (currentUser && Array.isArray(currentUser.blockedUsers)) {
        // ✅ blockedUsers is now a flat [String] array of firebaseUids
        blockedUids = currentUser.blockedUsers;
      }
    }
 
    
 
    const posts = await Post.find({
      moderationStatus: { $ne: "rejected" },
      // ✅ post.user is a firebaseUid string — $nin correctly excludes blocked ones
      user: { $nin: blockedUids },
    })
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
    console.error("DETAILED GET FEED ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};
// 3. Like Post
export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const { userId } = req.body; // The person clicking the button

    if (!post) return res.status(404).json("Post not found");

    // 1. Find the AUTHOR of the post (the person who gets the progress)
    const authorDoc = await User.findOne({ firebaseUid: post.user });

    if (!post.likes.includes(userId)) {
      await post.updateOne({ $push: { likes: userId } });

      if (authorDoc) {
        // Increment the author's get likes progress bar
        await updateUserStats(authorDoc._id, 'RECEIVE_LIKE', 1);
        console.log(`Gamification: ${authorDoc.username} received a like.`);
      }
      res.status(200).json("Post liked!");
    } else {
      // UNLIKE ACTION
      await post.updateOne({ $pull: { likes: userId } });

      if (authorDoc) {
        // Decrement the progress
        await updateUserStats(authorDoc._id, 'RECEIVE_LIKE', -1);
      }
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