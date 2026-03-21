import mongoose from "mongoose";

const dictionarySchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: String,
    terms: [
      {
        type: String,
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Create indexes for faster lookups
dictionarySchema.index({ category: 1 });
dictionarySchema.index({ terms: 1 });

export default mongoose.model("Dictionary", dictionarySchema);
