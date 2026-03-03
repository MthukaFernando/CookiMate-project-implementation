import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    //link post to a user in the database
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    imageUrl: { type: String, required: true },
    caption: { type: String, maxLength: 500 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],//store ids of users who liked the post
    //sub-array: stores comments directly within post
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },//for 'createdAt' and 'updatedAt' fields
);

//export model to be used by socialController
export default mongoose.model("Post", postSchema);