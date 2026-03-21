import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  reporter: { type: String, required: true }, // Firebase UID of the person reporting
  targetId: { type: String, required: true }, // ID of the Post or User being reported
  targetType: { type: String, enum: ['post', 'user'], required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['pending', 'resolved'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Report", reportSchema);