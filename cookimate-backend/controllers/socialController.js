import Post from "../models/Post.js";
import User from "../models/User.js";

//Create Post + Award Points
export const createPost = async (req, res) => {
    try {
        const newPost = new Post(req.body);
        const savedPost = await newPost.save();

        await User.findByIdAndUpdate(req.body.user, { $inc: { points: 10 } });

        res.status(201).json(savedPost);
    } catch (err) {
        res.status(500).json({ message: "Error creating post", error: err });
    }
};

//Get Feed with Pagination (Incremental Loading)
export const getFeed = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10; // Only 10 posts at a time
    const skip = (page - 1) * limit;

    try {
        const posts = await Post.find()
            .sort({ createdAt: -1 }) // Show newest posts first
            .skip(skip)
            .limit(limit)
            .populate("user", "username profilePic"); // Show author info

        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json(err);
    }
};