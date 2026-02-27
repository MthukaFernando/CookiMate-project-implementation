import Post from "../models/Post.js";
import User from "../models/user.js";

export const createPost = async (req, res) => {
    try {
        const newPost = new Post(req.body);
        const savedPost = await newPost.save();
        // This uses the 'points' field in the existing User model
        await User.findByIdAndUpdate(req.body.user, { $inc: { points: 10 } });

        res.status(201).json(savedPost);
    } catch (err) {
        res.status(500).json({ message: "Post creation failed", error: err });
    }
};

export const getFeed = async (req, res) => {
    // Get the page number from the request
    const page = parseInt(req.query.page) || 1; 
    const limit = 10; // Only send 10 posts per "set"
    const skip = (page - 1) * limit;

    try {
        const posts = await Post.find()
            .sort({ createdAt: -1 }) // Show newest posts first
            .skip(skip)
            .limit(limit)
            .populate("user", "username profilePic"); // This shows the author's name/pic

        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json(err);
    }
};

export const likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        const { userId } = req.body;

        if (!post.likes.includes(userId)) {
            // Add the like
            await post.updateOne({ $push: { likes: userId } });
            
            await User.findByIdAndUpdate(post.user, { $inc: { points: 5 } });

            res.status(200).json("Post liked! +5 points to the chef.");
        } else {
            // Unlike logic
            await post.updateOne({ $pull: { likes: userId } });
            res.status(200).json("Post unliked.");
        }
    } catch (err) {
        res.status(500).json(err);
    }
};