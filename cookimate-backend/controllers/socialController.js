import Post from "../models/Post.js";
import User from "../models/user.js";

//create a new post to reward the user
export const createPost = async (req, res) => {
    try {
        //create post
        const newPost = new Post(req.body);
        const savedPost = await newPost.save();
        // reward user with 10 points for sharing a post
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
    const skip = (page - 1) * limit;// posts to skip based on current page

    try {
        const posts = await Post.find()
            .sort({ createdAt: -1 }) // Show newest posts first
            .skip(skip)              // Skip previous pages' posts
            .limit(limit)            // Limit results to 10 posts
            .populate("user", "username profilePic"); // This shows the user's name/pic

        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json(err);
    }
};

export const likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        const { userId } = req.body;

        //to check is user already liked
        if (!post.likes.includes(userId)) {
            // if not, add the like
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

export const addComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId, text } = req.body;

        const updatedPost = await Post.findByIdAndUpdate(
            postId,
            { $push: { comments: { user: userId, text } } },
            { new: true } //return updated document
        ).populate("comments.user", "username");

        // Reward the user for engaging
        await User.findByIdAndUpdate(userId, { $inc: { points: 2 } });

        res.status(200).json(updatedPost);
    } catch (err) {
        res.status(500).json(err);
    }
};