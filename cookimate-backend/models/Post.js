import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    //link post to a user in the database
    user: { type: String, ref: "User", required: true },
    imageUrl: { type: String, required: true },
    
    //Track if the image passed the AI filter
    moderationStatus: { 
      type: String, 
      enum: ["pending", "approved", "rejected"], 
      default: "pending" 
    },
    
    caption: { type: String, maxLength: 500 },
    likes: [{ type: String, ref: "User" }],//store ids of users who liked the post
    //sub-array: stores comments directly within post
    comments: [
      {
        user: { type: String, ref: "User" },
        text: { type: String, required: true },
        // Automatically timestamps each individual comment
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },//for 'createdAt' and 'updatedAt' fields
);

//export model to be used by socialController
export default mongoose.model("Post", postSchema);