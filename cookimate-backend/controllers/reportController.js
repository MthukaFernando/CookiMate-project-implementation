import Report from "../models/Report.js";

export const createReport = async (req, res) => {
  try {
    const { reporter, targetId, targetType, reason } = req.body;

    const newReport = new Report({
      reporter,
      targetId,
      targetType,
      reason,
    });

    await newReport.save();
    res.status(201).json({ message: "Report submitted successfully. Thank you." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};