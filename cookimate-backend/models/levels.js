import mongoose from "mongoose";

const levelSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    level: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    pointsRequired: { type: Number, required: true },
    imageUrl: {
      type: String,
      
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const Level = mongoose.model("Level", levelSchema, "levels"); 
export default Level;
